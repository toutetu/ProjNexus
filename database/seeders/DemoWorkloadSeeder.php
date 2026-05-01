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

/**
 * S-14 モック（s14b_member_tasks_toggle.html）に近い案件・タスク・通知のデモデータ。
 */
class DemoWorkloadSeeder extends Seeder
{
    public function run(): void
    {
        $hq = User::where('email', 'hq@example.com')->firstOrFail();
        $natsume = User::where('email', 'dept@example.com')->firstOrFail();
        $takahashi = User::where('email', 'applicant@example.com')->firstOrFail();
        $sato = User::where('email', 'applicant-dev1-02@example.com')->firstOrFail();
        $inoue = User::where('email', 'applicant-dev1-03@example.com')->firstOrFail();
        $suzuki = User::where('email', 'applicant-dev1-04@example.com')->firstOrFail();

        $base = Carbon::now()->subDays(14);

        $prEam = $this->seedApprovedProject(
            code: 'PRJ-DEMO-EAM',
            attrs: [
                'title' => '次世代EAMシステム開発',
                'purpose' => '承認ワークフローと資産管理の統合',
                'description' => 'モック PRJ-0042 相当の承認済み案件。',
                'applicant_id' => $takahashi->id,
                'department_id' => $takahashi->department_id,
                'primary_assignee_id' => $takahashi->id,
                'estimated_amount' => 12_000_000,
                'estimated_days' => 120,
                'budget_amount' => 11_500_000,
                'actual_amount' => 4_200_000,
                'submitted_at' => $base->copy()->addDay(),
                'approved_at' => $base->copy()->addDays(3),
            ],
            deptApproverId: $natsume->id,
            hqApproverId: $hq->id,
            deptActedAt: $base->copy()->addDays(2),
            hqActedAt: $base->copy()->addDays(3),
        );

        $prDash = $this->seedApprovedProject(
            code: 'PRJ-DEMO-DASH',
            attrs: [
                'title' => '保全ダッシュボードPoC',
                'purpose' => '保全指標の可視化',
                'description' => 'モック PRJ-0045 相当。',
                'applicant_id' => $sato->id,
                'department_id' => $sato->department_id,
                'primary_assignee_id' => $sato->id,
                'estimated_amount' => 4_500_000,
                'estimated_days' => 45,
                'budget_amount' => 4_000_000,
                'actual_amount' => 1_100_000,
                'submitted_at' => $base->copy()->addDays(2),
                'approved_at' => $base->copy()->addDays(5),
            ],
            deptApproverId: $natsume->id,
            hqApproverId: $hq->id,
            deptActedAt: $base->copy()->addDays(4),
            hqActedAt: $base->copy()->addDays(5),
        );

        $prAuth = $this->seedApprovedProject(
            code: 'PRJ-DEMO-AUTH',
            attrs: [
                'title' => '認証基盤刷新',
                'purpose' => 'RoPo の統一と監査性向上',
                'description' => 'モック PRJ-0048 相当。',
                'applicant_id' => $inoue->id,
                'department_id' => $inoue->department_id,
                'primary_assignee_id' => $inoue->id,
                'estimated_amount' => 8_800_000,
                'estimated_days' => 90,
                'budget_amount' => 8_500_000,
                'actual_amount' => 2_000_000,
                'submitted_at' => $base->copy()->addDays(3),
                'approved_at' => $base->copy()->addDays(6),
            ],
            deptApproverId: $natsume->id,
            hqApproverId: $hq->id,
            deptActedAt: $base->copy()->addDays(5),
            hqActedAt: $base->copy()->addDays(6),
        );

        ProjectWorkItem::query()->whereIn('project_id', [$prEam->id, $prDash->id, $prAuth->id])->delete();

        $today = Carbon::today();

        $rows = [
            // --- open (5) ---
            [
                'project_id' => $prEam->id,
                'title' => 'ログイン後のリダイレクト不具合の修正',
                'task_type' => TaskType::Bug,
                'priority' => TaskPriority::High,
                'status' => TaskStatus::Open,
                'progress_rate' => 0,
                'assignee_id' => $takahashi->id,
                'due_date' => $today->copy()->subDays(3),
            ],
            [
                'project_id' => $prDash->id,
                'title' => '予算実績入力の動作確認シナリオ作成',
                'task_type' => TaskType::Task,
                'priority' => TaskPriority::Medium,
                'status' => TaskStatus::Open,
                'progress_rate' => 0,
                'assignee_id' => $sato->id,
                'due_date' => $today->copy()->addDays(3),
            ],
            [
                'project_id' => $prEam->id,
                'title' => 'タスク変更履歴の自動記録（API設計）',
                'task_type' => TaskType::Feature,
                'priority' => TaskPriority::Medium,
                'status' => TaskStatus::Open,
                'progress_rate' => 0,
                'assignee_id' => $inoue->id,
                'due_date' => $today->copy()->addDays(14),
            ],
            [
                'project_id' => $prAuth->id,
                'title' => 'ER図のレビューコメント反映',
                'task_type' => TaskType::Improvement,
                'priority' => TaskPriority::Low,
                'status' => TaskStatus::Open,
                'progress_rate' => 0,
                'assignee_id' => $takahashi->id,
                'due_date' => $today->copy()->addDays(22),
            ],
            [
                'project_id' => $prEam->id,
                'title' => '運用マニュアル草案作成',
                'task_type' => TaskType::Task,
                'priority' => TaskPriority::Low,
                'status' => TaskStatus::Open,
                'progress_rate' => 0,
                'assignee_id' => $natsume->id,
                'due_date' => null,
            ],
            // --- in_progress (4) ---
            [
                'project_id' => $prEam->id,
                'title' => '承認ステッパーUIの大型版実装',
                'task_type' => TaskType::Feature,
                'priority' => TaskPriority::High,
                'status' => TaskStatus::InProgress,
                'progress_rate' => 70,
                'assignee_id' => $takahashi->id,
                'due_date' => $today->copy()->subDays(2),
            ],
            [
                'project_id' => $prAuth->id,
                'title' => '部門管理者ロールでの編集権限の調整',
                'task_type' => TaskType::Bug,
                'priority' => TaskPriority::High,
                'status' => TaskStatus::InProgress,
                'progress_rate' => 25,
                'assignee_id' => $inoue->id,
                'due_date' => $today->copy()->addDays(7),
            ],
            [
                'project_id' => $prDash->id,
                'title' => 'ダッシュボードのカードレイアウト試作',
                'task_type' => TaskType::Feature,
                'priority' => TaskPriority::Low,
                'status' => TaskStatus::InProgress,
                'progress_rate' => 50,
                'assignee_id' => $sato->id,
                'due_date' => $today->copy()->addDays(10),
            ],
            [
                'project_id' => $prDash->id,
                'title' => 'インフラコスト試算シート連携',
                'task_type' => TaskType::Improvement,
                'priority' => TaskPriority::Medium,
                'status' => TaskStatus::InProgress,
                'progress_rate' => 35,
                'assignee_id' => $suzuki->id,
                'due_date' => $today->copy()->addDays(20),
            ],
            // --- resolved (2) ---
            [
                'project_id' => $prDash->id,
                'title' => 'タスク通知（期限接近）の本番動作確認',
                'task_type' => TaskType::Task,
                'priority' => TaskPriority::Medium,
                'status' => TaskStatus::Resolved,
                'progress_rate' => 95,
                'assignee_id' => $sato->id,
                'due_date' => $today->copy()->addDays(2),
                'updated_shift' => '-2 days',
            ],
            [
                'project_id' => $prEam->id,
                'title' => '承認後ロック処理の動作確認',
                'task_type' => TaskType::Feature,
                'priority' => TaskPriority::High,
                'status' => TaskStatus::Resolved,
                'progress_rate' => 90,
                'assignee_id' => $takahashi->id,
                'due_date' => $today->copy()->addDays(5),
                'updated_shift' => '-3 days',
            ],
            // --- closed (3) ---
            [
                'project_id' => $prEam->id,
                'title' => '案件詳細：開発タブ実装',
                'task_type' => TaskType::Task,
                'priority' => TaskPriority::High,
                'status' => TaskStatus::Closed,
                'progress_rate' => 100,
                'assignee_id' => $takahashi->id,
                'due_date' => $today->copy()->addDays(5),
                'updated_shift' => '-3 days',
            ],
            [
                'project_id' => $prDash->id,
                'title' => '予算実績入力モーダルの実装',
                'task_type' => TaskType::Feature,
                'priority' => TaskPriority::Medium,
                'status' => TaskStatus::Closed,
                'progress_rate' => 100,
                'assignee_id' => $sato->id,
                'due_date' => $today->copy()->addDays(8),
                'updated_shift' => '-6 days',
            ],
            [
                'project_id' => $prEam->id,
                'title' => '通知未読バッジの計算ずれ修正',
                'task_type' => TaskType::Bug,
                'priority' => TaskPriority::High,
                'status' => TaskStatus::Closed,
                'progress_rate' => 100,
                'assignee_id' => $inoue->id,
                'due_date' => $today->copy()->addDays(12),
                'updated_shift' => '-10 days',
            ],
        ];

        foreach ($rows as $spec) {
            $updatedShift = $spec['updated_shift'] ?? null;
            unset($spec['updated_shift']);

            $task = ProjectWorkItem::query()->create([
                ...$spec,
                'reviewer_id' => $natsume->id,
                'created_by' => $natsume->id,
            ]);

            if ($updatedShift !== null) {
                $task->timestamps = false;
                $task->forceFill([
                    'updated_at' => Carbon::now()->modify($updatedShift),
                ])->saveQuietly();
                $task->timestamps = true;
            }
        }

        $this->seedNotifications(
            $hq,
            $natsume,
            $takahashi,
            $sato,
            $inoue,
            $prEam,
            $prDash,
        );
    }

    /**
     * @param  array<string, mixed>  $attrs
     */
    private function seedApprovedProject(
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

    private function seedNotifications(
        User $hq,
        User $natsume,
        User $takahashi,
        User $sato,
        User $inoue,
        Project $prEam,
        Project $prDash,
    ): void {
        $now = Carbon::now();

        $samples = [
            [$natsume->id, NotificationType::TaskResolved, 'タスクの確認依頼があります', '案件「'.$prDash->title.'」の確認待ちタスクがあります。', ['project_id' => $prDash->id], null],
            [$natsume->id, NotificationType::TaskResolved, '確認待ち：承認後ロック', '案件「'.$prEam->title.'」で完了報告が届いています。', ['project_id' => $prEam->id], null],
            [$takahashi->id, NotificationType::TaskReviewed, 'タスクが確認OKになりました', '確認者によりタスクがクローズされました。', ['project_id' => $prEam->id], $now->copy()->subDay()],
            [$takahashi->id, NotificationType::TaskAssigned, 'タスクが割り当てられました', '新しいタスクが担当に設定されました。', ['project_id' => $prEam->id], $now->copy()->subDays(2)],
            [$sato->id, NotificationType::TaskDueSoon, 'タスク期限が近づいています', '期限まであと数日のタスクがあります。', ['project_id' => $prDash->id], null],
            [$sato->id, NotificationType::TaskCompleted, 'タスクが完了しました', '予算実績入力モーダルの実装が完了しました。', ['project_id' => $prDash->id], $now->copy()->subDays(6)],
            [$inoue->id, NotificationType::TaskAssigned, 'タスクが割り当てられました', '権限調整タスクが割り当てられました。', ['project_id' => $prEam->id], null],
            [$inoue->id, NotificationType::TaskDueSoon, 'タスク期限が近づいています', '本日期日のタスクがあります。', ['project_id' => $prEam->id], $now->copy()->subHours(3)],
            [$hq->id, NotificationType::ProjectApproved, '本部承認が完了しました', 'デモ案件の承認が記録されています。', ['project_id' => $prEam->id], $now->copy()->subDays(8)],
            [$takahashi->id, NotificationType::ProjectSubmitted, '申請を受け付けました', '案件を申請しました（デモ）。', ['project_id' => $prEam->id], $now->copy()->subDays(12)],
        ];

        foreach ($samples as [$userId, $type, $title, $body, $meta, $readAt]) {
            Notification::query()->create([
                'user_id' => $userId,
                'type' => $type,
                'title' => $title,
                'body' => $body,
                'meta' => $meta,
                'read_at' => $readAt,
            ]);
        }
    }
}
