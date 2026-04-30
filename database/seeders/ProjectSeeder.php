<?php

namespace Database\Seeders;

use App\Enums\ApprovalAction;
use App\Enums\ApprovalLevel;
use App\Enums\ProjectStatus;
use App\Models\Approval;
use App\Models\Project;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;

class ProjectSeeder extends Seeder
{
    public function run(): void
    {
        $hq = $this->userByEmail('hq@example.com');
        $applicant1 = $this->userByEmail('applicant@example.com');
        $dept1Manager = $this->userByEmail('dept@example.com');
        $applicant2 = $this->userByEmail('applicant2@example.com');
        $dept2Manager = $this->userByEmail('dept2@example.com');
        $applicant3 = $this->userByEmail('applicant3@example.com');
        $dept3Manager = $this->userByEmail('dept3@example.com');

        $base = Carbon::now()->subDays(14);

        // 1) 下書き（未申請）
        $this->upsertProject(
            projectCode: 'PRJ-SEED-0001',
            attrs: [
                'title' => '設備点検モバイル入力 PoC',
                'purpose' => '現場入力の転記作業を削減する',
                'description' => '点検表のモバイル入力画面を試作し、紙運用との差分を検証する。',
                'applicant_id' => $applicant1->id,
                'department_id' => $applicant1->department_id,
                'primary_assignee_id' => $applicant1->id,
                'status' => ProjectStatus::Draft,
                'estimated_amount' => 1200000,
                'estimated_days' => 35,
                'actual_amount' => 0,
                'submitted_at' => null,
                'approved_at' => null,
                'rejected_at' => null,
                'revision' => 1,
                'parent_project_id' => null,
            ],
        );

        // 2) 部門承認待ち
        $this->upsertProject(
            projectCode: 'PRJ-SEED-0002',
            attrs: [
                'title' => '配管図OCR自動分類ツール',
                'purpose' => '図面分類作業の工数削減',
                'description' => 'OCRと分類器を組み合わせ、図面の一次分類を自動化する。',
                'applicant_id' => $applicant1->id,
                'department_id' => $applicant1->department_id,
                'primary_assignee_id' => $applicant1->id,
                'status' => ProjectStatus::PendingDept,
                'estimated_amount' => 2800000,
                'estimated_days' => 60,
                'actual_amount' => 0,
                'submitted_at' => $base->copy()->addDay(),
                'approved_at' => null,
                'rejected_at' => null,
                'revision' => 1,
                'parent_project_id' => null,
            ],
        );

        // 3) 本部承認待ち（通常経路：部門承認済）
        $pendingHqNormal = $this->upsertProject(
            projectCode: 'PRJ-SEED-0003',
            attrs: [
                'title' => '現場センサーデータ統合基盤',
                'purpose' => '部門横断でセンサーデータを可視化',
                'description' => '現場の複数システムからデータを収集し、統合基盤を構築する。',
                'applicant_id' => $applicant1->id,
                'department_id' => $applicant1->department_id,
                'primary_assignee_id' => $applicant1->id,
                'status' => ProjectStatus::PendingHq,
                'estimated_amount' => 6500000,
                'estimated_days' => 120,
                'actual_amount' => 0,
                'submitted_at' => $base->copy()->addDays(2),
                'approved_at' => null,
                'rejected_at' => null,
                'revision' => 1,
                'parent_project_id' => null,
            ],
        );
        $this->resetApprovals($pendingHqNormal, [
            [
                'level' => ApprovalLevel::Dept,
                'action' => ApprovalAction::Approved,
                'approver_id' => $dept1Manager->id,
                'comment' => '部門として優先度高。推進してください。',
                'acted_at' => $base->copy()->addDays(3),
            ],
        ]);

        // 4) 本部承認待ち（部門管理者が申請：本部直行）
        $this->upsertProject(
            projectCode: 'PRJ-SEED-0004',
            attrs: [
                'title' => '部門長起案：工数予実ダッシュボード',
                'purpose' => '部門内の予実差分を即時把握',
                'description' => '部門管理者が直接申請したケース（本部承認待ち直行）。',
                'applicant_id' => $dept1Manager->id,
                'department_id' => $dept1Manager->department_id,
                'primary_assignee_id' => $dept1Manager->id,
                'status' => ProjectStatus::PendingHq,
                'estimated_amount' => 1800000,
                'estimated_days' => 40,
                'actual_amount' => 0,
                'submitted_at' => $base->copy()->addDays(4),
                'approved_at' => null,
                'rejected_at' => null,
                'revision' => 1,
                'parent_project_id' => null,
            ],
        );

        // 5) 承認済（開発1部）
        $approved1 = $this->upsertProject(
            projectCode: 'PRJ-SEED-0005',
            attrs: [
                'title' => 'EAM次世代ワークフロー改善',
                'purpose' => '承認リードタイムを短縮',
                'description' => '申請から承認までの情報分断を解消し、運用コストを下げる。',
                'applicant_id' => $applicant1->id,
                'department_id' => $applicant1->department_id,
                'primary_assignee_id' => $applicant1->id,
                'status' => ProjectStatus::Approved,
                'estimated_amount' => 8000000,
                'estimated_days' => 150,
                'budget_amount' => 7800000,
                'actual_amount' => 2600000,
                'submitted_at' => $base->copy()->subDay(),
                'approved_at' => $base->copy()->addDays(2),
                'rejected_at' => null,
                'revision' => 1,
                'parent_project_id' => null,
            ],
        );
        $this->resetApprovals($approved1, [
            [
                'level' => ApprovalLevel::Dept,
                'action' => ApprovalAction::Approved,
                'approver_id' => $dept1Manager->id,
                'comment' => '部門承認済み。',
                'acted_at' => $base->copy()->addDay(),
            ],
            [
                'level' => ApprovalLevel::Hq,
                'action' => ApprovalAction::Approved,
                'approver_id' => $hq->id,
                'comment' => '本部承認済み。予算確定。',
                'acted_at' => $base->copy()->addDays(2),
            ],
        ]);

        // 6) 承認済（開発2部）
        $approved2 = $this->upsertProject(
            projectCode: 'PRJ-SEED-0006',
            attrs: [
                'title' => '開発2部：CI高速化基盤整備',
                'purpose' => 'テスト時間短縮による生産性向上',
                'description' => 'CIキャッシュ戦略と並列実行導入で待機時間を削減する。',
                'applicant_id' => $applicant2->id,
                'department_id' => $applicant2->department_id,
                'primary_assignee_id' => $applicant2->id,
                'status' => ProjectStatus::Approved,
                'estimated_amount' => 3200000,
                'estimated_days' => 70,
                'budget_amount' => 3000000,
                'actual_amount' => 2850000,
                'submitted_at' => $base->copy()->subDays(2),
                'approved_at' => $base->copy()->subDay(),
                'rejected_at' => null,
                'revision' => 1,
                'parent_project_id' => null,
            ],
        );
        $this->resetApprovals($approved2, [
            [
                'level' => ApprovalLevel::Dept,
                'action' => ApprovalAction::Approved,
                'approver_id' => $dept2Manager->id,
                'comment' => '効果見込みあり。承認。',
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

        // 7) 承認済（開発3部）
        $approved3 = $this->upsertProject(
            projectCode: 'PRJ-SEED-0007',
            attrs: [
                'title' => '開発3部：障害分析ナレッジ蓄積',
                'purpose' => '障害再発防止の仕組み化',
                'description' => '障害原因と対応策を構造化し、検索できるようにする。',
                'applicant_id' => $applicant3->id,
                'department_id' => $applicant3->department_id,
                'primary_assignee_id' => $applicant3->id,
                'status' => ProjectStatus::Approved,
                'estimated_amount' => 2500000,
                'estimated_days' => 55,
                'budget_amount' => 2400000,
                'actual_amount' => 900000,
                'submitted_at' => $base->copy()->subDays(5),
                'approved_at' => $base->copy()->subDays(3),
                'rejected_at' => null,
                'revision' => 1,
                'parent_project_id' => null,
            ],
        );
        $this->resetApprovals($approved3, [
            [
                'level' => ApprovalLevel::Dept,
                'action' => ApprovalAction::Approved,
                'approver_id' => $dept3Manager->id,
                'comment' => '部門承認。',
                'acted_at' => $base->copy()->subDays(4),
            ],
            [
                'level' => ApprovalLevel::Hq,
                'action' => ApprovalAction::Approved,
                'approver_id' => $hq->id,
                'comment' => '本部承認。',
                'acted_at' => $base->copy()->subDays(3),
            ],
        ]);

        // 8) 却下（部門却下）
        $rejectedDept = $this->upsertProject(
            projectCode: 'PRJ-SEED-0008',
            attrs: [
                'title' => '開発2部：旧システム全面置換',
                'purpose' => '運用改善',
                'description' => '要件が粗いため一度差し戻し。',
                'applicant_id' => $applicant2->id,
                'department_id' => $applicant2->department_id,
                'primary_assignee_id' => $applicant2->id,
                'status' => ProjectStatus::Rejected,
                'estimated_amount' => 11000000,
                'estimated_days' => 180,
                'actual_amount' => 0,
                'submitted_at' => $base->copy()->addDays(5),
                'approved_at' => null,
                'rejected_at' => $base->copy()->addDays(6),
                'revision' => 1,
                'parent_project_id' => null,
            ],
        );
        $this->resetApprovals($rejectedDept, [
            [
                'level' => ApprovalLevel::Dept,
                'action' => ApprovalAction::Rejected,
                'approver_id' => $dept2Manager->id,
                'comment' => '見積根拠が不足。再申請してください。',
                'acted_at' => $base->copy()->addDays(6),
            ],
        ]);

        // 9) 却下（本部却下）
        $rejectedHq = $this->upsertProject(
            projectCode: 'PRJ-SEED-0009',
            attrs: [
                'title' => '開発1部：高額インフラ増強計画',
                'purpose' => '性能改善',
                'description' => '部門承認後、本部で費用対効果不足により却下。',
                'applicant_id' => $applicant1->id,
                'department_id' => $applicant1->department_id,
                'primary_assignee_id' => $applicant1->id,
                'status' => ProjectStatus::Rejected,
                'estimated_amount' => 15000000,
                'estimated_days' => 200,
                'actual_amount' => 0,
                'submitted_at' => $base->copy()->addDays(7),
                'approved_at' => null,
                'rejected_at' => $base->copy()->addDays(10),
                'revision' => 1,
                'parent_project_id' => null,
            ],
        );
        $this->resetApprovals($rejectedHq, [
            [
                'level' => ApprovalLevel::Dept,
                'action' => ApprovalAction::Approved,
                'approver_id' => $dept1Manager->id,
                'comment' => '部門承認。',
                'acted_at' => $base->copy()->addDays(8),
            ],
            [
                'level' => ApprovalLevel::Hq,
                'action' => ApprovalAction::Rejected,
                'approver_id' => $hq->id,
                'comment' => '費用対効果の再検討が必要。',
                'acted_at' => $base->copy()->addDays(10),
            ],
        ]);

        // 10) 却下→再申請（親）
        $parentRejected = $this->upsertProject(
            projectCode: 'PRJ-SEED-0010',
            attrs: [
                'title' => '再申請元：設備保全データ連携',
                'purpose' => '保全計画の精度向上',
                'description' => '初回申請は部門で却下。',
                'applicant_id' => $applicant3->id,
                'department_id' => $applicant3->department_id,
                'primary_assignee_id' => $applicant3->id,
                'status' => ProjectStatus::Rejected,
                'estimated_amount' => 4000000,
                'estimated_days' => 80,
                'actual_amount' => 0,
                'submitted_at' => $base->copy()->subDays(7),
                'approved_at' => null,
                'rejected_at' => $base->copy()->subDays(6),
                'revision' => 1,
                'parent_project_id' => null,
            ],
        );
        $this->resetApprovals($parentRejected, [
            [
                'level' => ApprovalLevel::Dept,
                'action' => ApprovalAction::Rejected,
                'approver_id' => $dept3Manager->id,
                'comment' => '要件が不足。詳細化が必要。',
                'acted_at' => $base->copy()->subDays(6),
            ],
        ]);

        // 11) 却下→再申請（子、revision=2、承認済）
        $resubmittedApproved = $this->upsertProject(
            projectCode: 'PRJ-SEED-0011',
            attrs: [
                'title' => '再申請：設備保全データ連携（要件補強版）',
                'purpose' => '保全計画の精度向上',
                'description' => '却下コメントを反映し、要件と効果を補強して再申請。',
                'applicant_id' => $applicant3->id,
                'department_id' => $applicant3->department_id,
                'primary_assignee_id' => $applicant3->id,
                'status' => ProjectStatus::Approved,
                'estimated_amount' => 4200000,
                'estimated_days' => 85,
                'budget_amount' => 4100000,
                'actual_amount' => 1300000,
                'submitted_at' => $base->copy()->subDays(5),
                'approved_at' => $base->copy()->subDays(2),
                'rejected_at' => null,
                'revision' => 2,
                'parent_project_id' => $parentRejected->id,
            ],
        );
        $this->resetApprovals($resubmittedApproved, [
            [
                'level' => ApprovalLevel::Dept,
                'action' => ApprovalAction::Approved,
                'approver_id' => $dept3Manager->id,
                'comment' => '要件補強を確認、承認。',
                'acted_at' => $base->copy()->subDays(4),
            ],
            [
                'level' => ApprovalLevel::Hq,
                'action' => ApprovalAction::Approved,
                'approver_id' => $hq->id,
                'comment' => '再申請内容を承認。',
                'acted_at' => $base->copy()->subDays(2),
            ],
        ]);
    }

    private function userByEmail(string $email): User
    {
        return User::where('email', $email)->firstOrFail();
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
     * @param array<int, array{
     *     level: ApprovalLevel,
     *     action: ApprovalAction,
     *     approver_id: int,
     *     comment: string|null,
     *     acted_at: Carbon
     * }> $rows
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
