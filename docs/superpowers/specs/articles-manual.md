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

---

## メディア埋め込み

Markdown ファイル内に直接 HTML を貼り付けることで埋め込みができます。インデントなしで記述してください。

### YouTube

1. YouTube の動画ページで「**共有**」→「**埋め込む**」をクリック
2. 表示された `<iframe>` コードをコピー
3. Markdown 内の埋め込みたい位置に、前後に空行を入れて貼り付け

```html
<iframe width="560" height="315"
  src="https://www.youtube.com/embed/VIDEO_ID"
  title="YouTube video player"
  frameborder="0"
  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
  referrerpolicy="strict-origin-when-cross-origin"
  allowfullscreen>
</iframe>
```

> **注意:** YouTube のデフォルト埋め込みコードは `www.youtube.com` ですが、プライバシーを重視する場合は `www.youtube-nocookie.com` に書き換えると、クリック前のトラッキングを防げます。

---

### Twitter（X）

1. 埋め込みたいポストの「**···**」メニュー →「**ポストを埋め込む**」をクリック
2. 表示されたコード（`<blockquote>` ＋ `<script>`）をコピー
3. Markdown 内の埋め込みたい位置に、前後に空行を入れて貼り付け

```html
<blockquote class="twitter-tweet">
  <p lang="ja" dir="ltr">ポストの本文...</p>
  &mdash; 名前 (@handle)
  <a href="https://twitter.com/handle/status/TWEET_ID">日付</a>
</blockquote>
<script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>
```

> **注意:** 1記事に複数のツイートを埋め込む場合、`<script>` タグは記事の末尾に1回だけ書けばすべてのカードが表示されます。`<blockquote>` は必要な数だけ貼り付けてください。
