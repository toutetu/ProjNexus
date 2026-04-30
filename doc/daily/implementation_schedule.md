# 実装スケジュール（要約版）

このファイルは「次回作業予定」と「進行方針」のみを管理します。  
日々の詳細作業記録は `doc/daily/log/implementation_schedule_log.md` に分離して管理します。

---

## 1. 現在地

- Phase 0: 完了
- Phase 1: 完了
- Phase 2: 完了
- Phase 3: 進行中（通知機能・承認後自動タスク投入まで完了）
- Phase 4: 未着手
- Phase 5: 未着手

---

## 2. 日次ワークフロー

日次の git 手順（作業開始時・終了時のコマンド、ブランチ命名、コミット方針）は **`doc/Design/AI.md §9 日次ワークフロー` が唯一の正本**。本ファイルには記載しない。

本ファイルは「実装作業中に守るべき運用ルール」に限定して記述する。

### 実装時の運用ルール

- 申請・承認などの操作系変更は、`3ロール × 主要導線` の手動確認を当日中に実施する
- 操作系 UI は「押せる/押せない」だけでなく、処理中表示（ロック/スピナー）まで確認する

---

## 3. 次回作業予定（2026-05-01 / Phase 3 Day3）

### 目的

- Phase 3 の残手動確認（ロール境界、通知重複防止、承認後の初期タスク作成）を完了する
- 日次ドキュメントと実装ログを同期し、提出前の差分を減らす

### 実行手順

1. 事前確認（`php artisan serve` / `npm run dev`、ログイン後 `/projects?tab=approval`）
2. 下書き閲覧制御（申請者のみ）を applicant / dept / hq で再確認
3. タスク通知3種（担当・完了・期限接近）の発火と重複防止を確認
4. 本部承認時の「実装計画作成」自動作成を確認（重複作成されないこと含む）
5. 必要時のみ最小修正（Policy / Service / Controller / UI）
6. `npx tsc --noEmit` / `npm run build` / `php artisan test`
7. `doc/daily` と設計書の差分最終確認

### 手動確認チェックリスト（作業中に使用）


### 完了条件

- [x] `npx tsc --noEmit` と `npm run build` が通る
- [x] `php artisan test` が通る
- [x] 下書き閲覧制御の手動確認記録完了
- [x] タスク通知3種の手動確認記録完了
- [x] 承認後初期タスク作成の手動確認記録完了
- [x] 日次更新を反映

---

## 4. Phase 3 残タスク

- ロール別の最終手動確認ログ反映
- 通知運用（定時実行・重複防止）の監視手順追記

---

## 5. 詳細ログ参照ルール

- `implementation_schedule.md` では **前日の作業記録詳細のみ参照** する
- 参照先: `doc/daily/log/implementation_schedule_log.md`
- 技術詳細日報: `doc/daily/log/daily_technical_report.md`

> 非エンジニア向け日報の詳細版（`daily_report_log.md`）は実装作業では参照しない。
> 全ログファイル一覧は `development_schedule.md` §詳細ログ保管先 を参照。