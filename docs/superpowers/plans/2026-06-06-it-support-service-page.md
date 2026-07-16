# 丸投げIT担当 サービスページ — 実装プラン

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `/services/it-support/` に「丸投げIT担当」の専用LPページを新設し、トップページのサービス一覧・ヒーローテキストをメインサービスとして更新する。

**Architecture:** 既存の `sns.astro` と同じパターン（`PageLayout` + `FadeIn` + `Button`）を踏襲。全コンテンツをページファイルのフロントマターにインライン定義し、CMS・外部データソースなし。FAQ は `<details>/<summary>` で JS なし実装。

**Tech Stack:** Astro SSG, Tailwind CSS, TypeScript（フロントマター内）

---

## ファイル構成

| ファイル | 操作 | 内容 |
|---|---|---|
| `src/pages/services/it-support.astro` | 新規作成 | サービス詳細ページ（全9セクション） |
| `src/i18n/ja.ts` | 編集 | `hero.subtext` + `service.items` 先頭追加 |

---

## Task 1: `ja.ts` のトップページ内容を更新する

**Files:**
- Modify: `src/i18n/ja.ts`

- [x] **Step 0: feature ブランチを作成する**

```bash
git checkout -b feat/it-support-service-page
```

- [x] **Step 1: `hero.subtext` を更新する**

`src/i18n/ja.ts` の以下の行を変更する:

```ts
// 変更前
subtext:
  'SNS運用代行・受託開発・AI導入支援を通じて、共に変化を起こすパートナーとして伴奏いたします。',

// 変更後
subtext:
  '中小企業のIT・AI担当として、月額固定で実作業まで引き受けます。SNS運用・システム改修・AI導入——何でも気軽に頼める「社内のIT担当者」が、今日から持てます。',
```

- [x] **Step 2: `service.items` の先頭に丸投げIT担当を追加する**

`src/i18n/ja.ts` の `service.items` 配列の最初の要素として追加する:

```ts
items: [
  // ↓ 先頭に追加
  {
    icon: '🧑‍💻',
    title: '丸投げIT担当',
    description:
      '月額固定でKCPがあなたの会社のIT・AI担当になります。チャット相談から実作業まで一括で引き受けます。',
    href: '/services/it-support/',
  },
  // ↓ 既存エントリはそのまま残す
  {
    icon: '📱',
    title: 'SNS運用代行',
    ...
  },
  ...
```

- [x] **Step 3: ビルドエラーがないか確認する**

```bash
npm run build
```

期待: エラーなしで `dist/` が生成される。

- [x] **Step 4: コミット**

```bash
git add src/i18n/ja.ts
git commit -m "feat: トップページのヒーローとサービス一覧を丸投げIT担当中心に更新"
```

---

## Task 2: `it-support.astro` の骨格 + Hero + PROBLEM + FEATURE セクション

**Files:**
- Create: `src/pages/services/it-support.astro`

- [x] **Step 1: ファイルを新規作成する**

`src/pages/services/it-support.astro` を以下の内容で作成する:

```astro
---
import PageLayout from '@/layouts/PageLayout.astro';
import FadeIn from '@/components/ui/FadeIn.astro';
import Button from '@/components/ui/Button.astro';

const FORM_URL =
  'https://docs.google.com/forms/d/e/1FAIpQLSd2ycZEAgr4DpONjfTUOgKXUJ7cZTN5rNKaXy5WdyitG4Wqqg/viewform?usp=dialog';

const problems = [
  '社内にIT・AIに詳しい人間がいない',
  'SNS・ホームページ・システムの改修を誰に頼めばいいかわからない',
  '複数の業者に個別発注していて管理が煩雑になっている',
  '専任のIT担当を採用するほどの規模でも予算でもない',
  'AIを使いたいが導入のハードルが高い',
];

const features = [
  {
    title: 'プロダクトではなく、人が動くサービスです',
    description:
      'チャットで気軽に相談でき、実際にあらゆるITやAIに関するタスクを完了させるところまでKCPが担います。「何かあれば連絡する」人間が一人いる状態を月額固定でつくります。',
  },
  {
    title: 'IT・AI特化',
    description:
      'SNS運用・システム改修・LP制作・AI導入支援まで、IT・AIに関わる業務を横断的に対応します。技術的な業務であれば全て動ける幅広さが強みです。',
  },
  {
    title: 'チケット制で稼働を可視化',
    description:
      '月に何をどれだけ依頼したかがチケット単位で明確になります。「何に払っているかわからない」という不透明さがなく、依頼内容と消費チケット数を常に把握できます。',
  },
];
---

<PageLayout
  title="丸投げIT担当 | KCP"
  description="月額固定でKCPがあなたの会社のIT・AI担当になります。チャット相談から実作業まで一括で引き受けます。"
>
  <!-- Hero -->
  <section style="background-color: #0e0e0e;">
    <div class="section-wrapper">
      <FadeIn>
        <p class="font-mono text-xs font-medium text-accent tracking-[0.15em] uppercase mb-4">
          SERVICE
        </p>
        <h1 class="text-5xl sm:text-7xl font-black leading-none tracking-tight text-white mb-6">
          丸投げIT担当
        </h1>
        <p class="text-text-secondary text-sm leading-relaxed max-w-xl">
          「SNSをやりたいけど誰もできない」「AIを使いたいが何から始めればいいかわからない」——月額固定でKCPがあなたの会社のIT・AI担当になります。
        </p>
      </FadeIn>
    </div>
  </section>

  <!-- PROBLEM -->
  <section style="background-color: #111;">
    <div class="section-wrapper">
      <FadeIn>
        <p class="font-mono text-xs text-text-muted tracking-[0.15em] uppercase mb-8">PROBLEM</p>
      </FadeIn>
      <div class="flex flex-col">
        {problems.map((problem, i) => (
          <FadeIn delay={i * 60}>
            <div class="flex gap-5 items-start py-5 border-b border-[#1e1e2e]">
              <span class="font-mono font-black text-accent/40 text-sm w-6 shrink-0 pt-px">
                {String(i + 1).padStart(2, '0')}
              </span>
              <p class="text-text-secondary text-sm leading-relaxed">{problem}</p>
            </div>
          </FadeIn>
        ))}
      </div>
    </div>
  </section>

  <!-- FEATURE -->
  <section style="background-color: #0e0e0e;">
    <div class="section-wrapper">
      <FadeIn>
        <p class="font-mono text-xs text-text-muted tracking-[0.15em] uppercase mb-8">FEATURE</p>
      </FadeIn>
      <div class="flex flex-col">
        {features.map((feature, i) => (
          <FadeIn delay={i * 60}>
            <div class="py-6 border-b border-[#1e1e2e]">
              <div class="flex gap-5 items-start">
                <span class="font-mono font-black text-accent/40 text-sm w-6 shrink-0 pt-px">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div>
                  <p class="font-bold text-text-primary text-sm mb-2">{feature.title}</p>
                  <p class="text-text-secondary text-sm leading-relaxed">{feature.description}</p>
                </div>
              </div>
            </div>
          </FadeIn>
        ))}
      </div>
    </div>
  </section>
</PageLayout>
```

- [x] **Step 2: 開発サーバーで表示を確認する**

```bash
npm run dev
```

ブラウザで `http://localhost:4321/services/it-support/` を開く。
期待: Hero（「丸投げIT担当」大見出し）→ PROBLEM（5項目）→ FEATURE（3項目）が表示される。

- [x] **Step 3: コミット**

```bash
git add src/pages/services/it-support.astro
git commit -m "feat: 丸投げIT担当ページ — Hero・PROBLEM・FEATUREセクション追加"
```

---

## Task 3: PLAN + TICKET GUIDE セクションを追加する

**Files:**
- Modify: `src/pages/services/it-support.astro`

- [x] **Step 1: フロントマターに `ticketGuide` データを追加する**

`---` の閉じタグの直前（`features` 配列の定義の後）に以下を追加する:

```ts
const ticketGuide = [
  { task: 'チャット相談（15分以内）', tickets: '0（無料）' },
  { task: 'WebMTG相談（1時間）', tickets: '1' },
  { task: 'X・Threads投稿1本', tickets: '1' },
  { task: 'Instagram リール・TikTok動画（1分）', tickets: '2' },
  { task: '文字改修など軽微なシステム改修・設定変更', tickets: '1' },
  { task: 'LP・資料・PDF作成（シンプルなもの。要件に合わせて事前にお見積り）', tickets: '2' },
  { task: 'AI導入支援・設定代行', tickets: '要件に合わせて事前にお見積り' },
  { task: '新規システム開発', tickets: '要件に合わせて事前にお見積り' },
];
```

- [x] **Step 2: PLAN + TICKET GUIDE セクションを `</PageLayout>` の直前に追加する**

```astro
  <!-- PLAN -->
  <section style="background-color: #111;">
    <div class="section-wrapper">
      <FadeIn>
        <p class="font-mono text-xs text-text-muted tracking-[0.15em] uppercase mb-8">PLAN</p>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div class="border border-[#1e1e2e] rounded-sm p-6" style="background-color: #0e0e0e;">
            <p class="font-mono text-xs text-text-muted tracking-widest mb-3">LIGHT</p>
            <p class="text-3xl font-black text-accent mb-1">¥50,000</p>
            <p class="text-xs text-text-muted mb-5">/ 月（税別）</p>
            <div class="border-t border-[#1e1e2e] pt-4 space-y-1">
              <p class="text-xs text-text-secondary">10チケット / 月</p>
              <p class="text-xs text-text-secondary">1チケット単価 ¥5,000</p>
            </div>
          </div>
          <div class="border border-accent/20 rounded-sm p-6 relative" style="background-color: #0e0e0e;">
            <span class="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-black text-[10px] font-bold px-3 py-0.5 rounded-full">
              人気
            </span>
            <p class="font-mono text-xs text-text-muted tracking-widest mb-3">STANDARD</p>
            <p class="text-3xl font-black text-white mb-1">¥100,000</p>
            <p class="text-xs text-text-muted mb-5">/ 月（税別）</p>
            <div class="border-t border-[#1e1e2e] pt-4 space-y-1">
              <p class="text-xs text-text-secondary">25チケット / 月</p>
              <p class="text-xs text-text-secondary">1チケット単価 ¥4,000</p>
            </div>
          </div>
          <div class="border border-[#1e1e2e] rounded-sm p-6" style="background-color: #0e0e0e;">
            <p class="font-mono text-xs text-text-muted tracking-widest mb-3">PREMIUM</p>
            <p class="text-3xl font-black text-white mb-1">¥200,000</p>
            <p class="text-xs text-text-muted mb-5">/ 月（税別）</p>
            <div class="border-t border-[#1e1e2e] pt-4 space-y-1">
              <p class="text-xs text-text-secondary">55チケット / 月</p>
              <p class="text-xs text-text-secondary">1チケット単価 ¥3,636</p>
            </div>
          </div>
        </div>
        <div class="border border-[#1e1e2e] rounded-sm p-5 space-y-2" style="background-color: #0e0e0e;">
          <p class="text-xs text-text-secondary">チャット対応：無制限・無料（30分以下の相談はチケット消費なし）</p>
          <p class="text-xs text-text-secondary">契約条件：6か月更新</p>
          <p class="text-xs text-text-secondary">未使用チケットの翌月繰り越しなし</p>
        </div>
      </FadeIn>
    </div>
  </section>

  <!-- TICKET GUIDE -->
  <section style="background-color: #0e0e0e;">
    <div class="section-wrapper">
      <FadeIn>
        <p class="font-mono text-xs text-text-muted tracking-[0.15em] uppercase mb-4">TICKET GUIDE</p>
        <p class="text-xs text-text-muted mb-6">1チケット ＝ 1時間相当のタスク</p>
        <div class="border border-[#1e1e2e] rounded-sm overflow-hidden">
          <div class="grid grid-cols-[1fr_9rem] text-xs text-text-muted font-mono py-2 px-4" style="background-color: #111;">
            <span>タスク内容</span>
            <span class="text-right">チケット数</span>
          </div>
          {ticketGuide.map((row, i) => (
            <div class={`grid grid-cols-[1fr_9rem] text-xs py-3 px-4 border-t border-[#1e1e2e]${i % 2 === 1 ? ' bg-[#0a0a0a]' : ''}`}>
              <span class="text-text-secondary">{row.task}</span>
              <span class="font-mono text-accent text-right">{row.tickets}</span>
            </div>
          ))}
        </div>
        <p class="text-xs text-text-muted mt-3">
          ※ タスクの複雑度・ボリュームによって変動します。都度ご相談させていただきます。
        </p>
      </FadeIn>
    </div>
  </section>
```

- [x] **Step 3: ブラウザで確認する**

`http://localhost:4321/services/it-support/` をリロードして、PLAN（3カード + 補足）と TICKET GUIDE（9行テーブル）が FEATURE セクションの下に表示されることを確認する。

- [x] **Step 4: コミット**

```bash
git add src/pages/services/it-support.astro
git commit -m "feat: 丸投げIT担当ページ — PLAN・TICKET GUIDEセクション追加"
```

---

## Task 4: SCOPE + COMPARISON セクションを追加する

**Files:**
- Modify: `src/pages/services/it-support.astro`

- [x] **Step 1: フロントマターに `scopeItems` と `comparisonRows` を追加する**

`ticketGuide` の定義の後に以下を追加する:

```ts
const scopeItems = [
  {
    category: 'SNS・コンテンツ',
    items: [
      'SNS投稿の企画・作成・投稿代行（X・Threads・Instagram・TikTok）',
      'SNSアカウントの運用管理・分析レポート',
      'ブログ・オウンドメディアの記事作成',
      'LP（ランディングページ）の構成・制作',
    ],
  },
  {
    category: 'システム・開発',
    items: [
      '新規システム開発',
      '既存システムの軽微な改修・設定変更',
      'ホームページの作成・更新・修正',
      '業務効率化ツールの導入支援・設定（kintone・Notion・Slack 等）',
    ],
  },
  {
    category: 'AI活用',
    items: [
      '自社業務に合ったAIツールの選定・提案',
      'ChatGPT・Claude 等の社内導入支援',
      '業務自動化フローの設計・構築',
      'AI活用に関する相談・レクチャー',
    ],
  },
  {
    category: 'その他IT全般',
    items: [
      'ITツール・SaaS の選定・比較',
      '各種クラウドサービスの初期設定・管理',
      'IT関連業者の選定・折衝のサポート',
      'メール・チャットでの技術的な相談対応',
    ],
  },
];

const comparisonRows = [
  { axis: '月額コスト', employee: '30〜50万円以上（給与＋社保）', kcp: '10万円〜' },
  { axis: '採用コスト', employee: '50〜100万円', kcp: 'なし' },
  { axis: '即戦力性', employee: '教育期間が必要', kcp: '即日対応可' },
  { axis: '離職リスク', employee: 'あり', kcp: 'なし' },
  { axis: 'スキルの幅', employee: '個人のスキルに依存', kcp: 'IT・AI横断で対応' },
  { axis: '契約柔軟性', employee: '解雇は困難', kcp: '月次で判断可能' },
];
```

- [x] **Step 2: SCOPE + COMPARISON セクションを `</PageLayout>` の直前に追加する**

```astro
  <!-- SCOPE -->
  <section style="background-color: #111;">
    <div class="section-wrapper">
      <FadeIn>
        <p class="font-mono text-xs text-text-muted tracking-[0.15em] uppercase mb-8">SCOPE</p>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {scopeItems.map((scope) => (
            <div class="border border-[#1e1e2e] rounded-sm p-6" style="background-color: #0e0e0e;">
              <p class="font-bold text-text-primary text-sm mb-4">{scope.category}</p>
              <ul class="space-y-2">
                {scope.items.map((item) => (
                  <li class="flex gap-2 text-xs text-text-secondary">
                    <span class="text-accent shrink-0">—</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </FadeIn>
    </div>
  </section>

  <!-- COMPARISON -->
  <section style="background-color: #0e0e0e;">
    <div class="section-wrapper">
      <FadeIn>
        <p class="font-mono text-xs text-text-muted tracking-[0.15em] uppercase mb-8">COMPARISON</p>
        <div class="border border-[#1e1e2e] rounded-sm overflow-hidden">
          <div class="grid grid-cols-3 text-xs text-text-muted font-mono py-2 px-4" style="background-color: #111;">
            <span>比較軸</span>
            <span>正社員採用</span>
            <span>丸投げIT担当</span>
          </div>
          {comparisonRows.map((row, i) => (
            <div class={`grid grid-cols-3 text-xs py-3 px-4 border-t border-[#1e1e2e]${i % 2 === 1 ? ' bg-[#0a0a0a]' : ''}`}>
              <span class="text-text-secondary font-medium">{row.axis}</span>
              <span class="text-text-muted">{row.employee}</span>
              <span class="text-accent font-medium">{row.kcp}</span>
            </div>
          ))}
        </div>
      </FadeIn>
    </div>
  </section>
```

- [x] **Step 3: ブラウザで確認する**

`http://localhost:4321/services/it-support/` をリロードして、SCOPE（2×2カードグリッド）と COMPARISON（6行比較表）が表示されることを確認する。

- [x] **Step 4: コミット**

```bash
git add src/pages/services/it-support.astro
git commit -m "feat: 丸投げIT担当ページ — SCOPE・COMPARISONセクション追加"
```

---

## Task 5: FIT FOR + FAQ + CTA セクションを追加する

**Files:**
- Modify: `src/pages/services/it-support.astro`

- [x] **Step 1: フロントマターに `fitItems` と `faqs` を追加する**

`comparisonRows` の定義の後に以下を追加する:

```ts
const fitItems = [
  'IT・AIの専任担当がいない、または不在になった会社',
  'SNSやホームページの更新が後回しになっている会社',
  'DXやAI活用に興味はあるが何から始めればいいかわからない会社',
  '複数の業者に個別発注していて管理コストが高くなっている会社',
  'まず小さく試してから判断したい会社',
];

const faqs = [
  {
    q: '未使用チケットは翌月に繰り越せますか？',
    a: '毎月安定した稼働をお客様に確保するため、繰り越しには対応していません。月ごとにリセットされます。',
  },
  {
    q: 'チケット数が足りなくなった場合はどうなりますか？',
    a: 'その月の追加チケット購入（スポット対応）か、翌月のプランアップグレードをご提案します。',
  },
  {
    q: '首都圏外でも利用できますか？',
    a: 'チャット・リモートでの対応は全国対応可能です。交通費込みの訪問対応は首都圏（東京・神奈川・埼玉・千葉）に限ります。',
  },
  {
    q: '開発そのものも対応できますか？',
    a: '対応可能です。チケット範囲内で収まらない開発の場合は別途別サービスとしてお見積りをさせていただきます。',
  },
  {
    q: '契約前に相談できますか？',
    a: '初回相談は無料です。現状の課題・依頼したい業務・予算感をお聞きした上で、最適なプランをご提案します。',
  },
];
```

- [x] **Step 2: FIT FOR + FAQ + CTA セクションを `</PageLayout>` の直前に追加する**

```astro
  <!-- FIT FOR -->
  <section style="background-color: #111;">
    <div class="section-wrapper">
      <FadeIn>
        <p class="font-mono text-xs text-text-muted tracking-[0.15em] uppercase mb-8">FIT FOR</p>
      </FadeIn>
      <div class="flex flex-col">
        {fitItems.map((item, i) => (
          <FadeIn delay={i * 60}>
            <div class="flex gap-4 items-start py-5 border-b border-[#1e1e2e]">
              <span class="text-accent shrink-0 font-bold text-sm pt-px">✓</span>
              <p class="text-text-secondary text-sm leading-relaxed">{item}</p>
            </div>
          </FadeIn>
        ))}
      </div>
    </div>
  </section>

  <!-- FAQ -->
  <section style="background-color: #0e0e0e;">
    <div class="section-wrapper">
      <FadeIn>
        <p class="font-mono text-xs text-text-muted tracking-[0.15em] uppercase mb-8">FAQ</p>
        <div class="flex flex-col">
          {faqs.map((faq) => (
            <details class="group border-b border-[#1e1e2e]">
              <summary class="flex items-center justify-between py-5 cursor-pointer list-none text-sm font-bold text-text-primary hover:text-white transition-colors">
                {faq.q}
                <span class="ml-4 shrink-0 text-accent font-mono text-lg leading-none group-open:rotate-45 transition-transform inline-block origin-center">
                  +
                </span>
              </summary>
              <p class="pb-5 text-sm text-text-secondary leading-relaxed">{faq.a}</p>
            </details>
          ))}
        </div>
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
              現状の課題をお聞きし、どのタスクをKCPに任せると効果的かをご提案します。<br />
              初回相談は無料です。
            </p>
          </div>
          <Button href={FORM_URL} variant="primary" target="_blank">
            まずは無料相談
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </Button>
        </div>
      </FadeIn>
    </div>
  </section>
```

- [x] **Step 3: ブラウザで全セクションを確認する**

`http://localhost:4321/services/it-support/` をリロードして以下を確認する:
- FIT FOR（6項目チェックリスト）が表示される
- FAQ の各 `<details>` をクリックすると回答が開閉する（JSなし）
- `+` アイコンが開いたときに `×` 形に回転する
- CTA の「まずは無料相談」ボタンが表示され、クリックすると Google Forms が開く

- [x] **Step 4: コミット**

```bash
git add src/pages/services/it-support.astro
git commit -m "feat: 丸投げIT担当ページ — FIT FOR・FAQ・CTAセクション追加"
```

---

## Task 6: 本番ビルド確認

**Files:**
- なし（確認のみ）

- [x] **Step 1: 本番ビルドを実行する**

```bash
npm run build
```

期待: エラー・警告なしで完了する。

- [x] **Step 2: ビルド結果をプレビューして最終確認する**

```bash
npm run preview
```

`http://localhost:4321/services/it-support/` と `http://localhost:4321/` を開いて以下を確認する:
- `/services/it-support/` — 9セクションが全て表示される
- `/` — サービス一覧の先頭に「🧑‍💻 丸投げIT担当」が表示される
- `/` — ヒーローのサブテキストが更新されている

- [x] **Step 3: プランファイルの完了ステップを更新してコミット**

`docs/superpowers/plans/2026-06-06-it-support-service-page.md` の全チェックボックスが `- [x]` になっていることを確認してコミットする:

```bash
git add docs/superpowers/plans/2026-06-06-it-support-service-page.md
git commit -m "docs: 丸投げIT担当ページ実装プランを完了に更新"
```

- [x] **Step 4: PR を作成する**

```bash
git push origin feat/it-support-service-page
gh pr create \
  --title "feat: 丸投げIT担当サービスページを新設しトップページを更新" \
  --body "$(cat <<'EOF'
## Summary
- \`/services/it-support/\` に「丸投げIT担当」の専用LPページを新設
- トップページのサービス一覧先頭に「丸投げIT担当」を追加
- ヒーローサブテキストをメインサービスに合わせて更新

## Test plan
- [x] \`/services/it-support/\` — 9セクション（Hero〜CTA）が全て表示される
- [x] FAQ アコーディオンが JS なしで開閉する
- [x] トップページのサービス一覧先頭に「丸投げIT担当」が表示される
- [x] トップページのヒーローサブテキストが更新されている
- [x] \`npm run build\` がエラーなしで完了する

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```
