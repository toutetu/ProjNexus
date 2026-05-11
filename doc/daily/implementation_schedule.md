# 実装スケジュール（要約版）

このファイルは「次回作業予定」と「進行方針」のみを管理します。  
日々の詳細作業記録は `doc/daily/log/implementation_schedule_log.md` に分離して管理します。

---

## 1. 現在地（2026-05-11 更新）

- Phase 0: 完了
- Phase 1: 完了
- Phase 2: 完了
- Phase 3: 完了（タスク変更履歴の自動記録・行展開表示・`TaskHistoryTest` まで反映済み・2026-05-01）
- Phase 4: 実装完了（S-14 3ビュー、4値運用、通知拡張まで完了）
- Phase 5: 進行中（資料同期・提出準備）
- **UI（2026-05-11）:** 案件詳細タブ配色とサイドバー親子アクティブ（一体の角丸・`activeKey` 優先）を反映済み。設計書の画面スクショ差し替えがあれば `components_spec.md` / マニュアルを追随
- **追加:** §3 に「マスト改修」「課題2・今後実装」を記録（2026-05-08）

---

## 2. 日次ワークフロー

日次の git 手順（作業開始時・終了時のコマンド、ブランチ命名、コミット方針）は **`doc/Design/AI.md §9 日次ワークフロー` が唯一の正本**。本ファイルには記載しない。

本ファイルは「実装作業中に守るべき運用ルール」に限定して記述する。

### 実装時の運用ルール

- 申請・承認などの操作系変更は、`3ロール × 主要導線` の手動確認を当日中に実施する
- 操作系 UI は「押せる/押せない」だけでなく、処理中表示（ロック/スピナー）まで確認する

---

## 3. 次回作業予定（2026-05-08 以降 / Phase 5 ＋ 改修）

### マストで修正・実装する項目（改修リスト）

優先度は上から順に棚卸しし、`doc/Design/AI.md` のスコープ（課題1/2）と矛盾する場合は実装前にユーザーと優先順位を合意する。

| # | 項目 | メモ | 主な編集先（目安） |
|---|------|------|-------------------|
| 1 | サイドバー（セクション設計/配色）見直し | **✅ 2026-05-11** ライトテーマへ刷新。セクション別アクセント・親子（一覧＋↳案件詳細）同時アクティブ時は**一体の角丸**。詳細タブ切替と `page.url` のズレは `activeKey` を優先して解消 | `Sidebar.tsx`、`sidebarNavTheme.ts`（参照）、`components_spec.md` |
| 2 | 「案件一覧」名称の変更 | **✅ 2026-05-11** 文言確定: **申請状況一覧** / **開発進捗一覧** / **予算状況一覧**。`projectListLabels.ts` で共通化（サイドバー・`/projects` の見出し・パンくず・編集導線の一部） | `resources/js/lib/projectListLabels.ts`、`Sidebar.tsx`、`Projects/{Index,Show,Edit,Create}.tsx` |
| 3 | 申請画面のファイルアップロード | **✅ 2026-05-11 実装完了**（計画は §3.1）。新規申請・編集から添付・保存、案件詳細で一覧・ダウンロード。編集時のみ既存削除（`remove_attachment_ids`）。DL は `ProjectAttachmentPolicy` + 親案件の `view` | 同上 |
| 4 | タスク完了入力時のエラー修正 | **✅ 2026-05-11 完了**（`resolved` / `closed` 等の更新経路の整合・テスト追随を反映済み） | `ProjectTaskDialog.tsx`、`ProjectTaskController`、`TaskHistoryService`、`TaskHistoryTest` など |
| 5 | 予算ダッシュボード | ✅ 2026-05-08 実装済み（`/dashboard`）。KPI / 部門別進捗 / 月次予算推移 / 70%超案件リストを実装、サイドバー導線追加 | `resources/js/Pages/Dashboard/Index.tsx`、`app/Http/Controllers/DashboardController.php`、`resources/js/Components/Dashboard/*` |
| 6 | プロフィール画面の簡素化 | **✅ 2026-05-11 完了**。表示＋パスワード更新のみ、アカウント削除導線は非表示（または同等の運用） | `Profile/Edit.tsx`、`routes` 確認済み |
| 7 | ロールの説明 | 画面上で「申請者 / 部門管理者 / 本部管理者」の意味が分かるようにする（ツールチップ、ヘルプ行、`Information.md` / マニュアルとの同期） | `Sidebar` ユーザーカード付近、`doc/manual/user_manual.md`、`doc/Design/Information.md` |
| 8 | 申請者がスマホで確認できるようにする | モバイル後回し方針は維持しつつ、**申請者の閲覧・申請・一覧** が実機で破綻しない最低限のレスポンシブ（ナビ折りたたみ、テーブル横スクロール or カード化の部分的対応） | `AuthenticatedLayout`、`Projects` 系 Page、`ProjectTable`、タッチターゲット |

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

設計メモとして保管。着手時は `doc/Design/AI.md` §1 と ER 正本を更新してから実装する。

- **ユーザー管理（本部のみ）:** 権限・部門を含むアカウントの動的追加
- **部門マスタ（本部のみ）:** 部門の新規作成と、その部門でログイン可能にする導線。**ユーザーの基本情報は本部では編集しない**（方針として明記）。アカウント削除・生年月日フィールドは **本スコープでは扱わない / 追加しない**（将来検討として記録）
- **通知のメール送信:** アプリ内通知に加え、メールで同一イベントを配信
- **エクスポート:** 概算予算と実績の見積書（またはそれに準ずる帳票）をファイル出力

---

### 目的（Phase 5）

- 設計書・日報・提出物チェックリストの整合を最終化する
- デプロイ環境でデモ導線（3ロール）を再確認する
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

### 手動確認チェックリスト（作業中に使用）

- [x] マスト #1: サイドバー各セクションのリンク・ラベル情報設計（ライト化＋色分け反映）
- [x] マスト #1 追認（2026-05-11）: 案件詳細でタブ切替後も一覧＋案件詳細の親子アクティブが論理どおり／一体角丸で継ぎ目なし
- [x] マスト #2: 一覧名称がセクション意図と一致（申請状況一覧／開発進捗一覧／予算状況一覧）
- [x] マスト #3: 添付ファイルの保存・再表示・権限（2026-05-11 実装。手動確認: 新規申請/編集の multipart、詳細の DL、他ユーザー DL 不可）
- [x] マスト #4: タスク完了フローが 3 ロールでエラーにならない（2026-05-11 完了）
- [ ] マスト #5: 予算ダッシュボード（または同等UI）がデータと一致
- [x] マスト #6: プロフィールに削除導線がなく、パスワード更新のみ編集可能（2026-05-11 完了）
- [ ] マスト #7: ロール説明が画面上またはマニュアルで追える
- [ ] マスト #8: 狭い幅で申請者導線が利用可能


### 完了条件（Phase 5）

- [ ] `npx tsc --noEmit` と `npm run build` が通る
- [ ] `php artisan test` が通る
- [ ] `requirements.md` の提出物5項目の状態が実体と一致
- [ ] `Information.md` の動作確認シナリオがデモ導線と一致
- [ ] デプロイ環境で 3 ロールの主要導線確認記録を残す
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
- `doc/Design/AI.md` — プロジェクト全体ルール
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