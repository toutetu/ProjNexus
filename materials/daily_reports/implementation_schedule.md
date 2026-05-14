# 実装スケジュール（要約版）

このファイルは **明日以降の作業目線** と運用ルールの要約のみを置きます。  
マスト改修の **チェック項目・完了条件** は `doc/daily/development_schedule.md` §「Phase 5 手動確認・マスト改修」に集約しました。  
日々の詳細作業記録は `doc\daily\daily_technical_report.md` に分離して管理します。

---

## 1. 現在地（2026-05-14 時点／§3 は 05-15 最終日向け）

- Phase 0〜4: 完了
- Phase 5: `materials/daily_reports/development_schedule.md` 上は完了チェック済み。最終日は **§3** の提出・スモーク・文書締めで取りこぼしを潰す
- **残りの実装タスク:** 原則なし（マスト #8 はスコープ外）。**追加分（2026-05-14）:** 申請の**下書き削除**（Policy・`destroy`・編集画面・テスト・`system_spec.md`）を実装済み。**同一日の整理:** 申請タブ一覧（`/projects?tab=approval`）の削除ボタンは廃止し、削除導線は**案件編集**に限定（一覧の誤操作防止）。案件編集の削除ボタン配置・モーダル配色の追記コミットは区切りで実施。**同日:** ログイン画面のテストユーザー一覧を `UserSeeder::loginDemoAccounts()` 経由で表示し、投入データ（10件）と常に一致させる対応を実施済み
- **手動確認** … マスト #5 ほか Phase 5 項目は `materials/daily_reports/development_schedule.md` で完了チェック済み。最終日は本ファイル **§3** のスモーク・提出で取りこぼしがないか確認する
- **最終日（2026-05-15）の目線:** 提出物・本番スモーク・公開資料・日報の締め（詳細は **§3**）
- **調査のみ（未着手）:** サイドバー「申請・承認／開発管理」のアクティブ表示（`activeKey` と `approvalActive` / `devActive` の整理）。着手する場合は `AI.md` のプラン確認後にブランチを切る

---

## 2. 日次ワークフロー

日次の git 手順（作業開始時・終了時のコマンド、ブランチ命名、コミット方針）は **`doc/Design/AI.md` の「日次ワークフロー」節が唯一の正本**。本ファイルには記載しない。

### 実装時の運用ルール

- 申請・承認などの操作系変更は、`3ロール × 主要導線` の手動確認を当日中に実施する
- 操作系 UI は「押せる/押せない」だけでなく、処理中表示（ロック/スピナー）まで確認する

---

## 3. 明日やること（優先順）（2026-05-15・最終日）

> `materials/daily_reports/development_schedule.md` の Phase 5／マストは完了チェック済み。明日は**提出締めと公開面の最終確認**に集中する。

1. **提出物の確定と提出** … `materials\quest\requirements.md` §提出物 5 項が実体と一致しているか最終確認し、指定の提出先へアップロード（漏れ・ファイル名・期限の再確認）
2. **短縮回帰** … `npx tsc --noEmit` / `npm run build` / `php artisan test`（最終コミット後に 1 通し）
3. **本番スモーク（3 ロール）** … ログイン→申請／承認→タスク（S-14）→予算→通知まで、採点者が辿る想定導線を再走査（`/dashboard` の表示も含め、気づいた差分は `Information.md` か日報へ一言残す）
4. **公開ドキュメントの取りこぼし** … `doc/Information.md`（URL・テストアカウント）、`README`（`migrate:fresh --seed` 等の採点者向け手順）、アプリ内 **`/manual`**（見出し・内部リンク・`doc/manual/images` の画像掲載）を目視
5. **日報・スケジュールの締め** … `daily_report.md` / `daily_technical_report.md` に最終日の実績・所感を記録。本ファイル **§1 の日付**を実施日に合わせて更新し、二重管理にならないよう `development_schedule.md` の「明日以降すぐやること」と矛盾があれば片方を正にそろえる

**PoC 採点用:** DB は `migrate:fresh --seed` で再構築してよい前提。アカウント一覧は `Information.md` §2。シーダー詳細は `database/seeders/UserSeeder.php` / `ProjectSeeder.php` / `DemoWorkloadSeeder.php` を正とする。

**課題2（今回スコープ外）のメモ:** ユーザー管理・部門マスタ・通知メール・帳票エクスポート … 着手時は `system_spec.md` と ER 正本を先に更新。

---

## 4. Phase 4/5 のフォロー（任意）

- ロール別の最終手動確認ログを必要に応じて追記

- 通知運用（定時実行・重複防止）の監視手順を運用メモに残す場合は `doc/daily` または `Information.md` へ
- `budget_alert` は ER 図正本（`er_diagram.md` の NTF-01/02）に沿って別タスクで実装

---

## 5. 詳細ログ参照ルール

- 長文の調査メモ・過去のマスト別実装メモ・シナリオ表テンプレ等は **git 履歴**または **`materials\daily_reports\daily_technical_report.md`** で参照（新規追記はログ側）
- 技術詳細日報: `doc/daily/daily_technical_report.md`（長文ログは `doc/daily/log/daily_technical_report_log.md`）

> 非エンジニア向け日報の詳細版（`daily_report_log.md`）は実装作業では参照しない。  
> 全ログファイル一覧は `development_schedule.md` §詳細ログ保管先 を参照。

---

## 6. 作業前に読むファイル

### 共通（毎回必読）

- `doc/Design/AI.md` — Cursor 向け入口・日次ワークフロー・モック一覧
- `doc/Design/system_spec.md` — スコープ・DB・権限・承認・通知（事実の正本）
- `doc/daily/development_schedule.md` — **進捗・Phase 5／マストのチェック項目（正）**
- `doc/daily/implementation_schedule.md` — 本ファイル（明日以降の目線）
- `mockups` — モックと設計方針

### ダッシュボード手動確認（マスト #5）

- 3 ロールで `/dashboard` が開くこと
- KPI と予算 70% 超案件の件数がロールスコープで妥当であること
- 予算管理サイドバーのアクティブ表示が崩れないこと

