'use client';

import { useCallback, useEffect, useId, useMemo, useState, type ReactNode } from 'react';
import {
  Area,
  Bar,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { TooltipProps } from 'recharts';
import type { GlobalStatsPayload, ShopMetricsMode } from '@/lib/admin/globalStats';
import { Icon } from '@/components/Icons';
import { QUEST_STATUSES } from '@/lib/admin/globalStats';

const STATUT_LEGENDE: Record<string, string> = {
  pending: 'En attente',
  accepted: 'Acceptée',
  completed: 'Terminée',
  rejected: 'Refusée',
  replaced: 'Remplacée',
  abandoned: 'Abandonnée',
};

/** Palette plus riche, lisible sur fond clair */
const STATUT_COULEUR: Record<string, string> = {
  pending: '#78716c',
  accepted: '#134e4a',
  completed: '#166534',
  rejected: '#b91c1c',
  replaced: '#92400e',
  abandoned: '#c2410c',
};

const CHART_GRID = 'rgba(28, 25, 23, 0.08)';
const AXIS_TICK = { fill: '#78716c', fontSize: 11, fontWeight: 500 as const };

function formatEur(cents: number) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(cents / 100);
}

function formatCourtDate(iso: string) {
  const [, m, d] = iso.split('-');
  return `${d}/${m}`;
}

function ChartTooltip({ active, payload, label }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null;
  const dateRow = payload[0]?.payload as { date?: string } | undefined;
  const title = (dateRow?.date as string | undefined) ?? label ?? '';
  return (
    <div className="max-w-xs rounded-2xl border border-[var(--border-ui-strong)] bg-[color-mix(in_srgb,var(--card)_92%,transparent)] px-4 py-3 shadow-[0_2px_8px_-2px_color-mix(in_srgb,var(--text)_14%,transparent)] backdrop-blur-md">
      {title ? (
        <p className="border-b border-[var(--border-ui)] pb-2 font-mono text-[11px] font-semibold text-[var(--subtle)]">{title}</p>
      ) : null}
      <ul className="mt-2 space-y-1.5">
        {payload.map((p) => (
          <li key={String(p.dataKey ?? p.name)} className="flex items-center justify-between gap-4 text-sm">
            <span className="flex min-w-0 items-center gap-2 text-[var(--text)]">
              <span className="h-2.5 w-2.5 shrink-0 rounded-full shadow-sm" style={{ background: p.color }} />
              <span className="truncate">{p.name}</span>
            </span>
            <span className="shrink-0 font-mono font-semibold tabular-nums text-[var(--text)]">
              {typeof p.value === 'number' ? p.value.toLocaleString('fr-FR') : p.value}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ChartTooltipShop({
  active,
  payload,
  label,
  mode,
}: {
  active?: boolean;
  payload?: ReadonlyArray<{ value?: unknown; payload?: unknown }>;
  label?: string | number;
  mode: ShopMetricsMode;
}) {
  if (!active || !payload?.length) return null;
  const dateRow = payload[0]?.payload as { date?: string } | undefined;
  const title = (dateRow?.date as string | undefined) ?? (label != null ? String(label) : '');
  const v = payload[0]?.value;
  const n = typeof v === 'number' ? v : 0;
  return (
    <div className="rounded-2xl border border-[var(--border-ui-strong)] bg-[color-mix(in_srgb,var(--card)_92%,transparent)] px-4 py-3 shadow-[0_2px_8px_-2px_color-mix(in_srgb,var(--text)_14%,transparent)] backdrop-blur-md">
      {title ? <p className="font-mono text-[11px] font-semibold text-[var(--subtle)]">{title}</p> : null}
      {mode === 'eur' ? (
        <>
          <p className="mt-1 font-display text-lg font-bold text-[var(--green)]">{formatEur(n * 100)}</p>
          <p className="text-xs text-[var(--subtle)]">Argent réel encaissé (Stripe, jour)</p>
        </>
      ) : (
        <>
          <p className="mt-1 font-display text-lg font-bold text-[var(--gold)]">
            {Math.round(n).toLocaleString('fr-FR')} <span className="text-sm font-semibold text-[var(--gold)]">QC</span>
          </p>
          <p className="text-xs text-[var(--subtle)]">Dépenses en Quest Coins (jour)</p>
        </>
      )}
    </div>
  );
}

function ChartShell({
  icon,
  title,
  subtitle,
  children,
  className = '',
}: {
  /** Nom d'icône Lucide (PascalCase) */
  icon: string;
  title: string;
  subtitle: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-[var(--border-ui)] bg-[var(--card)] p-1 shadow-[0_1px_2px_color-mix(in_srgb,var(--text)_6%,transparent)] ${className}`}
    >
      <div className="relative rounded-[0.9rem] bg-white/80 p-5 backdrop-blur-sm sm:p-6">
        <div className="mb-4 flex flex-wrap items-start gap-3 sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-start gap-3">
            <span
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[var(--border-cyan)] bg-[color-mix(in_srgb,var(--green)_10%,var(--card))]"
              aria-hidden
            >
              <Icon name={icon} size="lg" className="text-[var(--green)]" />
            </span>
            <div className="min-w-0">
              <h3 className="font-display text-lg font-bold leading-tight text-[var(--text)]">{title}</h3>
              <p className="mt-1 text-sm font-semibold leading-snug text-[var(--muted)]">{subtitle}</p>
            </div>
          </div>
        </div>
        <div className="min-h-0 w-full">{children}</div>
      </div>
    </div>
  );
}

function KpiMini({
  label,
  value,
  sub,
  tone,
}: {
  label: string;
  value: string;
  sub: string;
  tone: 'emerald' | 'cyan' | 'violet' | 'amber';
}) {
  /* Aplat teinté, une couleur par ton. Branches littérales pour le JIT Tailwind. */
  const bg =
    tone === 'emerald'
      ? 'border-[color:color-mix(in_srgb,var(--green)_28%,var(--border-ui))] bg-[color-mix(in_srgb,var(--green)_8%,var(--card))]'
      : tone === 'cyan'
        ? 'border-[var(--border-cyan)] bg-[color-mix(in_srgb,var(--violet)_8%,var(--card))]'
        : tone === 'violet'
          ? 'border-[color:color-mix(in_srgb,var(--gold)_28%,var(--border-ui))] bg-[color-mix(in_srgb,var(--gold)_8%,var(--card))]'
          : 'border-[color:color-mix(in_srgb,var(--orange)_28%,var(--border-ui))] bg-[color-mix(in_srgb,var(--orange)_8%,var(--card))]';
  return (
    <div className={`rounded-2xl border px-4 py-3 ${bg}`}>
      <p className="carnet-eyebrow">{label}</p>
      <p className="mt-1 font-display text-2xl font-bold tabular-nums tracking-tight text-[var(--text)]">{value}</p>
      <p className="mt-0.5 text-xs text-[var(--muted)]">{sub}</p>
    </div>
  );
}

export default function AdminStatsSection() {
  const uid = useId().replace(/:/g, '');
  const gradCa = `ca-${uid}`;
  const gradBarIns = `barIns-${uid}`;
  const gradLineStroke = `lineStroke-${uid}`;

  const [presetDays, setPresetDays] = useState(30);
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');
  const [rangeMode, setRangeMode] = useState<'preset' | 'custom'>('preset');
  const [shopMode, setShopMode] = useState<ShopMetricsMode>('eur');
  const [stats, setStats] = useState<GlobalStatsPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const fetchStats = useCallback(async (qs: URLSearchParams) => {
    setLoading(true);
    setErr(null);
    try {
      const res = await fetch(`/api/admin/stats?${qs}`, { cache: 'no-store' });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error((j as { error?: string }).error ?? `Réponse ${res.status}`);
      setStats(j as GlobalStatsPayload);
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Erreur');
      setStats(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (rangeMode === 'custom' && (!customFrom || !customTo || customFrom > customTo)) return;
    const qs = new URLSearchParams();
    if (rangeMode === 'custom' && customFrom && customTo && customFrom <= customTo) {
      qs.set('from', customFrom);
      qs.set('to', customTo);
    } else {
      qs.set('days', String(presetDays));
    }
    qs.set('shopMode', shopMode);
    void fetchStats(qs);
  }, [rangeMode, customFrom, customTo, presetDays, shopMode, fetchStats]);

  const chartRows = useMemo(() => {
    if (!stats) return [];
    return stats.dayLabels.map((date, i) => {
      const row: Record<string, string | number> = { date, court: formatCourtDate(date) };
      row.inscriptions = stats.signupsPerDay[i];
      row.cumulComptes = stats.signupsCumulativeEndOfDay[i];
      const primary = stats.shopPrimaryPerDay[i] ?? 0;
      row.shopSeries = stats.shopMode === 'eur' ? primary / 100 : primary;
      for (const st of QUEST_STATUSES) {
        row[st] = stats.questsByStatusPerDay[i][st];
      }
      return row;
    });
  }, [stats]);

  const totalsPie = useMemo(() => {
    if (!stats) return [];
    return QUEST_STATUSES.map((st) => ({
      name: STATUT_LEGENDE[st] ?? st,
      value: stats.questsTotalsInRange[st] ?? 0,
      key: st,
    })).filter((x) => x.value > 0);
  }, [stats]);

  const kpiSums = useMemo(() => {
    if (!stats) return null;
    const signups = stats.signupsPerDay.reduce((a, b) => a + b, 0);
    const completions = stats.questsTotalsInRange.completed ?? 0;
    const questLines = Object.values(stats.questsTotalsInRange).reduce((a, b) => a + b, 0);
    return { signups, completions, questLines };
  }, [stats]);

  const pieData = useMemo(
    () => totalsPie.map((t) => ({ name: t.name, value: t.value, key: t.key })),
    [totalsPie],
  );

  return (
    <section className="rounded-[1.75rem] border border-[color:color-mix(in_srgb,var(--green)_28%,var(--border-ui))] bg-[var(--card)] p-6 shadow-[0_1px_2px_color-mix(in_srgb,var(--text)_6%,transparent)] sm:p-8">

      <div className="relative mb-8">
        <p className="carnet-eyebrow inline-flex items-center gap-2">
          <Icon name="BarChart3" size="sm" className="text-[var(--green)]" aria-hidden />
          Séries temporelles
        </p>
        <h2 className="font-display mt-2 text-xl font-bold tracking-tight text-[var(--text)] sm:text-2xl">
          ② · Graphiques &amp; tendances
        </h2>
        <p className="mt-2 max-w-2xl text-sm font-semibold leading-relaxed text-[var(--muted)]">
          Inscriptions, quêtes par statut, boutique et tendances — période en UTC.
        </p>

        <div className="mt-6 rounded-2xl border border-[var(--border-ui-strong)] bg-[var(--surface)] p-4 sm:p-5">
          <div className="flex flex-col gap-5">
            <div>
              <p className="carnet-eyebrow">Plage</p>
              <div className="mt-2 -mx-1 overflow-x-auto px-1 pb-0.5 [scrollbar-width:thin]">
                <div className="flex w-max max-w-none flex-nowrap gap-1 rounded-2xl border border-[var(--border-ui-strong)] bg-[var(--card)] p-1 sm:w-full sm:max-w-full">
                  {[7, 30, 90, 365].map((d) => (
                    <button
                      key={d}
                      type="button"
                      disabled={loading}
                      onClick={() => {
                        setRangeMode('preset');
                        setPresetDays(d);
                      }}
                      className={`shrink-0 whitespace-nowrap rounded-xl px-3 py-2 text-xs font-bold transition-all sm:min-w-0 sm:flex-1 sm:px-2 sm:text-[11px] md:px-3 ${
                        rangeMode === 'preset' && presetDays === d
                          ? 'bg-[var(--green)] text-[var(--card)]'
                          : 'text-[var(--muted)] hover:bg-[var(--surface)] hover:text-[var(--text)]'
                      }`}
                    >
                      {d === 365 ? '1 an' : `${d} j.`}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="border-t border-[var(--border-ui)] pt-4">
              <p className="carnet-eyebrow">Dates au choix</p>
              <div className="mt-2 flex flex-wrap items-center gap-2 sm:gap-3">
                <input
                  type="date"
                  className="min-w-0 flex-1 rounded-xl border border-[var(--border-ui-strong)] bg-[var(--input-bg)] px-3 py-2 text-sm text-[var(--text)] focus:border-[var(--violet)] focus:outline-none focus:ring-1 focus:ring-[var(--violet)] sm:max-w-[11rem]"
                  value={customFrom}
                  onChange={(e) => setCustomFrom(e.target.value)}
                />
                <span className="shrink-0 text-[var(--subtle)]" aria-hidden>
                  →
                </span>
                <input
                  type="date"
                  className="min-w-0 flex-1 rounded-xl border border-[var(--border-ui-strong)] bg-[var(--input-bg)] px-3 py-2 text-sm text-[var(--text)] focus:border-[var(--violet)] focus:outline-none focus:ring-1 focus:ring-[var(--violet)] sm:max-w-[11rem]"
                  value={customTo}
                  onChange={(e) => setCustomTo(e.target.value)}
                />
                <button
                  type="button"
                  disabled={loading || !customFrom || !customTo || customFrom > customTo}
                  onClick={() => setRangeMode('custom')}
                  className="btn btn-primary btn-sm shrink-0"
                >
                  Appliquer
                </button>
                {rangeMode === 'custom' ? (
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm shrink-0"
                    onClick={() => setRangeMode('preset')}
                  >
                    Plages rapides
                  </button>
                ) : null}
              </div>
            </div>

            <div className="border-t border-[var(--border-ui)] pt-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                <div className="min-w-0">
                  <p className="carnet-eyebrow">Indicateurs boutique</p>
                  <p className="mt-0.5 text-[11px] font-semibold leading-snug text-[var(--muted)] sm:text-xs">
                    € encaissements réels (Stripe) · QC dépensés sur les achats en coins.
                  </p>
                </div>
                <div
                  className="flex shrink-0 flex-nowrap gap-1 rounded-2xl border border-[var(--border-ui-strong)] bg-[var(--card)] p-1"
                  role="group"
                  aria-label="Unité des montants boutique"
                >
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => setShopMode('eur')}
                    className={`shrink-0 whitespace-nowrap rounded-xl px-3 py-2 text-xs font-bold transition-all ${
                      shopMode === 'eur'
                        ? 'bg-[var(--green)] text-[var(--card)]'
                        : 'text-[var(--muted)] hover:bg-[var(--surface)] hover:text-[var(--text)]'
                    }`}
                  >
                    € EUR
                  </button>
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => setShopMode('qc')}
                    className={`shrink-0 whitespace-nowrap rounded-xl px-3 py-2 text-xs font-bold transition-all ${
                      shopMode === 'qc'
                        ? 'bg-[var(--gold)] text-[var(--card)]'
                        : 'text-[var(--muted)] hover:bg-[var(--surface)] hover:text-[var(--text)]'
                    }`}
                  >
                    QC
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {err ? (
        <p className="mb-6 rounded-2xl border border-[var(--red)] bg-[color-mix(in_srgb,var(--red)_7%,var(--card))] px-4 py-3 text-sm font-semibold text-[var(--red)]">
          {err}
        </p>
      ) : null}

      {loading && !stats ? (
        <div className="flex min-h-[220px] flex-col items-center justify-center gap-4 rounded-2xl border border-[var(--border-ui)] bg-[var(--surface)] py-16">
          <div className="relative h-12 w-12">
            <div className="absolute inset-1 animate-spin rounded-full border-2 border-[var(--border-ui-strong)] border-t-[var(--green)]" />
          </div>
          <p className="text-sm font-bold text-[var(--muted)]">Chargement des graphiques…</p>
        </div>
      ) : null}

      {stats && kpiSums ? (
        <div className="relative space-y-8">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[var(--border-ui)] bg-[var(--surface)] px-4 py-3 sm:px-5">
            <p className="text-sm font-semibold text-[var(--text)]">
              <span className="text-[var(--muted)]">Période :</span>{' '}
              <time dateTime={stats.from} className="font-mono text-[var(--green)]">
                {new Date(stats.from + 'T12:00:00Z').toLocaleDateString('fr-FR')}
              </time>
              <span className="mx-2 text-[var(--muted)]">—</span>
              <time dateTime={stats.to} className="font-mono text-[var(--green)]">
                {new Date(stats.to + 'T12:00:00Z').toLocaleDateString('fr-FR')}
              </time>
              <span className="ml-2 text-xs font-semibold text-[var(--muted)]">
                ({stats.dayLabels.length} jour{stats.dayLabels.length > 1 ? 's' : ''})
              </span>
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <KpiMini
              label={stats.shopMode === 'eur' ? 'Encaissements réels (période)' : 'QC dépensés (période)'}
              value={
                stats.shopMode === 'eur'
                  ? formatEur(stats.shopTotalPrimary)
                  : `${stats.shopTotalPrimary.toLocaleString('fr-FR')} QC`
              }
              sub={`${stats.shopPaidTransactionCount} transaction${stats.shopPaidTransactionCount > 1 ? 's' : ''}`}
              tone="emerald"
            />
            <KpiMini
              label="Inscriptions (période)"
              value={kpiSums.signups.toLocaleString('fr-FR')}
              sub="nouveaux profils sur la plage"
              tone="cyan"
            />
            <KpiMini
              label="Lignes quête (période)"
              value={kpiSums.questLines.toLocaleString('fr-FR')}
              sub="tous statuts confondus"
              tone="violet"
            />
            <KpiMini
              label="Quêtes terminées"
              value={kpiSums.completions.toLocaleString('fr-FR')}
              sub="complétions sur la plage"
              tone="amber"
            />
          </div>

          <ChartShell
            icon="Users"
            title="Inscriptions & base joueurs"
            subtitle="Barres : nouveaux comptes par jour · Courbe : total cumulé des profils à la fin de chaque jour."
          >
            <div className="h-[300px] w-full min-w-0 sm:h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartRows} margin={{ top: 12, right: 12, left: 4, bottom: 4 }}>
                  <defs>
                    <linearGradient id={gradBarIns} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#2f7d4f" />
                      <stop offset="100%" stopColor="#166534" />
                    </linearGradient>
                    <linearGradient id={gradLineStroke} x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#134e4a" />
                      <stop offset="100%" stopColor="#2a7d75" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke={CHART_GRID} strokeDasharray="4 8" vertical={false} />
                  <XAxis
                    dataKey="court"
                    tick={AXIS_TICK}
                    tickLine={false}
                    axisLine={{ stroke: CHART_GRID }}
                    interval="preserveStartEnd"
                    minTickGap={28}
                  />
                  <YAxis
                    yAxisId="left"
                    tick={AXIS_TICK}
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                    width={36}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    tick={AXIS_TICK}
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                    width={40}
                  />
                  <Tooltip content={<ChartTooltip />} />
                  <Legend
                    wrapperStyle={{ paddingTop: 16 }}
                    formatter={(value) => <span className="text-sm text-[var(--text)]">{value}</span>}
                  />
                  <Bar
                    yAxisId="left"
                    dataKey="inscriptions"
                    name="Inscriptions (jour)"
                    fill={`url(#${gradBarIns})`}
                    radius={[6, 6, 0, 0]}
                    maxBarSize={48}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="cumulComptes"
                    name="Total comptes (fin de jour)"
                    stroke={`url(#${gradLineStroke})`}
                    strokeWidth={3}
                    dot={false}
                    activeDot={{ r: 5, strokeWidth: 2, stroke: '#faf8f4' }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </ChartShell>

          <div className="grid gap-6 lg:grid-cols-5">
            <div className="lg:col-span-3">
              <ChartShell
                icon="Layers"
                title="Quêtes par statut"
                subtitle="Empilement journalier (une ligne par joueur et par jour). La couleur « Terminée » donne déjà les complétions du jour — pas de second graphique pour éviter le doublon."
              >
                <div className="h-[340px] w-full min-w-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={chartRows} margin={{ top: 12, right: 12, left: 4, bottom: 4 }}>
                      <CartesianGrid stroke={CHART_GRID} strokeDasharray="4 8" vertical={false} />
                      <XAxis
                        dataKey="court"
                        tick={AXIS_TICK}
                        tickLine={false}
                        axisLine={{ stroke: CHART_GRID }}
                        interval="preserveStartEnd"
                        minTickGap={22}
                      />
                      <YAxis tick={AXIS_TICK} tickLine={false} axisLine={false} allowDecimals={false} width={36} />
                      <Tooltip content={<ChartTooltip />} />
                      <Legend
                        wrapperStyle={{ paddingTop: 12 }}
                        formatter={(value) => <span className="text-xs text-[var(--text)]">{value}</span>}
                      />
                      {QUEST_STATUSES.map((st, idx) => (
                        <Bar
                          key={st}
                          dataKey={st}
                          stackId="q"
                          name={STATUT_LEGENDE[st] ?? st}
                          fill={STATUT_COULEUR[st]}
                          radius={idx === QUEST_STATUSES.length - 1 ? [5, 5, 0, 0] : [0, 0, 0, 0]}
                          maxBarSize={56}
                        />
                      ))}
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </ChartShell>
            </div>
            <div className="lg:col-span-2">
              <ChartShell
                icon="PieChart"
                title="Répartition (période)"
                subtitle="Part des statuts sur le total des lignes quête dans la plage."
              >
                {pieData.length > 0 ? (
                  <div className="h-[280px] w-full sm:h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius="58%"
                          outerRadius="88%"
                          paddingAngle={2}
                          animationDuration={900}
                        >
                          {pieData.map((entry) => (
                            <Cell key={entry.key} fill={STATUT_COULEUR[entry.key]} stroke="#faf8f4" strokeWidth={2} />
                          ))}
                        </Pie>
                        <Tooltip
                          content={({ active, payload }) =>
                            active && payload?.[0] ? (
                              <div className="rounded-xl border border-[var(--border-ui-strong)] bg-[var(--card)] px-3 py-2 shadow-[0_2px_8px_-2px_color-mix(in_srgb,var(--text)_14%,transparent)]">
                                <p className="font-semibold text-[var(--text)]">{payload[0].name}</p>
                                <p className="font-mono text-lg font-bold text-[var(--text)]">
                                  {(payload[0].value as number).toLocaleString('fr-FR')}
                                </p>
                              </div>
                            ) : null
                          }
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <p className="py-12 text-center text-sm font-semibold text-[var(--muted)]">Aucune donnée sur cette période.</p>
                )}
                {totalsPie.length > 0 ? (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {totalsPie.map((t) => (
                      <span
                        key={t.key}
                        className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border-ui-strong)] bg-[var(--card)] px-2.5 py-1 text-[11px] font-semibold text-[var(--text)]"
                        style={{ borderColor: STATUT_COULEUR[t.key] }}
                      >
                        <span className="h-2 w-2 rounded-full" style={{ background: STATUT_COULEUR[t.key] }} />
                        {t.name} · {t.value.toLocaleString('fr-FR')}
                      </span>
                    ))}
                  </div>
                ) : null}
              </ChartShell>
            </div>
          </div>

          <ChartShell
            icon={stats.shopMode === 'eur' ? 'Euro' : 'Coins'}
            title={stats.shopMode === 'eur' ? 'Encaissements réels (Stripe)' : 'Dépenses Quest Coins'}
            subtitle={
              stats.shopMode === 'eur'
                ? 'Somme des paiements en euros (centimes > 0), hors achats entièrement en QC.'
                : "Somme des QC débités sur les achats payés en monnaie virtuelle (pas d'argent réel)."
            }
          >
            <div className="mb-4 flex flex-wrap items-baseline gap-3">
              <span
                className={`font-display text-3xl font-bold tracking-tight ${
                  stats.shopMode === 'eur' ? 'text-[var(--green)]' : 'text-[var(--gold)]'
                }`}
              >
                {stats.shopMode === 'eur'
                  ? formatEur(stats.shopTotalPrimary)
                  : `${stats.shopTotalPrimary.toLocaleString('fr-FR')} QC`}
              </span>
              <span className="text-sm font-semibold text-[var(--muted)]">
                {stats.shopPaidTransactionCount} transaction{stats.shopPaidTransactionCount > 1 ? 's' : ''} sur la période
              </span>
            </div>
            <div className="h-[260px] w-full min-w-0 sm:h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartRows} margin={{ top: 8, right: 12, left: 4, bottom: 4 }}>
                  <defs>
                    <linearGradient id={gradCa} x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="0%"
                        stopColor={stats.shopMode === 'eur' ? '#166534' : '#92400e'}
                        stopOpacity={0.55}
                      />
                      <stop
                        offset="55%"
                        stopColor={stats.shopMode === 'eur' ? '#2f7d4f' : '#b8791f'}
                        stopOpacity={0.12}
                      />
                      <stop offset="100%" stopColor="#faf8f4" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke={CHART_GRID} strokeDasharray="4 8" vertical={false} />
                  <XAxis
                    dataKey="court"
                    tick={AXIS_TICK}
                    tickLine={false}
                    axisLine={{ stroke: CHART_GRID }}
                    interval="preserveStartEnd"
                    minTickGap={28}
                  />
                  <YAxis
                    tick={{ ...AXIS_TICK, fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) =>
                      stats.shopMode === 'eur' ? `${v} €` : `${Math.round(Number(v)).toLocaleString('fr-FR')} QC`
                    }
                  />
                  <Tooltip
                    content={(props) => (
                      <ChartTooltipShop
                        active={props.active}
                        payload={props.payload}
                        label={props.label}
                        mode={stats.shopMode}
                      />
                    )}
                  />
                  <Area
                    type="monotone"
                    dataKey="shopSeries"
                    name={stats.shopMode === 'eur' ? 'Encaissement du jour (€)' : 'QC dépensés (jour)'}
                    stroke={stats.shopMode === 'eur' ? '#166534' : '#92400e'}
                    strokeWidth={2.5}
                    fill={`url(#${gradCa})`}
                    fillOpacity={1}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </ChartShell>

          <div className="overflow-hidden rounded-2xl border border-[var(--border-ui)] bg-[var(--card)] shadow-[0_1px_2px_color-mix(in_srgb,var(--text)_6%,transparent)]">
            <div className="border-b border-[var(--border-ui)] bg-[var(--surface)] px-5 py-4 sm:px-6">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-[var(--border-cyan)] bg-[color-mix(in_srgb,var(--violet)_10%,var(--card))]">
                  <Icon name="Tag" size="md" className="text-[var(--violet)]" aria-hidden />
                </span>
                <div>
                  <h3 className="font-display text-lg font-bold text-[var(--text)]">Détail par article (SKU)</h3>
                  <p className="text-sm font-semibold text-[var(--muted)]">
                    {stats.shopMode === 'eur'
                      ? 'Montants TTC encaissés en euros (Stripe) sur la période.'
                      : 'Quest Coins dépensés par article sur la période.'}
                  </p>
                </div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[520px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--border-ui-strong)] bg-[var(--surface)]">
                    <th className="px-5 py-3.5 carnet-eyebrow">
                      Référence
                    </th>
                    <th className="px-5 py-3.5 carnet-eyebrow">
                      Libellé
                    </th>
                    <th className="px-5 py-3.5 text-right carnet-eyebrow">
                      Transactions
                    </th>
                    <th className="px-5 py-3.5 text-right carnet-eyebrow">
                      {stats.shopMode === 'eur' ? 'Montant TTC' : 'QC dépensés'}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {stats.shopBySku.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-5 py-10 text-center text-sm font-semibold text-[var(--muted)]">
                        Aucune donnée sur cette période pour ce mode.
                      </td>
                    </tr>
                  ) : (
                    stats.shopBySku.map((r, i) => (
                      <tr
                        key={`${r.sku}-${r.label}-${i}`}
                        className="border-b border-[var(--border-ui)] transition-colors hover:bg-[var(--surface)]"
                      >
                        <td className="px-5 py-3 font-mono text-xs font-semibold text-[var(--text)]">{r.sku}</td>
                        <td className="px-5 py-3 text-[var(--text)]">{r.label}</td>
                        <td className="px-5 py-3 text-right font-mono text-sm font-semibold tabular-nums text-[var(--text)]">
                          {r.count}
                        </td>
                        <td className="px-5 py-3 text-right font-mono text-sm font-semibold tabular-nums text-[var(--green)]">
                          {stats.shopMode === 'eur' ? formatEur(r.amount) : `${r.amount.toLocaleString('fr-FR')} QC`}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
