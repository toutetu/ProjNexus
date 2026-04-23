# 作業依頼：Phase 2 継続（2026-04-24）

開発管理アプリ（Laravel 11 + React + Inertia + TypeScript）の  
**Phase 2 継続作業（申請・承認フロー仕上げ）** を進めてください。

---

## 最優先ルール

1. **main 上で作業しない**（作業ブランチで実装）
   - 作業終了時にコミット → push
2. 日次更新は `main` から `docs/daily-YYYYMMDD` を切って `doc/daily/` を更新
3. 詳細ルールは `doc/Design/CLAUDE.md` §9 日次ワークフロー参照
4. Sonnet / Opus 切替判断時は必ず事前通知

### 日報運用ルール
- `daily_report.md` は非エンジニア向けに簡潔
- `development_schedule.md` は技術的に詳細
- `implementation_schedule.md` は翌日の実行手順と引継ぎ重視

---

## 現在地（完了済み）

- 実装ブランチ: `feat/phase2-projects-foundation`（push済み）
- 反映コミット: `b8d53971`
- 実装済み:
  - `ApprovalDialog`（コメント付き承認/却下）
  - `Projects/Create.tsx`（`projects.store` 接続）
  - `Projects/Edit.tsx`（`projects.update` 接続）
  - 一覧→詳細→編集導線
  - `canEdit` 連動表示（一覧/詳細）
  - 行単位の二重送信防止（processing ロック + スピナー）

---

## 今日やること（優先順）

1. `Notifications/Index.tsx`（S-12）を最小実装
2. ヘッダー未読バッジを最小接続
3. 承認待ち一覧UIの調整（状態表示/エラー表示）
4. 3ロールで申請→承認/却下→通知を手動確認
5. 余裕があれば Feature テスト着手（承認1本、権限1本）

---

## 作業前に読むファイル

- `doc/Design/CLAUDE.md`
- `doc/daily/development_schedule.md`
- `doc/daily/implementation_schedule.md` §3
- `doc/daily/log/implementation_schedule_log.md`
- `routes/web.php`

---

## 完了条件

- `npx tsc --noEmit` 成功
- `npm run build` 成功
- 実装コミット・push完了
- `doc/daily/` の日次更新完了（docsブランチで分離）
