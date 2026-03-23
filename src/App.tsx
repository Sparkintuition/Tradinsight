import { AuthModal } from './components/AuthModal';
import { useState, useEffect } from 'react';
import { useAuth, AuthProvider } from './contexts/AuthContext';
import { LandingPage } from './components/LandingPage';
import { SurveyFunnel } from './components/SurveyFunnel';
import { SubscriptionPage } from './components/SubscriptionPage';
import { Dashboard } from './components/Dashboard';
import { supabase } from './lib/supabase';

type AppFlow = 'landing' | 'survey' | 'subscription' | 'dashboard';
type AuthMode = 'login' | 'signup';

function AppContent() {
  const { user, loading } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>('signup');
  const [flow, setFlow] = useState<AppFlow>('landing');
  const [checkingFlow, setCheckingFlow] = useState(true);

  useEffect(() => {
    if (!loading && user) {
      checkUserFlow();
    } else if (!loading && !user) {
      setFlow('landing');
      setCheckingFlow(false);
    }
  }, [user, loading]);

  const checkUserFlow = async () => {
    if (!user) return;

    try {
      const [surveyResult, subscriptionResult] = await Promise.all([
        supabase
          .from('survey_responses')
          .select('id')
          .eq('user_id', user.id)
          .maybeSingle(),
        supabase
          .from('user_subscriptions')
          .select('id')
          .eq('user_id', user.id)
          .eq('status', 'active')
          .maybeSingle(),
      ]);

      if (!surveyResult.data) {
        setFlow('survey');
      } else if (!subscriptionResult.data) {
        setFlow('subscription');
      } else {
        setFlow('dashboard');
      }
    } catch (error) {
      console.error('Error checking user flow:', error);
    } finally {
      setCheckingFlow(false);
    }
  };

  const handleGetStarted = () => {
    if (user) {
      setFlow('survey');
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
      {flow === 'landing' && (
        <LandingPage
          onGetStarted={handleGetStarted}
          onLogin={() => {
            setAuthMode('login');
            setShowAuthModal(true);
          }}
          onSignup={() => {
            setAuthMode('signup');
            setShowAuthModal(true);
          }}
        />
      )}

      {flow === 'survey' && (
        <SurveyFunnel
          onComplete={() => setFlow('subscription')}
          onBack={() => setFlow('landing')}
        />
      )}

      {flow === 'subscription' && (
        <SubscriptionPage onComplete={() => setFlow('dashboard')} />
      )}

      {flow === 'dashboard' && (
        <Dashboard onUnlockPremium={() => setFlow('subscription')} />
      )}

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
      <AppContent />
    </AuthProvider>
  );
}

export default App;