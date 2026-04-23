# 実装スケジュール（要約版）

このファイルは「次回作業予定」と「進行方針」のみを管理します。  
日々の詳細作業記録は `doc/daily/log/implementation_schedule_log.md` に分離して管理します。

---

## 1. 現在地

- Phase 0: 完了
- Phase 1: 完了
- Phase 2: 進行中（承認フローの最小導線まで実装済み）
- Phase 3: 未着手
- Phase 4: 未着手
- Phase 5: 未着手

---

## 2. 日次ワークフロー

### 作業開始時

```powershell
git checkout main
git pull origin main
git checkout -b <work-branch>
```

### 作業終了時

```powershell
git add -A
git commit -m "docs: 日次更新 YYYY-MM-DD"
git push -u origin <work-branch>
```

### 運用ルール

- main 上で直接作業しない
- 実装コミットと docs コミットは分離する
- 日次の詳細記録は `doc/daily/log/` に残す

---

## 3. 次回作業予定（2026-04-24 / Phase 2 Day3）

### 目的

- 承認待ち一覧の操作性とエラーハンドリングを整える
- 通知一覧（S-12）と未読バッジの最小導線を接続する

### 実行手順

1. 事前確認（`php artisan serve` / `npm run dev` / `/projects` 表示）
2. 承認待ち一覧で行単位操作（申請/承認/却下/編集）の表示と遷移を確認
3. 通知一覧ページ（S-12）の骨組み作成と `notifications` データ接続
4. ヘッダー通知バッジ（未読件数）を最小実装
5. 3ロールで申請→承認/却下→通知の手動確認
6. `npx tsc --noEmit` / `npm run build` 実行
7. `doc/daily` 更新・コミット・push

### 完了条件

- [x] `ApprovalDialog` から承認/却下できる
- [x] `Projects/Create.tsx` から保存できる
- [ ] `npx tsc --noEmit` と `npm run build` が通る
- [ ] 通知一覧（S-12）と未読バッジの最小導線が動く
- [ ] 日次更新を push まで完了

---

## 4. Phase 2 残タスク

- S-12 通知一覧と未読バッジ
- Feature テスト（承認フロー / 権限境界）

---

## 5. 詳細ログ参照ルール

- `implementation_schedule.md` では **前日の作業記録詳細のみ参照** する
- 参照先: `doc/daily/log/implementation_schedule_log.md`
- 日報詳細: `doc/daily/log/daily_report_log.md`
