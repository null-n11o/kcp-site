# ブレインストーミング: KCP サイト 次フェーズ候補

> **作成日:** 2026-04-04  
> **現状:** Phase 1（コーポレートサイト）+ Phase 2（SEO/AIO/LLMO 対策）完了  
> **目的:** 次に取り組むべき施策を洗い出し、優先順位を整理する

---

## 候補一覧（インパクト × 実装コスト マトリクス）

| # | 施策 | インパクト | コスト | 優先度 |
|---|------|-----------|--------|--------|
| A | OGP 画像の自動生成（Satori） | 高 | 中 | ★★★ |
| B | Pagefind 全文検索 | 中 | 低 | ★★★ |
| C | ブログ記事 SEO 強化（Life Optimizer 移植 + 新規記事） | 高 | 低 | ★★★ |
| D | 実績/ポートフォリオセクション | 高 | 低 | ★★ |
| E | Cloudflare Web Analytics 埋め込み | 低 | 低 | ★★ |
| F | Giscus コメント機能 | 低 | 低 | ★ |
| G | ニュースレター連携（Buttondown） | 中 | 中 | ★ |

---

## 候補 A: OGP 画像の自動生成（Satori + Resvg）

### 概要
ブログ記事ごとに OGP 画像（1200×630px）を Astro ビルド時に自動生成する。  
現在は OGP `og:image` に共通の fallback 画像か未設定の状態。SNS シェア時に記事タイトルが画像として表示されることで CTR が向上する。

### 実装方針
- `@resvg/resvg-js` + `satori` で JSX → SVG → PNG 変換
- `src/pages/og/[slug].png.ts` 静的エンドポイントで各記事の PNG を生成
- `BaseLayout.astro` の `og:image` に `/og/${slug}.png` を注入
- フォント: Noto Sans JP を base64 埋め込み（Google Fonts から取得）

### デザイン仕様（案）
- 背景: `#1a1a2e`（Base-200）
- タイトル: 最大 2 行、白テキスト
- サイト名 + ロゴ: 右下に `株式会社KCP`
- タグ: アクセントカラー（`#4a9eff`）のバッジ

### ファイル変更
- Create: `src/pages/og/[slug].png.ts`
- Create: `src/utils/og-image.ts`（Satori JSX テンプレート）
- Create: `src/utils/og-image.test.ts`
- Modify: `src/layouts/BlogLayout.astro`（og:image を動的 URL に変更）
- Modify: `package.json`（satori, @resvg/resvg-js を追加）

### 参考実装
Astro 公式ドキュメント: `@astrojs/og` または手動 Satori 統合

---

## 候補 B: Pagefind 全文検索

### 概要
静的サイト向けの全文検索ライブラリ `pagefind` を導入。  
ビルド後の HTML を自動インデックスし、クライアントサイドで検索を実現。  
記事が増えるほど価値が高まる。

### 実装方針
- `npm run build` 後に `npx pagefind --site dist` でインデックス生成
- `package.json` の `build` スクリプトに `&& npx pagefind --site dist` を追加
- `src/components/blog/SearchBox.astro` にデフォルト UI を組み込む
- ブログ一覧ページ（`/blog/`）の上部に検索ボックスを配置

### ファイル変更
- Modify: `package.json`（`"build": "astro build && pagefind --site dist"`）
- Create: `src/components/blog/SearchBox.astro`
- Modify: `src/pages/blog/index.astro`（SearchBox 追加）

### 注意点
- `dist/pagefind/` ディレクトリが生成される（`.gitignore` 対象外にすること）
- Cloudflare Pages でのビルドコマンドも更新が必要

---

## 候補 C: ブログ記事 SEO 強化（記事追加）

### 概要
KCP の主要サービス（SNS 運用代行、AI 研修、受託開発）に関連する SEO キーワードで記事を追加。  
現在の記事は 2 本のみで、オーガニック流入源として弱い。

### 優先キーワード案（検索ボリューム × KCP 関連性）
1. `AI 業務効率化 中小企業` — メイン訴求
2. `SNS 運用代行 料金` — サービス直結
3. `ChatGPT 業務活用 事例` — トレンドキーワード
4. `AIエージェント BPO` — ニッチ・先行者優位
5. `Astro ブログ 作り方` — テック系（KCP の開発力をアピール）

### 1記事の構成テンプレート
```markdown
---
title: "..."
description: "..."
pubDate: YYYY-MM-DD
tags: ["AI", "業務効率化"]
author: "中野 健太朗"
draft: false
featured: false
faq:
  - q: "..."
    a: "..."
---
```

### ファイル変更
- Create: `src/content/blog/*.md`（5〜10 本追加）

---

## 候補 D: 実績/ポートフォリオセクション

### 概要
コーポレートページに「実績・事例」セクションを追加。  
現在は Service・Strength セクションのみで、具体的な実績がない。  
案件先や紹介経由クライアントへの信頼性向上に直結する。

### 表示コンテンツ案
- 案件カード: クライアント業種、支援内容、成果（数値化できるもの）
- 守秘義務に配慮: 実名不要。「DIY 業界 / SNS 運用代行 / フォロワー +XX%」など匿名表記

### ファイル変更
- Create: `src/components/sections/Works.astro`
- Create: `src/content/works/` コレクション（Markdown または `src/data/works.ts` でデータ管理）
- Modify: `src/pages/index.astro`（Works セクション追加）
- Modify: `src/components/layout/Header.astro`（ナビに `Works` 追加）

### 判断条件
公開できる案件実績が 1 件以上存在する場合に実装する。

---

## 候補 E: Cloudflare Web Analytics 埋め込み

### 概要
Cloudflare Web Analytics（無料）のスクリプトを埋め込む。  
プライバシー配慮型（Cookie なし、IP 匿名化）で、GDPR/Cookie バナー不要。

### 実装方針
- Cloudflare ダッシュボードでサイトを登録 → ビーコン JS スニペットを取得
- `src/layouts/BaseLayout.astro` の `</body>` 直前に `<script>` タグを追加
- ビルド済みサイトへの影響: ほぼゼロ（外部スクリプト 1 本のみ）

### ファイル変更
- Modify: `src/layouts/BaseLayout.astro`（Analytics スクリプト追加）

---

## 候補 F: Giscus コメント機能

### 概要
GitHub Discussions ベースのコメントシステム。バックエンド不要・無料。  
ブログ記事ページにコメント欄を追加。

### 注意点
- コメント投稿に GitHub アカウントが必要 → ターゲット読者（テック系）には問題ないが、一般向けには高い
- Phase 5 以降に検討。現状の記事数では優先度低

---

## 候補 G: ニュースレター連携（Buttondown）

### 概要
Buttondown の購読フォームをブログ記事末尾に設置。  
リピーター読者を獲得し、新記事公開時にメール配信する。

### 注意点
- Buttondown 無料プランは最大 100 購読者
- フォーム埋め込みは `<iframe>` または外部リンク方式
- 購読者が増えてから設置でも遅くない

---

## 推奨実装順序

```
優先度 1 → 候補 B: Pagefind 全文検索（低コスト・即効性）
優先度 2 → 候補 C: ブログ記事追加（SEO 資産蓄積）
優先度 3 → 候補 A: OGP 画像自動生成（SNS 流入強化）
優先度 4 → 候補 D: 実績セクション（案件実績ができたタイミング）
優先度 5 → 候補 E: Cloudflare Analytics（随時）
後回し   → 候補 F, G
```

---

## 次のアクション

このブレインストーミング文書をもとに、ユーザーが優先する施策を選択し、  
`docs/superpowers/plans/YYYY-MM-DD-<施策名>.md` として詳細な実装プランを作成する。
