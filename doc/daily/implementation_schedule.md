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

## 3. 次回作業予定（2026-04-24 / Phase 2 Day2）

### 目的

- `ApprovalDialog` を導入し、コメント付き承認/却下を実装する
- `Projects/Create.tsx` を `projects.store` に接続する

### 実行手順

1. 事前確認（`php artisan serve` / `npm run dev` / `/projects` 表示）
2. `ApprovalDialog` 実装と `projects.approve/reject` 接続
3. `Projects/Create.tsx` 最小接続（案件名・目的・見積）
4. 3ロールで申請→承認/却下を手動確認
5. `npx tsc --noEmit` / `npm run build` 実行
6. `doc/daily` 更新・コミット・push

### 完了条件

- [ ] `ApprovalDialog` から承認/却下できる
- [ ] `Projects/Create.tsx` から保存できる
- [ ] `npx tsc --noEmit` と `npm run build` が通る
- [ ] 日次更新を push まで完了

---

## 4. Phase 2 残タスク

- S-05 `Projects/Create.tsx` 本実装
- S-06 `Projects/Edit.tsx` 実装
- S-08 `ApprovalDialog.tsx` 仕上げ
- S-12 通知一覧と未読バッジ
- Feature テスト（承認フロー / 権限境界）

---

## 5. 詳細ログ参照ルール

- `implementation_schedule.md` では **前日の作業記録詳細のみ参照** する
- 参照先: `doc/daily/log/implementation_schedule_log.md`
- 日報詳細: `doc/daily/log/daily_report_log.md`
