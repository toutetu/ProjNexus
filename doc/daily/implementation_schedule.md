# 実装スケジュール（要約版）

このファイルは「次回作業予定」と「進行方針」のみを管理します。  
日々の詳細作業記録は `doc/daily/log/implementation_schedule_log.md` に分離して管理します。

---

## 1. 現在地

- Phase 0: 完了
- Phase 1: 完了
- Phase 2: 完了
- Phase 3: 完了（タスク変更履歴の自動記録・行展開表示・`TaskHistoryTest` まで反映済み・2026-05-01）
- Phase 4: 着手可能（+α：レスポンシブ等。承認ステッパー大型版は実装済み）
- Phase 5: 未着手（資料・提出）

---

## 2. 日次ワークフロー

日次の git 手順（作業開始時・終了時のコマンド、ブランチ命名、コミット方針）は **`doc/Design/AI.md §9 日次ワークフロー` が唯一の正本**。本ファイルには記載しない。

本ファイルは「実装作業中に守るべき運用ルール」に限定して記述する。

### 実装時の運用ルール

- 申請・承認などの操作系変更は、`3ロール × 主要導線` の手動確認を当日中に実施する
- 操作系 UI は「押せる/押せない」だけでなく、処理中表示（ロック/スピナー）まで確認する

---

## 3. 次回作業予定（2026-05-02 以降 / Phase 4〜5）

### 目的

- Phase 4 の残（レスポンシブ最低限など）と Phase 5（`doc/manual` 区切り更新、`Information.md`、プレゼン、デプロイ確認）
- ブランチのマージ・`main` 同期を計画的に実施

### 実行手順（例）

1. `php artisan test` / `npm run build` で回帰確認
2. Phase 4 チェックリスト（`development_schedule.md`）の未チェック項目を上から消化
3. 利用マニュアルは機能単位で追記・スクショ差し替え（まとめてでも可）
4. 提出前に `requirements.md` 提出物チェックリストと突合
5. `npx tsc --noEmit` / `npm run build` / `php artisan test`
6. `doc/daily` と設計書の差分最終確認

### 手動確認チェックリスト（作業中に使用）


### 完了条件

- [x] `npx tsc --noEmit` と `npm run build` が通る
- [x] `php artisan test` が通る
- [x] 下書き閲覧制御の手動確認記録完了
- [x] タスク通知3種の手動確認記録完了
- [x] 承認後初期タスク作成の手動確認記録完了
- [x] 日次更新を反映

---

## 4. Phase 3 以降のフォロー（任意）

- ロール別の最終手動確認ログを必要に応じて追記
- 通知運用（定時実行・重複防止）の監視手順を運用メモに残す場合は `doc/daily` または `Information.md` へ

---

## 5. 詳細ログ参照ルール

- `implementation_schedule.md` では **前日の作業記録詳細のみ参照** する
- 参照先: `doc/daily/log/implementation_schedule_log.md`
- 技術詳細日報: `doc/daily/log/daily_technical_report.md`

> 非エンジニア向け日報の詳細版（`daily_report_log.md`）は実装作業では参照しない。
> 全ログファイル一覧は `development_schedule.md` §詳細ログ保管先 を参照。