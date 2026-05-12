# 作業依頼：{{PHASE_NAME}}（{{YYYY-MM-DD}}）

> **テンプレート使用方法**
> このファイルをコピーして `next_chat_handover_{{YYYYMMDD}}.md` として保存し、
> `{{...}}` の変数部分を埋めて使用する。
> 毎日書き換えるのは主に「現在地」「今日やること」「今日の作業向け追加読ファイル」の3セクション。
---

開発管理アプリ（Laravel 11 + React + Inertia + TypeScript）の  
**{{PHASE_NAME}}{{PHASE_GOAL_SHORT}}** を進めてください。

---
## 最優先ルール

1. **main 上で作業しない**（作業ブランチで実装）
2. 実装コミットと docs コミットは**同じ `feat/xxx` ブランチ内で別コミット**に分ける（`feat:` / `docs:` の prefix で区別）
3. 作業まとまりごとに log/ 配下と development_schedule.md 実績時間を更新、1日の終わりに直下3ファイルを更新
4. 詳細ルールは `doc/Design/AI.md` の「日次ワークフロー」節参照（唯一の正本）
5. Sonnet / Opus 切替判断時は必ず事前通知

### ドキュメント運用ルール

- `daily_report.md`：非エンジニア向けに簡潔（既提出分は改変せず追記のみ）
- `daily_report_log.md`：非エンジニア向け・詳細版（`doc/daily/log/` 配下）
- `daily_technical_report.md`：技術的に詳細（`doc/daily/log/` 配下）
- `development_schedule.md`：Phase 見積・実績・累計時間の**唯一の正本**。毎日更新
- `implementation_schedule.md`：翌日の実行手順と引継ぎ重視

---

## 現在地（完了済み）

- 実装ブランチ: `{{CURRENT_BRANCH}}`（{{BRANCH_STATUS}}）
- 反映コミット: `{{LATEST_COMMIT_HASH}}`
- 実装済み:
  - {{DONE_ITEM_1}}
  - {{DONE_ITEM_2}}
  - {{DONE_ITEM_3}}
  <!-- 必要な分だけ追加 -->

---

## 今日やること（優先順）

1. {{TODAY_TASK_1}}
2. {{TODAY_TASK_2}}
3. {{TODAY_TASK_3}}
4. {{TODAY_TASK_4}}
5. 余裕があれば {{OPTIONAL_TASK}}

---

## 作業前に読むファイル

### 共通（毎回必読・固定）
- `doc/Design/AI.md` — 入口・日次ワークフロー・モック一覧
- `doc/Design/system_spec.md` — スコープ・DB・権限・承認（事実の正本）
- `doc/daily/development_schedule.md` — 現在の進捗・Phase 状態
- `doc/daily/implementation_schedule.md` §3 — 次回作業予定
- `doc/daily/log/implementation_schedule_log.md` — 前日の詳細ログ

### 今日の作業向け（日によって変える）
<!--
以下は参考リスト。今日の作業内容に応じて必要なものだけ残す。

- Pages / UI 作業 → components_spec.md、design_system.md、screen_flow.md
- DB / migration 作業 → er_diagram.md、requirements.md
- 承認フロー関連 → system_spec.md §8、背景は design-philosophy.md §4
- ルーティング追加 → routes/web.php、screen_flow.md §2
-->
- `{{READ_FILE_1}}` — {{READ_FILE_1_REASON}}
- `{{READ_FILE_2}}` — {{READ_FILE_2_REASON}}
- `{{READ_FILE_3}}` — {{READ_FILE_3_REASON}}

---

## 完了条件

- `npx tsc --noEmit` 成功
- `npm run build` 成功
- 実装コミット・push完了
- `doc/daily/` の日次更新完了（docsブランチで分離）
- {{ADDITIONAL_COMPLETION_CRITERIA}}
<!-- 追加の完了条件がなければこの行は削除 -->