import { useState, useEffect } from 'react';
import { Check, TrendingUp, Shield, Zap, Clock, BarChart2, ArrowRight, Lock, ArrowLeft, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface Plan {
  id: string;
  name: string;
  price: number;
  features: string[];
  signal_limit: number;
}

interface SubscriptionPageProps {
  onGoHome?: () => void;
  onBackToProfile?: () => void;
}

export function SubscriptionPage({ onGoHome, onBackToProfile }: SubscriptionPageProps) {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchPlans();
  }, []);

  useEffect(() => {
    const checkPremium = async () => {
      if (!user) return;
      const { data, error } = await supabase
        .from('profiles')
        .select('is_premium')
        .eq('id', user.id)
        .maybeSingle();
      if (error) { console.error('Error checking premium status:', error); return; }
      if (data?.is_premium) { navigate('/dashboard', { replace: true }); }
    };
    checkPremium();
  }, [user, navigate]);

  const fetchPlans = async () => {
    const { data, error } = await supabase
      .from('subscription_plans')
      .select('*')
      .order('price', { ascending: true });
    if (error) { console.error('Error fetching plans:', error); return; }
    // Keep only the free plan and the highest-priced paid plan
    const allPlans = data || [];
    const freePlan = allPlans.find((plan) => plan.price === 0);
    const paidPlans = allPlans.filter((plan) => plan.price > 0);
    const topPaidPlan = paidPlans.reduce((best, p) => p.price > best.price ? p : best, paidPlans[0]);
    const filteredPlans = [freePlan, topPaidPlan].filter(Boolean) as Plan[];
    setPlans(filteredPlans);
    if (topPaidPlan) {
      setSelectedPlan(topPaidPlan.id);
    } else if (freePlan) {
      setSelectedPlan(freePlan.id);
    }
  };

  const handleSubscribe = async () => {
    if (!user || !selectedPlan) return;
    setLoading(true);
    try {
      const selectedPlanData = plans.find((p) => p.id === selectedPlan);
      if (!selectedPlanData) throw new Error('Selected plan not found');

      if (selectedPlanData.price === 0) {
        const { error } = await supabase
          .from('user_subscriptions')
          .upsert(
            { user_id: user.id, plan_id: selectedPlan, status: 'active', expires_at: null },
            { onConflict: 'user_id,plan_id' }
          );
        if (error) throw error;
        navigate('/dashboard');
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();
      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: { userId: user.id },
        headers: { Authorization: `Bearer ${session?.access_token}` },
      });
      if (error) throw new Error(error.message || 'Checkout function failed');
      if (!data?.url) throw new Error(data?.error || 'No checkout URL returned');
      window.location.href = data.url;
    } catch (error) {
      console.error('Error subscribing:', error);
      alert(error instanceof Error ? error.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const selectedPlanData = plans.find((p) => p.id === selectedPlan);
  const isFreeSelected = selectedPlanData?.price === 0;

  const freeFeatures = [
    { icon: <Clock size={15} />, text: 'Delayed BTC signals — see how past trades played out' },
    { icon: <BarChart2 size={15} />, text: 'Full signal history with entry, direction & result' },
    { icon: <TrendingUp size={15} />, text: 'Equity curve & strategy performance data' },
  ];

  const premiumFeatures = [
    { icon: <Zap size={15} />, text: 'Real-time signals — alerted the moment conditions align' },
    { icon: <BarChart2 size={15} />, text: 'Full TPI breakdown — see exactly why a signal fired' },
    { icon: <TrendingUp size={15} />, text: 'Live TPI status: current market regime at a glance' },
    { icon: <Shield size={15} />, text: 'Signal readiness indicator — know when one is forming' },
    { icon: <Clock size={15} />, text: 'Weekly market context during low-signal periods' },
    { icon: <Check size={15} />, text: 'Complete signal history with full reasoning per trade' },
  ];

  return (
    <div className="min-h-screen bg-[#0B0F19] flex items-center justify-center p-4 py-16">
      <div className="max-w-4xl w-full">

        {/* Navigation row */}
        <div className="mb-8 flex items-center justify-between">
          <button
  type="button"
  onClick={() => {
    if (onGoHome) onGoHome();
    else navigate('/');
  }}
  className="flex items-center gap-2 text-gray-500 hover:text-gray-300 text-sm transition-colors"
>
  <ArrowLeft size={15} />
  Back to home
</button>

<button
  type="button"
  onClick={() => {
  if (onBackToProfile) onBackToProfile();
  else navigate('/survey');
}}
  className="flex items-center gap-2 text-gray-400 hover:text-cyan-400 text-xs transition-colors border border-[#1F2937] hover:border-cyan-500/30 bg-[#121826] px-4 py-2 rounded-lg"
>
  <RefreshCw size={12} />
  Back to my profile result
</button>
        </div>

        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/5 px-4 py-1.5 mb-5">
            <TrendingUp className="text-cyan-400" size={14} />
            <span className="text-cyan-400 text-xs font-semibold tracking-widest uppercase">Choose your access</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-3">
            Start free. Upgrade when you believe it.
          </h2>
          <p className="text-gray-400 text-base max-w-xl mx-auto leading-relaxed">
            The free plan shows you delayed signals and the full track record.
            Verify the system yourself — then decide if real-time access is worth it.
          </p>
        </div>

        {/* Plans */}
        <div className="grid md:grid-cols-2 gap-5 mb-8">

          {/* Free Plan */}
          {plans.filter(p => p.price === 0).map((plan) => {
            const isSelected = selectedPlan === plan.id;
            return (
              <button
                key={plan.id}
                onClick={() => setSelectedPlan(plan.id)}
                className={`bg-[#121826] rounded-2xl p-7 border-2 transition-all text-left flex flex-col relative ${
                  isSelected
                    ? 'border-[#334155] shadow-lg shadow-slate-900/20'
                    : 'border-[#1F2937] hover:border-[#334155]'
                }`}
              >
                <div className="mb-5">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1">Free plan</p>
                  <h3 className="text-xl font-bold text-white tracking-tight mb-1">Verify First</h3>
                  <p className="text-gray-400 text-sm">See the track record before you commit</p>
                </div>
                <div className="mb-6">
                  <span className="text-3xl font-bold text-white">$0</span>
                  <span className="text-gray-500 text-sm ml-2">forever free</span>
                </div>
                <ul className="space-y-3 flex-1 mb-6">
                  {freeFeatures.map((f, i) => (
                    <li key={i} className="flex items-start gap-3 text-gray-400 text-sm">
                      <span className="text-gray-500 mt-0.5 shrink-0">{f.icon}</span>
                      <span>{f.text}</span>
                    </li>
                  ))}
                </ul>
                <div className="rounded-xl border border-[#1F2937] bg-[#0B0F19]/60 px-4 py-3 mb-5">
                  <div className="flex items-center gap-2 mb-2">
                    <Lock size={12} className="text-gray-600" />
                    <p className="text-gray-600 text-xs font-medium uppercase tracking-wide">Locked on free</p>
                  </div>
                  <p className="text-gray-600 text-xs leading-relaxed">
                    Real-time alerts, TPI breakdown, signal readiness indicator
                  </p>
                </div>
                <div className={`text-center py-2.5 rounded-xl font-semibold text-sm transition-colors ${
                  isSelected ? 'bg-[#1E293B] text-gray-300' : 'bg-[#0F172A] text-gray-500 border border-[#1F2937]'
                }`}>
                  {isSelected ? 'Selected' : 'Start for free'}
                </div>
              </button>
            );
          })}

          {/* Premium Plan */}
          {plans.filter(p => p.price > 0).map((plan) => {
            const isSelected = selectedPlan === plan.id;
            return (
              <button
                key={plan.id}
                onClick={() => setSelectedPlan(plan.id)}
                className={`rounded-2xl p-7 border-2 transition-all text-left flex flex-col relative ${
                  isSelected
                    ? 'border-[#C69214] shadow-xl shadow-[#C69214]/15 scale-[1.02]'
                    : 'border-[#C69214]/40 hover:border-[#C69214]/70'
                }`}
                style={{
                  background: isSelected
                    ? 'linear-gradient(145deg, #15202e 0%, #1a1a0f 60%, #1c1608 100%)'
                    : 'linear-gradient(145deg, #121826 0%, #141610 100%)',
                }}
              >
                {/* Subtle gold glow top edge */}
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#C69214]/60 to-transparent" />

                <div className="mb-5">
                  {/* Recommended badge — inline at top of card */}
                  <div className="mb-3">
                    <span className="bg-[#D4A017] text-black text-xs font-bold px-4 py-1 rounded-full tracking-wide">
                      ★ RECOMMENDED
                    </span>
                  </div>
                  <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: '#C69214' }}>
                    Premium plan
                  </p>
                  <h3 className="text-2xl font-bold tracking-tight mb-1 text-white">
                    Real-Time Access
                  </h3>
                  <p className="text-gray-400 text-sm">Get alerted the moment a signal fires</p>
                </div>

                <div className="mb-1">
                  <span className="text-4xl font-bold text-white">${plan.price}</span>
                  <span className="text-gray-400 text-sm ml-2">/month</span>
                </div>
                <p className="text-gray-500 text-xs mb-5">Cancel anytime · No contracts</p>

                {/* Value anchor */}
                <div className="rounded-xl border border-[#C69214]/25 px-4 py-3 mb-5" style={{ background: 'rgba(198,146,20,0.08)' }}>
                  <p className="text-xs leading-relaxed" style={{ color: '#d4a847' }}>
                    One well-timed signal can return months of subscription cost. The system targets major BTC trends — not small moves.
                  </p>
                </div>

                <ul className="space-y-2.5 flex-1 mb-6">
                  {premiumFeatures.map((f, i) => (
                    <li key={i} className="flex items-start gap-3 text-gray-300 text-sm">
                      <span className="text-cyan-400 mt-0.5 shrink-0">{f.icon}</span>
                      <span>{f.text}</span>
                    </li>
                  ))}
                </ul>

                <div className={`text-center py-2.5 rounded-xl font-semibold text-sm transition-colors ${
                  isSelected ? 'text-black' : 'text-black'
                }`} style={{ background: isSelected ? '#D4A017' : 'rgba(212,160,23,0.85)' }}>
                  {isSelected ? 'Selected — Unlock Real-Time' : 'Get Real-Time Signals'}
                </div>
              </button>
            );
          })}
        </div>

        {/* CTA */}
        <div className="text-center mb-8">
          <button
            onClick={handleSubscribe}
            disabled={!selectedPlan || loading}
            className={`inline-flex items-center gap-2 px-10 py-4 rounded-xl font-semibold text-base transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
              isFreeSelected
                ? 'border border-[#334155] text-gray-300 hover:border-gray-500 hover:text-white bg-[#121826]'
                : 'text-black hover:opacity-90 shadow-lg shadow-[#D4A017]/20'
            }`}
            style={!isFreeSelected ? { background: 'linear-gradient(90deg, #C69214 0%, #E6B325 100%)' } : {}}
          >
            {loading
              ? 'Processing...'
              : isFreeSelected
              ? 'Continue with Free Access'
              : <><span>Unlock Real-Time Signals</span> <ArrowRight size={16} /></>
            }
          </button>
          {!isFreeSelected && (
            <p className="text-gray-600 text-xs mt-3">Secure checkout via Stripe · Cancel anytime from your account</p>
          )}
          {isFreeSelected && (
            <p className="text-gray-600 text-xs mt-3">No card required · Upgrade anytime</p>
          )}
        </div>

        {/* Trust strip */}
        <div className="border-t border-[#1F2937] pt-6">
          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-gray-500">
            <span className="flex items-center gap-1.5"><Shield size={12} className="text-gray-600" /> Backtested since 2018</span>
            <span className="flex items-center gap-1.5"><BarChart2 size={12} className="text-gray-600" /> 60.4% win rate (unfiltered baseline)</span>
            <span className="flex items-center gap-1.5"><TrendingUp size={12} className="text-gray-600" /> 1.67 profit factor</span>
            <span className="flex items-center gap-1.5"><Check size={12} className="text-gray-600" /> Cancel anytime</span>
          </div>
          <p className="text-center text-gray-700 text-xs mt-4">
            Not financial advice · Past performance does not guarantee future results
          </p>
        </div>

      </div>
    </div>
  );
}