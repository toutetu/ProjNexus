<?php

namespace Database\Seeders;

use App\Enums\ApprovalAction;
use App\Enums\ApprovalLevel;
use App\Enums\NotificationType;
use App\Enums\ProjectStatus;
use App\Enums\TaskPriority;
use App\Enums\TaskStatus;
use App\Enums\TaskType;
use App\Models\Approval;
use App\Models\Notification;
use App\Models\Project;
use App\Models\ProjectWorkItem;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Gate;

/**
 * デモ用ワークロードシーダー。
 *
 * 担当範囲（`materials/Design/seed_scenarios.md` 準拠）：
 *  - PRJ-DEMO-* の承認済案件 3 件（EAM / DASH / AUTH）の維持
 *  - 全承認済案件（PRJ-SEED-* + PRJ-DEMO-*）に対するタスク投入
 *    - T-01〜T-14 のシナリオを各案件で網羅
 *    - 全ユーザー 10 名を担当者・確認者として巡回割当
 *  - 通知 N-01〜N-09 を 9 タイプ × 未読/既読 × 全ユーザー網羅で投入
 */
class DemoWorkloadSeeder extends Seeder
{
    /** @var array<string, User> */
    private array $users = [];

    /** @var array<int, User> 巡回割当用の順序付きリスト */
    private array $userCycle = [];

    private Carbon $base;

    private Carbon $today;

    public function run(): void
    {
        $this->loadUsers();
        $this->base = Carbon::now()->subDays(14);
        $this->today = Carbon::today();

        $this->seedDemoProjects();

        // タスクと通知は本シーダーが全権で管理する。既存データを全削除して再投入。
        ProjectWorkItem::query()->delete();
        Notification::query()->delete();

        $this->seedTasksForApprovedProjects();
        $this->seedNotifications();
    }

    // ─────────────────────────────────────────────────────────────
    // ユーザーのロード
    // ─────────────────────────────────────────────────────────────
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

        // 巡回用：開発1部・開発2部・開発3部・本部の順で 10 名
        $this->userCycle = [
            $this->users['takahashi'],
            $this->users['sato'],
            $this->users['inoue'],
            $this->users['suzuki'],
            $this->users['natsume'],
            $this->users['jiro'],
            $this->users['shinji'],
            $this->users['saburo'],
            $this->users['yumi'],
            $this->users['hq'],
        ];
    }

    // ─────────────────────────────────────────────────────────────
    // PRJ-DEMO-* の承認済案件（3 件）
    // ─────────────────────────────────────────────────────────────
    private function seedDemoProjects(): void
    {
        $this->seedApprovedDemoProject(
            code: 'PRJ-DEMO-EAM',
            attrs: [
                'title' => '次世代 EAM システム開発',
                'purpose' => '承認ワークフローと資産管理の統合',
                'description' => 'モック PRJ-0042 相当の承認済み案件。',
                'applicant_id' => $this->users['takahashi']->id,
                'department_id' => $this->users['takahashi']->department_id,
                'primary_assignee_id' => $this->users['takahashi']->id,
                'estimated_amount' => 12_000_000,
                'estimated_days' => 120,
                'budget_amount' => 11_500_000,
                'actual_amount' => 4_200_000,
                'submitted_at' => $this->base->copy()->addDay(),
                'approved_at' => $this->base->copy()->addDays(3),
            ],
            deptApproverId: $this->users['natsume']->id,
            hqApproverId: $this->users['hq']->id,
            deptActedAt: $this->base->copy()->addDays(2),
            hqActedAt: $this->base->copy()->addDays(3),
        );

        $this->seedApprovedDemoProject(
            code: 'PRJ-DEMO-DASH',
            attrs: [
                'title' => '保全ダッシュボード PoC',
                'purpose' => '保全指標の可視化',
                'description' => 'モック PRJ-0045 相当。',
                'applicant_id' => $this->users['sato']->id,
                'department_id' => $this->users['sato']->department_id,
                'primary_assignee_id' => $this->users['sato']->id,
                'estimated_amount' => 4_500_000,
                'estimated_days' => 45,
                'budget_amount' => 4_000_000,
                'actual_amount' => 1_100_000,
                'submitted_at' => $this->base->copy()->addDays(2),
                'approved_at' => $this->base->copy()->addDays(5),
            ],
            deptApproverId: $this->users['natsume']->id,
            hqApproverId: $this->users['hq']->id,
            deptActedAt: $this->base->copy()->addDays(4),
            hqActedAt: $this->base->copy()->addDays(5),
        );

        $this->seedApprovedDemoProject(
            code: 'PRJ-DEMO-AUTH',
            attrs: [
                'title' => '認証基盤刷新',
                'purpose' => 'RoPo の統一と監査性向上',
                'description' => 'モック PRJ-0048 相当。',
                'applicant_id' => $this->users['inoue']->id,
                'department_id' => $this->users['inoue']->department_id,
                'primary_assignee_id' => $this->users['inoue']->id,
                'estimated_amount' => 8_800_000,
                'estimated_days' => 90,
                'budget_amount' => 8_500_000,
                'actual_amount' => 2_000_000,
                'submitted_at' => $this->base->copy()->addDays(3),
                'approved_at' => $this->base->copy()->addDays(6),
            ],
            deptApproverId: $this->users['natsume']->id,
            hqApproverId: $this->users['hq']->id,
            deptActedAt: $this->base->copy()->addDays(5),
            hqActedAt: $this->base->copy()->addDays(6),
        );
    }

    /**
     * @param  array<string, mixed>  $attrs
     */
    private function seedApprovedDemoProject(
        string $code,
        array $attrs,
        int $deptApproverId,
        int $hqApproverId,
        Carbon $deptActedAt,
        Carbon $hqActedAt,
    ): Project {
        $project = Project::updateOrCreate(
            ['project_code' => $code],
            [
                'project_code' => $code,
                ...$attrs,
                'status' => ProjectStatus::Approved,
                'rejected_at' => null,
                'revision' => 1,
                'parent_project_id' => null,
                'actual_amount' => $attrs['actual_amount'] ?? 0,
            ],
        );

        Approval::query()->where('project_id', $project->id)->delete();
        Approval::query()->create([
            'project_id' => $project->id,
            'level' => ApprovalLevel::Dept,
            'action' => ApprovalAction::Approved,
            'approver_id' => $deptApproverId,
            'comment' => 'デモデータ：部門承認',
            'acted_at' => $deptActedAt,
        ]);
        Approval::query()->create([
            'project_id' => $project->id,
            'level' => ApprovalLevel::Hq,
            'action' => ApprovalAction::Approved,
            'approver_id' => $hqApproverId,
            'comment' => 'デモデータ：本部承認',
            'acted_at' => $hqActedAt,
        ]);

        return $project->fresh();
    }

    // ─────────────────────────────────────────────────────────────
    // タスク（全承認済案件 × T-01〜T-14 × 全ユーザー巡回）
    // ─────────────────────────────────────────────────────────────
    private function seedTasksForApprovedProjects(): void
    {
        $projects = Project::query()
            ->where('status', ProjectStatus::Approved->value)
            ->orderBy('id')
            ->get();

        $assigneeCursor = 0;
        $reviewerCursor = 4; // 担当者と確認者がなるべく重ならないようオフセット

        foreach ($projects as $project) {
            $deptManager = $this->resolveDeptManager($project);
            $scenarios = $this->taskScenarios($project, $deptManager);

            foreach ($scenarios as $scenario) {
                $assignee = $scenario['assignee_null']
                    ? null
                    : $this->userCycle[$assigneeCursor % count($this->userCycle)];

                $reviewer = $scenario['reviewer_dept_manager']
                    ? $deptManager
                    : $this->userCycle[$reviewerCursor % count($this->userCycle)];

                // 担当者と確認者は同一にしない（同一になった場合は確認者を 1 ステップずらす）
                if ($assignee !== null && $reviewer->id === $assignee->id) {
                    $reviewer = $this->userCycle[($reviewerCursor + 1) % count($this->userCycle)];
                }

                $baseEstimate = round(4 + (($project->id + strlen($scenario['title'])) % 8) * 1.75, 2);
                $actualDays = match ($scenario['status']) {
                    TaskStatus::Closed => round($baseEstimate * 0.92, 2),
                    TaskStatus::Resolved => round($baseEstimate * 0.55, 2),
                    TaskStatus::InProgress => round($baseEstimate * 0.38, 2),
                    default => 0.0,
                };

                ProjectWorkItem::query()->create([
                    'project_id' => $project->id,
                    'parent_id' => null,
                    'assignee_id' => $assignee?->id,
                    'reviewer_id' => $reviewer->id,
                    'created_by' => $deptManager->id,
                    'milestone_id' => null,
                    'title' => $scenario['title'],
                    'description' => $scenario['description'],
                    'task_type' => $scenario['task_type'],
                    'priority' => $scenario['priority'],
                    'category' => null,
                    'status' => $scenario['status'],
                    'progress_rate' => $scenario['progress_rate'],
                    'estimated_days' => $baseEstimate,
                    'actual_days' => $actualDays,
                    'start_date' => $scenario['start_date'],
                    'due_date' => $scenario['due_date'],
                ]);

                if (! $scenario['assignee_null']) {
                    $assigneeCursor++;
                }
                $reviewerCursor++;
            }
        }
    }

    /**
     * 案件の `department_id` から部門管理者を解決。見つからなければ本部管理者を返す。
     */
    private function resolveDeptManager(Project $project): User
    {
        $deptId = $project->department_id;
        foreach (['natsume', 'shinji', 'yumi'] as $alias) {
            if ($this->users[$alias]->department_id === $deptId) {
                return $this->users[$alias];
            }
        }

        return $this->users['hq'];
    }

    /**
     * @return list<array{title: string, description: string, task_type: TaskType, priority: TaskPriority, status: TaskStatus, progress_rate: int, start_date: Carbon, due_date: Carbon|null, assignee_null: bool, reviewer_dept_manager: bool}>
     */
    private function taskScenarios(Project $project, User $deptManager): array
    {
        $t = $this->today;
        $b = $this->base;
        $titlePrefix = sprintf('[%s] ', $this->shortProjectLabel($project));

        return [
            // T-01: 未着手・将来期限
            [
                'title' => $titlePrefix.'要件レビュー会の準備',
                'description' => 'T-01：未着手・将来期限。',
                'task_type' => TaskType::Task,
                'priority' => TaskPriority::Medium,
                'status' => TaskStatus::Open,
                'progress_rate' => 0,
                'start_date' => $b->copy(),
                'due_date' => $t->copy()->addDays(18),
                'assignee_null' => false,
                'reviewer_dept_manager' => true,
            ],
            // T-02: 未着手・期限間近（3日以内）
            [
                'title' => $titlePrefix.'仕様レビュー指摘の整理',
                'description' => 'T-02：未着手・期限間近（期限3日以内）。',
                'task_type' => TaskType::Task,
                'priority' => TaskPriority::High,
                'status' => TaskStatus::Open,
                'progress_rate' => 0,
                'start_date' => $b->copy(),
                'due_date' => $t->copy()->addDays(2),
                'assignee_null' => false,
                'reviewer_dept_manager' => true,
            ],
            // T-03: 未着手・期限超過
            [
                'title' => $titlePrefix.'対応漏れのインシデント追跡',
                'description' => 'T-03：未着手・期限超過（赤色アラート）。',
                'task_type' => TaskType::Bug,
                'priority' => TaskPriority::High,
                'status' => TaskStatus::Open,
                'progress_rate' => 0,
                'start_date' => $b->copy(),
                'due_date' => $t->copy()->subDays(3),
                'assignee_null' => false,
                'reviewer_dept_manager' => true,
            ],
            // T-04: 未着手・期限未設定
            [
                'title' => $titlePrefix.'今後の改善アイデア整理',
                'description' => 'T-04：未着手・期限未設定。',
                'task_type' => TaskType::Improvement,
                'priority' => TaskPriority::Low,
                'status' => TaskStatus::Open,
                'progress_rate' => 0,
                'start_date' => $b->copy(),
                'due_date' => null,
                'assignee_null' => false,
                'reviewer_dept_manager' => true,
            ],
            // T-05: 進行中・初期段階
            [
                'title' => $titlePrefix.'基本設計ドキュメントの作成',
                'description' => 'T-05：進行中・初期段階。',
                'task_type' => TaskType::Task,
                'priority' => TaskPriority::Medium,
                'status' => TaskStatus::InProgress,
                'progress_rate' => 22,
                'start_date' => $b->copy(),
                'due_date' => $t->copy()->addDays(7),
                'assignee_null' => false,
                'reviewer_dept_manager' => true,
            ],
            // T-06: 進行中・終盤
            [
                'title' => $titlePrefix.'結合テスト実施と不具合修正',
                'description' => 'T-06：進行中・終盤（期限間近）。',
                'task_type' => TaskType::Feature,
                'priority' => TaskPriority::High,
                'status' => TaskStatus::InProgress,
                'progress_rate' => 75,
                'start_date' => $b->copy()->subDays(5),
                'due_date' => $t->copy()->addDays(2),
                'assignee_null' => false,
                'reviewer_dept_manager' => true,
            ],
            // T-07: 進行中・期限超過
            [
                'title' => $titlePrefix.'パフォーマンス改善対応',
                'description' => 'T-07：進行中・期限超過。',
                'task_type' => TaskType::Improvement,
                'priority' => TaskPriority::Medium,
                'status' => TaskStatus::InProgress,
                'progress_rate' => 50,
                'start_date' => $b->copy()->subDays(8),
                'due_date' => $t->copy()->subDays(2),
                'assignee_null' => false,
                'reviewer_dept_manager' => true,
            ],
            // T-08: 確認待ち（resolved）
            [
                'title' => $titlePrefix.'機能実装の完了報告（確認待ち）',
                'description' => 'T-08：確認待ち（実装者の完了報告後・確認者待ち）。',
                'task_type' => TaskType::Feature,
                'priority' => TaskPriority::Medium,
                'status' => TaskStatus::Resolved,
                'progress_rate' => 95,
                'start_date' => $b->copy()->subDays(7),
                'due_date' => $t->copy()->addDays(1),
                'assignee_null' => false,
                'reviewer_dept_manager' => true,
            ],
            // T-09: 完了（closed）
            [
                'title' => $titlePrefix.'リリースアナウンス（クローズ済み）',
                'description' => 'T-09：完了（確認 OK 済み）。',
                'task_type' => TaskType::Task,
                'priority' => TaskPriority::Medium,
                'status' => TaskStatus::Closed,
                'progress_rate' => 100,
                'start_date' => $b->copy()->subDays(10),
                'due_date' => $t->copy()->subDays(5),
                'assignee_null' => false,
                'reviewer_dept_manager' => true,
            ],
            // T-10: 担当者未割当（バックログ）
            [
                'title' => $titlePrefix.'バックログ：詳細未確定のタスク',
                'description' => 'T-10：担当者未割当（バックログ）。',
                'task_type' => TaskType::Task,
                'priority' => TaskPriority::Low,
                'status' => TaskStatus::Open,
                'progress_rate' => 0,
                'start_date' => $b->copy(),
                'due_date' => null,
                'assignee_null' => true,
                'reviewer_dept_manager' => true,
            ],
            // T-11: 本部承認時自動投入「実装計画作成」（残置）
            [
                'title' => $titlePrefix.'実装計画作成（承認時自動投入相当）',
                'description' => 'T-11：本部承認時に自動投入される初期タスク。',
                'task_type' => TaskType::Task,
                'priority' => TaskPriority::Medium,
                'status' => TaskStatus::InProgress,
                'progress_rate' => 40,
                'start_date' => $b->copy(),
                'due_date' => $t->copy()->addDays(10),
                'assignee_null' => false,
                'reviewer_dept_manager' => true,
            ],
            // T-12: バグ・高優先度
            [
                'title' => $titlePrefix.'高優先度バグの調査',
                'description' => 'T-12：バグ・高優先度。',
                'task_type' => TaskType::Bug,
                'priority' => TaskPriority::High,
                'status' => TaskStatus::InProgress,
                'progress_rate' => 35,
                'start_date' => $b->copy(),
                'due_date' => $t->copy()->addDays(3),
                'assignee_null' => false,
                'reviewer_dept_manager' => true,
            ],
            // T-13: 改善・低優先度・遠い期限
            [
                'title' => $titlePrefix.'リファクタリング候補リスト整理',
                'description' => 'T-13：改善・低優先度・遠い期限。',
                'task_type' => TaskType::Improvement,
                'priority' => TaskPriority::Low,
                'status' => TaskStatus::Open,
                'progress_rate' => 0,
                'start_date' => $b->copy(),
                'due_date' => $t->copy()->addDays(35),
                'assignee_null' => false,
                'reviewer_dept_manager' => true,
            ],
            // T-14: 機能追加・確認者を巡回（部門管理者以外）
            [
                'title' => $titlePrefix.'機能追加：UI 改善対応',
                'description' => 'T-14：機能追加・確認者は別ユーザーで巡回。',
                'task_type' => TaskType::Feature,
                'priority' => TaskPriority::Medium,
                'status' => TaskStatus::Resolved,
                'progress_rate' => 90,
                'start_date' => $b->copy()->subDays(3),
                'due_date' => $t->copy()->addDays(8),
                'assignee_null' => false,
                'reviewer_dept_manager' => false,
            ],
        ];
    }

    private function shortProjectLabel(Project $project): string
    {
        return $project->project_code ?: '#'.$project->id;
    }

    // ─────────────────────────────────────────────────────────────
    // 通知（N-01〜N-09 × 未読/既読 × 全ユーザー網羅）
    // ─────────────────────────────────────────────────────────────
    private function seedNotifications(): void
    {
        $now = Carbon::now();

        $entries = [
            // N-01: 申請提出
            ...$this->buildNotificationPair(
                type: NotificationType::ProjectSubmitted,
                title: '申請を受け付けました',
                bodyFor: fn (Project $p) => sprintf('案件「%s」を申請しました。', $p->title),
                receiversUnread: ['takahashi', 'jiro'],
                receiversRead: ['saburo', 'natsume'],
                poolUnread: 'pending_hq',
                poolRead: 'approved',
                readShiftDays: 3,
                now: $now,
            ),

            // N-02: 承認完了
            ...$this->buildNotificationPair(
                type: NotificationType::ProjectApproved,
                title: '本部承認が完了しました',
                bodyFor: fn (Project $p) => sprintf('案件「%s」の本部承認が完了しました。', $p->title),
                receiversUnread: ['takahashi', 'sato'],
                receiversRead: ['jiro', 'inoue'],
                poolUnread: 'approved',
                poolRead: 'approved',
                readShiftDays: 5,
                now: $now,
            ),

            // N-03: 却下
            ...$this->buildNotificationPair(
                type: NotificationType::ProjectRejected,
                title: '案件が却下されました',
                bodyFor: fn (Project $p) => sprintf('案件「%s」が却下されました。コメントを確認してください。', $p->title),
                receiversUnread: ['sato', 'jiro'],
                receiversRead: ['inoue', 'saburo'],
                poolUnread: 'rejected',
                poolRead: 'rejected',
                readShiftDays: 7,
                now: $now,
            ),

            // N-04: 取り戻し
            ...$this->buildNotificationPair(
                type: NotificationType::ProjectReturned,
                title: '申請が下書きへ戻されました',
                bodyFor: fn (Project $p) => sprintf('案件「%s」が申請者により取り戻されました。', $p->title),
                receiversUnread: ['natsume', 'shinji'],
                receiversRead: ['yumi', 'hq'],
                poolUnread: 'pending_hq',
                poolRead: 'approved',
                readShiftDays: 4,
                now: $now,
            ),

            // N-05: タスク担当割当
            ...$this->buildNotificationPair(
                type: NotificationType::TaskAssigned,
                title: 'タスクが割り当てられました',
                bodyFor: fn (Project $p) => sprintf('案件「%s」で新しいタスクの担当に設定されました。', $p->title),
                receiversUnread: ['inoue', 'suzuki'],
                receiversRead: ['takahashi', 'sato'],
                poolUnread: 'approved',
                poolRead: 'approved',
                withTaskMeta: true,
                readShiftDays: 2,
                now: $now,
            ),

            // N-06: タスク期限間近
            ...$this->buildNotificationPair(
                type: NotificationType::TaskDueSoon,
                title: 'タスク期限が近づいています',
                bodyFor: fn (Project $p) => sprintf('案件「%s」のタスクが期限間近です。', $p->title),
                receiversUnread: ['suzuki', 'takahashi'],
                receiversRead: ['sato', 'jiro'],
                poolUnread: 'approved',
                poolRead: 'approved',
                withTaskMeta: true,
                readShiftDays: 1,
                now: $now,
            ),

            // N-07: 確認依頼（resolved）
            ...$this->buildNotificationPair(
                type: NotificationType::TaskResolved,
                title: 'タスクの確認依頼があります',
                bodyFor: fn (Project $p) => sprintf('案件「%s」で確認待ちのタスクがあります。', $p->title),
                receiversUnread: ['natsume', 'shinji'],
                receiversRead: ['yumi', 'natsume'],
                poolUnread: 'approved',
                poolRead: 'approved',
                withTaskMeta: true,
                readShiftDays: 3,
                now: $now,
            ),

            // N-08: 確認OK
            ...$this->buildNotificationPair(
                type: NotificationType::TaskReviewed,
                title: 'タスクが確認OKになりました',
                bodyFor: fn (Project $p) => sprintf('案件「%s」のタスクが確認 OK でクローズされました。', $p->title),
                receiversUnread: ['takahashi', 'inoue'],
                receiversRead: ['jiro', 'sato'],
                poolUnread: 'approved',
                poolRead: 'approved',
                withTaskMeta: true,
                readShiftDays: 6,
                now: $now,
            ),

            // N-09: タスク完了（互換）
            ...$this->buildNotificationPair(
                type: NotificationType::TaskCompleted,
                title: 'タスクが完了しました',
                bodyFor: fn (Project $p) => sprintf('案件「%s」のタスクが完了しました。', $p->title),
                receiversUnread: ['suzuki', 'saburo'],
                receiversRead: ['takahashi', 'hq'],
                poolUnread: 'approved',
                poolRead: 'approved',
                withTaskMeta: true,
                readShiftDays: 8,
                now: $now,
            ),
        ];

        // 全ユーザー網羅の保険：全員に最低 1 件の未読を保証
        $this->topUpUnreadPerUser($now);

        foreach ($entries as $entry) {
            Notification::query()->create($entry);
        }
    }

    /**
     * @param  list<string>  $receiversUnread
     * @param  list<string>  $receiversRead
     * @return list<array<string, mixed>>
     */
    private function buildNotificationPair(
        NotificationType $type,
        string $title,
        \Closure $bodyFor,
        array $receiversUnread,
        array $receiversRead,
        string $poolUnread,
        string $poolRead,
        int $readShiftDays,
        Carbon $now,
        bool $withTaskMeta = false,
    ): array {
        $entries = [];

        foreach ($receiversUnread as $i => $alias) {
            $user = $this->users[$alias];
            $project = $this->pickProjectForUser($user, $poolUnread, $i);
            if ($project === null) {
                continue;
            }
            $entries[] = [
                'user_id' => $user->id,
                'type' => $type,
                'title' => $title,
                'body' => $bodyFor($project),
                'meta' => $this->buildNotificationMeta($user, $project, $withTaskMeta, $i, 'A_unread'),
                'read_at' => null,
            ];
        }

        foreach ($receiversRead as $i => $alias) {
            $user = $this->users[$alias];
            $project = $this->pickProjectForUser($user, $poolRead, $i);
            if ($project === null) {
                continue;
            }
            $entries[] = [
                'user_id' => $user->id,
                'type' => $type,
                'title' => $title,
                'body' => $bodyFor($project),
                'meta' => $this->buildNotificationMeta($user, $project, $withTaskMeta, $i, 'B_read'),
                'read_at' => $now->copy()->subDays($readShiftDays),
            ];
        }

        return $entries;
    }

    private function pickProjectForUser(User $user, string $pool, int $index): ?Project
    {
        $status = match ($pool) {
            'approved' => ProjectStatus::Approved,
            'rejected' => ProjectStatus::Rejected,
            'pending_hq' => ProjectStatus::PendingHq,
            default => null,
        };

        if ($status === null) {
            return null;
        }

        $visible = $this->visibleProjectsFor($user, $status);
        if ($visible->isEmpty()) {
            return null;
        }

        return $visible[$index % $visible->count()];
    }

    /**
     * @return Collection<int, Project>
     */
    private function visibleProjectsFor(User $user, ProjectStatus $status): Collection
    {
        return Project::query()
            ->where('status', $status->value)
            ->orderBy('id')
            ->get()
            ->filter(fn (Project $project) => Gate::forUser($user)->allows('view', $project))
            ->values();
    }

    /**
     * @return array<string, mixed>
     */
    private function buildNotificationMeta(
        User $user,
        Project $project,
        bool $withTaskMeta,
        int $index,
        string $pattern,
    ): array {
        $meta = [
            'project_id' => $project->id,
            'pattern' => $pattern,
        ];

        if (! $withTaskMeta) {
            return $meta;
        }

        $task = ProjectWorkItem::query()
            ->where('project_id', $project->id)
            ->where(function ($query) use ($user): void {
                $query
                    ->where('assignee_id', $user->id)
                    ->orWhere('reviewer_id', $user->id);
            })
            ->orderBy('id')
            ->first();

        if ($task === null) {
            $task = ProjectWorkItem::query()
                ->where('project_id', $project->id)
                ->orderBy('id')
                ->skip($index)
                ->first();
        }

        if ($task !== null) {
            $meta['task_id'] = $task->id;
        }

        return $meta;
    }

    /**
     * 全ユーザー網羅の保険：未読通知を一切受け取らないユーザーが出ないよう、追加で未読通知を入れる。
     */
    private function topUpUnreadPerUser(Carbon $now): void
    {
        foreach ($this->userCycle as $i => $user) {
            $project = $this->pickProjectForUser($user, 'approved', $i);
            if ($project === null) {
                continue;
            }

            Notification::query()->create([
                'user_id' => $user->id,
                'type' => NotificationType::TaskAssigned,
                'title' => 'タスクが割り当てられました',
                'body' => sprintf('案件「%s」のタスクが新しく割り当てられました。', $project->title),
                'meta' => $this->buildNotificationMeta($user, $project, true, $i, 'top_up_unread'),
                'read_at' => null,
            ]);
        }
    }
}
