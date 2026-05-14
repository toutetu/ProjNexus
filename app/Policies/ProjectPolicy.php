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
        // 下書きは申請者本人のみ閲覧可能
        if ($project->status === ProjectStatus::Draft && $project->applicant_id !== $user->id) {
            return false;
        }

        if ($user->hasRole(Role::HqManager->value)) {
            return true;
        }

        if ($user->hasRole(Role::DeptManager->value)) {
            return $project->department_id === $user->department_id;
        }

        if ($project->applicant_id === $user->id || $project->primary_assignee_id === $user->id) {
            return true;
        }

        return $user->hasRole(Role::Applicant->value)
            && $project->status === ProjectStatus::Approved
            && $user->department_id !== null
            && $project->department_id === $user->department_id;
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

        if ($project->applicant_id !== $user->id) {
            return false;
        }

        if (! in_array($project->status, [ProjectStatus::Draft, ProjectStatus::Rejected], true)) {
            return false;
        }

        if ($project->status === ProjectStatus::Rejected && $project->childProjects()->exists()) {
            return false;
        }

        return true;
    }

    public function delete(User $user, Project $project): bool
    {
        if ($project->applicant_id !== $user->id) {
            return false;
        }

        if ($project->status !== ProjectStatus::Draft) {
            return false;
        }

        return ! $project->childProjects()->exists();
    }
}
