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

class MemberTasksTaskUpdateReturnToTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed([DepartmentSeeder::class, RolePermissionSeeder::class]);
    }

    /**
     * @return array{0: User, 1: Project, 2: ProjectWorkItem}
     */
    private function deptManagerWithTask(): array
    {
        $dept = Department::query()->where('name', '開発1部')->firstOrFail();

        $manager = User::factory()->create(['department_id' => $dept->id]);
        $manager->assignRole('dept_manager');

        $applicant = User::factory()->create(['department_id' => $dept->id]);
        $applicant->assignRole('applicant');

        $project = Project::query()->create([
            'title' => 'return_to 検証',
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

        return [$manager, $project, $task];
    }

    /**
     * @return array<string, mixed>
     */
    private function validTaskPayload(): array
    {
        return [
            'title' => '検証タスク',
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
        ];
    }

    public function test_task_update_redirects_to_relative_member_tasks_return_to(): void
    {
        [$manager, $project, $task] = $this->deptManagerWithTask();
        $returnTo = '/member-tasks?view=board&department_id='.$project->department_id.'&assignee_id=2';

        $response = $this->actingAs($manager)->put(
            route('projects.tasks.update', [$project, $task], absolute: false),
            [
                ...$this->validTaskPayload(),
                'assignee_id' => $task->assignee_id,
                'reviewer_id' => $task->reviewer_id,
                'return_to' => $returnTo,
            ],
        );

        $response->assertRedirect($returnTo);
    }

    public function test_task_update_redirects_to_same_host_absolute_member_tasks_return_to(): void
    {
        [$manager, $project, $task] = $this->deptManagerWithTask();
        $returnTo = url('/member-tasks?view=board&department_id='.$project->department_id);

        $response = $this->actingAs($manager)->put(
            route('projects.tasks.update', [$project, $task], absolute: false),
            [
                ...$this->validTaskPayload(),
                'assignee_id' => $task->assignee_id,
                'reviewer_id' => $task->reviewer_id,
                'return_to' => $returnTo,
            ],
        );

        $response->assertRedirect($returnTo);
    }

    public function test_task_update_rejects_external_return_to(): void
    {
        [$manager, $project, $task] = $this->deptManagerWithTask();

        $response = $this->actingAs($manager)->put(
            route('projects.tasks.update', [$project, $task], absolute: false),
            [
                ...$this->validTaskPayload(),
                'assignee_id' => $task->assignee_id,
                'reviewer_id' => $task->reviewer_id,
                'return_to' => 'https://evil.example/member-tasks?view=board',
            ],
        );

        $response->assertRedirect(route('projects.show', $project, absolute: false));
    }

    public function test_task_update_rejects_protocol_relative_return_to(): void
    {
        [$manager, $project, $task] = $this->deptManagerWithTask();

        $response = $this->actingAs($manager)->put(
            route('projects.tasks.update', [$project, $task], absolute: false),
            [
                ...$this->validTaskPayload(),
                'assignee_id' => $task->assignee_id,
                'reviewer_id' => $task->reviewer_id,
                'return_to' => '//evil.example/member-tasks?view=board',
            ],
        );

        $response->assertRedirect(route('projects.show', $project, absolute: false));
    }
}
