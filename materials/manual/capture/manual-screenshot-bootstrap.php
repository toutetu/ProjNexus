<?php

declare(strict_types=1);

/**
 * マニュアル用スクリーンショット撮影前の DB 調整と案件 ID の JSON 出力。
 * 実行前提: migrate:fresh --seed 済み。
 * --ids-only を付けると DB を変えずに案件 ID だけを出力する（#01〜#14 の撮影用）。
 */
require __DIR__.'/../../../vendor/autoload.php';

$app = require_once __DIR__.'/../../../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Enums\NotificationType;
use App\Models\Notification;
use App\Models\Project;
use App\Models\ProjectWorkItem;
use App\Models\User;
use Carbon\Carbon;

$pid = static fn (string $code): ?int => Project::query()->where('project_code', $code)->value('id');
$idsOnly = in_array('--ids-only', $argv ?? [], true);

if (! $idsOnly) {
    $applicant = User::query()->where('email', 'applicant@example.com')->firstOrFail();
    Notification::query()
        ->where('user_id', $applicant->id)
        ->where('title', 'マニュアル用未読（撮影）')
        ->delete();
    Notification::query()->create([
        'user_id' => $applicant->id,
        'type' => NotificationType::ProjectSubmitted,
        'title' => 'マニュアル用未読（撮影）',
        'body' => 'スクリーンショット用の未読通知です。',
        'meta' => null,
        'read_at' => null,
    ]);

    $demoPid = $pid('PRJ-DEMO-EAM');
    $demoTaskId = $demoPid
        ? ProjectWorkItem::query()->where('project_id', $demoPid)->orderBy('id')->value('id')
        : null;
    $notifMeta = $demoPid
        ? array_filter([
            'project_id' => $demoPid,
            'task_id' => $demoTaskId,
        ], static fn ($value) => $value !== null)
        : null;
    Notification::query()
        ->where('user_id', $applicant->id)
        ->where('title', 'like', 'マニュアル撮影用通知｜%')
        ->delete();
    foreach (
        [
            [NotificationType::ProjectApproved, 'マニュアル撮影用通知｜案件承認', '案件が承認されました。'],
            [NotificationType::TaskAssigned, 'マニュアル撮影用通知｜タスク割当', '新しいタスクが割り当てられました。'],
            [NotificationType::TaskDueSoon, 'マニュアル撮影用通知｜期限接近', '期限が近いタスクがあります。'],
            [NotificationType::TaskResolved, 'マニュアル撮影用通知｜確認依頼', '確認待ちのタスクがあります。'],
            [NotificationType::TaskCompleted, 'マニュアル撮影用通知｜タスク完了', 'タスクが完了しました。'],
            [NotificationType::TaskReviewed, 'マニュアル撮影用通知｜レビュー', 'タスクが確認OKになりました。'],
        ] as [$nType, $nTitle, $nBody]
    ) {
        Notification::query()->create([
            'user_id' => $applicant->id,
            'type' => $nType,
            'title' => $nTitle,
            'body' => $nBody,
            'meta' => $notifMeta,
            'read_at' => null,
        ]);
    }

    // 予算超過（#37）はシードの PRJ-SEED-0017・0018 がすでに 100% を超えているため調整しない

    $today = Carbon::today();
    $targets = [
        ['code' => 'PRJ-SEED-0011', 'title' => '要件レビュー会の準備', 'due' => $today->copy()->subDays(5)],
        ['code' => 'PRJ-SEED-0011', 'title' => '仕様レビュー指摘の整理', 'due' => $today->copy()->addDays(10)],
        ['code' => 'PRJ-SEED-0011', 'title' => '基本設計ドキュメントの作成', 'due' => $today->copy()->addDays(25)],
    ];

    foreach ($targets as $row) {
        $projectId = $pid($row['code']);
        if ($projectId === null) {
            continue;
        }
        // シードのタスク名は「[案件コード] タイトル」の形なので後方一致で探す
        ProjectWorkItem::query()
            ->where('project_id', $projectId)
            ->where('title', 'like', '%'.$row['title'])
            ->update(['due_date' => $row['due']->toDateString()]);
    }
}

echo json_encode(
    [
        'draftApplicant' => $pid('PRJ-SEED-0001'),
        'pendingDept' => $pid('PRJ-SEED-0005'),
        // 申請者本人の本部承認待ち案件はシードにないため、開発1部の別の申請者の案件を使う
        'pendingHq' => $pid('PRJ-SEED-0007'),
        'pendingHqSecond' => $pid('PRJ-SEED-0008'),
        'hqDirect' => $pid('PRJ-SEED-0009'),
        'approved' => $pid('PRJ-SEED-0011'),
        'rejected' => $pid('PRJ-SEED-0021'),
        'resubmit' => $pid('PRJ-SEED-0024'),
        'prDemoEam' => $pid('PRJ-DEMO-EAM'),
    ],
    JSON_UNESCAPED_UNICODE,
);
