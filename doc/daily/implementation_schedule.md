# 実装スケジュール（要約版）

このファイルは「次回作業予定」と「進行方針」のみを管理します。  
日々の詳細作業記録は `doc/daily/log/implementation_schedule_log.md` に分離して管理します。

---

## 1. 現在地（2026-05-12 更新）

- Phase 0: 完了
- Phase 1: 完了
- Phase 2: 完了
- Phase 3: 完了（タスク変更履歴の自動記録・行展開表示・`TaskHistoryTest` まで反映済み・2026-05-01）
- Phase 4: 実装完了（S-14 3ビュー、4値運用、通知拡張まで完了）
- Phase 5: 進行中（資料同期・提出準備）
- **UI（2026-05-11）:** 案件詳細タブ配色とサイドバー親子アクティブ（一体の角丸・`activeKey` 優先）を反映済み。設計書の画面スクショ差し替えがあれば `components_spec.md` / マニュアルを追随
- **追加:** §3 に「マスト改修」「課題2・今後実装」を記録（2026-05-08）
- **追加:** §3 マスト #9「本部ロールのタスク閲覧のみ（必須）」を実装完了（2026-05-12）
- **調査:** §3「サイドバー申請・承認／開発管理で色が付かない件」— `activeKey` と `approvalActive` / `devActive` の組み合わせ、およびセクション見出しにアクティブ連動がない点を記録（2026-05-12）
- **完了（2026-05-12）:** §3「予算実績入力」— 案件詳細予算タブの**モーダル運用**を維持しつつ、深い導線 `GET /projects/{id}/budget-input` でモーダル起動可能に調整。サイドバー3行 merged（予算状況一覧＋案件詳細＋予算実績入力）も反映
- **完了（2026-05-12）:** §3「/member-tasks カードDnDで403後も見た目が移動したまま」— 先行楽観更新を廃止し、403時の見た目ズレを抑制
- **計画（未実装）:** §3「シーダー調整」— 全ロールへ案件を割り振り、`Information.md` 系シナリオを網羅し、**本人確認／採点者確認／予備**の3系統でデータ・手順を用意。**採点用 PoC 本番**では DB 再構築可（`migrate:fresh --seed` 等）。詳細は §3「PoC 本番の方針」「シーダー調整」（2026-05-12）
- **計画（未実装）:** §3「メンバータスク・申請者スコープ」— カンバン／一覧で**部門内の全タスク**を見られるようクエリを調整（2026-05-12）
- **完了（2026-05-12）:** マスト #7 追補 — `/profile` のアカウント情報に **ロール**（複数は ` / ` 連結）を読み取り専用で表示。設計正本（`system_spec.md` / `components_spec.md` / `screen_flow.md`）を同期。

---

## 2. 日次ワークフロー

日次の git 手順（作業開始時・終了時のコマンド、ブランチ命名、コミット方針）は **`doc/Design/AI.md` の「日次ワークフロー」節が唯一の正本**。本ファイルには記載しない。

本ファイルは「実装作業中に守るべき運用ルール」に限定して記述する。

### 実装時の運用ルール

- 申請・承認などの操作系変更は、`3ロール × 主要導線` の手動確認を当日中に実施する
- 操作系 UI は「押せる/押せない」だけでなく、処理中表示（ロック/スピナー）まで確認する

---

## 3. 次回作業予定（2026-05-08 以降 / Phase 5 ＋ 改修）

### マストで修正・実装する項目（改修リスト）

優先度は上から順に棚卸しし、`doc/Design/system_spec.md` §1 のスコープ（課題1/2）と矛盾する場合は実装前にユーザーと優先順位を合意する。

| # | 項目 | メモ | 主な編集先（目安） |
|---|------|------|-------------------|
| 1 | サイドバー（セクション設計/配色）見直し | **✅ 2026-05-11** ライトテーマへ刷新。セクション別アクセント・親子（一覧＋↳案件詳細）同時アクティブ時は**一体の角丸**。詳細タブ切替と `page.url` のズレは `activeKey` を優先して解消 | `Sidebar.tsx`、`sidebarNavTheme.ts`（参照）、`components_spec.md` |
| 2 | 「案件一覧」名称の変更 | **✅ 2026-05-11** 文言確定: **申請状況一覧** / **開発進捗一覧** / **予算状況一覧**。`projectListLabels.ts` で共通化（サイドバー・`/projects` の見出し・パンくず・編集導線の一部） | `resources/js/lib/projectListLabels.ts`、`Sidebar.tsx`、`Projects/{Index,Show,Edit,Create}.tsx` |
| 3 | 申請画面のファイルアップロード | **✅ 2026-05-11 実装完了**（計画は §3.1）。新規申請・編集から添付・保存、案件詳細で一覧・ダウンロード。編集時のみ既存削除（`remove_attachment_ids`）。DL は `ProjectAttachmentPolicy` + 親案件の `view` | 同上 |
| 4 | タスク完了入力時のエラー修正 | **✅ 2026-05-11 完了**（`resolved` / `closed` 等の更新経路の整合・テスト追随を反映済み） | `ProjectTaskDialog.tsx`、`ProjectTaskController`、`TaskHistoryService`、`TaskHistoryTest` など |
| 5 | 予算ダッシュボード | ✅ 2026-05-08 実装済み（`/dashboard`）。KPI / 部門別進捗 / 月次予算推移 / 70%超案件リストを実装、サイドバー導線追加 | `resources/js/Pages/Dashboard/Index.tsx`、`app/Http/Controllers/DashboardController.php`、`resources/js/Components/Dashboard/*` |
| 6 | プロフィール画面の簡素化 | **✅ 2026-05-11 完了**。表示＋パスワード更新のみ、アカウント削除導線は非表示（または同等の運用） | `Profile/Edit.tsx`、`routes` 確認済み |
| 7 | ロールの説明 | **✅ 2026-05-12 完了**。サイドバーのユーザーカードにロール説明（申請者/部門管理者/本部管理者の役割）を常時表示。**追補:** `/profile` の「アカウント情報」にロール（複数は ` / ` 連結）を読み取り専用で表示。 | `resources/js/Components/Layout/Sidebar.tsx`、`resources/js/Pages/Profile/Edit.tsx`、`doc/manual/user_manual.md`、`doc/Design/{Information,system_spec,components_spec,screen_flow}.md` |
| 8 | 申請者がスマホで確認できるようにする | モバイル後回し方針は維持しつつ、**申請者の閲覧・申請・一覧** が実機で破綻しない最低限のレスポンシブ（ナビ折りたたみ、テーブル横スクロール or カード化の部分的対応） | `AuthenticatedLayout`、`Projects` 系 Page、`ProjectTable`、タッチターゲット |
| **9** | **✅ 本部ロールのタスク閲覧のみ化（必須）** | **実装完了（2026-05-12）:** `hq_manager` はタスクを **閲覧のみ** とする。不可: タスク新規作成・編集・削除・ステータス変更・コメント投稿・**完了タスクの再オープン**。可: S-14（一覧／カンバン／メンバー別）閲覧、案件詳細タスクタブ閲覧、タスク履歴閲覧、モーダル閲覧専用表示（保存不可）。**確認:** `HqManagerTaskReadOnlyTest`（6ケース）と関連テストを通過。 | `ProjectWorkItemPolicy`、`ProjectTaskController::assertStatusTransition`、`MemberTaskController::assertStatusTransition`、`MemberTasks/{Index,MemberMatrix}`、`Projects/Show.tsx`、`ProjectTaskDialog.tsx`、`tests/Feature/HqManagerTaskReadOnlyTest.php` |
| **10** | **✅ 予算実績入力：情報設計とサイドバー一体ハイライト** | **実装完了（2026-05-12）:** 予算実績入力は **案件詳細（予算タブ）内モーダル** を採用。深い導線 `GET /projects/{project}/budget-input` は `projects.show?detailTab=budget&budgetInput=1` へリダイレクトし、モーダルを開く。サイドバーは予算実績入力表示時に **予算状況一覧 → ↳案件詳細 → ↳予算実績入力** の3行を `budget` セクション色で **1つの角丸ブロック** として表示。`components_spec.md` / `screen_flow.md` 追随済み。 | `Sidebar.tsx`、`routes/web.php`、`BudgetController.php`、`BudgetActualDialog.tsx`、`Projects/Show.tsx`、`components_spec.md`、`screen_flow.md` |
| **11** | **✅ メンバータスク：DnD 失敗後のカード位置ズレ** | **実装完了（2026-05-12）:** `/member-tasks` の `moveTaskStatus` で行っていた**先行の楽観的更新**を廃止し、サーバ更新成功後の props 同期のみで列反映するよう変更。403 時に「移動したように見える」揺れを抑制。併せて案件詳細タスクカンバン（`Projects/Show.tsx`）も同方針に統一。 | `MemberTasks/Index.tsx`（`moveTaskStatus`）、`Projects/Show.tsx`（`moveProjectTaskStatus`） |
| **12** | **シーダー調整：ロール横断の案件割当とシナリオ3系統（未実装）** | **要件（2026-05-12）:** 申請者／部門管理者／本部管理者の**各ロールに、検証用案件が偏りなく割り振られる**こと。`Information.md` §3 の動作確認シナリオを**すべて再現可能**なデータ構成にすること。各シナリオについて **①本人確認用 ②採点者確認用 ③予備** の3パターンを並行で用意すること。**採点用:** ②を中心に、採点者が **クリーン DB に対して `migrate:fresh --seed`（または同等）だけ**で `requirements.md` / `role_feature_matrix.md` / `screen_flow.md` に書かれた課題1範囲の主要分岐を辿れるよう、シーダーを**網羅的**に拡張する（詳細は §3「PoC 本番の方針」「シーダー調整」）。 | `database/seeders/*`、`doc/Design/Information.md`（アカウント表・手順との同期）、必要なら `doc/manual/user_manual.md`、提出 README |
| **13** | **メンバータスク：申請者のカンバン／一覧で部門内の全タスク表示（未実装）** | **現状（2026-05-12）:** `view=board` または `view=list` かつ **純申請者**（部門管理者・本部ロールなし）のとき、`MemberTaskController::filteredTasksQuery` が **`assignee_id` または `reviewer_id` が自分**のタスクに限定しているため、例 `/member-tasks?department_id=2&view=board` でも**自分が担当／確認者のタスクしか出ない**。**要望:** 選択部門に紐づく**承認済み案件のタスクを部門単位で一覧**できるようにする（閲覧範囲は `ProjectWorkItemPolicy::view` 等と整合させ、**更新・DnD 権限は現行ポリシーのまま**とするかは実装時に明文化）。**ドキュメント:** `Information.md` §3.7〜3.8、`role_feature_matrix.md` の S-14 記述を追随。 | `MemberTaskController.php`（該当 `if` ブロック）、必要ならフロントのフィルタ説明文、`Information.md` |

### サイドバー「申請・承認」「開発管理」で色が付かない件（調査メモ 2026-05-12）

実装・修正は行わずコード確認のみ。**症状**が「セクション見出し」「一覧リンク」「承認待ちフィルタ時」「タスク一覧画面」のどれかで見え方が異なるため、原因を分けて記録する。

| 観点 | 原因（コード上の挙動） | 主な参照 |
|------|------------------------|----------|
| **セクション見出し**（「申請・承認」「開発管理」の小見出し行） | `Sidebar.tsx` の `SidebarSection` は、子がアクティブかに関わらず常に `sectionNavTheme[variant].labelColor` と区切り線色のみ。見出し行に pill 背景やアクティブ連動のクラスは**付与していない**（予算セクションも同じ構造）。 | `Sidebar.tsx`（`SidebarSection`）、`sidebarNavTheme.ts` |
| **申請状況一覧がハイライトされない** | `Projects/Index.tsx` で `filter=pending`（承認待ち一覧）のとき `activeKey` が `'pending'` のみになる。一方 `Sidebar.tsx` の `approvalActive` は `activeKey === 'projects-approval'` または案件詳細 URL の `detailTab` 由来の `detailSection === 'approval'` のため、**一覧ページかつ pending のときは申請状況一覧が `active=false`** になる（承認待ちリンクだけ `active`）。 | `Projects/Index.tsx`（`isPendingFilter ? 'pending' : TAB_ACTIVE_KEY[tab]`）、`Sidebar.tsx`（`approvalActive`） |
| **開発進捗一覧がハイライトされない** | `MemberTasks/Index.tsx` は `activeKey="tasks"`。`Sidebar.tsx` の `devActive` は `activeKey === 'projects-dev'` または案件詳細で `detailTab=tasks` のときのみ真となり、**`'tasks'` では開発進捗一覧はハイライトされない**（タスク一覧リンクのみ `active`）。 | `MemberTasks/Index.tsx`、`Sidebar.tsx`（`devActive`） |
| **新規申請画面で申請状況一覧がハイライトされない** | `/projects/create` は `Projects/Create.tsx` で `activeKey="new"` のみ。`approvalActive` は `projects-approval` を要求するため、**申請状況一覧**は非アクティブのまま（**新規申請**リンクのみ pill）。 | `Projects/Create.tsx`（`activeKey="new"`）、`Sidebar.tsx`（`approvalActive`） |

**再現 URL と上記の対応（ユーザー提示 2026-05-12）**

| URL | `activeKey`（コード上） | サイドバーで pill が付きやすい行 | 付かない／薄く見えやすい行 |
|-----|-------------------------|----------------------------------|----------------------------|
| `/projects/create` | `new` | 新規申請 | 申請状況一覧（`approvalActive` が偽のため）／セクション見出し（仕様上 pill なし） |
| `/projects?tab=approval`（`filter=pending` 以外） | `projects-approval` | 申請状況一覧 | セクション見出し（仕様上 pill なし） |
| `/member-tasks` | `tasks` | タスク一覧 | 開発進捗一覧（`devActive` が偽のため）／セクション見出し（同上） |

**次回実装時の論点（メモのみ）:** 見出しの強調を要件にするか、`pending` と `projects-approval` の両立、`tasks` と `projects-dev` の両立、**`new`（および案件編集の `projects-approval` 固定）と申請状況一覧の両立**をどうデザインするか。`components_spec.md` の Sidebar 節と整合させる。

### メンバータスク一覧（/member-tasks）：カードDnDと楽観的更新（調査メモ 2026-05-12）

**本節は原因整理のみ。コード変更は行っていない。** 改修トラッキングは上表 **#11**。

**バックエンド（申請者が確認待ち列を動かせない理由）**

- `PUT …/member-tasks/{id}/status` は `MemberTaskController::updateStatus` → `assertStatusTransition`。
- **確認待ち（`resolved`）からの遷移:** `resolved` → `closed`（確認OK）は **`reviewer_id === ログインユーザー` のみ**。申請者が担当・主担当でも **確認者でなければ 403**（メッセージ例: 「確認OKは確認者のみが実行できます。」）。
- **`resolved` → それ以外（未着手・進行中など）:** 管理者以外は **一律 403**（「確認待ちからの変更は許可されていません。」）。
- （実装後）部門管理者のみ同メソッド先頭で管理者バイパス対象。本部管理者はバイパス対象外（閲覧のみ）。

**フロント（見た目が移動したままに見える要因）**

| 要因 | 内容 |
|------|------|
| **楽観的更新が先** | `MemberTasks/Index.tsx` の `moveTaskStatus` が、`router.put` の結果を待たずに `setBoardTasks` で当該タスクの `status` を **即時** 書き換えている。カンバンは `KanbanBoard` が `tasks.filter(status === col)` で列を組むため、**ドロップ直後から React 上は移動済み**に見える。 |
| **意図したロールバック** | 同一関数内で `prevTasks` を保持し、`onError` で `setBoardTasks(prevTasks)` ＋ `window.alert`。**理論上は** 403 時に列表示を元に戻す。 |
| **見た目が戻らない／遅れて見える場合の仮説（要ブラウザ実機確認）** | （1）`onError` が発火しないレスポンス形式の有無（Inertia `@inertiajs/react` v2 と Laravel の 403 の組み合わせで要確認）。（2）`useEffect(() => setBoardTasks(tasks), [tasks])` と `onError` の **更新順** により、一瞬だけ楽観表示が残る／上書きがずれる競合の有無。（3）**HTML5 ドラッグ＆ドロップ**のブラウザ標準のドラッグイメージやリペイントが、React の列表示と **一時的にずれて見える** UX 要因。（4）**メンバー別ビュー**では `MemberMatrix` の各セルが **`matrixMembers[].buckets`（サーバ初回 props）** からカードを描画しており、`boardTasks` の楽観更新と **二重系**のため、ビューによっては列と `boardTasks` の不整合が起きうる（カンバンは `boardTasks` のみ依存で再現しやすいのはカンバン側）。 |

**実装時の改善案（メモのみ）**

- 403 が確実に取れるまで **楽観更新しない**、または成功確定後のみ `status` を反映。
- 不可視の遷移（確認者以外の `resolved` ドロップ）は **クライアントで事前判定**し DnD 自体を無効化（`isTaskDraggable` 拡張など）でサーバ往復を減らす。
- `onError` 後に **`router.reload({ only: ['tasks'] })`** 等でサーバ真値と強制同期する案（副作用・負荷は要検討）。

### メンバータスク一覧：申請者のカンバン／一覧で部門内の全タスク表示（計画メモ 2026-05-12）

**本節は要件・現状整理のみ。コード変更は行っていない。** 改修トラッキングは上表 **#13**。

- **再現 URL（ユーザー提示）:** `http://127.0.0.1:8000/member-tasks?department_id=2&view=board` — カンバンビューで、**自分が担当者（または確認者）のタスクに限定**されて見えている。
- **原因（コード）:** `app/Http/Controllers/MemberTaskController.php` の `filteredTasksQuery` 内、`applicant` かつ `dept_manager` / `hq_manager` を持たず、`view` が `board` または `list` のときに追加している `where(assignee_id = uid OR reviewer_id = uid)` によるもの。
- **調整ゴール:** 上記クエリを見直し、**同部門・承認済み案件に属するタスクを申請者でも一覧できる**ようにする（`view=members` の既存挙動との差分・説明文は UI / マニュアルで整理）。**権限:** 一覧に出すことと、編集・DnD・モーダル保存を許すことは分離し、`ProjectWorkItemPolicy` および `assertStatusTransition` と矛盾しないようにする。
- **設計書:** 変更後は `Information.md` §3.7〜3.8（S-14 ロール別）と `role_feature_matrix.md` を更新し、**「申請者は部門内の全タスクを閲覧できる」**旨を明記する。

### シーダー調整：ロールへの案件割当・全ケースシナリオ・3系統データ（計画メモ 2026-05-12）

**本節は要件・作業計画のみ。シーダー本体の変更は行っていない。** 改修トラッキングは上表 **#12**。

### PoC 本番（課題採点用デプロイ）の方針（2026-05-12）

ここでいう「本番」は **商用運用ではなく、課題提出・採点用の PoC ホスティング** を指す。

- **DB は再構築してよい:** `php artisan migrate:fresh --seed`、または `migrate --force` に加え **`db:seed`（全シーダー）** を採点前に実行して問題ない（既存データの温存は不要な前提）。
- **フロント:** デプロイ手順に合わせ `npm run build` 済みの `public` を配信する。環境変数は `APP_URL`・DB・`APP_DEBUG`（提出方針に従う）を確認。
- **ストレージ:** 添付 DL を採点シナリオに含める場合は `php artisan storage:link` を手順に明記。
- **採点者向けの再現性:** 「リポジトリを checkout → `.env` → 上記 migrate/seed → URL を開く」で **同一状態**になることをゴールとし、**②採点者確認用**のシード＋`Information.md` の手順を正本に寄せる。

**目的**

1. **ロール横断の案件割当:** `applicant` / `dept_manager` / `hq_manager` のいずれでも、ログイン直後から **自分の権限で意味のある案件**（申請・承認待ち・開発／予算閲覧・タスク担当／確認者など）にアクセスできるよう、`ProjectSeeder`・`DemoWorkloadSeeder`・関連付けを見直す。現状は開発1部中心・本部の部門未選択など、**採点・他ロール検証で手が足りない**箇所を埋める。
2. **「全部の場合」が分かるシナリオ:** `doc/Design/Information.md` §3（3.1〜3.14 および追補）を**正本のチェックリスト**とし、各節が **1 操作フロー＝再現可能な DB 状態**（案件ステータス、承認履歴、タスク4値、通知、他部門との境界等）に対応付くようにシナリオ表を作る。不足している組み合わせ（例: 本部直行、他部門閲覧不可、タスク閲覧のみ化後の HQ など）は設計書と突合して **明示的に行を追加**する。
3. **各シナリオを3パターン:** 同じ検証意図を、次の **3 系統**で常に用意する（命名・メール・案件名プレフィックスで区別することを推奨）。

**採点用にシーダーを網羅的に作る（#12 のゴール詳細）**

- **網羅の定義（優先順）:** （1）`doc/Design/Information.md` §3 の**各手順が、シード済み DB だけで開始できる**こと。（2）`doc/Design/requirements.md` の提出物チェックリスト、`role_feature_matrix.md`、`screen_flow.md` に現れる **課題1の主要分岐**（案件ステータス、承認段階、タスク4値、通知種別、権限境界）に**対応する行がシナリオ表に存在**すること。（3）課題2扱いの機能はシード対象外でもよいが、**「未実装」のとき表で明示**する。
- **②採点者確認用を厚くする:** 採点者は開発者本人と違い **DB の中身を知らない**前提のため、案件名・ユーザー名・パスワード規則を **読んで迷わない**命名にし、必要ならシナリオごとに **期待画面・期待ステータス**を `Information.md` か提出 README に1行ずつ対応付ける。
- **①③との関係:** ①は開発中の既定シード（件数・可読性優先）。③は①②と同じ網羅を **別データセット**で複製し、採点遅延・再デプロイ・手動で DB を汚したあとの **取り直し用**。

| 系統 | 想定利用者 | 内容のイメージ |
|------|------------|----------------|
| **① 本人確認用** | 開発者本人の日々の PoC・手動確認 | 既定の `php artisan migrate:fresh --seed` でそのまま使う **メインシード**。触りやすい件数・短い案件名。 |
| **② 採点者確認用** | 提出後の採点者・第三者 | 手順書に **固定アカウント・固定案件名・期待 URL** を列挙し、採点者がクリーン DB から **同一手順で再現**できるセット。①とデータは分離またはタグで識別し、**提出物 README / Information.md** に表形式で載せる。 |
| **③ 予備** | 採点遅延・再シード・デモ汚染時 | ①②と同じシナリオ網羅を **別ユーザーメール・別案件 ID レンジ・別プレフィックス**（例 `[予備A]`）で複製。①が壊れたときの **差し替え用**として `db:seed --class=...` で単独投入できる粒度を検討。 |

**実装方針（着手時のメモ）**

- **編集対象:** `DatabaseSeeder.php` の呼び出し順、`ProjectSeeder.php`、`DemoWorkloadSeeder.php`、`UserSeeder.php`（アカウント数・部門割当）、必要なら **`DemoScenarioSeeder`** の新設で「シナリオ単位の束ね」を行う。
- **本部ロール:** `member-tasks` の部門選択や承認導線が通るよう、**承認済み案件＋タスク**を本部視点でも辿れる件数を確保する（`Information.md` 3.8 / 3.10 / 3.14 との整合）。
- **ドキュメント:** シナリオ表の列に「対応シーダー／初期ログイン／前提コマンド」を書き、`Information.md` のテストアカウント表と **二重管理にならないよう** 一方を正本に決める。

**シナリオ表（作成時に埋めるテンプレ）**

| `Information.md` 節 | 検証の要点（例） | ①本人 | ②採点 | ③予備 | 備考 |
|---------------------|------------------|--------|--------|--------|------|
| 3.1 基本フロー | 部門→本部承認 | | | | |
| 3.2 本部直行 | 部門管理者申請 | | | | |
| 3.3 却下・再申請 | `revision` / `parent` | | | | |
| 3.4 取り戻し | draft 復帰 | | | | |
| 3.5 権限境界 | 他部門閲覧不可 | | | | |
| 3.6 予算実績 | 主担当・部門管理者 | | | | |
| 3.7〜3.8 S-14 | 3 ビュー・ロール差分 | | | | |
| 3.9〜3.11 タスク・通知 | 4 値・通知種別 | | | | |
| 3.12 通知既読 | 403 | | | | |
| 3.13 認証導線 | ログイン後遷移 | | | | |
| 3.14 HQ タスク閲覧のみ | 方針実装後 | | | | |
| （追補） | ダッシュボード・添付 等 | | | | |

（表の「①②③」列には、投入コマンド・案件コード・担当メールの略号などを記入する。）

### 予算実績入力：案件詳細の子＋サイドバー3行一体ハイライト（実装メモ 2026-05-12）

**実装済み（2026-05-12）。** 改修リストは上表 **#10** を参照。

**情報設計（階層）**

- **予算状況一覧**（`/projects?tab=budget`）
- **案件詳細**（例: `/projects/{id}?detailTab=budget` など、予算文脈の詳細）
- **予算実績入力**（上記案件詳細の**子**として定義する。単独トップ導線にしない）

**サイドバー見た目（実装時のゴール）**

- 予算実績入力画面を表示しているとき、左ナビの次の3行を**すべて**予算セクション色（`sectionNavTheme.budget`）でアクティブ表示する。
  1. 予算状況一覧（`SidebarLink`）
  2. ↳ 案件詳細（`SidebarChildLabel` または同等のインデント行）
  3. ↳ 予算実績入力（子行。現状の単独 `SidebarLink` から、詳細配下の子として再配置する想定）
- 3行を**1つの角丸の四角**に見えるようラップする（マスト #1 で既にある「一覧＋↳案件詳細」の merged ブロックと同様の視覚原則：外側 `mx-2 overflow-hidden rounded-lg` + `sectionNavTheme.budget.activeClass`、内側行は透明背景・角丸なしで継ぎ目を消す）。

**実装結果（要点）**

- `activeKey='budget-input'` と `/projects/{id}/budget-input` パス判定を `Sidebar.tsx` に追加し、**3段 merged** を表示
- `routes/web.php` に `projects.budget-input` を追加し、`BudgetController::edit` + `Projects/BudgetInput.tsx` を実装
- `Projects/Show.tsx` の予算タブ導線はモーダル起動から専用ページ遷移へ変更（保存は `source=budget-input` 付き）

### 3.1 マスト #3 実装計画（案件申請のファイル添付）— 2026-05-11

**目的**: S-05 新規申請および案件編集でファイルを保存し、案件詳細（申請タブ）で閲覧者がダウンロードできるようにする。`doc/Design/er_diagram.md` の `project_attachments` を PoC で実装する。

| 手順 | 内容 |
|------|------|
| 1 | DB: `project_attachments`（`project_id`, `original_filename`, `stored_path`, `mime_type`, `size_bytes`, `uploaded_by`）。`projects` 削除時は cascade。保存ディスクは `local` の `project_attachments/{project_id}/` |
| 2 | バックエンド: `ProjectAttachment` モデル、`Project` の `hasMany`、`ProjectAttachmentService`（保存・削除）、`ProjectAttachmentPolicy`（親案件の `view` / `update` に準拠） |
| 3 | API: `POST /projects` / `PUT /projects/{id}` で `attachments[]` を multipart 受付。編集時は `remove_attachment_ids[]` で既存削除。`GET .../download` でストリーム DL（認可済みのみ） |
| 4 | 制約: 1 ファイル最大 5MB、1 リクエスト最大 5 件追加、1 案件あたり合計最大 10 件。拡張子: pdf, doc, docx, xls, xlsx, jpg, jpeg, png, gif, txt, zip |
| 5 | フロント: `components_spec.md` に沿い `ProjectAttachmentField` を `Components/Form/` に新設。`useForm` + `forceFormData: true`（`Create` / `Edit`）。`Show` はリンク一覧のみ |
| 6 | ドキュメント: `mockups/s05_policy.md` の「ファイル添付（課題2・無効）」を実装済み方針へ更新。`er_diagram.md` のテーブル一覧を 10 テーブルに更新 |
| 7 | テスト: Feature で「下書き保存 + PDF 添付が DB・ストレージに残る」「他ユーザーは DL 不可」を最低 1 本ずつ |

**運用**: 本番・デモでダウンロードする場合は `php artisan storage:link` が必要（`Information.md` に既記載なら追記のみ）。

---

### 今後の実装項目（今回実装しない・課題2扱い）

設計メモとして保管。着手時は `doc/Design/system_spec.md` と ER 正本を更新してから実装する。

- **ユーザー管理（本部のみ）:** 権限・部門を含むアカウントの動的追加
- **部門マスタ（本部のみ）:** 部門の新規作成と、その部門でログイン可能にする導線。**ユーザーの基本情報は本部では編集しない**（方針として明記）。アカウント削除・生年月日フィールドは **本スコープでは扱わない / 追加しない**（将来検討として記録）
- **通知のメール送信:** アプリ内通知に加え、メールで同一イベントを配信
- **エクスポート:** 概算予算と実績の見積書（またはそれに準ずる帳票）をファイル出力

---

### 目的（Phase 5）

- 設計書・日報・提出物チェックリストの整合を最終化する
- デプロイ環境でデモ導線（3ロール）を再確認する
- **PoC 採点用ホスティング:** DB は `migrate:fresh --seed` 等で再構築してよい前提で、**採点者が手順どおりに全シナリオを再現できるシーダー**（上表 #12）を整える
- 課題2設計資料（S-16 バーンダウン方針）をプレゼン文脈へ接続する
- **上記「マスト改修」を提出期限とトレードオフしながら進める**

### 実行手順（例）

1. §「マスト改修」から着手順を1つ選び、`AI.md` の実装前プラン確認ルールに沿ってブランチを切る
2. `npx tsc --noEmit` / `npm run build` / `php artisan test` で回帰確認
3. `doc/Design`（`requirements.md` / `screen_flow.md` / `Information.md` / `er_diagram.md`）の相互参照を最終確認（改修で画面が変わった箇所は必ず追随）
4. `doc/manual/user_manual.md` を現行UIで見直し、必要スクショを差し替え
5. `mockups/s16_burndown_policy.md` の要点をプレゼン草稿に反映
6. 提出前に `requirements.md` の提出物チェックリストと実体を突合
7. デプロイ環境で 3 ロール導線（申請→承認→開発/予算→通知）を再確認
8. **PoC 本番（採点用）:** デプロイ手順に **`php artisan migrate:fresh --seed`（またはプロジェクトで定めた同等コマンド）** を記載し、採点者が **同一コマンドで初期状態を再現**できるようにする（§3「PoC 本番の方針」「シーダー調整」参照）

### 手動確認チェックリスト（作業中に使用）

- [x] マスト #1: サイドバー各セクションのリンク・ラベル情報設計（ライト化＋色分け反映）
- [x] マスト #1 追認（2026-05-11）: 案件詳細でタブ切替後も一覧＋案件詳細の親子アクティブが論理どおり／一体角丸で継ぎ目なし
- [x] マスト #2: 一覧名称がセクション意図と一致（申請状況一覧／開発進捗一覧／予算状況一覧）
- [x] マスト #3: 添付ファイルの保存・再表示・権限（2026-05-11 実装。手動確認: 新規申請/編集の multipart、詳細の DL、他ユーザー DL 不可）
- [x] マスト #4: タスク完了フローが 3 ロールでエラーにならない（2026-05-11 完了）
- [ ] マスト #5: 予算ダッシュボード（または同等UI）がデータと一致
- [x] マスト #6: プロフィールに削除導線がなく、パスワード更新のみ編集可能（2026-05-11 完了）
- [x] マスト #7: ロール説明が画面上またはマニュアルで追える（2026-05-12）
- [ ] マスト #8: 狭い幅で申請者導線が利用可能
- [x] **マスト #9:** 本部管理者がタスクを **閲覧のみ**（保存・再オープン・コメント投稿が不可）であること（2026-05-12）


### 完了条件（Phase 5）

- [ ] `npx tsc --noEmit` と `npm run build` が通る
- [ ] `php artisan test` が通る
- [ ] `requirements.md` の提出物5項目の状態が実体と一致
- [ ] `Information.md` の動作確認シナリオがデモ導線と一致
- [ ] デプロイ環境で 3 ロールの主要導線確認記録を残す
- [ ] **PoC 採点用:** デプロイ手順に DB 初期化（例: `migrate:fresh --seed`）を記載し、**マスト #12** のシナリオ表どおり採点者が再現できる状態であること（または未着手なら残課題として日報に明記）
- [ ] プレゼン提出物（`.md` または `.pdf`）の最終版を確定
- [ ] （改修）§「マストで修正・実装する項目」の着手結果を日報・設計書へ反映（実装した項のみチェックを完了にする）

---

## 4. Phase 4/5 のフォロー（任意）

- ロール別の最終手動確認ログを必要に応じて追記
- 通知運用（定時実行・重複防止）の監視手順を運用メモに残す場合は `doc/daily` または `Information.md` へ
- `budget_alert` は ER図正本のスケジュール（`er_diagram.md` の NTF-01/02）に沿って別タスクで実装

---

## 5. 詳細ログ参照ルール

- `implementation_schedule.md` では **前日の作業記録詳細のみ参照** する
- 参照先: `doc/daily/log/implementation_schedule_log.md`
- 技術詳細日報: `doc/daily/log/daily_technical_report.md`

> 非エンジニア向け日報の詳細版（`daily_report_log.md`）は実装作業では参照しない。
> 全ログファイル一覧は `development_schedule.md` §詳細ログ保管先 を参照。


## 6. 作業前に読むファイル

### 共通（毎回必読）
- `doc/Design/AI.md` — Cursor 向け入口・日次ワークフロー・モック一覧
- `doc/Design/system_spec.md` — スコープ・DB・権限・承認・通知（事実の正本）
- `doc/daily/development_schedule.md` — 現在の進捗・Phase 状態
- `doc/daily/implementation_schedule.md` — 次回作業予定
- `mockups` — モックと設計方針

### 明日の作業向け
### 2026-05-08 追記（S-02 実装反映）

- `S-02` ダッシュボードを実装完了（`/dashboard`）
- 予算管理セクションに「ダッシュボード」導線を追加
- 手動確認は以下を優先:
  1. 3ロールで `/dashboard` が開けること
  2. KPI と予算70%超案件の件数がロールスコープで変わること
  3. 予算管理サイドバーのアクティブ表示が崩れないこと

### 2026-05-08 追記2（時刻表示の日本時間化）

- 履歴・更新時刻の表示基準を JST に統一
- 設定変更: `config/app.php` の `timezone` を `env('APP_TIMEZONE', 'Asia/Tokyo')` に変更
- 反映手順:
  1. `php artisan config:clear`
  2. 主要画面（`/dashboard`, `/projects/{id}?detailTab=history`, `/notifications`）で時刻表示を確認
/**更新完了**/
