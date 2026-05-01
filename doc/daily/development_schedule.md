## 全体スケジュール（要約管理版）

このファイルは、進捗を短く確認するための要約版です。  
詳細な実行手順・コマンドは `doc/daily/implementation_schedule.md` を参照します。
日々の詳細作業記録は `doc/daily/log/` 配下へ分離して管理します。

---

### 詳細ログ保管先

`doc/daily/` 直下は「簡潔版・提出用」、`doc/daily/log/` 配下は「詳細版・作業記録用」という住み分け。

| 用途 | 簡潔版（`doc/daily/`） | 詳細版（`doc/daily/log/`） |
|------|----------------------|--------------------------|
| 日報（非エンジニア向け） | `daily_report.md` | `daily_report_log.md` |
| 技術的な作業記録 | — | `daily_technical_report.md` |
| 実装スケジュール | `implementation_schedule.md` | `implementation_schedule_log.md` |

---

### 基本情報（2026-05-01 更新）

- **開発期間:** 4/13〜5/15（5週間・100時間以内）
- **累計実績:** 65h
- **残り時間:** 35h
- **稼働方針:** 平日中心（平均 1日5h目安、火曜は通院で3h）
- **リスク期間:** GW（4/29, 5/3〜5/6）は稼働1h/日程度に低下

---

### Phase別の時間配分（残り35h・2026-05-01 時点）

| Phase | 内容 | 見積 | 実績 | 状態 |
|-------|------|------|------|------|
| Phase 0 | 設計・環境構築 | 35h | 31h | ✅ 完了 |
| Phase 1 | 認証・レイアウト・共通UI | 8h | 9h | ✅ 完了 |
| Phase 2 | 申請・承認フロー（課題1の核） | 20h | 10h | ✅ 完了 |
| Phase 3 | 開発管理・予算管理（MVP優先） | 10h |  9h | ✅ 完了（履歴自動記録・通知・初期タスク等を含む） |
| Phase 4 | +α（最小） | 5h | - | 🟡 着手（タスク履歴ブランチ等。ステッパーは先行実装済） |
| Phase 5 | 資料・最終確認 | 20h | - | 未着手 |
| 予備バッファ | 遅延吸収・回帰修正 | 5h | - | - |

> 実装時間は Phase 1〜4 で *75*h**、資料・確認に **20h**、バッファ **5h**。  
> GW前までに Phase 2 を完了 → GW週で Phase 3 MVP → 最終週で +α＋資料、が基本線。

---

### 現在地（2026-05-01 時点）

- **現在の主作業:** Phase 4 / 5（+α・資料・提出準備）。タスク変更履歴は実装・設計書同期・日報追記まで完了
- **直近完了（2026-05-01）:** `TaskHistoryService` による `task_histories` 自動記録、案件詳細タスク一覧の変更履歴展開、`TaskHistoryTest`、`doc/Design` 更新、ローカルセットアップ確認、`daily_report.md` 追記
- **直近完了（〜2026-04-30）:** 下書き権限制御、下書きバリデーション緩和、タブ件数・一覧→詳細タブ連動、タスク進捗バー配色、履歴表示順、タスク通知、本部承認時の初期タスク自動作成
- **次の着手:** Phase 4 残（レスポンシブ等）・`doc/manual` 区切り更新・Phase 5 提出物

---

### 今週の目標（4/27〜5/1）

1.フェーズ２，フェーズ３完了
---

### リスクと対策

- **リスク1:** GW期間は稼働時間が低下（1h/日）
  - **対策:** GW前（5/1まで）に Phase 2 を完了させる
- **リスク2:** Phase 3 が MVP 止まりになる可能性
  - **対策:** タスク・予算は「作成・保存・表示」を最優先。履歴・コメントは後回し
- **リスク3:** 火曜の通院・家族事由による突発的な稼働低下
  - **対策:** 毎週金曜に残時間・進捗率を棚卸し、翌週の優先3タスクを確定
- **リスク4:** 最終週の資料作成が間に合わない
  - **対策:** Phase 5 に 20h を固定確保。+α は最小限（ステッパーUI・レスポンシブのみ）

---

### 毎週金曜の確認項目

- 実績時間と残時間
- Phase ごとの完了率
- ブロッカーの有無
- 翌週の優先3タスク

---

### 日次ワークフロー（必須ルーティン）

日次の git 手順・コミット方針・チェックリストは **`doc/Design/CLAUDE.md §9 日次ワークフロー` を唯一の正本**とする。本ファイルには手順を記載しない（二重管理を避けるため）。

Cursor / Claude との協働でも必ず遵守。

---

## Phase 0の中での進捗（✅ 完了）

- [x] 課題の読み込み・理解
- [x] 技術スタック決定
- [x] デプロイ先決定
- [x] 機能一覧の整理
- [x] ER図（v4）作成
- [x] 画面遷移の整理
- [x] デザインルール策定（カラー・UI方針）
- [x] デザインイメージ モック作成（S-03a/b/c, S-04, S-10, S-11 完成）
- [x] 設計ドキュメントの作成（Cursor向け CLAUDE.md）
- [x] Laravel 環境構築
- [x] Breeze（React + Inertia + TS）インストール
- [x] Spatie Permission のインストール
- [x] DB作成・マイグレーション（users / departments / permission tables）
- [x] シーダー作成（3ロール × 4部門、7テストアカウント）
- [x] ログイン後遷移を `/projects?tab=approval` に固定
- [x] 3ロールでの動作検証（ブラウザ確認）
- [x] デプロイ先の初期設定・動作確認（Laravel Cloud）

---

## Phase 1 チェックリスト（認証・レイアウト・共通UI／8h）

### レイアウト
- [x] `AuthenticatedLayout.tsx` を 3セクションサイドバー構造に改修（4/21）
  - [x] 「申請・承認」「開発管理」「予算管理」セクション分け（4/21）
  - [x] 共通（下部）「通知」「プロフィール」配置（4/21）
  - [x] ロール別のメニュー表示制御（applicant に承認待ちは非表示 等）（4/21）
- [x] サイドバー下部にログインユーザー名・ロール・部門表示（4/21）
- [x] トップバー（Header）の通知ベル → 通知一覧・未読件数（4/24）
- [ ] モバイル用のハンバーガーメニュー骨組み（中身は Phase 4 で仕上げ）

### 共通コンポーネント（shadcn/ui ベース）
- [x] shadcn/ui 基盤導入：Button / Badge（components.json + lib/utils）（4/21）
- [x] shadcn/ui 追加：Input / Dialog / Table / Select（4/22）
- [x] `StatusPill.tsx`（案件ステータス 5 種のカラー統一）（4/21）
- [x] `ApprovalStepperMini.tsx`（案件一覧内の小型ステッパー）（4/22）
- [x] `Tabs.tsx`（`/projects?tab=approval|dev|budget` の URL 連動）（4/22）
- [x] `EmptyState.tsx`（一覧が空の時の表示）（4/22）

### ページ雛形
- [x] `Projects/Index.tsx` にタブ切替の雛形を実装（ダミーデータ）（4/22）
- [x] `Projects/Show.tsx` の骨組みを作成（4/22）
- [x] ログイン画面のブランディング微調整（ロゴ・配色）（4/22）

### 確認
- [x] TypeScript・Vite ビルドが通る（`npx tsc --noEmit` / `npm run build` OK）（4/21）
- [ ] 3ロールでログイン → メニューがロール別に切り替わる（ブラウザ実機確認は次回）
- [x] `/projects?tab=approval|dev|budget` の URL で見た目が切り替わる（4/22 実機確認）
- [x] コンソールエラーがゼロ（4/22 実機確認）

---

## Phase 2 チェックリスト（申請・承認フロー／20h）

### DB / Model
- [x] `projects` migration（parent_project_id, revision, status, estimated_amount, budget_amount, actual_amount 等）
- [x] `approvals` migration（level, action, approver_id, comment, acted_at）
- [x] `notifications` migration（user_id, type, title, body, read_at）
- [x] `Project` / `Approval` / `Notification` Model（リレーション・スコープ）
- [x] `Enums`：`ProjectStatus` / `ApprovalLevel` / `ApprovalAction` / `NotificationType`

### Policy / 権限
- [x] `ProjectPolicy`（viewAny / view / create / update / delete）
- [x] Controller でロール別クエリ分岐（applicant=自分のみ、dept=自部門、hq=全件）
- [x] 却下→再申請の分岐（`parent_project_id` でチェイン）（4/24 追記）

### 画面：申請側（申請者）
- [x] `Projects/Create.tsx`（S-05 新規申請）
- [x] `Projects/Edit.tsx`（S-06 案件編集、draft / rejected のみ）
- [x] `Projects/Index.tsx` 申請タブ：自案件一覧＋ステータス
- [x] `Projects/Show.tsx`（S-04 案件詳細、承認ステッパー表示）

### 画面：承認側
- [x] 承認待ち一覧（`/projects?tab=approval&filter=pending`）のロール別フィルタ
- [x] `ApprovalDialog.tsx`（S-08 承認/却下モーダル、コメント入力）
- [x] 部門管理者が申請者の場合 → `pending_hq` 直行（UI にも表示）（4/24 追記）

### Service / Controller
- [x] `ProjectController`（index / show / store / update / destroy）
- [x] `ApprovalController`（approve / reject）
- [x] `ApprovalService`（submit / approveDept / approveHq / reject）
- [x] `NotificationService`（承認・却下時に関係者へ通知作成）

### 通知
- [x] `Notifications/Index.tsx`（S-12 通知一覧）（4/24）
- [x] トップバー／サイドバーの通知バッジ（未読件数）（4/24）
- [x] 承認・却下・申請時に通知が発行される（`NotificationService` 経由・4/24 時点で動作確認は手動継続）

### 検証
- [x] 3ロール × 部門却下 / 本部却下 → 再申請シナリオ（手動確認済み・2026-04-27）
- [x] ロール境界：他部門の pending 案件が見えない／編集できない（手動確認済み・2026-04-27）
- [x] Feature テスト：承認フロー 1 本、権限境界 1 本（`ProjectApprovalFlowTest`・4/24）
- [x] 3ロール × 申請〜最終承認のハッピーパス（手動確認済み・2026-04-27）
---

## Phase 3 チェックリスト（開発管理・予算管理 MVP／12h）

### DB / Model
- [x] `tasks` migration（title, assignee_id, status, progress_rate, start_date, due_date, parent_id(nullable), milestone_id(nullable)）
- [x] `task_comments` migration（最小：body, user_id, task_id）
- [x] `task_histories` migration（自動記録用、最小カラムで可）
- [x] `ProjectWorkItem` / `ProjectTaskComment` / `ProjectTaskHistory` Model（`tasks` / `task_histories`）
- [x] `TaskHistoryService` による `task_histories` 自動記録＋`Projects/Show.tsx` タスク行展開表示（2026-05-01）

### 承認後ロック
- [ ] `status=approved` 時に案件編集をロック
- [ ] 承認時に `estimated_amount → budget_amount` 転記（ApprovalService で実装）
- [ ] タスク作成・進捗入力・予算実績入力を `approved` 後のみ解禁

### 画面：開発管理
- [x] `Projects/Show.tsx` にタスク一覧セクション追加
- [x] `ProjectTaskDialog.tsx`（S-10 タスク作成・編集モーダル）
- [x] タスク進捗率 → 案件進捗率の自動算出（表示のみ、DB には持たない）
- [x] `Projects/Index.tsx` 開発タブの列セット実装

### 画面：予算管理
- [x] `BudgetActualDialog.tsx`（S-11 予算実績入力モーダル）
- [x] `BudgetController`（実績更新）
- [x] `Projects/Index.tsx` 予算タブの列セット実装（消費率算出・警告）
- [ ] 消費率 70% 超で `StatusPill` を警告色に

### 検証
- [ ] 承認前は編集可能 / 承認後はロックされる（手動確認）
- [ ] タスク進捗を入力 → 案件進捗率が反映される（手動確認）
- [ ] 予算実績を入力 → 消費率が一覧に反映される（手動確認）
- [x] `php artisan test` / `npm run build` / `npx tsc --noEmit` を通過（2026-04-27）
- [x] 期限接近タスク通知コマンドを追加し、日次スケジュール実行を設定（`tasks:notify-due-soon` / 09:00）

### 2026-05-01 追加完了項目
- [x] `TaskHistoryService`・`task_histories` 自動記録（5項目・表示用文字列）
- [x] `ProjectTaskController` / `ApprovalService` からの記録呼び出し
- [x] `TaskHistoryTest`（Feature）
- [x] `doc/Design` のタスク履歴関連を実装に同期

### 2026-04-30 追加完了項目
- [x] 下書き案件は申請者のみ閲覧可能（一覧/直接URLともに制御）
- [x] 下書き保存時の必須項目を「タイトルのみ」に変更（申請時は従来必須を維持）
- [x] 案件一覧タブに実件数を表示（申請/開発/予算）
- [x] 一覧タブから詳細遷移時に対応タブを初期表示（申請→申請詳細、開発→タスク、予算→予算）
- [x] タスク通知（担当変更・完了・期限接近）を実装
- [x] 本部承認直後に初期タスク「実装計画作成」（3人日）を自動作成

---


## Phase 4 チェックリスト（+α 拡張・実装決定／時間調整中）

> 2026-05-01 のスコープ拡大判断：残時間 40h を活用し、課題1 補強と課題2 +α を本気実装する方針に変更。

### 既定の +α
- [x] 承認ステッパーUI（詳細画面用、大型版）
- [ ] レスポンシブ調整（主要 3 画面のみ）
  - [ ] `/projects` 一覧（タブ含む）
  - [ ] 案件詳細
  - [ ] 申請フォーム
- [ ] モーダル類のタブレット対応最低限確認

### 課題1 補強（追加実装決定・2026-05-01）
- [ ] **`TaskHistoryService` 自動記録実装**（5項目：`status` / `progress_rate` / `assignee_id` / `due_date` / `priority`）
- [ ] `ProjectTaskController::store / update` から Service 呼び出し
- [ ] 案件詳細画面のタスクカードに「変更履歴」セクション追加（`Show.tsx` の既存 props 活用）
- [ ] Feature テスト：主要フィールド変更で履歴が記録されること（1〜2 ケース）

### 課題2 として実装決定（2026-05-01）
- [ ] **S-14 タスク一覧**（カンバン + メンバー別 ビュートグル・採用：`mockups/s14b_member_tasks_toggle.html`）
  - [ ] migration: `tasks.reviewer_id` 追加（nullable FK→users）
  - [ ] `MemberTaskController` + ロール別クエリ + view 切替
  - [ ] `MemberTasks/Index.tsx` + `KanbanBoard.tsx` + `MemberMatrix.tsx` + `TaskCard.tsx` + `ViewToggle.tsx`
  - [ ] `routes/web.php` に `/member-tasks` 追加
  - [ ] サイドバー「タスク一覧」dim 解除
- [ ] **タスク 4値運用**（実装者→確認者の品質ゲート）
  - [ ] `ProjectTaskDialog` に確認者選択・`resolved` 遷移ボタン追加
  - [ ] `ProjectTaskController` に `resolved` バリデーション
  - [ ] `NotificationService::notifyTaskResolved` / `notifyTaskReviewed` 追加
  - [ ] `NotificationType` Enum に `TaskResolved` / `TaskReviewed` 追加
  - [ ] `TaskStatus::phase4Values()` ヘルパ追加
  - [ ] `ApprovalService` 自動初期タスクに `reviewer_id` 初期値（部門管理者）設定
  - [ ] `ProjectWorkItemPolicy` の遷移権限分岐（`assignee` only / `reviewer` only）
- [ ] 遅延の見える化（一覧の期限超過バッジ・3日以内早期警告）
- [ ] 消費率 70% 警告色（Phase 3 積み残し）

### 設計のみ（プレゼン素材）
- [ ] `budget_actuals` 追加方式の ER 図と移行手順
- [ ] ダッシュボード（S-02）モック練り直し

---

## Phase 5 チェックリスト（資料・最終確認／20h）

### ドキュメント
- [ ] `doc/Information.md`：デプロイURL・テストアカウント一覧
- [ ] 利用マニュアル（簡易）：主要4フロー
  - [ ] ログイン〜新規申請
  - [ ] 部門承認〜本部承認
  - [ ] 却下〜再申請
  - [ ] タスク登録〜予算実績入力
- [ ] README 最終調整（セットアップ手順・開発サーバ起動）

### プレゼン資料（`doc/presentation_高橋朋子.md`）
- [ ] 課題1 工夫点のまとめ
  - 承認フローの監査証跡（approvals テーブル）
  - 却下→再申請の親子リンク
  - 部門管理者の自己承認防止
  - タブ式UIによる3用途の同一画面共通化
- [ ] 課題2 プレゼン
  - 優先度高：ステッパーUI（実装済み）
  - 優先度中：ダッシュボード案、メンバータスク一覧案
- [ ] 感想・学び

### デプロイ / 提出
- [ ] 本番環境の DB リセット＋デモ用シード投入
- [ ] 3ロール × 全画面の本番動作確認
- [ ] main ブランチへのマージ完了
- [ ] GitLab / Laravel Cloud のダウンがないこと確認
- [ ] 提出期限までに提出完了

### 最終確認
- [ ] 提出物チェックリスト（requirements.md §提出物）5項目すべて完了
- [ ] `php artisan test` が通る
- [ ] コンソールエラー・TypeScript エラーなし