<?php

namespace App\Http\Controllers;

use App\Enums\ProjectStatus;
use App\Enums\Role;
use App\Enums\TaskStatus;
use App\Models\Project;
use App\Models\ProjectWorkItem;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        $this->authorize('viewAny', Project::class);

        $scopedProjects = $this->scopedProjectsQuery($user);

        $activeProjects = (clone $scopedProjects)
            ->where('status', ProjectStatus::Approved->value)
            ->whereHas('tasks', function (Builder $query): void {
                $query->where('status', '!=', TaskStatus::Closed->value);
            });

        $activeCount = (clone $activeProjects)->count();
        $activeDelta = (clone $activeProjects)
            ->where('updated_at', '>=', now()->subWeek())
            ->count();

        $pendingCount = Project::query()
            ->visibleTo($user)
            ->pendingFor($user)
            ->count();

        $progressRate = (float) ProjectWorkItem::query()
            ->whereHas('project', function (Builder $query) use ($user): void {
                $query
                    ->visibleTo($user)
                    ->where('status', ProjectStatus::Approved->value);
            })
            ->avg('progress_rate');

        $budgetBaseQuery = (clone $scopedProjects)
            ->where('status', ProjectStatus::Approved->value)
            ->whereNotNull('budget_amount')
            ->where('budget_amount', '>', 0);

        $budgetTotal = (float) (clone $budgetBaseQuery)->sum('budget_amount');
        $actualTotal = (float) (clone $budgetBaseQuery)->sum('actual_amount');
        $consumptionRate = $budgetTotal > 0 ? round($actualTotal / $budgetTotal * 100, 1) : 0.0;

        $departmentProgress = $this->buildDepartmentProgress($user);

        $budgetAlertProjects = (clone $budgetBaseQuery)
            ->with(['department:id,name'])
            ->select(['id', 'title', 'department_id', 'budget_amount', 'actual_amount'])
            ->whereRaw('COALESCE(actual_amount, 0) / budget_amount >= 0.7')
            ->orderByRaw('COALESCE(actual_amount, 0) / budget_amount DESC')
            ->limit(5)
            ->get()
            ->map(function (Project $project): array {
                $budget = (float) ($project->budget_amount ?? 0);
                $actual = (float) ($project->actual_amount ?? 0);
                $rate = $budget > 0 ? round($actual / $budget * 100, 1) : 0.0;

                return [
                    'id' => $project->id,
                    'title' => $project->title,
                    'department' => $project->department?->name,
                    'budgetAmount' => $budget,
                    'actualAmount' => $actual,
                    'consumptionRate' => $rate,
                ];
            })
            ->values()
            ->all();

        return Inertia::render('Dashboard/Index', [
            'kpi' => [
                'activeProjects' => $activeCount,
                'activeDelta' => $activeDelta,
                'pendingApprovals' => $pendingCount,
                'averageProgressRate' => round($progressRate, 1),
                'budgetConsumptionRate' => $consumptionRate,
            ],
            'departmentProgress' => $departmentProgress,
            'budgetTrend' => [
                ['month' => '2026/01', 'rate' => 18],
                ['month' => '2026/02', 'rate' => 38],
                ['month' => '2026/03', 'rate' => 56],
                ['month' => '2026/04', 'rate' => 72],
            ],
            'budgetAlerts' => $budgetAlertProjects,
            'updatedAt' => now()->format('H:i'),
        ]);
    }

    private function scopedProjectsQuery(User $user): Builder
    {
        return Project::query()
            ->visibleTo($user)
            ->where(function (Builder $query): void {
                $query->where('status', '!=', ProjectStatus::Rejected->value)
                    ->orWhereDoesntHave('childProjects');
            });
    }

    /**
     * @return array<int, array{name: string, rate: float, color: string}>
     */
    private function buildDepartmentProgress(User $user): array
    {
        $base = ProjectWorkItem::query()
            ->join('projects', 'tasks.project_id', '=', 'projects.id')
            ->join('departments', 'projects.department_id', '=', 'departments.id')
            ->where('projects.status', ProjectStatus::Approved->value);

        if ($user->hasRole(Role::HqManager->value)) {
            $rows = (clone $base)
                ->selectRaw('departments.name as name, AVG(tasks.progress_rate) as rate')
                ->groupBy('departments.name')
                ->orderBy('departments.id')
                ->get();

            $palette = ['#01CFFF', '#106EBE', '#6D28D9', '#16A34A', '#EDB100'];

            return $rows->values()->map(function ($row, int $index) use ($palette): array {
                return [
                    'name' => (string) $row->name,
                    'rate' => round((float) ($row->rate ?? 0), 1),
                    'color' => $palette[$index % count($palette)],
                ];
            })->all();
        }

        $rate = (clone $base)
            ->where('projects.department_id', $user->department_id)
            ->avg('tasks.progress_rate');

        return [[
            'name' => $user->department?->name ?? '未所属',
            'rate' => round((float) ($rate ?? 0), 1),
            'color' => '#106EBE',
        ]];
    }
}
