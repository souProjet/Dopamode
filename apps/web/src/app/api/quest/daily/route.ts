import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';
import {
  computeExhibitedPersonality,
  computeCongruenceDelta,
  getEffectivePhase,
  computeCompletionXp,
  computeCompletionCoins,
  evaluateNewBadges,
  aggregateBadgeRewards,
  levelFromTotalXp,
  levelRewardsBetween,
  aggregateLevelRewards,
  dailyRerollsForLevel,
  nextStreakOnCompletion,
  streakForNewDay,
  XP_SHOP_BONUS_PER_CHARGE,
  REFINEMENT_SCHEMA_VERSION,
  refinementAnswersToCategoryBias,
  parseValidRefinementAnswers,
  buildRefinementContextForPrompt,
  questPackBiasFromOwned,
  parseCapState,
  capCategoryBias,
  isMilestoneQuestNext,
  milestoneQuestIdealDuration,
  advanceCapOnCompletion,
  isValidReportDeferredDate,
  isValidQuestDateIso,
  getQuestCalendarDateNow,
  getPreviousQuestCalendarDate,
  softUpdateDeclaredPersonality,
  DEFAULT_RECENT_EXCLUSION_DAYS,
  buildQuestParameters,
  buildEmergencyQuestParameters,
  isValidSociabilityLevel,
  clampQuestDurationBounds,
  parseHeavyQuestPreference,
} from '@questia/shared';
import type {
  EscalationPhase,
  ExplorerAxis,
  PersonalityVector,
  ProfileSnapshot,
  QuestLog,
  QuestModel,
  QuestParameters,
  RiskAxis,
  ScoringQuestLog,
  SociabilityLevel,
} from '@questia/shared';
import { generateDailyQuest } from '@/lib/quest-gen/generateQuest';
import type { GenerationHistoryItem } from '@/lib/quest-gen/types';
import { getQuestContext } from '@/lib/actions/weather';
import { geocodeNominatim, shortenDisplayName } from '@/lib/geocode';
import { Prisma } from '@prisma/client';
import { parseAppLocaleFromRequest } from '@/lib/requestLocale';
import { badgeIdsSet, parseBadgesEarned, serializeBadges } from '@/lib/progression';
import { parseStringArray } from '@/lib/shop/parse';
import { getRefinementSurveyPayload } from '@/lib/refinementPayload';
import {
  getQuestTaxonomy,
  getDefaultFallbackArchetypeId,
} from '@/lib/quest-taxonomy/cache';
import { findArchetypeById } from '@/lib/quest-taxonomy/map-prisma';
import {
  capPayload,
  isPlaceholderDestinationLabel,
  loadDailyQuestState,
  mapPrismaQuestRating,
  progressionPayload,
  sanitizeDestinationLabelForStorage,
  shopClientPayload,
  toQuestResponse,
} from '@/lib/quest/dailyQuest';

export const dynamic = 'force-dynamic';

/** Fenêtre d'historique injectée au moteur (sélection + résumé pour le LLM). */
const HISTORY_WINDOW_LOGS = 28;
/** Profondeur d'historique narrée au LLM (pour la variété stylistique). */
const HISTORY_BRIEF_DEPTH = 5;

// ── Helpers profil ───────────────────────────────────────────────────────────

/** Relances successives : cumul des archétypes déjà proposés (JSON + ancienne colonne). */
function parseRerollExcludedArchetypeIds(profile: {
  rerollExcludeArchetypeId: number | null;
  rerollExcludeArchetypeIds?: Prisma.JsonValue | null;
}): number[] {
  const raw = profile.rerollExcludeArchetypeIds;
  const fromJson = Array.isArray(raw)
    ? raw.filter((x): x is number => typeof x === 'number' && Number.isFinite(x))
    : [];
  const legacy = profile.rerollExcludeArchetypeId != null ? [profile.rerollExcludeArchetypeId] : [];
  return Array.from(new Set([...legacy, ...fromJson]));
}

function mergeRerollExcludedArchetypeIds(
  profile: { rerollExcludeArchetypeId: number | null; rerollExcludeArchetypeIds?: Prisma.JsonValue | null },
  archetypeId: number,
): number[] {
  return Array.from(new Set([...parseRerollExcludedArchetypeIds(profile), archetypeId]));
}

/** Soft-update du profil déclaré durant les premiers jours (fire-and-forget). */
async function trySoftUpdateDeclared(
  profileId: string,
  declared: PersonalityVector,
  currentDay: number,
  archetypeId: number,
  reaction: 'accepted' | 'completed' | 'rejected' | 'abandoned',
  taxMap: Map<number, QuestModel>,
): Promise<void> {
  try {
    const archetype = taxMap.get(archetypeId);
    if (!archetype) return;
    const updated = softUpdateDeclaredPersonality(declared, archetype.category, reaction, currentDay);
    if (!updated) return;
    await prisma.profile.update({
      where: { id: profileId },
      data: { declaredPersonality: updated as unknown as Record<string, number> },
    });
  } catch { /* non-blocking */ }
}

function buildTaxonomyMap(taxonomy: QuestModel[]): Map<number, QuestModel> {
  return new Map(taxonomy.map((q) => [q.id, q]));
}

// ── Helpers génération ───────────────────────────────────────────────────────

/** Mission qui évoque un déplacement large : recherche géo moins contrainte. */
function inferWideDestinationSearch(mission: string): boolean {
  const m = mission.toLowerCase();
  return (
    /\b(autre ville|autre région|autre commune|ailleurs|loin|voyage|explorer loin|déplacement|km|kilomètre|kilometre|pays|hors de la ville|autre département)\b/i.test(
      m,
    ) || /\b(road trip|week-end|weekend)\b/i.test(m)
  );
}

// ── Route GET ────────────────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

  const url = new URL(request.url);
  const questLocale = parseAppLocaleFromRequest(request);
  const lat = url.searchParams.get('lat') ? parseFloat(url.searchParams.get('lat')!) : undefined;
  const lon = url.searchParams.get('lon') ? parseFloat(url.searchParams.get('lon')!) : undefined;
  const requestedQuestDate = url.searchParams.get('questDate') ?? url.searchParams.get('date');
  if (requestedQuestDate && !isValidQuestDateIso(requestedQuestDate)) {
    return NextResponse.json(
      { error: 'Paramètre questDate invalide (format AAAA-MM-JJ attendu).' },
      { status: 400 },
    );
  }

  /**
   * Lecture partagée avec le rendu serveur de `/app` : même requêtage, même charge utile,
   * une seule définition de ce qu'est « la quête du jour ».
   */
  const state = await loadDailyQuestState(userId, questLocale, requestedQuestDate);

  if (state.kind === 'profile_missing') {
    return NextResponse.json(
      { error: 'Profil introuvable. Complète l\'onboarding.', code: 'profile_missing' },
      { status: 404 },
    );
  }

  /** Date passée sans log : rien à générer rétroactivement. */
  if (state.kind === 'quest_date_not_found') {
    return NextResponse.json(
      { error: 'Aucune quête pour cette date.', code: 'quest_date_not_found' },
      { status: 404 },
    );
  }

  // ── Quête déjà en base : cache du jour, ou quête historique (deeplink / partage) ──
  if (state.kind === 'cached') return NextResponse.json(state.quest);

  const { profile, taxonomy, completedQuestCount, today } = state;

  // ── Génération nouvelle quête ──────────────────────────────────────────────
  /** Contrôlé avant la météo : inutile de payer un appel HTTP pour finir en 503. */
  if (taxonomy.length === 0) {
    return NextResponse.json(
      { error: 'Aucun archétype publié en base. Exécute npm run db:seed-archetypes (apps/web).' },
      { status: 503 },
    );
  }

  const taxMap = buildTaxonomyMap(taxonomy);

  /**
   * Météo (HTTP externe), archétype de repli et historique récent : aucune dépendance
   * entre eux, donc lancés ensemble plutôt qu'en série.
   * Historique récent : pour le moteur (fenêtre courte) et pour le brief LLM (5 logs détaillés).
   */
  const [context, fallbackDefault, recentLogRows] = await Promise.all([
    getQuestContext(lat, lon),
    getDefaultFallbackArchetypeId(),
    prisma.questLog.findMany({
      where: { profileId: profile.id },
      orderBy: { assignedAt: 'desc' },
      take: HISTORY_WINDOW_LOGS,
      select: {
        archetypeId: true,
        status: true,
        questDate: true,
        generatedTitle: true,
        generatedMission: true,
        rating: true,
      },
    }),
  ]);

  const declaredPersonality = profile.declaredPersonality as unknown as PersonalityVector;
  const exhibitedPersonality = computeExhibitedPersonality(
    recentLogRows.map((r) => ({
      id: '',
      userId: profile.clerkId,
      questId: r.archetypeId,
      assignedAt: '',
      questDate: r.questDate,
      status: r.status as QuestLog['status'],
      congruenceDeltaAtAssignment: 0,
      phaseAtAssignment: profile.currentPhase as EscalationPhase,
      wasRerolled: false,
      wasFallback: false,
      safetyConsentGiven: false,
      rating: mapPrismaQuestRating(r.rating),
    })),
    taxonomy,
  );
  const congruenceDelta = computeCongruenceDelta(declaredPersonality, exhibitedPersonality);

  const phaseLogs: QuestLog[] = recentLogRows.map((r) => ({
    id: '',
    userId: profile.clerkId,
    questId: r.archetypeId,
    assignedAt: '',
    questDate: r.questDate,
    status: r.status as QuestLog['status'],
    congruenceDeltaAtAssignment: 0,
    phaseAtAssignment: profile.currentPhase as EscalationPhase,
    wasRerolled: false,
    wasFallback: false,
    safetyConsentGiven: false,
    rating: mapPrismaQuestRating(r.rating),
  }));
  const effectivePhase = getEffectivePhase(profile.currentDay, phaseLogs, today);

  // Préférences raffinement → biais catégoriel + texte pour le LLM
  const storedRefinementAnswers =
    (profile.refinementSchemaVersion ?? 0) >= REFINEMENT_SCHEMA_VERSION
      ? parseValidRefinementAnswers(profile.refinementAnswers)
      : null;
  const refinementBias = refinementAnswersToCategoryBias(storedRefinementAnswers);
  const refinementContext = buildRefinementContextForPrompt(storedRefinementAnswers);

  const ownedQuestPackIds = parseStringArray(
    (profile as { ownedQuestPackIds?: unknown }).ownedQuestPackIds,
  );
  const questPackBias = questPackBiasFromOwned(ownedQuestPackIds);

  // Cap : le jalon en cours oriente la famille du jour et le brief de génération.
  const capState = parseCapState((profile as { capState?: unknown }).capState);
  const capBias = capCategoryBias(capState);

  // Exclusions cumulées (relances du jour)
  const lastQuestDateStr =
    profile.lastQuestDate == null ? null : String(profile.lastQuestDate).slice(0, 10);
  const extraExclude =
    lastQuestDateStr === today ? parseRerollExcludedArchetypeIds(profile) : [];

  const instantOnly = profile.flagNextQuestInstantOnly === true;
  const isReroll = profile.flagNextQuestAfterReroll === true;
  const sociability: SociabilityLevel | null = isValidSociabilityLevel(profile.sociability)
    ? profile.sociability
    : null;

  // Snapshot pour le moteur
  const scoringLogs: ScoringQuestLog[] = recentLogRows.map((r) => ({
    archetypeId: r.archetypeId,
    status: r.status as QuestLog['status'],
    questDate: r.questDate,
    rating: mapPrismaQuestRating(r.rating),
  }));

  const snapshot: ProfileSnapshot = {
    declaredPersonality,
    exhibitedPersonality,
    congruenceDelta,
    phase: effectivePhase,
    day: profile.currentDay,
    sociability,
    refinementBias,
    questPackBias,
    capBias,
    recentLogs: scoringLogs,
    hasUserLocation: context.hasUserLocation,
    isOutdoorFriendly: context.isOutdoorFriendly,
    instantOnly,
    heavyQuestPreference: parseHeavyQuestPreference(profile.heavyQuestPreference),
    excludeArchetypeIds: extraExclude,
  };

  const durationBounds = clampQuestDurationBounds(
    profile.questDurationMinMinutes ?? 5,
    profile.questDurationMaxMinutes ?? 1440,
  );

  const selectionSeed = `${profile.id}:${today}:${effectivePhase}:${profile.currentDay}:${isReroll ? 'reroll' : 'first'}`;
  const built = buildQuestParameters(taxonomy, snapshot, {
    selectionSeed,
    todayIso: today,
    recentExclusionDays: DEFAULT_RECENT_EXCLUSION_DAYS,
    questDurationMinMinutes: durationBounds.questDurationMinMinutes,
    questDurationMaxMinutes: durationBounds.questDurationMaxMinutes,
  });

  let questParameters: QuestParameters;
  if (!built) {
    const fb =
      findArchetypeById(taxonomy, fallbackDefault) ??
      taxonomy[0];
    if (!fb) {
      return NextResponse.json(
        { error: 'Aucun archétype éligible aujourd\'hui. Réessaie plus tard.' },
        { status: 503 },
      );
    }
    questParameters = buildEmergencyQuestParameters(
      taxonomy,
      fb,
      snapshot,
      durationBounds.questDurationMinMinutes,
      durationBounds.questDurationMaxMinutes,
    );
  } else {
    questParameters = built.params;
  }

  // Quête de jalon : la dernière étape d'un jalon est la « grosse quête » du Cap.
  const isCapMilestoneQuest = isMilestoneQuestNext(capState);
  if (isCapMilestoneQuest) {
    questParameters = {
      ...questParameters,
      idealDurationMinutes: milestoneQuestIdealDuration(
        questParameters.idealDurationMinutes,
        durationBounds.questDurationMaxMinutes,
      ),
    };
  }

  // Brief historique pour le LLM (5 dernières quêtes, statut + texte)
  const historyBrief: GenerationHistoryItem[] = recentLogRows
    .slice(0, HISTORY_BRIEF_DEPTH)
    .map((r) => ({
      archetypeId: r.archetypeId,
      archetypeTitle: taxMap.get(r.archetypeId)?.title ?? '',
      category: taxMap.get(r.archetypeId)?.category ?? '',
      status: r.status as GenerationHistoryItem['status'],
      generatedTitle: r.generatedTitle,
      generatedMission: r.generatedMission,
      questDate: r.questDate,
    }));

  const generated = await generateDailyQuest({
    taxonomy,
    questParameters,
    profile: {
      declaredPersonality,
      exhibitedPersonality,
      congruenceDelta,
      phase: effectivePhase,
      day: profile.currentDay,
      explorerAxis: profile.explorerAxis as ExplorerAxis,
      riskAxis: profile.riskAxis as RiskAxis,
      sociability,
      refinementContext,
      heavyQuestPreference: parseHeavyQuestPreference(profile.heavyQuestPreference),
      ownedQuestPackIds,
    },
    context: {
      questDateIso: today,
      city: context.city,
      country: context.country,
      weatherDescription: context.weatherDescription,
      weatherIcon: context.weatherIcon,
      temp: context.temp,
      isOutdoorFriendly: context.isOutdoorFriendly,
      hasUserLocation: context.hasUserLocation,
      questDurationMinMinutes: durationBounds.questDurationMinMinutes,
      questDurationMaxMinutes: durationBounds.questDurationMaxMinutes,
    },
    history: historyBrief,
    locale: questLocale,
    generationSeed: selectionSeed,
    isReroll,
    substitutedInstantAfterDefer: instantOnly,
    capState,
  });

  // Géocodage pour les quêtes outdoor
  let destinationLabel: string | null = null;
  let destinationLat: number | null = null;
  let destinationLon: number | null = null;
  if (generated.isOutdoor && context.hasUserLocation) {
    let rawLabel = generated.destinationLabel?.trim() || null;
    if (rawLabel && isPlaceholderDestinationLabel(rawLabel)) rawLabel = null;
    rawLabel = sanitizeDestinationLabelForStorage(rawLabel);
    const area = [context.city, context.country].filter(Boolean).join(', ') || 'France';
    const searchQuery =
      sanitizeDestinationLabelForStorage(generated.destinationQuery?.trim()) ||
      (rawLabel ? `${rawLabel}, ${area}` : area);
    const wideSearch = inferWideDestinationSearch(generated.mission);
    const viewboxDeltaDeg = wideSearch ? 1.05 : 0.32;
    const geo = await geocodeNominatim(searchQuery, {
      nearLat: lat,
      nearLon: lon,
      viewboxDeltaDeg,
    });
    const cityFallback = context.city !== 'ta ville' ? context.city : null;
    if (geo) {
      destinationLat = geo.lat;
      destinationLon = geo.lon;
      destinationLabel =
        rawLabel ??
        (geo.displayName ? shortenDisplayName(geo.displayName) : null) ??
        cityFallback ??
        'Lieu suggéré';
    } else {
      destinationLabel = rawLabel ?? cityFallback ?? 'Lieu suggéré';
    }
    destinationLabel = sanitizeDestinationLabelForStorage(destinationLabel) ?? 'Lieu suggéré';
  }

  // Progression : jour, phase, série
  const lastDate = profile.lastQuestDate;
  const yesterdayStr = getPreviousQuestCalendarDate(today);
  // La série ne monte pas ici : générer une quête ne vaut pas la faire. On se
  // contente de casser la chaîne si la veille n'a pas été validée.
  const yesterdayCompleted = recentLogRows.some(
    (r) => r.questDate === yesterdayStr && r.status === 'completed',
  );
  const newStreak = streakForNewDay(profile.streakCount, yesterdayCompleted);
  const newDay = profile.currentDay + (lastDate !== today ? 1 : 0);
  const newPhase: EscalationPhase = getEffectivePhase(newDay, phaseLogs, today);

  const freeRerollsForLevel = dailyRerollsForLevel(
    levelFromTotalXp(profile.totalXp ?? 0).level,
  );
  const rerollsAfterQuestCreate = isReroll ? profile.rerollsRemaining : freeRerollsForLevel;
  const wasWeatherFallback = generated.wasFallback;
  const chosenArchetypeId = generated.archetypeId;

  const [questLog, updatedProfile] = await prisma.$transaction([
    prisma.questLog.create({
      data: {
        profileId: profile.id,
        questDate: today,
        archetypeId: chosenArchetypeId,
        generatedEmoji: generated.icon,
        generatedTitle: generated.title,
        generatedMission: generated.mission,
        generatedHook: generated.hook,
        generatedDuration: generated.duration,
        generatedSafetyNote: generated.safetyNote ?? undefined,
        isOutdoor: generated.isOutdoor,
        destinationLabel,
        destinationLat,
        destinationLon,
        locationCity: context.hasUserLocation ? context.city : null,
        weatherDescription: context.weatherDescription,
        weatherTemp: context.temp,
        phaseAtAssignment: effectivePhase,
        congruenceDeltaAtTime: congruenceDelta,
        wasRerolled: isReroll,
        wasFallback: wasWeatherFallback,
      },
    }),
    prisma.profile.update({
      where: { id: profile.id },
      data: {
        currentDay: newDay,
        currentPhase: newPhase,
        streakCount: newStreak,
        lastQuestDate: today,
        rerollsRemaining: rerollsAfterQuestCreate,
        congruenceDelta,
        flagNextQuestAfterReroll: false,
        flagNextQuestInstantOnly: false,
        rerollExcludeArchetypeId: null,
        rerollExcludeArchetypeIds: Array.from(new Set([...extraExclude, chosenArchetypeId])),
      },
    }),
  ]);

  const p = updatedProfile;

  return NextResponse.json(
    {
      ...(await toQuestResponse(questLog, p, taxonomy)),
      fromCache: false,
      day: newDay,
      streak: newStreak,
      phase: newPhase,
      deferredSocialUntil: p.deferredSocialUntil ?? null,
      context,
      ...shopClientPayload(p),
      ...capPayload(p, questLocale),
      progression: progressionPayload(p, questLocale),
      refinement: getRefinementSurveyPayload(
        {
          currentDay: newDay,
          refinementSchemaVersion: p.refinementSchemaVersion ?? 0,
          refinementSkippedAt: p.refinementSkippedAt ?? null,
        },
        completedQuestCount,
      ),
    },
    { status: 201 },
  );
}

// ── POST: accept / reroll / replace / complete / abandon / report ────────────

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

  const questLocale = parseAppLocaleFromRequest(request);

  const body = (await request.json().catch(() => ({}))) as {
    questDate?: string;
    safetyConsentGiven?: boolean;
    action?: 'reroll' | 'replace' | 'complete' | 'abandon' | 'report';
    deferredUntil?: string;
  };

  const profile = await prisma.profile.findUnique({ where: { clerkId: userId } });
  if (!profile)
    return NextResponse.json(
      { error: 'Profil introuvable', code: 'profile_missing' },
      { status: 404 },
    );

  const today = body.questDate ?? getQuestCalendarDateNow();
  const postTaxonomy = await getQuestTaxonomy();
  const postTaxMap = buildTaxonomyMap(postTaxonomy);
  const declared = profile.declaredPersonality as unknown as PersonalityVector;

  // ── Report ────────────────────────────────────────────────────────────────
  if (body.action === 'report') {
    const deferredUntil = typeof body.deferredUntil === 'string' ? body.deferredUntil.trim() : '';
    if (!isValidReportDeferredDate(deferredUntil, today)) {
      return NextResponse.json(
        {
          error: `Choisis une date entre aujourd'hui et ${today} + 14 jours (format AAAA-MM-JJ).`,
        },
        { status: 400 },
      );
    }

    const existing = await prisma.questLog.findUnique({
      where: { profileId_questDate: { profileId: profile.id, questDate: today } },
    });
    if (!existing || existing.status !== 'pending') {
      return NextResponse.json(
        { error: "Reporter n'est possible que tant que la quête n'est pas acceptée." },
        { status: 400 },
      );
    }

    const reportArchetype = findArchetypeById(postTaxonomy, existing.archetypeId);
    if (!reportArchetype || reportArchetype.questPace === 'instant') {
      return NextResponse.json(
        {
          error:
            'Reporter sert à échanger une quête « à caler » contre une mission courte. Pour une autre quête du jour, utilise « Changer de quête ».',
        },
        { status: 400 },
      );
    }

    const daily = profile.rerollsRemaining;
    const bonus = profile.bonusRerollCredits ?? 0;

    if (daily <= 0 && bonus <= 0) {
      return NextResponse.json(
        { error: 'Plus de relances disponibles. La boutique propose des packs de relances bonus.' },
        { status: 400 },
      );
    }

    const excludeArchetypeId = existing.archetypeId;
    void trySoftUpdateDeclared(
      profile.id,
      declared,
      profile.currentDay,
      excludeArchetypeId,
      'rejected',
      postTaxMap,
    );
    const mergedExclude = mergeRerollExcludedArchetypeIds(profile, excludeArchetypeId);

    const updatedProfile =
      daily > 0
        ? await prisma.$transaction(async (tx) => {
            await tx.questLog.delete({
              where: { profileId_questDate: { profileId: profile.id, questDate: today } },
            });
            return tx.profile.update({
              where: { id: profile.id },
              data: {
                rerollsRemaining: Math.max(0, daily - 1),
                flagNextQuestAfterReroll: true,
                flagNextQuestInstantOnly: true,
                deferredSocialUntil: deferredUntil,
                rerollExcludeArchetypeId: null,
                rerollExcludeArchetypeIds: mergedExclude,
              },
            });
          })
        : await prisma.$transaction(async (tx) => {
            await tx.questLog.delete({
              where: { profileId_questDate: { profileId: profile.id, questDate: today } },
            });
            return tx.profile.update({
              where: { id: profile.id },
              data: {
                bonusRerollCredits: bonus - 1,
                flagNextQuestAfterReroll: true,
                flagNextQuestInstantOnly: true,
                deferredSocialUntil: deferredUntil,
                rerollExcludeArchetypeId: null,
                rerollExcludeArchetypeIds: mergedExclude,
              },
            });
          });

    return NextResponse.json({
      reported: true,
      deferredUntil,
      ...shopClientPayload(updatedProfile),
      ...capPayload(updatedProfile, questLocale),
      progression: progressionPayload(updatedProfile, questLocale),
      deferredSocialUntil: updatedProfile.deferredSocialUntil ?? null,
    });
  }

  // ── Abandon ───────────────────────────────────────────────────────────────
  if (body.action === 'abandon') {
    const existing = await prisma.questLog.findUnique({
      where: { profileId_questDate: { profileId: profile.id, questDate: today } },
    });
    if (!existing) {
      return NextResponse.json({ error: 'Aucune quête pour cette date.' }, { status: 404 });
    }
    if (existing.status === 'completed' || existing.status === 'abandoned') {
      return NextResponse.json(
        { error: existing.status === 'completed' ? 'Quête déjà validée.' : 'Quête déjà passée.' },
        { status: 400 },
      );
    }

    const [updated] = await prisma.$transaction([
      prisma.questLog.update({
        where: { profileId_questDate: { profileId: profile.id, questDate: today } },
        data: { status: 'abandoned' },
      }),
      prisma.profile.update({
        where: { id: profile.id },
        data: {
          streakCount: 0,
          deferredSocialUntil: null,
        },
      }),
    ]);

    void trySoftUpdateDeclared(
      profile.id,
      declared,
      profile.currentDay,
      updated.archetypeId,
      'abandoned',
      postTaxMap,
    );

    const profileAfter = await prisma.profile.findUnique({ where: { id: profile.id } });
    const p = profileAfter ?? profile;

    return NextResponse.json({
      ...(await toQuestResponse(updated, p)),
      abandoned: true,
      streak: p.streakCount,
      deferredSocialUntil: null,
      ...shopClientPayload(p),
      ...capPayload(p, questLocale),
      progression: progressionPayload(p, questLocale),
    });
  }

  // ── Reroll / Replace ──────────────────────────────────────────────────────
  if (body.action === 'reroll' || body.action === 'replace') {
    const existing = await prisma.questLog.findUnique({
      where: { profileId_questDate: { profileId: profile.id, questDate: today } },
    });
    if (!existing) {
      return NextResponse.json({ error: 'Aucune quête à relancer.' }, { status: 400 });
    }

    const daily = profile.rerollsRemaining;
    const bonus = profile.bonusRerollCredits ?? 0;

    if (daily <= 0 && bonus <= 0) {
      return NextResponse.json(
        { error: 'Plus de relances disponibles. La boutique propose des packs de relances bonus.' },
        { status: 400 },
      );
    }

    const excludeArchetypeId = existing.archetypeId;
    void trySoftUpdateDeclared(
      profile.id,
      declared,
      profile.currentDay,
      excludeArchetypeId,
      'rejected',
      postTaxMap,
    );
    const mergedExclude = mergeRerollExcludedArchetypeIds(profile, excludeArchetypeId);

    const updatedProfile =
      daily > 0
        ? await prisma.$transaction(async (tx) => {
            await tx.questLog.delete({
              where: { profileId_questDate: { profileId: profile.id, questDate: today } },
            });
            return tx.profile.update({
              where: { id: profile.id },
              data: {
                rerollsRemaining: Math.max(0, daily - 1),
                flagNextQuestAfterReroll: true,
                rerollExcludeArchetypeId: null,
                rerollExcludeArchetypeIds: mergedExclude,
              },
            });
          })
        : await prisma.$transaction(async (tx) => {
            await tx.questLog.delete({
              where: { profileId_questDate: { profileId: profile.id, questDate: today } },
            });
            return tx.profile.update({
              where: { id: profile.id },
              data: {
                bonusRerollCredits: bonus - 1,
                flagNextQuestAfterReroll: true,
                rerollExcludeArchetypeId: null,
                rerollExcludeArchetypeIds: mergedExclude,
              },
            });
          });

    return NextResponse.json({
      rerolled: true,
      ...shopClientPayload(updatedProfile),
      ...capPayload(updatedProfile, questLocale),
      progression: progressionPayload(updatedProfile, questLocale),
    });
  }

  // ── Complete ──────────────────────────────────────────────────────────────
  if (body.action === 'complete') {
    const existing = await prisma.questLog.findUnique({
      where: { profileId_questDate: { profileId: profile.id, questDate: today } },
    });
    if (!existing) {
      return NextResponse.json({ error: 'Aucune quête pour cette date.' }, { status: 404 });
    }
    if (existing.status === 'abandoned') {
      return NextResponse.json({ error: 'Cette quête a été passée.' }, { status: 400 });
    }
    if (existing.status !== 'accepted') {
      return NextResponse.json(
        { error: existing.status === 'completed' ? 'Quête déjà validée.' : 'Accepte la quête avant de la valider.' },
        { status: 400 },
      );
    }

    const yesterdayIso = getPreviousQuestCalendarDate(today);
    const [completedBefore, outdoorBefore, yesterdayLog] = await Promise.all([
      prisma.questLog.count({
        where: { profileId: profile.id, status: 'completed' },
      }),
      prisma.questLog.count({
        where: { profileId: profile.id, status: 'completed', isOutdoor: true },
      }),
      prisma.questLog.findUnique({
        where: { profileId_questDate: { profileId: profile.id, questDate: yesterdayIso } },
        select: { status: true },
      }),
    ]);

    // La série se gagne ici, pas à la génération : c'est la validation qui compte.
    const newStreak = nextStreakOnCompletion(
      profile.streakCount,
      yesterdayLog?.status === 'completed',
    );

    const { total: xpGained, breakdown } = computeCompletionXp({
      phaseAtAssignment: existing.phaseAtAssignment as EscalationPhase,
      streakCount: newStreak,
      isOutdoor: existing.isOutdoor,
      explorerAxis: profile.explorerAxis as ExplorerAxis,
      riskAxis: profile.riskAxis as RiskAxis,
      wasRerolled: existing.wasRerolled,
      wasFallback: existing.wasFallback,
    });

    const { total: questCoins, breakdown: coinBreakdown } = computeCompletionCoins({
      phaseAtAssignment: existing.phaseAtAssignment as EscalationPhase,
      streakCount: newStreak,
      isOutdoor: existing.isOutdoor,
      wasRerolled: existing.wasRerolled,
      wasFallback: existing.wasFallback,
    });

    const pShop = profile as { xpBonusCharges?: number | null };
    let xpBonusChargesAfter = pShop.xpBonusCharges ?? 0;
    let shopBonusXp = 0;
    if (xpBonusChargesAfter > 0) {
      shopBonusXp = XP_SHOP_BONUS_PER_CHARGE;
      xpBonusChargesAfter -= 1;
    }
    const totalXpGained = xpGained + shopBonusXp;
    const breakdownWithShop = {
      ...breakdown,
      ...(shopBonusXp > 0 ? { shopBonusXp } : {}),
    };

    const totalCompletions = completedBefore + 1;
    const outdoorCompletions = outdoorBefore + (existing.isOutdoor ? 1 : 0);

    const existingBadgeIds = badgeIdsSet(profile.badgesEarned);
    const newBadges = evaluateNewBadges(existingBadgeIds, {
      totalCompletions,
      outdoorCompletions,
      currentStreak: newStreak,
      currentDay: profile.currentDay,
      currentPhase: profile.currentPhase as EscalationPhase,
      explorerAxis: profile.explorerAxis as ExplorerAxis,
      riskAxis: profile.riskAxis as RiskAxis,
    });

    const priorEarned = parseBadgesEarned(profile.badgesEarned);
    const mergedBadges = [
      ...priorEarned,
      ...newBadges.map((b) => ({ id: b.id, unlockedAt: b.unlockedAt })),
    ];

    const previousTotalXp = profile.totalXp ?? 0;
    const newTotalXp = previousTotalXp + totalXpGained;

    // Ce que la complétion rapporte au-delà de l'XP : coins de quête, primes
    // d'insignes, paliers de niveau franchis (coins + titres de prestige).
    const badgeReward = aggregateBadgeRewards(newBadges.map((b) => b.id));
    const crossedLevels = levelRewardsBetween(previousTotalXp, newTotalXp);
    const levelReward = aggregateLevelRewards(crossedLevels);

    const ownedTitles = parseStringArray(
      (profile as { ownedTitleIds?: unknown }).ownedTitleIds,
    );
    const titlesUnlocked = [
      ...new Set([...badgeReward.titleIds, ...levelReward.titleIds]),
    ].filter((id) => !ownedTitles.includes(id));
    const newOwnedTitleIds: string[] = [...ownedTitles, ...titlesUnlocked];

    // Cap : la quête du jour fait avancer le jalon si elle est dans une de ses
    // familles. Jalon franchi ou Cap terminé = coins en plus, titre exclusif à la fin.
    const capStateBefore = parseCapState((profile as { capState?: unknown }).capState);
    const capAdvance = advanceCapOnCompletion(
      capStateBefore,
      postTaxMap.get(existing.archetypeId)?.category ?? null,
    );
    const capTitleUnlocked =
      capAdvance.titleId && !ownedTitles.includes(capAdvance.titleId) ? capAdvance.titleId : null;
    if (capTitleUnlocked) {
      titlesUnlocked.push(capTitleUnlocked);
      newOwnedTitleIds.push(capTitleUnlocked);
    }

    const coinsGained =
      questCoins + badgeReward.coins + levelReward.coins + capAdvance.coins;
    const previousCoinBalance = (profile as { coinBalance?: number | null }).coinBalance ?? 0;
    const newCoinBalance = previousCoinBalance + coinsGained;

    void trySoftUpdateDeclared(
      profile.id,
      declared,
      profile.currentDay,
      existing.archetypeId,
      'completed',
      postTaxMap,
    );

    const [updated, profileAfter] = await prisma.$transaction([
      prisma.questLog.update({
        where: { profileId_questDate: { profileId: profile.id, questDate: today } },
        data: {
          status: 'completed',
          completedAt: new Date(),
          xpAwarded: totalXpGained,
          xpBreakdown: breakdownWithShop as unknown as Prisma.InputJsonValue,
        },
      }),
      prisma.profile.update({
        where: { id: profile.id },
        data: {
          totalXp: newTotalXp,
          badgesEarned: mergedBadges as unknown as Prisma.InputJsonValue,
          xpBonusCharges: xpBonusChargesAfter,
          streakCount: newStreak,
          coinBalance: newCoinBalance,
          ...(titlesUnlocked.length > 0
            ? { ownedTitleIds: newOwnedTitleIds as unknown as Prisma.InputJsonValue }
            : {}),
          ...(capAdvance.counted
            ? { capState: capAdvance.state as unknown as Prisma.InputJsonValue }
            : {}),
          deferredSocialUntil: null,
        } as unknown as Prisma.ProfileUpdateInput,
      }),
    ]);

    const prog = progressionPayload(profileAfter, questLocale);
    const badgesUnlocked = serializeBadges(
      newBadges.map((b) => ({ id: b.id, unlockedAt: b.unlockedAt })),
      questLocale,
    );

    return NextResponse.json({
      ...(await toQuestResponse(updated, profileAfter)),
      progression: prog,
      streak: newStreak,
      ...shopClientPayload(profileAfter),
      ...capPayload(profileAfter, questLocale),
      xpGain: {
        gained: totalXpGained,
        breakdown: breakdownWithShop,
        previousTotal: previousTotalXp,
        newTotal: newTotalXp,
      },
      coinGain: {
        gained: coinsGained,
        fromQuest: questCoins,
        fromBadges: badgeReward.coins,
        fromLevels: levelReward.coins,
        breakdown: coinBreakdown,
        previousBalance: previousCoinBalance,
        newBalance: newCoinBalance,
      },
      levelRewards: crossedLevels,
      titlesUnlocked,
      badgesUnlocked,
      capGain: capAdvance.counted
        ? {
            capId: capStateBefore.active!.capId,
            coins: capAdvance.coins,
            milestoneCompleted: capAdvance.milestoneCompleted
              ? {
                  slug: capAdvance.milestoneCompleted.slug,
                  title: capAdvance.milestoneCompleted.title[questLocale],
                  rewardCoins: capAdvance.milestoneCompleted.rewardCoins,
                }
              : null,
            capCompleted: capAdvance.capCompleted
              ? {
                  id: capAdvance.capCompleted.id,
                  label: capAdvance.capCompleted.label[questLocale],
                  rewardCoins: capAdvance.capCompleted.rewardCoins,
                  rewardTitleId: capAdvance.capCompleted.rewardTitleId,
                }
              : null,
          }
        : null,
    });
  }

  // ── Accept ────────────────────────────────────────────────────────────────
  const logForAccept = await prisma.questLog.findUnique({
    where: { profileId_questDate: { profileId: profile.id, questDate: today } },
  });
  if (!logForAccept) {
    return NextResponse.json({ error: 'Aucune quête à accepter.' }, { status: 404 });
  }
  if (logForAccept.status === 'completed') {
    return NextResponse.json({ error: 'Quête déjà validée.' }, { status: 400 });
  }
  if (logForAccept.status === 'abandoned') {
    return NextResponse.json(
      { error: "Cette quête a été passée. Demain une nouvelle carte t'attend." },
      { status: 400 },
    );
  }
  if (logForAccept.status === 'accepted') {
    return NextResponse.json({
      ...(await toQuestResponse(logForAccept, profile)),
      ...shopClientPayload(profile),
      ...capPayload(profile, questLocale),
    });
  }

  const { safetyConsentGiven } = body;
  const updated = await prisma.questLog.update({
    where: { profileId_questDate: { profileId: profile.id, questDate: today } },
    data: {
      status: 'accepted',
      safetyConsentGiven: safetyConsentGiven ?? false,
    },
  });

  void trySoftUpdateDeclared(
    profile.id,
    declared,
    profile.currentDay,
    updated.archetypeId,
    'accepted',
    postTaxMap,
  );

  return NextResponse.json({
    ...(await toQuestResponse(updated, profile)),
    ...shopClientPayload(profile),
    ...capPayload(profile, questLocale),
  });
}

