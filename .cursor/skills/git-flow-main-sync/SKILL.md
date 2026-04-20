---
name: git-flow-main-sync
description: Execute a repeatable personal-development Git workflow: create a branch, commit and push changes, merge into main, and push main. Use when the user asks for branch creation, commit, push, merge to main, and final push in one sequence.
---

# Git Flow Main Sync

## Purpose

個人開発向けに、次の一連操作を安全に実行する。

1. 作業ブランチ作成
2. 変更コミット
3. 作業ブランチ push
4. `main` へマージ
5. `main` を push

## Defaults

- ベースブランチ: `main`
- リモート: `github`
- マージ方式: `--no-ff`
- コミット対象: ユーザー指定ファイル優先（未指定なら変更内容を確認して判断）

## Workflow

### 1) 事前確認

- `git status --short --branch` で作業状態を確認
- `git log -5 --oneline` でコミットメッセージ形式を確認
- 予期しない差分（大量削除や無関係ファイル変更）があれば、実行前にユーザー確認

### 2) 作業ブランチ作成

- `main` からブランチを作る
- ブランチ名は `type/topic` 形式（例: `docs/er-diagram-update`）

### 3) コミット

- 対象ファイルのみ `git add`
- 1-2文の理由中心メッセージで `git commit`
- 失敗時はエラー内容を修正して再コミット

### 4) 作業ブランチ push

- `git push -u <remote> HEAD`
- 追跡ブランチが設定されたことを確認

### 5) main マージと push

- `git checkout main`
- `git merge --no-ff <work-branch>`
- `git push <remote> main`
- `git status --short --branch` で同期状態を確認

## Report Format

結果報告は簡潔に次を含める。

- 作成ブランチ名
- 作成したコミット（SHAと件名）
- マージコミット（SHA）
- 最終同期状態（`main...<remote>/main`）

## Safety Rules

- 破壊的コマンド（`reset --hard` など）は使わない
- ユーザー未指定の無関係変更は勝手に含めない
- リモート名やベースブランチが既定と異なる場合はユーザー指定を優先
