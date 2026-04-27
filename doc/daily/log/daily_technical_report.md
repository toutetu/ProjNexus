# implementation_schedule 作業ログ

`doc/daily/implementation_schedule.md` から日次の詳細作業記録を分離したログです。  
最新の予定・進行管理は `implementation_schedule.md` を参照してください。

---

## 2026-04-27（月）— Phase 2 UI/通知の仕上げと運用改善

### 実装概要
- **申請一覧（approval）UIをモック準拠へ再整理**
  - フィルターバーを「検索/ステータス/部門/クリア」に再構成
  - テーブル下凡例（StatusPill 5種）と注記を追加
  - セレクトの表示崩れ（文言と記号重なり）を調整
- **サイドバー/ヘッダー導線の改善**
  - 承認待ち一覧に自分の承認待ち件数バッジを表示（0件非表示）
  - ヘッダー右上検索窓を全画面から削除
  - 却下案件詳細時はサイドバーの申請一覧をアクティブ化
- **申請処理の確実化**
  - 新規申請の `submit_action` 競合を修正し、申請ボタンで確実に `submit` 送信
- **通知ルールの拡張**
  - 申請時: 承認者（部門/本部）へ承認依頼通知
  - 部門承認時: 本部管理者へ承認依頼通知
  - 本部却下時: 途中承認した部門管理者へ却下通知
  - 申請者の受付通知は即時既読化
- **申請取り戻し機能**
  - 申請者本人が `pending_dept` を下書きへ戻せる
  - 部門管理者申請者は `pending_hq`（本部直行）でも取り戻し可
- **却下コメント表示の改善**
  - 却下詳細画面で承認ステップ直下に注意表示（薄い赤背景）
  - ステータスが却下ならロール共通でコメント表示
- **ログイン画面調整**
  - テストユーザーボックス下部に `パスワード：password` を表示
  - 文字サイズ・太さを表ヘッダーに合わせて調整

### 主要変更ファイル
- `app/Services/ApprovalService.php`
- `app/Services/NotificationService.php`
- `app/Http/Controllers/ProjectController.php`
- `app/Http/Controllers/ApprovalController.php`
- `resources/js/Pages/Projects/Index.tsx`
- `resources/js/Pages/Projects/Show.tsx`
- `resources/js/Pages/Projects/Create.tsx`
- `resources/js/Components/Layout/Header.tsx`
- `resources/js/Pages/Auth/Login.tsx`
- `tests/Feature/ProjectApprovalFlowTest.php`

### 検証
- `npx tsc --noEmit` 成功
- `php artisan test --filter=ProjectApprovalFlowTest` 成功（追加シナリオ含む）
- Lint（変更対象）エラーなし

### 2026-04-27 Phase 2 手動確認（ハッピーパス）
- 実施シナリオ: applicant 申請 → dept_manager 承認 → hq 最終承認
- 記録方針: 短時間確認のためスクリーンショット記録は省略
- 確認結果:
  - ステータス遷移（`draft -> pending_dept -> pending_hq -> approved`）: OK
  - 承認待ち一覧の表示制御（ロール別）: OK
  - 通知発行（申請時/部門承認時/最終承認時）: OK
  - 申請者一覧・詳細への反映: OK

### 2026-04-27 Phase 2 手動確認（却下→再申請 / ロール境界）
- 記録方針: 短時間確認のためスクリーンショット記録は省略
- 確認結果:
  - 3ロール × 部門却下 / 本部却下 → 再申請シナリオ: OK
  - ロール境界（他部門の pending は不可視・編集不可）: OK

### 成果
- 申請〜承認〜却下のロール別導線と通知経路が整理され、手動確認での再現性が向上
- モックとの差分（特に approval タブ）を大幅に縮小

## 作業記録（時系列、最新が下）

### 作業記録 2026-04-23（木）Phase 2 追加実装・日次運用（本チャット分）

#### 1) 日次ドキュメント運用・Gitフロー整理（docsブランチ運用）
- `docs/daily-20260423` ブランチで日次ドキュメント整理差分を確認し、`implementation_schedule.md` 要約化と `development_schedule.md` 更新をコミット
  - コミット: `098abd92`（`docs: implementation_schedule を要約版に一本化`）
- 同ブランチを `origin` / `gitlab` の両方へ push（PowerShell では `&&` が使えないため `;` で順次実行）
- 未管理差分だった `doc/Design/引継ぎmemo.txt` 削除を個別コミット
  - コミット: `50b6e7eb`（`docs: 引継ぎメモを整理のため削除`）
- ユーザー修正後の `daily_report.md` を反映してコミット
  - コミット: `d6de3a79`（`docs: 日報を報告向けに更新`）
- `docs/daily-20260423` を push 後、`main` に `--no-ff` マージし `origin/main` / `gitlab/main` へ反映
  - マージコミット: `c1f6da69`（`merge: docs daily update 2026-04-23`）
- その後、実装継続のため `feat/phase2-projects-foundation` へ復帰

#### 2) S-08 承認/却下ダイアログ実装（コメント入力付き）
- `resources/js/Components/Modals/ApprovalDialog.tsx` を新規作成
  - props: `mode`, `open`, `onClose`, `project`, `approvalLevel`, `onSubmit`
  - 承認/却下で文言・アイコン・必須条件を切替
  - 却下時コメント必須、承認時コメント任意
  - 案件名/部門/ID を表示し、誤操作防止の文脈を明示
- `Projects/Index.tsx` の承認/却下ボタンを直接POSTからダイアログ経由に変更
  - `approve/reject` 送信 payload に `comment` を追加
  - ダイアログ送信後 `onFinish` でクローズ

#### 3) S-05 新規申請画面の実接続
- `ProjectController` に `create()` を追加（`authorize('create', Project::class)`）
- `routes/web.php` に `GET /projects/create`（`projects.create`）を追加
- `resources/js/Pages/Projects/Create.tsx` を新規作成
  - `useForm` で `title`, `purpose`, `estimated_amount` を管理
  - `POST route('projects.store')` へ送信
  - バリデーションエラー表示（`InputError`）を実装
- サイドバー「新規申請」および一覧画面右上ボタンを `projects.create` 遷移へ接続

#### 4) S-06 編集画面と更新導線の実装
- `ProjectController` に `edit(Project $project)` を追加
  - `authorize('update', $project)` を適用
  - Inertia props として `id/title/purpose/estimatedAmount` を返却
- `routes/web.php` に `GET /projects/{project}/edit`（`projects.edit`）を追加
- `resources/js/Pages/Projects/Edit.tsx` を新規作成
  - `PUT route('projects.update', project.id)` を実装
  - 作成画面同様に入力/バリデーションUIを整備

#### 5) 一覧→詳細→編集の遷移導線を接続
- `Projects/Index.tsx`
  - タイトルを `projects.show` へのリンクに変更
  - 一覧データに `canEdit` を追加し、編集可能行のみ「編集」ボタン表示
- `ProjectController@index`
  - 各行propsに `canEdit: $user->can('update', $project)` を追加
- `Projects/Show.tsx`
  - プレースホルダから実データ表示へ更新（部門/申請者/主担当/見積/予算/実績）
  - 「編集」ボタンを追加し `projects.edit` へ接続
- `ProjectController@show`
  - `canEdit` を返却し、`Show.tsx` で編集ボタン表示を権限連動に変更

#### 6) 二重操作防止（行単位 processing 制御）とUX改善
- `Projects/Index.tsx` に `processingRowId` を追加
  - `submit/approve/reject` 実行時に対象行IDをセット
  - `onFinish` で解除
  - 同行の `申請/編集/承認/却下` ボタンを `disabled` 制御
- 行内に `処理中...` バッジを追加し、最終的に `Loader2` スピナー付き表示へ改善
  - `inline-flex + animate-spin` で視認性を向上

#### 7) 実装コミット・push（featureブランチ）
- ここまでの実装を1コミットに集約
  - コミット: `b8d53971`
  - メッセージ: `feat: connect project create/edit and approval dialog UX`
  - 主要変更:
    - 追加: `Projects/Create.tsx`, `Projects/Edit.tsx`, `Modals/ApprovalDialog.tsx`
    - 更新: `ProjectController.php`, `routes/web.php`, `Sidebar.tsx`, `Projects/Index.tsx`, `Projects/Show.tsx`
- `feat/phase2-projects-foundation` を `origin` / `gitlab` に push

#### 8) 検証結果（本チャット中に都度実施）
- TypeScript: `npx tsc --noEmit` を複数回実行し全て成功
- Lint: 変更対象ファイルに対して `ReadLints` で確認しエラーなし
- 手動確認観点:
  - 新規申請画面への遷移
  - 一覧から案件詳細遷移
  - 詳細/一覧から編集可能案件のみ編集導線表示
  - 承認/却下ダイアログ表示、コメント送信、処理中表示

#### 詰まった点・判断
- PowerShell 環境で `&&` が使えないため、pushや複合コマンドは `;` で連結して実行
- 承認アクションはまず最小導線（一覧から直接操作）を安定化し、次にダイアログ化・processing制御を段階追加
- 編集可否はUI条件分岐のみでなく、`ProjectPolicy` 判定結果（`canEdit`）をAPI側で返して二重防御に統一

#### 次回の着手ポイント
- S-12 `Notifications/Index.tsx` とヘッダー未読バッジの接続
- 承認待ち一覧のUI微調整（状態表示/エラー表示）
- Featureテスト（承認フロー1本、権限境界1本）の追加

#### Phase 進捗
- Phase 2：5h/22h 
  - 申請・承認の主要導線（Create/Edit/Approve/Reject/Dialog/権限連動表示）まで接続完了

---

### 作業記録 2026-04-24（金）Phase 2 継続（通知・バッジ・一覧 UI・テスト）

#### 1) 通知（S-12）と未読バッジ
- `NotificationController` を `web.php` に接続（一覧・既読 PATCH）
- `Notifications/Index.tsx` 新規、`NotificationController` の JSON キーを `readAt`/`createdAt` に統一
- `HandleInertiaRequests` に `unreadNotificationCount` と `flash.error` を共有
- `Header.tsx` のベルを通知一覧へリンク＋未読数バッジ化、`Sidebar.tsx` の通知リンク修正＋未読バッジ

#### 2) 承認一覧 UI / エラー表示
- `ProjectController@index` で却下案件の `rejectedAt`（`dept`|`hq`）を返却
- `Projects/Index.tsx`：0件時 `EmptyState`、誤配置していた常時 `EmptyState` を削除、`flash.error` 表示
- `ApprovalController`：`AuthorizationException` をフラッシュ付きリダイレクトに変換

#### 3) テスト
- `tests/Feature/ProjectApprovalFlowTest.php` 新規（部門承認・申請者の承認不可）
- `AuthenticationTest` のログイン後 URL を `projects.index` に修正

#### Phase 進捗
- Phase 2：9h/22h（詳細は `daily_technical_report_log.md` 2026-04-24 節も参照）

---
