# implementation_schedule 作業ログ

`doc/daily/implementation_schedule.md` から技術的な日次の詳細作業記録を分離したログです。  
**マスト改修のチェック進捗**は `doc/daily/intern_schedule.md` §「Phase 5 手動確認・マスト改修」を正とし、**明日以降の作業目線**は `implementation_schedule.md` を参照してください。

---

## intern_schedule より転記 — 現在地（2026-05-12 時点）

> 旧 `intern_schedule.md` §「現在地」の長文をここへ集約。日別の実装メモは本ファイルの各日付セクションを正とする。

- **現在の主作業:** Phase 5（資料同期・提出準備・デプロイ確認）。マスト改修のチェックは **`intern_schedule.md` §「Phase 5 手動確認・マスト改修」** を正とする。
- **直近の実装（2026-05-08 前後）:** S-02 ダッシュボード（Recharts・サイドバー導線）、タイムゾーン JST 統一（`config/app.php`）。
- **直近の実装（2026-05-11）:** 申請ファイル添付・multipart／JSON 切替、サイドバーライト化・一覧名称統一、案件詳細タブとサイドバー配色連動（`sidebarNavTheme.ts`）、申請帯／工数サマリー帯／履歴／予算パネルの背景整理、サイドバー親子アクティブの一体角丸・`activeKey` 優先による二重ハイライト解消。（UI 粒度の詳細は上記 **2026-05-01** ログ参照）
- **直近の実装（2026-05-12）:** マスト #10（予算実績入力導線の整理、`/projects/{id}/budget-input` を深い導線として残し S-11 は詳細内モーダルへ統一、サイドバー 3 行 merged）、マスト #11（S-14 DnD 403 後の見た目ズレ・先行楽観更新の廃止）。
- **直近の実装（2026-05-12 追記）:** マスト #12（`ScenarioMirrorSeeder`・`track-b-*` / `track-c-*`）、マスト #13（申請者 S-14 board/list の部門内タスク閲覧）。マスト #8 はスコープ外。
- **直近完了（実装）:** S-14（board/members/list）、4 値運用（`resolved`/`closed`）、通知拡張（`task_resolved`/`task_reviewed`）、設計書群の実装同期。
- **直近完了（設計）:** `er_diagram.md` v6、`components_spec.md` 正本化、`Information.md` シナリオ拡充、`screen_flow.md` 実装整合、`s16_burndown_policy.md` 追加、Button `neutral` 定義追記。
- **当時の次の着手:** Phase 5（資料・スクショ・提出チェック）。マスト #5 手動確認、#8 はスコープ外、サイドバー調査メモの要否判断。具体: 変更後 UI のスクショ差し替え、S-14 DnD 修正の再確認、マニュアル・プレゼン反映。**最新の着手順は `implementation_schedule.md` と `intern_schedule.md` §「明日以降すぐやること」を参照。**

---

## 2026-05-01（金）追記 — 案件詳細/タスク一覧 UI 統一・共通化・導線調整

### 実装概要
- 案件詳細（`Projects/Show.tsx`）のヘッダー表示・パンくず・検索帯配置を調整
  - タイトルから「（案件名）」を削除し、案件IDをタイトル右隣へ統合
  - パンくずを `開発管理 → 案件一覧 → 案件詳細：{案件名}` へ統一
  - タスク一覧フィルタ帯をコンパクト化し、配置を見出し直下へ整理
- 工数サマリーに Info ツールチップを追加し、`Infotip` を共通部品化
  - `resources/js/Components/ui/infotip.tsx` を新規追加
  - `doc/Design/components_spec.md` に仕様を追記（実装済みとして更新）
- タスク一覧表示を拡張
  - ステータス列で全ステータスに進捗バー + 進捗率を表示
  - 確認者フィルタ、期日フィルタ（3日以内/7日以内/日付指定）を追加
- メンバータスク画面（`/member-tasks`）を改善
  - ビュー切替に「一覧」を追加（案件詳細の開発管理に準じたテーブル）
  - 一覧ビューの検索帯を案件詳細タブと同系UIへ統一
  - キーワード検索（タイトル/説明/担当/確認者/案件名/ID）をサーバ側に追加
- サイドバー導線を改善
  - 3セクションの「案件一覧」配下に `|_案件詳細` を追加し、詳細表示時は親子ともアクティブ化
  - プロフィール上に「マニュアル」リンクを追加
- ルート遷移を変更
  - `/` アクセス時、未ログインはログイン画面・ログイン済みはホームへリダイレクト
- 予算タブ表示を調整
  - 予算情報カードから「見積」行を削除（予算・実績のみ表示）

### 主要変更ファイル
- `resources/js/Pages/Projects/Show.tsx`
- `resources/js/Pages/MemberTasks/Index.tsx`
- `resources/js/Components/MemberTasks/ViewToggle.tsx`
- `resources/js/Components/Layout/Sidebar.tsx`
- `resources/js/Components/ui/infotip.tsx`（新規）
- `app/Http/Controllers/MemberTaskController.php`
- `routes/web.php`
- `doc/Design/components_spec.md`

### 検証
- `npm run build` 成功
- `ReadLints` で変更ファイルにエラーなし

---

## 2026-05-07（木）追記 — マニュアル画面改善・ボタン共通化・下書き保存エラー修正

### 実装概要
- マニュアル画面（`/manual`）の操作性と可読性を改善
  - 2.2 承認フロー（状態遷移図）のコードブロック表示判定を修正し、図解を黒地・白字で表示
  - 左目次リンクのスクロール挙動を安定化（`scrollIntoView` + hash 更新）
  - 本文先頭の重複目次を削除（リンク切れ要因を解消）
  - モバイル/タブレットで目次をハンバーガーメニュー化（PCはサイドバー維持）
- アプリ名表記を `ProjNexus` へ統一し、表示階層を調整
  - ログイン画面、マニュアルヘッダー、サイドバー上部を「開発管理アプリ（小） + ProjNexus（大）」へ統一
  - ログイン画面のロゴ上余白を拡張
  - サイドバー上部ロゴをログイン画面と同じ `ApplicationLogo` に統一
- ボタンの共通運用を整理
  - 既存 `Button`（`resources/js/Components/ui/button.tsx`）に `neutral` variant を追加
  - 「一覧に戻る」「キャンセル」を `neutral` に統一（Create/Edit のヘッダー・フッター・モーダル）
  - 一時作成した `NeutralAction.tsx` は廃止し、既存共通部品へ統合
  - 一覧の「新規申請」ボタンは `/projects/create` の「申請する」と同じ `default` 挙動に再統一
- ドキュメント同期
  - `doc/Design/components_spec.md` に Button 章（variant一覧、size指針、運用ルール）を拡充
  - `doc/Design/design_system.md` に「補助アクションは `neutral` 既定」運用ルールを追記
- 不具合修正
  - `/projects/create` の下書き保存で `estimated_amount` が `null` の場合に DB 制約違反となる問題を修正
  - `ProjectController@store/update` で `estimated_amount` が `null` のとき `0` を補完

### 主要変更ファイル
- `resources/js/Pages/Manual/Index.tsx`
- `doc/manual/user_manual.md`
- `resources/js/Layouts/GuestLayout.tsx`
- `resources/js/Components/Layout/Sidebar.tsx`
- `resources/js/Components/ui/button.tsx`
- `resources/js/Pages/Projects/Create.tsx`
- `resources/js/Pages/Projects/Edit.tsx`
- `resources/js/Pages/Projects/Index.tsx`
- `app/Http/Controllers/ProjectController.php`
- `doc/Design/components_spec.md`
- `doc/Design/design_system.md`

### 検証
- `ReadLints` で変更対象の TypeScript ファイルにエラーなし
- `php -l app/Http/Controllers/ProjectController.php` で構文エラーなし
- ブラウザ手動確認で `/projects/create` の下書き保存エラー解消を確認

---

## 2026-05-07（木）追記2 — サイドバー別タブ導線の修正とマニュアル表示再調整

### 実装概要
- サイドバーの「マニュアル」リンクが同一タブ遷移になる問題を修正
  - `SidebarLink` で `target="_blank"` 指定時は Inertia `Link` ではなく素の `<a>` を使用
  - サイドバー導線で確実に別タブが開く挙動へ統一
- マニュアル（`/manual`）の「2.2 承認フロー（状態遷移図）」表示を再調整
  - `ReactMarkdown` の `pre` レンダラーでコード本文を判定し、状態遷移図ブロックのみ黒地/白字を適用
  - `code` の inline/ブロック判定を安定化し、図解が消える副作用を回避

### 主要変更ファイル
- `resources/js/Components/Layout/Sidebar.tsx`
- `resources/js/Pages/Manual/Index.tsx`

### 検証
- `ReadLints` で対象 TypeScript ファイルにエラーなし
- `npm run build` はユーザー操作で中断されたため、最終ビルド反映は再実行して確認予定
---

## 2026-05-08（金）追記 — S-02 ダッシュボード実装

### 実装概要
- `recharts` を追加し、S-02 ダッシュボード画面を新規実装
- バックエンドに `DashboardController` を追加し、以下をロール別スコープで集計
  - 進行中案件数
  - 承認待ち件数
  - 平均進捗率
  - 予算消費率
  - 部門別進捗
  - 予算70%超案件
- ルーティングを `/dashboard` -> `DashboardController@index` に差し替え
- サイドバー「予算管理」に「ダッシュボード」を追加（ActiveKey 追加）
- ドキュメント同期
  - `mockups/s02_policy.md`
  - `doc/Design/AI.md`
  - `doc/Design/screen_flow.md`
  - `doc/Design/components_spec.md`

### 主要変更ファイル
- `app/Http/Controllers/DashboardController.php`（新規）
- `resources/js/Pages/Dashboard/Index.tsx`（新規）
- `resources/js/Components/Dashboard/KpiCard.tsx`（新規）
- `resources/js/Components/Dashboard/DeptProgressChart.tsx`（新規）
- `resources/js/Components/Dashboard/BudgetTrendChart.tsx`（新規）
- `resources/js/Components/Dashboard/BudgetAlertTable.tsx`（新規）
- `resources/js/Components/Layout/Sidebar.tsx`
- `routes/web.php`
- `package.json` / `package-lock.json`

### 検証
- `npm run build` 成功（TypeScript + Vite）
- Recharts の Tooltip 型エラーを修正後に再ビルドし、成功を確認
---

## 2026-05-08（金）追記2 — タイムゾーンを日本時間へ統一

### 実装概要
- 履歴・更新時刻の表示を日本時間（JST）で扱うため、Laravel のアプリタイムゾーンを変更
- `config/app.php` の `timezone` を `UTC` 固定から `env('APP_TIMEZONE', 'Asia/Tokyo')` へ変更
- 反映のため `php artisan config:clear` を実行

### 主要変更ファイル
- `config/app.php`

### 検証
- `php artisan config:clear` 実行成功
- `/dashboard` の「最終更新」および履歴系時刻が JST 基準になる設定を確認

---

## 2026-05-11（月）追記 — 案件詳細タブ配色・サイドバー親子アクティブ・履歴パネル背景

### 実装概要
- **ナビ色トークンの共通化:** `resources/js/lib/sidebarNavTheme.ts` に `sectionNavTheme`（申請/開発/予算）と履歴用 `sidebarHistoryTabTheme` を定義し、サイドバーと案件詳細のフォルダ型タブで同色を参照
- **`ProjectDetailTabBar.tsx`:** 予算タブのアクティブ面／ラベル色を `sectionNavTheme.budget` に統一（旧 `budgetStrip` で開発色を流用していた箇所を廃止）
- **`Projects/Show.tsx`:** 予算タブ本文ラッパーを `sectionNavTheme.budget.tabActiveSurfaceHex` に合わせる。履歴タブ時は `sidebarHistoryTabTheme.tabActiveSurfaceHex`（薄グレー）を領域背景にし、タイムラインカードは白維持。開発タブの工数サマリー帯を `sectionNavTheme.dev.tabActiveSurfaceHex` に統一。申請タブ上部の承認周り帯を `sectionNavTheme.approval.tabActiveSurfaceHex` に統一
- **`ApprovalStepperFull.tsx`:** 承認フローカードは白地（帯のみ水色）
- **`Sidebar.tsx`:** 案件詳細で `detailTab` が `history.replaceState` により Inertia の `page.url` と不一致になる場合、`projects-*` の **`activeKey` を優先**して一覧行のアクティブを決定。親（申請状況一覧等）と子（↳ 案件詳細）が**両方アクティブ**のときは `mx-2 overflow-hidden rounded-lg` ＋ `sectionNavTheme.*.activeClass` の**単一ラッパー**で包み、内側リンク／子ラベルは `insideMergedActive` で背景透明・継ぎ目なしの一体角丸にする

### 主要変更ファイル
- `resources/js/lib/sidebarNavTheme.ts`
- `resources/js/Components/Projects/ProjectDetailTabBar.tsx`
- `resources/js/Pages/Projects/Show.tsx`
- `resources/js/Components/Approval/ApprovalStepperFull.tsx`
- `resources/js/Components/Layout/Sidebar.tsx`

### 検証
- `npx tsc --noEmit` 成功（サイドバー統合後の型チェック）

---

## 2026-05-12（火）追記 — #10 予算実績入力の階層化 / #11 DnD 403後ズレ修正

### 実装概要
- **#10 予算実績入力（情報設計 + 導線）**
  - 新規ルート `GET /projects/{project}/budget-input`（`projects.budget-input`）を追加
  - `BudgetController::edit` を追加し、`Projects/BudgetInput.tsx` を実体ページとして実装
  - `Projects/Show.tsx` の予算タブ「実績を入力」はモーダルから専用ページ遷移へ変更
  - 保存時は `projects.budget.update` に `source=budget-input` を渡し、更新後は同ページへ復帰
- **#10 サイドバーの3行一体ハイライト**
  - `Sidebar.tsx` で `/projects/{id}/budget-input` を判定し、予算実績入力表示中は
    `予算状況一覧 → ↳案件詳細 → ↳予算実績入力` を `sectionNavTheme.budget` で merged 表示
  - 予算実績入力のトップレベル単独リンクは廃止し、案件詳細配下の子階層へ統一
- **#11 DnD 失敗後の見た目ズレ**
  - `MemberTasks/Index.tsx` の `moveTaskStatus` から先行楽観更新を削除
  - 403時にカードが移動して見える揺れを抑制
  - 同様の処理がある `Projects/Show.tsx` の `moveProjectTaskStatus` も同方針へ統一

### 主要変更ファイル
- `app/Http/Controllers/BudgetController.php`
- `routes/web.php`
- `resources/js/Pages/Projects/BudgetInput.tsx`（新規）
- `resources/js/Pages/Projects/Show.tsx`
- `resources/js/Components/Layout/Sidebar.tsx`
- `resources/js/Pages/MemberTasks/Index.tsx`
- `doc/Design/components_spec.md`
- `doc/Design/screen_flow.md`
- `doc/daily/implementation_schedule.md`

### 検証
- `npx tsc --noEmit` 成功
- `php -l app/Http/Controllers/BudgetController.php` 構文エラーなし
- `ReadLints` で変更ファイルのエラーなし
- ~~`php artisan test` は既存の `Tests\Feature\ExampleTest`（`/` 200前提）で1件失敗~~ → **2026-05-13:** `ExampleTest` を `/` の 302 リダイレクト仕様に合わせ修正済み（`daily_technical_report.md` 同日追記参照）

### 追記（同日・最終調整）
- `S-11` を **専用ページ運用からモーダル運用へ再調整**
  - `/projects/{id}/budget-input` は廃止せず、`projects.show?detailTab=budget&budgetInput=1` にリダイレクトしてモーダル起動する深い導線に変更
  - `Projects/Show.tsx` で `budgetInput=1` クエリを検知して `BudgetActualDialog` を初期表示
  - 保存時 `source=show-budget` を付与し、更新後の戻り先を予算タブ文脈に統一
- サイドバー判定ロジックを画面種別ベースへ整理
  - `/member-tasks` で「タスク一覧」と「開発進捗一覧」が同時アクティブになる問題を解消
  - `detailTab=budget` / `budget-input` で「予算実績入力」行表示と3行 merged を安定化
  - `↳ 予算実績入力` は1段深い字下げへ調整

## 2026-05-12（ロール説明 UI・ドキュメント同期）

### 概要
- マスト #7 に沿い、ログイン中ユーザーのロール意味をサイドバーで常時表示。
- ユーザー確認に基づき、`/profile` のアカウント情報にロール（複数は ` / ` 連結）を読み取り専用で追加。

### 変更ファイル
- `resources/js/Components/Layout/Sidebar.tsx`
- `resources/js/Pages/Profile/Edit.tsx`
- `doc/Design/Information.md`
- `doc/Design/system_spec.md`
- `doc/Design/components_spec.md`
- `doc/Design/screen_flow.md`
- `doc/manual/user_manual.md`
- `doc/daily/implementation_schedule.md`
- `doc/daily/intern_schedule.md`
- `doc/daily/log/implementation_schedule_log.md`

### Git
- ブランチ: `feat/role-display-profile-docs`
- コミット: コードと `doc/Design`＋日次ログを分離（`feat:` / `docs:`）

---

## 2026-05-13 追記 — マスト #12/#13（S-14・シーダー）・日次ドキュメント整理

### 実装概要（マスト #13）
- **純申請者**（`applicant` のみ・部門管理者／本部ロールなし）の **`/member-tasks?view=board|list`** で、選択部門の **承認済み案件に紐づくタスクを部門単位で一覧**できるよう変更
- `MemberTaskController::filteredTasksQuery` から、`view` が `board` / `list` のときに付与していた **`assignee_id` / `reviewer_id` = 自分** の追加 `where` を除去
- 閲覧範囲は既存の `whereHas(project … department + approved)` と **`ProjectWorkItemPolicy::view`** に整合。編集・DnD は `canUpdate` / `update` / `assertStatusTransition` のまま

### 実装概要（マスト #12）
- **`UserSeeder`:** ②採点用 `track-b-applicant@` / `track-b-dept@` / `track-b-hq@`、③予備用 `track-c-*@`（各 `password` は他アカウントと同様）を追加
- **`ScenarioMirrorSeeder`（新規）:** `PRJ-TB-001`〜`009` / `PRJ-TC-001`〜`009` の並行案件（下書き〜承認済、却下・再申請子、本部却下、主担当外タスク付き承認済など）を投入
- **`DatabaseSeeder`:** `DemoWorkloadSeeder` の後に `ScenarioMirrorSeeder` を連結
- **`Information.md`:** §2（`UserSeeder` 基づくアカウント一覧）、§4.1（ミラー案件の説明）を追加（後続で §2.1 系統表は廃止し本文をシーダー写しに整理）

### テスト・その他コード
- **`tests/Feature/ApplicantMemberTasksDeptScopeTest.php`（新規）:** 主担当外タスクが board に含まれること／他部門タスクが含まれないこと／`canUpdate` が偽であること
- **`tests/Feature/ExampleTest.php`:** `/` が **302 でログインへ** リダイレクトする現行仕様に合わせ `assertRedirect(route('login'))` へ変更（従来の 200 期待を解消）

### 設計・日次ドキュメント
- **`system_spec.md`:** §7 脚注 ※3 に S-14 純申請者のクエリ方針を追記
- **`screen_flow.md`:** S-14 の applicant 行（board/list）を部門内承認済タスク一覧の説明に更新
- **`role_feature_matrix_.md`:** S-14 純申請者（board/list）の脚注を追加
- **`implementation_schedule.md`:** 明日以降の作業目線に特化して**大幅に要約**。マスト一覧のチェック管理は **`intern_schedule.md` §「Phase 5 手動確認・マスト改修」** へ転記
- **`intern_schedule.md`:** 上記チェックセクション・「明日以降すぐやること」・マスト #8 スコープ外の明記、S-03a ⑭ を完了に更新
- **`daily_report.md`（2026-05-12）:** 作業時間・累計・「次回の作業予定」を**ユーザー意図どおり**に再記載（`git restore` で戻した内容の復元）

### 主要変更ファイル
- `app/Http/Controllers/MemberTaskController.php`
- `database/seeders/UserSeeder.php`
- `database/seeders/ScenarioMirrorSeeder.php`（新規）
- `database/seeders/DatabaseSeeder.php`
- `tests/Feature/ApplicantMemberTasksDeptScopeTest.php`（新規）
- `tests/Feature/ExampleTest.php`
- `doc/Design/Information.md` / `system_spec.md` / `screen_flow.md` / `role_feature_matrix_.md`
- `doc/daily/implementation_schedule.md` / `intern_schedule.md` / `daily_report.md`

### 検証
- `php artisan migrate:fresh --seed` 成功（`ScenarioMirrorSeeder` 含む）
- `php artisan test` 全件通過（46 tests）

### Git（参考）
- 実装コミット例: `feat/mast-13-12-applicant-tasks-seeders` ブランチ上で `feat: S-14 申請者の部門タスク一覧とシナリオ系統シーダー`

### 運用メモ（`git restore` について）
- ユーザー方針: **日報 `daily_report.md` を `git restore` で一括巻き戻さない**（作業時間・累計・次回予定など、当日追記を失うため）。
- **補足:** `doc/Design/AI.md` の「日次ワークフロー」§注意に上記を明文化済み。再開時の確認先は `implementation_schedule.md` に加え **`intern_schedule.md`（マストチェック正本）** を併記。

# 実装スケジュール詳細ログ

`doc/daily/implementation_schedule.md` の「前日までの作業詳細」を記録する。  
要約のうち **明日以降の目線** は `implementation_schedule.md`、**マスト等のチェック進捗** は `intern_schedule.md` §「Phase 5 手動確認・マスト改修」を正とする。

---

## 2026-05-08

- `implementation_schedule.md` に「マストで修正・実装する項目（改修リスト）」「今後の実装項目（課題2）」を追加。
- 用語を「回収」から「改修」へ統一（スケジュール・運用ドキュメント）。

## 2026-05-08（本番本部承認 500 の調査）

- ローカル（SQLite テスト）では再現せず、本番 MySQL のみで落ちる想定として `notifications.type` の ENUM ずれと、`TaskHistoryService` のネストトランザクションを疑い対処した。
- `database/migrations/2026_05_08_120000_notifications_type_to_varchar_mysql.php` を追加（MySQL/MariaDB のみ `type` を VARCHAR に）。
- `TaskHistoryService` で `DB::transactionLevel() > 0` のときは内側トランザクションを張らない。
- `ProjectApprovalFlowTest` に本部承認の結合テストを追加。
- `intern_schedule.md` の現在地・今週の目標を同期。
- `doc/Design/Information.md` §5 に `implementation_schedule.md` §3 への参照行を追加。

## 2026-05-12（ロール説明・プロフィール）

- サイドバー下部ユーザーカードにロールの役割説明文を追加（`Sidebar.tsx`）。
- `/profile` のアカウント情報に **ロール** 行を追加（複数ロールは日本語ラベルを ` / ` 連結、`Profile/Edit.tsx`）。
- `Information.md`（§1.3〜1.4）、`system_spec.md`、`components_spec.md`、`screen_flow.md`、`user_manual.md`、`implementation_schedule.md`、`intern_schedule.md` を同期。

## 2026-05-13（実装スケジュール要約の整理・チェック項目の移管）

- **`implementation_schedule.md`:** 長大だった §3（マスト表・調査メモ・PoC 方針・手動チェック等）を削り、**明日以降の作業目線**（短い「現在地」「明日以降やること」）に特化。
- **`intern_schedule.md`:** マスト #1〜#13・Phase 5 完了条件・「明日以降すぐやること」を **チェックリスト形式**で §「Phase 5 手動確認・マスト改修」に集約。現在地・今週の目標の文言を上記に合わせて修正。
- **`daily_report.md`（2026-05-12）:** 作業時間・累計・次回予定をユーザー意図どおり保持（`git restore` で失われた内容の手動復元方針を `AI.md` §注意へ追記）。
- **`doc/Design/AI.md`:** 再開時は `implementation_schedule.md` に加え `intern_schedule.md` を確認する旨、および **`git restore` で `daily_report.md` を一括巻き戻さない** 注意を追加。

## 2026-05-14（申請下書き削除・編集画面 UI）

### 実装概要
- **下書き削除**
  - `ProjectPolicy::delete` を **下書き（`draft`）・申請者本人・子案件なし** に限定（却下のみの削除は不可に変更）
  - `ProjectController::destroy` に成功フラッシュ。一覧 API に `canDeleteDraft`。`flash.success` を Inertia 共有へ追加
  - 申請タブ一覧: 当初は操作列・確認ダイアログ・行クリックと削除ボタンのイベント分離を実装。**2026-05-14:** 一覧の削除 UI は廃止し編集画面に一本化（本節末尾の追記を参照）
  - `tests/Feature/ProjectDraftDeleteTest.php`（本人削除・却下不可・他人不可・子案件あり不可）
  - `materials/Design/system_spec.md`（URL 行・ロール表に下書き削除を追記）
- **案件編集 UI（`Projects/Edit.tsx`）**
  - 「下書きを削除」を「更新を保存」と**同一行**（`flex-wrap` + `gap-2`）
  - `DRAFT_DELETE_OUTLINE_CLASS` で `jpt-border` / `jpt-muted` / `jpt-bg` / `jpt-dark` を共通化（`design_system.md` のボーダー・補助色・背景・濃色に相当）
  - 削除確認モーダル: **キャンセル**は `variant="destructive"`（JGC レッド地＋白字）、**削除する**は上記グレーアウトライン＋ `Trash2`／処理中は `Loader2`

### 主要変更ファイル
- `app/Policies/ProjectPolicy.php`
- `app/Http/Controllers/ProjectController.php`
- `app/Http/Middleware/HandleInertiaRequests.php`
- `resources/js/Pages/Projects/Index.tsx`
- `resources/js/Pages/Projects/Edit.tsx`
- `resources/js/types/index.d.ts`
- `tests/Feature/ProjectDraftDeleteTest.php`
- `materials/Design/system_spec.md`

### 検証
- `php artisan test --filter=ProjectDraftDeleteTest`
- `npx tsc --noEmit` / `npm run build`

### Git（参考）
- ブランチ `feat/project-draft-delete`
- コミット例: `d7533a03` — `feat: 申請下書きの削除（一覧・編集・Policy・テスト）`
- **補足:** 案件編集の UI 調整（横並び・モーダル配色・`cn` 共通化）は作業後に `Edit.tsx` のみ未コミットの状態があり得る。区切りで `feat:` または `fix:` を分けてコミット推奨

---

## 2026-05-14 追記 — ログイン画面テストユーザー表と `UserSeeder` の一元化

### 実装概要
- **`UserSeeder`:** 投入行を `userDefinitions()` に集約し、`run()` は同配列をループして `updateOrCreate`（従来の10アカウント・ロール・所属と同一）
- **`UserSeeder::loginDemoAccounts()`:** ログイン画面用に `roleLabel`（`Role` Enum の `label()`）・`email`・`department`・`representative`（代表3件のみ true）を返す静的メソッドを追加
- **`AuthenticatedSessionController::create`:** Inertia に `testAccounts` を付与
- **`Login.tsx`:** ハードコード表を廃止し `testAccounts` を描画。折りたたみ時は代表3件、展開時はシーダー順の全10件（従来欠けていた開発1部の追加申請者3名・開発3部の部門管理者を含む）

### 主要変更ファイル
- `database/seeders/UserSeeder.php`
- `app/Http/Controllers/Auth/AuthenticatedSessionController.php`
- `resources/js/Pages/Auth/Login.tsx`

### 検証
- `php artisan test` 全件通過
- `npm run build` 成功

### 日次ドキュメント
- `materials/daily_reports/intern_schedule.md`（継続UI調整・完了済みへ移管）
- `materials/daily_reports/implementation_schedule.md`（現在地に1行追記）
- 本ファイル（本節）

---

## 2026-05-14 追記 — 申請タブ一覧（`/projects?tab=approval`）から下書き削除 UI を廃止

### 背景・方針
- 下書き削除の**サーバー側**（`ProjectPolicy::delete`・`destroy`・テスト）は維持する。
- 一覧の行末「削除」は誤タップや画面のノイズになりやすいため、**申請タブのテーブルから削除ボタン・「操作」列・専用確認ダイアログ**を取り除く。
- 下書きの削除は **`/projects/{id}/edit` の「下書きを削除」** に一本化する。

### 実装概要
- `resources/js/Pages/Projects/Index.tsx`: 承認タブ行の削除ボタン、`draftDeleteTarget` / `draftDeletingId` / `confirmDeleteDraft`、下書き削除用 `Dialog`、未使用 import（`Loader2` / `Trash2` / `Dialog*`）を削除。`ApprovalProjectRow` 等から `canDeleteDraft` を除去（API の余剰キーはそのままでも可）。
- `npx tsc --noEmit` で型チェック済み。

### 日次ドキュメント
- `materials/daily_reports/implementation_schedule.md`（§1 現在地の文言調整）
- `materials/daily_reports/intern_schedule.md`（完了済みへ追記）
- 本ファイル（本節）

---

## 2026-05-15（金）— 最終日・提出締め・return_to 修正・公開面

### 実装概要（return_to / S-14）
- **背景:** タスク更新後の `return_to` が Ziggy の `route()` 由来の**絶対 URL** になり、サーバー側のオープンリダイレクト対策で拒否され、案件詳細へフォールバックしていた
- **`app/Support/SafeReturnTo.php`（新規）:** `/member-tasks` 配下のみ許可。相対パス・同一ホストの絶対 URL を許可し、`//evil.example/...` や外部ホストはフォールバック
- **`MemberTaskController` / `ProjectTaskController`:** リダイレクト先決定を `SafeReturnTo::memberTasksOr()` に統一
- **`resources/js/lib/memberTasksReturnTo.ts`（新規）:** `buildMemberTasksReturnTo()` で**相対パスのみ**組み立て（`view` / `department_id` 等のクエリを保持）
- **`MemberTasks/Index.tsx`:** タスク保存時に上記ヘルパーで `return_to` を付与
- **`tests/Feature/MemberTasksTaskUpdateReturnToTest.php`（新規）:** 相対・同一ホスト絶対・外部 URL・プロトコル相対の 4 ケース

### セキュリティ追記（同日・先行コミット）
- `return_to` 検証で `parse_url` の path のみ見て元 URL を返していた実装を修正。`scheme` / `host` の有無で相対か判定し、外部へ飛ぶ URL はデフォルトへフォールバック（`75585bfa`）

### 不具合修正（/manual）
- `resources/views/app.blade.php`: Manual ページで存在しない Vite マニフェストキーを参照していたため、`@vite` を `app.tsx` のみに変更し本番のマニフェストエラーを解消

### 提出用 doc
- `doc/Information.md`（提出用注記位置の調整）
- `doc/presentation.pdf` 更新、`materials/presentation_drafts/` に pptx 下書き
- `doc/利用マニュアル 簡易版.pdf` 追加、ER 図 PDF ファイル名の全角表記統一

### 検証
- `php artisan test` — 54 passed
- `npm run build`（最終コミット後に実施）

### Git（参考）
- `fix/member-tasks-return-to-after-edit` → `main` マージ（`07163f79`, `d06e1f80`）
- 同日: `ff603325`（manual Vite）、`4a6c9459`（提出 doc）、`75585bfa`（return_to 脆弱性）

### 日次ドキュメント
- `materials/daily_reports/daily_report.md`（本日・最終日）
- `materials/daily_reports/implementation_schedule.md`（§1 日付・Phase 5 完了）
- 本ファイル（本節）

---

## 2026-05-15 追記 — 通知一覧（S-12）のタスク導線・リンク切れ修正

### 背景
- 本番・ローカルで `/notifications` の「案件を開く」が **403** やリンク非表示になる事例（デモシードの `meta.project_id` が受信者の閲覧範囲外、タスク系で `detailTab=tasks` 未指定など）
- 確認依頼（`task_resolved`）などタスク通知では **開発タブ（タスク）** へ誘導し、該当タスクは別ボタンで開きたい要望

### 実装概要
- **`app/Support/NotificationActionUrl.php`（新規）:** `resolveActions()` で `project` / `task` の2導線を解決。`ProjectPolicy` / `ProjectWorkItemPolicy` で閲覧不可なら `null`。Inertia 向けに **相対パス**（`route(..., absolute: false)`）を返す
- **タスク系:** 「案件を開く」→ 承認済みは `detailTab=tasks`、「タスクを開く」→ `detailTab=tasks&taskId={id}`（`meta.task_id` あり・閲覧可のとき）
- **案件系:** 「案件を開く」のみ → `detailTab=apply`
- **`NotificationController@index`:** `projectActionHref` / `projectActionLabel` / `taskActionHref` / `taskActionLabel` を付与
- **`resources/js/Pages/Notifications/Index.tsx`:** 上記2リンクを横並び表示（`NotificationActionLink` 部品）
- **`resources/js/Pages/Projects/Show.tsx`:** URL の `taskId` でタスクタブ表示＋`ProjectTaskDialog` 自動オープン
- **`database/seeders/DemoWorkloadSeeder.php`:** 通知の `project_id` を受信者が `view` できる案件に限定。タスク系は `task_id` を付与
- **`materials/manual/capture/manual-screenshot-bootstrap.php`:** 撮影用通知に `task_id` を追加
- **`phpunit.xml`:** テスト時 `APP_URL=http://localhost`（`.env` の XAMPP 用サブディレクトリ URL による Feature テスト 404 を防止）
- **ローカル手動確認用:** `scripts/local-setup.ps1`（`migrate:fresh --seed` + `npm run build`）、`scripts/check-notification-links.php`

### 主要変更ファイル
- `app/Support/NotificationActionUrl.php`
- `app/Enums/NotificationType.php`（`isTaskRelated()`）
- `app/Http/Controllers/NotificationController.php`
- `resources/js/Pages/Notifications/Index.tsx`
- `resources/js/Pages/Projects/Show.tsx`
- `database/seeders/DemoWorkloadSeeder.php`
- `tests/Feature/NotificationIndexTest.php`（新規）
- `materials/Design/system_spec.md` §9（S-12 導線）

### 検証
- `php artisan test --filter=NotificationIndexTest` — 2 passed（確認依頼で project/task 両リンク、他部門はリンクなし）
- ローカル: `migrate:fresh --seed` 後、`applicant@example.com` で `/notifications` のタスク通知から案件タブ・タスクモーダルへ遷移確認

### 日次ドキュメント
- `materials/daily_reports/implementation_schedule.md`（§1 追記）
- `materials/daily_reports/intern_schedule.md`（バグ修正ログ）
- 本ファイル（本節）

---

## 2026-05-15 追記 — 開発進捗一覧の期日・タスクモーダル進捗率

### 背景
- `/projects?tab=dev` の期日列が、**完了（`closed`）タスクの期日**も `withMin('tasks', 'due_date')` に含めており、直近の未完了期限とずれる
- 案件詳細（S-04）のタスクモーダルでステータスを **確認待ち（`resolved`）** または **完了（`closed`）** にしたとき、進行度が 100% にならないケースがある

### 実装概要（開発タブ・期日）
- **`ProjectController@index`（`tab=dev`）:** `withMin` の対象を `status != closed` のタスクに限定。`nearestTaskDueDate` は `Y-m-d` 形式で返却
- **`tests/Feature/ProjectDevTabDueDateTest.php`（新規）:** 完了タスクが最早期日でも未完了タスクの期日を表示／未完了に期日がなければ `null`

### 実装概要（タスクモーダル・進捗率）
- **`ProjectTaskController` / `MemberTaskController`:** `normalizedProgressRate()` で `resolved`・`closed` を **100%** に正規化（`open` は 0%、`in_progress` は入力値）
- **`ProjectTaskDialog.tsx`:** ステータスが確認待ち・完了のとき送信値を 100% にし、切替時にスライダー状態も同期
- カンバン等の `updateStatus` 経由も同一ロジック

### 主要変更ファイル
- `app/Http/Controllers/ProjectController.php`
- `app/Http/Controllers/ProjectTaskController.php`
- `app/Http/Controllers/MemberTaskController.php`
- `resources/js/Components/Modals/ProjectTaskDialog.tsx`
- `tests/Feature/ProjectDevTabDueDateTest.php`
- `tests/Feature/TaskHistoryTest.php`（進捗正規化の追加分）

### 検証
- `php artisan test --filter=ProjectDevTabDueDateTest` — 2 passed
- `php artisan test --filter=TaskHistoryTest` — 3 passed（進捗 100% 含む）

### 日次ドキュメント
- `materials/daily_reports/implementation_schedule.md`（§1 追記）
- `materials/daily_reports/intern_schedule.md`（バグ修正ログ）
- 本ファイル（本節）