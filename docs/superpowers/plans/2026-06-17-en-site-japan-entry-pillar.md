# 英語版サイト再設計（日本進出支援を柱とする構成）Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 英語版トップを「日本進出支援(Japan Entry Support)を唯一の柱とし、他サービスを内包表示」する構成に再設計し、不要 EN ページの削除と言語切替の404フォールバックを実装する。

**Architecture:** EN トップ専用の新コンポーネント `ServicePillar.astro` を追加して柱レイアウトを描画。i18n データ（`en.ts`）の Hero 文言を日本語版ブランドタグラインに統一し、内包能力データを新規追加。`LangSwitch` を「明示プロップ＋相手言語ホームへのフォールバック」方式に変更し、`PageLayout`→`Header`→`LangSwitch` でプロップを伝播する。

**Tech Stack:** Astro (SSG) / TypeScript / Tailwind CSS

## Global Constraints

- 画像は `<img>` ではなく `<Image>`（`astro:assets`）を使う。本プランでは画像追加なし。
- `.astro` コンポーネントはユニットテスト対象外。検証は `npm run build` の成功＋手動確認。
- 日本語版（`src/pages/index.astro` ほか）のサービス構成・文言は変更しない。
- 配色トークンは既存に合わせる：背景 `#0e0e0e`/`#111`/`#0a0a0a`、ボーダー `border-[#1e1e2e]`、アクセント `text-accent`。
- ブランチ: `feat/en-japan-entry-pillar`（main から分岐済み）。

---

### Task 1: i18n データと型の更新（Hero 文言・内包データ）

**Files:**
- Modify: `src/i18n/types.ts`（`ServicePillarContent` 型を追加）
- Modify: `src/i18n/en.ts`（`hero` 変更・`servicePillarEn` 追加）

**Interfaces:**
- Produces: `interface ServicePillarContent { title: string; tagline: string; description: string; capabilities: string[]; ctaLabel: string; ctaHref: string; }`（`src/i18n/types.ts` から export）
- Produces: `export const servicePillarEn: ServicePillarContent`（`src/i18n/en.ts` から export）

- [x] **Step 1: 型を追加**

`src/i18n/types.ts` の `ServiceItem` インターフェース定義の直後（`export interface ValueItem` の前）に追記:

```ts
export interface ServicePillarContent {
  title: string;
  tagline: string;
  description: string;
  capabilities: string[];
  ctaLabel: string;
  ctaHref: string;
}
```

- [x] **Step 2: en.ts の import に型を追加**

`src/i18n/en.ts` の1行目を次に置き換える:

```ts
import type { Translations, ServicePillarContent } from './types';
```

- [x] **Step 3: EN Hero の文言を変更**

`src/i18n/en.ts` の `hero` ブロックを次に置き換える:

```ts
  hero: {
    eyebrow: 'KCP Inc.',
    headlinePre: 'We Make',
    headlineAccent: 'Business',
    headlinePost: 'Simple.',
    subtext:
      "We're your dedicated local representative in Japan — handling business development, company setup, communications, and AI-powered operations under a single monthly retainer, so you can enter the Japanese market without building a team here.",
    primaryCta: 'Contact Us',
    secondaryCta: 'Our Services',
  },
```

- [x] **Step 4: servicePillarEn を追加**

`src/i18n/en.ts` の末尾、`export const en: Translations = { ... };` の閉じ括弧の**後**に追記:

```ts

export const servicePillarEn: ServicePillarContent = {
  title: 'Japan Entry Support',
  tagline: 'Your dedicated local representative in Japan.',
  description:
    "Entering Japan takes more than translation. We act as your on-the-ground partner — finding customers, representing you in negotiations, and running day-to-day operations. Everything you need to break into Japan, under one retainer.",
  capabilities: [
    'Business Development / Sales Representation',
    'Company Setup (registration, banking, permits)',
    'SNS & Communications',
    'AI & Development Support',
  ],
  ctaLabel: 'Learn more',
  ctaHref: '/en/services/japan-entry/',
};
```

- [x] **Step 5: ビルドで型エラーが無いことを確認**

Run: `npm run build`
Expected: 成功（exit 0）。型エラーなし。

- [x] **Step 6: Commit**

```bash
git add src/i18n/types.ts src/i18n/en.ts
git commit -m "feat: EN Hero文言を統一し日本進出支援の内包データを追加

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 2: ServicePillar コンポーネント作成と EN トップへの適用

**Files:**
- Create: `src/components/sections/ServicePillar.astro`
- Modify: `src/pages/en/index.astro`

**Interfaces:**
- Consumes: `servicePillarEn`（Task 1）, 既存 `SectionHeading.astro`, `FadeIn.astro`
- Produces: `ServicePillar.astro` の Props `{ heading: string; title: string; tagline: string; description: string; capabilities: string[]; ctaLabel: string; ctaHref: string; }`

- [x] **Step 1: ServicePillar.astro を作成**

`src/components/sections/ServicePillar.astro` を新規作成:

```astro
---
import SectionHeading from '@/components/ui/SectionHeading.astro';
import FadeIn from '@/components/ui/FadeIn.astro';

export interface Props {
  heading: string;
  title: string;
  tagline: string;
  description: string;
  capabilities: string[];
  ctaLabel: string;
  ctaHref: string;
}

const { heading, title, tagline, description, capabilities, ctaLabel, ctaHref } =
  Astro.props;
---

<section id="service" class="py-section" style="background-color: #0e0e0e;">
  <div class="section-wrapper">
    <FadeIn>
      <SectionHeading sectionNumber="02" sectionLabel={heading} />
    </FadeIn>

    <FadeIn>
      <h3 class="text-3xl sm:text-5xl font-black tracking-tight text-white mb-3">
        {title}
      </h3>
      <p class="text-accent text-sm font-medium mb-6">{tagline}</p>
      <p class="text-text-secondary text-sm leading-relaxed max-w-2xl mb-10">
        {description}
      </p>
    </FadeIn>

    <FadeIn delay={80}>
      <p class="font-mono text-xs text-text-muted tracking-[0.15em] uppercase mb-6">
        Everything entering Japan requires, under one retainer
      </p>
    </FadeIn>
    <div class="flex flex-col mb-10">
      {capabilities.map((cap, i) => (
        <FadeIn delay={120 + i * 60}>
          <div class="flex gap-4 items-start py-4 border-b border-[#1e1e2e]">
            <span class="text-accent shrink-0 font-bold text-sm pt-px">—</span>
            <p class="text-text-secondary text-sm leading-relaxed">{cap}</p>
          </div>
        </FadeIn>
      ))}
    </div>

    <FadeIn delay={120 + capabilities.length * 60}>
      <a
        href={ctaHref}
        class="inline-flex items-center gap-2 text-sm font-medium text-accent hover:underline"
      >
        {ctaLabel}
        <span aria-hidden="true">→</span>
      </a>
    </FadeIn>
  </div>
</section>
```

- [x] **Step 2: en/index.astro の import を差し替え**

`src/pages/en/index.astro` の import 行
`import Service from '@/components/sections/Service.astro';`
を次の2行に置き換える:

```ts
import ServicePillar from '@/components/sections/ServicePillar.astro';
import { servicePillarEn } from '@/i18n/en';
```

- [x] **Step 3: en/index.astro の Service 使用箇所を差し替え**

`src/pages/en/index.astro` の次のブロック:

```astro
  <Service
    heading={t.service.heading}
    subtitle={t.service.subtitle}
    items={t.service.items}
  />
```

を次に置き換える:

```astro
  <ServicePillar
    heading={t.service.heading}
    title={servicePillarEn.title}
    tagline={servicePillarEn.tagline}
    description={servicePillarEn.description}
    capabilities={servicePillarEn.capabilities}
    ctaLabel={servicePillarEn.ctaLabel}
    ctaHref={servicePillarEn.ctaHref}
  />
```

- [x] **Step 4: ビルド確認**

Run: `npm run build`
Expected: 成功（exit 0）。

- [x] **Step 5: 手動確認**

Run: `npm run dev` で `http://localhost:4321/en/` を開く。
Expected: Hero が "We Make Business Simple."、Service セクションが
「Japan Entry Support」の柱＋4つの内包能力リスト＋"Learn more →"
（リンク先 `/en/services/japan-entry/`）になっている。

- [x] **Step 6: Commit**

```bash
git add src/components/sections/ServicePillar.astro src/pages/en/index.astro
git commit -m "feat: EN トップを日本進出支援を柱とする構成に再設計

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 3: 不要な EN サービスページの削除

**Files:**
- Delete: `src/pages/en/services/ai-training.astro`
- Delete: `src/pages/en/services/sns.astro`

**Interfaces:**
- Consumes: なし
- Produces: なし（EN サービス詳細は `japan-entry.astro` のみ残る）

- [x] **Step 1: 2ファイルを削除**

```bash
rm src/pages/en/services/ai-training.astro src/pages/en/services/sns.astro
```

- [x] **Step 2: 参照が残っていないことを確認**

Run: `grep -rn "en/services/ai-training\|en/services/sns" src/`
Expected: 出力なし（en.ts や他ファイルからの参照が残っていない）。

- [x] **Step 3: ビルド確認**

Run: `npm run build`
Expected: 成功（exit 0）。`/en/services/ai-training/` `/en/services/sns/` が dist に生成されない。

- [x] **Step 4: Commit**

これらは未追跡ファイルのため、削除を反映するには明示 add する。

```bash
git add -A src/pages/en/services/
git commit -m "chore: 不要な EN サービスページ(ai-training/sns)を削除

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 4: LangSwitch のフォールバック実装とプロップ伝播

**Files:**
- Modify: `src/components/layout/LangSwitch.astro`
- Modify: `src/components/layout/Header.astro`
- Modify: `src/layouts/PageLayout.astro`

**Interfaces:**
- Produces: `LangSwitch` Props `{ locale: 'ja' | 'en'; label: string; localeSwitchHref?: string }`
- Produces: `Header` Props に `localeSwitchHref?: string` 追加
- Produces: `PageLayout` Props に `localeSwitchHref?: string` 追加

- [x] **Step 1: LangSwitch.astro を書き換え**

`src/components/layout/LangSwitch.astro` のフロントマター（`---` 間）を次に置き換える:

```astro
---
export interface Props {
  locale: 'ja' | 'en';
  label: string;
  localeSwitchHref?: string;
}

const { locale, label, localeSwitchHref } = Astro.props;

// 明示指定があればそれを使う。無ければ相手言語のホームへフォールバック
// （EN と JA でページが1:1対応しないため、存在しないページへの404を防ぐ）
const alternatePath =
  localeSwitchHref ?? (locale === 'ja' ? '/en/' : '/');
---
```

（`<a href={alternatePath} ...>` 以下のマークアップは変更しない。）

- [x] **Step 2: Header.astro に prop を追加して伝播**

`src/components/layout/Header.astro` の Props 定義を次に置き換える:

```ts
export interface Props {
  locale: 'ja' | 'en';
  t: Translations;
  localeSwitchHref?: string;
}

const { locale, t, localeSwitchHref } = Astro.props;
```

そして2箇所の `<LangSwitch locale={locale} label={t.langSwitch.label} />` を
**いずれも**次に置き換える（desktop nav 内・mobile menu 内の両方）:

```astro
        <LangSwitch locale={locale} label={t.langSwitch.label} localeSwitchHref={localeSwitchHref} />
```

- [x] **Step 3: PageLayout.astro に prop を追加して伝播**

`src/layouts/PageLayout.astro` の `Props` インターフェースに1行追加:

```ts
    alternates?: AlternateUrl[];
    localeSwitchHref?: string;
```

フロントマター末尾（`const t = useTranslations(locale);` の後）に追加:

```ts
const { localeSwitchHref } = props;
```

`<Header locale={locale} t={t} />` を次に置き換える:

```astro
  <Header locale={locale} t={t} localeSwitchHref={localeSwitchHref} />
```

- [x] **Step 4: ビルド確認**

Run: `npm run build`
Expected: 成功（exit 0）。

- [x] **Step 5: 手動確認（フォールバック）**

`npm run dev` で `http://localhost:4321/en/services/japan-entry/` を開き、
言語切替ボタンを押す。
Expected: 404 ではなく日本語ホーム `/` に遷移する。

- [x] **Step 6: Commit**

```bash
git add src/components/layout/LangSwitch.astro src/components/layout/Header.astro src/layouts/PageLayout.astro
git commit -m "feat: 言語切替を相手言語ホームへのフォールバック方式に変更

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 5: 1:1対応ページに localeSwitchHref を明示指定

**Files:**
- Modify: `src/pages/index.astro`
- Modify: `src/pages/en/index.astro`
- Modify: `src/pages/blog/index.astro`
- Modify: `src/pages/en/blog/index.astro`
- Modify: `src/pages/blog/[slug].astro`
- Modify: `src/pages/en/blog/[slug].astro`

**Interfaces:**
- Consumes: `PageLayout` の `localeSwitchHref` prop（Task 4）

- [x] **Step 1: 各ページの PageLayout 呼び出しに localeSwitchHref を追加**

各ファイルの `<PageLayout` 開きタグの属性に次を1行追加する:

| ファイル | 追加する属性 |
|---|---|
| `src/pages/index.astro` | `localeSwitchHref="/en/"` |
| `src/pages/en/index.astro` | `localeSwitchHref="/"` |
| `src/pages/blog/index.astro` | `localeSwitchHref="/en/blog/"` |
| `src/pages/en/blog/index.astro` | `localeSwitchHref="/blog/"` |
| `src/pages/blog/[slug].astro` | `localeSwitchHref="/en/blog/"` |
| `src/pages/en/blog/[slug].astro` | `localeSwitchHref="/blog/"` |

例（`src/pages/en/index.astro`）:

```astro
<PageLayout
  title="Home"
  description="..."
  localeSwitchHref="/"
  alternates={[
```

（ブログ個別記事は記事同士が1:1対応しないため、相手言語のブログ一覧を指定する。）

- [x] **Step 2: ビルド確認**

Run: `npm run build`
Expected: 成功（exit 0）。

- [x] **Step 3: 手動確認**

`npm run dev` で以下を確認:
- `/`（JA home）→ 言語切替 → `/en/`
- `/en/`（EN home）→ 言語切替 → `/`
- `/blog/` → `/en/blog/`、`/en/blog/` → `/blog/`
- 任意のブログ記事 → 相手言語のブログ一覧へ遷移（404 にならない）

- [x] **Step 4: Commit**

```bash
git add src/pages/index.astro src/pages/en/index.astro src/pages/blog/index.astro src/pages/en/blog/index.astro "src/pages/blog/[slug].astro" "src/pages/en/blog/[slug].astro"
git commit -m "feat: 1:1対応ページに言語切替リンクを明示指定

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 6: Service.astro のリンクラベルを prop 化（任意・軽微）

**Files:**
- Modify: `src/components/sections/Service.astro`

**Interfaces:**
- Produces: `Service` Props に `detailLabel?: string`（デフォルト `'詳しく見る →'`）追加

EN は Service.astro を使わなくなったため実害は消えているが、日本語固定文言を
prop 化して将来の流用に備える。JA トップは prop 省略でデフォルト動作のまま。

- [x] **Step 1: Props と分割代入を変更**

`src/components/sections/Service.astro` の Props 定義を次に置き換える:

```ts
export interface Props {
  heading: string;
  subtitle: string;
  items: ServiceItem[];
  detailLabel?: string;
}

const { heading, items, detailLabel = '詳しく見る →' } = Astro.props;
```

- [x] **Step 2: リンク文言を変数に差し替え**

`src/components/sections/Service.astro` の
`詳しく見る →`（`<a>` タグ内のテキスト）を `{detailLabel}` に置き換える。

- [x] **Step 3: ビルド確認**

Run: `npm run build`
Expected: 成功（exit 0）。JA トップのサービスリンク表示は従来どおり「詳しく見る →」。

- [x] **Step 4: Commit**

```bash
git add src/components/sections/Service.astro
git commit -m "refactor: Service の詳細リンク文言を prop 化

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## 完了後

全タスク完了後、`docs/superpowers/specs/2026-06-17-en-site-japan-entry-pillar-design.md`
の検証項目を最終確認し、`task-completion-report` スキルに従って PR を作成する。
