import { Link } from '@/i18n/navigation';
import type { ReactNode } from 'react';
import { QuestiaLogo } from '@/components/QuestiaLogo';

type AuthQuestShellProps = {
  /** Surtitre : contexte du tunnel, à droite de la marque. */
  eyebrow: string;
  title: ReactNode;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
};

/**
 * Cadre des pages d'authentification, en registre « carnet de route » : même
 * mesure et mêmes filets que l'onboarding, aucun panneau flottant. Pas de
 * navbar ni de pied de page marketing — un tunnel ne se quitte que par la
 * marque en haut à gauche.
 */
export function AuthQuestShell({ eyebrow, title, subtitle, children, footer }: AuthQuestShellProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <main
        id="main-content"
        tabIndex={-1}
        className="mx-auto w-full max-w-[38rem] flex-1 px-5 pb-14 pt-[max(2.5rem,env(safe-area-inset-top))] outline-none sm:px-8 sm:pb-16 sm:pt-14"
      >
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="inline-flex items-center gap-2.5 transition-opacity duration-200 hover:opacity-70">
            <QuestiaLogo variant="footer" priority />
            <span className="font-display text-lg font-semibold tracking-[-0.02em] text-[var(--text)]">Questia</span>
          </Link>
          <span className="carnet-eyebrow text-right">{eyebrow}</span>
        </div>

        <header className="mt-12">
          <h1 className="text-balance font-display text-[clamp(1.9rem,3.4vw+1rem,2.6rem)] font-semibold leading-[1.08] tracking-[-0.025em] text-[var(--text)]">
            {title}
          </h1>
          <p className="mt-4 text-[15px] leading-relaxed text-[var(--muted)]">{subtitle}</p>
        </header>

        <div className="auth-clerk-root auth-clerk-root--tight carnet-rule mt-10 w-full min-w-0 pt-9">{children}</div>

        <div className="carnet-rule mt-12 pt-6">{footer}</div>
      </main>
    </div>
  );
}
