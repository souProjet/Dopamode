'use client';

import { useCallback, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Icon } from '@/components/Icons';

export type ExampleQuestSlide = {
  title: string;
  /** Libellé court (style de quête, durée, ambiance) — pas de lieu météo dans le marketing. */
  contextLabel: string;
  mission: string;
  duration: string;
  outdoor: boolean;
  icon: string;
};

/**
 * Extrait de carnet : trois quêtes d'exemple sur un cadre 1px, sans pastille
 * colorée ni ombre portée. Le contexte et la durée sont des lignes de registre,
 * la mission est adossée à un filet doré comme les citations du site.
 */
export function QuestExamplesSlider({ quests }: { quests: ExampleQuestSlide[] }) {
  const t = useTranslations('HomePage.hero');
  const [i, setI] = useState(0);
  const n = quests.length;

  const prev = useCallback(() => setI((x) => (x - 1 + n) % n), [n]);
  const next = useCallback(() => setI((x) => (x + 1) % n), [n]);

  useEffect(() => {
    const timer = window.setInterval(next, 6500);
    return () => window.clearInterval(timer);
  }, [next]);

  const arrowClass =
    'inline-flex h-9 w-9 shrink-0 items-center justify-center text-lg leading-none text-[var(--subtle)] transition-colors duration-200 hover:text-[var(--text)]';

  return (
    <div className="relative w-full border border-[var(--border-ui-strong)] bg-[var(--card)]">
      <div className="overflow-hidden">
        <div
          className="flex transition-transform duration-500 ease-out motion-reduce:transition-none"
          style={{ transform: `translate3d(-${i * 100}%, 0, 0)` }}
        >
          {quests.map((q, idx) => (
            <div key={idx} className="w-full min-w-full shrink-0 px-5 py-6 sm:px-6 sm:py-7">
              <div className="flex items-baseline justify-between gap-4">
                <p className="carnet-eyebrow">
                  {q.contextLabel}
                  {q.outdoor ? ` · ${t('exampleOutdoor')}` : ''}
                </p>
                <p className="carnet-meta shrink-0 text-xs tabular-nums" aria-hidden>
                  {String(idx + 1).padStart(2, '0')} / {String(n).padStart(2, '0')}
                </p>
              </div>

              <h3 className="mt-4 flex items-baseline gap-2.5 font-display text-[1.2rem] font-semibold leading-snug tracking-[-0.015em] text-[var(--text)]">
                <Icon name={q.icon} size="md" className="shrink-0 self-center text-[var(--muted)]" aria-hidden />
                <span className="min-w-0">{q.title}</span>
              </h3>

              <p className="mt-4 border-l-2 border-[var(--gold)] pl-4 text-[15px] leading-relaxed text-[var(--muted)]">
                {q.mission}
              </p>

              <p className="carnet-meta mt-5 text-sm">{q.duration}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-[var(--border-ui)] px-4 py-2 sm:px-5">
        <button type="button" onClick={prev} className={arrowClass} aria-label={t('examplePrev')}>
          <span aria-hidden>←</span>
        </button>
        <div className="flex items-center gap-2">
          {quests.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setI(idx)}
              className="group inline-flex h-9 w-7 items-center justify-center"
              aria-label={t('exampleGoTo', { index: idx + 1, total: n })}
              aria-current={idx === i}
            >
              <span
                className={`h-px w-full transition-colors duration-300 ${
                  idx === i
                    ? 'bg-[var(--violet)]'
                    : 'bg-[var(--border-ui-strong)] group-hover:bg-[var(--subtle)]'
                }`}
              />
            </button>
          ))}
        </div>
        <button type="button" onClick={next} className={arrowClass} aria-label={t('exampleNext')}>
          <span aria-hidden>→</span>
        </button>
      </div>
    </div>
  );
}
