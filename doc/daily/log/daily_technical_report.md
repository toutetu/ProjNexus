# implementation_schedule 作業ログ

`doc/daily/implementation_schedule.md` から技術的な日次の詳細作業記録を分離したログです。  
最新の予定・進行管理は `implementation_schedule.md` を参照してください。

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
- `php artisan test` は既存の `Tests\Feature\ExampleTest`（`/` 200前提）で1件失敗
  - 現行ルート仕様（`/` は 302 リダイレクト）との既知不一致で、今回実装起因ではない

### 追記（同日・最終調整）
- `S-11` を **専用ページ運用からモーダル運用へ再調整**
  - `/projects/{id}/budget-input` は廃止せず、`projects.show?detailTab=budget&budgetInput=1` にリダイレクトしてモーダル起動する深い導線に変更
  - `Projects/Show.tsx` で `budgetInput=1` クエリを検知して `BudgetActualDialog` を初期表示
  - 保存時 `source=show-budget` を付与し、更新後の戻り先を予算タブ文脈に統一
- サイドバー判定ロジックを画面種別ベースへ整理
  - `/member-tasks` で「タスク一覧」と「開発進捗一覧」が同時アクティブになる問題を解消
  - `detailTab=budget` / `budget-input` で「予算実績入力」行表示と3行 merged を安定化
  - `↳ 予算実績入力` は1段深い字下げへ調整

/**更新完了**/