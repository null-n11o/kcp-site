# X（Twitter）ポスト引用カード埋め込み — 設計書

- 日付: 2026-07-11
- 対象: ブログ本文に X の投稿 URL を1行で貼ると、引用ポスト風の静的カードに変換する機能

## 背景・目的

ブログ本文に X（旧 Twitter）の投稿 URL を貼ったとき、WordPress 等で見られる「引用ポスト風カード」として表示したい。

現状、標準URLを貼るとカード化する remark プラグイン（`src/plugins/remark-link-card.ts`）が既に稼働しているが、X の URL は「外部リンクカード（OGP取得）」の分岐に入る。X は OGP スクレイピングを強くブロックするため、まともなカードにならない。そこで X 専用の分岐を追加する。

## 採用方針

astro-embed（`@astro-community/astro-embed-twitter`）と**同じ仕組み**を、このサイトの構成（`.md` + remark プラグイン、MDX非対応）に合わせて自前で実装する。

- データ取得元: `https://publish.twitter.com/oembed?url=<tweet-url>&omit_script=true&dnt=true`
  - 2026-07-11 時点で公開ツイートに対し HTTP 200 で動作確認済み。
  - 返却例: `{ url, author_name, author_url, html }`。`html` は `<blockquote class="twitter-tweet">…本文…&mdash; 名前 (@handle) <a href="…">日付</a></blockquote>`。
- **ビルド時に静的HTML化**し、`widgets.js` は読み込まない（外部JSゼロ・トラッキングなし）。このサイトの「外部JSバンドルなし・静的」方針と一致。
- 取得できるのは本文・アカウント名・@handle・日付・Xへのリンクまで。**アバター画像やツイート内の写真は含まれない**（それは widgets.js のハイドレーションでのみ描画される部分）。見た目は astro-embed 標準の「シンプルな引用ボックス」とする。

### なぜ astro-embed のコンポーネントを直接使わないか

`@astro-community/astro-embed-twitter` の `<Tweet>` は Astro/MDX コンポーネント前提。本サイトのブログは `.md` + remark プラグイン構成で、MDX は Phase 1 対象外（`CLAUDE.md`）。そのため astro-embed の**アプローチとデータ取得元は踏襲**しつつ、レンダリング経路は既存の remark プラグイン拡張とする。

## アーキテクチャ

`src/plugins/remark-link-card.ts` に X 用の分岐を1本追加する。既存の内部カード／外部カードのロジックには手を入れない。

### 追加するピュア関数

| 関数 | シグネチャ | 役割 |
|---|---|---|
| `isTwitterStatusUrl` | `(url: string): boolean` | `twitter.com` / `x.com` / `mobile.twitter.com`（`www.` 有無問わず）の `/<user>/status/<数字>` を判定。それ以外（プロフィール、ハッシュタグ検索、非X）は `false`。クエリ文字列・末尾スラッシュは許容。パース不能な文字列は `false`。 |
| `buildTweetCard` | `(oembed: TweetOembedData): string` | oembed の `html`（blockquote）を `not-prose` + `my-6` のコンテナ `<div>` で包んだHTML文字列を返す。blockquote はそのまま埋め込む。 |

### 追加する I/O 関数（テストではモック）

| 関数 | シグネチャ | 役割 |
|---|---|---|
| `fetchTweetOembed` | `(url: string): Promise<TweetOembedData \| null>` | oembed エンドポイントを叩く（`AbortSignal.timeout(5000)`）。成功時 `{ html, authorName, authorUrl, fetchedAt }`、失敗時（非200・ネットワーク・タイムアウト・JSON不正）は `null`。 |
| `getTweet` | `(url: string, cachePath?: string): Promise<TweetOembedData \| null>` | `getOgp` と同型。キャッシュ優先。キャッシュミス時のみ `fetchTweetOembed` を呼び、成功時のみキャッシュに書き込む（`null` はキャッシュしない）。 |

### 型

```ts
export interface TweetOembedData {
  html: string;        // oembed が返す blockquote HTML（omit_script 済み）
  authorName: string;  // oembed.author_name
  authorUrl: string;   // oembed.author_url
  fetchedAt: string;   // ISO 文字列
}
```

### キャッシュ

- 新規ファイル `src/data/tweet-cache.json`。形状は `Record<tweetUrl, TweetOembedData>`。
- read/write は既存の `readOgpCache` / `writeOgpCache` と同じパターンの `readTweetCache` / `writeTweetCache` を追加（または汎用化）。データ形状が OGP（`{title, description, fetchedAt}`）と異なるため、キャッシュファイルは分離する。

### プラグイン本体のフロー変更

`remarkLinkCard` の `visit` ループ内、URL 分岐で **X 判定を最優先**に置く（内部ブログ判定・外部OGP判定の手前）:

```
if (isTwitterStatusUrl(url)) {
  const tweet = await getTweet(url, tweetCachePath);
  html = tweet ? buildTweetCard(tweet) : buildExternalCard(url, await getOgp(url, cachePath));
} else if (isInternalBlogUrl(url)) {
  …既存のまま…
} else {
  …既存のまま…
}
```

`tweetCachePath` は `options.tweetCachePath ?? path.join(process.cwd(), 'src/data/tweet-cache.json')` としてオプション化（テストで差し替え可能に）。

### フォールバック

`getTweet` が `null` を返す場合（削除済みツイート・非公開・取得失敗）は、既存の `buildExternalCard` にフォールバックする。ページビルドは失敗させない。

## スタイル

本サイトは**ダークテーマ**（背景 `#0a0a0a` / 文字 `#f0f0f0`、`tailwind.config.mjs` 参照）。astro-embed の `Tweet.css` はライト前提（ボーダー `#cfd9de`）なので、そのままでは合わない。ダークテーマ用に調整したスタイルを `src/styles/global.css` に追加する。

- セレクタ: `.twitter-tweet:not(.twitter-tweet-rendered)`（widgets.js を読み込まないため常にこの状態）。
- ボーダー: `border` トークン（`#2a2a3e`）、背景: `base.100`（`#141414`）、角丸・パディングは既存カード（`buildExternalCard` の `rounded-xl p-6`）とトーンを合わせる。
- 本文テキスト: `text-primary`（`#f0f0f0`）、`&mdash; 名前 (@handle) 日付` のリンク: `accent`（`#4a9eff`）。
- 幅: oembed の推奨 `width:550` に引きずられないよう、コンテナ側で `max-width` を prose 幅に収める。
- コンテナ `<div>` は `not-prose` を付与し、prose スタイルの干渉を防ぐ。

具体的な数値・クラスは実装時に既存カードと並べて微調整する。

## セキュリティ

oembed が返す `html` を `type: 'html'` ノードとしてそのまま埋め込む（astro-embed の `set:html` と同じ挙動）。取得元は `publish.twitter.com` 固定で信頼できるソースのため許容する。ユーザー入力由来の URL 部分（`buildExternalCard` フォールバック時）は既存同様 `escapeHtml` を通す。

## テスト（Vitest・`src/plugins/remark-link-card.test.ts` に追記）

CLAUDE.md 準拠でピュア関数はテスト必須。TDD（テスト先行）で進める。

- `isTwitterStatusUrl`
  - `true`: `https://twitter.com/jack/status/20`、`https://x.com/jack/status/20`、`https://mobile.twitter.com/jack/status/20`、`https://www.x.com/jack/status/20`、クエリ付き `…/status/20?s=20`、末尾スラッシュ `…/status/20/`。
  - `false`: `https://x.com/jack`（プロフィール）、`https://x.com/search?q=a`、`https://example.com/jack/status/20`（非X）、`not-a-url`、`https://x.com/jack/status/abc`（数字でない）。
- `buildTweetCard`
  - blockquote HTML が `not-prose` コンテナに包まれて含まれること。
  - 期待するコンテナクラス（`not-prose` / `my-6`）が付くこと。
- `getTweet`
  - キャッシュヒット時に `fetchTweetOembed` を呼ばないこと（`vi.mock`／スパイ）。
  - キャッシュミス時に取得しキャッシュへ書き込むこと。
  - `fetchTweetOembed` が `null` を返す場合はキャッシュに書き込まないこと。
- `readTweetCache` / `writeTweetCache`: ラウンドトリップ（既存 OGP キャッシュテストと同型）。
- プラグイン統合（既存の統合テストがあれば拡張）: X URL 段落が tweet カードHTMLに置換されること。`fetchTweetOembed` はモックし実ネットワークを叩かない。

## スコープ外（YAGNI）

- アバター画像・ツイート内メディア画像の表示（oembed で取得不可。widgets.js が必要になり方針に反する）。
- ライト／ダークのテーマ切り替え対応（サイトはダーク固定）。
- スレッド（連続ツイート）の一括表示。
- X 以外の SNS（Instagram, Bluesky 等）への横展開。

## 動作確認（手動）

1. 適当なブログ記事に公開ツイートの URL を1行で貼る → `npm run dev` でカード表示を確認。
2. 存在しない／削除済みツイート URL → 外部リンクカードにフォールバックしビルドが通ることを確認。
3. `npm run build` で `src/data/tweet-cache.json` が生成・更新されることを確認。
