# S-03a 案件一覧（申請タブ） 方針

> **実装の正本**: 一覧テーブルのマークアップ・列レイアウト・ソート UI は `resources/js/Components/Projects/ProjectTable.tsx`。ページ構成・フィルタ・ページネーション・行データのマッピング・Inertia 遷移は `resources/js/Pages/Projects/Index.tsx`。一覧 API とクエリ分岐は `app/Http/Controllers/ProjectController.php`。タブ UI は `resources/js/Components/Tabs.tsx`。金額・相対日時・進捗帯・消費率などの表示ヘルパーは `resources/js/Components/Projects/projectTableUtils.ts`。本ポリシーは実装と矛盾した場合は実装を優先して更新する。

## 構成

- **背景**: ログイン直後の暫定ホーム画面。ダッシュボード（S-02）は課題2扱いのため、申請タブがランディング先
- **レイアウト**: AuthenticatedLayout（サイドバー「申請・承認 > 案件一覧」がアクティブ）、max-w-7xl
- **パンくず**: 申請・承認 > 案件一覧
- **URL**: `/projects?tab=approval`（承認待ちプリセットは `&filter=pending`）

## 一覧テーブルの実装配置について（ProjectTable）

- **`ProjectTable` は共通コンポーネント**として `resources/js/Components/Projects/ProjectTable.tsx` に実装されている。`tab` prop で **申請（`approval`）／開発（`dev`）／予算（`budget`）** の3バリアントを切り替える。
- **`Projects/Index.tsx`** は当該ページのコンテナとして、フィルタ・タブ・ページネーション・ソート状態を保持し、`rows`・`sortKey` / `sortDir` / `onSort`・**申請タブのみ** `getRowHref(row)`・開発／予算は `detailHref(id)`・共通で `onNavigate(href)`（通常は `router.visit`）を `ProjectTable` に渡す。
- **ポリシー上の必須要件は「列と挙動」**である。ファイル分割の話ではなく、`components_spec.md` および本章 §テーブル と実装がずれた場合は **実装（上記ファイル）を優先してドキュメントを更新する**。

## 構成セクション（上から下へ）

### ページヘッダー
- タイトル左に `.title-accent`（4px幅のアクセントカラー縦バー）
- 「案件一覧」+ サブタイトル「申請フェーズ · 全{N}件」— **N はページネーションの総件数（`Paginator::total()`）**。現在ページの行数だけではない
- 右端に「新規申請」ボタン（btn-primary、+アイコン）— **申請者・部門管理者のみ表示**（本部管理者・サイドバーと同じ `canCreate` 条件）

### タブ切替UI（Tabs コンポーネント）
- 3タブ: 「申請」「開発」「予算」— アイコン + ラベル + 件数バッジ
- アクティブタブは **brand-red の下線 3px** + 赤文字
- アクティブタブの件数バッジは赤背景（`bg-[#FEE2E2] text-[#991B1B]`）、非アクティブは gray-100
- タブ列の右端に **`Infotip`（ⓘ）** — ホバー／フォーカスで「フェーズ別に表示列が切り替わります」を表示（常時テキストは出さない）
- タブクリックで URL クエリ `?tab=approval|dev|budget` を更新し、Inertia `router.visit()` で遷移

### フィルタバー
- 検索ボックス（最大幅 w-80 相当、左に Search アイコン）: **案件名・申請者・主担当・部門名** で部分一致検索（サーバー側 OR 条件）
- ステータスセレクト: すべて / 下書き / 部門承認待ち / 本部承認待ち / 却下（approved は申請タブでは非表示選択肢）
- 部門セレクト: すべて / （本部を除く部門一覧・DB 準拠）
- 右端に「クリア」— **brand-blue のテキストリンク風**（ボタン枠なし）
- フィルタは URL クエリパラメータで保持（`&status=pending_dept&department=1`）

### テーブル（申請タブ列）
- 列構成: **タイトル / ステータス / 承認ステップ / 申請日 / 部門 / 最終更新**（**chevron 列は置かない** — 行全体クリックで遷移）
- タイトル列は2行構成 — 1行目 font-medium の案件名、2行目 text-xs muted の **目的（purpose）要約**（未設定なら省略）
- rejected 行: 「再申請可」ミニバッジ + **最新の却下コメント要約**（`ProjectController@index` が `projects[].rejectedComment` として返す。**サーバー側**では却下案件 ID に対し `approvals` を `action=rejected`・`acted_at` 降順でまとめ取りし、`project_id` ごとに先頭 1 件の `comment` を採用。空文字は `null`。一覧タイトル副行の目的は同レスポンスの `projects[].purpose`）
- draft 行の申請日は「—」（未申請のため）
- 行全体が row-click（hover:bg-slate-50、cursor-pointer）
  - **下書きかつ編集可能**: `/projects/{id}/edit`
  - **上記以外**: 案件詳細 `?detailTab=apply`
- **列ヘッダークリックでソート**可能（実装上の追加 UX）
- ステータス横に **「本部直行」** ミニバッジ（部門管理者が申請して部門承認をスキップする場合）

### 承認ステップ列（ApprovalStepperMini）
- 4ドット + 3ライン のインライン表示
- ドット状態: done（brand-blue 塗り）/ current（brand-blue 塗り + パルスアニメ）/ 未到達（白 + border）/ rejected（brand-red 塗り）/ skipped（部門スキップ時）
- ライン状態: done（brand-blue）/ 未到達（border色）
- ドット下にキャプション:「申請 → **部門** → 本部 → 済」— 現在位置を太字 + 色付き、rejected は該当ステップで赤

### ページネーション
- 左に「{total}件中 {from}-{to}件を表示」
- 右にページ送り（前へ / **複数ページ番号**（省略 … あり）/ 次へ）。現在ページは brand-dark 塗り白文字
- Laravel の Paginator レスポンスに対応

### テーブル下凡例
- 5種の StatusPill を横並びで表示（draft / pending_dept / pending_hq / approved / rejected）
- 右端に **`Infotip`（ⓘ）** — 「承認済み案件は「開発タブ」で確認できます。」をツールチップ内に表示

### 最終更新列（表示形式）
- **相対表現を優先**（例: たった今、N分前、N日前）。サーバーからは ISO 形式の更新日時を受け取り、画面上で整形する

## ロール別データアクセス（Controller 側クエリ分岐）

| ロール | 表示される案件 |
|---|---|
| applicant | `applicant_id = self` の案件 + 自分の draft |
| dept_manager | `department_id = self.dept` の全案件 |
| hq_manager | 全件 |

## 承認待ちプリセット（`/projects?tab=approval&filter=pending`）

サイドバー「承認待ち一覧」は独立画面を持たず、この画面のプリセット表示:
- dept_manager: `status = pending_dept` かつ `department_id = self.dept` で絞り込み
- hq_manager: `status = pending_hq` で全部門を表示
- applicant: このメニューは非表示（または自分の pending 案件のみ）
- UI は S-03a と完全共通。タイトル下に「承認待ち」バッジで文脈を示す
- **実装上**: 承認待ちプリセット時は申請タブのみ表示し、開発／予算タブを隠すことがある

## 設計上のこだわり

- **「同一ページ + タブ切替」で3画面を1つに集約** — 申請・開発・予算の3タブは同じ `Projects/Index.tsx` で、`ProjectTable` の `tab` を切り替えて列セットを変える。Controller は `?tab` パラメータで返す列（eager load するリレーション）を変える。別画面に分割するよりルーティングが単純で、ユーザーもタブクリック1つでフェーズ横断できる
- **承認ステッパーMini は「今どこにいるか」の一覧レベル要約** — S-04 の Full ステッパーと同じデータをドットに圧縮。キャプション行で現在位置を文字でも補足
- **フィルタはURLクエリで永続化** — ブラウザバックやブックマークでフィルタ状態を復元できる。Inertia の `router.visit()` で URL を書き換え、Controller 側で `request()->query()` から分岐
- **rejected 行に「再申請可」バッジと却下理由サマリ** — 一覧レベルで再申請可否と理由の手がかりを提示
- **アクティブタブの件数バッジを赤背景にする** — 非アクティブタブの灰色バッジとのコントラストで「今見ているタブ」を強調
- **凡例を最下部に配置** — ステータス色の確認 + Infotip で開発タブへの導線
- **長い補足は Infotip に寄せる** — 一覧ヘッダーや凡例横の説明文は常時表示せず、情報アイコンで開く（`components_spec.md` §Infotip）
- **アクセントカラーはタイトル縦バーのみ** — テーブル内やタブには全面アクセントを敷かない
/**更新完了**/