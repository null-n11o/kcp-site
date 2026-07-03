# Rich UI Refresh (Kinetic Swiss) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** KCP コーポレートサイト全ページを、青系ダークのスイス・モダニズムを維持したまま、モーションと大型タイポグラフィでデザイン事務所レベルの UI に磨き込む。

**Architecture:** 外部 JS ライブラリを追加せず、CSS アニメーション + 単一の Intersection Observer（BaseLayout に集約）+ 少量のインライン JS で実現する。ハードコードされた色をすべて Tailwind トークンに置換し、`FadeIn.astro` を多変量の `Reveal.astro` に置き換える。

**Tech Stack:** Astro SSG / Tailwind CSS / 純 CSS アニメーション / Intersection Observer

**Spec:** `docs/superpowers/specs/2026-07-02-rich-ui-refresh-design.md`

## Global Constraints

- 外部 JS ライブラリの追加禁止（インラインスクリプトのみ、合計 +2KB 以下）
- 背景は単色のみ。gradient・グロー・blur 禁止。`rounded-none`（角丸禁止）
- アニメーションは `opacity` / `transform` / `clip-path` のみ（CLS ゼロ）
- カードや行の `hover:translate-y` 禁止（ホバーは色・ボーダー・矢印スライドまで）
- すべてのモーションは `prefers-reduced-motion: reduce` で無効化
- イージングは `cubic-bezier(0.22, 1, 0.36, 1)` に統一
- i18n 既存文言は変更しない（`footer.backToTop` キーのみ新規追加）
- コンテンツ・URL 構造・`src/utils/`・`src/plugins/` は変更しない
- Astro コンポーネントはユニットテスト対象外（CLAUDE.md の方針）。各タスクの検証は `npm run build` の成功 + 対象確認
- 作業ブランチ: `feat/rich-ui-refresh`（作成済み。このブランチ上で作業する）
- コミットメッセージ末尾に `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>` を付ける

---

### Task 1: デザイントークンとグローバル CSS 基盤

**Files:**
- Modify: `tailwind.config.mjs`
- Modify: `src/styles/global.css`

**Interfaces:**
- Produces: Tailwind クラス `bg-base-50`（#0e0e0e）、`py-section sm:py-section-lg`（5rem / 7.5rem）、`::selection` / `focus-visible` のグローバルスタイル。後続タスクはこれらを前提にする
- Produces: `.section-wrapper` は横 padding のみ（縦 padding は各セクションが持つ）

- [x] **Step 1: tailwind.config.mjs にトークンを追加**

`colors.base` に `50` を、`spacing` に `section-lg` を追加する:

```js
      colors: {
        base: {
          DEFAULT: '#0a0a0a',
          50: '#0e0e0e',
          100: '#141414',
          200: '#1a1a2e',
          300: '#16213e',
        },
```

```js
      spacing: {
        section: '5rem',
        'section-lg': '7.5rem',
      },
```

- [x] **Step 2: global.css を更新**

`src/styles/global.css` の `@layer base` に selection と focus を追加し、`.section-wrapper` から `py-section` を外す。`@layer utilities` に Reveal 用スタイル（Task 3 で使用）を追加する。ファイル全体を以下に置き換える:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  html {
    @apply scroll-smooth;
    background-color: #0a0a0a;
    color: #f0f0f0;
    font-family: 'Noto Sans JP', 'Inter', sans-serif;
    -webkit-font-smoothing: antialiased;
    font-feature-settings: 'palt';
  }

  ::selection {
    background-color: #4a9eff;
    color: #0a0a0a;
  }

  :focus-visible {
    outline: 2px solid #4a9eff;
    outline-offset: 2px;
  }

  ::-webkit-scrollbar {
    width: 8px;
  }
  ::-webkit-scrollbar-track {
    background: #141414;
  }
  ::-webkit-scrollbar-thumb {
    background: #333;
    border-radius: 4px;
  }
  ::-webkit-scrollbar-thumb:hover {
    background: #4a9eff;
  }
}

@layer components {
  .section-wrapper {
    @apply px-4 sm:px-6 lg:px-8 mx-auto;
    max-width: 1200px;
  }
}

@layer utilities {
  /* ===== Reveal motion system (IO script は BaseLayout.astro) ===== */
  [data-reveal='fade-up'] {
    opacity: 0;
    transform: translateY(24px);
    transition:
      opacity 0.8s cubic-bezier(0.22, 1, 0.36, 1),
      transform 0.8s cubic-bezier(0.22, 1, 0.36, 1);
  }
  [data-reveal='fade-up'].is-visible {
    opacity: 1;
    transform: translateY(0);
  }

  /* lines: .reveal-line は overflow-hidden の親で包むこと。--i で行インデックス指定 */
  [data-reveal='lines'] .reveal-line {
    display: block;
    transform: translateY(110%);
    transition: transform 0.9s cubic-bezier(0.22, 1, 0.36, 1);
    transition-delay: calc(var(--i, 0) * 90ms);
  }
  [data-reveal='lines'].is-visible .reveal-line {
    transform: translateY(0);
  }

  /* stagger: 子要素の transition-delay は IO スクリプトが設定する */
  [data-reveal='stagger'] > * {
    opacity: 0;
    transform: translateY(20px);
    transition:
      opacity 0.8s cubic-bezier(0.22, 1, 0.36, 1),
      transform 0.8s cubic-bezier(0.22, 1, 0.36, 1);
  }
  [data-reveal='stagger'].is-visible > * {
    opacity: 1;
    transform: translateY(0);
  }

  /* line: 水平ルールが左から伸びる */
  [data-reveal='line'] .reveal-rule {
    transform: scaleX(0);
    transform-origin: left;
    transition: transform 0.9s cubic-bezier(0.22, 1, 0.36, 1);
  }
  [data-reveal='line'].is-visible .reveal-rule {
    transform: scaleX(1);
  }

  .stretched-link::after {
    position: absolute;
    inset: 0;
    z-index: 1;
    content: '';
  }

  @media (prefers-reduced-motion: reduce) {
    [data-reveal],
    [data-reveal] .reveal-line,
    [data-reveal] .reveal-rule,
    [data-reveal='stagger'] > * {
      opacity: 1 !important;
      transform: none !important;
      transition: none !important;
    }
  }
}
```

※ 旧 `[data-fade-in]` スタイルは削除する（Task 3 で `FadeIn.astro` ごと廃止）。ただし Task 3 完了までビルドは通る（クラスが未定義でも Tailwind はエラーにしない。旧 FadeIn は Task 3 で一括移行するため、このタスク直後の一時的な「フェードインが効かない」状態は許容する）。

- [x] **Step 3: 各セクションに縦 padding を移設**

`.section-wrapper` から `py-section` を外したため、`section-wrapper` を使う全箇所を確認する:

```bash
grep -rn 'section-wrapper' src --include='*.astro'
```

以下のルールで修正する:

- `<section class="py-section ...">` を持つ要素 → `py-section sm:py-section-lg` に変更（対象: Service / MVV / Strength / BlogPreview / Company / Contact / ServicePillar および `src/pages/services/*.astro`・`src/pages/en/services/japan-entry.astro` 内のセクション）
- `pt-24 pb-16` など明示指定済みの箇所（blog/press ページ、404 等）→ 変更不要
- `Hero.astro` の `.section-wrapper w-full pt-24` → 変更不要（min-h-screen で中央寄せのため）
- `Footer.astro` → 変更不要（Task 8 で再設計）

- [x] **Step 4: ビルド確認**

Run: `npm run build`
Expected: exit 0（`Complete!` 出力）

- [x] **Step 5: Commit**

```bash
git add tailwind.config.mjs src/styles/global.css src/components src/pages
git commit -m "feat: デザイントークン整備とReveal用グローバルCSS基盤を追加"
```

---

### Task 2: ハードコード色の一括トークン化

**Files:**
- Modify: `src/components/**/*.astro`、`src/pages/**/*.astro`（ハードコード色を含む全ファイル）

**Interfaces:**
- Consumes: Task 1 の `bg-base-50` トークン
- Produces: 全コンポーネントが Tailwind トークンのみで配色される（インライン `style` 属性ゼロ）

- [x] **Step 1: クラス内ハードコード色を一括置換**

```bash
cd /Users/nakanokentaro/01_repos/active/kcp-site
grep -rl 'border-\[#2a2a3e\]' src --include='*.astro' | xargs sed -i '' 's/border-\[#2a2a3e\]/border-border/g'
grep -rl 'border-\[#1e1e2e\]' src --include='*.astro' | xargs sed -i '' 's/border-\[#1e1e2e\]/border-border-subtle/g'
grep -rl 'bg-\[#141414\]' src --include='*.astro' | xargs sed -i '' 's/bg-\[#141414\]/bg-base-100/g'
grep -rl 'bg-\[#0e0e0e\]' src --include='*.astro' | xargs sed -i '' 's/bg-\[#0e0e0e\]/bg-base-50/g'
grep -rl 'border-\[#333\]' src --include='*.astro' | xargs sed -i '' 's/border-\[#333\]/border-border/g'
```

- [x] **Step 2: インライン style 属性を置換**

```bash
grep -rn 'style="background' src --include='*.astro'
```

ヒットした各行を以下のルールで class に置き換える（`style` 属性は削除）:

| インライン style | 置換後の class 追加 |
|---|---|
| `style="background-color: #0a0a0a;"` | `bg-base` |
| `style="background-color: #0e0e0e;"` | `bg-base-50` |
| `style="background-color: rgba(10,10,10,0.95);"`（Header） | `bg-base/95` |

例（Hero.astro）:

```astro
<section id="hero" class="min-h-screen flex items-center bg-base">
```

- [x] **Step 3: 残存ハードコード色がないことを確認**

Run: `grep -rnE '#(0a0a0a|0e0e0e|141414|1e1e2e|2a2a3e)|style="background' src --include='*.astro'`
Expected: 出力なし（exit 1）

- [x] **Step 4: ビルド確認**

Run: `npm run build`
Expected: exit 0

- [x] **Step 5: Commit**

```bash
git add -A src
git commit -m "refactor: ハードコード色をTailwindトークンに統一しインラインstyleを全廃"
```

---

### Task 3: Reveal モーションシステム（FadeIn 置換）

**Files:**
- Create: `src/components/ui/Reveal.astro`
- Modify: `src/layouts/BaseLayout.astro`（`</body>` 直前に IO スクリプト追加）
- Modify: FadeIn を import している全 11 ファイル（Service / MVV / Company / ServicePillar / BlogPreview / Contact / Strength / services/ai-training / services/sns / services/it-support / en/services/japan-entry）
- Delete: `src/components/ui/FadeIn.astro`

**Interfaces:**
- Consumes: Task 1 の `[data-reveal]` CSS
- Produces: `Reveal.astro` — Props `{ variant?: 'fade-up' | 'lines' | 'stagger' | 'line'; delay?: number; class?: string }`。および「任意の要素に `data-reveal="..."` 属性を直接付けても動く」グローバル IO スクリプト（後続タスクの SectionHeading / Hero / blog ページが直接属性を使う）

- [x] **Step 1: Reveal.astro を作成**

```astro
---
export interface Props {
  variant?: 'fade-up' | 'lines' | 'stagger' | 'line';
  delay?: number;
  class?: string;
}

const { variant = 'fade-up', delay = 0, class: className = '' } = Astro.props;
---

<div data-reveal={variant} data-delay={delay} class={className}>
  <slot />
</div>
```

- [x] **Step 2: BaseLayout に IO スクリプトを追加**

`src/layouts/BaseLayout.astro` の `</body>` 直前に追加:

```astro
<script>
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target as HTMLElement;
        const delay = Number(el.dataset.delay ?? 0);
        if (el.dataset.reveal === 'stagger') {
          Array.from(el.children).forEach((child, i) => {
            (child as HTMLElement).style.transitionDelay = `${delay + i * 70}ms`;
          });
          el.classList.add('is-visible');
        } else {
          setTimeout(() => el.classList.add('is-visible'), delay);
        }
        io.unobserve(el);
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
  );
  document.querySelectorAll('[data-reveal]').forEach((el) => io.observe(el));
</script>
```

- [x] **Step 3: FadeIn の全使用箇所を Reveal に移行**

対象ファイルを列挙:

```bash
grep -rln "FadeIn" src --include='*.astro'
```

各ファイルで機械的に置換:
- `import FadeIn from '@/components/ui/FadeIn.astro';` → `import Reveal from '@/components/ui/Reveal.astro';`
- `<FadeIn` → `<Reveal`、`</FadeIn>` → `</Reveal>`

さらに、**行リストを持つセクションは stagger に統合**する。Service / Strength / MVV の Values / BlogPreview は、`items.map` の各行を個別 `<FadeIn delay={i * 80}>` で包んでいる構造を、リスト全体を 1 つの `<Reveal variant="stagger">` で包む構造に変える。例（Service.astro）:

```astro
<Reveal variant="stagger" class="flex flex-col">
  {items.map((service, i) => (
    <div class="py-5 border-b border-border-subtle">
      {/* 行の中身は既存のまま */}
    </div>
  ))}
</Reveal>
```

※ 元の `<div class="flex flex-col">` の class は Reveal の `class` prop に移す。個別の `delay={i * 80}` は削除する（stagger が代替）。

- [x] **Step 4: FadeIn.astro を削除**

```bash
rm src/components/ui/FadeIn.astro
grep -rn "FadeIn" src
```

Expected: grep の出力なし

- [x] **Step 5: ビルド確認**

Run: `npm run build`
Expected: exit 0

- [x] **Step 6: Commit**

```bash
git add -A src
git commit -m "feat: FadeInをReveal モーションシステムに置換（fade-up/lines/stagger/line）"
```

---

### Task 4: SectionHeading の強化（大型タイトル + ゴースト数字）

**Files:**
- Modify: `src/components/ui/SectionHeading.astro`
- Modify: `src/components/sections/Service.astro`、`MVV.astro`、`Strength.astro`、`Company.astro`、`BlogPreview.astro`、`Contact.astro`
- Modify: `src/pages/index.astro`、`src/pages/en/index.astro`（subtitle の受け渡し確認のみ）

**Interfaces:**
- Consumes: Task 3 の `data-reveal` グローバル IO
- Produces: `SectionHeading.astro` — Props `{ sectionNumber?: string; sectionLabel?: string; title?: string; lede?: string }` + 右端用 `<slot name="meta" />`。`title` を渡すと大型タイトル + ゴースト数字を表示、渡さないと従来の小ラベルのみ（ServicePillar 等の既存呼び出しは無変更で互換）

- [x] **Step 1: SectionHeading.astro を書き換え**

```astro
---
export interface Props {
  sectionNumber?: string;
  sectionLabel?: string;
  title?: string;
  lede?: string;
}

const { sectionNumber, sectionLabel, title, lede } = Astro.props;
const label = sectionLabel || title || '';
---

<div class="relative mb-12" data-reveal="fade-up">
  {sectionNumber && title && (
    <span
      aria-hidden="true"
      class="pointer-events-none select-none absolute -top-8 right-0 font-mono font-black leading-none text-[6rem] sm:text-[9rem] text-white/[0.04]"
    >
      {sectionNumber}
    </span>
  )}
  <div class="flex items-baseline justify-between border-b border-border pb-3">
    <p class="text-xs font-mono font-medium text-accent tracking-[0.15em] uppercase">
      {sectionNumber ? `${sectionNumber} — ` : ''}{label}
    </p>
    <slot name="meta" />
  </div>
  {title && (
    <h2 class="relative mt-8 text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white">
      {title}
    </h2>
  )}
  {lede && (
    <p class="relative mt-4 max-w-lg text-sm leading-relaxed text-text-secondary">{lede}</p>
  )}
</div>
```

- [x] **Step 2: LP セクションの呼び出しを更新**

各セクションで `title` / `lede` を渡す（i18n の既存文言を流用。Props に `subtitle` が既にあるものはそれを使う）:

- `Service.astro`: `<SectionHeading sectionNumber="02" sectionLabel={heading} title={heading} lede={subtitle} />` — Props の `subtitle` を分割代入に追加（`const { heading, subtitle, items, ... }`）
- `MVV.astro`: 変更なし（`<SectionHeading sectionNumber="03" sectionLabel="Mission / Vision / Values" />` のまま。ラベルが長く、また Mission の大型引用が直後にあるため大型タイトルは付けない）
- `Strength.astro`: `<SectionHeading sectionNumber="04" sectionLabel={heading} title={heading} lede={subtitle} />` — `subtitle` を分割代入に追加
- `Company.astro`: `<SectionHeading sectionNumber="06" sectionLabel={heading} title={heading} lede={subtitle} />` — `subtitle` を分割代入に追加
- `BlogPreview.astro`: インライン見出しを SectionHeading に置換し、`viewAll` リンクを meta スロットへ:

```astro
<SectionHeading sectionNumber="05" sectionLabel={heading} title={heading} lede={subtitle}>
  <a
    slot="meta"
    href={blogHref}
    class="text-xs font-mono text-accent tracking-[0.1em] uppercase hover:text-accent-light transition-colors"
  >
    {viewAllLabel} →
  </a>
</SectionHeading>
```

（`subtitle` を分割代入に追加。既存の `<FadeIn>`/`<Reveal>` ラッパーと `<div class="flex items-baseline justify-between ...">` は削除 — SectionHeading 自身が `data-reveal` を持つ）

- `Contact.astro`: インラインのラベル行（`07 — {label}`）を `<SectionHeading sectionNumber="07" sectionLabel={label} />` に置換（`title` なし。大見出しは既存の h2 が担う）。さらに h2 と太ルールに lines / line リベールを適用する:

```astro
<div data-reveal="lines">
  <h2 class="text-4xl sm:text-6xl lg:text-7xl font-black leading-none tracking-tight text-white mb-8">
    <span class="block overflow-hidden pb-[0.08em]">
      <span class="reveal-line" style="--i: 0">{heading}</span>
    </span>
  </h2>
</div>

<div data-reveal="line">
  <div class="reveal-rule h-0.5 bg-white"></div>
  <div class="pt-6 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6">
    {/* subtext と Button は既存のまま */}
  </div>
</div>
```

（既存の `border-t-2 border-white` を `reveal-rule` の div に置き換える。Contact 全体を包んでいた `<FadeIn>`/`<Reveal>` ラッパーは削除する）

※ 各セクションで SectionHeading を包んでいた `<Reveal>` ラッパーは削除する（二重リベール防止）。

- [x] **Step 3: ビルド確認**

Run: `npm run build`
Expected: exit 0

- [x] **Step 4: Commit**

```bash
git add -A src
git commit -m "feat: SectionHeadingに大型タイトル・ゴースト数字・metaスロットを追加"
```

---

### Task 5: Hero ロード演出とマーキー

**Files:**
- Modify: `src/components/sections/Hero.astro`

**Interfaces:**
- Consumes: なし（ロード演出は IO 不使用、コンポーネントスコープ CSS で完結）
- Produces: なし（自己完結）

- [x] **Step 1: Hero.astro を書き換え**

```astro
---
import Button from '@/components/ui/Button.astro';

export interface Props {
  eyebrow: string;
  headlinePre: string;
  headlineAccent: string;
  headlinePost: string;
  subtext: string;
  primaryCta: string;
  secondaryCta: string;
  contactHref?: string;
  serviceHref?: string;
}

const {
  eyebrow,
  headlinePre,
  headlineAccent,
  headlinePost,
  subtext,
  primaryCta,
  secondaryCta,
  contactHref = '#contact',
  serviceHref = '#service',
} = Astro.props;

const headlines = [headlinePre, headlineAccent, headlinePost].filter(Boolean);
const marqueeItems = [
  'AI Consulting',
  'SNS Marketing',
  'IT Support',
  'System Development',
  'Japan Entry',
];
---

<section id="hero" class="relative min-h-screen flex items-center bg-base overflow-hidden">
  <div class="section-wrapper w-full pt-24 pb-20">
    <!-- トップ行: セクションラベル + 年 -->
    <div class="hero-fade flex items-baseline justify-between mb-8">
      <p class="text-xs font-mono font-medium text-accent tracking-[0.15em] uppercase">
        01 — {eyebrow}
      </p>
      <p class="text-xs font-mono text-text-muted">2026 —</p>
    </div>

    <!-- ビッグ見出し: 行ごとにクリップリベール -->
    <h1 class="text-5xl sm:text-7xl lg:text-8xl font-black leading-none tracking-tight text-white">
      {headlines.map((line, i) => (
        <span class="block overflow-hidden pb-[0.08em]">
          <span class="hero-line block" style={`--i: ${i}`}>{line}</span>
        </span>
      ))}
    </h1>

    <!-- ボールドルール（左から伸長） + 下部ストリップ -->
    <div class="hero-rule mt-8 h-0.5 bg-white"></div>
    <div class="hero-fade pt-6 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6">
      <p class="text-text-secondary text-sm sm:text-base leading-relaxed max-w-lg">
        {subtext}
      </p>
      <div class="flex flex-col sm:flex-row gap-3 shrink-0">
        <Button href={contactHref} variant="primary">{primaryCta}</Button>
        <Button href={serviceHref} variant="outline">{secondaryCta}</Button>
      </div>
    </div>
  </div>

  <!-- キーワードマーキー（装飾・純CSS） -->
  <div class="hero-fade absolute bottom-0 left-0 right-0 border-t border-border py-4 overflow-hidden" aria-hidden="true">
    <div class="marquee-track">
      {[0, 1].map(() => (
        <div class="flex shrink-0">
          {marqueeItems.map((item) => (
            <span class="font-mono text-xs uppercase tracking-[0.2em] text-text-muted whitespace-nowrap px-8">
              {item}<span class="text-accent pl-16">—</span>
            </span>
          ))}
        </div>
      ))}
    </div>
  </div>
</section>

<style>
  .hero-line {
    transform: translateY(110%);
    animation: hero-line 0.9s cubic-bezier(0.22, 1, 0.36, 1) forwards;
    animation-delay: calc(var(--i) * 120ms + 100ms);
  }
  @keyframes hero-line {
    to {
      transform: translateY(0);
    }
  }

  .hero-rule {
    transform: scaleX(0);
    transform-origin: left;
    animation: hero-rule 0.9s cubic-bezier(0.22, 1, 0.36, 1) 500ms forwards;
  }
  @keyframes hero-rule {
    to {
      transform: scaleX(1);
    }
  }

  .hero-fade {
    opacity: 0;
    animation: hero-fade 0.8s ease-out 700ms forwards;
  }
  @keyframes hero-fade {
    to {
      opacity: 1;
    }
  }

  .marquee-track {
    display: flex;
    width: max-content;
    animation: marquee 40s linear infinite;
  }
  @keyframes marquee {
    from {
      transform: translateX(0);
    }
    to {
      transform: translateX(-50%);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .hero-line,
    .hero-rule,
    .hero-fade {
      animation: none;
      transform: none;
      opacity: 1;
    }
    .marquee-track {
      animation: none;
    }
  }
</style>
```

※ 見出し行の `pb-[0.08em]` は `overflow-hidden` による文字下端（g, y 等のディセンダ）の欠け防止。

- [x] **Step 2: ビルドと目視確認**

Run: `npm run build && npm run preview`
Expected: ビルド成功。`http://localhost:4321/` で見出しが 1 行ずつせり上がり、ルールが左から伸び、マーキーが流れる（en ページ `/en/` も同様）

- [x] **Step 3: Commit**

```bash
git add src/components/sections/Hero.astro
git commit -m "feat: Heroにロード演出（行リベール・ルール伸長）とキーワードマーキーを追加"
```

---

### Task 6: Header スクロール挙動と進捗バー

**Files:**
- Modify: `src/components/layout/Header.astro`

**Interfaces:**
- Consumes: Task 2 の `bg-base/95`
- Produces: なし（自己完結）

- [x] **Step 1: header 要素に id・進捗バー・transition を追加**

`<header>` タグを以下に変更（`style` 属性は Task 2 で除去済み想定）:

```astro
<header
  id="site-header"
  class="fixed top-0 left-0 right-0 z-50 border-b border-border bg-base/95 transition-transform duration-300"
>
  <span
    id="scroll-progress"
    class="absolute top-0 left-0 h-0.5 w-full bg-accent origin-left scale-x-0"
    aria-hidden="true"></span>
```

- [x] **Step 2: デスクトップナビリンクに下線スライドを追加**

ナビリンクの class を変更:

```astro
<a
  href={link.href}
  class="relative text-sm font-medium text-text-secondary hover:text-text-primary transition-colors after:absolute after:left-0 after:-bottom-1 after:h-px after:w-full after:origin-left after:scale-x-0 after:bg-accent after:transition-transform after:duration-300 after:content-[''] hover:after:scale-x-100"
>
  {link.label}
</a>
```

- [x] **Step 3: スクロールスクリプトを追加**

既存のモバイルメニュー `<script>` の末尾（同じ script 内）に追加:

```ts
  const header = document.getElementById('site-header');
  const progress = document.getElementById('scroll-progress');
  let lastY = window.scrollY;
  let ticking = false;

  function onScroll() {
    const y = window.scrollY;
    const menuOpen = menu?.classList.contains('flex');
    if (!menuOpen) {
      if (y > 80 && y > lastY) {
        header?.classList.add('-translate-y-full');
      } else {
        header?.classList.remove('-translate-y-full');
      }
    }
    lastY = y;
    if (progress) {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
    }
    ticking = false;
  }

  window.addEventListener(
    'scroll',
    () => {
      if (!ticking) {
        requestAnimationFrame(onScroll);
        ticking = true;
      }
    },
    { passive: true }
  );
```

- [x] **Step 4: ビルドと目視確認**

Run: `npm run build && npm run preview`
Expected: 下スクロールでヘッダーが隠れ、上スクロールで再表示。上端の青い進捗バーがスクロール量に追従。アンカーリンク遷移（`/#service` 等）が正常動作

- [x] **Step 5: Commit**

```bash
git add src/components/layout/Header.astro
git commit -m "feat: Headerにスクロール追従（隠す/出す）と読み進捗バーを追加"
```

---

### Task 7: マイクロインタラクション（行・ボタン・カード・テーブル）

**Files:**
- Modify: `src/components/sections/Service.astro`
- Modify: `src/components/sections/Strength.astro`
- Modify: `src/components/ui/Button.astro`
- Modify: `src/components/blog/PostCard.astro`
- Modify: `src/components/sections/Company.astro`

**Interfaces:**
- Consumes: Task 2 のトークン、Task 3 の stagger 構造
- Produces: なし（自己完結）

- [x] **Step 1: Service 行のホバー演出 + 行全体リンク化**

`Service.astro` の `items.map` 内の行を以下に変更（Task 3 の stagger 構造の中身）:

```astro
<div class="group relative py-5 px-4 -mx-4 border-b border-border-subtle transition-colors duration-300 hover:bg-base-100">
  <div class="flex gap-5 items-start">
    <span class="font-mono font-black text-accent/40 text-sm w-6 shrink-0 pt-px transition-colors duration-300 group-hover:text-accent">
      {String(i + 1).padStart(2, '0')}
    </span>
    <div class="flex-1 min-w-0">
      <div class="sm:grid sm:grid-cols-[10rem_1fr] sm:gap-8 sm:items-baseline">
        <p class="font-bold text-text-primary text-sm mb-1 sm:mb-0">
          {service.title}
        </p>
        <p class="text-text-secondary text-sm leading-relaxed">
          {service.description}
        </p>
      </div>
    </div>
    <span
      class="hidden sm:block self-center text-accent opacity-0 -translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0"
      aria-hidden="true"
    >
      →
    </span>
  </div>
  {service.href && (
    <a href={service.href} class="stretched-link" aria-label={`${service.title} — ${detailLabel}`}></a>
  )}
</div>
```

※ 従来の「詳しく見る →」テキストリンクは行全体リンク + 矢印に置き換える。矢印の `<span>` も `{service.href && (...)}` の条件内に置き、`href` がない行には矢印もリンクも表示しない。

- [x] **Step 2: Strength 行に同じホバー演出を適用**

`Strength.astro` の行にも `group relative py-5 px-4 -mx-4 ... hover:bg-base-100` と番号の `group-hover:text-accent` を同様に適用する（Strength にはリンクがないため矢印と stretched-link は追加しない）。

- [x] **Step 3: Button のアイコンスライド**

`Button.astro` の `base` 定数を変更:

```ts
const base =
  'inline-flex items-center justify-center gap-2 px-6 py-3 font-medium text-sm transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent [&_svg]:transition-transform [&_svg]:duration-200 [&:hover_svg]:translate-x-1';
```

- [x] **Step 4: PostCard のホバー強化**

`PostCard.astro` — row バリアントの `<article>` class に `transition-colors duration-300 hover:bg-base-100 px-4 -mx-4` を追加し、`<time>` に `transition-colors group-hover:text-accent` を追加、`<article>` に `group` を追加。

card バリアントの日付行に矢印を追加:

```astro
<div class="flex items-center gap-3 text-xs text-text-muted mt-auto">
  <time datetime={pubDate.toISOString()}>{dateStr}</time>
  <span>·</span>
  <span>{readingTimeLabel}</span>
  <span
    class="ml-auto text-accent opacity-0 -translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0"
    aria-hidden="true"
  >
    →
  </span>
</div>
```

- [x] **Step 5: Company テーブルの行ホバー**

`Company.astro` の `<tr>` class に `transition-colors hover:bg-base-200/50` を追加:

```astro
<tr class={`transition-colors hover:bg-base-200/50 ${i % 2 === 0 ? 'bg-base-50' : 'bg-base-100'}`}>
```

- [x] **Step 6: ビルド確認**

Run: `npm run build`
Expected: exit 0

- [x] **Step 7: Commit**

```bash
git add -A src
git commit -m "feat: 行・ボタン・カード・テーブルにホバーマイクロインタラクションを追加"
```

---

### Task 8: Footer 再設計 + i18n キー追加

**Files:**
- Modify: `src/i18n/types.ts`、`src/i18n/ja.ts`、`src/i18n/en.ts`
- Modify: `src/components/layout/Footer.astro`

**Interfaces:**
- Consumes: 既存 `t.nav.*` / `t.footer.*`
- Produces: `Translations['footer']` に `backToTop: string` を追加

- [x] **Step 1: i18n に backToTop キーを追加**

`types.ts`:

```ts
  footer: {
    companyName: string;
    rights: string;
    backToTop: string;
  };
```

`ja.ts`: `backToTop: 'トップへ戻る',` を footer に追加。
`en.ts`: `backToTop: 'Back to top',` を footer に追加。

- [x] **Step 2: Footer.astro を書き換え**

```astro
---
import Logo from './Logo.astro';
import type { Translations } from '@/i18n/types';

export interface Props {
  locale: 'ja' | 'en';
  t: Translations;
}

const { locale, t } = Astro.props;
const year = new Date().getFullYear();
const base = locale === 'en' ? '/en' : '';

const navLinks = [
  { href: `${base}/#service`, label: t.nav.service },
  { href: `${base}/#about`, label: t.nav.about },
  { href: `${base}/#strength`, label: t.nav.strength },
  { href: `${base}/blog/`, label: t.nav.blog },
  { href: `${base}/#company`, label: t.nav.company },
  { href: `${base}/#contact`, label: t.nav.contact },
];
---

<footer class="border-t-2 border-white">
  <div class="section-wrapper py-16">
    <div class="flex flex-col md:flex-row md:items-start md:justify-between gap-10">
      <div>
        <Logo class="h-10 w-auto mb-5" title="" />
        <p class="text-2xl sm:text-3xl font-black tracking-tight text-white">
          {t.footer.companyName}
        </p>
      </div>
      <nav
        class="grid grid-cols-2 gap-x-12 gap-y-3"
        aria-label={locale === 'ja' ? 'フッターナビゲーション' : 'Footer navigation'}
      >
        {navLinks.map((link) => (
          <a href={link.href} class="text-sm text-text-secondary hover:text-text-primary transition-colors">
            {link.label}
          </a>
        ))}
        <a href="/press/" class="text-sm text-text-secondary hover:text-text-primary transition-colors">
          Press
        </a>
      </nav>
    </div>
    <div class="mt-12 pt-6 border-t border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs font-mono text-text-muted">
      <p>© {year} {t.footer.companyName}. {t.footer.rights}</p>
      <a href="#top" class="hover:text-text-primary transition-colors" data-back-to-top>
        {t.footer.backToTop} ↑
      </a>
    </div>
  </div>
</footer>

<script>
  document.querySelector('[data-back-to-top]')?.addEventListener('click', (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
</script>
```

- [x] **Step 3: ビルドとテスト確認**

Run: `npm run test && npm run build`
Expected: 既存 Vitest 全パス、ビルド exit 0

- [x] **Step 4: Commit**

```bash
git add src/i18n src/components/layout/Footer.astro
git commit -m "feat: Footerをデザイン事務所型レイアウトに再設計しbackToTopキーを追加"
```

---

### Task 9: ブログ・404 ページの大型タイポ化

**Files:**
- Modify: `src/pages/blog/index.astro`、`src/pages/en/blog/index.astro`、`src/pages/blog/tags/[tag].astro`、`src/pages/blog/tags/index.astro`
- Modify: `src/components/blog/BlogHero.astro`
- Modify: `src/pages/404.astro`

**Interfaces:**
- Consumes: Task 3 の `data-reveal` 属性（グローバル IO）
- Produces: なし（自己完結）

- [x] **Step 1: ブログ一覧ページのヘッダーを大型化 + グリッドを stagger 化**

`src/pages/blog/index.astro` の `<div class="section-wrapper pt-24 pb-16">` 内を変更:

```astro
  <div class="section-wrapper pt-32 pb-16">
    <div data-reveal="fade-up">
      <p class="text-xs font-mono font-medium text-accent tracking-[0.15em] uppercase border-b border-border pb-3 mb-8">
        Blog
      </p>
      <h1 class="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white mb-4">Blog</h1>
      <p class="text-text-secondary mb-10">AI活用・業務効率化に関する記事を発信しています。</p>
    </div>

    <TagFilter tags={tags} />

    {posts.length === 0 ? (
      <p class="text-text-muted text-center py-16">記事がありません。</p>
    ) : (
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-reveal="stagger">
        {posts.map(post => (
          <PostCard post={post} />
        ))}
      </div>
    )}
  </div>
```

`en/blog/index.astro`・`blog/tags/[tag].astro`・`blog/tags/index.astro` にも同じパターン（`pt-32`、mono ラベル + `font-black` の h1、記事グリッドがあれば `data-reveal="stagger"`）を適用する。既存の h1 テキスト・説明文はそのまま使う。

- [x] **Step 2: BlogHero（記事ヘッダー）の刷新**

`src/components/blog/BlogHero.astro` — h1 を accent 色から白の font-black に変更し、全体を reveal:

```astro
<div class="mb-10" data-reveal="fade-up">
  <h1 class="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight mb-5">{title}</h1>
  <div class="flex flex-wrap items-center gap-3 text-sm font-mono text-text-muted mb-4">
    <span>by {author}</span>
    <span>·</span>
    <time datetime={pubDate.toISOString()}>{formatDateJa(pubDate)}</time>
    {updatedDate && (
      <>
        <span>·</span>
        <span>更新: <time datetime={updatedDate.toISOString()}>{formatDateJa(updatedDate)}</time></span>
      </>
    )}
    <span>·</span>
    <span>{readMin} min read</span>
  </div>
  <div class="flex flex-wrap gap-2 pb-6 border-b border-border">
    {tags.map(tag => <TagBadge tag={tag} href={`/blog/tags/${tag}/`} size="md" />)}
  </div>
</div>
```

（frontmatter は変更なし）

- [x] **Step 3: 404 ページのゴーストタイポ化**

`src/pages/404.astro`:

```astro
---
import PageLayout from '@/layouts/PageLayout.astro';
---

<PageLayout title="404 - ページが見つかりません">
  <div class="section-wrapper pt-40 pb-24 text-center">
    <p
      aria-hidden="true"
      class="font-mono font-black leading-none text-[10rem] sm:text-[14rem] text-white/[0.05] select-none"
    >
      404
    </p>
    <h1 class="text-2xl sm:text-3xl font-black text-white -mt-10 sm:-mt-14 mb-4 relative">
      ページが見つかりません
    </h1>
    <p class="text-text-secondary mb-10">お探しのページは移動または削除された可能性があります。</p>
    <a href="/" class="font-mono text-sm text-accent hover:text-accent-light transition-colors">
      ← トップページへ戻る
    </a>
  </div>
</PageLayout>
```

- [x] **Step 4: ビルド確認**

Run: `npm run build`
Expected: exit 0

- [x] **Step 5: Commit**

```bash
git add -A src
git commit -m "feat: ブログ一覧・記事ヘッダー・404を大型タイポグラフィに刷新"
```

---

### Task 10: 検証と仕上げ

**Files:**
- なし（検証のみ。問題が見つかれば該当ファイルを修正）

- [x] **Step 1: 全テスト + ビルド**

Run: `npm run test && npm run build`
Expected: Vitest 全パス、ビルド exit 0

- [x] **Step 2: ハードコード色・FadeIn 残存チェック**

Run: `grep -rnE '#(0a0a0a|0e0e0e|141414|1e1e2e|2a2a3e)|style="background|FadeIn' src --include='*.astro'`
Expected: 出力なし

- [x] **Step 3: preview で手動確認**

Run: `npm run preview`

確認チェックリスト（各ページをブラウザで開く）:

| ページ | 確認項目 |
|---|---|
| `/`（LP ja） | Hero ロード演出、マーキー、各セクションの reveal・ゴースト数字・行ホバー、Header 隠れ/進捗バー、Footer 新レイアウト |
| `/en/` | 同上（英語文言で崩れがないか） |
| `/blog/` | 大型ヘッダー、カードの stagger、カードホバー |
| `/blog/<任意記事>/` | 記事ヘッダー刷新、prose 本文が無変更 |
| `/services/it-support/`・`/services/sns/`・`/services/ai-training/` | 色のリグレッションなし、reveal 動作 |
| `/en/services/japan-entry/` | 同上 |
| `/press/` | 色のリグレッションなし |
| `/404`（存在しない URL） | ゴーストタイポ表示 |
| 全体 | モバイル幅（375px）でレイアウト崩れなし、モバイルメニュー開閉、OS の「視差効果を減らす」ON で全モーション無効 |

- [x] **Step 4: 問題があれば修正してコミット**

修正が発生した場合:

```bash
git add -A src
git commit -m "fix: UI リフレッシュの検証で見つかった問題を修正"
```

- [x] **Step 5: 完了報告**

CLAUDE.md の Task Workflow に従い、レビュー通過後に superpowers:task-completion-report スキルで PR 作成まで行う（プランのチェックボックス更新 → commit → push → `gh pr create`）。
