## 全体スケジュール（要約管理版）

このファイルは、進捗を短く確認するための要約版です。  
詳細な実行手順・コマンドは `doc/daily/implementation_schedule.md` を参照します。

---

### 基本情報（2026-04-21 更新）

- **開発期間:** 4/13〜5/15（5週間・100時間以内）
- **累計実績:** 34h
- **残り時間:** 66h（目安）
- **稼働方針:** 平日中心（平均 1日4h目安、火曜は通院で3h）
- **リスク期間:** GW（4/29, 5/3〜5/6）は稼働1h/日程度に低下

---

### Phase別の時間配分（残り69h）

| Phase | 内容 | 配分 | 状態 |
|-------|------|------|------|
| Phase 0 | 設計・環境構築 | 0h | ✅ 完了（実績31h） |
| Phase 1 | 認証・レイアウト・共通UI | 8h（実績3h） | 🟡 進行中（初日完了） |
| Phase 2 | 申請・承認フロー（課題1の核） | 22h | 未着手 |
| Phase 3 | 開発管理・予算管理（MVP優先） | 12h | 未着手 |
| Phase 4 | +alpha（最小） | 2h | 未着手 |
| Phase 5 | 資料・最終確認 | 20h | 未着手 |
| 予備バッファ | 遅延吸収・回帰修正 | 5h | — |

> 実装時間は Phase 1〜4 で **44h**、資料・確認に **20h**、バッファ **5h**。  
> GW前までに Phase 2 を完了 → GW週で Phase 3 MVP → 最終週で +α＋資料、が基本線。

---

### 現在地

- **現在の主作業:** Phase 1 継続（初日 3h 完了、残り 5h）
- **直近完了:** Phase 1 初日 — 3セクションサイドバー化 / `StatusPill`(5値) / shadcn/ui 基盤 / `brand.*` カラートークン
- **次の着手:** `Tabs.tsx` / `ApprovalStepperMini.tsx` / `EmptyState.tsx` と `Projects/Index.tsx` のタブ切替骨組み

---

### 今週の目標（4/21〜4/24）

1. ✅ `AuthenticatedLayout` を 3セクションサイドバー構造に改修（4/21 完了）
2. 🟡 共通コンポーネント（✅`StatusPill`、⏳`Tabs`、⏳`ApprovalStepperMini`、⏳`EmptyState`）を先行実装
3. ⏳ `projects` テーブル migration・Model の雛形作成
4. ⏳ S-03a（案件一覧 申請タブ）をダミーデータで再現開始

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

> 詳細は `doc/Design/CLAUDE.md §9 Git / 提出 > 日次ワークフロー` を参照。Cursor / Claude との協働でも必ず遵守。

#### 作業開始時
1. `git checkout main && git pull origin main` で最新化
2. **作業ブランチを切る**：`git checkout -b <branch-name>`
   - 実装：`feat/phase1-layout` / `feat/phase2-apply-form` など
   - 日報のみ：`docs/daily-YYYYMMDD`
3. main 上では作業しない。必ずブランチを切ってから開始

#### 作業終了時
1. **`doc/daily/` を更新**
   - `daily_report.md`：本日の実績・気づき・翌日の予定（既存提出分は変更せず追記）
   - `development_schedule.md`：累計実績 h・残り h・現在地・今週の目標を更新
   - `implementation_schedule.md`：次回作業予定（具体的な手順）を更新
2. コミット：`git add -A && git commit -m "docs: 日次更新 YYYY-MM-DD"`（実装は別 prefix で別コミット）
3. push：`git push -u origin <branch-name>`
4. main へのマージは自己レビュー後（直 push 禁止）

#### チェックリスト（毎日使う）
- [ ] 作業開始前に main を pull した
- [ ] ブランチを切ってから作業を始めた
- [ ] 作業終了時に `doc/daily/` 3 ファイルを更新した
- [ ] コミット・push を完了した

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
- [ ] トップバー（Header）の ⌘K 検索・通知ベルの実機能接続（Phase 2 以降）
- [ ] モバイル用のハンバーガーメニュー骨組み（中身は Phase 4 で仕上げ）

### 共通コンポーネント（shadcn/ui ベース）
- [x] shadcn/ui 基盤導入：Button / Badge（components.json + lib/utils）（4/21）
- [ ] shadcn/ui 追加：Input / Dialog / Table / Select（使用画面実装時に追加）
- [x] `StatusPill.tsx`（案件ステータス 5 種のカラー統一）（4/21）
- [ ] `ApprovalStepperMini.tsx`（案件一覧内の小型ステッパー）
- [ ] `Tabs.tsx`（`/projects?tab=approval|dev|budget` の URL 連動）
- [ ] `EmptyState.tsx`（一覧が空の時の表示）

### ページ雛形
- [ ] `Projects/Index.tsx` にタブ切替の雛形を実装（ダミーデータ）
- [ ] `Projects/Show.tsx` の骨組みを作成
- [ ] ログイン画面のブランディング微調整（ロゴ・配色）

### 確認
- [x] TypeScript・Vite ビルドが通る（`npx tsc --noEmit` / `npm run build` OK）（4/21）
- [ ] 3ロールでログイン → メニューがロール別に切り替わる（ブラウザ実機確認は次回）
- [ ] `/projects?tab=approval|dev|budget` の URL で見た目が切り替わる（タブUI未実装）
- [ ] コンソールエラーがゼロ（ブラウザ実機確認は次回）

---

## Phase 2 チェックリスト（申請・承認フロー／22h）

### DB / Model
- [ ] `projects` migration（parent_project_id, revision, status, estimated_amount, budget_amount, actual_amount 等）
- [ ] `approvals` migration（level, action, approver_id, comment, acted_at）
- [ ] `notifications` migration（user_id, type, title, body, read_at）
- [ ] `Project` / `Approval` / `Notification` Model（リレーション・スコープ）
- [ ] `Enums`：`ProjectStatus` / `ApprovalLevel` / `ApprovalAction` / `NotificationType`

### Policy / 権限
- [ ] `ProjectPolicy`（viewAny / view / create / update / delete）
- [ ] Controller でロール別クエリ分岐（applicant=自分のみ、dept=自部門、hq=全件）
- [ ] 却下→再申請の分岐（`parent_project_id` でチェイン）

### 画面：申請側（申請者）
- [ ] `Projects/Create.tsx`（S-05 新規申請）
- [ ] `Projects/Edit.tsx`（S-06 案件編集、draft / rejected のみ）
- [ ] `Projects/Index.tsx` 申請タブ：自案件一覧＋ステータス
- [ ] `Projects/Show.tsx`（S-04 案件詳細、承認ステッパー表示）

### 画面：承認側
- [ ] 承認待ち一覧（`/projects?tab=approval&filter=pending`）のロール別フィルタ
- [ ] `ApprovalDialog.tsx`（S-08 承認/却下モーダル、コメント入力）
- [ ] 部門管理者が申請者の場合 → `pending_hq` 直行（UI にも表示）

### Service / Controller
- [ ] `ProjectController`（index / show / store / update / destroy）
- [ ] `ApprovalController`（approve / reject）
- [ ] `ApprovalService`（submit / approveDept / approveHq / reject）
- [ ] `NotificationService`（承認・却下時に関係者へ通知作成）

### 通知
- [ ] `Notifications/Index.tsx`（S-12 通知一覧）
- [ ] トップバーの通知バッジ（未読件数）
- [ ] 承認・却下・差戻し時に通知が発行される

### 検証
- [ ] 3ロール × 申請〜最終承認のハッピーパス
- [ ] 3ロール × 部門却下 / 本部却下 → 再申請シナリオ
- [ ] ロール境界：他部門の pending 案件が見えない／編集できない
- [ ] Feature テスト：承認フロー 1 本、権限境界 1 本（最低限）

---

## Phase 3 チェックリスト（開発管理・予算管理 MVP／12h）

### DB / Model
- [ ] `tasks` migration（title, assignee_id, status, progress_rate, start_date, due_date, parent_id(nullable), milestone_id(nullable)）
- [ ] `task_comments` migration（最小：body, user_id, task_id）
- [ ] `task_histories` migration（自動記録用、最小カラムで可）
- [ ] `Task` / `TaskComment` / `TaskHistory` Model

### 承認後ロック
- [ ] `status=approved` 時に案件編集をロック
- [ ] 承認時に `estimated_amount → budget_amount` 転記（ApprovalService で実装）
- [ ] タスク作成・進捗入力・予算実績入力を `approved` 後のみ解禁

### 画面：開発管理
- [ ] `Projects/Show.tsx` にタスク一覧セクション追加
- [ ] `TaskFormDialog.tsx`（S-10 タスク作成・編集モーダル）
- [ ] タスク進捗率 → 案件進捗率の自動算出（表示のみ、DB には持たない）
- [ ] `Projects/Index.tsx` 開発タブの列セット実装

### 画面：予算管理
- [ ] `BudgetActualDialog.tsx`（S-11 予算実績入力モーダル）
- [ ] `BudgetController`（実績更新）
- [ ] `Projects/Index.tsx` 予算タブの列セット実装（消費率算出・警告）
- [ ] 消費率 70% 超で `StatusPill` を警告色に

### 検証
- [ ] 承認前は編集可能 / 承認後はロックされる
- [ ] タスク進捗を入力 → 案件進捗率が反映される
- [ ] 予算実績を入力 → 消費率が一覧に反映される

---

## Phase 4 チェックリスト（+α 最小／2h）

- [ ] 承認ステッパーUI（詳細画面用、大型版）
- [ ] レスポンシブ調整（主要 3 画面のみ）
  - [ ] `/projects` 一覧（タブ含む）
  - [ ] 案件詳細
  - [ ] 申請フォーム
- [ ] モーダル類のタブレット対応最低限確認

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

