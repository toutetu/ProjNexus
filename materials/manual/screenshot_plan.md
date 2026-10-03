# 利用マニュアル スクリーンショット追加計画

> 詳細版（`user_manual.md`）と簡易版（`quick_manual.md`）の説得力を高めるためのスクリーンショット追加計画。
> **作業分担**：撮影は Cursor に依頼、撮影後の md への参照挿入は Claude Code 側で実施。
> 最終更新：2026-05-14

---

## 1. 現状と方針

### 既存スクリーンショット（14 枚・流用）

`materials/manual/images/01_login.png` 〜 `14_hq_manager_budget_overview.png`。すべて `user_manual.md`（詳細版）から参照済み。

| # | ファイル名 | 用途 |
|---|---|---|
| 01 | login.png | ログイン画面 |
| 02 | projects_approval_applicant.png | 案件一覧 申請タブ（申請者視点） |
| 03 | projects_create.png | 新規申請フォーム |
| 04 | projects_show_approved_apply.png | 案件詳細 申請タブ（承認済） |
| 05 | projects_show_history.png | 案件詳細 履歴タブ |
| 06 | projects_show_tasks.png | 案件詳細 タスクタブ |
| 07 | projects_show_budget.png | 案件詳細 予算タブ |
| 08 | projects_show_rejected.png | 却下案件 |
| 09 | projects_dev.png | 案件一覧 開発タブ |
| 10 | projects_budget.png | 案件一覧 予算タブ |
| 11 | notifications.png | 通知一覧 |
| 12 | dept_manager_approve_screen.png | 部門承認画面 |
| 13 | hq_manager_projects_index.png | 本部管理者の案件一覧 |
| 14 | hq_manager_budget_overview.png | 本部管理者の予算タブ |

### 追加方針

- 新規ファイルは **`15` から連番**でスネークケース命名
- 撮影解像度：ウィンドウ幅 **1280px**、Retina相当（2x）推奨
- 命名：`NN_<対象>_<状態>.png`（例 `15_sidebar_applicant.png`）
- 保存先：`materials/manual/images/`
- フォーマット：PNG（透過不要）
- 個人情報・本物の社外情報は写さない（シード値のみ）
- **自動一括再撮影**: `php artisan migrate:fresh --seed` と `php artisan serve`（`http://127.0.0.1:8000`）後、`npx playwright install chromium`（初回のみ）→ `node materials/manual/capture/capture-manual-screens.mjs` で #01〜#44 を `materials/manual/images/` に再生成（#01〜#14 は 1440×1024 等倍、#15〜#44 は 1280×900 の 2 倍）。案件 ID は `materials/manual/capture/manual-screenshot-bootstrap.php` がシードの `project_code` から解決し、#15 以降の撮影前に未読通知・開発タブ期限色用のデータを整えます。サーバーの URL は `BASE_URL`、インストール済みのブラウザを使う場合は `PLAYWRIGHT_CHANNEL=msedge` などで指定できます。撮影後、#04・#14・#24・#25 は `public/portfolio/assets/` にもコピーします。

---

## 2. 追加スクリーンショット候補（優先度 A → C）

### A. 必須（13 枚）— 主要 UI と新章のために本当に必要

| # | ファイル名 | 撮影画面 | ログイン | URL | 撮影範囲・準備 | 用途（マニュアル挿入箇所） |
|---|---|---|---|---|---|---|
| 15 | sidebar_applicant.png | 左サイドバー全体 | applicant | `/projects?tab=approval` | サイドバー全体（3 セクション展開・ユーザーカード含む） | 詳細版 §3.2 サイドバー説明 |
| 16 | sidebar_hq_manager.png | 左サイドバー全体 | hq | `/projects?tab=approval` | 同上（ロール表示「本部管理者」のユーザーカード） | 詳細版 §3.2 ロール比較 |
| 17 | profile.png | プロフィール画面 | applicant | `/profile` | 画面全体（氏名・部署・ロール・メール・任意項目） | 詳細版 §3.2.1 |
| 18 | projects_create_confirm_modal.png | 申請確認モーダル | applicant | `/projects/create` | フォーム入力後「申請する」を押した時の確認モーダル（次の承認者表示） | 詳細版 §4.1 |
| 19 | projects_edit.png | 案件編集画面（S-06） | applicant | `/projects/{draftId}/edit` | 下書き案件の編集画面全体 | 詳細版 §4.2 |
| 20 | approval_dialog.png | 承認モーダル | dept | 部門承認待ち案件の `/projects/{id}` | 案件詳細 →「承認」ボタン →コメント欄つきモーダル | 詳細版 §5.2 |
| 21 | rejection_dialog.png | 却下モーダル | dept | 同上 | 「却下」ボタン → コメント必須注意のモーダル | 詳細版 §5.2 |
| 22 | task_modal.png | タスク作成モーダル（S-10） | applicant | 承認済案件の `/projects/{id}?detailTab=tasks` | 「タスク追加」ボタンで開いたモーダル（種類・優先度・進捗率・担当者・確認者・期日を含む） | 詳細版 §4.5 |
| 23 | budget_modal.png | 予算実績モーダル（S-11） | applicant | 承認済案件の `/projects/{id}?detailTab=budget` | 「実績を入力」ボタンで開いた金額入力モーダル | 詳細版 §4.9 |
| 24 | member_tasks_board.png | タスク一覧 カンバン（S-14） | applicant | `/member-tasks?view=board` | 4列（未着手／進行中／確認待ち／完了）にカードが並ぶ画面全体 | 詳細版 §4.6・§4.7 |
| 25 | member_tasks_members.png | タスク一覧 メンバー別（S-14） | dept | `/member-tasks?view=members` | 部門メンバー × タスクのマトリクス、KPI バー | 詳細版 §4.6 |
| 26 | member_tasks_list.png | タスク一覧 一覧（S-14） | applicant | `/member-tasks?view=list` | 表形式（タイトル・種類・優先度・進捗・担当・確認者・期日） | 詳細版 §4.6 |
| 27 | task_comments.png | タスクモーダルのコメント欄 | applicant | タスク詳細モーダルを開く | コメント投稿欄＋既存コメント数件が見える状態（事前にシードでコメント数件登録 or 手動投稿） | 詳細版 §4.8 |

### B. 推奨（10 枚）— ロール差や境界条件を補足

| # | ファイル名 | 撮影画面 | ログイン | URL | 撮影範囲・準備 | 用途 |
|---|---|---|---|---|---|---|
| 28 | sidebar_dept_manager.png | 左サイドバー全体 | dept | `/projects?tab=approval` | サイドバー＋「承認待ち」リンク強調 | 詳細版 §3.2・§5.1 |
| 29 | projects_approval_pending_dept.png | 部門承認待ちフィルタ | dept | `/projects?tab=approval&filter=pending` | 一覧 ＋ ステータスフィルタが「部門承認待ち」になっている状態 | 詳細版 §5.1 |
| 30 | take_back_button.png | 取り戻しボタン | applicant | 自分が出した部門承認待ち案件の `/projects/{id}` | 詳細画面右上「取り戻して下書きに戻す」ボタン周辺をズーム | 詳細版 §4.3 |
| 31 | hq_direct_badge.png | 「本部直行」バッジ | dept | `/projects/{hqDirectId}` | 本部直行バッジが見える案件詳細（シードでは `PRJ-SEED-0007` 相当） | 詳細版 §5.3 |
| 32 | resubmission_chain.png | 再申請チェイン表示 | applicant | 再申請後の新案件詳細 `/projects/{newId}` | 詳細画面上部「改訂2回目・再申請チェイン: 元案件 #N」のリンクを含む領域 | 詳細版 §4.4 |
| 33 | projects_show_pending_dept.png | 案件詳細（部門承認待ち） | applicant | 自分が出した部門承認待ち案件の `/projects/{id}` | 承認ステッパーで「部門承認」が現在ステップで青く強調された状態 | 詳細版 §2.2 |
| 34 | projects_show_pending_hq.png | 案件詳細（本部承認待ち） | applicant | 部門承認後の案件 | 承認ステッパー「本部承認」が現在ステップ | 詳細版 §2.2 |
| 35 | initial_task_auto_created.png | 自動生成タスク | hq | 本部承認直後の案件 `/projects/{id}?detailTab=tasks`（撮影スクリプトは `PRJ-SEED-0006` を承認後に hq で開く） | タスクタブに「実装計画作成」が自動で並んでいる状態 | 詳細版 §6.2 |
| 36 | dev_tab_deadline_warning.png | 期限警告色 | hq | `/projects?tab=dev` | 期限超過＝赤、2週間以内＝赤、1ヶ月以内＝橙の行が並んだ状態（要シード調整 or 既存データから） | 詳細版 §6.3 |
| 37 | budget_alert_red.png | 消費率 100% 超過 | hq | `/projects?tab=budget` | 消費率 100% 超の赤い表示。要注意件数サマリも含む | 詳細版 §6.3 |

### C. 余裕があれば（7 枚）— 装飾的・周辺

| # | ファイル名 | 撮影画面 | ログイン | URL | 撮影範囲・準備 | 用途 |
|---|---|---|---|---|---|---|
| 38 | dashboard.png | ダッシュボード（S-02） | applicant | `/dashboard` | 全体 | 詳細版 FAQ Q9 補足 |
| 39 | member_tasks_hq_select_dept.png | 本部・部門未選択時 | hq | `/member-tasks` | 「部門を選択してください」のプレースホルダ表示 | 詳細版 §4.6 |
| 40 | task_history_expand.png | タスク変更履歴 | applicant | 承認済案件 `/projects/{id}?detailTab=tasks` | 1 タスク行をクリック展開して `task_histories` の時系列が出た状態 | 詳細版 §4.8 |
| 41 | projects_create_dept_manager.png | 部門管理者の新規申請 | dept | `/projects/create` | 「申請フロー」インジケータが本部直行になっている画面 | 詳細版 §5.3 |
| 42 | notifications_types.png | 通知タイプの並び | applicant | `/notifications` | 申請受付・案件承認・タスク関連など複数種類（`manual-screenshot-bootstrap.php` が撮影用に未読を追加） | 詳細版 §3.4 |
| 43 | header_bell_unread.png | 通知ベル未読 | applicant | 任意の画面 | ヘッダー右上の通知ベルに未読バッジが付いた状態をズーム | 簡易版 §0 補足 |
| 44 | projects_dev_progress_bar.png | 進捗バー色分け | applicant | `/projects?tab=dev` | 開発タブで未着手（グレー）／進行中（青）／完了間近（紫）／完了（緑）が並ぶ行 | 詳細版 §3.3 進捗バンド |

---

## 3. 撮影後にやること（Claude Code が担当）

1. 各画像を `user_manual.md` / `quick_manual.md` の該当箇所に `![説明](images/NN_xxx.png)` で参照追加
2. キャプションは `*斜体*` の独立段落で 1 行
3. 簡易版にも一部画像を入れる（A1 1 枚に収まる範囲。15・17・22・24 あたりが筆頭候補）

---

## 4. Cursor への依頼文（コピペ用）

> 以下のブロックをそのまま Cursor のチャット欄に貼り付けてください。

```
利用マニュアル用のスクリーンショットを撮影してください。
作業ディレクトリ：C:\xampp\htdocs\JPTIS202604

【環境準備】
1. ターミナルで以下を実行
   php artisan migrate:fresh --seed
   php artisan serve
2. Chrome をウィンドウ幅 1280px で開く（DevTools の Responsive Mode 1280×900 を推奨）
3. ブラウザのキャプチャは **Retina 相当（2x）の DevTools スクリーンショット機能** を推奨：
   DevTools → Cmd/Ctrl+Shift+P → "Capture full size screenshot" もしくは "Capture node screenshot"

【テストアカウント】（パスワードはすべて password）
- applicant@example.com … 申請者・開発1部・小林 由佳
- dept@example.com      … 部門管理者・開発1部・夏目 拓也
- hq@example.com        … 本部管理者・本部・本部 一郎
- applicant2@example.com / dept2@example.com … 開発2部（部門差分の確認に使う）

【出力先・命名規則】
- 保存先：materials/manual/images/
- ファイル名：NN_<対象>_<状態>.png（PNG・透過なし）
- 連番は 15 から開始。既存 01〜14 は上書きしないこと

【撮影リスト】
materials/manual/screenshot_plan.md の §2 を参照してください。
優先度 A（#15〜#27、13 枚）を **先に必ず** 揃え、続いて B（#28〜#37、10 枚）、最後に C（#38〜#44、7 枚）を撮影してください。
各行の「撮影範囲・準備」欄に従い、必要なログインユーザ・URL・操作・トリミング範囲を守ってください。

【撮影時の共通注意】
- 1280px 幅に固定（横スクロールが出る画面はそのまま全画面で OK、後でブラウザがスクロールを切ってくれる）
- モーダル撮影は **背景の暗いオーバーレイごと** 含める
- 拡大ズームが必要なボタン・バッジは「全画面 + バッジを矩形で囲った版」を 1 枚で OK（注釈は不要、トリミングだけで対応）
- 個人情報の表示があっても、シード値（テストアカウント名）以外は写らないため気にしない
- 撮影漏れがあったら、その # の行をリストアップして報告してください（その項目は Claude Code 側で再依頼します）

【完了時に報告してほしいこと】
- 撮影できた画像のファイル名一覧
- 撮影できなかった画像とその理由（再現データが不足、UI が想定と違う、など）
```

---

## 5. 補足：用途別の挿入予定

| マニュアル箇所 | 想定挿入画像 |
|---|---|
| 簡易版 §0 共通 | 15 sidebar_applicant + 43 header_bell_unread |
| 簡易版 §1 申請者向け | 18 projects_create_confirm_modal + 22 task_modal |
| 簡易版 §2 部門管理者向け | 20 approval_dialog |
| 簡易版 §3 本部管理者向け | 36 dev_tab_deadline_warning + 37 budget_alert_red |
| 詳細版 §3.2 サイドバー | 15・16・28（ロール比較） |
| 詳細版 §3.2.1 プロフィール | 17 profile |
| 詳細版 §4.1 新規申請 | 18 projects_create_confirm_modal |
| 詳細版 §4.2 下書き編集 | 19 projects_edit |
| 詳細版 §4.3 取り戻し | 30 take_back_button |
| 詳細版 §4.4 再申請 | 32 resubmission_chain |
| 詳細版 §4.5 タスク登録 | 22 task_modal + 35 initial_task_auto_created |
| 詳細版 §4.6 タスク一覧 | 24・25・26・39 |
| 詳細版 §4.7 ライフサイクル | 24 member_tasks_board（DnD 説明用） |
| 詳細版 §4.8 コメント・履歴 | 27 task_comments + 40 task_history_expand |
| 詳細版 §4.9 予算実績 | 23 budget_modal |
| 詳細版 §5.1 部門承認待ち | 28 sidebar_dept_manager + 29 projects_approval_pending_dept |
| 詳細版 §5.2 承認・却下 | 20 approval_dialog + 21 rejection_dialog |
| 詳細版 §5.3 本部直行 | 31 hq_direct_badge + 41 projects_create_dept_manager |
| 詳細版 §6.2 最終承認 | 35 initial_task_auto_created |
| 詳細版 §6.3 進捗監視 | 36 dev_tab_deadline_warning + 37 budget_alert_red |
| 詳細版 FAQ Q9 ダッシュボード | 38 dashboard |

---

## 6. やらないこと（スコープ外）

- アニメーション GIF（カンバン DnD の動きなど）— 静止画 + 文章で代替
- モバイル幅のスクリーンショット — PoC ではデスクトップ前提
- 本番デプロイ URL でのキャプチャ — ローカル開発サーバで統一
