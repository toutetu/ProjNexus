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
- 予算額・進捗バー・リンク: 黄ではなく `--brand-blue`
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
- 通常: `var(--brand-blue)`
- 95% 以上: `#16A34A`（緑、完了間近の先行フィードバック）
- 進捗 90% 以上の行は、タイトル横に `.pill-completing`（紫）バッジを表示

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
**表示コンテキスト**:
- 背景に S-04 の「タスクタブ」を dimmed + blur で表示し、モーダル文脈を保つ
- モーダル本体は中央配置 `max-w-2xl`
- 基本は編集モード基準で作り、作成モードは差分制御で対応

> **タスク管理方針**：**Backlog 風の 4 ステータス**（`open / in_progress / resolved / closed`）を DB スキーマで採用。  
> - **課題1**：3値運用（`open / in_progress / closed`）。`resolved` チップは非表示。申請者が自分で完了まで遷移  
> - **課題2**：4値運用。申請者は `in_progress → resolved`（完了報告）、確認者が `resolved → closed`（確認OK）  
> 詳細は `mockups/s10_policy.md` および `doc/Design/er_diagram.md §tasks.status` を参照。

**Props（推奨）**:
```ts
type TaskType = 'task' | 'feature' | 'improvement' | 'bug';
type TaskPriority = 'high' | 'medium' | 'low';
// DB スキーマは 4 値で設計。課題1 では 'resolved' を使わない
type TaskStatus = 'open' | 'in_progress' | 'resolved' | 'closed';

interface TaskFormDialogProps {
  open: boolean;
  mode: 'create' | 'edit';
  onClose: () => void;
  project: { id: number; code: string; title: string };
  task?: Task; // edit時は必須
  members: { id: number; name: string; avatarUrl?: string }[];
  onSave: (payload: TaskFormPayload) => void;
  onDelete?: (taskId: number) => void; // edit時のみ
  // 課題1: 常に false。課題2 で現在ユーザーが確認者の場合に true
  canReview?: boolean;
  // 課題1: 'challenge1' | 課題2: 'challenge2'。UI のチップ表示制御に利用
  statusMode?: 'challenge1' | 'challenge2';
}
```

**フィールド仕様**:
- タイトル: 全幅 input（必須）
- 種類: `タスク / 機能追加 / 改善 / バグ`（chip selector）
- 優先度: `高 / 中 / 低`（chip selector）
- ステータス:
  - **課題1**: `未着手 / 進行中 / 完了`（3チップ。内部値 `open / in_progress / closed`）
  - **課題2**: `未着手 / 進行中 / 確認待ち / 完了`（4チップ。内部値 `open / in_progress / resolved / closed`）
  - 課題2 の `closed` チップは `canReview=true` の時だけ押下可能（作業者は `resolved` までしか遷移できない）
- 担当者: アバター付き select
- 期日: date input（補助表示として「あとN日」を表示）
- 進捗: slider + 数値（`ステータス = 進行中` の時だけ表示。`resolved / closed` は自動で 100%）
- 説明: textarea（3行）
- コメント: 既存コメント + 投稿欄（モーダル下部）
- 変更履歴: 折りたたみ表示（初期は閉じる）

**フッターアクション**:
- 左: 削除（編集モードのみ、赤アウトライン）
- 右: キャンセル / 保存

**作成モードとの差分**:
- ヘッダー: `タスクを編集` -> `タスクを作成`
- 削除ボタン: 非表示
- 進捗: 初期値0%、かつ `未着手` 時は非表示
- コメント・変更履歴: セクションごと非表示

**実装メモ（判断理由）**:
- S-10 は操作完結性を優先し、コメント入力を同一モーダル内に置く（別画面遷移しない）
- chip selector で種類/優先度/ステータスを即時切替できるようにする
- 条件表示（進捗、削除、履歴）を mode/status で統一制御して複雑化を防ぐ
- **ステータス DB を 4 値で設計**することで、課題2 レビュー工程追加時に migration なしで対応可能（Enum 値は既に存在、UI 切替だけで済む）
- 課題2 のレビュー機能は `canReview` フラグと `statusMode` プロップで注入。ロジックの中核は Controller / Policy 側で担保

### BudgetActualDialog（S-11）
**役割**: 予算実績入力モーダル。
**配置**: `resources/js/Components/Modals/BudgetActualDialog.tsx`
**使用モック**: S-11
**表示コンテキスト**:
- 背景に S-04 風画面（予算タブ文脈）を dimmed で表示
- モーダル本体は中央配置 `max-w-2xl`
- 主担当のみ操作可。ヘッダー付近に権限バッジを表示して明示

> **実装方式の切替**：課題1（PoC・実装対象）は **上書き方式**、課題2（将来拡張）は **追加方式**。  
> 詳細は `mockups/s11_policy.md` および `doc/Design/er_diagram.md §予算管理` を参照。

#### 課題1 版 Props（上書き方式・PoC 実装対象）

```ts
interface BudgetActualDialogProps {
  open: boolean;
  onClose: () => void;
  project: {
    id: number;
    code: string;            // 例: 'PRJ-2026-0042'
    title: string;
    budgetAmount: number;    // 確定予算
    actualAmount: number;    // 現在実績（この値を上書き）
    primaryAssignee: {
      id: number;
      name: string;
      avatarUrl?: string;
    };
  };
  canEdit: boolean;          // 主担当のみ true
  onSubmit: (payload: {
    actualAmount: number;    // 新しい実績額（累計）
  }) => void;
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
- 背景: `--brand-logo-accent`（`#EDB100`）
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
- 2026-04-18: 各画面方針書（`mockups/s0x_policy.md`）との整合確認を実施。S-03b の進捗フィルタ区分を `未着手/進行中/完了間近(90%+)/完了` に改訂し、進捗バー配色ルール（95%以上で緑、90%以上で完了間近バッジ）を追記。
