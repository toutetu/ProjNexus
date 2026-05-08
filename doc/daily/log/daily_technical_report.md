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
/**更新完了**/