import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { articles, formatArticleDate, type ArticleCategory } from '../data/articles';

const CATEGORY_STYLES: Record<ArticleCategory, string> = {
  'Education':       'text-cyan-400 bg-cyan-400/10 border-cyan-400/20',
  'Strategy':        'text-[#CEB776] bg-[#CEB776]/10 border-[#CEB776]/20',
  'Market Analysis': 'text-purple-400 bg-purple-400/10 border-purple-400/20',
};

export function BlogPage() {
  return (
    <div className="min-h-screen bg-[#0B0F19] font-sans">

      {/* Header */}
      <header className="border-b border-[#1F2937] bg-[#0B0F19]/80 backdrop-blur-md sticky top-0 z-40">
        <div className="container mx-auto px-4 py-5">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <img src="/logo.svg" alt="Tradinsight" className="h-[24px] w-auto" />
              <span className="text-xl font-bold text-white tracking-tight">Tradinsight</span>
            </Link>
            <div className="flex items-center gap-5">
              <Link to="/blog" className="text-white text-sm font-medium">Blog</Link>
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

      <main className="container mx-auto px-4 py-16 max-w-[720px]">

        {/* Page heading */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-white tracking-tight mb-3">Blog</h1>
          <p className="text-gray-400 text-lg leading-relaxed">
            Data-driven insights on BTC trading, signal analysis, and systematic investing.
          </p>
        </div>

        {/* Article list */}
        <div className="flex flex-col gap-5">
          {articles.map(article => (
            <Link
              key={article.slug}
              to={`/blog/${article.slug}`}
              className="group block p-6 bg-[#121826] border border-[#1F2937] rounded-xl hover:border-[#2D3748] transition-colors"
            >
              <div className="flex items-center gap-3 mb-3 flex-wrap">
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${CATEGORY_STYLES[article.category]}`}>
                  {article.category}
                </span>
                <span className="text-gray-500 text-xs">{formatArticleDate(article.date)}</span>
                <span className="text-gray-600 text-xs">·</span>
                <span className="text-gray-500 text-xs">{article.readingTime}</span>
              </div>
              <h2 className="text-white font-semibold text-xl mb-2 group-hover:text-cyan-400 transition-colors leading-snug">
                {article.title}
              </h2>
              <p className="text-gray-400 text-sm leading-relaxed">{article.description}</p>
              <div className="mt-4 flex items-center gap-1.5 text-cyan-400 text-sm font-medium">
                Read article <ArrowRight size={14} />
              </div>
            </Link>
          ))}
        </div>
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
