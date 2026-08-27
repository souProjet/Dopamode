import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { QuestiaLogo } from '@/components/QuestiaLogo';
import { hasAnyStoreLink } from '@/config/marketing';

/**
 * Pied de page marketing partagé (landing + pages secondaires). Les ancres
 * pointent vers `/#...` et non `#...` : depuis /legal ou /aura un `#principe`
 * seul ne mène nulle part.
 */
export async function SiteFooter({ className = '' }: { className?: string }) {
  const t = await getTranslations('HomePage');
  const storesReady = hasAnyStoreLink();

  const links: { href: string; label: string }[] = [
    { href: '/#principe', label: t('footer.how') },
    { href: '/#hero-examples', label: t('footer.examples') },
    { href: '/#telecharger', label: storesReady ? t('footer.download') : t('footer.downloadWeb') },
    { href: '/#faq', label: t('footer.faq') },
    { href: '/generation-quetes', label: t('footer.questGeneration') },
    { href: '/sign-in', label: t('footer.signIn') },
    { href: '/legal/confidentialite', label: t('footer.privacy') },
    { href: '/legal/mentions-legales', label: t('footer.legal') },
    { href: '/legal/cgu', label: t('footer.terms') },
    { href: '/legal/cgv', label: t('footer.sales') },
    { href: '/legal/bien-etre', label: t('footer.wellbeing') },
  ];

  return (
    <footer className={`landing-footer ${className}`}>
      <div className="mx-auto w-full max-w-6xl px-5 py-12 sm:px-8 sm:py-14">
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between md:gap-12">
          <div className="max-w-sm">
            <div className="flex items-center gap-3">
              <QuestiaLogo variant="footer" />
              <p className="font-display text-lg font-semibold tracking-tight text-[var(--text)]">
                Questia
              </p>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">
              {t('footer.tagline')}
            </p>
          </div>
          <nav
            className="grid min-w-0 grid-cols-2 gap-x-8 gap-y-2.5 text-sm text-[var(--muted)] sm:grid-cols-3"
            aria-label={t('footer.navLabel')}
          >
            {links.map((l) => (
              <Link key={l.href} href={l.href} className="transition-colors hover:text-[var(--text)]">
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
        <p className="carnet-rule mt-12 pt-7 text-xs text-[var(--subtle)]">
          {t('footer.copyright', { year: new Date().getFullYear() })}
        </p>
      </div>
    </footer>
  );
}
