# SNS運用代行ページ 実装プラン

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** X/Threads・Instagram（スタンダード/リールズ）の SNS 運用代行サービスを3タブで表示する専用ページ `/services/sns/` を新設し、ホームの Service セクションから「詳しく見る」リンクで誘導する。

**Architecture:** `ServiceItem` 型に `href?` を追加し `Service.astro` がリンクを描画できるようにする。`src/pages/services/sns.astro` を新設し、タブ切り替えはインライン `<script>` ブロックで実装（外部 JS バンドルなし）。コンテンツはページ内にハードコード（CMS なし・静的サイト）。

**Tech Stack:** Astro SSG, Tailwind CSS, TypeScript

---

## ファイルマップ

| 操作 | ファイル | 変更内容 |
|---|---|---|
| Modify | `src/i18n/types.ts` | `ServiceItem` に `href?: string` を追加 |
| Modify | `src/i18n/ja.ts` | SNS運用代行アイテムに `href: '/services/sns/'` を追加 |
| Modify | `src/i18n/en.ts` | Social Media Management アイテムに `href: '/services/sns/'` を追加 |
| Modify | `src/components/sections/Service.astro` | `href` がある場合に「詳しく見る →」リンクを描画 |
| Create | `src/pages/services/sns.astro` | SNS 運用代行ページ本体（3タブ構成） |

---

### Task 1: ServiceItem 型に href を追加する

**Files:**
- Modify: `src/i18n/types.ts`

- [x] **Step 1: types.ts を編集する**

`src/i18n/types.ts` の `ServiceItem` を以下に変更:

```typescript
export interface ServiceItem {
  icon: string;
  title: string;
  description: string;
  href?: string;
}
```

- [x] **Step 2: TypeScript エラーがないか確認する**

```bash
npx tsc --noEmit
```

Expected: エラーなし（`href` はオプショナルなので既存コードへの影響なし）

- [x] **Step 3: コミット**

```bash
git add src/i18n/types.ts
git commit -m "feat: add optional href to ServiceItem type"
```

---

### Task 2: i18n ファイルに href を追加する

**Files:**
- Modify: `src/i18n/ja.ts`
- Modify: `src/i18n/en.ts`

- [x] **Step 1: ja.ts の SNS 運用代行アイテムに href を追加する**

`src/i18n/ja.ts` の `service.items[0]`（SNS運用代行）を以下に変更:

```typescript
{
  icon: '📱',
  title: 'SNS運用代行',
  description: 'クライアントのSNSアカウントの企画・投稿・分析を一括代行します。',
  href: '/services/sns/',
},
```

- [x] **Step 2: en.ts の Social Media Management アイテムに href を追加する**

`src/i18n/en.ts` の `service.items[0]`（Social Media Management）を以下に変更:

```typescript
{
  icon: '📱',
  title: 'Social Media Management',
  description:
    'End-to-end management of your social media accounts: planning, posting, and analytics.',
  href: '/services/sns/',
},
```

- [x] **Step 3: TypeScript エラーがないか確認する**

```bash
npx tsc --noEmit
```

Expected: エラーなし

- [x] **Step 4: コミット**

```bash
git add src/i18n/ja.ts src/i18n/en.ts
git commit -m "feat: add /services/sns/ href to SNS service i18n items"
```

---

### Task 3: Service.astro で「詳しく見る」リンクを描画する

**Files:**
- Modify: `src/components/sections/Service.astro`

- [x] **Step 1: Service.astro を編集する**

`src/components/sections/Service.astro` の `<div class="flex-1 min-w-0">` ブロック全体を以下に置き換える:

```astro
<div class="flex-1 min-w-0">
  <div class="sm:grid sm:grid-cols-[10rem_1fr] sm:gap-8 sm:items-baseline">
    <p class="font-bold text-text-primary text-sm mb-1 sm:mb-0">
      {service.title}
    </p>
    <div>
      <p class="text-text-secondary text-sm leading-relaxed">
        {service.description}
      </p>
      {service.href && (
        <a
          href={service.href}
          class="inline-block mt-2 text-xs text-accent hover:underline"
        >
          詳しく見る →
        </a>
      )}
    </div>
  </div>
</div>
```

- [x] **Step 2: 開発サーバーで確認する**

```bash
npm run dev
```

ブラウザで `http://localhost:4321/` を開き、Service セクションの「SNS運用代行」行の説明文の下に「詳しく見る →」（青色リンク）が表示されることを確認する。他の3つのサービス行にはリンクが表示されないことも確認する。

- [x] **Step 3: コミット**

```bash
git add src/components/sections/Service.astro
git commit -m "feat: render 詳しく見る link in Service section when href is set"
```

---

### Task 4: SNS 運用代行ページを作成する

**Files:**
- Create: `src/pages/services/sns.astro`

- [ ] **Step 1: src/pages/services/sns.astro を作成する**

```astro
---
import PageLayout from '@/layouts/PageLayout.astro';
import FadeIn from '@/components/ui/FadeIn.astro';
import Button from '@/components/ui/Button.astro';

const FORM_URL =
  'https://docs.google.com/forms/d/e/1FAIpQLSd2ycZEAgr4DpONjfTUOgKXUJ7cZTN5rNKaXy5WdyitG4Wqqg/viewform?usp=dialog';

type TableRow = {
  label: string;
  trial: boolean | string;
  basic: boolean | string;
  plus: boolean | string;
};

function cellClass(val: boolean | string): string {
  if (typeof val === 'string') return 'text-center text-text-secondary text-[10px]';
  return val ? 'text-center text-accent' : 'text-center text-text-muted';
}

function cellContent(val: boolean | string): string {
  if (typeof val === 'string') return val;
  return val ? '○' : '—';
}

const xRows: TableRow[] = [
  { label: '構成・キャプション作成', trial: true, basic: true, plus: true },
  { label: '画像制作', trial: true, basic: true, plus: true },
  { label: 'ショート動画制作', trial: true, basic: true, plus: true },
  { label: 'KPI管理シート更新', trial: true, basic: true, plus: true },
  { label: '分析レポート（改善提案含む）', trial: false, basic: false, plus: true },
  { label: '定例MTG（月1回）', trial: false, basic: false, plus: true },
  { label: 'サポート', trial: 'チャット', basic: 'チャット', plus: 'チャット＋MTG' },
];

const igStandardRows: TableRow[] = [
  { label: '構成・キャプション作成', trial: true, basic: true, plus: true },
  { label: '画像制作', trial: true, basic: true, plus: true },
  { label: 'ショート動画制作', trial: true, basic: true, plus: true },
  { label: 'KPI管理シート更新', trial: true, basic: true, plus: true },
  { label: '分析レポート（改善提案含む）', trial: false, basic: false, plus: true },
  { label: '定例MTG（月1回）', trial: false, basic: false, plus: true },
  { label: 'サポート', trial: 'チャット', basic: 'チャット', plus: 'チャット＋MTG' },
];

const igReelsRows: TableRow[] = [
  { label: '構成・キャプション作成', trial: true, basic: true, plus: true },
  { label: '動画制作', trial: true, basic: true, plus: true },
  { label: 'KPI管理シート更新', trial: true, basic: true, plus: true },
  { label: '分析レポート（改善提案含む）', trial: false, basic: false, plus: true },
  { label: '定例MTG（月1回）', trial: false, basic: false, plus: true },
  { label: 'サポート', trial: 'チャット', basic: 'チャット', plus: 'チャット＋MTG' },
];
---

<PageLayout
  title="SNS運用代行 | KCP"
  description="X・Threads・Instagramのアカウント企画・投稿・分析を一括代行。AIと人間のハイブリッド体制で高品質なコンテンツを安定提供します。"
>
  <section style="background-color: #0e0e0e;">
    <div class="section-wrapper">

      <!-- ヒーロー -->
      <FadeIn>
        <p class="font-mono text-xs font-medium text-accent tracking-[0.15em] uppercase mb-4">
          SERVICE
        </p>
        <h1 class="text-5xl sm:text-7xl font-black leading-none tracking-tight text-white mb-6">
          SNS運用代行
        </h1>
        <p class="text-text-secondary text-sm leading-relaxed max-w-xl">
          AIを活用したコンテンツ生成と、経験豊富な担当者による編集・品質管理を組み合わせた体制で、X・Threads・Instagramの企画・投稿・分析を一括代行します。
        </p>
      </FadeIn>

      <!-- タブボタン -->
      <FadeIn delay={80}>
        <div class="mt-12 flex overflow-x-auto border-b border-[#1e1e2e]">
          <button data-tab-btn="x" class="tab-btn tab-active shrink-0 px-5 py-3 text-sm font-bold">
            X / Threads
          </button>
          <button data-tab-btn="ig-standard" class="tab-btn shrink-0 px-5 py-3 text-sm font-bold">
            Instagram スタンダード
          </button>
          <button data-tab-btn="ig-reels" class="tab-btn shrink-0 px-5 py-3 text-sm font-bold">
            Instagram リールズ
          </button>
        </div>
      </FadeIn>

      <!-- ===== X / Threads タブ ===== -->
      <div data-tab-panel="x" class="pt-10">

        <!-- プランカード -->
        <p class="font-mono text-xs text-text-muted tracking-[0.15em] uppercase mb-5">PLAN</p>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">

          <div class="border border-[#1e1e2e] rounded-sm p-6" style="background-color: #111;">
            <p class="font-mono text-xs text-text-muted tracking-widest mb-3">TRIAL</p>
            <p class="text-3xl font-black text-accent mb-1">¥30,000</p>
            <p class="text-xs text-text-muted mb-5">/ 月（税別）</p>
            <div class="border-t border-[#1e1e2e] pt-4 space-y-1">
              <p class="text-xs text-text-secondary">投稿 10件/月</p>
              <p class="text-xs text-text-secondary">1ヶ月限定・翌月 Basic へ自動移行</p>
              <p class="text-xs text-text-secondary">チャットサポート</p>
            </div>
          </div>

          <div class="border border-accent/20 rounded-sm p-6 relative" style="background-color: #111;">
            <span class="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-black text-[10px] font-bold px-3 py-0.5 rounded-full">
              人気
            </span>
            <p class="font-mono text-xs text-text-muted tracking-widest mb-3">BASIC</p>
            <p class="text-3xl font-black text-white mb-1">¥50,000</p>
            <p class="text-xs text-text-muted mb-5">/ 月（税別）</p>
            <div class="border-t border-[#1e1e2e] pt-4 space-y-1">
              <p class="text-xs text-text-secondary">投稿 10件/月</p>
              <p class="text-xs text-text-secondary">チャットサポート</p>
            </div>
          </div>

          <div class="border border-[#1e1e2e] rounded-sm p-6" style="background-color: #111;">
            <p class="font-mono text-xs text-text-muted tracking-widest mb-3">PLUS</p>
            <p class="text-3xl font-black text-white mb-1">¥100,000</p>
            <p class="text-xs text-text-muted mb-5">/ 月（税別）</p>
            <div class="border-t border-[#1e1e2e] pt-4 space-y-1">
              <p class="text-xs text-text-secondary">投稿 20件/月</p>
              <p class="text-xs text-text-secondary">分析レポート（改善提案含む）</p>
              <p class="text-xs text-text-secondary">定例MTG 月1回</p>
              <p class="text-xs text-text-secondary">チャット＋MTGサポート</p>
            </div>
          </div>
        </div>

        <!-- 提供範囲テーブル -->
        <p class="font-mono text-xs text-text-muted tracking-[0.15em] uppercase mb-4">提供範囲</p>
        <div class="border border-[#1e1e2e] rounded-sm overflow-hidden mb-12">
          <div class="grid grid-cols-[1fr_4rem_4rem_4rem] text-xs text-text-muted font-mono py-2 px-4" style="background-color: #111;">
            <span></span>
            <span class="text-center">Trial</span>
            <span class="text-center">Basic</span>
            <span class="text-center">Plus</span>
          </div>
          {xRows.map((row, i) => (
            <div class={`grid grid-cols-[1fr_4rem_4rem_4rem] text-xs py-3 px-4 border-t border-[#1e1e2e]${i % 2 === 1 ? ' bg-[#0a0a0a]' : ''}`}>
              <span class="text-text-secondary">{row.label}</span>
              <span class={cellClass(row.trial)}>{cellContent(row.trial)}</span>
              <span class={cellClass(row.basic)}>{cellContent(row.basic)}</span>
              <span class={cellClass(row.plus)}>{cellContent(row.plus)}</span>
            </div>
          ))}
        </div>

        <!-- オプション -->
        <p class="font-mono text-xs text-text-muted tracking-[0.15em] uppercase mb-4">OPTION</p>
        <div class="border border-[#1e1e2e] rounded-sm" style="background-color: #111;">
          <div class="flex items-center justify-between px-5 py-4">
            <span class="text-sm text-text-secondary">競合調査・戦略企画</span>
            <span class="font-mono text-sm font-bold text-accent">¥30,000 / 回</span>
          </div>
        </div>
      </div>

      <!-- ===== Instagram スタンダードタブ ===== -->
      <div data-tab-panel="ig-standard" class="hidden pt-10">

        <!-- プランカード -->
        <p class="font-mono text-xs text-text-muted tracking-[0.15em] uppercase mb-5">PLAN</p>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">

          <div class="border border-[#1e1e2e] rounded-sm p-6" style="background-color: #111;">
            <p class="font-mono text-xs text-text-muted tracking-widest mb-3">TRIAL</p>
            <p class="text-3xl font-black text-accent mb-1">¥30,000</p>
            <p class="text-xs text-text-muted mb-5">/ 月（税別）</p>
            <div class="border-t border-[#1e1e2e] pt-4 space-y-1">
              <p class="text-xs text-text-secondary">フィード 4件/月</p>
              <p class="text-xs text-text-secondary">リールズ 2件/月</p>
              <p class="text-xs text-text-secondary">ストーリーズ 8件/月</p>
              <p class="text-xs text-text-secondary">1ヶ月限定・翌月 Basic へ自動移行</p>
              <p class="text-xs text-text-secondary">チャットサポート</p>
            </div>
          </div>

          <div class="border border-accent/20 rounded-sm p-6 relative" style="background-color: #111;">
            <span class="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-black text-[10px] font-bold px-3 py-0.5 rounded-full">
              人気
            </span>
            <p class="font-mono text-xs text-text-muted tracking-widest mb-3">BASIC</p>
            <p class="text-3xl font-black text-white mb-1">¥50,000</p>
            <p class="text-xs text-text-muted mb-5">/ 月（税別）</p>
            <div class="border-t border-[#1e1e2e] pt-4 space-y-1">
              <p class="text-xs text-text-secondary">フィード 6件/月</p>
              <p class="text-xs text-text-secondary">リールズ 2件/月</p>
              <p class="text-xs text-text-secondary">ストーリーズ 12件/月</p>
              <p class="text-xs text-text-secondary">チャットサポート</p>
            </div>
          </div>

          <div class="border border-[#1e1e2e] rounded-sm p-6" style="background-color: #111;">
            <p class="font-mono text-xs text-text-muted tracking-widest mb-3">PLUS</p>
            <p class="text-3xl font-black text-white mb-1">¥100,000</p>
            <p class="text-xs text-text-muted mb-5">/ 月（税別）</p>
            <div class="border-t border-[#1e1e2e] pt-4 space-y-1">
              <p class="text-xs text-text-secondary">フィード 12件/月</p>
              <p class="text-xs text-text-secondary">リールズ 6件/月</p>
              <p class="text-xs text-text-secondary">ストーリーズ 12件/月</p>
              <p class="text-xs text-text-secondary">分析レポート（改善提案含む）</p>
              <p class="text-xs text-text-secondary">定例MTG 月1回</p>
              <p class="text-xs text-text-secondary">チャット＋MTGサポート</p>
            </div>
          </div>
        </div>

        <!-- 提供範囲テーブル -->
        <p class="font-mono text-xs text-text-muted tracking-[0.15em] uppercase mb-4">提供範囲</p>
        <div class="border border-[#1e1e2e] rounded-sm overflow-hidden mb-12">
          <div class="grid grid-cols-[1fr_4rem_4rem_4rem] text-xs text-text-muted font-mono py-2 px-4" style="background-color: #111;">
            <span></span>
            <span class="text-center">Trial</span>
            <span class="text-center">Basic</span>
            <span class="text-center">Plus</span>
          </div>
          {igStandardRows.map((row, i) => (
            <div class={`grid grid-cols-[1fr_4rem_4rem_4rem] text-xs py-3 px-4 border-t border-[#1e1e2e]${i % 2 === 1 ? ' bg-[#0a0a0a]' : ''}`}>
              <span class="text-text-secondary">{row.label}</span>
              <span class={cellClass(row.trial)}>{cellContent(row.trial)}</span>
              <span class={cellClass(row.basic)}>{cellContent(row.basic)}</span>
              <span class={cellClass(row.plus)}>{cellContent(row.plus)}</span>
            </div>
          ))}
        </div>

        <!-- オプション -->
        <p class="font-mono text-xs text-text-muted tracking-[0.15em] uppercase mb-4">OPTION</p>
        <div class="border border-[#1e1e2e] rounded-sm divide-y divide-[#1e1e2e]" style="background-color: #111;">
          <div class="flex items-center justify-between px-5 py-4">
            <span class="text-sm text-text-secondary">競合調査・戦略企画</span>
            <span class="font-mono text-sm font-bold text-accent">¥30,000 / 回</span>
          </div>
          <div class="flex items-center justify-between px-5 py-4">
            <div>
              <span class="text-sm text-text-secondary">リールズ追加制作</span>
              <span class="ml-2 text-xs text-text-muted">最低5件〜</span>
            </div>
            <span class="font-mono text-sm font-bold text-accent">¥5,000 / 件</span>
          </div>
        </div>
      </div>

      <!-- ===== Instagram リールズタブ ===== -->
      <div data-tab-panel="ig-reels" class="hidden pt-10">

        <!-- プランカード -->
        <p class="font-mono text-xs text-text-muted tracking-[0.15em] uppercase mb-5">PLAN</p>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">

          <div class="border border-[#1e1e2e] rounded-sm p-6" style="background-color: #111;">
            <p class="font-mono text-xs text-text-muted tracking-widest mb-3">TRIAL</p>
            <p class="text-3xl font-black text-accent mb-1">¥50,000</p>
            <p class="text-xs text-text-muted mb-5">/ 月（税別）</p>
            <div class="border-t border-[#1e1e2e] pt-4 space-y-1">
              <p class="text-xs text-text-secondary">リールズ 8件/月</p>
              <p class="text-xs text-text-secondary">ストーリーズ 8件/月</p>
              <p class="text-xs text-text-secondary">1ヶ月限定・翌月 Basic へ自動移行</p>
              <p class="text-xs text-text-secondary">チャットサポート</p>
            </div>
          </div>

          <div class="border border-accent/20 rounded-sm p-6 relative" style="background-color: #111;">
            <span class="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-black text-[10px] font-bold px-3 py-0.5 rounded-full">
              人気
            </span>
            <p class="font-mono text-xs text-text-muted tracking-widest mb-3">BASIC</p>
            <p class="text-3xl font-black text-white mb-1">¥70,000</p>
            <p class="text-xs text-text-muted mb-5">/ 月（税別）</p>
            <div class="border-t border-[#1e1e2e] pt-4 space-y-1">
              <p class="text-xs text-text-secondary">リールズ 12件/月</p>
              <p class="text-xs text-text-secondary">ストーリーズ 12件/月</p>
              <p class="text-xs text-text-secondary">チャットサポート</p>
            </div>
          </div>

          <div class="border border-[#1e1e2e] rounded-sm p-6" style="background-color: #111;">
            <p class="font-mono text-xs text-text-muted tracking-widest mb-3">PLUS</p>
            <p class="text-3xl font-black text-white mb-1">¥120,000</p>
            <p class="text-xs text-text-muted mb-5">/ 月（税別）</p>
            <div class="border-t border-[#1e1e2e] pt-4 space-y-1">
              <p class="text-xs text-text-secondary">リールズ 20件/月</p>
              <p class="text-xs text-text-secondary">ストーリーズ 12件/月</p>
              <p class="text-xs text-text-secondary">分析レポート（改善提案含む）</p>
              <p class="text-xs text-text-secondary">定例MTG 月1回</p>
              <p class="text-xs text-text-secondary">チャット＋MTGサポート</p>
            </div>
          </div>
        </div>

        <!-- 提供範囲テーブル -->
        <p class="font-mono text-xs text-text-muted tracking-[0.15em] uppercase mb-4">提供範囲</p>
        <div class="border border-[#1e1e2e] rounded-sm overflow-hidden mb-12">
          <div class="grid grid-cols-[1fr_4rem_4rem_4rem] text-xs text-text-muted font-mono py-2 px-4" style="background-color: #111;">
            <span></span>
            <span class="text-center">Trial</span>
            <span class="text-center">Basic</span>
            <span class="text-center">Plus</span>
          </div>
          {igReelsRows.map((row, i) => (
            <div class={`grid grid-cols-[1fr_4rem_4rem_4rem] text-xs py-3 px-4 border-t border-[#1e1e2e]${i % 2 === 1 ? ' bg-[#0a0a0a]' : ''}`}>
              <span class="text-text-secondary">{row.label}</span>
              <span class={cellClass(row.trial)}>{cellContent(row.trial)}</span>
              <span class={cellClass(row.basic)}>{cellContent(row.basic)}</span>
              <span class={cellClass(row.plus)}>{cellContent(row.plus)}</span>
            </div>
          ))}
        </div>

        <!-- オプション -->
        <p class="font-mono text-xs text-text-muted tracking-[0.15em] uppercase mb-4">OPTION</p>
        <div class="border border-[#1e1e2e] rounded-sm divide-y divide-[#1e1e2e]" style="background-color: #111;">
          <div class="flex items-center justify-between px-5 py-4">
            <span class="text-sm text-text-secondary">競合調査・戦略企画</span>
            <span class="font-mono text-sm font-bold text-accent">¥30,000 / 回</span>
          </div>
          <div class="flex items-center justify-between px-5 py-4">
            <div>
              <span class="text-sm text-text-secondary">リールズ追加制作</span>
              <span class="ml-2 text-xs text-text-muted">最低5件〜</span>
            </div>
            <span class="font-mono text-sm font-bold text-accent">¥5,000 / 件</span>
          </div>
        </div>
      </div>

    </div>
  </section>

  <!-- 運用体制 -->
  <section style="background-color: #111;">
    <div class="section-wrapper">
      <FadeIn>
        <p class="font-mono text-xs text-text-muted tracking-[0.15em] uppercase mb-4">運用体制</p>
        <p class="text-text-secondary text-sm leading-relaxed max-w-2xl">
          AIによるコンテンツ生成と、経験豊富な運用担当者による編集・品質管理を組み合わせたハイブリッド体制で運用します。AIの効率性と人間の判断力を融合させることで、高品質なコンテンツを安定的に提供します。
        </p>
      </FadeIn>
    </div>
  </section>

  <!-- CTA -->
  <section style="background-color: #0a0a0a;">
    <div class="section-wrapper">
      <FadeIn>
        <div class="border-t-2 border-white pt-8 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6">
          <div>
            <p class="font-mono text-xs text-text-muted tracking-[0.15em] uppercase mb-2">Contact</p>
            <p class="text-white text-sm leading-relaxed">
              まずはお気軽にご相談ください。<br />
              ご要望をお聞きした上で、最適なプランをご提案します。
            </p>
          </div>
          <Button href={FORM_URL} variant="primary" target="_blank">
            お問い合わせ
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </Button>
        </div>
      </FadeIn>
    </div>
  </section>
</PageLayout>

<style>
  .tab-btn {
    color: #606070;
    border-bottom: 2px solid transparent;
    transition: color 0.2s, border-color 0.2s;
    background: transparent;
    cursor: pointer;
  }
  .tab-btn:hover {
    color: #f0f0f0;
  }
  .tab-btn.tab-active {
    color: #f0f0f0;
    border-bottom-color: #4a9eff;
  }
</style>

<script>
  const tabs = document.querySelectorAll<HTMLButtonElement>('[data-tab-btn]');
  const panels = document.querySelectorAll<HTMLElement>('[data-tab-panel]');

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.tabBtn;
      tabs.forEach((t) => t.classList.remove('tab-active'));
      panels.forEach((p) => p.classList.add('hidden'));
      tab.classList.add('tab-active');
      document.querySelector(`[data-tab-panel="${target}"]`)?.classList.remove('hidden');
    });
  });
</script>
```

- [x] **Step 2: ビルドエラーがないか確認する**

```bash
npx tsc --noEmit
```

Expected: エラーなし

- [x] **Step 3: 開発サーバーで動作確認する**

```bash
npm run dev
```

ブラウザで `http://localhost:4321/services/sns/` を開き、以下を確認する:

1. ヒーロー: 「SNS運用代行」見出しとサブテキストが表示される
2. タブ: 3つのタブボタンが並び、「X / Threads」がデフォルト選択状態（青いアンダーライン）
3. X/Threads タブ: Trial ¥30,000 / Basic ¥50,000 / Plus ¥100,000 の3カードが表示される
4. タブ切り替え: 「Instagram スタンダード」クリックでコンテンツが切り替わり、Trial ¥30,000 / Basic ¥50,000 / Plus ¥100,000 が表示される
5. 「Instagram リールズ」クリックで Trial ¥50,000 / Basic ¥70,000 / Plus ¥120,000 が表示される
6. 提供範囲テーブル: ○ が青色、— がグレーで表示される
7. 運用体制セクション: `#111` 背景で説明文が表示される
8. CTA: 「お問い合わせ」ボタンが表示され、クリックで Google Forms が新しいタブで開く
9. ホームページ (`http://localhost:4321/`) に戻り、Service セクションの「SNS運用代行」行に「詳しく見る →」が表示されている

- [x] **Step 4: 本番ビルドを確認する**

```bash
npm run build
```

Expected: エラーなし、`dist/services/sns/index.html` が生成される

- [x] **Step 5: コミット**

```bash
git add src/pages/services/sns.astro
git commit -m "feat: add SNS service page with 3-tab layout"
```

---

## 完了条件

- [x] `http://localhost:4321/services/sns/` でページが表示される
- [x] 3タブが正常に切り替わる
- [x] ホームの Service セクションに「詳しく見る →」リンクが表示される
- [x] `npm run build` がエラーなし完了する
