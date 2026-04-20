# CLAUDE.md — Cursor 向け実装指示書

> 本ドキュメントはプロジェクトルート（`C:\xampp\htdocs\ProjNexus\quest_1\CLAUDE.md`）に配置して使用することを想定しています。
> Cursor 上の Claude がこのファイルを読み、設計思想・制約・ディレクトリ構造を把握したうえで実装を進めます。


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
- ★ 承認済案件のタスク管理（最小限）
- ★ 案件単位の予算・実績管理
- ★ ロール別データアクセス制御
- ★ アプリ内通知
- ★ 承認ステッパーUI（課題2だが低コスト高効果のため実装）

### 実装しない（課題2・後回し）
- ☆ ダッシュボード（画面 S-02、プレゼン用設計のみ）
- ☆ タスク詳細画面（画面 S-09、編集は S-10 モーダルで代替）
- ☆ 部門管理者向けメンバータスク一覧
- ☆ 予算アラート通知
- ☆ 外部ツール連携

> 実装要望が発生した際は、必ず「課題1 / 課題2」のどちらかを確認する。課題2ならスコープアウトを提案すること。

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

## 3. ディレクトリ構造（抜粋）

```
quest_1/
├─ app/
│  ├─ Http/
│  │  ├─ Controllers/
│  │  │  ├─ ProjectController.php        # 案件 CRUD + 一覧タブ切替
│  │  │  ├─ ApprovalController.php       # 承認・却下アクション
│  │  │  ├─ TaskController.php           # タスク CRUD（モーダル）
│  │  │  ├─ BudgetController.php         # 予算実績入力
│  │  │  └─ NotificationController.php
│  │  ├─ Requests/                        # FormRequest
│  │  └─ Middleware/
│  ├─ Models/
│  │  ├─ Department.php
│  │  ├─ User.php                         # HasRoles trait
│  │  ├─ Project.php
│  │  ├─ Approval.php
│  │  ├─ Task.php
│  │  ├─ TaskComment.php
│  │  ├─ TaskHistory.php
│  │  └─ Notification.php
│  ├─ Policies/                           # 案件・タスクの可視範囲
│  ├─ Services/
│  │  ├─ ApprovalService.php              # 承認フロー遷移ロジック
│  │  ├─ TaskHistoryService.php           # 変更履歴の自動記録
│  │  └─ NotificationService.php
│  └─ Enums/                              # status / role / level / type など
├─ database/
│  ├─ migrations/
│  ├─ seeders/
│  │  ├─ DepartmentSeeder.php
│  │  ├─ UserSeeder.php                   # 3ロール × 3部門のテストアカウント
│  │  └─ DatabaseSeeder.php
│  └─ factories/
├─ resources/
│  ├─ js/
│  │  ├─ Pages/
│  │  │  ├─ Auth/Login.tsx
│  │  │  ├─ Projects/
│  │  │  │  ├─ Index.tsx                  # S-03 案件一覧（タブ切替）
│  │  │  │  ├─ Show.tsx                   # S-04 案件詳細
│  │  │  │  ├─ Create.tsx                 # S-05 新規申請
│  │  │  │  └─ Edit.tsx                   # S-06 案件編集
│  │  │  ├─ Approvals/Index.tsx           # S-07 承認待ち
│  │  │  ├─ Notifications/Index.tsx       # S-12
│  │  │  └─ Profile/Edit.tsx              # S-13（Breeze 標準）
│  │  ├─ Layouts/
│  │  │  └─ AuthenticatedLayout.tsx       # 3セクションサイドバー
│  │  ├─ Components/
│  │  │  ├─ ui/                           # shadcn/ui
│  │  │  ├─ StatusPill.tsx
│  │  │  ├─ ApprovalStepper.tsx
│  │  │  ├─ ProjectTableApprovalTab.tsx
│  │  │  ├─ ProjectTableDevTab.tsx
│  │  │  ├─ ProjectTableBudgetTab.tsx
│  │  │  └─ Modals/
│  │  │     ├─ ApprovalDialog.tsx         # S-08
│  │  │     ├─ TaskFormDialog.tsx         # S-10
│  │  │     └─ BudgetActualDialog.tsx     # S-11
│  │  └─ lib/
│  └─ views/app.blade.php
├─ routes/
│  ├─ web.php
│  └─ auth.php                            # Breeze
├─ doc/
│  ├─ Design/                              # 設計資料（本ファイル群）
│  │  ├─ requirements.md
│  │  ├─ design-philosophy.md
│  │  ├─ screen_flow.md
│  │  ├─ design_system.md
│  │  ├─ er_diagram.md
│  │  ├─ color-guide.md
│  │  └─ v0_prompts.md
│  ├─ Information.md                       # デプロイURL・テストアカウント
│  └─ presentation_高橋朋子.md             # プレゼン資料
├─ mockups/                                # Claude 作成の HTML モック
└─ CLAUDE.md                               # 本ファイル
```

---

## 4. データモデル

詳細は `doc/Design/er_diagram.md` 参照。PoC は **8テーブル**。

| テーブル | 役割 |
|---|---|
| departments | 部門 |
| users | ユーザー（Spatie Permission でロール管理） |
| projects | 案件（予算カラム含む） |
| approvals | 承認履歴（監査証跡） |
| tasks | タスク（Backlog風） |
| task_comments | タスクコメント |
| task_histories | タスク変更履歴（自動記録） |
| notifications | 通知 |

### 重要な設計判断

- **却下→再申請は新規レコード**: `parent_project_id` で元案件と紐づけ、`revision` で申請回数を表現
- **部門管理者が申請者の場合**: 部門承認をスキップし直接 `pending_hq` へ
- **予算**: `estimated_amount`（申請時）→ 承認時に `budget_amount` に転記 → `actual_amount` を随時更新
- **消費率**: DB に持たず `actual_amount / budget_amount * 100` で算出
- **nullable FK**: `tasks.parent_id`、`tasks.milestone_id` は将来拡張用に先行配置

---

## 5. ナビゲーション・画面構成

### 3セクション構造（トップナビ）

| セクション | 画面 |
|---|---|
| 申請・承認 | 新規申請 / 承認待ち一覧 / 案件一覧（申請タブ） |
| 開発管理 | 案件一覧（開発タブ） / 案件詳細 / タスク管理はモーダル |
| 予算管理 | 案件一覧（予算タブ） / 予算実績入力モーダル |
| 共通（下部） | 通知 / プロフィール |

### 案件一覧はタブで列切替

`/projects?tab=approval|dev|budget` の URL クエリで状態保持。Controller 側でクエリとタブを同時に扱い、**同一 React コンポーネント + tab props で列セットを切替**。

| タブ | 主な列 |
|---|---|
| approval（申請） | タイトル / ステータス / 承認ステップ / 申請日 / 部門 / 最終更新 |
| dev（開発） | タイトル / 部門 / 主担当 / タスク進捗 / 期限 / 最終更新 |
| budget（予算） | タイトル / 部門 / 予算額 / 実績額 / 消費率 / 更新日 |

### サイドバー「承認待ち一覧」のルーティング

サイドバー左メニューの「承認待ち一覧」は独立した画面を持たず、
案件一覧（申請タブ）のプリセット表示として実装する：

- 遷移先: `/projects?tab=approval&filter=pending`
- Controller 側で `filter=pending` を検出し、ロール別に以下で絞り込む：
  - dept_manager: `status = pending_dept` かつ `department_id = self.dept`
  - hq_manager: `status = pending_hq`（全部門）
  - applicant: 本メニューは非表示（または自分の pending 案件のみ）
- UI は s03a と完全共通。タイトル下に「承認待ち」バッジを表示して文脈を示す

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
4. `reject($project, $approver, $level, $comment)`: → rejected + approvals レコード
5. 各アクション後、関係者に notifications を発行

### 承認後の開発管理フェーズ移行
`projects.status = approved` になった時点で：
- 案件情報の編集をロック
- タスク作成・進捗入力を解禁
- `budget_amount` を `estimated_amount` から転記
- 予算実績入力を解禁

---

## 8. 実装順序（Phase）

| Phase | 内容 | 目安 |
|---|---|---|
| 0 | 設計・Laravel環境構築・Breeze/Spatieインストール・DB設計 | 15h |
| 1 | 認証（Breeze カスタマイズ）・レイアウト（3セクションサイドバー）・シーダー | 10h |
| 2 | 申請・承認フロー（S-01/03a/05/06/07/08 + 通知） | 20h |
| 3 | 開発管理・予算管理（S-03b/03c/04/10/11） | 20h |
| 4 | +α（承認ステッパーUI実装 + レスポンシブ調整） | 15h |
| 5 | ドキュメント・マニュアル・プレゼン資料・デプロイ | 20h |

> **GW中（5/3〜5/6）は1日1h程度**しか稼働できない。GW前にPhase2完了が目標。

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

### テスト
- PoC では Feature テストを承認フローと権限境界に絞って書く（全網羅は不要）
- `php artisan test` で CI に通る状態を維持

### Git / 提出
- main ブランチへの直 push は禁止。作業ブランチ → main へマージ
- コミットメッセージは `feat:`, `fix:`, `refactor:`, `docs:` の prefix
- **提出期限以降の commit は評価対象外**
- 提出後の修正は認められない

---

## 10. 設計モック・参照資料

Cursor 上で実装する際は、対応する HTML モックと設計資料を必ず確認すること。

| 画面 | モック | 設計資料 |
|---|---|---|
| S-03a 案件一覧(申請) | `mockups/s03a_projects_approval.html` | screen_flow.md §4-1 |
| S-02 ダッシュボード（課題2） | `mockups/s02_dashboard.html` | — |
| 全画面のUI仕様 | — | v0_prompts.md |
| 画面遷移 | — | screen_flow.md |
| 設計思想 | — | design-philosophy.md |
| 色・フォント・部品 | — | design_system.md + color-guide.md |
| ER図・区分値 | — | er_diagram.md |

---

## 11. テストアカウント（シーダーで投入）

| ロール | メール | パスワード | 所属部門 |
|---|---|---|---|
| 申請者 | applicant@example.com | password | 開発1部 |
| 部門管理者 | dept@example.com | password | 開発1部 |
| 本部管理者 | hq@example.com | password | 本部 |

部門は「開発1部」「開発2部」「開発3部」+ 「本部」。申請者 / 部門管理者は各部門1名ずつシードし、動作確認を容易にする。

---

## 12. よくある相談と回答

- **Q: この機能追加してもいい？** → 課題1必須要件か確認。課題2なら後回しを提案。
- **Q: テーブル追加したい？** → `doc/Design/design-philosophy.md §2` の「将来テーブル追加」に該当するか確認。PoCで必要なら追加 OK、そうでなければ nullable FK のみ残す。
- **Q: UI を変えたい** → design_system.md の色・余白ルールの範囲で。バッジ・ステッパーの色は「統一済み」なので変えない。
- **Q: APIが欲しい** → Inertia を採用しているため REST API は作らない。内部は Inertia response で返す。
