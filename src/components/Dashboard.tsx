import { useState, useEffect } from 'react';
import {
  TrendingUp,
  LogOut,
  Minus,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface Signal {
  id: string;
  coin: string;
  signal_type: string;
  signal_price: number;
  confidence: number;
  analysis: string;
  status: string;
  created_at: string;
}

interface UserProfile {
  full_name: string;
  email: string;
  is_premium: boolean;
}

interface Subscription {
  subscription_plans: {
    name: string;
  };
}

interface DashboardProps {
  onUnlockPremium?: () => void;
}

export function Dashboard({ onUnlockPremium }: DashboardProps) {
  const [signals, setSignals] = useState<Signal[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const { user, signOut } = useAuth();

  const fetchDashboardData = async () => {
    if (!user) return;

    try {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('full_name, email, is_premium')
        .eq('id', user.id)
        .maybeSingle();

      if (profileError) throw profileError;
      setProfile(profileData as UserProfile | null);

      const { data: subscriptionData, error: subscriptionError } = await supabase
        .from('user_subscriptions')
        .select('subscription_plans(name)')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .limit(1);

      if (subscriptionError) throw subscriptionError;
      setSubscription((subscriptionData?.[0] as Subscription) || null);

      const { data: signalsData, error: signalsError } = await supabase
        .from('crypto_signals')
        .select('*')
        .eq('coin', 'BTC')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1);

      if (signalsError) throw signalsError;
      setSignals(signalsData || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    fetchDashboardData();
  }, [user]);

  useEffect(() => {
    if (!user || !profile?.is_premium) return;

    const channel = supabase
      .channel('crypto_signals_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'crypto_signals',
        },
        (payload) => {
          const newSignal = payload.new as Signal;
          if (newSignal.coin === 'BTC') {
            setSignals((prev) => [newSignal, ...prev].slice(0, 20));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, profile?.is_premium]);

  const getSignalIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'long':
        return <ArrowUpRight className="text-emerald-400" size={24} />;
      case 'short':
        return <ArrowDownRight className="text-rose-400" size={24} />;
      default:
        return <Minus className="text-[#C69214]" size={24} />;
    }
  };

  const isPremium = !!profile?.is_premium;
  const DELAY_MS = 48 * 60 * 60 * 1000;

  const activeSignal = signals[0] || null;

  const visibleSignal = isPremium
    ? activeSignal
    : signals.find(
        (signal) =>
          signal.status === 'active' &&
          new Date().getTime() - new Date(signal.created_at).getTime() >= DELAY_MS
      ) || null;

  const isDelayedFreeView = !isPremium && !!visibleSignal;

  function formatDate(dateString: string) {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleString('en-US', { month: 'long' });
    const year = date.getFullYear();

    const getOrdinal = (n: number) => {
      if (n > 3 && n < 21) return 'th';
      switch (n % 10) {
        case 1:
          return 'st';
        case 2:
          return 'nd';
        case 3:
          return 'rd';
        default:
          return 'th';
      }
    };

    return `${day}${getOrdinal(day)} ${month} ${year}`;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0F19] flex items-center justify-center">
        <div className="text-cyan-400 text-xl font-medium">Loading Tradinsight...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0F19]">
      <header className="border-b border-[#1F2937] bg-[#0F172A]/80 backdrop-blur">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <TrendingUp className="text-cyan-400" size={32} />
              <span className="text-2xl font-bold text-white tracking-tight">
                Tradinsight
              </span>
            </div>

            <div className="flex items-center gap-6">
              <div className="text-right hidden sm:block">
                <div className="text-white font-semibold">{profile?.full_name}</div>
                <div className="text-gray-400 text-sm">
                  {profile?.is_premium ? 'Premium' : 'Free'} Plan
                </div>
              </div>

              <button
                onClick={signOut}
                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
              >
                <LogOut size={20} />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-10 lg:py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white tracking-tight mb-2">
            BTC Strategy Signal
          </h1>

          <p className="text-cyan-400 text-sm mt-2">
            Live market data — waiting for the next signal
          </p>

          <p className="text-gray-400 mt-2">
            Data-driven BTC long/short signals. Trade management stays fully in your hands.
          </p>

          {visibleSignal && (
            <div className="mt-4 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold border border-[#1F2937] bg-[#121826]">
              <span className="relative flex h-2.5 w-2.5">
                <span
                  className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                    visibleSignal.signal_type?.toLowerCase() === 'long'
                      ? 'bg-emerald-400'
                      : 'bg-rose-400'
                  }`}
                />
                <span
                  className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                    visibleSignal.signal_type?.toLowerCase() === 'long'
                      ? 'bg-emerald-400'
                      : 'bg-rose-400'
                  }`}
                />
              </span>

              <span className="text-white">
                {visibleSignal.signal_type?.toLowerCase() === 'long'
                  ? 'LONG active'
                  : 'SHORT active'}
              </span>

              <span className="text-gray-400">
                since {formatDate(visibleSignal.created_at)}
              </span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {isDelayedFreeView && (
            <div className="lg:col-span-3 mb-2 bg-[#C69214]/10 border border-[#C69214]/20 rounded-xl p-4">
              <p className="text-[#D4A017] font-medium">
                You are viewing BTC signals with a 48-hour delay on the Free Plan.
              </p>
              <p className="text-gray-400 text-sm mt-1">
                Upgrade to Premium to receive signals in real time.
              </p>
            </div>
          )}

          {!isPremium && (
            <div className="lg:col-span-3 bg-[#121826] border border-[#1F2937] rounded-2xl p-6">
              <h3 className="text-white text-lg font-semibold mb-4">
                Unlock the full Tradinsight experience
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
                <div className="bg-[#0F172A]/70 rounded-xl p-4 text-center border border-[#1F2937]">
                  <div className="text-emerald-400 font-semibold mb-1">
                    Real-Time Signals
                  </div>
                  <p className="text-gray-400 text-sm">
                    Get BTC signals instantly without delay
                  </p>
                </div>

                <div className="bg-[#0F172A]/70 rounded-xl p-4 text-center border border-[#1F2937]">
                  <div className="text-cyan-400 font-semibold mb-1">Full Analysis</div>
                  <p className="text-gray-400 text-sm">
                    Understand the reasoning behind each signal
                  </p>
                </div>

                <div className="bg-[#0F172A]/70 rounded-xl p-4 text-center border border-[#1F2937]">
                  <div className="text-violet-400 font-semibold mb-1">Market Edge</div>
                  <p className="text-gray-400 text-sm">
                    Stay ahead with data-driven strategy signals
                  </p>
                </div>
              </div>

              <div className="text-center">
                <button
                  onClick={() => onUnlockPremium?.()}
                  className="bg-[#B88A12] hover:bg-[#C69214] text-black font-semibold px-6 py-3 rounded-xl transition-colors"
                >
                  Unlock Real-Time Signals
                </button>
              </div>
            </div>
          )}

          <div className="lg:col-span-2 bg-[#121826] rounded-2xl p-6 border border-[#1F2937] shadow-lg shadow-black/20">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-white">BTC/USDT</h2>
                <p className="text-gray-400 text-sm">Main market view</p>
              </div>

              {visibleSignal ? (
                <div
                  className={`px-4 py-2 rounded-full text-sm font-semibold uppercase ${
                    visibleSignal.signal_type?.toLowerCase() === 'long'
                      ? 'bg-emerald-500/15 text-emerald-400'
                      : visibleSignal.signal_type?.toLowerCase() === 'short'
                      ? 'bg-rose-500/15 text-rose-400'
                      : 'bg-[#C69214]/15 text-[#D4A017]'
                  }`}
                >
                  {`${visibleSignal.signal_type?.toLowerCase() === 'long' ? 'LONG' : 'SHORT'} active`}
                </div>
              ) : (
                <div className="px-4 py-2 rounded-full text-sm font-semibold bg-[#0F172A] text-gray-300 border border-[#1F2937]">
                  No active signal
                </div>
              )}
            </div>

            <div className="relative h-[520px] rounded-2xl border border-[#1F2937] bg-[#0F172A]/60 overflow-hidden shadow-xl shadow-black/20">
              <iframe
                title="BTC TradingView Chart"
                src="https://s.tradingview.com/widgetembed/?symbol=BINANCE%3ABTCUSDT&interval=240&hidesidetoolbar=1&hidetoptoolbar=0&symboledit=0&saveimage=0&toolbarbg=0f172a&theme=dark&style=1&timezone=Etc%2FUTC&withdateranges=1&hidevolume=1&allow_symbol_change=0"
                className="w-full h-full"
                frameBorder="0"
                allowTransparency={true}
              />

              {!isPremium && (
                <div className="absolute inset-0 backdrop-blur-[3px] bg-[#0B0F19]/20 flex items-center justify-center">
                  <div className="bg-[#0F172A]/85 border border-[#1F2937] rounded-xl px-5 py-4 text-center max-w-sm">
                    <p className="text-white font-semibold mb-1">
                      Unlock full chart clarity
                    </p>
                    <p className="text-gray-400 text-sm mb-3">
                      Upgrade to Premium for real-time signals and full access.
                    </p>
                    <button
                      onClick={() => onUnlockPremium?.()}
                      className="bg-[#B88A12] hover:bg-[#C69214] text-black font-semibold px-4 py-2 rounded-lg transition-colors"
                    >
                      Upgrade to Premium
                    </button>
                  </div>
                </div>
              )}
            </div>

            <p className="text-[#C69214] text-sm mt-3">
              {visibleSignal
                ? 'Signal remains active until an opposite signal appears'
                : 'No active BTC strategy signal at the moment'}
            </p>
          </div>

          <div className="bg-[#121826] rounded-2xl p-6 border border-[#1F2937] shadow-lg shadow-black/20">
            {visibleSignal ? (
              <>
                <div className="flex items-center gap-3 mb-5">
                  <div className="bg-[#0F172A] p-3 rounded-xl border border-[#1F2937]">
                    {getSignalIcon(visibleSignal.signal_type)}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">{visibleSignal.coin}</h3>
                    <p className="text-gray-400 text-sm">
                      Confidence: {visibleSignal.confidence}%
                    </p>
                  </div>
                </div>

                <div className="space-y-3 mb-5">
                  <div className="bg-[#0F172A]/70 rounded-xl p-4 border border-[#1F2937]">
                    <div className="text-gray-400 text-sm mb-1">Triggered At</div>
                    <div className="text-white font-bold text-lg">
                      {formatDate(visibleSignal.created_at)}
                    </div>
                  </div>

                  <div className="bg-[#0F172A]/70 rounded-xl p-4 border border-[#1F2937]">
                    <div className="text-gray-400 text-sm mb-1">Triggered Price</div>
                    <div className="text-white font-bold text-lg">
                      ${visibleSignal.signal_price.toLocaleString()}
                    </div>
                  </div>

                  <div className="bg-[#0F172A]/70 rounded-xl p-4 border border-[#1F2937]">
                    <div className="text-gray-400 text-sm mb-2 font-semibold">
                      Trade Management
                    </div>
                    <p className="text-gray-300 leading-relaxed text-sm">
                      Tradinsight provides long/short direction only. Take profit and stop
                      loss are managed by the user.
                    </p>
                  </div>
                </div>

                {isPremium ? (
                  <div className="bg-[#0F172A]/70 rounded-xl p-4 border border-[#1F2937]">
                    <div className="text-gray-400 text-sm mb-2 font-semibold">Analysis</div>
                    <p className="text-gray-300 leading-relaxed">
                      {visibleSignal.analysis}
                    </p>
                  </div>
                ) : (
                  <div className="bg-[#0F172A]/70 rounded-xl p-4 border border-[#C69214]/20">
                    <div className="text-gray-400 text-sm mb-2 font-semibold">Analysis</div>
                    <p className="text-gray-400 leading-relaxed text-sm">
                      Upgrade to Premium to unlock signal analysis and market context.
                    </p>
                  </div>
                )}
              </>
            ) : (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <h3 className="text-xl font-semibold text-white mb-2">
                    No active setup — market conditions not met
                  </h3>
                  <p className="text-gray-400">
                    Waiting for the next BTC strategy setup.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}