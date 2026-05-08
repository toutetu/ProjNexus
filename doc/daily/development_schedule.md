## 全体スケジュール（要約管理版）

このファイルは、進捗を短く確認するための要約版です。  
詳細な実行手順・コマンドは `doc/daily/implementation_schedule.md` を参照します。
日々の詳細作業記録は `doc/daily/log/` 配下へ分離して管理します。

---

### 詳細ログ保管先

`doc/daily/` 直下は「簡潔版・提出用」、`doc/daily/log/` 配下は「詳細版・作業記録用」という住み分け。

| 用途 | 簡潔版（`doc/daily/`） | 詳細版（`doc/daily/log/`） |
|------|----------------------|--------------------------|
| 日報（非エンジニア向け） | `daily_report.md` | `daily_report_log.md` |
| 技術的な作業記録 | — | `daily_technical_report.md` |
| 実装スケジュール | `implementation_schedule.md` | `implementation_schedule_log.md` |

---

### 基本情報（2026-05-08 更新）

- **開発期間:** 4/13〜5/15（5週間・100時間以内）
- **累計実績:** 70h（実装フェーズ完了ベース）
- **残り時間:** 30h（資料・最終確認中心）
- **稼働方針:** 平日中心（平均 1日5h目安、火曜は通院で3h）
- **リスク期間:** GW（4/29, 5/3〜5/6）は稼働1h/日程度に低下

---

### Phase別の時間配分（2026-05-08 時点）

| Phase | 内容 | 見積 | 実績 | 状態 |
|-------|------|------|------|------|
| Phase 0 | 設計・環境構築 | 15h | 31h | ✅ 完了 |
| Phase 1 | 認証・レイアウト・共通UI | 10h | 9h | ✅ 完了 |
| Phase 2 | 申請・承認フロー（課題1の核） | 20h | 15h | ✅ 完了 |
| Phase 3 | 開発管理・予算管理（MVP優先） | 20h |  10h | ✅ 完了（履歴自動記録・通知・初期タスク等を含む） |
| Phase 4 | +α（最小） | 15h | 3h | ✅ 完了（S-14 3ビュー・4値運用・通知拡張・設計同期） |
| Phase 5 | 資料・マニュアル・最終確認 | 10h | 2h | 🟡 進行中 |
| 予備バッファ | 遅延吸収・バグ修正 | 10h |    | - |

> 実装時間は Phase 1〜4 で **75h** を消化。残りは Phase 5（資料・提出）とバッファで運用する。  
> 以降は新機能追加よりも、提出品質（整合性・再現性・デモ導線）を優先する。

---

### 現在地（2026-05-08 時点）

- **現在の主作業:** Phase 5（資料同期・提出準備・デプロイ確認）＋ `implementation_schedule.md` の **マスト改修**
- **本日追加:** S-02 ダッシュボードを実装（Recharts導入、サイドバー導線追加、設計書同期）
- **本日追加（運用）:** 時刻表示基準を JST に統一（`config/app.php` のタイムゾーン設定を更新）
- **直近完了:** S-14（board/members/list）、4値運用（`resolved`/`closed`）、通知拡張（`task_resolved`/`task_reviewed`）、設計書群の実装同期
- **直近完了（設計）:** `er_diagram.md` v6 化、`components_spec.md` 正本化、`Information.md` シナリオ拡充、`screen_flow.md` 実装整合、`s16_burndown_policy.md` 追加、Button 運用（`neutral`）定義追記
- **次の着手:** `doc/daily/implementation_schedule.md` §3 の **マスト改修**（サイドバー・案件一覧ラベル・ファイルアップロード・タスク完了バグ・予算ダッシュボード・プロフィール簡素化・ロール説明・申請者向けスマホ確認）を計画どおり進める／並行してマニュアル・プレゼン・提出チェックを実体一致で締める
- **次の着手（具体）:** S-02 の手動確認（3ロール）と、履歴系時刻の JST 表示確認、確認結果のマニュアル/プレゼン資料への反映

---

### 今週の目標（5/7〜5/15）

1. Phase 5（資料・提出準備）を完了する
2. デプロイ環境で 3 ロール導線の最終確認を完了する
3. 提出物チェックリストを「実体一致」で締める
4. **マスト改修:** `implementation_schedule.md` の表に沿って優先順位を決め、完了した項は設計書・マニュアルへ追随させる

---

### リスクと対策（更新）

- **リスク1:** GW期間は稼働時間が低下（2日/週）
  - **対策:** GW前（5/1まで）に Phase 3 を完了させる
- **リスク2:** 資料の記載が実装とズレる可能性
  - **対策:** `requirements.md` の棚卸し表を正本として、各ドキュメントを相互参照で更新
- **リスク3:** 火曜の通院・家族事由による突発的な稼働低下
  - **対策:** 毎週金曜に残時間・進捗率を棚卸し、翌週の優先3タスクを確定
- **リスク4:** 最終週の資料作成が間に合わない
  - **対策:** 新規実装は停止し、資料・提出物検証に残時間を集中配分

---

### 毎週金曜の確認項目

- 実績時間と残時間
- Phase ごとの完了率
- ブロッカーの有無
- 翌週の優先3タスク

---

### 未実装の機能（2026-05-08 追記）

#### マストで修正する項目

- レフトバーの「申請・承認」「開発管理」「予算管理」の各項目を見直す
- レフトバーの「案件一覧」名称を変更する（3つあると分かりづらいため）
- ファイルアップロードを実装する
- タスク管理で、タスク完了入力時にエラーになるバグを修正する
- 予算ダッシュボード（`/dashboard`）を整備する（2026-05-08 実装済み）
- プロフィールは「表示＋パスワード更新」のみとし、アカウント削除項目を消す
- ロールの説明を画面上で分かるようにする
- 申請者がスマホで確認できるようにする

#### 今後の実装項目（今回実装しない、課題2扱い）

- 本部権限のみで、ユーザーアカウント（権限・部門）を動的に追加できる機能（ユーザー管理）
- 本部で部門を作成し、その部門でログインできるようにする（部門マスタ）
  - 基本情報は本部で編集しない
  - アカウント削除は今回スコープ外
  - 生年月日項目は今回スコープ外
- 通知をメール送信できるようにする
- 概算予算と実績の見積書をエクスポートできるようにする

---

### 日次ワークフロー（必須ルーティン）

日次の git 手順・コミット方針・チェックリストは **`doc/Design/AI.md §9 日次ワークフロー` を唯一の正本**とする。本ファイルには手順を記載しない（二重管理を避けるため）。

Cursor / Claude との協働でも必ず遵守。

---

## Phase 0の中での進捗（✅ 完了）

> 以下の Phase 0〜5 チェックリストは**当時時点の作業ログ（履歴）**。  
> 現在の進捗判定は本ファイル上部の「基本情報」「Phase別の時間配分」「現在地」を正とする。

- [x] 課題の読み込み・理解
- [x] 技術スタック決定
- [x] デプロイ先決定
- [x] 機能一覧の整理
- [x] ER図（v4）作成
- [x] 画面遷移の整理
- [x] デザインルール策定（カラー・UI方針）
- [x] デザインイメージ モック作成（S-03a/b/c, S-04, S-10, S-11 完成）
- [x] 設計ドキュメントの作成（Cursor向け CLAUDE.md）
- [x] Laravel 環境構築
- [x] Breeze（React + Inertia + TS）インストール
- [x] Spatie Permission のインストール
- [x] DB作成・マイグレーション（users / departments / permission tables）
- [x] シーダー作成（3ロール × 4部門、7テストアカウント）
- [x] ログイン後遷移を `/projects?tab=approval` に固定
- [x] 3ロールでの動作検証（ブラウザ確認）
- [x] デプロイ先の初期設定・動作確認（Laravel Cloud）

---

## Phase 1 チェックリスト（認証・レイアウト・共通UI／8h）

### レイアウト
- [x] `AuthenticatedLayout.tsx` を 3セクションサイドバー構造に改修（4/21）
  - [x] 「申請・承認」「開発管理」「予算管理」セクション分け（4/21）
  - [x] 共通（下部）「通知」「プロフィール」配置（4/21）
  - [x] ロール別のメニュー表示制御（applicant に承認待ちは非表示 等）（4/21）
- [x] サイドバー下部にログインユーザー名・ロール・部門表示（4/21）
- [x] トップバー（Header）の通知ベル → 通知一覧・未読件数（4/24）
- [ ] モバイル用のハンバーガーメニュー骨組み（中身は Phase 4 で仕上げ）

### 共通コンポーネント（shadcn/ui ベース）
- [x] shadcn/ui 基盤導入：Button / Badge（components.json + lib/utils）（4/21）
- [x] shadcn/ui 追加：Input / Dialog / Table / Select（4/22）
- [x] `StatusPill.tsx`（案件ステータス 5 種のカラー統一）（4/21）
- [x] `ApprovalStepperMini.tsx`（案件一覧内の小型ステッパー）（4/22）
- [x] `Tabs.tsx`（`/projects?tab=approval|dev|budget` の URL 連動）（4/22）
- [x] `EmptyState.tsx`（一覧が空の時の表示）（4/22）

### ページ雛形
- [x] `Projects/Index.tsx` にタブ切替の雛形を実装（ダミーデータ）（4/22）
- [x] `Projects/Show.tsx` の骨組みを作成（4/22）
- [x] ログイン画面のブランディング微調整（ロゴ・配色）（4/22）

### 確認
- [x] TypeScript・Vite ビルドが通る（`npx tsc --noEmit` / `npm run build` OK）（4/21）
- [ ] 3ロールでログイン → メニューがロール別に切り替わる（ブラウザ実機確認は次回）
- [x] `/projects?tab=approval|dev|budget` の URL で見た目が切り替わる（4/22 実機確認）
- [x] コンソールエラーがゼロ（4/22 実機確認）

---

## Phase 2 チェックリスト（申請・承認フロー／20h）

### DB / Model
- [x] `projects` migration（parent_project_id, revision, status, estimated_amount, budget_amount, actual_amount 等）
- [x] `approvals` migration（level, action, approver_id, comment, acted_at）
- [x] `notifications` migration（user_id, type, title, body, read_at）
- [x] `Project` / `Approval` / `Notification` Model（リレーション・スコープ）
- [x] `Enums`：`ProjectStatus` / `ApprovalLevel` / `ApprovalAction` / `NotificationType`

### Policy / 権限
- [x] `ProjectPolicy`（viewAny / view / create / update / delete）
- [x] Controller でロール別クエリ分岐（applicant=自分のみ、dept=自部門、hq=全件）
- [x] 却下→再申請の分岐（`parent_project_id` でチェイン）（4/24 追記）

### 画面：申請側（申請者）
- [x] `Projects/Create.tsx`（S-05 新規申請）
- [x] `Projects/Edit.tsx`（S-06 案件編集、draft / rejected のみ）
- [x] `Projects/Index.tsx` 申請タブ：自案件一覧＋ステータス
- [x] `Projects/Show.tsx`（S-04 案件詳細、承認ステッパー表示）

### 画面：承認側
- [x] 承認待ち一覧（`/projects?tab=approval&filter=pending`）のロール別フィルタ
- [x] `ApprovalDialog.tsx`（S-08 承認/却下モーダル、コメント入力）
- [x] 部門管理者が申請者の場合 → `pending_hq` 直行（UI にも表示）（4/24 追記）

### Service / Controller
- [x] `ProjectController`（index / show / store / update / destroy）
- [x] `ApprovalController`（approve / reject）
- [x] `ApprovalService`（submit / approveDept / approveHq / reject）
- [x] `NotificationService`（承認・却下時に関係者へ通知作成）

### 通知
- [x] `Notifications/Index.tsx`（S-12 通知一覧）（4/24）
- [x] トップバー／サイドバーの通知バッジ（未読件数）（4/24）
- [x] 承認・却下・申請時に通知が発行される（`NotificationService` 経由・4/24 時点で動作確認は手動継続）

### 検証
- [x] 3ロール × 部門却下 / 本部却下 → 再申請シナリオ（手動確認済み・2026-04-27）
- [x] ロール境界：他部門の pending 案件が見えない／編集できない（手動確認済み・2026-04-27）
- [x] Feature テスト：承認フロー 1 本、権限境界 1 本（`ProjectApprovalFlowTest`・4/24）
- [x] 3ロール × 申請〜最終承認のハッピーパス（手動確認済み・2026-04-27）
---

## Phase 3 チェックリスト（開発管理・予算管理 MVP／12h）

### DB / Model
- [x] `tasks` migration（title, assignee_id, status, progress_rate, start_date, due_date, parent_id(nullable), milestone_id(nullable)）
- [x] `task_comments` migration（最小：body, user_id, task_id）
- [x] `task_histories` migration（自動記録用、最小カラムで可）
- [x] `ProjectWorkItem` / `ProjectTaskComment` / `ProjectTaskHistory` Model（`tasks` / `task_histories`）
- [x] `TaskHistoryService` による `task_histories` 自動記録＋`Projects/Show.tsx` タスク行展開表示（2026-05-01）

### 承認後ロック
- [ ] `status=approved` 時に案件編集をロック
- [ ] 承認時に `estimated_amount → budget_amount` 転記（ApprovalService で実装）
- [ ] タスク作成・進捗入力・予算実績入力を `approved` 後のみ解禁

### 画面：開発管理
- [x] `Projects/Show.tsx` にタスク一覧セクション追加
- [x] `ProjectTaskDialog.tsx`（S-10 タスク作成・編集モーダル）
- [x] タスク進捗率 → 案件進捗率の自動算出（表示のみ、DB には持たない）
- [x] `Projects/Index.tsx` 開発タブの列セット実装

### 画面：予算管理
- [x] `BudgetActualDialog.tsx`（S-11 予算実績入力モーダル）
- [x] `BudgetController`（実績更新）
- [x] `Projects/Index.tsx` 予算タブの列セット実装（消費率算出・警告）
- [ ] 消費率 70% 超で `StatusPill` を警告色に

### 検証
- [ ] 承認前は編集可能 / 承認後はロックされる（手動確認）
- [ ] タスク進捗を入力 → 案件進捗率が反映される（手動確認）
- [ ] 予算実績を入力 → 消費率が一覧に反映される（手動確認）
- [x] `php artisan test` / `npm run build` / `npx tsc --noEmit` を通過（2026-04-27）
- [x] 期限接近タスク通知コマンドを追加し、日次スケジュール実行を設定（`tasks:notify-due-soon` / 09:00）

### 2026-05-01 追加完了項目
- [x] `TaskHistoryService`・`task_histories` 自動記録（5項目・表示用文字列）
- [x] `ProjectTaskController` / `ApprovalService` からの記録呼び出し
- [x] `TaskHistoryTest`（Feature）
- [x] `doc/Design` のタスク履歴関連を実装に同期

### 2026-04-30 追加完了項目
- [x] 下書き案件は申請者のみ閲覧可能（一覧/直接URLともに制御）
- [x] 下書き保存時の必須項目を「タイトルのみ」に変更（申請時は従来必須を維持）
- [x] 案件一覧タブに実件数を表示（申請/開発/予算）
- [x] 一覧タブから詳細遷移時に対応タブを初期表示（申請→申請詳細、開発→タスク、予算→予算）
- [x] タスク通知（担当変更・完了・期限接近）を実装
- [x] 本部承認直後に初期タスク「実装計画作成」（3人日）を自動作成

---


## Phase 4 チェックリスト（履歴）

> 2026-05-01 のスコープ拡大判断：残時間 40h を活用し、課題1 補強と課題2 +α を本気実装する方針に変更。

### 既定の +α
- [x] 承認ステッパーUI（詳細画面用、大型版）
- [ ] レスポンシブ調整（主要 3 画面のみ）
  - [ ] `/projects` 一覧（タブ含む）
  - [ ] 案件詳細
  - [ ] 申請フォーム
- [ ] モーダル類のタブレット対応最低限確認

### 課題1 補強（追加実装決定・2026-05-01）
- [ ] **`TaskHistoryService` 自動記録実装**（5項目：`status` / `progress_rate` / `assignee_id` / `due_date` / `priority`）
- [ ] `ProjectTaskController::store / update` から Service 呼び出し
- [ ] 案件詳細画面のタスクカードに「変更履歴」セクション追加（`Show.tsx` の既存 props 活用）
- [ ] Feature テスト：主要フィールド変更で履歴が記録されること（1〜2 ケース）

### 課題2 として実装決定（2026-05-01）
- [ ] **S-14 タスク一覧**（カンバン + メンバー別 ビュートグル・採用：`mockups/s14b_member_tasks_toggle.html`）
  - [ ] migration: `tasks.reviewer_id` 追加（nullable FK→users）
  - [ ] `MemberTaskController` + ロール別クエリ + view 切替
  - [ ] `MemberTasks/Index.tsx` + `KanbanBoard.tsx` + `MemberMatrix.tsx` + `TaskCard.tsx` + `ViewToggle.tsx`
  - [ ] `routes/web.php` に `/member-tasks` 追加
  - [ ] サイドバー「タスク一覧」dim 解除
- [ ] **タスク 4値運用**（実装者→確認者の品質ゲート）
  - [ ] `ProjectTaskDialog` に確認者選択・`resolved` 遷移ボタン追加
  - [ ] `ProjectTaskController` に `resolved` バリデーション
  - [ ] `NotificationService::notifyTaskResolved` / `notifyTaskReviewed` 追加
  - [ ] `NotificationType` Enum に `TaskResolved` / `TaskReviewed` 追加
  - [ ] `TaskStatus::phase4Values()` ヘルパ追加
  - [ ] `ApprovalService` 自動初期タスクに `reviewer_id` 初期値（部門管理者）設定
  - [ ] `ProjectWorkItemPolicy` の遷移権限分岐（`assignee` only / `reviewer` only）
- [ ] 遅延の見える化（一覧の期限超過バッジ・3日以内早期警告）
- [ ] 消費率 70% 警告色（Phase 3 積み残し）

### 設計のみ（プレゼン素材）
- [ ] `budget_actuals` 追加方式の ER 図と移行手順
- [ ] ダッシュボード（S-02）モック練り直し

---

## Phase 5 チェックリスト（現行タスク）

### ドキュメント
- [ ] `doc/Information.md`：デプロイURL・テストアカウント一覧
- [ ] 利用マニュアル（簡易）：主要4フロー
  - [ ] ログイン〜新規申請
  - [ ] 部門承認〜本部承認
  - [ ] 却下〜再申請
  - [ ] タスク登録〜予算実績入力
- [ ] README 最終調整（セットアップ手順・開発サーバ起動）

### プレゼン資料（`doc/presentation_高橋朋子.md`）
- [ ] 課題1 工夫点のまとめ
  - 承認フローの監査証跡（approvals テーブル）
  - 却下→再申請の親子リンク
  - 部門管理者の自己承認防止
  - タブ式UIによる3用途の同一画面共通化
- [ ] 課題2 プレゼン
  - 優先度高：ステッパーUI（実装済み）
  - 優先度中：ダッシュボード案、メンバータスク一覧案
- [ ] 感想・学び

### デプロイ / 提出
- [ ] 本番環境の DB リセット＋デモ用シード投入
- [ ] 3ロール × 全画面の本番動作確認
- [ ] main ブランチへのマージ完了
- [ ] GitLab / Laravel Cloud のダウンがないこと確認
- [ ] 提出期限までに提出完了

### 最終確認
- [ ] 提出物チェックリスト（requirements.md §提出物）5項目すべて完了
- [ ] `php artisan test` が通る
- [ ] コンソールエラー・TypeScript エラーなし

---

## バグ修正・UI改善（追記）

### バグ修正
- [x] `/login` 画面下部にテストユーザー一覧（申請者 / 部門管理者 / 本部管理者）を表示
- [x] `/login` 画面に `パスワード：password` 表示を追加
- [x] `/notifications` で白画面になる不具合を修正
- [x] `/projects/3/edit`（案件編集）を `/projects/create` 準拠で再構成し、編集画面から申請できるよう修正
- [x] 申請後の遷移先を `/projects?tab=approval` に統一（案件詳細への遷移を廃止）
- [x] `/projects?tab=approval`（申請タブ）をモック寄せで調整（操作列削除、行 hover 遷移、下書き/申請済みの遷移分岐）
- [x] 申請タブのタイトル「S-05新規申請」を「承認画面」に変更
- [x] 承認画面下部に「承認」「却下」ボタンを配置し、押下時にコメント入力モーダルを表示
- [x] コメント入力モーダルを S-04 案件詳細の承認モーダル仕様に統一（`mockups/s04_policy.md`, `mockups/s04_project_show.html`）
- [x] 「案件一覧から再編集」を、申請一覧の「ステータス=下書き」絞り込みリンクへ変更
- [x] 担当部門プルダウンから「本部」を除外
- [x] 概算工数の下にファイル添付「課題２」欄を追加（課題２装飾は共通部品化）
- [x] 下書き保存失敗時に「保存できませんでした！」のポップアップを表示
- [x] 「申請する」押下後モーダルの文言を更新
  - [x] 通知文言：`承認/却下時にアプリ内通知（＋メール 課題２）`
  - [x] 注意文言：`申請後、次の承認者が承認するまでは申請を取り下げできます`
- [x] 右上検索窓を薄いグレー塗りつぶしにし、`検索 "課題２"` 表示へ調整
- [x] ログアウト後の遷移先を `/login` に統一
- [x] `/projects?filter=pending&tab=approval` では申請タブのみ表示（開発/予算タブ非表示）
- [x] サイドバー「承認待ち一覧」の横に自分の承認待ち件数を表示（`mockups/s05_project_create.html` 参照）
- [x] `doc/Design/components_spec.md` の `ApprovalFlowGuide` 項目に「現状使用箇所なし」を明記
- [x] タスク追加・タスク編集画面をモック寄せで改善（アイコン追加、コメント機能追加）
- [x] `/projects/create` の承認フローガイドを `ApprovalStepperFull` に差し替え（S-04 仕様準拠）
- [x] 申請済みかつ部門承認待ちの案件を「取り戻し→下書き化」可能に変更
- [x] 「申請する」押下後モーダルのステータス表示を案件一覧下の凡例準拠に変更
- [x] 案件一覧の申請/開発/予算タブ横の数字を案件数に変更
- [x] 一覧タブから詳細遷移時の初期タブを統一（申請→申請、開発→タスク、予算→予算）
- [x] 詳細タブに応じたサイドバーアクティブ表示を修正
- [x] `/projects/create` のプレースホルダー文字色のみ薄く調整（枠線濃度は維持）
- [x] 案件一覧の右端「>」マークを削除
- [x] `/projects/9?detailTab=history` の履歴表示を逆順（最新が下）に変更
- [x] `/projects/9?detailTab=tasks` の進捗バーを進捗率連動の配色へ変更
- [x] `doc/Design/components_spec.md` の「進捗バー配色ルール」を「消費率の色分けルール」準拠に書き換え、実装反映
- [x] 申請後説明文を更新（部門承認前は取り戻し可能、部門承認後は編集不可）
- [x] `/projects/12?detailTab=tasks` で進捗集計欄を上部へ移動し、予算工数/計画工数/実績工数で集計
- [x] `/projects/12?detailTab=tasks` に検索機能を追加
- [x] `https://projnexus-main-butvrx.laravel.cloud` をログイン画面またはホームへリダイレクト

### S-03a（`mockups/s03a_policy.md`）と実装の整合（2026-05-07 反映）

- [x] **①**: 行末 chevron は実装しない方針のため、ポリシーから削除済み（**実装を正**）
- [x] **②**: タイトル2行（purpose 要約）・却下行に「再申請可」+ 却下コメント要約（API の `purpose` / `rejectedComment` と UI。**実装を正**）
- [x] **③**: 下書き＋編集可は編集画面へ、その他は詳細（apply）（**実装を正**）
- [x] **④**: サブタイトル「全N件」は `Paginator::total()`（**実装を正**）
- [x] **⑤**: 検索ラベルを実装どおり（案件名・申請者・主担当・部門名）（**実装を正**）
- [x] **⑥**: フィルタ「クリア」を brand-blue リンク風（**実装を正**）
- [x] **⑦**: タブ横ガイド・凡例ヒントを `Infotip` に変更（**実装を正**）
- [ ] **⑧**: タブ下線を **3px**（ポリシーを正、`Tabs.tsx`）
- [x] **⑨**: ページネーションにページ番号列（省略 …）（実装）
- [x] **⑩**: 申請タブ「最終更新」を相対表示（実装）
- [ ] **⑪**: 一覧ヘッダー「新規申請」を **本部管理者には表示しない**（ポリシーを正、`canCreateProject`）
- [ ] **⑫**: 一覧テーブルの UI 正本は **`resources/js/Components/Projects/ProjectTable.tsx`**（3バリアント）。`Projects/Index.tsx` はページ統合・データマッピング・`router.visit` 連携。ポリシー詳細は `mockups/s03a_policy.md` §一覧テーブルの実装配置
- [x] **⑬**: 列ソート・「本部直行」バッジは実装上の追加でありポリシーに記載済み（実装を正）

### 継続UI調整（実施中）


#### 完了済み
- [x] ログイン画面に部門長テストユーザーをプリセット
- [x] ログイン画面で3ロール代表ユーザー表示＋「＋」で全ユーザー展開
- [x] ログイン画面のマニュアルリンクをテストユーザー一覧より上へ配置
- [x] 全マニュアルリンクを別窓表示に統一
- [x] アプリ名を「開発管理アプリ ProjNexus」に変更
- [x] サイドバーのプロフィール上に「マニュアル」導線を追加
- [x] 管理画面サイドバー見出し（開発管理アプリ）の縦パディング調整
- [x] フォーム補足説明のツールチップ化（常時表示文を整理）
- [x] 部門管理者向け承認フロー説明を `ApprovalStepperFull` へ置換し、設計方針書・`doc/Design` も同期
- [x] レフトナビにスクロール機能を追加
- [x] マニュアル 2.2 承認フロー（状態遷移図）のラベル配色可読性を改善（黒地/白字）
- [x] マニュアル本文先頭の重複目次を削除し、目次リンク不整合を解消
- [x] マニュアル目次をモバイル/タブレットでハンバーガーメニュー化
- [x] ログイン画面・マニュアル・サイドバーのアプリ名表記を `ProjNexus` へ統一
- [x] 「一覧に戻る」「キャンセル」ボタンの見た目を共通化（`Button` の `neutral` variant）
- [x] `/projects/create` 下書き保存時の `estimated_amount` null エラーを修正
- [x] サイドバー「マニュアル」リンクを別タブ表示に修正（`target="_blank"` 対応）
- [x] `/projects/{id}/edit` を `/projects/create` 準拠UIへ統一（タイトル・一部項目は編集用として維持）
- [x] マニュアル 2.2 状態遷移図の黒地/白字表示の最終反映確認（別チャット対応分を基準に確認）
- [x] マニュアルリンク切れを総点検（別チャット対応分の確認待ち）
- [x] `/projects/3?detailTab=apply` 承認画面に申請画面同等の添付ファイル欄を追加
- [x] `/projects?tab=approval` のページ送り件数を 5 件に調整
- [x] `/profile` の英語UI文言を日本語化（プロフィール/パスワード/削除導線）
- [x] `/profile` の説明文 2 箇所を共通 `Infotip` に置換
- [x] トップバー右端にログアウトアイコンを追加し、通知/マニュアル/ログアウトにツールチップを実装
- [x] サイドバーフッターのログアウトアイコンを廃止し、プロフィール直下へログアウト導線を移動
- [x] サイドバーのログアウト項目直上に仕切り線を追加
- [x] サイドバーセクション見出し（申請・承認/開発管理/予算管理）の可読性を改善


#### 未完了
- [ ] ログイン画面のアカウント一覧をシーダーと一致
- [ ] サイドバー左上アプリ名クリックで Notion へ遷移
- [ ] レフトナビ開閉（折りたたみ）機能、幅調整機能の追加
- [ ] GitHub プロジェクト名を `projnexus` に変更
/**更新完了**/