'use client';

import { Link } from '@/i18n/navigation';
import { QuestiaLogo } from '@/components/QuestiaLogo';

type AppErrorViewProps = {
  reset: () => void;
  eyebrow?: string;
  title?: string;
  description?: string;
  retryLabel?: string;
  homeLabel?: string;
};

/**
 * UI d'erreur partagée entre `error.tsx` et `global-error.tsx`, en registre
 * « carnet de route » : même mesure et mêmes filets que l'onboarding et
 * l'authentification, aucun panneau flottant. Ni navbar ni pied de page —
 * le layout peut justement être ce qui a échoué.
 */
export function AppErrorView({
  reset,
  eyebrow = 'Incident technique',
  title = 'Un problème est survenu',
  description = "Quelque chose s'est mal passé. Tu peux réessayer ou retourner à l'accueil.",
  retryLabel = 'Réessayer',
  homeLabel = 'Accueil',
}: AppErrorViewProps) {
  return (
    <div className="flex min-h-[100dvh] flex-col">
      <main className="mx-auto w-full max-w-[38rem] flex-1 px-5 py-10 sm:px-8 sm:py-14">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="inline-flex items-center gap-2.5 transition-opacity duration-200 hover:opacity-70">
            <QuestiaLogo variant="footer" priority />
            <span className="font-display text-lg font-semibold tracking-[-0.02em] text-[var(--text)]">Questia</span>
          </Link>
          <span className="carnet-eyebrow text-right">{eyebrow}</span>
        </div>

        <div className="carnet-rule mt-12 pt-9" role="alert" aria-live="polite">
          <h1 className="text-balance font-display text-[clamp(1.9rem,3.4vw+1rem,2.6rem)] font-semibold leading-[1.08] tracking-[-0.025em] text-[var(--text)]">
            {title}
          </h1>
          <p className="mt-4 text-[15px] leading-relaxed text-[var(--muted)]">{description}</p>

          <div className="mt-9 flex flex-col gap-4 sm:flex-row sm:items-center">
            <button type="button" onClick={() => reset()} className="btn btn-cta rounded-lg px-7 py-3.5 text-[15px]">
              {retryLabel}
            </button>
            <Link
              href="/"
              className="text-sm font-medium text-[var(--link-on-bg)] underline decoration-[color:color-mix(in_srgb,var(--link-on-bg)_35%,transparent)] underline-offset-[0.2em] transition-colors duration-200 hover:text-[var(--text)]"
            >
              {homeLabel}
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
