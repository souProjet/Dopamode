'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

/** Répartition des étapes en trois « étages » du pipeline (schéma). */
function flowPhase(stepIndex: number, total: number): 0 | 1 | 2 {
  if (total <= 0) return 0;
  const third = total / 3;
  if (stepIndex < third) return 0;
  if (stepIndex < 2 * third) return 1;
  return 2;
}

export type QuestFlowStep = { title: string; body: string };

type Props = { stepsList: QuestFlowStep[] };

/**
 * Registre « carnet de route » comme la landing : le pipeline se lit en colonne,
 * numéroté en marge et scandé par un filet à chaque changement de phase. Pas de
 * frise alternée, pas de pastilles dégradées, pas d'ombres portées : c'est la
 * typographie qui porte la hiérarchie.
 */
export function QuestGenerationExplainer({ stepsList }: Props) {
  const t = useTranslations('QuestGenerationPage');
  const steps = stepsList;
  const phaseLabels = [t('flowPhaseMemory'), t('flowPhaseIntent'), t('flowPhaseDelivery')] as const;

  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="mx-auto w-full max-w-6xl px-5 pb-16 pt-10 outline-none sm:px-8 sm:pb-24 sm:pt-14"
    >
      <header className="max-w-[46rem]">
        <p className="carnet-eyebrow">
          <Link href="/" className="transition-colors hover:text-[var(--text)]">
            {t('backHome')}
          </Link>
        </p>
        <h1 className="mt-4 font-display text-[clamp(1.9rem,3.4vw+1rem,2.9rem)] font-semibold leading-[1.06] tracking-[-0.03em] text-balance text-[var(--text)]">
          {t('title')}
        </h1>
        <p className="mt-5 text-base leading-[1.65] text-[var(--muted)] sm:text-lg">{t('lead')}</p>
      </header>

      {/* Sommaire des trois étages, en tableau et non en pastilles. */}
      <section className="carnet-rule mt-12 pt-6" aria-label={t('schematicPipeline')}>
        <p className="carnet-eyebrow">{t('schematicPipeline')}</p>
        <ol className="mt-4 grid gap-x-10 gap-y-3 sm:grid-cols-3">
          {phaseLabels.map((label, i) => (
            <li key={`phase-${i}`} className="flex items-baseline gap-3">
              <span className="carnet-numeral text-[1.4rem]" aria-hidden>
                {String(i + 1).padStart(2, '0')}
              </span>
              <span className="font-display text-base font-semibold tracking-[-0.01em] text-[var(--text)]">
                {label}
              </span>
            </li>
          ))}
        </ol>
      </section>

      {steps.length === 0 ? (
        <p className="mt-12 border-l-2 border-[var(--gold)] px-4 py-3 text-sm text-[var(--muted)]">
          {t('stepsLoadError')}
        </p>
      ) : (
        <div className="mt-12" role="region" aria-label={t('diagramAria')}>
          {steps.map((step, i) => {
            const phase = flowPhase(i, steps.length);
            const startsPhase = i === 0 || flowPhase(i - 1, steps.length) !== phase;
            return (
              <article
                key={`quest-flow-${i}`}
                className={
                  startsPhase
                    ? 'carnet-rule border-t-[var(--border-ui-strong)] pt-8 first:pt-0 first:border-t-0'
                    : 'carnet-rule pt-8'
                }
              >
                {startsPhase ? (
                  <p className="carnet-eyebrow mb-7">{phaseLabels[phase]}</p>
                ) : null}
                <div className="flex gap-5 pb-8 sm:gap-8">
                  <span className="carnet-numeral shrink-0 text-[2.2rem] sm:text-[2.75rem]" aria-hidden>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div className="min-w-0 max-w-[46rem]">
                    <h2 className="font-display text-lg font-semibold leading-snug tracking-[-0.01em] text-[var(--text)] sm:text-xl">
                      {step.title}
                    </h2>
                    <p className="mt-2.5 text-[15px] leading-[1.7] text-[var(--muted)] sm:text-base">
                      {step.body}
                    </p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <section className="carnet-rule mt-6 pt-8">
        <div className="max-w-[46rem] border-l-2 border-[var(--violet)] pl-5 sm:pl-6">
          <h2 className="font-display text-lg font-semibold tracking-[-0.01em] text-[var(--text)]">
            {t('noteTitle')}
          </h2>
          <p className="mt-3 text-[15px] leading-[1.7] text-[var(--muted)] sm:text-base">
            {t('noteBody')}
          </p>
          <p className="mt-4 text-[15px] leading-[1.7] text-[var(--muted)] sm:text-base">
            {t('privacyNote')}
          </p>
          <p className="mt-5 text-sm">
            <Link
              href="/legal/confidentialite"
              className="font-semibold text-[var(--link-on-bg)] underline underline-offset-4"
            >
              {t('privacyLink')}
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
