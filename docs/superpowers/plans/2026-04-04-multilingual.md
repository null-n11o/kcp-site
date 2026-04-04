# 多言語対応（英語）Implementation Plan

> **For agentic workers:** Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** KCP コーポレートサイトに Astro 4.x i18n を導入し、英語版ランディングページ・英語ブログを追加する。日本語は `/`（プレフィックスなし）、英語は `/en/` に配置。

**Architecture:**
- Astro i18n 組み込みルーティング（`prefixDefaultLocale: false`）
- 翻訳辞書を `src/i18n/` に集約（型安全な `useTranslations(locale)` ユーティリティ）
- セクションコンポーネントを props 駆動化（テキストをコンポーネント外に外出し）
- 英語ブログは `blog_en` コレクションで分離管理
- Header に言語切替 UI を追加
- BaseLayout で動的 `lang` 属性・`og:locale`・hreflang を出力

**Tech Stack:** Astro 4.x（i18n routing、Content Collections）, TypeScript strict, Tailwind CSS

**Spec:** `docs/superpowers/specs/kcp-corporate-site-prd.md` § Phase 3

---

## File Map

| ファイル | 種別 | 役割 |
|---------|------|------|
| `astro.config.mjs` | 更新 | i18n ルーティング設定を追加 |
| `src/i18n/index.ts` | 新規 | `useTranslations(locale)` エクスポート |
| `src/i18n/types.ts` | 新規 | `Translations` 型定義 |
| `src/i18n/ja.ts` | 新規 | 日本語翻訳辞書 |
| `src/i18n/en.ts` | 新規 | 英語翻訳辞書 |
| `src/content/config.ts` | 更新 | `blog_en` コレクション追加 |
| `src/content/blog_en/*.md` | 新規 | 英語ブログ記事（サンプル2件） |
| `src/layouts/BaseLayout.astro` | 更新 | 動的 lang/og:locale/hreflang |
| `src/layouts/PageLayout.astro` | 更新 | locale prop を Header/Footer へ渡す |
| `src/components/layout/Header.astro` | 更新 | locale prop + 言語切替 UI |
| `src/components/layout/Footer.astro` | 更新 | locale prop |
| `src/components/layout/LangSwitch.astro` | 新規 | 言語切替コンポーネント |
| `src/components/sections/Hero.astro` | 更新 | コンテンツ props 化 |
| `src/components/sections/Service.astro` | 更新 | コンテンツ props 化 |
| `src/components/sections/MVV.astro` | 更新 | コンテンツ props 化 |
| `src/components/sections/Strength.astro` | 更新 | コンテンツ props 化 |
| `src/components/sections/BlogPreview.astro` | 更新 | posts props 化（コレクション名非固定化） |
| `src/components/sections/Company.astro` | 更新 | コンテンツ props 化 |
| `src/components/sections/Contact.astro` | 更新 | コンテンツ props 化 |
| `src/pages/index.astro` | 更新 | 日本語翻訳を渡す |
| `src/pages/en/index.astro` | 新規 | 英語ホームページ |
| `src/pages/en/blog/index.astro` | 新規 | 英語ブログ一覧 |
| `src/pages/en/blog/[slug].astro` | 新規 | 英語ブログ記事ページ |

---

## Task 1: Astro i18n 設定

**Files:** `astro.config.mjs`

- [x] **Step 1:** `i18n` オプションを追加（defaultLocale: 'ja', locales: ['ja','en'], prefixDefaultLocale: false）

---

## Task 2: 翻訳辞書

**Files:** `src/i18n/types.ts`, `src/i18n/ja.ts`, `src/i18n/en.ts`, `src/i18n/index.ts`

- [x] **Step 1:** `Translations` 型定義（nav, footer, hero, service, mvv, strength, blog, company, contact）
- [x] **Step 2:** 日本語翻訳辞書（既存コンポーネントから文字列を抽出）
- [x] **Step 3:** 英語翻訳辞書
- [x] **Step 4:** `useTranslations(locale)` ユーティリティ関数

---

## Task 3: BaseLayout 更新

**Files:** `src/layouts/BaseLayout.astro`

- [x] **Step 1:** `locale` prop 追加（`Astro.currentLocale ?? 'ja'` をデフォルト）
- [x] **Step 2:** `<html lang={locale}>` に変更
- [x] **Step 3:** `og:locale` を動的化（ja → `ja_JP`, en → `en_US`）
- [x] **Step 4:** hreflang `<link>` タグを追加（alternates prop）

---

## Task 4: PageLayout 更新

**Files:** `src/layouts/PageLayout.astro`

- [x] **Step 1:** `locale` prop を追加し Header/Footer に渡す

---

## Task 5: Header / Footer 更新

**Files:** `src/components/layout/Header.astro`, `src/components/layout/Footer.astro`, `src/components/layout/LangSwitch.astro`

- [x] **Step 1:** `LangSwitch.astro` 新規作成（現在のパスから対応言語URLを生成）
- [x] **Step 2:** `Header.astro` に `locale` prop 追加・nav リンクを locale-aware に・LangSwitch を組み込む
- [x] **Step 3:** `Footer.astro` に `locale` prop 追加

---

## Task 6: セクションコンポーネント props 化

**Files:** 各セクションコンポーネント

- [x] **Step 1:** `Hero.astro` - headline/subtext/CTAs を props 化
- [x] **Step 2:** `Service.astro` - services 配列・heading を props 化
- [x] **Step 3:** `MVV.astro` - mission/vision/values を props 化
- [x] **Step 4:** `Strength.astro` - strengths 配列・heading/subtitle を props 化
- [x] **Step 5:** `BlogPreview.astro` - posts を props 化・UI 文字列 props 化
- [x] **Step 6:** `Company.astro` - companyInfo 配列・heading を props 化
- [x] **Step 7:** `Contact.astro` - heading/subtext/btnLabel を props 化

---

## Task 7: 日本語ホームページ更新

**Files:** `src/pages/index.astro`

- [x] **Step 1:** `ja` 翻訳を import し、各セクションへ props として渡す

---

## Task 8: 英語コンテンツコレクション

**Files:** `src/content/config.ts`, `src/content/blog_en/*.md`

- [x] **Step 1:** `blog_en` コレクションを `config.ts` に追加
- [x] **Step 2:** 英語サンプル記事 2 件を作成

---

## Task 9: 英語ページ作成

**Files:** `src/pages/en/index.astro`, `src/pages/en/blog/index.astro`, `src/pages/en/blog/[slug].astro`

- [x] **Step 1:** `src/pages/en/index.astro` — 英語ホームページ
- [x] **Step 2:** `src/pages/en/blog/index.astro` — 英語ブログ一覧
- [x] **Step 3:** `src/pages/en/blog/[slug].astro` — 英語記事ページ

---

## Task 10: ビルド確認・コミット

- [x] **Step 1:** `npm run build` でエラーなし確認
- [x] **Step 2:** コミット + プッシュ
