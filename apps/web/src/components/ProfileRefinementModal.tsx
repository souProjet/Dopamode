'use client';

import { useState, useCallback, useMemo } from 'react';
import { Icon } from '@/components/Icons';

export interface RefinementQuestionOption {
  id: string;
  label: string;
}

export interface RefinementQuestionUi {
  id: string;
  prompt: string;
  helpText?: string;
  options: RefinementQuestionOption[];
}

interface ProfileRefinementModalProps {
  questions: RefinementQuestionUi[];
  consentNotice: string;
  onDone: () => void;
}

export function ProfileRefinementModal({
  questions,
  consentNotice,
  onDone,
}: ProfileRefinementModalProps) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [consent, setConsent] = useState(false);
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalSteps = questions.length + 1;
  const isConsentStep = step >= questions.length;
  const currentQuestion = !isConsentStep ? questions[step] : null;
  const progressPct = totalSteps ? ((step + 1) / totalSteps) * 100 : 0;

  const allAnswered = useMemo(
    () => questions.every((q) => answers[q.id]),
    [answers, questions],
  );

  const pickOption = useCallback(
    (qid: string, oid: string, qIndex: number) => {
      const changed = answers[qid] !== oid;
      setAnswers((p) => ({ ...p, [qid]: oid }));
      if (!changed) return;
      if (qIndex < questions.length - 1) {
        window.setTimeout(() => setStep((s) => s + 1), 220);
      } else {
        window.setTimeout(() => setStep(questions.length), 220);
      }
    },
    [answers, questions.length],
  );

  const goBack = useCallback(() => {
    setStep((s) => Math.max(0, s - 1));
    setError(null);
  }, []);

  const submit = async () => {
    if (!allAnswered || !consent) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/profile/refinement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers, consent: true }),
      });
      if (!res.ok) {
        const j = (await res.json().catch(() => ({}))) as { error?: string };
        setError(j.error ?? 'Enregistrement impossible.');
        return;
      }
      onDone();
    } finally {
      setSubmitting(false);
    }
  };

  const skip = async () => {
    setSubmitting(true);
    setError(null);
    try {
      await fetch('/api/profile/refinement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ skip: true }),
      });
      onDone();
    } finally {
      setSubmitting(false);
    }
  };

  const titleId = 'refinement-modal-title';

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end md:items-center justify-center p-3 sm:p-4 motion-safe:animate-modal-fade-slow motion-reduce:animate-none"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <div className="quest-modal-backdrop absolute inset-0 cursor-default" aria-hidden />
      <div
        className="quest-modal-panel relative z-10 flex max-h-[min(88vh,640px)] w-full max-w-lg flex-col overflow-hidden"
      >
        <div className="quest-modal-panel-accent h-1.5" />

        <div className="flex flex-col flex-1 min-h-0 px-5 pt-5 pb-5 sm:px-7 sm:pt-6 sm:pb-6">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="flex items-center gap-2 min-w-0">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[2px] border border-[var(--border-cyan)] bg-[color-mix(in_srgb,var(--violet)_8%,var(--card))]">
                <Icon name="Sparkles" size="lg" className="text-[#0e7490]" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-bold text-[var(--muted)] tracking-wider uppercase truncate">
                  Personnalisation
                </p>
                <h2
                  id={titleId}
                  className="font-display font-bold text-lg sm:text-xl text-gradient-pop leading-tight truncate"
                >
                  Tes préférences
                </h2>
              </div>
            </div>
            <button
              type="button"
              onClick={() => void skip()}
              disabled={submitting}
              className="shrink-0 text-xs font-semibold text-[var(--link-on-bg)] underline underline-offset-2 decoration-[color:color-mix(in_srgb,var(--link-on-bg)_35%,transparent)] hover:opacity-90 disabled:opacity-40"
            >
              Plus tard
            </button>
          </div>

          <div className="mb-4">
            <div className="flex justify-between text-[11px] font-semibold text-[var(--muted)] mb-1.5">
              <span>
                {isConsentStep ? 'Dernière étape' : `Étape ${step + 1} sur ${totalSteps}`}
              </span>
              <span className="tabular-nums text-[var(--text)]">
                {step + 1} / {totalSteps}
              </span>
            </div>
            <div
              className="h-2 rounded-full overflow-hidden"
              style={{ background: 'var(--progress-track)' }}
            >
              <div
                className="h-full rounded-full bg-[var(--violet)] transition-[width] duration-400 ease-out"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>

          <div className="share-sheet-scroll flex-1 min-h-0 overflow-y-auto overflow-x-hidden -mx-1 px-1">
            {!isConsentStep && currentQuestion ? (
              <div
                key={currentQuestion.id}
                className="motion-safe:animate-modal-fade motion-reduce:animate-none rounded-[2px] p-4 sm:p-5 border border-[var(--border-ui)] bg-[var(--card)] shadow-[inset_0_1px_0_rgba(255,255,255,.9)]"
              >
                <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-[var(--violet)] bg-[color-mix(in_srgb,var(--violet)_10%,transparent)] px-2 py-0.5 rounded-full border border-[var(--border-cyan)] mb-3">
                  Question {step + 1}
                </span>
                <p className="text-base sm:text-[17px] font-semibold text-[var(--text)] leading-snug mb-2">
                  {currentQuestion.prompt}
                </p>
                {currentQuestion.helpText ? (
                  <p className="text-xs text-[var(--muted)] mb-4 leading-relaxed">
                    {currentQuestion.helpText}
                  </p>
                ) : (
                  <div className="mb-4" />
                )}
                <div className="grid grid-cols-1 gap-2">
                  {currentQuestion.options.map((opt) => {
                    const sel = answers[currentQuestion.id] === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => pickOption(currentQuestion.id, opt.id, step)}
                        className={[
                          'text-left text-sm px-4 py-3 rounded-lg border transition-all duration-200',
                          'focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--violet)] focus-visible:ring-offset-2',
                          sel
                            ? 'border-[var(--border-cyan)] bg-[color-mix(in_srgb,var(--violet)_8%,var(--card))] text-[var(--text)]'
                            : 'border-[var(--border-ui)] bg-[var(--card)] text-[var(--muted)] hover:border-[var(--border-cyan)] hover:bg-[var(--surface)]',
                        ].join(' ')}
                      >
                        <span className="flex items-start gap-3">
                          <span
                            className={[
                              'mt-0.5 flex h-5 w-5 shrink-0 rounded-full border-2 items-center justify-center',
                              sel ? 'border-[var(--violet)] bg-[var(--violet)]' : 'border-[var(--border-ui-strong)] bg-[var(--input-bg)]',
                            ].join(' ')}
                          >
                            {sel ? <Icon name="Check" size="xs" className="text-white" /> : null}
                          </span>
                          <span className="leading-snug">{opt.label}</span>
                        </span>
                      </button>
                    );
                  })}
                </div>
                <p className="text-[11px] text-center text-[var(--subtle)] mt-4">
                  Un choix t'emmène à l'étape suivante automatiquement
                </p>
              </div>
            ) : (
              <div
                key="consent"
                className="motion-safe:animate-modal-fade motion-reduce:animate-none rounded-[2px] p-5 sm:p-6 border border-[var(--border-ui)] bg-[var(--card)]"
              >
                <div className="text-center mb-4">
                  <span className="inline-flex justify-center" aria-hidden>
                    <Icon name="Lock" size="2xl" className="text-[var(--violet)]" />
                  </span>
                  <p className="text-base font-semibold text-[var(--text)] mt-3">
                    Presque fini
                  </p>
                  <p className="text-sm text-[var(--muted)] mt-1 leading-relaxed">
                    Confirme que tu es d'accord pour qu'on utilise ces préférences pour tes quêtes.
                  </p>
                </div>
                <label className="flex items-start gap-3 p-4 rounded-[2px] cursor-pointer border border-[var(--border-ui)] bg-white/55 backdrop-blur-sm">
                  <input
                    type="checkbox"
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-[var(--border-ui-strong)] text-[var(--green)] focus:ring-[var(--green)]"
                  />
                  <span className="text-xs text-[var(--muted)] leading-relaxed">{consentNotice}</span>
                </label>
              </div>
            )}

            {error ? (
              <p className="text-sm text-[var(--red)] mt-4 text-center font-medium" role="alert">
                {error}
              </p>
            ) : null}
          </div>

          <div className="flex flex-col sm:flex-row gap-2 mt-4 pt-2 border-t border-[var(--border-ui)]/60 shrink-0 items-stretch sm:items-center">
            <button
              type="button"
              onClick={goBack}
              disabled={step === 0 || submitting}
              className="btn btn-ghost btn-md sm:min-w-[8.5rem] disabled:opacity-35"
            >
              <span className="inline-flex items-center justify-center gap-2">← Précédent</span>
            </button>

            {isConsentStep ? (
              <button
                type="button"
                onClick={() => void submit()}
                disabled={!consent || !allAnswered || submitting}
                className="btn btn-md flex-1 text-white transition-all disabled:opacity-40"
                style={{
                  background:
                    consent && allAnswered
                      ? 'linear-gradient(135deg,#c2410c,#92400e)'
                      : 'rgba(15,23,42,.1)',
                  color: consent && allAnswered ? '#fff' : '#64748b',
                  boxShadow: consent && allAnswered ? '0 4px 20px rgba(249,115,22,.35)' : 'none',
                }}
              >
                {submitting ? (
                  <span className="inline-flex items-center justify-center gap-2">
                    <span className="inline-block h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Enregistrement…
                  </span>
                ) : (
                  <span className="inline-flex items-center justify-center gap-2">
                    Enregistrer
                    <Icon name="Check" size="sm" className="opacity-95" />
                  </span>
                )}
              </button>
            ) : (
              <p className="flex-1 text-center text-xs text-[var(--muted)] self-center py-2 px-2 leading-snug">
                Réponds à la question ci-dessus pour passer à la suite
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
