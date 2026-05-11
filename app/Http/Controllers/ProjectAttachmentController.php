<?php

namespace App\Http\Controllers;

use App\Models\ProjectAttachment;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ProjectAttachmentController extends Controller
{
    public function download(ProjectAttachment $projectAttachment): StreamedResponse
    {
        $this->authorize('view', $projectAttachment);

        return Storage::disk('local')->download(
            $projectAttachment->stored_path,
            $projectAttachment->original_filename,
            ['Content-Type' => $projectAttachment->mime_type ?? 'application/octet-stream'],
        );
    }
}
