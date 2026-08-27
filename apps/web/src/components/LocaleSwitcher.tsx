'use client';

import { useLocale, useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';

/**
 * Bascule FR / EN (préfixe `/en` pour l'anglais, FR sans préfixe).
 * Deux mots séparés d'un filet : l'encre porte l'état actif, pas un aplat.
 */
export function LocaleSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const t = useTranslations('HomePage.localeSwitcher');

  const linkClass = (active: boolean) =>
    `inline-flex min-h-[2.25rem] items-center px-1.5 text-sm transition-colors duration-200 ${
      active ? 'font-medium text-[var(--text)]' : 'text-[var(--subtle)] hover:text-[var(--text)]'
    }`;

  return (
    <div className="inline-flex shrink-0 items-center gap-1" role="navigation" aria-label={t('label')}>
      <Link href={pathname} locale="fr" className={linkClass(locale === 'fr')} aria-current={locale === 'fr'}>
        {t('fr')}
      </Link>
      <span className="h-3 w-px bg-[var(--border-ui-strong)]" aria-hidden />
      <Link href={pathname} locale="en" className={linkClass(locale === 'en')} aria-current={locale === 'en'}>
        {t('en')}
      </Link>
    </div>
  );
}
