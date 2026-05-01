<?php

namespace App\Http\Controllers;

use App\Enums\ApprovalAction;
use App\Enums\ProjectStatus;
use App\Enums\Role;
use App\Enums\TaskStatus;
use App\Models\Approval;
use App\Models\Department;
use App\Models\Project;
use App\Models\ProjectWorkItem;
use App\Models\User;
use App\Services\ApprovalService;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProjectController extends Controller
{
    /**
     * @return array<string, string>
     */
    private function validationMessages(): array
    {
        return [
            'required' => ':attribute は必須です。',
            'max' => ':attribute は :max 文字以内で入力してください。',
            'numeric' => ':attribute は数値で入力してください。',
            'integer' => ':attribute は整数で入力してください。',
            'min' => ':attribute は :min 以上で入力してください。',
            'exists' => '選択した :attribute は無効です。',
            'in' => ':attribute の値が不正です。',
        ];
    }

    /**
     * @return array<string, string>
     */
    private function validationAttributes(): array
    {
        return [
            'title' => '案件名',
            'department_id' => '担当部門',
            'purpose' => '目的',
            'description' => '概要・説明',
            'estimated_amount' => '概算予算',
            'estimated_days' => '概算工数',
            'primary_assignee_id' => '主担当',
            'submit_action' => '保存方法',
        ];
    }

    public function create(): Response
    {
        $this->authorize('create', Project::class);

        return Inertia::render('Projects/Create', [
            'departments' => Department::query()
                ->where('type', '!=', Department::TYPE_HEADQUARTERS)
                ->select(['id', 'name'])
                ->orderBy('id')
                ->get(),
            'defaultDepartmentId' => auth()->user()?->department?->isHeadquarters() === false
                ? auth()->user()?->department_id
                : null,
            'draftCount' => Project::query()
                ->where('applicant_id', auth()->id())
                ->where('status', ProjectStatus::Draft->value)
                ->count(),
        ]);
    }

    public function index(Request $request): Response
    {
        $validated = $request->validate([
            'tab' => ['nullable', 'in:approval,dev,budget'],
            'filter' => ['nullable', 'string', 'max:40'],
            'status' => ['nullable', 'in:draft,pending_dept,pending_hq,approved,rejected'],
            'q' => ['nullable', 'string', 'max:100'],
            'department' => ['nullable', 'integer', 'exists:departments,id'],
            'assignee' => ['nullable', 'integer', 'exists:users,id'],
            'progress' => ['nullable', 'in:not_started,in_progress,completing,completed'],
            'consumption' => ['nullable', 'in:safe,normal,warn,over'],
        ]);

        $tab = $validated['tab'] ?? 'approval';
        $filter = $validated['filter'] ?? null;
        $status = $validated['status'] ?? null;
        $departmentId = $validated['department'] ?? null;
        $assigneeId = $validated['assignee'] ?? null;
        $progress = $validated['progress'] ?? null;
        $consumption = $validated['consumption'] ?? null;
        $q = isset($validated['q']) ? trim((string) $validated['q']) : null;
        if ($q === '') {
            $q = null;
        }
        $user = $request->user();

        $this->authorize('viewAny', Project::class);

        $baseTabCountQuery = static function () use ($user) {
            return Project::query()
                ->visibleTo($user)
                ->where(function ($q) {
                    $q->where('status', '!=', ProjectStatus::Rejected->value)
                        ->orWhereDoesntHave('childProjects');
                });
        };

        $tabCounts = [
            'approval' => $baseTabCountQuery()->forTab('approval')->count(),
            'dev' => $baseTabCountQuery()->forTab('dev')->count(),
            'budget' => $baseTabCountQuery()->forTab('budget')->count(),
        ];

        $query = Project::query()
            ->with([
                'department:id,name',
                'applicant' => static function ($q): void {
                    $q->select('users.id', 'users.name');
                },
                'applicant.roles',
                'primaryAssignee:id,name',
            ])
            ->visibleTo($user)
            ->forTab($tab)
            ->where(function ($q) {
                $q->where('status', '!=', ProjectStatus::Rejected->value)
                    ->orWhereDoesntHave('childProjects');
            });

        if ($tab === 'dev') {
            $query
                ->withCount([
                    'tasks',
                    'tasks as closed_tasks_count' => static function ($taskQuery): void {
                        $taskQuery->where('status', TaskStatus::Closed->value);
                    },
                    'tasks as in_progress_tasks_count' => static function ($taskQuery): void {
                        $taskQuery->where('status', TaskStatus::InProgress->value);
                    },
                    'tasks as open_tasks_count' => static function ($taskQuery): void {
                        $taskQuery->where('status', TaskStatus::Open->value);
                    },
                ])
                ->withMin('tasks', 'due_date');
        }

        if ($tab === 'approval' && $filter === 'pending') {
            $query->pendingFor($user);
        }

        if ($tab === 'approval' && $status !== null) {
            $query->where('status', $status);
        }

        if ($departmentId !== null) {
            $query->where('department_id', $departmentId);
        }

        if ($q !== null) {
            $query->where(function ($inner) use ($q): void {
                $inner
                    ->where('title', 'like', "%{$q}%")
                    ->orWhereHas('primaryAssignee', function ($assigneeQuery) use ($q): void {
                        $assigneeQuery->where('name', 'like', "%{$q}%");
                    })
                    ->orWhereHas('applicant', function ($applicantQuery) use ($q): void {
                        $applicantQuery->where('name', 'like', "%{$q}%");
                    })
                    ->orWhereHas('department', function ($departmentQuery) use ($q): void {
                        $departmentQuery->where('name', 'like', "%{$q}%");
                    });
            });
        }

        if ($tab === 'dev' && $assigneeId !== null) {
            $query->where('primary_assignee_id', $assigneeId);
        }

        if ($tab === 'dev' && $progress !== null) {
            match ($progress) {
                'not_started' => $query->havingRaw('tasks_count = 0 OR closed_tasks_count = 0 AND in_progress_tasks_count = 0'),
                'in_progress' => $query->havingRaw('tasks_count > 0 AND closed_tasks_count < tasks_count AND (closed_tasks_count > 0 OR in_progress_tasks_count > 0)'),
                'completing' => $query->havingRaw('tasks_count > 0 AND (closed_tasks_count / tasks_count) >= 0.9 AND closed_tasks_count < tasks_count'),
                'completed' => $query->havingRaw('tasks_count > 0 AND closed_tasks_count = tasks_count'),
                default => null,
            };
        }

        if ($tab === 'budget' && $consumption !== null) {
            match ($consumption) {
                'safe' => $query->whereRaw('COALESCE(actual_amount, 0) / NULLIF(budget_amount, 0) < 0.6'),
                'normal' => $query->whereRaw('COALESCE(actual_amount, 0) / NULLIF(budget_amount, 0) >= 0.6 AND COALESCE(actual_amount, 0) / NULLIF(budget_amount, 0) < 0.86'),
                'warn' => $query->whereRaw('COALESCE(actual_amount, 0) / NULLIF(budget_amount, 0) >= 0.86 AND COALESCE(actual_amount, 0) / NULLIF(budget_amount, 0) <= 1'),
                'over' => $query->whereRaw('COALESCE(actual_amount, 0) / NULLIF(budget_amount, 0) > 1'),
                default => null,
            };
        }

        $budgetSummary = null;
        if ($tab === 'budget') {
            $budgetQuery = clone $query;
            $budgetTotal = (float) $budgetQuery->sum('budget_amount');
            $actualTotal = (float) (clone $query)->sum('actual_amount');
            $budgetSummary = [
                'budgetTotal' => $budgetTotal,
                'actualTotal' => $actualTotal,
                'averageConsumptionRate' => $budgetTotal > 0 ? round($actualTotal / $budgetTotal * 100, 1) : 0,
                'warningCount' => (clone $query)
                    ->whereRaw('budget_amount > 0 AND COALESCE(actual_amount, 0) / budget_amount >= 0.86')
                    ->count(),
            ];
        }

        $paginator = $query->latest('updated_at')->paginate(15);

        $rejectedIds = $paginator
            ->getCollection()
            ->filter(fn (Project $project) => $project->status === ProjectStatus::Rejected)
            ->pluck('id')
            ->values();

        $rejectionLevelByProjectId = [];
        if ($rejectedIds->isNotEmpty()) {
            $rejectionLevelByProjectId = Approval::query()
                ->whereIn('project_id', $rejectedIds)
                ->where('action', ApprovalAction::Rejected)
                ->orderByDesc('acted_at')
                ->get()
                ->unique('project_id')
                ->mapWithKeys(fn (Approval $approval) => [
                    $approval->project_id => $approval->level->value,
                ])
                ->all();
        }

        return Inertia::render('Projects/Index', [
            'tab' => $tab,
            'filter' => $filter,
            'status' => $status,
            'department' => $departmentId,
            'assignee' => $assigneeId,
            'progress' => $progress,
            'consumption' => $consumption,
            'q' => $q,
            'departments' => Department::query()
                ->where('type', '!=', Department::TYPE_HEADQUARTERS)
                ->select(['id', 'name'])
                ->orderBy('id')
                ->get(),
            'assignees' => User::query()
                ->select(['id', 'name'])
                ->whereNotNull('department_id')
                ->orderBy('name')
                ->get(),
            'budgetSummary' => $budgetSummary,
            'tabCounts' => $tabCounts,
            'projects' => $paginator->through(function (Project $project) use ($user, $rejectionLevelByProjectId) {
                $rejectedAt = null;
                if ($project->status === ProjectStatus::Rejected) {
                    $level = $rejectionLevelByProjectId[$project->id] ?? null;
                    $rejectedAt = $level === 'dept' || $level === 'hq' ? $level : null;
                }

                return [
                    'id' => $project->id,
                    'title' => $project->title,
                    'department' => $project->department?->name,
                    'status' => $project->status->value,
                    'applicant' => $project->applicant?->name,
                    'primaryAssignee' => $project->primaryAssignee?->name,
                    'submittedAt' => $project->submitted_at?->toDateString(),
                    'approvedAt' => $project->approved_at?->toDateString(),
                    'updatedAt' => $project->updated_at?->toDateTimeString(),
                    'estimatedAmount' => $project->estimated_amount,
                    'budgetAmount' => $project->budget_amount,
                    'actualAmount' => $project->actual_amount,
                    'taskCount' => (int) ($project->tasks_count ?? 0),
                    'closedTaskCount' => (int) ($project->closed_tasks_count ?? 0),
                    'inProgressTaskCount' => (int) ($project->in_progress_tasks_count ?? 0),
                    'openTaskCount' => (int) ($project->open_tasks_count ?? 0),
                    'nearestTaskDueDate' => $project->tasks_min_due_date,
                    'canEdit' => $user->can('update', $project),
                    'rejectedAt' => $rejectedAt,
                    'applicantSubmitsToHqDirect' => $project->applicant?->hasRole(Role::DeptManager->value) ?? false,
                ];
            }),
        ]);
    }

    public function show(Project $project): Response
    {
        $this->authorize('view', $project);
        $user = auth()->user();
        $canEdit = $user?->can('update', $project) ?? false;

        $project->load([
            'department:id,name',
            'applicant' => static function ($q): void {
                $q->select('users.id', 'users.name')->with('roles');
            },
            'primaryAssignee:id,name',
            'tasks' => static function ($q): void {
                $q->with([
                    'assignee:id,name',
                    'reviewer:id,name',
                    'creator:id,name',
                    'comments' => static function ($commentQuery): void {
                        $commentQuery->with('user:id,name')->orderBy('created_at');
                    },
                    'histories' => static function ($historyQuery): void {
                        $historyQuery->with('user:id,name')->latest('created_at');
                    },
                ])
                    ->latest('updated_at');
            },
            'approvals' => static function ($q): void {
                $q->with('approver:id,name')->orderByDesc('acted_at');
            },
        ]);

        $rejectedAt = null;
        $rejectedComment = null;
        if ($project->status === ProjectStatus::Rejected) {
            $lastReject = Approval::query()
                ->where('project_id', $project->id)
                ->where('action', ApprovalAction::Rejected)
                ->orderByDesc('acted_at')
                ->first();
            $level = $lastReject?->level->value;
            $rejectedAt = $level === 'dept' || $level === 'hq' ? $level : null;
            $rejectedComment = $lastReject?->comment;
        }

        $applicantIsDeptManager = $project->applicant?->hasRole(Role::DeptManager->value) ?? false;
        $canApproveDept = $user?->hasRole(Role::DeptManager->value)
            && $project->status === ProjectStatus::PendingDept
            && $project->department_id === $user->department_id;
        $canApproveHq = $user?->hasRole(Role::HqManager->value)
            && $project->status === ProjectStatus::PendingHq;
        $canTakeBack = $project->applicant_id === $user?->id
            && (
                $project->status === ProjectStatus::PendingDept
                || (
                    $project->status === ProjectStatus::PendingHq
                    && $user?->hasRole(Role::DeptManager->value)
                )
            );

        return Inertia::render('Projects/Show', [
            'projectId' => $project->id,
            'canEdit' => $canEdit,
            'canApproveDept' => $canApproveDept,
            'canApproveHq' => $canApproveHq,
            'canTakeBack' => $canTakeBack,
            'canManageTasks' => $user?->can('create', [ProjectWorkItem::class, $project]) ?? false,
            'canUpdateBudget' => $project->status === ProjectStatus::Approved
                && (
                    $project->primary_assignee_id === $user?->id
                    || (
                        $user?->hasRole(Role::DeptManager->value)
                        && $user?->department_id === $project->department_id
                    )
                )
                && $project->budget_amount !== null,
            'taskAssignees' => User::query()
                ->where('department_id', $project->department_id)
                ->select(['id', 'name'])
                ->orderBy('name')
                ->get(),
            'project' => [
                'id' => $project->id,
                'title' => $project->title,
                'projectCode' => $project->project_code,
                'status' => $project->status->value,
                'department' => $project->department?->name,
                'applicant' => $project->applicant?->name,
                'primaryAssignee' => $project->primaryAssignee?->name,
                'purpose' => $project->purpose,
                'description' => $project->description,
                'estimatedAmount' => $project->estimated_amount,
                'estimatedDays' => $project->estimated_days,
                'budgetAmount' => $project->budget_amount,
                'actualAmount' => $project->actual_amount,
                'submittedAt' => $project->submitted_at?->toDateString(),
                'revision' => $project->revision,
                'parentProjectId' => $project->parent_project_id,
                'rejectedAt' => $rejectedAt,
                'rejectedComment' => $rejectedComment,
                'applicantSubmitsToHqDirect' => $applicantIsDeptManager,
                'approvals' => $project->approvals->map(fn (Approval $approval) => [
                    'level' => $approval->level->value,
                    'action' => $approval->action->value,
                    'approver' => $approval->approver?->name,
                    'actedAt' => $approval->acted_at?->toIso8601String(),
                    'comment' => $approval->comment,
                ])->values(),
                'tasks' => $project->tasks->map(fn (ProjectWorkItem $task) => [
                    'id' => $task->id,
                    'title' => $task->title,
                    'description' => $task->description,
                    'taskType' => $task->task_type->value,
                    'priority' => $task->priority->value,
                    'status' => $task->status->value,
                    'progressRate' => $task->progress_rate,
                    'assigneeId' => $task->assignee_id,
                    'assignee' => $task->assignee?->name,
                    'reviewerId' => $task->reviewer_id,
                    'reviewer' => $task->reviewer?->name,
                    'dueDate' => $task->due_date?->toDateString(),
                    'estimatedDays' => $task->estimated_days !== null ? (float) $task->estimated_days : null,
                    'actualDays' => (float) $task->actual_days,
                    'updatedAt' => $task->updated_at?->toDateTimeString(),
                    'canUpdate' => $user?->can('update', $task) ?? false,
                    'comments' => $task->comments->map(fn ($comment) => [
                        'id' => $comment->id,
                        'user' => $comment->user?->name ?? '不明ユーザー',
                        'body' => $comment->body,
                        'createdAt' => $comment->created_at?->toIso8601String(),
                    ])->values(),
                    'histories' => $task->histories->map(fn ($history) => [
                        'id' => $history->id,
                        'user' => $history->user?->name ?? '不明ユーザー',
                        'fieldName' => $history->field_name,
                        'oldValue' => $history->old_value,
                        'newValue' => $history->new_value,
                        'createdAt' => $history->created_at?->toIso8601String(),
                    ])->values(),
                ])->values(),
            ],
        ]);
    }

    public function edit(Project $project): Response
    {
        $this->authorize('update', $project);

        return Inertia::render('Projects/Edit', [
            'departments' => Department::query()
                ->select(['id', 'name'])
                ->orderBy('id')
                ->get(),
            'project' => [
                'id' => $project->id,
                'title' => $project->title,
                'departmentId' => $project->department_id,
                'purpose' => $project->purpose,
                'description' => $project->description,
                'estimatedAmount' => $project->estimated_amount,
                'estimatedDays' => $project->estimated_days,
            ],
        ]);
    }

    public function store(Request $request, ApprovalService $approvalService): RedirectResponse
    {
        $this->authorize('create', Project::class);

        $submitAction = $request->input('submit_action', 'draft');
        $isSubmit = $submitAction === 'submit';
        $validated = $request->validate(
            [
                'title' => ['required', 'string', 'max:80'],
                'department_id' => [$isSubmit ? 'required' : 'nullable', 'integer', 'exists:departments,id'],
                'purpose' => [$isSubmit ? 'required' : 'nullable', 'string', 'max:2000'],
                'description' => ['nullable', 'string', 'max:5000'],
                'estimated_amount' => [$isSubmit ? 'required' : 'nullable', 'numeric', 'min:0'],
                'estimated_days' => ['nullable', 'integer', 'min:0'],
                'primary_assignee_id' => ['nullable', 'integer', 'exists:users,id'],
                'submit_action' => ['nullable', 'in:draft,submit'],
            ],
            $this->validationMessages(),
            $this->validationAttributes(),
        );
        $submitAction = $validated['submit_action'] ?? $submitAction;
        unset($validated['submit_action']);
        $validated['primary_assignee_id'] = $request->user()->id;

        $project = $request->user()->appliedProjects()->create([
            'status' => ProjectStatus::Draft,
            'revision' => 1,
            ...$validated,
        ]);

        if ($submitAction === 'submit') {
            try {
                $approvalService->submit($project, $request->user());
            } catch (AuthorizationException $e) {
                return redirect()
                    ->route('projects.index', ['tab' => 'approval'])
                    ->with('error', $e->getMessage());
            }
        }

        return redirect()->route('projects.index', ['tab' => 'approval']);
    }

    public function update(Request $request, Project $project, ApprovalService $approvalService): RedirectResponse
    {
        $this->authorize('update', $project);

        $submitAction = $request->input('submit_action', 'draft');
        $isSubmit = $submitAction === 'submit';
        $validated = $request->validate(
            [
                'title' => ['required', 'string', 'max:80'],
                'department_id' => [$isSubmit ? 'required' : 'nullable', 'integer', 'exists:departments,id'],
                'purpose' => [$isSubmit ? 'required' : 'nullable', 'string', 'max:2000'],
                'description' => ['nullable', 'string', 'max:5000'],
                'estimated_amount' => [$isSubmit ? 'required' : 'nullable', 'numeric', 'min:0'],
                'estimated_days' => ['nullable', 'integer', 'min:0'],
                'primary_assignee_id' => ['nullable', 'integer', 'exists:users,id'],
                'submit_action' => ['nullable', 'in:draft,submit'],
            ],
            $this->validationMessages(),
            $this->validationAttributes(),
        );
        $submitAction = $validated['submit_action'] ?? $submitAction;
        unset($validated['submit_action']);

        $project->update($validated);

        if ($submitAction === 'submit') {
            try {
                $approvalService->submit($project->fresh(), $request->user());
            } catch (AuthorizationException $e) {
                return redirect()
                    ->route('projects.index', ['tab' => 'approval'])
                    ->with('error', $e->getMessage());
            }

            return redirect()->route('projects.index', ['tab' => 'approval']);
        }

        return redirect()->route('projects.show', $project);
    }

    public function destroy(Project $project): RedirectResponse
    {
        $this->authorize('delete', $project);

        $project->delete();

        return redirect()->route('projects.index', ['tab' => 'approval']);
    }
}
