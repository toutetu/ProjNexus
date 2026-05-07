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

  /* Budget consumption bands (components_spec.md と統一) */
  --budget-safe:    #16A34A;  /* 0〜60% */
  --budget-normal:  #106EBE;  /* 61〜85% */
  --budget-warning: #EDB100;  /* 86〜100% */
  --budget-danger:  #E60013;  /* 100%超 */
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

## 5. コンポーネント運用方針（正本参照）

コンポーネント仕様の正本は `doc/Design/components_spec.md` とし、本書では重複定義を持たない。

- 本書（`design_system.md`）: デザイン原則、カラートークン、タイポグラフィ、レイアウト、アクセシビリティ基準
- 正本（`components_spec.md`）: コンポーネントの責務、Props、状態遷移、画面別利用方針、実装配置

### 5-1. 参照ルール

- 新規コンポーネント追加・既存仕様変更は **必ず** `components_spec.md` を更新する
- `design_system.md` には個別コンポーネントの詳細（Props/状態遷移/個別UI要件）を追記しない
- 実装レビュー時は「トークン整合は本書」「部品仕様整合は正本」の2軸で確認する
- ボタンの運用基準は `components_spec.md` の `Button（shadcn/ui）` に従う（特に補助アクションは `variant="neutral"` を既定とする）

### 5-2. 代表的な対応関係（抜粋）

- ステータスバッジ → `StatusPill`
- 承認ステッパー → `ApprovalStepperMini` / `ApprovalStepperFull`
- テーブル → `ProjectTable` / `MemberTasksListTable`
- フォーム部品 → `FieldLabel` / `AmountInput` / `Input・Textarea・Select`
- モーダル → `ConfirmDialog` / `ApprovalDialog` / `TaskFormDialog` / `BudgetActualDialog`
- ユーティリティ → `ProgressBar` / `EmptyState` / `Toast` / `KbdBadge`

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
| 予算100%超バー | 赤色 + 軽い点滅 |
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

## 9. V0 プロンプト先頭に貼る共通テンプレ（使用せず）

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
/**更新完了**/