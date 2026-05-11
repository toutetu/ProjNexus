<?php

namespace Tests\Feature;

use App\Enums\ProjectStatus;
use App\Models\Department;
use App\Models\Project;
use App\Models\ProjectAttachment;
use App\Models\User;
use Database\Seeders\DepartmentSeeder;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class ProjectAttachmentTest extends TestCase
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

    private function applicantInDev2(): User
    {
        $dept = Department::query()->where('name', '開発2部')->firstOrFail();
        $user = User::factory()->create(['department_id' => $dept->id]);
        $user->assignRole('applicant');

        return $user;
    }

    public function test_applicant_can_store_draft_with_pdf_attachment(): void
    {
        Storage::fake('local');
        $user = $this->applicantInDev1();
        $dept = Department::query()->where('name', '開発1部')->firstOrFail();
        $file = UploadedFile::fake()->create('spec.pdf', 100, 'application/pdf');

        $response = $this->actingAs($user)->post(route('projects.store'), [
            'title' => '添付付き下書き',
            'department_id' => (string) $dept->id,
            'purpose' => '検証用',
            'description' => '',
            'estimated_amount' => '0',
            'estimated_days' => '',
            'submit_action' => 'draft',
            'attachments' => [$file],
        ]);

        $response->assertRedirect(route('projects.index', ['tab' => 'approval'], false));
        $project = Project::query()->where('title', '添付付き下書き')->firstOrFail();
        $this->assertDatabaseHas('project_attachments', [
            'project_id' => $project->id,
            'original_filename' => 'spec.pdf',
            'uploaded_by' => $user->id,
        ]);
        $attachment = ProjectAttachment::query()->where('project_id', $project->id)->firstOrFail();
        Storage::disk('local')->assertExists($attachment->stored_path);
    }

    public function test_other_applicant_cannot_download_attachment(): void
    {
        Storage::fake('local');
        $owner = $this->applicantInDev1();
        $other = $this->applicantInDev2();
        $dept = Department::query()->where('name', '開発1部')->firstOrFail();

        $project = Project::query()->create([
            'title' => '他者DL禁止',
            'applicant_id' => $owner->id,
            'department_id' => $dept->id,
            'status' => ProjectStatus::Draft,
            'estimated_amount' => 0,
            'revision' => 1,
        ]);

        $path = 'project_attachments/'.$project->id.'/test.pdf';
        Storage::disk('local')->put($path, 'x');
        $attachment = ProjectAttachment::query()->create([
            'project_id' => $project->id,
            'original_filename' => 'secret.pdf',
            'stored_path' => $path,
            'mime_type' => 'application/pdf',
            'size_bytes' => 1,
            'uploaded_by' => $owner->id,
        ]);

        $this->actingAs($other)->get(route('project-attachments.download', $attachment, false))
            ->assertForbidden();
    }
}
