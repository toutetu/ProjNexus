<?php

namespace App\Http\Controllers;

use App\Enums\ProjectStatus;
use App\Models\Project;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class ProjectController extends Controller
{
    public function create(): Response
    {
        $this->authorize('create', Project::class);

        return Inertia::render('Projects/Create');
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
            ->with(['department:id,name', 'applicant:id,name', 'primaryAssignee:id,name'])
            ->visibleTo($user)
            ->forTab($tab);

        if ($tab === 'approval' && $filter === 'pending') {
            $query->pendingFor($user);
        }

        return Inertia::render('Projects/Index', [
            'tab' => $tab,
            'filter' => $filter,
            'projects' => $query
                ->latest('updated_at')
                ->paginate(15)
                ->through(fn (Project $project) => [
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
                ]),
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

    public function store(Request $request): RedirectResponse
    {
        $this->authorize('create', Project::class);

        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'purpose' => ['nullable', 'string', 'max:2000'],
            'estimated_amount' => ['required', 'numeric', 'min:0'],
            'primary_assignee_id' => ['nullable', 'integer', 'exists:users,id'],
        ]);

        $request->user()->appliedProjects()->create([
            'department_id' => $request->user()->department_id,
            'status' => ProjectStatus::Draft,
            'revision' => 1,
            ...$validated,
        ]);

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
