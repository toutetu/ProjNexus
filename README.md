# ProjNexus — 開発管理統合アプリケーション PoC

架空企業の申請・承認・タスク・予算管理を一元化する Web アプリ PoC。  
課題として開発。

---

## 概要

現場に散在する「申請システム」「部門別 Excel」「予算管理 Excel」を  
単一の Web アプリに統合し、承認フローから開発進捗・予算消化まで追跡できる。

---

## 技術スタック

| 層 | 採用技術 |
|---|---|
| バックエンド | PHP 8.2 + Laravel 11 |
| 認証 | Laravel Breeze (Inertia + React) |
| 権限管理 | spatie/laravel-permission（1ユーザー複数ロール） |
| フロントエンド | React 18 + TypeScript + Inertia.js |
| スタイル | Tailwind CSS |
| UI コンポーネント | shadcn/ui + lucide-react |
| グラフ | Recharts |
| データベース | MySQL 8（XAMPP） |
| デプロイ | Laravel Cloud |

---

## 主要機能

### 課題1（必須）

- **申請・承認フロー** — 申請者 → 部門管理者 → 本部管理者の 2 段階承認
- **タスク管理** — 4 値ステータス（open / in_progress / resolved / closed）の確認工程あり
- **予算・実績管理** — 案件単位の予算額・実績額・消費率の管理
- **ロール別アクセス制御** — applicant / dept_manager / hq_manager の 3 ロール
- **アプリ内通知** — 承認・却下・タスク担当・期限アラート等

### 課題2（+α 実装済み）

- **承認ステッパー UI** — 現在の承認ステップを視覚的に表示
- **S-14 タスク一覧** — カンバン / メンバー別 / 一覧の 3 ビュー切替
- **S-02 ダッシュボード** — Recharts で KPI・部門別進捗・予算推移を可視化
- **タスク変更履歴** — `task_histories` で自動記録（Excel 報告の代替）

### 課題2 未実装（バックログ）

以下は PoC スコープ外として今後の拡張候補。

- **S-16 ガントチャート** — 工程の可視化・依存関係の編集 UI
- **S-15 バーンダウンチャート** — 設計のみ・未実装
- **スマートフォン対応** — 申請・一覧・案件詳細のタッチ最適化（主要 3 画面のレスポンシブ調整）
- **`budget_actuals` 方式** — 1 支出 1 行の ER・移行・実装（現行は上書き方式）
- **予算アラート通知** — 86% / 100% 閾値超過でアプリ内通知
- **ユーザー管理** — 本部のみでアカウント・権限・部門を動的に追加
- **部門マスタ** — 本部で部門の作成・管理
- **通知のメール送信** — SMTP / キュー対応
- **帳票・見積エクスポート** — PDF / Excel 形式での出力
- **ダッシュボード追加指標** — S-02 のモック練り直し・追加 KPI
- **モバイルハンバーガーメニュー** — Phase 1 の骨組みのみ・中身未完成

---

## ロールと権限

| ロール | 主な権限 |
|---|---|
| applicant（申請者） | 申請・タスク進捗入力・予算実績入力 |
| dept_manager（部門管理者） | 部門内一次承認・部門案件閲覧 |
| hq_manager（本部管理者） | 最終承認・全案件閲覧・タスク閲覧のみ |

> 部門管理者が申請者の場合は部門承認をスキップし、本部承認へ直行。  
> 却下後の再申請は新規レコードとして作成（`parent_project_id` で元案件に紐付け）。

---

## ローカル環境構築

```bash
# 依存パッケージのインストール
composer install
npm install

# 環境設定
cp .env.example .env
php artisan key:generate

# データベースのセットアップ
php artisan migrate
php artisan db:seed

# フロントエンドのビルド
npm run dev

# 開発サーバー起動
php artisan serve
```

XAMPP で MySQL を起動した状態で `.env` の `DB_*` を設定してください。

---

## テストアカウント

詳細は `database/seeders/UserSeeder.php` および `doc/Information.md` を参照。

---

## ドキュメント構成

| パス | 内容 |
|---|---|
| `materials/Design/AI.md` | AI 向け実装ガイド（読了順・約束事） |
| `materials/Design/system_spec.md` | システム仕様の正本（スコープ・DB・権限） |
| `materials/Design/er_diagram.md` | ER 図・テーブル列・Enum |
| `materials/Design/screen_flow.md` | 画面一覧・URL・遷移 |
| `materials/Design/components_spec.md` | UI コンポーネント仕様・Props |
| `materials/Design/design_system.md` | デザイントークン・カラー定義 |
| `materials/quest/requirements.md` | 要件定義 |
| `doc/Information.md` | デプロイ URL・テストアカウント・動作確認シナリオ |
| `materials/manual/user_manual.md` | 利用マニュアル（`/manual` でアプリ内表示） |

---

## テスト

```bash
php artisan test
```

Feature テストは承認フローと権限境界を中心に実装。

---

## 提出情報

- **提出先**: GitLab `quest_1` リポジトリ `main` ブランチ
- **期間**: 2026-04-13 〜 2026-05-15
- **評価基準**: 課題1 完成度・工夫 + 課題2 プレゼン + 資料
