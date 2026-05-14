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

class ProjectDraftDeleteTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed([DepartmentSeeder::class, RolePermissionSeeder::class]);
    }

    private function applicantInDev1(): User
    {
        $dept = Department::query()->where('name', '開発1部')->firstOrFail();
        $user = User::factory()->create(['department_id' => $dept->id]);
        $user->assignRole('applicant');

        return $user;
    }

    public function test_applicant_can_delete_own_draft(): void
    {
        $applicant = $this->applicantInDev1();
        $dept = Department::query()->where('name', '開発1部')->firstOrFail();

        $draft = Project::query()->create([
            'title' => '削除対象下書き',
            'applicant_id' => $applicant->id,
            'department_id' => $dept->id,
            'status' => ProjectStatus::Draft,
            'estimated_amount' => 0,
            'revision' => 1,
        ]);

        $response = $this->actingAs($applicant)->delete(
            route('projects.destroy', $draft, absolute: false),
        );

        $response->assertRedirect(route('projects.index', ['tab' => 'approval'], absolute: false));
        $response->assertSessionHas('success');
        $this->assertDatabaseMissing('projects', ['id' => $draft->id]);
    }

    public function test_applicant_cannot_delete_rejected_project(): void
    {
        $applicant = $this->applicantInDev1();
        $dept = Department::query()->where('name', '開発1部')->firstOrFail();

        $rejected = Project::query()->create([
            'title' => '却下済み案件',
            'applicant_id' => $applicant->id,
            'department_id' => $dept->id,
            'status' => ProjectStatus::Rejected,
            'estimated_amount' => 1000,
            'revision' => 1,
            'rejected_at' => now(),
        ]);

        $response = $this->actingAs($applicant)->delete(
            route('projects.destroy', $rejected, absolute: false),
        );

        $response->assertForbidden();
        $this->assertDatabaseHas('projects', ['id' => $rejected->id]);
    }

    public function test_other_user_cannot_delete_applicant_draft(): void
    {
        $owner = $this->applicantInDev1();
        $other = $this->applicantInDev1();
        $dept = Department::query()->where('name', '開発1部')->firstOrFail();

        $draft = Project::query()->create([
            'title' => '他人の下書き',
            'applicant_id' => $owner->id,
            'department_id' => $dept->id,
            'status' => ProjectStatus::Draft,
            'estimated_amount' => 0,
            'revision' => 1,
        ]);

        $response = $this->actingAs($other)->delete(
            route('projects.destroy', $draft, absolute: false),
        );

        $response->assertForbidden();
        $this->assertDatabaseHas('projects', ['id' => $draft->id]);
    }

    public function test_applicant_cannot_delete_draft_that_has_child_project(): void
    {
        $applicant = $this->applicantInDev1();
        $dept = Department::query()->where('name', '開発1部')->firstOrFail();

        $parentDraft = Project::query()->create([
            'title' => '子を持つ下書き',
            'applicant_id' => $applicant->id,
            'department_id' => $dept->id,
            'status' => ProjectStatus::Draft,
            'estimated_amount' => 0,
            'revision' => 1,
        ]);

        Project::query()->create([
            'title' => '子案件',
            'parent_project_id' => $parentDraft->id,
            'applicant_id' => $applicant->id,
            'department_id' => $dept->id,
            'status' => ProjectStatus::Draft,
            'estimated_amount' => 0,
            'revision' => 2,
        ]);

        $response = $this->actingAs($applicant)->delete(
            route('projects.destroy', $parentDraft, absolute: false),
        );

        $response->assertForbidden();
        $this->assertDatabaseHas('projects', ['id' => $parentDraft->id]);
    }
}
