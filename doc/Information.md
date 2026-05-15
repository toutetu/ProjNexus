# Information

> 提出用ファイル — デプロイ URL・テストアカウント・動作確認シナリオ等をまとめたファイル。
> **レビュー対象:** `doc/` に置く **提出指定ファイル** と **本リポジトリのコード全体**。`doc/` には指定以外は置かない方針。
> 実装・設計の編集正本は **`materials/`**（詳細は **`materials/Design/`**）。日常更新は `materials/` で行い、提出時は指定どおり `doc/` に同期します。

---

## 0. クイックスタート（採点者向け）

1. **ログインURL**: <https://projnexus-main-butvrx.laravel.cloud/login>
2. **ログインID**: 下表のメールアドレス（例: `applicant@example.com`）
3. **パスワード**: **`password`**（**全 10 アカウント共通**）
4. 最初に試すシナリオ: §3.1 基本フロー（申請 → 部門承認 → 本部承認）

---

## 1. デプロイ URL

| 環境 | URL | 備考 |
|---|---|---|
| 本番（トップ） | <https://projnexus-main-butvrx.laravel.cloud> | Laravel Cloud。未ログイン時は自動で `/login` に遷移 |
| ログイン画面 | <https://projnexus-main-butvrx.laravel.cloud/login> | 採点時はこちらから直接アクセス推奨 |

- **提出本体**: GitLab `quest_1` リポジトリの `main` ブランチ（採点対象）。
- **デプロイ連携元（参考）**: GitHub の個人プライベートリポジトリ `https://github.com/toutetu/ProjNexus` — Laravel Cloud との連携専用で、採点者のアクセスは不要です。

---

## 2. テストアカウント

> **ログインID = 下表のメールアドレス／パスワード = `password`（全 10 アカウント共通）**



### 2.1 テストアカウント、全アカウント一覧（`UserSeeder::run` 投入分・計 10 件）

| No | メール | 氏名 | ロール | 部門 | 備考 |
|----|--------|------|--------|------|------|
| 1 | `applicant@example.com` | 高橋 朋子 | `applicant` | 開発1部 | 主シナリオ・`ProjectSeeder` 等の代表申請者 |
| 2 | `applicant-dev1-02@example.com` | 佐藤 美咲 | `applicant` | 開発1部 | 開発1部の追加申請者（S-14 想定など） |
| 3 | `applicant-dev1-03@example.com` | 井上 翔 | `applicant` | 開発1部 | 同上 |
| 4 | `applicant-dev1-04@example.com` | 鈴木 実 | `applicant` | 開発1部 | 同上 |
| 5 | `dept@example.com` | 夏目 拓也 | `dept_manager` | 開発1部 | 主シナリオ・開発1部の部門管理者 |
| 6 | `hq@example.com` | 本部 一郎 | `hq_manager` | 本部 | 主シナリオ・本部管理者 |
| 7 | `applicant2@example.com` | 申請 次郎 | `applicant` | 開発2部 | 他部門・権限境界の手動確認用 |
| 8 | `dept2@example.com` | 部門 慎二 | `dept_manager` | 開発2部 | 同上 |
| 9 | `applicant3@example.com` | 申請 三郎 | `applicant` | 開発3部 | 同上 |
| 10 | `dept3@example.com` | 部門 由美 | `dept_manager` | 開発3部 | 同上 |

**正本**: `database/seeders/UserSeeder.php`。`database/seeders/DatabaseSeeder.php` では `DepartmentSeeder` → `RolePermissionSeeder` → **`UserSeeder`** の順で呼ばれる。メール・氏名・所属・ロールの変更があればシーダーを先に直し、下表を追随する。
- **部門**: `DepartmentSeeder` が `name` として投入する **`本部`**（`type` = 本部）と **`開発1部` / `開発2部` / `開発3部`**（いずれも部門タイプ）。`UserSeeder` は `Department::where(...)` で上記名のレコードを参照して `department_id` を付与する。
- **ロール**: `syncRoles` に渡るのは `App\Enums\Role` の値（**`applicant`** / **`dept_manager`** / **`hq_manager`**）。画面表示は「申請者」「部門管理者」「本部管理者」に相当。
- **投入ブロック**（`UserSeeder::run` とコメント一致）: 開発1部に申請者 4 名＋部門管理者 1 名、本部に本部管理者 1 名、続けて「他部門の検証用」として開発2部・開発3部に計 4 名。
- **パスワード（再掲）**: 下表の **全 10 アカウント** で共通 **`password`**（`UserSeeder` 内の各 `User::updateOrCreate` で `Hash::make('password')`）。

### 2.2 分類メモ（上表の読み方）

- **No 1〜6**: 主シナリオ（申請→承認→開発／予算）の既定アカウント。
- **No 7〜10**: 開発2部・開発3部に所属する **境界検証用**（§3.5 など）。主シナリオのデータとは独立した部門に配置。

---

## 3. 動作確認シナリオ

### 3.1 基本フロー（申請 → 部門承認 → 本部承認）
1. `applicant@example.com` でログイン → 新規申請を作成・提出
2. `dept@example.com` でログイン → 部門承認
3. `hq@example.com` でログイン → 本部承認
4. ステータスが `approved` になり、タスク作成・予算実績入力が解禁されることを確認

### 3.2 部門承認スキップ（部門管理者が申請者の場合）
1. `dept@example.com` で新規申請 → 直接 `pending_hq` に遷移することを確認
2. `hq@example.com` で承認

### 3.3 却下 → 再申請
1. `applicant@example.com` で申請
2. `dept@example.com` で却下（コメント付き）
3. `applicant@example.com` で再申請 → `parent_project_id` で元案件と紐づき、`revision` が +1 されることを確認

### 3.4 申請取り戻し（take back）
1. `applicant@example.com` で申請提出し `pending_dept` にする
2. 部門承認前に申請者で「取り戻し」を実行
3. ステータスが `draft` に戻り、再編集・再提出できることを確認

### 3.5 権限境界検証（案件閲覧）
- `applicant2@example.com`（開発2部）の案件が `applicant@example.com`（開発1部）に見えないこと
- `dept2@example.com`（開発2部）から開発1部の案件が見えないこと
- `hq@example.com` からは全部門の案件が見えること

### 3.6 予算実績入力（課題1: 上書き方式）
1. 承認済かつ `budget_amount` が設定済みの案件を開く
2. 主担当 `applicant@example.com` で `actual_amount` を更新できることを確認
3. 同部門の部門管理者 `dept@example.com` でも更新できることを確認
4. それ以外のユーザーでは更新不可（403）であることを確認
5. 消費率が `actual_amount / budget_amount * 100` で再計算表示されることを確認

### 3.7 S-14 タスク一覧（3ビュー）
1. `dept@example.com` でログインし `/member-tasks?view=members` を開く
2. ビュートグルで `カンバン / メンバー別 / 一覧` の3ビューを切替できることを確認
3. 一覧ビュー（`view=list`）で、以下の列が表示されることを確認
   - タイトル / 種類 / 優先度 / ステータス（進捗バー付き） / 担当 / 確認者 / 期日
4. キーワード + 各フィルタ（部門/担当/案件/優先度/期日）が併用できることを確認
5. 行またはカードクリックで `ProjectTaskDialog` が開くことを確認

### 3.8 S-14 ロール別表示差分
1. `hq@example.com` で `/member-tasks` を開き、部門未選択時は一覧を出さず「部門選択が必要」の状態になることを確認
2. `applicant@example.com` で `/member-tasks?view=board` を開き、**自部門の承認済み案件に紐づくタスク**が表示されることを確認（主担当・担当・確認者以外の同部門案件のタスクも閲覧可。**編集・DnD** は `canUpdate` が真のカード／モーダルのみ）
3. `dept@example.com` で `/member-tasks?view=members` を開き、同部門タスク全体が表示されることを確認

### 3.9 案件詳細（開発管理タブ）の確認
1. 承認済案件の詳細 `.../projects/{id}?detailTab=tasks` を開く
2. タスク一覧のフィルタ帯が見出し直下に表示されることを確認
3. フィルタに `確認者` と `期日（3日以内 / 7日以内 / 日付指定）` があることを確認
4. ステータス列で全タスクに進捗バーが表示されることを確認

### 3.10 タスク4値ステータス遷移と権限
1. 担当者で `in_progress -> resolved` が可能であることを確認
2. 担当者で `resolved -> closed` は不可（確認者のみ可）であることを確認
3. 確認者で `resolved -> closed` が可能であることを確認
4. 一般ユーザーで `closed -> open` は不可であることを確認。再オープンは **部門管理者のみ** 可、**本部管理者は不可**（閲覧のみ）であることを確認
5. `resolved` へ変更時、確認者未設定ならバリデーションエラーになることを確認

### 3.11 タスク通知（割当・完了報告・確認OK）
1. タスク作成時に担当者を自分以外へ設定し、担当者に `task_assigned` 通知が届くことを確認
2. ステータスを `resolved` に変更し、確認者に `task_resolved` 通知が届くことを確認
3. 確認者が `closed` に変更し、担当者と申請者に `task_reviewed` 通知が届くことを確認

### 3.12 通知一覧と既読化
1. `/notifications` で通知が新しい順・ページネーション付きで表示されることを確認
2. 自分の通知を既読化すると `read_at` が設定されることを確認
3. 他ユーザーの通知IDに対する既読APIは 403 になることを確認

### 3.13 認証後導線
1. 未ログインで `/` にアクセスすると `/login` へ遷移することを確認
2. ログイン済みで `/` にアクセスすると `/dashboard` へ遷移し、ダッシュボード（S-02）が表示されることを確認（`/dashboard` から案件一覧への自動リダイレクトは **ない**）
3. ナビまたは URL 直打ちで `/projects?tab=approval` に遷移できることを確認

### 3.14 本部管理者のタスク閲覧のみ（実装済み）

`hq_manager` はタスクの **閲覧のみ**（S-14・案件詳細タスクタブ・履歴の閲覧）。タスクの新規作成・編集・削除・ステータス変更・コメント投稿・完了タスクの再オープンは **不可**。

確認手順（2026-05-12 実装反映後）:
1. `hq@example.com` で承認済案件の詳細（`?detailTab=tasks`）を開き、タスクを閲覧できることを確認
2. 同画面で「タスク追加」や既存タスク保存ができないことを確認（閲覧専用）
3. `/member-tasks` でカードDnDによるステータス変更ができないことを確認
4. タスクコメント投稿が不可（403）であることを確認
5. `closed -> open` の再オープンが不可（403）であることを確認

---

## 4. セットアップ / シーダー実行

```
php artisan migrate:fresh --seed
```

上記で DB 初期化 + 部門 / ロール / ユーザー / 案件（`ProjectSeeder`）/ デモ負荷（`DemoWorkloadSeeder`）を再投入する。

### 4.1 本番のみ 500 になりローカルでは再現しない場合

- **通知 INSERT と ENUM のずれ:** 本番 MySQL で `notifications.type` が ENUM のままだと、PHP の `NotificationType` と列定義が一致しないときに SQL 例外で 500 になることがある（PHPUnit の SQLite では再現しにくい）。対策として `2026_05_08_120000_notifications_type_to_varchar_mysql.php` で MySQL 上の `type` を `VARCHAR(64)` に変更する。**デプロイ後に `php artisan migrate` が成功しているか** Laravel Cloud のログとマイグレーション履歴で確認する。
- **調査:** Laravel Cloud のアプリログで該当リクエスト時刻の `SQLSTATE` / スタックトレースを確認する。

---

## 5. 関連ドキュメント

設計・日次・マニュアルの **編集の正本** はリポジトリ内の `materials/` 配下です（アプリの `/manual` は `materials/manual/` を参照）。

| 資料 | パス |
|---|---|
| Cursor 向け入口（作業ルール・モック一覧） | `materials/Design/AI.md` |
| **システム仕様（スコープ・DB・権限・承認の正本）** | **`materials/Design/system_spec.md`** |
| 次回作業・優先改修リスト（運用） | `materials/daily_reports/implementation_schedule.md` §3 |
| 要件定義 | `materials/quest/requirements.md` |
| 画面遷移 | `materials/Design/screen_flow.md` |
| 設計思想 | `materials/Design/design-philosophy.md` |
| ER 図 | `materials/Design/er_diagram.md` |
| デザインシステム（カラー・ステータス色・インタラクション等。**209–247行**はプロンプト用仕様） | `materials/Design/design_system.md` |
| 共通コンポーネント仕様 | `materials/Design/components_spec.md` |
| ロール別機能マトリクス（本部タスク閲覧のみの方針含む） | `materials/Design/role_feature_matrix_.md` |
| 利用マニュアル（アプリ `/manual` が読み込む） | `materials/manual/user_manual.md` |
| 各画面 設計方針（詳細） | `mockups/*.md` |