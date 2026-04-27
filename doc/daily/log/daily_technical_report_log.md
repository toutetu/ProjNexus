# implementation_schedule 作業ログ

`doc/daily/implementation_schedule.md` から日次の詳細作業記録を分離したログです。  
最新の予定・進行管理は `implementation_schedule.md` を参照してください。

---

### 作業記録 2026-04-27（月）Phase 2 UI/通知仕上げ

#### 1) 申請一覧 UI のモック準拠調整
- `Projects/Index.tsx` の approval フィルターバーを再構成（検索・ステータス・部門・クリア）
- テーブル下凡例（StatusPill 5種 + 注記）を追加
- セレクト表示崩れ（文言と矢印の重なり）を `min-w` と `pr` 調整で修正
- `filter=pending` 時は申請タブのみ表示、開発/予算タブを非表示化

#### 2) サイドバー/ヘッダーの導線調整
- サイドバー「承認待ち一覧」に `pendingApprovalCount` バッジを表示
  - 0件時は非表示、99件超は `99+`
- ヘッダー右上の検索窓を全画面から削除
- 却下案件の詳細画面ではサイドバーのアクティブを `projects-approval` に切替

#### 3) 申請・承認フローの挙動修正
- `Projects/Create.tsx` の submit 送信競合を修正
  - `useForm.transform` で `submit_action=submit` を確実に送信
- 申請取り戻し機能を追加
  - ルート: `projects.takeBack`
  - 条件: 申請者本人の `pending_dept`、または部門管理者申請者の `pending_hq`
  - 処理: `status -> draft`, `submitted_at -> null`

#### 4) 通知ロジックの見直し
- 申請時に承認者へ通知（部門管理者/本部管理者）を送信
- 申請者への「申請受付」通知は `read_at` を即時セット（既読化）
- 部門承認後に本部管理者へ承認依頼通知を送信
- 本部却下時に、途中で部門承認した部門管理者へ却下通知を送信

#### 5) 却下コメント表示の改善
- `ProjectController@show` で最新却下コメントを取得
- `Projects/Show.tsx` で承認ステップ直下に却下コメント枠を表示
  - `bg-[#FEE2E2]` / `text-[#991B1B]` の注意表示スタイル
- 表示条件を拡張し、却下ステータスならロール共通で表示

#### 6) 検証
- `npx tsc --noEmit` 複数回実行、全て成功
- `php artisan test --filter=ProjectApprovalFlowTest` を継続実行し、追加ケース含め成功
  - 申請通知、取り戻し、部門承認→本部通知、本部却下→部門通知を確認

#### 7) コミット/プッシュ（feature ブランチ）
- `ac455c21` fix: update logout redirect and pending approval tabs
- `cead3308` feat: show pending approval count in sidebar
- `0cedfb29` feat: rebuild approval filter bar and add query filters
- `0a431784` fix: correct submit flow and notification delivery behavior
- `f2343add` feat: allow applicants to take back pending requests
- `43362b0c` feat: show reject comments and notify HQ after dept approval
- `6adfb956` chore: add shared password hint on login test users
- `af458c65` feat: improve rejected project visibility and rejection notifications

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
- Phase 2：2h/22h（初日の土台実装を完了）
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
- Phase 2：4h/22h（DB・Model・Controller 基盤の前倒し完了）

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

### 作業記録 2026-04-23（木）Phase 2 追加実装・日次運用（本チャット分）

#### 1) 日次ドキュメント運用・Gitフロー整理（docsブランチ運用）
- `docs/daily-20260423` ブランチで日次ドキュメント整理差分を確認し、`implementation_schedule.md` 要約化と `development_schedule.md` 更新をコミット
  - コミット: `098abd92`（`docs: implementation_schedule を要約版に一本化`）
- 同ブランチを `origin` / `gitlab` の両方へ push（PowerShell では `&&` が使えないため `;` で順次実行）
- 未管理差分だった `doc/Design/引継ぎmemo.txt` 削除を個別コミット
  - コミット: `50b6e7eb`（`docs: 引継ぎメモを整理のため削除`）
- ユーザー修正後の `daily_report.md` を反映してコミット
  - コミット: `d6de3a79`（`docs: 日報を報告向けに更新`）
- `docs/daily-20260423` を push 後、`main` に `--no-ff` マージし `origin/main` / `gitlab/main` へ反映
  - マージコミット: `c1f6da69`（`merge: docs daily update 2026-04-23`）
- その後、実装継続のため `feat/phase2-projects-foundation` へ復帰

#### 2) S-08 承認/却下ダイアログ実装（コメント入力付き）
- `resources/js/Components/Modals/ApprovalDialog.tsx` を新規作成
  - props: `mode`, `open`, `onClose`, `project`, `approvalLevel`, `onSubmit`
  - 承認/却下で文言・アイコン・必須条件を切替
  - 却下時コメント必須、承認時コメント任意
  - 案件名/部門/ID を表示し、誤操作防止の文脈を明示
- `Projects/Index.tsx` の承認/却下ボタンを直接POSTからダイアログ経由に変更
  - `approve/reject` 送信 payload に `comment` を追加
  - ダイアログ送信後 `onFinish` でクローズ

#### 3) S-05 新規申請画面の実接続
- `ProjectController` に `create()` を追加（`authorize('create', Project::class)`）
- `routes/web.php` に `GET /projects/create`（`projects.create`）を追加
- `resources/js/Pages/Projects/Create.tsx` を新規作成
  - `useForm` で `title`, `purpose`, `estimated_amount` を管理
  - `POST route('projects.store')` へ送信
  - バリデーションエラー表示（`InputError`）を実装
- サイドバー「新規申請」および一覧画面右上ボタンを `projects.create` 遷移へ接続

#### 4) S-06 編集画面と更新導線の実装
- `ProjectController` に `edit(Project $project)` を追加
  - `authorize('update', $project)` を適用
  - Inertia props として `id/title/purpose/estimatedAmount` を返却
- `routes/web.php` に `GET /projects/{project}/edit`（`projects.edit`）を追加
- `resources/js/Pages/Projects/Edit.tsx` を新規作成
  - `PUT route('projects.update', project.id)` を実装
  - 作成画面同様に入力/バリデーションUIを整備

#### 5) 一覧→詳細→編集の遷移導線を接続
- `Projects/Index.tsx`
  - タイトルを `projects.show` へのリンクに変更
  - 一覧データに `canEdit` を追加し、編集可能行のみ「編集」ボタン表示
- `ProjectController@index`
  - 各行propsに `canEdit: $user->can('update', $project)` を追加
- `Projects/Show.tsx`
  - プレースホルダから実データ表示へ更新（部門/申請者/主担当/見積/予算/実績）
  - 「編集」ボタンを追加し `projects.edit` へ接続
- `ProjectController@show`
  - `canEdit` を返却し、`Show.tsx` で編集ボタン表示を権限連動に変更

#### 6) 二重操作防止（行単位 processing 制御）とUX改善
- `Projects/Index.tsx` に `processingRowId` を追加
  - `submit/approve/reject` 実行時に対象行IDをセット
  - `onFinish` で解除
  - 同行の `申請/編集/承認/却下` ボタンを `disabled` 制御
- 行内に `処理中...` バッジを追加し、最終的に `Loader2` スピナー付き表示へ改善
  - `inline-flex + animate-spin` で視認性を向上

#### 7) 実装コミット・push（featureブランチ）
- ここまでの実装を1コミットに集約
  - コミット: `b8d53971`
  - メッセージ: `feat: connect project create/edit and approval dialog UX`
  - 主要変更:
    - 追加: `Projects/Create.tsx`, `Projects/Edit.tsx`, `Modals/ApprovalDialog.tsx`
    - 更新: `ProjectController.php`, `routes/web.php`, `Sidebar.tsx`, `Projects/Index.tsx`, `Projects/Show.tsx`
- `feat/phase2-projects-foundation` を `origin` / `gitlab` に push

#### 8) 検証結果（本チャット中に都度実施）
- TypeScript: `npx tsc --noEmit` を複数回実行し全て成功
- Lint: 変更対象ファイルに対して `ReadLints` で確認しエラーなし
- 手動確認観点:
  - 新規申請画面への遷移
  - 一覧から案件詳細遷移
  - 詳細/一覧から編集可能案件のみ編集導線表示
  - 承認/却下ダイアログ表示、コメント送信、処理中表示

#### 詰まった点・判断
- PowerShell 環境で `&&` が使えないため、pushや複合コマンドは `;` で連結して実行
- 承認アクションはまず最小導線（一覧から直接操作）を安定化し、次にダイアログ化・processing制御を段階追加
- 編集可否はUI条件分岐のみでなく、`ProjectPolicy` 判定結果（`canEdit`）をAPI側で返して二重防御に統一

#### 次回の着手ポイント
- S-12 `Notifications/Index.tsx` とヘッダー未読バッジの接続
- 承認待ち一覧のUI微調整（状態表示/エラー表示）
- Featureテスト（承認フロー1本、権限境界1本）の追加

#### Phase 進捗
- Phase 2：5h/22h 
  - 申請・承認の主要導線（Create/Edit/Approve/Reject/Dialog/権限連動表示）まで接続完了

---

## 2026-04-24（金）— Phase 2 継続（通知 S-12・承認一覧 UI・テスト）

### 実装概要
- **通知ルート**: `GET /notifications`（`notifications.index`）、`PATCH /notifications/{notification}/read`（`notifications.read`）を `auth`+`verified` グループに追加
- **共有プロップ**: `HandleInertiaRequests` に `flash.error` と `unreadNotificationCount`（未読件数）を追加
- **S-12**: `resources/js/Pages/Notifications/Index.tsx` を新規作成（一覧・未読表示・既読 PATCH・`meta.project_id` がある場合は案件詳細リンク・ページネーション）
- **ヘッダー / サイドバー**: `Header.tsx` のベルを通知一覧リンク＋未読数バッジに接続。`Sidebar.tsx` の「通知」誤リンク（プロフィール向け）を修正し、未読バッジを表示
- **通知 JSON**: `NotificationController@index` の各要素キーを `readAt` / `createdAt` に統一（フロントの camelCase と整合）
- **承認一覧**: `ProjectController@index` で却下案件の最新却下レベルを一括取得し `rejectedAt`（`dept`|`hq`）を返却。`Projects/Index.tsx` で空一覧の `EmptyState`、フラッシュエラー、`rejectedAt` の `ApprovalStepperMini` 連動を追加。誤って常時表示されていた承認待ち用 `EmptyState` を削除
- **エラー表示**: `ApprovalController` の submit/approve/reject で `AuthorizationException` を捕捉し `redirect()->with('error', …)` に変更
- **テスト**: `ProjectApprovalFlowTest`（部門承認成功・申請者の承認不可）を追加。`AuthenticationTest` のログイン後リダイレクト期待値を `projects.index?tab=approval` に合わせて修正

### 検証
- `npx tsc --noEmit` / `npm run build` 成功
- `php artisan test` 全件成功（27 tests）

### Phase 進捗
- Phase 2：9h/22h（本日 +4h 見込みで development_schedule と整合）

---

## 2026-04-24（金）— 追加作業（ER整合・migration統合・DB再構築）

### 実装概要
- `doc/Design/er_diagram.md` と `database/migrations` の差分を比較し、設計優先で migration 構成を再整理
- `add_*` マイグレーションを縮小し、主要カラムは `create_*` へ統合
  - `users.role`、`users.department_id`
  - `projects.description`、`projects.estimated_days`
  - `approvals.status`
  - `notifications.project_id`、`notifications.message`、`notifications.is_read`
- `tasks` / `task_comments` / `task_histories` を `create_tasks_tables` として追加
- `users` 作成時の `after('email')` 由来SQLエラーを除去（create文での `after` 非対応）

### 検証
- `php artisan test` 全件成功（29 tests）
- `php artisan migrate:fresh` 成功
- `php artisan db:seed` 成功（Department / RolePermission / User）

### 判断メモ
- migration可読性を優先するため、現フェーズでは `create` 側に統合
- 共有運用開始後は `add-only` に切替える運用ルールを `design-philosophy.md` に追記

---
