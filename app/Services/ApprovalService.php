<?php

namespace App\Services;

use App\Enums\ApprovalAction;
use App\Enums\ApprovalLevel;
use App\Enums\NotificationType;
use App\Enums\ProjectStatus;
use App\Enums\Role;
use App\Models\Project;
use App\Models\User;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class ApprovalService
{
    public function __construct(private readonly NotificationService $notificationService)
    {
    }

    public function submit(Project $project, User $actor): Project
    {
        if ($project->applicant_id !== $actor->id) {
            throw new AuthorizationException('申請者本人のみ申請できます。');
        }

        if (! in_array($project->status, [ProjectStatus::Draft, ProjectStatus::Rejected], true)) {
            throw new AuthorizationException('現在のステータスでは申請できません。');
        }

        if ($project->status === ProjectStatus::Draft) {
            return DB::transaction(function () use ($project, $actor) {
                $nextStatus = $actor->hasRole(Role::DeptManager->value)
                    ? ProjectStatus::PendingHq
                    : ProjectStatus::PendingDept;

                $project->update([
                    'status' => $nextStatus,
                    'submitted_at' => now(),
                    'rejected_at' => null,
                ]);

                $this->notificationService->notifyUsers(
                    users: [$project->applicant],
                    type: NotificationType::ProjectSubmitted,
                    title: '申請を受け付けました',
                    body: "案件「{$project->title}」を申請しました。",
                    meta: ['project_id' => $project->id, 'status' => $nextStatus->value],
                    markAsRead: true,
                );
                $this->notificationService->notifyUsers(
                    users: $this->submissionApprovers($project, $nextStatus),
                    type: NotificationType::ProjectSubmitted,
                    title: '承認依頼が届いています',
                    body: "案件「{$project->title}」の承認依頼です。",
                    meta: ['project_id' => $project->id, 'status' => $nextStatus->value],
                );

                return $project->fresh();
            });
        }

        return DB::transaction(function () use ($project, $actor) {
            $nextStatus = $actor->hasRole(Role::DeptManager->value)
                ? ProjectStatus::PendingHq
                : ProjectStatus::PendingDept;

            $new = Project::query()->create([
                'parent_project_id' => $project->id,
                'revision' => $project->revision + 1,
                'title' => $project->title,
                'purpose' => $project->purpose,
                'applicant_id' => $project->applicant_id,
                'department_id' => $project->department_id,
                'primary_assignee_id' => $project->primary_assignee_id,
                'status' => $nextStatus,
                'estimated_amount' => $project->estimated_amount,
                'submitted_at' => now(),
            ]);

            $this->notificationService->notifyUsers(
                users: [$project->applicant],
                type: NotificationType::ProjectSubmitted,
                title: '再申請を受け付けました',
                body: "案件「{$new->title}」を再申請しました（案件ID: {$new->id}）。",
                meta: ['project_id' => $new->id, 'status' => $nextStatus->value, 'resubmit_of' => $project->id],
                markAsRead: true,
            );
            $this->notificationService->notifyUsers(
                users: $this->submissionApprovers($new, $nextStatus),
                type: NotificationType::ProjectSubmitted,
                title: '承認依頼が届いています',
                body: "案件「{$new->title}」の承認依頼です。",
                meta: ['project_id' => $new->id, 'status' => $nextStatus->value, 'resubmit_of' => $project->id],
            );

            return $new;
        });
    }

    public function approveDept(Project $project, User $approver, ?string $comment = null): Project
    {
        if (! $approver->hasRole(Role::DeptManager->value)) {
            throw new AuthorizationException('部門管理者のみ部門承認できます。');
        }

        if ($project->status !== ProjectStatus::PendingDept) {
            throw new AuthorizationException('部門承認待ちの案件のみ承認できます。');
        }

        if ($project->department_id !== $approver->department_id) {
            throw new AuthorizationException('自部門以外の案件は承認できません。');
        }

        return DB::transaction(function () use ($project, $approver, $comment) {
            $project->approvals()->create([
                'level' => ApprovalLevel::Dept,
                'action' => ApprovalAction::Approved,
                'approver_id' => $approver->id,
                'comment' => $comment,
                'acted_at' => now(),
            ]);

            $project->update([
                'status' => ProjectStatus::PendingHq,
            ]);

            $this->notificationService->notifyUsers(
                users: [$project->applicant],
                type: NotificationType::ProjectApproved,
                title: '部門承認が完了しました',
                body: "案件「{$project->title}」が部門承認されました。",
                meta: ['project_id' => $project->id, 'level' => ApprovalLevel::Dept->value],
            );

            return $project->fresh();
        });
    }

    public function approveHq(Project $project, User $approver, ?string $comment = null): Project
    {
        if (! $approver->hasRole(Role::HqManager->value)) {
            throw new AuthorizationException('本部管理者のみ本部承認できます。');
        }

        if ($project->status !== ProjectStatus::PendingHq) {
            throw new AuthorizationException('本部承認待ちの案件のみ承認できます。');
        }

        return DB::transaction(function () use ($project, $approver, $comment) {
            $project->approvals()->create([
                'level' => ApprovalLevel::Hq,
                'action' => ApprovalAction::Approved,
                'approver_id' => $approver->id,
                'comment' => $comment,
                'acted_at' => now(),
            ]);

            $project->update([
                'status' => ProjectStatus::Approved,
                'approved_at' => now(),
                'budget_amount' => $project->estimated_amount,
            ]);

            $this->notificationService->notifyUsers(
                users: [$project->applicant],
                type: NotificationType::ProjectApproved,
                title: '本部承認が完了しました',
                body: "案件「{$project->title}」が最終承認されました。",
                meta: ['project_id' => $project->id, 'level' => ApprovalLevel::Hq->value],
            );

            return $project->fresh();
        });
    }

    public function reject(Project $project, User $approver, ApprovalLevel $level, ?string $comment = null): Project
    {
        if ($level === ApprovalLevel::Dept) {
            if (! $approver->hasRole(Role::DeptManager->value) || $project->department_id !== $approver->department_id) {
                throw new AuthorizationException('部門却下の権限がありません。');
            }

            if ($project->status !== ProjectStatus::PendingDept) {
                throw new AuthorizationException('部門承認待ちの案件のみ却下できます。');
            }
        }

        if ($level === ApprovalLevel::Hq) {
            if (! $approver->hasRole(Role::HqManager->value)) {
                throw new AuthorizationException('本部却下の権限がありません。');
            }

            if ($project->status !== ProjectStatus::PendingHq) {
                throw new AuthorizationException('本部承認待ちの案件のみ却下できます。');
            }
        }

        return DB::transaction(function () use ($project, $approver, $level, $comment) {
            $project->approvals()->create([
                'level' => $level,
                'action' => ApprovalAction::Rejected,
                'approver_id' => $approver->id,
                'comment' => $comment,
                'acted_at' => now(),
            ]);

            $project->update([
                'status' => ProjectStatus::Rejected,
                'rejected_at' => now(),
            ]);

            $this->notificationService->notifyUsers(
                users: [$project->applicant],
                type: NotificationType::ProjectRejected,
                title: '案件が却下されました',
                body: "案件「{$project->title}」が却下されました。",
                meta: ['project_id' => $project->id, 'level' => $level->value],
            );

            return $project->fresh();
        });
    }

    public function takeBack(Project $project, User $actor): Project
    {
        if ($project->applicant_id !== $actor->id) {
            throw new AuthorizationException('申請者本人のみ取り戻しできます。');
        }

        $canTakeBackFromPendingDept = $project->status === ProjectStatus::PendingDept;
        $canTakeBackFromPendingHqDirect = $project->status === ProjectStatus::PendingHq
            && $actor->hasRole(Role::DeptManager->value);

        if (! $canTakeBackFromPendingDept && ! $canTakeBackFromPendingHqDirect) {
            throw new AuthorizationException('部門承認待ち、または本部直行の本部承認待ち案件のみ取り戻しできます。');
        }

        return DB::transaction(function () use ($project) {
            $project->update([
                'status' => ProjectStatus::Draft,
                'submitted_at' => null,
            ]);

            return $project->fresh();
        });
    }

    /**
     * @return Collection<int, User>
     */
    private function submissionApprovers(Project $project, ProjectStatus $nextStatus): Collection
    {
        if ($nextStatus === ProjectStatus::PendingHq) {
            return User::role(Role::HqManager->value)->get();
        }

        return User::role(Role::DeptManager->value)
            ->where('department_id', $project->department_id)
            ->get();
    }
}
