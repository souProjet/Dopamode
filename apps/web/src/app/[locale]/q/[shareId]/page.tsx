import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { questDisplayEmoji } from '@questia/shared';
import { Icon } from '@/components/Icons';
import { QuestiaLogo } from '@/components/QuestiaLogo';
import { prisma } from '@/lib/db';
import { alternatesForLocalePath, canonicalUrlFor } from '@/lib/seo/alternates';

type PageParams = {
  locale: string;
  shareId: string;
};

const sharedQuestSelect = {
  questDate: true,
  generatedEmoji: true,
  generatedTitle: true,
  generatedMission: true,
  generatedHook: true,
  generatedDuration: true,
  status: true,
} as const;

async function loadSharedQuest(shareId: string) {
  return prisma.questLog.findUnique({
    where: { shareId },
    select: sharedQuestSelect,
  });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<PageParams>;
}): Promise<Metadata> {
  const { locale, shareId } = await params;
  const log = await loadSharedQuest(shareId);
  if (!log || log.status !== 'completed') {
    return { title: 'Questia', robots: { index: false, follow: false } };
  }
  const title = `${log.generatedTitle} | Questia`;
  const description =
    log.generatedMission.length > 155
      ? `${log.generatedMission.slice(0, 152)}…`
      : log.generatedMission;
  const path = `/q/${shareId}`;
  return {
    title,
    description,
    alternates: alternatesForLocalePath(locale, path),
    openGraph: {
      title,
      description,
      url: canonicalUrlFor(locale, path),
      type: 'website',
      locale: locale === 'en' ? 'en_US' : 'fr_FR',
      siteName: 'Questia',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    /** Pages UGC très courtes : ne pas les faire indexer (risque spam / contenu de faible qualité aux yeux de Google). */
    robots: { index: false, follow: true },
  };
}

export default async function SharedQuestPage({
  params,
}: {
  params: Promise<PageParams>;
}) {
  const { locale, shareId } = await params;
  const isEn = locale === 'en';

  const log = await loadSharedQuest(shareId);

  if (!log || log.status !== 'completed') notFound();

  const questIcon = questDisplayEmoji(log.generatedEmoji);

  return (
    <div className="flex min-h-screen flex-col">
      <main className="mx-auto w-full max-w-[38rem] flex-1 px-5 py-10 sm:px-8 sm:py-14">
        {/* En-tête : marque à gauche, nature de la page à droite */}
        <div className="flex items-center justify-between gap-4">
          <Link
            href={isEn ? '/en' : '/'}
            className="inline-flex items-center gap-2.5 transition-opacity duration-200 hover:opacity-70"
          >
            <QuestiaLogo variant="footer" />
            <span className="font-display text-lg font-semibold tracking-[-0.02em] text-[var(--text)]">Questia</span>
          </Link>
          <span className="carnet-eyebrow">{isEn ? 'Shared quest' : 'Quête partagée'}</span>
        </div>

        <header className="carnet-rule mt-10 pt-9">
          <h1 className="flex flex-wrap items-baseline gap-3 text-balance font-display text-[clamp(1.9rem,3.4vw+1rem,2.6rem)] font-semibold leading-[1.08] tracking-[-0.025em] text-[var(--text)]">
            <Icon name={questIcon} size="lg" className="shrink-0 self-center text-[var(--muted)]" aria-hidden />
            <span>{log.generatedTitle}</span>
          </h1>
          <p className="carnet-meta mt-4 text-sm">
            {new Date(`${log.questDate}T12:00:00.000Z`).toLocaleDateString(isEn ? 'en-GB' : 'fr-FR')} ·{' '}
            {log.generatedDuration}
          </p>
        </header>

        <section className="carnet-rule mt-11 pt-7">
          <p className="carnet-eyebrow">Mission</p>
          <p className="mt-4 font-display text-[1.35rem] font-semibold leading-snug tracking-[-0.015em] text-[var(--text)]">
            {log.generatedMission}
          </p>
        </section>

        <blockquote className="carnet-quote mt-9 border-l-2 border-[var(--gold)] pl-5">
          « {log.generatedHook} »
        </blockquote>

        <div className="carnet-rule mt-12 flex flex-col gap-4 pt-8 sm:flex-row sm:items-center">
          <Link
            href={isEn ? '/en/app' : '/app'}
            className="btn btn-cta rounded-lg px-7 py-3.5 text-[15px]"
          >
            {isEn ? 'Open Questia' : 'Ouvrir Questia'}
          </Link>
          <Link
            href={isEn ? '/en' : '/'}
            className="text-sm font-medium text-[var(--link-on-bg)] underline decoration-[color:color-mix(in_srgb,var(--link-on-bg)_35%,transparent)] underline-offset-[0.2em] transition-colors duration-200 hover:text-[var(--text)]"
          >
            {isEn ? 'Back to website' : 'Retour au site'}
          </Link>
        </div>
      </main>
    </div>
  );
}
