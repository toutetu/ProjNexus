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

        $base = Carbon::now()->subDays(14);

        $this->seedProjectWave(
            base: $base,
            hq: $hq,
            applicant1: $applicant1,
            dept1Manager: $dept1Manager,
            applicant2: $applicant2,
            dept2Manager: $dept2Manager,
            codeOffset: 0,
            titleSuffix: '',
        );

        $this->seedProjectWave(
            base: $base->copy()->addDay(),
            hq: $hq,
            applicant1: $applicant1,
            dept1Manager: $dept1Manager,
            applicant2: $applicant2,
            dept2Manager: $dept2Manager,
            codeOffset: 22,
            titleSuffix: '（第2系）',
        );
    }

    /**
     * 11 シナリオ × 各2案件 × ウェーブ（計22件/ウェーブ）。project_code は PRJ-SEED-{codeOffset+1} … {codeOffset+22}。
     * 開発1部・開発2部のみ（開発3部には案件を作らない）。
     */
    private function seedProjectWave(
        Carbon $base,
        User $hq,
        User $applicant1,
        User $dept1Manager,
        User $applicant2,
        User $dept2Manager,
        int $codeOffset,
        string $titleSuffix,
    ): void {
        $seq = 0;
        $nextCode = function () use (&$seq, $codeOffset): string {
            $seq++;

            return sprintf('PRJ-SEED-%04d', $codeOffset + $seq);
        };
        $t = fn (string $title): string => $title.$titleSuffix;
        $dupLabel = fn (bool $dup): string => $dup ? '（複製）' : '';

        foreach ([false, true] as $dup) {
            $d = $dupLabel($dup);
            $p = $this->upsertProject(
                projectCode: $nextCode(),
                attrs: [
                    'title' => $t('設備点検モバイル入力 PoC'.$d),
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
            $this->syncProjectTasks($p, $dept1Manager, $base);
        }

        foreach ([false, true] as $dup) {
            $d = $dupLabel($dup);
            $p = $this->upsertProject(
                projectCode: $nextCode(),
                attrs: [
                    'title' => $t('配管図OCR自動分類ツール'.$d),
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
            $this->syncProjectTasks($p, $dept1Manager, $base);
        }

        foreach ([false, true] as $dup) {
            $d = $dupLabel($dup);
            $pendingHqNormal = $this->upsertProject(
                projectCode: $nextCode(),
                attrs: [
                    'title' => $t('現場センサーデータ統合基盤'.$d),
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
            $this->syncProjectTasks($pendingHqNormal, $dept1Manager, $base);
        }

        foreach ([false, true] as $dup) {
            $d = $dupLabel($dup);
            $p = $this->upsertProject(
                projectCode: $nextCode(),
                attrs: [
                    'title' => $t('部門長起案：工数予実ダッシュボード'.$d),
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
            $this->syncProjectTasks($p, $dept1Manager, $base);
        }

        foreach ([false, true] as $dup) {
            $d = $dupLabel($dup);
            $approved1 = $this->upsertProject(
                projectCode: $nextCode(),
                attrs: [
                    'title' => $t('EAM次世代ワークフロー改善'.$d),
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
            $this->syncProjectTasks($approved1, $dept1Manager, $base);
        }

        foreach ([false, true] as $dup) {
            $d = $dupLabel($dup);
            $approved2a = $this->upsertProject(
                projectCode: $nextCode(),
                attrs: [
                    'title' => $t('開発2部：CI高速化基盤整備'.$d),
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
            $this->resetApprovals($approved2a, [
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
            $this->syncProjectTasks($approved2a, $dept2Manager, $base);
        }

        foreach ([false, true] as $dup) {
            $d = $dupLabel($dup);
            $approved2b = $this->upsertProject(
                projectCode: $nextCode(),
                attrs: [
                    'title' => $t('開発2部：障害分析ナレッジ蓄積'.$d),
                    'purpose' => '障害再発防止の仕組み化',
                    'description' => '障害原因と対応策を構造化し、検索できるようにする。',
                    'applicant_id' => $applicant2->id,
                    'department_id' => $applicant2->department_id,
                    'primary_assignee_id' => $applicant2->id,
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
            $this->resetApprovals($approved2b, [
                [
                    'level' => ApprovalLevel::Dept,
                    'action' => ApprovalAction::Approved,
                    'approver_id' => $dept2Manager->id,
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
            $this->syncProjectTasks($approved2b, $dept2Manager, $base);
        }

        foreach ([false, true] as $dup) {
            $d = $dupLabel($dup);
            $rejectedDept = $this->upsertProject(
                projectCode: $nextCode(),
                attrs: [
                    'title' => $t('開発2部：旧システム全面置換'.$d),
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
            $this->syncProjectTasks($rejectedDept, $dept2Manager, $base);
        }

        foreach ([false, true] as $dup) {
            $d = $dupLabel($dup);
            $rejectedHq = $this->upsertProject(
                projectCode: $nextCode(),
                attrs: [
                    'title' => $t('開発1部：高額インフラ増強計画'.$d),
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
            $this->syncProjectTasks($rejectedHq, $dept1Manager, $base);
        }

        foreach ([false, true] as $dup) {
            $d = $dupLabel($dup);
            $parentRejected = $this->upsertProject(
                projectCode: $nextCode(),
                attrs: [
                    'title' => $t('再申請元：設備保全データ連携'.$d),
                    'purpose' => '保全計画の精度向上',
                    'description' => '初回申請は部門で却下。',
                    'applicant_id' => $applicant2->id,
                    'department_id' => $applicant2->department_id,
                    'primary_assignee_id' => $applicant2->id,
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
                    'approver_id' => $dept2Manager->id,
                    'comment' => '要件が不足。詳細化が必要。',
                    'acted_at' => $base->copy()->subDays(6),
                ],
            ]);
            $this->syncProjectTasks($parentRejected, $dept2Manager, $base);

            $resubmittedApproved = $this->upsertProject(
                projectCode: $nextCode(),
                attrs: [
                    'title' => $t('再申請：設備保全データ連携（要件補強版）'.$d),
                    'purpose' => '保全計画の精度向上',
                    'description' => '却下コメントを反映し、要件と効果を補強して再申請。',
                    'applicant_id' => $applicant2->id,
                    'department_id' => $applicant2->department_id,
                    'primary_assignee_id' => $applicant2->id,
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
                    'approver_id' => $dept2Manager->id,
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
            $this->syncProjectTasks($resubmittedApproved, $dept2Manager, $base);
        }

        if ($seq !== 22) {
            throw new \RuntimeException("seedProjectWave は22件の案件コードを消費する必要があります（実際: {$seq}）。");
        }
    }

    private function syncProjectTasks(Project $project, User $reviewer, Carbon $base): void
    {
        $project = $project->fresh();

        $assigneeId = $project->primary_assignee_id;
        $createdById = $reviewer->id;

        ProjectWorkItem::query()->where('project_id', $project->id)->delete();

        $today = Carbon::today();
        foreach ($this->taskRowSpecs($project->status, $project->id, $assigneeId, $reviewer->id, $createdById, $today, $base) as $spec) {
            $baseEstimate = $spec['estimated_days'];
            $status = $spec['status'];
            $actualDays = match ($status) {
                TaskStatus::Closed => round($baseEstimate * 0.92, 2),
                TaskStatus::Resolved => round($baseEstimate * 0.55, 2),
                TaskStatus::InProgress => round($baseEstimate * 0.38, 2),
                default => 0.0,
            };

            ProjectWorkItem::query()->create([
                ...$spec,
                'estimated_days' => $baseEstimate,
                'actual_days' => $actualDays,
            ]);
        }
    }

    /**
     * @return iterable<int, array<string, mixed>>
     */
    private function taskRowSpecs(
        ProjectStatus $projectStatus,
        int $projectId,
        int $assigneeId,
        int $reviewerId,
        int $createdById,
        Carbon $today,
        Carbon $base,
    ): iterable {
        $e = fn (int $seed): float => round(4 + ($seed % 8) * 1.75, 2);

        $pendingTitles = [
            'スコープ定義ドラフト作成',
            'ステークホルダーインタビュー設計',
            '既行システム棚卸し',
            '非機能要件の洗い出し',
            'WBS 第0版レビュー',
            'リスク登録簿の初期投入',
            'スプリント0のバックログ整備',
            '技術検証タスク（PoC）',
        ];

        $approvedTitles = [
            'ユーザーストーリー分解と見積',
            '画面遷移図の作成',
            'API 契約ドラフト（OpenAPI）',
            '単体テスト方針ドキュメント',
            '結合テストシナリオ作成',
            '本番移行チェックリスト',
            '運用手順書ドラフト',
            '振り返りアクションの登録',
            'パフォーマンス試験計画',
            'セキュリティレビュー依頼票',
        ];

        $rejectedTitles = [
            '初回見積もり根拠メモ（凍結）',
            '代替案の比較表（途中）',
            '関係部署ヒアリングメモ',
            '投資回収シミュレーション（未完）',
            'プロジェクトクローズ作業（中止）',
        ];

        $draftTitles = [
            '企画書アウトライン作成',
            '類似案件ベンチマーク',
            '概算工数のたたき台',
            '前提条件リスト',
            '未確定事項の整理',
            '下書きレビュー依頼',
        ];

        $pick = function (array $titles, int $i) use ($e): array {
            $title = $titles[$i % count($titles)];

            return [
                'title' => $title,
                'estimated_days' => $e($i + strlen($title)),
            ];
        };

        if ($projectStatus === ProjectStatus::Approved) {
            $mix = [
                [TaskType::Feature, TaskPriority::High, TaskStatus::Open, 0, $today->copy()->addDays(5)],
                [TaskType::Bug, TaskPriority::High, TaskStatus::Open, 0, $today->copy()->addDays(3)],
                [TaskType::Task, TaskPriority::Medium, TaskStatus::InProgress, 40, $today->copy()->addDays(7)],
                [TaskType::Improvement, TaskPriority::Medium, TaskStatus::InProgress, 35, $today->copy()->addDays(10)],
                [TaskType::Feature, TaskPriority::Low, TaskStatus::Resolved, 90, $today->copy()->subDays(2)],
                [TaskType::Task, TaskPriority::Medium, TaskStatus::Resolved, 85, $today->copy()->subDay()],
                [TaskType::Task, TaskPriority::Low, TaskStatus::Closed, 100, $today->copy()->addDays(14)],
                [TaskType::Improvement, TaskPriority::High, TaskStatus::Closed, 100, $today->copy()->addDays(12)],
                [TaskType::Feature, TaskPriority::Medium, TaskStatus::Open, 0, $today->copy()->addDays(20)],
                [TaskType::Task, TaskPriority::Low, TaskStatus::InProgress, 25, $today->copy()->addDays(30)],
            ];

            foreach ($mix as $i => [$type, $pri, $st, $prog, $due]) {
                $row = $pick($approvedTitles, $i);

                yield [
                    'project_id' => $projectId,
                    'parent_id' => null,
                    'assignee_id' => $assigneeId,
                    'reviewer_id' => $reviewerId,
                    'created_by' => $createdById,
                    'milestone_id' => null,
                    'title' => $row['title'],
                    'description' => 'シードデータ：承認済み案件のタスク。',
                    'task_type' => $type,
                    'priority' => $pri,
                    'category' => null,
                    'status' => $st,
                    'progress_rate' => $prog,
                    'start_date' => $base->copy()->subDays(10 - $i),
                    'due_date' => $due,
                    'estimated_days' => $row['estimated_days'],
                ];
            }

            return;
        }

        if ($projectStatus === ProjectStatus::Rejected) {
            $mix = [
                [TaskType::Task, TaskPriority::Medium, TaskStatus::Closed, 100, $today->copy()->subDays(4)],
                [TaskType::Feature, TaskPriority::Low, TaskStatus::Closed, 100, $today->copy()->subDays(3)],
                [TaskType::Task, TaskPriority::High, TaskStatus::Resolved, 80, $today->copy()->subDays(8)],
                [TaskType::Improvement, TaskPriority::Medium, TaskStatus::Resolved, 70, $today->copy()->subDays(6)],
                [TaskType::Bug, TaskPriority::Low, TaskStatus::Open, 0, $today->copy()->addDays(60)],
                [TaskType::Task, TaskPriority::Low, TaskStatus::Open, 0, $today->copy()->addDays(90)],
            ];

            foreach ($mix as $i => [$type, $pri, $st, $prog, $due]) {
                $row = $pick($rejectedTitles, $i);

                yield [
                    'project_id' => $projectId,
                    'parent_id' => null,
                    'assignee_id' => $assigneeId,
                    'reviewer_id' => $reviewerId,
                    'created_by' => $createdById,
                    'milestone_id' => null,
                    'title' => $row['title'],
                    'description' => 'シードデータ：却下案件に紐づくタスク。',
                    'task_type' => $type,
                    'priority' => $pri,
                    'category' => null,
                    'status' => $st,
                    'progress_rate' => $prog,
                    'start_date' => $base->copy()->subDays(12 - $i),
                    'due_date' => $due,
                    'estimated_days' => $row['estimated_days'],
                ];
            }

            return;
        }

        if ($projectStatus === ProjectStatus::Draft) {
            $mix = [
                [TaskType::Task, TaskPriority::Medium, TaskStatus::Open, 0, $today->copy()->addDays(14)],
                [TaskType::Feature, TaskPriority::Low, TaskStatus::Open, 0, $today->copy()->addDays(21)],
                [TaskType::Improvement, TaskPriority::Low, TaskStatus::InProgress, 20, $today->copy()->addDays(10)],
                [TaskType::Task, TaskPriority::High, TaskStatus::InProgress, 15, $today->copy()->addDays(7)],
                [TaskType::Feature, TaskPriority::Medium, TaskStatus::Open, 0, $today->copy()->addDays(30)],
                [TaskType::Task, TaskPriority::Medium, TaskStatus::Resolved, 100, $today->copy()->subDays(1)],
                [TaskType::Improvement, TaskPriority::High, TaskStatus::Open, 0, $today->copy()->addDays(5)],
            ];

            foreach ($mix as $i => [$type, $pri, $st, $prog, $due]) {
                $row = $pick($draftTitles, $i);

                yield [
                    'project_id' => $projectId,
                    'parent_id' => null,
                    'assignee_id' => $assigneeId,
                    'reviewer_id' => $reviewerId,
                    'created_by' => $createdById,
                    'milestone_id' => null,
                    'title' => $row['title'],
                    'description' => 'シードデータ：下書き案件のタスク。',
                    'task_type' => $type,
                    'priority' => $pri,
                    'category' => null,
                    'status' => $st,
                    'progress_rate' => $prog,
                    'start_date' => $base->copy()->subDays(3),
                    'due_date' => $due,
                    'estimated_days' => $row['estimated_days'],
                ];
            }

            return;
        }

        // PendingDept / PendingHq
        $mix = [
            [TaskType::Feature, TaskPriority::High, TaskStatus::Open, 0, $today->copy()->addDays(4)],
            [TaskType::Task, TaskPriority::High, TaskStatus::Open, 0, $today->copy()->addDays(6)],
            [TaskType::Bug, TaskPriority::Medium, TaskStatus::InProgress, 30, $today->copy()->addDays(8)],
            [TaskType::Task, TaskPriority::Medium, TaskStatus::InProgress, 25, $today->copy()->addDays(9)],
            [TaskType::Improvement, TaskPriority::Low, TaskStatus::Open, 0, $today->copy()->addDays(12)],
            [TaskType::Feature, TaskPriority::Medium, TaskStatus::Resolved, 95, $today->copy()->subDays(1)],
            [TaskType::Task, TaskPriority::Low, TaskStatus::Open, 0, $today->copy()->addDays(15)],
            [TaskType::Task, TaskPriority::Medium, TaskStatus::InProgress, 10, $today->copy()->addDays(11)],
        ];

        foreach ($mix as $i => [$type, $pri, $st, $prog, $due]) {
            $row = $pick($pendingTitles, $i);

            yield [
                'project_id' => $projectId,
                'parent_id' => null,
                'assignee_id' => $assigneeId,
                'reviewer_id' => $reviewerId,
                'created_by' => $createdById,
                'milestone_id' => null,
                'title' => $row['title'],
                'description' => 'シードデータ：承認待ち案件のタスク。',
                'task_type' => $type,
                'priority' => $pri,
                'category' => null,
                'status' => $st,
                'progress_rate' => $prog,
                'start_date' => $base->copy()->subDays(5 - min($i, 4)),
                'due_date' => $due,
                'estimated_days' => $row['estimated_days'],
            ];
        }
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
