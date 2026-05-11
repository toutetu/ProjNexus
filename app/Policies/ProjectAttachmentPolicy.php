<?php

namespace App\Policies;

use App\Models\ProjectAttachment;
use App\Models\User;

class ProjectAttachmentPolicy
{
    public function view(User $user, ProjectAttachment $attachment): bool
    {
        return $user->can('view', $attachment->project);
    }

    public function delete(User $user, ProjectAttachment $attachment): bool
    {
        return $user->can('update', $attachment->project);
    }
}
