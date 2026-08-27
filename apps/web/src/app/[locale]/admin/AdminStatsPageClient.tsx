'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { OverviewJson } from './adminOverviewTypes';
import { AdminStat } from './AdminStat';
import AdminStatsSection from './AdminStatsSection';

const STATUT_QUETE_LIB: Record<string, string> = {
  pending: 'en attente',
  accepted: 'acceptée',
  completed: 'terminée',
  rejected: 'refusée',
  replaced: 'remplacée',
  abandoned: 'abandonnée',
};

function titreStatutQuete(s: string) {
  const t = STATUT_QUETE_LIB[s] ?? s;
  return t ? t.charAt(0).toUpperCase() + t.slice(1) : s;
}

export default function AdminStatsPageClient() {
  const [data, setData] = useState<OverviewJson | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setErr(null);
    setLoading(true);
    try {
      const res = await fetch('/api/admin/overview', { cache: 'no-store' });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error((j as { error?: string }).error ?? `Réponse serveur ${res.status}`);
      setData(j as OverviewJson);
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Erreur');
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const statusEntries = useMemo(() => {
    if (!data) return [];
    return Object.entries(data.questStatusToday).sort(([a], [b]) => a.localeCompare(b));
  }, [data]);

  if (loading && !data) {
    return (
      <div className="flex min-h-[320px] flex-col items-center justify-center gap-5 rounded-[1.75rem] border border-[var(--border-ui)] bg-[var(--surface)] px-6 py-20">
        <div
          className="relative h-14 w-14"
          role="status"
          aria-label="Chargement"
        >
          <div className="absolute inset-1 animate-spin rounded-full border-[3px] border-[var(--border-ui-strong)] border-t-[var(--orange)]" />
        </div>
        <p className="text-sm text-[var(--muted)]">Chargement des statistiques…</p>
      </div>
    );
  }

  if (err && !data) {
    return (
      <div className="rounded-[1.75rem] border border-[var(--red)] bg-[color-mix(in_srgb,var(--red)_7%,var(--card))] px-6 py-8">
        <p className="font-display text-lg font-bold text-[var(--red)]">Impossible de charger les statistiques</p>
        <p className="mt-2 text-sm text-[var(--text)]">{err}</p>
      </div>
    );
  }

  const d = data!;

  return (
    <div className="space-y-8">
      <section className="rounded-[1.75rem] border border-[var(--border-cyan)] bg-[var(--card)] p-6 shadow-[0_1px_2px_color-mix(in_srgb,var(--text)_6%,transparent)] sm:p-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="carnet-eyebrow">Instantané</p>
            <h2 className="font-display mt-2 text-xl font-bold tracking-tight text-[var(--text)] sm:text-2xl">
              ① · Vue globale
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-[var(--muted)]">
              Indicateurs agrégés sur tous les joueurs — photo à la volée de l&apos;économie et de l&apos;activité.
            </p>
            <p className="mt-2 text-xs text-[var(--subtle)]">
              Mis à jour {new Date(d.generatedAt).toLocaleString('fr-FR')} · jour de référence{' '}
              <span className="font-mono text-[var(--muted)]">{d.todayUtc}</span> (UTC)
            </p>
          </div>
          <button
            type="button"
            onClick={() => void load()}
            disabled={loading}
            className="btn btn-cta btn-sm shrink-0"
          >
            {loading ? '…' : 'Rafraîchir'}
          </button>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <AdminStat label="Comptes profil" value={d.totalProfiles} hint="total enregistrés" accent="cyan" icon="User" />
          <AdminStat label="Comptes admin" value={d.adminProfilesCount} hint="rôle administrateur" accent="violet" icon="Star" />
          <AdminStat label="Inscriptions 7 j." value={d.profilesLast7Days} hint="nouveaux profils" accent="orange" icon="TrendingUp" />
          <AdminStat
            label="Quêtes générées aujourd'hui"
            value={d.questLogsForToday}
            hint={`jour ${d.todayUtc} (UTC)`}
            accent="violet"
            icon="ScrollText"
          />
          <AdminStat label="Complétions aujourd'hui" value={d.completedToday} hint="tous utilisateurs" accent="cyan" icon="Check" />
          <AdminStat label="Complétions (total)" value={d.totalCompletedQuests} hint="historique" accent="orange" icon="Trophy" />
          <AdminStat label="QC en circulation" value={d.totalCoinsInEconomy} hint="somme des soldes" accent="emerald" icon="Coins" />
          <AdminStat label="Transactions boutique" value={d.shopTransactionsCount} hint="paiements / portefeuille" accent="cyan" icon="ShoppingCart" />
          <AdminStat label="Appareils push" value={d.pushDevicesCount} hint="application mobile" accent="orange" icon="Smartphone" />
        </div>

        {statusEntries.length > 0 ? (
          <div className="mt-8 rounded-2xl border border-[var(--border-ui-strong)] bg-[var(--surface)] px-4 py-4 sm:px-5">
            <p className="carnet-eyebrow">
              Quêtes du jour par statut (UTC)
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {statusEntries.map(([status, n]) => (
                <span
                  key={status}
                  className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border-ui-strong)] bg-[var(--card)] px-3 py-1.5 font-mono text-[11px] font-semibold text-[var(--text)]"
                >
                  <span className="text-[var(--muted)]">{titreStatutQuete(status)}</span>
                  <span className="tabular-nums text-[var(--text)]">{n}</span>
                </span>
              ))}
            </div>
          </div>
        ) : null}
      </section>

      <AdminStatsSection />
    </div>
  );
}
