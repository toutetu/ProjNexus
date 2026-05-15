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

class MemberTasksFilterTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed([DepartmentSeeder::class, RolePermissionSeeder::class]);
    }

    public function test_members_view_shows_only_selected_assignee_row(): void
    {
        $dept = Department::query()->where('name', '開発1部')->firstOrFail();
        $manager = User::factory()->create(['department_id' => $dept->id]);
        $manager->assignRole(Role::DeptManager->value);

        $memberA = User::factory()->create(['department_id' => $dept->id, 'name' => 'メンバーA']);
        $memberA->assignRole(Role::Applicant->value);
        $memberB = User::factory()->create(['department_id' => $dept->id, 'name' => 'メンバーB']);
        $memberB->assignRole(Role::Applicant->value);

        $project = Project::query()->create([
            'title' => 'フィルタ検証',
            'applicant_id' => $memberA->id,
            'department_id' => $dept->id,
            'primary_assignee_id' => $memberA->id,
            'status' => ProjectStatus::Approved,
            'estimated_amount' => 100_000,
            'budget_amount' => 100_000,
            'revision' => 1,
        ]);

        ProjectWorkItem::query()->create([
            'project_id' => $project->id,
            'title' => 'Aのタスク',
            'task_type' => TaskType::Task,
            'priority' => TaskPriority::Medium,
            'status' => TaskStatus::Open,
            'progress_rate' => 0,
            'assignee_id' => $memberA->id,
            'reviewer_id' => $manager->id,
            'created_by' => $memberA->id,
        ]);

        $response = $this->actingAs($manager)->get(route('member-tasks.index', [
            'view' => 'members',
            'department_id' => $dept->id,
            'assignee_id' => $memberA->id,
        ], absolute: false));

        $response->assertOk();
        $props = $response->viewData('page')['props'];
        $this->assertSame(1, $props['memberCount']);
        $this->assertCount(1, $props['matrixMembers']);
        $this->assertSame($memberA->id, $props['matrixMembers'][0]['user']['id']);
    }

    public function test_task_type_filter_limits_tasks(): void
    {
        $dept = Department::query()->where('name', '開発1部')->firstOrFail();
        $manager = User::factory()->create(['department_id' => $dept->id]);
        $manager->assignRole(Role::DeptManager->value);

        $member = User::factory()->create(['department_id' => $dept->id]);
        $member->assignRole(Role::Applicant->value);

        $project = Project::query()->create([
            'title' => '種類フィルタ',
            'applicant_id' => $member->id,
            'department_id' => $dept->id,
            'primary_assignee_id' => $member->id,
            'status' => ProjectStatus::Approved,
            'estimated_amount' => 50_000,
            'budget_amount' => 50_000,
            'revision' => 1,
        ]);

        $bug = ProjectWorkItem::query()->create([
            'project_id' => $project->id,
            'title' => 'バグ対応',
            'task_type' => TaskType::Bug,
            'priority' => TaskPriority::High,
            'status' => TaskStatus::Open,
            'progress_rate' => 0,
            'assignee_id' => $member->id,
            'reviewer_id' => $manager->id,
            'created_by' => $member->id,
        ]);

        ProjectWorkItem::query()->create([
            'project_id' => $project->id,
            'title' => '通常タスク',
            'task_type' => TaskType::Task,
            'priority' => TaskPriority::Medium,
            'status' => TaskStatus::Open,
            'progress_rate' => 0,
            'assignee_id' => $member->id,
            'reviewer_id' => $manager->id,
            'created_by' => $member->id,
        ]);

        $response = $this->actingAs($manager)->get(route('member-tasks.index', [
            'view' => 'board',
            'department_id' => $dept->id,
            'task_type' => TaskType::Bug->value,
        ], absolute: false));

        $response->assertOk();
        $ids = collect($response->viewData('page')['props']['tasks'])->pluck('id')->all();
        $this->assertSame([$bug->id], $ids);
    }

    public function test_due_date_filter_matches_exact_date(): void
    {
        $dept = Department::query()->where('name', '開発1部')->firstOrFail();
        $manager = User::factory()->create(['department_id' => $dept->id]);
        $manager->assignRole(Role::DeptManager->value);

        $member = User::factory()->create(['department_id' => $dept->id]);
        $member->assignRole(Role::Applicant->value);

        $project = Project::query()->create([
            'title' => '期日指定',
            'applicant_id' => $member->id,
            'department_id' => $dept->id,
            'primary_assignee_id' => $member->id,
            'status' => ProjectStatus::Approved,
            'estimated_amount' => 50_000,
            'budget_amount' => 50_000,
            'revision' => 1,
        ]);

        $target = ProjectWorkItem::query()->create([
            'project_id' => $project->id,
            'title' => '指定期日',
            'task_type' => TaskType::Task,
            'priority' => TaskPriority::Medium,
            'status' => TaskStatus::Open,
            'progress_rate' => 0,
            'assignee_id' => $member->id,
            'reviewer_id' => $manager->id,
            'due_date' => '2026-05-20',
            'created_by' => $member->id,
        ]);

        ProjectWorkItem::query()->create([
            'project_id' => $project->id,
            'title' => '別日',
            'task_type' => TaskType::Task,
            'priority' => TaskPriority::Medium,
            'status' => TaskStatus::Open,
            'progress_rate' => 0,
            'assignee_id' => $member->id,
            'reviewer_id' => $manager->id,
            'due_date' => '2026-05-21',
            'created_by' => $member->id,
        ]);

        $response = $this->actingAs($manager)->get(route('member-tasks.index', [
            'view' => 'board',
            'department_id' => $dept->id,
            'due' => 'date',
            'due_date' => '2026-05-20',
        ], absolute: false));

        $response->assertOk();
        $ids = collect($response->viewData('page')['props']['tasks'])->pluck('id')->all();
        $this->assertSame([$target->id], $ids);
    }
}
