import { Link } from '@/i18n/navigation';
import type { ReactNode } from 'react';
import { siteUrl } from '@/config/marketing';
import { SiteFooter } from '@/components/SiteFooter';

/**
 * Registre « carnet de route » comme la landing : surtitre en petites capitales,
 * titre sérif, filet, mesure de lecture courte. Le corps est stylé par
 * `.legal-prose` (globals.css) pour que les pages n'aient plus à porter de
 * classes de couleur en dur.
 */
export function LegalLayout({
  title,
  description,
  children,
  showSiteUrl = true,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  showSiteUrl?: boolean;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="mx-auto w-full max-w-6xl flex-1 px-5 py-12 sm:px-8 sm:py-16">
        <div className="max-w-[46rem]">
          <p className="carnet-eyebrow">
            <Link
              href="/"
              className="transition-colors hover:text-[var(--text)]"
            >
              &larr; Accueil
            </Link>
          </p>
          <h1 className="mt-4 font-display text-[clamp(1.9rem,3.4vw+1rem,2.75rem)] font-semibold leading-[1.08] tracking-[-0.025em] text-balance text-[var(--text)]">
            {title}
          </h1>
          {description ? (
            <p className="mt-4 text-base leading-[1.65] text-[var(--muted)] sm:text-lg">
              {description}
            </p>
          ) : null}
          <p className="carnet-rule mt-8 pt-4 text-xs text-[var(--subtle)]">
            Dernière mise à jour :{' '}
            {new Date().toLocaleDateString('fr-FR', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
            {showSiteUrl ? (
              <>
                {' · '}
                Site :{' '}
                <a href={siteUrl} className="text-[var(--link-on-bg)] underline decoration-[color:color-mix(in_srgb,var(--link-on-bg)_35%,transparent)] underline-offset-[0.2em] transition-colors duration-200 hover:text-[var(--text)]">
                  {siteUrl}
                </a>
              </>
            ) : null}
          </p>
          <div className="legal-prose mt-12">{children}</div>
        </div>
      </div>
      <SiteFooter />
    </div>
  );
}

export function IncompleteNotice() {
  return (
    <p className="border-l-2 border-[var(--gold)] bg-[color-mix(in_srgb,var(--gold)_7%,transparent)] px-4 py-3 text-sm text-[var(--text)]">
      Les champs encore indiqués comme « à compléter » doivent être renseignés avant une mise en
      production (variables <code>NEXT_PUBLIC_LEGAL_*</code> dans l'hébergeur, voir{' '}
      <code>.env.example</code>).
    </p>
  );
}
