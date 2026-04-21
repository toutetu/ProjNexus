# 実装スケジュール（詳細実行版）

このドキュメントは、実装作業で実際に使う詳細手順（週次タスク・コマンド・完了条件・次回作業予定）を管理します。  
方針は「**課題1を優先し、GW前に Phase 2 完了、GW週で Phase 3 MVP、最終週で +α＋資料**」です。  
要約版の進捗管理・各Phaseのチェックリストは `doc/daily/development_schedule.md` を参照します。  
日々の作業記録は、末尾に時系列で追記していきます。

---

## 1. 実装アプローチ

- **Phase 0**: Laravel / Breeze / Spatie / DB の土台準備 ✅ 完了
- **Phase 1**: レイアウト・共通UI を React でモック再現
- **Phase 2**: 申請・承認画面を実装し Laravel と接続（**課題1の核**）
- **Phase 3**: 案件詳細・タスク・予算画面を実装し Laravel と接続
- **Phase 4**: UI改善（ステッパーUI・レスポンシブ最低限）
- **Phase 5**: 資料・最終確認・提出

実装イメージ：

1. HTML/CSSモックを React コンポーネント化
2. Inertia 経由で Laravel のデータと接続
3. 権限制御・テスト（最低限）で仕上げる

---

## 1.5. 日次ワークフロー（毎日必ず実施）

> ルールの根拠は `doc/Design/CLAUDE.md §9 Git / 提出 > 日次ワークフロー` を参照。  
> Cursor / Claude に作業を依頼する時も、このワークフローに従うよう指示する。

### 作業開始時のコマンド

```powershell
# 1. main を最新化
git checkout main
git pull origin main

# 2. 作業ブランチを切る（命名例）
#    実装  : feat/phase1-layout, feat/phase2-apply-form, fix/status-pill-color
#    ドキュメント: docs/daily-20260421, docs/update-er-diagram
git checkout -b feat/phase1-layout
```

### 作業終了時のコマンド

```powershell
# 1. doc/daily/ の 3 ファイルを更新
#    - daily_report.md       : 本日の実績・気づき・翌日の予定（既存提出分は変更しない）
#    - development_schedule.md    : 累計実績 h・残り h・現在地・今週の目標
#    - implementation_schedule.md : 次回作業予定の詳細化

# 2. コミット
git add -A
git commit -m "docs: 日次更新 2026-04-21"
# 実装変更がある場合は別コミットに分ける
#   git commit -m "feat: AuthenticatedLayout を 3 セクション化"

# 3. push（初回は -u で upstream 設定）
git push -u origin feat/phase1-layout

# 4. 必要に応じて PR / MR を作成。main へのマージは自己レビュー後
```

### 運用上の注意

- **`main` 上で直接作業しない**（push 禁止）
- **1 日の最後に push を忘れない**（データロスト対策 + 進捗の可視化）
- **daily_report.md の提出済み部分は変更しない**。追記のみ
- 1 日の途中で別ブランチに切り替えるときは、現在のブランチを必ず push してから切る

---

## 2. 平日ベースの実行スケジュール（残り 69h）

前提：2026-04-21 時点で残り 69h。稼働日は平日中心、1日4h前後（火曜は通院で3h、GW期間は1h/日）。

### 時間配分（合計 69h）

| Phase | 配分 | 目的 |
|-------|------|------|
| Phase 1（認証・レイアウト・共通UI） | 8h | モック再現、共通部品の先行実装 |
| Phase 2（申請・承認フロー） | 22h | 課題1の核。ここを最優先 |
| Phase 3（開発管理・予算管理 MVP） | 12h | タスク・予算の最小動作 |
| Phase 4（+α 最小） | 2h | ステッパーUI・レスポンシブ |
| Phase 5（資料・最終確認） | 20h | 利用マニュアル・プレゼン・提出 |
| 予備バッファ | 5h | 遅延吸収・回帰修正 |

### 週別スケジュール

#### Week 1: 4/21(火)〜4/24(金)（目安 15h）

| 日 | 予定 | 時間 | 主なタスク |
|----|------|------|-----------|
| 4/21(火) | 授業参観・通院 → 16時以降 | 3h | Phase 1 着手：`AuthenticatedLayout` 3セクション化、`StatusPill` 実装 |
| 4/22(水) | 通常 | 4h | 共通コンポーネント（`Tabs`, `ApprovalStepperMini`）、S-03a 骨組み |
| 4/23(木) | 通常 | 4h | `projects` migration・Model、`ProjectController` 雛形 |
| 4/24(金) | 通常 | 4h | Phase 1 完了判定・週次棚卸し、Phase 2 着手（`Projects/Create.tsx`） |

**Week 1 到達目標**：Phase 1 完了、Phase 2 の申請フォーム（S-05）実装着手

#### Week 2: 4/27(月)〜5/1(金)（目安 15h ※4/29 昭和の日は除く）

| 日 | 予定 | 時間 | 主なタスク |
|----|------|------|-----------|
| 4/27(月) | 通常 | 4h | `Projects/Create.tsx` 完成、バリデーション、保存処理 |
| 4/28(火) | 通院午前 | 3h | `Projects/Edit.tsx`、draft/rejected 時のみ編集可制御 |
| 4/29(水) | 昭和の日 | 0〜1h | （可能なら）ApprovalService の設計メモ |
| 4/30(木) | 通常 | 4h | `ApprovalService` 実装（submit / approveDept / approveHq / reject） |
| 5/1(金) | 通常 | 4h | `ApprovalDialog`（S-08）、承認待ち一覧フィルタ、週次棚卸し |

**Week 2 到達目標**：Phase 2 の中核（申請・編集・承認アクション）が動く状態

#### Week 3: 5/4(月)〜5/8(金) GW週（目安 11h）

| 日 | 予定 | 時間 | 主なタスク |
|----|------|------|-----------|
| 5/4(月) | みどりの日 | 1h | 通知機能のコード設計メモ |
| 5/5(火) | こどもの日 | 1h | 進捗確認・リファクタの目星 |
| 5/6(水) | 振替休日 | 1h | 軽作業（テストデータ整備など） |
| 5/7(木) | 通常 | 4h | `NotificationService`、通知一覧画面（S-12）、Feature テスト 1 本 |
| 5/8(金) | 通常 | 4h | **Phase 2 完了判定**、Phase 3 着手（`tasks` migration） |

**Week 3 到達目標**：**Phase 2 完全完了**、Phase 3 の DB 層着手

> この週でPhase 2 が完了しない場合は、最終週の Phase 3 を大幅削減する必要があるため、5/8 時点で進捗を厳密に判定する。

#### Week 4: 5/11(月)〜5/15(金) 最終週（目安 18h）

| 日 | 予定 | 時間 | 主なタスク |
|----|------|------|-----------|
| 5/11(月) | 通常 | 4h | Phase 3：`TaskFormDialog`（S-10）、タスクCRUD |
| 5/12(火) | 通院午前 | 3h | Phase 3：`BudgetActualDialog`（S-11）、予算タブ |
| 5/13(水) | 通常 | 4h | Phase 3 完了判定、Phase 4（ステッパー大型版・レスポンシブ） |
| 5/14(木) | 通常 | 4h | Phase 5：利用マニュアル、`Information.md`、デモデータ再投入 |
| 5/15(金) | **提出日** | 3h | プレゼン資料仕上げ、本番最終確認、提出 |

**Week 4 到達目標**：Phase 3 MVP 完了、Phase 4 最小、Phase 5 完了・提出

> **最終週は資料作成時間の確保を最優先**。Phase 3 が完了せずとも、資料が不完全なら評価されないため、5/13 を資料作成への切替え点とする。

### 週次チェックポイント（毎週金曜）

- 今週の実績時間（目標との差分）
- Phase ごとの完了率（%）
- ブロッカー（技術/仕様/時間）の有無
- 翌週の優先 3 タスクを確定
- `development_schedule.md` の「残り時間」「現在地」を更新

---

## 3. 次回作業予定（2026-04-22 水曜・Phase 1 2日目／目安 4h）

### 目的
- 共通コンポーネント第2弾（`Tabs`, `ApprovalStepperMini`, `EmptyState`）を完成させる
- `Projects/Index.tsx` にタブ切替 UI と、ダミーデータのテーブル骨組みを入れる
- Phase 2 着手（申請フォーム S-05）にスムーズに繋げる下地を作る

### 実行手順（当日の順番）

1. **事前確認**（5分）
   - `git checkout feat/phase1-layout`（ブランチ継続）、必要なら main をマージしてから作業
   - `php artisan serve` / `npm run dev` 起動、`/projects?tab=approval` で 3 ロール分の表示を実機確認
   - 昨日の Done 項目（サイドバー、StatusPill）がブラウザで崩れていないか目視確認

2. **`Tabs.tsx` 実装**（60分）
   - 配置：`resources/js/Components/Tabs.tsx`
   - Props：`value, onChange, items[{value, label, icon?, count?}]`
   - 下線アクティブ式。アクティブタブのカウントバッジは赤背景 `#FEE2E2 / #991B1B`、非アクティブは `bg-gray-100`
   - URL クエリ同期は親（`Projects/Index.tsx`）側で Inertia `router.visit` を呼ぶ設計（Tabs 自体は純粋な UI 部品に保つ）

3. **`ApprovalStepperMini.tsx` 実装**（50分）
   - 配置：`resources/js/Components/Approval/ApprovalStepperMini.tsx`
   - Props：`status: ProjectStatus, rejectedAt?: 'dept' | 'hq'`
   - 4ドット + 3ライン、現在位置はパルス（`animate-brand-pulse` を流用）
   - キャプション「申請 → **部門** → 本部 → 済」の現在位置強調

4. **`EmptyState.tsx` 実装**（20分）
   - 配置：`resources/js/Components/EmptyState.tsx`
   - Props：`icon, title, description?, action?`
   - テーブル 0 件時の中央寄せ定型

5. **`Projects/Index.tsx` のタブ切替 UI 組込**（70分）
   - `?tab=approval|dev|budget` に `Tabs` を同期、`filter=pending` 時のバッジ表示
   - ダミーデータ（5〜8件）でテーブルヘッダと行を描画（まだ空の行でも可。タブ列切替の骨だけ）
   - 承認待ちプリセット（`&filter=pending`）のタイトル下バッジ表示
   - `ApprovalStepperMini` を 1 行に仮配置して動作確認

6. **コミット & 日報更新**（20分）
   - `feat: phase1 common components (Tabs, ApprovalStepperMini, EmptyState)` 相当でコミット
   - `daily_report.md` 先頭に 4/22 分を追記、`development_schedule.md` のチェックリストを更新
   - `implementation_schedule.md §3` を 4/23 分に差し替えて push

### 判断理由（なぜこの順番か）

- `Tabs` が先に無いと `Projects/Index.tsx` の差替えが完結しないため先行実装
- `ApprovalStepperMini` は `Projects/Index.tsx` の申請タブ行に使うため同日作業
- `EmptyState` は軽量なので同じ日にまとめて消化（後続画面でも必ず使う）
- 4/23 に `projects` migration / Model / Controller 分岐、4/24 に週次棚卸し + Phase 2 着手、の流れを維持

### 完了条件（終了判定）

- [ ] `Tabs` が `?tab=approval|dev|budget` の URL と双方向同期する
- [ ] `Projects/Index.tsx` で 3 タブ切替がブラウザで動く（行の中身はダミーでよい）
- [ ] `ApprovalStepperMini` が 4 状態（draft/pending_dept/pending_hq/approved/rejected）で正しく表示される
- [ ] 承認待ちプリセット（`&filter=pending`）でタイトル下に「承認待ち」バッジが出る
- [ ] `npx tsc --noEmit` と `npm run build` が通る
- [ ] `feat/phase1-layout` に push、日報 3 ファイル更新済み

### 保留・課題（次々回に持ち越す）

- S-03a の `ProjectTable`（approval 列セット）本体は 4/23 に Controller/Model と同時着手
- 承認ステッパーの大型版（`ApprovalStepperFull`）は S-04 作成時（Phase 2）
- モバイル時のサイドバーはハンバーガー化（Phase 4）

---

## 4. 次々回以降の作業予定（ガイドライン）

### Phase 1 残り（Week 1 後半：4/22〜4/24）

1. **4/22(水) 4h**：
   - `Projects/Index.tsx` のタブ切替を整備（Laravel 側からタブ引数を受け取る形に）
   - `ProjectController@index` 雛形：ロール別クエリ分岐・タブ別カラム切替の骨組み
   - 承認待ちフィルタ（`filter=pending`）の Controller 側ロジック先行実装

2. **4/23(木) 4h**：
   - `projects` テーブル migration 作成（parent_project_id, revision, status 等すべて）
   - `Project` Model とリレーション（applicant, department, approvals, tasks）
   - `ProjectPolicy` の雛形（viewAny / view / update / delete）

3. **4/24(金) 4h**：
   - Phase 1 完了判定・Phase 1 チェックリスト全項目のチェック
   - Phase 2 着手：`Projects/Create.tsx` の骨組み（申請フォームUI）
   - 週次棚卸し：`development_schedule.md` 更新、翌週タスク確定

### Phase 2（Week 2〜Week 3 前半：4/27〜5/8）

Phase 2 は **22h** の大枠。以下の順で着実に進める。

1. **DB / Model 整備**（約3h）
   - `projects` / `approvals` / `notifications` migration・Model
   - Enum クラス（`ProjectStatus` / `ApprovalLevel` / `ApprovalAction` / `NotificationType`）

2. **申請側の画面**（約6h）
   - `Projects/Create.tsx`（S-05 新規申請）
   - `Projects/Edit.tsx`（S-06 編集、draft/rejected のみ）
   - `Projects/Show.tsx`（S-04 案件詳細、承認ステッパー大型表示）
   - `ProjectRequest`（FormRequest でバリデーション）

3. **承認側の画面**（約4h）
   - 承認待ち一覧のロール別フィルタ完成
   - `ApprovalDialog.tsx`（S-08）
   - 承認ステッパーの状態表示

4. **Service・Controller**（約5h）
   - `ApprovalService`：4 メソッド（submit / approveDept / approveHq / reject）
   - `ApprovalController`：approve / reject エンドポイント
   - 部門管理者が申請した場合の `pending_hq` 直行ロジック
   - 却下→再申請の新規レコードコピー（`parent_project_id` 連結）

5. **通知**（約2h）
   - `NotificationService`：承認・却下・差戻し時に通知発行
   - `Notifications/Index.tsx`（S-12）
   - トップバー通知バッジ（未読件数）

6. **検証・テスト**（約2h）
   - 3 ロール × ハッピーパス・エラーパスの手動確認
   - Feature テスト：承認フロー 1 本 + 権限境界 1 本

### Phase 3（Week 3 後半〜Week 4 前半：5/8〜5/13）

Phase 3 は **12h** の MVP 方針。**作成・保存・表示** を最優先、履歴・コメントは余裕があれば。

1. **DB / Model**（約2h）
   - `tasks` / `task_comments` / `task_histories` migration
   - Model・リレーション

2. **承認後ロックの実装**（約1h）
   - `ProjectPolicy::update` で status=approved 時に編集不可
   - `ApprovalService::approveHq` で `estimated_amount → budget_amount` 転記

3. **タスク管理 UI**（約4h）
   - `TaskFormDialog.tsx`（S-10 作成・編集モーダル）
   - `Projects/Show.tsx` にタスク一覧セクション追加
   - 進捗率入力 → 案件進捗率の自動算出（表示のみ）

4. **予算管理 UI**（約3h）
   - `BudgetActualDialog.tsx`（S-11 実績入力モーダル）
   - `BudgetController`（実績更新）
   - `Projects/Index.tsx` 予算タブの列セット・消費率表示・警告色

5. **検証**（約2h）
   - 承認前後のロック動作確認
   - タスク進捗・予算実績の反映確認

### Phase 4（Week 4 中盤：5/13）

Phase 4 は **2h** の最小実装。

1. 承認ステッパー UI（大型版）を案件詳細に組み込み
2. 主要 3 画面（案件一覧・案件詳細・申請フォーム）のレスポンシブ確認
3. タブレットサイズでの崩れを最低限修正

### Phase 5（Week 4 後半〜最終日：5/13〜5/15）

Phase 5 は **20h** を確保。

1. **ドキュメント**（約6h）
   - `doc/Information.md`（デプロイURL・テストアカウント）
   - 利用マニュアル（主要 4 フロー）
   - README 最終調整

2. **プレゼン資料**（約10h）
   - `doc/presentation_高橋朋子.md`
     - 課題1 工夫点（承認監査・再申請チェイン・自己承認防止・タブ共通化）
     - 課題2 プレゼン（優先度高：ステッパー、中：ダッシュボード案）
     - 感想・学び
   - PDF 化（必須ではないが推奨）

3. **最終確認・提出**（約4h）
   - 本番環境 DB リセット＋デモシード投入
   - 3 ロール × 全画面の本番動作確認
   - `php artisan test` がパスすること
   - main ブランチへマージ完了
   - GitLab / Laravel Cloud がダウンしていないこと確認
   - 5/15(金) の終業前に提出完了

---

## 5. 作業記録・次回作業テンプレ（記録用）

各回の作業後、以下テンプレを **下の「作業記録」セクション** に追記する。

```markdown
# 作業記録 YYYY-MM-DD（曜日）

## 今日の作業内容
・（実施した内容を箇条書き）

## 詰まった点・判断
・（技術的な課題と対処）

## 次回の作業予定
・（翌日に何をやるか、具体的に）

## Phase 進捗
- Phase X：XX% 完了（残りタスク：...）
```

---

## 6. 環境情報（参照用）

### 作業ディレクトリ
`C:\xampp\htdocs\ProjNexus`

### 開発サーバ起動
```powershell
# ターミナルA
php artisan serve

# ターミナルB
npm run dev
```

### DB 再初期化（必要時）
```powershell
php artisan migrate:fresh --seed
```

### `.env` 確認ポイント
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=projnexus
DB_USERNAME=root
DB_PASSWORD=
```

### デプロイ先
- URL: https://projnexus-main-butvrx.laravel.cloud
- リージョン: Asia Pacific (Singapore)
- Build: `composer install` / `npm ci` / `npm run build`
- Deploy: `php artisan migrate --force`（初回のみ db:seed 併用）

### テストアカウント
| ロール | メール | パスワード | 所属部門 |
|---|---|---|---|
| 申請者 | applicant@example.com | password | 開発1部 |
| 部門管理者 | dept@example.com | password | 開発1部 |
| 本部管理者 | hq@example.com | password | 本部 |

---

## 7. 作業記録（時系列、最新が下）

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
