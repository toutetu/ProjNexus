# 作業依頼：Phase 2 継続（2026-04-24）

開発管理アプリ（Laravel 11 + React + Inertia + TypeScript）の  
**Phase 2 継続作業（申請・承認フロー仕上げ）** を進めてください。

---

## 最優先ルール

1. **main 上で作業しない**（作業ブランチで実装）
2. 実装コミットと docs コミットは**同じ `feat/xxx` ブランチ内で別コミット**に分ける（`feat:` / `docs:` の prefix で区別）
3. 作業まとまりごとに log/ 配下と development_schedule.md 実績時間を更新、1日の終わりに直下3ファイルを更新
4. 詳細ルールは `doc/Design/AI.md` §9 日次ワークフロー参照（唯一の正本）
5. Sonnet / Opus 切替判断時は必ず事前通知

### ドキュメント運用ルール

- `daily_report.md`：非エンジニア向けに簡潔（既提出分は改変せず追記のみ）
- `daily_report_log.md`：非エンジニア向け・詳細版（`doc/daily/log/` 配下）
- `daily_technical_report.md`：技術的に詳細（`doc/daily/log/` 配下）
- `development_schedule.md`：Phase 見積・実績・累計時間の**唯一の正本**。毎日更新
- `implementation_schedule.md`：翌日の実行手順と引継ぎ重視

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

### 共通（毎回必読）
- `doc/Design/AI.md` — プロジェクト全体ルール
- `doc/daily/development_schedule.md` — 現在の進捗・Phase 状態
- `doc/daily/implementation_schedule.md` §3 — 次回作業予定
- `doc/daily/log/implementation_schedule_log.md` — 前日の詳細ログ

### 今日の作業向け（S-12 通知 / UI 調整）
- `doc/Design/components_spec.md` — 共通コンポーネントの Props・配置（Pages 実装前に必読）
- `doc/Design/screen_flow.md` — S-12 通知一覧の URL・画面遷移
- `doc/Design/design_system.md` — バッジ・色・スタイル
- `routes/web.php` — 通知ルートの追加箇所

---

## 完了条件

- `npx tsc --noEmit` 成功
- `npm run build` 成功
- 実装コミット・push完了
- `doc/daily/` の日次更新完了（docsブランチで分離）