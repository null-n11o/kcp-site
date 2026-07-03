import type { Translations, ServicePillarContent } from './types';

export const en: Translations = {
  nav: {
    service: 'Service',
    about: 'About',
    strength: 'Strength',
    blog: 'Blog',
    company: 'Company',
    contact: 'Contact',
  },
  langSwitch: {
    label: '日本語',
  },
  footer: {
    companyName: 'KCP Inc.',
    rights: 'All Rights Reserved.',
  },
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
        title: 'Global Business Support',
        description:
          'We support overseas companies entering the Japanese market.',
        href: '/en/services/japan-entry/',
      },
      {
        icon: '🖥️',
        title: 'Contract Development',
        description:
          'We support development projects. Bridging technology and business to keep projects on track.',
      },
      {
        icon: '🤖',
        title: 'AI Training',
        description:
          'Designing and delivering AI utilization training for businesses. Tailored to your workplace for real efficiency gains.',
      },
    ],
  },
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
  strength: {
    heading: 'Strength',
    subtitle: '3 Reasons to Choose KCP',
    items: [
      {
        number: '01',
        title: 'AI Agent Utilization',
        description:
          'High-efficiency, low-cost operations powered by tools like Claude Code. We deliver high-quality results at speeds far beyond traditional approaches.',
      },
      {
        number: '02',
        title: 'Bridging Tech and Business',
        description:
          'Coming from a non-technical background, we can explain AI and technology in plain, actionable language for any workplace.',
      },
      {
        number: '03',
        title: 'English & Global Expertise',
        description:
          'Leveraging overseas connections, we support translation and international marketing. We back your business with a global perspective.',
      },
    ],
  },
  blog: {
    sectionHeading: 'Blog',
    sectionSubtitle: 'Latest insights on AI and productivity',
    viewAll: 'View All Posts',
    pageTitle: 'Blog',
    pageDescription:
      'Insights on AI utilization, business efficiency, and digital transformation.',
    pageSubtitle: 'Insights on AI utilization and business efficiency.',
    noPostsMessage: 'No posts yet.',
  },
  company: {
    heading: 'Company',
    subtitle: 'About Us',
    info: [
      { label: 'Company', value: 'KCP Inc.' },
      { label: 'CEO', value: 'Kentaro Nakano' },
      { label: 'Founded', value: 'June 2026' },
      {
        label: 'Location',
        value: 'Nishi-Shinjuku 3-3-13, Shinjuku-ku, Tokyo, Nishishinjuku Mizuma Bldg. 2F',
      },
      {
        label: 'Business',
        value:
          'AI Implementation Support & Training, Social Media Management, Contract Development, Global Business Support, Media Operations',
      },
      { label: 'Capital', value: 'JPY 1,000,000' },
    ],
  },
  contact: {
    label: 'Contact',
    heading: 'Get in Touch',
    subtext:
      'Feel free to reach out anytime.\nWe will listen to your needs and propose the best plan for you.',
    btnLabel: 'Contact Form',
  },
  breadcrumb: {
    home: 'Home',
    blog: 'Blog',
  },
  common: {
    backToBlog: '← Back to Blog',
    readingTime: 'min read',
    publishedOn: 'Published on',
  },
};

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
