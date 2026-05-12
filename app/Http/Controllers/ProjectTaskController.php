<?php

namespace App\Http\Controllers;

use App\Enums\Role;
use App\Enums\TaskPriority;
use App\Enums\TaskStatus;
use App\Enums\TaskType;
use App\Models\Project;
use App\Models\ProjectWorkItem;
use App\Models\User;
use App\Services\NotificationService;
use App\Services\TaskHistoryService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class ProjectTaskController extends Controller
{
    public function __construct(
        private readonly NotificationService $notificationService,
        private readonly TaskHistoryService $taskHistoryService,
    ) {}

    public function store(Request $request, Project $project): RedirectResponse
    {
        $this->authorize('create', [ProjectWorkItem::class, $project]);

        $validated = $this->validatedTaskData($request, $project, null);
        $validated['progress_rate'] = $this->normalizedProgressRate(
            $validated['status'],
            (int) ($validated['progress_rate'] ?? 0),
        );
        $validated['estimated_days'] = $this->normalizedNullableDecimal($validated['estimated_days'] ?? null);
        $validated['actual_days'] = $this->normalizedDecimal($validated['actual_days'] ?? 0);

        $task = $project->tasks()->create([
            ...$validated,
            'created_by' => $request->user()->id,
        ]);

        $task->refresh();
        $task->loadMissing('assignee', 'reviewer');
        $this->taskHistoryService->recordCreation($task, $request->user());

        if ($task->assignee_id !== null && $task->assignee !== null && $task->assignee_id !== $request->user()->id) {
            $this->notificationService->notifyTaskAssigned(
                $project,
                $task,
                $task->assignee,
                '作成時に担当へ設定されました',
            );
        }

        $this->dispatchResolvedNotifications($project, $task, null, $task->status, $request->user());

        return redirect()
            ->to($this->resolveTaskRedirectUrl($request, $project))
            ->with('success', 'タスクを追加しました。');
    }

    public function update(Request $request, Project $project, ProjectWorkItem $task): RedirectResponse
    {
        abort_unless($task->project_id === $project->id, 404);
        $this->authorize('update', $task);

        $validated = $this->validatedTaskData($request, $project, $task);

        $newStatus = TaskStatus::from($validated['status']);
        $this->assertStatusTransition($request->user(), $task, $newStatus);

        $validated['progress_rate'] = $this->normalizedProgressRate(
            $validated['status'],
            (int) ($validated['progress_rate'] ?? 0),
        );
        $validated['estimated_days'] = $this->normalizedNullableDecimal($validated['estimated_days'] ?? null);
        $validated['actual_days'] = $this->normalizedDecimal($validated['actual_days'] ?? 0);
        $oldAssigneeId = $task->assignee_id;
        $oldStatus = $task->status;

        $task->refresh();
        $task->loadMissing('assignee', 'reviewer');
        $beforeDisplay = $this->taskHistoryService->displaySnapshot($task);

        $task->update($validated);
        $task->loadMissing('assignee', 'reviewer', 'project.applicant');

        $this->taskHistoryService->recordChanges($task, $beforeDisplay, $request->user());

        if (
            $task->assignee_id !== null
            && $task->assignee !== null
            && $task->assignee_id !== $oldAssigneeId
            && $task->assignee_id !== $request->user()->id
        ) {
            $this->notificationService->notifyTaskAssigned(
                $project,
                $task,
                $task->assignee,
                '担当者が変更されました',
            );
        }

        if (
            $oldStatus !== TaskStatus::Closed
            && $task->status === TaskStatus::Closed
            && $project->applicant !== null
            && $project->applicant->id !== $request->user()->id
        ) {
            $this->notificationService->notifyTaskCompleted(
                $project,
                $task,
                $request->user(),
                $project->applicant,
            );
        }

        $this->dispatchResolvedNotifications($project, $task, $oldStatus, $task->status, $request->user());

        return redirect()
            ->to($this->resolveTaskRedirectUrl($request, $project))
            ->with('success', 'タスクを更新しました。');
    }

    public function updateStatus(Request $request, Project $project, ProjectWorkItem $task): RedirectResponse
    {
        abort_unless($task->project_id === $project->id, 404);
        $this->authorize('update', $task);

        $validated = $request->validate(
            [
                'status' => ['required', 'in:'.implode(',', TaskStatus::phase4Values())],
                'tasks_view' => ['nullable', 'in:list,board'],
            ],
            [
                'required' => ':attribute は必須です。',
                'in' => ':attribute の値が不正です。',
            ],
            [
                'status' => 'ステータス',
                'tasks_view' => 'タスク表示',
            ],
        );

        $newStatus = TaskStatus::from($validated['status']);
        $this->assertStatusTransition($request->user(), $task, $newStatus);

        $task->refresh();
        $task->loadMissing('assignee', 'reviewer');
        $beforeDisplay = $this->taskHistoryService->displaySnapshot($task);
        $oldStatus = $task->status;

        $task->update([
            'status' => $newStatus,
            'progress_rate' => $this->normalizedProgressRate($newStatus->value, (int) $task->progress_rate),
        ]);
        $task->loadMissing('assignee', 'reviewer', 'project.applicant');

        $this->taskHistoryService->recordChanges($task, $beforeDisplay, $request->user());

        if (
            $oldStatus !== TaskStatus::Closed
            && $task->status === TaskStatus::Closed
            && $project->applicant !== null
            && $project->applicant->id !== $request->user()->id
        ) {
            $this->notificationService->notifyTaskCompleted(
                $project,
                $task,
                $request->user(),
                $project->applicant,
            );
        }

        $this->dispatchResolvedNotifications($project, $task, $oldStatus, $task->status, $request->user());

        $tasksView = $validated['tasks_view'] ?? 'board';
        if (! in_array($tasksView, ['list', 'board'], true)) {
            $tasksView = 'board';
        }

        return redirect()
            ->route('projects.show', [
                'project' => $project,
                'detailTab' => 'tasks',
                'tasksView' => $tasksView,
            ])
            ->with('success', 'タスクのステータスを更新しました。');
    }

    public function destroy(Request $request, Project $project, ProjectWorkItem $task): RedirectResponse
    {
        abort_unless($task->project_id === $project->id, 404);
        $this->authorize('delete', $task);

        $task->delete();

        return redirect()
            ->to($this->resolveTaskRedirectUrl($request, $project))
            ->with('success', 'タスクを削除しました。');
    }

    public function storeComment(
        Request $request,
        Project $project,
        ProjectWorkItem $task,
    ): RedirectResponse {
        abort_unless($task->project_id === $project->id, 404);
        $this->authorize('update', $task);

        $validated = $request->validate(
            [
                'body' => ['required', 'string', 'max:2000'],
            ],
            [
                'required' => ':attribute は必須です。',
                'max' => ':attribute は :max 文字以内で入力してください。',
            ],
            [
                'body' => 'コメント',
            ],
        );

        $task->comments()->create([
            'user_id' => $request->user()->id,
            'body' => trim($validated['body']),
        ]);

        return redirect()
            ->to($this->resolveTaskRedirectUrl($request, $project))
            ->with('success', 'コメントを投稿しました。');
    }

    private function resolveTaskRedirectUrl(Request $request, Project $project): string
    {
        $returnTo = $request->input('return_to');

        if (is_string($returnTo) && $returnTo !== '') {
            $path = parse_url($returnTo, PHP_URL_PATH);
            if (is_string($path) && str_starts_with($path, '/member-tasks')) {
                return $returnTo;
            }
        }

        return route('projects.show', $project);
    }

    private function assertStatusTransition(User $user, ProjectWorkItem $task, TaskStatus $newStatus): void
    {
        $oldStatus = $task->status;
        if ($oldStatus === $newStatus) {
            return;
        }

        if ($user->hasRole(Role::DeptManager->value)) {
            return;
        }

        if ($oldStatus === TaskStatus::Closed && $newStatus !== TaskStatus::Closed) {
            abort(403, '完了タスクの再開は管理者のみです。');
        }

        if ($newStatus === TaskStatus::Closed && $oldStatus !== TaskStatus::Resolved) {
            abort(403, '確認OKへは確認待ちからのみ遷移できます。');
        }

        if ($oldStatus === TaskStatus::InProgress && $newStatus === TaskStatus::Resolved) {
            abort_unless($task->assignee_id === $user->id, 403, '完了報告は担当者のみが実行できます。');

            return;
        }

        if ($oldStatus === TaskStatus::Resolved && $newStatus === TaskStatus::Closed) {
            abort_unless($task->reviewer_id === $user->id, 403, '確認OKは確認者のみが実行できます。');

            return;
        }

        if ($oldStatus === TaskStatus::Resolved) {
            abort(403, '確認待ちからの変更は許可されていません。');
        }

        $project = $task->project;
        $participant = $task->assignee_id === $user->id
            || $task->reviewer_id === $user->id
            || ($project !== null && $project->primary_assignee_id === $user->id);

        abort_unless($participant, 403);
    }

    private function dispatchResolvedNotifications(
        Project $project,
        ProjectWorkItem $task,
        ?TaskStatus $oldStatus,
        TaskStatus $newStatus,
        User $actor,
    ): void {
        if (
            $oldStatus !== TaskStatus::Resolved
            && $newStatus === TaskStatus::Resolved
            && $task->reviewer_id !== null
            && $task->reviewer !== null
            && $task->reviewer->id !== $actor->id
        ) {
            $this->notificationService->notifyTaskResolved($project, $task, $task->reviewer, $actor);
        }

        if ($oldStatus === TaskStatus::Resolved && $newStatus === TaskStatus::Closed) {
            $recipients = [];
            if ($task->assignee !== null && $task->assignee->id !== $actor->id) {
                $recipients[] = $task->assignee;
            }
            $task->loadMissing('project.applicant');
            $applicant = $task->project?->applicant;
            if ($applicant !== null && $applicant->id !== $actor->id) {
                $recipients[] = $applicant;
            }

            $this->notificationService->notifyTaskReviewed($project, $task, $actor, $recipients);
        }
    }

    /**
     * @return array<string, mixed>
     */
    private function validatedTaskData(Request $request, Project $project, ?ProjectWorkItem $existing): array
    {
        $reviewerRule = [
            'nullable',
            'integer',
            Rule::exists('users', 'id')->where('department_id', $project->department_id),
        ];

        if ($existing === null) {
            $reviewerRule = [
                'required',
                'integer',
                Rule::exists('users', 'id')->where('department_id', $project->department_id),
            ];
        }

        $validated = $request->validate(
            [
                'title' => ['required', 'string', 'max:120'],
                'task_type' => ['required', Rule::in(TaskType::values())],
                'priority' => ['required', Rule::in(TaskPriority::values())],
                'status' => ['required', Rule::in(TaskStatus::phase4Values())],
                'progress_rate' => ['nullable', 'integer', 'min:0', 'max:100'],
                'assignee_id' => [
                    'nullable',
                    'integer',
                    Rule::exists('users', 'id')->where('department_id', $project->department_id),
                ],
                'reviewer_id' => $reviewerRule,
                'due_date' => ['nullable', 'date'],
                'description' => ['nullable', 'string', 'max:5000'],
                'estimated_days' => ['nullable', 'numeric', 'min:0', 'max:99999'],
                'actual_days' => ['nullable', 'numeric', 'min:0', 'max:99999'],
            ],
            [
                'required' => ':attribute は必須です。',
                'max' => ':attribute は :max 文字以内で入力してください。',
                'integer' => ':attribute は整数で入力してください。',
                'min' => ':attribute は :min 以上で入力してください。',
                'exists' => '選択した :attribute は無効です。',
                'in' => ':attribute の値が不正です。',
            ],
            [
                'title' => 'タイトル',
                'task_type' => '種類',
                'priority' => '優先度',
                'status' => 'ステータス',
                'progress_rate' => '進捗率',
                'assignee_id' => '担当者',
                'reviewer_id' => '確認者',
                'due_date' => '期日',
                'description' => '説明',
                'estimated_days' => '計画工数',
                'actual_days' => '実績工数',
            ],
        );

        if (($validated['assignee_id'] ?? null) === '') {
            $validated['assignee_id'] = null;
        }

        if (($validated['reviewer_id'] ?? null) === '') {
            $validated['reviewer_id'] = null;
        }

        if (
            $existing !== null
            && ($validated['reviewer_id'] ?? null) === null
            && $existing->reviewer_id !== null
        ) {
            $validated['reviewer_id'] = $existing->reviewer_id;
        }

        if ($validated['status'] === TaskStatus::Resolved->value && ($validated['reviewer_id'] ?? null) === null) {
            throw ValidationException::withMessages([
                'reviewer_id' => '確認待ちにするには確認者を指定してください。',
            ]);
        }

        return $validated;
    }

    private function normalizedProgressRate(string $status, int $progressRate): int
    {
        return match ($status) {
            TaskStatus::Open->value => 0,
            TaskStatus::Closed->value => 100,
            default => $progressRate,
        };
    }

    private function normalizedNullableDecimal(mixed $value): ?float
    {
        if ($value === null || $value === '') {
            return null;
        }

        return round((float) $value, 2);
    }

    private function normalizedDecimal(mixed $value): float
    {
        if ($value === null || $value === '') {
            return 0.0;
        }

        return round((float) $value, 2);
    }
}
