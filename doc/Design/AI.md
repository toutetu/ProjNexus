# AI.md — Cursor 向け実装指示書

> 本ドキュメントはプロジェクトルート（`C:\xampp\htdocs\ProjNexus\doc/Design/AI.md`）に配置して使用することを想定しています。
> Cursor 上の AI がこのファイルを読み、設計思想・制約・ディレクトリ構造を把握したうえで実装を進めます。


---

## 0. このプロジェクトについて

個人開発のポートフォリオ。架空企業の「申請システム / 部門別Excel / 予算管理Excel」に分散した開発管理プロセスを一元化する Web アプリの PoC を開発する。

- **期間**: 2026-04-13 〜 2026-05-15（5週間・100時間以内）
- **提出先**: GitLab `quest_1` リポジトリの `main` ブランチ
- **評価基準**: 課題1（必須機能）の完成度・工夫 + 課題2（+α）のプレゼン + プレゼン資料

詳細背景は `doc/Design/requirements.md` および `doc/Design/design-philosophy.md` を参照。

---

## 1. スコープ（実装の範囲）

### 実装する（課題1・必須）
- ★ 申請・承認フロー（申請 → 部門承認 → 本部承認）
- ★ 承認済案件のタスク管理（**Backlog 風・3値運用**：未着手 / 進行中 / 完了）
- ★ 案件単位の予算・実績管理（**上書き方式**：`projects.actual_amount` を直接更新）
- ★ ロール別データアクセス制御
- ★ アプリ内通知
- ★ 承認ステッパー UI（課題2 だが低コスト高効果のため実装）


### 実装しない（課題2・後回し）
- ☆ ダッシュボード（画面 S-02、プレゼン用設計のみ）
- ☆ タスク詳細画面（画面 S-09、編集は S-10 モーダルで代替）
- ☆ **タスク完了の確認工程**（申請者が `resolved` で完了報告 → 確認者が `closed` で承認の 2 段階。DB の 4 値 Enum は課題1 から用意済み）
- ☆ **予算実績の追加方式**（`budget_actuals` テーブルで支出内訳を履歴管理。監査証跡とカテゴリ別集計が可能に）
- ☆ 部門管理者向けメンバータスク一覧
- ☆ 予算アラート通知（86% / 100% の閾値超過で関係者に通知）
- ☆ 外部ツール連携

> 実装要望が発生した際は、必ず「課題1 / 課題2」のどちらかを確認する。課題2 ならスコープアウトを提案すること。
> 設計は課題2 を見据えた拡張可能な形を採るが、実装は課題1 の最小要件に集中する。

---

## 2. 技術スタック

| 層 | 採用技術 | 備考 |
|---|---|---|
| PHP | 8.2+ | |
| フレームワーク | Laravel 11 | |
| 認証 | Laravel Breeze (Inertia + React) | |
| 権限 | spatie/laravel-permission | 1ユーザー複数ロール対応 |
| フロント | React 18 + TypeScript + Inertia | |
| スタイル | Tailwind CSS | Breeze 標準 |
| UI | shadcn/ui + lucide-react | 個別に導入 |
| グラフ | Recharts | 課題2用・将来 |
| DB | MySQL 8 | XAMPP 環境 |
| デプロイ | Laravel Cloud | |

---

## 3. ディレクトリ構造（方針）

> 2026-04-20 にフラット化済み。リポジトリ直下 = Laravel プロジェクトルート（`quest_1/` 階層は存在しない）。

標準の Laravel 11 + Breeze (Inertia + React) 構成に準拠。本プロジェクト固有の方針のみ以下に示す。詳細な配置はコードベースを直接参照すること。

- **`app/Http/Controllers/`**: Controller は薄く保ち、ビジネスロジックは Service クラスへ委譲
- **`app/Services/`**: `ApprovalService`（承認フロー遷移）、`TaskHistoryService`（変更履歴自動記録）、`NotificationService` を処理単位で配置
- **`app/Policies/`**: 案件・タスクの可視範囲。Controller のクエリ分岐と合わせて二重防御
- **`app/Enums/`**: PHP 8.1+ Native Enum（status / role / level / type など）
- **`app/Models/`**: `User` は Spatie の `HasRoles` trait を使用。主要モデルは Department / User / Project / Approval / Task / TaskComment / TaskHistory / Notification
- **`database/seeders/`**: `DepartmentSeeder`（本部+3部門）、`RolePermissionSeeder`（3ロール）、`UserSeeder`（7アカウント）
- **`resources/js/Pages/`**: Inertia ページ単位。URL と 1:1 対応（例: `Projects/Index.tsx`、`Projects/Show.tsx`）
- **`resources/js/Components/ui/`**: shadcn/ui（個別に `npx shadcn-ui@latest add` で追加）
- **`resources/js/Components/{Approval,Projects,Form,Modals,Layout}/`**: ドメイン別共通部品。**Pages 実装前に `doc/Design/components_spec.md` を読み、使用部品を先に作成すること**
- **`routes/web.php`**: Inertia ルート。`auth.php` は Breeze 標準
- **`doc/Design/`**: 設計資料（本ファイル群）
- **`doc/daily/`**: 日報・進捗管理
- **`doc/presentation/`**: プレゼン資料（提出物の一部）
- **`mockups/`**: Claude 作成の HTML モック

### URL 設計メモ
- 案件一覧は `/projects?tab=approval|dev|budget` でタブ切替（単一コンポーネント + tab props で列セット切替）
- 承認待ち一覧は独立画面を持たず `/projects?tab=approval&filter=pending` のプリセット

---

## 4. データモデル

詳細は `doc/Design/er_diagram.md` 参照。PoC は **8 テーブル**（課題1 のスコープ）。

| テーブル | 役割 |
|---|---|
| departments | 部門 |
| users | ユーザー（Spatie Permission でロール管理） |
| projects | 案件（予算カラム含む。`primary_assignee_id` で主担当を保持） |
| approvals | 承認履歴（監査証跡） |
| tasks | タスク（Backlog 風・ステータスは 4 値 Enum で DB 定義、課題1 は 3 値運用） |
| task_comments | タスクコメント |
| task_histories | タスク変更履歴（自動記録） |
| notifications | 通知 |

### 将来追加するテーブル（課題2 以降）

| テーブル | 用途 |
|---|---|
| **budget_actuals** | 予算実績の追加方式。1 支出 = 1 行 INSERT で履歴管理。`projects.actual_amount` は集計キャッシュ化 |
| milestones / project_members / budget_items / 各種 attachments | 機能拡張時に追加 |

### 重要な設計判断

- **却下 → 再申請は新規レコード**: `parent_project_id` で元案件と紐づけ、`revision` で申請回数を表現
- **部門管理者が申請者の場合**: 部門承認をスキップし直接 `pending_hq` へ
- **予算（課題1）**: `estimated_amount`（申請時）→ 承認時に `budget_amount` に転記 → `actual_amount` を **上書き更新**（最小要件）
- **予算（課題2）**: `budget_actuals` への INSERT に切替。`projects.actual_amount` は `SUM()` のキャッシュへ移行
- **消費率**: DB に持たず `actual_amount / budget_amount * 100` で算出
- **タスクステータス（Backlog 風・DB で 4 値 Enum）**:
  - `open`（未着手）/ `in_progress`（進行中）/ `resolved`（確認待ち）/ `closed`（完了）
  - **課題1**: 3 値運用（`open / in_progress / closed`）。`resolved` は使わない。申請者が自分で完了
  - **課題2**: 4 値運用。申請者が `in_progress → resolved`（完了報告）→ 確認者が `resolved → closed`（確認 OK）
  - 4 値で DB 設計しておくことで、課題2 昇格時に migration 不要（UI 制御と `reviewer_id` カラム追加のみ）
- **nullable FK**: `tasks.parent_id`、`tasks.milestone_id` は将来拡張用に先行配置

---

## 5. ナビゲーション・画面構成

### 3セクション構造（トップナビ）

| セクション | 画面 |
|---|---|
| 申請・承認 | 新規申請 / 承認待ち一覧 / 案件一覧（申請タブ） |
| 開発管理 | 案件一覧（開発タブ） / 案件詳細 / タスク一覧（課題2・dim 表示） / タスク管理はモーダル |
| 予算管理 | 案件一覧（予算タブ） / 予算実績入力モーダル |
| 共通（下部） | 通知 / プロフィール |

> サイドバーの「タスク一覧」は **課題2** の部門メンバータスク一覧。課題1期間中は **dim 表示＋「課題2」ラベル** を付けて非活性で配置し、メニュー構造の意図だけ伝える（実装はしない）。

### 案件一覧はタブで列切替

`/projects?tab=approval|dev|budget` の URL クエリで状態保持。Controller 側でクエリとタブを同時に扱い、**同一 React コンポーネント + tab props で列セットを切替**。

| タブ | 主な列 |
|---|---|
| approval（申請） | タイトル / ステータス / 承認ステップ / 申請日 / 部門 / 最終更新 |
| dev（開発） | タイトル / 部門 / 主担当 / タスク進捗 / 期限 / 最終更新 |
| budget（予算） | タイトル / 部門 / 予算額 / 実績額 / 消費率 / 更新日 |

### サイドバー「承認待ち一覧」のルーティング

独立画面なし。`/projects?tab=approval&filter=pending` で S-03a を共用し、ロール別絞り込みは §6 の表を参照。タイトル下に「承認待ち」バッジで文脈を示す。

### ログイン直後ホーム
`/projects?tab=approval` を暫定ホームに。理想は本部管理者ダッシュボードだが課題2扱い。

---

## 6. ロール別データアクセス

Controller 側のクエリ分岐 + Spatie Permission + Laravel Policy の3層で防御。

| 画面 | applicant | dept_manager | hq_manager |
|---|---|---|---|
| 案件一覧（申請） | `applicant_id = self` + draft | `department_id = self.dept` | 全件 |
| 案件一覧（開発） | 自案件（主担当） | 自部門 | 全件 |
| 案件一覧（予算） | 自案件 | 自部門 | 全件 |
| 案件詳細 | 自案件のみ | 自部門 | 全件 |
| 新規申請 | ○ | ○（部門承認スキップ） | × |
| 承認待ち一覧 | × | `approvals.level=dept` | `approvals.level=hq` |
| タスクCRUD | 自案件（主担当） | 自部門（閲覧主） | 全件（閲覧主） |
| 予算実績入力 | 自案件の主担当 | × | × |

---

## 7. 承認フロー

### ステータス遷移
```
draft → pending_dept → pending_hq → approved
  ↓           ↓             ↓
            rejected     rejected
```

### 実装方針（ApprovalService）
1. `submit($project)`: draft → pending_dept（申請者が部門管理者なら pending_hq 直行）
2. `approveDept($project, $approver, $comment)`: pending_dept → pending_hq + approvals レコード作成
3. `approveHq($project, $approver, $comment)`: pending_hq → approved + budget_amount 確定 + approved_at
   - 承認直後に初期タスクを自動作成（`実装計画作成` / 見積工数 `3` 人日 / 担当者 = 申請者）
4. `reject($project, $approver, $level, $comment)`: → rejected + approvals レコード
5. 各アクション後、関係者に notifications を発行

### タスク通知（課題1の最小実装）
- `task_assigned`: タスク作成時または担当者変更時に、担当者へ通知
- `task_completed`: タスクが `closed` になった時に、案件申請者へ通知
- `task_due_soon`: 期限 3 日前 / 当日のタスクを日次ジョブで担当者へ通知
- 日次コマンド: `php artisan tasks:notify-due-soon`（スケジューラで毎朝実行）

### 承認後の開発管理フェーズ移行
`projects.status = approved` になった時点で：
- 案件情報の編集をロック
- タスク作成・進捗入力を解禁
- 初期タスク `実装計画作成`（見積 `3` 人日、担当者=申請者）を自動追加
- `budget_amount` を `estimated_amount` から転記
- 予算実績入力を解禁

---

## 8. 実装順序（Phase）

> 見積・実績・詳細チェックリストは `doc/daily/development_schedule.md`、週次・日次の実行手順は `doc/daily/implementation_schedule.md` を参照。

| Phase | 内容 |
|---|---|
| 0 | 設計・Laravel環境構築・Breeze/Spatieインストール・DB設計 |
| 1 | 認証（Breeze カスタマイズ）・レイアウト（3セクションサイドバー）・共通UI |
| 2 | 申請・承認フロー（S-03a/04/05/06/08 + 通知 S-12） |
| 3 | 開発管理・予算管理（S-03b/03c/10/11 の MVP） |
| 4 | +α（承認ステッパー大型版 + レスポンシブ最低限） |
| 5 | ドキュメント・マニュアル・プレゼン資料・デプロイ最終確認 |

> **GW期間（4/29, 5/3〜5/6）は 1日1h程度**しか稼働できない。**GW前（5/1 まで）に Phase 2 完了**、GW週で Phase 3 MVP、最終週で +α ＋ 資料、が基本線。

---

## 9. 実装時の約束事

### コード
- TypeScript を使用。`any` は原則禁止
- Controller は薄く、ビジネスロジックは Service クラスへ
- クエリは Eloquent のスコープ + Policy で絞り込む（Controller 内生SQLは避ける）
- `enum` は PHP 8.1+ の Native Enum を使う（`App\Enums` 配下）
- マイグレーションは機能単位で分割。一度マージ後は edit せず追加 migration で変更

### UI
- 色・フォント・余白は `doc/Design/design_system.md` を厳守
- ステータスバッジ・ステッパー・カードはコンポーネント化して重複を避ける
- shadcn/ui のコンポーネントは `npx shadcn-ui@latest add` で個別追加
- モバイル対応は後回しでよいが、Tailwind のレスポンシブクラスは付けておく（後から崩れにくくする）
- UI 表示文言（ラベル、ボタン、補助テキスト、バッジ、プレースホルダー、エラー文）は日本語を原則とし、英語表示を残さない。やむを得ず英語を使う場合は固有名詞・規格名・ショートカット記法など最小限に限定する
- 承認/却下アクションは `ApprovalDialog` 経由で実行する（直接POSTボタンのみにはしない）
- 一覧の操作系（申請/承認/却下/編集）は行単位の処理中ロックと状態表示（スピナー）を入れる
- 編集可否はフロントの条件分岐だけでなく、サーバーから返す `canEdit` と Policy の両方で制御する

### テスト
- PoC では Feature テストを承認フローと権限境界に絞って書く（全網羅は不要）
- `php artisan test` で CI に通る状態を維持

### Git / 提出
- main ブランチへの直 push は禁止。作業ブランチ → main へマージ
- コミットメッセージは `feat:`, `fix:`, `refactor:`, `docs:` の prefix
- **提出期限以降の commit は評価対象外**
- 提出後の修正は認められない

### 日次ワークフロー（必須ルーティン）

> **目的**：1 日単位で作業履歴をブランチに閉じ込め、進捗（日報）と実装をセットで残す。Cursor / Claude との協働でも必ず遵守する。

#### 作業開始時（毎日）
1. `main` を最新化：`git checkout main && git pull origin main`
2. **作業ブランチを切る**：`git checkout -b <branch-name>`
   - 命名規則：`feat/phase1-layout`、`feat/phase2-apply-form`、`docs/daily-YYYYMMDD` など
   - 日報のみの更新日は `docs/daily-YYYYMMDD` を使う
3. ブランチを切ってから **実装 or ドキュメント更新を開始**（main 上では作業しない）
4. 次回再開時は `doc/daily/next_chat_handover_YYYYMMDD.md` を先に確認してから着手する

#### 作業終了時（毎日）
1. **`doc/daily/` の各ファイルを更新**：
   - `doc/daily/daily_report.md`：本日の実績・気づき・翌日の予定を追記
   -`/daily/log/daily_technical_report.md`：技術的に書いた日次の詳細作業記録
   - `doc/daily/development_schedule.md`：現在地・累計実績 h・残り h・今週の目標の更新
   - `doc/daily/implementation_schedule.md`：次回作業予定（具体的手順）を更新
2. **変更をコミット**：`git add -A && git commit -m "docs: 日次更新 YYYY-MM-DD"`（実装があれば `feat:` などの prefix で別コミット）
3. **ブランチを push**：`git push -u origin <branch-name>`
4. 必要に応じて PR（マージリクエスト）を作成。main へのマージは自己レビュー後

#### 注意
- `doc/daily/daily_report.md` は**提出済み部分は変更しない**（追記のみ）
- 1 日の途中でブランチを切り直す必要が出た場合は、現在のブランチを push してから新ブランチを切る（作業ロスト防止）
- main への直 push は禁止（上記ルール参照）
- PowerShell 環境では `&&` が使えないため、複数コマンドは `;` 連結で実行する

---

## 10. 設計モック・参照資料

実装する画面ごとに HTML モックと画面ポリシー（`_policy.md`）を必ず確認してから着手すること。

### (1) 画面モック一覧

| 画面ID | 画面名 | HTML モック | 画面ポリシー |
|---|---|---|---|
| S-02 | ダッシュボード（課題2） | `mockups/s02_dashboard.html` | `mockups/s02_policy.md` |
| S-03a | 案件一覧（申請タブ） | `mockups/s03a_projects_approval.html` | `mockups/s03a_policy.md` |
| S-03b | 案件一覧（開発タブ） | `mockups/s03b_projects_dev.html` | `mockups/s03b_policy.md` |
| S-03c | 案件一覧（予算タブ） | `mockups/s03c_projects_budget.html` | `mockups/s03c_policy.md` |
| S-04 | 案件詳細 | `mockups/s04_project_show.html` | `mockups/s04_policy.md` |
| S-05 | 新規申請 | `mockups/s05_project_create.html` | `mockups/s05_policy.md` |
| S-10 | タスク作成・編集モーダル | `mockups/s10_task_form_modal.html` | `mockups/s10_policy.md` |
| S-11 | 予算実績入力モーダル | `mockups/s11_budget_actual_modal.html` | `mockups/s11_policy.md` |

> S-06（案件編集）・S-07（承認待ち一覧）・S-08（承認ダイアログ）・S-12（通知）は独立したモックなし。S-03a / S-05 モックおよび各ポリシー内の記述を参照。

### (2) 設計資料一覧

| 資料 | パス | 用途 |
|---|---|---|
| 要件定義 | `doc/Design/requirements.md` | 機能要件・非機能要件の原文 |
| 設計思想 | `doc/Design/design-philosophy.md` | 設計判断の背景・スコープ境界 |
| 画面遷移 | `doc/Design/screen_flow.md` | 全画面の遷移図・URL設計 |
| ER図・区分値 | `doc/Design/er_diagram.md` | テーブル定義・Enum 一覧 |
| デザインシステム | `doc/Design/design_system.md` | 色・フォント・余白ルール |
| カラーガイド | `doc/Design/color-guide.md` | ステータス色・バッジ色の統一基準 |
| 共通コンポーネント仕様 | `doc/Design/components_spec.md` | Props・使用条件（**Pages 実装前に必読**） |
---

## 11. テストアカウント

部門は **4部門**（本部 + 開発1〜3部）。**3ロール × 4部門で 7 アカウント** をシードし、権限境界検証を容易にする。全アカウントのパスワードは `password`。

### 主系アカウント（単一動作確認用）

| ロール | メール | 所属部門 |
|---|---|---|
| 申請者 | applicant@example.com | 開発1部 |
| 部門管理者 | dept@example.com | 開発1部 |
| 本部管理者 | hq@example.com | 本部 |

権限境界検証用として `applicant2/3@example.com`（開発2/3部）、`dept2/3@example.com`（開発2/3部）を追加シード。

> 全アカウントの氏名・用途・デプロイ後の動作確認アカウントは `doc/Design/Information.md`、実装は `database/seeders/UserSeeder.php` を参照。

---

## 12. よくある相談と回答

- **Q: この機能追加してもいい？** → 課題1必須要件か確認。課題2なら後回しを提案。
- **Q: テーブル追加したい？** → `doc/Design/design-philosophy.md §2` の「将来テーブル追加」に該当するか確認。PoCで必要なら追加 OK、そうでなければ nullable FK のみ残す。
- **Q: UI を変えたい** → design_system.md の色・余白ルールの範囲で。バッジ・ステッパーの色は「統一済み」なので変えない。
- **Q: APIが欲しい** → Inertia を採用しているため REST API は作らない。内部は Inertia response で返す。

### 実装前のプラン確認（必須ルール）

**どのような作業でも、実装（コード変更・ファイル作成・マイグレーション作成・ブランチ操作など）に着手する前に、必ずユーザーに以下のプランを提示して承認を得ること。**

1. **対象**: 実装する画面・機能（課題1 / 課題2 のどちらか明示）
2. **変更ファイル**: 追加・編集するファイルの一覧（新規 / 既存の区別を明記）
3. **実装方針**: 使用する Service / Policy / 共通コンポーネント、クエリ分岐の方針
4. **影響範囲**: 既存コードへの変更、マイグレーションの有無、シーダー更新の要否
5. **スコープ外**: 今回やらないこと（課題2扱いで残す項目）

プラン承認前にコードを書き始めない。ユーザーが「OK」「進めて」等の明示的な承認を返してから実装に移る。

スコープや方針が不明な場合は §1（スコープ表）・§6（ロール別アクセス）・§12 FAQ を参照して自力で判断し、それでも判断に迷う場合のみ質問する（些末な確認で作業を止めない）。