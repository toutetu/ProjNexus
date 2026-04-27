<?php

namespace Tests\Feature;

use App\Enums\ProjectStatus;
use App\Enums\NotificationType;
use App\Models\Department;
use App\Models\Project;
use App\Models\User;
use Database\Seeders\DepartmentSeeder;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProjectApprovalFlowTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed([DepartmentSeeder::class, RolePermissionSeeder::class]);
    }

    private function applicantUser(): User
    {
        $dept = Department::query()->where('name', '開発1部')->firstOrFail();
        $user = User::factory()->create(['department_id' => $dept->id]);
        $user->assignRole('applicant');

        return $user;
    }

    private function deptManagerUser(): User
    {
        $dept = Department::query()->where('name', '開発1部')->firstOrFail();
        $user = User::factory()->create(['department_id' => $dept->id]);
        $user->assignRole('dept_manager');

        return $user;
    }

    private function hqManagerUser(): User
    {
        $user = User::factory()->create(['department_id' => null]);
        $user->assignRole('hq_manager');

        return $user;
    }

    public function test_dept_manager_can_approve_pending_dept_project(): void
    {
        $applicant = $this->applicantUser();
        $manager = $this->deptManagerUser();
        $hqManager = $this->hqManagerUser();
        $dept = Department::query()->where('name', '開発1部')->firstOrFail();

        $project = Project::query()->create([
            'title' => '承認フロー検証',
            'applicant_id' => $applicant->id,
            'department_id' => $dept->id,
            'status' => ProjectStatus::PendingDept,
            'estimated_amount' => 10000,
            'revision' => 1,
        ]);

        $response = $this->actingAs($manager)->post(
            route('projects.approve', $project, absolute: false),
            ['level' => 'dept', 'comment' => '承認します'],
        );

        $response->assertRedirect(
            route('projects.index', ['tab' => 'approval', 'filter' => 'pending'], absolute: false),
        );
        $this->assertSame(ProjectStatus::PendingHq->value, $project->fresh()->status->value);
        $this->assertDatabaseHas('notifications', [
            'user_id' => $hqManager->id,
            'type' => NotificationType::ProjectSubmitted->value,
            'title' => '承認依頼が届いています',
        ]);
    }

    public function test_applicant_cannot_approve_project(): void
    {
        $applicant = $this->applicantUser();
        $dept = Department::query()->where('name', '開発1部')->firstOrFail();

        $project = Project::query()->create([
            'title' => '権限境界検証',
            'applicant_id' => $applicant->id,
            'department_id' => $dept->id,
            'status' => ProjectStatus::PendingDept,
            'estimated_amount' => 5000,
            'revision' => 1,
        ]);

        $response = $this->actingAs($applicant)->post(
            route('projects.approve', $project, absolute: false),
            ['level' => 'dept', 'comment' => ''],
        );

        $response->assertRedirect(
            route('projects.index', ['tab' => 'approval', 'filter' => 'pending'], absolute: false),
        );
        $response->assertSessionHas('error');
        $this->assertSame(ProjectStatus::PendingDept->value, $project->fresh()->status->value);
    }

    public function test_submit_notifies_dept_manager_in_same_department(): void
    {
        $applicant = $this->applicantUser();
        $manager = $this->deptManagerUser();
        $dept = Department::query()->where('name', '開発1部')->firstOrFail();

        $response = $this->actingAs($applicant)->post(
            route('projects.store', absolute: false),
            [
                'title' => '通知配信テスト',
                'department_id' => $dept->id,
                'purpose' => '通知確認',
                'description' => '申請時の通知先を検証',
                'estimated_amount' => 10000,
                'estimated_days' => 3,
                'submit_action' => 'submit',
            ],
        );

        $response->assertRedirect(route('projects.index', ['tab' => 'approval'], absolute: false));

        $project = Project::query()->latest('id')->firstOrFail();
        $this->assertSame(ProjectStatus::PendingDept->value, $project->status->value);

        $this->assertDatabaseHas('notifications', [
            'user_id' => $manager->id,
            'type' => NotificationType::ProjectSubmitted->value,
            'title' => '承認依頼が届いています',
        ]);

        $this->assertDatabaseHas('notifications', [
            'user_id' => $applicant->id,
            'type' => NotificationType::ProjectSubmitted->value,
            'title' => '申請を受け付けました',
        ]);

        $applicantNotification = \App\Models\Notification::query()
            ->where('user_id', $applicant->id)
            ->where('type', NotificationType::ProjectSubmitted)
            ->where('title', '申請を受け付けました')
            ->latest('id')
            ->first();
        $this->assertNotNull($applicantNotification);
        $this->assertNotNull($applicantNotification->read_at);
    }

    public function test_applicant_can_take_back_pending_dept_to_draft(): void
    {
        $applicant = $this->applicantUser();
        $dept = Department::query()->where('name', '開発1部')->firstOrFail();

        $project = Project::query()->create([
            'title' => '申請取り戻しテスト',
            'applicant_id' => $applicant->id,
            'department_id' => $dept->id,
            'status' => ProjectStatus::PendingDept,
            'estimated_amount' => 12000,
            'submitted_at' => now(),
            'revision' => 1,
        ]);

        $response = $this->actingAs($applicant)->post(
            route('projects.takeBack', $project, absolute: false),
        );

        $response->assertRedirect(route('projects.index', ['tab' => 'approval'], absolute: false));

        $project->refresh();
        $this->assertSame(ProjectStatus::Draft->value, $project->status->value);
        $this->assertNull($project->submitted_at);
    }

    public function test_dept_manager_applicant_can_take_back_pending_hq_direct_to_draft(): void
    {
        $managerApplicant = $this->deptManagerUser();
        $dept = Department::query()->where('name', '開発1部')->firstOrFail();

        $project = Project::query()->create([
            'title' => '本部直行取り戻しテスト',
            'applicant_id' => $managerApplicant->id,
            'department_id' => $dept->id,
            'status' => ProjectStatus::PendingHq,
            'estimated_amount' => 15000,
            'submitted_at' => now(),
            'revision' => 1,
        ]);

        $response = $this->actingAs($managerApplicant)->post(
            route('projects.takeBack', $project, absolute: false),
        );

        $response->assertRedirect(route('projects.index', ['tab' => 'approval'], absolute: false));

        $project->refresh();
        $this->assertSame(ProjectStatus::Draft->value, $project->status->value);
        $this->assertNull($project->submitted_at);
    }

    public function test_hq_reject_notifies_dept_manager_who_approved(): void
    {
        $applicant = $this->applicantUser();
        $deptManager = $this->deptManagerUser();
        $hqManager = $this->hqManagerUser();
        $dept = Department::query()->where('name', '開発1部')->firstOrFail();

        $project = Project::query()->create([
            'title' => '本部却下通知テスト',
            'applicant_id' => $applicant->id,
            'department_id' => $dept->id,
            'status' => ProjectStatus::PendingDept,
            'estimated_amount' => 30000,
            'submitted_at' => now(),
            'revision' => 1,
        ]);

        $this->actingAs($deptManager)->post(
            route('projects.approve', $project, absolute: false),
            ['level' => 'dept', 'comment' => '部門承認'],
        );

        $response = $this->actingAs($hqManager)->post(
            route('projects.reject', $project, absolute: false),
            ['level' => 'hq', 'comment' => '本部却下'],
        );

        $response->assertRedirect(route('projects.index', ['tab' => 'approval'], absolute: false));

        $project->refresh();
        $this->assertSame(ProjectStatus::Rejected->value, $project->status->value);
        $this->assertDatabaseHas('notifications', [
            'user_id' => $deptManager->id,
            'type' => NotificationType::ProjectRejected->value,
            'title' => '本部で案件が却下されました',
        ]);
    }
}
