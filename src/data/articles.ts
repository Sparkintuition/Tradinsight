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
  {
    slug: 'trend-following-bitcoin-fewer-signals',
    title: 'Trend Following on Bitcoin: Why 5 Signals Per Year Beats 50',
    description: 'Most traders lose money by overtrading. Trend following takes the opposite approach — wait for the big move, ride it, ignore everything else. Here\'s why it works on BTC.',
    category: 'Strategy',
    date: '2026-04-11',
    readingTime: '7 min read',
  },
  {
    slug: 'how-to-verify-crypto-signal-service',
    title: 'How to Verify a Crypto Signal Service Before You Pay',
    description: 'Most crypto signal services have no verifiable track record. Here\'s a practical checklist for separating legitimate services from the noise — before you hand over any money.',
    category: 'Education',
    date: '2026-04-12',
    readingTime: '8 min read',
  },
  {
    slug: 'on-chain-indicators-mvrv-puell-nvt',
    title: 'On-Chain Indicators Explained: MVRV, Puell Multiple, and NVT',
    description: 'On-chain data gives Bitcoin traders an edge that traditional technical analysis cannot. Here\'s how MVRV, Puell Multiple, and NVT work — and why they matter for identifying cycle tops and bottoms.',
    category: 'Education',
    date: '2026-04-13',
    readingTime: '9 min read',
  },
  {
    slug: 'signal-vs-noise-why-traders-overtrade',
    title: 'Signal vs Noise: Why Most Crypto Traders Overtrade',
    description: '95% of market movement is noise. The traders who survive long-term are the ones who learn to ignore it. Here\'s why doing less is the hardest — and most profitable — strategy in crypto.',
    category: 'Strategy',
    date: '2026-04-14',
    readingTime: '6 min read',
  },
];

export function formatArticleDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}
