import { useState, useEffect } from 'react';
import { Check } from 'lucide-react';
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

export function SubscriptionPage() {
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

      if (error) {
        console.error('Error checking premium status:', error);
        return;
      }

      if (data?.is_premium) {
        navigate('/dashboard', { replace: true });
      }
    };

    checkPremium();
  }, [user, navigate]);

  const fetchPlans = async () => {
    const { data, error } = await supabase
      .from('subscription_plans')
      .select('*')
      .order('price', { ascending: true });

    if (error) {
      console.error('Error fetching plans:', error);
      return;
    }

    // Show free plan + highest priced paid plan (no hardcoded price)
    const freePlan = (data || []).find((plan) => plan.price === 0);
    const paidPlans = (data || []).filter((plan) => plan.price > 0);
    const highestPlan = paidPlans.sort((a, b) => b.price - a.price)[0];
    const filteredPlans = [freePlan, highestPlan].filter(Boolean) as Plan[];

    setPlans(filteredPlans);

    if (highestPlan) {
      setSelectedPlan(highestPlan.id);
    } else if (filteredPlans.length > 0) {
      setSelectedPlan(filteredPlans[0].id);
    }
  };

  const handleSubscribe = async () => {
    if (!user || !selectedPlan) return;

    setLoading(true);

    try {
      const selectedPlanData = plans.find((p) => p.id === selectedPlan);
      if (!selectedPlanData) {
        throw new Error('Selected plan not found');
      }

      if (selectedPlanData.price === 0) {
        const { error } = await supabase
          .from('user_subscriptions')
          .upsert(
            {
              user_id: user.id,
              plan_id: selectedPlan,
              status: 'active',
              expires_at: null,
            },
            {
              onConflict: 'user_id,plan_id',
            }
          );

        if (error) throw error;

        navigate('/dashboard');
        return;
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();

      const { data, error } = await supabase.functions.invoke(
        'create-checkout-session',
        {
          body: { userId: user.id },
          headers: {
            Authorization: `Bearer ${session?.access_token}`,
          },
        }
      );

      if (error) {
        console.error('Stripe function error:', error);
        throw new Error(error.message || 'Checkout function failed');
      }

      if (!data?.url) {
        console.error('Returned checkout data:', data);
        throw new Error(data?.error || 'No checkout URL returned');
      }

      window.location.href = data.url;
    } catch (error) {
      console.error('Error subscribing:', error);
      alert(
        error instanceof Error ? error.message : 'Something went wrong'
      );
    } finally {
      setLoading(false);
    }
  };

  const selectedPlanData = plans.find((p) => p.id === selectedPlan);
  const isFreeSelected = selectedPlanData?.price === 0;

  return (
    <div className="min-h-screen bg-[#0B0F19] flex items-center justify-center p-4">
      <div className="max-w-6xl w-full">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white tracking-tight mb-4">
            Stop Guessing. Trade BTC with Data-Driven Signals.
          </h2>
          <p className="text-gray-400 text-lg">
            Review past BTC signals for free, then unlock real-time signals and analysis
          </p>
        </div>

        {/* Performance proof strip */}
        <div className="max-w-4xl mx-auto mb-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { value: '4.54', label: 'Profit Factor', sub: 'wins vs losses' },
              { value: '62.8%', label: 'Win Rate', sub: 'since 2018' },
              { value: '43', label: 'Signals', sub: 'backtested' },
              { value: '3.16', label: 'Sortino Ratio', sub: 'risk-adjusted' },
            ].map((stat) => (
              <div key={stat.label} className="bg-[#121826] border border-[#1F2937] rounded-xl p-4 text-center">
                <p className="text-xl font-bold text-white">{stat.value}</p>
                <p className="text-gray-400 text-xs font-medium mt-0.5">{stat.label}</p>
                <p className="text-gray-600 text-[10px] mt-0.5">{stat.sub}</p>
              </div>
            ))}
          </div>
          <p className="text-center text-gray-600 text-xs mt-3">
            Backtested on BTC/USD since 2018 · raw strategy signals · past performance does not guarantee future results
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-8 max-w-4xl mx-auto">
          {plans.map((plan) => {
            const isSelected = selectedPlan === plan.id;
            const isFreePlan = plan.price === 0;

            return (
              <button
                key={plan.id}
                onClick={() => setSelectedPlan(plan.id)}
                className={`bg-[#121826] rounded-2xl p-8 border-2 transition-all text-left flex flex-col ${
                  isSelected
                    ? isFreePlan
                      ? 'border-[#334155] shadow-lg shadow-slate-900/20'
                      : 'border-[#C69214] shadow-lg shadow-[#C69214]/20 scale-[1.02]'
                    : 'border-[#1F2937] hover:border-cyan-400/40'
                }`}
              >
                <h3 className="text-2xl font-bold text-white tracking-tight mb-2">
                  {isFreePlan ? 'Free (Proof Mode)' : 'Real-Time Signals'}
                </h3>

                <div className="mb-6">
                  <span className="text-4xl font-bold text-white tracking-tight">
                    ${plan.price}
                  </span>

                  {!isFreePlan && (
                    <>
                      <span className="text-gray-400 text-lg">/month • Cancel anytime</span>
                      <p className="text-xs text-[#C69214] mt-1">
                        Most users choose this plan
                      </p>
                    </>
                  )}
                </div>

                <div className="flex-1">
                  <ul className="space-y-3 mb-8">
                    {(isFreePlan
                      ? [
                          'View delayed BTC signals',
                          'See how previous trades played out',
                        ]
                      : [
                          'Real-time BTC signals',
                          'Analysis and market context',
                          'Clear long & short signals',
                          'Access to long/medium term TPI',
                        ]
                    ).map((feature, i) => (
                      <li key={i} className="flex items-start gap-3 text-gray-300">
                        <Check className="text-cyan-400 flex-shrink-0 mt-0.5" size={20} />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div
                  className={`text-center py-2 rounded-lg font-semibold ${
                    isSelected
                      ? isFreePlan
                        ? 'bg-[#1E293B] text-white'
                        : 'bg-[#C69214] text-slate-900'
                      : isFreePlan
                      ? 'bg-[#0F172A] text-gray-400'
                      : 'bg-[#C69214] text-slate-900 border border-[#C69214]/30'
                  }`}
                >
                  {isSelected
                    ? isFreePlan
                      ? 'Viewing Free Access'
                      : 'Selected'
                    : isFreePlan
                    ? 'View Past Signals'
                    : 'Get Real-Time Signals'}
                </div>
              </button>
            );
          })}
        </div>

        <div className="text-center">
          <button
            onClick={handleSubscribe}
            disabled={!selectedPlan || loading}
            className={`tracking-tight px-12 py-4 rounded-lg font-semibold text-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
              isFreeSelected
                ? 'border border-[#C69214]/40 text-[#D4A017] hover:bg-[#C69214]/10'
                : 'bg-[#C69214] text-slate-900 hover:bg-[#D4A017]'
            }`}
          >
            {loading
              ? 'Processing...'
              : isFreeSelected
              ? 'Continue with Free Access'
              : 'Unlock Real-Time Signals'}
          </button>
        </div>
      </div>
    </div>
  );
}