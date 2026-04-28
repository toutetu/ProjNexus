# implementation_schedule 作業ログ

`doc/daily/implementation_schedule.md` から技術的な日次の詳細作業記録を分離したログです。  
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

## 2026-04-27（月）— Phase 3 MVP（開発/予算）実装・UI収束

### 実装概要
- **開発タブ（S-03b）を実データ表示へ移行**
  - タスク件数・完了件数・進行中件数・未着手件数を集計表示
  - 期限表示を残日ベース（2週間以内/1ヶ月以内）で視認性向上
  - 最終更新を相対時刻表示（たった今/○分前/○時間前/○日前）
  - 進捗バンド凡例（未着手/進行中/完了間近/完了）を追加
- **予算タブ（S-03c）を実データ表示へ移行**
  - 予算合計・実績合計・平均消費率・要注意件数のサマリーを表示
  - 行ごとに消費率バーと残額を表示
  - 開発/予算タブの「新規申請」ボタンを非表示化
- **フィルタUX改善**
  - 開発/予算タブのセレクト変更時に即時反映
  - 「クリア」ボタンを右端固定・常時表示
  - ページング（件数表示、前後移動）を追加
- **主担当の初期設定**
  - 案件作成時に `primary_assignee_id` へ申請者IDを自動セット
  - 開発タブの「主担当」列に作成時セット値を表示
  - 要件変更に合わせ、作成/編集画面には主担当入力欄を置かない構成へ整理

### 主要変更ファイル
- `app/Http/Controllers/ProjectController.php`
- `resources/js/Pages/Projects/Index.tsx`
- `resources/js/Pages/Projects/Show.tsx`
- `resources/js/Components/Modals/ProjectTaskDialog.tsx`
- `resources/js/Components/Approval/ApprovalStepperFull.tsx`
- `resources/js/Components/Tabs.tsx`
- `routes/web.php`
- `doc/Design/components_spec.md`
- `doc/Design/AI.md`

### 検証
- `npm exec tsc -- --noEmit` 成功
- 変更対象の lint エラーなし（`ReadLints`）
- `php -l app/Http/Controllers/ProjectController.php` 構文エラーなし

### 成果
- Phase 3 MVP の中核（開発タブ/タスク管理/予算管理）の画面導線が実運用可能な形に到達
- モックとの差分を詰めつつ、フィルタ即時反映や主担当初期値など運用上の詰まりポイントを解消
