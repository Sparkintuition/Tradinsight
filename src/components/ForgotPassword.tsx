import { useState } from 'react';
import { TrendingUp, ArrowLeft, Mail, Check } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface ForgotPasswordProps {
  onBack: () => void;
}

export function ForgotPassword({ onBack }: ForgotPasswordProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        <div className="flex items-center gap-2 mb-8">
          <TrendingUp className="text-cyan-400" size={24} />
          <span className="text-lg font-bold text-white tracking-tight">Tradinsight</span>
        </div>

        <div className="bg-[#121826] rounded-2xl border border-[#1F2937] p-8">
          {!sent ? (
            <>
              <button
                onClick={onBack}
                className="flex items-center gap-1.5 text-gray-500 hover:text-gray-300 text-sm mb-6 transition-colors"
              >
                <ArrowLeft size={14} /> Back to sign in
              </button>

              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-5">
                <Mail size={18} className="text-cyan-400" />
              </div>

              <h1 className="text-2xl font-bold text-white mb-2 tracking-tight">Reset your password</h1>
              <p className="text-gray-400 text-sm mb-6 leading-relaxed">
                Enter your email and we'll send you a link to reset your password.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-gray-400 text-xs font-medium mb-1.5">Email address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-[#0F172A] border border-[#1F2937] rounded-xl text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-cyan-500/50 transition-colors"
                    placeholder="you@example.com"
                  />
                </div>

                {error && (
                  <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl px-4 py-3">
                    <p className="text-rose-300 text-xs">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#D4A017] hover:bg-[#E6B325] text-black font-semibold py-3 rounded-xl text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center py-4">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-5">
                <Check size={22} className="text-emerald-400" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Check your inbox</h2>
              <p className="text-gray-400 text-sm leading-relaxed mb-6">
                We sent a password reset link to <span className="text-white">{email}</span>.
                Check your spam folder if you don't see it within a few minutes.
              </p>
              <button
                onClick={onBack}
                className="text-cyan-400 hover:text-cyan-300 text-sm font-medium transition-colors"
              >
                Back to sign in
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
