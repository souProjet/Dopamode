import { NextResponse, type NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import type { Prisma } from '@prisma/client';
import {
  CAPS_REGISTRY,
  abandonCap,
  capCatalog,
  capProgressView,
  getCap,
  getQuestCalendarDateNow,
  parseCapState,
  startCap,
} from '@questia/shared';
import { prisma } from '@/lib/db';
import { parseAppLocaleFromRequest } from '@/lib/requestLocale';

/**
 * Le Cap : objectif long choisi par le joueur, qui oriente la quête du jour.
 * Gratuit, un seul actif à la fois, abandonnable (la progression est perdue).
 */

function detailPayload(capId: string, locale: 'fr' | 'en') {
  const cap = getCap(capId);
  if (!cap) return null;
  return {
    id: cap.id,
    icon: cap.icon,
    label: cap.label[locale],
    promise: cap.promise[locale],
    forWho: cap.forWho[locale],
    rewardTitleId: cap.rewardTitleId,
    rewardCoins: cap.rewardCoins,
    milestones: cap.milestones.map((m) => ({
      slug: m.slug,
      title: m.title[locale],
      intent: m.intent[locale],
      categories: m.categories,
      questsRequired: m.questsRequired,
      rewardCoins: m.rewardCoins,
    })),
  };
}

export async function GET(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

  const locale = parseAppLocaleFromRequest(request);
  const profile = await prisma.profile.findUnique({
    where: { clerkId: userId },
    select: { capState: true },
  });
  if (!profile) return NextResponse.json({ error: 'Profil introuvable' }, { status: 404 });

  const state = parseCapState(profile.capState);
  return NextResponse.json({
    catalog: capCatalog(state, locale),
    cap: capProgressView(state, locale),
    detail: state.active ? detailPayload(state.active.capId, locale) : null,
    completed: state.completed,
  });
}

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

  const locale = parseAppLocaleFromRequest(request);
  const body = (await request.json().catch(() => ({}))) as {
    action?: 'start' | 'abandon';
    capId?: string;
  };

  const profile = await prisma.profile.findUnique({
    where: { clerkId: userId },
    select: { id: true, capState: true },
  });
  if (!profile) return NextResponse.json({ error: 'Profil introuvable' }, { status: 404 });

  const state = parseCapState(profile.capState);

  let next = state;
  if (body.action === 'abandon') {
    if (!state.active) {
      return NextResponse.json({ error: 'Aucun Cap en cours.' }, { status: 400 });
    }
    next = abandonCap(state);
  } else if (body.action === 'start') {
    const capId = body.capId?.trim() ?? '';
    if (!CAPS_REGISTRY[capId]) {
      return NextResponse.json({ error: 'Cap inconnu.' }, { status: 400 });
    }
    if (state.active?.capId === capId) {
      return NextResponse.json({ error: 'Ce Cap est déjà en cours.' }, { status: 400 });
    }
    const started = startCap(state, capId, getQuestCalendarDateNow());
    if (!started) return NextResponse.json({ error: 'Cap inconnu.' }, { status: 400 });
    next = started;
  } else {
    return NextResponse.json({ error: 'Action inconnue.' }, { status: 400 });
  }

  await prisma.profile.update({
    where: { id: profile.id },
    data: { capState: next as unknown as Prisma.InputJsonValue } as unknown as Prisma.ProfileUpdateInput,
  });

  return NextResponse.json({
    catalog: capCatalog(next, locale),
    cap: capProgressView(next, locale),
    detail: next.active ? detailPayload(next.active.capId, locale) : null,
    completed: next.completed,
  });
}
