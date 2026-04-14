# ER図（v4 統合版） - 開発管理統合アプリケーション

## テーブル一覧（14テーブル）

| # | テーブル名 | 説明 | PoC実装 |
|---|--------|------|--------|
| 1 | departments | 部門 | ○ |
| 2 | users | ユーザー | ○ |
| 3 | projects | 案件 | ○ |
| 4 | approvals | 承認履歴 | ○ |
| 5 | milestones | マイルストーン | テーブルのみ |
| 6 | tasks | タスク（Backlog風） | ○ |
| 7 | budgets | 予算 | ○ |
| 8 | budget_actuals | 予算実績明細 | ○ |
| 9 | task_comments | タスクコメント | ○ |
| 10 | task_histories | タスク変更履歴 | ○ |
| 11 | task_attachments | タスク添付ファイル | テーブルのみ |
| 12 | project_comments | 案件コメント | テーブルのみ |
| 13 | project_attachments | 案件添付ファイル | テーブルのみ |
| 14 | notifications | 通知 | ○ |

## 設計思想

### 監査証跡を重視した承認管理

承認の記録は projects テーブルのタイムスタンプではなく、独立した approvals テーブルで管理する。これにより「誰が・いつ・どのレベルで・どんな判断をしたか」をレコード単位で追跡できる。却下→再申請のケースでは、projects.revision と approvals.revision の組み合わせで「第何回目の申請に対する承認か」が明確になり、承認プロセスの透明性を確保する。

### 予算の総額と明細を分離

案件の予算管理は budgets（総額）と budget_actuals（実績明細）に分離する。申請時の概算予算は projects.estimated_amount に記録し、承認後の確定予算は budgets.budget_amount で管理する。実績は budget_actuals に個別の計上日・摘要付きで記録するため、消費率の推移や支出内訳の分析が可能になる。

### PoCはシンプルに、将来拡張に備える

タスク担当は assignee_id による単一担当とし、PoCの実装負荷を抑える。親子タスク（parent_id）、マイルストーン（milestone_id）、ファイル添付（task_attachments / project_attachments）は、テーブル定義とリレーションのみ用意し、画面実装は卒業後のポートフォリオ開発で段階的に進める。将来的には task_users 中間テーブルの導入による多対多担当、ガントチャート、カンバン表示などに拡張する。

### Backlog風のタスク管理

タスクは種別（bug / feature / improvement / task）、優先度（high / medium / low）、カテゴリ（design / implementation / test 等）の3軸で分類し、ステータスは open → in_progress → resolved → closed の4段階で管理する。コメント（task_comments）と変更履歴（task_histories）により、Backlogのような課題管理のやり取りと変更追跡を実現する。

### 部門区別は文字列型で柔軟に

departments.type を string 型とし、現時点では department / headquarters の2値で運用する。boolean の is_headquarters と比べて、将来「子会社」「グループ会社」等の区分を追加する際にマイグレーション不要で対応できる。

## ER図

```mermaid
erDiagram
  departments {
    bigint id PK
    string name "部門名"
    string type "department / headquarters"
    timestamp created_at
    timestamp updated_at
  }
  users {
    bigint id PK
    string name "氏名"
    string email "メールアドレス"
    string password "パスワード(ハッシュ)"
    enum role "applicant / dept_manager / hq_manager"
    bigint department_id FK "所属部門"
    timestamp created_at
    timestamp updated_at
  }
  projects {
    bigint id PK
    string title "案件名"
    text purpose "目的・概要"
    decimal estimated_amount "概算予算(申請時)"
    decimal estimated_days "概算工数(申請時)"
    bigint department_id FK "担当部門"
    bigint applicant_id FK "申請者"
    enum status "draft / pending_dept / pending_hq / approved / rejected"
    integer revision "申請回数(初回=1)"
    timestamp approved_at "最終承認日時"
    timestamp created_at
    timestamp updated_at
  }
  approvals {
    bigint id PK
    bigint project_id FK "対象案件"
    bigint approver_id FK "承認者"
    enum level "dept(部門承認) / hq(本部承認)"
    enum status "approved / rejected"
    text comment "承認・却下コメント"
    integer revision "対応する申請回数"
    timestamp created_at
    timestamp updated_at
  }
  milestones {
    bigint id PK
    bigint project_id FK "所属案件"
    string name "マイルストーン名"
    date due_date "期限"
    boolean is_archived "アーカイブ済み"
    timestamp created_at
    timestamp updated_at
  }
  tasks {
    bigint id PK
    bigint project_id FK "所属案件"
    bigint parent_id FK "親タスク(将来実装)"
    bigint assignee_id FK "担当者"
    bigint created_by FK "作成者"
    bigint milestone_id FK "マイルストーン(将来実装)"
    string title "タスク名"
    text description "詳細説明"
    enum task_type "bug / feature / improvement / task"
    enum priority "high / medium / low"
    enum category "design / implementation / test 等"
    enum status "open / in_progress / resolved / closed"
    integer progress_rate "進捗率(0-100)"
    decimal estimated_days "見積工数"
    decimal actual_days "実績工数"
    date start_date "開始日"
    date due_date "期限"
    timestamp created_at
    timestamp updated_at
  }
  budgets {
    bigint id PK
    bigint project_id FK "対象案件"
    decimal budget_amount "確定予算額"
    decimal actual_amount "実績額合計"
    timestamp created_at
    timestamp updated_at
  }
  budget_actuals {
    bigint id PK
    bigint budget_id FK "対象予算"
    bigint input_by FK "入力者"
    decimal amount "金額"
    string description "摘要"
    date recorded_date "計上日"
    timestamp created_at
    timestamp updated_at
  }
  task_comments {
    bigint id PK
    bigint task_id FK "対象タスク"
    bigint user_id FK "投稿者"
    text body "コメント本文"
    timestamp created_at
    timestamp updated_at
  }
  task_histories {
    bigint id PK
    bigint task_id FK "対象タスク"
    bigint user_id FK "変更者"
    string field_name "変更されたフィールド名"
    string old_value "変更前の値"
    string new_value "変更後の値"
    timestamp created_at
  }
  task_attachments {
    bigint id PK
    bigint task_id FK "対象タスク"
    bigint user_id FK "アップロード者"
    string file_name "ファイル名"
    string file_path "保存パス"
    string mime_type "MIMEタイプ"
    integer file_size "ファイルサイズ(bytes)"
    timestamp created_at
    timestamp updated_at
  }
  project_comments {
    bigint id PK
    bigint project_id FK "対象案件"
    bigint user_id FK "投稿者"
    text body "コメント本文"
    timestamp created_at
    timestamp updated_at
  }
  project_attachments {
    bigint id PK
    bigint project_id FK "対象案件"
    bigint user_id FK "アップロード者"
    string file_name "ファイル名"
    string file_path "保存パス"
    string mime_type "MIMEタイプ"
    integer file_size "ファイルサイズ(bytes)"
    timestamp created_at
    timestamp updated_at
  }
  notifications {
    bigint id PK
    bigint user_id FK "通知先ユーザー"
    bigint project_id FK "関連案件"
    string type "通知種別"
    string message "通知メッセージ"
    boolean is_read "既読フラグ"
    timestamp created_at
    timestamp updated_at
  }

  departments ||--o{ users : "所属"
  departments ||--o{ projects : "担当"
  users ||--o{ projects : "申請"
  users ||--o{ approvals : "承認"
  users ||--o{ tasks : "担当"
  users ||--o{ tasks : "作成"
  users ||--o{ budget_actuals : "入力"
  users ||--o{ task_comments : "投稿"
  users ||--o{ task_histories : "変更"
  users ||--o{ task_attachments : "添付"
  users ||--o{ project_comments : "投稿"
  users ||--o{ project_attachments : "添付"
  users ||--o{ notifications : "受信"
  projects ||--o{ approvals : "承認履歴"
  projects ||--o{ milestones : "マイルストーン"
  projects ||--o{ tasks : "タスク"
  projects ||--|| budgets : "予算"
  projects ||--o{ project_comments : "コメント"
  projects ||--o{ project_attachments : "添付"
  projects ||--o{ notifications : "通知"
  milestones ||--o{ tasks : "紐づく"
  budgets ||--o{ budget_actuals : "実績明細"
  tasks ||--o{ tasks : "親子"
  tasks ||--o{ task_comments : "コメント"
  tasks ||--o{ task_histories : "変更履歴"
  tasks ||--o{ task_attachments : "添付"
```

---

## ステータス・区分値一覧

### projects.status
| 値 | 説明 |
|---|---|
| draft | 下書き |
| pending_dept | 部門承認待ち |
| pending_hq | 本部承認待ち |
| approved | 承認済み・開発中 |
| rejected | 却下（履歴として保持） |

### departments.type
| 値 | 説明 |
|---|---|
| department | 一般部門 |
| headquarters | 本部 |

### users.role
| 値 | 説明 |
|---|---|
| applicant | 申請者（各部門の案件担当者） |
| dept_manager | 部門管理者 |
| hq_manager | 本部管理者 |

### tasks.task_type
| 値 | 説明 |
|---|---|
| task | タスク（デフォルト） |
| bug | バグ |
| feature | 機能追加 |
| improvement | 改善 |

### tasks.priority
| 値 | 説明 |
|---|---|
| high | 高 |
| medium | 中（デフォルト） |
| low | 低 |

### tasks.status
| 値 | 説明 |
|---|---|
| open | 未着手 |
| in_progress | 進行中 |
| resolved | 解決済み |
| closed | 完了 |

### tasks.category
| 値 | 説明 |
|---|---|
| design | 設計 |
| implementation | 実装 |
| test | テスト |
| documentation | ドキュメント |
| other | その他 |

### approvals.level
| 値 | 説明 |
|---|---|
| dept | 部門承認（一次承認） |
| hq | 本部承認（最終承認） |

### notifications.type
| 値 | 説明 |
|---|---|
| dept_approval_needed | 部門承認依頼 |
| hq_approval_needed | 本部承認依頼 |
| approved | 承認完了 |
| rejected | 却下 |
| task_due_soon | タスク期限間近 |
| budget_alert | 予算アラート |

---

## ロールとデータアクセス範囲

| ロール | 説明 | データアクセス範囲 |
|--------|------|----------------|
| applicant | 申請者 | 自身の案件・タスクのみ |
| dept_manager | 部門管理者 | 自部門の全案件・タスク |
| hq_manager | 本部管理者 | 全部門の全案件・タスク |

## 承認フロー

```
申請者(draft) → 部門管理者(pending_dept) → 本部管理者(pending_hq) → 承認(approved)
                     ↓ 却下                        ↓ 却下
                  rejected                       rejected
                  (申請者が revision+1 で再申請)
```

## 予算管理

- `projects.estimated_amount`: 申請時の概算予算
- `budgets.budget_amount`: 承認後の確定予算額
- `budget_actuals`: 実績の明細（個別入力）
- `budgets.actual_amount`: 実績額合計（budget_actualsの集計値）
- 消費率: `budgets.actual_amount / budgets.budget_amount × 100` で算出

## インターン中・卒業後の実装区分

### インターン100時間で実装
- 全14テーブルのマイグレーション・モデル定義
- 認証・ユーザー管理（Breeze）
- 承認フロー（申請・一次承認・最終承認 + approvals記録）
- タスク管理（一覧・基本CRUD・進捗管理）
- 予算管理（budgets + budget_actuals・消費率）
- ダッシュボード（ロール別・進捗/予算可視化）
- 通知機能（アプリ内通知）

### 卒業後のポートフォリオとして拡張
- 親子タスクのUI（ツリー表示）
- マイルストーン管理画面
- ガントチャート
- タスク添付ファイル機能
- 案件コメント・添付ファイル機能
- Backlog風UIの完成度向上（カンバン等）