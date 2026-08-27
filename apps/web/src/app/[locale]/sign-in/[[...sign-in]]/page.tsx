import type { Metadata } from 'next';
import { SignIn } from '@clerk/nextjs';
import { Link } from '@/i18n/navigation';
import { AuthQuestShell } from '@/components/AuthQuestShell';
import { clerkAuthAppearance } from '@/lib/clerk-auth-appearance';
import { getTranslations, setRequestLocale } from 'next-intl/server';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'AuthSignIn' });
  return {
    title: t('metadataTitle'),
    description: t('metadataDescription'),
    robots: { index: false, follow: true },
  };
}

export default async function SignInPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('AuthSignIn');
  const appHome = locale === 'en' ? '/en/app' : '/app';

  return (
    <AuthQuestShell
      eyebrow={t('badge')}
      title={t('title')}
      subtitle={t('subtitle')}
      footer={
        <p className="text-sm text-[var(--muted)]">
          {t('footerPrompt')}{' '}
          <Link
            href="/sign-up"
            className="font-medium text-[var(--link-on-bg)] underline decoration-[color:color-mix(in_srgb,var(--link-on-bg)_35%,transparent)] underline-offset-[0.2em] transition-colors duration-200 hover:text-[var(--text)]"
          >
            {t('footerLink')}
          </Link>
        </p>
      }
    >
      <SignIn appearance={clerkAuthAppearance} forceRedirectUrl={appHome} />
    </AuthQuestShell>
  );
}
