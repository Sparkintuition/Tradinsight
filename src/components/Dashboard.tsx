import { useState, useEffect } from 'react';
import {
  TrendingUp, LogOut, ArrowUpRight, ArrowDownRight, Minus,
  Lock, Clock, BarChart2, Shield, ChevronDown, ChevronUp, Zap,
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
  subscription_plans: { name: string };
}

interface DashboardProps {
  onUnlockPremium?: () => void;
}

// Static signal history from the strategy record
const SIGNAL_HISTORY = [
  { date: '4-Mar-26',   type: 'Long',  price: 65400,  tpiMedium: 'Positive', tpiLong: 'Neutral',   isoDate: '2026-03-04' },
  { date: '26-Jan-25',  type: 'Short', price: 95263,  tpiMedium: 'Negative', tpiLong: 'Negative'  },
  { date: '19-Dec-25',  type: 'Long',  price: 85238,  tpiMedium: 'Positive', tpiLong: 'Negative'  },
  { date: '14-Oct-25',  type: 'Short', price: 123206, tpiMedium: 'Negative', tpiLong: 'Negative'  },
  { date: '30-Sep-25',  type: 'Long',  price: 115527, tpiMedium: 'Positive', tpiLong: 'Neutral'   },
  { date: '30-Jul-25',  type: 'Short', price: 117760, tpiMedium: 'Negative', tpiLong: 'Negative'  },
  { date: '11-Jul-25',  type: 'Long',  price: 108701, tpiMedium: 'Positive', tpiLong: 'Neutral'   },
  { date: '22-May-25',  type: 'Short', price: 107848, tpiMedium: 'Neutral',  tpiLong: 'Neutral'   },
  { date: '22-Apr-25',  type: 'Long',  price: 87157,  tpiMedium: 'Positive', tpiLong: 'Positive'  },
  { date: '11-Dec-24',  type: 'Short', price: 101449, tpiMedium: 'Neutral',  tpiLong: 'Negative'  },
  { date: '25-Sep-24',  type: 'Long',  price: 59214,  tpiMedium: 'Positive', tpiLong: 'Positive'  },
  { date: '30-Jul-24',  type: 'Short', price: 66680,  tpiMedium: 'Negative', tpiLong: 'Positive'  },
  { date: '9-Jul-24',   type: 'Long',  price: 57089,  tpiMedium: 'Neutral',  tpiLong: 'Positive'  },
  { date: '11-Apr-24',  type: 'Short', price: 69879,  tpiMedium: 'Neutral',  tpiLong: 'Neutral'   },
  { date: '13-Feb-24',  type: 'Long',  price: 44923,  tpiMedium: 'Positive', tpiLong: 'Positive'  },
  { date: '5-Jan-24',   type: 'Short', price: 45776,  tpiMedium: 'Positive', tpiLong: 'Neutral'   },
  { date: '16-Sep-23',  type: 'Long',  price: 27005,  tpiMedium: 'Positive', tpiLong: 'Positive'  },
  { date: '14-Apr-23',  type: 'Short', price: 30204,  tpiMedium: 'Negative', tpiLong: 'Positive'  },
  { date: '7-Jan-23',   type: 'Long',  price: 17193,  tpiMedium: 'Neutral',  tpiLong: 'Positive'  },
  { date: '22-Aug-22',  type: 'Short', price: 20819,  tpiMedium: 'Negative', tpiLong: 'Neutral'   },
  { date: '16-Jul-22',  type: 'Long',  price: 22525,  tpiMedium: 'Neutral',  tpiLong: 'Positive'  },
  { date: '5-Apr-22',   type: 'Short', price: 45136,  tpiMedium: 'Negative', tpiLong: 'Negative'  },
  { date: '1-Feb-22',   type: 'Long',  price: 24578,  tpiMedium: 'Positive', tpiLong: 'Positive'  },
  { date: '20-Nov-21',  type: 'Short', price: 59854,  tpiMedium: 'Negative', tpiLong: 'Negative'  },
  { date: '24-Jul-21',  type: 'Long',  price: 34897,  tpiMedium: 'Positive', tpiLong: 'Neutral'   },
  { date: '17-Apr-21',  type: 'Short', price: 59427,  tpiMedium: 'Neutral',  tpiLong: 'Negative'  },
  { date: '5-Oct-20',   type: 'Long',  price: 10580,  tpiMedium: 'Positive', tpiLong: 'Positive'  },
];

function TpiPill({ value }: { value: string }) {
  const v = value.toLowerCase();
  if (v === 'positive') return (
    <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-2.5 py-0.5">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
      Positive
    </span>
  );
  if (v === 'negative') return (
    <span className="inline-flex items-center gap-1 text-xs font-medium text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-full px-2.5 py-0.5">
      <span className="w-1.5 h-1.5 rounded-full bg-rose-400 inline-block" />
      Negative
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-400 bg-gray-500/10 border border-gray-500/20 rounded-full px-2.5 py-0.5">
      <span className="w-1.5 h-1.5 rounded-full bg-gray-400 inline-block" />
      Neutral
    </span>
  );
}

export function Dashboard({ onUnlockPremium }: DashboardProps) {
  const [signals, setSignals] = useState<Signal[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [showFullHistory, setShowFullHistory] = useState(false);
  const { user, signOut } = useAuth();

  const fetchDashboardData = async () => {
    if (!user) return;
    try {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles').select('full_name, email, is_premium').eq('id', user.id).maybeSingle();
      if (profileError) throw profileError;
      setProfile(profileData as UserProfile | null);

      const { data: subscriptionData, error: subscriptionError } = await supabase
        .from('user_subscriptions').select('subscription_plans(name)')
        .eq('user_id', user.id).eq('status', 'active').limit(1);
      if (subscriptionError) throw subscriptionError;
      setSubscription((subscriptionData?.[0] as Subscription) || null);

      const { data: signalsData, error: signalsError } = await supabase
        .from('crypto_signals').select('*').eq('coin', 'BTC').eq('status', 'active')
        .order('created_at', { ascending: false }).limit(1);
      if (signalsError) throw signalsError;
      setSignals(signalsData || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (!user) return; fetchDashboardData(); }, [user]);

  useEffect(() => {
    if (!user || !profile?.is_premium) return;
    const channel = supabase.channel('crypto_signals_changes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'crypto_signals' },
        (payload) => {
          const newSignal = payload.new as Signal;
          if (newSignal.coin === 'BTC') setSignals((prev) => [newSignal, ...prev].slice(0, 20));
        }
      ).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user, profile?.is_premium]);

  const isPremium = !!profile?.is_premium;
  const DELAY_MS = 7 * 24 * 60 * 60 * 1000; // 1 week delay for free users
  const activeSignal = signals[0] || null;
  const visibleSignal = isPremium
    ? activeSignal
    : signals.find(s => s.status === 'active' && new Date().getTime() - new Date(s.created_at).getTime() >= DELAY_MS) || null;
  const isDelayed = !isPremium && !!visibleSignal;

  function formatDate(dateString: string) {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleString('en-US', { month: 'long' });
    const year = date.getFullYear();
    const ord = (n: number) => {
      if (n > 3 && n < 21) return 'th';
      return ['th','st','nd','rd'][n % 10] || 'th';
    };
    return `${day}${ord(day)} ${month} ${year}`;
  }

  const getSignalIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'long':  return <ArrowUpRight className="text-emerald-400" size={22} />;
      case 'short': return <ArrowDownRight className="text-rose-400" size={22} />;
      default:      return <Minus className="text-[#C69214]" size={22} />;
    }
  };

  const displayHistory = showFullHistory ? SIGNAL_HISTORY : SIGNAL_HISTORY.slice(0, 8);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0F19] flex items-center justify-center">
        <div className="text-cyan-400 text-xl font-medium">Loading Tradinsight...</div>
      </div>
    );
  }

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
            <div className="flex items-center gap-5">
              <div className="text-right hidden sm:block">
                <div className="text-white font-semibold text-sm">{profile?.full_name}</div>
                <div className="flex items-center gap-1.5 justify-end mt-0.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${isPremium ? 'bg-[#D4A017]' : 'bg-gray-500'}`} />
                  <span className="text-gray-400 text-xs">{isPremium ? 'Premium' : 'Free'} Plan</span>
                </div>
              </div>
              {!isPremium && (
                <button
                  onClick={() => onUnlockPremium?.()}
                  className="hidden sm:flex items-center gap-1.5 bg-[#D4A017]/10 border border-[#D4A017]/30 text-[#D4A017] text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-[#D4A017]/20 transition-colors"
                >
                  <Zap size={12} />
                  Upgrade
                </button>
              )}
              <button onClick={signOut} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm">
                <LogOut size={18} />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-6">

        {/* Free tier delay banner */}
        {isDelayed && (
          <div className="bg-amber-500/8 border border-amber-500/20 rounded-xl px-5 py-3.5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Clock size={16} className="text-amber-400 shrink-0" />
              <div>
                <p className="text-amber-300 font-medium text-sm">
                  You are viewing signals with a 1-week delay on the Free Plan.
                </p>
                <p className="text-gray-500 text-xs mt-0.5">
                  Upgrade to Premium to receive signals the moment they fire.
                </p>
              </div>
            </div>
            <button
              onClick={() => onUnlockPremium?.()}
              className="shrink-0 text-xs font-semibold text-black bg-[#D4A017] hover:bg-[#E6B325] px-3 py-1.5 rounded-lg transition-colors"
            >
              Upgrade
            </button>
          </div>
        )}

        {/* Page title */}
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">BTC Strategy Signal</h1>
          <p className="text-gray-400 text-sm mt-1">
            Data-driven long/short entries. Trade management stays fully in your hands.
          </p>
          {visibleSignal && (
            <div className={`inline-flex items-center gap-2 mt-3 px-3 py-1.5 rounded-full text-sm font-medium border ${
              visibleSignal.signal_type?.toLowerCase() === 'long'
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
            }`}>
              <span className="relative flex h-2 w-2">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${visibleSignal.signal_type?.toLowerCase() === 'long' ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                <span className={`relative inline-flex rounded-full h-2 w-2 ${visibleSignal.signal_type?.toLowerCase() === 'long' ? 'bg-emerald-400' : 'bg-rose-400'}`} />
              </span>
              {visibleSignal.signal_type?.toUpperCase()} active since {formatDate(visibleSignal.created_at)}
            </div>
          )}
        </div>

        {/* Premium upsell banner for free users */}
        {!isPremium && (
          <div className="bg-[#121826] border border-[#1F2937] rounded-2xl p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-white font-semibold mb-1">Unlock the full Tradinsight experience</h3>
                <div className="flex flex-wrap gap-3 mt-2">
                  {[
                    { icon: <Zap size={13} />, label: 'Real-time signals', color: 'text-[#D4A017]' },
                    { icon: <BarChart2 size={13} />, label: 'Full TPI breakdown', color: 'text-cyan-400' },
                    { icon: <Shield size={13} />, label: 'Signal readiness', color: 'text-emerald-400' },
                  ].map(f => (
                    <span key={f.label} className={`flex items-center gap-1.5 text-xs font-medium ${f.color}`}>
                      {f.icon} {f.label}
                    </span>
                  ))}
                </div>
              </div>
              <button
                onClick={() => onUnlockPremium?.()}
                className="shrink-0 bg-[#D4A017] hover:bg-[#E6B325] text-black font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors"
              >
                Unlock Real-Time Signals
              </button>
            </div>
          </div>
        )}

        {/* Main content grid — signal + TPI panels side by side */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* Signal card — takes 2 cols */}
          <div className="lg:col-span-2">
            <div className="bg-[#121826] rounded-2xl p-5 border border-[#1F2937] h-full">
              {visibleSignal ? (
                <>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="bg-[#0F172A] p-2.5 rounded-xl border border-[#1F2937]">
                      {getSignalIcon(visibleSignal.signal_type)}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">{visibleSignal.coin}</h3>
                      <p className="text-gray-400 text-xs">BTC / USDT</p>
                    </div>
                  </div>

                  <div className="space-y-2.5 mb-4">
                    <div className="bg-[#0F172A]/70 rounded-xl p-3.5 border border-[#1F2937]">
                      <div className="text-gray-500 text-xs mb-1">Triggered At</div>
                      <div className="text-white font-bold">{formatDate(visibleSignal.created_at)}</div>
                    </div>
                    <div className="bg-[#0F172A]/70 rounded-xl p-3.5 border border-[#1F2937]">
                      <div className="text-gray-500 text-xs mb-1">Triggered Price</div>
                      <div className="text-white font-bold">${visibleSignal.signal_price.toLocaleString()}</div>
                    </div>
                    <div className="bg-[#0F172A]/70 rounded-xl p-3.5 border border-[#1F2937]">
                      <div className="text-gray-500 text-xs mb-1 font-medium">Trade Management</div>
                      <p className="text-gray-300 text-xs leading-relaxed">
                        Tradinsight provides entry direction only. Take profit and stop loss are managed by you.
                      </p>
                    </div>
                  </div>

                  {/* Analysis — premium only */}
                  {isPremium ? (
                    <div className="bg-[#0F172A]/70 rounded-xl p-3.5 border border-[#1F2937]">
                      <div className="text-gray-500 text-xs mb-1 font-medium">Signal Analysis</div>
                      <p className="text-gray-300 text-xs leading-relaxed">{visibleSignal.analysis}</p>
                    </div>
                  ) : (
                    <div className="bg-[#0F172A]/70 rounded-xl p-3.5 border border-[#C69214]/15">
                      <div className="flex items-center gap-2 mb-1">
                        <Lock size={11} className="text-[#D4A017]" />
                        <div className="text-[#D4A017] text-xs font-medium">Signal Analysis</div>
                      </div>
                      <p className="text-gray-500 text-xs">Upgrade to see the full TPI breakdown and reasoning behind this signal.</p>
                    </div>
                  )}
                </>
              ) : (
                <div className="py-6 text-center">
                  <div className="w-10 h-10 rounded-full bg-[#0F172A] border border-[#1F2937] flex items-center justify-center mx-auto mb-3">
                    <Clock size={18} className="text-gray-500" />
                  </div>
                  <h3 className="text-white font-semibold text-sm mb-1">No active signal</h3>
                  <p className="text-gray-500 text-xs leading-relaxed">
                    Market conditions not met. The system waits until all layers align before firing.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* TPI Status — right column, 1 col */}
          <div>
            {isPremium ? (
              <div className="bg-[#121826] rounded-2xl p-5 border border-cyan-500/20 h-full flex flex-col">
                <div className="flex items-center gap-2 mb-5">
                  <BarChart2 size={15} className="text-cyan-400" />
                  <h3 className="text-white font-semibold text-sm">Market Conditions</h3>
                  <span className="ml-auto text-xs text-gray-500">Live TPI</span>
                </div>

                <div className="space-y-4 flex-1">
                  <div className="bg-[#0F172A]/70 rounded-xl p-4 border border-[#1F2937]">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-white text-xs font-semibold">TPI — Medium Term</span>
                      <TpiPill value={visibleSignal?.analysis?.includes('Positive') ? 'Positive' : 'Neutral'} />
                    </div>
                    <p className="text-gray-500 text-xs leading-relaxed mb-3">
                      Aggregates trend and momentum signals across multiple timeframes and correlated assets.
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {['Momentum', 'SuperTrend', 'SAR', 'DMI', 'Hull Suite', 'SPX', 'DXY'].map(tag => (
                        <span key={tag} className="text-[10px] text-gray-500 bg-[#0B0F19] border border-[#1F2937] rounded px-2 py-0.5">{tag}</span>
                      ))}
                    </div>
                  </div>

                  <div className="bg-[#0F172A]/70 rounded-xl p-4 border border-[#1F2937]">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-white text-xs font-semibold">Value Indicator — Long Term</span>
                      <TpiPill value="Neutral" />
                    </div>
                    <p className="text-gray-500 text-xs leading-relaxed mb-3">
                      On-chain fundamentals that reveal where BTC sits in its long-term market cycle.
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {['CVDD', 'Reserve Risk', 'Puell', 'MVRV', 'NUPL', 'BEAM', 'RHODL'].map(tag => (
                        <span key={tag} className="text-[10px] text-gray-500 bg-[#0B0F19] border border-[#1F2937] rounded px-2 py-0.5">{tag}</span>
                      ))}
                    </div>
                  </div>
                </div>

                <p className="text-gray-600 text-xs mt-4 text-center">Updated manually · Check back regularly</p>
              </div>
            ) : (
              <div className="bg-[#121826] rounded-2xl p-5 border border-[#1F2937] h-full flex flex-col">
                <div className="flex items-center gap-2 mb-5">
                  <BarChart2 size={15} className="text-gray-600" />
                  <h3 className="text-white font-semibold text-sm">Market Conditions</h3>
                  <span className="ml-auto text-xs text-gray-500">Live TPI</span>
                </div>

                <div className="space-y-4 flex-1">
                  <div className="bg-[#0F172A]/70 rounded-xl p-4 border border-[#1F2937]">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-white text-xs font-semibold">TPI — Medium Term</span>
                      <span className="flex items-center gap-1 text-xs text-gray-600 bg-[#0B0F19] border border-[#1F2937] rounded-full px-2.5 py-0.5">
                        <Lock size={9} /> Locked
                      </span>
                    </div>
                    <p className="text-gray-600 text-xs leading-relaxed mb-3">
                      Trend and momentum signals across timeframes and correlated assets.
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {['Momentum', 'SuperTrend', 'SAR', 'DMI', 'Hull Suite', 'SPX', 'DXY'].map(tag => (
                        <span key={tag} className="text-[10px] text-gray-700 bg-[#0B0F19] border border-[#1F2937] rounded px-2 py-0.5">{tag}</span>
                      ))}
                    </div>
                  </div>

                  <div className="bg-[#0F172A]/70 rounded-xl p-4 border border-[#1F2937]">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-white text-xs font-semibold">Value Indicator — Long Term</span>
                      <span className="flex items-center gap-1 text-xs text-gray-600 bg-[#0B0F19] border border-[#1F2937] rounded-full px-2.5 py-0.5">
                        <Lock size={9} /> Locked
                      </span>
                    </div>
                    <p className="text-gray-600 text-xs leading-relaxed mb-3">
                      On-chain fundamentals revealing BTC long-term market cycle position.
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {['CVDD', 'Reserve Risk', 'Puell', 'MVRV', 'NUPL', 'BEAM', 'RHODL'].map(tag => (
                        <span key={tag} className="text-[10px] text-gray-700 bg-[#0B0F19] border border-[#1F2937] rounded px-2 py-0.5">{tag}</span>
                      ))}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => onUnlockPremium?.()}
                  className="mt-4 w-full text-xs font-semibold text-[#D4A017] border border-[#D4A017]/30 hover:bg-[#D4A017]/10 py-2.5 rounded-lg transition-colors"
                >
                  Unlock TPI Access
                </button>
              </div>
            )}
          </div>
        </div>

        {/* BTC Price Chart — full width, visible to all users */}
        <div className="bg-[#121826] rounded-2xl p-5 border border-[#1F2937]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-white">BTC/USDT — Live Chart</h2>
              <p className="text-gray-500 text-xs">Track current price action alongside your signal</p>
            </div>
            {visibleSignal && (
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-gray-500 text-xs">Signal entry</p>
                  <p className={`text-sm font-bold ${visibleSignal.signal_type?.toLowerCase() === 'long' ? 'text-emerald-400' : 'text-rose-400'}`}>
                    ${visibleSignal.signal_price.toLocaleString()}
                  </p>
                </div>
                <div className={`px-3 py-1.5 rounded-full text-xs font-semibold uppercase ${
                  visibleSignal.signal_type?.toLowerCase() === 'long'
                    ? 'bg-emerald-500/15 text-emerald-400'
                    : 'bg-rose-500/15 text-rose-400'
                }`}>
                  {visibleSignal.signal_type?.toUpperCase()} ACTIVE
                </div>
              </div>
            )}
          </div>

          <div className="h-[460px] rounded-xl border border-[#1F2937] overflow-hidden">
            <iframe
              title="BTC TradingView Chart"
              src="https://s.tradingview.com/widgetembed/?symbol=BINANCE%3ABTCUSDT&interval=240&hidesidetoolbar=1&hidetoptoolbar=0&symboledit=0&saveimage=0&toolbarbg=0f172a&theme=dark&style=1&timezone=Etc%2FUTC&withdateranges=1&hidevolume=1&allow_symbol_change=0"
              className="w-full h-full"
              frameBorder="0"
              allowTransparency={true}
            />
          </div>

          <p className="text-gray-500 text-xs mt-3">
            {visibleSignal
              ? 'Signal remains active until an opposite signal appears — compare current price to entry above'
              : 'No active signal — monitoring market conditions'}
          </p>
        </div>

        {/* Signal History Table */}
        <div className="bg-[#121826] rounded-2xl border border-[#1F2937] overflow-hidden">
          <div className="px-6 py-4 border-b border-[#1F2937] flex items-center justify-between">
            <div>
              <h2 className="text-white font-semibold">Signal History</h2>
              <p className="text-gray-500 text-xs mt-0.5">All strategy signals since 2020 — entries only, exits managed by you</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">{SIGNAL_HISTORY.length} signals</span>
              {!isPremium && (
                <span className="flex items-center gap-1 text-xs text-amber-400 border border-amber-500/20 bg-amber-500/8 px-2.5 py-1 rounded-full">
                  <Clock size={10} />
                  Latest signal delayed 1 week
                </span>
              )}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#1F2937]">
                  <th className="text-left px-6 py-3 text-gray-500 text-xs font-medium uppercase tracking-wider">Date</th>
                  <th className="text-left px-4 py-3 text-gray-500 text-xs font-medium uppercase tracking-wider">Direction</th>
                  <th className="text-right px-4 py-3 text-gray-500 text-xs font-medium uppercase tracking-wider">BTC Price</th>
                  <th className="text-center px-4 py-3 text-gray-500 text-xs font-medium uppercase tracking-wider">TPI Medium</th>
                  <th className="text-center px-6 py-3 text-gray-500 text-xs font-medium uppercase tracking-wider">Value Indicator</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1F2937]/50">
                {displayHistory.map((signal, i) => {
                  // Only blur the latest signal if it fired less than 1 week ago
                  // Use isoDate field for reliable parsing
                  const signalAgeMs = signal.isoDate
                    ? new Date().getTime() - new Date(signal.isoDate).getTime()
                    : DELAY_MS + 1; // If no isoDate, treat as old (no blur)
                  const isLatestBlurred = !isPremium && i === 0 && signalAgeMs < DELAY_MS;
                  return (
                    <tr
                      key={i}
                      className={`transition-colors hover:bg-[#0F172A]/50 ${i === 0 ? 'bg-[#0F172A]/30' : ''}`}
                    >
                      <td className={`px-6 py-3.5 text-gray-300 text-xs font-mono ${isLatestBlurred ? 'blur-sm select-none' : ''}`}>
                        {isLatestBlurred ? 'XX-XXX-XX' : signal.date}
                        {i === 0 && <span className="ml-2 text-[10px] text-cyan-400 font-sans font-medium not-italic">Latest</span>}
                      </td>
                      <td className="px-4 py-3.5">
                        {isLatestBlurred ? (
                          <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-[#1F2937] text-gray-600 border border-[#1F2937]">
                            <Lock size={10} />
                            Locked
                          </span>
                        ) : (
                          <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${
                            signal.type === 'Long'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          }`}>
                            {signal.type === 'Long'
                              ? <ArrowUpRight size={11} />
                              : <ArrowDownRight size={11} />
                            }
                            {signal.type}
                          </span>
                        )}
                      </td>
                      <td className={`px-4 py-3.5 text-right text-gray-200 text-xs font-mono font-medium ${isLatestBlurred ? 'blur-sm select-none' : ''}`}>
                        ${signal.price.toLocaleString()}
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        {isLatestBlurred
                          ? <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-600 bg-[#1F2937] border border-[#1F2937] rounded-full px-2.5 py-0.5"><Lock size={9} /> —</span>
                          : <TpiPill value={signal.tpiMedium} />
                        }
                      </td>
                      <td className="px-6 py-3.5 text-center">
                        {isLatestBlurred
                          ? <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-600 bg-[#1F2937] border border-[#1F2937] rounded-full px-2.5 py-0.5"><Lock size={9} /> —</span>
                          : <TpiPill value={signal.tpiLong} />
                        }
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Show more / less */}
          <div className="px-6 py-3 border-t border-[#1F2937] flex items-center justify-between">
            <p className="text-gray-600 text-xs">
            </p>
            <button
              onClick={() => setShowFullHistory(!showFullHistory)}
              className="flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 transition-colors font-medium"
            >
              {showFullHistory ? (
                <><ChevronUp size={14} /> Show less</>
              ) : (
                <><ChevronDown size={14} /> Show all {SIGNAL_HISTORY.length} signals</>
              )}
            </button>
          </div>

          {/* Free user upgrade hook below table */}
          {!isPremium && (
            <div className="mx-6 mb-5 rounded-xl border border-[#C69214]/20 bg-[#C69214]/5 px-5 py-4 flex items-center justify-between gap-4">
              <p className="text-gray-300 text-xs leading-relaxed">
                <span className="text-[#D4A017] font-semibold">The latest signal is delayed 1 week on the free plan.</span>
                {' '}Premium members see it the moment it fires — plus full TPI breakdown and analysis.
              </p>
              <button
                onClick={() => onUnlockPremium?.()}
                className="shrink-0 bg-[#D4A017] hover:bg-[#E6B325] text-black text-xs font-semibold px-4 py-2 rounded-lg transition-colors"
              >
                Upgrade
              </button>
            </div>
          )}
        </div>

      </main>
    </div>
  );
}