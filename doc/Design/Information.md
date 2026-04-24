# Information

> デプロイ URL・テストアカウント・動作確認シナリオ等、運用情報をまとめたファイル。
> 実装・設計の詳細は `doc/Design/` 以下を参照。

---

## 1. デプロイ URL

> Laravel Cloud へのデプロイ完了後に更新する。

| 環境 | URL | 備考 |
|---|---|---|
| 本番 | （未デプロイ） | Laravel Cloud |
| ローカル | http://localhost/ProjNexus/public/ | XAMPP |

---

## 2. テストアカウント（シーダー投入済）

全アカウントのパスワードは `password`。

| ロール | 氏名 | メール | 所属部門 | 用途 |
|---|---|---|---|---|
| 申請者（主） | 申請 太郎 | applicant@example.com | 開発1部 | 単一動作確認 |
| 申請者 | 申請 次郎 | applicant2@example.com | 開発2部 | 権限境界検証 |
| 申請者 | 申請 三郎 | applicant3@example.com | 開発3部 | 権限境界検証 |
| 部門管理者（主） | 部門 花子 | dept@example.com | 開発1部 | 単一動作確認 |
| 部門管理者 | 部門 慎二 | dept2@example.com | 開発2部 | 権限境界検証 |
| 部門管理者 | 部門 美咲 | dept3@example.com | 開発3部 | 権限境界検証 |
| 本部管理者 | 本部 一郎 | hq@example.com | 本部 | 単一動作確認 |

実装は `database/seeders/UserSeeder.php` を参照。

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

### 3.4 権限境界検証
- `applicant2@example.com`（開発2部）の案件が `applicant@example.com`（開発1部）に見えないこと
- `dept2@example.com`（開発2部）から開発1部の案件が見えないこと
- `hq@example.com` からは全部門の案件が見えること

### 3.5 予算実績入力
- 承認済案件の主担当 `applicant@example.com` で `actual_amount` を更新
- 消費率が `actual_amount / budget_amount * 100` で表示されること

---

## 4. セットアップ / シーダー実行

```
php artisan migrate:fresh --seed
```

上記で DB 初期化 + 部門 / ロール / ユーザーを再投入する。

---

## 5. 関連ドキュメント

| 資料 | パス |
|---|---|
| Cursor 実装指示書 | `doc/Design/AI.md` |
| 要件定義 | `doc/Design/requirements.md` |
| 設計思想 | `doc/Design/design-philosophy.md` |
| ER 図 | `doc/Design/er_diagram.md` |
| 共通コンポーネント仕様 | `doc/Design/components_spec.md` |
