<?php

namespace App\Policies;

use App\Enums\ProjectStatus;
use App\Enums\Role;
use App\Models\Project;
use App\Models\User;

class ProjectPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasAnyRole(Role::values());
    }

    public function view(User $user, Project $project): bool
    {
        if ($user->hasRole(Role::HqManager->value)) {
            return true;
        }

        if ($user->hasRole(Role::DeptManager->value)) {
            return $project->department_id === $user->department_id;
        }

        return $project->applicant_id === $user->id
            || $project->primary_assignee_id === $user->id;
    }

    public function create(User $user): bool
    {
        return ! $user->hasRole(Role::HqManager->value);
    }

    public function update(User $user, Project $project): bool
    {
        if (! $this->view($user, $project)) {
            return false;
        }

        // Phase 2: 承認済案件は編集ロックする土台だけ先に固定。
        if ($project->status === ProjectStatus::Approved) {
            return false;
        }

        return $project->applicant_id === $user->id;
    }

    public function delete(User $user, Project $project): bool
    {
        return $project->applicant_id === $user->id
            && in_array($project->status, [ProjectStatus::Draft, ProjectStatus::Rejected], true);
    }
}
