# implementation_schedule 作業ログ

`doc/daily/implementation_schedule.md` から技術的な日次の詳細作業記録を分離したログです。  
最新の予定・進行管理は `implementation_schedule.md` を参照してください。

## 2026-05-01（金）— タスク変更履歴（task_histories）自動記録・UI・設計書同期

### 実装概要
- **`TaskHistoryService`（新規）**
  - `recordCreation`：タスク作成時に追跡5項目（`status`, `progress_rate`, `assignee_id`, `due_date`, `priority`）をそれぞれ1行記録。`old_value` は null、`new_value` は画面表示と同一の文字列（例: 未着手、45%、担当者名、`Y-m-d`、高/中/低）
  - `recordChanges`：更新前スナップショットと更新後を比較し、差分のみ INSERT
  - `displaySnapshot`：コントローラが更新前状態を取得するため公開
- **呼び出し元**
  - `ProjectTaskController` の `store` / `update`
  - `ApprovalService` の本部承認後初期タスク（`実装計画作成`）作成直後
- **フロント（`Projects/Show.tsx`）**
  - タスク一覧テーブルに展開列を追加し、行展開で `task_histories` を一覧表示
  - 履歴タブのタイムライン用 `historyValueLabel` を、表示用文字列保存に合わせて調整（`progress_rate` の二重 `%` 回避、`resolved` ラベル）
- **テスト**: `tests/Feature/TaskHistoryTest.php`（作成5件・更新差分の2ケース）
- **ローカル検証**: `composer install` / `npm install` / `npm run build` / `migrate:fresh --seed`、ブラウザ確認

### 主要変更ファイル
- `app/Services/TaskHistoryService.php`（新規）
- `app/Http/Controllers/ProjectTaskController.php`
- `app/Services/ApprovalService.php`
- `resources/js/Pages/Projects/Show.tsx`
- `tests/Feature/TaskHistoryTest.php`（新規）
- `doc/Design/*.md`（AI / requirements / design-philosophy / screen_flow / er_diagram / components_spec）

### 検証
- `php artisan test` 全件通過（当時点）
- `read_lints` 対象ファイルで問題なし

---

## 2026-04-30（木）— 権限制御調整・通知拡張・承認後初期タスク自動化

### 実装概要
- **下書き案件の閲覧制御を厳格化**
  - 下書き（`draft`）は申請者のみ閲覧可能に統一
  - 一覧の可視範囲（query scope）と直接URLアクセス（policy）の両方で制御
- **下書き保存時のバリデーション緩和**
  - 下書き保存（`submit_action=draft`）はタイトルのみ必須
  - 申請時（`submit`）は従来どおり必須項目チェックを維持
- **案件一覧の操作性改善**
  - 申請/開発/予算タブの件数を実データで表示
  - 一覧タブから詳細遷移時に対応タブを初期表示する導線へ統一
  - 一覧行末の `>` アイコンを削除し、情報ノイズを低減
- **案件詳細の表示調整**
  - 履歴表示を古い順へ変更
  - タスク進捗バーを4段階配色（緑/青/橙/赤）へ統一
- **タスク通知機能（課題1最小）を追加**
  - `task_assigned`：担当割当/変更時に通知
  - `task_completed`：完了時に関係者へ通知
  - `task_due_soon`：期限当日/3日前を日次コマンドで通知（重複防止あり）
- **本部承認後の初期タスク自動作成**
  - HQ最終承認時に「実装計画作成（見積3人日）」を自動作成
  - 既存同名タスクがある場合は重複作成しない

### 主要変更ファイル
- `app/Models/Project.php`
- `app/Policies/ProjectPolicy.php`
- `app/Http/Controllers/ProjectController.php`
- `app/Http/Controllers/ProjectTaskController.php`
- `app/Services/ApprovalService.php`
- `app/Services/NotificationService.php`
- `app/Enums/NotificationType.php`
- `app/Console/Commands/NotifyTaskDueSoon.php`
- `routes/console.php`
- `resources/js/Pages/Projects/Index.tsx`
- `resources/js/Pages/Projects/Show.tsx`
- `resources/js/Pages/Projects/Create.tsx`
- `resources/js/Pages/Projects/Edit.tsx`
- `resources/js/Pages/Notifications/Index.tsx`
- `database/migrations/2026_04_30_190000_update_notifications_type_enum.php`
- `database/seeders/ProjectSeeder.php`
- `database/seeders/DatabaseSeeder.php`

### 設計ドキュメント更新
- `doc/Design/AI.md`
- `doc/Design/components_spec.md`
- `doc/Design/design-philosophy.md`
- `doc/Design/er_diagram.md`
- `doc/Design/requirements.md`
- `doc/Design/screen_flow.md`

### 検証・補足
- SQLite環境での enum 変更非対応に対して、migration 側で driver 判定を追加して回避
- フロント反映遅延は `npm run build` とブラウザハードリロードで解消
- TypeScript / build / test の通過を確認済み（当該修正群の反映時点）
