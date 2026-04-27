# 実装スケジュール（要約版）

このファイルは「次回作業予定」と「進行方針」のみを管理します。  
日々の詳細作業記録は `doc/daily/log/implementation_schedule_log.md` に分離して管理します。

---

## 1. 現在地

- Phase 0: 完了
- Phase 1: 完了
- Phase 2: 完了
- Phase 3: 進行中（MVP 実装と自動検証まで完了）
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

## 3. 次回作業予定（2026-04-28 / Phase 3 Day2）

### 目的

- Phase 3 の手動確認（承認後ロック、タスク進捗反映、予算消費率反映）を完了し、結果を日次ログに記録する
- `StatusPill` の消費率警告閾値（70%）の最終仕様を確定し、必要なら実装修正する

### 実行手順

1. 事前確認（`php artisan serve` / `npm run dev`、ログイン後 `/projects?tab=dev`）
2. 承認済み案件でタスク追加・編集・削除を確認（承認前は不可も確認）
3. `Projects/Show` と `Projects/Index?tab=dev` で進捗表示の整合を確認
4. 予算実績入力を実行し、`Projects/Index?tab=budget` の消費率表示を確認
5. 不足があれば `ProjectTaskController` / `BudgetController` / UI を最小修正
6. `npx tsc --noEmit` / `npm run build` / `php artisan test`
7. `doc/daily` 更新・`feat:` と `docs:` を分離コミット・push

### 手動確認チェックリスト（作業中に使用）


### 完了条件

- [x] `npx tsc --noEmit` と `npm run build` が通る
- [x] `php artisan test` が通る
- [ ] 承認後ロックの手動確認記録完了
- [ ] タスク進捗反映の手動確認記録完了
- [ ] 予算消費率反映の手動確認記録完了
- [ ] 日次更新を push まで完了

---

## 4. Phase 3 残タスク

- 消費率 70% 警告色の仕様最終反映
- 手動確認ログの反映（development_schedule / daily log）

---

## 5. 詳細ログ参照ルール

- `implementation_schedule.md` では **前日の作業記録詳細のみ参照** する
- 参照先: `doc/daily/log/implementation_schedule_log.md`
- 技術詳細日報: `doc/daily/log/daily_technical_report.md`

> 非エンジニア向け日報の詳細版（`daily_report_log.md`）は実装作業では参照しない。
> 全ログファイル一覧は `development_schedule.md` §詳細ログ保管先 を参照。