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

class ApplicantMemberTasksDeptScopeTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed([DepartmentSeeder::class, RolePermissionSeeder::class]);
    }

    public function test_pure_applicant_board_lists_tasks_in_same_department_approved_projects_without_being_assignee(): void
    {
        $dept = Department::query()->where('name', '開発1部')->firstOrFail();

        $peer = User::factory()->create(['department_id' => $dept->id, 'name' => '同部門 主担当']);
        $peer->assignRole('applicant');

        $viewer = User::factory()->create(['department_id' => $dept->id, 'name' => '閲覧のみ申請者']);
        $viewer->assignRole('applicant');

        $assignee = User::factory()->create(['department_id' => $dept->id, 'name' => '実タスク担当']);
        $assignee->assignRole('applicant');

        $project = Project::query()->create([
            'title' => '他者主担当の承認済案件',
            'applicant_id' => $peer->id,
            'department_id' => $dept->id,
            'primary_assignee_id' => $peer->id,
            'status' => ProjectStatus::Approved,
            'estimated_amount' => 100_000,
            'budget_amount' => 100_000,
            'revision' => 1,
        ]);

        $task = ProjectWorkItem::query()->create([
            'project_id' => $project->id,
            'title' => 'viewer は担当外',
            'task_type' => TaskType::Task,
            'priority' => TaskPriority::Medium,
            'status' => TaskStatus::Open,
            'progress_rate' => 0,
            'assignee_id' => $assignee->id,
            'reviewer_id' => $peer->id,
            'created_by' => $peer->id,
        ]);

        $response = $this->actingAs($viewer)->get(route('member-tasks.index', [
            'view' => 'board',
            'department_id' => $dept->id,
        ], absolute: false));

        $response->assertOk();
        $ids = collect($response->viewData('page')['props']['tasks'] ?? [])->pluck('id')->all();
        $this->assertContains($task->id, $ids);

        $row = collect($response->viewData('page')['props']['tasks'])->firstWhere('id', $task->id);
        $this->assertNotNull($row);
        $this->assertFalse($row['canUpdate']);
    }

    public function test_pure_applicant_cannot_see_other_department_tasks_on_board(): void
    {
        $dept1 = Department::query()->where('name', '開発1部')->firstOrFail();
        $dept2 = Department::query()->where('name', '開発2部')->firstOrFail();

        $viewer = User::factory()->create(['department_id' => $dept1->id]);
        $viewer->assignRole('applicant');

        $other = User::factory()->create(['department_id' => $dept2->id]);
        $other->assignRole('applicant');

        $project = Project::query()->create([
            'title' => '開発2部の承認済',
            'applicant_id' => $other->id,
            'department_id' => $dept2->id,
            'primary_assignee_id' => $other->id,
            'status' => ProjectStatus::Approved,
            'estimated_amount' => 50_000,
            'budget_amount' => 50_000,
            'revision' => 1,
        ]);

        $task = ProjectWorkItem::query()->create([
            'project_id' => $project->id,
            'title' => '2部タスク',
            'task_type' => TaskType::Task,
            'priority' => TaskPriority::Low,
            'status' => TaskStatus::Open,
            'progress_rate' => 0,
            'assignee_id' => $other->id,
            'reviewer_id' => $other->id,
            'created_by' => $other->id,
        ]);

        $response = $this->actingAs($viewer)->get(route('member-tasks.index', [
            'view' => 'board',
            'department_id' => $dept1->id,
        ], absolute: false));

        $response->assertOk();
        $ids = collect($response->viewData('page')['props']['tasks'] ?? [])->pluck('id')->all();
        $this->assertNotContains($task->id, $ids);
    }
}
