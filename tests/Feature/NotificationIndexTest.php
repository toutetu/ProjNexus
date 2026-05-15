<?php

namespace Tests\Feature;

use App\Enums\NotificationType;
use App\Enums\ProjectStatus;
use App\Models\Department;
use App\Models\Notification;
use App\Models\Project;
use App\Models\ProjectWorkItem;
use App\Models\User;
use App\Support\NotificationActionUrl;
use Database\Seeders\DepartmentSeeder;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class NotificationIndexTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed([DepartmentSeeder::class, RolePermissionSeeder::class]);
    }

    public function test_task_resolved_notification_shows_project_and_task_links(): void
    {
        $dept = Department::query()->where('name', '開発1部')->firstOrFail();
        $reviewer = User::factory()->create(['department_id' => $dept->id]);
        $reviewer->assignRole('applicant');

        $project = Project::query()->create([
            'title' => '確認依頼検証',
            'applicant_id' => $reviewer->id,
            'department_id' => $dept->id,
            'primary_assignee_id' => $reviewer->id,
            'status' => ProjectStatus::Approved,
            'estimated_amount' => 10000,
            'revision' => 1,
        ]);

        $task = ProjectWorkItem::query()->create([
            'project_id' => $project->id,
            'title' => '確認待ちタスク',
            'created_by' => $reviewer->id,
            'reviewer_id' => $reviewer->id,
        ]);

        Notification::query()->create([
            'user_id' => $reviewer->id,
            'type' => NotificationType::TaskResolved,
            'title' => 'タスクの確認依頼があります',
            'body' => 'テスト',
            'meta' => [
                'project_id' => $project->id,
                'task_id' => $task->id,
            ],
        ]);

        $actions = NotificationActionUrl::resolveActions(
            $reviewer,
            NotificationType::TaskResolved,
            ['project_id' => $project->id, 'task_id' => $task->id],
        );

        $this->assertNotNull($actions['project']);
        $this->assertSame('案件を開く', $actions['project']['label']);
        $this->assertStringContainsString('detailTab=tasks', $actions['project']['href']);
        $this->assertStringNotContainsString('taskId=', $actions['project']['href']);

        $this->assertNotNull($actions['task']);
        $this->assertSame('タスクを開く', $actions['task']['label']);
        $this->assertStringContainsString('taskId='.$task->id, $actions['task']['href']);

        $this->actingAs($reviewer)
            ->get(route('notifications.index', absolute: false))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Notifications/Index')
                ->has('notifications.data', 1)
                ->where('notifications.data.0.projectActionLabel', '案件を開く')
                ->where('notifications.data.0.taskActionLabel', 'タスクを開く')
                ->where('notifications.data.0.projectActionHref', $actions['project']['href'])
                ->where('notifications.data.0.taskActionHref', $actions['task']['href']));
    }

    public function test_cross_department_notification_has_no_action_links(): void
    {
        $dept1 = Department::query()->where('name', '開発1部')->firstOrFail();
        $dept2 = Department::query()->where('name', '開発2部')->firstOrFail();

        $viewer = User::factory()->create(['department_id' => $dept1->id]);
        $viewer->assignRole('applicant');

        $otherApplicant = User::factory()->create(['department_id' => $dept2->id]);
        $otherApplicant->assignRole('applicant');

        $foreignProject = Project::query()->create([
            'title' => '他部門案件',
            'applicant_id' => $otherApplicant->id,
            'department_id' => $dept2->id,
            'primary_assignee_id' => $otherApplicant->id,
            'status' => ProjectStatus::Approved,
            'estimated_amount' => 10000,
            'revision' => 1,
        ]);

        Notification::query()->create([
            'user_id' => $viewer->id,
            'type' => NotificationType::TaskAssigned,
            'title' => 'タスクが割り当てられました',
            'body' => 'テスト',
            'meta' => [
                'project_id' => $foreignProject->id,
            ],
        ]);

        $this->actingAs($viewer)
            ->get(route('notifications.index', absolute: false))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Notifications/Index')
                ->has('notifications.data', 1)
                ->where('notifications.data.0.projectActionHref', null)
                ->where('notifications.data.0.taskActionHref', null));
    }
}
