# 実装スケジュール詳細ログ

`doc/daily/implementation_schedule.md` の「前日までの作業詳細」を記録する。  
要約・次回予定のみは `implementation_schedule.md` 側を正とする。

---

## 2026-05-08

- `implementation_schedule.md` に「マストで修正・実装する項目（改修リスト）」「今後の実装項目（課題2）」を追加。
- 用語を「回収」から「改修」へ統一（スケジュール・運用ドキュメント）。

## 2026-05-08（本番本部承認 500 の調査）

- ローカル（SQLite テスト）では再現せず、本番 MySQL のみで落ちる想定として `notifications.type` の ENUM ずれと、`TaskHistoryService` のネストトランザクションを疑い対処した。
- `database/migrations/2026_05_08_120000_notifications_type_to_varchar_mysql.php` を追加（MySQL/MariaDB のみ `type` を VARCHAR に）。
- `TaskHistoryService` で `DB::transactionLevel() > 0` のときは内側トランザクションを張らない。
- `ProjectApprovalFlowTest` に本部承認の結合テストを追加。
- `development_schedule.md` の現在地・今週の目標を同期。
- `doc/Design/Information.md` §5 に `implementation_schedule.md` §3 への参照行を追加。
