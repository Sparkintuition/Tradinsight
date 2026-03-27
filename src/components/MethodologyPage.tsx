import { useState } from 'react';
import { TrendingUp, LogOut, ChevronDown, ChevronUp, BookOpen, BarChart2, Shield, Target, HelpCircle, Zap, ArrowRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface MethodologyPageProps {
  onNavigateDashboard: () => void;
  onUnlockPremium?: () => void;
}

interface FAQItem {
  question: string;
  answer: React.ReactNode;
  category: string;
  icon: React.ReactNode;
}

function AccordionItem({ item, isOpen, onToggle }: {
  item: FAQItem;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div className={`border rounded-2xl transition-all duration-200 ${
      isOpen
        ? 'border-cyan-500/30 bg-[#121826]'
        : 'border-[#1F2937] bg-[#121826] hover:border-[#334155]'
    }`}>
      <button
        onClick={onToggle}
        className="w-full px-6 py-5 flex items-start gap-4 text-left"
      >
        <span className={`mt-0.5 shrink-0 transition-colors ${isOpen ? 'text-cyan-400' : 'text-gray-500'}`}>
          {item.icon}
        </span>
        <span className="flex-1 text-white font-semibold text-sm leading-relaxed">
          {item.question}
        </span>
        <span className={`shrink-0 mt-0.5 transition-colors ${isOpen ? 'text-cyan-400' : 'text-gray-600'}`}>
          {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </span>
      </button>

      {isOpen && (
        <div className="px-6 pb-6">
          <div className="pl-9 text-gray-400 text-sm leading-relaxed space-y-3">
            {item.answer}
          </div>
        </div>
      )}
    </div>
  );
}

const CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'strategy', label: 'Strategy' },
  { id: 'tpi', label: 'TPI System' },
  { id: 'signals', label: 'Signals' },
  { id: 'philosophy', label: 'Philosophy' },
];

const FAQ_ITEMS: FAQItem[] = [
  {
    category: 'strategy',
    icon: <BarChart2 size={16} />,
    question: "How does the Tradinsight strategy work?",
    answer: (
      <>
        <p>
          The strategy is coded in Pine Script on TradingView and fires signals based on a precise combination of technical conditions — not a single indicator, but multiple factors that must align simultaneously.
        </p>
        <p>The core indicators that power the strategy are:</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2 not-prose">
          {['CCI', 'Standard Deviation', 'ADX', 'Puell Multiple', 'MVRV Z-Score', 'Aroon', 'RSI'].map(ind => (
            <span key={ind} className="text-xs text-cyan-400 bg-cyan-500/8 border border-cyan-500/15 rounded-lg px-3 py-1.5 text-center font-medium">
              {ind}
            </span>
          ))}
        </div>
        <p className="mt-3">
          Each indicator captures a different dimension of market behavior — momentum, volatility, miner activity, holder profitability, trend strength. A signal only fires when the composite of these conditions crosses a defined threshold. This multi-factor approach is what filters out noise and produces high-conviction setups.
        </p>
      </>
    ),
  },
  {
    category: 'tpi',
    icon: <BarChart2 size={16} />,
    question: "What is the TPI and why does it matter?",
    answer: (
      <>
        <p>
          TPI stands for Trend Positioning Index. It is a separate confirmation layer that sits on top of the strategy signals — its job is to validate whether market conditions are genuinely favorable before acting on a signal.
        </p>
        <p>The TPI has two independent components:</p>
        <div className="space-y-3 mt-2 not-prose">
          <div className="bg-[#0F172A]/80 border border-[#1F2937] rounded-xl p-4">
            <p className="text-white text-xs font-semibold mb-1.5">Medium Term Trend Indicator</p>
            <p className="text-gray-400 text-xs leading-relaxed">
              Aggregates the variation of multiple technical indicators across timeframes, combined with BTC correlation to macro assets like DXY (US Dollar Index) and SPX (S&P 500). It evaluates where BTC stands in its current trend cycle and whether the broader market environment supports the signal direction.
            </p>
          </div>
          <div className="bg-[#0F172A]/80 border border-[#1F2937] rounded-xl p-4">
            <p className="text-white text-xs font-semibold mb-1.5">Value Indicator (Long Term)</p>
            <p className="text-gray-400 text-xs leading-relaxed">
              Determines the relative value of BTC at a given moment using a combination of technical, fundamental, and sentiment indicators. It provides long-term market cycle context — whether BTC is historically cheap, fairly valued, or expensive — which informs how aggressively to act on a signal.
            </p>
          </div>
        </div>
        <p className="mt-3">
          When the strategy fires a signal but the TPI disagrees, we do not act. We wait. This is the core discipline that separates Tradinsight from a simple signal service.
        </p>
      </>
    ),
  },
  {
    category: 'signals',
    icon: <Zap size={16} />,
    question: "Why does Tradinsight only provide entry signals — no take profit or stop loss?",
    answer: (
      <>
        <p>
          Deliberate design choice, not a limitation.
        </p>
        <p>
          Every trader has a different risk appetite, portfolio size, time horizon, and tolerance for drawdowns. A stop loss that makes sense for someone with 5% of their net worth in BTC is the wrong number for someone with 50%. Providing fixed exit levels would create a false sense of precision and push users into decisions that don't fit their situation.
        </p>
        <p>
          What Tradinsight does is identify <span className="text-white font-medium">when</span> a high-probability opportunity exists — the entry. What you do with it from there should reflect your own risk management framework:
        </p>
        <div className="space-y-2 mt-2 not-prose">
          {[
            'Position size based on your portfolio allocation',
            'Stop loss placed at a level meaningful to your risk tolerance',
            'Take profit targets based on your investment horizon',
            'Partial exits if you prefer to scale out of positions',
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-2.5 text-xs text-gray-400">
              <span className="text-cyan-400 mt-0.5 shrink-0">→</span>
              {item}
            </div>
          ))}
        </div>
        <p className="mt-3">
          The strategy has been tested without exits and still generates strong returns — which speaks to the quality of the entries. With disciplined personal risk management, performance improves further.
        </p>
      </>
    ),
  },
  {
    category: 'signals',
    icon: <Target size={16} />,
    question: "How often do signals fire, and what should I expect between signals?",
    answer: (
      <>
        <p>
          Tradinsight generates approximately 5-6 signals per year. Some periods may have more, others fewer — it depends entirely on whether market conditions meet the system criteria. There is no artificial signal generation to keep users engaged.
        </p>
        <p>
          During quiet periods — which can last weeks or months — the system is not idle. It is monitoring. The TPI is being updated, market conditions are being tracked, and the moment conditions align the signal fires immediately for premium users.
        </p>
        <p>
          This low frequency is the edge, not a weakness. Overtrading is one of the primary reasons most retail traders lose money. By waiting for high-conviction setups, you avoid the noise that destroys returns.
        </p>
        <div className="bg-amber-500/8 border border-amber-500/20 rounded-xl px-4 py-3 not-prose mt-2">
          <p className="text-amber-300 text-xs leading-relaxed">
            If you are expecting daily or weekly signals, Tradinsight is not the right tool for you. This system is built for investors who think in months, not minutes.
          </p>
        </div>
      </>
    ),
  },
  {
    category: 'philosophy',
    icon: <Target size={16} />,
    question: "Why only BTC and not other cryptocurrencies?",
    answer: (
      <>
        <p>
          This is a philosophical and empirical choice rooted in how the crypto market actually behaves.
        </p>
        <p>
          The vast majority of cryptocurrencies are highly correlated to BTC. When BTC goes up, altcoins generally go up. When BTC goes down, altcoins go down harder. This high correlation makes broad portfolio diversification within crypto largely ineffective — you are not reducing risk, you are just adding complexity and noise.
        </p>
        <p>
          BTC also has a fundamental advantage: it is the most liquid, most established, and historically one of the highest-performing assets in the space. It has cleaner price structure, deeper on-chain data, and is the asset our system has been developed and tested on since 2018.
        </p>
        <p>
          There are exceptions — some altcoins decorrelate during certain market phases. We have strategies for other coins in development and may introduce them in future versions of Tradinsight. For now, the focus on BTC is intentional and keeps the system precise.
        </p>
      </>
    ),
  },
  {
    category: 'strategy',
    icon: <Shield size={16} />,
    question: "What does 'risk-first' mean in practice?",
    answer: (
      <>
        <p>
          Risk-first means that protecting capital takes priority over generating returns. This shapes every aspect of how the system is designed:
        </p>
        <div className="space-y-2 mt-2 not-prose">
          {[
            { title: 'Signal frequency', desc: 'We would rather miss an opportunity than enter a low-conviction trade.' },
            { title: 'TPI confirmation', desc: 'Even strong strategy signals are skipped if the macro environment disagrees.' },
            { title: 'Entries only', desc: 'We give you the entry. Managing your downside is your responsibility — because only you know your risk tolerance.' },
            { title: 'Transparency', desc: 'We show every past signal, including ones that did not work. No cherry-picking.' },
          ].map((item, i) => (
            <div key={i} className="flex gap-3 bg-[#0F172A]/80 border border-[#1F2937] rounded-xl p-3.5">
              <span className="text-cyan-400 text-xs font-semibold shrink-0 mt-0.5 w-28">{item.title}</span>
              <span className="text-gray-400 text-xs leading-relaxed">{item.desc}</span>
            </div>
          ))}
        </div>
      </>
    ),
  },
  {
    category: 'tpi',
    icon: <BarChart2 size={16} />,
    question: "How is the TPI updated and how often does it change?",
    answer: (
      <>
        <p>
          The TPI is updated manually on a regular basis. Each component — the Medium Term Trend Indicator and the Value Indicator — is calculated from a set of underlying indicators that are tracked across TradingView, on-chain data sources, and macro indices.
        </p>
        <p>
          The final TPI state (Positive, Neutral, or Negative) is derived from the aggregate score of all inputs. It does not change daily — these are slow-moving, high-conviction readings that reflect the broader market environment, not short-term price fluctuations.
        </p>
        <p>
          Premium members can always see the current TPI state on their dashboard. When it changes meaningfully, it is updated promptly.
        </p>
      </>
    ),
  },
  {
    category: 'signals',
    icon: <HelpCircle size={16} />,
    question: "What happens if a signal fires but I miss the entry?",
    answer: (
      <>
        <p>
          This depends on how far price has moved since the signal fired.
        </p>
        <p>
          Since Tradinsight signals target major BTC trends — not short-term moves — the entry window is typically wider than in a day-trading context. A trend that runs for weeks or months often has a reasonable entry range even a day or two after the signal fires.
        </p>
        <p>
          That said, there is no universal answer. Some signals move quickly, others consolidate for a while before trending. Our recommendation:
        </p>
        <div className="space-y-2 mt-2 not-prose">
          {[
            'Check the current price vs the signal entry price',
            'Assess whether the risk/reward still makes sense at current price',
            'Never chase a signal that has already moved significantly against your preferred entry',
            'Wait for the next signal if the entry has been missed by a large margin',
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-2.5 text-xs text-gray-400">
              <span className="text-cyan-400 mt-0.5 shrink-0">→</span>
              {item}
            </div>
          ))}
        </div>
      </>
    ),
  },
  {
    category: 'philosophy',
    icon: <HelpCircle size={16} />,
    question: "Is this financial advice?",
    answer: (
      <>
        <p>
          No. Tradinsight is an informational tool that provides data-driven signals based on a systematic methodology. It is not financial advice, and it does not account for your personal financial situation, tax obligations, or investment goals.
        </p>
        <p>
          All trading and investment decisions are made entirely by you. Past performance of the strategy does not guarantee future results. Cryptocurrency markets are highly volatile and you can lose money.
        </p>
        <p>
          Use Tradinsight as one input in your decision-making process — never as a replacement for your own judgment and risk management.
        </p>
      </>
    ),
  },
];

export function MethodologyPage({ onNavigateDashboard, onUnlockPremium }: MethodologyPageProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [activeCategory, setActiveCategory] = useState('all');
  const { signOut } = useAuth();

  const filteredItems = activeCategory === 'all'
    ? FAQ_ITEMS
    : FAQ_ITEMS.filter(item => item.category === activeCategory);

  return (
    <div className="min-h-screen bg-[#0B0F19]">

      {/* Header */}
      <header className="border-b border-[#1F2937] bg-[#0F172A]/80 backdrop-blur sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <TrendingUp className="text-cyan-400" size={28} />
              <span className="text-xl font-bold text-white tracking-tight">Tradinsight</span>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={onNavigateDashboard}
                className="flex items-center gap-1.5 text-gray-400 hover:text-white text-sm transition-colors"
              >
                <ArrowRight size={15} className="rotate-180" />
                Back to Dashboard
              </button>
              <button
                onClick={signOut}
                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm"
              >
                <LogOut size={16} />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-3xl">

        {/* Page header */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/5 px-4 py-1.5 mb-5">
            <BookOpen size={13} className="text-cyan-400" />
            <span className="text-cyan-400 text-xs font-semibold tracking-widest uppercase">Methodology</span>
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight mb-3">
            How Tradinsight Works
          </h1>
          <p className="text-gray-400 leading-relaxed">
            Everything behind the strategy, the TPI system, and the reasoning behind every signal. Read this once — then trust the data.
          </p>
        </div>

        {/* Category filter */}
        <div className="flex flex-wrap gap-2 mb-8">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => { setActiveCategory(cat.id); setOpenIndex(null); }}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                activeCategory === cat.id
                  ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
                  : 'bg-[#121826] text-gray-500 border border-[#1F2937] hover:border-[#334155] hover:text-gray-300'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* FAQ accordion */}
        <div className="space-y-3">
          {filteredItems.map((item, i) => (
            <AccordionItem
              key={i}
              item={item}
              isOpen={openIndex === i}
              onToggle={() => setOpenIndex(openIndex === i ? null : i)}
            />
          ))}
        </div>

        {/* Bottom disclaimer */}
        <div className="mt-10 rounded-2xl border border-[#1F2937] bg-[#121826] p-6 text-center">
          <p className="text-gray-500 text-xs leading-relaxed">
            Tradinsight is an informational tool. All signals are based on a systematic methodology and do not constitute financial advice.
            Past performance does not guarantee future results. The entry is the system's job. Managing your downside is yours.
          </p>
          <button
            onClick={onNavigateDashboard}
            className="mt-4 inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 text-sm font-medium transition-colors"
          >
            Go to Dashboard <ArrowRight size={14} />
          </button>
        </div>

      </main>
    </div>
  );
}
