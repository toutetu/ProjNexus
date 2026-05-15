<?php

namespace Tests\Feature;

use App\Enums\ProjectStatus;
use App\Enums\Role;
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

class ProjectDevTabDueDateTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed([DepartmentSeeder::class, RolePermissionSeeder::class]);
    }

    public function test_dev_tab_nearest_due_date_ignores_closed_tasks(): void
    {
        $dept = Department::query()->where('name', '開発1部')->firstOrFail();
        $manager = User::factory()->create(['department_id' => $dept->id]);
        $manager->assignRole(Role::DeptManager->value);

        $member = User::factory()->create(['department_id' => $dept->id]);
        $member->assignRole(Role::Applicant->value);

        $project = Project::query()->create([
            'title' => '期日集計検証',
            'applicant_id' => $member->id,
            'department_id' => $dept->id,
            'primary_assignee_id' => $member->id,
            'status' => ProjectStatus::Approved,
            'estimated_amount' => 100_000,
            'budget_amount' => 100_000,
            'revision' => 1,
        ]);

        ProjectWorkItem::query()->create([
            'project_id' => $project->id,
            'title' => '完了タスク（最早期日）',
            'task_type' => TaskType::Task,
            'priority' => TaskPriority::Medium,
            'status' => TaskStatus::Closed,
            'progress_rate' => 100,
            'due_date' => '2026-01-01',
            'assignee_id' => $member->id,
            'reviewer_id' => $manager->id,
            'created_by' => $member->id,
        ]);

        ProjectWorkItem::query()->create([
            'project_id' => $project->id,
            'title' => '未完了タスク',
            'task_type' => TaskType::Task,
            'priority' => TaskPriority::Medium,
            'status' => TaskStatus::Open,
            'progress_rate' => 0,
            'due_date' => '2026-06-15',
            'assignee_id' => $member->id,
            'reviewer_id' => $manager->id,
            'created_by' => $member->id,
        ]);

        $response = $this->actingAs($manager)->get(
            route('projects.index', ['tab' => 'dev'], absolute: false),
        );

        $response->assertOk();
        $projects = $response->viewData('page')['props']['projects']['data'];
        $row = collect($projects)->firstWhere('id', $project->id);
        $this->assertNotNull($row);
        $this->assertSame('2026-06-15', $row['nearestTaskDueDate']);
    }

    public function test_dev_tab_nearest_due_date_is_null_when_only_closed_tasks_have_dates(): void
    {
        $dept = Department::query()->where('name', '開発1部')->firstOrFail();
        $manager = User::factory()->create(['department_id' => $dept->id]);
        $manager->assignRole(Role::DeptManager->value);

        $member = User::factory()->create(['department_id' => $dept->id]);
        $member->assignRole(Role::Applicant->value);

        $project = Project::query()->create([
            'title' => '完了のみ',
            'applicant_id' => $member->id,
            'department_id' => $dept->id,
            'primary_assignee_id' => $member->id,
            'status' => ProjectStatus::Approved,
            'estimated_amount' => 50_000,
            'budget_amount' => 50_000,
            'revision' => 1,
        ]);

        ProjectWorkItem::query()->create([
            'project_id' => $project->id,
            'title' => '完了タスクのみ',
            'task_type' => TaskType::Task,
            'priority' => TaskPriority::Medium,
            'status' => TaskStatus::Closed,
            'progress_rate' => 100,
            'due_date' => '2026-03-01',
            'assignee_id' => $member->id,
            'reviewer_id' => $manager->id,
            'created_by' => $member->id,
        ]);

        $response = $this->actingAs($manager)->get(
            route('projects.index', ['tab' => 'dev'], absolute: false),
        );

        $response->assertOk();
        $projects = $response->viewData('page')['props']['projects']['data'];
        $row = collect($projects)->firstWhere('id', $project->id);
        $this->assertNotNull($row);
        $this->assertNull($row['nearestTaskDueDate']);
    }
}
