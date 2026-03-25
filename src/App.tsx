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
      if (!user) {
        setCheckingFlow(false);
        if (location.pathname !== '/') {
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

        // Premium users always go to dashboard
        if (profileResult.data?.is_premium) {
          if (location.pathname !== '/dashboard') {
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

        // Survey complete, not premium:
        // - /survey: only allow if user navigated here intentionally (back button / retake)
        // - anything else: allow freely (subscription, dashboard)
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
              <Dashboard onUnlockPremium={() => navigate('/subscription')} />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

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