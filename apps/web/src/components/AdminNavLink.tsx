'use client';

import { Link, usePathname } from '@/i18n/navigation';
import { useEffect, useState } from 'react';

/** Accès console admin (GET /api/profile → role). */
export function AdminNavLink({ variant = 'toolbar' }: { variant?: 'toolbar' | 'drawer' }) {
  const pathname = usePathname();
  const [show, setShow] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void fetch('/api/profile', { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then((d: { role?: string } | null) => {
        if (!cancelled && d?.role === 'admin') setShow(true);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  if (!show || pathname?.startsWith('/admin')) return null;

  const placement =
    variant === 'toolbar' ? 'hidden md:inline-flex' : 'mt-5 inline-flex w-full min-w-0 justify-center py-2.5';

  return (
    <Link href="/admin" className={`admin-console-link ${placement}`} title="Console d'administration">
      Console
    </Link>
  );
}
