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
 * L'objet signature de la landing : la fiche de quête du matin, rendue comme
 * un objet posé et non comme un encart.
 *
 * Chaque exemple est une fiche entière — son papier, son bord, son ombre de
 * contact — et les fiches se superposent dans la même case de grille, donc la
 * hauteur suit la plus longue. Changer d'exemple n'est pas un fondu : c'est la
 * fiche du dessus qu'on retire, elle glisse hors de la punaise et découvre la
 * suivante, déjà en place dessous. C'est la promesse du produit jouée
 * littéralement — on tire une quête, on ne change pas d'onglet.
 *
 * `from` porte donc la fiche qui sort, et elle seule est animée : la révélée
 * n'a qu'à se détendre sur place. Une fiche qui monterait par-dessous
 * donnerait deux fiches à moitié empilées en milieu de geste, et deux textes
 * l'un dans l'autre.
 *
 * Les commandes vivent sous le paquet et non dedans : une fiche de carnet ne
 * porte pas de flèches imprimées. Le défilement automatique se suspend au
 * survol et au focus, sinon la fiche est retirée pendant qu'on la lit.
 */
export function QuestExamplesSlider({ quests }: { quests: ExampleQuestSlide[] }) {
  const t = useTranslations('HomePage.hero');
  const n = quests.length;
  /** `from` retient la fiche que l'on retire : elle reste montée, et au-dessus
      du paquet, le temps de sortir du cadre. */
  const [pos, setPos] = useState({ at: 0, from: -1 });
  const [held, setHeld] = useState(false);

  const goTo = useCallback((to: number) => setPos((p) => (to === p.at ? p : { at: to, from: p.at })), []);
  const prev = useCallback(() => setPos((p) => ({ at: (p.at - 1 + n) % n, from: p.at })), [n]);
  const next = useCallback(() => setPos((p) => ({ at: (p.at + 1) % n, from: p.at })), [n]);

  useEffect(() => {
    if (held) return;
    const timer = window.setInterval(next, 6500);
    return () => window.clearInterval(timer);
  }, [held, next]);

  const arrowClass =
    'inline-flex h-9 w-9 shrink-0 items-center justify-center text-lg leading-none text-[var(--subtle)] transition-colors duration-200 hover:text-[var(--text)]';

  return (
    <div
      className="quest-stack"
      onMouseEnter={() => setHeld(true)}
      onMouseLeave={() => setHeld(false)}
      onFocusCapture={() => setHeld(true)}
      onBlurCapture={() => setHeld(false)}
    >
      <div className="quest-deck">
        {/* La punaise : la fiche est posée sur la carte, pas sur la page. */}
        <span className="quest-pin" aria-hidden />
        <span className="quest-stack-ghost quest-stack-ghost--2 deal-ghost-2" aria-hidden />
        <span className="quest-stack-ghost quest-stack-ghost--1 deal-ghost-1" aria-hidden />

        {quests.map((q, idx) => (
          <article
            key={q.title}
            className="quest-slide paper-tooth px-5 py-6 sm:px-6 sm:py-7"
            data-state={idx === pos.at ? 'active' : idx === pos.from ? 'leaving' : 'idle'}
            aria-hidden={idx !== pos.at}
          >
            <p className="carnet-eyebrow">
              {q.contextLabel}
              {q.outdoor ? ` · ${t('exampleOutdoor')}` : ''}
            </p>

            <h3 className="mt-4 flex items-baseline gap-2.5 font-display text-[1.2rem] font-semibold leading-snug tracking-[-0.015em] text-[var(--text)]">
              <Icon
                name={q.icon}
                size="md"
                className="shrink-0 self-center text-[var(--gold)]"
                aria-hidden
              />
              <span className="min-w-0">{q.title}</span>
            </h3>

            <p className="quest-mission mt-4 pl-4 text-[15px] leading-relaxed text-[var(--muted)]">
              {q.mission}
            </p>

            <p className="carnet-meta mt-6 pr-20 text-[13px] uppercase">{q.duration}</p>
          </article>
        ))}

        {/* Le tampon tombe en dernier : c'est la ponctuation de la séquence d'ouverture. */}
        <span
          className="quest-stamp animate-stamp-press [animation-delay:1220ms] motion-reduce:animate-none"
          aria-hidden
        >
          <span>
            {t('stampTop')}
            <br />
            {t('stampBottom')}
          </span>
        </span>
      </div>

      <div className="quest-controls">
        <button type="button" onClick={prev} className={arrowClass} aria-label={t('examplePrev')}>
          <span aria-hidden>←</span>
        </button>
        <div className="flex items-center gap-1">
          {quests.map((q, idx) => (
            <button
              key={q.title}
              type="button"
              onClick={() => goTo(idx)}
              className={`carnet-meta inline-flex h-9 items-center px-2 text-[11px] transition-colors duration-200 ${
                idx === pos.at
                  ? 'text-[var(--text)]'
                  : 'text-[var(--subtle)] hover:text-[var(--muted)]'
              }`}
              aria-label={t('exampleGoTo', { index: idx + 1, total: n })}
              aria-current={idx === pos.at}
            >
              {String(idx + 1).padStart(2, '0')}
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
