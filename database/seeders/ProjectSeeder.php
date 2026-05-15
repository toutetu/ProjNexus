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

/**
 * 案件シーダー（PRJ-SEED-*）。
 *
 * `materials/Design/seed_scenarios.md` の P-01〜P-13 を A/B の 2 パターンで生成。
 * 承認履歴 (`approvals`) は本シーダーで投入する。タスク・通知は DemoWorkloadSeeder が担当。
 */
class ProjectSeeder extends Seeder
{
    /** @var array<string, User> */
    private array $users = [];

    private Carbon $base;

    private int $seq = 0;

    public function run(): void
    {
        $this->loadUsers();

        Project::where('project_code', 'like', 'PRJ-SEED-%')->delete();

        $this->base = Carbon::now()->subDays(14);

        $this->seedP01Draft();
        $this->seedP02DraftByDeptManager();
        $this->seedP03PendingDept();
        $this->seedP04PendingHqNormal();
        $this->seedP05PendingHqDirect();
        $this->seedP06ApprovedNormal();
        $this->seedP07ApprovedDirect();
        $this->seedP08ApprovedHighSpend();
        $this->seedP09ApprovedOverBudget();
        $this->seedP10RejectedDept();
        $this->seedP11RejectedHq();
        $this->seedP12RechainRejectedThenApproved();
        $this->seedP13RechainRejectedThenRejected();
    }

    private function loadUsers(): void
    {
        $emails = [
            'hq' => 'hq@example.com',
            'takahashi' => 'applicant@example.com',
            'sato' => 'applicant-dev1-02@example.com',
            'inoue' => 'applicant-dev1-03@example.com',
            'suzuki' => 'applicant-dev1-04@example.com',
            'natsume' => 'dept@example.com',
            'jiro' => 'applicant2@example.com',
            'shinji' => 'dept2@example.com',
            'saburo' => 'applicant3@example.com',
            'yumi' => 'dept3@example.com',
        ];

        foreach ($emails as $alias => $email) {
            $this->users[$alias] = User::where('email', $email)->firstOrFail();
        }
    }

    private function nextCode(): string
    {
        $this->seq++;

        return sprintf('PRJ-SEED-%04d', $this->seq);
    }

    // ─────────────────────────────────────────────────────────────
    // P-01: 下書き（一般申請者起票）
    // ─────────────────────────────────────────────────────────────
    private function seedP01Draft(): void
    {
        $patterns = [
            ['user' => 'takahashi', 'title' => '設備点検モバイル入力 PoC', 'est' => 1_200_000, 'days' => 35],
            ['user' => 'jiro', 'title' => '工程進捗の自動集計 PoC', 'est' => 1_500_000, 'days' => 42],
        ];
        foreach ($patterns as $p) {
            $u = $this->users[$p['user']];
            $this->upsert([
                'project_code' => $this->nextCode(),
                'title' => $p['title'],
                'purpose' => '現場入力の転記作業を削減する',
                'description' => '紙運用との差分を試作で検証する。',
                'applicant_id' => $u->id,
                'department_id' => $u->department_id,
                'primary_assignee_id' => $u->id,
                'status' => ProjectStatus::Draft,
                'estimated_amount' => $p['est'],
                'estimated_days' => $p['days'],
                'actual_amount' => 0,
                'submitted_at' => null,
                'approved_at' => null,
                'rejected_at' => null,
                'revision' => 1,
                'parent_project_id' => null,
            ]);
        }
    }

    // ─────────────────────────────────────────────────────────────
    // P-02: 下書き（部門管理者起票）
    // ─────────────────────────────────────────────────────────────
    private function seedP02DraftByDeptManager(): void
    {
        $patterns = [
            ['user' => 'natsume', 'title' => '開発1部 部門長起案：QA ダッシュボード', 'est' => 2_200_000, 'days' => 50],
            ['user' => 'yumi', 'title' => '開発3部 部門長起案：技術ナレッジ整備', 'est' => 1_800_000, 'days' => 38],
        ];
        foreach ($patterns as $p) {
            $u = $this->users[$p['user']];
            $this->upsert([
                'project_code' => $this->nextCode(),
                'title' => $p['title'],
                'purpose' => '部門内の運用改善',
                'description' => '部門管理者が直接起案した下書き。',
                'applicant_id' => $u->id,
                'department_id' => $u->department_id,
                'primary_assignee_id' => $u->id,
                'status' => ProjectStatus::Draft,
                'estimated_amount' => $p['est'],
                'estimated_days' => $p['days'],
                'actual_amount' => 0,
                'submitted_at' => null,
                'approved_at' => null,
                'rejected_at' => null,
                'revision' => 1,
                'parent_project_id' => null,
            ]);
        }
    }

    // ─────────────────────────────────────────────────────────────
    // P-03: 部門承認待ち（通常経路）
    // ─────────────────────────────────────────────────────────────
    private function seedP03PendingDept(): void
    {
        $patterns = [
            ['user' => 'takahashi', 'title' => '配管図 OCR 自動分類ツール', 'est' => 2_800_000, 'days' => 60],
            ['user' => 'saburo', 'title' => '営業データ連携 ETL 整備', 'est' => 3_400_000, 'days' => 65],
        ];
        foreach ($patterns as $p) {
            $u = $this->users[$p['user']];
            $this->upsert([
                'project_code' => $this->nextCode(),
                'title' => $p['title'],
                'purpose' => '部門承認待ちの代表的状態',
                'description' => '部門承認の操作確認用シナリオ。',
                'applicant_id' => $u->id,
                'department_id' => $u->department_id,
                'primary_assignee_id' => $u->id,
                'status' => ProjectStatus::PendingDept,
                'estimated_amount' => $p['est'],
                'estimated_days' => $p['days'],
                'actual_amount' => 0,
                'submitted_at' => $this->base->copy()->addDay(),
                'approved_at' => null,
                'rejected_at' => null,
                'revision' => 1,
                'parent_project_id' => null,
            ]);
        }
    }

    // ─────────────────────────────────────────────────────────────
    // P-04: 本部承認待ち（部門承認済・通常経路）
    // ─────────────────────────────────────────────────────────────
    private function seedP04PendingHqNormal(): void
    {
        $patterns = [
            ['user' => 'sato', 'dept_manager' => 'natsume', 'title' => '現場センサーデータ統合基盤', 'est' => 6_500_000, 'days' => 120],
            ['user' => 'jiro', 'dept_manager' => 'shinji', 'title' => '開発2部 BI 共通化', 'est' => 5_400_000, 'days' => 100],
        ];
        foreach ($patterns as $p) {
            $u = $this->users[$p['user']];
            $deptMgr = $this->users[$p['dept_manager']];
            $project = $this->upsert([
                'project_code' => $this->nextCode(),
                'title' => $p['title'],
                'purpose' => '部門横断のデータ可視化',
                'description' => '部門承認済み・本部承認待ち。',
                'applicant_id' => $u->id,
                'department_id' => $u->department_id,
                'primary_assignee_id' => $u->id,
                'status' => ProjectStatus::PendingHq,
                'estimated_amount' => $p['est'],
                'estimated_days' => $p['days'],
                'actual_amount' => 0,
                'submitted_at' => $this->base->copy()->addDays(2),
                'approved_at' => null,
                'rejected_at' => null,
                'revision' => 1,
                'parent_project_id' => null,
            ]);
            $this->resetApprovals($project, [
                [
                    'level' => ApprovalLevel::Dept,
                    'action' => ApprovalAction::Approved,
                    'approver_id' => $deptMgr->id,
                    'comment' => '部門として優先度高。推進してください。',
                    'acted_at' => $this->base->copy()->addDays(3),
                ],
            ]);
        }
    }

    // ─────────────────────────────────────────────────────────────
    // P-05: 本部承認待ち（本部直行）
    // ─────────────────────────────────────────────────────────────
    private function seedP05PendingHqDirect(): void
    {
        $patterns = [
            ['user' => 'natsume', 'title' => '部門長起案：工数予実ダッシュボード', 'est' => 1_800_000, 'days' => 40],
            ['user' => 'yumi', 'title' => '部門長起案：顧客フィードバック分析', 'est' => 2_400_000, 'days' => 55],
        ];
        foreach ($patterns as $p) {
            $u = $this->users[$p['user']];
            $this->upsert([
                'project_code' => $this->nextCode(),
                'title' => $p['title'],
                'purpose' => '部門管理者起案・本部直行のシナリオ',
                'description' => '部門承認をスキップして本部承認待ち。',
                'applicant_id' => $u->id,
                'department_id' => $u->department_id,
                'primary_assignee_id' => $u->id,
                'status' => ProjectStatus::PendingHq,
                'estimated_amount' => $p['est'],
                'estimated_days' => $p['days'],
                'actual_amount' => 0,
                'submitted_at' => $this->base->copy()->addDays(4),
                'approved_at' => null,
                'rejected_at' => null,
                'revision' => 1,
                'parent_project_id' => null,
            ]);
        }
    }

    // ─────────────────────────────────────────────────────────────
    // P-06: 承認済（通常経路・消費率約30%）
    // ─────────────────────────────────────────────────────────────
    private function seedP06ApprovedNormal(): void
    {
        $patterns = [
            ['user' => 'takahashi', 'dept_manager' => 'natsume', 'title' => 'EAM 次世代ワークフロー改善', 'est' => 8_000_000, 'budget' => 7_800_000, 'actual' => 2_340_000, 'days' => 150],
            ['user' => 'jiro', 'dept_manager' => 'shinji', 'title' => '開発2部 CI 高速化基盤整備', 'est' => 3_200_000, 'budget' => 3_000_000, 'actual' => 900_000, 'days' => 70],
        ];
        foreach ($patterns as $p) {
            $u = $this->users[$p['user']];
            $deptMgr = $this->users[$p['dept_manager']];
            $project = $this->upsert([
                'project_code' => $this->nextCode(),
                'title' => $p['title'],
                'purpose' => '承認後の標準運用シナリオ',
                'description' => '通常経路で承認完了・開発進行中。',
                'applicant_id' => $u->id,
                'department_id' => $u->department_id,
                'primary_assignee_id' => $u->id,
                'status' => ProjectStatus::Approved,
                'estimated_amount' => $p['est'],
                'estimated_days' => $p['days'],
                'budget_amount' => $p['budget'],
                'actual_amount' => $p['actual'],
                'submitted_at' => $this->base->copy()->subDay(),
                'approved_at' => $this->base->copy()->addDays(2),
                'rejected_at' => null,
                'revision' => 1,
                'parent_project_id' => null,
            ]);
            $this->resetApprovals($project, [
                ['level' => ApprovalLevel::Dept, 'action' => ApprovalAction::Approved, 'approver_id' => $deptMgr->id, 'comment' => '部門承認済み。', 'acted_at' => $this->base->copy()->addDay()],
                ['level' => ApprovalLevel::Hq, 'action' => ApprovalAction::Approved, 'approver_id' => $this->users['hq']->id, 'comment' => '本部承認済み。予算確定。', 'acted_at' => $this->base->copy()->addDays(2)],
            ]);
        }
    }

    // ─────────────────────────────────────────────────────────────
    // P-07: 承認済（本部直行経由・消費率約45%）
    // ─────────────────────────────────────────────────────────────
    private function seedP07ApprovedDirect(): void
    {
        $patterns = [
            ['user' => 'natsume', 'title' => '開発1部 部門長承認済：開発生産性可視化', 'est' => 4_400_000, 'budget' => 4_200_000, 'actual' => 1_890_000, 'days' => 80],
            ['user' => 'yumi', 'title' => '開発3部 部門長承認済：QA 自動化', 'est' => 3_600_000, 'budget' => 3_500_000, 'actual' => 1_580_000, 'days' => 75],
        ];
        foreach ($patterns as $p) {
            $u = $this->users[$p['user']];
            $project = $this->upsert([
                'project_code' => $this->nextCode(),
                'title' => $p['title'],
                'purpose' => '本部直行で承認された開発案件',
                'description' => '部門管理者起案・本部直行承認。',
                'applicant_id' => $u->id,
                'department_id' => $u->department_id,
                'primary_assignee_id' => $u->id,
                'status' => ProjectStatus::Approved,
                'estimated_amount' => $p['est'],
                'estimated_days' => $p['days'],
                'budget_amount' => $p['budget'],
                'actual_amount' => $p['actual'],
                'submitted_at' => $this->base->copy()->subDays(3),
                'approved_at' => $this->base->copy()->subDay(),
                'rejected_at' => null,
                'revision' => 1,
                'parent_project_id' => null,
            ]);
            $this->resetApprovals($project, [
                ['level' => ApprovalLevel::Hq, 'action' => ApprovalAction::Approved, 'approver_id' => $this->users['hq']->id, 'comment' => '本部直行案件として承認。', 'acted_at' => $this->base->copy()->subDay()],
            ]);
        }
    }

    // ─────────────────────────────────────────────────────────────
    // P-08: 承認済（消費率約78%・予算アラート相当）
    // ─────────────────────────────────────────────────────────────
    private function seedP08ApprovedHighSpend(): void
    {
        $patterns = [
            ['user' => 'inoue', 'dept_manager' => 'natsume', 'title' => '開発1部 高負荷バッチの再設計', 'est' => 5_000_000, 'budget' => 4_800_000, 'actual' => 3_744_000, 'days' => 90],
            ['user' => 'saburo', 'dept_manager' => 'yumi', 'title' => '開発3部 障害分析ナレッジ蓄積', 'est' => 2_500_000, 'budget' => 2_400_000, 'actual' => 1_872_000, 'days' => 55],
        ];
        foreach ($patterns as $p) {
            $u = $this->users[$p['user']];
            $deptMgr = $this->users[$p['dept_manager']];
            $project = $this->upsert([
                'project_code' => $this->nextCode(),
                'title' => $p['title'],
                'purpose' => '消費率 70% 超のシナリオ（赤バッジ）',
                'description' => '予算消費が進んだ案件。',
                'applicant_id' => $u->id,
                'department_id' => $u->department_id,
                'primary_assignee_id' => $u->id,
                'status' => ProjectStatus::Approved,
                'estimated_amount' => $p['est'],
                'estimated_days' => $p['days'],
                'budget_amount' => $p['budget'],
                'actual_amount' => $p['actual'],
                'submitted_at' => $this->base->copy()->subDays(5),
                'approved_at' => $this->base->copy()->subDays(3),
                'rejected_at' => null,
                'revision' => 1,
                'parent_project_id' => null,
            ]);
            $this->resetApprovals($project, [
                ['level' => ApprovalLevel::Dept, 'action' => ApprovalAction::Approved, 'approver_id' => $deptMgr->id, 'comment' => '部門承認。', 'acted_at' => $this->base->copy()->subDays(4)],
                ['level' => ApprovalLevel::Hq, 'action' => ApprovalAction::Approved, 'approver_id' => $this->users['hq']->id, 'comment' => '本部承認。', 'acted_at' => $this->base->copy()->subDays(3)],
            ]);
        }
    }

    // ─────────────────────────────────────────────────────────────
    // P-09: 承認済（消費率約108%・予算超過）
    // ─────────────────────────────────────────────────────────────
    private function seedP09ApprovedOverBudget(): void
    {
        $patterns = [
            ['user' => 'jiro', 'dept_manager' => 'shinji', 'title' => '開発2部 旧基盤撤去フェーズ1', 'est' => 4_500_000, 'budget' => 4_500_000, 'actual' => 4_860_000, 'days' => 90],
            ['user' => 'suzuki', 'dept_manager' => 'natsume', 'title' => '開発1部 監視基盤刷新', 'est' => 3_800_000, 'budget' => 3_800_000, 'actual' => 4_104_000, 'days' => 80],
        ];
        foreach ($patterns as $p) {
            $u = $this->users[$p['user']];
            $deptMgr = $this->users[$p['dept_manager']];
            $project = $this->upsert([
                'project_code' => $this->nextCode(),
                'title' => $p['title'],
                'purpose' => '予算超過案件のシナリオ',
                'description' => '実績額が確定予算を上回っている。',
                'applicant_id' => $u->id,
                'department_id' => $u->department_id,
                'primary_assignee_id' => $u->id,
                'status' => ProjectStatus::Approved,
                'estimated_amount' => $p['est'],
                'estimated_days' => $p['days'],
                'budget_amount' => $p['budget'],
                'actual_amount' => $p['actual'],
                'submitted_at' => $this->base->copy()->subDays(8),
                'approved_at' => $this->base->copy()->subDays(5),
                'rejected_at' => null,
                'revision' => 1,
                'parent_project_id' => null,
            ]);
            $this->resetApprovals($project, [
                ['level' => ApprovalLevel::Dept, 'action' => ApprovalAction::Approved, 'approver_id' => $deptMgr->id, 'comment' => '部門承認。', 'acted_at' => $this->base->copy()->subDays(6)],
                ['level' => ApprovalLevel::Hq, 'action' => ApprovalAction::Approved, 'approver_id' => $this->users['hq']->id, 'comment' => '本部承認。', 'acted_at' => $this->base->copy()->subDays(5)],
            ]);
        }
    }

    // ─────────────────────────────────────────────────────────────
    // P-10: 却下（部門却下）
    // ─────────────────────────────────────────────────────────────
    private function seedP10RejectedDept(): void
    {
        $patterns = [
            ['user' => 'sato', 'dept_manager' => 'natsume', 'title' => '開発1部 大規模基盤刷新案', 'est' => 9_500_000, 'days' => 160],
            ['user' => 'jiro', 'dept_manager' => 'shinji', 'title' => '開発2部 旧システム全面置換', 'est' => 11_000_000, 'days' => 180],
        ];
        foreach ($patterns as $p) {
            $u = $this->users[$p['user']];
            $deptMgr = $this->users[$p['dept_manager']];
            $project = $this->upsert([
                'project_code' => $this->nextCode(),
                'title' => $p['title'],
                'purpose' => '見積根拠不足で却下',
                'description' => '部門での却下シナリオ。',
                'applicant_id' => $u->id,
                'department_id' => $u->department_id,
                'primary_assignee_id' => $u->id,
                'status' => ProjectStatus::Rejected,
                'estimated_amount' => $p['est'],
                'estimated_days' => $p['days'],
                'actual_amount' => 0,
                'submitted_at' => $this->base->copy()->addDays(5),
                'approved_at' => null,
                'rejected_at' => $this->base->copy()->addDays(6),
                'revision' => 1,
                'parent_project_id' => null,
            ]);
            $this->resetApprovals($project, [
                ['level' => ApprovalLevel::Dept, 'action' => ApprovalAction::Rejected, 'approver_id' => $deptMgr->id, 'comment' => '見積根拠が不足。再申請してください。', 'acted_at' => $this->base->copy()->addDays(6)],
            ]);
        }
    }

    // ─────────────────────────────────────────────────────────────
    // P-11: 却下（本部却下）
    // ─────────────────────────────────────────────────────────────
    private function seedP11RejectedHq(): void
    {
        $patterns = [
            ['user' => 'takahashi', 'dept_manager' => 'natsume', 'title' => '開発1部 高額インフラ増強計画', 'est' => 15_000_000, 'days' => 200],
            ['user' => 'saburo', 'dept_manager' => 'yumi', 'title' => '開発3部 外部 SaaS 全社導入', 'est' => 12_000_000, 'days' => 150],
        ];
        foreach ($patterns as $p) {
            $u = $this->users[$p['user']];
            $deptMgr = $this->users[$p['dept_manager']];
            $project = $this->upsert([
                'project_code' => $this->nextCode(),
                'title' => $p['title'],
                'purpose' => '費用対効果不足で本部却下',
                'description' => '本部での却下シナリオ。',
                'applicant_id' => $u->id,
                'department_id' => $u->department_id,
                'primary_assignee_id' => $u->id,
                'status' => ProjectStatus::Rejected,
                'estimated_amount' => $p['est'],
                'estimated_days' => $p['days'],
                'actual_amount' => 0,
                'submitted_at' => $this->base->copy()->addDays(7),
                'approved_at' => null,
                'rejected_at' => $this->base->copy()->addDays(10),
                'revision' => 1,
                'parent_project_id' => null,
            ]);
            $this->resetApprovals($project, [
                ['level' => ApprovalLevel::Dept, 'action' => ApprovalAction::Approved, 'approver_id' => $deptMgr->id, 'comment' => '部門承認。', 'acted_at' => $this->base->copy()->addDays(8)],
                ['level' => ApprovalLevel::Hq, 'action' => ApprovalAction::Rejected, 'approver_id' => $this->users['hq']->id, 'comment' => '費用対効果の再検討が必要。', 'acted_at' => $this->base->copy()->addDays(10)],
            ]);
        }
    }

    // ─────────────────────────────────────────────────────────────
    // P-12: 再申請チェイン（却下 → 再申請 → 承認済）
    // ─────────────────────────────────────────────────────────────
    private function seedP12RechainRejectedThenApproved(): void
    {
        $patterns = [
            ['user' => 'jiro', 'dept_manager' => 'shinji', 'title' => '設備保全データ連携', 'est' => 4_000_000, 'days' => 80, 'est2' => 4_200_000, 'days2' => 85, 'budget' => 4_100_000, 'actual' => 1_435_000],
            ['user' => 'saburo', 'dept_manager' => 'yumi', 'title' => '顧客対応履歴の統合', 'est' => 3_500_000, 'days' => 70, 'est2' => 3_700_000, 'days2' => 75, 'budget' => 3_600_000, 'actual' => 1_260_000],
        ];
        foreach ($patterns as $p) {
            $u = $this->users[$p['user']];
            $deptMgr = $this->users[$p['dept_manager']];

            $parent = $this->upsert([
                'project_code' => $this->nextCode(),
                'title' => '再申請元：'.$p['title'],
                'purpose' => '初回申請（要件不足で却下）',
                'description' => '初回申請は部門で却下された。',
                'applicant_id' => $u->id,
                'department_id' => $u->department_id,
                'primary_assignee_id' => $u->id,
                'status' => ProjectStatus::Rejected,
                'estimated_amount' => $p['est'],
                'estimated_days' => $p['days'],
                'actual_amount' => 0,
                'submitted_at' => $this->base->copy()->subDays(7),
                'approved_at' => null,
                'rejected_at' => $this->base->copy()->subDays(6),
                'revision' => 1,
                'parent_project_id' => null,
            ]);
            $this->resetApprovals($parent, [
                ['level' => ApprovalLevel::Dept, 'action' => ApprovalAction::Rejected, 'approver_id' => $deptMgr->id, 'comment' => '要件が不足。詳細化が必要。', 'acted_at' => $this->base->copy()->subDays(6)],
            ]);

            $child = $this->upsert([
                'project_code' => $this->nextCode(),
                'title' => '再申請：'.$p['title'].'（要件補強版）',
                'purpose' => '却下コメントを反映して再申請',
                'description' => '要件と効果を補強して再申請、承認済み。',
                'applicant_id' => $u->id,
                'department_id' => $u->department_id,
                'primary_assignee_id' => $u->id,
                'status' => ProjectStatus::Approved,
                'estimated_amount' => $p['est2'],
                'estimated_days' => $p['days2'],
                'budget_amount' => $p['budget'],
                'actual_amount' => $p['actual'],
                'submitted_at' => $this->base->copy()->subDays(5),
                'approved_at' => $this->base->copy()->subDays(2),
                'rejected_at' => null,
                'revision' => 2,
                'parent_project_id' => $parent->id,
            ]);
            $this->resetApprovals($child, [
                ['level' => ApprovalLevel::Dept, 'action' => ApprovalAction::Approved, 'approver_id' => $deptMgr->id, 'comment' => '要件補強を確認、承認。', 'acted_at' => $this->base->copy()->subDays(4)],
                ['level' => ApprovalLevel::Hq, 'action' => ApprovalAction::Approved, 'approver_id' => $this->users['hq']->id, 'comment' => '再申請内容を承認。', 'acted_at' => $this->base->copy()->subDays(2)],
            ]);
        }
    }

    // ─────────────────────────────────────────────────────────────
    // P-13: 再申請チェイン（却下 → 再申請 → 再却下）
    // ─────────────────────────────────────────────────────────────
    private function seedP13RechainRejectedThenRejected(): void
    {
        $patterns = [
            ['user' => 'inoue', 'dept_manager' => 'natsume', 'title' => '画像認識による自動検出', 'est' => 6_000_000, 'days' => 110],
            ['user' => 'jiro', 'dept_manager' => 'shinji', 'title' => '外注先評価システム', 'est' => 5_200_000, 'days' => 95],
        ];
        foreach ($patterns as $p) {
            $u = $this->users[$p['user']];
            $deptMgr = $this->users[$p['dept_manager']];

            $parent = $this->upsert([
                'project_code' => $this->nextCode(),
                'title' => '再申請元：'.$p['title'],
                'purpose' => '初回却下（コスト過大）',
                'description' => '初回はコスト過大で却下。',
                'applicant_id' => $u->id,
                'department_id' => $u->department_id,
                'primary_assignee_id' => $u->id,
                'status' => ProjectStatus::Rejected,
                'estimated_amount' => $p['est'],
                'estimated_days' => $p['days'],
                'actual_amount' => 0,
                'submitted_at' => $this->base->copy()->subDays(10),
                'approved_at' => null,
                'rejected_at' => $this->base->copy()->subDays(9),
                'revision' => 1,
                'parent_project_id' => null,
            ]);
            $this->resetApprovals($parent, [
                ['level' => ApprovalLevel::Dept, 'action' => ApprovalAction::Rejected, 'approver_id' => $deptMgr->id, 'comment' => 'コスト過大。スコープを見直すこと。', 'acted_at' => $this->base->copy()->subDays(9)],
            ]);

            $child = $this->upsert([
                'project_code' => $this->nextCode(),
                'title' => '再申請：'.$p['title'].'（縮小版）',
                'purpose' => '縮小スコープで再申請するも再却下',
                'description' => 'スコープ縮小で再申請したが再度却下。',
                'applicant_id' => $u->id,
                'department_id' => $u->department_id,
                'primary_assignee_id' => $u->id,
                'status' => ProjectStatus::Rejected,
                'estimated_amount' => (int) round($p['est'] * 0.7),
                'estimated_days' => (int) round($p['days'] * 0.7),
                'actual_amount' => 0,
                'submitted_at' => $this->base->copy()->subDays(6),
                'approved_at' => null,
                'rejected_at' => $this->base->copy()->subDays(4),
                'revision' => 2,
                'parent_project_id' => $parent->id,
            ]);
            $this->resetApprovals($child, [
                ['level' => ApprovalLevel::Dept, 'action' => ApprovalAction::Approved, 'approver_id' => $deptMgr->id, 'comment' => '縮小スコープでの再申請を部門承認。', 'acted_at' => $this->base->copy()->subDays(5)],
                ['level' => ApprovalLevel::Hq, 'action' => ApprovalAction::Rejected, 'approver_id' => $this->users['hq']->id, 'comment' => '依然として効果が不明確。', 'acted_at' => $this->base->copy()->subDays(4)],
            ]);
        }
    }

    /**
     * @param  array<string, mixed>  $attrs  プロジェクトコードを含む全属性
     */
    private function upsert(array $attrs): Project
    {
        $code = $attrs['project_code'];
        $project = Project::updateOrCreate(['project_code' => $code], $attrs);

        return $project->fresh();
    }

    /**
     * @param  array<int, array{level: ApprovalLevel, action: ApprovalAction, approver_id: int, comment: string|null, acted_at: Carbon}>  $rows
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
