import type { Metadata } from 'next';
import { Link } from '@/i18n/navigation';
import { redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import { isAdminClerkId } from '@/lib/auth/admin';
import { Navbar } from '@/components/Navbar';
import { AdminSubnav } from './AdminSubnav';

export const metadata: Metadata = {
  title: 'Console',
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { userId } = await auth();
  const { locale } = await params;
  const prefix = locale === 'en' ? '/en' : '';
  if (!userId) redirect(`${prefix}/sign-in`);
  const ok = userId ? await isAdminClerkId(userId) : false;
  if (!ok) redirect(`${prefix}/app`);

  return (
    <div className="min-h-screen bg-adventure">
      <Navbar />
      <div className="relative z-10 mx-auto max-w-5xl px-4 pb-20 pt-24">
        {/* En-tête carnet : filet, oeil-de-boeuf typographique, aucun aplat décoratif. */}
        <header className="mb-8 border-b border-[var(--border-ui)] pb-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
            <div className="min-w-0 flex-1">
              <p className="carnet-eyebrow">Administration</p>
              <h1 className="font-display mt-2 text-2xl font-bold tracking-tight text-[var(--text)] md:text-3xl">
                Console Questia
              </h1>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-[var(--muted)]">
                Métriques utiles et outils de test.
              </p>
            </div>
            <div className="flex shrink-0 sm:pt-1">
              <Link
                href="/app"
                className="btn btn-cta btn-md w-full font-bold sm:w-auto"
              >
                ← Retour à l&apos;app
              </Link>
            </div>
          </div>
        </header>
        <AdminSubnav />
        {children}
      </div>
    </div>
  );
}
