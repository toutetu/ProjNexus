# Information

> デプロイ URL・テストアカウント・動作確認シナリオ等、運用情報をまとめたファイル。
> 実装・設計の詳細は `doc/Design/` 以下を参照。

---

## 1. デプロイ URL

| 環境 | URL | 備考 |
|---|---|---|
| 本番 | https://projnexus-main-butvrx.laravel.cloud | Laravel Cloud |
| ローカル | http://localhost/ProjNexus/public/ | XAMPP |

### 1.0 時刻表示の運用（2026-05-08 追記）
- 履歴・更新時刻は **日本時間（JST）** を基準とする
- アプリ設定: `config/app.php` の `timezone` は `env('APP_TIMEZONE', 'Asia/Tokyo')`
- 設定変更時は `php artisan config:clear` を実行して反映する

### 1.1 ルートアクセス時の挙動
- `/` は Welcome 画面を表示せず、以下にリダイレクトする
  - 未ログイン: `login`
  - ログイン済み: `dashboard`（実際の遷移先は案件一覧）

### 1.2 案件詳細のクエリ（実装）
- URL: `/projects/{id}?detailTab={apply|tasks|budget|history}`
- 一覧からの初期タブ: 申請タブ流入 → `apply`、開発タブ → `tasks`、予算タブ → `budget`
- 互換: `?detailTab=overview` は実装上 **`apply`（申請タブ）と同義**（`resources/js/Pages/Projects/Show.tsx` の `parseDetailTab`）

### 1.3 サイドバーのロール説明（2026-05-12）
- サイドバー下部のユーザーカードに、ログイン中ユーザーのロール説明を表示する
  - 申請者: 「案件の申請・進捗/予算入力を担当」
  - 部門管理者: 「自部門案件の承認と運用を担当」
  - 本部管理者: 「全社案件の最終承認と全体閲覧を担当」
- 表示位置: 氏名 / `ロール名 / 部門名` の下段

### 1.4 プロフィール画面のロール表記（2026-05-12）
- URL: `/profile`
- 「アカウント情報（表示のみ）」に **ロール** 行を追加（読み取り専用）
- Spatie の複数ロールは日本語ラベルを **` / `（スペース・スラッシュ・スペース）** で連結して表示（例: `申請者 / 部門管理者`）

---

## 2. テストアカウント

テストアカウントの最新情報は、必ずシーダーを参照すること。

- 参照先: `database/seeders/UserSeeder.php`
- パスワード: `database/seeders/UserSeeder.php` の定義を正とする

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
2. `applicant@example.com` で `/member-tasks?view=board` を開き、自分が `assignee_id` または `reviewer_id` のタスクのみ表示されることを確認
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
2. ログイン済みで `/dashboard` にアクセスすると `/projects?tab=approval` へリダイレクトされることを確認

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

上記で DB 初期化 + 部門 / ロール / ユーザーを再投入する。

### 4.1 本番のみ 500 になりローカルでは再現しない場合

- **通知 INSERT と ENUM のずれ:** 本番 MySQL で `notifications.type` が ENUM のままだと、PHP の `NotificationType` と列定義が一致しないときに SQL 例外で 500 になることがある（PHPUnit の SQLite では再現しにくい）。対策として `2026_05_08_120000_notifications_type_to_varchar_mysql.php` で MySQL 上の `type` を `VARCHAR(64)` に変更する。**デプロイ後に `php artisan migrate` が成功しているか** Laravel Cloud のログとマイグレーション履歴で確認する。
- **調査:** Laravel Cloud のアプリログで該当リクエスト時刻の `SQLSTATE` / スタックトレースを確認する。

---

## 5. 関連ドキュメント

| 資料 | パス |
|---|---|
| Cursor 向け入口（作業ルール・モック一覧） | `doc/Design/AI.md` |
| **システム仕様（スコープ・DB・権限・承認の正本）** | **`doc/Design/system_spec.md`** |
| 次回作業・優先改修リスト（運用） | `doc/daily/implementation_schedule.md` §3 |
| 要件定義 | `doc/Design/requirements.md` |
| 画面遷移 | `doc/Design/screen_flow.md` |
| 設計思想 | `doc/Design/design-philosophy.md` |
| ER 図 | `doc/Design/er_diagram.md` |
| 共通コンポーネント仕様 | `doc/Design/components_spec.md` |
| ロール別機能マトリクス（本部タスク閲覧のみの方針含む） | `doc/Design/role_feature_matrix_.md` |
| 各画面 設計方針（詳細） | `mockups/*.md` |
/**更新完了**/