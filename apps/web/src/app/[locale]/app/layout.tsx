import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { InAppAnnouncementGate } from '@/components/InAppAnnouncementGate';
import { APP_CLIENT_MESSAGES, pickMessages } from '@/i18n/clientMessages';

/** Espace connecté : pas d'indexation (déjà exclu par robots.txt, renforcé ici). */
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function AppShellLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { userId } = await auth();
  const { locale } = await params;
  const prefix = locale === 'en' ? '/en' : '';
  if (!userId) {
    redirect(`${prefix}/sign-in`);
  }

  /**
   * Union des namespaces de `/app` : ce layout est le parent commun des routes de l'espace
   * connecté, donc le seul rendu qui survit à une navigation client entre elles.
   */
  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={pickMessages(messages, APP_CLIENT_MESSAGES)}>
      <InAppAnnouncementGate />
      {children}
    </NextIntlClientProvider>
  );
}
