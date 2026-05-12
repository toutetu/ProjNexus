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
        $project = $task->project;
        if ($project === null) {
            return false;
        }

        if ($project->status === ProjectStatus::Draft && $project->applicant_id !== $user->id) {
            return false;
        }

        if ($user->hasRole(Role::HqManager->value)) {
            return true;
        }

        if ($user->hasRole(Role::DeptManager->value)) {
            return $project->department_id === $user->department_id;
        }

        if ($user->hasRole(Role::Applicant->value)) {
            if ($project->applicant_id === $user->id || $project->primary_assignee_id === $user->id) {
                return true;
            }

            return $project->status === ProjectStatus::Approved
                && $user->department_id !== null
                && $project->department_id === $user->department_id;
        }

        return false;
    }

    public function create(User $user, Project $project): bool
    {
        if ($user->hasRole(Role::HqManager->value)) {
            return false;
        }

        return $project->status === ProjectStatus::Approved
            && $this->canAccessProject($user, $project);
    }

    public function update(User $user, ProjectWorkItem $task): bool
    {
        $project = $task->project;

        return $project?->status === ProjectStatus::Approved
            && $this->canEditTaskContent($user, $task, $project);
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

    private function canEditTaskContent(User $user, ProjectWorkItem $task, Project $project): bool
    {
        if ($user->hasRole(Role::HqManager->value)) {
            return false;
        }

        if ($user->hasRole(Role::DeptManager->value)) {
            return $project->department_id === $user->department_id;
        }

        if ($user->hasRole(Role::Applicant->value)) {
            if ($project->department_id !== $user->department_id) {
                return false;
            }

            return $project->primary_assignee_id === $user->id
                || $task->assignee_id === $user->id
                || $task->reviewer_id === $user->id;
        }

        return false;
    }
}
