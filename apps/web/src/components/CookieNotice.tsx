'use client';

import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { CONSENT_STORAGE_KEY, writeMarketingConsent } from '@/lib/analytics/consent';

export function CookieNotice() {
  const t = useTranslations('CookieNotice');
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (typeof window === 'undefined') return;
      if (localStorage.getItem(CONSENT_STORAGE_KEY)) {
        setVisible(false);
        return;
      }
      setVisible(true);
    } catch {
      setVisible(true);
    }
  }, []);

  if (!visible) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-[100] border-t border-[var(--border-ui-strong)] bg-[var(--card)]/95 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom,0px))] backdrop-blur-md sm:px-6"
      role="dialog"
      aria-labelledby="cookie-notice-title"
      aria-live="polite"
    >
      <div className="mx-auto flex max-w-4xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
        <p id="cookie-notice-title" className="min-w-0 text-sm leading-relaxed text-[var(--muted)]">
          {t('text')}{' '}
          <Link href="/legal/confidentialite#cookies" className="font-medium text-[var(--link-on-bg)] underline decoration-[color:color-mix(in_srgb,var(--link-on-bg)_35%,transparent)] underline-offset-[0.2em] transition-colors duration-200 hover:text-[var(--text)]">
            {t('learnMore')}
          </Link>
        </p>
        <div className="flex shrink-0 flex-wrap gap-2 sm:justify-end">
          <button
            type="button"
            onClick={() => {
              writeMarketingConsent({ analytics: false, ads: false });
              setVisible(false);
            }}
            className="rounded-lg border border-[var(--border-ui-strong)] px-4 py-2 text-sm font-medium text-[var(--text)] transition-colors duration-200 hover:bg-[var(--surface)]"
          >
            {t('refuse')}
          </button>
          <button
            type="button"
            onClick={() => {
              writeMarketingConsent({ analytics: true, ads: true });
              setVisible(false);
            }}
            className="rounded-lg bg-[var(--orange)] px-4 py-2 text-sm font-semibold text-white transition duration-200 hover:brightness-110"
          >
            {t('accept')}
          </button>
        </div>
      </div>
    </div>
  );
}
