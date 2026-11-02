<?php

namespace App\Http\Controllers;

use App\Enums\ProjectStatus;
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
            // 予算・実績の集計は未実装のため、グラフは仮の数字で表示する
            'departmentBudget' => [
                ['name' => '本部', 'budget' => 8000000, 'actual' => 6200000],
                ['name' => '開発1部', 'budget' => 12000000, 'actual' => 9800000],
                ['name' => '開発2部', 'budget' => 10000000, 'actual' => 10500000],
                ['name' => '開発3部', 'budget' => 9000000, 'actual' => 5400000],
            ],
            'budgetTrend' => [
                ['month' => '2026/01', 'budget' => 5000000, 'actual' => 4200000],
                ['month' => '2026/02', 'budget' => 5000000, 'actual' => 4800000],
                ['month' => '2026/03', 'budget' => 5500000, 'actual' => 6000000],
                ['month' => '2026/04', 'budget' => 5500000, 'actual' => 3900000],
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
}
