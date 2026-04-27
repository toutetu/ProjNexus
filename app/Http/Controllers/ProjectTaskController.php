<?php

namespace App\Http\Controllers;

use App\Enums\TaskPriority;
use App\Enums\TaskStatus;
use App\Enums\TaskType;
use App\Models\Project;
use App\Models\ProjectWorkItem;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ProjectTaskController extends Controller
{
    public function store(Request $request, Project $project): RedirectResponse
    {
        $this->authorize('create', [ProjectWorkItem::class, $project]);

        $validated = $this->validatedTaskData($request, $project);
        $validated['progress_rate'] = $this->normalizedProgressRate(
            $validated['status'],
            (int) ($validated['progress_rate'] ?? 0),
        );

        $project->tasks()->create([
            ...$validated,
            'created_by' => $request->user()->id,
        ]);

        return redirect()
            ->route('projects.show', $project)
            ->with('success', 'タスクを追加しました。');
    }

    public function update(Request $request, Project $project, ProjectWorkItem $task): RedirectResponse
    {
        abort_unless($task->project_id === $project->id, 404);
        $this->authorize('update', $task);

        $validated = $this->validatedTaskData($request, $project);
        $validated['progress_rate'] = $this->normalizedProgressRate(
            $validated['status'],
            (int) ($validated['progress_rate'] ?? 0),
        );

        $task->update($validated);

        return redirect()
            ->route('projects.show', $project)
            ->with('success', 'タスクを更新しました。');
    }

    public function destroy(Project $project, ProjectWorkItem $task): RedirectResponse
    {
        abort_unless($task->project_id === $project->id, 404);
        $this->authorize('delete', $task);

        $task->delete();

        return redirect()
            ->route('projects.show', $project)
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
            ->route('projects.show', $project)
            ->with('success', 'コメントを投稿しました。');
    }

    /**
     * @return array<string, mixed>
     */
    private function validatedTaskData(Request $request, Project $project): array
    {
        $validated = $request->validate(
            [
                'title' => ['required', 'string', 'max:120'],
                'task_type' => ['required', Rule::in(TaskType::values())],
                'priority' => ['required', Rule::in(TaskPriority::values())],
                'status' => ['required', Rule::in(TaskStatus::phase3Values())],
                'progress_rate' => ['nullable', 'integer', 'min:0', 'max:100'],
                'assignee_id' => [
                    'nullable',
                    'integer',
                    Rule::exists('users', 'id')->where('department_id', $project->department_id),
                ],
                'due_date' => ['nullable', 'date'],
                'description' => ['nullable', 'string', 'max:5000'],
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
                'due_date' => '期日',
                'description' => '説明',
            ],
        );

        if (($validated['assignee_id'] ?? null) === '') {
            $validated['assignee_id'] = null;
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
}
