import type { Translations } from './types';

export const ja: Translations = {
  nav: {
    service: 'Service',
    about: 'About',
    strength: 'Strength',
    blog: 'Blog',
    company: 'Company',
    contact: 'Contact',
  },
  langSwitch: {
    label: 'English',
  },
  footer: {
    companyName: '株式会社KCP',
    rights: 'All Rights Reserved.',
  },
  hero: {
    eyebrow: 'Corporation',
    headlinePre: 'We Make',
    headlineAccent: 'Business',
    headlinePost: 'Simple.',
    subtext:
      '中小企業のIT・AI担当として、月額固定で実作業まで引き受けます。SNS運用・システム改修・AI導入——何でも気軽に頼める「社内のIT担当者」が、今日から持てます。',
    primaryCta: 'お問い合わせ',
    secondaryCta: 'サービスを見る',
  },
  service: {
    heading: 'Service',
    subtitle: 'AIと人力を使い分け、人と組織が本当にやるべきことに集中できる環境をつくります。',
    items: [
      {
        icon: '🧑‍💻',
        title: '丸投げIT担当',
        description:
          '月額固定でKCPがあなたの会社のIT・AI担当になります。チャット相談から実作業まで一括で引き受けます。',
        href: '/services/it-support/',
      },
      {
        icon: '📱',
        title: 'SNS運用代行',
        description: 'クライアントのSNSアカウントの企画・投稿・分析を一括代行します。',
        href: '/services/sns/',
      },
      {
        icon: '💬',
        title: '海外企業支援',
        description: '海外企業の日本市場参入を支援します。',
      },
      {
        icon: '🖥️',
        title: 'システム開発',
        description: '開発プロジェクトを支援します。技術とビジネスを繋ぐ視点でスムーズにプロジェクトを進行いたします。',
      },
      {
        icon: '🤖',
        title: 'AI導入支援',
        description: '現場に合ったAI導入で業務効率を向上します。',
        href: '/services/ai-training/',
      },
    ],
  },
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
  strength: {
    heading: 'Strength',
    subtitle: 'KCPが選ばれる3つの理由',
    items: [
      {
        number: '01',
        title: 'AIエージェント活用',
        description:
          'Claude Code等を駆使した高効率・低コストの業務代行。AIの力を最大限に活かして、従来の何倍もの速度で高品質な成果を提供します。',
      },
      {
        number: '02',
        title: '技術とビジネスの橋渡し',
        description:
          '非技術者出身ならではのAI活用や技術の活用術、わかりやすい説明が可能です。難しい技術も、現場で使える言葉でお伝えします。',
      },
      {
        number: '03',
        title: '英語対応・海外知見',
        description:
          '海外のコネクションを活かし、翻訳や海外マーケティング支援の対応も可能です。グローバル視点でビジネスをサポートします。',
      },
    ],
  },
  blog: {
    sectionHeading: 'Blog',
    sectionSubtitle: 'AI活用・業務効率化に関する最新記事',
    viewAll: '記事一覧を見る',
    pageTitle: 'ブログ',
    pageDescription: 'AI活用・業務効率化・デジタルトランスフォーメーションに関する記事を発信しています。',
    pageSubtitle: 'AI活用・業務効率化に関する記事を発信しています。',
    noPostsMessage: '記事がありません。',
  },
  company: {
    heading: 'Company',
    subtitle: '会社概要',
    info: [
      { label: '会社名', value: '株式会社KCP' },
      { label: '代表者', value: '中野 健太朗' },
      { label: '設立', value: '2026年6月' },
      { label: '所在地', value: '東京都新宿区西新宿3丁目3番13号西新宿水間ビル2F' },
      { label: '事業内容', value: 'AI導入支援・研修・SNS運用代行・受託開発・海外企業支援・メディア運営' },
      { label: '資本金', value: '100万円' },
    ],
  },
  contact: {
    label: 'Contact',
    heading: 'お問い合わせ',
    subtext:
      'まずはお気軽にご相談ください。\nご要望をお聞きした上で、最適なプランをご提案します。',
    btnLabel: 'お問い合わせフォーム',
    downloadBtnLabel: '会社案内ダウンロード',
  },
  breadcrumb: {
    home: 'ホーム',
    blog: 'ブログ',
  },
  common: {
    backToBlog: '← ブログ一覧へ戻る',
    readingTime: '分で読めます',
    publishedOn: '',
  },
};
