import { useState } from 'react';
import { ArrowLeft, Check, TrendingUp } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface SurveyFunnelProps {
  onComplete: () => void;
  onBack: () => void;
}

export function SurveyFunnel({ onComplete, onBack }: SurveyFunnelProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [insight, setInsight] = useState('');
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    experienceLevel: '',
    tradingStyle: '',
    riskTolerance: '',
  });

  const experienceLevels = [
    {
      value: 'beginner',
      label: 'Following social media signals',
      description: 'Relying on outside opinions and online calls',
    },
    {
      value: 'intermediate',
      label: 'Relying on intuition',
      description: 'Making decisions based on instinct or emotions',
    },
    {
      value: 'advanced',
      label: 'Making logical decisions',
      description: 'Using structure, context, and disciplined thinking',
    },
  ];

  const tradingStyles = [
    {
      value: 'day_trader',
      label: 'Day Trader',
      description: 'Multiple trades within the same day',
    },
    {
      value: 'swing_trader',
      label: 'Swing Trader',
      description: 'Holding positions for days or weeks',
    },
    {
      value: 'long_term',
      label: 'Long-Term Investor',
      description: 'Holding positions for months or years',
    },
  ];

  const riskTolerances = [
    {
      value: 'low',
      label: 'Low Risk',
      description: 'Capital preservation and steady growth',
    },
    {
      value: 'medium',
      label: 'Medium Risk',
      description: 'Balanced approach between safety and opportunity',
    },
    {
      value: 'high',
      label: 'High Risk',
      description: 'Aggressive growth with higher volatility',
    },
  ];

  const handleSubmit = async () => {
    if (!user) {
      alert('Please sign up to save your results and access signals.');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from('survey_responses').insert([
        {
          user_id: user.id,
          experience_level: formData.experienceLevel,
          trading_style: formData.tradingStyle,
          risk_tolerance: formData.riskTolerance,
        },
      ]);

      if (error) throw error;
      onComplete();
    } catch (error) {
      console.error('Error saving survey:', error);
    } finally {
      setLoading(false);
    }
  };

  const progressWidth = `${(step / 4) * 100}%`;

  return (
    <div className="min-h-screen bg-[#0B0F19] flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="bg-[#121826] rounded-3xl border border-[#1F2937] shadow-2xl shadow-black/30 overflow-hidden">
          <div className="border-b border-[#1F2937] bg-[#0F172A]/80 px-8 py-6">
            <div className="flex items-center justify-between gap-4">
              <button
                onClick={onBack}
                className="text-gray-400 hover:text-white transition-colors flex items-center gap-2"
              >
                <ArrowLeft size={18} />
                Back to Home
              </button>

              <div className="flex items-center gap-2">
                <TrendingUp className="text-cyan-400" size={20} />
                <span className="text-white font-semibold tracking-tight">
                  Tradinsight
                </span>
              </div>
            </div>

            <div className="mt-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-gray-400 text-sm">Step {step} of 4</p>
                <p className="text-cyan-400 text-sm font-medium">
                  Signal Profile Setup
                </p>
              </div>

              <div className="h-2 w-full rounded-full bg-[#0B1220] overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-400 transition-all duration-500"
                  style={{ width: progressWidth }}
                />
              </div>
            </div>
          </div>

          <div className="p-8">
            {step === 1 && (
              <div>
                <div className="mb-8">
                  <h2 className="text-3xl font-bold text-white tracking-tight mb-2">
                    How do you usually make trading decisions?
                  </h2>
                  <p className="text-gray-400">
                    Let’s understand how you currently approach the market.
                  </p>
                </div>

                {insight && (
                  <div className="mb-6 rounded-2xl border border-yellow-500/20 bg-yellow-500/10 px-4 py-3">
                    <p className="text-yellow-300 text-sm">{insight}</p>
                  </div>
                )}

                <div className="space-y-4">
                  {experienceLevels.map((level) => (
                    <button
                      key={level.value}
                      onClick={() => {
                        setFormData({ ...formData, experienceLevel: level.value });

                        if (level.value === 'beginner') {
                          setInsight(
                            'Trading based on social media often follows hype and emotion rather than strategy, which can lead to inconsistent results.'
                          );
                        }

                        if (level.value === 'intermediate') {
                          setInsight(
                            'Most traders lose because they rely on instinct instead of structured data and a consistent system.'
                          );
                        }

                        if (level.value === 'advanced') {
                          setInsight(
                            'Using logic is a strong foundation, but the best trading decisions come from combining logic with data and proven systems.'
                          );
                        }
                      }}
                      className={`w-full p-5 rounded-2xl border text-left transition-all ${
                        formData.experienceLevel === level.value
                          ? 'border-cyan-400 bg-cyan-500/10 shadow-lg shadow-cyan-500/10'
                          : 'border-[#1F2937] bg-[#0F172A]/50 hover:border-cyan-400/40 hover:bg-[#0F172A]'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="text-white font-semibold mb-1">
                            {level.label}
                          </div>
                          <div className="text-gray-400 text-sm">
                            {level.description}
                          </div>
                        </div>

                        {formData.experienceLevel === level.value && (
                          <div className="mt-1">
                            <Check className="text-cyan-400" size={20} />
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>

                <div className="mt-6">
                  <button
                    onClick={() => setStep(2)}
                    disabled={!formData.experienceLevel}
                    className="w-full bg-[#D4A017] text-black py-3 rounded-xl font-semibold hover:bg-[#E6B325] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Continue
                  </button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div>
                <div className="mb-8">
                  <h2 className="text-3xl font-bold text-white tracking-tight mb-2">
                    What kind of trader are you?
                  </h2>
                  <p className="text-gray-400">
                    This helps us understand how you interact with the market.
                  </p>
                </div>

                <div className="space-y-4">
                  {tradingStyles.map((style) => (
                    <button
                      key={style.value}
                      onClick={() => {
                        setFormData({ ...formData, tradingStyle: style.value });
                        setStep(3);
                      }}
                      className={`w-full p-5 rounded-2xl border text-left transition-all ${
                        formData.tradingStyle === style.value
                          ? 'border-cyan-400 bg-cyan-500/10 shadow-lg shadow-cyan-500/10'
                          : 'border-[#1F2937] bg-[#0F172A]/50 hover:border-cyan-400/40 hover:bg-[#0F172A]'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="text-white font-semibold mb-1">
                            {style.label}
                          </div>
                          <div className="text-gray-400 text-sm">
                            {style.description}
                          </div>
                        </div>

                        {formData.tradingStyle === style.value && (
                          <div className="mt-1">
                            <Check className="text-cyan-400" size={20} />
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 3 && (
              <div>
                <div className="mb-8">
                  <h2 className="text-3xl font-bold text-white tracking-tight mb-2">
                    How do you usually manage risk?
                  </h2>
                  <p className="text-gray-400">
                    Experienced traders define risk before entering a trade.
                  </p>
                </div>

                <div className="space-y-4">
                  {riskTolerances.map((risk) => (
                    <button
                      key={risk.value}
                      onClick={() => {
                        setFormData({ ...formData, riskTolerance: risk.value });
                        setStep(4);
                      }}
                      disabled={loading}
                      className={`w-full p-5 rounded-2xl border text-left transition-all ${
                        formData.riskTolerance === risk.value
                          ? 'border-cyan-400 bg-cyan-500/10 shadow-lg shadow-cyan-500/10'
                          : 'border-[#1F2937] bg-[#0F172A]/50 hover:border-cyan-400/40 hover:bg-[#0F172A]'
                      } ${loading ? 'opacity-60 cursor-not-allowed' : ''}`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="text-white font-semibold mb-1">
                            {risk.label}
                          </div>
                          <div className="text-gray-400 text-sm">
                            {risk.description}
                          </div>
                        </div>

                        {formData.riskTolerance === risk.value && (
                          <div className="mt-1">
                            <Check className="text-cyan-400" size={20} />
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>

                {loading && (
                  <div className="mt-6 rounded-2xl border border-yellow-500/20 bg-yellow-500/10 px-4 py-3 text-center">
                    <p className="text-yellow-300 text-sm">Saving your profile...</p>
                  </div>
                )}
              </div>
            )}

            {step === 4 && (
  <div>
    <div className="mb-6 text-center">
      <h2 className="text-3xl font-bold text-white tracking-tight mb-3">
        How Tradinsight Works
      </h2>

      <p className="text-gray-400 text-sm md:text-base max-w-xl mx-auto leading-relaxed">
        A structured system designed to identify high-probability BTC opportunities
        while minimizing unnecessary risk.
      </p>
    </div>

    <div className="rounded-2xl border border-[#1F2937] bg-[#0F172A]/60 p-6 mb-6">
      <div className="space-y-3">
        {[
          'Uses multiple indicators (ADX, CCI, volatility, and more)',
          'Combines technical signals with macro context (TPI)',
          'Identifies high-probability long and short setups',
          'Prioritizes risk reduction over frequent trading',
          'Fewer signals. Better opportunities. Less noise.',
        ].map((item, i) => (
          <div key={i} className="flex items-start gap-3">
            <Check className="text-emerald-400 mt-[2px] shrink-0" size={16} />
            <p className="text-gray-300 text-sm leading-relaxed">{item}</p>
          </div>
        ))}
      </div>
    </div>


    <button
      onClick={handleSubmit}
      className="w-full bg-[#B88A12] text-black py-3 rounded-xl font-semibold hover:bg-[#C69214] transition-colors"
    >
      Unlock BTC Signals
    </button>
  </div>
)}

            <div className="flex gap-4 mt-8">
              {step > 1 && !loading && (
                <button
                  onClick={() => setStep(step - 1)}
                  className="flex-1 py-3 rounded-xl border border-[#1F2937] text-white font-semibold hover:border-cyan-400/40 hover:bg-[#0F172A] transition-colors flex items-center justify-center gap-2"
                >
                  <ArrowLeft size={18} />
                  Back
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}