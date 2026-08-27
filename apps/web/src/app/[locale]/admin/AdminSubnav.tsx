'use client';

import { Link, usePathname } from '@/i18n/navigation';

/** Onglet : filet 1px, aplat, l'encre porte l'état actif. */
const tabClass = (active: boolean) =>
  `rounded-xl border px-4 py-2.5 text-sm font-semibold transition-colors duration-200 sm:px-5 ${
    active
      ? 'border-[var(--violet)] bg-[var(--card)] text-[var(--text)]'
      : 'border-[var(--border-ui)] bg-transparent text-[var(--muted)] hover:border-[var(--border-cyan)] hover:bg-[var(--surface)] hover:text-[var(--text)]'
  }`;

export function AdminSubnav() {
  const pathname = usePathname();
  const isIntervention = pathname === '/admin';
  const isStats = pathname === '/admin/stats';
  const isQuests = pathname === '/admin/quests';

  return (
    <nav className="mb-8 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3" aria-label="Sections console">
      <Link href="/admin" className={tabClass(isIntervention)} prefetch>
        Intervention &amp; prise de compte
      </Link>
      <Link href="/admin/stats" className={tabClass(isStats)} prefetch>
        Statistiques globales
      </Link>
      <Link href="/admin/quests" className={tabClass(isQuests)} prefetch>
        Taxonomie des quêtes
      </Link>
    </nav>
  );
}
