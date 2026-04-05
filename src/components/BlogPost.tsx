import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, Copy, ExternalLink } from 'lucide-react';
import { articles, formatArticleDate, type ArticleCategory } from '../data/articles';

/* ─── Types ─────────────────────────────────────────────── */
const CATEGORY_STYLES: Record<ArticleCategory, string> = {
  'Education':       'text-cyan-400 bg-cyan-400/10 border-cyan-400/20',
  'Strategy':        'text-[#CEB776] bg-[#CEB776]/10 border-[#CEB776]/20',
  'Market Analysis': 'text-purple-400 bg-purple-400/10 border-purple-400/20',
};

const POST_URL = 'https://tradinsight.net/blog/what-is-profit-factor';

/* ─── SEO helpers ────────────────────────────────────────── */
function upsertMeta(attr: 'name' | 'property', key: string, content: string) {
  let el = document.querySelector(`meta[${attr}="${key}"]`);
  const isNew = !el;
  if (isNew) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  const prev = el.getAttribute('content') ?? '';
  el.setAttribute('content', content);
  return { el: el as HTMLMetaElement, isNew, prev };
}

/* ─── Article content ────────────────────────────────────── */
function ProfitFactorArticle({ onSignup }: { onSignup: () => void }) {
  return (
    <>
      {/* Opening */}
      <p className="text-gray-300 text-[17px] leading-[1.8] mb-10">
        Profit factor measures how much a trading system earns for every dollar it loses. It is calculated
        by dividing total gross profits by total gross losses. A profit factor above 1.0 means the system
        is profitable. Above 2.0 is considered strong. Above 3.0 is exceptional.
      </p>

      {/* The Formula */}
      <h2 className="text-2xl font-bold text-white mt-12 mb-4">The Formula</h2>
      <div className="bg-[#121826] border border-[#1F2937] rounded-xl p-6 my-6 text-center">
        <p className="text-[#CEB776] text-xl font-semibold tracking-wide">
          Profit Factor = Gross Profits ÷ Gross Losses
        </p>
      </div>
      <p className="text-gray-300 text-[17px] leading-[1.8] mb-5">
        If a system made $10,000 in winning trades and lost $5,000 in losing trades, the profit factor
        is 2.0 — it earns $2 for every $1 it loses.
      </p>
      <p className="text-gray-300 text-[17px] leading-[1.8] mb-10">
        This single number tells you more about a trading system than win rate alone. A system can have
        a 90% win rate and still lose money if the losses are large enough. Profit factor accounts for
        both the frequency and the magnitude of wins and losses.
      </p>

      {/* Why Win Rate Is Misleading */}
      <h2 className="text-2xl font-bold text-white mt-12 mb-4">Why Win Rate Alone Is Misleading</h2>
      <p className="text-gray-300 text-[17px] leading-[1.8] mb-6">
        Most signal services advertise their win rate because it sounds impressive. "85% win rate" is
        easy to market. But win rate without context is meaningless.
      </p>
      <p className="text-gray-300 text-[17px] leading-[1.8] mb-6">Consider two systems:</p>

      {/* System comparison */}
      <div className="grid sm:grid-cols-2 gap-4 my-6">
        <div className="bg-[#121826] border border-red-500/20 rounded-xl p-5">
          <p className="text-red-400 font-semibold text-sm mb-3 uppercase tracking-wide">System A</p>
          <ul className="text-gray-300 text-sm space-y-1.5 leading-relaxed">
            <li>Win rate: <span className="text-white font-medium">80%</span></li>
            <li>Average win: <span className="text-white font-medium">$100</span></li>
            <li>Average loss: <span className="text-white font-medium">$500</span></li>
          </ul>
          <div className="mt-4 pt-4 border-t border-[#1F2937]">
            <p className="text-gray-500 text-xs mb-1">Profit factor calculation:</p>
            <p className="text-gray-400 text-xs mb-2">(80 × $100) ÷ (20 × $500) = $8,000 ÷ $10,000</p>
            <p className="text-red-400 font-bold text-lg">PF = 0.80</p>
            <p className="text-gray-500 text-xs mt-1">Loses money despite 80% win rate.</p>
          </div>
        </div>
        <div className="bg-[#121826] border border-emerald-500/20 rounded-xl p-5">
          <p className="text-emerald-400 font-semibold text-sm mb-3 uppercase tracking-wide">System B</p>
          <ul className="text-gray-300 text-sm space-y-1.5 leading-relaxed">
            <li>Win rate: <span className="text-white font-medium">55%</span></li>
            <li>Average win: <span className="text-white font-medium">$400</span></li>
            <li>Average loss: <span className="text-white font-medium">$200</span></li>
          </ul>
          <div className="mt-4 pt-4 border-t border-[#1F2937]">
            <p className="text-gray-500 text-xs mb-1">Profit factor calculation:</p>
            <p className="text-gray-400 text-xs mb-2">(55 × $400) ÷ (45 × $200) = $22,000 ÷ $9,000</p>
            <p className="text-emerald-400 font-bold text-lg">PF = 2.44</p>
            <p className="text-gray-500 text-xs mt-1">Highly profitable at 55% win rate.</p>
          </div>
        </div>
      </div>

      <p className="text-gray-300 text-[17px] leading-[1.8] mb-10">
        The difference is the relationship between win size and loss size. Profit factor captures this.
        Win rate does not.
      </p>

      {/* What Good Looks Like */}
      <h2 className="text-2xl font-bold text-white mt-12 mb-4">What Good Looks Like</h2>
      <p className="text-gray-300 text-[17px] leading-[1.8] mb-6">
        A practical scale for evaluating profit factor:
      </p>
      <div className="bg-[#121826] border border-[#1F2937] rounded-xl overflow-hidden my-6">
        {[
          { range: 'Below 1.0',  label: 'The system loses money. Walk away.',                               color: 'text-red-400',     border: 'border-red-500/10' },
          { range: '1.0 – 1.5', label: 'Marginally profitable. Fees and slippage may erase the edge.',     color: 'text-orange-400',  border: 'border-orange-500/10' },
          { range: '1.5 – 2.0', label: 'Decent system. Viable with proper risk management.',               color: 'text-yellow-400',  border: 'border-yellow-500/10' },
          { range: '2.0 – 3.0', label: 'Strong system. Consistent edge over time.',                        color: 'text-emerald-400', border: 'border-emerald-500/10' },
          { range: 'Above 3.0', label: 'Exceptional. Rare in live trading over extended periods.',         color: 'text-[#CEB776]',   border: 'border-[#CEB776]/10' },
        ].map((row, i, arr) => (
          <div key={row.range} className={`flex items-start gap-4 px-5 py-4 ${i < arr.length - 1 ? 'border-b border-[#1F2937]' : ''}`}>
            <span className={`text-sm font-semibold ${row.color} w-24 shrink-0 pt-0.5`}>{row.range}</span>
            <span className="text-gray-400 text-sm leading-relaxed">{row.label}</span>
          </div>
        ))}
      </div>
      <p className="text-gray-300 text-[17px] leading-[1.8] mb-10">
        The key qualifier: timeframe matters. Any system can show a high profit factor over 10 trades.
        The number becomes meaningful over 30+ trades across different market conditions — bull markets,
        bear markets, and sideways chop.
      </p>

      {/* Why Signal Services Hide It */}
      <h2 className="text-2xl font-bold text-white mt-12 mb-4">
        Why Most Signal Services Won't Show You This Number
      </h2>
      <p className="text-gray-300 text-[17px] leading-[1.8] mb-6">
        There are three common reasons:
      </p>
      <div className="space-y-5 my-6">
        {[
          {
            n: '1',
            title: 'They do not track it.',
            body: 'Many signal services operate on vibes — they post calls, celebrate the winners, and quietly delete the losers. Without a systematic record of every trade, profit factor cannot be calculated.',
          },
          {
            n: '2',
            title: 'The number is bad.',
            body: 'If a service has been running for two years and their profit factor is 1.1, that is not a number you put on your landing page. It is technically profitable but one bad month erases the edge.',
          },
          {
            n: '3',
            title: 'They cherry-pick.',
            body: 'Some services show only their best trades or their best month. Profit factor only means something when calculated across the entire track record — every trade, including the losses.',
          },
        ].map(item => (
          <div key={item.n} className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#1F2937] flex items-center justify-center text-gray-400 text-sm font-bold">
              {item.n}
            </div>
            <div>
              <p className="text-white font-semibold mb-1">{item.title}</p>
              <p className="text-gray-400 text-[16px] leading-[1.8]">{item.body}</p>
            </div>
          </div>
        ))}
      </div>
      <p className="text-gray-300 text-[17px] leading-[1.8] mb-10">
        When evaluating any signal service, the first question should be: "What is your profit factor
        across all trades?" If they cannot answer with a specific number and a verifiable track record,
        that tells you everything.
      </p>

      {/* How Tradinsight Approaches This */}
      <h2 className="text-2xl font-bold text-white mt-12 mb-4">How Tradinsight Approaches This</h2>
      <p className="text-gray-300 text-[17px] leading-[1.8] mb-5">
        Tradinsight's strategy has a profit factor of 4.59 across 45 trades since 2018. This means that
        for every $1 lost, the system has earned $4.59.
      </p>
      <p className="text-gray-300 text-[17px] leading-[1.8] mb-5">
        This number is calculated across the complete track record — every signal, including the losing
        ones. The full history is publicly visible on the platform. Free users can verify every entry
        date, direction, and result without paying.
      </p>
      <p className="text-gray-300 text-[17px] leading-[1.8] mb-10">
        The combination of a 65.1% win rate with a 4.59 profit factor indicates that winning trades are
        significantly larger than losing trades on average. This is characteristic of trend-following
        systems that cut losses short and let winners run — which is exactly how this strategy is
        designed.
      </p>

      {/* FAQ */}
      <h2 className="text-2xl font-bold text-white mt-12 mb-6">Frequently Asked Questions</h2>
      <div className="space-y-6 mb-10">
        {[
          {
            q: 'What is a good profit factor for a trading system?',
            a: 'A profit factor above 2.0 is considered strong. Above 3.0 is exceptional. The number is most meaningful when calculated across 30 or more trades spanning different market conditions.',
          },
          {
            q: 'Is profit factor more important than win rate?',
            a: 'Yes. Win rate alone does not account for the size of wins versus losses. A system with a 55% win rate and large winners can be far more profitable than a system with an 85% win rate and small winners. Profit factor captures both dimensions.',
          },
          {
            q: 'How is profit factor calculated?',
            a: 'Profit factor equals total gross profits divided by total gross losses. A result above 1.0 means the system is net profitable.',
          },
        ].map(item => (
          <div key={item.q} className="bg-[#121826] border border-[#1F2937] rounded-xl p-6">
            <p className="text-white font-semibold mb-2 leading-snug">{item.q}</p>
            <p className="text-gray-400 text-[16px] leading-[1.8]">{item.a}</p>
          </div>
        ))}
      </div>

      {/* Article CTA */}
      <div className="bg-[#121826] border border-[#C69214]/25 rounded-2xl p-8 text-center mt-12">
        <p className="text-white font-semibold text-lg mb-2 leading-snug">
          Tradinsight's full track record is publicly verifiable — 45 trades since 2018, every entry visible.
        </p>
        <p className="text-gray-400 text-sm mb-6">Check the data yourself.</p>
        <button
          onClick={onSignup}
          className="inline-flex items-center gap-2 bg-[#D4A017] text-black px-7 py-3.5 rounded-lg font-semibold text-sm hover:bg-[#E6B325] transition-colors shadow-lg shadow-black/30"
        >
          View Signal History — Free
          <ArrowRight size={15} />
        </button>
      </div>
    </>
  );
}

/* ─── Main component ─────────────────────────────────────── */
export function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  const article = articles.find(a => a.slug === slug);

  /* SEO: title, meta, JSON-LD */
  useEffect(() => {
    if (!article) return;

    if (slug !== 'what-is-profit-factor') return;

    const SEO = {
      title: 'What Is Profit Factor? The Key Metric for Evaluating Trading Systems | Tradinsight',
      description:
        "Profit factor measures how much a trading system earns for every dollar it loses. Learn what it means, what good looks like, and why most signal services won't show you theirs.",
      ogTitle: 'What Is Profit Factor? The Key Metric for Evaluating Trading Systems',
      ogImage: 'https://tradinsight.net/preview.png',
    };

    const prevTitle = document.title;
    document.title = SEO.title;

    const metas = [
      upsertMeta('name',     'description',       SEO.description),
      upsertMeta('property', 'og:title',          SEO.ogTitle),
      upsertMeta('property', 'og:description',    SEO.description),
      upsertMeta('property', 'og:image',          SEO.ogImage),
      upsertMeta('property', 'og:url',            POST_URL),
      upsertMeta('name',     'twitter:title',     SEO.ogTitle),
      upsertMeta('name',     'twitter:description', SEO.description),
    ];

    const faqSchema = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'What is a good profit factor for a trading system?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'A profit factor above 2.0 is considered strong. Above 3.0 is exceptional. The number is most meaningful when calculated across 30 or more trades spanning different market conditions.',
          },
        },
        {
          '@type': 'Question',
          name: 'Is profit factor more important than win rate?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes. Win rate alone does not account for the size of wins versus losses. A system with a 55% win rate and large winners can be far more profitable than a system with an 85% win rate and small winners. Profit factor captures both dimensions.',
          },
        },
        {
          '@type': 'Question',
          name: 'How is profit factor calculated?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Profit factor equals total gross profits divided by total gross losses. A result above 1.0 means the system is net profitable.',
          },
        },
      ],
    };
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = 'blog-post-schema';
    script.textContent = JSON.stringify(faqSchema);
    document.head.appendChild(script);

    return () => {
      document.title = prevTitle;
      metas.forEach(({ el, isNew, prev }) => {
        if (isNew) el.remove();
        else el.setAttribute('content', prev);
      });
      document.getElementById('blog-post-schema')?.remove();
    };
  }, [slug, article]);

  /* 404 */
  if (!article) {
    return (
      <div className="min-h-screen bg-[#0B0F19] flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 mb-4">Article not found.</p>
          <Link to="/blog" className="text-cyan-400 text-sm hover:underline">← Back to Blog</Link>
        </div>
      </div>
    );
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(POST_URL).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const relatedArticles = articles.filter(a => a.slug !== slug);

  return (
    <div className="min-h-screen bg-[#0B0F19] font-sans">

      {/* Header */}
      <header className="border-b border-[#1F2937] bg-[#0B0F19]/80 backdrop-blur-md sticky top-0 z-40">
        <div className="container mx-auto px-4 py-5">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <img src="/logo.svg" alt="Tradinsight" className="h-[26px] w-auto" />
              <span className="text-xl font-bold text-white tracking-tight">Tradinsight</span>
            </Link>
            <div className="flex items-center gap-5">
              <Link to="/blog" className="text-gray-400 hover:text-white text-sm transition-colors">Blog</Link>
              <Link
                to="/"
                className="border border-[#C69214]/50 text-[#D4A017] px-4 py-1.5 rounded-lg font-semibold hover:bg-[#C69214]/10 transition-colors text-sm"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-[720px]">

        {/* Back link */}
        <Link
          to="/blog"
          className="inline-flex items-center gap-1.5 text-gray-500 hover:text-gray-300 text-sm transition-colors mb-10"
        >
          <ArrowLeft size={14} />
          All articles
        </Link>

        {/* Article header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-5 flex-wrap">
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${CATEGORY_STYLES[article.category]}`}>
              {article.category}
            </span>
            <span className="text-gray-500 text-sm">{formatArticleDate(article.date)}</span>
            <span className="text-gray-600">·</span>
            <span className="text-gray-500 text-sm">{article.readingTime}</span>
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tight leading-[1.15] mb-5">
            {article.title}
          </h1>
          <p className="text-gray-400 text-lg leading-[1.7]">{article.description}</p>
        </div>

        {/* Divider */}
        <div className="border-t border-[#1F2937] mb-10" />

        {/* Article body */}
        {slug === 'what-is-profit-factor' && (
          <ProfitFactorArticle onSignup={() => navigate('/')} />
        )}

        {/* Divider */}
        <div className="border-t border-[#1F2937] mt-14 mb-8" />

        {/* Share */}
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-gray-500 text-sm">Share:</span>
          <a
            href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(POST_URL)}&text=${encodeURIComponent(article.title)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-gray-400 hover:text-white text-sm border border-[#1F2937] hover:border-[#2D3748] px-3 py-1.5 rounded-lg transition-colors"
          >
            <ExternalLink size={13} />
            Share on X
          </a>
          <a
            href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(POST_URL)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-gray-400 hover:text-white text-sm border border-[#1F2937] hover:border-[#2D3748] px-3 py-1.5 rounded-lg transition-colors"
          >
            <ExternalLink size={13} />
            Share on LinkedIn
          </a>
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 text-gray-400 hover:text-white text-sm border border-[#1F2937] hover:border-[#2D3748] px-3 py-1.5 rounded-lg transition-colors"
          >
            {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
            {copied ? 'Copied!' : 'Copy link'}
          </button>
        </div>

        {/* About Tradinsight */}
        <div className="bg-[#121826] border border-[#1F2937] rounded-2xl p-7 mt-10">
          <div className="flex items-center gap-2 mb-3">
            <img src="/logo.svg" alt="Tradinsight" className="h-5 w-auto" />
            <span className="text-white font-bold tracking-tight">Tradinsight</span>
          </div>
          <p className="text-gray-400 text-sm leading-relaxed mb-5">
            Tradinsight provides systematic BTC signals backed by a verified 8-year track record.
            Profit factor 4.59 across 45 trades. Free plan available — verify the history before committing.
          </p>
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 bg-[#D4A017] text-black px-5 py-2.5 rounded-lg font-semibold text-sm hover:bg-[#E6B325] transition-colors"
          >
            View Signal History — Free
            <ArrowRight size={14} />
          </button>
        </div>

        {/* Related articles */}
        {relatedArticles.length > 0 && (
          <div className="mt-14">
            <h3 className="text-white font-bold text-xl mb-5">Related Articles</h3>
            <div className="flex flex-col gap-4">
              {relatedArticles.map(a => (
                <Link
                  key={a.slug}
                  to={`/blog/${a.slug}`}
                  className="group block p-5 bg-[#121826] border border-[#1F2937] rounded-xl hover:border-[#2D3748] transition-colors"
                >
                  <p className="text-white font-semibold group-hover:text-cyan-400 transition-colors mb-1 leading-snug">
                    {a.title}
                  </p>
                  <p className="text-gray-500 text-sm">{a.readingTime}</p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#1F2937] mt-16 py-8">
        <div className="container mx-auto px-4 text-center text-gray-500 text-xs">
          <p className="mb-2">© 2026 Tradinsight · Operated by SPARKIN LTD (registered in England and Wales)</p>
          <p className="text-gray-600 mb-3">Not financial advice. Trading involves risk. Past performance does not guarantee future results.</p>
          <div className="flex items-center justify-center gap-4">
            <Link to="/terms" className="hover:text-gray-300 transition-colors">Terms of Use</Link>
            <span className="text-gray-700">·</span>
            <Link to="/blog" className="hover:text-gray-300 transition-colors">Blog</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
