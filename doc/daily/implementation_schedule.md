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

## 3. 次回作業予定（2026-04-21 火曜・Phase 1 初日）

### 目的
- `AuthenticatedLayout` を 3 セクションサイドバー構造に改修し、モック（s03a）の骨格を再現する
- 共通コンポーネント（`StatusPill`, `Tabs`, `ApprovalStepperMini`）の雛形を先行実装する
- Phase 2 着手時に「画面は形になっている、あとは Laravel と繋ぐだけ」の状態を作る

### 実行手順（当日の順番）

1. **事前確認**（5分）
   - `git pull` で最新を取り込み
   - `php artisan serve` / `npm run dev` が起動することを確認
   - ブラウザで `/projects?tab=approval` が表示されることを確認

2. **shadcn/ui の基本導入**（30分）
   ```powershell
   cd C:\xampp\htdocs\ProjNexus
   npx shadcn@latest init
   npx shadcn@latest add button input dialog table badge select
   ```
   - `components.json` が生成されることを確認
   - `resources/js/Components/ui/` に各コンポーネントが追加されることを確認

3. **`AuthenticatedLayout.tsx` を 3 セクション化**（60分）
   - 参照モック：`mockups/s03a_projects_approval.html`
   - 参照設計：`doc/Design/CLAUDE.md §5 ナビゲーション・画面構成`
   - セクション：
     - 申請・承認：新規申請 / 承認待ち一覧 / 案件一覧（申請タブ）
     - 開発管理：案件一覧（開発タブ）
     - 予算管理：案件一覧（予算タブ）
     - 共通（下部）：通知 / プロフィール
   - `usePage().props.auth.user.roles` でロール別に表示切替

4. **共通コンポーネント 3 点**（60分）
   - `resources/js/Components/StatusPill.tsx`：6 ステータス分の色分け（設計は `design_system.md`）
   - `resources/js/Components/Tabs.tsx`：`/projects?tab=xxx` の URL 連動（`useRoute` + `router.get`）
   - `resources/js/Components/ApprovalStepperMini.tsx`：申請→部門→本部→承認 の 4 段・小型表示

5. **`Projects/Index.tsx` のタブ切替骨組み**（30分）
   - URL クエリ `?tab=approval|dev|budget` で条件分岐
   - ダミーデータで Table を表示
   - 見出しに `StatusPill` サンプルを置き、色が正しいか確認

6. **コミット＆日報更新**（15分）
   - `git add` → `git commit -m "feat: layout and common components for Phase 1"`
   - `doc/daily/daily_report.md` に日報を先頭に追記
   - `doc/daily/development_schedule.md` の「現在地」「今週の目標」を更新

### 判断理由（なぜこの順番か）

- `AuthenticatedLayout` を先に整えると、以降すべての画面で同じ土台が使えるため、Phase 2 以降の手戻りが減る
- 共通コンポーネントを Phase 1 のうちに作ると、Phase 2〜3 の各画面で組み合わせて使えるだけになる
- shadcn/ui は 1 度入れれば後から `add` で追加できるため、最初に `init` だけ済ませておく
- ダミーデータで骨組みを作ることで、Laravel 側の実装前に UI を検証できる

### 完了条件（終了判定）

- [ ] `AuthenticatedLayout.tsx` が 3 セクション構造で表示される
- [ ] ログインユーザーのロールによってメニュー項目が切り替わる
- [ ] `/projects?tab=approval|dev|budget` の URL でタブが切り替わる
- [ ] `StatusPill` が 6 ステータスすべてで適切な色表示になる
- [ ] `ApprovalStepperMini` が 4 段階で表示される
- [ ] TypeScript エラー・コンソールエラーがゼロ
- [ ] `git push` まで完了、`development_schedule.md` の「現在地」を更新

### 保留・課題（次回に持ち越す）

- ロール別メニュー表示の詳細（特に承認待ち一覧の文脈バッジ）は Phase 2 で実装
- モバイル時のハンバーガーメニューの動作は Phase 4 に回す
- shadcn/ui のテーマカラー（primary 等）は暫定で、デザインレビュー時に調整

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
