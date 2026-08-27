import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { Navbar } from '@/components/Navbar';
import { QuestExamplesSlider, type ExampleQuestSlide } from '@/components/QuestExamplesSlider';
import { AppStoreButtons } from '@/components/AppStoreButtons';
import { LandingJsonLd } from '@/components/LandingJsonLd';
import { SiteFooter } from '@/components/SiteFooter';
import { hasAnyStoreLink, storeAvailability } from '@/config/marketing';
import { canonicalUrlFor } from '@/lib/seo/alternates';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  setRequestLocale(locale);
  const stores = hasAnyStoreLink();
  const avail = storeAvailability();
  const t = await getTranslations({ locale, namespace: 'HomeMetadata' });
  const keywords = t.raw('keywords') as string[];
  const metaSuffix =
    avail === 'both' ? 'Both' : avail === 'android' ? 'Android' : avail === 'ios' ? 'Ios' : null;
  const desc = stores && metaSuffix ? t(`descriptionStores${metaSuffix}`) : t('descriptionWeb');
  const title = stores && metaSuffix ? t(`titleStores${metaSuffix}`) : t('titleWeb');
  const twitterDesc = stores ? desc : t('twitterDescriptionWeb');
  return {
    title,
    description: desc,
    keywords,
    openGraph: {
      title: t('ogTitle'),
      description: desc,
      type: 'website',
      url: canonicalUrlFor(locale, '/'),
      locale: locale === 'en' ? 'en_US' : 'fr_FR',
      alternateLocale: locale === 'en' ? ['fr_FR'] : ['en_US'],
      siteName: 'Questia',
      images: [
        {
          url: '/og/questia-open-graph.png',
          width: 1200,
          height: 630,
          alt: t('ogImageAlt'),
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: t('twitterTitle'),
      description: twitterDesc,
      images: ['/og/questia-open-graph.png'],
    },
  };
}

/** Gouttière commune : la page entière est alignée sur cette colonne. */
const SHELL = 'mx-auto w-full max-w-6xl px-5 sm:px-8';

/**
 * En-tête de section du carnet : filet, surtitre, titre, chapô.
 * Aligné à gauche partout — c'est ce qui distingue la page d'une landing
 * générique où tout est centré.
 */
function SectionHeading({
  id,
  eyebrow,
  title,
  lead,
}: {
  id: string;
  eyebrow: string;
  title: string;
  lead?: string;
}) {
  return (
    <header className="carnet-rule pt-6 sm:pt-8">
      <p className="carnet-eyebrow">{eyebrow}</p>
      <h2
        id={id}
        className="mt-4 max-w-3xl font-display text-[clamp(1.75rem,3.4vw+0.9rem,2.9rem)] font-semibold leading-[1.1] tracking-[-0.02em] text-balance text-[var(--text)]"
      >
        {title}
      </h2>
      {lead ? (
        <p className="mt-4 max-w-2xl text-base leading-[1.65] text-[var(--muted)] sm:text-lg">
          {lead}
        </p>
      ) : null}
    </header>
  );
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('HomePage');
  const storesReady = hasAnyStoreLink();
  const storeAvail = storeAvailability();
  const storeSuffix: 'Both' | 'Android' | 'Ios' | null =
    storesReady && storeAvail !== 'none'
      ? storeAvail === 'both'
        ? 'Both'
        : storeAvail === 'android'
          ? 'Android'
          : 'Ios'
      : null;
  const STEPS = t.raw('steps') as { title: string; desc: string }[];
  const FACTS = t.raw('hero.facts') as { value: string; label: string }[];
  const EXAMPLE_QUESTS = t.raw('examples') as ExampleQuestSlide[];
  const VOICES = t.raw('testimonialQuotes') as { quote: string; name: string; age: number }[];
  const FAQ_ITEMS = t.raw('faqItems') as { question: string; answer: string }[];

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-adventure">
      <div className="relative z-10">
        <LandingJsonLd locale={locale} />
        <Navbar />

        <main id="main-content" tabIndex={-1} className="outline-none">
          {/* Ouverture : titre à gauche, extrait du carnet à droite. Pas de panneau. */}
          <section
            id="hero"
            className="pt-[max(8rem,calc(env(safe-area-inset-top,0px)+7rem))] pb-14 sm:pb-20"
            aria-labelledby="hero-heading"
          >
            <div className={SHELL}>
              <div className="grid items-start gap-11 lg:grid-cols-12 lg:gap-14">
                <div className="lg:col-span-7">
                  <p className="carnet-eyebrow">{t('hero.eyebrow')}</p>
                  <h1
                    id="hero-heading"
                    className="mt-5 font-display text-[clamp(2.15rem,5.6vw+0.5rem,4.15rem)] font-semibold leading-[1.03] tracking-[-0.033em] text-balance text-[var(--text)]"
                  >
                    {t('hero.title')}
                  </h1>
                  <p className="mt-6 max-w-xl text-lg leading-[1.6] text-[var(--muted)] sm:text-xl">
                    {t('hero.lead')}
                  </p>

                  {storesReady ? (
                    <div className="mt-9 space-y-5">
                      <AppStoreButtons className="sm:justify-start" />
                      <p className="text-sm text-[var(--subtle)]">
                        {t('hero.preferWeb')}{' '}
                        <Link
                          href="/onboarding"
                          className="font-semibold text-[var(--link-on-bg)] underline underline-offset-4"
                        >
                          {t('hero.continueBrowser')}
                        </Link>
                      </p>
                    </div>
                  ) : (
                    <div className="mt-9 flex flex-col gap-5 sm:flex-row sm:items-center sm:gap-7">
                      <Link
                        href="/onboarding"
                        className="btn btn-cta rounded-lg px-7 py-3.5 text-[15px]"
                      >
                        {t('hero.ctaFree')}
                      </Link>
                      <a
                        href="#principe"
                        className="text-[15px] font-semibold text-[var(--link-on-bg)] underline underline-offset-4 decoration-[color-mix(in_srgb,var(--link-on-bg)_35%,transparent)]"
                      >
                        {t('hero.ctaSecondary')}
                      </a>
                    </div>
                  )}
                  {!storesReady ? (
                    <p className="mt-5 text-sm text-[var(--subtle)]">{t('hero.webOnly')}</p>
                  ) : null}
                </div>

                <aside
                  id="hero-examples"
                  className="min-w-0 scroll-mt-28 lg:col-span-5"
                  aria-label={t('hero.examplesAsideLabel')}
                >
                  <p className="carnet-eyebrow mb-3">{t('hero.examplesCaption')}</p>
                  <QuestExamplesSlider quests={EXAMPLE_QUESTS} />
                </aside>
              </div>

              {/* Trois chiffres, en ligne de tableau. Remplace les « features ». */}
              <dl className="carnet-rule mt-14 grid grid-cols-1 sm:mt-16 sm:grid-cols-3">
                {FACTS.map((fact) => (
                  <div
                    key={fact.label}
                    className="border-b border-[var(--border-ui)] py-5 sm:border-b-0 sm:border-r sm:py-6 sm:pr-6 sm:last:border-r-0 sm:[&+div]:pl-6"
                  >
                    <dd className="font-display text-3xl font-semibold tracking-[-0.02em] text-[var(--text)] carnet-meta sm:text-[2.25rem]">
                      {fact.value}
                    </dd>
                    <dt className="mt-1.5 text-sm leading-snug text-[var(--muted)]">{fact.label}</dt>
                  </div>
                ))}
              </dl>
            </div>
          </section>

          {/* 01 / 02 / 03 : la numérotation porte la hiérarchie, pas des icônes. */}
          <section id="principe" className="scroll-mt-24 py-12 sm:py-16" aria-labelledby="principe-heading">
            <div className={SHELL}>
              <SectionHeading
                id="principe-heading"
                eyebrow={t('principle.eyebrow')}
                title={t('principle.title')}
                lead={t(storeSuffix ? `principle.leadStores${storeSuffix}` : 'principle.leadWeb')}
              />
              <ol className="mt-12 grid gap-10 sm:mt-14 sm:grid-cols-3 sm:gap-0">
                {STEPS.map((step, i) => (
                  <li key={step.title} className="carnet-entry pl-5 sm:pl-6 sm:pr-7 sm:last:pr-0">
                    <span className="carnet-numeral block text-[3.25rem] sm:text-[3.75rem]" aria-hidden>
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <h3 className="mt-5 font-display text-xl font-semibold leading-snug tracking-[-0.01em] text-[var(--text)]">
                      {step.title}
                    </h3>
                    <p className="mt-2.5 text-[15px] leading-[1.62] text-[var(--muted)]">{step.desc}</p>
                  </li>
                ))}
              </ol>
            </div>
          </section>

          <section id="telecharger" className="scroll-mt-24 py-12 sm:py-16" aria-labelledby="usage-heading">
            <div className={SHELL}>
              <SectionHeading
                id="usage-heading"
                eyebrow={t(storesReady ? 'usage.eyebrowStores' : 'usage.eyebrowWeb')}
                title={t(storeSuffix ? `usage.titleStores${storeSuffix}` : 'usage.titleWeb')}
                lead={t(storeSuffix ? `usage.leadStores${storeSuffix}` : 'usage.leadWeb')}
              />
              <div className="mt-9 flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:gap-8">
                {storesReady ? <AppStoreButtons /> : null}
                <Link
                  href="/onboarding"
                  className="text-[15px] font-semibold text-[var(--link-on-bg)] underline underline-offset-4 decoration-[color-mix(in_srgb,var(--link-on-bg)_35%,transparent)]"
                >
                  {t('usage.webLink')}
                </Link>
              </div>
            </div>
          </section>

          {/* Retours : citations sérif en entrées de carnet, pas de cartes. */}
          <section id="temoignages" className="scroll-mt-24 py-12 sm:py-16" aria-labelledby="voices-heading">
            <div className={SHELL}>
              <SectionHeading
                id="voices-heading"
                eyebrow={t('voices.eyebrow')}
                title={t('voices.title')}
                lead={t('voices.lead')}
              />
              <div className="mt-12 grid gap-10 sm:mt-14 sm:grid-cols-3 sm:gap-0">
                {VOICES.map((voice) => (
                  <figure key={voice.name} className="carnet-entry pl-5 sm:pl-6 sm:pr-7 sm:last:pr-0">
                    <blockquote className="carnet-quote [overflow-wrap:anywhere]">
                      {voice.quote}
                    </blockquote>
                    <figcaption className="carnet-meta mt-5 text-sm">
                      <span className="font-semibold text-[var(--text)]">{voice.name}</span>
                      {', '}
                      {voice.age} {t('voices.yearsOld')}
                    </figcaption>
                  </figure>
                ))}
              </div>
            </div>
          </section>

          <section id="faq" className="scroll-mt-24 py-12 sm:py-16" aria-labelledby="faq-heading">
            <div className={SHELL}>
              <SectionHeading
                id="faq-heading"
                eyebrow={t('faq.eyebrow')}
                title={t('faq.title')}
                lead={t(storeSuffix ? `faq.leadStores${storeSuffix}` : 'faq.leadWeb')}
              />
              <div className="carnet-faq mt-11 sm:mt-12">
                {FAQ_ITEMS.map((item) => (
                  <details key={item.question} className="group">
                    <summary className="flex cursor-pointer list-none touch-manipulation select-none items-start justify-between gap-5 py-5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--border-cyan)]">
                      <span className="font-display text-[17px] font-semibold leading-snug text-[var(--text)] [overflow-wrap:anywhere] sm:text-lg">
                        {item.question}
                      </span>
                      <span
                        className="relative mt-2.5 h-px w-4 shrink-0 bg-[var(--muted)] sm:w-[1.125rem]"
                        aria-hidden
                      >
                        <span className="absolute inset-0 bg-[var(--muted)] transition-transform duration-200 group-open:rotate-0 rotate-90" />
                      </span>
                    </summary>
                    <p className="max-w-2xl pb-6 text-[15px] leading-[1.68] text-[var(--muted)] [overflow-wrap:anywhere]">
                      {item.answer}
                    </p>
                  </details>
                ))}
              </div>
            </div>
          </section>

          {/* Clôture : contraste inversé, pleine largeur. */}
          <section id="cta" className="carnet-cta scroll-mt-24 py-14 sm:py-20" aria-labelledby="cta-heading">
            <div className={SHELL}>
              <p className="carnet-eyebrow">{t('cta.eyebrow')}</p>
              <div className="mt-4 grid gap-9 lg:grid-cols-12 lg:items-end lg:gap-14">
                <div className="lg:col-span-7">
                  <h2
                    id="cta-heading"
                    className="font-display text-[clamp(1.9rem,3.6vw+0.9rem,3rem)] font-semibold leading-[1.08] tracking-[-0.025em] text-balance"
                  >
                    {t('cta.title')}
                  </h2>
                  <p className="mt-4 max-w-xl text-base leading-[1.65] opacity-75 sm:text-lg">
                    {t(storeSuffix ? `cta.leadStores${storeSuffix}` : 'cta.leadWeb')}
                  </p>
                </div>
                <div className="flex flex-col items-start gap-5 lg:col-span-5 lg:items-end">
                  <Link
                    href="/onboarding"
                    className="btn rounded-lg bg-[var(--bg)] px-7 py-3.5 text-[15px] text-[var(--text)]"
                  >
                    {t('cta.ctaFree')}
                  </Link>
                  <Link
                    href="/generation-quetes"
                    className="text-[15px] font-semibold underline underline-offset-4 opacity-80 transition-opacity hover:opacity-100"
                  >
                    {t('cta.secondary')}
                  </Link>
                </div>
              </div>
            </div>
          </section>
        </main>

        <SiteFooter />
      </div>
    </div>
  );
}
