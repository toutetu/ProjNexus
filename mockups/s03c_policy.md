# S-03c 案件一覧（予算タブ） 方針

> **実装の正本**: 一覧テーブルは `resources/js/Components/Projects/ProjectTable.tsx`（`tab="budget"`）、ページ統合・サマリー・フィルタは `resources/js/Pages/Projects/Index.tsx`、集計・絞り込みは `app/Http/Controllers/ProjectController.php`（`index` の `tab=budget`）、閲覧範囲は `App\Models\Project` の `scopeVisibleTo` / `scopeForTab`、金額・消費率表示は `resources/js/Components/Projects/projectTableUtils.ts`。本書と実装がずれた場合は実装を優先して本書を更新する。

## 構成

- **背景**: 承認済み案件の予算消費状況を俯瞰する画面。サイドバー「予算管理 > 案件一覧」から遷移
- **レイアウト**: AuthenticatedLayout（サイドバー「予算管理 > 案件一覧」がアクティブ）、max-w-7xl
- **パンくず**: 予算管理 > 案件一覧
- **URL**: `/projects?tab=budget`
- **コンポーネント**: S-03a / S-03b と同じ `Projects/Index.tsx`（ページ）+ `ProjectTable.tsx` の `tab="budget"` でテーブル描画

## 構成セクション（上から下へ）

### ページヘッダー
- タイトル左にアクセント縦バー（実装は `h-6 w-1 rounded-sm bg-brand-accent`。s03a/s03b と同様）
- 「案件一覧」+ サブタイトル「予算フェーズ · **全{N}件**」— **N は `Paginator::total()`**（モックの「全5件」は例示）

### タブ切替UI（budget がアクティブ）
- 3タブ共通。budget タブの件数バッジが赤背景で強調
- タブ列右に **`Infotip`**（他タブと共通レイアウト）

### サマリーカード 4枚（`grid`、フィルタ直上・`bg-brand-bg/40` 内）
実装は **`md:grid-cols-4`**（md 以上で4列）。カードごとの **色付きアクセントライン**（blue/cyan/purple/赤）は **未使用**で、白地＋枠線＋ラベル＋数値のみ。

1. **予算合計**: `budget_amount` の合計、`formatCurrency`（mono）
2. **実績合計**: `actual_amount` の合計、文字色 `text-brand-blue`（mono）
3. **平均消費率**: `actualTotal / budgetTotal * 100` を **1 小数**で表示。**プログレスバーは未実装**（数値のみ）
4. **要注意案件**: **`budget_amount > 0` かつ消費率 ≥ 86%** の件数（Controller の `warningCount`）。ラベルは UI 上「要注意案件」

※ サマリーは **`$query` を clone した絞り込み後**の母集団で算出（検索・部門・消費率フィルタを反映）。閲覧範囲は `visibleTo` によりロールで異なる

### フィルタバー
- 検索ボックス: プレースホルダーは「案件名で検索」だが、**`q` は案件名・主担当・申請者・部門名を OR 部分一致**（`ProjectController@index` はタブ共通の `q` ブロック）
- 部門セレクト: **DB の `departments`（本部タイプ除く）**。固定の「開発1部／2部／3部」ではない
- 消費率セレクト: すべて / 60%未満 / 60-85% / 86-100% / 100%超 — パラメータは `safe` / `normal` / `warn` / `over`（閾値は Controller の `whereRaw` と一致）
- **「検索」ボタン**（secondary, sm）と **「クリア」**（outline ボタン）。申請タブのような brand-blue テキストリンクのみの構成ではない

### テーブル（ProjectTableBudgetTab）
- **実装**: `ProjectTable.tsx` の `tab="budget"`（一覧ページは `Projects/Index.tsx` が `detailHref`・ソート状態を渡す）
- 列構成: タイトル / 部門 / 予算額 / 実績額 / 消費率 / 更新日（**chevron 列は置かない** — 行クリックで詳細へ）
- **タイトル列**: 案件名 + PRJ-ID（S-03b と同形式）
- **予算額・実績額**: 右寄せ mono（例: `¥10,000,000`）。JPY はカンマ区切り、先頭に `¥` 固定
- **消費率列**:
  - プログレスバー（`min-w-32`, `h-2`）+ パーセンテージ（`consumptionRate` は **小数1桁**）。その下に **残額**（`budget - actual`、`formatCurrency`）
  - バー／文字色は `consumptionClass`（Tailwind クラス2つを bar / ％表示に分割使用）:
    - **60% 未満**: 緑系 `bg-[#16A34A]` 等
    - **60% 以上 86% 未満**: 青系（`bg-brand-blue`）
    - **86% 以上 100% 以下**: 橙系 `#F59E0B` / 茶 `#92400E`
    - **100% 超**: 赤（`brand-red`）
  - **alert-triangle アイコン（90% 超マーカー）は未実装**
- **更新日**: **`projects.updated_at`** を `formatDate`（`projectTableUtils`）。**`budget_actuals` の最終登録日時ではない**
- 行クリック・リンク → **`/projects/{id}?detailTab=budget`**（案件詳細の予算タブ）。S-11 モーダル直接起動は **未実装**

### ページネーション
- S-03a / S-03b と同様（15件／ページ、件数表示＋番号列付きページ送り）

### 列ヘッダーソート
- **実装あり**（`ProjectTable`）。ソート状態は `Index.tsx` が保持

## ロール別データアクセス（`visibleTo` + `forTab('budget')`）

| ロール | 表示される案件（予算タブ） |
|---|---|
| applicant（一般） | **`approved` かつ（自分が申請者 OR 主担当）**（`visibleTo` は開発タブと同じロジック） |
| dept_manager | **`approved` かつ自部門** |
| hq_manager | **`approved` の全件**（閲覧範囲内） |

※ 旧稿の applicant「主担当のみ」と実装が異なる場合は **s03b_policy と同様**（申請者も自分の承認済みを見られる）— プロダクト判断でどちらを正とするか要整理

## 実装との差異一覧（サマリ）

| 項目 | 本ポリシー／モック由来 | 現行実装 |
|---|---|---|
| サマリーグリッド | モック表記 md=2 / lg=4 | **`md:grid-cols-4`**（sm は1列、lg で2段にはしない） |
| サマリーカードの装飾 | 各色アクセントライン | **ラインなし**のシンプルカード |
| 平均消費率カード | 数値 + プログレスバー | **数値のみ** |
| 要注意の閾値・文言 | 「85% 超」等 | **86% 以上**（`>= 0.86`）、ラベル「要注意案件」 |
| 検索 | 案件名のみの記載 | プレースホルダーは案件名寄りだが **主担当・申請者・部門も検索対象** |
| クリア／検索 | リンクのみ想定 | **検索ボタン + outline クリア** |
| テーブル更新日 | `budget_actuals` 由来の想定 | **`projects.updated_at`** |
| 90% 警告アイコン | alert-triangle | **なし** |
| 行遷移 | 詳細スクロール or S-11 等の選択肢 | **`detailTab=budget` のみ** |
| applicant 閲覧 | 主担当の自案件 | **申請者 OR 主担当**（`visibleTo`） |
| PRJ-ID | 例 `PRJ-2026-0042` | **`PRJ-` + id 4桁ゼロ埋め**（s03b と同じ `projectCode`） |

## 設計上のこだわり

- **サマリーカード4枚で「全体感」を最優先で伝える** — 予算管理の利用者（主に本部管理者）は「全体でどのくらい使っているか」「何件注意が必要か」を最初に知りたい。テーブルに入る前にこの4数字で全社状況をつかめるようにした
- **「要注意案件」カードで 70% 以上件数を示す** — 実装は閾値 *70%**（フィルタ `warn` と整合）。4枚目の数字色は `#92400E` 系

- **消費率バーの4段階色分け（S-11 と連動）** — S-11 予算実績入力モーダルの閾値ガイダンス（70% で注意・100% で超過）と同じしきい値を使う。画面間で色とルールが一致することで、ユーザーは「70% を超えたら色が変わる」という一貫した挙動を期待できる
- **実績額のみを mono で強調せず、予算額も mono で併記** — 両方 mono にすることで桁を揃えて視覚的な比較がしやすい。「予算との差分」を暗算しやすくする
- **消費率フィルタを用意** — 「超過だけ見たい」「安全圏だけ見たい」など、運用者の関心軸で絞れるようにする。ダッシュボードと違い、一覧画面は「目的を持って探しに来る場所」なのでフィルタ軸は細かく提供
- **行単位の警告アイコン**（alert-triangle 等）は将来拡張として検討可 — **現実装はバー色 + ％ + 残額のみ**
- **90% 超で警告マーカー**（alert-triangle アイコン） — バーの色変化だけでなく、
行単位でアイコンを添えることで「注意すべき行」を走り読みでも見逃さない冗長化【未実装・要実装】
- **PRJ-ID を一覧で表示** — 形式は **`PRJ-0001` 型**（4桁ゼロ埋め）。会議・チャットでの参照用
- **消費率は DB に持たず集計** — `projects.actual_amount / projects.budget_amount * 100` で算出。冗長カラムを作らず、常に最新の比率を表示する
/**更新完了**/