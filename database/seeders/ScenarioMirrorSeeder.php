<?php

namespace Database\Seeders;

use App\Enums\ApprovalAction;
use App\Enums\ApprovalLevel;
use App\Enums\ProjectStatus;
use App\Enums\TaskPriority;
use App\Enums\TaskStatus;
use App\Enums\TaskType;
use App\Models\Approval;
use App\Models\Project;
use App\Models\ProjectWorkItem;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

/**
 * ①本人（既定シード）と独立した案件データを、②採点用・③予備用アカウント向けに投入する。
 * 開発1部の既存メンバー（佐藤・井上）を主担当外タスクの担当として参照し、S-14 の部門内閲覧を確認可能にする。
 */
class ScenarioMirrorSeeder extends Seeder
{
    public function run(): void
    {
        $sato = User::where('email', 'applicant-dev1-02@example.com')->firstOrFail();
        $inoue = User::where('email', 'applicant-dev1-03@example.com')->firstOrFail();

        $bApp = User::where('email', 'track-b-applicant@example.com')->firstOrFail();
        $bDept = User::where('email', 'track-b-dept@example.com')->firstOrFail();
        $bHq = User::where('email', 'track-b-hq@example.com')->firstOrFail();

        $cApp = User::where('email', 'track-c-applicant@example.com')->firstOrFail();
        $cDept = User::where('email', 'track-c-dept@example.com')->firstOrFail();
        $cHq = User::where('email', 'track-c-hq@example.com')->firstOrFail();

        $base = Carbon::now()->subDays(10);

        $this->seedTrack(
            prefix: 'PRJ-TB-',
            applicant: $bApp,
            deptManager: $bDept,
            hq: $bHq,
            sato: $sato,
            inoue: $inoue,
            base: $base,
        );

        $this->seedTrack(
            prefix: 'PRJ-TC-',
            applicant: $cApp,
            deptManager: $cDept,
            hq: $cHq,
            sato: $sato,
            inoue: $inoue,
            base: $base->copy()->addHour(),
        );
    }

    private function seedTrack(
        string $prefix,
        User $applicant,
        User $deptManager,
        User $hq,
        User $sato,
        User $inoue,
        Carbon $base,
    ): void {
        $deptId = $applicant->department_id;

        $p1 = $this->upsertProject($prefix.'001', [
            'title' => $prefix.'001 下書き（系統専用）',
            'purpose' => '採点・予備系統の下書き確認',
            'description' => 'migrate:fresh --seed 後、この系統の申請者のみ閲覧可。',
            'applicant_id' => $applicant->id,
            'department_id' => $deptId,
            'primary_assignee_id' => $applicant->id,
            'status' => ProjectStatus::Draft,
            'estimated_amount' => 500_000,
            'estimated_days' => 20,
            'actual_amount' => 0,
            'submitted_at' => null,
            'approved_at' => null,
            'rejected_at' => null,
            'revision' => 1,
            'parent_project_id' => null,
        ]);
        $this->resetApprovals($p1, []);

        $p2 = $this->upsertProject($prefix.'002', [
            'title' => $prefix.'002 部門承認待ち',
            'purpose' => '部門承認フロー確認',
            'description' => '系統専用の pending_dept。',
            'applicant_id' => $applicant->id,
            'department_id' => $deptId,
            'primary_assignee_id' => $applicant->id,
            'status' => ProjectStatus::PendingDept,
            'estimated_amount' => 800_000,
            'estimated_days' => 30,
            'actual_amount' => 0,
            'submitted_at' => $base->copy()->addDay(),
            'approved_at' => null,
            'rejected_at' => null,
            'revision' => 1,
            'parent_project_id' => null,
        ]);
        $this->resetApprovals($p2, []);

        $p3 = $this->upsertProject($prefix.'003', [
            'title' => $prefix.'003 本部承認待ち（部門承認済）',
            'purpose' => '本部承認前確認',
            'description' => '部門承認記録あり。',
            'applicant_id' => $applicant->id,
            'department_id' => $deptId,
            'primary_assignee_id' => $applicant->id,
            'status' => ProjectStatus::PendingHq,
            'estimated_amount' => 1_200_000,
            'estimated_days' => 40,
            'actual_amount' => 0,
            'submitted_at' => $base->copy()->addDays(2),
            'approved_at' => null,
            'rejected_at' => null,
            'revision' => 1,
            'parent_project_id' => null,
        ]);
        $this->resetApprovals($p3, [
            [
                'level' => ApprovalLevel::Dept,
                'action' => ApprovalAction::Approved,
                'approver_id' => $deptManager->id,
                'comment' => '系統データ：部門承認済。',
                'acted_at' => $base->copy()->addDays(3),
            ],
        ]);

        $p4 = $this->upsertProject($prefix.'004', [
            'title' => $prefix.'004 本部直行（部門管理者起案）',
            'purpose' => 'pending_hq 直行',
            'description' => '部門管理者が申請者のケース。',
            'applicant_id' => $deptManager->id,
            'department_id' => $deptId,
            'primary_assignee_id' => $deptManager->id,
            'status' => ProjectStatus::PendingHq,
            'estimated_amount' => 600_000,
            'estimated_days' => 25,
            'actual_amount' => 0,
            'submitted_at' => $base->copy()->addDays(4),
            'approved_at' => null,
            'rejected_at' => null,
            'revision' => 1,
            'parent_project_id' => null,
        ]);
        $this->resetApprovals($p4, []);

        $p5 = $this->upsertProject($prefix.'005', [
            'title' => $prefix.'005 承認済（主担当は別申請者・系統閲覧用）',
            'purpose' => 'S-14 部門内タスク閲覧',
            'description' => '主担当は佐藤。系統の純申請者は主担当外だが同部門承認済のためタスク閲覧可。',
            'applicant_id' => $sato->id,
            'department_id' => $deptId,
            'primary_assignee_id' => $sato->id,
            'status' => ProjectStatus::Approved,
            'estimated_amount' => 3_000_000,
            'estimated_days' => 60,
            'budget_amount' => 2_900_000,
            'actual_amount' => 400_000,
            'submitted_at' => $base->copy()->subDay(),
            'approved_at' => $base->copy()->addDays(2),
            'rejected_at' => null,
            'revision' => 1,
            'parent_project_id' => null,
        ]);
        $this->resetApprovals($p5, [
            [
                'level' => ApprovalLevel::Dept,
                'action' => ApprovalAction::Approved,
                'approver_id' => $deptManager->id,
                'comment' => '系統：部門承認。',
                'acted_at' => $base->copy()->addDay(),
            ],
            [
                'level' => ApprovalLevel::Hq,
                'action' => ApprovalAction::Approved,
                'approver_id' => $hq->id,
                'comment' => '系統：本部承認。',
                'acted_at' => $base->copy()->addDays(2),
            ],
        ]);

        ProjectWorkItem::query()->where('project_id', $p5->id)->delete();
        ProjectWorkItem::query()->create([
            'project_id' => $p5->id,
            'title' => $prefix.'005-A 井上担当（系統閲覧確認）',
            'task_type' => TaskType::Task,
            'priority' => TaskPriority::Medium,
            'status' => TaskStatus::Open,
            'progress_rate' => 0,
            'assignee_id' => $inoue->id,
            'reviewer_id' => $deptManager->id,
            'created_by' => $deptManager->id,
            'estimated_days' => 3,
            'actual_days' => 0,
        ]);
        ProjectWorkItem::query()->create([
            'project_id' => $p5->id,
            'title' => $prefix.'005-B 佐藤担当',
            'task_type' => TaskType::Bug,
            'priority' => TaskPriority::High,
            'status' => TaskStatus::InProgress,
            'progress_rate' => 40,
            'assignee_id' => $sato->id,
            'reviewer_id' => $deptManager->id,
            'created_by' => $sato->id,
            'estimated_days' => 5,
            'actual_days' => 1,
        ]);

        $p6 = $this->upsertProject($prefix.'006', [
            'title' => $prefix.'006 部門却下',
            'purpose' => '却下→再申請の親候補',
            'description' => '系統の部門却下。',
            'applicant_id' => $applicant->id,
            'department_id' => $deptId,
            'primary_assignee_id' => $applicant->id,
            'status' => ProjectStatus::Rejected,
            'estimated_amount' => 900_000,
            'estimated_days' => 35,
            'actual_amount' => 0,
            'submitted_at' => $base->copy()->addDays(5),
            'approved_at' => null,
            'rejected_at' => $base->copy()->addDays(6),
            'revision' => 1,
            'parent_project_id' => null,
        ]);
        $this->resetApprovals($p6, [
            [
                'level' => ApprovalLevel::Dept,
                'action' => ApprovalAction::Rejected,
                'approver_id' => $deptManager->id,
                'comment' => '系統データ：部門却下（再申請テスト用）。',
                'acted_at' => $base->copy()->addDays(6),
            ],
        ]);

        $p7 = $this->upsertProject($prefix.'007', [
            'title' => $prefix.'007 再申請承認済（子）',
            'purpose' => 'revision=2',
            'description' => '006 の再申請想定。',
            'applicant_id' => $applicant->id,
            'department_id' => $deptId,
            'primary_assignee_id' => $applicant->id,
            'status' => ProjectStatus::Approved,
            'estimated_amount' => 950_000,
            'estimated_days' => 36,
            'budget_amount' => 900_000,
            'actual_amount' => 100_000,
            'submitted_at' => $base->copy()->subDays(3),
            'approved_at' => $base->copy()->subDay(),
            'rejected_at' => null,
            'revision' => 2,
            'parent_project_id' => $p6->id,
        ]);
        $this->resetApprovals($p7, [
            [
                'level' => ApprovalLevel::Dept,
                'action' => ApprovalAction::Approved,
                'approver_id' => $deptManager->id,
                'comment' => '再申請を承認。',
                'acted_at' => $base->copy()->subDays(2),
            ],
            [
                'level' => ApprovalLevel::Hq,
                'action' => ApprovalAction::Approved,
                'approver_id' => $hq->id,
                'comment' => '本部承認。',
                'acted_at' => $base->copy()->subDay(),
            ],
        ]);

        $p8 = $this->upsertProject($prefix.'008', [
            'title' => $prefix.'008 本部却下',
            'purpose' => '本部却下の承認履歴',
            'description' => '部門承認後に本部却下。',
            'applicant_id' => $applicant->id,
            'department_id' => $deptId,
            'primary_assignee_id' => $applicant->id,
            'status' => ProjectStatus::Rejected,
            'estimated_amount' => 5_000_000,
            'estimated_days' => 100,
            'actual_amount' => 0,
            'submitted_at' => $base->copy()->addDays(7),
            'approved_at' => null,
            'rejected_at' => $base->copy()->addDays(9),
            'revision' => 1,
            'parent_project_id' => null,
        ]);
        $this->resetApprovals($p8, [
            [
                'level' => ApprovalLevel::Dept,
                'action' => ApprovalAction::Approved,
                'approver_id' => $deptManager->id,
                'comment' => '部門承認。',
                'acted_at' => $base->copy()->addDays(8),
            ],
            [
                'level' => ApprovalLevel::Hq,
                'action' => ApprovalAction::Rejected,
                'approver_id' => $hq->id,
                'comment' => '本部却下（系統データ）。',
                'acted_at' => $base->copy()->addDays(9),
            ],
        ]);

        $p9 = $this->upsertProject($prefix.'009', [
            'title' => $prefix.'009 承認済（系統申請者が主担当）',
            'purpose' => '予算・タスク操作の基本確認',
            'description' => '系統の申請者が主担当の承認済案件。',
            'applicant_id' => $applicant->id,
            'department_id' => $deptId,
            'primary_assignee_id' => $applicant->id,
            'status' => ProjectStatus::Approved,
            'estimated_amount' => 1_500_000,
            'estimated_days' => 45,
            'budget_amount' => 1_450_000,
            'actual_amount' => 200_000,
            'submitted_at' => $base->copy()->subDays(4),
            'approved_at' => $base->copy()->subDays(1),
            'rejected_at' => null,
            'revision' => 1,
            'parent_project_id' => null,
        ]);
        $this->resetApprovals($p9, [
            [
                'level' => ApprovalLevel::Dept,
                'action' => ApprovalAction::Approved,
                'approver_id' => $deptManager->id,
                'comment' => '部門承認。',
                'acted_at' => $base->copy()->subDays(3),
            ],
            [
                'level' => ApprovalLevel::Hq,
                'action' => ApprovalAction::Approved,
                'approver_id' => $hq->id,
                'comment' => '本部承認。',
                'acted_at' => $base->copy()->subDays(1),
            ],
        ]);

        ProjectWorkItem::query()->where('project_id', $p9->id)->delete();
        ProjectWorkItem::query()->create([
            'project_id' => $p9->id,
            'title' => $prefix.'009 初期タスク（系統主担当）',
            'task_type' => TaskType::Task,
            'priority' => TaskPriority::Medium,
            'status' => TaskStatus::Open,
            'progress_rate' => 0,
            'assignee_id' => $applicant->id,
            'reviewer_id' => $deptManager->id,
            'created_by' => $deptManager->id,
            'estimated_days' => 4,
            'actual_days' => 0,
        ]);
    }

    private function upsertProject(string $projectCode, array $attrs): Project
    {
        $project = Project::updateOrCreate(
            ['project_code' => $projectCode],
            ['project_code' => $projectCode, ...$attrs],
        );

        return $project->fresh();
    }

    /**
     * @param  array<int, array{
     *     level: ApprovalLevel,
     *     action: ApprovalAction,
     *     approver_id: int,
     *     comment: string|null,
     *     acted_at: Carbon
     * }>  $rows
     */
    private function resetApprovals(Project $project, array $rows): void
    {
        Approval::where('project_id', $project->id)->delete();

        foreach ($rows as $row) {
            Approval::create([
                'project_id' => $project->id,
                'level' => $row['level'],
                'action' => $row['action'],
                'approver_id' => $row['approver_id'],
                'comment' => $row['comment'],
                'acted_at' => $row['acted_at'],
            ]);
        }
    }
}
