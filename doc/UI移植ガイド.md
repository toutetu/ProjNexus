# ProjNexus UI移植ガイド（実装コード準拠）

> 調査基準: `main` / commit `1f66afa` / 2026-09-14  
> 対象: 配色、ボタン、フォーム、モーダル、ナビゲーション、ステータス表示、カード、タブ、ドラッグ操作など、次のアプリへ引き継げるUI資産  
> 方針: 設計資料の記述よりも、現在動作する `resources/js`・`resources/css`・`tailwind.config.js` を優先する。

## 1. 結論：まず引き継ぐファイル

最小構成では、次の順で移植すると依存関係を解きやすい。

| 優先度 | 役割 | 元ファイル | 移植方法 |
|---|---|---|---|
| 1 | 基本色、フォント、承認パルス | [`tailwind.config.js:14-60`](../tailwind.config.js#L14-L60) | トークンを新アプリのテーマへ転記 |
| 1 | Webフォント、サイドバースクロールバー | [`resources/css/app.css:1-28`](../resources/css/app.css#L1-L28) | CSSを移植。外部フォントを使わない場合はセルフホストへ変更 |
| 1 | className結合関数 | [`resources/js/lib/utils.ts:1-6`](../resources/js/lib/utils.ts#L1-L6) | `clsx` + `tailwind-merge` と一緒にコピー |
| 1 | 共通ボタン | [`resources/js/Components/ui/button.tsx:7-59`](../resources/js/Components/ui/button.tsx#L7-L59) | 原則そのままコピー |
| 1 | 入力、選択、ダイアログ | [`ui/input.tsx`](../resources/js/Components/ui/input.tsx), [`ui/select.tsx`](../resources/js/Components/ui/select.tsx), [`ui/dialog.tsx`](../resources/js/Components/ui/dialog.tsx) | 必要な部品だけコピー |
| 2 | 案件ステータス表示 | [`StatusPill.tsx:3-84`](../resources/js/Components/StatusPill.tsx#L3-L84) | 型・ラベル・3層色をまとめてコピー |
| 2 | 申請・開発・予算のナビ色 | [`sidebarNavTheme.ts:5-65`](../resources/js/lib/sidebarNavTheme.ts#L5-L65) | 新アプリではテーマトークンへ統合を推奨 |
| 2 | ログイン後の画面枠 | [`AuthenticatedLayout.tsx:16-70`](../resources/js/Layouts/AuthenticatedLayout.tsx#L16-L70), [`Sidebar.tsx`](../resources/js/Components/Layout/Sidebar.tsx), [`Header.tsx`](../resources/js/Components/Layout/Header.tsx) | Inertia依存をルーターに合わせて置換 |
| 3 | 業務UI | 承認ステッパー、案件詳細タブ、タスクカード、カンバン、各ダイアログ | 新アプリのドメイン型・APIに合わせて移植 |

最小依存パッケージは [`package.json:31-45`](../package.json#L31-L45) にある。特に以下がUI移植に関係する。

- `@radix-ui/react-slot`: `Button` の `asChild`
- `@radix-ui/react-dialog`: 共通ダイアログ
- `@radix-ui/react-select`: 共通セレクト
- `class-variance-authority`: ボタン・バッジのvariant管理
- `clsx`, `tailwind-merge`: `cn()`
- `lucide-react`: アイコン
- `tailwindcss-animate`: Radix系UIのアニメーション
- `recharts`: ダッシュボードのグラフを移植する場合のみ
- `@inertiajs/react`: 現アプリの画面遷移・フォーム送信。新アプリがInertiaでなければ置換対象

## 2. 配色

### 2.1 基本カラートークン

正本は [`tailwind.config.js:28-46`](../tailwind.config.js#L28-L46)。現在の実装はCSS Variablesではなく、Tailwindの `jpt-*` / `status-*` 名前空間を使う。

| Tailwind名 | HEX | 用途 | 主な使用箇所 |
|---|---:|---|---|
| `jpt-red` | `#E60013` | 主要CTA、未読件数、却下、期限超過 | Button、StatusPill、Header |
| `jpt-dark` | `#212429` | 見出し、本文、濃色ボタン | Layout、カード、ViewToggle |
| `jpt-bg` | `#F8F9FA` | アプリ背景、薄いhover、補助面 | AuthenticatedLayout、Button、Table |
| `jpt-muted` | `#6C757D` | 補助テキスト、非アクティブ状態 | 全般 |
| `jpt-border` | `#DEE2E6` | 枠線、区切り線 | 全般 |
| `jpt-accent` | `#EDB100` | 黄色アクセント、注意、見出し左線 | Dashboard、案件一覧、マニュアル |
| `jpt-cyan` | `#01CFFF` | 部門承認待ち、ブランドグラデーション | StatusPill、GuestLayout |
| `jpt-blue` | `#106EBE` | リンク、フォーカス、情報、進行中 | Button、Input、Stepper |
| `jpt-purple` | `#6D28D9` | 予算セクション、ブランドグラデーション | Sidebar、KPI |
| `white` | `#FFFFFF` | カード、ヘッダー、サイドバー | Tailwind標準色として直接使用 |

ブランドグラデーションは `from-jpt-cyan via-jpt-blue to-jpt-purple`。実例は [`GuestLayout.tsx:7-23`](../resources/js/Layouts/GuestLayout.tsx#L7-L23)、KPIの2色グラデーションは [`KpiCard.tsx:18-23`](../resources/js/Components/Dashboard/KpiCard.tsx#L18-L23) にある。

### 2.2 案件ステータス色

実装正本は [`StatusPill.tsx:23-54`](../resources/js/Components/StatusPill.tsx#L23-L54)。背景・文字・ドットの3層で、色だけでなく日本語ラベルも表示する。

| 値 | ラベル | 背景 | 文字 | ドット |
|---|---|---:|---:|---:|
| `draft` | 下書き | `#E9ECEF` | `#495057` | `#6C757D` |
| `pending_dept` | 部門承認待ち | `#E0F7FE` | `#0C7DA3` | `#01CFFF` |
| `pending_hq` | 本部承認待ち | `#E3EEFB` | `#0A4E8A` | `#106EBE` |
| `approved` | 承認済 | `#DCFCE7` | `#166534` | `#16A34A` |
| `rejected` | 却下 | `#FEE2E2` | `#991B1B` | `#E60013` |

`StatusPill` のサイズは `sm` と `md`。どちらも `rounded-full`、`font-medium` で、ドットにも `aria-hidden` を付けている。

### 2.3 画面セクション色

サイドバーと案件詳細のフォルダ型タブは、同じ [`sidebarNavTheme.ts:23-65`](../resources/js/lib/sidebarNavTheme.ts#L23-L65) を共有する。

| セクション | ラベル | アクティブ面 | アクティブ文字 | 枠 | アイコン面 |
|---|---:|---:|---:|---:|---:|
| 申請・承認 | `#0099C4` | `#E0F7FF` | `#0369A1` | `#BAF1FF` | `#BAF1FF` |
| 開発管理 | `#106EBE` | `#EFF6FF` | `#1D4ED8` | `#BFDBFE` | `#DBEAFE` |
| 予算管理 | `#7C3AED` | `#F5F3FF` | `#6D28D9` | `#DDD6FE` | `#EDE9FE` |
| 履歴タブ | — | `#F3F4F6` | `jpt-dark` | — | — |

案件詳細タブはこのトークンを読み、アクティブ面と左右のスカラップをinline styleで描画する。実装は [`ProjectDetailTabBar.tsx:23-98`](../resources/js/Components/Projects/ProjectDetailTabBar.tsx#L23-L98)。

### 2.4 タスク色

#### ステータス

| 値 | ラベル | 色 |
|---|---|---|
| `open` | 未着手 | グレー |
| `in_progress` | 進行中 | `jpt-blue` |
| `resolved` | 確認待ち | Violet `#7C3AED`、薄面 `#F5F3FF` |
| `closed` | 完了 | Green `#16A34A` |

定義元はタスク編集チップ [`ProjectTaskDialog.tsx:110-123`](../resources/js/Components/Modals/ProjectTaskDialog.tsx#L110-L123) とカンバン列 [`KanbanBoard.tsx:25-41`](../resources/js/Components/MemberTasks/KanbanBoard.tsx#L25-L41)。

#### 種類チップ

表示用の淡色チップは [`TaskCard.tsx:23-35`](../resources/js/Components/MemberTasks/TaskCard.tsx#L23-L35) と [`Projects/Show.tsx:183-202`](../resources/js/Pages/Projects/Show.tsx#L183-L202) にある。

| 種類 | 背景 | 文字 |
|---|---:|---:|
| task | `#E0E7FF` | `#3730A3` |
| bug | `#FEE2E2` | `#991B1B` |
| feature | `#D1FAE5` | `#065F46` |
| improvement | `#FEF3C7` | `#92400E` |

編集時の選択チップは、選択中だけ濃色背景＋白文字になる。元コードは [`ProjectTaskDialog.tsx:89-108`](../resources/js/Components/Modals/ProjectTaskDialog.tsx#L89-L108)。

### 2.5 予算・進捗の4段階色

新アプリでは次を正規化して1関数にまとめる。

| 割合 | 意味 | バー | 文字 |
|---:|---|---:|---:|
| `0–60%` | 安全 | `#16A34A` | `#166534` |
| `61–85%` | 通常 | `#106EBE` | `#106EBE` |
| `86–100%` | 注意 | `#F59E0B`（一部画面は `#EDB100`） | `#92400E` |
| `>100%` | 超過 | `#E60013` | `#E60013` |

主な定義は [`BudgetActualDialog.tsx:37-45`](../resources/js/Components/Modals/BudgetActualDialog.tsx#L37-L45)、[`Projects/Index.tsx:303-314`](../resources/js/Pages/Projects/Index.tsx#L303-L314)、[`Projects/Show.tsx:159-167`](../resources/js/Pages/Projects/Show.tsx#L159-L167)、[`BudgetAlertTable.tsx:18-23`](../resources/js/Components/Dashboard/BudgetAlertTable.tsx#L18-L23)。

注意点として、現在は `60%` を青にする実装と緑にする実装が混在する。また注意色も `#F59E0B` と `jpt-accent (#EDB100)` が混在する。上表は設計資料と多数側の意図に合わせた移植推奨値であり、移植時に共通関数へ一本化する。

### 2.6 通知種別色

通知バッジのコードは [`Notifications/Index.tsx:63-111`](../resources/js/Pages/Notifications/Index.tsx#L63-L111)。

| 種別 | ラベル | 背景 / 文字 |
|---|---|---|
| `project_submitted` | 申請 | `#E0F2FE` / `#0C7DA3` |
| `project_approved` | 承認 | `#DCFCE7` / `#166534` |
| `project_rejected` | 却下 | `#FEE2E2` / `#991B1B` |
| `project_returned` | 取り戻し | `#E9ECEF` / `#495057` |
| `task_assigned` | 担当通知 | `#E3EEFB` / `#0A4E8A` |
| `task_due_soon` | 期限間近 | `#FEF3C7` / `#92400E` |
| `task_completed` | タスク完了 | `#DCFCE7` / `#166534` |
| `task_resolved` | 確認依頼 | `#EDE9FE` / `#5B21B6` |
| `task_reviewed` | 確認OK | `#E0E7FF` / `#3730A3` |
| 未知の種別 | 通知 | `#E9ECEF` / `#495057` |

### 2.7 Tailwind以外へ移植する場合のCSS Variables

以下は実装値を移植しやすい形へ集約したもの。現アプリにはこの `:root` 自体は存在しない。

```css
:root {
  --jpt-red: #E60013;
  --jpt-dark: #212429;
  --jpt-bg: #F8F9FA;
  --jpt-muted: #6C757D;
  --jpt-border: #DEE2E6;
  --jpt-white: #FFFFFF;
  --jpt-accent: #EDB100;
  --jpt-cyan: #01CFFF;
  --jpt-blue: #106EBE;
  --jpt-purple: #6D28D9;

  --status-draft: #6C757D;
  --status-pending-dept: #01CFFF;
  --status-pending-hq: #106EBE;
  --status-approved: #16A34A;
  --status-rejected: #E60013;

  --semantic-warning: #F59E0B;
  --semantic-warning-text: #92400E;
  --semantic-success: #16A34A;
  --semantic-success-text: #166534;
  --semantic-danger-text: #991B1B;
  --semantic-review: #7C3AED;
}
```

## 3. タイポグラフィ、形、余白、動き

### 3.1 フォント

- Sans: `Noto Sans JP` → `Figtree` → Tailwind標準sans。定義は [`tailwind.config.js:16-21`](../tailwind.config.js#L16-L21)。
- Mono: `JetBrains Mono` → `Roboto Mono` → Tailwind標準mono。定義は [`tailwind.config.js:22-26`](../tailwind.config.js#L22-L26)。
- Google Fontsの実読込は [`app.css:1`](../resources/css/app.css#L1)。Blade側ではFigtreeも読み込むため、フォールバックとして利用できる。参照: [`app.blade.php:9-19`](../resources/views/app.blade.php#L9-L19)。
- 金額、割合、案件番号、日付の数字には `font-mono` を使う。

### 3.2 共通の見た目

| 対象 | 実装パターン |
|---|---|
| ページ背景 | `bg-jpt-bg text-jpt-dark` |
| 標準カード | `rounded-lg border border-jpt-border bg-white shadow-sm` |
| カード内余白 | `p-4`〜`p-6` |
| 標準入力 | `h-10 rounded-md border-jpt-border bg-white px-3 py-2 text-sm` |
| ページ見出し | `text-2xl font-bold tracking-tight text-jpt-dark` |
| 補助文 | `text-sm text-jpt-muted` |
| 小バッジ | `rounded-full px-2〜2.5 py-0.5 text-[10px]〜text-xs font-semibold` |
| アイコン | Lucide、通常 `h-4 w-4` または `h-5 w-5` |

カードの基準例は [`KpiCard.tsx:43-103`](../resources/js/Components/Dashboard/KpiCard.tsx#L43-L103)、空状態は [`EmptyState.tsx:17-27`](../resources/js/Components/EmptyState.tsx#L17-L27)、テーブルは [`ui/table.tsx:5-86`](../resources/js/Components/ui/table.tsx#L5-L86)。

### 3.3 モーション

| 対象 | 動き | 元コード |
|---|---|---|
| ボタン | hoverで影/明度/背景変更、押下時 `scale-95`、Tailwind既定150ms | [`ui/button.tsx:7-29`](../resources/js/Components/ui/button.tsx#L7-L29) |
| KPIカード | hoverで `-translate-y-0.5` + `shadow-md`、150ms | [`KpiCard.tsx:43-49`](../resources/js/Components/Dashboard/KpiCard.tsx#L43-L49) |
| 承認中ステップ | 青いbox-shadowが1.6秒で脈動 | [`tailwind.config.js:48-60`](../tailwind.config.js#L48-L60) |
| ツールチップ | opacityを150msで表示、hoverとkeyboard focusの両対応 | [`ui/infotip.tsx:19-38`](../resources/js/Components/ui/infotip.tsx#L19-L38) |
| 旧Dropdown | 開く200ms、閉じる75ms、opacity + scale | [`Dropdown.tsx:79-103`](../resources/js/Components/Dropdown.tsx#L79-L103) |
| 旧Modal | 開く300ms、閉じる200ms、opacity + translate + scale | [`Modal.tsx:35-68`](../resources/js/Components/Modal.tsx#L35-L68) |

## 4. ボタンシステム

### 4.1 共通基盤

業務画面の正本は [`resources/js/Components/ui/button.tsx`](../resources/js/Components/ui/button.tsx)。`cva` で見た目を管理し、`cn()` により呼出側の `className` で安全に上書きできる。

共通の挙動は次のとおり。

- `inline-flex` でアイコン＋文言を中央揃え
- `rounded-md`, `text-sm`, `font-medium`
- `transition-all`
- keyboard focus時に青い2pxリング＋2pxオフセット
- 押下中は `active:scale-95`
- disabled時は `pointer-events-none` + `opacity-50`
- `asChild` のときRadix `Slot`を使い、`Link` / `<a>` をボタン外観にする

### 4.2 variant

| variant | 見た目 | 用途 | 実装行 |
|---|---|---|---|
| `default` | JPT赤、白文字、shadow、hoverで明るく＋影を強化 | 保存、申請、追加など主要操作 | [`12-13`](../resources/js/Components/ui/button.tsx#L12-L13) |
| `destructive` | 現状は `default` と同じ見た目 | 削除、却下など破壊的操作 | [`14-15`](../resources/js/Components/ui/button.tsx#L14-L15) |
| `outline` | 赤枠、白地、赤文字、hoverで薄赤 | 下書き、編集、軽い強調操作 | [`16-17`](../resources/js/Components/ui/button.tsx#L16-L17) |
| `secondary` | グレー枠、白地、濃文字、hoverで背景グレー | 補助操作 | [`18-19`](../resources/js/Components/ui/button.tsx#L18-L19) |
| `neutral` | Slate枠、通常はmuted、hoverで濃文字＋薄グレー | 戻る、キャンセル、閉じる | [`20-21`](../resources/js/Components/ui/button.tsx#L20-L21) |
| `ghost` | 青文字、枠なし、hoverで薄背景 | 行内操作、添付削除/取消 | [`22`](../resources/js/Components/ui/button.tsx#L22) |
| `link` | 青文字、hoverで下線 | 文中導線 | [`23`](../resources/js/Components/ui/button.tsx#L23) |

### 4.3 size

| size | 寸法 | 用途 |
|---|---|---|
| `default` | `h-10 px-4 py-2` | 標準フォーム |
| `sm` | `h-9 px-3` | テーブル、ツールバー |
| `lg` | `h-11 px-8` | 強調CTA |
| `icon` | `h-10 w-10` | アイコン単体。必ず `aria-label` を付ける |

定義は [`ui/button.tsx:25-35`](../resources/js/Components/ui/button.tsx#L25-L35)。

### 4.4 移植用の利用例

```tsx
// 主要操作
<Button disabled={processing} onClick={save}>保存</Button>

// 戻るリンクをボタン表示
<Button asChild variant="neutral">
  <Link href="/projects">一覧に戻る</Link>
</Button>

// 補助操作
<Button type="button" variant="secondary" onClick={onClose}>キャンセル</Button>

// テーブル内の軽操作
<Button type="button" variant="ghost" size="sm">取り除く</Button>
```

実例は新規案件の戻る/保存/キャンセル/申請 [`Projects/Create.tsx:127-132`](../resources/js/Pages/Projects/Create.tsx#L127-L132), [`Projects/Create.tsx:362-399`](../resources/js/Pages/Projects/Create.tsx#L362-L399) と、添付操作 [`ProjectAttachmentField.tsx:122-163`](../resources/js/Components/Form/ProjectAttachmentField.tsx#L122-L163) にある。

### 4.5 主要ボタンの処理フロー

| 操作 | 現在の挙動 | 元コード |
|---|---|---|
| 新規案件：下書き/申請 | `submit_action` を切替 → Inertia POST。添付時だけFormData。失敗は `alert`。申請後に確認面を閉じる | [`Projects/Create.tsx:70-102`](../resources/js/Pages/Projects/Create.tsx#L70-L102) |
| 案件編集：保存/再申請 | 上記と同型のPUT。`preserveScroll`。下書き削除は別busy state | [`Projects/Edit.tsx:84-137`](../resources/js/Pages/Projects/Edit.tsx#L84-L137) |
| 承認/却下 | 承認コメントは任意、却下理由は必須。空の却下はボタンdisabled | [`ApprovalDialog.tsx:29-67`](../resources/js/Components/Modals/ApprovalDialog.tsx#L29-L67), [`114-128`](../resources/js/Components/Modals/ApprovalDialog.tsx#L114-L128) |
| 予算保存 | 入力を数字だけに正規化し、0〜確定予算の2倍以外はdisabled。保存中もdisabled | [`BudgetActualDialog.tsx:31-85`](../resources/js/Components/Modals/BudgetActualDialog.tsx#L31-L85), [`172-185`](../resources/js/Components/Modals/BudgetActualDialog.tsx#L172-L185) |
| タスク保存 | タイトル必須、確認者必須、保存中はdisabled。POST/PUTを作成/編集で切替 | [`ProjectTaskDialog.tsx:286-331`](../resources/js/Components/Modals/ProjectTaskDialog.tsx#L286-L331), [`740-772`](../resources/js/Components/Modals/ProjectTaskDialog.tsx#L740-L772) |
| タスク削除 | 権限確認 → browser `confirm` → DELETE。処理中は多重操作防止 | [`ProjectTaskDialog.tsx:333-343`](../resources/js/Components/Modals/ProjectTaskDialog.tsx#L333-L343) |
| 通知を既読 | PATCHし、スクロール位置を保持 | [`Notifications/Index.tsx:113-122`](../resources/js/Pages/Notifications/Index.tsx#L113-L122), [`219-229`](../resources/js/Pages/Notifications/Index.tsx#L219-L229) |

## 5. そのほかの再利用可能UIパーツ

| 部品 | Props / 状態 | 見た目・挙動 | 元ファイル |
|---|---|---|---|
| `Input` | native input props | h-10、白、shadow、青focus、disabled 50% | [`ui/input.tsx:5-19`](../resources/js/Components/ui/input.tsx#L5-L19) |
| `Select` | Radix Select props | trigger/content/item、選択チェック、keyboard操作 | [`ui/select.tsx:7-170`](../resources/js/Components/ui/select.tsx#L7-L170) |
| `Dialog` | Radix controlled/uncontrolled props | dark 60% overlay、中央配置、Esc/外側クリック、閉じるボタン | [`ui/dialog.tsx:7-126`](../resources/js/Components/ui/dialog.tsx#L7-L126) |
| `Badge` | `variant` | default/secondary/destructive/outline | [`ui/badge.tsx:6-30`](../resources/js/Components/ui/badge.tsx#L6-L30) |
| `Table` | native table props | 横スクロール、row hover、selected state | [`ui/table.tsx:5-86`](../resources/js/Components/ui/table.tsx#L5-L86) |
| `Infotip` | `ariaLabel`, `align`, class上書き | hoverとfocus-withinで表示 | [`ui/infotip.tsx:6-40`](../resources/js/Components/ui/infotip.tsx#L6-L40) |
| `StatusPill` | `status`, `size` | 背景＋文字＋ドット | [`StatusPill.tsx:3-84`](../resources/js/Components/StatusPill.tsx#L3-L84) |
| `Tabs` | `value`, `onChange`, `items` | 赤い下線、任意アイコン、件数バッジ | [`Tabs.tsx:5-63`](../resources/js/Components/Tabs.tsx#L5-L63) |
| `ProjectDetailTabBar` | `activeTab`, `onTabChange`, `showDevBudgetTabs`, `taskCount` | セクション色を使うフォルダ型タブ | [`ProjectDetailTabBar.tsx:101-171`](../resources/js/Components/Projects/ProjectDetailTabBar.tsx#L101-L171) |
| `ApprovalStepperMini` | `status`, `rejectedAt`, `skipsDeptStep` | 一覧用4段階、currentはpulse | [`ApprovalStepperMini.tsx:4-126`](../resources/js/Components/Approval/ApprovalStepperMini.tsx#L4-L126) |
| `ApprovalStepperFull` | 上記＋承認者/日時 | 詳細用4段階、done/current/rejected/skipped | [`ApprovalStepperFull.tsx:8-189`](../resources/js/Components/Approval/ApprovalStepperFull.tsx#L8-L189) |
| `EmptyState` | icon/title/description/action | dashed枠＋丸アイコン＋任意CTA | [`EmptyState.tsx:4-28`](../resources/js/Components/EmptyState.tsx#L4-L28) |
| `ProjectAttachmentField` | 新規/既存ファイル、削除予定、disabled/readOnly | 1送信5件、案件上限10件、入力リセット、取消可能 | [`ProjectAttachmentField.tsx:18-78`](../resources/js/Components/Form/ProjectAttachmentField.tsx#L18-L78), [`99-190`](../resources/js/Components/Form/ProjectAttachmentField.tsx#L99-L190) |
| `TaskFilterBar` | filters/onChange/onClear、人候補 | keyword＋複数select＋期日指定、条件なしでClear disabled | [`TaskFilterBar.tsx:16-50`](../resources/js/Components/ProjectTasks/TaskFilterBar.tsx#L16-L50), [`52-171`](../resources/js/Components/ProjectTasks/TaskFilterBar.tsx#L52-L171) |
| `ViewToggle` | `board/list/members` | dark面のsegmented control | [`ViewToggle.tsx:5-58`](../resources/js/Components/MemberTasks/ViewToggle.tsx#L5-L58) |
| `TaskCard` | task、variant、drag可否 | click/Enter/Spaceで開く、drag中click抑止、期限/種類/優先度表示 | [`TaskCard.tsx:67-137`](../resources/js/Components/MemberTasks/TaskCard.tsx#L67-L137) |
| `KanbanBoard` | tasks/open/drop/draggable判定 | 4列、drop target ring、HTML5 DnD | [`KanbanBoard.tsx:6-115`](../resources/js/Components/MemberTasks/KanbanBoard.tsx#L6-L115) |
| `MemberMatrix` | tasks/members/counts/open/drop | メンバー×状態の表、各セルへdrop | [`MemberMatrix.tsx`](../resources/js/Components/MemberTasks/MemberMatrix.tsx) |
| `KpiCard` | icon/value/badge/progress/accent | 上辺アクセント、hover lift、進捗バー | [`KpiCard.tsx:5-105`](../resources/js/Components/Dashboard/KpiCard.tsx#L5-L105) |
| `ApprovalDialog` | approve/reject、project、level、submit | 却下のみコメント必須 | [`ApprovalDialog.tsx`](../resources/js/Components/Modals/ApprovalDialog.tsx) |
| `ProjectTaskDialog` | project/task/users/readOnly | 作成/編集、chips、進捗、コメント、履歴、削除 | [`ProjectTaskDialog.tsx`](../resources/js/Components/Modals/ProjectTaskDialog.tsx) |
| `BudgetActualDialog` | project/source/open | Before/After、4帯色、入力上限、保存 | [`BudgetActualDialog.tsx`](../resources/js/Components/Modals/BudgetActualDialog.tsx) |

## 6. 画面横断の操作仕様

### 6.1 サイドバー開閉

- 初期値は開いた状態。
- 閉じる/開くボタンで表示自体を切り替える。
- 状態を `localStorage['jpt.sidebar.open']` に `1` / `0` で保存し、次回表示へ引き継ぐ。
- 元コード: [`AuthenticatedLayout.tsx:22-61`](../resources/js/Layouts/AuthenticatedLayout.tsx#L22-L61)。
- 現在のサイドバーは **白背景・幅256px (`w-64`)**。元コード: [`Sidebar.tsx:386-417`](../resources/js/Components/Layout/Sidebar.tsx#L386-L417)。
- セクションごとのアクティブ色、disabled、件数バッジ、外部リンク、POSTログアウトを `SidebarLink` が吸収する。元コード: [`Sidebar.tsx:62-250`](../resources/js/Components/Layout/Sidebar.tsx#L62-L250)。

### 6.2 タブとURL同期

- 案件一覧のタブはInertia `router.visit` を使い、`preserveScroll`, `preserveState`, `replace` を有効にする。元コード: [`Projects/Index.tsx:655-702`](../resources/js/Pages/Projects/Index.tsx#L655-L702)。
- 案件詳細タブはクライアントstateを切り替え、`history.replaceState` で `detailTab` を同期する。ネットワークリクエストは発生しない。元コード: [`Projects/Show.tsx:706-738`](../resources/js/Pages/Projects/Show.tsx#L706-L738)。
- 未承認案件で開発/予算タブがURL指定された場合は申請タブへ戻す。元コード: [`Projects/Show.tsx:777-790`](../resources/js/Pages/Projects/Show.tsx#L777-L790)。
- タスク一覧のview/filter/sortはURL queryへ入れ、Inertia GETで再取得する。元コード: [`MemberTasks/Index.tsx:181-217`](../resources/js/Pages/MemberTasks/Index.tsx#L181-L217)。

### 6.3 モーダル

主要業務モーダルはRadix Dialogのcontrolled patternを使う。

```tsx
<Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
  <DialogContent>...</DialogContent>
</Dialog>
```

- overlayは `bg-jpt-dark/60`、contentは中央、`max-w-lg`、白背景、border、shadow。元コード: [`ui/dialog.tsx:29-68`](../resources/js/Components/ui/dialog.tsx#L29-L68)。
- closeアイコンにはscreen reader用の「閉じる」がある。
- Create/Editの申請確認は独自overlay、プロフィール削除はHeadless UI、タスク削除はbrowser confirmで、現在は4方式が混在している。新アプリではRadix Dialogへ統一するのが安全。

### 6.4 非同期処理と多重送信防止

- Inertia `useForm().processing` またはローカル `processing` をボタンの `disabled` へ渡す。
- `Button` 自体が `pointer-events-none opacity-50` を付ける。
- 画面によっては文言を「保存中…」へ変えず、見た目はopacityだけ変わる。新アプリでは重要処理にspinnerまたは処理中文言を追加する。

### 6.5 ドラッグ＆ドロップ

- `TaskCard` が `dataTransfer['text/plain']` にtask idを格納する。元コード: [`TaskCard.tsx:104-137`](../resources/js/Components/MemberTasks/TaskCard.tsx#L104-L137)。
- `KanbanBoard` / `MemberMatrix` がdrop先ステータスを決める。
- 画面側で `canUpdate`、同一ステータス、別更新中をguardしてPUTする。失敗時はalert、終了時にbusy idを解除する。元コード: [`MemberTasks/Index.tsx:230-257`](../resources/js/Pages/MemberTasks/Index.tsx#L230-L257)、[`Projects/Show.tsx:750-775`](../resources/js/Pages/Projects/Show.tsx#L750-L775)。
- HTML5 DnDはtouch操作に弱いため、タブレットを重視する新アプリではステータスメニューも併設する。

### 6.6 キーボード操作

- `TaskCard`: Enter / Spaceで詳細を開く。元コード: [`TaskCard.tsx:104-137`](../resources/js/Components/MemberTasks/TaskCard.tsx#L104-L137)。
- タスクコメント: Windows `Ctrl + Enter`、macOS `Cmd + Enter` で投稿。元コード: [`ProjectTaskDialog.tsx:345-365`](../resources/js/Components/Modals/ProjectTaskDialog.tsx#L345-L365)。
- `Infotip`: hoverだけでなく `focus-within` でも表示。
- `Dialog` / `Select`: Radixのkeyboard interactionを利用。

### 6.7 フィードバック

- 一覧の成功/失敗はページ上部のinline banner。成功はEmerald、失敗はRedで、`role="status"` / `role="alert"` を付ける。元コード: [`Projects/Index.tsx:818-833`](../resources/js/Pages/Projects/Index.tsx#L818-L833)。
- 入力エラーはフィールド直下。共通部品は [`InputError.tsx:3-15`](../resources/js/Components/InputError.tsx#L3-L15)。
- 一部失敗は `window.alert`、削除確認は `window.confirm`。
- 設計資料にはToast案があるが、現コード・依存パッケージには `sonner` 実装がない。移植対象にToastを含める場合は新規実装になる。

## 7. レイアウトとレスポンシブ

### 7.1 ログイン後

実装正本は [`AuthenticatedLayout.tsx:36-68`](../resources/js/Layouts/AuthenticatedLayout.tsx#L36-L68)。

- viewport固定: `h-screen overflow-hidden`
- 左: `w-64` の白いSidebar
- 右: sticky `h-14` Header + 縦スクロールするmain
- main: `p-6`, 既定 `max-w-7xl`, 中央寄せ
- 大型のタスク画面だけ `max-w-[1500px]` を指定
- Headerは通知・マニュアル・ログアウトのicon buttonとhover tooltipを持つ。元コード: [`Header.tsx:12-71`](../resources/js/Components/Layout/Header.tsx#L12-L71)。

### 7.2 ログイン前

`GuestLayout` は `jpt-bg` 上の中央カード、ブランドグラデーションのロゴ、`sm:max-w-md`。元コード: [`GuestLayout.tsx:5-27`](../resources/js/Layouts/GuestLayout.tsx#L5-L27)。

ゲスト向け「このアプリについて」は白背景・`max-w-3xl`・縦スクロールを基調にし、44px以上のCTAとskip linkを持つ。元コード: [`Manual/AboutPage.tsx:102-179`](../resources/js/Pages/Manual/AboutPage.tsx#L102-L179)。

### 7.3 現状のレスポンシブ範囲

- カンバン: 1列 → `md` 2列 → `xl` 4列。元コード: [`KanbanBoard.tsx:50-57`](../resources/js/Components/MemberTasks/KanbanBoard.tsx#L50-L57)。
- テーブル: `overflow-x-auto`。
- Dialog footer: mobileは縦逆順、`sm`以上は横並び。元コード: [`ui/dialog.tsx:81-88`](../resources/js/Components/ui/dialog.tsx#L81-L88)。
- フォーム・サマリーカードは主に `sm` / `md` でgrid列数を増やす。
- Sidebarは手動開閉できるが、画面幅による自動drawer化、overlay、mobile専用メニューは未実装。設計資料の「モバイルでdrawer」と現コードは一致しない。

## 8. アクセシビリティで引き継ぐ点

現在すでに入っているもの:

- 共通Button/Input/Selectの青いfocus ring
- icon-only操作の `aria-label`（Sidebar開閉、Header、Infotip）
- ProjectDetailTabBarの `role="tablist"`, `role="tab"`, `aria-selected`
- StatusPillの色＋ドット＋文言
- TaskCardの `role="button"`, `tabIndex=0`, Enter/Space操作
- Dialog closeのscreen reader文言
- AboutPageのskip link、table caption、見出し構造

移植時に補うもの:

- `Tabs.tsx` に `tablist/tab/aria-selected/aria-controls` と矢印キー操作を追加
- `ViewToggle` に `aria-pressed` またはradiogroup semanticsを追加
- TaskCardは可能ならnative `<button>` / `<a>` 構造へ寄せる
- DnDと同等のkeyboard/touch操作を用意
- focus色は青で統一し、旧 `indigo-*` コンポーネントを残さない
- `KpiCard` は `cursor-pointer` だが `onClick` を受け取らないため、遷移させないならcursorを外し、遷移させるならLink/Buttonにする

## 9. そのままコピーしない箇所

### 9.1 CSS Variables設定の不一致

[`components.json:6-14`](../components.json#L6-L14) は `cssVariables: true` だが、[`app.css`](../resources/css/app.css) に `:root` トークンはない。実体はTailwind configと各コンポーネント内のHEX値である。新アプリでは次のどちらかへ統一する。

1. Tailwind configを正本とし、ハードコード色もすべてsemantic token化する。
2. 2.7のCSS Variablesを正本にし、Tailwindから参照する。

### 9.2 Tailwindのscan対象漏れ

[`tailwind.config.js:7-12`](../tailwind.config.js#L7-L12) は `resources/js/**/*.tsx` だけをscanする一方、セクション色クラスは `.ts` の [`sidebarNavTheme.ts`](../resources/js/lib/sidebarNavTheme.ts) にある。任意色クラスが生成されない可能性があるため、新アプリでは次のようにする。

```js
content: [
  './resources/views/**/*.blade.php',
  './resources/js/**/*.{js,ts,jsx,tsx}',
]
```

または、色をCSS Variables/静的classへ移し、動的class文字列をsafelistする。

### 9.3 新旧ボタンが混在

業務画面は `ui/button.tsx` だが、認証・旧プロフィールフォームには次のLaravel starter系部品が残る。

- [`PrimaryButton.tsx`](../resources/js/Components/PrimaryButton.tsx): gray/indigo系
- [`SecondaryButton.tsx`](../resources/js/Components/SecondaryButton.tsx): gray/indigo系
- [`DangerButton.tsx`](../resources/js/Components/DangerButton.tsx): Tailwind red系
- [`TextInput.tsx`](../resources/js/Components/TextInput.tsx), [`Checkbox.tsx`](../resources/js/Components/Checkbox.tsx): indigo focus

新アプリではこれらをコピーせず、`ui/Button`, `ui/Input` と統一したcheckboxへ置換する。

### 9.4 モーダルが4方式

- 推奨: Radix [`ui/dialog.tsx`](../resources/js/Components/ui/dialog.tsx)
- 独自overlay: [`Projects/Create.tsx:417-497`](../resources/js/Pages/Projects/Create.tsx#L417-L497), [`Projects/Edit.tsx:445-517`](../resources/js/Pages/Projects/Edit.tsx#L445-L517)
- Headless UI: [`Modal.tsx`](../resources/js/Components/Modal.tsx)
- browser confirm: [`ProjectTaskDialog.tsx:333-343`](../resources/js/Components/Modals/ProjectTaskDialog.tsx#L333-L343)

見た目、focus trap、Esc、外側クリック、busy時close可否を揃えるため、移植時はRadix Dialogへ統一する。

### 9.5 Buttonの意味と見た目

- `default` と `destructive` は現在完全に同じ赤ボタン。削除と通常CTAを見分けたい場合は `destructive` を濃い赤/警告面へ変更する。
- 補助操作は設計上 `neutral` が基準だが、既存画面には `outline` / `secondary` のキャンセルもある。新アプリでは「戻る・キャンセル=`neutral`」に揃える。
- `Button` はdisabled外観を持つが、`aria-busy`、spinner、処理中文言は共通化されていない。

### 9.6 色ロジックの重複

予算帯、タスク種類、タスク状態、期限警告、アバターグラデーションが複数ファイルに重複している。新アプリでは `theme/tokens.ts` と `domain/presentation.ts` のように分離し、コンポーネントは共通定義だけを読む。

### 9.7 現在使われていないUI

[`routes/web.php:15-18`](../routes/web.php#L15-L18) の `/` はDashboardまたはAboutへredirectするため、Laravel初期画面の [`Pages/Welcome.tsx`](../resources/js/Pages/Welcome.tsx) は現行導線では使われていない。`#FF2D20` やdark mode用クラスを含むが、移植対象から除外する。

### 9.8 パッケージ構成

現状は `tailwindcss ^3.2.1` と未使用の `@tailwindcss/vite ^4.0.0` が同居し、Vite設定ではTailwind Vite pluginを登録していない。新アプリではTailwind 3か4のどちらかに揃え、その版の設定形式に合わせてトークンを移す。

## 10. 推奨する移植手順

1. 新アプリ側で色トークン、フォント、角丸、shadow、focus ringを定義する。
2. `cn()`、`Button`、`Input`、`Dialog`、`Select`、`Badge`、`Table`、`Infotip` を移す。
3. `StatusPill` と `sidebarNavTheme` の色を共通semantic tokenへ統合する。
4. Header / Sidebar / Layoutを移し、Inertia `Link`, `router`, `route()` を新アプリのrouter/APIへ置換する。
5. 承認ステッパー、案件詳細タブ、タスクカード、カンバンを必要に応じて移す。
6. `processing` / `disabled` / `aria-busy` / エラー表示を共通化する。
7. Radix Dialogへ確認UIを統一し、browser alert/confirmを置換する。
8. 360px、768px、1024px、1440pxでレスポンシブ表示を確認する。
9. keyboardのみでButton、Tab、Dialog、Tooltip、TaskCardを操作できることを確認する。
10. 色覚に依存せず、ラベル・アイコン・文言でも状態を識別できることを確認する。

## 11. 元ファイル索引

### 基盤

- [`tailwind.config.js`](../tailwind.config.js): 色、font family、pulse animation、content scan
- [`resources/css/app.css`](../resources/css/app.css): font import、sidebar scrollbar
- [`resources/js/lib/utils.ts`](../resources/js/lib/utils.ts): `cn()`
- [`components.json`](../components.json): shadcn/ui設定
- [`package.json`](../package.json): UI依存パッケージ

### 全体レイアウト

- [`AuthenticatedLayout.tsx`](../resources/js/Layouts/AuthenticatedLayout.tsx)
- [`GuestLayout.tsx`](../resources/js/Layouts/GuestLayout.tsx)
- [`Sidebar.tsx`](../resources/js/Components/Layout/Sidebar.tsx)
- [`Header.tsx`](../resources/js/Components/Layout/Header.tsx)
- [`Breadcrumb.tsx`](../resources/js/Components/Layout/Breadcrumb.tsx)
- [`ApplicationLogo.tsx`](../resources/js/Components/ApplicationLogo.tsx)
- [`sidebarNavTheme.ts`](../resources/js/lib/sidebarNavTheme.ts)

### UI primitive

- [`ui/button.tsx`](../resources/js/Components/ui/button.tsx)
- [`ui/input.tsx`](../resources/js/Components/ui/input.tsx)
- [`ui/select.tsx`](../resources/js/Components/ui/select.tsx)
- [`ui/dialog.tsx`](../resources/js/Components/ui/dialog.tsx)
- [`ui/badge.tsx`](../resources/js/Components/ui/badge.tsx)
- [`ui/table.tsx`](../resources/js/Components/ui/table.tsx)
- [`ui/infotip.tsx`](../resources/js/Components/ui/infotip.tsx)

### 業務コンポーネント

- [`StatusPill.tsx`](../resources/js/Components/StatusPill.tsx)
- [`Tabs.tsx`](../resources/js/Components/Tabs.tsx)
- [`ProjectDetailTabBar.tsx`](../resources/js/Components/Projects/ProjectDetailTabBar.tsx)
- [`ApprovalStepperMini.tsx`](../resources/js/Components/Approval/ApprovalStepperMini.tsx)
- [`ApprovalStepperFull.tsx`](../resources/js/Components/Approval/ApprovalStepperFull.tsx)
- [`ProjectAttachmentField.tsx`](../resources/js/Components/Form/ProjectAttachmentField.tsx)
- [`TaskFilterBar.tsx`](../resources/js/Components/ProjectTasks/TaskFilterBar.tsx)
- [`ViewToggle.tsx`](../resources/js/Components/MemberTasks/ViewToggle.tsx)
- [`TaskCard.tsx`](../resources/js/Components/MemberTasks/TaskCard.tsx)
- [`KanbanBoard.tsx`](../resources/js/Components/MemberTasks/KanbanBoard.tsx)
- [`MemberMatrix.tsx`](../resources/js/Components/MemberTasks/MemberMatrix.tsx)
- [`ApprovalDialog.tsx`](../resources/js/Components/Modals/ApprovalDialog.tsx)
- [`ProjectTaskDialog.tsx`](../resources/js/Components/Modals/ProjectTaskDialog.tsx)
- [`BudgetActualDialog.tsx`](../resources/js/Components/Modals/BudgetActualDialog.tsx)
- [`EmptyState.tsx`](../resources/js/Components/EmptyState.tsx)
- [`Dashboard/*`](../resources/js/Components/Dashboard)

### 代表的な利用画面

- [`Projects/Create.tsx`](../resources/js/Pages/Projects/Create.tsx): フォーム、添付、下書き、申請確認
- [`Projects/Edit.tsx`](../resources/js/Pages/Projects/Edit.tsx): 更新、再申請、下書き削除
- [`Projects/Index.tsx`](../resources/js/Pages/Projects/Index.tsx): タブ、filter、sort、一覧、予算帯
- [`Projects/Show.tsx`](../resources/js/Pages/Projects/Show.tsx): 詳細タブ、承認、タスク、予算
- [`MemberTasks/Index.tsx`](../resources/js/Pages/MemberTasks/Index.tsx): view切替、filter、DnD、matrix
- [`Notifications/Index.tsx`](../resources/js/Pages/Notifications/Index.tsx): 通知種別、未読、既読操作
- [`Dashboard/Index.tsx`](../resources/js/Pages/Dashboard/Index.tsx): KPI、chart、budget alert
- [`Auth/Login.tsx`](../resources/js/Pages/Auth/Login.tsx): 旧ボタン/入力と現ブランド面の混在例

## 12. 補助設計資料

実装を理解する補助として使えるが、差異がある場合は上記コードを優先する。

- [`materials/Design/design_system.md`](../materials/Design/design_system.md): ブランド原則、意図した色・モーション・レイアウト
- [`materials/Design/components_spec.md`](../materials/Design/components_spec.md): コンポーネントの役割、Props、画面別利用方針
- [`materials/manual/images`](../materials/manual/images): 実画面キャプチャ

