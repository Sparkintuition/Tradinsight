import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'signin' | 'signup';
}

export function AuthModal({
  isOpen,
  onClose,
  initialMode = 'signin',
}: AuthModalProps) {
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [signupComplete, setSignupComplete] = useState(false);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setError('');
      setEmail('');
      setPassword('');
      setFullName('');
      setSignupComplete(false);
    }
  }, [initialMode, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'signup') {
        const { error } = await signUp(email, password, fullName);
        if (error) throw error;
        setSignupComplete(true);
        return; // stay in modal — show confirmation screen
      } else {
        const { error } = await signIn(email, password);
        if (error) throw error;
        onClose();
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#121826] border border-[#1F2937] rounded-2xl max-w-md w-full p-8 relative shadow-2xl shadow-black/30">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <X size={24} />
        </button>

        {signupComplete ? (
          <div className="text-center py-4">
            <div className="w-14 h-14 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mx-auto mb-5">
              <svg className="w-7 h-7 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-3 tracking-tight">Check your email</h2>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              We've sent a verification link to <span className="text-white font-medium">{email}</span>.
              Click the link in the email to activate your account and sign in.
            </p>
            <button
              onClick={onClose}
              className="w-full bg-[#B88A12] text-black py-3 rounded-lg font-semibold hover:bg-[#C69214] transition-colors"
            >
              Got it
            </button>
          </div>
        ) : (
        <>

        <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">
          {mode === 'signin' ? 'Welcome Back' : 'Create Your Account'}
        </h2>

        <p className="text-gray-400 mb-6">
          {mode === 'signin'
            ? 'Sign in to access your signals and dashboard.'
            : 'Create an account to see how the system fits your approach.'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div>
              <label
                htmlFor="fullName"
                className="block text-sm font-medium text-gray-300 mb-1"
              >
                Full Name
              </label>
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="w-full px-4 py-3 bg-[#0F172A] border border-[#1F2937] rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:border-cyan-400/50"
                placeholder="John Doe"
              />
            </div>
          )}

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 bg-[#0F172A] border border-[#1F2937] rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:border-cyan-400/50"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-4 py-3 bg-[#0F172A] border border-[#1F2937] rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:border-cyan-400/50"
              placeholder="••••••••"
            />
          </div>

          {mode === 'signin' && (
            <div className="text-right -mt-1">
              <button
                type="button"
                onClick={() => { onClose(); navigate('/forgot-password'); }}
                className="text-gray-500 hover:text-cyan-400 text-xs transition-colors"
              >
                Forgot password?
              </button>
            </div>
          )}

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-300 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#B88A12] text-black py-3 rounded-lg font-semibold hover:bg-[#C69214] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading
              ? 'Loading...'
              : mode === 'signin'
              ? 'Sign In'
              : 'Create Account'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
            className="text-cyan-400 hover:text-cyan-300 text-sm font-medium"
          >
            {mode === 'signup'
  ? 'Already have an account? Sign in'
  : "Don't have an account? Sign up"}
          </button>
        </div>
        </>
        )}
      </div>
    </div>
  );
}