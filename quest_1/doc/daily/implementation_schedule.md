# 実装スケジュール & セットアップ手順

このドキュメントは、日次で迷わず進めるための実行計画です。  
方針は「課題1を優先し、GW前にPhase 2を完了する」です。

---

## 1. React実装をどこで行うか

- **Phase 0**: Laravel/Breeze/Spatie/DB の土台準備
- **Phase 1**: Reactでレイアウト・共通UIを再現（モック再現の開始）
- **Phase 2**: Reactで申請・承認画面を実装し、Laravelと接続
- **Phase 3**: Reactで案件詳細・タスク・予算画面を実装し、Laravelと接続
- **Phase 4-5**: UI改善、資料、提出準備

つまり、実装イメージは次の順です。

1. HTML/CSSモックをReactコンポーネント化
2. Inertia経由でLaravelのデータと接続
3. 権限制御・テストで仕上げる

---

## 2. 平日ベースの実行スケジュール（残り75h）

前提: 2026-04-17 時点で残り75h。  
稼働日は平日のみ。平均稼働は **1日4h前後**（必要に応じて3h-5hで調整）。

### 時間配分（合計75h）

- **Phase 0（環境構築の残タスク）**: 8h
- **Phase 1（認証・レイアウト・共通UI）**: 12h
- **Phase 2（申請・承認フロー）**: 22h
- **Phase 3（開発管理・予算管理）**: 18h
- **Phase 4（+alpha最小）**: 5h
- **Phase 5（資料・最終確認）**: 10h

### 週ごとの進め方

### Week 1: 4/20-4/24（20h目安）

- Phase 0を完了（Laravel/Breeze/Spatie/DB/Seeder）
- ログイン後遷移を `/projects?tab=approval` に固定
- Phase 1着手（`AuthenticatedLayout` と共通コンポーネント）
- S-03aのReact再現をダミーデータで開始

### Week 2: 4/27-5/1（20h目安）

- Phase 1を完了（申請タブUI、ロール別メニュー）
- Phase 2の中核実装開始
- Project作成/編集/一覧と承認待ち一覧
- 承認/却下の最小動作を通す

### Week 3: 5/4-5/8（15h目安、祝日週は少なめ）

- Phase 2を完了（通知、状態遷移、権限境界）
- Featureテスト（承認フロー/権限）を最低限作成
- 余剰時間でPhase 3先行（S-04の骨組み）

### Week 4: 5/11-5/15（20h目安）

- Phase 3完了（タスクモーダル、予算実績モーダル、権限最終調整）
- Phase 4（承認ステッパー、レスポンシブ最低調整）
- Phase 5（資料、提出物、3ロール横断の最終確認）

### 週次チェックポイント（毎週金曜）

- 今週の実績時間（目標との差分）
- Phaseごとの完了率（%）
- ブロッカー（技術/仕様/時間）の有無
- 翌週の優先3タスクを確定

---

## 3. 4/17 初日セットアップコマンド（PowerShell）

作業ディレクトリ: `C:\xampp\htdocs\ProjNexus\quest_1`

```powershell
# 0) プロジェクトへ移動
cd C:\xampp\htdocs\ProjNexus\quest_1

# 1) 依存インストール（composer / npm）
composer install
npm install

# 2) .env作成とAPP_KEY生成
if (!(Test-Path .env)) { Copy-Item .env.example .env }
php artisan key:generate

# 3) Breeze (React + Inertia + TypeScript) 導入
composer require laravel/breeze --dev
php artisan breeze:install react --typescript

# 4) フロント依存を再インストール
npm install

# 5) 権限制御パッケージ導入（Spatie）
composer require spatie/laravel-permission

# 6) Spatieのmigration公開
php artisan vendor:publish --provider="Spatie\Permission\PermissionServiceProvider"

# 7) DB反映（※DB名は.envで先に設定）
php artisan migrate

# 8) 開発サーバ起動（別ターミナル2枚で）
# ターミナルA
php artisan serve

# ターミナルB
npm run dev
```

---

## 4. `.env` の確認ポイント

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=projnexus
DB_USERNAME=root
DB_PASSWORD=
```

---

## 5. 初日ゴール（完了条件）

- `/login` が開く
- ログイン後に Inertia + React 画面が表示される
- `php artisan migrate` がエラーなし
- `npm run dev` でViteが起動する

---

## 6. 次の作業（翌日）

1. roles/permissions のSeeder作成
2. department と user のSeeder作成（申請者/部門管理者/本部管理者）
3. ログイン後の遷移を `projects?tab=approval` に固定
