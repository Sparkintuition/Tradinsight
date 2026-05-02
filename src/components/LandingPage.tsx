import { Link } from 'react-router-dom';
import { Users, Shield, Clock, BarChart2, CheckCircle, ArrowRight, Zap, Filter } from 'lucide-react';

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
            <img src="/logo.svg" alt="Tradinsight" className="h-[24px] w-auto" />
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
            <Link
              to="/blog"
              className="hidden sm:flex text-gray-400 hover:text-white text-sm transition-colors"
            >
              Blog
            </Link>
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
      <section className="container mx-auto px-4 pt-14 pb-16">
        <div className="max-w-3xl mx-auto text-center relative">

          {/* Glow */}
          <div className="absolute inset-x-0 top-0 mx-auto h-64 w-64 rounded-full bg-cyan-500/8 blur-3xl pointer-events-none" />

          <h1 className="text-5xl md:text-6xl font-bold text-white tracking-tight mb-6 leading-[1.1] relative">
            Stop trading noise.
            <br />
            <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              Wait for the edge.
            </span>
          </h1>

          <p className="text-lg text-gray-300 mb-4 max-w-2xl mx-auto leading-relaxed relative">
            Tradinsight signals only when multiple data systems align: strategy, trend, and market
            conditions all pointing the same direction. Most months bring no signal. When it fires, it matters.
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
            Tradinsight fires 5–6 signals per year. Not because it can't find more, but because only those setups meet the full criteria.
            If you need constant activity, this is the wrong tool. If you understand that <em>discipline creates an edge</em>, keep reading.
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
                Only when both layers agree does Tradinsight generate an entry signal, with the price, direction, TPI state, and the full reasoning behind it.
              </p>
            </div>
          </div>

          {/* Connector line visual hint */}
          <p className="text-center text-gray-500 text-sm mt-8">
            Most signals from Layer 1 are filtered out by Layer 2. <span className="text-gray-300">That filtering is the edge.</span>
          </p>
          <p className="text-center text-gray-500 text-sm mt-3 max-w-2xl mx-auto">
            When conditions deteriorate while a position is open, the system fires a Hold signal. The active position closes at the Hold's price and capital moves to cash until the next high-conviction setup.
          </p>
        </div>
      </section>

      {/* ── SIGNAL MOCKUP ── */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-white mb-3 tracking-tight">
              What a Signal Looks Like
            </h2>
            <p className="text-gray-400 text-sm max-w-xl mx-auto leading-relaxed">
              When conditions align, this is what lands in your dashboard. Clear direction, entry price, TPI confirmation, and the reasoning behind it.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

            {/* Signal card */}
            <div className="lg:col-span-2 bg-[#121826] rounded-2xl border border-[#1F2937] p-5">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="text-lg font-bold text-white">BTC/USDT</h3>
                  <p className="text-gray-500 text-xs">Active signal</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
                  </span>
                  <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
                    LONG ACTIVE
                  </span>
                </div>
              </div>

              {/* Signal details */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-[#0F172A]/70 rounded-xl p-4 border border-[#1F2937]">
                  <p className="text-gray-500 text-xs mb-1">Signal Direction</p>
                  <div className="flex items-center gap-2">
                    <ArrowRight size={16} className="text-emerald-400 -rotate-45" />
                    <span className="text-emerald-400 font-bold text-lg">LONG</span>
                  </div>
                </div>
                <div className="bg-[#0F172A]/70 rounded-xl p-4 border border-[#1F2937]">
                  <p className="text-gray-500 text-xs mb-1">Triggered Price</p>
                  <p className="text-white font-bold text-lg">$65,400</p>
                </div>
                <div className="bg-[#0F172A]/70 rounded-xl p-4 border border-[#1F2937]">
                  <p className="text-gray-500 text-xs mb-1">Signal Date</p>
                  <p className="text-white font-semibold text-sm">4th March 2026</p>
                </div>
                <div className="bg-[#0F172A]/70 rounded-xl p-4 border border-[#1F2937]">
                  <p className="text-gray-500 text-xs mb-1">System Layers</p>
                  <div className="flex gap-1.5 mt-1">
                    <span className="text-[10px] font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded px-1.5 py-0.5">Strategy ✓</span>
                    <span className="text-[10px] font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded px-1.5 py-0.5">TPI ✓</span>
                  </div>
                </div>
              </div>

              {/* Trade management note */}
              <div className="bg-[#0F172A]/70 rounded-xl p-4 border border-[#1F2937] mb-4">
                <p className="text-gray-500 text-xs font-medium mb-1">Trade Management</p>
                <p className="text-gray-300 text-xs leading-relaxed">
                  Tradinsight provides entry direction. The system also fires Hold signals to exit positions when conditions deteriorate. Beyond that, take profit and stop loss are set by you based on your risk tolerance and position size.
                </p>
              </div>

              {/* Premium analysis — shown as example */}
              <div className="bg-[#0F172A]/70 rounded-xl p-4 border border-[#C69214]/20">
                <div className="flex items-center gap-2 mb-2.5">
                  <Zap size={11} className="text-[#D4A017]" />
                  <p className="text-[#D4A017] text-xs font-medium">Signal Analysis</p>
                  <span className="ml-auto text-[10px] text-gray-600 border border-[#1F2937] rounded px-1.5 py-0.5">Premium</span>
                </div>
                <p className="text-gray-300 text-xs leading-relaxed">
                  BTC has pulled back to a technically oversold level while the broader trend remains intact. Momentum is recovering, the macro environment is supportive, and on-chain data suggests BTC is fairly valued, not overextended. The strategy and TPI are in agreement. This is the type of setup the system waits months for.
                </p>
              </div>
            </div>

            {/* TPI panel */}
            <div className="space-y-4">

              {/* TPI status */}
              <div className="bg-[#121826] rounded-2xl border border-cyan-500/20 p-5">
                <div className="flex items-center gap-2 mb-4">
                  <BarChart2 size={14} className="text-cyan-400" />
                  <h3 className="text-white font-semibold text-sm">Market Conditions</h3>
                  <span className="ml-auto text-[10px] text-gray-500">Live TPI</span>
                </div>
                <div className="space-y-3">
                  <div className="bg-[#0F172A]/70 rounded-xl p-3.5 border border-[#1F2937]">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white text-xs font-semibold">TPI Medium Term</span>
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-2.5 py-0.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                        Positive
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {['Momentum', 'SuperTrend', 'SAR', 'DMI', 'SPX'].map(t => (
                        <span key={t} className="text-[10px] text-gray-500 bg-[#0B0F19] border border-[#1F2937] rounded px-1.5 py-0.5">{t}</span>
                      ))}
                    </div>
                  </div>
                  <div className="bg-[#0F172A]/70 rounded-xl p-3.5 border border-[#1F2937]">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white text-xs font-semibold">Value Indicator</span>
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-400 bg-gray-500/10 border border-gray-500/20 rounded-full px-2.5 py-0.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-400 inline-block" />
                        Neutral
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {['CVDD', 'Reserve Risk', 'MVRV', 'NUPL'].map(t => (
                        <span key={t} className="text-[10px] text-gray-500 bg-[#0B0F19] border border-[#1F2937] rounded px-1.5 py-0.5">{t}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Signal remains active note */}
              <div className="bg-[#121826] rounded-2xl border border-[#1F2937] p-4 text-center">
                <Clock size={14} className="text-gray-500 mx-auto mb-2" />
                <p className="text-gray-400 text-xs leading-relaxed">
                  A signal stays active until the next opposite-direction signal or a Hold signal closes the position. Day-to-day trade management between those points is yours.
                </p>
              </div>

              {/* What free vs premium sees */}
              <div className="bg-[#121826] rounded-2xl border border-[#1F2937] p-4">
                <p className="text-gray-500 text-[10px] font-semibold uppercase tracking-wider mb-3">Free vs Premium</p>
                <div className="space-y-2">
                  {[
                    { label: 'Signal history', free: true },
                    { label: 'Entry price & date', free: true },
                    { label: 'TPI state', free: false },
                    { label: 'Real-time alerts', free: false },
                    { label: 'Full analysis', free: false },
                  ].map(item => (
                    <div key={item.label} className="flex items-center justify-between">
                      <span className="text-gray-400 text-xs">{item.label}</span>
                      <span className={`text-xs font-medium ${item.free ? 'text-emerald-400' : 'text-[#D4A017]'}`}>
                        {item.free ? 'Free' : 'Premium'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Caption */}
          <p className="text-center text-gray-600 text-xs mt-6">
            Real signal, 4th March 2026. Premium members saw this the moment it fired. Free members will see it after 1 week.
          </p>
        </div>
      </section>


      {/* ── VERIFY IT ── */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-[#fafafa] tracking-tight mb-4">
            Don't trust us. Verify it.
          </h2>
          <p className="text-[#a1a1aa] text-base leading-relaxed mb-8 max-w-lg mx-auto">
            Every signal since 2018 is public. Check the dates, the prices, and the results, then decide.
          </p>
          <a
            href="#signal-history"
            onClick={(e) => {
              e.preventDefault();
              document.getElementById('signal-history')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="inline-flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-7 py-3.5 rounded-lg font-semibold text-sm transition-colors"
          >
            View Signal History
            <ArrowRight size={15} />
          </a>
        </div>
      </section>

      {/* ── PERFORMANCE STATS ── */}
      <section id="signal-history" className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-4">
            <h2 className="text-3xl font-bold text-white mb-3 tracking-tight">Strategy Performance</h2>
            <p className="text-gray-400 text-sm max-w-xl mx-auto">
              Backtested on BTC since 2018. <span className="text-gray-300">Raw strategy signals, no TPI filter applied.</span>
              <br />This is the baseline. The TPI layer improves on it further.
            </p>
          </div>

          {/* "Floor not ceiling" callout */}
          <div className="max-w-2xl mx-auto mb-8 rounded-xl border border-cyan-500/15 bg-cyan-500/5 px-5 py-3 text-center">
            <p className="text-cyan-300 text-xs leading-relaxed">
              <span className="font-semibold">These numbers include unfiltered signals</span>. They're entries the TPI would have skipped.
              The full Tradinsight system (strategy + TPI) is designed to cut the noise and keep only the high-conviction setups.
              Think of this as the floor, not the ceiling.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-[#121826] border border-[#1F2937] rounded-2xl p-6 text-center hover:border-cyan-400/30 transition-colors">
              <p className="text-3xl font-bold text-white">43</p>
              <p className="text-gray-400 text-xs mt-2 leading-snug">Raw signals<br/>since 2018</p>
            </div>
            <div className="bg-[#121826] border border-[#1F2937] rounded-2xl p-6 text-center hover:border-cyan-400/30 transition-colors">
              <p className="text-3xl font-bold text-white">65.1%</p>
              <p className="text-gray-400 text-xs mt-2 leading-snug">Win rate.<br/>Unfiltered baseline</p>
            </div>
            <div className="bg-[#121826] border border-[#1F2937] rounded-2xl p-6 text-center hover:border-cyan-400/30 transition-colors">
              <p className="text-3xl font-bold text-white">4.59</p>
              <p className="text-gray-400 text-xs mt-2 leading-snug">Profit factor.<br/>Wins outweigh losses by 359%</p>
            </div>
            <div className="bg-[#121826] border border-[#1F2937] rounded-2xl p-6 text-center hover:border-cyan-400/30 transition-colors">
              <p className="text-3xl font-bold text-white">5–6</p>
              <p className="text-gray-400 text-xs mt-2 leading-snug">TPI-confirmed signals<br/>per year (live system)</p>
            </div>
          </div>

          <p className="text-center text-gray-500 text-xs mt-5">
            Backtested results · metrics as of March 2026 · past performance does not guarantee future results.
          </p>
        </div>
      </section>

      {/* ── EQUITY CURVE ── */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-white mb-3 tracking-tight">Equity Curve</h2>
          <p className="text-gray-400 text-sm mb-1">
            Growth of $1,000. <span className="text-gray-300">Raw strategy signals, no TPI filter.</span>
          </p>
          <p className="text-gray-500 text-xs mb-8">
            43 signals since 2018 · 4.54 profit factor · 62.8% win rate. This includes signals the TPI would have skipped. The live Tradinsight system applies the filter on top, targeting only the highest-conviction setups.
          </p>
          <div className="bg-[#121826] border border-[#1F2937] rounded-2xl p-4 shadow-lg shadow-black/20">
            <img src="/equity.png" alt="Equity Curve" className="rounded-xl w-full" />
          </div>
          <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/5 px-4 py-2">
            <span className="text-cyan-400 text-xs font-medium">The TPI filter cuts low-conviction entries. Fewer trades. Higher selectivity. The live system builds on this baseline.</span>
          </div>
        </div>
      </section>

      {/* ── WHAT YOU GET ── */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-3 tracking-tight">What You Get Between Signals</h2>
            <p className="text-gray-400 text-sm">Most months: no signal. That doesn't mean silence. Premium keeps you oriented while the system watches.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {[
              {
                icon: <Shield size={20} className="text-cyan-400" />,
                title: 'Live TPI Status',
                desc: 'See the current market regime (bullish, neutral, or bearish), updated regularly so you always know where conditions stand.',
              },
              {
                icon: <Clock size={20} className="text-cyan-400" />,
                title: 'Signal Readiness Indicator',
                desc: 'Know how close (or far) the system is from generating a signal. No guessing, no noise. Just honest system state.',
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
            The system waits for the right moment. So should you.
          </h2>
          <p className="text-gray-400 mb-2 text-sm leading-relaxed relative max-w-md mx-auto">
            Answer 4 questions. We'll tell you exactly how this system fits your approach.
            Free plan available, no card required.
          </p>
          <p className="text-gray-500 text-xs mb-8 relative">Free plan: access the full 43-signal history so you can verify the track record before committing.</p>
          <button
            onClick={onGetStarted}
            className="bg-[#D4A017] text-black px-8 py-4 rounded-lg font-semibold text-base hover:bg-[#E6B325] transition-colors inline-flex items-center gap-2 shadow-lg shadow-black/30 relative"
          >
            Start Free. No Card Needed
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