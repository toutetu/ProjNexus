# S-03b 案件一覧（開発タブ） 方針

> **実装の正本**: S-03a と同様、一覧テーブルは `resources/js/Components/Projects/ProjectTable.tsx`（`tab="dev"`）、ページ統合は `resources/js/Pages/Projects/Index.tsx`、クエリ・集計は `app/Http/Controllers/ProjectController.php`（`index`）、タブ件数・閲覧範囲は `App\Models\Project` の `scopeForTab` / `scopeVisibleTo`、表示ヘルパーは `resources/js/Components/Projects/projectTableUtils.ts`。本書と実装がずれた場合は実装を優先して本書を更新する。

## 構成

- **背景**: 承認済み案件の開発進捗を俯瞰する画面。サイドバー「開発管理 > 案件一覧」から遷移
- **レイアウト**: AuthenticatedLayout（サイドバー「開発管理 > 案件一覧」がアクティブ）、max-w-7xl
- **パンくず**: 開発管理 > 案件一覧
- **URL**: `/projects?tab=dev`
- **コンポーネント**: S-03a / S-03c と同じ `Projects/Index.tsx`（ページ）+ `Components/Projects/ProjectTable.tsx` の `tab="dev"` でテーブル描画

## 構成セクション（上から下へ）

### ページヘッダー
- タイトル左にアクセント縦バー（実装では `h-6 w-1 rounded-sm bg-brand-accent` のインライン要素。s03a と同様）
- 「案件一覧」+ サブタイトル「開発フェーズ · **全{N}件**」— **N はページネーション総件数（`Paginator::total()`）**（モック上の「全5件」は例示）

### タブ切替UI（Tabs コンポーネント・dev がアクティブ）
- 3タブ共通。dev タブの件数バッジが赤背景（`bg-[#FEE2E2] text-[#991B1B]`）で強調
- 他タブ（申請・予算）は gray-100 バッジ
- タブクリックで URL クエリ `?tab=approval|dev|budget` を更新
- タブ列右に **`Infotip`**（申請タブと同レイアウト）— 「フェーズ別に表示列が切り替わります…」


### フィルタバー
- 検索ボックス（`max-w-[20rem]` 相当）: UI のプレースホルダーは「案件名・申請者で検索」だが、**サーバー側の `q` は案件名・主担当名・申請者名・部門名を OR で部分一致**（`ProjectController@index` と申請タブと同じクエリブロック）
- 部門セレクト: **DB の `departments`（本部タイプ除く）** を一覧表示。固定の「開発1部／2部／3部」ではない
- 進捗セレクト（開発タブ固有）: すべて / 未着手（0%）/ 進行中 / 完了間近（90%+）/ 完了 — クエリパラメータ値は `not_started` / `in_progress` / `completing` / `completed`
- **主担当で絞り込み**: Controller は `assignee`（ユーザー ID）を受け付け、`primary_assignee_id` で絞る。**現状の開発タブフォームにはセレクトがなく UI 未実装**（`assignees` は Inertia props で渡っている）
- 右端「クリア」: 実装は **`Button`（outline, sm）**。申請タブのような brand-blue テキストリンク風ではない
- ※ ステータスフィルタは **なし**（dev タブは `Project::scopeForTab` で **`approved` 固定**）

### テーブル（ProjectTableDevTab）
- **実装**: `ProjectTable.tsx` の `tab="dev"`（一覧ページは `Projects/Index.tsx` が `detailHref`・ソート状態を渡す）
- 列構成: タイトル / 部門 / 主担当 / タスク進捗 / 期限 / 最終更新（**chevron 列は置かない** — 行クリックで詳細へ）
- **タイトル列**: 案件名（font-medium）+ サブ行に PRJ-ID（mono）と進捗帯ピル等。PRJ-ID 形式は実装どおり **`PRJ-{案件id を4桁ゼロ埋め}`**（例: `PRJ-0042`）。モック表記の `PRJ-2026-0042` とは異なる
- **主担当列**: avatar（イニシャル円、グラデーション背景） + 氏名
- **タスク進捗列**:
  - プログレスバー（w-32, h-2）+ パーセンテージ（右側 mono、w-10）
  - バー色: 通常=`var(--brand-blue)`、95%以上=`#16A34A`（緑、完了間近）
  - 進捗率・集計: `withCount` で **`closed` のみ**を完了として分子に使う（`TaskStatus::Closed`）。**`resolved` は分子に含めない**（設計メモの「課題2」で resolved を含める案は **現未適用**）。進捗バーはフロントの `taskProgress()`（`closedTaskCount / taskCount`）
- **期限列**: `nearestTaskDueDate` は **`tasks.due_date` の最小値**（`withMin('tasks', 'due_date')`）。日付 + 残日数ラベルは `projectTableUtils.dueDateMeta` — **14日以内**を強調（赤）、**31日以内**がオレンジ系、それ以外 muted（クラス名は Tailwind 直書きでモックの `.dl-soon` 等とは別）
- **完了間近バッジ**（`.pill-completing`、紫）: 進捗 90% 以上の行のタイトル横に表示
- 行全体が row-click → `projects.show?id=&detailTab=tasks`（S-04 詳細のタスクタブ相当）

### ページネーション
- S-03a と同様（15件／ページ、左に「{total}件中 {from}-{to}」、右に番号列付きページ送り）

### 列ヘッダーソート
- **実装あり**（`ProjectTable` 内ボタン）。ソート状態は `Index.tsx` が保持

## ロール別データアクセス（`visibleTo` + `forTab('dev')`）

| ロール | 表示される案件（開発タブ） |
|---|---|
| applicant（一般） | **`approved` かつ（自分が申請者 OR 主担当）** の案件 |
| dept_manager | **`approved` かつ自部門** の案件 |
| hq_manager | **`approved` の全件**（閲覧ポリシー範囲内） |

※ **ポリシー旧稿**では applicant を「主担当のみ」としていたが、実装は **申請者も自分の承認済み案件を一覧できる**。どちらを正とするかはプロダクト判断が必要。

※ 開発／予算タブ共通で **`forTab`** により **`approved` 以外は一覧に出ない**（却下・下書き等は原則非表示。再申請など子案件の例外は Controller の rejected or 子なし条件で調整）

## 実装との差異一覧（サマリ）

| 項目 | 本ポリシー／モック由来 | 現行実装 |
|---|---|---|
| applicant の閲覧範囲 | 主担当の承認済のみ | 申請者 **または** 主担当の承認済 |
| 検索プレースホルダー | 案件名・主担当（旧稿） | 「案件名・申請者」だが **検索対象は部門・主担当も含む** |
| 主担当フィルタ | （旧稿では未記載） | **API のみ**（`assignee`）、**フォーム未実装** |
| タスク完了カウント | 課題2 で resolved 含む案 | **`closed` のみ** |
| PRJ-ID | 例 `PRJ-2026-0042` | **`PRJ-` + id 4桁** |
| クリアボタン | リンク風の記載 | **outline ボタン** |
| ページヘッダー件数 | 例「全5件」 | **`Paginator::total()`** |

## 設計上のこだわり

- **ステータスフィルタを UI から削除** — 開発タブは `status=approved` で固定されるため、ステータス選択肢を出すと混乱を招く。代わりに進捗フィルタ（未着手/進行中/完了間近/完了）を用意し、「開発の段階」で絞り込める軸に置き換えた
- **主担当 avatar を一覧で表示** — 開発フェーズで最も大事なのは「今誰が動かしているか」。テキストだけでなく avatar で視覚化することで、複数案件を横断しても担当者を瞬時に識別できる
- **タスク進捗バーを集計値で表示** — `projects` に進捗カラムは持たず、`tasks` の `withCount` で算出。**現実装は完了を `closed` のみ**とカウントする（`resolved` を完了に含める拡張は未適用）
- **進捗 95% 以上でバーを緑に変える** — 「あと一息」を視覚的にフィードバックして最後のモチベーション維持につなげる。100% だけを緑にすると「まだ青」の状態が長く続いて達成感が出ないため、95% 以上で先行的に色を変える
- **期限色分けで「やばい案件」を抽出** — ダッシュボード（S-02）がなくても、この一覧だけで「対応が遅れている案件」を見つけられるようにする。2週間以内=赤、1ヶ月以内=橙、それ以降=muted の3段階
- **完了間近バッジ（紫）** — 他の色（赤=警告、緑=完了、青=進行中）と被らない紫をポジティブイベント（もうすぐゴール）に当てた。色の役割重複を避けつつ、ゴール間近の高揚感を表現
- **PRJ-ID を一覧でも表示** — 運用上はコード値で参照できるようにする。実装のコード形式は `PRJ-0001` のような **4桁ゼロ埋め**（モックの年込み形式とは異なる）
- **同一ページ + タブ切替** — S-03a / S-03b / S-03c は `Projects/Index.tsx` 1ページ。Controller 側で `?tab` を見て返す Eloquent eager load を変え、フロント側は `ProjectTable` の `tab` で列セットを切替。別画面に分けるよりルーティングが単純
/**更新完了**/