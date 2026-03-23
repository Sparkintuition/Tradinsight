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

  useEffect(() => {
    const resolveFlow = async () => {
      if (loading) return;

      if (!user) {
        setCheckingFlow(false);

        if (
          location.pathname === '/survey' ||
          location.pathname === '/subscription' ||
          location.pathname === '/dashboard'
        ) {
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

        if (!surveyResult.data) {
          if (location.pathname !== '/survey') {
            navigate('/survey', { replace: true });
          }
        } else if (profileResult.data?.is_premium) {
          if (location.pathname !== '/dashboard') {
            navigate('/dashboard', { replace: true });
          }
        } else {
          // free users can still access subscription page or dashboard
          if (
            location.pathname !== '/subscription' &&
            location.pathname !== '/dashboard'
          ) {
            navigate('/subscription', { replace: true });
          }
        }
      } catch (error) {
        console.error('Error checking user flow:', error);
        if (location.pathname !== '/') {
          navigate('/', { replace: true });
        }
      } finally {
        setCheckingFlow(false);
      }
    };

    resolveFlow();
  }, [user, loading, navigate, location.pathname]);

  const handleGetStarted = () => {
    if (user) {
      navigate('/survey');
    } else {
      setAuthMode('signup');
      setShowAuthModal(true);
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
                onComplete={() => navigate('/subscription')}
                onBack={() => navigate('/')}
              />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        <Route
          path="/subscription"
          element={user ? <SubscriptionPage /> : <Navigate to="/" replace />}
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