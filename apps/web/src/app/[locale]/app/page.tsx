import { auth } from '@clerk/nextjs/server';
import { isValidQuestDateIso } from '@questia/shared';
import type { AppLocale } from '@questia/shared';
import { loadDailyQuestState } from '@/lib/quest/dailyQuest';
import AppQuestClient from './AppQuestClient';

export const dynamic = 'force-dynamic';

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function firstParam(v: string | string[] | undefined): string | null {
  if (Array.isArray(v)) return v[0] ?? null;
  return v ?? null;
}

/**
 * Accueil de l'espace connecté. La quête du jour est lue ici, pendant le rendu, plutôt que
 * par un `fetch` déclenché après hydratation : le HTML part déjà rempli et le cas courant
 * (quête déjà en base) n'a plus d'aller-retour client du tout.
 *
 * Seul ce cas est traité côté serveur. Un profil manquant ou une quête à générer restent au
 * client : la génération dépend de la position du visiteur et prend plusieurs secondes
 * (appel LLM), ce qui bloquerait le rendu au lieu d'afficher l'écran de chargement.
 */
export default async function AppPage({ params, searchParams }: Props) {
  const [{ locale }, sp, { userId }] = await Promise.all([params, searchParams, auth()]);
  const appLocale: AppLocale = locale === 'en' ? 'en' : 'fr';

  const raw = firstParam(sp.questDate) ?? firstParam(sp.date);
  const questDate = raw && isValidQuestDateIso(raw) ? raw : null;

  const state = userId ? await loadDailyQuestState(userId, appLocale, questDate) : null;

  return <AppQuestClient initialQuest={state?.kind === 'cached' ? state.quest : null} />;
}
