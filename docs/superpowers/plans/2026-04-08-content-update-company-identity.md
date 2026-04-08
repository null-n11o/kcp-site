# Company Identity Content Update Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `docs/company-identity.md` の内容に合わせて、サイト全体のコンテンツ（Mission/Vision/Values・サービス・会社概要・Hero・フッター）を日英両語で更新する。

**Architecture:** すべてのサイトコンテンツは `src/i18n/ja.ts` と `src/i18n/en.ts` に集約されており、Astroコンポーネントはprops経由で受け取る。更新対象はこの2ファイルのみ。コンポーネント側の変更は最小限（Valuesが3→5に増えるがグリッドレイアウトで自動対応）。

**Tech Stack:** Astro SSG, TypeScript (i18n), Tailwind CSS

---

## 変更対象ファイル

- Modify: `src/i18n/ja.ts` — 日本語コンテンツ全更新
- Modify: `src/i18n/en.ts` — 英語コンテンツ全更新

---

### Task 1: `ja.ts` — Hero・サービス・MVVを更新

**Files:**
- Modify: `src/i18n/ja.ts`

変更内容の対応表:

| セクション | 変更箇所 | 旧 | 新 |
|---|---|---|---|
| hero.headlinePre | ヘッドライン前半 | `AI時代に必要な業務を引き受け、` | `様々な視点から、` |
| hero.headlineAccent | アクセント | `お客様が本業に集中できる` | `共に変化を起こす` |
| hero.headlinePost | ヘッドライン後半 | `環境を提供する。` | `パートナー。` |
| hero.subtext | サブテキスト | BPO/AI研修/SNS/開発Dir/メディア | 下記参照 |
| service.items | サービス4件 | SNS/Web開発/AI研修/メディア | SNS/CS代行/受託開発Dir/AI研修 |
| mvv.mission | ミッション | AI時代に必要な業務を…（旧） | 正式版ミッション |
| mvv.vision | ビジョン | AIエージェントを駆使した… | 正式版ビジョン |
| mvv.values | バリュー | 3件 | 5件（正式版） |

- [ ] **Step 1: `src/i18n/ja.ts` を開き、`hero` セクションを更新する**

```typescript
hero: {
  eyebrow: '株式会社KCP',
  headlinePre: '様々な視点から、',
  headlineAccent: '共に変化を起こす',
  headlinePost: 'パートナー。',
  subtext:
    'SNS運用代行・CS代行・受託開発ディレクション・AI研修を通じて、人と組織が本当にやるべきことに集中できる環境をつくります。',
  primaryCta: 'お問い合わせ',
  secondaryCta: 'サービスを見る',
},
```

- [ ] **Step 2: `service` セクションを更新する（CS代行を追加、メディア運営を削除）**

```typescript
service: {
  heading: 'Service',
  subtitle: 'AIの力を活かした業務代行で、人と組織が本当にやるべきことに集中できる環境をつくります。',
  items: [
    {
      icon: '📱',
      title: 'SNS運用代行',
      description: 'クライアントのSNSアカウントの企画・投稿・分析を一括代行します。',
    },
    {
      icon: '💬',
      title: 'CS代行',
      description: 'AIが9割・人間が1割の体制で顧客対応を代行。コストを抑えながら高品質な対応を実現します。',
    },
    {
      icon: '🖥️',
      title: '受託開発ディレクション',
      description: '開発プロジェクトのディレクション・PM業務を代行。技術とビジネスを繋ぐ視点で進行を支援します。',
    },
    {
      icon: '🤖',
      title: 'AI研修',
      description: '企業向けAI活用トレーニングの設計・実施。現場に合ったAI導入で業務効率を向上します。',
    },
  ],
},
```

- [ ] **Step 3: `mvv` セクションを更新する（Mission・Vision・Values全件差し替え）**

```typescript
mvv: {
  missionLabel: 'Mission',
  mission: '人と組織が本当にやるべきことに集中できる環境をつくる。',
  visionLabel: 'Vision',
  vision: '日本と世界、レガシーとモダンを繋ぎ、新しい価値を生む会社になる。',
  valuesLabel: 'Values',
  values: [
    {
      title: '本質は不変、実行は最新',
      description:
        '常識・専門性・国境・時代。様々な対象を異なる視点で捉え、変わらない本質を軸に手段は常に最新かつ最善を選ぶ。',
    },
    {
      title: '人間には人間にしかできない仕事を',
      description:
        'AIに任せられることはAIに任せる。その上で人間は人間にしかない泥臭さと温かさで価値を生む。',
    },
    {
      title: '全てを長期的視点で積み上げる',
      description:
        'スキルも事業も信頼も全ては複利で積み上がる。流行りや感情に左右されずに投資先を見極め、長期的な関係として築いていく。',
    },
    {
      title: '勝っても攻めるパラノイア',
      description:
        '進化を止めた瞬間に衰退が始まる。良い時でも常に危機に備え、新たな機会を探り、リスクを取って攻め続ける。',
    },
    {
      title: '失敗の度、強くなる反脆弱性',
      description:
        '一つ一つの失敗が次の挑戦の糧になる。悪い時こそ成長の機会と捉え、逆境を歓迎する。',
    },
  ],
},
```

- [ ] **Step 4: `company.info` を更新する（英語名追加・資本金を暫定表記・事業内容を正式版に）**

```typescript
company: {
  heading: 'Company',
  subtitle: '会社概要',
  info: [
    { label: '会社名', value: '株式会社KCP' },
    { label: '英語名称', value: 'KCP Inc.' },
    { label: 'ブランド名', value: 'Kinesis Cross Partners' },
    { label: '代表者', value: '中野 健太朗' },
    { label: '設立', value: '2026年（予定）' },
    { label: '所在地', value: '東京都世田谷区（バーチャルオフィス）' },
    { label: '事業内容', value: 'SNS運用代行・CS代行・受託開発ディレクション・AI研修' },
    { label: '資本金', value: '設立時に更新予定' },
  ],
},
```

- [ ] **Step 5: ビルドして日本語ページの表示を確認する**

```bash
npm run build
```

Expected: ビルドエラーなし、`dist/` に出力される

- [ ] **Step 6: コミット**

```bash
git add src/i18n/ja.ts
git commit -m "feat: update ja.ts content to match company identity doc"
```

---

### Task 2: `en.ts` — Hero・サービス・MVVを英語で更新

**Files:**
- Modify: `src/i18n/en.ts`

- [ ] **Step 1: `hero` セクションを更新する**

```typescript
hero: {
  eyebrow: 'KCP Inc.',
  headlinePre: 'Your partner in driving change,',
  headlineAccent: 'through diverse perspectives.',
  headlinePost: '',
  subtext:
    'Through social media management, customer support, development direction, and AI training, we free people and organizations to focus on what truly matters.',
  primaryCta: 'Contact Us',
  secondaryCta: 'Our Services',
},
```

- [ ] **Step 2: `service` セクションを更新する**

```typescript
service: {
  heading: 'Service',
  subtitle:
    'We leverage the power of AI to handle your operations, freeing people and organizations to focus on what truly matters.',
  items: [
    {
      icon: '📱',
      title: 'Social Media Management',
      description:
        'End-to-end management of your social media accounts: planning, posting, and analytics.',
    },
    {
      icon: '💬',
      title: 'Customer Support (CS)',
      description:
        'AI-powered customer support with a 90/10 AI-to-human ratio — high quality at lower cost.',
    },
    {
      icon: '🖥️',
      title: 'Development Direction',
      description:
        'Project direction and PM services for development projects. We bridge technology and business to keep projects on track.',
    },
    {
      icon: '🤖',
      title: 'AI Training',
      description:
        'Designing and delivering AI utilization training for businesses. Tailored to your workplace for real efficiency gains.',
    },
  ],
},
```

- [ ] **Step 3: `mvv` セクションを更新する**

```typescript
mvv: {
  missionLabel: 'Mission',
  mission: 'We free people and organizations to focus on what truly matters.',
  visionLabel: 'Vision',
  vision:
    'To become a company that bridges Japan and the world, legacy and modern, creating new value.',
  valuesLabel: 'Values',
  values: [
    {
      title: 'Timeless Principles, Modern Execution',
      description:
        'We hold multiple lenses and anchor every decision in what never changes, always choosing the best means to act on it.',
    },
    {
      title: 'Irreplaceably Human',
      description:
        'We let AI do what AI does best, then bring grit and warmth where only humans can.',
    },
    {
      title: 'Everything Compounds',
      description:
        'Skills, Business, Trust. We choose where to invest wisely and build for the long term. Never one-time transactions.',
    },
    {
      title: 'Paranoid In Winning',
      description:
        'The moment we stop evolving, decline begins. We sense danger and opportunity even in good times, take calculated risks, and never settle.',
    },
    {
      title: 'Antifragile In Failure',
      description:
        'Every failure fuels the next challenge. We see hard times as opportunities for growth and welcome adversity.',
    },
  ],
},
```

- [ ] **Step 4: `company.info` を更新する**

```typescript
company: {
  heading: 'Company',
  subtitle: 'About Us',
  info: [
    { label: 'Company (JP)', value: '株式会社KCP' },
    { label: 'Company (EN)', value: 'KCP Inc.' },
    { label: 'Brand', value: 'Kinesis Cross Partners' },
    { label: 'CEO', value: 'Kentaro Nakano' },
    { label: 'Founded', value: '2026 (planned)' },
    { label: 'Location', value: 'Setagaya, Tokyo (Virtual Office)' },
    {
      label: 'Business',
      value: 'Social Media Management, Customer Support, Development Direction, AI Training',
    },
    { label: 'Capital', value: 'To be updated at founding' },
  ],
},
```

- [ ] **Step 5: `footer.companyName` を修正する（Co., Ltd. → Inc.）**

```typescript
footer: {
  companyName: 'KCP Inc.',
  rights: 'All Rights Reserved.',
},
```

- [ ] **Step 6: ビルドして英語ページの表示を確認する**

```bash
npm run build
```

Expected: ビルドエラーなし

- [ ] **Step 7: コミット**

```bash
git add src/i18n/en.ts
git commit -m "feat: update en.ts content to match company identity doc"
```

---

### Task 3: 開発サーバーで目視確認 & PR作成

**Files:** なし（確認のみ）

- [ ] **Step 1: 開発サーバーを起動して日英両ページを確認する**

```bash
npm run dev
```

確認チェックリスト:
- [ ] `/` (日本語) — Hero: `様々な視点から、共に変化を起こすパートナー。`
- [ ] `/` — Service: SNS運用代行・CS代行・受託開発ディレクション・AI研修 の4件
- [ ] `/` — MVV: ミッション・ビジョンが正式版、バリューが5件
- [ ] `/` — Company: 英語名称・ブランド名・資本金が「設立時に更新予定」
- [ ] `/en/` (英語) — Hero: `Your partner in driving change, through diverse perspectives.`
- [ ] `/en/` — Service: 英語版4件
- [ ] `/en/` — MVV: 英語版5バリュー
- [ ] `/en/` — Footer: `KCP Inc.`

- [ ] **Step 2: PR作成**

```bash
git push origin feat/content-update-company-identity
gh pr create \
  --title "feat: update site content to match company identity doc" \
  --body "## Summary
- ja.ts / en.ts の Hero・Service・MVV・Company・Footer を company-identity.md に合わせて更新
- Mission/Vision を正式版に差し替え
- Values を3件→5件に拡張（正式版5バリュー）
- Service を SNS運用代行・CS代行・受託開発ディレクション・AI研修 の4件に更新
- Company情報に英語名称・ブランド名を追加、資本金を暫定表記に修正
- 英語社名を KCP Co., Ltd. → KCP Inc. に修正

## Test plan
- [ ] \`npm run build\` がエラーなく完了する
- [ ] 日本語トップページで Hero・Service・MVV・Company が正しく表示される
- [ ] 英語トップページ (/en/) で同様に正しく表示される"
```
