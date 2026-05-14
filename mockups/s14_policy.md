# S-14 タスク一覧 方針

## 構成

- **背景**: 課題2 で挙げた「部門管理者向けメンバータスク状況一覧」の実装。承認済案件のタスクを**タスク横断で俯瞰**できる画面
- **レイアウト**: AuthenticatedLayout（サイドバー「開発管理 > タスク一覧」がアクティブ）、`max-w-[1500px]`
- **パンくず**: 開発管理 > タスク一覧
- **URL**: `/member-tasks?view=board|members|list[&filter...]`
  - `view=board` … カンバンビュー（ステータス×タスク横断）
  - `view=members` … メンバー別ビュー（行=メンバー、列=ステータス）
  - `view=list` … 一覧ビュー（S-04 開発管理タブ準拠の表形式）
- **コンポーネント**: `MemberTasks/Index.tsx` 単一ページ + `view` props で表示切替

## モック対応

| ビュー | 主モック | 補助モック | 備考 |
|---|---|---|---|
| 採用 | `s14b_member_tasks_toggle.html` | — | **ビュートグル方式・4値運用** |
| 参考（不採用） | `s14a_member_tasks_kanban.html` | 3値カンバン単独 | 設計検討用に残置 |
| 参考（不採用） | `s14a_member_tasks_kanban_4status.html` | 4値カンバン単独 | 設計検討用に残置 |
| 参考（不採用） | `s14c_member_tasks_matrix.html` | マトリクス専用 | 設計検討用に残置 |

> **採用は案B（ビュートグル）**。1つの URL／コンポーネントの中で「カンバン」「メンバー別」「一覧」を切替えて見せる。タブではなくピル型トグルで「視点切替」の意味を明確にする。

## ステータス（4値運用 — 課題1 で完全実装）

| ステータス | 列／セル | 課題1 |
|---|---|---|
| `open` 未着手 | 1列目 | ○ |
| `in_progress` 進行中 | 2列目 | ○ |
| `resolved` 確認待ち | 3列目（カンバン）／closed 列に併記（メンバー別） | ○ **完全運用** |
| `closed` 完了 | 4列目／3列目 | ○ |

### 4値運用に必要な実装変更（課題1 内で対応）

1. **DB**: `tasks` に `reviewer_id` カラム追加（nullable、FK→users）
   - 新規 migration: `2026_05_xx_add_reviewer_id_to_tasks.php`
2. **Enums**: `TaskStatus::phase4Values()` を追加。Phase 3 では `phase3Values()` を使い続けるが、S-10 モーダルと S-14 では `phase4Values()` に切替
3. **Controller**: `ProjectTaskController::update` に resolved 遷移時のバリデーション追加（`reviewer_id` 必須など）
4. **Modal (S-10)**: 確認者選択フィールド、resolved 遷移ボタンを追加
5. **NotificationService / NotificationType**: `task_resolved`（確認者宛）、`task_reviewed`（実装者・申請者宛）の2タイプを追加
6. **Policy**:
   - `in_progress → resolved` は担当者（`assignee_id = self`）のみ
   - `resolved → closed` は確認者（`reviewer_id = self`）のみ
   - `closed → open` 等の逆遷移は管理者のみ（既存ポリシーに準ずる）

### 確認者の初期値

- **本部承認時の自動タスク（実装計画作成）**: 確認者 = 申請者の所属部門の部門管理者を自動設定
- **ユーザー作成タスク**: モーダルで明示選択（必須、既定は部門管理者）

## ロール別の初期ビューと表示範囲

| ロール | 初期ビュー | board 表示範囲 | members 表示範囲 | list 表示範囲 |
|---|---|---|---|---|
| applicant | `board` | 自分が `assignee_id` または `reviewer_id` のタスク | 自部門の全メンバー × 全タスク（**閲覧のみ**）| 自分が `assignee_id` または `reviewer_id` のタスク |
| dept_manager | `members` | 自部門の全タスク | 自部門の全メンバー × 全タスク | 自部門の全タスク |
| hq_manager | `members` | 部門選択時、選択部門の全タスク（未選択時：EmptyState）（**閲覧のみ**） | 同上（**閲覧のみ**） | 同上（**閲覧のみ**） |

> **方針変更**: members ビューは全ロール閲覧可とする。部門全員が「誰が忙しい／誰の助けが必要か」を相互に把握できることで、現場のセルフマネジメントを促進する。Policy で「閲覧 OK／編集 NG」を分けて制御。  
> **本部管理者（2026-05-12）:** タスクは **閲覧のみ**（モーダル保存・DnD・コメント投稿・再オープン等は不可）。実装は `materials/daily_reports/implementation_schedule.md` §3 マスト #9。

### サイドバー表示
- 全ロールで「タスク一覧」を表示（dim 解除）

## 構成セクション（上から下へ）

### ページヘッダー
- タイトル左に `.title-accent`（4px幅のアクセントカラー縦バー）
- タイトル「タスク一覧」+ サブタイトル「{部門名} · メンバー{N}名 · 全{M}件」
- 右肩に「完了は直近30日分のみ表示」の補足

### ビュートグル（タブではなくピル型トグル）
- ボタン3つ：`[カンバン]` `[メンバー別]` `[一覧]`
- アクティブは背景 `var(--brand-dark)` + 白文字
- ロールに応じて初期アクティブが切替（上記表参照）
- クリックで URL クエリ `?view=board|members|list` を更新（state 保持）

### KPI ストリップ（**`members` ビューのみ**）
4枚のカード：
- 部門合計（件数）
- 期限超過（赤）
- 3日以内（橙、早期警告）
- 完了率（緑、`closed / total`）

> board ビューでは KPI を出さない（カンバンの列ヘッダーカウントで代替）。

### フィルタバー（共通）
- キーワード検索：`キーワード（タイトル・説明・担当など）`（虫眼鏡アイコン付き input）
- 部門：dept_manager は自部門固定 disabled、hq_manager は select 必須
- 担当者：select（部門メンバー一覧）
- 案件：select（部門の承認済案件一覧）
- 優先度：すべて／高／中／低
- 期日：すべて／期限超過／3日以内（早期警告）／今週中／今月中／期日未設定
- クリアボタン（右端）

#### キーワード検索の対象（実装準拠）
- タスク: `title`, `description`, `id`
- ユーザー: `assignee.name`, `reviewer.name`
- 案件: `project.title`
- 実装: `MemberTaskController::filteredTasksQuery` の `where / orWhereHas` で評価

### ソート切替（**`members` ビューのみ**）
ピル型ボタン4つ（active 1つ）：
- 期限超過 多い順（既定）
- 担当数 多い順
- 進行中 多い順
- 名前順

### カンバンビュー（board）
4列の grid（`grid-cols-4`）：
- 列1: 未着手（gray-400 ドット）
- 列2: 進行中（brand-blue ドット）
- 列3: 確認待ち（brand-purple ドット、列の背景を淡い紫 `#F5F3FF`）
- 列4: 完了（緑 ドット、「(直近30日)」補足）

#### カード要素（**案件名を追加**）
- 上段：`[PRJ-XXXX]` `案件名（truncate）` + 種別チップ（task/bug/feature/improvement）
  - PRJ-ID（mono、muted）+ 案件名（最大25文字程度で truncate、リンクで案件詳細へ）
- 中段：タスクタイトル
- 下段：担当者アバター + 名前 ／ 優先度バッジ ／ 期日（mono）
- **進行中のみ**：進捗ミニバー（高さ3px）+ パーセント
- **確認待ちのみ**：確認者ライン（破線区切り、`👤 確認者：氏名` + 報告日）
- **完了のみ**：完了日 + タイトルに取り消し線、確認者名を小さく
- カード枠色：通常=灰、期限超過=赤、3日以内=橙、確認待ち=紫

### 一覧ビュー（list）— S-04 開発管理準拠

#### 位置づけ
- 運用で要望の強かった「横断一覧での検索・絞り込み」を強化するため追加
- 画面の閲覧体験を `S-04` のタスクテーブルに寄せ、学習コストを低減

#### 列構成
- タイトル（下段に `PRJ-XXXX / 案件名`）
- 種類（チップ）
- 優先度（チップ）
- ステータス（バッジ + 進捗バー + パーセント）
- 担当
- 確認者
- 期日

#### 表示ルール
- 進捗バーは全ステータスで表示（幅は `min(progressRate, 100)`）
- バー色は 4 段階（〜60緑 / 61〜85青 / 86〜100橙 / 100超赤）
- 行クリックで `ProjectTaskDialog` を開く（board/members と同じ）
- 完了は board/members と同様、直近30日制約を適用済みデータを表示

### メンバー別ビュー（members）— 案C マトリクス UI
5カラム grid（`240px / 1fr / 1fr / 1fr / 90px`）：
- 列1（240px）: メンバー情報ペイン（アバター大、氏名、ロール、サマリバッジ群、負荷バー）
- 列2〜4（1fr）: 未着手 ／ 進行中 ／ 完了 — 各メンバー × 各ステータスのコンパクトカード（`mtx-card`）
- 列5（90px）: 合計件数（`stat-num` 大きめ表示）

#### マトリクス上に重ねる UI 要素（members ビュー専用）
1. **KPI ストリップ**（4カード）: 部門合計 / 期限超過 / 3日以内 / 完了率
2. **ソート切替**（ピル型 4ボタン・active 1つ）:
   - 期限超過 多い順（既定）
   - 担当数 多い順
   - 進行中 多い順
   - 名前順

#### メンバー情報ペイン（列1）
- アバター大（40px）+ 氏名 + ロールバッジ（申請者 / 部門管理者）
- 自分の行には `自分` バッジ
- サマリバッジ群（複数を同時に表示可）:
  - `超過 N`（赤、`badge-warn`）
  - `3日以内 N`（橙、`badge-soon`）
  - `確認待ち N`（紫、`badge-resolved`）— 自分が実装者で完了報告済みの件数
  - `確認依頼 N`（紫、`badge-resolved`）— 自分が確認者として待っている件数
  - `順調`（緑、`badge-ok`）— 上記すべて 0件の時のみ表示
- 負荷バー: 担当タスク数 / 想定上限 **8件 固定**
  - 緑（〜50%）／青（〜75%）／橙（〜100%）／赤（>100%）

#### `resolved` の表示（完了列に併記）
- 完了列（4列目）の中に紫枠の `mtx-card.is-resolved` として並べる
- カード内表示: PRJ-ID + 案件名 + 右肩に「確認待ち」アイコン（`user-check`）、確認者名は小さく
- 通常の `closed` カード（取り消し線・緑チェック）と併存させて、列見出しは「完了 (確認待ち含・30日)」

#### 空セル
そのメンバー × そのステータスにタスクが0件の場合、セル内に「—」（`empty-cell`）を表示

#### 行の折りたたみは行わない
案C マトリクスは「全メンバーを並列に俯瞰」が目的のため、行の折りたたみ機能は持たない。タスクが0件のセルは空表示で吸収する。

### 凡例（フッター）
- 期限超過／3日以内／確認待ち（カンバン）／順調（メンバー別）の意味
- 負荷バーの基準（8件 固定）の説明
- カードクリックでタスク編集モーダル（既存 `ProjectTaskDialog`）への動線案内

## ロール別データアクセス（Controller 側クエリ分岐）

| ロール | board の対象タスク | members の対象タスク（閲覧のみ）| list の対象タスク |
|---|---|---|---|
| applicant | (`assignee_id = self` OR `reviewer_id = self`) AND `project.status = approved` | 自部門の全タスク | (`assignee_id = self` OR `reviewer_id = self`) AND `project.status = approved` |
| dept_manager | `project.department_id = self.dept` AND `project.status = approved` | 自部門の全タスク | 自部門の全タスク |
| hq_manager | 部門選択時、選択部門の全タスク（未選択時 EmptyState）| 部門選択時、選択部門の全タスク | 部門選択時、選択部門の全タスク |

### クエリ最適化
- `tasks` を eager load（`assignee:id,name,department_id`、`reviewer:id,name`、`project:id,title,department_id`）
- 完了タスクは `where('status', closed)->where('updated_at', '>=', now()->subDays(30))` で **クエリ強制**
- メンバー別ビューは `groupBy('assignee_id')` の前段で `User::department($id)->with('assignedTasks')` を発行

## 行/カードクリックの挙動

3ビュー（board / members / list）とも、カードまたは行クリックで **既存の `ProjectTaskDialog`** を開く（モーダル）。
- 編集権限は既存の `ProjectWorkItemPolicy` に委ねる（applicant が他者タスクを開いた場合は read-only）
- 案件詳細へ移動するには「案件名」または「PRJ-ID」クリック → 案件詳細画面の「開発」タブへ

## 設計上のこだわり

- **ビュートグル方式（タブではない）** — 実態は同一データの視点切替。`カンバン / メンバー別 / 一覧` を同一文脈で切替え、探索（board）と管理（members/list）を両立する
- **4値運用への完全移行（課題1 内実装）** — タスクの品質ゲートとして「確認者OK」を経ることで、実装者の自己判断による完了を防ぐ。Excel 管理では実現できなかった部分で、PoC のアピールポイント
- **ロール制限なしで members ビュー閲覧可** — 部門全員が状況把握できることで、現場のセルフマネジメントが促進される。閲覧 OK／編集 NG を Policy で分ける
- **管理者の初期ビューは members** — 部門管理者の関心事は「メンバー全体の状況把握」。最初に出す情報をその要件に合わせる
- **カードに案件名を併記** — PRJ-ID だけだと「どの案件のタスクか」が即座に分からない。案件名併記で文脈を補強し、Slack やメールで「PRJ-XXXX」とも検索しやすい
- **完了30日のクエリ強制** — 過去の完了タスクが永遠に貯まると視認性が落ちる。`updated_at` 基準で絞り、UI 上の切替は出さない（シンプルさ優先）
- **ソート切替（members）の既定は「期限超過多い順」** — 部門管理者の関心事は「ヤバい状態のメンバーを真っ先に見つけること」
- **同一コンポーネント + view props 切替** — S-03a/b/c と同じパターン。Controller で view を見て返す eager load を変え、フロントは props で表示切替

## 実装ファイル（予定）

| 区分 | ファイル | 内容 |
|---|---|---|
| 新規 | `database/migrations/2026_05_xx_add_reviewer_id_to_tasks.php` | `reviewer_id` カラム追加 |
| 新規 | `app/Http/Controllers/MemberTaskController.php` | index（view 切替 + フィルタ + ロール別クエリ） |
| 新規 | `app/Policies/MemberTaskPolicy.php`（or 既存 `ProjectWorkItemPolicy` 拡張）| `viewBoard` / `viewMembers` 等の権限定義 |
| 新規 | `resources/js/Pages/MemberTasks/Index.tsx` | 単一ページ、view props でレンダリング切替 |
| 新規 | `resources/js/Components/MemberTasks/KanbanBoard.tsx` | board ビュー本体 |
| 新規 | `resources/js/Components/MemberTasks/MemberMatrix.tsx` | members ビュー本体 |
| 追加 | `resources/js/Pages/MemberTasks/Index.tsx` | list ビュー（テーブル）を同ページ内に追加 |
| 新規 | `resources/js/Components/MemberTasks/TaskCard.tsx` | カード共通部品（案件名表示込み） |
| 新規 | `resources/js/Components/MemberTasks/ViewToggle.tsx` | ピル型トグル |
| 編集 | `routes/web.php` | `/member-tasks` ルート追加 |
| 編集 | `app/Models/ProjectWorkItem.php` | `reviewer_id` を `$fillable` に追加、relation `reviewer` 定義 |
| 編集 | `app/Policies/ProjectWorkItemPolicy.php` | `resolved → closed` の権限分岐（`reviewer_id = self`） |
| 編集 | `app/Http/Controllers/ProjectTaskController.php` | resolved 遷移バリデーション、`reviewer_id` 必須化 |
| 編集 | `app/Services/NotificationService.php` | `notifyTaskResolved` / `notifyTaskReviewed` を追加 |
| 編集 | `app/Enums/NotificationType.php` | `TaskResolved` / `TaskReviewed` を追加 |
| 編集 | `app/Enums/TaskStatus.php` | `phase4Values()` ヘルパ追加 |
| 編集 | `resources/js/Components/Modals/ProjectTaskDialog.tsx` | 確認者選択、resolved 遷移ボタン |
| 編集 | `resources/js/Layouts/AuthenticatedLayout.tsx` | サイドバー「タスク一覧」dim 解除 + リンク有効化 |
| 編集 | `app/Services/ApprovalService.php` | 本部承認時の自動タスクに `reviewer_id` を設定 |

## 確定事項（高橋さん判断 — 2026-05-01）

- ✅ 採用UI: 案B（ビュートグル）
- ✅ ステータス: 4値運用に完全移行（resolved 含めて課題1 内実装）
- ✅ members ビューは全ロール閲覧可（管理者は初期 members）
- ✅ applicant のサイドバー表示（dim 解除）
- ✅ 負荷バー上限 8件 固定
- ✅ members は3列構成（resolved を closed 列に併記）
- ✅ 完了30日はクエリで強制
- ✅ カードに案件名表示（PRJ-ID の右隣）
- ✅ list ビューを追加（S-04 開発管理準拠テーブル）
- ✅ S-14 フィルタにキーワード検索を追加

## 関連設計の波及

4値運用への完全移行に伴い、S-14 単独ではなく以下にも影響：
- **S-04（案件詳細）**: タスク一覧セクションのステータス表示が4値化、確認者列が追加
- **S-10（タスク作成・編集モーダル）**: 確認者選択、resolved 遷移ボタン追加
- **S-12（通知）**: `task_resolved` / `task_reviewed` の通知行追加
- **`ApprovalService`**: 本部承認時の自動タスク（実装計画作成）に確認者初期値を設定
- **タスク進捗率の自動算出**: `closed_count / total_count` を `(closed_count + resolved_count * 0.5) / total_count` に変更検討（課題2 拡張時）

/**更新完了**/