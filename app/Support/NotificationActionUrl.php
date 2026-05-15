<?php

namespace App\Support;

use App\Enums\NotificationType;
use App\Enums\ProjectStatus;
use App\Models\Project;
use App\Models\ProjectWorkItem;
use App\Models\User;
use Illuminate\Support\Facades\Gate;

final class NotificationActionUrl
{
    /**
     * @param  array<string, mixed>|null  $meta
     * @return array{
     *   project: array{href: string, label: string}|null,
     *   task: array{href: string, label: string}|null,
     * }
     */
    public static function resolveActions(User $user, NotificationType $type, ?array $meta): array
    {
        $empty = ['project' => null, 'task' => null];

        $projectId = self::intFromMeta($meta, 'project_id');
        if ($projectId === null) {
            return $empty;
        }

        $project = Project::query()->find($projectId);
        if ($project === null || ! Gate::forUser($user)->allows('view', $project)) {
            return $empty;
        }

        if ($type->isTaskRelated()) {
            return self::resolveTaskActions($user, $project, $meta);
        }

        return [
            'project' => [
                'href' => self::projectShowPath($project, ['detailTab' => 'apply']),
                'label' => '案件を開く',
            ],
            'task' => null,
        ];
    }

    /**
     * @param  array<string, mixed>|null  $meta
     * @return array{project: array{href: string, label: string}|null, task: array{href: string, label: string}|null}
     */
    private static function resolveTaskActions(User $user, Project $project, ?array $meta): array
    {
        $projectTab = $project->status === ProjectStatus::Approved ? 'tasks' : 'apply';

        $result = [
            'project' => [
                'href' => self::projectShowPath($project, ['detailTab' => $projectTab]),
                'label' => '案件を開く',
            ],
            'task' => null,
        ];

        $taskId = self::intFromMeta($meta, 'task_id');
        if ($taskId === null) {
            return $result;
        }

        $task = ProjectWorkItem::query()
            ->whereKey($taskId)
            ->where('project_id', $project->id)
            ->first();

        if ($task !== null && Gate::forUser($user)->allows('view', $task)) {
            $result['task'] = [
                'href' => self::projectShowPath($project, [
                    'detailTab' => 'tasks',
                    'taskId' => $task->id,
                ]),
                'label' => 'タスクを開く',
            ];
        }

        return $result;
    }

    /**
     * Inertia 向けに相対パスを返す（APP_URL とブラウザのホスト不一致を避ける）。
     *
     * @param  array<string, mixed>  $query
     */
    private static function projectShowPath(Project $project, array $query = []): string
    {
        return route('projects.show', ['project' => $project, ...$query], absolute: false);
    }

    /**
     * @param  array<string, mixed>|null  $meta
     */
    private static function intFromMeta(?array $meta, string $key): ?int
    {
        if ($meta === null || ! array_key_exists($key, $meta)) {
            return null;
        }

        $raw = $meta[$key];
        if (is_int($raw)) {
            return $raw;
        }

        if (is_string($raw) && ctype_digit($raw)) {
            return (int) $raw;
        }

        return null;
    }
}
