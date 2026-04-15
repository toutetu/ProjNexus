# カラーガイド

このドキュメントは、参考サイトから抽出したカラー情報を整理したものです。開発やデザインのトーン＆マナー統一にご活用ください。

## 1. コーポレートカラー（ウェブサイト・ブランド）

公式サイトで使用されている主要なカラーパレットです。

| カテゴリ | 色見本 | HEXコード | 用途 |
| :--- | :---: | :--- | :--- |
| **メイン（Brand Red）** | ![#E60013](https://via.placeholder.com/15/E60013?text=+) | `#E60013` | ロゴ、重要なボタン、アクセントカラー |
| **メインテキスト** | ![#212429](https://via.placeholder.com/15/212429?text=+) | `#212429` | 本文、ロゴの文字、フッター背景 |
| **背景色（ライトグレー）** | ![#F8F9FA](https://via.placeholder.com/15/F8F9FA?text=+) | `#F8F9FA` | セクション背景、カードデザイン |
| **補助テキスト** | ![#6C757D](https://via.placeholder.com/15/6C757D?text=+) | `#6C757D` | 補足情報、メタテキスト、プレースホルダー |
| **ボーダー・区切り線** | ![#DEE2E6](https://via.placeholder.com/15/DEE2E6?text=+) | `#DEE2E6` | 枠線、フォームの境界線、水平線 |

## 2. ロゴカラー（グラフィック要素）

ロゴ画像から抽出した、先進性やテクノロジーを感じさせるグラデーションカラーです。

| 色名 | 色見本 | HEXコード | 箇所 |
| :--- | :---: | :--- | :--- |
| **アクセントイエロー** | ![#EDB100](https://via.placeholder.com/15/EDB100?text=+) | `#EDB100` | ロゴ上下の独立したノード |
| **シアン（ライトブルー）** | ![#01CFFF](https://via.placeholder.com/15/01CFFF?text=+) | `#01CFFF` | 接続ノードの左側（開始色） |
| **メインブルー** | ![#106EBE](https://via.placeholder.com/15/106EBE?text=+) | `#106EBE` | 接続ノードの中央部分 |
| **ディープパープル** | ![#6D28D9](https://via.placeholder.com/15/6D28D9?text=+) | `#6D28D9` | 接続ノードの右側（終了色） |

## 3. タイポグラフィ

* **日本語フォント**: `Noto Sans JP` (Hiragino Kaku Gothic ProN, Yu Gothic)
* **英字フォント**: `Roboto`, `Arial`
* **基本フォント色**: `#212429` (視認性に配慮したダークグレー)

## 4. 実装用コード例 (CSS Variables)

```css
:root {
  /* Corporate Colors */
  --brand-red: #e60013;
  --brand-dark: #212429;
  --brand-gray-light: #f8f9fa;
  --brand-gray-muted: #6c757d;
  --brand-border: #dee2e6;

  /* Logo Gradient Colors */
  --brand-logo-accent: #edb100;
  --brand-logo-cyan: #01cfff;
  --brand-logo-blue: #106ebe;
  --brand-logo-purple: #6d28d9;
}