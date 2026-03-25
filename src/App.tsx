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
            }
            // No survey yet — stay on landing, let them click CTA
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

      } catch (error) {
        console.error('Error checking user flow:', error);
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

        <Route path="/forgot-password" element={<ForgotPassword onBack={() => { setShowAuthModal(true); setAuthMode('signin'); }} />} />
        <Route path="/reset-password" element={<ResetPassword />} />
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