'use client';

import { useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import { useTranslations } from 'next-intl';
import {
  coinBreakdownRowsFr,
  levelFromTotalXp,
  levelRewardSummaryFr,
  TITLES_REGISTRY,
  XP_PER_LEVEL,
  xpBarSegmentsFromTotals,
  xpBreakdownRowsFr,
  type CompletionCoinGain,
  type DisplayBadge,
  type LevelReward,
  type XpBreakdown,
} from '@questia/shared';
import { Icon } from '@/components/Icons';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  xpGain: {
    gained: number;
    breakdown: XpBreakdown;
    newTotal: number;
    previousTotal: number;
  };
  coinGain?: CompletionCoinGain | null;
  levelRewards?: LevelReward[];
  titlesUnlocked?: string[];
  badgesUnlocked: DisplayBadge[];
  onContinue: () => void;
};

function subscribeReducedMotion(onStoreChange: () => void) {
  const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
  mq.addEventListener('change', onStoreChange);
  return () => mq.removeEventListener('change', onStoreChange);
}

function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribeReducedMotion,
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    () => false,
  );
}

function confettiParticle(i: number, origin: 'center' | 'high' = 'center') {
  const s = (n: number) => {
    const x = Math.sin(n * 12.9898 + i * 3.1415) * 43758.5453;
    return x - Math.floor(x);
  };
  const dx = (s(1) - 0.5) * 300;
  const dy = (origin === 'high' ? 120 : 180) + s(2) * 200;
  const spin = 520 + s(3) * 620;
  const delay = `${s(4) * 0.42}s`;
  const dur = `${1.95 + s(5) * 0.55}s`;
  const hue = Math.floor(s(6) * 360);
  const ox = (s(7) - 0.5) * 52;
  const oy = (s(8) - 0.5) * 36;
  const w = 5 + (i % 5);
  const h = 7 + (i % 4);
  return { dx, dy, spin, delay, dur, hue, ox, oy, w, h, id: i, origin };
}

export function QuestXpCelebration({
  open,
  onOpenChange,
  xpGain,
  coinGain,
  levelRewards,
  titlesUnlocked,
  badgesUnlocked,
  onContinue,
}: Props) {
  const t = useTranslations('AppQuest');
  const reducedMotion = usePrefersReducedMotion();
  const breakdownRows = useMemo(() => xpBreakdownRowsFr(xpGain.breakdown), [xpGain.breakdown]);
  const coinRows = useMemo(
    () =>
      coinGain
        ? coinBreakdownRowsFr(coinGain.breakdown, {
            fromBadges: coinGain.fromBadges,
            fromLevels: coinGain.fromLevels,
          })
        : [],
    [coinGain],
  );
  const paidLevels = useMemo(
    () => (levelRewards ?? []).filter((r) => r.coins > 0 || r.titleId != null || r.dailyRerolls != null),
    [levelRewards],
  );
  const newTitles = useMemo(
    () => (titlesUnlocked ?? []).map((id) => TITLES_REGISTRY[id]).filter((d) => d != null),
    [titlesUnlocked],
  );

  const levelInfo = useMemo(() => {
    const before = levelFromTotalXp(xpGain.previousTotal);
    const after = levelFromTotalXp(xpGain.newTotal);
    return {
      beforeLevel: before.level,
      afterLevel: after.level,
      leveledUp: after.level > before.level,
      levelsGained: Math.max(0, after.level - before.level),
    };
  }, [xpGain.newTotal, xpGain.previousTotal]);

  const [barLevel, setBarLevel] = useState(() => levelFromTotalXp(xpGain.previousTotal).level);
  const [barPct, setBarPct] = useState(
    () => (levelFromTotalXp(xpGain.previousTotal).xpIntoLevel / XP_PER_LEVEL) * 100,
  );
  const [barInstant, setBarInstant] = useState(false);

  useEffect(() => {
    if (!open) return;
    const start = levelFromTotalXp(xpGain.previousTotal);
    const end = levelFromTotalXp(xpGain.newTotal);
    const segments = xpBarSegmentsFromTotals(xpGain.previousTotal, xpGain.newTotal);

    if (reducedMotion) {
      setBarInstant(true);
      setBarLevel(end.level);
      setBarPct((end.xpIntoLevel / XP_PER_LEVEL) * 100);
      return;
    }

    setBarLevel(start.level);
    setBarPct((start.xpIntoLevel / XP_PER_LEVEL) * 100);

    let cancelled = false;
    void (async () => {
      for (const seg of segments) {
        if (cancelled) return;
        setBarLevel(seg.level);
        setBarInstant(true);
        setBarPct(seg.fromPct * 100);
        await new Promise<void>((r) => requestAnimationFrame(() => r()));
        await new Promise<void>((r) => requestAnimationFrame(() => r()));
        if (cancelled) return;
        setBarInstant(false);
        setBarPct(seg.toPct * 100);
        const dur = Math.abs(seg.toPct - seg.fromPct) < 1e-6 ? 0 : 720;
        await new Promise<void>((r) => setTimeout(r, dur));
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [open, xpGain.previousTotal, xpGain.newTotal, reducedMotion]);

  const xpIntoDisplay = Math.round((barPct / 100) * XP_PER_LEVEL);

  const particles = useMemo(() => {
    if (reducedMotion) return [];
    const n = 36;
    return [
      ...Array.from({ length: n }, (_, i) => confettiParticle(i, 'center')),
      ...Array.from({ length: n }, (_, i) => confettiParticle(n + i, 'high')),
    ];
  }, [reducedMotion]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center p-4">
      <button
        type="button"
        className="quest-modal-backdrop absolute inset-0 cursor-pointer motion-safe:animate-fadeIn motion-reduce:animate-none"
        style={{ background: 'rgba(12, 10, 9, 0.88)' }}
        aria-label="Fermer"
        onClick={() => onOpenChange(false)}
      />
      {/* Impact plein écran (style « boss vaincu ») */}
      {!reducedMotion ? (
        <div
          className="pointer-events-none absolute inset-0 z-[56] bg-[color-mix(in_srgb,var(--gold)_28%,transparent)] motion-safe:animate-quest-victory-screen-flash motion-reduce:hidden"
          aria-hidden
        />
      ) : null}
      <div className="motion-safe:animate-quest-modal-shake motion-reduce:animate-none relative z-[60] flex w-full max-w-md justify-center">
        <div
          className="relative isolate w-full overflow-hidden rounded-3xl border border-[var(--border-ui-strong)] bg-[var(--card)] shadow-[0_2px_8px_-2px_color-mix(in_srgb,var(--text)_14%,transparent)] motion-safe:animate-quest-modal-pop motion-reduce:animate-none"
          role="dialog"
          aria-modal="true"
          aria-labelledby="xp-celebration-title"
        >
        {/* Anneaux d'impact */}
        {!reducedMotion ? (
          <div className="pointer-events-none absolute left-1/2 top-[36%] z-0 h-48 w-48 -translate-x-1/2 -translate-y-1/2 motion-reduce:hidden" aria-hidden>
            <div className="absolute inset-0 rounded-full border-2 border-[var(--gold)]/45 motion-safe:animate-quest-ring-pulse motion-reduce:hidden [animation-delay:0ms]" />
            <div className="absolute inset-0 rounded-full border border-[var(--violet)]/35 motion-safe:animate-quest-ring-pulse motion-reduce:hidden [animation-delay:120ms]" />
            <div className="absolute inset-[-12px] rounded-full border border-[var(--orange)]/25 motion-safe:animate-quest-ring-pulse motion-reduce:hidden [animation-delay:220ms]" />
          </div>
        ) : null}

        {/* Confettis */}
        {!reducedMotion && particles.length > 0 ? (
          <div
            className="pointer-events-none absolute inset-0 z-[1] overflow-hidden rounded-3xl motion-reduce:hidden"
            aria-hidden
          >
            {particles.map((p) => (
              <span
                key={`${p.origin}-${p.id}`}
                className="absolute left-1/2 rounded-[2px] motion-safe:animate-celebrate-confetti"
                style={{
                  top: p.origin === 'high' ? '18%' : '38%',
                  width: p.w,
                  height: p.h,
                  marginLeft: p.ox,
                  marginTop: p.oy,
                  backgroundColor: `hsl(${p.hue} 82% 52%)`,
                  boxShadow: '0 0 0 1px rgba(255,255,255,0.35)',
                  ['--dx' as string]: `${p.dx}px`,
                  ['--dy' as string]: `${p.dy}px`,
                  ['--spin' as string]: `${p.spin}deg`,
                  animationDelay: p.delay,
                  animationDuration: p.dur,
                }}
              />
            ))}
          </div>
        ) : null}

        <div className="relative z-[1] h-1 bg-[var(--orange)]" />

        <div className="relative z-[1] p-7">
          <p
            id="xp-celebration-title"
            className="text-center font-display text-sm font-bold tracking-tight text-[var(--violet)] motion-safe:animate-modal-fade motion-reduce:opacity-100 [animation-delay:60ms] [animation-fill-mode:backwards]"
          >
            {t('completedTitle')}
          </p>

          {levelInfo.leveledUp ? (
            <div
              className="relative mt-4 flex flex-col items-center justify-center rounded-2xl border border-[var(--gold)] bg-[color-mix(in_srgb,var(--gold)_8%,var(--card))] px-4 py-4 text-center motion-safe:animate-level-banner-in motion-reduce:animate-none [animation-delay:90ms] [animation-fill-mode:backwards]"
            >
              <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-[var(--gold)]">Niveau atteint</span>
              <p className="mt-1 font-display text-4xl font-bold tabular-nums tracking-tight text-[var(--text)] motion-safe:animate-xp-number-pop motion-reduce:animate-none [animation-delay:180ms] [animation-fill-mode:backwards]">
                {levelInfo.afterLevel}
              </p>
              {levelInfo.levelsGained > 1 ? (
                <p className="mt-1 text-xs font-bold text-[var(--gold)]">
                  +{levelInfo.levelsGained} niveaux d'un coup !
                </p>
              ) : (
                <p className="mt-1 text-xs font-bold text-[var(--muted)]">Palier de progression débloqué</p>
              )}
            </div>
          ) : null}

          <p
            className={`text-center font-display text-4xl font-bold text-[var(--text)] motion-safe:animate-xp-number-pop motion-reduce:animate-none tabular-nums ${
              levelInfo.leveledUp ? 'mt-4' : 'mt-3'
            } [animation-delay:120ms] [animation-fill-mode:backwards]`}
          >
            +{xpGain.gained} XP
          </p>
          <p className="mt-2 text-center text-sm font-semibold text-[var(--muted)]">
            Total {xpGain.previousTotal} →{' '}
            <span className="font-bold text-[var(--violet)]">{xpGain.newTotal}</span>
          </p>

          {coinGain && coinGain.gained > 0 ? (
            <div className="mt-4 flex items-center justify-center gap-3 rounded-2xl border border-[var(--gold)] bg-[color-mix(in_srgb,var(--gold)_9%,var(--card))] px-4 py-3 motion-safe:animate-xp-number-pop motion-reduce:animate-none [animation-delay:150ms] [animation-fill-mode:backwards]">
              <Icon name="Coins" size="lg" className="text-[var(--gold)]" />
              <div className="text-left">
                <p className="font-display text-2xl font-bold tabular-nums leading-none text-[var(--text)]">
                  +{coinGain.gained} QC
                </p>
                <p className="mt-1 text-[11px] font-semibold text-[var(--muted)]">
                  Solde {coinGain.previousBalance} →{' '}
                  <span className="font-bold text-[var(--gold)]">{coinGain.newBalance}</span>
                </p>
              </div>
            </div>
          ) : null}

          <div
            className="mt-5 rounded-2xl border border-[var(--border-cyan)] bg-[var(--surface)] px-4 py-3 motion-safe:animate-modal-fade motion-reduce:opacity-100 [animation-delay:160ms] [animation-fill-mode:backwards]"
            role="group"
            aria-label="Progression dans le niveau actuel"
          >
            <div className="flex flex-wrap items-baseline justify-between gap-2 text-xs font-bold text-[var(--text)]">
              <span>Niveau {barLevel}</span>
              <span className="tabular-nums text-[var(--muted)]">
                {xpIntoDisplay}/{XP_PER_LEVEL} XP dans ce niveau
              </span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full border border-[var(--border-ui-strong)] bg-[color:var(--progress-track)]">
              <div
                className="h-full rounded-full bg-[var(--violet)] motion-reduce:transition-none"
                style={{
                  width: `${barPct}%`,
                  transition:
                    reducedMotion || barInstant
                      ? 'none'
                      : 'width 700ms cubic-bezier(0.22, 1, 0.36, 1)',
                }}
              />
            </div>
            <p className="mt-2 text-[10px] font-semibold leading-snug text-[var(--subtle)]">
              Même barre que sur l'accueil : elle se remplit dans ton niveau actuel, puis repart à zéro si tu passes au
              niveau suivant.
            </p>
          </div>

          <div className="mt-5 motion-safe:animate-modal-fade motion-reduce:opacity-100 [animation-delay:200ms] [animation-fill-mode:backwards]">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--violet)]">Comment ces XP sont calculés</p>
            <ul className="mt-3 space-y-2.5">
              {breakdownRows.map((row) => (
                <li
                  key={row.key}
                  className="rounded-xl border border-[var(--border-ui)] bg-[var(--surface)] px-3 py-2.5"
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-x-2 gap-y-1">
                    <span className="text-[11px] font-bold uppercase tracking-wide text-[var(--violet)]">{row.label}</span>
                    <span className="text-sm font-bold tabular-nums text-[var(--text)]">{row.value}</span>
                  </div>
                  <p className="mt-1.5 text-[11px] font-medium leading-relaxed text-[var(--muted)]">
                    {row.detail}
                  </p>
                </li>
              ))}
            </ul>
          </div>

          {coinRows.length > 0 ? (
            <div className="mt-5 motion-safe:animate-modal-fade motion-reduce:opacity-100 [animation-delay:220ms] [animation-fill-mode:backwards]">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--gold)]">
                Comment ces Quest Coins sont calculés
              </p>
              <ul className="mt-3 space-y-2.5">
                {coinRows.map((row) => (
                  <li
                    key={row.key}
                    className="rounded-xl border border-[var(--border-ui)] bg-[var(--surface)] px-3 py-2.5"
                  >
                    <div className="flex flex-wrap items-baseline justify-between gap-x-2 gap-y-1">
                      <span className="text-[11px] font-bold uppercase tracking-wide text-[var(--gold)]">{row.label}</span>
                      <span className="text-sm font-bold tabular-nums text-[var(--text)]">{row.value}</span>
                    </div>
                    <p className="mt-1.5 text-[11px] font-medium leading-relaxed text-[var(--muted)]">{row.detail}</p>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {paidLevels.length > 0 ? (
            <div className="mt-5 space-y-2 motion-safe:animate-modal-fade motion-reduce:opacity-100 [animation-delay:250ms] [animation-fill-mode:backwards]">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--gold)]">Paliers franchis</p>
              <ul className="space-y-2">
                {paidLevels.map((r) => (
                  <li
                    key={r.level}
                    className="flex items-center gap-3 rounded-xl border border-[var(--border-ui)] bg-[var(--surface)] px-3 py-2.5"
                  >
                    <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl border border-[var(--gold)] bg-[color-mix(in_srgb,var(--gold)_10%,transparent)] font-display text-sm font-bold tabular-nums text-[var(--gold)]">
                      {r.level}
                    </span>
                    <p className="text-xs font-semibold text-[var(--text)]">{levelRewardSummaryFr(r)}</p>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {newTitles.length > 0 ? (
            <div className="mt-5 space-y-2 motion-safe:animate-modal-fade motion-reduce:opacity-100 [animation-delay:270ms] [animation-fill-mode:backwards]">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--violet)]">Nouveaux titres</p>
              <ul className="space-y-2">
                {newTitles.map((def) => (
                  <li
                    key={def.id}
                    className="flex items-center gap-3 rounded-xl border border-[var(--border-cyan)] bg-[var(--surface)] px-3 py-2.5"
                  >
                    <Icon name={def.icon} size="md" className="text-[var(--violet)]" />
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-[var(--text)]">{def.label}</p>
                      <p className="text-[11px] font-medium text-[var(--muted)]">Équipable depuis ton profil.</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {badgesUnlocked.length > 0 ? (
            <div className="mt-5 space-y-3">
              <p className="text-xs font-bold uppercase tracking-wider text-[var(--orange)] motion-safe:animate-modal-fade motion-reduce:opacity-100 [animation-delay:240ms] [animation-fill-mode:backwards]">
                Nouveaux badges
              </p>
              <ul className="space-y-2">
                {badgesUnlocked.map((b, i) => (
                  <li
                    key={b.id}
                    className="flex gap-3 rounded-2xl border border-[var(--border-ui-strong)] bg-[var(--surface)] p-3 motion-safe:animate-badge-reveal motion-reduce:opacity-100"
                    style={{
                      animationDelay: reducedMotion ? '0ms' : `${280 + i * 95}ms`,
                      animationFillMode: 'backwards',
                    }}
                  >
                    <span
                      className="relative flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl border border-[var(--gold)] bg-[color-mix(in_srgb,var(--gold)_10%,transparent)] motion-safe:animate-xp-number-pop motion-reduce:animate-none"
                      style={{ animationDelay: reducedMotion ? '0ms' : `${300 + i * 95}ms` }}
                      aria-hidden
                    >
                      <Icon name={b.placeholderIcon} size="lg" className="text-[var(--gold)]" />
                    </span>
                    <div className="min-w-0">
                      <p className="font-bold text-[var(--text)]">{b.title}</p>
                      <p className="text-xs font-medium text-[var(--muted)]">{b.criteria}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <button
            type="button"
            className="btn btn-cta btn-lg mt-6 w-full text-base font-bold motion-safe:animate-modal-fade motion-reduce:opacity-100 [animation-delay:420ms] [animation-fill-mode:backwards]"
            onClick={() => {
              onContinue();
              onOpenChange(false);
            }}
          >
            Continuer →
          </button>
        </div>
      </div>
      </div>
    </div>
  );
}
