# デザインシステム - 開発管理統合アプリケーション PoC

> ブランドカラーをベースに、業務アプリとして使いやすいデザインルールを定義する。
> V0プロンプト・Cursor実装の両方で参照する共通仕様。

---

## 1. デザインの基本方針

- **モダン**: shadcn/ui + Tailwind CSS で2025年水準のUI
- **直感的**: クリックできる要素は明確に、ステータスは色で一目で
- **業務アプリらしい安心感**: 装飾しすぎず、情報密度を保つ
- **コーポレートブランドの統一**: ブランドレッドをアクセント、ロゴカラーをグラデーション/装飾に活用

---

## 2. カラートークン（CSS Variables / Tailwind 設定）

### 2-1. ベースカラー（コーポレート由来）

```css
:root {
  /* Corporate */
  --brand-red:        #E60013;  /* CTA・最重要アクション */
  --brand-dark:       #212429;  /* 見出し・本文濃 */
  --brand-gray-light: #F8F9FA;  /* ページ背景 */
  --brand-gray-muted: #6C757D;  /* 補助テキスト */
  --brand-border:     #DEE2E6;  /* 区切り線・カード枠 */
  --brand-white:      #FFFFFF;  /* カード背景 */

  /* Logo gradient (ヒーロー・装飾用) */
  --brand-accent:     #EDB100;  /* イエローアクセント */
  --brand-cyan:       #01CFFF;  /* ライトブルー */
  --brand-blue:       #106EBE;  /* メインブルー（リンク・情報系） */
  --brand-purple:     #6D28D9;  /* ディープパープル */
}
```

### 2-2. ステータス色（業務アプリ用に追加定義）

設計の意図：**赤はCTAと却下に使うので、却下はアイコン+文字で明確化**。承認段階の進行はロゴの cyan→blue→purple グラデーションを活用して視覚的に「進んでいる」感を出す。

```css
:root {
  /* Status colors */
  --status-draft:        #6C757D;  /* グレー（下書き） */
  --status-pending-dept: #01CFFF;  /* ライトブルー（部門承認待ち） */
  --status-pending-hq:   #106EBE;  /* メインブルー（本部承認待ち） */
  --status-approved:     #16A34A;  /* グリーン（承認済） */
  --status-rejected:     #E60013;  /* ブランドレッド（却下） */

  /* Budget warning */
  --warn-safe:    #16A34A;  /* 〜50% */
  --warn-medium:  #EDB100;  /* 50〜70% */
  --warn-high:    #E60013;  /* 70%超 */
}
```

### 2-3. Tailwind 拡張設定（参考）

`tailwind.config.js` でこれらをそのまま使えるよう拡張：

```js
theme: {
  extend: {
    colors: {
      brand: {
        red:    '#E60013',
        dark:   '#212429',
        bg:     '#F8F9FA',
        muted:  '#6C757D',
        border: '#DEE2E6',
        accent: '#EDB100',
        cyan:   '#01CFFF',
        blue:   '#106EBE',
        purple: '#6D28D9',
      },
      status: {
        draft:        '#6C757D',
        'pending-dept': '#01CFFF',
        'pending-hq': '#106EBE',
        approved:     '#16A34A',
        rejected:     '#E60013',
      },
    },
  },
}
```

---

## 3. タイポグラフィ

| 用途 | フォント | サイズ | ウェイト | 色 |
|------|---------|-------|---------|-----|
| ページタイトル (h1) | Noto Sans JP | text-2xl (24px) | 700 | brand-dark |
| セクション見出し (h2) | Noto Sans JP | text-xl (20px) | 600 | brand-dark |
| カードタイトル (h3) | Noto Sans JP | text-lg (18px) | 600 | brand-dark |
| 本文 | Noto Sans JP | text-base (16px) | 400 | brand-dark |
| 補助情報・ラベル | Noto Sans JP | text-sm (14px) | 400 | brand-muted |
| 数値・コード | Roboto Mono | text-base | 500 | brand-dark |
| 英数字（汎用） | Roboto / Inter | - | - | - |

```html
<!-- Google Fonts -->
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;600;700&family=Roboto:wght@400;500;700&display=swap" rel="stylesheet">
```

---

## 4. レイアウト

### 4-1. 全体構造

```
┌─────────────────────────────────────────────┐
│ ヘッダー (h-14, 白背景, border-bottom)        │
├──────────┬──────────────────────────────────┤
│          │                                  │
│ サイドバー │  メインコンテンツ                  │
│ (w-64)   │  (max-w-7xl, p-6)                │
│          │                                  │
│ brand-dark │  brand-bg                          │
│ 背景     │  背景                             │
│          │                                  │
└──────────┴──────────────────────────────────┘
```

- **ヘッダー**: 左にロゴ、右にユーザーアバター + 通知ベル
- **サイドバー**: ダーク背景（brand-dark）に白文字のナビ。アクティブ項目は左に brand-red の縦バー
- **メインコンテンツ**: 最大幅 max-w-7xl、padding p-6
- **モバイル/タブレット**: サイドバーをドロワー化（ハンバーガーメニュー）

### 4-2. 余白ルール

- セクション間: `space-y-6`
- カード内: `p-4` または `p-6`
- フォーム要素間: `space-y-4`

---

## 5. コンポーネント仕様（shadcn/ui ベース）

### 5-1. ボタン

| 種類 | 色 | 用途 | 例 |
|------|----|------|---|
| Primary | bg-brand-red, text-white | 主要アクション（申請・承認・保存） | 「申請する」「承認する」 |
| Secondary | bg-white, border, text-brand-dark | 副次アクション | 「キャンセル」「戻る」 |
| Destructive | bg-brand-red, text-white | 危険操作（却下・削除） | 「却下する」 |
| Ghost | text-brand-blue, hover:bg-brand-bg | リンク的操作 | 「詳細を見る」 |
| Outline | border-brand-red, text-brand-red | 強調したい副アクション | 「再申請」 |

**全ボタン共通の「押せる感」**:
- `rounded-md`（角丸 6px）
- `shadow-sm hover:shadow-md`（ホバーで影が強く）
- `transition-all duration-150`
- `active:scale-95`（押下時に少し縮む）
- `disabled:opacity-50 disabled:cursor-not-allowed`
- カーソルは常に `cursor-pointer`

### 5-2. ステータスバッジ

```tsx
// 色 + アイコン + ラベル の3点セットで色覚特性にも配慮
draft       → グレー丸 + "下書き"
pending_dept → シアン丸 + "部門承認待ち"
pending_hq  → ブルー丸 + "本部承認待ち"
approved    → グリーン✓ + "承認済"
rejected    → レッド✕ + "却下"
```

形：`rounded-full px-3 py-1 text-xs font-medium`

### 5-3. 承認ステッパーUI（課題2）

案件詳細画面のヘッダー直下に配置。横長の進捗バー：

```
[申請] ━━━ [部門承認] ━━━ [本部承認] ━━━ [承認済]
 ●完了      ●完了         ◐進行中       ○未到達
 cyan       cyan          blue          gray
```

- 完了: 塗りつぶし円 + チェックマーク
- 進行中: パルスアニメーション付き円
- 未到達: 枠線のみ
- 承認後は折りたたんで「✓ 承認済（履歴を見る）」バッジに変化

### 5-4. カード

- `bg-white rounded-lg border border-brand-border shadow-sm`
- クリック可能なカードは `hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer`

### 5-5. テーブル（案件一覧・タスク一覧）

- ヘッダー: `bg-brand-bg text-brand-muted text-sm font-medium`
- 行: `hover:bg-brand-bg/50 cursor-pointer transition-colors`
- 区切り線: `divide-y divide-brand-border`
- 重要列（ステータス・予算消費率）はバッジやプログレスバーで視覚化

### 5-6. フォーム

- ラベル: `text-sm font-medium text-brand-dark`
- 入力欄: `border border-brand-border rounded-md px-3 py-2 focus:ring-2 focus:ring-brand-blue focus:border-brand-blue`
- エラー: `border-brand-red text-brand-red text-sm`
- 必須マーク: 赤い `*` をラベル右に

### 5-7. モーダル（Dialog）

- shadcn/ui の Dialog を使用
- オーバーレイ: `bg-brand-dark/50 backdrop-blur-sm`
- コンテンツ: `bg-white rounded-lg shadow-xl max-w-lg p-6`
- 開閉アニメーション: fade + scale

### 5-8. 通知トースト

- shadcn/ui の Sonner を使用
- 成功: グリーン左ボーダー
- エラー: レッド左ボーダー
- 情報: ブルー左ボーダー
- 自動消滅: 5秒、ホバーで停止

### 5-9. プログレスバー（進捗率・予算消費率）

- 高さ: h-2
- 角丸: rounded-full
- 色分け: 0-50%=グリーン, 50-70%=イエロー, 70%超=レッド（点滅アニメで警告強調）

### 5-10. 空状態（Empty State）

- 中央寄せ
- アイコン（lucide-react、64px、brand-muted色）
- メインテキスト「まだ案件がありません」
- サブテキスト「右上の『新規申請』から始めましょう」
- CTAボタン

### 5-11. スケルトンローディング

- `bg-brand-border animate-pulse rounded-md`
- テーブルなら行5本、カードなら矩形を並べる

### 5-12. コマンドパレット（Cmd+K / Ctrl+K）

- shadcn/ui の `Command` コンポーネントを使用
- ヘッダーから常に `Cmd+K` (Mac) / `Ctrl+K` (Win) で起動
- 起動UIヒント: ヘッダー右側に `⌘K` バッジ表示（クリックでも開く）
- 検索対象:
  - 案件（タイトル・ID）→ 案件詳細へ遷移
  - タスク（タイトル・ID）→ タスク詳細へ遷移
  - クイックアクション（「新規申請」「承認待ちを開く」「ダッシュボードへ」など）
- グルーピング: 「案件」「タスク」「アクション」の3グループ
- キーボード操作: 矢印で選択、Enter で実行、Esc で閉じる
- プレゼン受けが良い機能。実装コストはshadcnの`Command`+検索データ提供だけで軽い。

---

## 6. インタラクション・アニメーション

| 要素 | アニメーション |
|------|--------------|
| ボタン hover | shadow強化 + 150ms transition |
| ボタン active | scale-95（押下感） |
| カード hover | shadow強化 + -translate-y-0.5 |
| ページ遷移 | Inertia標準のフェード |
| モーダル開閉 | fade + scale 200ms |
| ステッパーUI 進行中 | パルス（無限ループ） |
| 予算70%超バー | 赤色 + 軽い点滅 |
| トースト | 右上からスライドイン |

---

## 7. レスポンシブ・ブレークポイント

| 画面 | 幅 | 主な変化 |
|------|----|---------|
| Mobile | ~640px | サイドバーをドロワー化、テーブルはカード形式に |
| Tablet | 640~1024px | サイドバー縮小（アイコンのみ）、テーブルは横スクロール |
| Desktop | 1024px~ | フルレイアウト |

要件「PC・タブレット対応」を満たすため、Tailwind の `sm:` `md:` `lg:` を使用。

---

## 8. アクセシビリティ最低限

- すべてのボタン・リンクに `aria-label` または明確なテキスト
- フォーカスリング: `focus:ring-2 focus:ring-brand-blue` を全インタラクティブ要素に
- ステータスは色だけでなくアイコン・テキストでも区別（色覚特性配慮）
- コントラスト比 4.5:1 以上（brand-dark on brand-bg、white on brand-red など全てクリア）

---

## 9. V0 プロンプト先頭に貼る共通テンプレ

各画面のV0プロンプトの先頭にコピペする「共通仕様」：

```
このプロジェクトは日本企業の開発管理アプリです。以下のデザイン仕様を厳守してください。

【コンポーネント】shadcn/ui を使用、React + TypeScript + Tailwind CSS
【フォント】Noto Sans JP（日本語）+ Roboto（英数字）

【カラー】
- プライマリCTA: #E60013（ブランドレッド）
- テキスト濃: #212429
- 背景: #F8F9FA
- カード背景: #FFFFFF
- 補助テキスト: #6C757D
- ボーダー: #DEE2E6
- 情報系: #106EBE（ブルー）
- アクセント: #EDB100（イエロー）

【ステータス色】
- draft（下書き）: グレー #6C757D
- pending_dept（部門承認待ち）: シアン #01CFFF
- pending_hq（本部承認待ち）: ブルー #106EBE
- approved（承認済）: グリーン #16A34A
- rejected（却下）: レッド #E60013

【インタラクション】
- ボタンは shadow + hover:shadow-md + active:scale-95 で「押せる感」を出す
- カードは hover:-translate-y-0.5 + shadow強化
- すべてのインタラクティブ要素に focus:ring-2 ring-blue-500
- transition-all duration-150 を基本

【レイアウト】
- ヘッダー (h-14, 白背景) + ダークサイドバー (w-64, bg #212429) + メイン (max-w-7xl, p-6, bg #F8F9FA)
- レスポンシブ対応（モバイルでサイドバーをドロワーに）

【UX要素】
- 空状態: アイコン+テキスト+CTA
- ローディング: スケルトン
- 通知: トースト（Sonner）
- ステータスバッジ: 色付き丸 + アイコン + ラベル

すべてのテキストは日本語で記述してください。
```

---

## 10. 設計意図の要約（プレゼン用メモ）

- コーポレートカラーを尊重しつつ、業務アプリとしての可読性・操作性を優先
- 赤（CTA・却下）は使用箇所を絞り、視認性と注意喚起を両立
- ロゴの cyan→blue→purple グラデーションを承認フローの進行表現に転用し、ブランドと機能を結びつけた
- アイコン+色+テキストの3点セットで色覚特性にも配慮
