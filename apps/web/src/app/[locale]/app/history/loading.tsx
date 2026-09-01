import { getTranslations } from 'next-intl/server';
import { AppRouteSkeleton } from '@/components/AppRouteSkeleton';

export default async function Loading() {
  const t = await getTranslations('AppLoading');
  return <AppRouteSkeleton label={t('label')} width="wide" cards={4} />;
}
