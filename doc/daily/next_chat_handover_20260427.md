# 作業依頼：Phase 3（2026-04-27）

開発管理アプリ（Laravel 11 + React + Inertia + TypeScript）の  
**Phase 3 ** を進めてください。

---

## 最優先ルール

1. **main 上で作業しない**（作業ブランチで実装）
2. 実装コミットと docs コミットは**同じ `feat/xxx` ブランチ内で別コミット**に分ける（`feat:` / `docs:` の prefix で区別）
3. 作業まとまりごとに log/ 配下と development_schedule.md 実績時間を更新、1日の終わりに直下3ファイルを更新
4. 詳細ルールは `doc/Design/AI.md` §9 日次ワークフロー参照（唯一の正本）
5. Sonnet / Opus 切替判断時は必ず事前通知

### ドキュメント運用ルール

- `daily_report.md`：非エンジニア向けに簡潔（既提出分は改変せず追記のみ）
- `daily_technical_report.md`：技術的に詳細（`doc/daily/log/` 配下）
- `development_schedule.md`：Phase 見積・実績・累計時間の**唯一の正本**。毎日更新
- `implementation_schedule.md`：翌日の実行手順と引継ぎ重視

---

## 現在地（完了済み）

- 実装ブランチ: `feat/phase3-projects-foundation`
- 反映コミット: （未作成 / 次回 `feat:` と `docs:` で分離予定）
- 実装済み:
  - 開発タブ案件一覧（実データ、タスク件数・進捗表示、フィルタ）
  - タスク CRUD（承認済み案件のみ、権限制御、S-10 相当モーダル）
  - 予算実績上書き（承認済みかつ主担当のみ、S-11 相当モーダル）
  - `php artisan test` / `npm run build` / `npx tsc --noEmit` 通過
  - `Task*` 系ファイルの構文混入対策として `ProjectTaskController` / `ProjectWorkItem` へ参照先を安定化


---

## 今日やること（優先順）

1. Phase 3 手動確認（承認後ロック・進捗反映・消費率反映）
2. 仕様残タスク（消費率70%警告色）の最終反映
3. docs 更新内容を `docs:` コミットで確定
---

## 作業前に読むファイル

### 共通（毎回必読）
- `doc/Design/AI.md` — プロジェクト全体ルール
- `doc/daily/development_schedule.md` — 現在の進捗・Phase 状態
- `doc/daily/implementation_schedule.md` §3 — 次回作業予定
- `doc/daily/log/implementation_schedule_log.md` — 前日の詳細ログ
- `mockups` — モックと設計方針

### 今日の作業向け
- フェーズ３の計画
- フェーズ３の実装開始


---

## 完了条件
- [x] 自動検証（`php artisan test` / `npm run build` / `npx tsc --noEmit`）
- [ ] 手動検証ログ反映（development_schedule / daily log）
- [ ] `feat:` / `docs:` 分離コミット
