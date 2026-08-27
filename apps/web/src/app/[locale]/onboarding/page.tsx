'use client';

import { useState, useEffect } from 'react';
import { AnalyticsEvent } from '@/lib/analytics/events';
import { trackAnalyticsEvent } from '@/lib/analytics/track';
import { Link, useRouter } from '@/i18n/navigation';
import { QuestiaLogo } from '@/components/QuestiaLogo';
import type { ExplorerAxis, RiskAxis, SociabilityLevel } from '@questia/shared';

// ── Questions ─────────────────────────────────────────────────────────────────

const Q1_OPTIONS = [
  { id: 'homebody' as ExplorerAxis, title: 'Je reste au chaud.', desc: 'Coco, série, zéro galère.' },
  { id: 'explorer' as ExplorerAxis, title: 'Je pars explorer.', desc: "Nouveaux spots, imprévus, j'adore." },
];

const Q2_OPTIONS = [
  { id: 'cautious' as RiskAxis, title: 'Je prépare, je planifie.', desc: 'Quand ça se passe comme prévu : top.' },
  { id: 'risktaker' as RiskAxis, title: "J'improvise, je fonce.", desc: 'Plan foiré = souvent le meilleur moment.' },
];

const Q3_OPTIONS = [
  { id: 'solitary' as SociabilityLevel, title: 'Plutôt solo.', desc: 'Mon énergie, je la garde pour moi.' },
  { id: 'balanced' as SociabilityLevel, title: 'Ça dépend.', desc: 'Un mélange des deux, selon le moment.' },
  { id: 'social' as SociabilityLevel, title: 'Très sociable.', desc: 'Parler, échanger, ça me booste.' },
];

const PROFILE_RESULTS: Record<string, { label: string; desc: string }> = {
  explorer_risktaker: { label: "L'Aventurier", desc: 'Quêtes nerveuses, souvent dehors.' },
  explorer_cautious: { label: "L'Explorateur cool", desc: 'Belles sorties, zéro chaos.' },
  homebody_risktaker: { label: 'Le Fou du salon', desc: 'Surprise… mais chez toi.' },
  homebody_cautious: { label: 'Le Zen', desc: 'Doucement, sûrement.' },
};

// ── Primitives « carnet » ─────────────────────────────────────────────────────

/** Lien discret sous une liste de choix (revenir, passer). */
const QUIET_LINK =
  'text-sm font-medium text-[var(--link-on-bg)] underline decoration-[color:color-mix(in_srgb,var(--link-on-bg)_35%,transparent)] underline-offset-[0.2em] transition-colors duration-200 hover:text-[var(--text)]';

function StepHeading({ index, eyebrow, title, lead }: { index: number; eyebrow: string; title: string; lead: string }) {
  return (
    <>
      <p className="carnet-eyebrow">
        {String(index).padStart(2, '0')} / 03 · {eyebrow}
      </p>
      <h1 className="mt-4 text-balance font-display text-[clamp(1.75rem,3vw+1rem,2.35rem)] font-semibold leading-[1.1] tracking-[-0.025em] text-[var(--text)]">
        {title}
      </h1>
      <p className="mt-4 text-[15px] leading-relaxed text-[var(--muted)]">{lead}</p>
    </>
  );
}

/**
 * Liste de choix en registre imprimé : lettre sérif en marge, filets 1px, aucun
 * aplat coloré. La rangée entière est cliquable ; le survol pose un aplat neutre.
 */
function ChoiceList<T extends string>({
  options,
  onSelect,
}: {
  options: readonly { id: T; title: string; desc: string }[];
  onSelect: (id: T) => void;
}) {
  return (
    <div className="carnet-rule -mx-3 mt-9">
      {options.map((o, idx) => (
        <button
          key={o.id}
          type="button"
          onClick={() => onSelect(o.id)}
          className="group flex w-full items-start gap-5 border-b border-[var(--border-ui)] px-3 py-6 text-left transition-colors duration-200 hover:bg-[var(--surface)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:color-mix(in_srgb,var(--violet)_45%,transparent)]"
        >
          <span className="carnet-numeral shrink-0 pt-0.5 text-[1.8rem]" aria-hidden>
            {String.fromCharCode(65 + idx)}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block font-medium text-[var(--text)]">{o.title}</span>
            <span className="mt-1.5 block text-sm leading-relaxed text-[var(--muted)]">{o.desc}</span>
          </span>
          <span
            className="shrink-0 self-center text-[var(--subtle)] transition-transform duration-200 group-hover:translate-x-1"
            aria-hidden
          >
            →
          </span>
        </button>
      ))}
    </div>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<0 | 1 | 2 | 3>(0);
  const [explorer, setExplorer] = useState<ExplorerAxis | null>(null);
  const [risk, setRisk] = useState<RiskAxis | null>(null);
  const [sociability, setSociability] = useState<SociabilityLevel | null>(null);
  const [saving, setSaving] = useState(false);

  const profileKey = explorer && risk ? `${explorer}_${risk}` : null;
  const profile = profileKey ? PROFILE_RESULTS[profileKey] : null;

  useEffect(() => {
    trackAnalyticsEvent(AnalyticsEvent.onboardingStarted);
  }, []);

  const handleQ1 = (v: ExplorerAxis) => {
    setExplorer(v);
    setStep(1);
    trackAnalyticsEvent(AnalyticsEvent.onboardingStepCompleted, {
      step_name: 'explorer_axis',
      step_index: 0,
    });
  };
  const handleQ2 = (v: RiskAxis) => {
    setRisk(v);
    setStep(2);
    trackAnalyticsEvent(AnalyticsEvent.onboardingStepCompleted, {
      step_name: 'risk_axis',
      step_index: 1,
    });
  };
  const handleQ3 = (v: SociabilityLevel) => {
    setSociability(v);
    setStep(3);
    trackAnalyticsEvent(AnalyticsEvent.onboardingStepCompleted, {
      step_name: 'sociability',
      step_index: 2,
    });
  };
  const skipQ3 = () => {
    setSociability(null);
    setStep(3);
  };

  const handleFinish = () => {
    if (!explorer || !risk) return;
    setSaving(true);
    trackAnalyticsEvent(AnalyticsEvent.onboardingCompleted, {
      explorer_axis: explorer,
      risk_axis: risk,
      sociability: sociability ?? 'skipped',
    });
    if (typeof window !== 'undefined') {
      localStorage.setItem('questia_explorer', explorer);
      localStorage.setItem('questia_risk', risk);
      if (sociability) localStorage.setItem('questia_sociability', sociability);
    }
    window.setTimeout(() => {
      router.push('/sign-up');
    }, 50);
  };

  /** Lignes de synthèse du récap : numérotées comme des entrées de carnet. */
  const recapLines = [
    explorer === 'explorer' ? 'Tu aimes explorer et bouger.' : 'Tu aimes ta routine et ton espace.',
    risk === 'risktaker' ? "Tu fonces dans l'inconnu." : 'Tu préfères ce qui est rassurant.',
    ...(sociability
      ? [
          sociability === 'solitary'
            ? 'Tu recharges mieux en solo.'
            : sociability === 'social'
              ? 'Tu te nourris du contact.'
              : 'Tu alternes solo et social.',
        ]
      : []),
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <main
        id="main-content"
        tabIndex={-1}
        className="mx-auto w-full max-w-[38rem] flex-1 px-5 py-10 outline-none sm:px-8 sm:py-14"
      >
        {/* En-tête : marque à gauche, position dans le tunnel à droite */}
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="inline-flex items-center gap-2.5 transition-opacity duration-200 hover:opacity-70">
            <QuestiaLogo variant="footer" priority />
            <span className="font-display text-lg font-semibold tracking-[-0.02em] text-[var(--text)]">Questia</span>
          </Link>
          <span className="carnet-eyebrow">{step < 3 ? `Étape ${step + 1} sur 3` : 'Résultat'}</span>
        </div>

        {/* Progression : trois filets, pleins pour les étapes validées */}
        <div
          className="mt-7 flex gap-3"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={3}
          aria-valuenow={Math.min(step, 3)}
          aria-label="Progression du questionnaire"
        >
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="h-[2px] flex-1 transition-colors duration-500 ease-out"
              style={{
                backgroundColor:
                  step > i
                    ? 'var(--violet)'
                    : step === i
                      ? 'color-mix(in srgb, var(--violet) 40%, transparent)'
                      : 'var(--border-ui-strong)',
              }}
            />
          ))}
        </div>

        {/* ── Étape 0 ── */}
        {step === 0 && (
          <div className="mt-12 motion-safe:animate-onboarding-step motion-reduce:animate-none">
            <StepHeading index={1} eyebrow="Ton rythme" title="Dimanche libre, tu fais quoi ?" lead="Trois questions courtes, la dernière est optionnelle. Elles décident du ton de tes quêtes." />
            <ChoiceList options={Q1_OPTIONS} onSelect={handleQ1} />
          </div>
        )}

        {/* ── Étape 1 ── */}
        {step === 1 && (
          <div className="mt-12 motion-safe:animate-onboarding-step motion-reduce:animate-none">
            <StepHeading index={2} eyebrow="L'imprévu" title="Plan foiré, tu réagis comment ?" lead="Ce qui arrive quand rien ne se passe comme prévu." />
            <ChoiceList options={Q2_OPTIONS} onSelect={handleQ2} />
            <button type="button" onClick={() => setStep(0)} className={`${QUIET_LINK} mt-7`}>
              ← Revenir
            </button>
          </div>
        )}

        {/* ── Étape 2 : sociabilité (optionnelle) ── */}
        {step === 2 && (
          <div className="mt-12 motion-safe:animate-onboarding-step motion-reduce:animate-none">
            <StepHeading index={3} eyebrow="Ton énergie sociale" title="En soirée, t'es comment ?" lead="Optionnel : passe cette question si tu préfères." />
            <ChoiceList options={Q3_OPTIONS} onSelect={handleQ3} />
            <div className="mt-7 flex items-center gap-6">
              <button type="button" onClick={skipQ3} className={QUIET_LINK}>
                Passer →
              </button>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-sm font-medium text-[var(--subtle)] transition-colors duration-200 hover:text-[var(--text)]"
              >
                ← Revenir
              </button>
            </div>
          </div>
        )}

        {/* ── Étape 3 : récapitulatif ── */}
        {step === 3 && profile && (
          <div
            className="mt-12 motion-safe:animate-onboarding-step motion-reduce:animate-none"
            role="region"
            aria-label="Ton profil Questia"
          >
            <p className="carnet-eyebrow">Profil établi</p>
            <h1 className="mt-4 text-balance font-display text-[clamp(1.9rem,3.4vw+1rem,2.6rem)] font-semibold leading-[1.08] tracking-[-0.025em] text-[var(--text)]">
              {profile.label}
            </h1>
            <p className="mt-4 text-[15px] leading-relaxed text-[var(--muted)]">{profile.desc}</p>

            <section className="carnet-rule mt-11 pt-7">
              <p className="carnet-eyebrow">Ce qu&apos;on retient</p>
              <ul className="mt-6">
                {recapLines.map((line, i) => (
                  <li
                    key={line}
                    className="flex items-baseline gap-5 border-b border-[var(--border-ui)] py-4 first:border-t"
                  >
                    <span className="carnet-numeral shrink-0 text-[1.4rem]" aria-hidden>
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span className="text-[15px] leading-relaxed text-[var(--text)]">{line}</span>
                  </li>
                ))}
              </ul>
            </section>

            <p className="mt-9 border-l-2 border-[var(--gold)] pl-4 text-[15px] leading-relaxed text-[var(--muted)]">
              Chaque matin, des quêtes calées sur ce profil. Il reste modifiable à tout moment.
            </p>

            <button
              type="button"
              onClick={handleFinish}
              disabled={saving}
              className="btn btn-cta mt-9 w-full rounded-lg px-7 py-3.5 text-[15px] disabled:opacity-60"
            >
              {saving ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Patience…
                </span>
              ) : (
                'Créer mon compte'
              )}
            </button>

            <button type="button" onClick={() => setStep(2)} className={`${QUIET_LINK} mt-6`}>
              ← Modifier mes réponses
            </button>
          </div>
        )}

        {/* Lien connexion — toujours visible */}
        <p className="mt-10 text-sm text-[var(--muted)]">
          Déjà un compte ?{' '}
          <Link
            href="/sign-in"
            className="font-medium text-[var(--link-on-bg)] underline decoration-[color:color-mix(in_srgb,var(--link-on-bg)_35%,transparent)] underline-offset-[0.2em] transition-colors duration-200 hover:text-[var(--text)]"
          >
            Se connecter
          </Link>
        </p>
      </main>
    </div>
  );
}
