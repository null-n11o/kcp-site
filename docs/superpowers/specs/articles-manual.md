# 記事執筆マニュアル

## 記事ファイルの配置

`src/content/blog/*.md` に Markdown ファイルを作成。

## フロントマター（必須）

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

| フィールド | 説明 |
|---|---|
| `title` | 記事タイトル |
| `description` | OGP（SNSシェア時）に使われる説明文 |
| `pubDate` | 公開日（`YYYY-MM-DD` 形式） |
| `tags` | タグの配列 |
| `author` | 著者名 |
| `draft` | `true` にすると非公開（ビルド時に除外される） |
| `featured` | `true` にすると注目記事として扱われる |

## 執筆・公開フロー

1. **Obsidian で執筆**
2. `src/content/blog/` に `.md` ファイルを保存
3. `git push`
4. **Cloudflare Pages が自動ビルド**（約1〜2分で反映）

## 下書き管理

`draft: true` にすることで公開を保留できます。`git push` しても本番サイトには表示されません。
