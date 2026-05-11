# Cursor指示書 — サイドバー デザイン変更

## 変更対象ファイル

- `resources/js/Components/Layout/Sidebar.tsx`
- `resources/js/Components/Layout/Sidebar.tsx` 内の `SidebarSection` / `SidebarLink` サブコンポーネント

---

## 変更概要

現在のサイドバーはダーク背景（`#212429`）だが、**ライト背景（白）に変更**する。
あわせて、3セクションにそれぞれのアクセントカラーを割り当て、
「申請フローが進むほど色が深くなる」というデザイン思想（`design_system.md` §2参照）をナビゲーションに反映する。

---

## カラー定義（`design_system.md` の既存トークンを使用）

| セクション | セクションラベル色 | アクティブ左ボーダー | アクティブ背景 | アクティブ文字色 | 非アクティブdot色 |
|---|---|---|---|---|---|
| 申請・承認 | `#0099c4` | `#01CFFF`（`--brand-cyan`） | `#EAF9FF` | `#006d8f` | `#99e9ff` |
| 開発管理   | `#106EBE`（`--brand-blue`） | `#106EBE` | `#EBF4FF` | `#0a4d8a` | `#a0c9ee` |
| 予算管理   | `#7c3aed`（`--brand-purple`寄り） | `#6D28D9`（`--brand-purple`） | `#F3EFFE` | `#4c1d95` | `#c4b0f0` |

---

## 具体的な変更指示

### 1. サイドバー全体の背景・テキスト色

```
変更前: bg-[#212429]（ダーク）、テキスト white
変更後: bg-white border-r border-[#DEE2E6]、テキスト #6C757D（非アクティブ） / #212429（アクティブ）
```

### 2. SidebarSection のセクションラベル

各セクションに `variant` prop（`'approval' | 'dev' | 'budget'`）が既にあるので、
それぞれのカラーをセクションラベル（`<span>` や `<p>` の文字色）に適用する。

```
申請・承認ラベル → color: #0099c4
開発管理ラベル   → color: #106EBE
予算管理ラベル   → color: #7c3aed
```

ラベルは uppercase / text-xs / font-semibold / tracking-widest のスタイルを維持する。

### 3. SidebarLink の通常状態（非アクティブ）

```
テキスト色: text-[#6C757D]
左に小さなdot（w-1.5 h-1.5 rounded-full）をアイコンの代わりまたは併用で表示
dotの色はセクションのアクセントカラーの薄いトーン（上記テーブルの「非アクティブdot色」）
hover: bg-gray-100
```

### 4. SidebarLink のアクティブ状態

```
左ボーダー: border-l-[2.5px] border-[セクションのアクティブ左ボーダー色]
背景:       bg-[セクションのアクティブ背景色]
テキスト色: text-[セクションのアクティブ文字色] font-medium
border-radius: 右側のみ rounded-r-md（左はボーダーに合わせてフラット）
dotの色: セクションのアクティブ左ボーダー色（濃いトーン）
```

### 5. メニュー項目の表示名（既に components_spec.md に記載済み）

下記の通り表示名が変わっていない場合は合わせて修正する。

```
申請・承認セクション: 「案件一覧」→「申請状況一覧」  (/projects?tab=approval)
開発管理セクション:   「案件一覧」→「開発進捗一覧」  (/projects?tab=dev)
予算管理セクション:   「案件一覧」→「予算状況一覧」  (/projects?tab=budget)
```

### 6. ロゴエリア

```
変更前: 白文字
変更後: ProjNexus テキスト → #212429（font-semibold）
        サブテキスト「開発管理アプリ」→ #6C757D
        ロゴアイコン背景: #E60013（ブランドレッド）維持
        下部ボーダー: border-b border-[#DEE2E6]
```

### 7. 下部ユーティリティ（通知・マニュアル・プロフィール）

```
セクションとの区切り: border-t border-[#DEE2E6]
アイテムテキスト色: text-[#6C757D]
hover: bg-gray-100
通知バッジ: bg-[#E60013] text-white（変更なし）
```

### 8. ユーザーカード（最下部）

```
ボーダー: border-t border-[#DEE2E6]
アバター背景: #E60013（変更なし）
氏名: text-[#212429] font-medium
ロール/部門: text-[#6C757D]
```

---

## 変更しないもの

- サイドバーの幅（`w-64`）
- セクション構造・リンク先URL・アクティブ判定ロジック（`usePage()` による現在ルート取得）
- 通知バッジの赤色（`#E60013`）
- ロゴアイコンの赤色（`#E60013`）
- `design_system.md` のカラートークン定義そのもの

---

## 実装前の確認事項

1. `resources/js/Components/Layout/Sidebar.tsx` を開き、現在の `bg-[#212429]` 等のクラスを確認してから変更する
2. `SidebarSection` の `variant` prop が既に存在するか確認し、なければ追加する
3. 変更後、ローカルで3セクションすべてのアクティブ状態・非アクティブ状態を目視確認する

---

## 参照ドキュメント

- `doc/Design/design_system.md` — カラートークン定義
- `doc/Design/components_spec.md` §1 — Sidebar / SidebarSection / SidebarLink の仕様
- `doc/Design/AI.md` §5 — ナビゲーション・画面構成
