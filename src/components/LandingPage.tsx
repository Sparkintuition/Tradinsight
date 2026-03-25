import { TrendingUp, Users, Shield, Clock, BarChart2, CheckCircle, ArrowRight, Zap, Filter } from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
  onLogin: () => void;
  onSignup: () => void;
  onMethodology?: () => void;
}

export function LandingPage({
  onGetStarted,
  onLogin,
  onSignup,
  onMethodology,
}: LandingPageProps) {
  return (
    <div className="min-h-screen bg-[#0B0F19] font-sans">

      {/* ── HEADER ── */}
      <header className="container mx-auto px-4 py-6 sticky top-0 z-50 bg-[#0B0F19]/80 backdrop-blur-md border-b border-white/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="text-cyan-400" size={28} />
            <span className="text-xl font-bold text-white tracking-tight">Tradinsight</span>
          </div>
          <div className="flex items-center gap-3">
            {onMethodology && (
              <button
                onClick={onMethodology}
                className="hidden sm:flex items-center gap-1.5 text-gray-400 hover:text-white text-sm transition-colors"
              >
                How it Works
              </button>
            )}
            <button
              onClick={onLogin}
              className="text-gray-400 hover:text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm"
            >
              Log In
            </button>
            <button
              onClick={onSignup}
              className="border border-[#C69214]/50 text-[#D4A017] px-5 py-2 rounded-lg font-semibold hover:bg-[#C69214]/10 transition-colors text-sm"
            >
              Sign Up Free
            </button>
          </div>
        </div>
      </header>

      {/* ── HERO ── */}
      <section className="container mx-auto px-4 pt-24 pb-16">
        <div className="max-w-3xl mx-auto text-center relative">

          {/* Glow */}
          <div className="absolute inset-x-0 top-0 mx-auto h-64 w-64 rounded-full bg-cyan-500/8 blur-3xl pointer-events-none" />

          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/5 px-4 py-1.5 mb-6">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-cyan-400 text-xs font-semibold tracking-widest uppercase">BTC Signal Platform</span>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold text-white tracking-tight mb-6 leading-[1.1] relative">
            Stop trading noise.
            <br />
            <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              Wait for the edge.
            </span>
          </h1>

          <p className="text-lg text-gray-300 mb-4 max-w-2xl mx-auto leading-relaxed relative">
            Tradinsight signals only when multiple data systems align — strategy, trend, and market
            conditions all pointing the same direction. Most months: no signal. When it fires: it matters.
          </p>

          <p className="text-sm text-gray-500 mb-10 max-w-xl mx-auto">
            Not for day traders. Built for BTC investors who understand that <span className="text-gray-300">fewer, better decisions</span> beat constant activity.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 relative">
            <button
              onClick={onGetStarted}
              className="bg-[#D4A017] text-black px-8 py-4 rounded-lg font-semibold text-base hover:bg-[#E6B325] transition-colors inline-flex items-center gap-2 shadow-lg shadow-black/30"
            >
              See If This Fits Your Style
              <ArrowRight size={16} />
            </button>
            <span className="text-gray-500 text-sm">Takes 2 minutes · Free to start</span>
          </div>

          {/* Trust tags */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-2 text-xs relative">
            {[
              'BTC-only',
              'Backtested since 2018',
              'Low-frequency signals',
              'Risk-first approach',
            ].map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-[#1F2937] bg-[#121826] px-3 py-1.5 text-gray-400"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── PHILOSOPHY CALLOUT ── */}
      <section className="container mx-auto px-4 py-6">
        <div className="max-w-3xl mx-auto rounded-2xl border border-amber-500/20 bg-amber-500/5 p-6 text-center">
          <p className="text-amber-300 font-medium text-sm leading-relaxed">
            ⚠️ <strong>Important:</strong> Tradinsight generates 5–6 high-conviction signals per year.
            If you're looking for daily alerts or scalping signals, this isn't for you.
            If you're looking for <em>meaningful</em> entries that capture major BTC trends — read on.
          </p>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-white mb-3 tracking-tight">How the System Works</h2>
            <p className="text-gray-400 max-w-xl mx-auto text-sm leading-relaxed">
              A signal only fires when all three layers agree. That's the filter most services skip.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Step 1 */}
            <div className="bg-[#121826] border border-[#1F2937] rounded-2xl p-6 relative hover:border-cyan-500/30 transition-colors">
              <div className="text-cyan-400 mb-4">
                <BarChart2 size={28} />
              </div>
              <div className="text-xs font-semibold text-cyan-400 tracking-widest uppercase mb-2">Layer 1</div>
              <h3 className="text-white font-semibold text-lg mb-2">Strategy Signal</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                A multi-indicator strategy (ADX, CCI, volatility) identifies potential long or short setups based on price structure and momentum.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-[#121826] border border-[#1F2937] rounded-2xl p-6 relative hover:border-cyan-500/30 transition-colors">
              <div className="text-cyan-400 mb-4">
                <Filter size={28} />
              </div>
              <div className="text-xs font-semibold text-cyan-400 tracking-widest uppercase mb-2">Layer 2</div>
              <h3 className="text-white font-semibold text-lg mb-2">TPI Confirmation</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                The Trend Positioning Index evaluates macro market conditions. If the broader trend disagrees with the signal, we don't trade. We wait.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-[#121826] border border-[#1F2937] rounded-2xl p-6 relative hover:border-cyan-500/30 transition-colors">
              <div className="text-cyan-400 mb-4">
                <Zap size={28} />
              </div>
              <div className="text-xs font-semibold text-cyan-400 tracking-widest uppercase mb-2">Layer 3</div>
              <h3 className="text-white font-semibold text-lg mb-2">Aligned Entry</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Only when both layers agree does Tradinsight generate an actionable signal — with entry context, direction, and the reasoning behind it.
              </p>
            </div>
          </div>

          {/* Connector line visual hint */}
          <p className="text-center text-gray-500 text-sm mt-8">
            Most signals from Layer 1 are filtered out by Layer 2. <span className="text-gray-300">That filtering is the edge.</span>
          </p>
        </div>
      </section>

      {/* ── PERFORMANCE STATS ── */}
      <section className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-4">
            <h2 className="text-3xl font-bold text-white mb-3 tracking-tight">Strategy Performance</h2>
            <p className="text-gray-400 text-sm max-w-xl mx-auto">
              Backtested on BTC since 2018 — <span className="text-gray-300">raw strategy signals, no TPI filter applied.</span>
              <br />This is the baseline. The TPI layer improves on it further.
            </p>
          </div>

          {/* "Floor not ceiling" callout */}
          <div className="max-w-2xl mx-auto mb-8 rounded-xl border border-cyan-500/15 bg-cyan-500/5 px-5 py-3 text-center">
            <p className="text-cyan-300 text-xs leading-relaxed">
              <span className="font-semibold">These numbers include unfiltered signals</span> — entries the TPI would have skipped.
              The full Tradinsight system (strategy + TPI) is designed to cut the noise and keep only the high-conviction setups.
              Think of this as the floor, not the ceiling.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-[#121826] border border-[#1F2937] rounded-2xl p-6 text-center hover:border-cyan-400/30 transition-colors">
              <p className="text-3xl font-bold text-white">48</p>
              <p className="text-gray-400 text-xs mt-2 leading-snug">Raw signals<br/>since 2018</p>
            </div>
            <div className="bg-[#121826] border border-[#1F2937] rounded-2xl p-6 text-center hover:border-cyan-400/30 transition-colors">
              <p className="text-3xl font-bold text-white">60.4%</p>
              <p className="text-gray-400 text-xs mt-2 leading-snug">Win rate —<br/>unfiltered baseline</p>
            </div>
            <div className="bg-[#121826] border border-[#1F2937] rounded-2xl p-6 text-center hover:border-cyan-400/30 transition-colors">
              <p className="text-3xl font-bold text-white">1.67</p>
              <p className="text-gray-400 text-xs mt-2 leading-snug">Profit factor —<br/>wins outweigh losses by 67%</p>
            </div>
            <div className="bg-[#121826] border border-[#1F2937] rounded-2xl p-6 text-center hover:border-cyan-400/30 transition-colors">
              <p className="text-3xl font-bold text-white">5–6</p>
              <p className="text-gray-400 text-xs mt-2 leading-snug">TPI-confirmed signals<br/>per year (live system)</p>
            </div>
          </div>

          <p className="text-center text-gray-500 text-xs mt-5">
            Backtested results. Past performance does not guarantee future results. Live signal tracking in progress.
          </p>
        </div>
      </section>

      {/* ── EQUITY CURVE ── */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-white mb-3 tracking-tight">Equity Curve</h2>
          <p className="text-gray-400 text-sm mb-1">
            Growth of $1,000 — <span className="text-gray-300">raw strategy signals, no TPI filter.</span>
          </p>
          <p className="text-gray-500 text-xs mb-8">
            This includes signals the TPI would have skipped. The live Tradinsight system applies the filter on top — targeting only the setups where everything aligns.
          </p>
          <div className="bg-[#121826] border border-[#1F2937] rounded-2xl p-4 shadow-lg shadow-black/20">
            <img src="/equity.png" alt="Equity Curve" className="rounded-xl w-full" />
          </div>
          <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/5 px-4 py-2">
            <span className="text-cyan-400 text-xs font-medium">The TPI filter removes low-conviction entries — designed to make this curve steeper.</span>
          </div>
        </div>
      </section>

      {/* ── WHAT YOU GET ── */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-3 tracking-tight">What You Get Between Signals</h2>
            <p className="text-gray-400 text-sm">Signals are rare. Market insight isn't. Stay informed while you wait.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {[
              {
                icon: <Shield size={20} className="text-cyan-400" />,
                title: 'Live TPI Status',
                desc: 'See the current market regime — bullish, neutral, or bearish — updated regularly so you always know where conditions stand.',
              },
              {
                icon: <Clock size={20} className="text-cyan-400" />,
                title: 'Signal Readiness Indicator',
                desc: 'Know how close (or far) the system is from generating a signal. No guessing, no noise — just honest system state.',
              },
              {
                icon: <BarChart2 size={20} className="text-cyan-400" />,
                title: 'Weekly Market Context',
                desc: 'Short, data-driven updates on BTC conditions. Not hype. Just what the indicators are saying right now.',
              },
              {
                icon: <CheckCircle size={20} className="text-cyan-400" />,
                title: 'Full Signal History',
                desc: 'Every past signal with entry, exit, result, and TPI reasoning. Transparent record, no cherry-picking.',
              },
            ].map((item) => (
              <div
                key={item.title}
                className="bg-[#121826] border border-[#1F2937] rounded-2xl p-5 flex gap-4 hover:border-cyan-500/20 transition-colors"
              >
                <div className="mt-0.5 shrink-0">{item.icon}</div>
                <div>
                  <h3 className="text-white font-semibold text-sm mb-1">{item.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── IS THIS FOR YOU ── */}
      <section className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">Is Tradinsight For You?</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-[#121826] border border-emerald-500/20 rounded-2xl p-6">
              <p className="text-emerald-400 font-semibold text-sm mb-4 tracking-wide uppercase">✓ Good fit if you...</p>
              <ul className="space-y-2">
                {[
                  'Think in months, not minutes',
                  'Want to understand why a signal fires',
                  'Value capital protection over frequent trades',
                  'Have been burned by noisy signal services before',
                  'Want a system, not a guru',
                ].map((item) => (
                  <li key={item} className="text-gray-300 text-sm flex gap-2 items-start">
                    <span className="text-emerald-400 mt-0.5">✓</span> {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-[#121826] border border-red-500/20 rounded-2xl p-6">
              <p className="text-red-400 font-semibold text-sm mb-4 tracking-wide uppercase">✗ Not for you if you...</p>
              <ul className="space-y-2">
                {[
                  'Need daily or weekly signals',
                  'Want to scalp or day trade',
                  'Expect guaranteed profits',
                  'Can\'t handle weeks without activity',
                  'Are looking for hype-driven calls',
                ].map((item) => (
                  <li key={item} className="text-gray-300 text-sm flex gap-2 items-start">
                    <span className="text-red-400 mt-0.5">✗</span> {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── BOTTOM CTA ── */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-2xl mx-auto bg-[#121826] rounded-2xl p-12 text-center border border-[#1F2937] relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent pointer-events-none" />
          <div className="bg-cyan-500/10 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-6 border border-cyan-500/20 relative">
            <Users className="text-cyan-400" size={28} />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3 tracking-tight relative">
            Built for serious BTC investors
          </h2>
          <p className="text-gray-400 mb-2 text-sm leading-relaxed relative max-w-md mx-auto">
            Answer a few quick questions and we'll confirm this fits your trading mindset.
            Free plan available — no card required.
          </p>
          <p className="text-gray-500 text-xs mb-8 relative">The free tier shows delayed signals so you can verify the system before committing.</p>
          <button
            onClick={onGetStarted}
            className="bg-[#D4A017] text-black px-8 py-4 rounded-lg font-semibold text-base hover:bg-[#E6B325] transition-colors inline-flex items-center gap-2 shadow-lg shadow-black/30 relative"
          >
            Start Free — No Card Needed
            <ArrowRight size={16} />
          </button>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="container mx-auto px-4 py-8 border-t border-[#1F2937]">
        <div className="text-center text-gray-500 text-xs">
          <p className="mb-2">© 2026 Tradinsight · Operated by SPARKIN LTD (registered in England and Wales)</p>
          <p className="text-gray-600 mb-3">Not financial advice. Trading involves risk. Past performance does not guarantee future results.</p>
          <div className="flex items-center justify-center gap-4">
            <a href="/terms" className="text-gray-500 hover:text-gray-300 transition-colors">Terms of Use</a>
            <span className="text-gray-700">·</span>
            <a href="/terms#privacy" className="text-gray-500 hover:text-gray-300 transition-colors">Privacy Policy</a>
            <span className="text-gray-700">·</span>
            <a href="/terms#refunds" className="text-gray-500 hover:text-gray-300 transition-colors">Refund Policy</a>
          </div>
        </div>
      </footer>
    </div>
  );
}