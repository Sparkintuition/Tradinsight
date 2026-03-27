import { useState, useEffect } from 'react';
import {
  TrendingUp, LogOut, ArrowUpRight, ArrowDownRight, Minus,
  Lock, Clock, BarChart2, Shield, ChevronDown, ChevronUp, Zap, BookOpen, User,
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
  tpi_value_indicator?: string;   // Positive | Neutral | Negative — set by TPI app
  tpi_medium_term?: string;       // Positive | Neutral | Negative — set by TPI app
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
  onMethodology?: () => void;
  onAccount?: () => void;
}

// Raw signals oldest→newest for earnings simulation
// Updated: APCRAF Strategy final params — PF 4.54, WR 62.79%, 43 trades
const RAW_SIGNALS = [
  { date: '26-Oct-19',  type: 'Long',  price: 9230,   tpiMedium: 'Positive', tpiLong: 'Neutral',   isoDate: '2019-10-26' },
  { date: '26-Feb-20',  type: 'Short', price: 8785,   tpiMedium: 'Negative', tpiLong: 'Negative',  isoDate: '2020-02-26' },
  { date: '8-Apr-20',   type: 'Long',  price: 7361,   tpiMedium: 'Positive', tpiLong: 'Positive',  isoDate: '2020-04-08' },
  { date: '25-Jun-20',  type: 'Short', price: 9249,   tpiMedium: 'Negative', tpiLong: 'Neutral',   isoDate: '2020-06-25' },
  { date: '22-Jul-20',  type: 'Long',  price: 9518,   tpiMedium: 'Positive', tpiLong: 'Positive',  isoDate: '2020-07-22' },
  { date: '3-Sep-20',   type: 'Short', price: 10141,  tpiMedium: 'Negative', tpiLong: 'Neutral',   isoDate: '2020-09-03' },
  { date: '9-Oct-20',   type: 'Long',  price: 11051,  tpiMedium: 'Positive', tpiLong: 'Positive',  isoDate: '2020-10-09' },
  { date: '30-Nov-20',  type: 'Long',  price: 19696,  tpiMedium: 'Positive', tpiLong: 'Positive',  isoDate: '2020-11-30' },
  { date: '22-Apr-21',  type: 'Short', price: 51691,  tpiMedium: 'Neutral',  tpiLong: 'Negative',  isoDate: '2021-04-22' },
  { date: '25-Jul-21',  type: 'Long',  price: 35381,  tpiMedium: 'Positive', tpiLong: 'Neutral',   isoDate: '2021-07-25' },
  { date: '10-Sep-21',  type: 'Short', price: 44851,  tpiMedium: 'Negative', tpiLong: 'Neutral',   isoDate: '2021-09-10' },
  { date: '5-Oct-21',   type: 'Long',  price: 51472,  tpiMedium: 'Positive', tpiLong: 'Positive',  isoDate: '2021-10-05' },
  { date: '17-Nov-21',  type: 'Short', price: 60345,  tpiMedium: 'Negative', tpiLong: 'Negative',  isoDate: '2021-11-17' },
  { date: '8-Feb-22',   type: 'Long',  price: 44043,  tpiMedium: 'Positive', tpiLong: 'Neutral',   isoDate: '2022-02-08' },
  { date: '22-Apr-22',  type: 'Short', price: 39709,  tpiMedium: 'Negative', tpiLong: 'Negative',  isoDate: '2022-04-22' },
  { date: '18-Jul-22',  type: 'Long',  price: 22433,  tpiMedium: 'Neutral',  tpiLong: 'Positive',  isoDate: '2022-07-18' },
  { date: '19-Aug-22',  type: 'Short', price: 20834,  tpiMedium: 'Negative', tpiLong: 'Neutral',   isoDate: '2022-08-19' },
  { date: '25-Oct-22',  type: 'Long',  price: 20080,  tpiMedium: 'Neutral',  tpiLong: 'Positive',  isoDate: '2022-10-25' },
  { date: '8-Nov-22',   type: 'Short', price: 18547,  tpiMedium: 'Negative', tpiLong: 'Negative',  isoDate: '2022-11-08' },
  { date: '10-Jan-23',  type: 'Long',  price: 17441,  tpiMedium: 'Positive', tpiLong: 'Positive',  isoDate: '2023-01-10' },
  { date: '8-May-23',   type: 'Short', price: 27669,  tpiMedium: 'Negative', tpiLong: 'Neutral',   isoDate: '2023-05-08' },
  { date: '20-Jun-23',  type: 'Long',  price: 28308,  tpiMedium: 'Positive', tpiLong: 'Positive',  isoDate: '2023-06-20' },
  { date: '3-Aug-23',   type: 'Short', price: 29194,  tpiMedium: 'Negative', tpiLong: 'Neutral',   isoDate: '2023-08-03' },
  { date: '16-Sep-23',  type: 'Long',  price: 26560,  tpiMedium: 'Positive', tpiLong: 'Positive',  isoDate: '2023-09-16' },
  { date: '9-Nov-23',   type: 'Long',  price: 36701,  tpiMedium: 'Positive', tpiLong: 'Positive',  isoDate: '2023-11-09' },
  { date: '8-Feb-24',   type: 'Long',  price: 45289,  tpiMedium: 'Positive', tpiLong: 'Positive',  isoDate: '2024-02-08' },
  { date: '13-Apr-24',  type: 'Short', price: 63925,  tpiMedium: 'Neutral',  tpiLong: 'Neutral',   isoDate: '2024-04-13' },
  { date: '16-May-24',  type: 'Long',  price: 65235,  tpiMedium: 'Positive', tpiLong: 'Positive',  isoDate: '2024-05-16' },
  { date: '14-Jun-24',  type: 'Short', price: 66044,  tpiMedium: 'Negative', tpiLong: 'Neutral',   isoDate: '2024-06-14' },
  { date: '19-Sep-24',  type: 'Long',  price: 62948,  tpiMedium: 'Positive', tpiLong: 'Positive',  isoDate: '2024-09-19' },
  { date: '7-Dec-24',   type: 'Long',  price: 99832,  tpiMedium: 'Positive', tpiLong: 'Positive',  isoDate: '2024-12-07' },
  { date: '23-Dec-24',  type: 'Short', price: 94881,  tpiMedium: 'Negative', tpiLong: 'Negative',  isoDate: '2024-12-23' },
  { date: '18-Feb-25',  type: 'Short', price: 95672,  tpiMedium: 'Negative', tpiLong: 'Negative',  isoDate: '2025-02-18' },
  { date: '8-May-25',   type: 'Long',  price: 103262, tpiMedium: 'Positive', tpiLong: 'Positive',  isoDate: '2025-05-08' },
  { date: '9-Jun-25',   type: 'Long',  price: 110263, tpiMedium: 'Positive', tpiLong: 'Neutral',   isoDate: '2025-06-09' },
  { date: '19-Aug-25',  type: 'Short', price: 112873, tpiMedium: 'Negative', tpiLong: 'Neutral',   isoDate: '2025-08-19' },
  { date: '11-Oct-25',  type: 'Short', price: 110644, tpiMedium: 'Negative', tpiLong: 'Negative',  isoDate: '2025-10-11' },
  { date: '4-Nov-25',   type: 'Short', price: 101497, tpiMedium: 'Negative', tpiLong: 'Negative',  isoDate: '2025-11-04' },
  { date: '18-Dec-25',  type: 'Short', price: 85516,  tpiMedium: 'Negative', tpiLong: 'Negative',  isoDate: '2025-12-18' },
  { date: '4-Jan-26',   type: 'Long',  price: 91530,  tpiMedium: 'Positive', tpiLong: 'Neutral',   isoDate: '2026-01-04' },
  { date: '29-Jan-26',  type: 'Short', price: 84650,  tpiMedium: 'Negative', tpiLong: 'Negative',  isoDate: '2026-01-29' },
  { date: '4-Mar-26',   type: 'Long',  price: 65400,  tpiMedium: 'Positive', tpiLong: 'Neutral',   isoDate: '2026-03-04' },
];

// TPI-filtered signals (Strategy + TPI layer) — original curated list
// These are the signals that passed BOTH the strategy AND the TPI filter
const TPI_SIGNALS = [
  { date: '5-Oct-20',   type: 'Long',  price: 10580,  tpiMedium: 'Positive', tpiLong: 'Positive',  isoDate: '2020-10-05' },
  { date: '17-Apr-21',  type: 'Short', price: 59427,  tpiMedium: 'Neutral',  tpiLong: 'Negative',  isoDate: '2021-04-17' },
  { date: '24-Jul-21',  type: 'Long',  price: 34897,  tpiMedium: 'Positive', tpiLong: 'Neutral',   isoDate: '2021-07-24' },
  { date: '20-Nov-21',  type: 'Short', price: 59854,  tpiMedium: 'Negative', tpiLong: 'Negative',  isoDate: '2021-11-20' },
  { date: '1-Feb-22',   type: 'Long',  price: 24578,  tpiMedium: 'Positive', tpiLong: 'Positive',  isoDate: '2022-02-01' },
  { date: '5-Apr-22',   type: 'Short', price: 45136,  tpiMedium: 'Negative', tpiLong: 'Negative',  isoDate: '2022-04-05' },
  { date: '16-Jul-22',  type: 'Long',  price: 22525,  tpiMedium: 'Neutral',  tpiLong: 'Positive',  isoDate: '2022-07-16' },
  { date: '22-Aug-22',  type: 'Short', price: 20819,  tpiMedium: 'Negative', tpiLong: 'Neutral',   isoDate: '2022-08-22' },
  { date: '7-Jan-23',   type: 'Long',  price: 17193,  tpiMedium: 'Neutral',  tpiLong: 'Positive',  isoDate: '2023-01-07' },
  { date: '14-Apr-23',  type: 'Short', price: 30204,  tpiMedium: 'Negative', tpiLong: 'Positive',  isoDate: '2023-04-14' },
  { date: '16-Sep-23',  type: 'Long',  price: 27005,  tpiMedium: 'Positive', tpiLong: 'Positive',  isoDate: '2023-09-16' },
  { date: '5-Jan-24',   type: 'Short', price: 45776,  tpiMedium: 'Positive', tpiLong: 'Neutral',   isoDate: '2024-01-05' },
  { date: '13-Feb-24',  type: 'Long',  price: 44923,  tpiMedium: 'Positive', tpiLong: 'Positive',  isoDate: '2024-02-13' },
  { date: '11-Apr-24',  type: 'Short', price: 69879,  tpiMedium: 'Neutral',  tpiLong: 'Neutral',   isoDate: '2024-04-11' },
  { date: '9-Jul-24',   type: 'Long',  price: 57089,  tpiMedium: 'Neutral',  tpiLong: 'Positive',  isoDate: '2024-07-09' },
  { date: '30-Jul-24',  type: 'Short', price: 66680,  tpiMedium: 'Negative', tpiLong: 'Positive',  isoDate: '2024-07-30' },
  { date: '25-Sep-24',  type: 'Long',  price: 59214,  tpiMedium: 'Positive', tpiLong: 'Positive',  isoDate: '2024-09-25' },
  { date: '11-Dec-24',  type: 'Short', price: 101449, tpiMedium: 'Neutral',  tpiLong: 'Negative',  isoDate: '2024-12-11' },
  { date: '22-Apr-25',  type: 'Long',  price: 87157,  tpiMedium: 'Positive', tpiLong: 'Positive',  isoDate: '2025-04-22' },
  { date: '22-May-25',  type: 'Short', price: 107848, tpiMedium: 'Neutral',  tpiLong: 'Neutral',   isoDate: '2025-05-22' },
  { date: '11-Jul-25',  type: 'Long',  price: 108701, tpiMedium: 'Positive', tpiLong: 'Neutral',   isoDate: '2025-07-11' },
  { date: '30-Jul-25',  type: 'Short', price: 117760, tpiMedium: 'Negative', tpiLong: 'Negative',  isoDate: '2025-07-30' },
  { date: '30-Sep-25',  type: 'Long',  price: 115527, tpiMedium: 'Positive', tpiLong: 'Neutral',   isoDate: '2025-09-30' },
  { date: '14-Oct-25',  type: 'Short', price: 123206, tpiMedium: 'Negative', tpiLong: 'Negative',  isoDate: '2025-10-14' },
  { date: '19-Dec-25',  type: 'Long',  price: 85238,  tpiMedium: 'Positive', tpiLong: 'Negative',  isoDate: '2025-12-19' },
  { date: '26-Jan-26',  type: 'Short', price: 95263,  tpiMedium: 'Negative', tpiLong: 'Negative',  isoDate: '2026-01-26' },
  { date: '4-Mar-26',   type: 'Long',  price: 65400,  tpiMedium: 'Positive', tpiLong: 'Neutral',   isoDate: '2026-03-04' },
];

// Compute cumulative $1,000 simulation, oldest→newest
// Each signal shows its OWN trade result (entry at this signal, exit at next signal)
// Last signal (current open) shows live P&L via btcPrice
function computeEarnings(signals: typeof RAW_SIGNALS) {
  let balance = 1000;
  return signals.map((s, i) => {
    const next = signals[i + 1];
    if (!next) {
      // Last signal = currently open, no closed P&L yet
      return { ...s, pnlPct: null, balance: Math.round(balance) };
    }
    const pnlPct = s.type === 'Long'
      ? (next.price - s.price) / s.price
      : (s.price - next.price) / s.price;
    const newBalance = balance * (1 + pnlPct);
    const result = { ...s, pnlPct: pnlPct * 100, balance: Math.round(newBalance) };
    balance = newBalance;
    return result;
  });
}

// Display newest→oldest (reverse)
const SIGNAL_HISTORY = computeEarnings(RAW_SIGNALS).reverse();
const TPI_HISTORY = computeEarnings(TPI_SIGNALS).reverse();

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

export function Dashboard({ onUnlockPremium, onMethodology, onAccount }: DashboardProps) {
  const [signals, setSignals] = useState<Signal[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [showFullHistory, setShowFullHistory] = useState(false);
  const [historyTab, setHistoryTab] = useState<'strategy' | 'tpi'>('strategy');
  const [btcPrice, setBtcPrice] = useState<number | null>(null);
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

  // Fetch live BTC price for open position P&L
  useEffect(() => {
    const fetchBtcPrice = async () => {
      try {
        const res = await fetch('https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT');
        const data = await res.json();
        setBtcPrice(parseFloat(data.price));
      } catch {
        setBtcPrice(null);
      }
    };
    fetchBtcPrice();
    const interval = setInterval(fetchBtcPrice, 30000); // refresh every 30s
    return () => clearInterval(interval);
  }, []);

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

  // Merge latest Supabase signal into history if it's newer than hardcoded array
  const DELAY_MS_CONST = 7 * 24 * 60 * 60 * 1000;
  const buildHistory = (baseHistory: typeof SIGNAL_HISTORY) => {
    if (!activeSignal) return baseHistory;
    const latestHardcoded = baseHistory[0]; // newest in reversed array
    const signalIsoDate = activeSignal.created_at.split('T')[0];
    const signalDate = new Date(activeSignal.created_at).getTime();
    const isVisible = isPremium ||
      new Date().getTime() - signalDate >= DELAY_MS_CONST;
    if (!isVisible) return baseHistory; // hide entirely for free users if < 1 week

    const liveEntry = {
      date: new Date(activeSignal.created_at).toLocaleDateString('en-GB', {
        day: 'numeric', month: 'short', year: '2-digit'
      }).replace(/ /g, '-'),
      type: activeSignal.signal_type?.toLowerCase() === 'long' ? 'Long' : 'Short',
      price: activeSignal.signal_price,
      tpiMedium: 'Positive',
      tpiLong: 'Neutral',
      isoDate: signalIsoDate,
      pnlPct: null as null,
      balance: 1000,
    };

    // If live signal date matches latest hardcoded entry — replace it
    // avoids duplicate rows when webhook fires on same day as hardcoded entry
    if (latestHardcoded?.isoDate === signalIsoDate) {
      return [liveEntry, ...baseHistory.slice(1)];
    }

    // Only prepend if genuinely newer than hardcoded latest
    const latestHardcodedDate = latestHardcoded?.isoDate
      ? new Date(latestHardcoded.isoDate).getTime() : 0;
    if (signalDate <= latestHardcodedDate) return baseHistory;

    return [liveEntry, ...baseHistory];
  };

  const rawHistory  = buildHistory(SIGNAL_HISTORY);
  const tpiHistory  = buildHistory(TPI_HISTORY);
  const activeHistory = historyTab === 'strategy' ? rawHistory : tpiHistory;
  const displayHistory = showFullHistory ? activeHistory : activeHistory.slice(0, 8);

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
              <button
                onClick={() => onMethodology?.()}
                className="hidden sm:flex items-center gap-1.5 text-gray-400 hover:text-white text-xs transition-colors border border-[#1F2937] hover:border-[#334155] px-3 py-1.5 rounded-lg"
              >
                <BookOpen size={12} />
                How it Works
              </button>
              {!isPremium && (
                <button
                  onClick={() => onUnlockPremium?.()}
                  className="hidden sm:flex items-center gap-1.5 bg-[#D4A017]/10 border border-[#D4A017]/30 text-[#D4A017] text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-[#D4A017]/20 transition-colors"
                >
                  <Zap size={12} />
                  Upgrade
                </button>
              )}
              <button
                onClick={() => onAccount?.()}
                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm"
              >
                <User size={16} />
                <span className="hidden sm:inline">Account</span>
              </button>
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
          <div className="bg-amber-500/8 border border-amber-500/20 rounded-xl px-5 py-3.5 flex items-center gap-3">
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
                      <TpiPill value={activeSignal?.tpi_medium_term || 'Neutral'} />
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
                      <TpiPill value={activeSignal?.tpi_value_indicator || 'Neutral'} />
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

                <p className="text-gray-600 text-xs mt-4 text-center">
                  {activeSignal?.tpi_value_indicator
                    ? 'Updated from TPI app'
                    : 'Updated manually · Check back regularly'}
                </p>
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

                <p className="mt-4 text-gray-600 text-xs text-center">
                  Available on Premium
                </p>
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
          <div className="px-4 sm:px-6 pt-4 pb-0 border-b border-[#1F2937]">
            <div className="flex items-start sm:items-center justify-between gap-3 mb-3">
              <div>
                <h2 className="text-white font-semibold">Signal History</h2>
                <p className="text-gray-500 text-xs mt-0.5">Entries only · exits managed by you · $1,000 simulation (100% allocation)</p>
              </div>
              <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 shrink-0">
                <span className="text-xs text-gray-500">{activeHistory.length} signals</span>
                {!isPremium && (
                  <span className="flex items-center gap-1 text-xs text-amber-400 border border-amber-500/20 bg-amber-500/8 px-2.5 py-1 rounded-full whitespace-nowrap">
                    <Clock size={10} /> Latest delayed 1w
                  </span>
                )}
              </div>
            </div>
            {/* Tabs */}
            <div className="flex gap-1">
              <button
                onClick={() => { setHistoryTab('strategy'); setShowFullHistory(false); }}
                className={`px-4 py-2 text-xs font-medium rounded-t-lg border-b-2 transition-colors ${
                  historyTab === 'strategy'
                    ? 'border-cyan-400 text-cyan-400 bg-cyan-500/5'
                    : 'border-transparent text-gray-500 hover:text-gray-300'
                }`}
              >
                Strategy Only
                <span className="ml-1.5 text-[10px] opacity-60">{SIGNAL_HISTORY.length} signals</span>
              </button>
              <button
                onClick={() => { setHistoryTab('tpi'); setShowFullHistory(false); }}
                className={`px-4 py-2 text-xs font-medium rounded-t-lg border-b-2 transition-colors ${
                  historyTab === 'tpi'
                    ? 'border-[#D4A017] text-[#D4A017] bg-[#D4A017]/5'
                    : 'border-transparent text-gray-500 hover:text-gray-300'
                }`}
              >
                Strategy + TPI
                <span className="ml-1.5 text-[10px] opacity-60">{TPI_HISTORY.length} signals</span>
              </button>
            </div>
          </div>
          {/* Tab description */}
          <div className={`px-4 sm:px-6 py-2.5 border-b border-[#1F2937] text-xs ${
            historyTab === 'strategy' ? 'bg-[#0F172A]/30' : 'bg-[#D4A017]/5'
          }`}>
            {historyTab === 'strategy' ? (
              <p className="text-gray-500">
                Raw strategy signals — <span className="text-gray-400">no TPI filter applied.</span> Some of these would be skipped by the live system. This is the baseline.
              </p>
            ) : (
              <p className="text-gray-500">
                TPI-confirmed signals only — <span className="text-[#D4A017]">the live Tradinsight system.</span> Fewer trades, higher conviction. TPI and Value columns show market conditions at signal time.
              </p>
            )}
          </div>

          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#1F2937]">
                  <th className="text-left px-6 py-3 text-gray-500 text-xs font-medium uppercase tracking-wider">Date</th>
                  <th className="text-left px-4 py-3 text-gray-500 text-xs font-medium uppercase tracking-wider">Direction</th>
                  <th className="text-right px-4 py-3 text-gray-500 text-xs font-medium uppercase tracking-wider">BTC Price</th>
                  {historyTab === 'tpi' && <th className="text-center px-4 py-3 text-gray-500 text-xs font-medium uppercase tracking-wider">TPI</th>}
                  {historyTab === 'tpi' && <th className="text-center px-4 py-3 text-gray-500 text-xs font-medium uppercase tracking-wider">Value</th>}
                  <th className="text-right px-6 py-3 text-gray-500 text-xs font-medium uppercase tracking-wider">Trade Result</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1F2937]/50">
                {displayHistory.map((signal: any, i: number) => {
                  // No blur — new signals are hidden entirely for free users
                  // (handled in buildHistory — they never appear in displayHistory)
                  const isLatestBlurred = false;
                  return (
                    <tr key={i} className={`transition-colors hover:bg-[#0F172A]/50 ${i === 0 ? 'bg-[#0F172A]/30' : ''}`}>
                      <td className={`px-6 py-3.5 text-gray-300 text-xs font-mono ${isLatestBlurred ? 'blur-sm select-none' : ''}`}>
                        {isLatestBlurred ? 'XX-XXX-XX' : signal.date}
                        {i === 0 && <span className="ml-2 text-[10px] text-cyan-400 font-sans font-medium">Latest</span>}
                      </td>
                      <td className="px-4 py-3.5">
                        {isLatestBlurred ? (
                          <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-[#1F2937] text-gray-600 border border-[#1F2937]">
                            <Lock size={10} /> Locked
                          </span>
                        ) : (
                          <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${
                            signal.type === 'Long'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          }`}>
                            {signal.type === 'Long' ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}
                            {signal.type}
                          </span>
                        )}
                      </td>
                      <td className={`px-4 py-3.5 text-right text-gray-200 text-xs font-mono font-medium ${isLatestBlurred ? 'blur-sm select-none' : ''}`}>
                        ${signal.price.toLocaleString()}
                      </td>
                      {historyTab === 'tpi' && (
                        <td className="px-4 py-3.5 text-center">
                          {isLatestBlurred
                            ? <span className="inline-flex items-center gap-1 text-xs text-gray-600 bg-[#1F2937] border border-[#1F2937] rounded-full px-2 py-0.5"><Lock size={9} />—</span>
                            : <TpiPill value={signal.tpiMedium} />}
                        </td>
                      )}
                      {historyTab === 'tpi' && (
                        <td className="px-4 py-3.5 text-center">
                          {isLatestBlurred
                            ? <span className="inline-flex items-center gap-1 text-xs text-gray-600 bg-[#1F2937] border border-[#1F2937] rounded-full px-2 py-0.5"><Lock size={9} />—</span>
                            : <TpiPill value={signal.tpiLong} />}
                        </td>
                      )}
                      <td className={`px-6 py-3.5 text-right ${isLatestBlurred ? 'blur-sm select-none' : ''}`}>
                        {i === 0 && btcPrice && signal.price ? (() => {
                          // Live P&L: % change from entry price to current BTC price
                          const livePnlPct = signal.type === 'Long'
                            ? (btcPrice - signal.price) / signal.price * 100
                            : (signal.price - btcPrice) / signal.price * 100;
                          // Running balance: previous signal's balance × live return
                          const prevBalance = displayHistory[1]?.balance ?? 1000;
                          const liveBalance = prevBalance * (1 + livePnlPct / 100);
                          const fmt = (n: number) => n >= 1000000
                            ? (n / 1000000).toFixed(2) + 'M'
                            : n >= 1000 ? (n / 1000).toFixed(1) + 'k'
                            : Math.round(n).toLocaleString();
                          return (
                            <div>
                              <div className={`text-xs font-bold font-mono ${livePnlPct >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                {livePnlPct >= 0 ? '+' : ''}{livePnlPct.toFixed(1)}%
                                <span className="text-gray-600 font-normal text-[9px] ml-1">live</span>
                              </div>
                              <div className="text-gray-400 text-[10px] font-mono mt-0.5">${fmt(liveBalance)}</div>
                            </div>
                          );
                        })() : signal.pnlPct === null ? (
                          <span className="text-gray-500 text-xs font-mono">$1,000</span>
                        ) : (
                          <div>
                            <div className={`text-xs font-bold font-mono ${signal.pnlPct >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                              {signal.pnlPct >= 0 ? '+' : ''}{signal.pnlPct.toFixed(1)}%
                            </div>
                            <div className="text-gray-400 text-[10px] font-mono mt-0.5">
                              ${signal.balance >= 1000000
                                ? (signal.balance / 1000000).toFixed(2) + 'M'
                                : signal.balance >= 1000
                                ? (signal.balance / 1000).toFixed(1) + 'k'
                                : signal.balance.toLocaleString()}
                            </div>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden divide-y divide-[#1F2937]/50">
            {displayHistory.map((signal: any, i: number) => {
              // No blur — new signals hidden entirely for free users
              const isLatestBlurred = false;
              return (
                <div key={i} className={`px-4 py-4 ${i === 0 ? 'bg-[#0F172A]/30' : ''}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-mono text-gray-300 ${isLatestBlurred ? 'blur-sm' : ''}`}>
                        {isLatestBlurred ? 'XX-XXX-XX' : signal.date}
                      </span>
                      {i === 0 && <span className="text-[10px] text-cyan-400 font-medium">Latest</span>}
                    </div>
                    {isLatestBlurred ? (
                      <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-[#1F2937] text-gray-600 border border-[#1F2937]">
                        <Lock size={10} /> Locked
                      </span>
                    ) : (
                      <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${
                        signal.type === 'Long'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}>
                        {signal.type === 'Long' ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}
                        {signal.type}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className={`text-gray-300 text-xs font-mono ${isLatestBlurred ? 'blur-sm' : ''}`}>
                        ${isLatestBlurred ? '——' : signal.price.toLocaleString()}
                      </span>
                      {!isLatestBlurred && historyTab === 'tpi' && (
                        <div className="flex items-center gap-1.5 mt-1.5">
                          <TpiPill value={signal.tpiMedium} />
                          <TpiPill value={signal.tpiLong} />
                        </div>
                      )}
                    </div>
                    {!isLatestBlurred && (
                      i === 0 && btcPrice && signal.price ? (() => {
                        const livePnlPct = signal.type === 'Long'
                          ? (btcPrice - signal.price) / signal.price * 100
                          : (signal.price - btcPrice) / signal.price * 100;
                        const prevBalance = displayHistory[1]?.balance ?? 1000;
                        const liveBalance = prevBalance * (1 + livePnlPct / 100);
                        const fmt = (n: number) => n >= 1000000
                          ? (n / 1000000).toFixed(2) + 'M'
                          : n >= 1000 ? (n / 1000).toFixed(1) + 'k'
                          : Math.round(n).toLocaleString();
                        return (
                          <div className="text-right">
                            <div className={`text-xs font-bold ${livePnlPct >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                              {livePnlPct >= 0 ? '+' : ''}{livePnlPct.toFixed(1)}%
                              <span className="text-gray-600 font-normal text-[9px] ml-1">live</span>
                            </div>
                            <div className="text-gray-500 text-[10px] font-mono mt-0.5">${fmt(liveBalance)}</div>
                          </div>
                        );
                      })() : signal.pnlPct !== null ? (
                        <div className="text-right">
                          <div className={`text-xs font-bold ${signal.pnlPct >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {signal.pnlPct >= 0 ? '+' : ''}{signal.pnlPct.toFixed(1)}%
                          </div>
                          <div className="text-gray-500 text-[10px] font-mono mt-0.5">
                            ${signal.balance >= 1000000
                              ? (signal.balance / 1000000).toFixed(2) + 'M'
                              : signal.balance >= 1000
                              ? (signal.balance / 1000).toFixed(1) + 'k'
                              : signal.balance.toLocaleString()}
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-500 text-xs font-mono">Start $1,000</span>
                      )
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="px-4 sm:px-6 py-3 border-t border-[#1F2937] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <p className="text-gray-600 text-xs leading-relaxed">
              Simulation: $1,000 start · 100% allocation · no fees · each row shows the closed trade P&L from previous signal · not financial advice
            </p>
            <button
              onClick={() => setShowFullHistory(!showFullHistory)}
              className="flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 transition-colors font-medium whitespace-nowrap"
            >
              {showFullHistory ? <><ChevronUp size={14} />Show less</> : <><ChevronDown size={14} />All {activeHistory.length} signals</>}
            </button>
          </div>

          {!isPremium && (
            <div className="mx-4 sm:mx-6 mb-5 rounded-xl border border-[#C69214]/20 bg-[#C69214]/5 px-4 sm:px-5 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <p className="text-gray-300 text-xs leading-relaxed">
                <span className="text-[#D4A017] font-semibold">Latest signal delayed 1 week on the free plan.</span>
                {' '}Premium members see it the moment it fires — plus full TPI breakdown.
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

                {/* Footer */}
        <div className="border-t border-[#1F2937] pt-5 pb-2 text-center">
          <p className="text-gray-700 text-xs">
            SPARKIN LTD · Not financial advice ·{' '}
            <a href="/terms" className="hover:text-gray-500 transition-colors">Terms of Use</a>
            {' '}·{' '}
            <a href="/terms#refunds" className="hover:text-gray-500 transition-colors">Refund Policy</a>
          </p>
        </div>

      </main>
    </div>
  );
}