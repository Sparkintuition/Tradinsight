import { useState, useEffect } from 'react';
import { TrendingUp, Eye, EyeOff, Check, AlertTriangle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

export function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [success, setSuccess] = useState(false);
  const [ready, setReady] = useState(false);
  const [linkError, setLinkError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Parse both hash (#) and query string (?) for error/token params
    const hash = window.location.hash.replace('#', '');
    const search = window.location.search.replace('?', '');
    const combined = new URLSearchParams(hash + '&' + search);

    const errorCode = combined.get('error_code');
    const errorDesc = combined.get('error_description');
    const accessToken = combined.get('access_token');
    const type = combined.get('type');

    // Handle explicit error in URL
    if (errorCode) {
      setLinkError(
        errorCode === 'otp_expired'
          ? 'This reset link has expired. Please request a new one.'
          : (errorDesc?.replace(/\+/g, ' ') || 'This reset link is invalid. Please request a new one.')
      );
      return;
    }

    // If token is in URL, set the session manually then mark ready
    if (accessToken && type === 'recovery') {
      supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: combined.get('refresh_token') || '',
      }).then(({ error }) => {
        if (error) {
          setLinkError('This reset link is invalid or has expired. Please request a new one.');
        } else {
          setReady(true);
        }
      });
      return;
    }

    // Otherwise wait for PASSWORD_RECOVERY event from Supabase auth state
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setReady(true);
      }
    });

    // 8 second timeout — if no event fires, the link is dead
    const timeout = setTimeout(() => {
      setLinkError('Could not verify reset link. It may have expired. Please request a new one.');
    }, 8000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (password.length < 6) { setFormError('Password must be at least 6 characters.'); return; }
    if (password !== confirm) { setFormError('Passwords do not match.'); return; }
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setSuccess(true);
      setTimeout(() => navigate('/'), 3000);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  // Expired / invalid link
  if (linkError) {
    return (
      <div className="min-h-screen bg-[#0B0F19] flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="flex items-center gap-2 mb-8">
            <TrendingUp className="text-cyan-400" size={24} />
            <span className="text-lg font-bold text-white tracking-tight">Tradinsight</span>
          </div>
          <div className="bg-[#121826] rounded-2xl border border-[#1F2937] p-8 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto mb-5">
              <AlertTriangle size={22} className="text-rose-400" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Link expired</h2>
            <p className="text-gray-400 text-sm mb-6 leading-relaxed">{linkError}</p>
            <button
              onClick={() => navigate('/forgot-password')}
              className="w-full bg-[#D4A017] hover:bg-[#E6B325] text-black font-semibold py-3 rounded-xl text-sm transition-colors"
            >
              Request New Reset Link
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Waiting for PASSWORD_RECOVERY event
  if (!ready) {
    return (
      <div className="min-h-screen bg-[#0B0F19] flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-10 h-10 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin mx-auto mb-4" />
          <p className="text-gray-400 text-sm">Verifying reset link...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0F19] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-2 mb-8">
          <TrendingUp className="text-cyan-400" size={24} />
          <span className="text-lg font-bold text-white tracking-tight">Tradinsight</span>
        </div>
        <div className="bg-[#121826] rounded-2xl border border-[#1F2937] p-8">
          {!success ? (
            <>
              <h1 className="text-2xl font-bold text-white mb-2 tracking-tight">Set new password</h1>
              <p className="text-gray-400 text-sm mb-6">Choose a strong password for your account.</p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-gray-400 text-xs font-medium mb-1.5">New password</label>
                  <div className="relative">
                    <input
                      type={showPw ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      required minLength={6}
                      className="w-full px-4 py-3 bg-[#0F172A] border border-[#1F2937] rounded-xl text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-cyan-500/50 pr-10"
                      placeholder="At least 6 characters"
                    />
                    <button type="button" onClick={() => setShowPw(!showPw)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                      {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-gray-400 text-xs font-medium mb-1.5">Confirm password</label>
                  <input
                    type="password"
                    value={confirm}
                    onChange={e => setConfirm(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-[#0F172A] border border-[#1F2937] rounded-xl text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-cyan-500/50"
                    placeholder="••••••••"
                  />
                </div>
                {formError && (
                  <div className="flex items-start gap-2.5 bg-rose-500/10 border border-rose-500/20 rounded-xl px-4 py-3">
                    <AlertTriangle size={14} className="text-rose-400 shrink-0 mt-0.5" />
                    <p className="text-rose-300 text-xs">{formError}</p>
                  </div>
                )}
                <button
                  type="submit" disabled={loading}
                  className="w-full bg-[#D4A017] hover:bg-[#E6B325] text-black font-semibold py-3 rounded-xl text-sm transition-colors disabled:opacity-50"
                >
                  {loading ? 'Updating...' : 'Update Password'}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center py-4">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-5">
                <Check size={22} className="text-emerald-400" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Password updated</h2>
              <p className="text-gray-400 text-sm">Redirecting you to sign in...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}