import { useState } from 'react';
import {
  ArrowLeft,
  Check,
  AlertTriangle,
  Target,
  Clock,
  Shield,
  Zap,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface SurveyFunnelProps {
  onComplete: () => void;
  onBack: () => void;
  initialStep?: number;
}

function getProfile(
  experienceLevel: string,
  tradingStyle: string,
  riskTolerance: string,
  biggestFrustration: string
) {
  if (tradingStyle === 'day_trader') {
    return {
      fit: 'low',
      title: 'Heads up — this may not be the right fit',
      summary:
        'Tradinsight generates 5–6 high-conviction signals per year. Day traders typically need much higher signal frequency to operate. That said, some day traders use Tradinsight as a macro layer — knowing the bigger trend context before executing shorter-term trades.',
      bullets: [
        'Signals fire every few weeks, not daily',
        'Each signal targets a major BTC trend, not intraday moves',
        'Could work as a macro context layer — knowing the bigger trend before executing shorter positions',
      ],
      cta: 'Start Free and Verify the Track Record',
      color: 'amber',
    };
  }

  if (
    (biggestFrustration === 'too_many_signals' ||
      biggestFrustration === 'bad_signals') &&
    tradingStyle === 'long_term'
  ) {
    return {
      fit: 'high',
      title: "You've been looking for exactly this",
      summary:
        "You've experienced firsthand what happens when you follow too many signals or the wrong ones. Tradinsight is built as the antidote to that: fewer entries, higher conviction, every signal backed by a multi-layer confirmation system.",
      bullets: [
        '5–6 signals per year — only when all conditions align',
        'No noise, no spam — the system waits for genuine setups',
        'TPI confirmation filters out the false positives you have been burned by',
      ],
      cta: 'Access Your Signals',
      color: 'emerald',
    };
  }

  if (
    tradingStyle === 'long_term' &&
    (riskTolerance === 'low' || riskTolerance === 'medium')
  ) {
    return {
      fit: 'high',
      title: 'Strong match — this system was built for you',
      summary:
        "Your profile aligns well with how Tradinsight works. You think in longer timeframes, you value capital protection, and you're not looking for constant activity. That patience is exactly what makes this system effective.",
      bullets: [
        'Low-frequency signals that target major BTC trends',
        'TPI confirmation means you only act when conditions genuinely align',
        'Risk-first approach: protecting capital is the priority, not activity',
      ],
      cta: 'Access Your Signals',
      color: 'emerald',
    };
  }

  if (tradingStyle === 'swing_trader' || experienceLevel === 'advanced') {
    return {
      fit: 'medium',
      title: 'Good fit — with the right expectations',
      summary:
        "Your analytical mindset fits well with a data-driven system. Tradinsight signals are less frequent than swing setups, but when they fire, they're targeting significant BTC moves — the kind that swing traders often miss while managing shorter positions.",
      bullets: [
        'Signals are low-frequency but high-conviction',
        'Works well alongside your existing technical analysis',
        "The TPI gives you macro context most setups don't account for",
      ],
      cta: 'Access Your Signals',
      color: 'cyan',
    };
  }

  return {
    fit: 'medium',
    title: 'This could be exactly what you have been missing',
    summary:
      'If you have been burned by random calls, emotional decisions, or information overload — Tradinsight offers a different model entirely: a rules-based system where every signal has a clear reason, and silence means wait.',
    bullets: [
      'No experience required — signals come with clear reasoning',
      'Free plan lets you verify the track record before committing',
      'Designed to replace noise with disciplined, infrequent action',
    ],
    cta: 'Access Your Signals',
    color: 'cyan',
  };
}

const colorMap = {
  emerald: {
    border: 'border-emerald-500/30',
    badge: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/20',
    check: 'text-emerald-400',
    cardBg: 'rgba(16,185,129,0.05)',
  },
  cyan: {
    border: 'border-cyan-500/30',
    badge: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/20',
    check: 'text-cyan-400',
    cardBg: 'rgba(6,182,212,0.05)',
  },
  amber: {
    border: 'border-amber-500/30',
    badge: 'bg-amber-500/15 text-amber-300 border-amber-500/20',
    check: 'text-amber-400',
    cardBg: 'rgba(245,158,11,0.05)',
  },
};

const TOTAL_STEPS = 5;

export function SurveyFunnel({ onComplete, onBack, initialStep }: SurveyFunnelProps) {
  const savedSurveyState = sessionStorage.getItem('tradinsight_survey_state');
  const parsedSurveyState = savedSurveyState ? JSON.parse(savedSurveyState) : null;

  const [step, setStep] = useState(parsedSurveyState?.step || initialStep || 1);
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const { user } = useAuth();

  const [formData, setFormData] = useState(
    parsedSurveyState?.formData || {
      experienceLevel: '',
      tradingStyle: '',
      riskTolerance: '',
      biggestFrustration: '',
    }
  );

  const saveSurveyState = (currentStep: number, currentFormData = formData) => {
    sessionStorage.setItem(
      'tradinsight_survey_state',
      JSON.stringify({
        step: currentStep,
        formData: currentFormData,
      })
    );
  };

  const clearSurveyState = () => {
    sessionStorage.removeItem('tradinsight_survey_state');
  };

  const decisionStyles = [
    {
      value: 'social',
      label: 'Following tips & signals online',
      description: 'Telegram groups, Twitter calls, influencer picks',
      insight:
        "The problem with social signals isn't just noise — it's that they train you to outsource judgment. Systems win because they remove that dependency entirely.",
    },
    {
      value: 'intuition',
      label: 'Going with my gut',
      description: 'Instinct, feel for the market, emotion-based decisions',
      insight:
        'Crypto markets are designed to fool intuition — fear, greed, and FOMO are the levers that move price. The traders who win consistently follow rules, not feelings.',
    },
    {
      value: 'advanced',
      label: 'Using data and structure',
      description: 'Technical analysis, indicators, rules-based decisions',
      insight:
        'Good foundation. Tradinsight adds the missing layer most systematic traders lack: a macro confirmation filter (TPI) that prevents acting on technically valid signals during unfavorable market conditions.',
    },
    {
      value: 'nothing',
      label: "I haven't found a reliable approach yet",
      description: 'Still searching for something that actually works consistently',
      insight:
        "That's an honest answer — and probably the most common one. A rules-based system with a clear track record is a better starting point than anything built on guesswork.",
    },
  ];

  const tradingStyles = [
    {
      value: 'day_trader',
      label: 'Day Trader',
      description: 'Multiple trades within the same day',
      warning: true,
    },
    {
      value: 'swing_trader',
      label: 'Swing Trader',
      description: 'Holding positions for days or weeks',
      warning: false,
    },
    {
      value: 'long_term',
      label: 'Long-Term Investor',
      description: 'Holding positions for months or years',
      warning: false,
    },
  ];

  const riskTolerances = [
    {
      value: 'low',
      label: 'Capital protection first',
      description: "I'd rather miss a trade than take unnecessary risk",
      icon: <Shield size={18} />,
    },
    {
      value: 'medium',
      label: 'Balanced — risk vs. opportunity',
      description: 'Comfortable with moderate drawdowns for solid returns',
      icon: <Target size={18} />,
    },
    {
      value: 'high',
      label: 'Aggressive growth',
      description: 'I can handle high volatility if the upside is significant',
      icon: <Zap size={18} />,
    },
  ];

  const frustrations = [
    {
      value: 'too_many_signals',
      label: 'Too many signals, too much noise',
      description:
        'Constant alerts that contradict each other — impossible to know what to follow',
    },
    {
      value: 'bad_signals',
      label: 'Followed signals that lost me money',
      description: 'Trusted calls that turned out to be wrong or poorly timed',
    },
    {
      value: 'emotional',
      label: 'My emotions keep overriding my plan',
      description: 'I know what I should do but panic or FOMO takes over',
    },
    {
      value: 'no_system',
      label: "I don't have a consistent system",
      description:
        'Every trade feels like a new decision with no clear framework',
    },
  ];

  const handleSubmit = async () => {
    if (!user) {
      saveSurveyState(TOTAL_STEPS);
      onComplete();
      return;
    }

    setLoading(true);

    try {
      const payload = {
        user_id: user.id,
        experience_level: formData.experienceLevel,
        trading_style: formData.tradingStyle,
        risk_tolerance: formData.riskTolerance,
        biggest_frustration: formData.biggestFrustration,
      };

      const { error } = await supabase
        .from('survey_responses')
        .upsert(payload, { onConflict: 'user_id' });

      if (error) throw error;

      saveSurveyState(TOTAL_STEPS);
      onComplete();
    } catch (error: unknown) {
      setSubmitError(
        error instanceof Error ? error.message : 'Could not save your survey. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const profile =
    step === TOTAL_STEPS
      ? getProfile(
          formData.experienceLevel,
          formData.tradingStyle,
          formData.riskTolerance,
          formData.biggestFrustration
        )
      : null;

  const colors = profile
    ? colorMap[profile.color as keyof typeof colorMap]
    : colorMap.cyan;

  const progressWidth = `${((step - 1) / (TOTAL_STEPS - 1)) * 100}%`;

  const selectedDecisionStyle = decisionStyles.find(
    (d) => d.value === formData.experienceLevel
  );

  return (
    <div className="min-h-screen bg-[#0B0F19] flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="bg-[#121826] rounded-3xl border border-[#1F2937] shadow-2xl shadow-black/30 overflow-hidden">
          <div className="border-b border-[#1F2937] bg-[#0F172A]/80 px-8 py-6">
            <div className="flex items-center justify-between mb-2">
              <button
                type="button"
                onClick={() => {
                  clearSurveyState();
                  onBack();
                }}
                className="text-gray-400 hover:text-white transition-colors flex items-center gap-2 text-sm"
              >
                <ArrowLeft size={16} />
                Back to Home
              </button>

              <div className="flex items-center gap-2">
                <img src="/logo.svg" alt="Tradinsight" className="h-5 w-auto" />
                <span className="text-white font-semibold tracking-tight text-sm">
                  Tradinsight
                </span>
              </div>
            </div>

            <div className="mt-5">
              <div className="flex items-center justify-between mb-2">
                <p className="text-gray-500 text-xs">
                  {step < TOTAL_STEPS
                    ? `Question ${step} of ${TOTAL_STEPS - 1}`
                    : 'Your Result'}
                </p>
                <p className="text-cyan-400 text-xs font-medium tracking-wide uppercase">
                  {step === TOTAL_STEPS
                    ? 'Your Result'
                    : 'Finding Your Fit'}
                </p>
              </div>

              <div className="h-1.5 w-full rounded-full bg-[#0B1220] overflow-hidden">
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
                <div className="mb-7">
                  <p className="text-cyan-400 text-xs font-semibold tracking-widest uppercase mb-2">
                    Question 1 of 4
                  </p>
                  <h2 className="text-2xl font-bold text-white tracking-tight mb-2">
                    How have you been making trading decisions?
                  </h2>
                  <p className="text-gray-400 text-sm">
                    Be honest — this shapes your profile.
                  </p>
                </div>

                <div className="space-y-3">
                  {decisionStyles.map((style) => (
                    <button
                      key={style.value}
                      type="button"
                      onClick={() =>
                        setFormData({ ...formData, experienceLevel: style.value })
                      }
                      className={`w-full p-5 rounded-2xl border text-left transition-all ${
                        formData.experienceLevel === style.value
                          ? 'border-cyan-400 bg-cyan-500/10 shadow-lg shadow-cyan-500/10'
                          : 'border-[#1F2937] bg-[#0F172A]/50 hover:border-cyan-400/40 hover:bg-[#0F172A]'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="text-white font-semibold text-sm mb-1">
                            {style.label}
                          </div>
                          <div className="text-gray-400 text-xs">
                            {style.description}
                          </div>
                        </div>
                        {formData.experienceLevel === style.value && (
                          <Check
                            className="text-cyan-400 mt-0.5 shrink-0"
                            size={18}
                          />
                        )}
                      </div>
                    </button>
                  ))}
                </div>

                {selectedDecisionStyle && (
                  <div className="mt-4 rounded-xl border border-cyan-500/15 bg-cyan-500/5 px-4 py-3">
                    <p className="text-cyan-300 text-xs leading-relaxed">
                      {selectedDecisionStyle.insight}
                    </p>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => setStep(2)}
                  disabled={!formData.experienceLevel}
                  className="w-full mt-6 bg-[#D4A017] text-black py-3.5 rounded-xl font-semibold hover:bg-[#E6B325] transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-sm"
                >
                  Continue
                </button>
              </div>
            )}

            {step === 2 && (
              <div>
                <div className="mb-7">
                  <p className="text-cyan-400 text-xs font-semibold tracking-widest uppercase mb-2">
                    Question 2 of 4
                  </p>
                  <h2 className="text-2xl font-bold text-white tracking-tight mb-2">
                    What's your trading timeframe?
                  </h2>
                  <p className="text-gray-400 text-sm">
                    This determines how well Tradinsight fits your current approach.
                  </p>
                </div>

                <div className="space-y-3">
                  {tradingStyles.map((style) => (
                    <button
                      key={style.value}
                      type="button"
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
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-white font-semibold text-sm">
                              {style.label}
                            </span>
                            {style.warning && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-medium text-amber-400 border border-amber-500/30 bg-amber-500/10 rounded-full px-2 py-0.5">
                                <AlertTriangle size={10} />
                                Low frequency mismatch
                              </span>
                            )}
                          </div>
                          <div className="text-gray-400 text-xs">
                            {style.description}
                          </div>
                        </div>
                        {formData.tradingStyle === style.value && (
                          <Check
                            className="text-cyan-400 mt-0.5 shrink-0"
                            size={18}
                          />
                        )}
                      </div>
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="w-full mt-6 py-3 rounded-xl border border-[#1F2937] text-gray-400 hover:text-white hover:border-cyan-400/30 transition-colors text-sm flex items-center justify-center gap-2"
                >
                  <ArrowLeft size={15} />
                  Back
                </button>
              </div>
            )}

            {step === 3 && (
              <div>
                <div className="mb-7">
                  <p className="text-cyan-400 text-xs font-semibold tracking-widest uppercase mb-2">
                    Question 3 of 4
                  </p>
                  <h2 className="text-2xl font-bold text-white tracking-tight mb-2">
                    How do you think about risk?
                  </h2>
                  <p className="text-gray-400 text-sm">
                    Tradinsight is risk-first by design — every signal comes with this context.
                  </p>
                </div>

                <div className="space-y-3">
                  {riskTolerances.map((risk) => (
                    <button
                      key={risk.value}
                      type="button"
                      onClick={() => {
                        setFormData({ ...formData, riskTolerance: risk.value });
                        setStep(4);
                      }}
                      className={`w-full p-5 rounded-2xl border text-left transition-all ${
                        formData.riskTolerance === risk.value
                          ? 'border-cyan-400 bg-cyan-500/10 shadow-lg shadow-cyan-500/10'
                          : 'border-[#1F2937] bg-[#0F172A]/50 hover:border-cyan-400/40 hover:bg-[#0F172A]'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex gap-3 items-start">
                          <span className="text-cyan-400 mt-0.5 shrink-0">
                            {risk.icon}
                          </span>
                          <div>
                            <div className="text-white font-semibold text-sm mb-1">
                              {risk.label}
                            </div>
                            <div className="text-gray-400 text-xs">
                              {risk.description}
                            </div>
                          </div>
                        </div>
                        {formData.riskTolerance === risk.value && (
                          <Check
                            className="text-cyan-400 mt-0.5 shrink-0"
                            size={18}
                          />
                        )}
                      </div>
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="w-full mt-6 py-3 rounded-xl border border-[#1F2937] text-gray-400 hover:text-white hover:border-cyan-400/30 transition-colors text-sm flex items-center justify-center gap-2"
                >
                  <ArrowLeft size={15} />
                  Back
                </button>
              </div>
            )}

            {step === 4 && (
              <div>
                <div className="mb-7">
                  <p className="text-cyan-400 text-xs font-semibold tracking-widest uppercase mb-2">
                    Question 4 of 4
                  </p>
                  <h2 className="text-2xl font-bold text-white tracking-tight mb-2">
                    What's your biggest trading frustration?
                  </h2>
                  <p className="text-gray-400 text-sm">
                    This is the most common reason people find Tradinsight.
                  </p>
                </div>

                <div className="space-y-3">
                  {frustrations.map((f) => (
                    <button
                      key={f.value}
                      type="button"
                      onClick={() => {
                        const updatedFormData = {
                          ...formData,
                          biggestFrustration: f.value,
                        };
                        setFormData(updatedFormData);
                        saveSurveyState(TOTAL_STEPS, updatedFormData);
                        setStep(TOTAL_STEPS);
                      }}
                      className={`w-full p-5 rounded-2xl border text-left transition-all ${
                        formData.biggestFrustration === f.value
                          ? 'border-cyan-400 bg-cyan-500/10 shadow-lg shadow-cyan-500/10'
                          : 'border-[#1F2937] bg-[#0F172A]/50 hover:border-cyan-400/40 hover:bg-[#0F172A]'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="text-white font-semibold text-sm mb-1">
                            {f.label}
                          </div>
                          <div className="text-gray-400 text-xs">
                            {f.description}
                          </div>
                        </div>
                        {formData.biggestFrustration === f.value && (
                          <Check
                            className="text-cyan-400 mt-0.5 shrink-0"
                            size={18}
                          />
                        )}
                      </div>
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="w-full mt-6 py-3 rounded-xl border border-[#1F2937] text-gray-400 hover:text-white hover:border-cyan-400/30 transition-colors text-sm flex items-center justify-center gap-2"
                >
                  <ArrowLeft size={15} />
                  Back
                </button>
              </div>
            )}

            {step === TOTAL_STEPS && profile && (
              <div>
                <div className="mb-6 text-center">
                  <p className="text-cyan-400 text-xs font-semibold tracking-widest uppercase mb-3">
                    Your Profile Result
                  </p>

                  <div
                    className={`inline-flex items-center gap-2 rounded-full border px-4 py-1.5 mb-4 ${colors.badge}`}
                  >
                    {profile.fit === 'high' && <Check size={12} />}
                    {profile.fit === 'low' && <AlertTriangle size={12} />}
                    {profile.fit === 'medium' && <Clock size={12} />}
                    <span className="text-xs font-semibold">
                      {profile.fit === 'high' && 'Strong fit'}
                      {profile.fit === 'medium' && 'Good fit'}
                      {profile.fit === 'low' && 'Partial fit — read carefully'}
                    </span>
                  </div>

                  <h2 className="text-2xl font-bold text-white tracking-tight mb-3">
                    {profile.title}
                  </h2>
                  <p className="text-gray-400 text-sm leading-relaxed max-w-md mx-auto">
                    {profile.summary}
                  </p>
                </div>

                <div
                  className={`rounded-2xl border ${colors.border} p-5 mb-5`}
                  style={{ backgroundColor: colors.cardBg }}
                >
                  <p className="text-white text-xs font-semibold uppercase tracking-wider mb-3">
                    What this means for you
                  </p>
                  <div className="space-y-2.5">
                    {profile.bullets.map((bullet, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <Check
                          className={`${colors.check} mt-0.5 shrink-0`}
                          size={14}
                        />
                        <p className="text-gray-300 text-sm leading-relaxed">
                          {bullet}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-xl border border-[#1F2937] bg-[#0F172A]/60 px-4 py-3 mb-5 text-center">
                  <p className="text-gray-400 text-xs leading-relaxed">
                    <span className="text-white font-medium">Start free.</span>{' '}
                    Verify 43 signals worth of track record before you commit.
                    No card required.
                  </p>
                </div>

                {submitError && (
                  <div className="flex items-start gap-2.5 bg-rose-500/10 border border-rose-500/20 rounded-xl px-4 py-3 mb-4">
                    <AlertTriangle size={14} className="text-rose-400 shrink-0 mt-0.5" />
                    <p className="text-rose-300 text-xs">{submitError}</p>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading}
                  className="w-full bg-[#D4A017] hover:bg-[#E6B325] text-black py-3.5 rounded-xl font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  {loading ? 'Setting up your account...' : profile.cta}
                </button>

                <button
                  type="button"
                  onClick={() => setStep(4)}
                  className="w-full mt-3 py-2.5 rounded-xl text-gray-500 hover:text-gray-300 transition-colors text-xs flex items-center justify-center gap-2"
                >
                  <ArrowLeft size={13} />
                  Change my answers
                </button>
              </div>
            )}
          </div>
        </div>

        <p className="text-center text-gray-600 text-xs mt-4">
          Not financial advice · Past performance does not guarantee future results
        </p>
      </div>
    </div>
  );
}