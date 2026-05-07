# 実装スケジュール（要約版）

このファイルは「次回作業予定」と「進行方針」のみを管理します。  
日々の詳細作業記録は `doc/daily/log/implementation_schedule_log.md` に分離して管理します。

---

## 1. 現在地（2026-05-07 更新）

- Phase 0: 完了
- Phase 1: 完了
- Phase 2: 完了
- Phase 3: 完了（タスク変更履歴の自動記録・行展開表示・`TaskHistoryTest` まで反映済み・2026-05-01）
- Phase 4: 実装完了（S-14 3ビュー、4値運用、通知拡張まで完了）
- Phase 5: 進行中（資料同期・提出準備）

---

## 2. 日次ワークフロー

日次の git 手順（作業開始時・終了時のコマンド、ブランチ命名、コミット方針）は **`doc/Design/AI.md §9 日次ワークフロー` が唯一の正本**。本ファイルには記載しない。

本ファイルは「実装作業中に守るべき運用ルール」に限定して記述する。

### 実装時の運用ルール

- 申請・承認などの操作系変更は、`3ロール × 主要導線` の手動確認を当日中に実施する
- 操作系 UI は「押せる/押せない」だけでなく、処理中表示（ロック/スピナー）まで確認する

---

## 3. 次回作業予定（2026-05-07 以降 / Phase 5 中心）

### 目的

- 設計書・日報・提出物チェックリストの整合を最終化する
- デプロイ環境でデモ導線（3ロール）を再確認する
- 課題2設計資料（S-16 バーンダウン方針）をプレゼン文脈へ接続する

### 実行手順（例）

1. `npx tsc --noEmit` / `npm run build` / `php artisan test` で回帰確認
2. `doc/Design`（`requirements.md` / `screen_flow.md` / `Information.md` / `er_diagram.md`）の相互参照を最終確認
3. `doc/manual/user_manual.md` を現行UIで見直し、必要スクショを差し替え
4. `mockups/s16_burndown_policy.md` の要点をプレゼン草稿に反映
5. 提出前に `requirements.md` の提出物チェックリストと実体を突合
6. デプロイ環境で 3 ロール導線（申請→承認→開発/予算→通知）を再確認

### 手動確認チェックリスト（作業中に使用）


### 完了条件（Phase 5）

- [ ] `npx tsc --noEmit` と `npm run build` が通る
- [ ] `php artisan test` が通る
- [ ] `requirements.md` の提出物5項目の状態が実体と一致
- [ ] `Information.md` の動作確認シナリオがデモ導線と一致
- [ ] デプロイ環境で 3 ロールの主要導線確認記録を残す
- [ ] プレゼン提出物（`.md` または `.pdf`）の最終版を確定

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


## 6.作業前に読むファイル

### 共通（毎回必読）
- `doc/Design/AI.md` — プロジェクト全体ルール
- `doc/daily/development_schedule.md` — 現在の進捗・Phase 状態
- `doc/daily/implementation_schedule.md` — 次回作業予定
- `mockups` — モックと設計方針

### 明日の作業向け
/**更新完了**/