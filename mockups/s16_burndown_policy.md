# S-16 バーンダウンチャート 方針

## 構成

- **背景**: 課題2の可視化強化として、案件ごとの残作業推移を時系列で確認する
- **目的**: 「計画どおり減っているか」「遅延兆候があるか」を部門管理者・本部管理者が早期把握する
- **レイアウト**: AuthenticatedLayout（サイドバー「開発管理 > バーンダウン（課題2）」）
- **パンくず**: 開発管理 > バーンダウンチャート
- **URL案**: `/projects/{project}/burndown?range=30d|60d|custom`
- **表示単位**: 1案件単位（将来は部門横断ダッシュボードに統合）

---

## 1. 画面の役割

S-16 は「進捗入力UI」ではなく「進捗の監視UI」とする。

- S-10/S-14: タスク更新（入力）
- S-16: 残作業推移の可視化（分析）

---

## 2. グラフ仕様（初版）

### 2.1 系列

- **実績線（Actual Remaining）**
  - 日次時点の残作業量
- **理想線（Ideal Burn）**
  - 期間開始時の総量を終了日まで線形減少

### 2.2 軸

- X軸: 日付（日次）
- Y軸: 残作業量（人日）

### 2.3 完了判定

- `tasks.status = closed` を完了とみなす
- `resolved` は「確認待ち」のため未完了として残量に含める

### 2.4 残作業量の計算式（初版）

タスクごとに以下を算出し、当日の残作業量として合算する。

`remaining_days = max(estimated_days - actual_days, 0)`

補足:
- `estimated_days` が null のタスクは初版では集計対象外（除外件数を注記表示）
- 将来はポイント制（story point）への切替を許容

---

## 3. データソース方針

## 3.1 現行テーブルで可能な範囲

- `tasks`:
  - `status`, `estimated_days`, `actual_days`, `updated_at`, `project_id`
- `task_histories`:
  - `field_name`, `old_value`, `new_value`, `created_at`

現行テーブルのみでも「その時点の状態」を再構築して折れ線を描くことは可能。
ただし、更新が無い日は補間が必要で、集計ロジックが複雑になりやすい。

## 3.2 推奨追加テーブル（S-16 実装時）

バーンダウンを安定運用するため、日次スナップショットを持つ。

### `burndown_snapshots`（新規）

| カラム | 型 | 説明 |
|---|---|---|
| id | bigint PK | 主キー |
| project_id | bigint FK | 対象案件 |
| snapshot_date | date | 集計日（1日1件） |
| total_tasks | int | 対象タスク数 |
| closed_tasks | int | 完了タスク数 |
| remaining_days | decimal(8,2) | 残作業量（人日） |
| ideal_remaining_days | decimal(8,2) | 理想線の当日値 |
| scope_added_days | decimal(8,2) nullable | 当日追加スコープ（任意） |
| created_at / updated_at | timestamp | 監査用 |

制約:
- `unique(project_id, snapshot_date)`

---

## 4. 集計ジョブ方針

- コマンド案: `projects:aggregate-burndown`
- 実行: 日次 01:00（または業務時間外）
- 処理:
  1. 承認済案件（`projects.status=approved`）を対象抽出
  2. 各案件の `remaining_days` を算出
  3. 期間定義に基づき `ideal_remaining_days` を算出
  4. `burndown_snapshots` に upsert

---

## 5. 期間定義（重要）

初版は以下で固定し、解釈の揺れを防ぐ。

- 開始日: 案件の開発開始日（暫定: 本部承認日 `projects.approved_at`）
- 終了日: 案件の目標完了日（暫定: タスクの最大 `due_date`）
- 期間中にタスクが追加された場合:
  - 初版は理想線を再計算しない（差分は `scope_added_days` 注記）
  - 将来、スコープ変動対応モードを追加

---

## 6. ロール別アクセス

| ロール | 閲覧可否 | 範囲 |
|---|---|---|
| applicant | △ | 自分が主担当の案件のみ（任意） |
| dept_manager | ○ | 自部門案件 |
| hq_manager | ○ | 全部門案件 |

編集操作は持たない（閲覧専用）。

---

## 7. UI構成セクション（上から下へ）

1. ページヘッダー（案件名、PRJ-ID、期間、最終更新）
2. サマリーカード（残作業量、完了率、遅延リスク）
3. バーンダウングラフ（実績線 + 理想線）
4. 注記
   - 集計対象外タスク件数（見積なし）
   - スコープ追加量
5. 下部テーブル（日次明細）

---

## 8. 実装ファイル（予定）

| 区分 | ファイル | 内容 |
|---|---|---|
| 新規 | `database/migrations/2026_xx_xx_create_burndown_snapshots_table.php` | 日次集計テーブル |
| 新規 | `app/Console/Commands/AggregateBurndown.php` | 日次集計コマンド |
| 編集 | `routes/console.php` | 日次スケジューラ登録 |
| 新規 | `app/Http/Controllers/BurndownController.php` | 表示API/ページ返却 |
| 新規 | `resources/js/Pages/Projects/Burndown.tsx` | S-16 ページ |
| 新規 | `resources/js/Components/Charts/BurndownChart.tsx` | グラフ部品 |
| 編集 | `routes/web.php` | `/projects/{project}/burndown` ルート追加 |

---

## 9. 設計上のこだわり

- **まずは「日次スナップショット方式」**: 後から説明可能な数値を残す
- **入力系と分析系を分離**: 既存の S-10/S-14 を汚さない
- **4値ステータス整合**: `resolved` を未完了扱いに固定し、品質ゲートと矛盾させない
- **将来拡張を前提**: `budget_alert` と同様に、課題2実装時に段階導入できる形にする

---

## 10. 現時点の結論（テーブル設計の十分性）

- **可視化の試作だけなら** 現行 `tasks` + `task_histories` で実装可能
- **運用で使うバーンダウン** としては `burndown_snapshots` を追加する方が安全
- よって、S-16 着手時は「新規テーブル追加」を前提に設計を進める
/**更新完了**/