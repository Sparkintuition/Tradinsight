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
  // 'waiting' | 'ready' | 'error'
  const [status, setStatus] = useState<'waiting' | 'ready' | 'error'>('waiting');
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Parse the URL hash for error or token params
    const hash = window.location.hash.substring(1); // remove leading #
    const params = new URLSearchParams(hash);

    const error = params.get('error');
    const errorCode = params.get('error_code');
    const errorDesc = params.get('error_description');
    const type = params.get('type');
    const accessToken = params.get('access_token');
    const refreshToken = params.get('refresh_token');

    // Explicit error in URL
    if (error || errorCode) {
      const msg = errorCode === 'otp_expired'
        ? 'This reset link has expired. Please request a new one.'
        : (errorDesc?.replace(/\+/g, ' ') || 'This reset link is invalid or has expired.');
      setErrorMsg(msg);
      setStatus('error');
      return;
    }

    // Token is in the hash — set session directly
    if (accessToken && type === 'recovery') {
      supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken || '',
      }).then(({ error: sessionError }) => {
        if (sessionError) {
          setErrorMsg('This reset link is invalid or has expired. Please request a new one.');
          setStatus('error');
        } else {
          setStatus('ready');
        }
      });
      return;
    }

    // No token in URL — listen for PASSWORD_RECOVERY event
    // This fires when Supabase processes the token server-side and redirects here
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setStatus('ready');
      }
    });

    // Timeout — if nothing fires in 10s, the link is dead
    const timeout = setTimeout(() => {
      setErrorMsg('Could not verify the reset link. Please request a new one.');
      setStatus('error');
    }, 10000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (password.length < 6) {
      setFormError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirm) {
      setFormError('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setSuccess(true);
      // Sign out after reset so user logs in fresh with new password
      await supabase.auth.signOut();
      setTimeout(() => navigate('/'), 3000);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  if (status === 'error') {
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
            <p className="text-gray-400 text-sm mb-6 leading-relaxed">{errorMsg}</p>
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

  if (status === 'waiting') {
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
                      required
                      minLength={6}
                      className="w-full px-4 py-3 bg-[#0F172A] border border-[#1F2937] rounded-xl text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-cyan-500/50 pr-10"
                      placeholder="At least 6 characters"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw(!showPw)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                    >
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
                  type="submit"
                  disabled={loading}
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