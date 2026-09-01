import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server';
import {
  QuestGenerationExplainer,
  type QuestFlowStep,
} from '@/components/generation-quest/QuestGenerationExplainer';
import { pickMessages } from '@/i18n/clientMessages';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'QuestGenerationPage' });
  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
    robots: { index: true, follow: true },
    openGraph: {
      title: t('metaTitle'),
      description: t('metaDescription'),
    },
  };
}

export default async function GenerationQuetesPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'QuestGenerationPage' });
  const raw = t.raw('stepsList');
  const stepsList: QuestFlowStep[] = Array.isArray(raw) ? (raw as QuestFlowStep[]) : [];

  return (
    <NextIntlClientProvider
      messages={pickMessages(await getMessages(), ['QuestGenerationPage'])}
    >
      <QuestGenerationExplainer stepsList={stepsList} />
    </NextIntlClientProvider>
  );
}
