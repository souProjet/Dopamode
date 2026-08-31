import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { Navbar } from '@/components/Navbar';
import { QuestExamplesSlider, type ExampleQuestSlide } from '@/components/QuestExamplesSlider';
import { AppStoreButtons } from '@/components/AppStoreButtons';
import { LandingJsonLd } from '@/components/LandingJsonLd';
import { SiteFooter } from '@/components/SiteFooter';
import { LandingTerrain } from '@/components/LandingTerrain';
import { LandingTopo } from '@/components/LandingTopo';
import { LandingTrail } from '@/components/LandingTrail';
import { hasAnyStoreLink, storeAvailability } from '@/config/marketing';
import { canonicalUrlFor } from '@/lib/seo/alternates';
import { pickMessages } from '@/i18n/clientMessages';

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

/**
 * Fiches de retours : posées à la main, pas alignées au pixel. L'inclinaison et
 * le décalage vertical sont passés en variables CSS plutôt qu'en `transform`
 * inline, sinon le `:hover` (qui redresse la fiche) ne pourrait plus gagner.
 */
const VOICE_PLACEMENT = [
  { tilt: '-1.4deg', lift: '0px' },
  { tilt: '0.9deg', lift: '18px' },
  { tilt: '-0.7deg', lift: '4px' },
];

/** Gouttière commune : la page entière est alignée sur cette colonne. */
const SHELL = 'mx-auto w-full max-w-6xl px-5 sm:px-8';

/**
 * En-tête de section : amorce brique sur le filet, surtitre en chasse fixe,
 * titre sérif. Aligné à gauche partout — c'est ce qui distingue la page d'une
 * landing générique où tout est centré.
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
        className="carnet-title mt-4 max-w-3xl font-display text-[clamp(1.75rem,3.4vw+0.9rem,2.9rem)] font-semibold leading-[1.1] tracking-[-0.02em] text-balance text-[var(--text)]"
      >
        {title}
      </h2>
      {lead ? (
        <p className="carnet-lead mt-4 max-w-2xl text-base leading-[1.65] text-[var(--muted)] sm:text-lg">
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
  const messages = await getMessages();
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
  const VOICES = t.raw('testimonialQuotes') as {
    quote: string;
    name: string;
    age: number;
  }[];
  const FAQ_ITEMS = t.raw('faqItems') as { question: string; answer: string }[];

  return (
    <div className="paper-sheet min-h-screen overflow-x-clip bg-adventure">
      <div className="relative z-10">
        <LandingJsonLd locale={locale} />
        <Navbar />

        <main id="main-content" tabIndex={-1} className="outline-none">
          {/*
            Ouverture : le terrain d'abord. La carte se trace bord à bord, puis
            deux objets s'y posent — le cartouche qui porte le titre, découpé
            dans la carte comme la légende d'une feuille d'état-major, et la
            fiche du jour épinglée dessus. Le produit envoie dehors : le fond
            de la page est le dehors, pas un aplat de papier.
          */}
          <section
            id="hero"
            className="hero-section relative pt-[max(8rem,calc(env(safe-area-inset-top,0px)+7rem))]"
            aria-labelledby="hero-heading"
          >
            <LandingTerrain className="hero-terrain pointer-events-none absolute inset-0 h-full w-full" />
            <div className={`${SHELL} relative`}>
              <div className="grid items-start gap-11 lg:grid-cols-12 lg:gap-14">
                <div className="hero-cartouche lg:col-span-7">
                  <p className="hero-eyebrow carnet-eyebrow">
                    <span className="hero-eyebrow__text">{t('hero.eyebrow')}</span>
                  </p>
                  <h1
                    id="hero-heading"
                    className="hero-title mt-5 font-display text-[clamp(2rem,4.4vw+0.5rem,3.4rem)] font-semibold leading-[1.03] tracking-[-0.033em] text-[var(--text)]"
                  >
                    {t.rich('hero.title', {
                      line: (chunks) => (
                        <span className="ink-line">
                          <span className="ink-line__in">{chunks}</span>
                        </span>
                      ),
                      em: (chunks) => <em className="italic text-[var(--link-on-bg)]">{chunks}</em>,
                    })}
                  </h1>
                  <p className="hero-lead mt-6 max-w-xl text-lg leading-[1.6] text-[var(--muted)] sm:text-xl">
                    {t('hero.lead')}
                  </p>

                  {storesReady ? (
                    <div className="hero-actions mt-9 space-y-5">
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
                    <div className="hero-actions mt-9 flex flex-col gap-5 sm:flex-row sm:items-center sm:gap-7">
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
                    <p className="hero-note mt-5 text-sm text-[var(--subtle)]">{t('hero.webOnly')}</p>
                  ) : null}
                </div>

                <aside
                  id="hero-examples"
                  className="min-w-0 scroll-mt-28 lg:col-span-5"
                  aria-label={t('hero.examplesAsideLabel')}
                >
                  <p className="quest-aside-caption carnet-eyebrow mb-3">
                    {t('hero.examplesCaption')}
                  </p>
                  {/* Seul composant client de la page à traduire : il n'emporte que ses clés. */}
                  <NextIntlClientProvider messages={pickMessages(messages, ['HomePage.hero'])}>
                    <QuestExamplesSlider quests={EXAMPLE_QUESTS} />
                  </NextIntlClientProvider>
                </aside>
              </div>
            </div>

            {/*
              Le relevé, en bandeau bord à bord : la carte passe dessous. Un
              filet se tire sur toute la largeur, puis chaque mesure s'écrit de
              gauche à droite — dernière trace d'encre de l'ouverture.
            */}
            <div className="hero-band relative mt-16 sm:mt-20">
              <div className={SHELL}>
                <dl className="hero-ledger">
                  {FACTS.map((fact) => (
                    <div key={fact.label} className="hero-ledger__cell">
                      <dd className="hero-ledger__value">{fact.value}</dd>
                      <dt className="hero-ledger__label">{fact.label}</dt>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          </section>

          {/*
            L'itinéraire. Deuxième sol de la page : une bande d'encre, la carte
            de nuit. Les trois stations alternent de part et d'autre d'un tracé
            qui se dessine au scroll — la numérotation porte une séquence
            réelle, elle ne décore pas trois colonnes.
          */}
          <section
            id="principe"
            className="trail-band scroll-mt-24 py-16 sm:py-24"
            aria-labelledby="principe-heading"
          >
            <LandingTopo
              id="principe"
              className="topo-mark--invert pointer-events-none absolute right-[-16rem] top-[-6rem] hidden h-[42rem] w-[42rem] lg:block"
            />
            <div className={`${SHELL} relative`}>
              <div className="reveal">
                <SectionHeading
                  id="principe-heading"
                  eyebrow={t('principle.eyebrow')}
                  title={t('principle.title')}
                  lead={t(storeSuffix ? `principle.leadStores${storeSuffix}` : 'principle.leadWeb')}
                />
              </div>

              <ol className="trail-steps mt-14 grid gap-12 sm:mt-20 lg:mt-24 lg:gap-0">
                <LandingTrail className="trail-line pointer-events-none absolute inset-0 hidden h-full w-full lg:block" />
                <span className="trail-station trail-station--1 hidden lg:block" aria-hidden />
                <span className="trail-station trail-station--2 hidden lg:block" aria-hidden />
                <span className="trail-station trail-station--3 hidden lg:block" aria-hidden />

                {/*
                  Le chiffre est posé du côté du tracé : les trois numéros bordent
                  la gouttière, l'amorce les relie à leur station, et le texte
                  garde le bord extérieur. Sans ça le point flotte au milieu.
                */}
                {STEPS.map((step, i) => (
                  <li
                    key={step.title}
                    className={`reveal relative flex flex-col justify-center lg:w-[40%] lg:flex-row lg:items-center lg:gap-9 lg:py-14 ${
                      i % 2 === 1 ? 'lg:ml-auto' : 'lg:mr-auto lg:flex-row-reverse'
                    }`}
                  >
                    <span
                      className="carnet-numeral shrink-0 text-[3.5rem] sm:text-[4.25rem] lg:text-[5.5rem]"
                      aria-hidden
                    >
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <div className="lg:min-w-0">
                      <h3 className="mt-5 font-display text-[1.35rem] font-semibold leading-snug tracking-[-0.015em] sm:text-2xl lg:mt-0">
                        {step.title}
                      </h3>
                      <p className="mt-3 text-[15px] leading-[1.65] opacity-70 sm:text-base">
                        {step.desc}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </section>

          {/* Bande courte : le titre et l'action sur la même ligne, pas un bloc de plus. */}
          <section
            id="telecharger"
            className="scroll-mt-24 pb-14 pt-4 sm:pb-16 sm:pt-6"
            aria-labelledby="usage-heading"
          >
            <div className={SHELL}>
              <div className="reveal carnet-rule grid gap-8 pt-6 sm:pt-8 lg:grid-cols-12 lg:items-end lg:gap-12">
                <div className="lg:col-span-7">
                  <p className="carnet-eyebrow">
                    {t(storesReady ? 'usage.eyebrowStores' : 'usage.eyebrowWeb')}
                  </p>
                  <h2
                    id="usage-heading"
                    className="mt-4 font-display text-[clamp(1.5rem,2.4vw+0.8rem,2.15rem)] font-semibold leading-[1.15] tracking-[-0.02em] text-balance text-[var(--text)]"
                  >
                    {t(storeSuffix ? `usage.titleStores${storeSuffix}` : 'usage.titleWeb')}
                  </h2>
                  <p className="mt-3 max-w-xl text-base leading-[1.65] text-[var(--muted)]">
                    {t(storeSuffix ? `usage.leadStores${storeSuffix}` : 'usage.leadWeb')}
                  </p>
                </div>
                <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:gap-8 lg:col-span-5 lg:justify-end">
                  {storesReady ? <AppStoreButtons /> : null}
                  <Link
                    href="/onboarding"
                    className="text-[15px] font-semibold text-[var(--link-on-bg)] underline underline-offset-4 decoration-[color-mix(in_srgb,var(--link-on-bg)_35%,transparent)]"
                  >
                    {t('usage.webLink')}
                  </Link>
                </div>
              </div>
            </div>
          </section>

          {/* Retours : fiches d'index posées sur une bande de papier plus dense. */}
          <section
            id="temoignages"
            className="voices-band scroll-mt-24 py-14 sm:py-20"
            aria-labelledby="voices-heading"
          >
            <div className={SHELL}>
              <div className="reveal">
                <SectionHeading
                  id="voices-heading"
                  eyebrow={t('voices.eyebrow')}
                  title={t('voices.title')}
                  lead={t('voices.lead')}
                />
              </div>
              <div className="mt-12 grid gap-7 sm:mt-14 sm:grid-cols-3 sm:gap-8 lg:gap-10">
                {VOICES.map((voice, idx) => {
                  const place = VOICE_PLACEMENT[idx] ?? {
                    tilt: '0deg',
                    lift: '0px',
                  };
                  return (
                    <div key={voice.name} className="voice-deal">
                      <figure
                        className="voice-card paper-tooth px-7 py-8 sm:px-8 sm:py-9"
                        style={
                          {
                            '--tilt': place.tilt,
                            '--lift': place.lift,
                          } as React.CSSProperties
                        }
                      >
                        <span className="voice-card-tick" aria-hidden />
                        <blockquote className="voice-quote mt-6 [overflow-wrap:anywhere]">
                          {voice.quote}
                        </blockquote>
                        <figcaption className="carnet-meta mt-7 text-[13px]">
                          <span className="font-semibold text-[var(--text)]">{voice.name}</span>
                          {', '}
                          {voice.age} {t('voices.yearsOld')}
                        </figcaption>
                      </figure>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          <section id="faq" className="scroll-mt-24 py-14 sm:py-20" aria-labelledby="faq-heading">
            <div className={SHELL}>
              <div className="reveal">
                <SectionHeading
                  id="faq-heading"
                  eyebrow={t('faq.eyebrow')}
                  title={t('faq.title')}
                  lead={t(storeSuffix ? `faq.leadStores${storeSuffix}` : 'faq.leadWeb')}
                />
              </div>
              <div className="carnet-faq mt-11 sm:mt-12">
                {FAQ_ITEMS.map((item) => (
                  <details key={item.question} className="group">
                    <summary className="flex cursor-pointer list-none touch-manipulation select-none items-start justify-between gap-5 py-5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--border-cyan)]">
                      <span className="font-display text-[17px] font-semibold leading-snug text-[var(--text)] [overflow-wrap:anywhere] sm:text-lg">
                        {item.question}
                      </span>
                      <span
                        className="faq-cross relative mt-2.5 h-px w-4 shrink-0 bg-[var(--muted)] transition-colors duration-200 sm:w-[1.125rem]"
                        aria-hidden
                      >
                        <span className="absolute inset-0 rotate-90 bg-[var(--muted)] transition-transform duration-200 group-open:rotate-0" />
                      </span>
                    </summary>
                    <p className="max-w-2xl pb-6 pr-9 text-[15px] leading-[1.68] text-[var(--muted)] [overflow-wrap:anywhere]">
                      {item.answer}
                    </p>
                  </details>
                ))}
              </div>
            </div>
          </section>

          {/* Clôture : contraste inversé, pleine largeur, même relief en négatif. */}
          <section
            id="cta"
            className="carnet-cta paper-tooth scroll-mt-24 py-16 sm:py-24"
            aria-labelledby="cta-heading"
          >
            <LandingTopo
              id="cta"
              className="topo-mark--invert pointer-events-none absolute left-[-10rem] top-[-9rem] hidden h-[38rem] w-[38rem] md:block"
            />
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
