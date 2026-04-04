export interface ServiceItem {
  icon: string;
  title: string;
  description: string;
}

export interface ValueItem {
  title: string;
  description: string;
}

export interface StrengthItem {
  number: string;
  title: string;
  description: string;
}

export interface CompanyInfoRow {
  label: string;
  value: string;
}

export interface Translations {
  nav: {
    service: string;
    about: string;
    strength: string;
    blog: string;
    company: string;
    contact: string;
  };
  langSwitch: {
    label: string;
  };
  footer: {
    companyName: string;
    rights: string;
  };
  hero: {
    eyebrow: string;
    headlinePre: string;
    headlineAccent: string;
    headlinePost: string;
    subtext: string;
    primaryCta: string;
    secondaryCta: string;
  };
  service: {
    heading: string;
    subtitle: string;
    items: ServiceItem[];
  };
  mvv: {
    missionLabel: string;
    mission: string;
    visionLabel: string;
    vision: string;
    valuesLabel: string;
    values: ValueItem[];
  };
  strength: {
    heading: string;
    subtitle: string;
    items: StrengthItem[];
  };
  blog: {
    sectionHeading: string;
    sectionSubtitle: string;
    viewAll: string;
    pageTitle: string;
    pageDescription: string;
    pageSubtitle: string;
    noPostsMessage: string;
  };
  company: {
    heading: string;
    subtitle: string;
    info: CompanyInfoRow[];
  };
  contact: {
    label: string;
    heading: string;
    subtext: string;
    btnLabel: string;
  };
  breadcrumb: {
    home: string;
    blog: string;
  };
  common: {
    backToBlog: string;
    readingTime: string;
    publishedOn: string;
  };
}

export type Locale = 'ja' | 'en';
