# AI.md — Cursor 向け入口（実装ガイド）

> Cursor 上の AI が **最初に読む** 資料です。  
> **設計の事実**（スコープ・DB・URL・ロール・承認・通知の正本）は **`doc/Design/system_spec.md`** に集約しています。実装や仕様変更後は **必ず `system_spec.md` を更新** してください。  
> プレゼン用の設計ストーリー・判断の背景は **`doc/Design/design-philosophy.md`**（本ファイルでは繰り返しません）。

---

## 1. 読了順（推奨）

1. **本ファイル（AI.md）** — 進め方・約束事・モック一覧
2. **`system_spec.md`** — スコープ・技術・データ・画面・権限・承認・通知（**事実の正本**）
3. 作業に応じて **`components_spec.md`**（UI 部品）、**`design_system.md`**（トークン）、**`screen_flow.md`**（遷移）、**`er_diagram.md`**（列・Enum）
4. 運用・手動検証・URL:**`Information.md`**、次回タスク:**`doc/daily/implementation_schedule.md`**

---

## 2. プロジェクト概要（最小）

個人開発のポートフォリオ。架空企業の開発管理プロセス（申請・Excel・予算の分散）を一元化する Web アプリ PoC。

- **期間**: 2026-04-13 〜 2026-05-15（5週間・100時間以内）
- **提出先**: GitLab `quest_1` リポジトリの `main` ブランチ
- **評価**: 課題1 の完成度・工夫 + 課題2（+α）のプレゼン + 資料

背景・課題分析の詳細は `requirements.md` と `design-philosophy.md` を参照。

---

## 3. 実装フェーズ（Phase）

> 見積・チェックリストは `doc/daily/development_schedule.md`、日次の着手順は `doc/daily/implementation_schedule.md`。

| Phase | 内容 |
|-------|------|
| 0 | 設計・Laravel 環境・Breeze/Spatie・DB 設計 |
| 1 | 認証・レイアウト（3セクション）・共通 UI |
| 2 | 申請・承認フロー（S-03a/04/05/06/08 + 通知 S-12） |
| 3 | 開発管理・予算管理（S-03b/03c/10/11 の MVP） |
| 4 | +α（承認ステッパー大型版 + レスポンシブ最低限） |
| 5 | ドキュメント・マニュアル・プレゼン・デプロイ確認 |

> **GW（4/29, 5/3〜5/6）は 1日1h程度**。**5/1 までに Phase 2 完了**、GW 週で Phase 3 MVP、最終週で +α と資料、が基本線。

---

## 4. 実装時の約束事

### コード

- TypeScript を使用。`any` は原則禁止
- Controller は薄く、ビジネスロジックは Service へ
- クエリは Eloquent のスコープ + Policy（Controller 内生 SQL は避ける）
- `enum` は PHP 8.1+ Native Enum（`App\Enums`）
- マイグレーションは機能単位で分割。マージ後は既存ファイルを編集せず **追加 migration**（運用の詳細は `system_spec.md` §5）

### UI

- 色・フォント・余白は `doc/Design/design_system.md` を厳守
- ステータスバッジ・ステッパー・カードはコンポーネント化
- shadcn/ui は `npx shadcn-ui@latest add` で個別追加
- モバイルは後回し可だが、レスポンシブ用 Tailwind クラスは付与
- 表示文言は日本語を原則（英語は固有名詞等に限定）
- 承認/却下は `ApprovalDialog` 経由（POST 直ボタンのみにしない）
- 一覧の申請/承認/却下/編集は行単位の処理中ロックとスピナー
- 編集可否はフロントの条件分岐に加え、サーバーの `canEdit` と Policy の両方

### テスト

- Feature テストは承認フローと権限境界に絞る（全網羅不要）
- `php artisan test` が通る状態を維持

### Git / 提出

- `main` への直 push は禁止。作業ブランチ → マージ
- コミットメッセージ: `feat:`, `fix:`, `refactor:`, `docs:` 等の prefix
- **提出期限以降の commit は評価対象外**
- 提出後の修正は不可

### 仕様・設計ドキュメント

- **スコープ・DB・権限・承認・通知を変えたら `system_spec.md` を更新する**（本ファイルに長文を戻さない）
- 画面・コンポーネントの Props は `components_spec.md`、トークンは `design_system.md`

---

## 5. 日次ワークフロー（必須ルーティン）

> **目的**: 1 日単位で作業をブランチに閉じ、日報と実装をセットで残す。  
> **本節が日次 Git 手順の唯一の正本**（`implementation_schedule.md` / `development_schedule.md` はここへリンクのみ）。

### 作業開始時（毎日）

1. `main` を最新化: `git checkout main && git pull origin main`（PowerShell では `;` で連結可）
2. **作業ブランチを切る**: `git checkout -b <branch-name>`（例: `feat/phase2-apply-form`, `docs/daily-YYYYMMDD`）
3. **main 上では実装しない**。ブランチ作成後に着手
4. 再開時は `doc/daily/implementation_schedule.md` を先に確認

### 作業中（区切りごと）

1. **`doc/Design/`** の該当ファイルを更新（**事実は `system_spec.md`**）
2. **`mockups/`** を必要に応じて更新
3. コミットは **コードと `doc/Design`+`mocks` を分ける**（別コミット）

### 作業終了時（毎日）

1. **`doc/daily/`** を更新: `daily_report.md`（追記のみ）、`log/daily_technical_report.md`、`development_schedule.md`、`implementation_schedule.md`
2. コミット・push
3. `main` へのマージは自己レビュー後

### 注意

- `daily_report.md` の**提出済み部分は変更しない**（追記のみ）
- ブランチ切り直し時は現在のブランチを push してから
- PowerShell では `&&` が使えない場合がある → **`;` で連結**

---

## 6. 画面モック・参照資料

実装前に HTML モックと `*_policy.md` を確認すること。

### 画面モック一覧

| 画面ID | 画面名 | HTML モック | 画面ポリシー |
|--------|--------|-------------|--------------|
| S-02 | ダッシュボード | `mockups/s02_dashboard.html` | `mockups/s02_policy.md` |
| S-03a | 案件一覧（申請） | `mockups/s03a_projects_approval.html` | `mockups/s03a_policy.md` |
| S-03b | 案件一覧（開発） | `mockups/s03b_projects_dev.html` | `mockups/s03b_policy.md` |
| S-03c | 案件一覧（予算） | `mockups/s03c_projects_budget.html` | `mockups/s03c_policy.md` |
| S-04 | 案件詳細 | `mockups/s04_project_show.html` | `mockups/s04_policy.md` |
| S-05 | 新規申請 | `mockups/s05_project_create.html` | `mockups/s05_policy.md` |
| S-10 | タスクモーダル | `mockups/s10_task_form_modal.html` | `mockups/s10_policy.md` |
| S-11 | 予算実績モーダル | `mockups/s11_budget_actual_modal.html` | `mockups/s11_policy.md` |
| S-14 | タスク一覧 | `mockups/s14b_member_tasks_toggle.html` | `mockups/s14_policy.md` |

> S-06・S-07・S-08・S-12 は独立モックなし。S-03a / S-05 等に準拠。

### 設計資料一覧

| 資料 | パス |
|------|------|
| **システム仕様（事実の正本）** | **`doc/Design/system_spec.md`** |
| 要件定義 | `doc/Design/requirements.md` |
| 設計思想（プレゼン） | `doc/Design/design-philosophy.md` |
| 画面遷移 | `doc/Design/screen_flow.md` |
| ER・区分値 | `doc/Design/er_diagram.md` |
| デザインシステム | `doc/Design/design_system.md` |
| カラーガイド | `doc/Design/color-guide.md` |
| コンポーネント仕様 | `doc/Design/components_spec.md` |
| 運用・検証 | `doc/Design/Information.md` |

---

## 7. テストアカウント

**正本**: `database/seeders/UserSeeder.php` と **`doc/Design/Information.md`**（シナリオ・URL 含む）。本ファイルでは列挙しない。

---

## 8. よくある相談と回答

- **機能追加していい？** → `system_spec.md` §1 のスコープと照合。課題2 後回しなら提案する
- **テーブル追加したい？** → `system_spec.md` §5（PoC 9 テーブル・将来追加・マイグレ運用）に照合
- **UI を変えたい** → `design_system.md` の範囲内。バッジ・ステッパー色は統一済み前提
- **REST API が欲しい** → Inertia 採用のため作らない。Inertia レスポンスで返す

### 実装前のプラン確認（必須）

実装（コード・マイグレ・ブランチ操作）に入る前に、ユーザーへ次を提示し **承認を得る**。

1. **対象**（課題1 / 課題2 の明示）
2. **変更ファイル**（新規・既存）
3. **方針**（Service / Policy / コンポーネント・クエリ）
4. **影響**（マイグレ・シーダー）
5. **スコープ外**

判断に迷ったら **`system_spec.md`** と本節を参照し、それでも不明なときだけ質問する。

/**更新完了**/
