<?php

namespace App\Http\Controllers;

use App\Enums\ApprovalAction;
use App\Enums\ProjectStatus;
use App\Enums\Role;
use App\Models\Department;
use App\Models\Approval;
use App\Models\Project;
use App\Services\ApprovalService;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
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
        ]);

        $tab = $validated['tab'] ?? 'approval';
        $filter = $validated['filter'] ?? null;
        $status = $validated['status'] ?? null;
        $departmentId = $validated['department'] ?? null;
        $q = isset($validated['q']) ? trim((string) $validated['q']) : null;
        if ($q === '') {
            $q = null;
        }
        $user = $request->user();

        $this->authorize('viewAny', Project::class);

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

        if ($tab === 'approval' && $filter === 'pending') {
            $query->pendingFor($user);
        }

        if ($tab === 'approval' && $status !== null) {
            $query->where('status', $status);
        }

        if ($tab === 'approval' && $departmentId !== null) {
            $query->where('department_id', $departmentId);
        }

        if ($tab === 'approval' && $q !== null) {
            $query->where(function ($inner) use ($q): void {
                $inner
                    ->where('title', 'like', "%{$q}%")
                    ->orWhereHas('applicant', function ($applicantQuery) use ($q): void {
                        $applicantQuery->where('name', 'like', "%{$q}%");
                    })
                    ->orWhereHas('department', function ($departmentQuery) use ($q): void {
                        $departmentQuery->where('name', 'like', "%{$q}%");
                    });
            });
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
            'q' => $q,
            'departments' => Department::query()
                ->where('type', '!=', Department::TYPE_HEADQUARTERS)
                ->select(['id', 'name'])
                ->orderBy('id')
                ->get(),
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
            'project' => [
                'id' => $project->id,
                'title' => $project->title,
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

        $validated = $request->validate(
            [
                'title' => ['required', 'string', 'max:80'],
                'department_id' => ['required', 'integer', 'exists:departments,id'],
                'purpose' => ['nullable', 'string', 'max:2000'],
                'description' => ['nullable', 'string', 'max:5000'],
                'estimated_amount' => ['required', 'numeric', 'min:0'],
                'estimated_days' => ['nullable', 'integer', 'min:0'],
                'primary_assignee_id' => ['nullable', 'integer', 'exists:users,id'],
                'submit_action' => ['nullable', 'in:draft,submit'],
            ],
            $this->validationMessages(),
            $this->validationAttributes(),
        );
        $submitAction = $validated['submit_action'] ?? 'draft';
        unset($validated['submit_action']);

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

        $validated = $request->validate(
            [
                'title' => ['required', 'string', 'max:80'],
                'department_id' => ['required', 'integer', 'exists:departments,id'],
                'purpose' => ['nullable', 'string', 'max:2000'],
                'description' => ['nullable', 'string', 'max:5000'],
                'estimated_amount' => ['required', 'numeric', 'min:0'],
                'estimated_days' => ['nullable', 'integer', 'min:0'],
                'primary_assignee_id' => ['nullable', 'integer', 'exists:users,id'],
                'submit_action' => ['nullable', 'in:draft,submit'],
            ],
            $this->validationMessages(),
            $this->validationAttributes(),
        );
        $submitAction = $validated['submit_action'] ?? 'draft';
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
