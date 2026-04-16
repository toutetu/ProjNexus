# 共通コンポーネント仕様書

> HTMLモックから抽出した共通UI部品の棚卸しと、React(Inertia + TypeScript + shadcn/ui)への変換仕様。
> **Cursor で実装する前にこのファイルを読み、ここに定義された部品を先に作成してから Pages を組み立てること。**
> 新しい共通部品を発見した場合は、このファイルを更新してから実装する。

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
**役割**: 3セクション構造のダークナビゲーション。
**配置**: `resources/js/Components/Layout/Sidebar.tsx`
**使用モック**: s02, s03a, s05 すべて
**Props**: 基本なし（Inertia の `usePage()` で現在ルート取得してアクティブ判定）
**内部構造**:
- ロゴ（開発管理アプリ + グラデーションJ）
- セクション「申請・承認」: 新規申請 / 承認待ち一覧(バッジ) / 案件一覧
- セクション「開発管理」: 案件一覧 / タスク一覧(dim表示・課題2ラベル)
- セクション「予算管理」: 案件一覧 / 予算実績入力
- セクション下部: 通知(バッジ) / プロフィール
- 最下部: ユーザーカード（アバター + 氏名 + ロール + ログアウトアイコン）

**サブ部品**: `<SidebarSection label>`, `<SidebarLink href icon badge active>`

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
**使用モック**: S-04（次回作成予定）
**Props**:
```ts
interface ApprovalStepperFullProps {
  status: ProjectStatus;
  approvals: Approval[];  // 承認履歴（誰が・いつ）
  rejectedAt?: 'dept' | 'hq';
}
```
**違い（Miniとの）**: 各ステップに担当者名・承認日時を表示、進行中はパルスアニメ、`approved` の時は折り畳んで「✓ 承認済（履歴を見る ▼）」バッジに切り替わる

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
**役割**: 案件一覧テーブル。tab props で列セットを切り替える。
**配置**: `resources/js/Components/Projects/ProjectTable.tsx`
**使用モック**: s03a（申請タブ）、今後 s03b/s03c
**Props**:
```ts
interface ProjectTableProps {
  tab: 'approval' | 'dev' | 'budget';
  projects: Project[];
  onRowClick: (id: number) => void;
}
```
**内部**: tabに応じて列定義を切り替え。列定義は `const approvalColumns = [...]; const devColumns = [...]; const budgetColumns = [...];` のように同ファイル内に持つ。

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

### Input / Textarea / Select
shadcn/ui の部品をそのまま使う。**プロジェクト固有のラッパーは作らない**（直接 shadcn/ui の `Input` 等を import）。スタイル調整が必要なら shadcn/ui の components.json 側で一括設定。

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
**配置**: `resources/js/Components/Modals/TaskFormDialog.tsx`
**使用モック**: S-10（次回以降）

### BudgetActualDialog（S-11）
**役割**: 予算実績入力モーダル。
**配置**: `resources/js/Components/Modals/BudgetActualDialog.tsx`
**使用モック**: S-11（次回以降）

---

## 6. ユーティリティ・小物

### KbdBadge
`⌘K` などのキーボードショートカット表示。`mono` フォント + 薄いボーダー。
→ Header 内で利用。別ファイルに切り出す（後で他でも使う可能性あり）。

### UserAvatar
イニシャル表示のアバター。氏名から1文字取ってグラデーション背景。
→ Sidebar下部ユーザーカード、タスク担当者表示、コメント欄 で共通利用。
**Props**: `name: string; size?: 'sm' | 'md' | 'lg'; gradientVariant?: number`

### ProgressBar
消費率・進捗率バー。70%超で黄、90%超で赤の自動色分け。
**Props**: `value: number; max?: number; thresholds?: { warn: number; danger: number }; showLabel?: boolean`
→ S-02 予算アラート, S-03c 案件一覧予算タブ, S-04 予算サマリー, S-11 入力プレビュー で共通利用。

### EmptyState
データ0件時の表示。`icon / title / description / action` の定型。
**Props**: `icon: LucideIcon; title: string; description?: string; action?: ReactNode`
→ 全テーブル・リスト画面で共通利用。

### Toast（sonner）
shadcn/ui 経由で `sonner` を導入し、成功・エラー通知に使う。プロジェクト内ラッパー不要。

---

## Cursor への指示テンプレ

モックをReactに起こすときは、このファイルを先に読ませた上で、以下のような指示で進める:

> **[モック変換指示の雛形]**
>
> `mockups/s05_project_create.html` を `resources/js/Pages/Projects/Create.tsx` として実装してください。
>
> **作業順序**:
> 1. まず `doc/Design/components_spec.md` を読んで、使用する共通部品をリストアップ
> 2. 未実装の共通部品（`ApprovalFlowGuide`, `AmountInput`, `FieldLabel` など）があれば先に `Components/` 配下に作成
> 3. Create.tsx は共通部品を組み立てるだけの薄い実装にする
> 4. Tailwind クラスの直書きは最小限に。繰り返すパターンは部品化する
> 5. 実装後、`doc/Design/components_spec.md` の「使用モック」欄にこのページを追記

---

## 部品化しないもの（過剰分離を避ける）

- ページタイトル（`<h1>`）とサブタイトル — 画面ごとに違うので各 Page で直接書く
- 「一覧に戻る」リンクなどの単発要素
- 画面固有のレイアウト（例: S-05 の下書き復元ヒント）

**判断基準**: 「2つ以上のPagesで同じパターンを書きそうか？」Yes なら共通化、No ならPageにそのまま書く。

---

## 更新ログ

- 2026-04-16: s02/s03a/s05 モックから初版を作成。S-04/S-07/S-08/S-10/S-11/S-12/S-13 は今後のモック作成時に追記。
