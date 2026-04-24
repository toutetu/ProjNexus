# 実装スケジュール（要約版）

このファイルは「次回作業予定」と「進行方針」のみを管理します。  
日々の詳細作業記録は `doc/daily/log/implementation_schedule_log.md` に分離して管理します。

---

## 1. 現在地

Phase 単位の進捗（Phase 0〜5 の完了／進行中／未着手、実績時間、残り時間）は **`doc/daily/development_schedule.md` が唯一の正本**。本ファイルでは重複記載しない。

本ファイルの役割は「次回作業予定」と「実装時の運用ルール」の2点に限定する。

---

## 2. 実装時の運用ルール

日次の git 手順（作業開始時・終了時のコマンド、ブランチ命名、コミット方針）は **`doc/Design/AI.md §9 日次ワークフロー` が唯一の正本**。本ファイルには記載しない。

本ファイルは「実装作業中に守るべき運用ルール」に限定して記述する。

### 実装時の運用ルール

- 申請・承認などの操作系変更は、`3ロール × 主要導線` の手動確認を当日中に実施する
- 操作系 UI は「押せる/押せない」だけでなく、処理中表示（ロック/スピナー）まで確認する

---

## 3. 次回作業予定（2026-04-25 / Phase 2 Day3）

### 目的

- 3ロールでの申請→承認/却下→通知の手動確認を完了し、結果を日次ログに記録する
- Phase 2 残タスク（再申請チェイン、部門管理者が申請者の場合の `pending_hq` 直行の UI 反映など）の優先順位を確定し、着手可能なものから実装する

### 実行手順

1. 事前確認（`php artisan serve` / `npm run dev`、ログイン後 `/projects?tab=approval`）
2. 手動確認チェックリストを 3 アカウントで順に実施し、`development_schedule.md` の検証欄を更新
3. `/notifications` で未読・既読・案件リンクを確認
4. 不足があれば `ApprovalService` / 一覧 UI を最小修正
5. `npx tsc --noEmit` / `npm run build` / `php artisan test`
6. `doc/daily` 更新・`feat:` と `docs:` を分離コミット・push

### 手動確認チェックリスト（作業中に使用）

- [ ] applicant: 新規申請 -> 下書き保存 -> 申請ができる
- [ ] dept_manager: 承認待ち（`pending_dept`）のみ承認/却下できる
- [ ] hq_manager: 承認待ち（`pending_hq`）のみ承認/却下できる
- [ ] 編集不可案件では「編集」導線が表示されない
- [ ] 承認/却下/申請実行時に行単位ロック + 処理中表示が出る
- [ ] 通知一覧で未読バッジが減る（既読化後）

### 完了条件

- [x] `ApprovalDialog` から承認/却下できる
- [x] `Projects/Create.tsx` から保存できる
- [x] `npx tsc --noEmit` と `npm run build` が通る
- [x] 通知一覧（S-12）と未読バッジの最小導線が動く
- [ ] 3ロール手動確認の記録完了
- [ ] 日次更新を push まで完了

---

## 4. Phase 2 残タスク

- S-12 通知一覧と未読バッジ
- Feature テスト（承認フロー / 権限境界）

---

## 5. 詳細ログ参照ルール

- `implementation_schedule.md` では **前日の作業記録詳細のみ参照** する
- 参照先: `doc/daily/log/implementation_schedule_log.md`
- 技術詳細日報: `doc/daily/log/daily_technical_report.md`

> 非エンジニア向け日報の詳細版（`daily_report_log.md`）は実装作業では参照しない。
> 全ログファイル一覧は `development_schedule.md` §詳細ログ保管先 を参照。