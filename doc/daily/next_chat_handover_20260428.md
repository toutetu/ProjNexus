# 作業依頼：Phase 3（2026-04-28）

開発管理アプリ（Laravel 11 + React + Inertia + TypeScript）の  
**Phase 3** の仕上げを進めてください。

---

## 最優先ルール

1. **main 上で作業しない**（作業ブランチで実装）
2. 実装コミットと docs コミットは**同じ `feat/xxx` ブランチ内で別コミット**に分ける（`feat:` / `docs:` の prefix で区別）
3. 作業まとまりごとに log/ 配下と `development_schedule.md` 実績時間を更新、1日の終わりに直下3ファイルを更新
4. 詳細ルールは `doc/Design/AI.md` §9 日次ワークフロー参照（唯一の正本）
5. Sonnet / Opus 切替判断時は必ず事前通知

### ドキュメント運用ルール

- `daily_report.md`：非エンジニア向けに簡潔（既提出分は改変せず追記のみ）
- `daily_technical_report.md`：技術的に詳細（`doc/daily/log/` 配下）
- `development_schedule.md`：Phase 見積・実績・累計時間の**唯一の正本**。毎日更新
- `implementation_schedule.md`：翌日の実行手順と引継ぎ重視

---

## 現在地（2026-04-27 終了時点）

- 実装ブランチ: `feat/phase3-projects-foundation`
- 実装コミット: `ce1c879c`（GitHub / GitLab の両方へ push 済み）
- 実装済み:
  - 開発タブ/予算タブのモック準拠調整（実データ表示、ページング、凡例）
  - フィルタ即時反映（セレクト変更時）とクリアボタン右端固定
  - 承認ステッパーを `ApprovalStepperFull` へ差し替え
  - 案件作成時の主担当自動セット（申請者）を反映
  - `npm exec tsc -- --noEmit` / lint / `php -l` 通過
- 未コミット docs 差分（翌作業で `docs:` コミット予定）:
  - `doc/daily/daily_report.md`
  - `doc/daily/development_schedule.md`
  - `doc/daily/log/daily_technical_report.md`


---

## 明日やること（優先順）

1. Phase 3 手動確認（承認後ロック・進捗反映・消費率反映）を実施し、結果を記録
2. 主担当の「承認後に設定する場所」の仕様決定と実装
3. 日次 docs の最終更新を `docs:` コミットで確定（必要なら push）

---

## 作業前に読むファイル

### 共通（毎回必読）
- `doc/Design/AI.md` — プロジェクト全体ルール
- `doc/daily/development_schedule.md` — 現在の進捗・Phase 状態
- `doc/daily/implementation_schedule.md` §3 — 次回作業予定
- `doc/daily/log/implementation_schedule_log.md` — 前日の詳細ログ
- `mockups` — モックと設計方針

### 明日の作業向け
- `mockups/s03b_policy.md`（開発タブ）
- `mockups/s03c_policy.md`（予算タブ）
- `mockups/s04_policy.md`（案件詳細）
- `mockups/s10_policy.md`（タスク運用）

---

## 完了条件
- [ ] 手動検証ログ反映（`development_schedule.md` / `daily_technical_report.md`）
- [ ] `docs:` コミット（必要に応じて `origin` / `gitlab` へ push）
- [ ] 次回引継ぎファイル更新（`next_chat_handover_20260429.md`）
