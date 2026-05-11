<?php

namespace App\Services;

use App\Models\Project;
use App\Models\ProjectAttachment;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ProjectAttachmentService
{
    private const DISK = 'local';

    /**
     * @param  array<int, UploadedFile|null>  $files
     */
    public function storeMany(Project $project, User $user, array $files): void
    {
        $directory = 'project_attachments/'.$project->id;

        foreach ($files as $file) {
            if (! $file instanceof UploadedFile || ! $file->isValid()) {
                continue;
            }

            $ext = $file->getClientOriginalExtension();
            $basename = Str::uuid()->toString();
            $safeName = $ext !== '' ? "{$basename}.{$ext}" : $basename;
            $path = $file->storeAs($directory, $safeName, self::DISK);

            ProjectAttachment::query()->create([
                'project_id' => $project->id,
                'original_filename' => $file->getClientOriginalName(),
                'stored_path' => $path,
                'mime_type' => $file->getClientMimeType() ?? 'application/octet-stream',
                'size_bytes' => (int) ($file->getSize() ?: 0),
                'uploaded_by' => $user->id,
            ]);
        }
    }

    public function deleteRecord(ProjectAttachment $attachment): void
    {
        if (Storage::disk(self::DISK)->exists($attachment->stored_path)) {
            Storage::disk(self::DISK)->delete($attachment->stored_path);
        }

        $attachment->delete();
    }
}
