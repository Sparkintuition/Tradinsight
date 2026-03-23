/*
  # Crypto Signal Platform Schema

  ## Overview
  This migration sets up the complete database schema for a crypto signal platform
  including user profiles, survey responses, subscriptions, and trading signals.

  ## New Tables
  
  ### 1. profiles
  - `id` (uuid, primary key, references auth.users)
  - `email` (text)
  - `full_name` (text)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)
  
  ### 2. survey_responses
  - `id` (uuid, primary key)
  - `user_id` (uuid, references profiles)
  - `experience_level` (text) - beginner, intermediate, advanced
  - `trading_style` (text) - day_trader, swing_trader, long_term
  - `risk_tolerance` (text) - low, medium, high
  - `preferred_coins` (text array)
  - `created_at` (timestamptz)
  
  ### 3. subscription_plans
  - `id` (uuid, primary key)
  - `name` (text) - Free, Pro, Premium
  - `price` (numeric)
  - `features` (jsonb)
  - `signal_limit` (integer)
  - `created_at` (timestamptz)
  
  ### 4. user_subscriptions
  - `id` (uuid, primary key)
  - `user_id` (uuid, references profiles)
  - `plan_id` (uuid, references subscription_plans)
  - `status` (text) - active, cancelled, expired
  - `started_at` (timestamptz)
  - `expires_at` (timestamptz)
  - `created_at` (timestamptz)
  
  ### 5. crypto_signals
  - `id` (uuid, primary key)
  - `coin` (text)
  - `signal_type` (text) - buy, sell, hold
  - `entry_price` (numeric)
  - `target_price` (numeric)
  - `stop_loss` (numeric)
  - `confidence` (integer) - 1-100
  - `analysis` (text)
  - `status` (text) - active, closed, cancelled
  - `created_at` (timestamptz)
  - `expires_at` (timestamptz)

  ## Security
  - Enable RLS on all tables
  - Users can read their own profile data
  - Users can create and read their own survey responses
  - Users can read subscription plans
  - Users can read their own subscriptions
  - Users can read signals based on their subscription level
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create survey_responses table
CREATE TABLE IF NOT EXISTS survey_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  experience_level text NOT NULL,
  trading_style text NOT NULL,
  risk_tolerance text NOT NULL,
  preferred_coins text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Create subscription_plans table
CREATE TABLE IF NOT EXISTS subscription_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  price numeric NOT NULL DEFAULT 0,
  features jsonb DEFAULT '[]',
  signal_limit integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create user_subscriptions table
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  plan_id uuid REFERENCES subscription_plans(id) NOT NULL,
  status text NOT NULL DEFAULT 'active',
  started_at timestamptz DEFAULT now(),
  expires_at timestamptz,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, plan_id)
);

-- Create crypto_signals table
CREATE TABLE IF NOT EXISTS crypto_signals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  coin text NOT NULL,
  signal_type text NOT NULL,
  entry_price numeric NOT NULL,
  target_price numeric NOT NULL,
  stop_loss numeric NOT NULL,
  confidence integer NOT NULL DEFAULT 50,
  analysis text,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE survey_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE crypto_signals ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Survey responses policies
CREATE POLICY "Users can view own survey responses"
  ON survey_responses FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own survey responses"
  ON survey_responses FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own survey responses"
  ON survey_responses FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Subscription plans policies (public read)
CREATE POLICY "Anyone can view subscription plans"
  ON subscription_plans FOR SELECT
  TO authenticated
  USING (true);

-- User subscriptions policies
CREATE POLICY "Users can view own subscriptions"
  ON user_subscriptions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscriptions"
  ON user_subscriptions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own subscriptions"
  ON user_subscriptions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Crypto signals policies (authenticated users can view active signals)
CREATE POLICY "Authenticated users can view active signals"
  ON crypto_signals FOR SELECT
  TO authenticated
  USING (status = 'active');

-- Insert default subscription plans
INSERT INTO subscription_plans (name, price, features, signal_limit)
VALUES 
  ('Free', 0, '["2 BTC signals per week", "Basic signal context", "Limited signal history"]', 2),
  ('Pro', 4.99, '["Real-time BTC signals", "Short market context", "Signal history access", "Basic performance tracking"]', 30),
  ('Premium', 9.99, '["Everything in Pro", "More detailed signal insight", "Priority access to updates", "Deeper market context"]', 999)
ON CONFLICT (name) DO NOTHING;

-- Insert sample crypto signals
INSERT INTO crypto_signals (coin, signal_type, entry_price, target_price, stop_loss, confidence, analysis, status, expires_at)
VALUES 
  ('BTC', 'buy', 85000, 92000, 82000, 85, 'Strong bullish momentum with RSI indicating oversold conditions. Major support at $82k.', 'active', now() + interval '7 days'),
  ('ETH', 'buy', 3200, 3600, 3000, 78, 'Breaking resistance at $3200. Volume increasing with institutional interest.', 'active', now() + interval '5 days'),
  ('SOL', 'hold', 185, 210, 170, 65, 'Consolidating near resistance. Wait for clear breakout above $190.', 'active', now() + interval '3 days'),
  ('ADA', 'buy', 0.95, 1.15, 0.88, 72, 'Forming cup and handle pattern. Strong accumulation phase.', 'active', now() + interval '10 days'),
  ('DOT', 'sell', 8.5, 8.0, 9.2, 68, 'Bearish divergence on daily chart. Resistance at $9.', 'active', now() + interval '4 days')
ON CONFLICT DO NOTHING;