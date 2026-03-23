import { TrendingUp, Users, ArrowRight } from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
}

export function LandingPage({ onGetStarted }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-[#0B0F19]">
      <header className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="text-cyan-400" size={32} />
            <span className="text-2xl font-bold text-white tracking-tight">
              Tradinsight
            </span>
          </div>

          <button
            onClick={onGetStarted}
            className="border border-yellow-500/40 text-yellow-300 px-6 py-2 rounded-lg font-semibold hover:bg-yellow-500/10 transition-colors"
          >
            Test Profile
          </button>
        </div>
      </header>

      <section className="container mx-auto px-4 pt-20 pb-12">
        <div className="max-w-4xl mx-auto text-center relative">
          <div className="absolute inset-x-0 top-10 mx-auto h-40 w-40 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />

          <h1 className="text-5xl md:text-6xl font-bold text-white tracking-tight mb-6 leading-tight relative">
            For traders who trust
            <br />
            <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              Data over Instincts
            </span>
          </h1>

          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed relative">
            Follow clear BTC signals powered by a proven strategy, with simple market
            context designed for investors who want confidence, not confusion.
          </p>

          <button
            onClick={onGetStarted}
            className="bg-[#D4A017] text-black px-8 py-4 rounded-lg font-semibold text-lg hover:bg-[#E6B325] transition-colors inline-flex items-center shadow-lg shadow-black/30 relative"
          >
            Start Free Assessment
          </button>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-sm relative">
            <span className="rounded-full border border-[#1F2937] bg-[#121826] px-4 py-2 text-gray-300">
              BTC-only strategy
            </span>
            <span className="rounded-full border border-[#1F2937] bg-[#121826] px-4 py-2 text-gray-300">
              Backtested since 2018
            </span>
            <span className="rounded-full border border-[#1F2937] bg-[#121826] px-4 py-2 text-gray-300">
              Beginner-friendly signals
            </span>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-8">
        <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-10 tracking-tight">
          Strategy Performance
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto text-center">
          <div className="bg-[#121826] border border-[#1F2937] rounded-2xl p-6 shadow-lg shadow-black/20 hover:border-cyan-400/30 transition-colors">
            <p className="text-3xl font-bold text-white">48</p>
            <p className="text-gray-400 text-sm mt-2">Trades Since 2018</p>
          </div>

          <div className="bg-[#121826] border border-[#1F2937] rounded-2xl p-6 shadow-lg shadow-black/20 hover:border-cyan-400/30 transition-colors">
            <p className="text-3xl font-bold text-white">60.4%</p>
            <p className="text-gray-400 text-sm mt-2">Win Rate</p>
          </div>

          <div className="bg-[#121826] border border-[#1F2937] rounded-2xl p-6 shadow-lg shadow-black/20 hover:border-cyan-400/30 transition-colors">
            <p className="text-3xl font-bold text-white">1.67</p>
            <p className="text-gray-400 text-sm mt-2">Profit Factor</p>
          </div>

          <div className="bg-[#121826] border border-[#1F2937] rounded-2xl p-6 shadow-lg shadow-black/20 hover:border-cyan-400/30 transition-colors">
            <p className="text-3xl font-bold text-white">BTC Only</p>
            <p className="text-gray-400 text-sm mt-2">Trend-Following Strategy</p>
          </div>
        </div>

        <p className="text-center text-gray-500 text-sm mt-6">
          Backtested results. Live performance tracking in progress.
        </p>
      </section>

      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-6 tracking-tight">
            Equity Curve
          </h2>

          <p className="text-gray-400 mb-8">
            Historical performance of the strategy over time
          </p>

          <div className="bg-[#121826] border border-[#1F2937] rounded-2xl p-4 shadow-lg shadow-black/20">
            <img
              src="/equity.png"
              alt="Equity Curve"
              className="rounded-xl w-full"
            />
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto bg-[#121826] rounded-2xl p-12 text-center border border-[#1F2937]">
          <div className="bg-cyan-500/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 border border-cyan-500/20">
            <Users className="text-cyan-400" size={32} />
          </div>

          <h2 className="text-3xl font-bold text-white mb-4 tracking-tight">
            Built for Serious BTC Investors
          </h2>

          <p className="text-gray-300 mb-8 text-lg leading-relaxed">
            Tradinsight focuses on simple, data-driven decisions. No gambling, no hype —
            just clear signals and transparent performance.
          </p>

          <button
            onClick={onGetStarted}
            className="bg-[#D4A017] text-black px-8 py-4 rounded-lg font-semibold text-lg hover:bg-[#E6B325] transition-colors inline-flex items-center shadow-lg shadow-black/30"
          >
            Test Profile Now
          </button>
        </div>
      </section>

      <footer className="container mx-auto px-4 py-8 border-t border-[#1F2937]">
        <div className="text-center text-gray-400 text-sm">
          <p>&copy; 2026 Tradinsight. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}