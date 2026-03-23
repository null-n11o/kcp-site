# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

株式会社KCP のコーポレートサイト（ランディングページ + ブログ）。Astro SSG + Tailwind CSS で構築し、Cloudflare Pages にデプロイする。バックエンドなし・CMS なし・Static Site Generation のみ。

## Commands

```bash
npm run dev        # 開発サーバー起動
npm run build      # 本番ビルド（出力: dist/）
npm run preview    # ビルド結果をローカルでプレビュー
npm run test       # Vitest でユニットテストを実行（1回のみ）
npm run test:watch # Vitest をウォッチモードで実行
```

単一ファイルのテスト実行:

```bash
npx vitest run src/utils/blog.test.ts
```

## Key Patterns

**スタイル読み込み順:** `tailwind({ applyBaseStyles: false })` を使用。Tailwind のベーススタイルは Astro が自動注入せず、`global.css` 内で明示的に `@tailwind base` を記述して順序を管理する。

**Vitest と astro:content:** `astro:content` は Astro のビルドパイプライン内にのみ存在する仮想モジュール。Vitest（Node 環境）では解決できないため、`src/__mocks__/astro-content.ts` にスタブを置き、`vitest.config.ts` の `alias` でマッピングしている。

**ToC（目次）生成:** Astro の `render()` が返す `headings` 配列を直接利用。追加ライブラリ不要。`rehype-slug` で見出しに ID を付与。

**ブログ記事の draft 管理:** フロントマターの `draft: true` で非公開管理。`getSortedPosts()` がビルド時にフィルタリングする。

**スクロールアニメーション:** `FadeIn.astro` の `<script>` ブロックに Intersection Observer をインライン実装。外部 JS バンドルなし。

**モバイルメニュー:** `Header.astro` の `<script>` ブロックにインライン実装。外部 JS ファイルなし。

## Blog Content

記事ファイルは `src/content/blog/*.md`。フロントマターの必須フィールド:

```yaml
---
title: "記事タイトル"
description: "説明文（OGP に使用）"
pubDate: 2026-03-23
tags: ["AI", "業務効率化"]
author: "中野 健太朗"
draft: false
featured: false
---
```

記事更新フロー: Obsidian で執筆 → `src/content/blog/` に保存 → `git push` → Cloudflare Pages が自動ビルド（約1〜2分）

## Deploy

- ホスティング: Cloudflare Pages（`npm run build`、出力ディレクトリ `dist/`）
- `output: 'static'`（ランタイムサーバーなし）
- サイト URL: `https://kcp.co.jp`（`astro.config.mjs` の `site` に設定済み）

## Testing

- `src/utils/` のピュアな関数は **Vitest でテスト必須**（TDD：テスト先行）
- Astro コンポーネント（`.astro`）はテスト対象外。手動確認で代替
- テストファイルは実装ファイルと同ディレクトリに配置（例: `blog.ts` → `blog.test.ts`）
- `astro:content` は Node 環境で解決できないため `src/__mocks__/astro-content.ts` のスタブを使用

## Task Workflow

各タスク開始時: `git checkout -b <branch-name>` で feature ブランチを作成。
各タスク完了時: `superpowers:task-completion-report` スキルに従い、
レビュー通過後に commit → push → `gh pr create`。
PR 作成後、ユーザーに「セッションを新しく開始してください」と伝えてから終了する。

**ブランチ命名規則:** `feat/<kebab-case-description>`
例: `feat/project-scaffolding`、`feat/hero-section`、`feat/blog-post-card`

## Phase 1 Scope

含まない（意図的に除外）: CMS、バックエンド、認証、データベース、GA4、Playwright E2E テスト、MDX、お問い合わせフォームのバックエンド実装（Google Forms 外部リンクで代替）。
