<?php

namespace App\Services;

use App\Enums\TaskPriority;
use App\Enums\TaskStatus;
use App\Models\ProjectTaskHistory;
use App\Models\ProjectWorkItem;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class TaskHistoryService
{
    /** @var list<string> */
    private const TRACKED_FIELDS = ['status', 'progress_rate', 'assignee_id', 'due_date', 'priority'];

    public function recordCreation(ProjectWorkItem $task, User $actor): void
    {
        DB::transaction(function () use ($task, $actor): void {
            $task->loadMissing('assignee');

            foreach (self::TRACKED_FIELDS as $field) {
                ProjectTaskHistory::query()->create([
                    'task_id' => $task->id,
                    'user_id' => $actor->id,
                    'field_name' => $field,
                    'old_value' => null,
                    'new_value' => $this->formatField($task, $field),
                ]);
            }
        });
    }

    /**
     * @param  array<string, mixed>  $beforeDisplay  {@see self::displaySnapshot()}
     */
    public function recordChanges(ProjectWorkItem $task, array $beforeDisplay, User $actor): void
    {
        $task->refresh();
        $task->loadMissing('assignee');
        $afterDisplay = $this->displaySnapshot($task);

        DB::transaction(function () use ($task, $beforeDisplay, $afterDisplay, $actor): void {
            foreach (self::TRACKED_FIELDS as $field) {
                $oldVal = $beforeDisplay[$field] ?? '';
                $newVal = $afterDisplay[$field] ?? '';
                if ($oldVal === $newVal) {
                    continue;
                }

                ProjectTaskHistory::query()->create([
                    'task_id' => $task->id,
                    'user_id' => $actor->id,
                    'field_name' => $field,
                    'old_value' => $oldVal === '' ? null : $oldVal,
                    'new_value' => $newVal === '' ? null : $newVal,
                ]);
            }
        });
    }

    /**
     * @return array{status: string, progress_rate: string, assignee_id: string, due_date: string, priority: string}
     */
    public function displaySnapshot(ProjectWorkItem $task): array
    {
        $task->loadMissing('assignee');

        return [
            'status' => $this->formatStatus($task->status),
            'progress_rate' => $this->formatProgressRate((int) $task->progress_rate),
            'assignee_id' => $this->formatAssignee($task),
            'due_date' => $this->formatDueDate($task),
            'priority' => $this->formatPriority($task->priority),
        ];
    }

    private function formatField(ProjectWorkItem $task, string $field): string
    {
        return match ($field) {
            'status' => $this->formatStatus($task->status),
            'progress_rate' => $this->formatProgressRate((int) $task->progress_rate),
            'assignee_id' => $this->formatAssignee($task),
            'due_date' => $this->formatDueDate($task),
            'priority' => $this->formatPriority($task->priority),
            default => '',
        };
    }

    private function formatStatus(TaskStatus $status): string
    {
        return match ($status) {
            TaskStatus::Open => '未着手',
            TaskStatus::InProgress => '進行中',
            TaskStatus::Resolved => '確認待ち',
            TaskStatus::Closed => '完了',
        };
    }

    private function formatPriority(TaskPriority $priority): string
    {
        return match ($priority) {
            TaskPriority::High => '高',
            TaskPriority::Medium => '中',
            TaskPriority::Low => '低',
        };
    }

    private function formatProgressRate(int $rate): string
    {
        return "{$rate}%";
    }

    private function formatAssignee(ProjectWorkItem $task): string
    {
        if ($task->assignee_id === null) {
            return '未割当';
        }

        return $task->assignee?->name ?? User::query()->whereKey($task->assignee_id)->value('name') ?? '不明ユーザー';
    }

    private function formatDueDate(ProjectWorkItem $task): string
    {
        return $task->due_date?->format('Y-m-d') ?? '—';
    }
}
