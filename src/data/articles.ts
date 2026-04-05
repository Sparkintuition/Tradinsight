export type ArticleCategory = 'Strategy' | 'Education' | 'Market Analysis';

export interface ArticleMeta {
  slug: string;
  title: string;
  description: string;
  category: ArticleCategory;
  date: string;
  readingTime: string;
}

export const articles: ArticleMeta[] = [
  {
    slug: 'what-is-profit-factor',
    title: 'What Is Profit Factor — and Why Most Signal Services Hide Theirs',
    description: "Profit factor is the single most important metric for evaluating any trading system. Here's what it means, why it matters, and what a good one looks like.",
    category: 'Education',
    date: '2026-04-10',
    readingTime: '6 min read',
  },
];

export function formatArticleDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}
