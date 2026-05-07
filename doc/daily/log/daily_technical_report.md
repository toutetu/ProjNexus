# implementation_schedule 作業ログ

`doc/daily/implementation_schedule.md` から技術的な日次の詳細作業記録を分離したログです。  
最新の予定・進行管理は `implementation_schedule.md` を参照してください。

---

## 2026-05-01（金）追記 — 案件詳細/タスク一覧 UI 統一・共通化・導線調整

### 実装概要
- 案件詳細（`Projects/Show.tsx`）のヘッダー表示・パンくず・検索帯配置を調整
  - タイトルから「（案件名）」を削除し、案件IDをタイトル右隣へ統合
  - パンくずを `開発管理 → 案件一覧 → 案件詳細：{案件名}` へ統一
  - タスク一覧フィルタ帯をコンパクト化し、配置を見出し直下へ整理
- 工数サマリーに Info ツールチップを追加し、`Infotip` を共通部品化
  - `resources/js/Components/ui/infotip.tsx` を新規追加
  - `doc/Design/components_spec.md` に仕様を追記（実装済みとして更新）
- タスク一覧表示を拡張
  - ステータス列で全ステータスに進捗バー + 進捗率を表示
  - 確認者フィルタ、期日フィルタ（3日以内/7日以内/日付指定）を追加
- メンバータスク画面（`/member-tasks`）を改善
  - ビュー切替に「一覧」を追加（案件詳細の開発管理に準じたテーブル）
  - 一覧ビューの検索帯を案件詳細タブと同系UIへ統一
  - キーワード検索（タイトル/説明/担当/確認者/案件名/ID）をサーバ側に追加
- サイドバー導線を改善
  - 3セクションの「案件一覧」配下に `|_案件詳細` を追加し、詳細表示時は親子ともアクティブ化
  - プロフィール上に「マニュアル」リンクを追加
- ルート遷移を変更
  - `/` アクセス時、未ログインはログイン画面・ログイン済みはホームへリダイレクト
- 予算タブ表示を調整
  - 予算情報カードから「見積」行を削除（予算・実績のみ表示）

### 主要変更ファイル
- `resources/js/Pages/Projects/Show.tsx`
- `resources/js/Pages/MemberTasks/Index.tsx`
- `resources/js/Components/MemberTasks/ViewToggle.tsx`
- `resources/js/Components/Layout/Sidebar.tsx`
- `resources/js/Components/ui/infotip.tsx`（新規）
- `app/Http/Controllers/MemberTaskController.php`
- `routes/web.php`
- `doc/Design/components_spec.md`

### 検証
- `npm run build` 成功
- `ReadLints` で変更ファイルにエラーなし
/**更新完了**/