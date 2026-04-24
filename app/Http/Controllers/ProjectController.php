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
    public function create(): Response
    {
        $this->authorize('create', Project::class);

        return Inertia::render('Projects/Create', [
            'departments' => Department::query()
                ->select(['id', 'name'])
                ->orderBy('id')
                ->get(),
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
        ]);

        $tab = $validated['tab'] ?? 'approval';
        $filter = $validated['filter'] ?? null;
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
        $canEdit = auth()->user()?->can('update', $project) ?? false;

        return Inertia::render('Projects/Show', [
            'projectId' => $project->id,
            'canEdit' => $canEdit,
            'project' => [
                'id' => $project->id,
                'title' => $project->title,
                'status' => $project->status->value,
                'department' => $project->department?->name,
                'applicant' => $project->applicant?->name,
                'primaryAssignee' => $project->primaryAssignee?->name,
                'estimatedAmount' => $project->estimated_amount,
                'budgetAmount' => $project->budget_amount,
                'actualAmount' => $project->actual_amount,
            ],
        ]);
    }

    public function edit(Project $project): Response
    {
        $this->authorize('update', $project);

        return Inertia::render('Projects/Edit', [
            'project' => [
                'id' => $project->id,
                'title' => $project->title,
                'purpose' => $project->purpose,
                'estimatedAmount' => $project->estimated_amount,
            ],
        ]);
    }

    public function store(Request $request, ApprovalService $approvalService): RedirectResponse
    {
        $this->authorize('create', Project::class);

        $validated = $request->validate([
            'title' => ['required', 'string', 'max:80'],
            'department_id' => ['required', 'integer', 'exists:departments,id'],
            'purpose' => ['nullable', 'string', 'max:2000'],
            'description' => ['nullable', 'string', 'max:5000'],
            'estimated_amount' => ['required', 'numeric', 'min:0'],
            'estimated_days' => ['nullable', 'integer', 'min:0'],
            'primary_assignee_id' => ['nullable', 'integer', 'exists:users,id'],
            'submit_action' => ['nullable', 'in:draft,submit'],
        ]);
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

    public function update(Request $request, Project $project): RedirectResponse
    {
        $this->authorize('update', $project);

        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'purpose' => ['nullable', 'string', 'max:2000'],
            'estimated_amount' => ['required', 'numeric', 'min:0'],
            'primary_assignee_id' => ['nullable', 'integer', 'exists:users,id'],
        ]);

        $project->update($validated);

        return redirect()->route('projects.show', $project);
    }

    public function destroy(Project $project): RedirectResponse
    {
        $this->authorize('delete', $project);

        $project->delete();

        return redirect()->route('projects.index', ['tab' => 'approval']);
    }
}
