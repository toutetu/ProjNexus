<?php

declare(strict_types=1);

/**
 * マニュアル用スクリーンショット撮影前の DB 調整と案件 ID の JSON 出力。
 * 実行前提: migrate:fresh --seed 済み。
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
$notifMeta = $demoPid ? ['project_id' => $demoPid] : null;
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

$pOver = Project::query()->where('project_code', 'PRJ-SEED-0009')->first();
if ($pOver !== null) {
    $budget = (int) ($pOver->budget_amount ?? 0);
    $pOver->forceFill([
        'actual_amount' => $budget > 0 ? $budget + 500_000 : 9_000_000,
    ])->saveQuietly();
}

$today = Carbon::today();
$targets = [
    ['code' => 'PRJ-SEED-0009', 'title' => 'ユーザーストーリー分解と見積', 'due' => $today->copy()->subDays(5)],
    ['code' => 'PRJ-SEED-0009', 'title' => '画面遷移図の作成', 'due' => $today->copy()->addDays(10)],
    ['code' => 'PRJ-SEED-0009', 'title' => 'API 契約ドラフト（OpenAPI）', 'due' => $today->copy()->addDays(25)],
];

foreach ($targets as $row) {
    $projectId = $pid($row['code']);
    if ($projectId === null) {
        continue;
    }
    ProjectWorkItem::query()
        ->where('project_id', $projectId)
        ->where('title', $row['title'])
        ->update(['due_date' => $row['due']->toDateString()]);
}

echo json_encode(
    [
        'draftApplicant' => $pid('PRJ-SEED-0001'),
        'pendingDept' => $pid('PRJ-SEED-0003'),
        'pendingHq' => $pid('PRJ-SEED-0005'),
        'pendingHqSecond' => $pid('PRJ-SEED-0006'),
        'hqDirect' => $pid('PRJ-SEED-0007'),
        'approved' => $pid('PRJ-SEED-0009'),
        'resubmit' => $pid('PRJ-SEED-0020'),
        'prDemoEam' => $pid('PRJ-DEMO-EAM'),
    ],
    JSON_UNESCAPED_UNICODE,
);
