# 共通コンポーネント仕様書

> HTMLモックから抽出した共通UI部品の棚卸しと、React(Inertia + TypeScript + shadcn/ui)への変換仕様。
> **Cursor で実装する前にこのファイルを読み、ここに定義された部品を先に作成してから Pages を組み立てること。**
> 新しい共通部品を発見した場合は、このファイルを更新してから実装する。
> **このファイルをコンポーネント仕様の正本（Single Source of Truth）とする。**
> `materials/Design/design_system.md` はデザイン原則・トークン中心のガイドとし、部品の詳細仕様は本書のみで管理する。


---

## 運用ルール

1. **Pages/ から直接 Tailwind クラスを書かない**。繰り返すパターンは必ず `Components/` に切り出す
2. 同じ部品を2回書きそうになったら、そこは共通部品化する（3回目を待たない）
3. 共通部品の `props` は `interface` で厳密型定義。`any` は使わない
4. 色・余白・角丸は `design_system.md` のデザイントークンに従う。**コンポーネント内でハードコードしない**
5. shadcn/ui の部品（Button, Dialog, Input 等）はそのまま使い、プロジェクト固有のラッパーは `Components/` 配下に別名で作る
6. 全ての共通部品は **Storybook的に単独で動く状態** にすること（`<StatusPill status="approved" />` だけで描画できる）

---

## 1. Layout コンポーネント

### AuthenticatedLayout
**役割**: ログイン後の全画面共通枠。サイドバー + ヘッダー + メインコンテンツスロット。
**配置**: `resources/js/Layouts/AuthenticatedLayout.tsx`
**使用モック**: s02, s03a, s05 すべて
**Props**:
```ts
interface AuthenticatedLayoutProps {
  breadcrumb: BreadcrumbItem[];  // { label: string; href?: string; icon?: LucideIcon }
  children: ReactNode;
}
```
**構成**: `<Sidebar />` + 右側に `<Header breadcrumb={...} />` + `<main>{children}</main>`

### Sidebar
**役割**: 3セクション構造の**ライト**ナビゲーション（白背景・右ボーダー `#DEE2E6`）。申請→開発→予算でセクション色が**深くなる**トーン（指示: `cursor_sidebar_redesign.md` / `design_system.md` §2）。
**配置**: `resources/js/Components/Layout/Sidebar.tsx`
**使用モック**: s02, s03a, s05 すべて（モックはダークの場合あり — 実装はライトが正）
**Props**: 基本なし（Inertia の `usePage()` で現在ルート取得してアクティブ判定）
**内部構造**:
- ロゴ（**アイコン背景 `#E60013`**、ProjNexus `#212429` / サブ「開発管理アプリ」`#6C757D`）
- セクション「申請・承認」: ラベル `#0099c4` + 右ライン `#BAF1FF` / アクティブ pill `#E0F7FF` + 文字 `#0369a1`
- セクション「開発管理」: ラベル `#106EBE` + 右ライン `#BFDBFE` / アクティブ pill `#EFF6FF` + 文字 `#1D4ED8`
- セクション「予算管理」: ラベル `#7c3aed` + 右ライン `#DDD6FE` / アクティブ pill `#F5F3FF` + 文字 `#6D28D9`
- 各 `SidebarLink`: 非アクティブは `text-gray-500` + **アイコンボックス**（`bg-gray-100 text-gray-400`）+ hover `bg-gray-100`。アクティブは左ボーダー無しの **pill型**（`mx-2 rounded-lg`）を使用
- セクション「申請・承認」配下: 新規申請 / 承認待ち一覧(バッジ) / **申請状況一覧**（`/projects?tab=approval`）
- セクション「開発管理」: **開発進捗一覧**（`/projects?tab=dev`） / タスク一覧(dim表示・課題2ラベル)
- セクション「予算管理」: **予算状況一覧**（`/projects?tab=budget`） / ↳ 案件詳細 / ↳ 予算実績入力（深い導線: `/projects/{id}/budget-input`）
- 予算実績入力表示中は、**予算状況一覧 → ↳案件詳細 → ↳予算実績入力** の3行を `mx-2 overflow-hidden rounded-lg` + セクション色で一体表示（内側行は `insideMergedActive` で継ぎ目なし）
- セクション下部（Context `variant=null`）: 通知(バッジ `#E60013`) / マニュアル / プロフィール / ログアウト — `text-[#6C757D]`・hover `bg-gray-100`・アクティブは `border-[#106EBE]` + `bg-gray-100`
- 最下部: ユーザーカード（アバター `#E60013`、氏名 `#212429`、**1行目** `ロール日本語 / 部門名` `#6C757D`、**2行目** ロールの役割説明 `#8A93A0`・`text-[10px]`）

**サブ部品**:
- `<SidebarSection label variant>` — React Context で子の `SidebarLink` に `variant` を伝える。
- `<SidebarLink href icon badge active>` — アイコンは lucide を `18x18` の角丸ボックスに配置。アクティブ時はセクション色、非アクティブ時はグレー。

### プロフィール（S-13）

**配置**: `resources/js/Pages/Profile/Edit.tsx`  
**URL**: `/profile`  
**要点**:
- 「アカウント情報（表示のみ）」: 氏名・部署・**ロール**（複数は ` / ` 連結の日本語ラベル）・メールアドレスは参照のみ（編集不可）
- 「本人入力」: 生年月日・性別は任意編集可（既存どおり）
- パスワード変更フォームは本画面には載せない（マスト #6 の簡素化方針。バックエンドに `password.update` ルートは残る場合がある）
- アカウント削除導線は非表示（マスト #6 方針）

### 公開紹介ページ（このアプリについて）

**役割**: ゲストが最初に読む、ProjNexus の目的・設計判断・デモの見方・技術構成をまとめた紹介ページ。10ページのスライドを iframe で見せる旧方式ではなく、本文を上から順に読める単一ページとする。

**配置**: `resources/js/Pages/Manual/AboutPage.tsx`

**URL**: `/manual?view=about`（未ログイン時のトップ導線）

**統合元**: `resources/js/Pages/Manual/Index.tsx`

**Props**:

```ts
interface AboutPageProps {
  portfolioUrl: string;
  onOpenManual: () => void;
}
```

**認証状態の取得**:

- `usePage().props` を、このページ専用の `AboutPageSharedProps`（`auth.user: User | null`）として受け取る
- 共通 `PageProps` の `auth.user` はログイン後画面向けに non-null のため変更しない
- ゲストの CTA は `/login`・文言「デモにログイン」、ログイン済みは `/dashboard`・文言「アプリを開く」

**構成（上から順）**:

1. 白背景ヘッダー: JPT 赤のロゴ、ProjNexus 名、濃色 CTA
2. 概要: 「申請・承認・開発進捗・予算をつなぐ業務支援アプリ」という H1 と、個人開発の目的・実装範囲
3. 「設計で考えたこと」: 薄いグレーの縦積みカード 4 件
   - ロール・案件・部門の関係を Laravel Policy で認可
   - 承認履歴を保存し、却下後の再申請を元案件へ関連付ける
   - `resolved`（確認待ち）と `closed`（完了）を分離
   - 予算の現在値・変更履歴・算出する消費率を分離する DB 正規化
4. 「デモ用のログイン」: 申請者・部門管理者・本部管理者の体験範囲を表で比較。本部管理者のタスク操作は閲覧のみと明記
5. 技術構成: Laravel / React / Inertia / DB / 認可 / テスト / 公開環境を `dl` で表示
6. 開発資料リンク: GitHub、システム仕様、既存の詳しい資料・印刷版
7. 簡潔な免責フッター

**ManualIndex との切り替え**:

- `Manual/Index.tsx` は既存 hooks を常に同じ順序で呼んだ後、`activeView === 'about'` のときだけ `AboutPage` を早期 return する（条件付き hooks にしない）
- `AboutPage` の「操作マニュアルを見る」は `onOpenManual` を呼び、既存 `switchView` が URL・スクロール位置・表示状態を更新する
- `popstate` によるブラウザの戻る／進むと、操作マニュアルの目次・Markdown 表示は既存挙動を維持する
- 旧 `PortfolioEmbed.tsx` と `public/portfolio/index.html` は削除せず、「詳しい資料を見る・印刷」から `portfolioUrl` を別画面で開く補助資料として残す

**表示・アクセシビリティ**:

- 本文幅は `max-w-3xl`（約 768px）。白・薄いグレー・濃色文字を基本に、JPT 色はロゴ、リンク、フォーカス表示へ限定する
- 巨大な数値、グラデーション、画像、スライド、自動切り替えは使わない
- H1 → H2 → H3 の見出し順、表の `caption` / `scope`、ナビゲーションの `aria-label` を設定する
- 全操作要素に見える `focus-visible` を設け、CTA は 44px 以上の高さを確保する
- モバイルでは CTA を縦積みにし、表は `table-fixed` と折り返しで横方向へ溢れさせない
- 外部リンクは新しいタブで開き、`rel="noopener noreferrer"` を付ける

**部品化方針**: この紹介レイアウトは単一ページ専用のため Page 内に置く。4つの設計カード、ロール表、技術一覧は定数配列から描画して重複を避ける。別 Page でも同じパターンを採用する段階で共通部品へ昇格する。

### Header
**役割**: 上部固定のヘッダーバー。
**配置**: `resources/js/Components/Layout/Header.tsx`
**使用モック**: s02, s03a, s05 すべて
**Props**:
```ts
interface HeaderProps {
  breadcrumb: BreadcrumbItem[];
}
```
**内部要素**: 左にパンくず / 右に ⌘K検索ボタン + 通知ベル（未読ドット）

### Breadcrumb
**役割**: パンくずリスト単独部品（ヘッダー内で利用）。
**配置**: `resources/js/Components/Layout/Breadcrumb.tsx`
**Props**: `items: BreadcrumbItem[]`

---

## 1.5 Dashboard コンポーネント（S-02）

### KpiCard
**役割**: ダッシュボード上段の KPI カード共通表示（4枚）。
**配置**: `resources/js/Components/Dashboard/KpiCard.tsx`
**使用モック**: `mockups/s02_dashboard.html`
**Props**:
```ts
type Accent = 'cyan-blue' | 'yellow' | 'blue-purple' | 'red';
interface KpiCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  unit?: string;
  badge?: { text: string; tone?: 'default' | 'warn' | 'danger' };
  footer?: string;
  progress?: number;
  accent: Accent;
}
```

### DeptProgressChart
**役割**: 部門別の平均進捗率を棒グラフで可視化。
**配置**: `resources/js/Components/Dashboard/DeptProgressChart.tsx`
**実装**: Recharts `BarChart`（Y軸 0-100%、バー色は部門色）

### BudgetTrendChart
**役割**: 月次予算消費率の推移を折れ線で可視化。
**配置**: `resources/js/Components/Dashboard/BudgetTrendChart.tsx`
**実装**: Recharts `ComposedChart` + `ReferenceLine(y=70)`（警告ライン）

### BudgetAlertTable
**役割**: 消費率 70% 超の案件リスト表示。
**配置**: `resources/js/Components/Dashboard/BudgetAlertTable.tsx`
**列**: 案件名 / 部門 / 予算 / 実績 / 消費率 / 操作
**遷移**: 行アクションから `projects/{id}?detailTab=budget`

---

## 2. ステータス表示

### StatusPill ★最頻出
**役割**: 5種類のステータスバッジ。色・ドット・ラベルの3点セット。
**配置**: `resources/js/Components/StatusPill.tsx`
**使用モック**: s02（予算アラート）, s03a（一覧の全行）, s05（確認モーダル）
**Props**:
```ts
type ProjectStatus = 'draft' | 'pending_dept' | 'pending_hq' | 'approved' | 'rejected';
interface StatusPillProps {
  status: ProjectStatus;
  size?: 'sm' | 'md';  // デフォルト md
}
```
**内部マッピング**（この仕様を厳守）:
| status | 背景 | 文字 | ドット | 日本語 |
|---|---|---|---|---|
| draft | #E9ECEF | #495057 | #6C757D | 下書き |
| pending_dept | #E0F7FE | #0C7DA3 | #01CFFF | 部門承認待ち |
| pending_hq | #E3EEFB | #0A4E8A | #106EBE | 本部承認待ち |
| approved | #DCFCE7 | #166534 | #16A34A | 承認済 |
| rejected | #FEE2E2 | #991B1B | #E60013 | 却下 |

### ApprovalStepperMini
**役割**: 一覧テーブル行に入る、横4ドット + 3本ライン の小さいステッパー。
**配置**: `resources/js/Components/Approval/ApprovalStepperMini.tsx`
**使用モック**: s03a（全行）
**Props**:
```ts
interface ApprovalStepperMiniProps {
  status: ProjectStatus;
  rejectedAt?: 'dept' | 'hq';  // rejected時にどのレベルで止まったか
}
```
**表示ロジック**:
- draft → 1つ目currentのみ
- pending_dept → 1つ目done、2つ目current
- pending_hq → 2つ目まで done、3つ目 current
- approved → 4つとも done
- rejected + rejectedAt=dept → 2つ目が rejected（赤）
- rejected + rejectedAt=hq → 3つ目が rejected（赤）

下に短いキャプション「申請 → 部門 → **本部** → 済」を出し、現在位置を太字 + 色付き。

### ApprovalStepperFull
**役割**: S-04 案件詳細ページ上部の、大きい横長ステッパー。
**配置**: `resources/js/Components/Approval/ApprovalStepperFull.tsx`
**使用モック**: `mockups/s04_project_show.html`（実装済み）
**Props**:
```ts
interface ApprovalStepperFullProps {
  status: ProjectStatus;
  approvals: ApprovalTimelineItem[];  // 承認履歴（誰が・いつ）
  submittedAt: string | null;
  applicantName: string | null;
  rejectedAt?: 'dept' | 'hq';
  skipsDeptStep?: boolean;
}
```
**違い（Miniとの）**: 各ステップに担当者名・承認日時を表示、進行中はパルスアニメ、カードヘッダーに「承認フロー / 申請日」を表示

#### S-04 リバート方針（s03a準拠）
S-04は一度配色が拡散したため、s03a基準に戻す。以下を実装時の固定ルールとする。

**s03a準拠に戻した箇所**:
- サイドバー: ロゴ・アバターのグラデーションを `シアン -> 青 -> 紫` に統一
- 詳細タブ active: 黄ではなく赤下線（s03aのタブ仕様と同じ）
- 承認ステッパー完了ステップ: 黄丸ではなく青丸
- 各カードヘッダーアイコン: 黄ではなくミュートグレー
- 予算額・進捗バー・リンク: 黄ではなく `--jpt-blue`
- タイムライン配色: 「申請」は青、「部門承認」は緑（状態の意味づけ）
- 「タスク追加」ボタン: 黄ではなく赤（`btn-primary`）
- `card-accent` / `btn-accent` クラスは使用しない（削除済み方針）

**意図して残すアクセント（#EDB100）**:
- ページ最上部: 幅100% × 高さ1px の細い黄色ライン（`position: fixed`）
- h1「次世代EAMシステム開発」の左: `4x24px` の小さな黄色縦棒

**判断理由**:
- 主要画面の色ルールを揃え、画面遷移時の一貫性を維持するため
- 黄色は全面適用せず、意味のあるアクセントに限定して視認性を確保するため

### ApprovalFlowGuide
**役割**: S-05 新規申請フォーム上部の4ステップ説明バナー。
**配置**: `resources/js/Components/Approval/ApprovalFlowGuide.tsx`
**使用モック**: s05
**Props**:
```ts
interface ApprovalFlowGuideProps {
  currentStep: 1 | 2 | 3 | 4;  // 申請者が今どの立場か。通常は 1（自分が申請）
  skipDept?: boolean;  // 部門管理者が自身で申請する時は true
}
```
**内部構造**: グラデーション背景のカード内に、4つの丸番号 + 矢印 + ラベル（あなたが申請 → 部門管理者が承認 → 本部管理者が承認 → 承認完了）

---

## 2.5 Infotip（補足説明ツールチップ）

**役割**: 見出し・カードタイトルなどの**右上付近**に情報アイコン（ⓘ 相当、`lucide-react` の `Info`）を置き、**マウスホバー**または**キーボードフォーカス**時だけ説明文を表示する。長い脚注を常時表示せず画面を圧迫しない用途に使う。

**配置（共通部品）**: `resources/js/Components/ui/infotip.tsx`（**実装済み**）

**利用例**: `resources/js/Pages/Projects/Show.tsx` の「工数サマリー」カード見出し行（`<Infotip ariaLabel="…">…</Infotip>`）

### Props

```ts
import type { ReactNode } from 'react';

interface InfotipProps {
  /** ツールチップ内の説明文（短文推奨。複数文は可） */
  children: ReactNode;
  /** トリガーボタンの aria-label（例: 「工数サマリーの説明」）。実装では props 名は camelCase の `ariaLabel` */
  ariaLabel: string;
  /** ツールチップの水平寄せ（トリガー基準）。既定: 右寄せ `right` */
  align?: 'left' | 'right';
  /** ラッパーへの追加クラス（`-mr-0.5` など位置微調整） */
  className?: string;
}
```

### 挙動・マークアップ

| 項目 | 方針 |
|------|------|
| 依存 | **Radix Tooltip は未導入のため使わない**。追加パッケージなしで実装する |
| 表示制御 | 親に `group`、トリガー＋ツールチップをラップし、`group-hover:` と `group-focus-within:` で `opacity` / `visibility` を切り替える |
| トリガー | `type="button"` のアイコンボタン。`rounded-full`、`focus-visible:ring-2`（`jpt-blue`） |
| ツールチップ | `role="tooltip"`、`pointer-events-none`（ホバーが下の要素に伝わるようにする） |
| 位置 | `absolute`、`top-full`、`mt-1.5` 程度でトリガーの直下。`right-0` でカード右上アイコンと揃える |
| 幅 | `w-[min(18rem,calc(100vw-2rem))]` などでビューポートからはみ出さない |

### 視覚仕様（デザイントークン）

- 背景: `bg-white`
- 枠線: `border border-jpt-border`
- 文字: `text-xs`、`text-jpt-dark`、`leading-snug`
- 余白: `px-2.5 py-2`
- 影: `shadow-md`
- アイコン色（既定）: `text-jpt-muted`、ホバー時 `text-jpt-dark`

### アクセシビリティ

- トリガーには必ず **`aria-label`**（日本語で内容が推測できる文言）
- キーボードのみ利用時も **フォーカス中はツールチップを表示**すること（`focus-within`）
- タッチ端末ではホバーが無いため、必要に応じて将来 **タップで開閉**や別導線を検討（現仕様はホバー／フォーカス主体）

### 利用ガイド

- **ここを使う**: 用語説明・集計定義・「なぜこの数字か」の一文など、読み飛ばしても業務は進む補足
- **ここではなく Modal / インライン本文**: 手順が長いヘルプ、法的文言、入力必須の注意事項

---

## 3. タブ・テーブル・ページネーション

### Tabs
**役割**: 案件一覧で使う、下線アクティブ式のタブ切替。
**配置**: `resources/js/Components/Tabs.tsx`（shadcn/ui Tabs のラッパーで実装）
**使用モック**: s03a
**Props**:
```ts
interface TabsProps<T extends string> {
  value: T;
  onChange: (v: T) => void;
  items: { value: T; label: string; icon?: LucideIcon; count?: number }[];
}
```
**注意**: URL クエリ `?tab=approval|dev|budget` と同期させる。Inertia の `router.visit()` で遷移。

### ProjectTable（3バリアント）
**役割**: 案件一覧テーブル。`tab` で列セットを切り替える。
**配置**: `resources/js/Components/Projects/ProjectTable.tsx`
**関連**: 表示ユーティリティは `resources/js/Components/Projects/projectTableUtils.ts`。ページ側の組み込み例は `resources/js/Pages/Projects/Index.tsx`。
**使用モック**: s03a（申請タブ）、s03b（開発）、s03c（予算）
**Props**（実装どおりの判別共用 Union。行型は `ProjectTable.tsx` で `export`）:
```ts
type TabSortDir = 'asc' | 'desc';

type ProjectTableProps =
  | {
      tab: 'approval';
      rows: ApprovalProjectRow[];
      sortKey: ApprovalSortKey | null;
      sortDir: TabSortDir;
      onSort: (key: ApprovalSortKey) => void;
      getRowHref: (row: ApprovalProjectRow) => string;
      onNavigate: (href: string) => void;
    }
  | {
      tab: 'dev';
      rows: ProjectTableListRow[];
      sortKey: DevSortKey | null;
      sortDir: TabSortDir;
      onSort: (key: DevSortKey) => void;
      detailHref: (id: number) => string;
      onNavigate: (href: string) => void;
    }
  | {
      tab: 'budget';
      rows: ProjectTableListRow[];
      sortKey: BudgetSortKey | null;
      sortDir: TabSortDir;
      onSort: (key: BudgetSortKey) => void;
      detailHref: (id: number) => string;
      onNavigate: (href: string) => void;
    };
```
**内部**: `tab` に応じて `<table>` の thead／tbody を分岐。列ヘッダーのソートはコンポーネント内の `TableSortHeader`。行クリック・リンクは `onNavigate` / Inertia `Link` で親から渡した URL に遷移する。

#### `ProjectController@index` が返す `projects.data[]`（申請タブ関連の追記フィールド）
一覧はページネータの `through()` で行配列に整形される。申請タブではタイトル副行・却下行表示のために特に次を参照する。

```ts
// 抜粋（実装準拠・キーのみ）
{
  id: number;
  title: string;
  purpose: string | null;
  rejectedAt: 'dept' | 'hq' | null;
  rejectedComment: string | null;
  // …その他 status / department / submittedAt / canEdit など
}
```

**却下メタの算出**: `status === rejected` の案件 ID に対し、`Approval::query()` で `action = rejected` を `acted_at` 降順で取得し、`project_id` ごとに **先頭 1 件**だけを採用。`level` が `dept` / `hq` のときのみ `rejectedAt` に反映し、`comment` は空文字を除き文字列化して `rejectedComment` とする（空・未設定は `null`）。一覧での N+1 を避けるための一括取得である。

#### S-03a（申請タブ）位置づけ
- 申請・承認フローの基準画面として必須
- `status` バッジと承認ステッパー表示の基準をここで定義する
- s03b/s03c は s03a と同一IDセットを使い、タブ差分のみを表現する

#### S-03b（開発タブ）仕様
**列定義（devColumns）**:
- タイトル（案件名 + PRJ-ID）
- 部門
- 主担当（アバター + 氏名）
- タスク進捗（進捗バー + %）
- 期限（締切が近いものは強調表示）
- 最終更新

**s03aからの差分**:
- タブ active: `申請` -> `開発`
- 対象案件: 承認済（`approved`）中心
- ステータス列/承認ステッパー: 非表示
- 主担当列と期限列: 表示
- フィルタ: `部門 / 主担当 / 進捗状態（未着手(0%) / 進行中 / 完了間近(90%+) / 完了）`
  - ※ ステータスフィルタは **なし**（dev タブは Controller 側で `status=approved` 固定）
- 行クリック遷移: `S-04`（タスクタブ初期表示）

**操作方針**:
- 新規申請ボタンは表示しない
- 必要なら「タスク追加」導線を別途用意（案件選択後）

**表示データ方針（モック）**:
- 5〜6件の開発中案件を表示
- s03a/s03c と同一PRJ-ID群を使い、画面間で整合を維持する

**進捗バー配色ルール**:
- `0-60%`: 緑（safe）
- `61-85%`: 青（normal）
- `86-100%`: 橙（warning）
- `100%超`: 赤（danger）
- ※ `S-03c` の**消費率の色分けルール**と同一閾値・同一色で運用する

**UIアクセント**:
- h1「案件一覧」の左に小さな黄色縦棒（S-04と統一）

#### S-03c（予算タブ）仕様
**前提**:
- s03b と同一の5案件・同一PRJ-IDを使い、タブ間の整合を維持する
- 新規作成ボタンは表示しない（予算タブは閲覧/入力導線のハブ）

**列定義（budgetColumns）**:
- タイトル: 案件名 + PRJ-ID
- 部門: 所属部門
- 予算額: 確定予算（円、mono）
- 実績額: 累計実績（円、mono）
- 消費率: プログレスバー + %表示
- 更新日: 最終更新日

**消費率の色分けルール**:
- `0-60%`: 緑（safe）
- `61-85%`: 青（normal）
- `86-100%`: 橙（warning）
- `100%超`: 赤（danger）
- ※ `materials/Design/design_system.md` と同期済み（本4帯定義を正とする）

**画面上部要素**:
- タイトル直下に4枚サマリーカード（予算合計 / 実績合計 / 平均消費率 / 要注意案件数）
- 要注意案件（86%以上）には視覚マーカーを付ける（例: 警告アイコン、残額の強調色）

**フィルタ**:
- 部門フィルタ
- 消費率帯フィルタ（0-60, 61-85, 86-100, 100+）

**UIメモ**:
- サイドバーのアクティブは `予算管理 > 案件一覧`
- タブのアクティブは `予算`
- 色と閾値は S-11 のプレビュー表示と一致させる（予算管理の一貫性を担保）

### MemberTasksViewToggle（S-14）
**役割**: S-14 タスク一覧の視点切替（ピル型トグル）。
**配置**: `resources/js/Components/MemberTasks/ViewToggle.tsx`
**使用モック**: `mockups/s14b_member_tasks_toggle.html`（拡張運用）
**Props**:
```ts
type ViewMode = 'board' | 'members' | 'list';

interface ViewToggleProps {
  value: ViewMode;
  onChange: (next: ViewMode) => void;
}
```
**ボタン構成**:
- `カンバン`（`view=board`）
- `メンバー別`（`view=members`）
- `一覧`（`view=list`）

**遷移ルール**:
- URLクエリ `?view=` と同期（`router.get(..., { replace: true, preserveState: true })`）
- 初期値はロール依存（applicant=board / dept_manager・hq_manager=members）。**本部はタスク閲覧のみ**（方針・`implementation_schedule.md` §3 マスト #9）

### TaskFilterBar（S-04 / S-14 共通）
**役割**: 案件詳細タスクタブ（S-04）とタスク一覧（S-14）の共通フィルタ行。
**実装**: `resources/js/Components/ProjectTasks/TaskFilterBar.tsx`  
**ロジック**: `resources/js/lib/projectTaskFilters.ts`（S-04 はクライアント、`MemberTaskController` はサーバ）

**フィールド**:
- キーワード / 種類 / 優先度 / ステータス / 担当（`__unassigned` 可）/ 確認者（`__unassigned` 可）
- 期日: すべて / 期限超過 / 今週中 / 今月中 / 期日未設定 / 期日指定（`date` + 日付 input）
- クリア（無効時はグレー）

**S-14 追加入力**（`leadingExtras` / `trailingExtras`）:
- 部門（`department_id`）: HQは選択必須、他ロールは固定
- 案件（`project_id`）

**キーワード対象（サーバ実装）**:
- `ProjectWorkItem.title`
- `ProjectWorkItem.description`
- `ProjectWorkItem.id`
- `assignee.name`
- `reviewer.name`
- `project.title`

### MemberTasksListTable（S-14 list）
**役割**: `view=list` の表形式表示。S-04（案件詳細 > 進捗管理）に準じる列設計。
**実装位置（現状）**: `resources/js/Pages/MemberTasks/Index.tsx`（ページ内実装）
**将来配置（推奨）**: `resources/js/Components/MemberTasks/ListTable.tsx`

**列定義**:
- タイトル（下段に `PRJ-XXXX / 案件名`）
- 種類
- 優先度
- ステータス
- 担当
- 確認者
- 期日

**ステータスセル仕様**:
- ステータスバッジ（4値: 未着手/進行中/確認待ち/完了）
- 進捗バー（全ステータスで表示）
- 進捗率テキスト（右寄せ、mono）

**進捗バー配色ルール**（S-04/S-03c と統一）:
- `0-60%`: 緑
- `61-85%`: 青
- `86-100%`: 橙
- `100%超`: 赤

**操作**:
- 行クリックで `ProjectTaskDialog` を開く
- 編集可否は `canUpdate` を参照（閲覧専用時は read-only）

### Pagination
**役割**: ページネーションコントロール。
**配置**: `resources/js/Components/Pagination.tsx`
**使用モック**: s03a
**Props**: `current, total, perPage, onChange`（Inertia の `Laravel Paginator` に合わせた形）

---

## 4. フォーム部品

### FieldLabel
**役割**: ラベル + 必須マーク + ヘルプテキスト。
**配置**: `resources/js/Components/Form/FieldLabel.tsx`
**使用モック**: s05
**Props**:
```ts
interface FieldLabelProps {
  htmlFor: string;
  label: string;
  required?: boolean;
  help?: string;
  children: ReactNode;  // Input/Textarea/Select など
  counter?: { current: number; max: number };  // 文字数カウンター
}
```

### AmountInput
**役割**: 金額入力。自動カンマ区切り + 単位表示（右端）。
**配置**: `resources/js/Components/Form/AmountInput.tsx`
**使用モック**: s05（予算・工数）、S-11（実績入力）
**Props**:
```ts
interface AmountInputProps {
  value: number | null;
  onChange: (v: number | null) => void;
  unit: '円' | '人日';
  placeholder?: string;
}
```
**内部**: 内部stateで表示用の文字列（カンマ区切り）を持ち、onChangeでは数値を返す。

### ProjectAttachmentField
**役割**: 案件申請・編集・詳細のファイル添付（複数選択・既存一覧・削除予定トグル・閲覧専用）。
**配置**: `resources/js/Components/Form/ProjectAttachmentField.tsx`
**使用モック**: s05（新規申請）、S-04（案件詳細の申請情報タブ）
**Props（要点）**:
```ts
interface ExistingAttachmentItem {
  id: number;
  originalFilename: string;
  sizeBytes: number;
  downloadUrl: string;
}
interface ProjectAttachmentFieldProps {
  id: string;
  label?: string;
  infotipAriaLabel?: string;
  infotipContent?: ReactNode;
  disabled?: boolean;
  error?: string;
  remainingSlots: number; // 案件あたり10件上限との兼ね合いで算出
  selectedNewFiles: File[];
  onNewFilesChange: (files: File[]) => void;
  existingAttachments?: ExistingAttachmentItem[];
  removeExistingIds?: number[];
  onToggleRemoveExisting?: (id: number) => void;
  processing?: boolean;
  readOnly?: boolean; // true のとき一覧＋ダウンロードのみ（詳細画面）
}
```
**運用**: 送信は Inertia の `forceFormData: true` とセット。サーバー側は `ProjectAttachmentService` で `storage/app/project_attachments/{project_id}/` に保存。

### Input / Textarea / Select
shadcn/ui の部品をそのまま使う。**プロジェクト固有のラッパーは作らない**（直接 shadcn/ui の `Input` 等を import）。スタイル調整が必要なら shadcn/ui の components.json 側で一括設定。

### Button（shadcn/ui）
**役割**: 主要アクション（保存/申請）と補助アクション（戻る/キャンセル）を同一基盤で管理する。
**配置**: `resources/js/Components/ui/button.tsx`
**運用方針**:
- ページ個別の単発ボタンを新規コンポーネント化せず、`variant` 追加で吸収する
- 「一覧に戻る」「キャンセル」のような補助アクションは `variant="neutral"` を使用する

**Props（実装準拠）**:
```ts
type ButtonVariant =
  | 'default'
  | 'destructive'
  | 'outline'
  | 'secondary'
  | 'neutral'
  | 'ghost'
  | 'link';

type ButtonSize = 'default' | 'sm' | 'lg' | 'icon';
```

**variant 一覧（使い分け）**:
- `default`: 主アクション。例: 申請する / 更新して申請
- `destructive`: 破壊的アクション。例: 削除確定（誤操作防止導線とセット）
- `outline`: 主アクションの代替。例: 下書き保存（強調は弱めるが明確に押せる）
- `secondary`: 補助アクション（通常）。例: 更新を保存、カード内の補助ボタン
- `neutral`: 補助アクション（戻る/キャンセル専用）。薄枠 + hoverグレー
- `ghost`: 背景を持たない軽アクション。例: テキスト寄りの軽操作
- `link`: 文中リンク風アクション。例: 補足導線

**`neutral` バリアント詳細仕様**（実装済み）:
- 枠線: `border-slate-300`（薄いグレー）
- 背景: `bg-white`
- 文字: `text-jpt-muted`（通常） / `text-jpt-dark`（hover）
- hover: `bg-slate-100`（薄いグレーで少し濃くする）
- 推奨文言: 「一覧に戻る」「キャンセル」「閉じる（非破壊）」

**size 指針**:
- `default`: 標準フォームボタン（高さ 40px）
- `sm`: テーブル内など高密度UI
- `lg`: 主要CTAを目立たせたい場面
- `icon`: アイコン単体（必ず `aria-label` を付与）

**実装パターン**:
- 画面遷移リンクをボタン見た目にする場合は `asChild` + `Link` を使う
- 非同期処理中は `disabled` を付与し、多重送信を防ぐ
- 文言と `variant` の意味を一致させる（例: 「削除」で `ghost` は使わない）

**利用例**:
- `resources/js/Pages/Projects/Create.tsx`
  - 上部「一覧に戻る」（`Button asChild variant="neutral"`）
  - フッター/確認モーダル「キャンセル」（`variant="neutral"`）
  - 下書き保存（`variant="outline"`）
  - 申請する（`variant="default"`）
- `resources/js/Pages/Projects/Edit.tsx`
  - 上部「一覧に戻る」（`Button asChild variant="neutral"`）
  - フッター/確認モーダル「キャンセル」（`variant="neutral"`）
  - 更新を保存（`variant="secondary"`）
  - 更新して申請（`variant="default"`）

---

## 5. モーダル / ダイアログ

### ConfirmDialog（汎用）
**役割**: 「○○しますか？」の一般確認ダイアログ。
**配置**: `resources/js/Components/Modals/ConfirmDialog.tsx`
**使用モック**: s05（申請確認）
**Props**:
```ts
interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  icon?: LucideIcon;
  iconBg?: string;  // Tailwindクラス
  summary?: ReactNode;  // 確認内容のまとめ（灰色カード）
  confirmLabel: string;
  confirmIcon?: LucideIcon;
  confirmVariant?: 'primary' | 'danger' | 'success';
  onConfirm: () => void;
}
```

### ApprovalDialog（S-08）
**役割**: 承認・却下専用ダイアログ。`ConfirmDialog` を内部で利用しつつ、コメント入力と承認/却下モードで UI を変える。
**配置**: `resources/js/Components/Modals/ApprovalDialog.tsx`
**使用モック**: S-08（次回以降作成）
**Props**:
```ts
interface ApprovalDialogProps {
  mode: 'approve' | 'reject';
  open: boolean;
  onClose: () => void;
  project: Project;
  approvalLevel: 'dept' | 'hq';
  onSubmit: (comment: string) => void;
}
```

### TaskFormDialog（S-10）
**役割**: タスク作成・編集モーダル。
**配置（PoC 実装）**: `resources/js/Components/Modals/ProjectTaskDialog.tsx`（本節の Props・挙動は同モーダルの意図を示す）
**使用モック**: S-10（次回以降）
**表示コンテキスト**:
- 背景に S-04 の「タスクタブ」を dimmed + blur で表示し、モーダル文脈を保つ
- モーダル本体は中央配置 `max-w-2xl`
- 基本は編集モード基準で作り、作成モードは差分制御で対応

> **タスク管理方針（実装正）**：**Backlog 風の 4 ステータス**（`open / in_progress / resolved / closed`）を DB・UI・Policy すべてで運用する。  
> - 実装者（`assignee_id`）: `in_progress → resolved`（完了報告）  
> - 確認者（`reviewer_id`）: `resolved → closed`（確認OK）  
> 詳細は `mockups/s10_policy.md` および `materials/Design/er_diagram.md §tasks.status` を参照。

**Props（実装準拠・`ProjectTaskDialog.tsx`）**:
```ts
type TaskType = 'task' | 'feature' | 'improvement' | 'bug';
type TaskPriority = 'high' | 'medium' | 'low';
type TaskStatus = 'open' | 'in_progress' | 'resolved' | 'closed';

interface ProjectTaskDialogProps {
  open: boolean;
  onClose: () => void;
  projectId: number;
  projectTitle: string;
  /** null のとき新規作成、非 null のとき編集（型は同ファイル export の TaskListItem） */
  task: TaskListItem | null;
  assignees: Array<{ id: number; name: string }>;
  /** 一覧から渡す編集可否（新規時は案件のタスク管理権限に準拠） */
  readOnly?: boolean;
}
```

保存・削除・コメント投稿は **モーダル内部で Inertia `router` により POST** する（親 Page に `onSave` を渡さない構成）。

**フィールド仕様**:
- タイトル: 全幅 input（必須）
- 種類: `タスク / 機能追加 / 改善 / バグ`（chip selector）
- 優先度: `高 / 中 / 低`（chip selector）
- ステータス: **4 チップ固定** — `未着手 / 進行中 / 確認待ち / 完了`（内部値 `open / in_progress / resolved / closed`）。遷移の可否は **サーバー側 Policy / バリデーション** が正（フロントは補助）
- 確認者: select（`resolved` へ進める際に必須となるケースあり）
- 担当者: select（アバター表示は実装に準拠）
- 期日: date input（補助表示として「あとN日」を表示）
- 進捗: slider + 数値（**ステータスが進行中のときのみ**表示）
- 説明: textarea
- コメント: 既存コメント一覧 + 投稿欄（モーダル下部）
- 変更履歴: 折りたたみ（編集時）。データは `task_histories`。案件詳細タスク行展開と同一ソース

**フッターアクション**:
- 左: 削除（編集時のみ、権限あり時）
- 右: キャンセル / 保存

**作成モードとの差分**（`task === null`）:
- ヘッダー: `タスクを作成`
- 削除ボタン: 非表示
- 進捗: `open` など進行中以外では進捗スライダー非表示（実装に準拠）
- コメント: 一覧・投稿は出さず「タスク保存後に追加できます」のガイドのみ
- 変更履歴: セクション自体はあるが件数 0（初回保存前）

**実装メモ（判断理由）**:
- S-10 は操作完結性を優先し、コメント入力を同一モーダル内に置く（別画面遷移しない）
- chip selector で種類/優先度/ステータスを即時切替できるようにする
- **4 値は PoC の標準**。課題の「+α」との対応関係はプレゼン用ラベルであり、実装の状態機械は上記 4 値のみ

### BudgetActualDialog（S-11）
**役割**: 予算実績入力モーダル（案件詳細予算タブ上で表示）。
**配置**: `resources/js/Components/Modals/BudgetActualDialog.tsx`
**使用モック**: S-11
**表示コンテキスト**:
- 実体は `Projects/Show.tsx`（`detailTab=budget`）上のモーダル表示
- 深い導線 `/projects/{id}/budget-input` は `projects.show?detailTab=budget&budgetInput=1` へリダイレクトし、モーダルを開いた状態にする
- サイドバーは案件詳細の子階層として3行 merged ハイライト
- 主担当（または同部門の部門管理者）のみ操作可。`BudgetController::canUpdateBudget` で制御

> **実装方式の切替**：課題1（PoC・実装対象）は **上書き方式**、課題2（将来拡張）は **追加方式**。  
> 詳細は `mockups/s11_policy.md` および `materials/Design/er_diagram.md §予算管理` を参照。

#### 課題1 版 Props（上書き方式・PoC 実装対象）

```ts
interface BudgetActualDialogProps {
  open: boolean;
  onClose: () => void;
  source?: 'show-budget' | 'budget-input';
  project: {
    id: number;
    title: string;
    primaryAssignee: string | null;
    budgetAmount: number | null; // 確定予算
    actualAmount: number | null; // 現在実績（この値を上書き）
  };
}
```

**構成セクション（課題1・簡易版、上から順）**:
1. ヘッダー（案件コード + タイトル + 主担当バッジ）
2. 現状サマリー（読み取り専用 4 カード）
   - 確定予算 / 現在実績 / 残予算 / 消費率
3. 入力フォーム
   - 実績額（円、`AmountInput`、初期値 = 現在の `actualAmount`）
4. 更新プレビュー（リアルタイム）
   - 新実績 / 新残予算 / 新消費率
   - before → after の消費率バー
5. 閾値ガイダンス（「86% で注意、100% で超過」）

#### 課題2 版 Props（追加方式・将来拡張）

```ts
type BudgetCategory = 'outsourcing' | 'license' | 'equipment' | 'other';

interface BudgetActualDialogPropsV2 {
  open: boolean;
  onClose: () => void;
  project: {
    id: number;
    code: string;
    title: string;
    budgetAmount: number;
    actualAmount: number;
    primaryAssignee: { id: number; name: string; avatarUrl?: string };
  };
  canEdit: boolean;
  histories: BudgetActualHistory[];   // 直近の budget_actuals（UI は最大5件表示）
  onSubmit: (payload: {
    incrementAmount: number;          // 今回の追加支出額（0 超）
    category: BudgetCategory;
    purpose: string;
    appliedOn: string;                // yyyy-mm-dd（未来日不可）
    note?: string;
  }) => void;
}
```

**課題2 の追加セクション**:
- カテゴリチップ（外注費 / ライセンス / 機材費 / その他）
- 用途・適用日・メモの入力欄
- 過去の入力履歴（折りたたみ・直近5件）

**設計ルール（重要）**:
- 課題1 は `projects.actual_amount` の上書き。要件「案件単位の総額で可」を最小構成で満たす
- 課題1 でも更新監査のため、`project_budget_histories` に `actual_amount` の更新前後・更新者・更新日時を保存し、S-04 履歴タブへ表示する
- 課題2 は `budget_actuals` テーブル INSERT で監査証跡・内訳分析・誤入力耐性を獲得
- `AmountInput`、サマリー 4 カード、Before/After プレビューは課題1/2 で共通部品化
- 保存時は変更履歴に記録される前提で文言を表示する（課題2 で実装）
- カテゴリ chip selector は将来集計を見据えてマスター化する（課題2）


**消費率表示の整合**:
- 消費率の色分けは S-03c のルールと統一する
- 例: 42% → 57.8% は safe（緑のまま）
- 注意閾値と超過閾値を注記（86% で注意、100% 超で超過）

**実装メモ（判断理由）**:
- 課題1 は最小要件を満たす最短実装を優先。`budget_actuals` テーブルを作らず、1 カラム更新で完了
- 追加方式（課題2）は誤操作耐性と監査証跡の両面で有利。課題2 昇格時は DB マイグレーション 1 本で対応可
- Before/After プレビューを保存前に見せることで、入力ミスを減らす（課題1 から提供）
- 履歴を同モーダル内に置くことで、確認のための画面往復を減らす（課題2）

---

## 6. ユーティリティ・小物

### KbdBadge
`⌘K` などのキーボードショートカット表示。`mono` フォント + 薄いボーダー。
→ Header 内で利用。別ファイルに切り出す（後で他でも使う可能性あり）。

### Challenge2Badge
`課題2` 機能であることを示す共通ラベル。
**配置**: `resources/js/Components/Badge/Challenge2Badge.tsx`
**見た目**:
- 背景: `--jpt-logo-accent`（`#EDB100`）
- 文字色: ダークブラウン系（濃色）
- 角丸・小さめ文字（`text-[9px]`）でチップ表示
**用途**:
- Sidebar の「タスク一覧」ラベル横
- S-05 新規申請の「ファイル添付（課題2）」ラベル横
**Props**:
```ts
interface Challenge2BadgeProps {
  className?: string;
}
```

### UserAvatar
イニシャル表示のアバター。氏名から1文字取ってグラデーション背景。
→ Sidebar下部ユーザーカード、タスク担当者表示、コメント欄 で共通利用。
**Props**: `name: string; size?: 'sm' | 'md' | 'lg'; gradientVariant?: number`

### ProgressBar
消費率・進捗率バー。予算管理では 4段階色分け（0-60緑 / 61-85青 / 86-100橙 / 100超赤）を標準とする。
**Props**: `value: number; max?: number; showLabel?: boolean; mode?: 'budget4band' | 'simple2threshold'`
→ S-02 予算アラート, S-03c 案件一覧予算タブ, S-04 予算サマリー, S-11 入力プレビュー で共通利用。

### EmptyState
データ0件時の表示。`icon / title / description / action` の定型。
**Props**: `icon: LucideIcon; title: string; description?: string; action?: ReactNode`
→ 全テーブル・リスト画面で共通利用。

### Toast（sonner）
shadcn/ui 経由で `sonner` を導入し、成功・エラー通知に使う。プロジェクト内ラッパー不要。

### NotificationTypeBadge
通知一覧（S-12）で通知種別を視認しやすくするための種別バッジ。
**配置**: `resources/js/Pages/Notifications/Index.tsx`（当面はページ内実装）
**対象種別（課題1）**:
- `project_submitted`（申請）
- `project_approved`（承認）
- `project_rejected`（却下）
- `project_returned`（取り戻し）
- `task_assigned`（担当通知）
- `task_due_soon`（期限間近）
- `task_completed`（タスク完了）
**配色ルール**:
- 承認系: 緑、却下系: 赤、進行通知: 青、期限通知: 橙、補助通知: グレー
**備考**:
- タイトル行で「通知種別バッジ + 未読バッジ」を横並び表示する
- バッジ文言は英語コードを直接表示せず日本語ラベルで表示する

---

## Cursor への指示テンプレ

モックをReactに起こすときは、このファイルを先に読ませた上で、以下のような指示で進める:

> **[モック変換指示の雛形]**
>
> `mockups/s05_project_create.html` を `resources/js/Pages/Projects/Create.tsx` として実装してください。
>
> **作業順序**:
> 1. まず `materials/Design/components_spec.md` を読んで、使用する共通部品をリストアップ
> 2. 未実装の共通部品（`ApprovalFlowGuide`, `AmountInput`, `FieldLabel`, など）があれば先に `Components/` 配下に作成
> 3. Create.tsx は共通部品を組み立てるだけの薄い実装にする
> 4. Tailwind クラスの直書きは最小限に。繰り返すパターンは部品化する
> 5. 実装後、`materials/Design/components_spec.md` の「使用モック」欄にこのページを追記

---

## 部品化しないもの（過剰分離を避ける）

- ページタイトル（`<h1>`）とサブタイトル — 画面ごとに違うので各 Page で直接書く
- 単一画面でしか使わない一時的な装飾（ただしボタン見た目は `Button` の `variant` で吸収する）
- 画面固有のレイアウト（例: S-05 の下書き復元ヒント）

**判断基準**: 「2つ以上のPagesで同じパターンを書きそうか？」Yes なら共通化、No ならPageにそのまま書く。

---

## 更新ログ

- 2026-04-16: s02/s03a/s05 モックから初版を作成。S-04/S-07/S-08/S-10/S-11/S-12/S-13 は今後のモック作成時に追記。
- 2026-04-18: 各画面方針書（`mockups/s0x_policy.md`）との整合確認を実施。S-03b の進捗フィルタ区分を `未着手/進行中/完了間近(90%+)/完了` に改訂し、進捗バー配色ルールを4帯（0-60緑 / 61-85青 / 86-100橙 / 100超赤）へ統一。
- 2026-05-01: タスク変更履歴の自動記録（`TaskHistoryService`・`task_histories`）と S-04 のタスク一覧行展開を反映。S-10 モーダルの実装ファイル名を `ProjectTaskDialog.tsx` に明記。
- 2026-05-07: S-10（`ProjectTaskDialog`）を **4 値運用・実装 Props** に同期。案件詳細 `detailTab` は `screen_flow.md` / `Information.md` と実装（`apply` 等）を正に統一。
- 2026-05-07: `Button` に `neutral` バリアントを追加し、「一覧に戻る」「キャンセル」を共通化。単発の `NeutralAction.tsx` は廃止して既存部品へ統合。
- 2026-05-07: `Button` 章を拡張し、`default/destructive/outline/secondary/neutral/ghost/link` の使い分け、`size` 指針、`asChild` 運用を追記。部品化しない方針もボタン運用に合わせて更新。
- 2026-05-08: S-02 ダッシュボードの実装部品（`KpiCard` / `DeptProgressChart` / `BudgetTrendChart` / `BudgetAlertTable`）を追加。サイドバー「予算管理」に `ダッシュボード` 導線を追加。
- 2026-05-08: 課題1の予算実績更新で `project_budget_histories` を記録し、S-04 の履歴タブへ「予算実績を更新」イベントとして表示する仕様を追記。
- 2026-09-14: ゲスト向け「このアプリについて」を単一の縦スクロールページへ変更し、`AboutPage` の構成・認証別 CTA・ManualIndex との切り替え・アクセシビリティ方針を追記。
/**更新完了**/
