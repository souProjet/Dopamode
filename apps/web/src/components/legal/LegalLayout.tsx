import type { ReactNode } from 'react';
import { siteUrl } from '@/config/marketing';
import { SiteFooter } from '@/components/SiteFooter';
import { MastheadBackLink, PageMasthead } from '@/components/PageMasthead';

/**
 * Le titre est un cartouche posé sur la carte (`PageMasthead`), comme sur
 * l'accueil ; le corps reste du papier nu à mesure de lecture courte. Il est
 * stylé par `.legal-prose` (globals.css) pour que les pages n'aient plus à
 * porter de classes de couleur en dur.
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
      <PageMasthead
        eyebrow={<MastheadBackLink label="← Accueil" />}
        title={title}
        lead={description}
      >
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
              <a
                href={siteUrl}
                className="text-[var(--link-on-bg)] underline decoration-[color:color-mix(in_srgb,var(--link-on-bg)_35%,transparent)] underline-offset-[0.2em] transition-colors duration-200 hover:text-[var(--text)]"
              >
                {siteUrl}
              </a>
            </>
          ) : null}
        </p>
      </PageMasthead>
      <div className="mx-auto w-full max-w-6xl flex-1 px-5 py-12 sm:px-8 sm:py-16">
        <div className="legal-prose max-w-[46rem]">{children}</div>
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
