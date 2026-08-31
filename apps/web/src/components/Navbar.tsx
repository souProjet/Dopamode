'use client';

import { Link, usePathname } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useId, useMemo, useState } from 'react';
import { useAuth, UserButton } from '@clerk/nextjs';
import { AdminNavLink } from '@/components/AdminNavLink';
import { LocaleSwitcher } from '@/components/LocaleSwitcher';
import { QuestiaLogo } from '@/components/QuestiaLogo';
import { hasAnyStoreLink } from '@/config/marketing';

/** Trois filets pleine largeur qui se croisent à l'ouverture — pas d'icône importée. */
const burgerBar = 'absolute left-0 h-px w-[22px] bg-[var(--text)]';

function BurgerIcon({ open }: { open: boolean }) {
  return (
    <span className="relative block h-[16px] w-[22px]" aria-hidden>
      <span
        className={`${burgerBar} transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:duration-150 ${
          open ? 'top-[8px] rotate-45' : 'top-[3px] rotate-0'
        }`}
      />
      <span
        className={`${burgerBar} top-[8px] transition-opacity duration-200 ease-out motion-reduce:duration-100 ${
          open ? 'opacity-0' : 'opacity-100'
        }`}
      />
      <span
        className={`${burgerBar} transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:duration-150 ${
          open ? 'top-[8px] -rotate-45' : 'top-[13px] rotate-0'
        }`}
      />
    </span>
  );
}

/** Lien de navigation : texte seul, l'encre porte l'état. Aucune pastille, aucune icône. */
const NAV_LINK =
  'whitespace-nowrap px-1.5 py-1.5 text-sm text-[var(--muted)] transition-colors duration-200 hover:text-[var(--text)]';

export function Navbar() {
  const pathname = usePathname();
  const t = useTranslations('Navbar');
  const { isSignedIn } = useAuth();
  const storesReady = hasAnyStoreLink();

  const marketingMenu = useMemo((): { href: string; label: string }[] => {
    const examples = { href: '#hero-examples', label: t('navExamples') };
    const how = { href: '#principe', label: t('navHow') };
    const download = {
      href: '#telecharger',
      label: storesReady ? t('navDownload') : t('navDownloadWeb'),
    };
    const tail = [
      { href: '#temoignages', label: t('navTestimonials') },
      { href: '#faq', label: t('navFaq') },
    ];
    // Web-only landing: examples are already beside the hero CTA on large screens — lead with "How it works".
    if (storesReady) return [examples, how, download, ...tail];
    return [how, examples, download, ...tail];
  }, [t, storesReady]);
  const panelId = useId();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [drawerMounted, setDrawerMounted] = useState(false);
  const [drawerReady, setDrawerReady] = useState(false);

  const isAppRoute = pathname?.startsWith('/app') ?? false;
  const isAdminRoute = pathname?.startsWith('/admin') ?? false;
  const showMarketingNav = !isAppRoute && !isAdminRoute;
  const showLocaleSwitcher = !isAdminRoute;
  const showMobileMenu = showMarketingNav || isAppRoute;

  const closeMobile = useCallback(() => setMobileOpen(false), []);

  useEffect(() => {
    closeMobile();
  }, [pathname, closeMobile]);

  useEffect(() => {
    const reduced =
      typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (mobileOpen) {
      setDrawerMounted(true);
      setDrawerReady(false);
      if (reduced) {
        setDrawerReady(true);
        return;
      }
      // Un seul rAF suffit : la frame suivante garantit que le DOM est peint avant d'activer la transition.
      const id = requestAnimationFrame(() => setDrawerReady(true));
      return () => cancelAnimationFrame(id);
    }
    setDrawerReady(false);
    const delay = reduced ? 50 : 300;
    const timer = window.setTimeout(() => setDrawerMounted(false), delay);
    return () => window.clearTimeout(timer);
  }, [mobileOpen]);

  useEffect(() => {
    if (!drawerMounted) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [drawerMounted]);

  useEffect(() => {
    if (!drawerMounted) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeMobile();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [drawerMounted, closeMobile]);

  const marketingDesktop = (
    <div className="inline-flex w-max min-w-0 max-w-none flex-nowrap items-center gap-1 lg:gap-2">
      {/*
        « Sous le capot » dans la zone centrale (md+) : évite le chevauchement avec la FAQ,
        qui passait sous la colonne droite quand ce lien était à droite avec la langue.
      */}
      <Link href="/generation-quetes" className={`${NAV_LINK} hidden md:inline-flex`} title={t('navQuestGen')}>
        {t('navQuestGenShort')}
      </Link>
      <span className="hidden h-3.5 w-px shrink-0 self-center bg-[var(--border-ui-strong)] md:block" aria-hidden />
      {marketingMenu.map(({ href, label }) => (
        <a key={href} href={href} className={NAV_LINK}>
          {label}
        </a>
      ))}
    </div>
  );

  const navShellClass = [
    'navbar-shell mx-auto w-full max-w-6xl xl:max-w-7xl 2xl:max-w-[min(90rem,calc(100vw-2rem))] min-w-0 px-4 sm:px-6 lg:px-8',
    'h-16 sm:h-[4.25rem]',
    showMarketingNav
      ? 'flex flex-nowrap items-center justify-between gap-3 md:grid md:grid-cols-[auto_minmax(0,1fr)_auto] md:items-center md:gap-x-4 lg:gap-x-6'
      : 'flex flex-nowrap items-center justify-between gap-3 md:gap-6',
  ].join(' ');

  return (
    <header className="navbar-bar fixed left-0 right-0 top-0 z-50 pt-[env(safe-area-inset-top,0px)]">
      <nav className={navShellClass} aria-label={t('ariaMain')}>
        <Link
          href={isSignedIn ? '/app' : '/'}
          className="flex shrink-0 items-center gap-2.5 transition-opacity duration-200 hover:opacity-70"
          aria-label={t('ariaHome')}
        >
          <QuestiaLogo variant="footer" priority className="h-8 w-8 min-h-8 min-w-8" />
          <span className="font-display text-lg font-semibold tracking-[-0.02em] text-[var(--text)]">Questia</span>
        </Link>

        {showMarketingNav && (
          <div className="relative z-[2] hidden min-w-0 w-full justify-self-stretch md:flex md:items-center md:justify-start md:overflow-x-auto md:[scrollbar-width:none] xl:justify-center md:[&::-webkit-scrollbar]:hidden">
            {marketingDesktop}
          </div>
        )}

        <div className="relative z-[1] flex min-w-0 shrink-0 items-center justify-end justify-self-end gap-3 md:gap-4 lg:gap-5">
          {/* Sur mobile, la langue est dans le menu burger (évite la barre surchargée). */}
          {showLocaleSwitcher ? (
            <div className="hidden md:flex md:shrink-0 md:items-center">
              <LocaleSwitcher />
            </div>
          ) : null}
          {isSignedIn ? (
            <>
              {showMarketingNav && (
                <Link href="/app" className="btn btn-cta hidden rounded-lg px-5 py-2 text-sm sm:inline-flex">
                  {t('openApp')}
                </Link>
              )}
              {isAppRoute && (
                <>
                  <Link href="/app/cap" className={`${NAV_LINK} hidden md:inline-flex`}>
                    {t('cap')}
                  </Link>
                  <Link href="/app/shop" className={`${NAV_LINK} hidden md:inline-flex`}>
                    {t('shop')}
                  </Link>
                  <Link href="/app/history" className={`${NAV_LINK} hidden md:inline-flex`}>
                    {t('history')}
                  </Link>
                  <Link href="/app/profile" className={`${NAV_LINK} hidden md:inline-flex`}>
                    {t('profile')}
                  </Link>
                  <AdminNavLink />
                </>
              )}
              <UserButton
                appearance={{
                  variables: { colorPrimary: '#c2410c' },
                  elements: { avatarBox: 'w-8 h-8' },
                }}
              />
            </>
          ) : (
            <>
              <Link href="/sign-in" className={`${NAV_LINK} hidden sm:inline-flex`}>
                {t('signIn')}
              </Link>
              <Link
                href="/onboarding"
                className="btn btn-cta whitespace-nowrap rounded-lg px-4 py-2 text-sm sm:px-5"
              >
                {t('getStarted')}
              </Link>
            </>
          )}

          {showMobileMenu ? (
            <button
              type="button"
              id={`${panelId}-trigger`}
              className="-mr-2 inline-flex h-11 w-11 shrink-0 items-center justify-center text-[var(--text)] transition-opacity duration-200 hover:opacity-70 md:hidden"
              aria-expanded={mobileOpen}
              aria-controls={panelId}
              onClick={() => setMobileOpen((o) => !o)}
            >
              <span className="sr-only">{drawerMounted ? t('closeMenu') : t('openMenu')}</span>
              <BurgerIcon open={drawerReady && drawerMounted} />
            </button>
          ) : null}
        </div>
      </nav>

      {/* Tiroir mobile : feuille de papier pleine hauteur, adossée au bord droit */}
      {showMobileMenu && drawerMounted ? (
        <>
          <button
            type="button"
            className={`fixed inset-0 z-[100] cursor-pointer border-0 bg-[color:color-mix(in_srgb,var(--text)_28%,transparent)] transition-opacity duration-300 ease-out motion-reduce:duration-100 md:hidden ${
              drawerReady ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
            aria-label={t('closeMenu')}
            onClick={closeMobile}
            tabIndex={drawerReady ? 0 : -1}
          />
          <div
            id={panelId}
            aria-hidden={!drawerReady}
            className={`navbar-mobile-drawer fixed inset-y-0 right-0 z-[101] flex w-[min(100%,19rem)] max-w-[calc(100vw-2.5rem)] flex-col md:hidden transition-[transform,opacity] duration-300 ease-out motion-reduce:duration-75 motion-reduce:ease-out pt-[env(safe-area-inset-top,0px)] pb-[env(safe-area-inset-bottom,0px)] ${
              drawerReady ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0 pointer-events-none'
            }`}
            role="dialog"
            aria-modal="true"
            aria-labelledby={`${panelId}-title`}
          >
            <div className="flex shrink-0 items-start justify-between gap-4 border-b border-[var(--border-ui)] px-5 py-5">
              <div className="min-w-0">
                <p id={`${panelId}-title`} className="carnet-eyebrow">
                  {t('menuTitle')}
                </p>
                <p className="mt-2 text-sm text-[var(--muted)]">{t('menuSubtitle')}</p>
              </div>
              <button
                type="button"
                className="-mr-1 -mt-1 inline-flex h-10 w-10 shrink-0 items-center justify-center text-[var(--muted)] transition-colors duration-200 hover:text-[var(--text)]"
                onClick={closeMobile}
                aria-label={t('close')}
              >
                <span aria-hidden className="text-xl leading-none">
                  ✕
                </span>
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-2">
              {showMarketingNav ? (
                <nav className="flex flex-col" aria-label={t('navSections')}>
                  {marketingMenu.map(({ href, label }, i) => (
                    <a
                      key={href}
                      href={href}
                      onClick={closeMobile}
                      className="group flex items-baseline gap-4 border-b border-[var(--border-ui)] py-4 text-[15px] text-[var(--text)] transition-colors duration-200 hover:text-[var(--muted)]"
                    >
                      <span className="carnet-numeral shrink-0 text-[1.15rem]" aria-hidden>
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <span className="min-w-0 flex-1">{label}</span>
                      <span
                        className="shrink-0 text-[var(--subtle)] transition-transform duration-200 group-hover:translate-x-1"
                        aria-hidden
                      >
                        →
                      </span>
                    </a>
                  ))}
                  <Link
                    href="/generation-quetes"
                    onClick={closeMobile}
                    className="carnet-eyebrow py-5 transition-colors duration-200 hover:text-[var(--text)]"
                    title={t('navQuestGen')}
                  >
                    {t('navQuestGenShort')}
                  </Link>
                  {showLocaleSwitcher ? (
                    <div className="border-t border-[var(--border-ui)] pt-5 md:hidden">
                      <LocaleSwitcher />
                    </div>
                  ) : null}
                </nav>
              ) : null}

              {isAppRoute ? (
                <nav className="flex flex-col" aria-label={t('navApp')}>
                  {[
                    { href: '/app/cap', label: t('cap') },
                    { href: '/app/shop', label: t('shop') },
                    { href: '/app/history', label: t('history') },
                    { href: '/app/profile', label: t('profile') },
                  ].map((item, i) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={closeMobile}
                      className="group flex items-baseline gap-4 border-b border-[var(--border-ui)] py-4 text-[15px] text-[var(--text)] transition-colors duration-200 hover:text-[var(--muted)]"
                    >
                      <span className="carnet-numeral shrink-0 text-[1.15rem]" aria-hidden>
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <span className="min-w-0 flex-1">{item.label}</span>
                      <span
                        className="shrink-0 text-[var(--subtle)] transition-transform duration-200 group-hover:translate-x-1"
                        aria-hidden
                      >
                        →
                      </span>
                    </Link>
                  ))}
                  <AdminNavLink variant="drawer" />
                  {showLocaleSwitcher ? (
                    <div className="border-t border-[var(--border-ui)] pt-5">
                      <LocaleSwitcher />
                    </div>
                  ) : null}
                </nav>
              ) : null}

              {!isSignedIn ? (
                <Link
                  href="/sign-in"
                  onClick={closeMobile}
                  className="mt-2 flex w-full items-center justify-center border-t border-[var(--border-ui)] py-5 text-[15px] font-medium text-[var(--link-on-bg)] underline decoration-[color:color-mix(in_srgb,var(--link-on-bg)_35%,transparent)] underline-offset-[0.2em] transition-colors duration-200 hover:text-[var(--text)]"
                >
                  {t('signIn')}
                </Link>
              ) : showMarketingNav ? (
                <Link
                  href="/app"
                  onClick={closeMobile}
                  className="btn btn-cta mt-6 flex w-full justify-center rounded-lg px-7 py-3.5 text-[15px]"
                >
                  {t('openApp')}
                </Link>
              ) : null}
            </div>
          </div>
        </>
      ) : null}
    </header>
  );
}
