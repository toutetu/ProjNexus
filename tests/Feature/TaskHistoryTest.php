<?php

namespace Tests\Feature;

use App\Enums\ProjectStatus;
use App\Enums\TaskPriority;
use App\Enums\TaskStatus;
use App\Enums\TaskType;
use App\Models\Department;
use App\Models\Project;
use App\Models\ProjectTaskHistory;
use App\Models\ProjectWorkItem;
use App\Models\User;
use Database\Seeders\DepartmentSeeder;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TaskHistoryTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed([DepartmentSeeder::class, RolePermissionSeeder::class]);
    }

    /**
     * @return array{0: User, 1: Project}
     */
    private function applicantWithApprovedProject(): array
    {
        $dept = Department::query()->where('name', '開発1部')->firstOrFail();
        $user = User::factory()->create(['department_id' => $dept->id]);
        $user->assignRole('applicant');

        $project = Project::query()->create([
            'title' => '履歴検証',
            'applicant_id' => $user->id,
            'department_id' => $dept->id,
            'primary_assignee_id' => $user->id,
            'status' => ProjectStatus::Approved,
            'estimated_amount' => 10000,
            'budget_amount' => 10000,
            'revision' => 1,
        ]);

        return [$user, $project];
    }

    public function test_task_store_records_initial_histories_for_tracked_fields(): void
    {
        [$user, $project] = $this->applicantWithApprovedProject();

        $response = $this->actingAs($user)->post(route('projects.tasks.store', $project, absolute: false), [
            'title' => 'テストタスク',
            'task_type' => 'task',
            'priority' => 'medium',
            'status' => 'open',
            'progress_rate' => 0,
            'assignee_id' => null,
            'due_date' => null,
            'description' => null,
        ]);

        $response->assertRedirect(route('projects.show', $project, absolute: false));

        $task = ProjectWorkItem::query()->where('project_id', $project->id)->firstOrFail();

        foreach (['status', 'progress_rate', 'assignee_id', 'due_date', 'priority'] as $field) {
            $this->assertDatabaseHas('task_histories', [
                'task_id' => $task->id,
                'user_id' => $user->id,
                'field_name' => $field,
            ]);
        }

        $this->assertSame(5, ProjectTaskHistory::query()->where('task_id', $task->id)->count());
    }

    public function test_task_update_writes_history_when_tracked_fields_change(): void
    {
        [$user, $project] = $this->applicantWithApprovedProject();

        $task = ProjectWorkItem::query()->create([
            'project_id' => $project->id,
            'title' => '更新対象',
            'task_type' => TaskType::Task,
            'priority' => TaskPriority::Medium,
            'status' => TaskStatus::Open,
            'progress_rate' => 0,
            'assignee_id' => null,
            'created_by' => $user->id,
        ]);

        $this->assertSame(0, ProjectTaskHistory::query()->where('task_id', $task->id)->count());

        $response = $this->actingAs($user)->put(
            route('projects.tasks.update', [$project, $task], absolute: false),
            [
                'title' => '更新対象',
                'task_type' => 'task',
                'priority' => 'medium',
                'status' => 'in_progress',
                'progress_rate' => 30,
                'assignee_id' => null,
                'due_date' => null,
                'description' => null,
            ],
        );

        $response->assertRedirect(route('projects.show', $project, absolute: false));

        $this->assertDatabaseHas('task_histories', [
            'task_id' => $task->id,
            'user_id' => $user->id,
            'field_name' => 'status',
            'old_value' => '未着手',
            'new_value' => '進行中',
        ]);

        $this->assertDatabaseHas('task_histories', [
            'task_id' => $task->id,
            'field_name' => 'progress_rate',
            'old_value' => '0%',
            'new_value' => '30%',
        ]);
    }
}
