# Press Section Design

**Date:** 2026-04-12
**Status:** Approved

## Overview

プレスリリース（公告・サービスリリース・資本提携など）を掲載する `/press` セクションを追加する。
blog と完全分離した独立ディレクトリ構成。日本語のみ。

## Content Schema

`src/content/press/` に Markdown ファイルを置く。

```yaml
---
title: "プレスリリースタイトル"
description: "概要（OGP 用、max 200文字）"
pubDate: 2026-04-12
category: "サービスリリース"  # 公告 / サービスリリース / 資本提携 など自由記述文字列
draft: false
---
```

`src/content/config.ts` に `pressCollection` を追加して `collections` に登録。

blog との差分:
- `tags`（配列）→ `category`（単一文字列）
- `author` / `featured` / `faq` / `ogImage` は除外

## Pages

| URL | ファイル | 説明 |
|-----|---------|------|
| `/press/` | `src/pages/press/index.astro` | 一覧ページ |
| `/press/[slug]/` | `src/pages/press/[slug].astro` | 詳細ページ |

## Components

### `src/components/press/PressCard.astro`

`PostCard` に準拠したカードコンポーネント。差分:
- 読了時間の代わりに `category` バッジを表示
- href は `/press/<slug>/`

### `src/layouts/PressLayout.astro`

`BlogLayout` に準拠したレイアウト。差分:
- サイドバー（ToC）なし
- breadcrumbs は `ホーム > プレスリリース > タイトル`
- 「← プレスリリース一覧へ戻る」ボタン

## Utilities

`src/utils/press.ts`:
- `getSortedPressReleases(posts)` — draft フィルタ + pubDate 降順ソート

## Navigation

- **Header:** 変更なし（press は日本語のみのため i18n nav に追加しない）
- **Footer:** `/press/` リンクを追加

## Sample Content (テストページ)

- `src/content/press/kcp-launch.md` — 会社設立公告
- `src/content/press/ai-service-release.md` — サービスリリース（ダミー）

## Out of Scope

- 英語版（`press_en`）
- カテゴリフィルタリング
- RSS フィード（既存の blog RSS とは別）
- OG 画像の個別設定
