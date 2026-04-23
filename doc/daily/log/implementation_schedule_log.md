# implementation_schedule 作業ログ

`doc/daily/implementation_schedule.md` から日次の詳細作業記録を分離したログです。  
最新の予定・進行管理は `implementation_schedule.md` を参照してください。

---

## 作業記録（時系列、最新が下）

### 作業記録 2026-04-20（月）Phase 0 完了

#### Git 整理（Cursor と作業）
- モック方針書の追加・スケジュール整理を `docs/mock-policies-and-schedule` ブランチで整理
- main へマージ、`gitlab` / `origin` 両リモートへ push
- `.vite/` を `.gitignore` に追加（Vite キャッシュの除外）

#### Phase 0 環境構築完了（Cursor と作業）
- `.env` 作成、APP_KEY 生成、MySQL（MariaDB 10.4 / XAMPP）に `projnexus` DB 作成
- `composer install` / `npm install` の残タスクを実施
- `spatie/laravel-permission` 導入、マイグレーション公開
- `departments` テーブル作成、`users.department_id` を外部キー追加
- `Department` モデル新規、`User` モデルに `HasRoles` と `department()` を追加
- `App\Enums\Role` を作成（applicant / dept_manager / hq_manager）
- `DepartmentSeeder`（本部+3部門）、`RolePermissionSeeder`、`UserSeeder`（7アカウント）作成
- `migrate:fresh --seed` 成功、DB で役割・部門付与を確認

#### ログイン後遷移の固定
- `AuthenticatedSessionController::store` のリダイレクト先を `/projects?tab=approval` に変更
- `/dashboard` も暫定で `/projects?tab=approval` に redirect
- `HandleInertiaRequests::share` で `auth.user` に `department` と `roles` を追加
- 暫定の `Projects/Index.tsx` を作成（ロール・部門・tab 表示の動作確認用）

#### Laravel Cloud 初回デプロイ完了
- リポジトリ構造をフラット化（quest_1/ 配下を repo root へ）して Laravel Cloud に認識させた
- App / DB 両方を Asia Pacific (Singapore) リージョンで作成
- Custom env vars（APP_LOCALE, APP_TIMEZONE, QUEUE_CONNECTION, MAIL_MAILER）を設定
- Build: composer install / npm ci / npm run build
- Deploy: php artisan migrate --force（初回のみ db:seed 併用）
- 公開URL: https://projnexus-main-butvrx.laravel.cloud
- 3 ロール全てのログイン動作を本番環境で確認

#### 次回の作業予定（= 上記「§3 次回作業予定」参照）
- Phase 1 着手：`AuthenticatedLayout` を s03a/s04 モック準拠に改修、サイドバー 3 セクション化
- 共通コンポーネント（`StatusPill`, `ApprovalStepperMini`, `Tabs`）の先行実装
- `projects` テーブルとモデルのスキャフォールド

---

### 作業記録 2026-04-21（火）Phase 1 初日（3h）

#### 今日の作業内容（ブランチ: `feat/phase1-layout`）
- shadcn/ui 基盤を手動導入：`components.json` / `resources/js/lib/utils.ts` / `Components/ui/button.tsx` / `Components/ui/badge.tsx`
- 依存パッケージ追加：`lucide-react`, `clsx`, `tailwind-merge`, `class-variance-authority`, `@radix-ui/react-slot`, `tailwindcss-animate`
- `tailwind.config.js` に `brand.*` / `status.*` カラートークン、`Noto Sans JP` / `JetBrains Mono` フォント、`animate-brand-pulse` を登録
- `resources/css/app.css` に Google Fonts（Noto Sans JP / JetBrains Mono）の `@import` を追加
- `AuthenticatedLayout` を 3 セクションサイドバー構造に全面改修
  - `Components/Layout/Sidebar.tsx`（ロゴ / 申請・承認 / 開発管理 / 予算管理 / 共通 / 下部ユーザーカード）
  - `Components/Layout/Header.tsx`（パンくず + ⌘K 検索ボタン + 通知ベル）
  - `Components/Layout/Breadcrumb.tsx` 単独化
  - ロール別メニュー制御（applicant：承認待ち非表示 / hq_manager：新規申請非表示 / タスク一覧は全ロール dim+「課題2」）
- `StatusPill.tsx` を 5 値（draft / pending_dept / pending_hq / approved / rejected）で実装、色は `components_spec.md §2` マッピングに準拠
- `Projects/Index.tsx` を新レイアウト + `StatusPill` 5 種確認ブロックで更新
- `Dashboard.tsx` と `Profile/Edit.tsx` を `breadcrumb` / `activeKey` props 仕様に追従
- `types/index.d.ts` に `BreadcrumbItem` 型を追加

#### 詰まった点・判断
- `npx shadcn@latest init` は Laravel + Inertia の既存構成と相性が悪く、対話プロンプトに時間を取られる判断 → `components.json` / `lib/utils.ts` / Button / Badge を手動スキャフォールドに切替
- `AuthenticatedLayout` の `header` props を利用していた `Dashboard.tsx` / `Profile/Edit.tsx` を放置すると型エラーで詰まるため、今日のうちに新 props 仕様（`breadcrumb` + `activeKey`）に追従。Phase 2 以降の手戻り防止も兼ねた
- shadcn の CSS variables 方式（`--background` 等）は Tailwind v3 構成で追加コストが大きく、当面は `brand.*` トークン直参照で運用。Button / Badge 側も `bg-brand-red` 等の直接クラスで暫定実装し、後日ブランド色の微調整があればトークン側で一元差替え可能

#### 検証結果
- `npx tsc --noEmit` — 0 エラー
- `npm run build` — 成功（CSS 52.99 KB, main 338.17 KB）
- Lint — 該当ファイルでエラーなし

#### 次回の作業予定（= 上記「§3 次回作業予定」参照）
- `Tabs` / `ApprovalStepperMini` / `EmptyState` の実装
- `Projects/Index.tsx` にタブ切替 UI とダミーテーブル骨組み
- 承認待ちプリセット（`filter=pending`）のタイトル下バッジ

---

### 作業記録 2026-04-22（水）Phase 1 仕上げ（5h）

#### 今日の作業内容（ブランチ: `feat/phase1-layout-2`, `feat/phase1-layout-3`）
- `Tabs.tsx` / `ApprovalStepperMini.tsx` / `EmptyState.tsx` を実装
- `Projects/Index.tsx` にタブ切替UIと approval/dev/budget ダミーテーブル骨組みを組込み
- `filter=pending` 時の「承認待ち」バッジ表示を追加し、URL同期の実機確認を完了
- shadcn/ui の `Input` / `Dialog` / `Table` / `Select` を追加
- `Projects/Show.tsx` 骨組みを新規作成、`/projects/{project}` ルートを追加
- ログイン画面を ブランドトーンにブランディング調整（`GuestLayout` / `Auth/Login`）
- `npx tsc --noEmit` / `npm run build` を実行し、ビルド検証を通過

#### 詰まった点・判断
- タブ切替の履歴は `replace: true`（履歴を増やさない）で維持
- 共通部品の先行整備を優先し、Phase 2 では業務ロジック接続に集中できる状態を作った
- `Projects/Show.tsx` は Phase 1 では骨組みのみとし、詳細機能は Phase 2 で追加する方針

#### 翌日チャットへの引継ぎ
- 次回は Phase 2 初日として `projects` migration / `Project` Model / `ProjectController@index` に着手
- `Projects/Index.tsx` はダミーデータ表示中のため、Controller 実装時に props を実データへ置換
- `filter=pending` のフロント表示は完成済み。ロール別 pending 抽出をサーバー側で接続する
- `Projects/Show.tsx` は骨組み作成済み。承認ステッパー大型版と案件詳細実データを段階追加

#### Phase 進捗
- Phase 1：10h/10h（実装面完了）
- 次回は Phase 2（土台実装）へ移行

---

### 作業記録 2026-04-23（木）Phase 2 初日（2h）

#### 今日の作業内容（ブランチ: `feat/phase2-projects-foundation`）
- `projects` migration を作成し、`parent_project_id` / `revision` / `status` / 予算系カラムを実装
- `ProjectStatus` enum、`Project` Model（主要リレーション、scope、cast）を追加
- `ProjectController@index` を新規作成し、`tab` / `filter=pending` の受け口を実装
- `ProjectPolicy` を新規作成し、`viewAny` / `view` / `create` / `update` / `delete` の土台を実装
- `routes/web.php` の `/projects` を Controller 経由へ変更
- `php artisan migrate` / `npx tsc --noEmit` / `npm run build` を実施して成功
- 実装コミット・push 完了（`feat/phase2-projects-foundation`）

#### 詰まった点・判断
- 一覧UIはダミーデータ継続のため、`projects` prop は先行で渡しつつ UI 側置換は次タスクへ分離
- `filter=pending` は role 別分岐（applicant/dept/hq）だけ先に入れ、詳細業務条件は次フェーズで詰める
- 日報系の更新は `docs/daily-20260423` に分離し、実装ブランチと混線しない運用にした

#### 翌日チャットへの引継ぎ
- `approvals` / `notifications` migration と Model を追加し、ApprovalService 実装前提を固める
- `ProjectController` の `show/store/update` 骨組みに着手
- `Projects/Create.tsx`（S-05）接続方針を確定する

#### Phase 進捗
- Phase 2：4h/22h（初日の土台実装を完了）
- 次回は承認履歴・通知テーブルの追加へ進む

---

### 作業記録 2026-04-23（木）Phase 2 前倒し追加（+1h）

#### 今日の追加作業内容（ブランチ: `feat/phase2-projects-foundation`）
- `approvals` / `notifications` migration を追加して DB 基盤を拡張
- `Approval` / `Notification` Model を追加し、enum（`ApprovalLevel`, `ApprovalAction`, `NotificationType`）を作成
- `ProjectController` に `show/store/update/destroy` の受け口を追加
- `/projects` の CRUD ルートを Controller に接続
- `Controller` に `AuthorizesRequests` を導入し、ログイン後 500 エラーを修正
- 3ロール（申請者/部門管理者/本部管理者）でログイン後にエラーが出ないことを手動確認済み
- `php artisan migrate` / `npx tsc --noEmit` / `npm run build` を実行して成功

#### 判断とメモ
- 予定より進捗に余裕が出たため、Phase 2 Day2 の土台実装を前倒しした
- 承認履歴・通知のDBを先に固めたことで、次は `ApprovalService` 実装に集中できる状態
- 認可エラーは Controller ベースクラスのトレイト不足が原因で、影響範囲を最小で修正済み

#### 次回の着手ポイント
- `ApprovalService`（`submit / approveDept / approveHq / reject`）の実装開始
- `ApprovalController` の承認/却下アクション接続
- `Projects/Create.tsx`（S-05）と `store` の接続

#### Phase 進捗
- Phase 2：7h/22h（DB・Model・Controller 基盤の前倒し完了）

---

### 作業記録 2026-04-23（木）Phase 2 承認導線接続（+1h）

#### 今日の追加作業内容（ブランチ: `feat/phase2-projects-foundation`）
- `ApprovalService` を実装（`submit / approveDept / approveHq / reject`）
- `ApprovalController` を追加し、承認・却下・申請ルートを接続
- `NotificationService` を追加し、承認イベント時の通知作成を共通化
- `Projects/Index.tsx` にロール別の申請/承認/却下ボタンを追加
- 3ロールでログイン・承認導線が 500 なく動作することを確認
- `npx tsc --noEmit` / `npm run build` で確認済み

#### 判断とメモ
- まずは最小導線（一覧から直接操作）を先に動かし、次に Dialog 化で UX を上げる方針
- 承認ロジックは Service に寄せ、Controller を薄く維持した

#### 次回の着手ポイント
- `ApprovalDialog`（コメント付き承認/却下）を導入
- `Projects/Create.tsx`（S-05）を `projects.store` に接続

#### Phase 進捗
- Phase 2：8h/22h（承認フローの最小導線まで実装）

---
