# Cursor追加指示書 — サイドバー モダン化

> 前回指示書（`cursor_sidebar_redesign.md`）の変更に追加する内容。
> 前回指示書の変更が適用済みであることを確認してから着手すること。

---

## 変更概要

以下の3点を変更し、Notion・Linear・Claude.ai のようなモダンなサイドバーに仕上げる。

1. **アクティブスタイル変更** — 左ボーダー方式 → pill型（角丸背景）
2. **ドット削除・アイコン追加** — `・`（小ドット）を lucide-react アイコンに置き換え
3. **セクションラベルにラインを追加** — ラベルテキストの右側に薄い横線を伸ばす

---

## 1. アクティブスタイル：pill型へ変更

### 変更前（左ボーダー方式）
```tsx
// アクティブ時
className="bg-[#EAF9FF] border-l-[2.5px] border-[#01CFFF] text-[#006d8f] rounded-r-md font-medium"
```

### 変更後（pill型）
左ボーダーと `rounded-r-md` を削除し、全辺に角丸をつけた背景色ブロックにする。
マージンも両側に統一する（`mx-2` 程度）。

```tsx
// セクションごとのアクティブクラス定義
const activeClass = {
  approval: "bg-[#E0F7FF] text-[#0369a1] font-medium",
  dev:      "bg-[#EFF6FF] text-[#1D4ED8] font-medium",
  budget:   "bg-[#F5F3FF] text-[#6D28D9] font-medium",
}

// アクティブアイコン背景色
const activeIconClass = {
  approval: "bg-[#BAF1FF] text-[#0369a1]",
  dev:      "bg-[#DBEAFE] text-[#1D4ED8]",
  budget:   "bg-[#EDE9FE] text-[#6D28D9]",
}

// 非アクティブのアイコン背景色（共通）
const inactiveIconClass = "bg-gray-100 text-gray-400"
```

SidebarLink の `active` 判定は既存の実装（`usePage()` によるルート比較）をそのまま使う。
`border-l-*` と `rounded-r-*` のクラスは削除する。
アクティブ時・非アクティブ時ともに `rounded-lg mx-2` を適用する。

---

## 2. ドット削除・lucide-react アイコンに置き換え

### インポート
```tsx
import {
  FilePlus,       // 新規申請
  Clock,          // 承認待ち一覧
  List,           // 申請状況一覧
  LayoutList,     // 開発進捗一覧
  CheckSquare,    // タスク一覧
  LayoutDashboard,// ダッシュボード
  Wallet,         // 予算状況一覧
  Bell,           // 通知
  BookOpen,       // マニュアル
  User,           // プロフィール
} from "lucide-react"
```

### SidebarLink のアイコン表示
各リンクの左側に、小さなアイコンを角丸の背景ボックスに収めて表示する。

```tsx
// アイコンコンテナ（アクティブ時はセクション色、非アクティブはグレー）
<span className={cn(
  "flex items-center justify-center w-[18px] h-[18px] rounded-[4px] flex-shrink-0",
  active ? activeIconClass[variant] : inactiveIconClass
)}>
  <Icon size={11} />
</span>
```

ドット（`w-1.5 h-1.5 rounded-full` 等）はすべて削除する。

---

## 3. セクションラベルの右側にカラーラインを追加

セクション見出し（`SidebarSection`）のラベルテキスト右側に、
セクションカラーの薄いトーンで横線を引く。

```tsx
// SidebarSection の render
<div className="flex items-center gap-2 px-3 pt-4 pb-1">
  <span className={cn("text-[9px] font-bold tracking-[0.07em] uppercase whitespace-nowrap", labelColor)}>
    {label}
  </span>
  <div className={cn("flex-1 h-px", lineColor)} />
</div>

// セクションごとのカラー定義
const sectionStyle = {
  approval: { labelColor: "text-[#0099c4]", lineColor: "bg-[#BAF1FF]" },
  dev:      { labelColor: "text-[#106EBE]", lineColor: "bg-[#BFDBFE]" },
  budget:   { labelColor: "text-[#7c3aed]", lineColor: "bg-[#DDD6FE]" },
}
```

---

## 4. 各メニュー項目とアイコンの対応表

| セクション | メニュー項目 | アイコン | URL |
|---|---|---|---|
| 申請・承認 | 新規申請 | `FilePlus` | `/projects/create` |
| 申請・承認 | 承認待ち一覧 | `Clock` | `/projects?tab=approval&filter=pending` |
| 申請・承認 | 申請状況一覧 | `List` | `/projects?tab=approval` |
| 開発管理 | 開発進捗一覧 | `LayoutList` | `/projects?tab=dev` |
| 開発管理 | タスク一覧 | `CheckSquare` | `/member-tasks` |
| 予算管理 | ダッシュボード | `LayoutDashboard` | `/dashboard` |
| 予算管理 | 予算状況一覧 | `Wallet` | `/projects?tab=budget` |
| 下部共通 | 通知 | `Bell` | `/notifications` |
| 下部共通 | マニュアル | `BookOpen` | `/manual` |
| 下部共通 | プロフィール | `User` | `/profile` |

---

## 5. SidebarLink の完成形イメージ（参考）

```tsx
<Link
  href={href}
  className={cn(
    "flex items-center gap-2 px-3 py-[7px] rounded-lg mx-2 text-[11px] transition-colors duration-150",
    active
      ? activeClass[variant]
      : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
  )}
>
  <span className={cn(
    "flex items-center justify-center w-[18px] h-[18px] rounded-[4px] flex-shrink-0",
    active ? activeIconClass[variant] : "bg-gray-100 text-gray-400"
  )}>
    <Icon size={11} />
  </span>
  <span>{label}</span>
  {badge && (
    <span className="ml-auto bg-[#E60013] text-white text-[9px] rounded-full px-[5px] py-px">
      {badge}
    </span>
  )}
</Link>
```

---

## 変更しないもの

- セクション名・メニュー項目の表示テキスト（前回指示書で確定済み）
- セクションのカラーコード（cyan / blue / purple の割り当て）
- アクティブ判定ロジック（`usePage()` による現在ルート比較）
- ユーザーカード・通知バッジの赤色（`#E60013`）
- サイドバーの幅（`w-64`）
- メインコンテンツ側のスタイル（変更不要）

---

## 実装後の確認ポイント

- [ ] 3セクションすべてでアクティブ時にpill型の背景が表示される
- [ ] 非アクティブ項目はグレー文字・グレーアイコン背景
- [ ] ホバー時に `bg-gray-100` がかかる
- [ ] セクションラベルの右にカラーラインが表示される
- [ ] ドット（`rounded-full` の小さな点）が残っていないこと
- [ ] 左ボーダー（`border-l-*`）が残っていないこと
