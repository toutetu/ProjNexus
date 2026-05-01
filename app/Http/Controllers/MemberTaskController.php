<?php

namespace App\Http\Controllers;

use App\Enums\ProjectStatus;
use App\Enums\Role;
use App\Enums\TaskPriority;
use App\Enums\TaskStatus;
use App\Models\Department;
use App\Models\Project;
use App\Models\ProjectWorkItem;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Inertia\Inertia;
use Inertia\Response;

class MemberTaskController extends Controller
{
    private const CLOSED_VISIBLE_DAYS = 30;

    private const LOAD_BAR_CAP = 8;

    public function index(Request $request): Response
    {
        $user = $request->user();

        $defaultView = $user->hasRole(Role::Applicant->value)
            && ! $user->hasRole(Role::DeptManager->value)
            && ! $user->hasRole(Role::HqManager->value)
            ? 'board'
            : 'members';

        $view = $request->query('view', $defaultView);
        if (! in_array($view, ['board', 'members'], true)) {
            $view = $defaultView;
        }

        $departments = Department::query()->select(['id', 'name'])->orderBy('name')->get();

        $departmentId = $this->resolveDepartmentId($request, $user);
        $needsDeptPick = $user->hasRole(Role::HqManager->value) && $departmentId === null;

        $tasks = collect();
        $departmentName = null;
        $members = collect();

        if (! $needsDeptPick && $departmentId !== null) {
            $departmentName = Department::query()->whereKey($departmentId)->value('name');
            $members = User::query()
                ->where('department_id', $departmentId)
                ->with('roles')
                ->select(['id', 'name', 'department_id'])
                ->orderBy('name')
                ->get();

            $tasks = $this->filteredTasksQuery($request, $user, $departmentId, $view)->get();
        }

        $sort = $request->query('sort', 'overdue_desc');
        if (! in_array($sort, ['overdue_desc', 'assignee_total', 'in_progress_desc', 'name'], true)) {
            $sort = 'overdue_desc';
        }

        $serializedTasks = $tasks->map(fn (ProjectWorkItem $task) => $this->serializeTask($task, $user))->values();

        $matrixMembers = $needsDeptPick || $departmentId === null
            ? []
            : $this->buildMatrixMembers($tasks, $members, $user, $sort);

        $kpis = $view === 'members' && ! $needsDeptPick && $departmentId !== null
            ? $this->computeKpis($tasks)
            : null;

        $matrixColumnCounts = $view === 'members' && ! $needsDeptPick && $departmentId !== null
            ? [
                'open' => $tasks->where('status', TaskStatus::Open)->count(),
                'in_progress' => $tasks->where('status', TaskStatus::InProgress)->count(),
                'done' => $tasks->filter(static function (ProjectWorkItem $t): bool {
                    return $t->status === TaskStatus::Resolved
                        || (
                            $t->status === TaskStatus::Closed
                            && $t->updated_at !== null
                            && $t->updated_at->gte(now()->subDays(self::CLOSED_VISIBLE_DAYS))
                        );
                })->count(),
            ]
            : null;

        $approvedProjects = ! $needsDeptPick && $departmentId !== null
            ? Project::query()
                ->where('department_id', $departmentId)
                ->where('status', ProjectStatus::Approved)
                ->select(['id', 'title'])
                ->orderByDesc('id')
                ->get()
                ->map(fn ($p) => ['id' => $p->id, 'title' => $p->title])
                ->values()
            : collect();

        $assigneesForDept = ! $needsDeptPick && $departmentId !== null
            ? User::query()->where('department_id', $departmentId)->select(['id', 'name'])->orderBy('name')->get()
            : collect();

        return Inertia::render('MemberTasks/Index', [
            'view' => $view,
            'defaultView' => $defaultView,
            'departmentId' => $departmentId,
            'departmentName' => $departmentName,
            'departments' => $departments,
            'memberCount' => $members->count(),
            'taskTotalCount' => $tasks->count(),
            'needsDepartmentSelection' => $needsDeptPick,
            'filters' => [
                'assignee_id' => $request->query('assignee_id') !== null && $request->query('assignee_id') !== ''
                    ? (int) $request->query('assignee_id')
                    : null,
                'project_id' => $request->query('project_id') !== null && $request->query('project_id') !== ''
                    ? (int) $request->query('project_id')
                    : null,
                'priority' => $request->query('priority', 'all'),
                'due' => $request->query('due', 'all'),
            ],
            'sort' => $sort,
            'kpis' => $kpis,
            'tasks' => $serializedTasks,
            'matrixMembers' => $matrixMembers,
            'matrixColumnCounts' => $matrixColumnCounts,
            'approvedProjects' => $approvedProjects,
            'assigneesForDept' => $assigneesForDept,
            'rolesMeta' => [
                'isHqManager' => $user->hasRole(Role::HqManager->value),
                'isDeptManager' => $user->hasRole(Role::DeptManager->value),
            ],
        ]);
    }

    private function resolveDepartmentId(Request $request, User $user): ?int
    {
        if ($user->hasRole(Role::HqManager->value)) {
            $raw = $request->query('department_id');

            return $raw !== null && $raw !== '' ? (int) $raw : null;
        }

        return $user->department_id;
    }

    private function filteredTasksQuery(Request $request, User $user, int $departmentId, string $view): Builder
    {
        $q = ProjectWorkItem::query()
            ->with([
                'assignee:id,name,department_id',
                'reviewer:id,name,department_id',
                'project:id,title,department_id',
                'comments' => static function ($commentQuery): void {
                    $commentQuery->with('user:id,name')->orderBy('created_at');
                },
                'histories' => static function ($historyQuery): void {
                    $historyQuery->with('user:id,name')->latest('created_at');
                },
            ])
            ->whereHas('project', static function (Builder $p) use ($departmentId): void {
                $p->where('department_id', $departmentId)
                    ->where('status', ProjectStatus::Approved);
            })
            ->where(static function (Builder $w): void {
                $w->where('status', '!=', TaskStatus::Closed)
                    ->orWhere(static function (Builder $w2): void {
                        $w2->where('status', TaskStatus::Closed)
                            ->where('updated_at', '>=', now()->subDays(self::CLOSED_VISIBLE_DAYS));
                    });
            });

        if (
            $user->hasRole(Role::Applicant->value)
            && ! $user->hasRole(Role::DeptManager->value)
            && ! $user->hasRole(Role::HqManager->value)
            && $view === 'board'
        ) {
            $uid = $user->id;
            $q->where(static function (Builder $w) use ($uid): void {
                $w->where('assignee_id', $uid)->orWhere('reviewer_id', $uid);
            });
        }

        $assigneeFilter = $request->query('assignee_id');
        if ($assigneeFilter !== null && $assigneeFilter !== '') {
            $q->where('assignee_id', (int) $assigneeFilter);
        }

        $projectFilter = $request->query('project_id');
        if ($projectFilter !== null && $projectFilter !== '') {
            $q->where('project_id', (int) $projectFilter);
        }

        $priorityFilter = $request->query('priority', 'all');
        if (in_array($priorityFilter, TaskPriority::values(), true)) {
            $q->where('priority', $priorityFilter);
        }

        $dueFilter = $request->query('due', 'all');
        $today = Carbon::today();
        match ($dueFilter) {
            'overdue' => $q->whereNotNull('due_date')
                ->whereDate('due_date', '<', $today)
                ->where('status', '!=', TaskStatus::Closed),
            'soon' => $q->whereNotNull('due_date')
                ->whereDate('due_date', '>=', $today)
                ->whereDate('due_date', '<=', $today->copy()->addDays(3))
                ->where('status', '!=', TaskStatus::Closed),
            'week' => $q->whereNotNull('due_date')
                ->whereBetween('due_date', [$today->copy()->startOfWeek(), $today->copy()->endOfWeek()]),
            'month' => $q->whereNotNull('due_date')
                ->whereBetween('due_date', [$today->copy()->startOfMonth(), $today->copy()->endOfMonth()]),
            'unset' => $q->whereNull('due_date'),
            default => null,
        };

        return $q->orderByDesc('updated_at');
    }

    /**
     * @return array{total: int, overdue: int, soon: int, completionRate: float, closedCount: int}
     */
    private function computeKpis(Collection $tasks): array
    {
        $today = Carbon::today();
        $total = $tasks->count();
        $overdue = $tasks->filter(static function (ProjectWorkItem $t) use ($today): bool {
            return $t->status !== TaskStatus::Closed
                && $t->due_date !== null
                && $t->due_date->lt($today);
        })->count();

        $soon = $tasks->filter(static function (ProjectWorkItem $t) use ($today): bool {
            if ($t->status === TaskStatus::Closed || $t->due_date === null) {
                return false;
            }

            return $t->due_date->gte($today) && $t->due_date->lte($today->copy()->addDays(3));
        })->count();

        $closedCount = $tasks->where('status', TaskStatus::Closed)->count();
        $completionRate = $total > 0 ? round(100 * $closedCount / $total, 1) : 0.0;

        return [
            'total' => $total,
            'overdue' => $overdue,
            'soon' => $soon,
            'completionRate' => $completionRate,
            'closedCount' => $closedCount,
        ];
    }

    /**
     * @param  Collection<int, ProjectWorkItem>  $tasks
     * @param  Collection<int, User>  $members
     * @return list<array<string, mixed>>
     */
    private function buildMatrixMembers(
        Collection $tasks,
        Collection $members,
        User $viewer,
        string $sort,
    ): array {
        $today = Carbon::today();

        $rows = $members->map(function (User $member) use ($tasks, $viewer, $today): array {
            $memberTasks = $tasks->where('assignee_id', $member->id)->values();

            $activeTasks = $memberTasks->filter(static fn (ProjectWorkItem $t) => $t->status !== TaskStatus::Closed);

            $overdueCount = $activeTasks->filter(static function (ProjectWorkItem $t) use ($today): bool {
                return $t->due_date !== null && $t->due_date->lt($today);
            })->count();

            $soonCount = $activeTasks->filter(static function (ProjectWorkItem $t) use ($today): bool {
                if ($t->due_date === null) {
                    return false;
                }

                return $t->due_date->gte($today) && $t->due_date->lte($today->copy()->addDays(3));
            })->count();

            $resolvedReporterCount = $memberTasks->where('status', TaskStatus::Resolved)->count();

            $resolvedReviewerCount = $tasks->filter(static fn (ProjectWorkItem $t) => $t->status === TaskStatus::Resolved
                && $t->reviewer_id === $member->id)->count();

            $loadCount = $activeTasks->count();
            $loadPct = min(100, (int) round(100 * $loadCount / self::LOAD_BAR_CAP));

            $bucketOpen = $memberTasks->filter(static fn (ProjectWorkItem $t) => $t->status === TaskStatus::Open)->values();
            $bucketProgress = $memberTasks->filter(static fn (ProjectWorkItem $t) => $t->status === TaskStatus::InProgress)->values();
            $bucketDone = $memberTasks->filter(static function (ProjectWorkItem $t): bool {
                return $t->status === TaskStatus::Resolved
                    || (
                        $t->status === TaskStatus::Closed
                        && $t->updated_at !== null
                        && $t->updated_at->gte(now()->subDays(self::CLOSED_VISIBLE_DAYS))
                    );
            })->values();

            return [
                'user' => [
                    'id' => $member->id,
                    'name' => $member->name,
                    'isSelf' => $member->id === $viewer->id,
                    'roles' => $member->roles->pluck('name')->values()->all(),
                ],
                'stats' => [
                    'overdueCount' => $overdueCount,
                    'soonCount' => $soonCount,
                    'resolvedReporterCount' => $resolvedReporterCount,
                    'resolvedReviewerCount' => $resolvedReviewerCount,
                    'loadCount' => $loadCount,
                    'loadPct' => $loadPct,
                    'totalCount' => $memberTasks->count(),
                    'inProgressCount' => $bucketProgress->count(),
                ],
                'buckets' => [
                    'open' => $bucketOpen->map(fn (ProjectWorkItem $t) => $this->serializeTask($t, $viewer))->values()->all(),
                    'in_progress' => $bucketProgress->map(fn (ProjectWorkItem $t) => $this->serializeTask($t, $viewer))->values()->all(),
                    'done' => $bucketDone->map(fn (ProjectWorkItem $t) => $this->serializeTask($t, $viewer))->values()->all(),
                ],
            ];
        })->values()->all();

        usort($rows, static function (array $a, array $b) use ($sort): int {
            return match ($sort) {
                'assignee_total' => $b['stats']['totalCount'] <=> $a['stats']['totalCount']
                    ?: strcmp($a['user']['name'], $b['user']['name']),
                'in_progress_desc' => $b['stats']['inProgressCount'] <=> $a['stats']['inProgressCount']
                    ?: strcmp($a['user']['name'], $b['user']['name']),
                'name' => strcmp($a['user']['name'], $b['user']['name']),
                default => $b['stats']['overdueCount'] <=> $a['stats']['overdueCount']
                    ?: strcmp($a['user']['name'], $b['user']['name']),
            };
        });

        return $rows;
    }

    /**
     * @return array<string, mixed>
     */
    private function serializeTask(ProjectWorkItem $task, User $viewer): array
    {
        return [
            'id' => $task->id,
            'projectId' => $task->project_id,
            'projectTitle' => $task->project?->title ?? '',
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
            'updatedAt' => $task->updated_at?->toIso8601String(),
            'canUpdate' => $viewer->can('update', $task),
            'comments' => $task->comments->map(static fn ($comment) => [
                'id' => $comment->id,
                'user' => $comment->user?->name ?? '不明ユーザー',
                'body' => $comment->body,
                'createdAt' => $comment->created_at?->toIso8601String(),
            ])->values()->all(),
            'histories' => $task->histories->map(static fn ($history) => [
                'id' => $history->id,
                'user' => $history->user?->name ?? '不明ユーザー',
                'fieldName' => $history->field_name,
                'oldValue' => $history->old_value,
                'newValue' => $history->new_value,
                'createdAt' => $history->created_at?->toIso8601String(),
            ])->values()->all(),
        ];
    }
}
