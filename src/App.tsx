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
  const [afterAuthRedirect, setAfterAuthRedirect] = useState<string | null>(null);

  useEffect(() => {
    const resolveFlow = async () => {
      if (loading) return;

      if (!user) {
        setCheckingFlow(false);
        return;
      }

      try {
        const { data: profileResult } = await supabase
          .from('profiles')
          .select('is_premium')
          .eq('id', user.id)
          .maybeSingle();

        if (profileResult?.is_premium && location.pathname !== '/dashboard') {
          navigate('/dashboard', { replace: true });
        }
      } catch (error) {
        console.error('Error checking user flow:', error);
      } finally {
        setCheckingFlow(false);
      }
    };

    resolveFlow();
  }, [user, loading, navigate, location.pathname]);

  useEffect(() => {
    if (user && afterAuthRedirect) {
      setShowAuthModal(false);
      navigate(afterAuthRedirect);
      setAfterAuthRedirect(null);
    }
  }, [user, afterAuthRedirect, navigate]);

  const handleGetStarted = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user) {
      setAuthMode('signup');
      setAfterAuthRedirect('/survey');
      setShowAuthModal(true);
      return;
    }

    navigate('/survey');
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setAfterAuthRedirect(null);
    setShowAuthModal(false);
    navigate('/');
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
              user={user}
              onGetStarted={handleGetStarted}
              onLogin={() => {
                setAuthMode('signin');
                setShowAuthModal(true);
              }}
              onSignup={() => {
                setAuthMode('signup');
                setShowAuthModal(true);
              }}
              onLogout={handleLogout}
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
          element={
            user ? (
              <SubscriptionPage
                onComplete={() => navigate('/dashboard')}
                onGoHome={() => navigate('/')}
                onBackToProfile={() => navigate('/survey')}
              />
            ) : (
              <Navigate to="/" replace />
            )
          }
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
        onClose={() => {
          setShowAuthModal(false);
          setAfterAuthRedirect(null);
        }}
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