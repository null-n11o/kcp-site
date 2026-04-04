export function formatDateJa(date: Date): string {
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth() + 1;
  const day = date.getUTCDate();
  return `${year}年${month}月${day}日`;
}

export function formatDateEn(date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

export function formatDate(date: Date, locale: 'ja' | 'en'): string {
  return locale === 'en' ? formatDateEn(date) : formatDateJa(date);
}
