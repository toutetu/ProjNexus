# シーダー シナリオパターン（案件・タスク・通知）

> 本ドキュメントは **`ProjectSeeder` / `DemoWorkloadSeeder` で再構築するデモデータのシナリオ仕様** です。
> **対象**: 案件 (`projects` + `approvals`)、タスク (`tasks`)、通知 (`notifications`)。
> **対象外（変更しない）**: `UserSeeder` / `DepartmentSeeder` / `RolePermissionSeeder`。
> **正本との関係**: スコープ・状態遷移・通知タイプの正本は `materials/Design/system_spec.md` と `materials/Design/er_diagram.md`。本ファイルはそれらを満たすデータ網羅のための **シナリオ列挙**。

---

## 1. 前提

### 1.1 シーダーの責務

| シーダー | 役割 | 変更 |
|---------|------|:---:|
| `DepartmentSeeder` | 部門マスタ（開発1部 / 開発2部 / 開発3部 / 本部） | ✕ |
| `RolePermissionSeeder` | Spatie のロール・権限 | ✕ |
| `UserSeeder` | テストユーザー（10 名・ログイン正本） | ✕ |
| `ProjectSeeder` | 案件 `PRJ-SEED-*` と承認履歴 | ○ |
| `DemoWorkloadSeeder` | 案件 `PRJ-DEMO-*`（3 件）・全承認済案件のタスク・全通知 | ○ |

### 1.2 既存ユーザー（全 10 名・`UserSeeder` 正本）

| 氏名 | メール | 部門 | ロール |
|------|--------|------|--------|
| 高橋 朋子 | `applicant@example.com` | 開発1部 | 申請者（主） |
| 佐藤 美咲 | `applicant-dev1-02@example.com` | 開発1部 | 申請者 |
| 井上 翔 | `applicant-dev1-03@example.com` | 開発1部 | 申請者 |
| 鈴木 実 | `applicant-dev1-04@example.com` | 開発1部 | 申請者 |
| 夏目 拓也 | `dept@example.com` | 開発1部 | 部門管理者 |
| 申請 次郎 | `applicant2@example.com` | 開発2部 | 申請者 |
| 部門 慎二 | `dept2@example.com` | 開発2部 | 部門管理者 |
| 申請 三郎 | `applicant3@example.com` | 開発3部 | 申請者 |
| 部門 由美 | `dept3@example.com` | 開発3部 | 部門管理者 |
| 本部 一郎 | `hq@example.com` | 本部 | 本部管理者 |

### 1.3 パターン展開ルール

- **同一シナリオ＝2 パターン**（A / B）。
- A は標準ケース（主に開発1部）、B は別部門・別申請者・別金額レンジの複製ケース。
- 状態 (`status`)・承認履歴 (`approvals`)・タイムスタンプ (`submitted_at` / `approved_at` / `rejected_at`)・予算系列 (`estimated_amount` / `budget_amount` / `actual_amount`) を整合させる。

---

## 2. 案件（projects）シナリオパターン

各シナリオを **A / B の 2 件ずつ生成**。プロジェクトコードは `PRJ-SEED-NNNN`（連番）。再申請チェイン（P-12 / P-13）は親子各 2 件ずつ生成する。

| # | シナリオ | 主な状態・属性 | A 担当 | B 担当 |
|---|---------|---------------|--------|--------|
| P-01 | 下書き（一般申請者起票） | `draft`、`submitted_at=null` | 開発1部 / 高橋 | 開発2部 / 申請次郎 |
| P-02 | 下書き（部門管理者起票） | `draft`、起票者=部門管理者 | 開発1部 / 夏目 | 開発3部 / 由美 |
| P-03 | 部門承認待ち（通常経路） | `pending_dept`、`submitted_at`あり | 開発1部 / 高橋 | 開発3部 / 申請三郎 |
| P-04 | 本部承認待ち（部門承認済・通常経路） | `pending_hq`、`approvals=[dept:approved]` | 開発1部 / 佐藤 | 開発2部 / 申請次郎 |
| P-05 | 本部承認待ち（本部直行） | `pending_hq`、申請者=部門管理者、`approvals=[]` | 開発1部 / 夏目 | 開発3部 / 由美 |
| P-06 | 承認済（通常経路） | `approved`、`budget_amount`確定、消費率 約 30% | 開発1部 / 高橋 | 開発2部 / 申請次郎 |
| P-07 | 承認済（本部直行経由） | `approved`、申請者=部門管理者、消費率 約 45% | 開発1部 / 夏目 | 開発3部 / 由美 |
| P-08 | 承認済（消費率 70% 超・予算アラート相当） | `approved`、消費率 約 78%（赤バッジ） | 開発1部 / 井上 | 開発3部 / 申請三郎 |
| P-09 | 承認済（消費率 100% 超・予算超過） | `approved`、消費率 約 108% | 開発2部 / 申請次郎 | 開発1部 / 鈴木 |
| P-10 | 却下（部門却下） | `rejected`、`approvals=[dept:rejected]`、コメント有 | 開発1部 / 佐藤 | 開発2部 / 申請次郎 |
| P-11 | 却下（本部却下） | `rejected`、`approvals=[dept:approved, hq:rejected]` | 開発1部 / 高橋 | 開発3部 / 申請三郎 |
| P-12 | 再申請チェイン（却下 → 再申請 → 承認済） | 親 `rejected` + 子 `approved`、`parent_project_id` 連結、`revision=2` | 開発2部 / 申請次郎 | 開発3部 / 申請三郎 |
| P-13 | 再申請チェイン（却下 → 再申請 → 再却下） | 親 `rejected` + 子 `rejected`、`revision=2` | 開発1部 / 井上 | 開発2部 / 申請次郎 |

### 2.1 集計

| 項目 | 件数 |
|------|------|
| シナリオ数 | 13 |
| 単独案件（P-01〜P-11）× 2 パターン | 22 件 |
| 再申請チェイン（P-12 / P-13）親子 × 2 パターン | 8 件 |
| **PRJ-SEED-* 合計** | **30 件** |
| `DemoWorkloadSeeder` の PRJ-DEMO-EAM / DASH / AUTH | 3 件 |
| **案件 総合計** | **33 件** |

### 2.2 ステータス別内訳

| ステータス | 件数 | 内訳 |
|------------|:----:|------|
| `draft` | 4 | P-01×2 + P-02×2 |
| `pending_dept` | 2 | P-03×2 |
| `pending_hq` | 4 | P-04×2 + P-05×2 |
| `approved` | **13** | P-06×2 + P-07×2 + P-08×2 + P-09×2 + P-12 子×2 + PRJ-DEMO×3 |
| `rejected` | 10 | P-10×2 + P-11×2 + P-12 親×2 + P-13 親×2 + P-13 子×2 |

> **タスク割り当ての母集合は `approved` 13 件**（PRJ-SEED-* 10 件 + PRJ-DEMO-* 3 件）。

---

## 3. タスク（tasks）シナリオパターン

### 3.1 割り当て要件

- **承認済 13 案件すべてに対し、全 10 ユーザーを担当者または確認者として割り当てる**。
- 各承認済案件 1 件につき、`T-01〜T-14` のシナリオを網羅して **14 タスク** を生成。
- `assignee_id` は全 10 ユーザーを巡回（T-10 のみ未割当）。
- `reviewer_id` は同部門の部門管理者を基本に、T-14 では巡回（別ユーザー）。

### 3.2 シナリオ一覧（各承認済案件で網羅）

| # | シナリオ | `status` | `progress_rate` | `due_date` | 担当 | 確認 |
|---|---------|---------|:---:|------------|:----:|:----:|
| T-01 | 未着手・将来期限 | `open` | 0 | 今日 +18 日 | 巡回 | 部門長 |
| T-02 | 未着手・期限間近（3 日以内） | `open` | 0 | 今日 +2 日 | 巡回 | 部門長 |
| T-03 | 未着手・期限超過 | `open` | 0 | 今日 −3 日 | 巡回 | 部門長 |
| T-04 | 未着手・期限未設定 | `open` | 0 | `null` | 巡回 | 部門長 |
| T-05 | 進行中・初期段階 | `in_progress` | 22 | 今日 +7 日 | 巡回 | 部門長 |
| T-06 | 進行中・終盤 | `in_progress` | 75 | 今日 +2 日 | 巡回 | 部門長 |
| T-07 | 進行中・期限超過 | `in_progress` | 50 | 今日 −2 日 | 巡回 | 部門長 |
| T-08 | 確認待ち（resolved） | `resolved` | 95 | 今日 +1 日 | 巡回 | 部門長 |
| T-09 | 完了（closed） | `closed` | 100 | 今日 −5 日 | 巡回 | 部門長 |
| T-10 | 担当者未割当（バックログ） | `open` | 0 | `null` | **null** | 部門長 |
| T-11 | 本部承認時自動投入「実装計画作成」相当 | `in_progress` | 40 | 今日 +10 日 | 巡回 | 部門長 |
| T-12 | バグ・高優先度 | `in_progress` | 35 | 今日 +3 日 | 巡回 | 部門長 |
| T-13 | 改善・低優先度・遠い期限 | `open` | 0 | 今日 +35 日 | 巡回 | 部門長 |
| T-14 | 機能追加・確認者を巡回（部門管理者以外） | `resolved` | 90 | 今日 +8 日 | 巡回 | 巡回 |

### 3.3 巡回ルール

- 担当者カーソル: シナリオ × 案件をまたいで進行（T-10 では進めない）。
- 確認者カーソル: T-14 で進行。担当者と同一にならないよう同一時は 1 ステップずらす。
- 結果として全 10 ユーザーが **担当者として 16〜17 件・確認者として最低 1 件** を保持する。

### 3.4 共通属性

| 項目 | 値 |
|------|----|
| `task_type` | `bug` / `feature` / `improvement` / `task` をシナリオ別に固定分散 |
| `priority` | `high` / `medium` / `low` をシナリオ別に固定分散 |
| `category` | `null`（課題1 では未使用） |
| `parent_id` / `milestone_id` | `null`（将来用 FK） |
| `created_by` | 該当案件の部門管理者 |
| `estimated_days` | `round(4 + (project_id + len(title)) % 8 * 1.75, 2)` |
| `actual_days` | `closed`=×0.92 / `resolved`=×0.55 / `in_progress`=×0.38 / `open`=0 |

### 3.5 集計

| 項目 | 件数 |
|------|------|
| 承認済案件 | 13 |
| 1 案件あたりのタスク | 14 |
| **タスク 総合計** | **182 件** |

---

## 4. 通知（notifications）シナリオパターン

### 4.1 タイプ × 未読 / 既読の 2 パターン

| # | シナリオ | `type` | A（未読）受信者 | B（既読）受信者 |
|---|---------|--------|-----------------|------------------|
| N-01 | 申請提出（受領） | `project_submitted` | 高橋・申請次郎 | 申請三郎・夏目 |
| N-02 | 本部承認完了 | `project_approved` | 高橋・佐藤 | 申請次郎・井上 |
| N-03 | 却下（コメント付） | `project_rejected` | 佐藤・申請次郎 | 井上・申請三郎 |
| N-04 | 取り戻し | `project_returned` | 夏目・部門慎二 | 由美・本部 |
| N-05 | タスク担当割当 | `task_assigned` | 井上・鈴木 | 高橋・佐藤 |
| N-06 | タスク期限間近 | `task_due_soon` | 鈴木・高橋 | 佐藤・申請次郎 |
| N-07 | 確認依頼（resolved） | `task_resolved` | 夏目・部門慎二 | 由美・夏目 |
| N-08 | 確認 OK | `task_reviewed` | 高橋・井上 | 申請次郎・佐藤 |
| N-09 | タスク完了（互換） | `task_completed` | 鈴木・申請三郎 | 高橋・本部 |

### 4.2 全ユーザー網羅の保険

- 上記 9 シナリオの後、`task_assigned` を **全 10 ユーザー** に未読で 1 件ずつ追加投入（`top_up_unread`）。
- これにより、未読通知を 1 件も持たないユーザーが存在しないことを保証する。

### 4.3 ペイロード規約

| 項目 | 値 |
|------|----|
| `title` | NotificationType ごとに固定文（例: 「タスクの確認依頼があります」） |
| `body` | 案件タイトルを埋め込んだ 1 文 |
| `meta` | `{"project_id": <id>, "pattern": "A_unread" \| "B_read" \| "top_up_unread"}` |
| `read_at` | 未読 = `null`、既読 = `now - n 日`（タイプ別の固定オフセット 1〜8 日） |

### 4.4 集計

| 項目 | 件数 |
|------|------|
| 9 タイプ × A/B 各 2 名 | 36 件 |
| 全ユーザー網羅の `task_assigned` 追加分 | 10 件 |
| **通知 総合計** | **46 件** |

---

## 5. 削除・再生成スコープ

| 対象 | `ProjectSeeder` | `DemoWorkloadSeeder` |
|------|:---:|:---:|
| `projects` (`PRJ-SEED-%`) | 削除 → 再投入 | — |
| `projects` (`PRJ-DEMO-%`) | — | `updateOrCreate`（残置） |
| `approvals`（上記案件配下） | カスケード削除 → 再投入 | カスケード削除 → 再投入（PRJ-DEMO 配下のみ） |
| `tasks`（全件） | — | 全削除 → 再投入 |
| `notifications`（全件） | — | 全削除 → 再投入 |
| `users` / `departments` / `roles` / `permissions` | **触らない** | **触らない** |

> 順序: `DatabaseSeeder` で `ProjectSeeder` → `DemoWorkloadSeeder` の順に実行。タスク・通知の生成時には全承認済案件（PRJ-SEED + PRJ-DEMO）が揃っている。

---

## 6. 投入結果（`migrate:fresh --seed` 実行後の実測）

### 6.1 案件・承認

| カテゴリ | 件数 |
|----------|------|
| 案件 総合計 | 33 |
| 　`draft` / `pending_dept` / `pending_hq` / `approved` / `rejected` | 4 / 2 / 4 / 13 / 10 |
| 承認履歴 総合計 | 40 |
| 　`dept_approved` / `dept_rejected` / `hq_approved` / `hq_rejected` | 17 / 6 / 13 / 4 |
| 再申請チェイン（`parent_project_id` 連結） | 4 組 |

### 6.2 タスク

| カテゴリ | 件数 |
|----------|------|
| タスク 総合計 | 182 |
| 　`open` / `in_progress` / `resolved` / `closed` | 78 / 65 / 26 / 13 |
| 担当者未割当（T-10） | 13 |
| 担当者あり（巡回・10 ユーザー） | 169（各ユーザー 16〜17 件） |

### 6.3 通知

| カテゴリ | 件数 |
|----------|------|
| 通知 総合計 | 46 |
| 　9 タイプすべて投入 | ✓ |
| 全ユーザーが未読 1 件以上 | ✓（1〜5 件） |
| 全ユーザーが総合 1 件以上 | ✓（3〜7 件） |

---

## 7. 検証観点

| 観点 | 期待値 |
|------|--------|
| 案件一覧（申請タブ） | 5 状態がすべて 2 件以上表示される |
| 案件一覧（開発タブ） | `approved` 13 件すべてに進捗バーが描画される |
| 案件一覧（予算タブ） | 消費率 30% / 45% / 78% / 108% の 4 帯がカード色分けされる |
| 承認待ち一覧 | 部門承認待ち 2 件・本部承認待ち 4 件 |
| 再申請チェイン | `parent_project_id` の鎖が 4 組表示される |
| S-14 タスク一覧（カンバン） | 4 ステータス列すべてにタスクがある |
| S-14 タスク一覧（メンバー別） | 全 10 ユーザーにタスクが表示される |
| 通知一覧 | 9 タイプすべてが少なくとも 1 件登場し、未読・既読が混在する |
| ヘッダー未読バッジ | 全ユーザーで未読件数 > 0 |

---

## 8. 関連ドキュメント

| 資料 | パス |
|------|------|
| AI 入口 | `materials/Design/AI.md` |
| システム仕様（事実の正本） | `materials/Design/system_spec.md` |
| ER 図・区分値 | `materials/Design/er_diagram.md` |
| ロール × 機能 | `materials/Design/role_feature_matrix_.md` |
| 利用マニュアル | `materials/manual/user_manual.md` |
| 実装ファイル | `database/seeders/ProjectSeeder.php` / `database/seeders/DemoWorkloadSeeder.php` |
