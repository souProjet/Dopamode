import type { Profile, QuestLog as QuestLogRow } from '@prisma/client';
import {
  capProgressView,
  effectiveOwnedThemes,
  getBadgeCatalogForUi,
  getQuestCalendarDateNow,
  isTitleEquippable,
  levelFromTotalXp,
  parseCapState,
} from '@questia/shared';
import type {
  AppLocale,
  CapProgressView,
  EscalationPhase,
  QuestModel,
  QuestRatingValue,
  RefinementQuestion,
} from '@questia/shared';
import { prisma } from '@/lib/db';
import { serializeBadges } from '@/lib/progression';
import { getRefinementSurveyPayload } from '@/lib/refinementPayload';
import { getQuestTaxonomy } from '@/lib/quest-taxonomy/cache';
import { findArchetypeById } from '@/lib/quest-taxonomy/map-prisma';
import { parseStringArray } from '@/lib/shop/parse';

/**
 * Charge utile de la quête du jour, partagée par la route API et le rendu serveur de `/app`.
 * Les champs de la base sont tous scalaires (aucun `DateTime` ici), la forme est donc
 * identique qu'elle transite par `res.json()` ou par la frontière serveur / client.
 */
export interface DailyQuest {
  id?: string;
  questDate: string;
  archetypeId: number;
  archetypeName: string;
  archetypeCategory?: string;
  emoji: string;
  title: string;
  mission: string;
  hook: string;
  duration: string;
  safetyNote: string | null;
  isOutdoor: boolean;
  city: string | null;
  weather: string | null;
  weatherTemp: number | null;
  status: QuestDisplayStatus;
  /** Retour utilisateur explicite — pilote la sélection future. */
  rating?: QuestRatingValue | null;
  questPace?: 'instant' | 'planned';
  /** Après report : date notée pour une quête plus ambitieuse (rappel) */
  deferredSocialUntil?: string | null;
  day: number;
  streak: number;
  phase: EscalationPhase;
  destination?: {
    label: string;
    lat: number | null;
    lon: number | null;
  } | null;
  context?: {
    weatherIcon: string;
    weatherDescription: string;
    temp: number;
    city: string;
  };
  progression?: {
    totalXp: number;
    level: number;
    xpIntoLevel: number;
    xpToNext: number;
    xpPerLevel: number;
  };
  /** Boutique / relances (réponse API quête) */
  rerollsRemaining?: number;
  bonusRerollCredits?: number;
  activeThemeId?: string;
  equippedTitleId?: string | null;
  xpBonusCharges?: number;
  refinement?: {
    due: boolean;
    schemaVersion: number;
    questions?: RefinementQuestion[];
    consentNotice?: string;
  };
  /** Packs de quêtes achetés — accès parcours depuis l'accueil. */
  ownedQuestPackIds?: string[];
  /** Cap en cours — l'objectif long qui oriente la quête du jour. */
  cap?: CapProgressView | null;
}

export type QuestDisplayStatus =
  | 'pending'
  | 'accepted'
  | 'completed'
  | 'rejected'
  | 'replaced'
  | 'abandoned';

const QUEST_DISPLAY_STATUSES: readonly QuestDisplayStatus[] = [
  'pending',
  'accepted',
  'completed',
  'rejected',
  'replaced',
  'abandoned',
];

/** L'enum Prisma arrive en `string` : on la ramène sur l'union affichable. */
export function parseQuestDisplayStatus(s: string): QuestDisplayStatus {
  return QUEST_DISPLAY_STATUSES.includes(s as QuestDisplayStatus)
    ? (s as QuestDisplayStatus)
    : 'pending';
}

export function mapPrismaQuestRating(r: string | null | undefined): QuestRatingValue | null {
  if (r === 'upvote' || r === 'downvote') return r;
  return null;
}

export function isPlaceholderDestinationLabel(s: string): boolean {
  const t = s.trim().toLowerCase();
  if (t.length < 2) return true;
  if (t === 'lieu de la quête' || t === 'nom court du lieu' || t === 'lieu') return true;
  if (/^nom (court )?du lieu$/i.test(t)) return true;
  if (/^lieu (public|de la quête|suggéré)$/i.test(t)) return true;
  return false;
}

export function sanitizeDestinationLabelForStorage(s: string | null | undefined): string | null {
  if (s == null) return null;
  const t = s.trim();
  if (!t || /^null$/i.test(t) || /^undefined$/i.test(t)) return null;
  return t;
}

type QuestLogForResponse = Pick<
  QuestLogRow,
  | 'id'
  | 'questDate'
  | 'archetypeId'
  | 'generatedEmoji'
  | 'generatedTitle'
  | 'generatedMission'
  | 'generatedHook'
  | 'generatedDuration'
  | 'generatedSafetyNote'
  | 'isOutdoor'
  | 'destinationLabel'
  | 'destinationLat'
  | 'destinationLon'
  | 'locationCity'
  | 'weatherDescription'
  | 'weatherTemp'
> & {
  status: string;
  wasRerolled?: boolean;
  wasFallback?: boolean;
  xpAwarded?: number | null;
  rating?: string | null;
};

export async function toQuestResponse(
  log: QuestLogForResponse,
  profile?: { deferredSocialUntil?: string | null } | null,
  cachedTaxonomy?: QuestModel[],
) {
  const taxonomy = cachedTaxonomy ?? (await getQuestTaxonomy());
  const archetype = findArchetypeById(taxonomy, log.archetypeId);
  const hasCoords =
    log.destinationLat != null &&
    log.destinationLon != null &&
    Number.isFinite(log.destinationLat) &&
    Number.isFinite(log.destinationLon);
  const storedLabel = sanitizeDestinationLabelForStorage(log.destinationLabel);
  const destination =
    log.isOutdoor && hasCoords
      ? {
          label: storedLabel ?? 'Lieu sur la carte',
          lat: log.destinationLat,
          lon: log.destinationLon,
        }
      : null;
  return {
    id: log.id,
    questDate: log.questDate,
    archetypeId: log.archetypeId,
    archetypeName: archetype?.title ?? '',
    archetypeCategory: archetype?.category ?? '',
    emoji: log.generatedEmoji,
    title: log.generatedTitle,
    mission: log.generatedMission,
    hook: log.generatedHook,
    duration: log.generatedDuration,
    safetyNote: log.generatedSafetyNote,
    isOutdoor: log.isOutdoor,
    destination,
    city: log.locationCity,
    weather: log.weatherDescription,
    weatherTemp: log.weatherTemp,
    status: parseQuestDisplayStatus(log.status),
    rating: mapPrismaQuestRating(log.rating),
    wasRerolled: log.wasRerolled ?? false,
    wasFallback: log.wasFallback ?? false,
    xpAwarded: log.xpAwarded ?? null,
    questPace: archetype?.questPace ?? 'instant',
    deferredSocialUntil: profile?.deferredSocialUntil ?? null,
  };
}

export function shopClientPayload(profile: {
  rerollsRemaining: number;
  bonusRerollCredits: number;
  activeThemeId: string;
  ownedThemes: unknown;
  coinBalance?: number | null;
  ownedTitleIds?: unknown;
  equippedTitleId?: string | null;
  xpBonusCharges?: number | null;
  ownedQuestPackIds?: unknown;
}) {
  const ownedTitles = parseStringArray(profile.ownedTitleIds);
  let equipped = profile.equippedTitleId ?? null;
  if (equipped && !isTitleEquippable(equipped, ownedTitles)) equipped = null;
  return {
    coinBalance: profile.coinBalance ?? 0,
    rerollsRemaining: profile.rerollsRemaining,
    bonusRerollCredits: profile.bonusRerollCredits ?? 0,
    activeThemeId: profile.activeThemeId ?? 'default',
    ownedThemes: effectiveOwnedThemes(parseStringArray(profile.ownedThemes)),
    ownedTitleIds: ownedTitles,
    equippedTitleId: equipped,
    xpBonusCharges: profile.xpBonusCharges ?? 0,
    ownedQuestPackIds: parseStringArray(profile.ownedQuestPackIds),
  };
}

/** Cap en cours, tel qu'affiché par le client (null si aucun). */
export function capPayload(profile: { capState?: unknown }, locale: AppLocale) {
  return { cap: capProgressView(parseCapState(profile.capState), locale) };
}

export function progressionPayload(
  profile: { totalXp: number; badgesEarned: unknown },
  locale: AppLocale,
) {
  const safe = Math.max(0, Math.floor(profile.totalXp ?? 0));
  return {
    totalXp: safe,
    ...levelFromTotalXp(safe),
    badges: serializeBadges(profile.badgesEarned, locale),
    badgeCatalog: getBadgeCatalogForUi(profile.badgesEarned, locale),
  };
}

type RefinementSurvey = ReturnType<typeof getRefinementSurveyPayload>;

/**
 * Assemble la réponse d'une quête déjà en base. `storedContext` n'est renseigné que pour
 * une quête passée : la météo du jour ne vaut plus rien, on relit celle figée à la génération.
 */
export function buildCachedQuestResponse(
  quest: Awaited<ReturnType<typeof toQuestResponse>>,
  profile: Profile,
  locale: AppLocale,
  refinement: RefinementSurvey,
  storedContext?: DailyQuest['context'],
) {
  return {
    ...quest,
    fromCache: true as const,
    day: profile.currentDay,
    streak: profile.streakCount,
    phase: profile.currentPhase as EscalationPhase,
    deferredSocialUntil: profile.deferredSocialUntil ?? null,
    ...shopClientPayload(profile),
    ...capPayload(profile, locale),
    progression: progressionPayload(profile, locale),
    refinement,
    ...(storedContext ? { context: storedContext } : {}),
  };
}

export type DailyQuestState =
  /** Aucun profil : l'onboarding n'a pas encore été transmis au serveur. */
  | { kind: 'profile_missing' }
  /** Date passée sans log : rien à afficher, rien à générer rétroactivement. */
  | { kind: 'quest_date_not_found' }
  /** Quête déjà en base (cas courant) : affichable telle quelle. */
  | { kind: 'cached'; quest: DailyQuest }
  /** Rien pour aujourd'hui : la génération reste à faire, avec le contexte déjà chargé. */
  | {
      kind: 'needs_generation';
      profile: Profile;
      taxonomy: QuestModel[];
      /** Déjà compté ici : la génération le réutilise pour le sondage de personnalisation. */
      completedQuestCount: number;
      today: string;
    };

/**
 * Lecture unique de l'état de la quête du jour, partagée par `GET /api/quest/daily` et par
 * le rendu serveur de `/app`. Ne génère jamais : la génération dépend de la position du
 * visiteur, que seul le client connaît, et reste donc déclenchée par l'appel API.
 */
export async function loadDailyQuestState(
  userId: string,
  locale: AppLocale,
  requestedQuestDate?: string | null,
): Promise<DailyQuestState> {
  const profile = await prisma.profile.findUnique({ where: { clerkId: userId } });
  if (!profile) return { kind: 'profile_missing' };

  const today = getQuestCalendarDateNow();
  /** Deeplink / partage sur une date passée : même lecture, sur une autre clé. */
  const targetDate = requestedQuestDate && requestedQuestDate !== today ? requestedQuestDate : today;

  /**
   * Indépendants les uns des autres : un seul aller-retour au lieu de trois en série.
   * `getQuestTaxonomy()` est mémoïsé (TTL) et ne touche la base que sur cache froid.
   */
  const [completedQuestCount, taxonomy, existing] = await Promise.all([
    prisma.questLog.count({ where: { profileId: profile.id, status: 'completed' } }),
    getQuestTaxonomy(),
    prisma.questLog.findUnique({
      where: { profileId_questDate: { profileId: profile.id, questDate: targetDate } },
    }),
  ]);

  if (existing) {
    const storedContext =
      targetDate !== today && existing.weatherDescription != null
        ? {
            weatherIcon: '',
            weatherDescription: existing.weatherDescription,
            temp: Math.round(existing.weatherTemp ?? 18),
            city: existing.locationCity ?? '',
          }
        : undefined;
    const refinement = getRefinementSurveyPayload(
      {
        currentDay: profile.currentDay,
        refinementSchemaVersion: profile.refinementSchemaVersion ?? 0,
        refinementSkippedAt: profile.refinementSkippedAt ?? null,
      },
      completedQuestCount,
    );
    const quest = buildCachedQuestResponse(
      await toQuestResponse(existing, profile, taxonomy),
      profile,
      locale,
      refinement,
      storedContext,
    );
    return { kind: 'cached', quest };
  }

  if (targetDate !== today) return { kind: 'quest_date_not_found' };

  return { kind: 'needs_generation', profile, taxonomy, completedQuestCount, today };
}
