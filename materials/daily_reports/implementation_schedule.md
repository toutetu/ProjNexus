# 実装スケジュール（要約版）

このファイルは **明日以降の作業目線** と運用ルールの要約のみを置きます。  
マスト改修の **チェック項目・完了条件** は `doc/daily/development_schedule.md` §「Phase 5 手動確認・マスト改修」に集約しました。  
日々の詳細作業記録は `doc\daily\daily_technical_report.md` に分離して管理します。

---

## 1. 現在地（2026-05-15 時点・開発最終日）

- Phase 0〜5: **完了**（`materials/daily_reports/development_schedule.md` の Phase 5 チェック・提出物・本番スモーク・日報締め済み）
- **残りの実装タスク:** 原則なし（マスト #8 はスコープ外）。**追加分（2026-05-14）:** 申請の**下書き削除**（Policy・`destroy`・編集画面・テスト・`system_spec.md`）を実装済み。**同一日の整理:** 申請タブ一覧（`/projects?tab=approval`）の削除ボタンは廃止し、削除導線は**案件編集**に限定（一覧の誤操作防止）。案件編集の削除ボタン配置・モーダル配色の追記コミットは区切りで実施。**同日:** ログイン画面のテストユーザー一覧を `UserSeeder::loginDemoAccounts()` 経由で表示し、投入データ（10件）と常に一致させる対応を実施済み
- **手動確認** … マスト #5 ほか Phase 5 項目は `materials/daily_reports/development_schedule.md` で完了チェック済み。最終日は本ファイル **§3** のスモーク・提出で取りこぼしがないか確認する
- **2026-05-15 実施済み:** 提出物確定・本番 3 ロールスモーク・`return_to` / `/manual` 修正・日報締め（詳細は `daily_technical_report.md` 2026-05-15 節）
- **調査のみ（未着手）:** サイドバー「申請・承認／開発管理」のアクティブ表示（`activeKey` と `approvalActive` / `devActive` の整理）。着手する場合は `AI.md` のプラン確認後にブランチを切る

---

## 2. 日次ワークフロー

日次の git 手順（作業開始時・終了時のコマンド、ブランチ命名、コミット方針）は **`doc/Design/AI.md` の「日次ワークフロー」節が唯一の正本**。本ファイルには記載しない。

### 実装時の運用ルール

- 申請・承認などの操作系変更は、`3ロール × 主要導線` の手動確認を当日中に実施する
- 操作系 UI は「押せる/押せない」だけでなく、処理中表示（ロック/スピナー）まで確認する

---

## 3. 最終日タスク（2026-05-15）— 完了

> 以下は **2026-05-15 に実施済み**。追跡は `daily_report.md` / `daily_technical_report.md` を正とする。

1. [x] 提出物の確定と提出
2. [x] 短縮回帰（`php artisan test` / `npm run build`）
3. [x] 本番スモーク（3 ロール）
4. [x] 公開ドキュメント（`Information.md`、プレゼン・マニュアル PDF 等）
5. [x] 日報・スケジュールの締め

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

