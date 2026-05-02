# Tradinsight — Project Context for Claude Code

## Stack
- React + TypeScript (Vite)
- Supabase (auth, database, realtime)
- Stripe (payments via Edge Functions)
- Tailwind CSS
- Vercel (deployment)
- Live URL: https://tradinsight-iota.vercel.app

## Company
SPARKIN LTD (UK) — operated by Yassine Baraka

## Key Files
- src/components/Dashboard.tsx — main dashboard with signal history
- src/components/LandingPage.tsx — public landing page
- src/components/SubscriptionPage.tsx — plan selection + Stripe
- src/components/SurveyFunnel.tsx — onboarding survey
- src/components/AuthModal.tsx — login/signup modal
- src/contexts/AuthContext.tsx — auth state management
- src/App.tsx — routing and auth flow

## Supabase Tables
- profiles (id, full_name, email, is_premium)
- crypto_signals (id, coin, signal_type, signal_price, status, created_at, analysis)
- survey_responses (user_id, decision_style, timeframe, risk_tolerance, biggest_frustration)
- subscription_plans (id, name, price, features)
- user_subscriptions (user_id, plan_id, status, expires_at)

## Design System
- Background: #0B0F19
- Card background: #121826
- Border: #1F2937
- Gold accent: #D4A017 / #C69214
- Cyan accent: cyan-400
- Font: system sans-serif

## Business Rules
- Free users: signal history visible, latest signal hidden for 1 week
- Premium users: real-time signals, TPI breakdown, full analysis
- Signal history: RAW_SIGNALS (42 signals) and TPI_SIGNALS (27 signals) in Dashboard.tsx
- When new signal fires: add to both arrays and redeploy

## Current Strategy
- APCRAF Strategy — PF 4.54, WR 62.8%, 43 signals since 2018
- Running on BTC/USD Index 1D chart
- Long + Short signals, exits managed by user
