import { useState, useEffect } from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
} from 'react-router-dom';
import { useAuth, AuthProvider } from './contexts/AuthContext';
import { LandingPage } from './components/LandingPage';
import { AuthModal } from './components/AuthModal';
import { SurveyFunnel } from './components/SurveyFunnel';
import { SubscriptionPage } from './components/SubscriptionPage';
import { Dashboard } from './components/Dashboard';
import { MethodologyPage } from './components/MethodologyPage';
import { TermsPage } from './components/TermsPage';
import { AccountPage } from './components/AccountPage';
import { ForgotPassword } from './components/ForgotPassword';
import { ResetPassword } from './components/ResetPassword';
import { BlogPage } from './components/BlogPage';
import { BlogPost } from './components/BlogPost';
import { supabase } from './lib/supabase';

type AuthMode = 'signin' | 'signup';

function AppRoutes() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>('signup');
  const [checkingFlow, setCheckingFlow] = useState(true);
  // Tracks whether the user intentionally navigated to /survey (back button or retake)
  // When true, skip the "already completed survey → redirect to /subscription" check
  const [surveyIntentional, setSurveyIntentional] = useState(false);

  useEffect(() => {
    const resolveFlow = async () => {
      if (loading) return;

      // Auth pages handle themselves — skip all redirect logic
      if (location.pathname === '/reset-password' || location.pathname === '/forgot-password') {
        setCheckingFlow(false);
        return;
      }

      // Blog pages are always public
      if (location.pathname.startsWith('/blog')) {
        setCheckingFlow(false);
        return;
      }

      // Handle email confirmation callback — two formats Supabase may send:
      //
      // 1. PKCE/token_hash (query param): ?token_hash=...&type=signup
      //    Supabase does NOT auto-process this — requires explicit verifyOtp.
      //
      // 2. Implicit flow (hash fragment): #access_token=...&type=signup
      //    Supabase client auto-processes via detectSessionInUrl, but async.
      //    If user is still null when we reach here, hold the loading state
      //    until onAuthStateChange fires (it will re-trigger this effect).

      // Case 1: token_hash in query string
      const urlParams = new URLSearchParams(window.location.search);
      const tokenHash = urlParams.get('token_hash');
      const urlType = urlParams.get('type');
      if (tokenHash && (urlType === 'signup' || urlType === 'email')) {
        window.history.replaceState({}, '', window.location.pathname);
        const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type: 'email' });
        if (error) setCheckingFlow(false);
        // On success: SIGNED_IN fires → setUser → re-runs → routes to survey/dashboard
        return;
      }

      // Case 2: implicit hash fragment (#access_token=...&type=signup)
      // Supabase processes this automatically; hold the spinner until user is set.
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      if (hashParams.get('access_token') && hashParams.get('type') === 'signup' && !user) {
        // Keep checkingFlow true — onAuthStateChange will fire shortly and re-trigger this effect
        return;
      }

      // Skip routing if user just signed out (flag set in AuthContext)
      const justSignedOut = sessionStorage.getItem('tradinsight_signed_out') === 'true';
      if (justSignedOut && !user) {
        setCheckingFlow(false);
        return;
      }
      if (user) sessionStorage.removeItem('tradinsight_signed_out');

      // On landing page — route logged-in users directly to dashboard
      if (location.pathname === '/') {
        if (user) {
          try {
            const [surveyResult, profileResult] = await Promise.all([
              supabase.from('survey_responses').select('id').eq('user_id', user.id).maybeSingle(),
              supabase.from('profiles').select('is_premium').eq('id', user.id).maybeSingle(),
            ]);
            if (profileResult.data?.is_premium) {
              navigate('/dashboard', { replace: true });
              return;
            } else if (surveyResult.data) {
              // Free user with completed survey — send to dashboard
              navigate('/dashboard', { replace: true });
              return;
            } else {
              // Logged-in but no survey yet — send to survey
              // Covers: post-email-confirmation, post-login for new users
              navigate('/survey', { replace: true });
              return;
            }
          } catch {
            // On error stay on landing
          }
        }
        setCheckingFlow(false);
        return;
      }

      // Not logged in — redirect protected routes to home
      // But allow public auth paths through
      const PUBLIC_PATHS = ['/forgot-password', '/reset-password', '/terms'];
      if (!user) {
        setCheckingFlow(false);
        if (!PUBLIC_PATHS.includes(location.pathname)) {
          navigate('/', { replace: true });
        }
        return;
      }

      try {
        const [surveyResult, profileResult] = await Promise.all([
          supabase
            .from('survey_responses')
            .select('id')
            .eq('user_id', user.id)
            .maybeSingle(),
          supabase
            .from('profiles')
            .select('is_premium')
            .eq('id', user.id)
            .maybeSingle(),
        ]);

        // Premium users can access dashboard, account, methodology, terms, and auth pages freely
        const PREMIUM_ALLOWED = ['/dashboard', '/account', '/methodology', '/terms', '/reset-password', '/forgot-password'];
        if (profileResult.data?.is_premium) {
          if (!PREMIUM_ALLOWED.includes(location.pathname)) {
            navigate('/dashboard', { replace: true });
          }
          return;
        }

        // No survey yet — must complete survey first
        if (!surveyResult.data) {
          if (location.pathname !== '/survey') {
            navigate('/survey', { replace: true });
          }
          return;
        }

        // Free user allowed paths — never redirect away from these
        const FREE_USER_ALLOWED = ['/subscription', '/dashboard', '/account', '/methodology', '/terms', '/reset-password', '/forgot-password'];
        if (FREE_USER_ALLOWED.includes(location.pathname)) {
          return;
        }

        // Survey complete, not premium:
        // - /survey: only allow if user navigated here intentionally (back button / retake)
        if (location.pathname === '/survey' && !surveyIntentional) {
          navigate('/subscription', { replace: true });
          return;
        }

      } catch {
        // Flow resolution failed — leave user on current page
      } finally {
        setCheckingFlow(false);
      }
    };

    resolveFlow();
  }, [user, loading, navigate, location.pathname, surveyIntentional]);

  const handleGetStarted = async () => {
    // Always fetch a live session — never trust React state which may be stale
    const { data: { session: liveSession } } = await supabase.auth.getSession();

    if (!liveSession?.user) {
      // Confirmed not logged in — show signup modal
      setAuthMode('signup');
      setShowAuthModal(true);
      return;
    }

    // Confirmed logged in — route based on their progress
    const uid = liveSession.user.id;
    try {
      const [surveyResult, profileResult] = await Promise.all([
        supabase.from('survey_responses').select('id').eq('user_id', uid).maybeSingle(),
        supabase.from('profiles').select('is_premium').eq('id', uid).maybeSingle(),
      ]);

      if (profileResult.data?.is_premium) {
        navigate('/dashboard');
      } else if (surveyResult.data) {
        navigate('/subscription');
      } else {
        navigate('/survey');
      }
    } catch {
      navigate('/survey');
    }
  };

  if (loading || checkingFlow) {
    return (
      <div className="min-h-screen bg-[#0B0F19] flex items-center justify-center">
        <div className="text-cyan-400 text-xl font-medium">
          Loading Tradinsight...
        </div>
      </div>
    );
  }

  return (
    <>
      <Routes>
        <Route
          path="/"
          element={
            <LandingPage
              onGetStarted={handleGetStarted}
              onLogin={() => {
                setAuthMode('signin');
                setShowAuthModal(true);
              }}
              onSignup={() => {
                setAuthMode('signup');
                setShowAuthModal(true);
              }}
              onMethodology={user ? () => navigate('/methodology') : undefined}
            />
          }
        />

        <Route
          path="/survey"
          element={
            user ? (
              <SurveyFunnel
                onComplete={() => { setSurveyIntentional(false); navigate('/subscription'); }}
                onBack={() => { setSurveyIntentional(false); navigate('/'); }}
                initialStep={(location.state as { initialStep?: number })?.initialStep}
              />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        <Route
          path="/subscription"
          element={user ? <SubscriptionPage onGoHome={() => navigate('/')} onBackToProfile={() => { setSurveyIntentional(true); navigate('/survey', { state: { initialStep: 5 } }); }} /> : <Navigate to="/" replace />}
        />

        <Route
          path="/dashboard"
          element={
            user ? (
              <Dashboard
                onUnlockPremium={() => navigate('/subscription')}
                onMethodology={() => navigate('/methodology')}
                onAccount={() => navigate('/account')}
              />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        <Route
          path="/methodology"
          element={
            user ? (
              <MethodologyPage
                onNavigateDashboard={() => navigate('/dashboard')}
                onUnlockPremium={() => navigate('/subscription')}
              />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        <Route
          path="/terms"
          element={<TermsPage onBack={() => navigate(-1)} />}
        />

        <Route
          path="/account"
          element={
            user ? (
              <AccountPage
                onNavigateDashboard={() => navigate('/dashboard')}
                onUnlockPremium={() => navigate('/subscription')}
                onMethodology={() => navigate('/methodology')}
              />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        <Route path="/forgot-password" element={<ForgotPassword onBack={() => { navigate('/'); setAuthMode('signin'); setShowAuthModal(true); }} />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/blog/:slug" element={<BlogPost />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        initialMode={authMode}
      />
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;