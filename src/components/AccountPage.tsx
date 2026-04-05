import { useState, useEffect } from 'react';
import {
  LogOut, ArrowRight, User, CreditCard,
  Shield, Check, AlertTriangle, Eye, EyeOff, BookOpen,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface AccountPageProps {
  onNavigateDashboard: () => void;
  onUnlockPremium: () => void;
  onMethodology: () => void;
}

interface UserProfile {
  full_name: string;
  email: string;
  is_premium: boolean;
}

interface Subscription {
  status: string;
  plan_id: string;
  created_at: string;
  expires_at: string | null;
  subscription_plans: { name: string; price: number };
}

export function AccountPage({ onNavigateDashboard, onUnlockPremium, onMethodology }: AccountPageProps) {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);
  const [pwError, setPwError] = useState('');
  const [pwSuccess, setPwSuccess] = useState(false);

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      try {
        const { data: profileData } = await supabase
          .from('profiles').select('full_name, email, is_premium')
          .eq('id', user.id).maybeSingle();
        setProfile(profileData as UserProfile | null);

        const { data: subData } = await supabase
          .from('user_subscriptions')
          .select('status, plan_id, created_at, expires_at, subscription_plans(name, price)')
          .eq('user_id', user.id).eq('status', 'active');
        // Pick the highest-priced active plan (premium over free)
        const sorted = (subData || []).sort((a: any, b: any) =>
          (b.subscription_plans?.price || 0) - (a.subscription_plans?.price || 0)
        );
        setSubscription((sorted[0] as Subscription) || null);
      } catch {
        setFetchError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwError('');
    setPwSuccess(false);

    if (newPassword.length < 6) {
      setPwError('New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwError('New passwords do not match.');
      return;
    }

    setPwLoading(true);
    try {
      // Verify current password by re-signing in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user?.email || '',
        password: currentPassword,
      });
      if (signInError) throw new Error('Current password is incorrect.');

      const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
      if (updateError) throw updateError;

      setPwSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPwError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setPwLoading(false);
    }
  };

  const isPremium = !!profile?.is_premium;

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric', month: 'long', year: 'numeric',
    });
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0F19] flex items-center justify-center">
        <div className="text-cyan-400 text-xl font-medium">Loading...</div>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="min-h-screen bg-[#0B0F19] flex items-center justify-center">
        <div className="flex items-center gap-2 text-rose-400 text-sm">
          <AlertTriangle size={16} />
          Failed to load account data. Please refresh the page.
        </div>
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
              <img src="/logo.svg" alt="Tradinsight" className="h-[24px] w-auto" />
              <span className="text-xl font-bold text-white tracking-tight">Tradinsight</span>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={onMethodology}
                className="hidden sm:flex items-center gap-1.5 text-gray-400 hover:text-white text-xs transition-colors border border-[#1F2937] hover:border-[#334155] px-3 py-1.5 rounded-lg"
              >
                <BookOpen size={12} />
                How it Works
              </button>
              <button
                onClick={onNavigateDashboard}
                className="flex items-center gap-1.5 text-gray-400 hover:text-white text-sm transition-colors"
              >
                <ArrowRight size={15} className="rotate-180" />
                Dashboard
              </button>
              <button
                onClick={signOut}
                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm"
              >
                <LogOut size={16} />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-10 max-w-2xl space-y-6">

        {/* Page header */}
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight mb-1">Account Settings</h1>
          <p className="text-gray-400 text-sm">Manage your subscription and account details.</p>
        </div>

        {/* Profile info */}
        <div className="bg-[#121826] rounded-2xl border border-[#1F2937] p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-8 rounded-lg bg-[#0F172A] border border-[#1F2937] flex items-center justify-center">
              <User size={15} className="text-gray-400" />
            </div>
            <h2 className="text-white font-semibold">Profile</h2>
          </div>

          <div className="space-y-3">
            <div className="bg-[#0F172A]/70 rounded-xl p-4 border border-[#1F2937]">
              <p className="text-gray-500 text-xs mb-1">Full name</p>
              <p className="text-white font-medium text-sm">{profile?.full_name || '—'}</p>
            </div>
            <div className="bg-[#0F172A]/70 rounded-xl p-4 border border-[#1F2937]">
              <p className="text-gray-500 text-xs mb-1">Email address</p>
              <p className="text-white font-medium text-sm">{user?.email || '—'}</p>
            </div>
            <div className="bg-[#0F172A]/70 rounded-xl p-4 border border-[#1F2937]">
              <p className="text-gray-500 text-xs mb-1">Account plan</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className={`w-1.5 h-1.5 rounded-full ${isPremium ? 'bg-[#D4A017]' : 'bg-gray-500'}`} />
                <p className="text-white font-medium text-sm">{isPremium ? 'Premium' : 'Free'} Plan</p>
              </div>
            </div>
          </div>
        </div>

        {/* Subscription status */}
        <div className="bg-[#121826] rounded-2xl border border-[#1F2937] p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-8 rounded-lg bg-[#0F172A] border border-[#1F2937] flex items-center justify-center">
              <CreditCard size={15} className="text-gray-400" />
            </div>
            <h2 className="text-white font-semibold">Subscription</h2>
          </div>

          {isPremium && subscription ? (
            <>
              <div className="space-y-3 mb-5">
                <div className="bg-[#0F172A]/70 rounded-xl p-4 border border-[#C69214]/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-500 text-xs mb-1">Current plan</p>
                      <p className="text-[#D4A017] font-semibold text-sm">
                        {subscription.subscription_plans?.name || 'Premium'} — ${subscription.subscription_plans?.price}/month
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-3 py-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      <span className="text-emerald-400 text-xs font-medium">Active</span>
                    </div>
                  </div>
                </div>
                <div className="bg-[#0F172A]/70 rounded-xl p-4 border border-[#1F2937]">
                  <p className="text-gray-500 text-xs mb-1">Member since</p>
                  <p className="text-white text-sm font-medium">{formatDate(subscription.created_at)}</p>
                </div>
              </div>

              <div className="rounded-xl border border-[#1F2937] bg-[#0F172A]/40 px-4 py-3">
                <p className="text-gray-500 text-xs leading-relaxed">
                  To cancel your subscription or update billing details, contact us at{' '}
                  <span className="text-gray-300">support@tradinsight.net</span>.
                  Cancellations take effect at the end of the current billing period.
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="bg-[#0F172A]/70 rounded-xl p-4 border border-[#1F2937] mb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-xs mb-1">Current plan</p>
                    <p className="text-white font-medium text-sm">Free Plan</p>
                  </div>
                  <span className="text-gray-500 text-xs border border-[#1F2937] rounded-full px-3 py-1">Free</span>
                </div>
              </div>

              <div className="rounded-xl border border-[#C69214]/20 bg-[#C69214]/5 p-4 mb-4">
                <p className="text-[#D4A017] text-xs font-semibold mb-1">Upgrade to Premium — $19.99/month</p>
                <p className="text-gray-400 text-xs leading-relaxed mb-3">
                  Get real-time signals the moment they fire, full TPI breakdown, signal analysis, and weekly market context.
                </p>
                <div className="grid grid-cols-2 gap-1.5 mb-3">
                  {[
                    'Real-time signal alerts',
                    'Full TPI breakdown',
                    'Signal readiness indicator',
                    'Weekly market context',
                  ].map(f => (
                    <div key={f} className="flex items-center gap-1.5 text-xs text-gray-400">
                      <Check size={11} className="text-emerald-400 shrink-0" />
                      {f}
                    </div>
                  ))}
                </div>
                <button
                  onClick={onUnlockPremium}
                  className="w-full bg-[#D4A017] hover:bg-[#E6B325] text-black font-semibold py-2.5 rounded-xl text-sm transition-colors"
                >
                  Upgrade to Premium
                </button>
              </div>
            </>
          )}
        </div>

        {/* Change password */}
        <div className="bg-[#121826] rounded-2xl border border-[#1F2937] p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-8 rounded-lg bg-[#0F172A] border border-[#1F2937] flex items-center justify-center">
              <Shield size={15} className="text-gray-400" />
            </div>
            <h2 className="text-white font-semibold">Change Password</h2>
          </div>

          <form onSubmit={handleChangePassword} className="space-y-3">
            {/* Current password */}
            <div>
              <label className="block text-gray-500 text-xs mb-1.5">Current password</label>
              <div className="relative">
                <input
                  type={showCurrent ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-[#0F172A] border border-[#1F2937] rounded-xl text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-cyan-500/50 pr-10"
                  placeholder="••••••••"
                />
                <button type="button" onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                  {showCurrent ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* New password */}
            <div>
              <label className="block text-gray-500 text-xs mb-1.5">New password</label>
              <div className="relative">
                <input
                  type={showNew ? 'text' : 'password'}
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full px-4 py-3 bg-[#0F172A] border border-[#1F2937] rounded-xl text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-cyan-500/50 pr-10"
                  placeholder="At least 6 characters"
                />
                <button type="button" onClick={() => setShowNew(!showNew)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                  {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Confirm new password */}
            <div>
              <label className="block text-gray-500 text-xs mb-1.5">Confirm new password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required
                className="w-full px-4 py-3 bg-[#0F172A] border border-[#1F2937] rounded-xl text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-cyan-500/50"
                placeholder="••••••••"
              />
            </div>

            {pwError && (
              <div className="flex items-start gap-2.5 bg-rose-500/10 border border-rose-500/20 rounded-xl px-4 py-3">
                <AlertTriangle size={14} className="text-rose-400 shrink-0 mt-0.5" />
                <p className="text-rose-300 text-xs">{pwError}</p>
              </div>
            )}

            {pwSuccess && (
              <div className="flex items-center gap-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3">
                <Check size={14} className="text-emerald-400 shrink-0" />
                <p className="text-emerald-300 text-xs">Password updated successfully.</p>
              </div>
            )}

            <button
              type="submit"
              disabled={pwLoading}
              className="w-full bg-[#0F172A] hover:bg-[#1a2235] border border-[#1F2937] hover:border-cyan-500/30 text-white font-semibold py-3 rounded-xl text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {pwLoading ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>

        {/* Sign out */}
        <div className="bg-[#121826] rounded-2xl border border-[#1F2937] p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-semibold text-sm mb-0.5">Sign out</p>
              <p className="text-gray-500 text-xs">You will be redirected to the home page.</p>
            </div>
            <button
              onClick={signOut}
              className="flex items-center gap-2 text-gray-400 hover:text-white border border-[#1F2937] hover:border-[#334155] px-4 py-2 rounded-xl text-sm transition-colors"
            >
              <LogOut size={15} />
              Sign Out
            </button>
          </div>
        </div>

        {/* Footer links */}
        <div className="text-center pb-4">
          <p className="text-gray-700 text-xs">
            <a href="/terms" className="hover:text-gray-500 transition-colors">Terms of Use</a>
            {' · '}
            <a href="/terms#refunds" className="hover:text-gray-500 transition-colors">Refund Policy</a>
            {' · '}
            <a href="/terms#privacy" className="hover:text-gray-500 transition-colors">Privacy</a>
          </p>
        </div>

      </main>
    </div>
  );
}