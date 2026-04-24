<?php

namespace Tests\Feature;

use App\Enums\ProjectStatus;
use App\Models\Department;
use App\Models\Project;
use App\Models\User;
use Database\Seeders\DepartmentSeeder;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProjectResubmitChainTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed([DepartmentSeeder::class, RolePermissionSeeder::class]);
    }

    public function test_resubmit_after_rejection_creates_child_project(): void
    {
        $dept = Department::query()->where('name', '開発1部')->firstOrFail();
        $applicant = User::factory()->create(['department_id' => $dept->id]);
        $applicant->assignRole('applicant');

        $project = Project::query()->create([
            'title' => '再申請チェイン検証',
            'applicant_id' => $applicant->id,
            'department_id' => $dept->id,
            'status' => ProjectStatus::Rejected,
            'estimated_amount' => 1000,
            'revision' => 1,
            'rejected_at' => now(),
        ]);

        $this->actingAs($applicant)->post(
            route('projects.submit', $project, absolute: false),
        );

        $child = Project::query()->where('parent_project_id', $project->id)->first();
        $this->assertNotNull($child);
        $this->assertSame(2, $child->revision);
        $this->assertSame(ProjectStatus::PendingDept->value, $child->status->value);
        $this->assertSame(ProjectStatus::Rejected->value, $project->fresh()->status->value);
    }

    public function test_resubmit_by_dept_manager_applicant_goes_to_pending_hq(): void
    {
        $dept = Department::query()->where('name', '開発1部')->firstOrFail();
        $user = User::factory()->create(['department_id' => $dept->id]);
        $user->assignRole('applicant');
        $user->assignRole('dept_manager');

        $project = Project::query()->create([
            'title' => '本部直行検証',
            'applicant_id' => $user->id,
            'department_id' => $dept->id,
            'status' => ProjectStatus::Rejected,
            'estimated_amount' => 2000,
            'revision' => 1,
            'rejected_at' => now(),
        ]);

        $this->actingAs($user)->post(
            route('projects.submit', $project, absolute: false),
        );

        $child = Project::query()->where('parent_project_id', $project->id)->first();
        $this->assertNotNull($child);
        $this->assertSame(ProjectStatus::PendingHq->value, $child->status->value);
    }
}
