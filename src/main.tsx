import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Handle Stripe checkout redirects before React mounts so the app never
// gets stuck on the loading screen with ?checkout=cancel or ?checkout=success.
const stripeParams = new URLSearchParams(window.location.search);
const checkoutStatus = stripeParams.get('checkout');
if (checkoutStatus === 'cancel') {
  window.location.replace('/subscription');
} else if (checkoutStatus === 'success') {
  window.location.replace('/dashboard');
} else {
  createRoot(document.getElementById('root')!).render(
    <App />
  );
}
