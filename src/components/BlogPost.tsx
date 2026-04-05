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

const BASE_URL = 'https://tradinsight.net';

type SlugSEO = {
  title: string;
  description: string;
  ogTitle: string;
  faq: { q: string; a: string }[];
};

const SEO_BY_SLUG: Record<string, SlugSEO> = {
  'what-is-profit-factor': {
    title: 'What Is Profit Factor? The Key Metric for Evaluating Trading Systems | Tradinsight',
    description: "Profit factor measures how much a trading system earns for every dollar it loses. Learn what it means, what good looks like, and why most signal services won't show you theirs.",
    ogTitle: 'What Is Profit Factor? The Key Metric for Evaluating Trading Systems',
    faq: [
      { q: 'What is a good profit factor for a trading system?', a: 'A profit factor above 2.0 is considered strong. Above 3.0 is exceptional. The number is most meaningful when calculated across 30 or more trades spanning different market conditions.' },
      { q: 'Is profit factor more important than win rate?', a: 'Yes. Win rate alone does not account for the size of wins versus losses. A system with a 55% win rate and large winners can be far more profitable than a system with an 85% win rate and small winners. Profit factor captures both dimensions.' },
      { q: 'How is profit factor calculated?', a: 'Profit factor equals total gross profits divided by total gross losses. A result above 1.0 means the system is net profitable.' },
    ],
  },
  'trend-following-bitcoin-fewer-signals': {
    title: 'Trend Following on Bitcoin: Why Fewer Signals Beat More | Tradinsight',
    description: 'Trend following captures major BTC moves by waiting for high-conviction setups. Learn why 5-6 signals per year outperforms constant trading — backed by data.',
    ogTitle: 'Trend Following on Bitcoin: Why Fewer Signals Beat More',
    faq: [
      { q: 'What is trend following in crypto trading?', a: 'Trend following is a systematic approach that identifies major directional price movements and holds positions until the trend reverses. It prioritizes catching large moves over frequent trading.' },
      { q: 'Why does trend following work on Bitcoin?', a: "Bitcoin exhibits strong trending behavior driven by sentiment cycles, halving events, and macro conditions. Its high volatility produces clear signals that distinguish genuine trends from market noise." },
      { q: 'How many trades does a trend-following system make per year?', a: 'A well-designed trend-following system on Bitcoin typically generates 5-15 signals per year. Lower frequency generally indicates higher selectivity and conviction per trade.' },
      { q: 'Is trend following better than day trading Bitcoin?', a: 'For most traders, yes. Day trading requires constant attention, incurs high fees, and statistically most day traders lose money. Trend following reduces decision fatigue, minimizes costs, and captures the largest price movements.' },
    ],
  },
  'on-chain-indicators-mvrv-puell-nvt': {
    title: 'On-Chain Indicators Explained: MVRV Z-Score, Puell Multiple, NVT | Tradinsight',
    description: 'Learn how MVRV Z-Score, Puell Multiple, and NVT Ratio reveal Bitcoin cycle tops and bottoms using blockchain data. A practical guide to on-chain analysis for BTC traders.',
    ogTitle: 'On-Chain Indicators Explained: MVRV Z-Score, Puell Multiple, NVT',
    faq: [
      { q: 'What is the MVRV Z-Score and how is it used in Bitcoin trading?', a: 'MVRV Z-Score compares Bitcoin\'s market capitalization to its realized capitalization, normalized as a Z-Score. Readings above 7 historically indicate cycle tops, while readings below 0 indicate cycle bottoms. It is used as a long-term valuation tool, not for short-term trading.' },
      { q: 'What does the Puell Multiple measure?', a: 'The Puell Multiple measures daily Bitcoin miner revenue relative to its 365-day average. High readings (above 4.0) suggest miners are highly profitable and selling pressure may increase. Low readings (below 0.5) suggest miner capitulation and potential market bottoms.' },
      { q: 'What is the NVT Ratio in crypto?', a: "NVT Ratio divides Bitcoin's market capitalization by daily on-chain transaction volume. It measures whether the network's valuation is supported by actual usage. High NVT suggests speculation-driven overvaluation, while low NVT suggests undervaluation relative to network activity." },
      { q: 'Can on-chain indicators predict Bitcoin price?', a: "On-chain indicators do not predict price. They reveal the internal state of the Bitcoin network — holder behavior, miner economics, and network usage — which historically correlates with major cycle turning points. They are most effective as confirmation tools used alongside technical analysis." },
    ],
  },
  'signal-vs-noise-why-traders-overtrade': {
    title: 'Signal vs Noise: Why Most Crypto Traders Overtrade and Lose Money | Tradinsight',
    description: '95% of Bitcoin price movement is noise. Learn why overtrading is the #1 reason crypto traders lose money, and how systematic, low-frequency trading produces better long-term results.',
    ogTitle: 'Signal vs Noise: Why Most Crypto Traders Overtrade and Lose Money',
    faq: [
      { q: 'What is overtrading in crypto?', a: 'Overtrading is the habit of taking too many positions based on short-term price movements rather than systematic criteria. It increases exposure to fees, slippage, emotional decisions, and market noise, and is the most common reason retail crypto traders lose money.' },
      { q: 'How many trades per year is considered overtrading?', a: 'There is no universal number, but for a daily-timeframe BTC strategy, more than 20-30 trades per year typically indicates excessive frequency. Well-designed trend-following systems on Bitcoin generate 5-15 signals per year.' },
      { q: 'Why do most crypto traders lose money?', a: 'The primary reasons are overtrading (reacting to noise rather than signal), poor risk management, emotional decision-making, and cumulative transaction costs that erode returns over time. Studies show that less frequent traders consistently outperform more active traders.' },
      { q: 'How can I stop overtrading?', a: 'Use a systematic trading framework with defined entry criteria. Only trade when all conditions are met. Remove price alerts for short timeframes. Track your fee costs monthly. Accept that being in cash is a valid position when no opportunity meets your criteria.' },
    ],
  },
  'how-to-verify-crypto-signal-service': {
    title: 'How to Verify a Crypto Signal Service Before You Pay | Tradinsight',
    description: 'Most crypto signal services have no verifiable track record. Use this 7-point checklist to evaluate any service before subscribing — profit factor, drawdown, trade history, and more.',
    ogTitle: 'How to Verify a Crypto Signal Service Before You Pay',
    faq: [
      { q: 'How can I tell if a crypto signal service is legitimate?', a: 'Check for a complete public trade history, a verifiable profit factor above 1.5, at least 30 trades across different market conditions, disclosed maximum drawdown, and a methodology explanation. If any of these are missing, proceed with caution.' },
      { q: 'What is a good profit factor for a signal service?', a: 'A profit factor above 2.0 is considered strong. Above 3.0 is exceptional. Be cautious of extremely high claims unless backed by a large sample size of 30 or more trades.' },
      { q: 'Should I trust crypto signal services on Telegram?', a: 'Many Telegram signal services lack verifiable track records. Before joining, ask for a complete trade history with specific dates and prices. If they can only provide screenshots of winning trades, the track record is not verifiable.' },
      { q: 'How many trades are needed to evaluate a signal service?', a: 'At minimum 30 trades across different market conditions. A system that only has data from a bull market has not been tested in adversity. The more trades across varied conditions, the more reliable the evaluation.' },
    ],
  },
};

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

/* ─── Article 2: Trend Following ────────────────────────── */
function TrendFollowingArticle({ onSignup }: { onSignup: () => void }) {
  return (
    <>
      {/* Opening */}
      <p className="text-gray-300 text-[17px] leading-[1.8] mb-10">
        Trend following is a systematic trading approach that identifies major directional moves and holds
        positions until the trend reverses. Instead of predicting where price will go, it reacts to where
        price is already going. On Bitcoin, this approach has historically outperformed most active trading
        strategies because BTC moves in long, powerful trends separated by periods of noise.
      </p>

      {/* The Problem with Trading More */}
      <h2 className="text-2xl font-bold text-white mt-12 mb-4">The Problem with Trading More</h2>
      <p className="text-gray-300 text-[17px] leading-[1.8] mb-5">
        The average retail crypto trader makes dozens of trades per month. Most of them lose money over
        time. This is not because they lack skill or information — it is because frequency itself is the
        enemy.
      </p>
      <p className="text-gray-300 text-[17px] leading-[1.8] mb-5">
        Every trade carries costs: exchange fees, spread, slippage, and the psychological toll of constant
        decision-making. Even with a slight edge, high-frequency trading erodes returns through these
        compounding frictions. A trader with a 52% win rate making 200 trades per year may end up net
        negative after costs. The same edge applied across 10 carefully selected trades preserves the
        profit.
      </p>
      <p className="text-gray-300 text-[17px] leading-[1.8] mb-10">
        More importantly, most short-term price movements are noise. They carry no directional
        information. Trading noise is indistinguishable from gambling — except that gambling has
        better-defined odds.
      </p>

      {/* What Trend Following Actually Does */}
      <h2 className="text-2xl font-bold text-white mt-12 mb-4">What Trend Following Actually Does</h2>
      <p className="text-gray-300 text-[17px] leading-[1.8] mb-5">
        A trend-following system does not try to pick bottoms or call tops. It waits for confirmation
        that a trend has started, enters in the direction of that trend, and holds until the system
        detects a reversal.
      </p>
      <p className="text-gray-300 text-[17px] leading-[1.8] mb-5">
        The mechanics are straightforward. When a combination of momentum, volatility, and directional
        indicators align to confirm a trend, a signal fires. The position stays open until opposite
        conditions appear. There is no daily reassessment, no second-guessing, no "taking profits early"
        because the chart looks scary.
      </p>
      <p className="text-gray-300 text-[17px] leading-[1.8] mb-10">
        This means trend followers are always late to enter and late to exit. They never catch the exact
        bottom or the exact top. What they catch is the middle — which is where 80% of the move happens.
      </p>

      {/* Why BTC Is Ideal */}
      <h2 className="text-2xl font-bold text-white mt-12 mb-4">Why BTC Is Ideal for Trend Following</h2>
      <p className="text-gray-300 text-[17px] leading-[1.8] mb-6">
        Bitcoin is one of the best assets in the world for trend following, for three specific reasons.
      </p>
      <div className="space-y-5 my-6">
        {[
          {
            n: '1',
            title: 'BTC trends hard.',
            body: 'When Bitcoin moves, it moves for weeks or months, not hours. The rally from $16,000 in late 2022 to $73,000 in early 2024 was a single trend that lasted over a year. A trend-following system that caught even half of that move generated returns that hundreds of short-term trades could not match.',
          },
          {
            n: '2',
            title: 'BTC is volatile enough to generate clear signals.',
            body: "Low-volatility assets produce ambiguous signals because price movements are small relative to noise. Bitcoin's volatility ensures that when a real trend forms, the signal-to-noise ratio is high. The system can distinguish between noise and a genuine directional shift.",
          },
          {
            n: '3',
            title: 'BTC runs on sentiment cycles.',
            body: 'Fear, greed, narrative shifts, halving events, and macro conditions create extended trending periods. These cycles are the raw material that trend-following systems are designed to harvest.',
          },
        ].map(item => (
          <div key={item.n} className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#1F2937] flex items-center justify-center text-[#CEB776] text-sm font-bold">
              {item.n}
            </div>
            <div>
              <p className="text-white font-semibold mb-1">{item.title}</p>
              <p className="text-gray-400 text-[16px] leading-[1.8]">{item.body}</p>
            </div>
          </div>
        ))}
      </div>

      {/* The Math Behind Fewer Trades */}
      <h2 className="text-2xl font-bold text-white mt-12 mb-4">The Math Behind Fewer Trades</h2>
      <p className="text-gray-300 text-[17px] leading-[1.8] mb-6">
        Consider two approaches to trading BTC over a five-year period:
      </p>
      <div className="grid sm:grid-cols-2 gap-4 my-6">
        <div className="bg-[#121826] border border-red-500/20 rounded-xl p-5">
          <p className="text-red-400 font-semibold text-sm mb-3 uppercase tracking-wide">Approach A</p>
          <ul className="text-gray-300 text-sm space-y-1.5 leading-relaxed">
            <li>Trades per year: <span className="text-white font-medium">200</span></li>
            <li>Win rate: <span className="text-white font-medium">52%</span></li>
            <li>Average win = average loss</li>
          </ul>
          <div className="mt-4 pt-4 border-t border-[#1F2937]">
            <p className="text-red-400 font-bold text-base">Approximately breakeven</p>
            <p className="text-gray-500 text-xs mt-1">Or slightly negative after fees and slippage.</p>
          </div>
        </div>
        <div className="bg-[#121826] border border-emerald-500/20 rounded-xl p-5">
          <p className="text-emerald-400 font-semibold text-sm mb-3 uppercase tracking-wide">Approach B</p>
          <ul className="text-gray-300 text-sm space-y-1.5 leading-relaxed">
            <li>Trades per year: <span className="text-white font-medium">6</span></li>
            <li>Win rate: <span className="text-white font-medium">65%</span></li>
            <li>Average win: <span className="text-white font-medium">3× average loss</span></li>
          </ul>
          <div className="mt-4 pt-4 border-t border-[#1F2937]">
            <p className="text-emerald-400 font-bold text-base">Profit factor above 4.0</p>
            <p className="text-gray-500 text-xs mt-1">Compounds aggressively on high-conviction entries only.</p>
          </div>
        </div>
      </div>
      <p className="text-gray-300 text-[17px] leading-[1.8] mb-5">
        The difference is selectivity. Approach B is not smarter about predicting markets — it is smarter
        about when to act. By filtering out the 95% of market conditions that are ambiguous, it only
        participates when the edge is strongest.
      </p>
      <p className="text-gray-300 text-[17px] leading-[1.8] mb-10">
        This is the fundamental insight behind Tradinsight: the strategy fires 5–6 signals per year not
        because it cannot find more, but because only those setups meet the full criteria across momentum,
        trend strength, and on-chain fundamentals.
      </p>

      {/* The Hardest Part */}
      <h2 className="text-2xl font-bold text-white mt-12 mb-4">The Hardest Part: Doing Nothing</h2>
      <p className="text-gray-300 text-[17px] leading-[1.8] mb-5">
        The biggest challenge of trend following is not the system. It is the psychology.
      </p>
      <p className="text-gray-300 text-[17px] leading-[1.8] mb-5">
        Sitting in cash for two months while Bitcoin moves 15% feels like missing out. Watching a
        position give back 10% of open profit before the system signals an exit feels like a mistake.
        Reading headlines about daily trades that "would have" made money feels like being left behind.
      </p>
      <p className="text-gray-300 text-[17px] leading-[1.8] mb-5">
        This is precisely why most traders cannot follow a systematic approach. The discomfort of
        inaction is stronger than the logic of discipline. But the data is clear: the traders who
        succeed long-term are overwhelmingly those who trade less, not more.
      </p>
      <div className="bg-[#121826] border border-[#CEB776]/20 rounded-xl px-6 py-5 my-6">
        <p className="text-[#CEB776] font-semibold text-lg">
          The signal frequency is the feature, not the limitation.
        </p>
      </div>

      {/* How to Evaluate */}
      <h2 className="text-2xl font-bold text-white mt-12 mb-4">How to Evaluate a Trend-Following System</h2>
      <p className="text-gray-300 text-[17px] leading-[1.8] mb-6">
        When evaluating any trend-following approach, look for these characteristics:
      </p>
      <div className="space-y-4 my-6">
        {[
          { title: 'A defined edge over a significant sample size', body: 'At minimum 30 trades across multiple market conditions. Short backtests on favorable periods prove nothing.' },
          { title: 'A profit factor above 2.0', body: 'Indicating that wins meaningfully outweigh losses. Trend-following systems typically have win rates between 40–65% but compensate with outsized winning trades.' },
          { title: 'Maximum drawdown that is survivable', body: 'Even the best trend-following systems will have drawdown periods — if you cannot tolerate the drawdown, you will abandon the system at exactly the wrong time.' },
          { title: 'Consistency across market regimes', body: 'The system should perform in bull markets, bear markets, and choppy conditions — not just one.' },
        ].map(item => (
          <div key={item.title} className="bg-[#121826] border border-[#1F2937] rounded-xl p-5 flex gap-4">
            <div className="flex-shrink-0 mt-0.5 w-5 h-5 rounded-full bg-[#CEB776]/15 flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-[#CEB776]" />
            </div>
            <div>
              <p className="text-white font-semibold mb-1 text-sm">{item.title}</p>
              <p className="text-gray-400 text-[15px] leading-[1.7]">{item.body}</p>
            </div>
          </div>
        ))}
      </div>

      {/* FAQ */}
      <h2 className="text-2xl font-bold text-white mt-12 mb-6">Frequently Asked Questions</h2>
      <div className="space-y-6 mb-10">
        {[
          { q: 'What is trend following in crypto trading?', a: 'Trend following is a systematic approach that identifies major directional price movements and holds positions until the trend reverses. It prioritizes catching large moves over frequent trading.' },
          { q: 'Why does trend following work on Bitcoin?', a: "Bitcoin exhibits strong trending behavior driven by sentiment cycles, halving events, and macro conditions. Its high volatility produces clear signals that distinguish genuine trends from market noise." },
          { q: 'How many trades does a trend-following system make per year?', a: 'A well-designed trend-following system on Bitcoin typically generates 5–15 signals per year. Lower frequency generally indicates higher selectivity and conviction per trade.' },
          { q: 'Is trend following better than day trading Bitcoin?', a: 'For most traders, yes. Day trading requires constant attention, incurs high fees, and statistically most day traders lose money. Trend following reduces decision fatigue, minimizes costs, and captures the largest price movements.' },
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
          Tradinsight is a trend-following system that has fired 45 signals since 2018 with a 4.59 profit factor and 65.1% win rate.
        </p>
        <p className="text-gray-400 text-sm mb-6">Every signal is publicly verifiable.</p>
        <button
          onClick={onSignup}
          className="inline-flex items-center gap-2 bg-[#D4A017] text-black px-7 py-3.5 rounded-lg font-semibold text-sm hover:bg-[#E6B325] transition-colors shadow-lg shadow-black/30"
        >
          Verify the Track Record — Free
          <ArrowRight size={15} />
        </button>
      </div>
    </>
  );
}

/* ─── Article 4: On-Chain Indicators ────────────────────── */
function OnChainIndicatorsArticle({ onSignup }: { onSignup: () => void }) {
  return (
    <>
      {/* Opening */}
      <p className="text-gray-300 text-[17px] leading-[1.8] mb-10">
        On-chain indicators analyze data directly from the Bitcoin blockchain — transactions, wallet
        activity, miner behavior, and holder profitability — to assess market conditions. Unlike
        technical indicators that only read price and volume, on-chain metrics reveal what participants
        are actually doing with their Bitcoin. Three of the most valuable on-chain indicators for
        identifying cycle extremes are MVRV Z-Score, Puell Multiple, and NVT Ratio.
      </p>

      {/* Why On-Chain Data Matters */}
      <h2 className="text-2xl font-bold text-white mt-12 mb-4">Why On-Chain Data Matters</h2>
      <p className="text-gray-300 text-[17px] leading-[1.8] mb-5">
        Traditional technical analysis reads the chart — price, volume, and derived indicators like RSI
        or MACD. This works, but it only captures one dimension of market behavior: what is happening
        on the exchange.
      </p>
      <p className="text-gray-300 text-[17px] leading-[1.8] mb-5">
        On-chain analysis reads the blockchain itself. It answers questions that price charts cannot:
        Are long-term holders selling or accumulating? Are miners profitable enough to hold or are they
        forced to sell? Is the network being used proportionally to its valuation?
      </p>
      <p className="text-gray-300 text-[17px] leading-[1.8] mb-5">
        These questions matter because Bitcoin's major cycle turns — the transitions from bull to bear
        and bear to bull — are consistently preceded by shifts in on-chain behavior that appear before
        price reflects them. Miners start selling before the top is obvious. Long-term holders start
        accumulating before the bottom is confirmed. Network usage diverges from price before major
        reversals.
      </p>
      <p className="text-gray-300 text-[17px] leading-[1.8] mb-10">
        On-chain data does not predict the future. What it does is reveal the internal state of the
        Bitcoin network in a way that price alone cannot. When combined with technical analysis, it adds
        a dimension of insight that significantly improves signal quality.
      </p>

      {/* MVRV */}
      <h2 className="text-2xl font-bold text-white mt-12 mb-4">MVRV Z-Score</h2>
      <p className="text-gray-300 text-[17px] leading-[1.8] mb-5">
        MVRV stands for Market Value to Realized Value. It compares Bitcoin's current market
        capitalization to its realized capitalization — which values each coin at the price it last
        moved on-chain rather than at the current price.
      </p>
      <p className="text-gray-300 text-[17px] leading-[1.8] mb-5">
        The logic is straightforward. Market value reflects what the market thinks Bitcoin is worth
        right now. Realized value reflects what holders actually paid for their coins on average. When
        market value is significantly higher than realized value, the average holder is sitting on large
        unrealized profits — which historically precedes selling pressure and cycle tops. When market
        value drops below realized value, the average holder is underwater — which historically precedes
        accumulation and cycle bottoms.
      </p>
      <p className="text-gray-300 text-[17px] leading-[1.8] mb-6">
        The Z-Score normalizes this ratio to account for increasing values over time. It measures how
        many standard deviations the current MVRV ratio is from its historical mean.
      </p>
      <div className="bg-[#121826] border border-[#1F2937] rounded-xl overflow-hidden my-6">
        {[
          { range: 'Above 7',   label: 'Cycle top territory — Bitcoin is extremely overvalued relative to what holders paid.',        color: 'text-red-400' },
          { range: '0 to 7',    label: 'Gradient from neutral to increasingly overheated conditions.',                                 color: 'text-yellow-400' },
          { range: 'Below 0',   label: 'Cycle bottom territory — Bitcoin is trading below what the average holder paid.',              color: 'text-emerald-400' },
        ].map((row, i, arr) => (
          <div key={row.range} className={`flex items-start gap-4 px-5 py-4 ${i < arr.length - 1 ? 'border-b border-[#1F2937]' : ''}`}>
            <span className={`text-sm font-semibold ${row.color} w-24 shrink-0 pt-0.5`}>{row.range}</span>
            <span className="text-gray-400 text-sm leading-relaxed">{row.label}</span>
          </div>
        ))}
      </div>
      <p className="text-gray-500 text-sm leading-relaxed mb-10 italic">
        Limitations: MVRV works best on weekly/monthly timeframes. Lost coins distort realized value
        since they are priced at very low historical values but will never be sold.
      </p>

      {/* Puell Multiple */}
      <h2 className="text-2xl font-bold text-white mt-12 mb-4">Puell Multiple</h2>
      <p className="text-gray-300 text-[17px] leading-[1.8] mb-5">
        The Puell Multiple measures the daily revenue of Bitcoin miners relative to the 365-day moving
        average of daily miner revenue. It identifies when miners are earning significantly more or less
        than their historical average.
      </p>
      <p className="text-gray-300 text-[17px] leading-[1.8] mb-5">
        The logic connects miner behavior to market cycles. Miners are the primary source of consistent
        sell pressure in the Bitcoin market — they must sell BTC to cover operational costs. When miner
        revenue is extremely high relative to its average (Puell Multiple above 4), miners are highly
        profitable and have large inventories to sell. This historically coincides with late-stage bull
        markets. When miner revenue is extremely low (below 0.5), miners are struggling and the weakest
        operations shut down. This capitulation historically coincides with cycle bottoms.
      </p>
      <div className="bg-[#121826] border border-[#1F2937] rounded-xl overflow-hidden my-6">
        {[
          { range: 'Above 4.0',    label: 'Overheated — miners are flush and selling is likely to increase.',             color: 'text-red-400' },
          { range: '0.5 to 4.0',   label: 'Normal operating conditions.',                                                 color: 'text-gray-400' },
          { range: 'Below 0.5',    label: 'Miner capitulation — weakest miners shut down, sell pressure reduces.',        color: 'text-emerald-400' },
        ].map((row, i, arr) => (
          <div key={row.range} className={`flex items-start gap-4 px-5 py-4 ${i < arr.length - 1 ? 'border-b border-[#1F2937]' : ''}`}>
            <span className={`text-sm font-semibold ${row.color} w-28 shrink-0 pt-0.5`}>{row.range}</span>
            <span className="text-gray-400 text-sm leading-relaxed">{row.label}</span>
          </div>
        ))}
      </div>
      <p className="text-gray-300 text-[17px] leading-[1.8] mb-4">
        A buy signal that fires when the Puell Multiple is below 0.5 carries more conviction than one
        that fires when it is above 4.0 — capitulation conditions are historically favorable for longs,
        while euphoria conditions are not.
      </p>
      <p className="text-gray-500 text-sm leading-relaxed mb-10 italic">
        Limitations: Halving events cut miner revenue by 50% overnight, creating structural dips that
        are not market-driven. The multiple also does not account for miners who hold rather than sell.
      </p>

      {/* NVT */}
      <h2 className="text-2xl font-bold text-white mt-12 mb-4">NVT Ratio</h2>
      <p className="text-gray-300 text-[17px] leading-[1.8] mb-5">
        NVT stands for Network Value to Transactions. It divides Bitcoin's market capitalization by the
        daily transaction volume on the blockchain — sometimes called the "PE ratio of Bitcoin" because
        it measures valuation relative to network usage.
      </p>
      <p className="text-gray-300 text-[17px] leading-[1.8] mb-5">
        When the market cap is high relative to transaction volume, the network may be overvalued —
        people are speculating on price without proportional economic activity. When the market cap is
        low relative to transaction volume, real usage is high but the market has not priced it in.
      </p>
      <div className="bg-[#121826] border border-[#1F2937] rounded-xl overflow-hidden my-6">
        {[
          { range: 'Above 95',  label: 'Valuation outpacing utility — price driven by speculation near cycle tops.',      color: 'text-red-400' },
          { range: '45 to 95',  label: 'Normal range — valuation and network usage broadly in line.',                     color: 'text-gray-400' },
          { range: 'Below 45',  label: 'Real usage high relative to valuation — accumulation phases, early bull markets.', color: 'text-emerald-400' },
        ].map((row, i, arr) => (
          <div key={row.range} className={`flex items-start gap-4 px-5 py-4 ${i < arr.length - 1 ? 'border-b border-[#1F2937]' : ''}`}>
            <span className={`text-sm font-semibold ${row.color} w-24 shrink-0 pt-0.5`}>{row.range}</span>
            <span className="text-gray-400 text-sm leading-relaxed">{row.label}</span>
          </div>
        ))}
      </div>
      <p className="text-gray-500 text-sm leading-relaxed mb-10 italic">
        Limitations: Not all on-chain transactions represent economic activity. Layer 2 solutions like
        Lightning Network also reduce on-chain volume without reducing actual usage, which can distort
        NVT upward over time.
      </p>

      {/* How They Work Together */}
      <h2 className="text-2xl font-bold text-white mt-12 mb-4">How These Indicators Work Together</h2>
      <p className="text-gray-300 text-[17px] leading-[1.8] mb-5">
        No single on-chain indicator is reliable on its own. Each captures a different dimension:
        holder profitability (MVRV), miner economics (Puell), and network utility (NVT). Their value
        multiplies when used in combination.
      </p>
      <p className="text-gray-300 text-[17px] leading-[1.8] mb-5">
        When all three align to signal the same condition — MVRV Z-Score below 0, Puell Multiple below
        0.5, and NVT below 45 — the probability of a major cycle bottom is historically very high.
        When all three signal overheated conditions simultaneously, the probability of a cycle top
        increases substantially.
      </p>
      <p className="text-gray-300 text-[17px] leading-[1.8] mb-10">
        This layered approach is the philosophy behind Tradinsight's Value Indicator, which aggregates
        multiple on-chain metrics into a single reading (Positive, Neutral, or Negative) that filters
        every signal. A strategy signal that fires during on-chain confirmation carries more weight than
        one that fires in ambiguous conditions.
      </p>

      {/* Where to Access */}
      <h2 className="text-2xl font-bold text-white mt-12 mb-4">Where to Access On-Chain Data</h2>
      <div className="space-y-3 my-6">
        {[
          { name: 'Glassnode',       desc: 'Most comprehensive suite. Requires paid subscription for advanced metrics.' },
          { name: 'CryptoQuant',     desc: 'Real-time on-chain data with a freemium model.' },
          { name: 'LookIntoBitcoin', desc: 'Free access to MVRV, Puell Multiple, and other popular on-chain charts.' },
          { name: 'CoinMetrics',     desc: 'Institutional-grade network data with an academic focus.' },
        ].map(platform => (
          <div key={platform.name} className="bg-[#121826] border border-[#1F2937] rounded-xl px-5 py-4 flex gap-4">
            <span className="text-[#CEB776] font-semibold text-sm w-36 shrink-0 pt-0.5">{platform.name}</span>
            <span className="text-gray-400 text-sm leading-relaxed">{platform.desc}</span>
          </div>
        ))}
      </div>

      {/* FAQ */}
      <h2 className="text-2xl font-bold text-white mt-12 mb-6">Frequently Asked Questions</h2>
      <div className="space-y-6 mb-10">
        {[
          { q: 'What is the MVRV Z-Score and how is it used in Bitcoin trading?', a: "MVRV Z-Score compares Bitcoin's market capitalization to its realized capitalization, normalized as a Z-Score. Readings above 7 historically indicate cycle tops, while readings below 0 indicate cycle bottoms. It is used as a long-term valuation tool, not for short-term trading." },
          { q: 'What does the Puell Multiple measure?', a: 'The Puell Multiple measures daily Bitcoin miner revenue relative to its 365-day average. High readings (above 4.0) suggest miners are highly profitable and selling pressure may increase. Low readings (below 0.5) suggest miner capitulation and potential market bottoms.' },
          { q: 'What is the NVT Ratio in crypto?', a: "NVT Ratio divides Bitcoin's market capitalization by daily on-chain transaction volume. It measures whether the network's valuation is supported by actual usage. High NVT suggests speculation-driven overvaluation, while low NVT suggests undervaluation relative to network activity." },
          { q: 'Can on-chain indicators predict Bitcoin price?', a: "On-chain indicators do not predict price. They reveal the internal state of the Bitcoin network — holder behavior, miner economics, and network usage — which historically correlates with major cycle turning points. They are most effective as confirmation tools used alongside technical analysis." },
        ].map(item => (
          <div key={item.q} className="bg-[#121826] border border-[#1F2937] rounded-xl p-6">
            <p className="text-white font-semibold mb-2 leading-snug">{item.q}</p>
            <p className="text-gray-400 text-[16px] leading-[1.8]">{item.a}</p>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="bg-[#121826] border border-[#C69214]/25 rounded-2xl p-8 text-center mt-12">
        <p className="text-white font-semibold text-lg mb-2 leading-snug">
          Tradinsight's Value Indicator aggregates on-chain metrics including MVRV, Puell Multiple, and more into a single reading that filters every signal.
        </p>
        <p className="text-gray-400 text-sm mb-6">See how on-chain data shapes our trading decisions.</p>
        <button
          onClick={onSignup}
          className="inline-flex items-center gap-2 bg-[#D4A017] text-black px-7 py-3.5 rounded-lg font-semibold text-sm hover:bg-[#E6B325] transition-colors shadow-lg shadow-black/30"
        >
          Explore the System — Free
          <ArrowRight size={15} />
        </button>
      </div>
    </>
  );
}

/* ─── Article 5: Signal vs Noise ─────────────────────────── */
function SignalVsNoiseArticle({ onSignup }: { onSignup: () => void }) {
  return (
    <>
      {/* Opening */}
      <p className="text-gray-300 text-[17px] leading-[1.8] mb-10">
        Overtrading is the most common reason retail crypto traders lose money. It is the habit of
        taking too many positions, reacting to every price movement, and confusing market activity with
        market opportunity. Studies consistently show that traders who trade less frequently achieve
        better long-term returns than those who trade constantly — because most price movement is noise,
        not signal.
      </p>

      {/* The Noise Problem */}
      <h2 className="text-2xl font-bold text-white mt-12 mb-4">The Noise Problem</h2>
      <p className="text-gray-300 text-[17px] leading-[1.8] mb-5">
        Open any Bitcoin chart on a 5-minute timeframe. The price moves constantly — up, down, sideways,
        back up. It looks like information. It feels like opportunity. But the vast majority of this
        movement carries no predictive value whatsoever.
      </p>
      <p className="text-gray-300 text-[17px] leading-[1.8] mb-5">
        On the daily timeframe, the picture clarifies. The noise compresses into candles, and the
        underlying trend — if one exists — becomes visible. Zoom out to the weekly timeframe and the
        trend is unmistakable. The noise is still there, embedded inside each weekly candle, but it no
        longer dominates the view.
      </p>
      <p className="text-gray-300 text-[17px] leading-[1.8] mb-5">
        This is not just a visual phenomenon. It is a mathematical one. Short-term price movements are
        dominated by random order flow, arbitrage bots, liquidation cascades, and reflexive reactions
        to headlines. These forces generate constant activity but no sustained direction. A trader
        responding to this activity is not trading — they are reacting to randomness.
      </p>
      <p className="text-gray-300 text-[17px] leading-[1.8] mb-10">
        The signal — the genuine directional move — emerges only when multiple conditions align:
        momentum shifts, volatility expands, on-chain behavior changes, and the broader market
        environment supports a sustained trend. On Bitcoin's daily timeframe, this happens roughly
        5–6 times per year.
      </p>

      {/* Why We Overtrade */}
      <h2 className="text-2xl font-bold text-white mt-12 mb-4">Why We Overtrade</h2>
      <p className="text-gray-300 text-[17px] leading-[1.8] mb-6">
        Overtrading is not a strategy failure. It is a psychological one. Three cognitive biases drive
        the behavior.
      </p>
      <div className="space-y-5 my-6">
        {[
          {
            title: 'Action bias.',
            body: 'When faced with uncertainty, humans feel compelled to do something. In trading, "doing something" means entering a position. Sitting in cash while the market moves feels like a mistake, even when the rational choice is to wait. This bias is amplified in crypto because the market never closes — there is always a chart to watch, always a candle forming, always a reason to act.',
          },
          {
            title: 'Recency bias.',
            body: 'The last trade that worked creates a template for the next decision. If a quick scalp made money yesterday, the brain looks for another quick scalp today. This creates a pattern of increasing frequency driven by recent results rather than systematic edge. One winning trade does not validate a strategy — but it feels like it does.',
          },
          {
            title: 'Loss aversion and revenge trading.',
            body: 'After a losing trade, the urge to "make it back" is powerful. The next trade is taken with less preparation and more emotion. This cycle of loss, emotional reaction, and hasty re-entry is responsible for more blown accounts than any single bad trade.',
          },
        ].map((item, i) => (
          <div key={item.title} className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#1F2937] flex items-center justify-center text-gray-400 text-sm font-bold">
              {i + 1}
            </div>
            <div>
              <p className="text-white font-semibold mb-1">{item.title}</p>
              <p className="text-gray-400 text-[16px] leading-[1.8]">{item.body}</p>
            </div>
          </div>
        ))}
      </div>

      {/* The Cost of Every Trade */}
      <h2 className="text-2xl font-bold text-white mt-12 mb-4">The Cost of Every Trade</h2>
      <p className="text-gray-300 text-[17px] leading-[1.8] mb-6">
        Every trade has explicit and hidden costs that compound against the overtrade.
      </p>
      <div className="space-y-4 my-6">
        {[
          { title: 'Exchange fees', body: 'Typically 0.04% to 0.1% per trade on major exchanges. For a trader making 10 trades per day, this alone can consume 1–2% of capital per month — a drag that requires consistent profitability just to break even.' },
          { title: 'Spread costs', body: 'The difference between the bid and ask price. On liquid pairs like BTC/USD this is small but nonzero. On less liquid altcoins or during volatile periods, the spread widens significantly.' },
          { title: 'Slippage', body: 'Occurs when the execution price differs from the intended price, especially on larger orders or during fast-moving markets. A trader entering and exiting frequently experiences more cumulative slippage than one holding a position for weeks.' },
          { title: 'Decision fatigue', body: 'Every trade requires a decision: entry price, position size, stop loss, take profit, hold or close. Each decision consumes mental energy. After dozens of decisions, quality degrades. The tenth trade of the day is made with less rigor than the first. This is a cognitive limitation that affects every human trader.' },
        ].map(item => (
          <div key={item.title} className="bg-[#121826] border border-[#1F2937] rounded-xl p-5 flex gap-4">
            <div className="flex-shrink-0 mt-0.5 w-5 h-5 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
            </div>
            <div>
              <p className="text-white font-semibold mb-1 text-sm">{item.title}</p>
              <p className="text-gray-400 text-[15px] leading-[1.8]">{item.body}</p>
            </div>
          </div>
        ))}
      </div>

      {/* What Selective Trading Looks Like */}
      <h2 className="text-2xl font-bold text-white mt-12 mb-4">What Selective Trading Looks Like</h2>
      <p className="text-gray-300 text-[17px] leading-[1.8] mb-5">
        The opposite of overtrading is not inactivity. It is selectivity. A selective trader has a
        defined system that specifies exactly when conditions are favorable for a trade. Everything
        outside those conditions is noise — acknowledged, observed, and ignored.
      </p>
      <div className="space-y-3 my-6">
        {[
          'Long periods of no activity, sometimes lasting weeks or months.',
          'Immediate action when the system signals — no hesitation, no second-guessing.',
          'Full conviction on each position because the setup meets every criterion.',
          'Acceptance that some good trades will be missed because they did not meet the full criteria.',
        ].map((item, i) => (
          <div key={i} className="bg-[#121826] border border-[#1F2937] rounded-xl px-5 py-4 flex gap-4">
            <div className="flex-shrink-0 mt-0.5 w-5 h-5 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            </div>
            <p className="text-gray-300 text-[15px] leading-[1.8]">{item}</p>
          </div>
        ))}
      </div>
      <p className="text-gray-300 text-[17px] leading-[1.8] mb-10">
        The hardest part is the waiting. A selective trader watching Bitcoin rally 20% without a signal
        feels like a failure — until the system catches the next 40% move from an entry that the
        overtrader could not hold because they were already overexposed from three previous attempts.
      </p>

      {/* How to Know If You Are Overtrading */}
      <h2 className="text-2xl font-bold text-white mt-12 mb-4">How to Know If You Are Overtrading</h2>
      <p className="text-gray-300 text-[17px] leading-[1.8] mb-6">Four signs that trading frequency is hurting your returns.</p>
      <div className="space-y-4 my-6">
        {[
          { n: '1', text: 'Your average holding period is measured in hours or days rather than weeks. Short holding periods indicate that positions are being entered and exited before trends have time to develop.' },
          { n: '2', text: 'You have more than three open positions simultaneously. Multiple concurrent positions usually reflect indecision rather than diversification — especially in crypto where most assets are highly correlated.' },
          { n: '3', text: 'You feel anxious when not in a position. If being in cash feels uncomfortable, the trading is driven by emotion rather than system. Cash is a position. It means the system has not identified an opportunity worth the risk.' },
          { n: '4', text: 'Your fee report shows total fees exceeding 1% of your portfolio per month. This is a concrete, measurable indicator that frequency is eroding returns regardless of win rate.' },
        ].map(item => (
          <div key={item.n} className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#1F2937] flex items-center justify-center text-[#CEB776] text-sm font-bold">
              {item.n}
            </div>
            <p className="text-gray-300 text-[16px] leading-[1.8] pt-1">{item.text}</p>
          </div>
        ))}
      </div>

      {/* The Data */}
      <h2 className="text-2xl font-bold text-white mt-12 mb-4">The Data on Less vs More</h2>
      <p className="text-gray-300 text-[17px] leading-[1.8] mb-5">
        The academic evidence is consistent across asset classes. A well-known study by Barber and
        Odean examined 66,000 brokerage accounts and found that the most active traders underperformed
        the least active traders by 6.5% annually. The reason was not skill — it was costs and
        behavioral errors compounding over time.
      </p>
      <p className="text-gray-300 text-[17px] leading-[1.8] mb-5">
        In crypto markets, the effect is amplified. Higher volatility creates more perceived
        opportunities, which increases trading frequency, which increases exposure to noise, fees, and
        emotional decisions. The 24/7 market structure eliminates the natural circuit breakers that
        traditional markets provide through closing hours and weekends.
      </p>
      <div className="bg-[#121826] border border-[#CEB776]/20 rounded-xl px-6 py-5 my-6">
        <p className="text-[#CEB776] font-semibold text-lg">
          The traders who survive multiple crypto cycles are overwhelmingly those who trade systematically and infrequently.
        </p>
      </div>

      {/* FAQ */}
      <h2 className="text-2xl font-bold text-white mt-12 mb-6">Frequently Asked Questions</h2>
      <div className="space-y-6 mb-10">
        {[
          { q: 'What is overtrading in crypto?', a: 'Overtrading is the habit of taking too many positions based on short-term price movements rather than systematic criteria. It increases exposure to fees, slippage, emotional decisions, and market noise, and is the most common reason retail crypto traders lose money.' },
          { q: 'How many trades per year is considered overtrading?', a: 'There is no universal number, but for a daily-timeframe BTC strategy, more than 20–30 trades per year typically indicates excessive frequency. Well-designed trend-following systems on Bitcoin generate 5–15 signals per year.' },
          { q: 'Why do most crypto traders lose money?', a: 'The primary reasons are overtrading (reacting to noise rather than signal), poor risk management, emotional decision-making, and cumulative transaction costs that erode returns over time. Studies show that less frequent traders consistently outperform more active traders.' },
          { q: 'How can I stop overtrading?', a: 'Use a systematic trading framework with defined entry criteria. Only trade when all conditions are met. Remove price alerts for short timeframes. Track your fee costs monthly. Accept that being in cash is a valid position when no opportunity meets your criteria.' },
        ].map(item => (
          <div key={item.q} className="bg-[#121826] border border-[#1F2937] rounded-xl p-6">
            <p className="text-white font-semibold mb-2 leading-snug">{item.q}</p>
            <p className="text-gray-400 text-[16px] leading-[1.8]">{item.a}</p>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="bg-[#121826] border border-[#C69214]/25 rounded-2xl p-8 text-center mt-12">
        <p className="text-white font-semibold text-lg mb-2 leading-snug">
          Tradinsight fires 5–6 signals per year — not because it cannot find more, but because only those setups survive every filter.
        </p>
        <p className="text-gray-400 text-sm mb-6">The system's job is to separate signal from noise. Yours is to wait.</p>
        <button
          onClick={onSignup}
          className="inline-flex items-center gap-2 bg-[#D4A017] text-black px-7 py-3.5 rounded-lg font-semibold text-sm hover:bg-[#E6B325] transition-colors shadow-lg shadow-black/30"
        >
          See the Signals That Made the Cut — Free
          <ArrowRight size={15} />
        </button>
      </div>
    </>
  );
}

/* ─── Article 3: Verify Signal Service ──────────────────── */
function VerifySignalServiceArticle({ onSignup }: { onSignup: () => void }) {
  const checklistItems = [
    {
      n: '1',
      q: 'Is there a complete trade history?',
      body: 'Every signal ever fired should be visible — not just the last month, not just the winners. A complete history means every entry date, entry price, direction (long or short), and the result. If the service says "we have been running for two years" but only shows the last 30 trades, the missing data is the data that matters.',
    },
    {
      n: '2',
      q: 'What is the profit factor?',
      body: 'Profit factor is gross profits divided by gross losses across all trades. This single number tells you whether the system makes more than it loses. Ask for the specific number. If they cannot provide it, they either do not track it or the number is not worth sharing. A profit factor below 1.5 after fees is marginal. Above 2.0 is strong. Above 3.0 is exceptional. Be skeptical of any service claiming a profit factor above 5.0 unless the track record is long enough to be statistically meaningful.',
    },
    {
      n: '3',
      q: 'How many trades is the track record based on?',
      body: 'A 90% win rate across 10 trades means almost nothing. Statistical significance requires a minimum sample. For a system trading on a daily timeframe, 30 trades is the bare minimum to start drawing conclusions. Systems with 50 or more trades across multiple market conditions — bull, bear, and sideways — provide the most reliable data.',
    },
    {
      n: '4',
      q: 'What is the maximum drawdown?',
      body: 'Every system loses money at some point. The question is how much. Maximum drawdown tells you the worst peak-to-trough decline the system has experienced. If a service does not disclose this number, they are hiding the risk. A system with a high profit factor but a 60% maximum drawdown requires exceptional conviction to follow — most traders will abandon it during the drawdown, locking in the loss.',
    },
    {
      n: '5',
      q: 'Can you verify the data independently?',
      body: 'This is the most important question. Can you personally confirm that the trades listed actually occurred at the prices and dates shown? Check signal entry prices against historical price charts, look for timestamps on signals published before the move happened rather than after, and check if the platform shows live signals you can track going forward. Screenshots of closed trades can be fabricated. A live platform where you can watch signals appear in real time is significantly more credible.',
    },
    {
      n: '6',
      q: 'Does the service show losing trades prominently?',
      body: 'A service that only highlights winners is not being transparent. Every legitimate system has losing trades — that is the nature of trading. Look for services that show losing trades with the same visibility as winning trades. If you have to dig to find the losses, the presentation is designed to mislead rather than inform.',
    },
    {
      n: '7',
      q: 'Is the methodology explained?',
      body: 'You do not need to understand every technical detail of how a system works. But the general approach should be transparent: is it trend following, mean reversion, technical indicators, on-chain data? A service that says "our proprietary algorithm" and offers no further explanation is asking you to trust a black box. A service that explains its methodology — even at a high level — is demonstrating confidence in its approach.',
    },
  ];

  const redFlags = [
    {
      title: 'Guaranteed returns or specific profit promises.',
      body: 'No legitimate trading system can guarantee returns. Markets are inherently uncertain. Any service that promises "10% per month" or "guaranteed profits" is either lying or does not understand trading.',
    },
    {
      title: 'Pressure to subscribe quickly.',
      body: 'Countdown timers, "limited spots available," and urgency-driven marketing are sales tactics, not indicators of quality. A good system does not need to pressure you — the data speaks for itself.',
    },
    {
      title: 'No track record before the service launched.',
      body: 'If a service started selling signals in January and has no data before January, you are the beta test. Look for systems with backtested or live histories that predate the commercial launch.',
    },
    {
      title: 'Frequent signals with no clear methodology.',
      body: 'Services that fire 5–10 signals per day across dozens of altcoins are typically selling activity, not insight. High frequency creates the appearance of value while making it nearly impossible for the user to evaluate which signals actually matter.',
    },
    {
      title: 'Deleted or edited signals.',
      body: 'If signals disappear from the history or are modified after the fact, the track record is unreliable. Look for platforms where the history is immutable.',
    },
  ];

  const trustMarkers = [
    'A complete, unedited trade history accessible to anyone — including non-paying users. The track record should be the marketing, not a hidden asset behind a paywall.',
    'Specific, verifiable metrics: profit factor, win rate, total trades, and maximum drawdown, calculated across the entire history.',
    'A clear methodology that explains the general approach without necessarily revealing proprietary details.',
    'Losing trades shown with equal prominence to winning trades. Transparency about drawdowns and difficult periods.',
    'A free tier or trial that allows you to verify the system before committing money. If a service is confident in its data, it has no reason to hide it behind a paywall.',
  ];

  return (
    <>
      {/* Opening */}
      <p className="text-gray-300 text-[17px] leading-[1.8] mb-10">
        A legitimate crypto signal service should have a publicly verifiable track record with specific
        entry dates, prices, and results for every trade. Before paying for any signal service, verify
        the profit factor, win rate, number of trades, and maximum drawdown across the complete history
        — not just highlighted winners. If a service cannot provide this data, that is your answer.
      </p>

      {/* The Signal Service Problem */}
      <h2 className="text-2xl font-bold text-white mt-12 mb-4">The Signal Service Problem</h2>
      <p className="text-gray-300 text-[17px] leading-[1.8] mb-5">
        The crypto signal industry is largely unregulated and overwhelmingly opaque. Thousands of
        services operate across Telegram, Discord, Twitter, and dedicated platforms — most charging
        between $30 and $500 per month. The vast majority share one characteristic: there is no way
        to verify whether their signals actually work.
      </p>
      <p className="text-gray-300 text-[17px] leading-[1.8] mb-5">
        This is not an accident. Opacity is the business model. When there is no public record of
        every trade, the service can selectively share winners, quietly ignore losers, and maintain
        an illusion of profitability that does not survive scrutiny.
      </p>
      <p className="text-gray-300 text-[17px] leading-[1.8] mb-10">
        The result is an industry where the marketing is excellent and the performance is unknowable.
        For the trader looking for genuine help, this creates a trust problem that is nearly impossible
        to solve without a clear verification framework.
      </p>

      {/* The Checklist */}
      <h2 className="text-2xl font-bold text-white mt-12 mb-2">The Verification Checklist</h2>
      <p className="text-gray-400 text-[16px] leading-[1.8] mb-8">
        Before paying for any crypto signal service, ask these seven questions. If the service cannot
        answer all of them with specific, verifiable data, move on.
      </p>
      <div className="space-y-4">
        {checklistItems.map(item => (
          <div key={item.n} className="bg-[#121826] border border-[#1F2937] rounded-xl p-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center text-cyan-400 text-sm font-bold">
                {item.n}
              </div>
              <div>
                <p className="text-white font-semibold mb-2 leading-snug">{item.q}</p>
                <p className="text-gray-400 text-[15px] leading-[1.8]">{item.body}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Red Flags */}
      <h2 className="text-2xl font-bold text-white mt-14 mb-4">Red Flags to Watch For</h2>
      <p className="text-gray-300 text-[17px] leading-[1.8] mb-6">
        Several patterns reliably indicate a service that is not worth your money.
      </p>
      <div className="space-y-4 mb-10">
        {redFlags.map(flag => (
          <div key={flag.title} className="flex gap-4">
            <div className="flex-shrink-0 mt-1 w-5 h-5 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
            </div>
            <div>
              <p className="text-white font-semibold mb-1 text-[16px]">{flag.title}</p>
              <p className="text-gray-400 text-[15px] leading-[1.8]">{flag.body}</p>
            </div>
          </div>
        ))}
      </div>

      {/* What a Trustworthy Service Looks Like */}
      <h2 className="text-2xl font-bold text-white mt-12 mb-4">What a Trustworthy Service Looks Like</h2>
      <p className="text-gray-300 text-[17px] leading-[1.8] mb-6">
        A service worth paying for has the following characteristics:
      </p>
      <div className="space-y-3 mb-10">
        {trustMarkers.map((marker, i) => (
          <div key={i} className="flex gap-4 bg-[#121826] border border-[#1F2937] rounded-xl p-5">
            <div className="flex-shrink-0 mt-0.5 w-5 h-5 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            </div>
            <p className="text-gray-300 text-[15px] leading-[1.8]">{marker}</p>
          </div>
        ))}
      </div>

      {/* FAQ */}
      <h2 className="text-2xl font-bold text-white mt-12 mb-6">Frequently Asked Questions</h2>
      <div className="space-y-6 mb-10">
        {[
          { q: 'How can I tell if a crypto signal service is legitimate?', a: 'Check for a complete public trade history, a verifiable profit factor above 1.5, at least 30 trades across different market conditions, disclosed maximum drawdown, and a methodology explanation. If any of these are missing, proceed with caution.' },
          { q: 'What is a good profit factor for a signal service?', a: 'A profit factor above 2.0 is considered strong. Above 3.0 is exceptional. Be cautious of extremely high claims unless backed by a large sample size of 30 or more trades.' },
          { q: 'Should I trust crypto signal services on Telegram?', a: 'Many Telegram signal services lack verifiable track records. Before joining, ask for a complete trade history with specific dates and prices. If they can only provide screenshots of winning trades, the track record is not verifiable.' },
          { q: 'How many trades are needed to evaluate a signal service?', a: 'At minimum 30 trades across different market conditions. A system that only has data from a bull market has not been tested in adversity. The more trades across varied conditions, the more reliable the evaluation.' },
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
          Tradinsight publishes its complete track record — 45 trades since 2018, every entry visible, including the losses.
        </p>
        <p className="text-gray-400 text-sm mb-6">Free users can verify every signal before paying. Don't trust us. Verify it.</p>
        <button
          onClick={onSignup}
          className="inline-flex items-center gap-2 bg-[#D4A017] text-black px-7 py-3.5 rounded-lg font-semibold text-sm hover:bg-[#E6B325] transition-colors shadow-lg shadow-black/30"
        >
          View the Full Track Record — Free
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
  const postUrl = `${BASE_URL}/blog/${slug}`;

  /* SEO: title, meta, JSON-LD */
  useEffect(() => {
    if (!article || !slug) return;
    const seo = SEO_BY_SLUG[slug];
    if (!seo) return;

    const prevTitle = document.title;
    document.title = seo.title;

    const metas = [
      upsertMeta('name',     'description',         seo.description),
      upsertMeta('property', 'og:title',            seo.ogTitle),
      upsertMeta('property', 'og:description',      seo.description),
      upsertMeta('property', 'og:image',            `${BASE_URL}/preview.png`),
      upsertMeta('property', 'og:url',              postUrl),
      upsertMeta('name',     'twitter:title',       seo.ogTitle),
      upsertMeta('name',     'twitter:description', seo.description),
    ];

    const faqSchema = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: seo.faq.map(({ q, a }) => ({
        '@type': 'Question',
        name: q,
        acceptedAnswer: { '@type': 'Answer', text: a },
      })),
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
  }, [slug, article, postUrl]);

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
    navigator.clipboard.writeText(postUrl).then(() => {
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
              <img src="/logo.svg" alt="Tradinsight" className="h-[24px] w-auto" />
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
        {slug === 'trend-following-bitcoin-fewer-signals' && (
          <TrendFollowingArticle onSignup={() => navigate('/')} />
        )}
        {slug === 'how-to-verify-crypto-signal-service' && (
          <VerifySignalServiceArticle onSignup={() => navigate('/')} />
        )}
        {slug === 'on-chain-indicators-mvrv-puell-nvt' && (
          <OnChainIndicatorsArticle onSignup={() => navigate('/')} />
        )}
        {slug === 'signal-vs-noise-why-traders-overtrade' && (
          <SignalVsNoiseArticle onSignup={() => navigate('/')} />
        )}

        {/* Divider */}
        <div className="border-t border-[#1F2937] mt-14 mb-8" />

        {/* Share */}
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-gray-500 text-sm">Share:</span>
          <a
            href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(postUrl)}&text=${encodeURIComponent(article.title)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-gray-400 hover:text-white text-sm border border-[#1F2937] hover:border-[#2D3748] px-3 py-1.5 rounded-lg transition-colors"
          >
            <ExternalLink size={13} />
            Share on X
          </a>
          <a
            href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(postUrl)}`}
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
