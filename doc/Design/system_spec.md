# システム仕様書（設計の事実・正本）

> 本ドキュメントは **スコープ・データモデル・URL・権限・承認・通知など、実装と照合できる事実** を1か所に集約したものです。  
> **設計判断の背景・プレゼン用の説明** は `doc/Design/design-philosophy.md` を参照（内容は重複させないため、思想側はストーリー中心のまま残す）。  
> **テーブル列・Enum の網羅** は `doc/Design/er_diagram.md` を参照。

実装や仕様を変更したときは **本ファイルを更新** し、`AI.md` は入口としての参照関係のみを保つ。

---

## 1. スコープ（実装の範囲）

### 実装する（課題1・必須）

- 申請・承認フロー（申請 → 部門承認 → 本部承認）
- 承認済案件のタスク管理（**Backlog 風・4値運用**：未着手 / 進行中 / 確認待ち / 完了）
- 案件単位の予算・実績管理（**上書き方式**：`projects.actual_amount` を直接更新）
- ロール別データアクセス制御
- アプリ内通知
- 承認ステッパー UI（課題2 扱いだが低コストのため実装）
- **本部管理者のタスク閲覧のみ**（`hq_manager` のタスク書き込み禁止。**未実装**・着手リストは `doc/daily/implementation_schedule.md` §3 マスト #9）

### 実装する（課題2・+α として実装決定）

- タスク完了の確認工程（実装者が `resolved` で完了報告 → 確認者が `closed` で承認・`reviewer_id`）
- **S-14 タスク一覧**（カンバン / メンバー別 / 一覧の3ビュー・ロール別初期表示）
- **S-02 ダッシュボード**（`/dashboard`。Recharts で KPI / 部門別進捗 / 予算推移 / 予算70%超案件など）
- タスク詳細画面（S-09、編集は S-10 モーダルで代替）

### 実装しない（課題2・後回し）


- **予算実績の追加方式**（`budget_actuals` テーブルで支出内訳を履歴管理）
- 予算アラート通知（86% / 100% 閾値超過で通知）
- 外部ツール連携
- 本部ロールへアカウント追加機能

> 実装要望が出たら「課題1 / 課題2」のどちらかを確認する。課題2 で後回しの項目ならスコープ外を提案する。

---

## 2. 技術スタック

| 層 | 採用技術 | 備考 |
|---|---|---|
| PHP | 8.2+ | |
| フレームワーク | Laravel 11 | |
| 認証 | Laravel Breeze (Inertia + React) | |
| 権限 | spatie/laravel-permission | 1ユーザー複数ロール |
| フロント | React 18 + TypeScript + Inertia | |
| スタイル | Tailwind CSS | Breeze 標準 |
| UI | shadcn/ui + lucide-react | 個別導入 |
| グラフ | Recharts | 主にダッシュボード |
| DB | MySQL 8 | XAMPP |
| デプロイ | Laravel Cloud | |

---

## 3. リポジトリ構成・ディレクトリ方針

> リポジトリ直下 = Laravel プロジェクトルート（`quest_1/` 階層はない）。

- **`app/Http/Controllers/`**: 薄く保ち、ロジックは Service へ
- **`app/Services/`**: `ApprovalService`、`TaskHistoryService`、`NotificationService` 等
- **`app/Policies/`**: 可視範囲・編集可否。Controller のクエリ分岐と二重防御
- **`app/Enums/`**: PHP Native Enum（status / role / notification 等）
- **`app/Models/`**: `User` は `HasRoles`。主要: Department / User / Project / Approval / `ProjectWorkItem`（`tasks`）/ `ProjectTaskComment` / `ProjectTaskHistory`（`task_histories`）/ Notification
- **`database/seeders/`**: `DepartmentSeeder`、`RolePermissionSeeder`、`UserSeeder`
- **`resources/js/Pages/`**: Inertia ページ（URL と 1:1）
- **`resources/js/Components/ui/`**: shadcn/ui
- **`resources/js/Components/{Approval,Projects,Form,Modals,Layout}/`**: ドメイン別部品（**Pages 前に `components_spec.md` を読む**）
- **`routes/web.php`**: Inertia ルート
- **`doc/Design/`**: 設計資料
- **`doc/daily/`**: 日報・進捗
- **`mockups/`**: HTML モック・画面ポリシー

---

## 4. URL 設計

| 用途 | URL・クエリ |
|------|-------------|
| 案件一覧（タブ） | `/projects?tab=` に `approval` / `dev` / `budget` |
| 承認待ち（独立画面なし） | `/projects?tab=approval&filter=pending` |
| タスク一覧 S-14 | `/member-tasks?view=` に `board` / `members` / `list`（初期 view: applicant=`board`、dept_manager・hq_manager=`members`） |
| 案件詳細タブ | `/projects/{id}?detailTab=` に `apply` / `tasks` / `budget` / `history`（互換: `overview` ≒ `apply`） |
| ダッシュボード | `/dashboard` |
| ログイン後ホーム（暫定） | `/projects?tab=approval`（`dashboard` のリダイレクトは `Information.md` 参照） |

---

## 5. データモデル（PoC）

詳細列定義は **`er_diagram.md`**。PoC コアは **9 テーブル**。

| テーブル | 役割 |
|---|---|
| departments | 部門 |
| users | ユーザー（Spatie でロール） |
| projects | 案件（予算カラム・`primary_assignee_id` = 主担当） |
| approvals | 承認履歴（監査証跡） |
| tasks | タスク（4値 Enum：`open` / `in_progress` / `resolved` / `closed`） |
| task_comments | タスクコメント |
| task_histories | 変更履歴（`TaskHistoryService` が自動記録） |
| project_budget_histories | `actual_amount` 更新の before/after・更新者・日時 |
| notifications | アプリ内通知 |

### 将来追加テーブル（計画）

| テーブル | 用途 |
|---|---|
| **budget_actuals** | 予算実績の追加方式（1支出1行）。`projects.actual_amount` は集計キャッシュ化へ |
| milestones / project_members / budget_items / 各種 attachments | 機能拡張時に追加 |

### マイグレーション運用（事実ルール）

- **開発初期（ローカル単独）**: ER 確定優先、`create_*` 統合可、`migrate:fresh` 前提でよい
- **共有開始後**: 既存 `create_*` は固定、以降は **`add_*` のみ** で変更
- **切替目安**: レビュー依頼時または本番/検証への初回デプロイ時
- **禁止**: add-only 移行後に過去の `create_*` を書き換えて環境差分を作らない

### 重要な設計判断（データ・フロー）

- **却下 → 再申請**: 新規 `projects` 行。`parent_project_id` で連鎖、`revision` で回数
- **部門管理者が申請者**: 部門承認スキップ → `pending_hq` 直行
- **予算（課題1）**: 申請時 `estimated_amount` → 本部承認で `budget_amount` 確定（転記）→ `actual_amount` は **上書き**
- **予算履歴（課題1）**: `project_budget_histories` に記録し案件詳細の履歴タブへ
- **予算（課題2・未採用時）**: `budget_actuals` + `actual_amount` を SUM キャッシュに移行する想定
- **消費率**: DB カラムではなく `actual_amount / budget_amount * 100` で算出
- **タスク 4 値・遷移**:
  - `open`（未着手）/ `in_progress` / `resolved`（確認待ち）/ `closed`（完了）
  - 担当者（`assignee_id`）: `in_progress → resolved`
  - 確認者（`reviewer_id`）: `resolved → closed`
- **`reviewer_id`**: nullable FK → users。自動投入タスクの初期確認者は運用ルールに従う（詳細はコード・`design-philosophy.md` 参照可）
- **nullable FK（将来用）**: `tasks.parent_id`、`tasks.milestone_id` 等
- **承認直後**: 初期タスク「実装計画作成」、見積 3 人日、担当 = 申請者（`ApprovalService`）

---

## 6. ナビゲーション・画面構成

### 3 セクション（サイドバー）

| セクション | 内容 |
|------------|------|
| 申請・承認 | 新規申請 / 承認待ち（一覧内）/ 案件一覧・申請タブ |
| 開発管理 | 案件一覧・開発タブ / 案件詳細 / **S-14 タスク一覧** / タスクはモーダル |
| 予算管理 | 案件一覧・予算タブ / 予算実績モーダル |
| 共通 | 通知 / プロフィール |

**プロフィール（`/profile`）**: 氏名・部署・メール・**ロール**（複数ロールは日本語を ` / ` 連結）は参照のみ表示。本人入力（生年月日・性別）は任意編集可。**パスワード変更の UI は本画面に含めない**（簡素化方針）。アカウント削除導線は非表示。

**本部管理者**: タスクは **閲覧のみ**（書き込み不可・未実装含む。正本 `role_feature_matrix_.md` + `implementation_schedule.md`）。

### 案件一覧の列セット（タブ）

| タブ | 主な列 |
|------|--------|
| approval | タイトル / ステータス / 承認ステップ / 申請日 / 部門 / 最終更新 |
| dev | タイトル / 部門 / 主担当 / タスク進捗 / 期限 / 最終更新 |
| budget | タイトル / 部門 / 予算額 / 実績額 / 消費率 / 更新日 |

同一 React コンポーネント + `tab` props で列切替。

---

## 7. ロール別データアクセス

Controller のクエリ分岐 + Spatie + Policy の多層防御。

| 画面 | applicant | dept_manager | hq_manager |
|------|-----------|----------------|------------|
| 案件一覧（申請） | `applicant_id=self` **または** `primary_assignee_id=self`（下書き行は `applicant_id=self` のみ） | `department_id = self.dept` | 全件 |
| 案件一覧（開発） | 自案件（主担当） | 自部門 | 全件 |
| 案件一覧（予算） | 自案件 | 自部門 | 全件 |
| 案件詳細 | 起票・主担当／または同部門の承認済（`ProjectPolicy::view`） | 自部門 | 全件 |
| 新規申請 | ○ | ○（部門承認スキップ） | × |
| 承認待ち一覧 | × | `approvals.level=dept` | `approvals.level=hq` |
| タスク CRUD | 自案件（主担当）※ | 自部門（承認済）※ | 全部門・**閲覧のみ** ※2 |
| 予算実績入力 | 自案件の主担当 | 自部門かつ承認済（`BudgetController`） | × |

※ 編集権は担当・確認者・主担当にも及ぶ（`ProjectWorkItemPolicy::canEditTaskContent`）。一覧は `Project::scopeVisibleTo` 参照。  
※2 **本部のタスク書き込み禁止**（方針 2026-05-12）。実装状況は `implementation_schedule.md` §3 マスト #9 とコードを照合。  
※3 **S-14（`MemberTaskController`）**: 純粋な `applicant`（部門管理者・本部ロールなし）の **`view=board` / `view=list`** でも、選択部門の **承認済み案件** に属するタスクを **部門単位で一覧**する。閲覧可否は `ProjectWorkItemPolicy::view`、更新・DnD は同 Policy の `update` と `assertStatusTransition` に従う（主担当外は閲覧のみのケースあり）。

---

## 8. 承認フロー

### ステータス遷移（案件）

```
draft → pending_dept → pending_hq → approved
  ↓           ↓             ↓
            rejected     rejected
```

### ApprovalService の責務（概要）

1. `submit`: draft → pending_dept（申請者が部門管理者なら pending_hq）
2. `approveDept`: pending_dept → pending_hq + `approvals`
3. `approveHq`: pending_hq → approved + `budget_amount` 確定 + 初期タスク投入 + 通知
4. `reject`: rejected + `approvals` + 通知

### 承認済み（`approved`）時のシステム挙動

- 案件情報編集ロック（方針どおりコードで担保）
- タスク・進捗入力・予算実績入力の解禁
- `budget_amount` ← `estimated_amount` 転記

---

## 9. 通知

### 通知タイプ（`App\Enums\NotificationType`）

| 値 | 用途（概要） |
|----|----------------|
| `project_submitted` | 申請・再提出など |
| `project_approved` | 承認完了 |
| `project_rejected` | 却下 |
| `project_returned` | 取り戻し等（Enum に定義。未使用なら将来用） |
| `task_assigned` | 担当割当・変更 |
| `task_completed` | タスク完了（`closed` 等・実装参照） |
| `task_due_soon` | 期限 3 日前 / 当日（`php artisan tasks:notify-due-soon`） |
| `task_resolved` | 確認依頼（`resolved`） |
| `task_reviewed` | 確認 OK（`closed`） |

案件・タスクの発火タイミングの詳細は **`NotificationService`** / **`ApprovalService`** を正とする。

---

## 10. 関連ドキュメント

| 資料 | パス |
|------|------|
| AI 入口（作業ルール・モック一覧） | `doc/Design/AI.md` |
| 要件原文 | `doc/Design/requirements.md` |
| 設計の背景（プレゼン） | `doc/Design/design-philosophy.md` |
| 画面遷移 | `doc/Design/screen_flow.md` |
| ER・区分値 | `doc/Design/er_diagram.md` |
| デザイントークン | `doc/Design/design_system.md` |
| コンポーネント Props | `doc/Design/components_spec.md` |
| ロール×機能 | `doc/Design/role_feature_matrix_.md` |
| デプロイ・検証手順 | `doc/Design/Information.md` |
| 次回作業・マスト改修 | `doc/daily/implementation_schedule.md` |

/**更新完了**/
