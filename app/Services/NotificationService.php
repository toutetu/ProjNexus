<?php

namespace App\Services;

use App\Enums\NotificationType;
use App\Models\Notification;
use App\Models\Project;
use App\Models\ProjectWorkItem;
use App\Models\User;
use Illuminate\Support\Collection;

class NotificationService
{
    /**
     * @param  Collection<int, User>|array<int, User>  $users
     * @param  array<string, mixed>|null  $meta
     */
    public function notifyUsers(
        Collection|array $users,
        NotificationType $type,
        string $title,
        ?string $body = null,
        ?array $meta = null,
        bool $markAsRead = false,
    ): void {
        $targets = $users instanceof Collection ? $users : collect($users);

        foreach ($targets->unique('id') as $user) {
            Notification::query()->create([
                'user_id' => $user->id,
                'type' => $type,
                'title' => $title,
                'body' => $body,
                'meta' => $meta,
                'read_at' => $markAsRead ? now() : null,
            ]);
        }
    }

    public function notifyTaskAssigned(Project $project, ProjectWorkItem $task, User $assignee, string $context): void
    {
        $this->notifyUsers(
            [$assignee],
            NotificationType::TaskAssigned,
            'タスクが割り当てられました',
            sprintf('案件#%d「%s」のタスク「%s」が%s。', $project->id, $project->title, $task->title, $context),
            [
                'project_id' => $project->id,
                'task_id' => $task->id,
                'notification_context' => 'task_assigned',
            ],
        );
    }

    public function notifyTaskCompleted(Project $project, ProjectWorkItem $task, User $actor, User $recipient): void
    {
        $this->notifyUsers(
            [$recipient],
            NotificationType::TaskCompleted,
            'タスクが完了しました',
            sprintf('案件#%d「%s」のタスク「%s」が%sさんにより完了しました。', $project->id, $project->title, $task->title, $actor->name),
            [
                'project_id' => $project->id,
                'task_id' => $task->id,
                'notification_context' => 'task_completed',
            ],
        );
    }

    public function notifyTaskDueSoon(Project $project, ProjectWorkItem $task, User $assignee, int $dueOffsetDays): void
    {
        $label = $dueOffsetDays === 0 ? '本日が期限' : sprintf('期限まであと%d日', $dueOffsetDays);

        $this->notifyUsers(
            [$assignee],
            NotificationType::TaskDueSoon,
            'タスク期限が近づいています',
            sprintf('案件#%d「%s」のタスク「%s」は%sです。', $project->id, $project->title, $task->title, $label),
            [
                'project_id' => $project->id,
                'task_id' => $task->id,
                'due_offset_days' => $dueOffsetDays,
                'notification_context' => 'task_due_soon',
            ],
        );
    }

    public function notifyTaskResolved(Project $project, ProjectWorkItem $task, User $reviewer, User $actor): void
    {
        $this->notifyUsers(
            [$reviewer],
            NotificationType::TaskResolved,
            'タスクの確認依頼があります',
            sprintf(
                '案件#%d「%s」のタスク「%s」が%sさんにより完了報告されました。確認をお願いします。',
                $project->id,
                $project->title,
                $task->title,
                $actor->name,
            ),
            [
                'project_id' => $project->id,
                'task_id' => $task->id,
                'notification_context' => 'task_resolved',
            ],
        );
    }

    /**
     * @param  array<int, User>  $recipients
     */
    public function notifyTaskReviewed(Project $project, ProjectWorkItem $task, User $reviewer, array $recipients): void
    {
        $targets = collect($recipients)->unique('id')->values()->all();
        if ($targets === []) {
            return;
        }

        $this->notifyUsers(
            $targets,
            NotificationType::TaskReviewed,
            'タスクが確認OKになりました',
            sprintf(
                '案件#%d「%s」のタスク「%s」が%sさんにより確認されました。',
                $project->id,
                $project->title,
                $task->title,
                $reviewer->name,
            ),
            [
                'project_id' => $project->id,
                'task_id' => $task->id,
                'notification_context' => 'task_reviewed',
            ],
        );
    }
}
