## 全体スケジュール（要約管理版）

このファイルは、進捗を確認するためのチェックリストです。  
`implementation_schedule.md` は明日以降の作業目線の要約のみとします。
明日以降の詳細な実行手順・コマンドは `doc/daily/implementation_schedule.md` を参照します。
作業後の詳細作業記録は `doc/daily/log/` 配下へ分離して管理します。
---


## 今後の実装予定（課題②）

> PoC・課題1 の範囲外として想定する拡張。着手前に `materials/Design/system_spec.md` と突合すること。

- [ ] **S-16 ガントチャート**（`screen_flow.md` で未実装。工程の可視化・依存関係の編集 UI）
- [ ] **スマートフォン対応**（申請・一覧・案件詳細のレイアウト最適化、タッチターゲット・フォーム操作性。旧マスト #8 を本バックログへ再分類）
- [ ] **主要 3 画面のレスポンシブ調整**（`/projects` 一覧・案件詳細・申請フォーム）および **モーダルのタブレット最適化**
- [ ] **バーンダウン（S-15 系）**（設計のみの領域からの実装）
- [ ] **ユーザー管理**（本部のみでアカウント・権限・部門を動的に追加）
- [ ] **部門マスタ**（本部で部門作成・検証。本部による基本情報編集は無し／アカウント削除・生年月日は別スコープ）
- [ ] **通知のメール送信**（SMTP / キュー）
- [ ] **概算・実績の帳票・見積エクスポート**（PDF / Excel 等）
- [ ] **`budget_actuals` 方式**（1支出1行の ER・移行・実装）
- [ ] **ダッシュボード（S-02）の追加指標**・モック練り直し
- [ ] **遅延の見える化**（一覧の期限超過バッジ・早期警告の統合強化）
- [ ] **Phase 1 未了:** モバイル用ハンバーガーの中身完成・3ロール実機でのメニュー切替の継続確認
  - [ ] レスポンシブ調整（主要 3 画面のみ）
    - [ ] `/projects` 一覧（タブ含む）
    - [ ] 案件詳細
    - [ ] 申請フォーム
  - [ ] モーダル類のタブレット対応最低限確認
---

## 今後の実装予定（バグ修正・品質・セキュリティ）

> 本番運用・保守で継続。優先度はインシデントと監査に応じてチケット化する。

- [ ] **セキュリティホール・脆弱性の確認**（認可漏れ、Mass Assignment、`Policy` 境界、ファイルアップロード経路、`.env` / `APP_DEBUG` 露出、CSRF・XSS・SQLi の代表パターン、`composer audit` / `npm audit`、セッション・Cookie 属性）
- [ ] **ロール境界の Regression テスト**（新規ルート・API 追加時の必須確認）
- [ ] **サイドバー左上アプリ名**クリックで Notion（仕様正本）へ遷移
- [ ] **S-03a ポリシー差分の解消**（タブ下線 3px、本部の「新規申請」非表示、`ProjectTable` 正本分の文案確定）
- [ ] **Phase 3 チェックリストの未 `[x]`** の実装突合（承認後ロック・`budget_amount` 転記・70% 警告色・手動確認項目）
- [ ] **パフォーマンス・N+1**（一覧・ダッシュボードの `with()` 不足があれば修正）

---

### 現在地（要約）

- **進捗の沿革（旧「現在地（2026-05-12 時点）」の全文）** は **`materials/daily_reports/daily_technical_report.md`** の「**intern_schedule より転記 — 現在地（2026-05-12 時点）**」へ移動済み。
- **いま見るべき正:** マストのチェックは **本ファイル「フェーズ別チェックリスト → Phase 5 — 手動確認・マスト改修」**、着手の並びは **`implementation_schedule.md` §1** および **Phase 5 内「明日以降すぐやること」** を参照。



---
### 詳細ログ保管先

`doc/daily/` 直下は「簡潔版・提出用」、`doc/daily/log/` 配下は「詳細版・作業記録用」という住み分け。

| 用途 | 更新（`doc/daily/`） | 古いもの（`doc/daily/log/`） |
|------|----------------------|--------------------------|
| 日報（非エンジニア向け） | `daily_report.md` | `daily_report_log.md` |
| 技術的な作業記録 | `daily_technical_report.md`（`doc/daily/`） |  `daily_technical_report_log.md` |
| 実装スケジュール要約 | `intern_schedule.md` |  |
| 実装スケジュール今後 | `implementation_schedule.md` |  |
---

### 基本情報（2026-05-12 更新）

- **インターン期間:** 4/13〜5/15（5週間・100時間以内）
- **累計実績:** 日報 `daily_report.md` の累計欄を正とする（2026-05-08 時点の記載例: 実装中心で約78.5h）
- **残り時間:** 同上に準ずる（資料・最終確認・マスト改修残）
- **稼働方針:** 平日中心（平均 1日5h目安、火曜は通院で3h）
- **リスク期間:** GW（4/29, 5/3〜5/6）は稼働1h/日程度に低下

---

### Phase別の時間配分（2026-05-15  時点）

| Phase | 内容 | 見積 | 実績 | 状態 |
|-------|------|------|------|------|
| Phase 0 | 設計・環境構築 | 15h | 31h | ✅ 完了 |
| Phase 1 | 認証・レイアウト・共通UI | 10h | 9h | ✅ 完了 |
| Phase 2 | 申請・承認フロー（課題1の核） | 20h | 15h | ✅ 完了 |
| Phase 3 | 開発管理・予算管理（MVP優先） | 20h |  10h | ✅ 完了（履歴自動記録・通知・初期タスク等を含む） |
| Phase 4 | +α（最小） | 15h | 10h | ✅ 完了（S-14 3ビュー・4値運用・通知拡張・設計同期） |
| Phase 5 | 資料・マニュアル・最終確認 | 10h | 24h | ✅ 完了 |
| 予備バッファ | 遅延吸収・バグ修正 | 10h |   5h | - |

> 実装時間は Phase 1〜4 で **75h** を消化。残りは Phase 5（資料・提出）とバッファで運用する。  
> 以降は新機能追加よりも、提出品質（整合性・再現性・デモ導線）を優先する。


---

## フェーズ別チェックリスト（履歴・詳細）

> **Phase 0 → 5** の順に記載。チェックリストは**すべて完了（`[x]`）**として更新済み。**より詳しい完了判定や経緯**は上部の「Phase別の時間配分」「現在地」および `materials/daily_reports/daily_technical_report.md`** を正とする。

### Phase 0（設計・環境構築／✅ 完了）

> 当時時点の作業ログ。

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

### Phase 1 チェックリスト（認証・レイアウト・共通UI／8h）

### レイアウト
- [x] `AuthenticatedLayout.tsx` を 3セクションサイドバー構造に改修（4/21）
  - [x] 「申請・承認」「開発管理」「予算管理」セクション分け（4/21）
  - [x] 共通（下部）「通知」「プロフィール」配置（4/21）
  - [x] ロール別のメニュー表示制御（applicant に承認待ちは非表示 等）（4/21）
- [x] サイドバー下部にログインユーザー名・ロール・部門表示（4/21）
- [x] トップバー（Header）の通知ベル → 通知一覧・未読件数（4/24）
- [x] モバイル用のハンバーガーメニュー骨組み（中身は Phase 4 で仕上げ）

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
- [x] 3ロールでログイン → メニューがロール別に切り替わる（ブラウザ実機確認は次回）
- [x] `/projects?tab=approval|dev|budget` の URL で見た目が切り替わる（4/22 実機確認）
- [x] コンソールエラーがゼロ（4/22 実機確認）

---

### Phase 2 チェックリスト（申請・承認フロー／20h）

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

### Phase 3 チェックリスト（開発管理・予算管理 MVP／12h）

### DB / Model
- [x] `tasks` migration（title, assignee_id, status, progress_rate, start_date, due_date, parent_id(nullable), milestone_id(nullable)）
- [x] `task_comments` migration（最小：body, user_id, task_id）
- [x] `task_histories` migration（自動記録用、最小カラムで可）
- [x] `ProjectWorkItem` / `ProjectTaskComment` / `ProjectTaskHistory` Model（`tasks` / `task_histories`）
- [x] `TaskHistoryService` による `task_histories` 自動記録＋`Projects/Show.tsx` タスク行展開表示（2026-05-01）

### 承認後ロック
- [x] `status=approved` 時に案件編集をロック
- [x] 承認時に `estimated_amount → budget_amount` 転記（ApprovalService で実装）
- [x] タスク作成・進捗入力・予算実績入力を `approved` 後のみ解禁

### 画面：開発管理
- [x] `Projects/Show.tsx` にタスク一覧セクション追加
- [x] `ProjectTaskDialog.tsx`（S-10 タスク作成・編集モーダル）
- [x] タスク進捗率 → 案件進捗率の自動算出（表示のみ、DB には持たない）
- [x] `Projects/Index.tsx` 開発タブの列セット実装

### 画面：予算管理
- [x] `BudgetActualDialog.tsx`（S-11 予算実績入力モーダル）
- [x] `BudgetController`（実績更新）
- [x] `Projects/Index.tsx` 予算タブの列セット実装（消費率算出・警告）
- [x] 消費率 70% 超で `StatusPill` を警告色に

### 検証
- [x] 承認前は編集可能 / 承認後はロックされる（手動確認）
- [x] タスク進捗を入力 → 案件進捗率が反映される（手動確認）
- [x] 予算実績を入力 → 消費率が一覧に反映される（手動確認）
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


### Phase 4 チェックリスト（+α・履歴）

> 2026-05-01 のスコープ拡大判断：残時間 40h を活用し、課題1 補強と課題2 +α を本気実装する方針に変更。  
> **2026-05-12 時点の事実:** S-14 三ビュー・4値運用・通知拡張・シーダー等は **実装済み**（`materials/daily_reports/daily_technical_report.md`）。下記チェックリストは**完了済み（履歴のため `[x]` に更新）**。**課題2以降のバックログ**は本ファイル「今後の実装予定（課題②）」を参照。

### 既定の +α
- [x] 承認ステッパーUI（詳細画面用、大型版）


### 課題1 補強（追加実装決定・2026-05-01）
- [x] **`TaskHistoryService` 自動記録実装**（5項目：`status` / `progress_rate` / `assignee_id` / `due_date` / `priority`）
- [x] `ProjectTaskController::store / update` から Service 呼び出し
- [x] 案件詳細画面のタスクカードに「変更履歴」セクション追加（`Show.tsx` の既存 props 活用）
- [x] Feature テスト：主要フィールド変更で履歴が記録されること（1〜2 ケース）

### 課題2 として実装決定（2026-05-01）
- [x] **S-14 タスク一覧**（カンバン + メンバー別 ビュートグル・採用：`mockups/s14b_member_tasks_toggle.html`）
  - [x] migration: `tasks.reviewer_id` 追加（nullable FK→users）
  - [x] `MemberTaskController` + ロール別クエリ + view 切替
  - [x] `MemberTasks/Index.tsx` + `KanbanBoard.tsx` + `MemberMatrix.tsx` + `TaskCard.tsx` + `ViewToggle.tsx`
  - [x] `routes/web.php` に `/member-tasks` 追加
  - [x] サイドバー「タスク一覧」dim 解除
- [x] **タスク 4値運用**（実装者→確認者の品質ゲート）
  - [x] `ProjectTaskDialog` に確認者選択・`resolved` 遷移ボタン追加
  - [x] `ProjectTaskController` に `resolved` バリデーション
  - [x] `NotificationService::notifyTaskResolved` / `notifyTaskReviewed` 追加
  - [x] `NotificationType` Enum に `TaskResolved` / `TaskReviewed` 追加
  - [x] `TaskStatus::phase4Values()` ヘルパ追加
  - [x] `ApprovalService` 自動初期タスクに `reviewer_id` 初期値（部門管理者）設定
  - [x] `ProjectWorkItemPolicy` の遷移権限分岐（`assignee` only / `reviewer` only）
- [x] 遅延の見える化（一覧の期限超過バッジ・3日以内早期警告）
- [x] 消費率 70% 警告色（Phase 3 積み残し）

---

### Phase 5（資料・提出・最終確認）

#### 手動確認・マスト改修（チェックの正）

> マストの進捗は **ここを正**として更新する。実装スケジュール要約は `implementation_schedule.md`。

##### マスト改修 #1〜#13（実装状況）

- [x] **#1** サイドバー（セクション設計／配色・親子一体角丸・`activeKey` 優先）
- [x] **#2** 一覧名称（申請状況一覧／開発進捗一覧／予算状況一覧）
- [x] **#3** 申請画面のファイルアップロード
- [x] **#4** タスク完了入力時のエラー修正
- [x] **#5** 予算ダッシュボード（`/dashboard`）がデータと一致するか手動確認
- [x] **#6** プロフィール簡素化（表示＋パスワードのみ、削除導線なし）
- [x] **#7** ロール説明（サイドバー＋`/profile` ロール表示）
- **#8** スコープ外（申請者向けレスポンシブ最低限は実装しない・2026-05-12 方針：PC レイアウト優先）
- [x] **#9** 本部ロールのタスク閲覧のみ（`HqManagerTaskReadOnlyTest`）
- [x] **#10** 予算実績入力（モーダル＋深い導線＋サイドバー3行 merged）
- [x] **#11** メンバータスク DnD 403 後の見た目ズレ（楽観更新廃止）
- [x] **#12** シーダー調整（`track-b-*` / `track-c-*`、`ScenarioMirrorSeeder`、`PRJ-TB/TC`）
- [x] **#13** 申請者 S-14 board/list の部門内承認済タスク閲覧（`ApplicantMemberTasksDeptScopeTest`）

##### Phase 5 完了条件（提出前）

- [x] `npx tsc --noEmit` と `npm run build` が通る
- [x] `php artisan test` が通る
- [x] `requirements.md` の提出物5項目の状態が実体と一致
- [x] `Information.md` の動作確認シナリオがデモ導線と一致
- [x] デプロイ環境で 3 ロールの主要導線確認記録を残す
- [x] **PoC 採点用:** デプロイ手順に DB 初期化（例: `php artisan migrate:fresh --seed`）を記載し、採点者が手順どおり再現できること（未充足なら日報に明記）
- [x] プレゼン提出物（`.md` または `.pdf`）の最終版を確定
- [x] マスト改修の実施結果を日報・設計書へ反映（上表どおりチェック）

##### 明日以降すぐやること（実行順の目安）

1. マスト **#5** の手動確認（3ロールで `/dashboard`・KPI・70%超リスト）
2. `npx tsc --noEmit` / `npm run build` / `php artisan test`
3. `doc/Design`（`requirements.md` / `screen_flow.md` / `Information.md` 等）の相互参照確認
4. **アプリ内マニュアル（`/manual`）** … `user_manual.md` の **§4.6 タスク一覧** 追記をブラウザで確認。**カンバン／メンバー別** のスクショを `capture-screenshots.mjs` に追加して `doc/manual/images` を更新
5. デプロイ環境で申請→承認→開発／予算→通知の再確認

#### チェックリスト — ドキュメント（現行タスク）
- [x] `doc/Information.md`：デプロイURL・テストアカウント一覧
- [x] 利用マニュアル（簡易）：主要4フロー
  - [x] ログイン〜新規申請
  - [x] 部門承認〜本部承認
  - [x] 却下〜再申請
  - [x] タスク登録〜予算実績入力
- [x] README 最終調整（開発サーバ起動）

#### プレゼン資料（`doc/presentation.PDF`）
- [x] 課題1 工夫点のまとめ
- [x] 課題2 プレゼン
  - 優先度高：ステッパーUI（実装済み）
  - 優先度中：ダッシュボード案、メンバータスク一覧案
- [x] 感想・学び

#### デプロイ / 提出
- [x] 本番環境の DB リセット＋デモ用シード投入
- [x] 3ロール × 全画面の本番動作確認
- [x] main ブランチへのマージ完了
- [x] GitLab / Laravel Cloud のダウンがないこと確認
- [x] インターン終了日時までに提出完了

#### 最終確認
- [x] 提出物チェックリスト（materials\quest\requirements.md §提出物）5項目すべて完了
- [x] `php artisan test` が通る
- [x] コンソールエラー・TypeScript エラーなし

---
## 付録（運用・リスク・履歴）

### 今週の目標（5/7〜5/15）

1. Phase 5（資料・提出準備）を完了する
2. デプロイ環境で 3 ロール導線の最終確認を完了する
3. 提出物チェックリストを「実体一致」で締める
4. **マスト改修:** 本ファイル「Phase 5 — 手動確認・マスト改修」のチェックに沿って優先順位を決め、完了した項は設計書・マニュアルへ追随させる

### リスクと対策（更新）

- **リスク1:** GW期間は稼働時間が低下（2日/週）
  - **対策:** GW前（5/1まで）に Phase 3 を完了させる
- **リスク2:** 資料の記載が実装とズレる可能性
  - **対策:** `requirements.md` の棚卸し表を正本として、各ドキュメントを相互参照で更新
- **リスク3:** 火曜の通院・家族事由による突発的な稼働低下
  - **対策:** 毎週金曜に残時間・進捗率を棚卸し、翌週の優先3タスクを確定
- **リスク4:** 最終週の資料作成が間に合わない
  - **対策:** 新規実装は停止し、資料・提出物検証に残時間を集中配分

### 毎週金曜の確認項目

- 実績時間と残時間
- Phase ごとの完了率
- ブロッカーの有無
- 翌週の優先3タスク

### 日次ワークフロー（必須ルーティン）

日次の git 手順・コミット方針・チェックリストは **`doc/Design/AI.md` の「日次ワークフロー」節を唯一の正本**とする。本ファイルには手順を記載しない（二重管理を避けるため）。

Cursor / Claude との協働でも必ず遵守。

### バグ修正・UI改善（履歴・追記）

#### バグ修正（完了ログ）
- [x] `/login` 画面下部にテストユーザー一覧（申請者 / 部門管理者 / 本部管理者）を表示
- [x] `/login` 画面に `パスワード：password` 表示を追加
- [x] `/notifications` で白画面になる不具合を修正
- [x] 通知一覧のタスク導線修正（`NotificationActionUrl`・「案件を開く」は開発タブ `detailTab=tasks`、横並びで「タスクを開く」・`taskId` ディープリンク、`DemoWorkloadSeeder` の meta 整合、2026-05-15 追記）
- [x] `/projects?tab=dev` 期日列が完了タスクの期日を拾う不具合を修正（`withMin` を未完了タスクのみに限定、`ProjectDevTabDueDateTest`、2026-05-15 追記）
- [x] 案件詳細タスクモーダルで確認待ち・完了時に進捗 100%（`normalizedProgressRate`・`ProjectTaskDialog`、S-14 カンバン遷移も同ロジック、2026-05-15 追記）
- [x] `/projects/3/edit`（案件編集）を `/projects/create` 準拠で再構成し、編集画面から申請できるよう修正
- [x] 申請後の遷移先を `/projects?tab=approval` に統一（案件詳細への遷移を廃止）
- [x] `/projects?tab=approval`（申請タブ）をモック寄せで調整（操作列削除、行 hover 遷移、下書き/申請済みの遷移分岐）
- [x] 申請タブのタイトル「S-05新規申請」を「承認画面」に変更
- [x] 承認画面下部に「承認」「却下」ボタンを配置し、押下時にコメント入力モーダルを表示
- [x] コメント入力モーダルを S-04 案件詳細の承認モーダル仕様に統一（`mockups/s04_policy.md`, `mockups/s04_project_show.html`）
- [x] 「案件一覧から再編集」を、申請一覧の「ステータス=下書き」絞り込みリンクへ変更
- [x] 担当部門プルダウンから「本部」を除外
- [x] 概算工数の下にファイル添付「課題２」欄を追加（課題２装飾は共通部品化）
- [x] 下書き保存失敗時に「保存できませんでした！」のポップアップを表示
- [x] 「申請する」押下後モーダルの文言を更新
  - [x] 通知文言：`承認/却下時にアプリ内通知（＋メール 課題２）`
  - [x] 注意文言：`申請後、次の承認者が承認するまでは申請を取り下げできます`
- [x] 右上検索窓を薄いグレー塗りつぶしにし、`検索 "課題２"` 表示へ調整
- [x] ログアウト後の遷移先を `/login` に統一
- [x] `/projects?filter=pending&tab=approval` では申請タブのみ表示（開発/予算タブ非表示）
- [x] サイドバー「承認待ち一覧」の横に自分の承認待ち件数を表示（`mockups/s05_project_create.html` 参照）
- [x] `doc/Design/components_spec.md` の `ApprovalFlowGuide` 項目に「現状使用箇所なし」を明記
- [x] タスク追加・タスク編集画面をモック寄せで改善（アイコン追加、コメント機能追加）
- [x] `/projects/create` の承認フローガイドを `ApprovalStepperFull` に差し替え（S-04 仕様準拠）
- [x] 申請済みかつ部門承認待ちの案件を「取り戻し→下書き化」可能に変更
- [x] 「申請する」押下後モーダルのステータス表示を案件一覧下の凡例準拠に変更
- [x] 案件一覧の申請/開発/予算タブ横の数字を案件数に変更
- [x] 一覧タブから詳細遷移時の初期タブを統一（申請→申請、開発→タスク、予算→予算）
- [x] 詳細タブに応じたサイドバーアクティブ表示を修正
- [x] 詳細タブ切替が `replaceState` のとき `page.url` とずれて親子が二重アクティブになる問題を修正（2026-05-11）
- [x] 一覧＋「↳ 案件詳細」同時アクティブを一体の角丸ブロックで表示（2026-05-11）
- [x] `/projects/create` のプレースホルダー文字色のみ薄く調整（枠線濃度は維持）
- [x] 案件一覧の右端「>」マークを削除
- [x] `/projects/9?detailTab=history` の履歴表示を逆順（最新が下）に変更
- [x] `/projects/9?detailTab=tasks` の進捗バーを進捗率連動の配色へ変更
- [x] `doc/Design/components_spec.md` の「進捗バー配色ルール」を「消費率の色分けルール」準拠に書き換え、実装反映
- [x] 申請後説明文を更新（部門承認前は取り戻し可能、部門承認後は編集不可）
- [x] `/projects/12?detailTab=tasks` で進捗集計欄を上部へ移動し、予算工数/計画工数/実績工数で集計
- [x] `/projects/12?detailTab=tasks` に検索機能を追加
- [x] `https://projnexus-main-butvrx.laravel.cloud` をログイン画面またはホームへリダイレクト

#### S-03a（`mockups/s03a_policy.md`）と実装の整合（2026-05-07 反映）

- [x] **①**: 行末 chevron は実装しない方針のため、ポリシーから削除済み（**実装を正**）
- [x] **②**: タイトル2行（purpose 要約）・却下行に「再申請可」+ 却下コメント要約（API の `purpose` / `rejectedComment` と UI。**実装を正**）
- [x] **③**: 下書き＋編集可は編集画面へ、その他は詳細（apply）（**実装を正**）
- [x] **④**: サブタイトル「全N件」は `Paginator::total()`（**実装を正**）
- [x] **⑤**: 検索ラベルを実装どおり（案件名・申請者・主担当・部門名）（**実装を正**）
- [x] **⑥**: フィルタ「クリア」を jpt-blue リンク風（**実装を正**）
- [x] **⑦**: タブ横ガイド・凡例ヒントを `Infotip` に変更（**実装を正**）
- [ ] **⑧**: タブ下線を **3px**（ポリシーを正、`Tabs.tsx`）
- [x] **⑨**: ページネーションにページ番号列（省略 …）（実装）
- [x] **⑩**: 申請タブ「最終更新」を相対表示（実装）
- [ ] **⑪**: 一覧ヘッダー「新規申請」を **本部管理者には表示しない**（ポリシーを正、`canCreateProject`）
- [x] **⑭**: **本部ロールのタスク閲覧のみ**（マスト #9 実装済み・2026-05-12）
- [ ] **⑫**: 一覧テーブルの UI 正本は **`resources/js/Components/Projects/ProjectTable.tsx`**（3バリアント）。`Projects/Index.tsx` はページ統合・データマッピング・`router.visit` 連携。ポリシー詳細は `mockups/s03a_policy.md` §一覧テーブルの実装配置
- [x] **⑬**: 列ソート・「本部直行」バッジは実装上の追加でありポリシーに記載済み（実装を正）

#### 継続UI調整（実施中）


#### 完了済み
- [x] ログイン画面に部門長テストユーザーをプリセット
- [x] ログイン画面で3ロール代表ユーザー表示＋「＋」で全ユーザー展開
- [x] ログイン画面のマニュアルリンクをテストユーザー一覧より上へ配置
- [x] 全マニュアルリンクを別窓表示に統一
- [x] アプリ名を「開発管理アプリ ProjNexus」に変更
- [x] サイドバーのプロフィール上に「マニュアル」導線を追加
- [x] 管理画面サイドバー見出し（JPT 開発管理）の縦パディング調整
- [x] フォーム補足説明のツールチップ化（常時表示文を整理）
- [x] 部門管理者向け承認フロー説明を `ApprovalStepperFull` へ置換し、設計方針書・`doc/Design` も同期
- [x] レフトナビにスクロール機能を追加
- [x] マニュアル 2.2 承認フロー（状態遷移図）のラベル配色可読性を改善（黒地/白字）
- [x] マニュアル本文先頭の重複目次を削除し、目次リンク不整合を解消
- [x] マニュアル目次をモバイル/タブレットでハンバーガーメニュー化
- [x] ログイン画面・マニュアル・サイドバーのアプリ名表記を `ProjNexus` へ統一
- [x] 「一覧に戻る」「キャンセル」ボタンの見た目を共通化（`Button` の `neutral` variant）
- [x] `/projects/create` 下書き保存時の `estimated_amount` null エラーを修正
- [x] サイドバー「マニュアル」リンクを別タブ表示に修正（`target="_blank"` 対応）
- [x] `/projects/{id}/edit` を `/projects/create` 準拠UIへ統一（タイトル・一部項目は編集用として維持）
- [x] マニュアル 2.2 状態遷移図の黒地/白字表示の最終反映確認（別チャット対応分を基準に確認）
- [x] マニュアルリンク切れを総点検（別チャット対応分の確認待ち）
- [x] `/projects/3?detailTab=apply` 承認画面に申請画面同等の添付ファイル欄を追加
- [x] `/projects?tab=approval` のページ送り件数を 5 件に調整
- [x] `/profile` の英語UI文言を日本語化（プロフィール/パスワード/削除導線）
- [x] `/profile` の説明文 2 箇所を共通 `Infotip` に置換
- [x] トップバー右端にログアウトアイコンを追加し、通知/マニュアル/ログアウトにツールチップを実装
- [x] サイドバーフッターのログアウトアイコンを廃止し、プロフィール直下へログアウト導線を移動
- [x] サイドバーのログアウト項目直上に仕切り線を追加
- [x] サイドバーセクション見出し（申請・承認/開発管理/予算管理）の可読性を改善
- [x] レフトナビ開閉（折りたたみ）機能（2026-05-11 完了）
- [x] ログイン画面のテストユーザー表を `UserSeeder` と一元化（`loginDemoAccounts`・全10件・代表3件の折りたたみ、2026-05-14）
- [x] `/projects?tab=approval` 一覧から下書き「削除」ボタン・操作列・確認ダイアログを廃止（下書き削除は編集画面のみ、`Index.tsx`、2026-05-14）
- [x] 通知一覧（S-12）タスク系の二重導線（案件を開く＋タスクを開く）とリンク切れ対策（2026-05-15 追記）
- [x] 開発進捗一覧の期日（未完了タスクのみ）・タスク確認待ち/完了時の進捗 100%（2026-05-15 追記）

