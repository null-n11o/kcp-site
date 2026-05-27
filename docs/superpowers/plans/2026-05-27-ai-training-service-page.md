# AI導入・研修支援 サービスページ Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `/services/ai-training/` にAI導入・研修支援サービスページを新設し、トップページのサービスリストからリンクを張る。

**Architecture:** `src/pages/services/ai-training.astro` を新規作成し、既存の `PageLayout`・`FadeIn`・`Button` コンポーネントを流用する。縦スクロール型で「ヒーロー → 4STEP → カリキュラム例 → CTA」の構成。新規コンポーネントなし。

**Tech Stack:** Astro SSG, Tailwind CSS, TypeScript

---

## File Map

| 操作 | ファイル | 変更内容 |
|---|---|---|
| 作成 | `src/pages/services/ai-training.astro` | サービスページ本体 |
| 修正 | `src/i18n/ja.ts` | AI導入支援エントリに `href` を追加 |
| 修正 | `src/i18n/en.ts` | AI Training エントリに `href` を追加 |

---

## Task 1: フィーチャーブランチを作成する

**Files:** なし（git操作のみ）

- [x] **Step 1: ブランチを作成してチェックアウト**

```bash
git checkout main && git pull origin main
git checkout -b feat/ai-training-service-page
```

Expected: `Switched to a new branch 'feat/ai-training-service-page'`

---

## Task 2: i18n に href を追加する

**Files:**
- Modify: `src/i18n/ja.ts`
- Modify: `src/i18n/en.ts`

- [x] **Step 1: `src/i18n/ja.ts` の AI導入支援エントリを編集する**

対象箇所（`src/i18n/ja.ts` の `service.items` 配列内）:

```ts
// 変更前
{
  icon: '🤖',
  title: 'AI導入支援',
  description: '現場に合ったAI導入で業務効率を向上します。',
},

// 変更後
{
  icon: '🤖',
  title: 'AI導入支援',
  description: '現場に合ったAI導入で業務効率を向上します。',
  href: '/services/ai-training/',
},
```

- [x] **Step 2: `src/i18n/en.ts` の AI Training エントリを編集する**

対象箇所（`src/i18n/en.ts` の `service.items` 配列内）:

```ts
// 変更前
{
  icon: '🤖',
  title: 'AI Training',
  description:
    'Designing and delivering AI utilization training for businesses. Tailored to your workplace for real efficiency gains.',
},

// 変更後
{
  icon: '🤖',
  title: 'AI Training',
  description:
    'Designing and delivering AI utilization training for businesses. Tailored to your workplace for real efficiency gains.',
  href: '/services/ai-training/',
},
```

- [x] **Step 3: ビルドが通ることを確認**

```bash
npm run build
```

Expected: エラーなし（`dist/` に出力される）

- [x] **Step 4: コミット**

```bash
git add src/i18n/ja.ts src/i18n/en.ts
git commit -m "feat: add /services/ai-training/ href to AI service i18n items"
```

---

## Task 3: AI研修サービスページを作成する

**Files:**
- Create: `src/pages/services/ai-training.astro`

- [x] **Step 1: ファイルを作成する**

`src/pages/services/ai-training.astro` を以下の内容で作成する:

```astro
---
import PageLayout from '@/layouts/PageLayout.astro';
import FadeIn from '@/components/ui/FadeIn.astro';
import Button from '@/components/ui/Button.astro';

const FORM_URL =
  'https://docs.google.com/forms/d/e/1FAIpQLSd2ycZEAgr4DpONjfTUOgKXUJ7cZTN5rNKaXy5WdyitG4Wqqg/viewform?usp=dialog';

const steps = [
  {
    number: '01',
    title: '現状診断',
    description:
      '業務フロー・課題のヒアリング（1〜2時間）。AIで効率化できる領域を特定し、優先順位付きの改善ロードマップを作成・提示します。',
    deliverable: '診断レポート',
  },
  {
    number: '02',
    title: '研修プログラム設計',
    description:
      '対象者のITリテラシー・業務内容に合わせたカリキュラム設計。使用ツール選定と座学＋実践形式の構成で、すぐ業務で使える内容を優先します。',
    deliverable: '研修カリキュラム・資料一式',
  },
  {
    number: '03',
    title: '研修実施',
    description:
      '設計したプログラムを実施。実務を想定したハンズオン形式で、参加者からのQ&Aにも対応します。',
    deliverable: '研修実施・議事録・参加者フォローアップ',
  },
  {
    number: '04',
    title: '定着支援',
    description:
      '研修後の活用状況確認（月1回程度）。追加Q&A・応用研修・社内AI推進担当者へのメンタリングを提供します。',
    deliverable: '月次レポート・改善提案',
  },
];

const curriculum = [
  {
    category: '基礎編',
    topics: [
      'AIとは何か・ビジネスへの影響（経営者向け概論）',
      'ChatGPT / Claudeの基本的な使い方',
      'プロンプトエンジニアリング入門',
      'AIツール選定の考え方',
    ],
  },
  {
    category: '業務活用編',
    topics: [
      '文書作成・要約・翻訳へのAI活用',
      '営業・マーケティングへのAI活用',
      'カスタマーサポートへのAI活用',
      '社内ナレッジ管理へのAI活用',
    ],
  },
  {
    category: '実装・自動化編',
    topics: [
      'n8nを使った業務自動化入門',
      'APIの基本と活用方法',
      'AIエージェントの設計・運用',
      'Claude Codeを使った簡易ツール開発',
    ],
  },
  {
    category: 'AI経営編',
    topics: [
      'AIネイティブな組織・業務設計',
      'AI導入のROI計測・評価方法',
      '社内AI推進担当者の育て方',
    ],
  },
];
---

<PageLayout
  title="AI導入・研修支援 | KCP"
  description="業務に合わせたカスタマイズ型AI研修で、御社の人材をAI人材に。現状診断から研修実施・定着支援まで一貫して支援します。"
>
  <!-- ヒーロー -->
  <section style="background-color: #0e0e0e;">
    <div class="section-wrapper">
      <FadeIn>
        <p class="font-mono text-xs font-medium text-accent tracking-[0.15em] uppercase mb-4">
          SERVICE
        </p>
        <h1 class="text-5xl sm:text-7xl font-black leading-none tracking-tight text-white mb-6">
          AI導入・研修支援
        </h1>
        <p class="text-text-secondary text-sm leading-relaxed max-w-xl">
          業務に合わせたカスタマイズ型AI研修で、御社の人材をAI人材に。現状診断から研修実施・定着支援まで一貫して支援します。
        </p>
      </FadeIn>
    </div>
  </section>

  <!-- 進め方 -->
  <section style="background-color: #111;">
    <div class="section-wrapper">
      <FadeIn>
        <p class="font-mono text-xs text-text-muted tracking-[0.15em] uppercase mb-8">
          HOW IT WORKS
        </p>
      </FadeIn>
      <div class="flex flex-col">
        {steps.map((step, i) => (
          <FadeIn delay={i * 80}>
            <div class="py-6 border-b border-[#1e1e2e]">
              <div class="flex gap-5 items-start">
                <span class="font-mono font-black text-accent/40 text-sm w-6 shrink-0 pt-px">
                  {step.number}
                </span>
                <div class="flex-1 min-w-0 sm:grid sm:grid-cols-[10rem_1fr] sm:gap-8">
                  <p class="font-bold text-text-primary text-sm mb-2 sm:mb-0">{step.title}</p>
                  <div>
                    <p class="text-text-secondary text-sm leading-relaxed mb-2">
                      {step.description}
                    </p>
                    <p class="font-mono text-xs text-text-muted">成果物: {step.deliverable}</p>
                  </div>
                </div>
              </div>
            </div>
          </FadeIn>
        ))}
      </div>
    </div>
  </section>

  <!-- カリキュラム例 -->
  <section style="background-color: #0e0e0e;">
    <div class="section-wrapper">
      <FadeIn>
        <p class="font-mono text-xs text-text-muted tracking-[0.15em] uppercase mb-2">
          CURRICULUM
        </p>
        <p class="text-text-secondary text-sm mb-8">
          顧客ニーズに応じて組み合わせてカスタマイズします。
        </p>
      </FadeIn>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {curriculum.map((cat, i) => (
          <FadeIn delay={i * 60}>
            <div class="border border-[#1e1e2e] rounded-sm p-6" style="background-color: #111;">
              <p class="font-mono text-xs text-accent tracking-widest mb-4">{cat.category}</p>
              <ul class="space-y-2">
                {cat.topics.map((topic) => (
                  <li class="text-xs text-text-secondary leading-relaxed flex gap-2">
                    <span class="text-accent/40 shrink-0">—</span>
                    {topic}
                  </li>
                ))}
              </ul>
            </div>
          </FadeIn>
        ))}
      </div>
    </div>
  </section>

  <!-- CTA -->
  <section style="background-color: #0a0a0a;">
    <div class="section-wrapper">
      <FadeIn>
        <div class="border-t-2 border-white pt-8 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6">
          <div>
            <p class="font-mono text-xs text-text-muted tracking-[0.15em] uppercase mb-2">
              Contact
            </p>
            <p class="text-white text-sm leading-relaxed">
              まずはお気軽にご相談ください。<br />
              料金・スケジュール・カリキュラムの詳細はヒアリングの上ご提案します。
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
```

- [x] **Step 2: ビルドが通ることを確認**

```bash
npm run build
```

Expected: エラーなし

- [x] **Step 3: 開発サーバーで目視確認**

```bash
npm run dev
```

ブラウザで `http://localhost:4321/services/ai-training/` を開き以下を確認:
- ヒーローの h1「AI導入・研修支援」が表示される
- 4STEPが番号付きで縦に並んでいる
- カリキュラムが2列グリッドで4カード表示される
- CTAボタンが表示される
- トップページ（`http://localhost:4321/`）のサービスセクションの「AI導入支援」に「詳しく見る →」リンクが表示される

- [x] **Step 4: コミット**

```bash
git add src/pages/services/ai-training.astro
git commit -m "feat: add AI training service page"
```

---

## Task 4: PRを作成する

**Files:** なし（git/GitHub操作のみ）

- [x] **Step 1: プッシュ**

```bash
git push -u origin feat/ai-training-service-page
```

- [x] **Step 2: PR作成**

```bash
gh pr create \
  --title "feat: add AI training service page" \
  --body "$(cat <<'EOF'
## Summary
- `/services/ai-training/` にAI導入・研修支援サービスページを新設
- ヒーロー → 4STEP → カリキュラム例 → CTA の縦スクロール構成
- `ja.ts` / `en.ts` のAI導入支援エントリに `href` を追加し、トップページからリンク

## Test plan
- [ ] `npm run build` が成功する
- [ ] `/services/ai-training/` でヒーロー・4STEP・カリキュラム・CTAが表示される
- [ ] トップページのサービスセクションに「詳しく見る →」リンクが表示される
- [ ] モバイル幅でレイアウトが崩れない

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

