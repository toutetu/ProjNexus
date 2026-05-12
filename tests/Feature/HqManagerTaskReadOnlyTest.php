<?php

namespace Tests\Feature;

use App\Enums\ProjectStatus;
use App\Enums\TaskPriority;
use App\Enums\TaskStatus;
use App\Enums\TaskType;
use App\Models\Department;
use App\Models\Project;
use App\Models\ProjectWorkItem;
use App\Models\User;
use Database\Seeders\DepartmentSeeder;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class HqManagerTaskReadOnlyTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed([DepartmentSeeder::class, RolePermissionSeeder::class]);
    }

    /**
     * @return array{0: User, 1: User, 2: Project, 3: ProjectWorkItem}
     */
    private function approvedProjectWithTask(): array
    {
        $dept = Department::query()->where('name', '開発1部')->firstOrFail();
        $hqDept = Department::query()->where('name', '本部')->firstOrFail();

        $applicant = User::factory()->create(['department_id' => $dept->id]);
        $applicant->assignRole('applicant');

        $hq = User::factory()->create(['department_id' => $hqDept->id]);
        $hq->assignRole('hq_manager');

        $project = Project::query()->create([
            'title' => '本部閲覧のみ検証',
            'applicant_id' => $applicant->id,
            'department_id' => $dept->id,
            'primary_assignee_id' => $applicant->id,
            'status' => ProjectStatus::Approved,
            'estimated_amount' => 10000,
            'budget_amount' => 10000,
            'revision' => 1,
        ]);

        $task = ProjectWorkItem::query()->create([
            'project_id' => $project->id,
            'title' => '検証タスク',
            'task_type' => TaskType::Task,
            'priority' => TaskPriority::Medium,
            'status' => TaskStatus::Open,
            'progress_rate' => 0,
            'assignee_id' => $applicant->id,
            'reviewer_id' => $applicant->id,
            'created_by' => $applicant->id,
        ]);

        return [$hq, $applicant, $project, $task];
    }

    public function test_hq_cannot_create_task_on_approved_project(): void
    {
        [$hq, , $project] = $this->approvedProjectWithTask();

        $response = $this->actingAs($hq)->post(route('projects.tasks.store', $project, absolute: false), [
            'title' => '追加試行',
            'task_type' => 'task',
            'priority' => 'medium',
            'status' => 'open',
            'progress_rate' => 0,
            'assignee_id' => null,
            'reviewer_id' => null,
            'due_date' => null,
            'description' => null,
            'estimated_days' => null,
            'actual_days' => 0,
        ]);

        $response->assertForbidden();
    }

    public function test_hq_cannot_update_task_fields(): void
    {
        [$hq, , $project, $task] = $this->approvedProjectWithTask();

        $response = $this->actingAs($hq)->put(
            route('projects.tasks.update', [$project, $task], absolute: false),
            [
                'title' => '書き換え',
                'task_type' => 'task',
                'priority' => 'high',
                'status' => 'in_progress',
                'progress_rate' => 50,
                'assignee_id' => $task->assignee_id,
                'reviewer_id' => $task->reviewer_id,
                'due_date' => null,
                'description' => null,
                'estimated_days' => null,
                'actual_days' => 0,
            ],
        );

        $response->assertForbidden();
    }

    public function test_hq_cannot_change_task_status_via_project_route(): void
    {
        [$hq, , $project, $task] = $this->approvedProjectWithTask();

        $response = $this->actingAs($hq)->put(
            route('projects.tasks.status.update', [$project, $task], absolute: false),
            [
                'status' => 'in_progress',
                'tasks_view' => 'board',
            ],
        );

        $response->assertForbidden();
    }

    public function test_hq_cannot_change_task_status_via_member_tasks_route(): void
    {
        [$hq, , , $task] = $this->approvedProjectWithTask();

        $response = $this->actingAs($hq)->put(
            route('member-tasks.status.update', $task, absolute: false),
            [
                'status' => 'in_progress',
                'return_to' => '/member-tasks?view=board&department_id='.$task->project->department_id,
            ],
        );

        $response->assertForbidden();
    }

    public function test_hq_cannot_post_task_comment(): void
    {
        [$hq, , $project, $task] = $this->approvedProjectWithTask();

        $response = $this->actingAs($hq)->post(
            route('projects.tasks.comments.store', [$project, $task], absolute: false),
            ['body' => '本部からのコメント'],
        );

        $response->assertForbidden();
    }

    public function test_hq_cannot_reopen_closed_task(): void
    {
        [$hq, , $project, $task] = $this->approvedProjectWithTask();
        $task->update(['status' => TaskStatus::Closed, 'progress_rate' => 100]);

        $response = $this->actingAs($hq)->put(
            route('projects.tasks.status.update', [$project, $task], absolute: false),
            [
                'status' => 'open',
                'tasks_view' => 'board',
            ],
        );

        $response->assertForbidden();
    }
}
