<?php

namespace App\Http\Controllers;

use App\Models\Project;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProjectController extends Controller
{
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
                ]),
        ]);
    }
}
