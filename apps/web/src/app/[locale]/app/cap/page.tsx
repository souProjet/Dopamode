'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Navbar } from '@/components/Navbar';
import { Icon } from '@/components/Icons';
import {
  TITLES_REGISTRY,
  questFamilyLabel,
  type AppLocale,
  type CapCatalogEntry,
  type CapProgressView,
} from '@questia/shared';

interface CapMilestoneDetail {
  slug: string;
  title: string;
  intent: string;
  categories: string[];
  questsRequired: number;
  rewardCoins: number;
}

interface CapDetail {
  id: string;
  icon: string;
  label: string;
  promise: string;
  forWho: string;
  rewardTitleId: string;
  rewardCoins: number;
  milestones: CapMilestoneDetail[];
}

interface CapApiResponse {
  catalog: CapCatalogEntry[];
  cap: CapProgressView | null;
  detail: CapDetail | null;
  completed: string[];
}

const CARD = 'rounded-[1.75rem] border border-[var(--border-ui)] bg-[var(--card)] p-5 sm:p-6';

function FamilyChips({ categories, locale }: { categories: string[]; locale: AppLocale }) {
  return (
    <div className="mt-3 flex flex-wrap gap-1.5">
      {categories.map((c) => (
        <span
          key={c}
          className="inline-flex items-center rounded-full border border-[var(--border-ui-strong)] bg-[var(--surface)] px-2.5 py-1 text-[11px] font-semibold text-[var(--muted)]"
        >
          {questFamilyLabel(c, locale) ?? c}
        </span>
      ))}
    </div>
  );
}

export default function CapPage() {
  const t = useTranslations('AppCap');
  const locale = useLocale() as AppLocale;

  const [data, setData] = useState<CapApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirmAbandon, setConfirmAbandon] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    try {
      const res = await fetch('/api/cap', { cache: 'no-store' });
      const json = (await res.json()) as CapApiResponse & { error?: string };
      if (!res.ok) throw new Error(json.error ?? t('errorGeneric'));
      setData(json);
    } catch (e) {
      setError(e instanceof Error ? e.message : t('errorGeneric'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    void load();
  }, [load]);

  const mutate = useCallback(
    async (action: 'start' | 'abandon', capId?: string) => {
      setBusy(capId ?? action);
      setError(null);
      try {
        const res = await fetch('/api/cap', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action, capId }),
        });
        const json = (await res.json()) as CapApiResponse & { error?: string };
        if (!res.ok) throw new Error(json.error ?? t('errorGeneric'));
        setData(json);
        setConfirmAbandon(false);
      } catch (e) {
        setError(e instanceof Error ? e.message : t('errorGeneric'));
      } finally {
        setBusy(null);
      }
    },
    [t],
  );

  const active = data?.cap ?? null;
  const detail = data?.detail ?? null;
  const others = useMemo(
    () => (data?.catalog ?? []).filter((c) => !c.active),
    [data?.catalog],
  );

  return (
    <div className="min-h-screen bg-adventure">
      <Navbar />
      <main
        id="main-content"
        tabIndex={-1}
        className="relative z-10 mx-auto max-w-4xl px-3 pb-24 pt-24 outline-none sm:px-5"
      >
        <Link
          href="/app"
          className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-[var(--link-on-bg)] hover:underline"
        >
          {t('back')}
        </Link>

        <p className="carnet-eyebrow">{t('eyebrow')}</p>
        <h1 className="font-display mb-2 mt-2 text-3xl font-bold text-[var(--text)]">{t('title')}</h1>
        <p className="mb-8 max-w-2xl text-sm leading-relaxed text-[var(--muted)]">{t('intro')}</p>

        {error ? (
          <p className="mb-6 rounded-2xl border border-[var(--red)] bg-[color-mix(in_srgb,var(--red)_7%,var(--card))] px-4 py-3 text-sm font-semibold text-[var(--text)]">
            {error}
          </p>
        ) : null}

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-[var(--orange)] border-t-transparent" />
          </div>
        ) : null}

        {/* ── Cap en cours ── */}
        {!loading && active && detail ? (
          <section className={`${CARD} mb-10 border-[var(--border-cyan)]`} aria-labelledby="cap-active">
            <div className="flex items-start gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[var(--border-ui-strong)] bg-[var(--surface)]">
                <Icon name={active.icon} size="lg" className="text-[var(--orange)]" aria-hidden />
              </span>
              <div className="min-w-0 flex-1">
                <p className="carnet-eyebrow">{t('inProgress')}</p>
                <h2 id="cap-active" className="font-display mt-1 text-xl font-bold text-[var(--text)]">
                  {active.label}
                </h2>
                <p className="mt-1 text-sm text-[var(--muted)]">{active.promise}</p>
              </div>
            </div>

            <div className="mt-5">
              <div className="flex items-baseline justify-between gap-3">
                <p className="text-sm font-bold text-[var(--text)]">
                  {t('milestoneOf', {
                    index: active.milestoneIndex + 1,
                    count: active.milestoneCount,
                  })}{' '}
                  · {active.milestoneTitle}
                </p>
                <p className="text-xs font-semibold tabular-nums text-[var(--muted)]">
                  {active.overallPercent}%
                </p>
              </div>
              <p className="mt-1 text-sm text-[var(--muted)]">{active.milestoneIntent}</p>

              <div
                className="mt-3 h-2 w-full overflow-hidden rounded-full bg-[var(--surface)]"
                role="progressbar"
                aria-valuenow={active.overallPercent}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={t('progressLabel')}
              >
                <div
                  className="h-full rounded-full bg-[var(--orange)] transition-[width] duration-500"
                  style={{ width: `${active.overallPercent}%` }}
                />
              </div>

              <p className="mt-2 text-xs font-semibold text-[var(--muted)]">
                {t('questsInMilestone', {
                  done: active.progress,
                  total: active.questsRequired,
                })}
              </p>

              {active.milestoneQuestNext ? (
                <p className="mt-3 inline-flex items-center gap-2 rounded-full border border-[color-mix(in_srgb,var(--violet)_28%,transparent)] bg-[color-mix(in_srgb,var(--violet)_8%,var(--card))] px-3 py-1.5 text-xs font-bold text-[var(--violet)]">
                  <Icon name="Flame" size="xs" aria-hidden />
                  {t('milestoneQuestNext')}
                </p>
              ) : null}

              <FamilyChips categories={active.categories} locale={locale} />
            </div>

            {/* Jalons */}
            <ol className="mt-6 space-y-2">
              {detail.milestones.map((m, i) => {
                const done = i < active.milestoneIndex;
                const current = i === active.milestoneIndex;
                return (
                  <li
                    key={m.slug}
                    className={`flex items-start gap-3 rounded-2xl border px-4 py-3 ${
                      current
                        ? 'border-[var(--border-cyan)] bg-[var(--surface)]'
                        : 'border-[var(--border-ui)]'
                    }`}
                  >
                    <span
                      className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${
                        done
                          ? 'bg-[var(--green)] text-[var(--card)]'
                          : current
                            ? 'bg-[var(--orange)] text-[var(--card)]'
                            : 'border border-[var(--border-ui-strong)] text-[var(--muted)]'
                      }`}
                    >
                      {done ? <Icon name="Check" size="xs" aria-hidden /> : i + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-[var(--text)]">{m.title}</p>
                      <p className="mt-0.5 text-xs text-[var(--muted)]">{m.intent}</p>
                    </div>
                    <span className="shrink-0 text-xs font-bold tabular-nums text-[var(--orange)]">
                      +{m.rewardCoins} QC
                    </span>
                  </li>
                );
              })}
            </ol>

            <p className="mt-5 text-xs font-semibold text-[var(--muted)]">
              {t('finalReward', {
                coins: detail.rewardCoins,
                title: TITLES_REGISTRY[detail.rewardTitleId]?.label ?? detail.rewardTitleId,
              })}
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              {confirmAbandon ? (
                <>
                  <p className="text-xs font-semibold text-[var(--red)]">{t('abandonWarning')}</p>
                  <button
                    type="button"
                    className="btn btn-sm btn-ghost"
                    onClick={() => setConfirmAbandon(false)}
                  >
                    {t('cancel')}
                  </button>
                  <button
                    type="button"
                    className="btn btn-sm btn-cta"
                    disabled={busy != null}
                    onClick={() => void mutate('abandon')}
                  >
                    {busy === 'abandon' ? '…' : t('abandonConfirm')}
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  className="btn btn-sm btn-ghost"
                  onClick={() => setConfirmAbandon(true)}
                >
                  {t('abandon')}
                </button>
              )}
            </div>
          </section>
        ) : null}

        {/* ── Choix ── */}
        {!loading && data ? (
          <section aria-labelledby="cap-catalog">
            <h2 id="cap-catalog" className="font-display mb-1 text-xl font-bold text-[var(--text)]">
              {active ? t('changeTitle') : t('chooseTitle')}
            </h2>
            <p className="mb-5 text-sm text-[var(--muted)]">
              {active ? t('changeIntro') : t('chooseIntro')}
            </p>

            <ul className="grid gap-4 sm:grid-cols-2">
              {others.map((c) => (
                <li key={c.id} className={`${CARD} flex flex-col`}>
                  <div className="flex items-start gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[var(--border-ui-strong)] bg-[var(--surface)]">
                      <Icon name={c.icon} size="md" className="text-[var(--orange)]" aria-hidden />
                    </span>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-display text-base font-bold text-[var(--text)]">{c.label}</h3>
                      {c.completed ? (
                        <span className="mt-1 inline-flex items-center gap-1 rounded-full border border-[var(--border-ui-strong)] px-2 py-0.5 text-[11px] font-bold text-[var(--green)]">
                          <Icon name="Check" size="xs" aria-hidden />
                          {t('done')}
                        </span>
                      ) : null}
                    </div>
                  </div>

                  <p className="mt-3 text-sm text-[var(--text)]">{c.promise}</p>
                  <p className="mt-2 text-xs leading-relaxed text-[var(--muted)]">{c.forWho}</p>

                  <ol className="mt-3 flex flex-wrap gap-1.5">
                    {c.milestoneTitles.map((title, i) => (
                      <li
                        key={title}
                        className="inline-flex items-center gap-1 rounded-full border border-[var(--border-ui)] px-2.5 py-1 text-[11px] font-semibold text-[var(--muted)]"
                      >
                        <span className="tabular-nums text-[var(--subtle)]">{i + 1}</span>
                        {title}
                      </li>
                    ))}
                  </ol>

                  <p className="mt-4 text-xs font-semibold text-[var(--muted)]">
                    {t('capSummary', { quests: c.totalQuests, coins: c.totalCoins })}
                  </p>
                  <p className="mt-1 inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--violet)]">
                    <Icon name="Award" size="xs" aria-hidden />
                    {TITLES_REGISTRY[c.rewardTitleId]?.label ?? c.rewardTitleId}
                  </p>

                  <button
                    type="button"
                    className="btn btn-cta btn-sm mt-4 self-start"
                    disabled={busy != null}
                    onClick={() => void mutate('start', c.id)}
                  >
                    {busy === c.id ? '…' : active ? t('switchTo') : t('start')}
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </main>
    </div>
  );
}
