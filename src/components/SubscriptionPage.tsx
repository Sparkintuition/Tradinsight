import { useState, useEffect } from 'react';
import { Check } from 'lucide-react';
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
  onComplete: () => void;
}

export function SubscriptionPage({ onComplete }: SubscriptionPageProps) {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
 

  useEffect(() => {
    fetchPlans();
  }, []);

  useEffect(() => {
  const checkPremium = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('profiles')
      .select('is_premium')
      .eq('id', user.id)
      .maybeSingle();

    if (data?.is_premium) {
      onComplete(); // 👈 redirect to dashboard
    }
  };

  checkPremium();
}, [user]);

  const fetchPlans = async () => {
    const { data, error } = await supabase
      .from('subscription_plans')
      .select('*')
      .order('price', { ascending: true });

    if (error) {
      console.error('Error fetching plans:', error);
      return;
    }

    const filteredPlans = (data || []).filter(
  (plan) => plan.price === 0 || plan.price === 9.99
);

setPlans(filteredPlans);

if (filteredPlans.length > 0) {
  setSelectedPlan(filteredPlans[0].id);
}
  };

  const handleSubscribe = async () => {
  if (!user || !selectedPlan) return;

  setLoading(true);
  try {
    const selectedPlanData = plans.find((p) => p.id === selectedPlan);
    if (!selectedPlanData) return;

    // Free plan → save in Supabase directly
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

  onComplete();
  return;
}

    // Paid plan → redirect to Stripe
    const {
  data: { session },
} = await supabase.auth.getSession();

console.log('Session token exists:', !!session?.access_token);

const { data, error } = await supabase.functions.invoke('create-checkout-session', {
  body: { userId: user.id },
  headers: {
    Authorization: `Bearer ${session?.access_token}`,
  },
});

    console.log('Stripe function response:', data, error);

    if (error) {
  console.error('Function error details:', error);
  throw new Error(error.message || 'Function failed');
}

if (!data?.url) {
  console.error('Returned data:', data);
  throw new Error(data?.error || 'No checkout URL returned');
}

    window.location.href = data.url;
  } catch (error) {
  console.error('Error subscribing:', error);
  alert(
  error instanceof Error
    ? error.message
    : JSON.stringify(error)
);
} finally {
    setLoading(false);
  }
};


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

        <div className="grid md:grid-cols-2 gap-8 mb-8 max-w-4xl mx-auto">
          {plans.map((plan, index) => (
            <button
              key={plan.id}
              onClick={() => setSelectedPlan(plan.id)}
              className={`bg-[#121826] rounded-2xl p-8 border-2 transition-all text-left flex flex-col ${
  selectedPlan === plan.id
  ? plan.price === 0
    ? 'border-[#334155] shadow-lg shadow-slate-900/20'
    : 'border-yellow-500 shadow-lg shadow-yellow-500/20 scale-[1.02]'
  : 'border-[#1F2937] hover:border-cyan-400/40'
}`}
            >
  

              <h3 className="text-2xl font-bold text-white tracking-tight mb-2">
  {plan.price === 0 ? 'Free (Proof Mode)' : 'Real-Time Signals'}
</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold text-white tracking-tight">
                  ${plan.price}
                </span>
                {plan.price > 0 && (
    <>
      <span className="text-gray-400 text-lg">/month • Cancel anytime</span>
      <p className="text-xs text-yellow-400 mt-1">
        Most users choose this plan
      </p>
    </>
  )}
</div>

              <div className="flex-1">
  <ul className="space-y-3 mb-8">
    {(plan.price === 0
      ? [
          'View delayed BTC signals',
          'See how previous trades played out',
        ]
      : [
          'Real-time BTC signals',
          'Analysis and market context',
          'Clear long & short signals',
          'Access to long/meduim term TPI'
        ]
    ).map((feature, i) => (
      <li key={i} className="flex items-start gap-3 text-gray-300">
        <Check className="text-cyan-400 flex-shrink-0 mt-0.5" size={20} />
        <span>{feature}</span>
      </li>
    ))}
  </ul>
</div>

<div className={`text-center py-2 rounded-lg font-semibold ${
  selectedPlan === plan.id
    ? plan.price === 0
      ? 'bg-[#1E293B] text-white'
      : 'bg-yellow-500 text-slate-900'
    : plan.price === 0
      ? 'bg-[#0F172A] text-gray-400'
      : 'bg-yellow-500 text-slate-900 border border-yellow-500/30'
}`}>
                {selectedPlan === plan.id
  ? plan.price === 0
    ? 'Viewing Free Access'
    : 'Selected'
  : plan.price === 0
    ? 'View Past Signals'
    : 'Get Real-Time Signals'}
              </div>
            </button>
          ))}
        </div>

        <div className="text-center">
          <button
            onClick={handleSubscribe}
            disabled={!selectedPlan || loading}
            className={`tracking-tight px-12 py-4 rounded-lg font-semibold text-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
  selectedPlan && plans.find(p => p.id === selectedPlan)?.price === 0
    ? 'border border-yellow-500/40 text-yellow-300 hover:bg-yellow-500/10'
    : 'bg-yellow-500 text-slate-900 hover:bg-yellow-400'
}`}
          >
            {loading ? 'Processing...' : selectedPlan && plans.find(p => p.id === selectedPlan)?.price === 0
  ? 'Continue with Free Access'
  : 'Unlock Real-Time Signals'}
          </button>
        </div>
      </div>
    </div>
  );
}
