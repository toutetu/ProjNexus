<?php

namespace App\Policies;

use App\Enums\ProjectStatus;
use App\Enums\Role;
use App\Models\Project;
use App\Models\ProjectWorkItem;
use App\Models\User;

class ProjectWorkItemPolicy
{
    public function view(User $user, ProjectWorkItem $task): bool
    {
        return $this->canAccessProject($user, $task->project);
    }

    public function create(User $user, Project $project): bool
    {
        return $project->status === ProjectStatus::Approved
            && $this->canAccessProject($user, $project);
    }

    public function update(User $user, ProjectWorkItem $task): bool
    {
        return $task->project?->status === ProjectStatus::Approved
            && $this->canAccessProject($user, $task->project);
    }

    public function delete(User $user, ProjectWorkItem $task): bool
    {
        return $this->update($user, $task);
    }

    private function canAccessProject(User $user, ?Project $project): bool
    {
        if ($project === null) {
            return false;
        }

        if ($user->hasRole(Role::HqManager->value)) {
            return true;
        }

        if ($user->hasRole(Role::DeptManager->value)) {
            return $project->department_id === $user->department_id;
        }

        return $project->primary_assignee_id === $user->id;
    }
}
