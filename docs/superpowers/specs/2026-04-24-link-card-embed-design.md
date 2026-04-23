# リンクカード埋め込み設計書

## 概要

ブログ記事の Markdown 内で URL を単独行に書いたとき、自動的にカード表示へ変換する remark プラグインを実装する。対象は内部ブログ記事リンクと外部リンクの2種類。

---

## アーキテクチャ・データフロー

### 新規ファイル

| パス | 役割 |
|---|---|
| `src/plugins/remark-link-card.ts` | remark プラグイン本体 |
| `src/plugins/remark-link-card.test.ts` | Vitest ユニットテスト |
| `src/data/ogp-cache.json` | 外部OGP取得結果のキャッシュ（git管理・ビルド間で永続化） |

### 処理の流れ

```
Markdownファイル
  └─ remark-link-card プラグイン起動
       └─ paragraph ノードで子がリンク1つだけ、かつリンクのテキスト内容がURLと一致（bare URL）→ 対象URL
          ※ [テキスト](url) 形式の通常リンクは変換しない
            ├─ kcp.co.jp/blog/* → filesystem から frontmatter 読み取り → 内部カードHTML
            └─ その他 → ogp-cache.json を確認
                         ├─ キャッシュあり → 外部カードHTML
                         └─ キャッシュなし → OGP fetch → cache更新 → 外部カードHTML
```

### `astro.config.mjs` への変更

```js
import remarkLinkCard from './src/plugins/remark-link-card.ts';

markdown: {
  remarkPlugins: [remarkLinkCard],
  // 既存の rehypePlugins はそのまま
}
```

---

## カードのHTML構造

既存の `PostCard.astro` のスタイルに揃える。ブログ本文は `prose` 配下のため、`not-prose` でリセットする。

### 内部カード（ラベル: 株式会社KCP Blog）

```html
<a href="/blog/{slug}"
   class="not-prose block group relative flex flex-col gap-3 p-6 rounded-xl border border-border bg-base-100 hover:border-accent/40 transition-all duration-300 no-underline my-6">
  <div class="text-xs font-medium text-text-muted tracking-wide">株式会社KCP Blog</div>
  <div class="flex flex-wrap gap-2">
    <span class="inline-flex items-center rounded-full font-medium px-2.5 py-0.5 text-xs border border-accent/60 text-accent bg-transparent">{tag}</span>
  </div>
  <p class="font-bold text-text-primary group-hover:text-accent transition-colors text-xl m-0">{title}</p>
  <p class="text-text-secondary text-sm leading-relaxed line-clamp-3 m-0">{description}</p>
  <div class="flex items-center gap-3 text-xs text-text-muted mt-auto">
    <time datetime="{ISO日付}">{表示日付}</time>
    <span>·</span>
    <span>約{readMin}分</span>
  </div>
</a>
```

- タグは最大3件表示
- 読了時間は本文の文字数から計算（日本語: 400字/分、英語: 200 words/分）
- `href` はサイト内相対パス（`/blog/{slug}/`）

### 外部カード（ラベル: 参考資料）

```html
<a href="{url}" target="_blank" rel="noopener noreferrer"
   class="not-prose block group relative flex flex-col gap-3 p-6 rounded-xl border border-border bg-base-100 hover:border-accent/40 transition-all duration-300 no-underline my-6">
  <div class="text-xs font-medium text-text-muted tracking-wide">参考資料</div>
  <p class="font-bold text-text-primary group-hover:text-accent transition-colors text-xl m-0">{og:title または URL}</p>
  <p class="text-text-secondary text-sm leading-relaxed line-clamp-2 m-0">{og:description または 空文字}</p>
  <div class="text-xs text-text-muted">{ドメイン名}</div>
</a>
```

- OGP取得失敗時: `og:title` → URL、`og:description` → 空文字でフォールバック
- ドメイン名は `new URL(url).hostname` で取得

---

## OGP キャッシュ仕様

ファイル: `src/data/ogp-cache.json`

```json
{
  "https://example.com/article": {
    "title": "記事タイトル",
    "description": "説明文",
    "fetchedAt": "2026-04-24T00:00:00.000Z"
  }
}
```

- キャッシュヒット判定: URLがキーとして存在すること（有効期限なし）
- キャッシュ更新: プラグイン実行中にファイルを読み書き（同期処理）
- OGP取得: Node.js 組み込みの `fetch` を使用（追加パッケージ不要）
- `<meta property="og:title">` / `<meta property="og:description">` を正規表現で抽出

---

## 内部リンクのフロントマター取得

- URLパス `/blog/{slug}` → `src/content/blog/{slug}.md` を `gray-matter` で読み取り
- `gray-matter` は `npm install gray-matter` で明示的に追加する（Astroの間接依存として node_modules に存在するが、直接依存として宣言する）
- ファイルが見つからない場合 → 外部カードと同じフォールバック表示（"参考資料"ラベル）

---

## テスト方針

ファイル: `src/plugins/remark-link-card.test.ts`（Vitest）

| テストケース | 内容 |
|---|---|
| URL検出（肯定） | 段落がリンク1つのみ → カードHTMLに変換される |
| URL検出（否定） | 文中にURLが混じる段落 → 変換されない |
| 内部URL判定 | `kcp.co.jp/blog/*` → 内部カード |
| 外部URL判定 | それ以外 → 外部カード |
| 内部・ファイルなし | `src/content/blog/xxx.md` が存在しない → "参考資料"フォールバック |
| OGPキャッシュヒット | キャッシュにURLあり → fetch不使用でカード生成 |
| OGPキャッシュミス | キャッシュになし → fetch呼び出し → キャッシュ更新 |
| OGP取得失敗 | fetchがエラー → URLのみのフォールバックカード |

カードの見た目は `npm run dev` で手動確認。Astroパイプライン統合も手動確認。

---

## スコープ外

- Twitter / YouTube 埋め込み（既に手動対応済み）
- OGPキャッシュの有効期限・自動更新
- og:image の表示
- 英語版ブログ（`/en/blog/*`）の内部リンク（初期実装では対応しない）
