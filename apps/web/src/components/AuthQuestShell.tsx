import { Link } from '@/i18n/navigation';
import type { ReactNode } from 'react';
import { QuestiaLogo } from '@/components/QuestiaLogo';
import { MapBand } from '@/components/PageMasthead';

type AuthQuestShellProps = {
  /** Surtitre : contexte du tunnel, à droite de la marque. */
  eyebrow: string;
  title: ReactNode;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
};

/**
 * Cadre des pages d'authentification. Même sol que le reste du site — la carte
 * bord à bord, la marque et le titre en cartouche posé dessus — puis le
 * formulaire sur papier nu, à la même mesure. Pas de navbar ni de pied de page
 * marketing : un tunnel ne se quitte que par la marque en haut à gauche.
 */
export function AuthQuestShell({ eyebrow, title, subtitle, children, footer }: AuthQuestShellProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <MapBand className="max-w-[38rem]">
        <div className="cartouche">
          <div className="flex items-center justify-between gap-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2.5 transition-opacity duration-200 hover:opacity-70"
            >
              <QuestiaLogo variant="footer" priority />
              <span className="font-display text-lg font-semibold tracking-[-0.02em] text-[var(--text)]">
                Questia
              </span>
            </Link>
            <span className="carnet-eyebrow text-right">{eyebrow}</span>
          </div>

          <header className="mt-10">
            <h1 className="text-balance font-display text-[clamp(1.9rem,3.4vw+1rem,2.6rem)] font-semibold leading-[1.08] tracking-[-0.025em] text-[var(--text)]">
              {title}
            </h1>
            <p className="mt-4 text-[15px] leading-relaxed text-[var(--muted)]">{subtitle}</p>
          </header>
        </div>
      </MapBand>

      {/* Le formulaire reste sur papier nu : un champ de saisie ne se lit pas
          par-dessus des courbes de niveau. */}
      <main
        id="main-content"
        tabIndex={-1}
        className="mx-auto w-full max-w-[38rem] flex-1 px-5 pb-14 pt-10 outline-none sm:px-8 sm:pb-16 sm:pt-12"
      >
        <div className="auth-clerk-root auth-clerk-root--tight w-full min-w-0">{children}</div>

        <div className="carnet-rule mt-12 pt-6">{footer}</div>
      </main>
    </div>
  );
}
