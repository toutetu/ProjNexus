<?php

namespace App\Console\Commands;

use App\Enums\NotificationType;
use App\Enums\TaskStatus;
use App\Models\Notification;
use App\Models\ProjectWorkItem;
use App\Services\NotificationService;
use Illuminate\Console\Command;
use Illuminate\Support\Carbon;

class NotifyTaskDueSoon extends Command
{
    protected $signature = 'tasks:notify-due-soon';

    protected $description = '期限が近いタスクの担当者へ通知を送信する';

    public function __construct(private readonly NotificationService $notificationService)
    {
        parent::__construct();
    }

    public function handle(): int
    {
        $today = Carbon::today();
        $targets = [0, 3];
        $sent = 0;

        foreach ($targets as $offset) {
            $dueDate = $today->copy()->addDays($offset)->toDateString();

            $tasks = ProjectWorkItem::query()
                ->with(['project:id,title', 'assignee:id,name'])
                ->whereDate('due_date', $dueDate)
                ->where('status', '!=', TaskStatus::Closed->value)
                ->whereNotNull('assignee_id')
                ->get();

            foreach ($tasks as $task) {
                if ($task->project === null || $task->assignee === null) {
                    continue;
                }

                $alreadySent = Notification::query()
                    ->where('user_id', $task->assignee_id)
                    ->where('type', NotificationType::TaskDueSoon->value)
                    ->whereDate('created_at', $today->toDateString())
                    ->where('meta->task_id', $task->id)
                    ->where('meta->due_offset_days', $offset)
                    ->exists();

                if ($alreadySent) {
                    continue;
                }

                $this->notificationService->notifyTaskDueSoon(
                    $task->project,
                    $task,
                    $task->assignee,
                    $offset,
                );
                $sent++;
            }
        }

        $this->info("送信件数: {$sent}");

        return self::SUCCESS;
    }
}
