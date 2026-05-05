import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';
import type { QuestRating } from '@prisma/client';

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Corps JSON invalide' }, { status: 400 });
  }

  const raw = body as { questLogId?: unknown; rating?: unknown; feedbackReason?: unknown };
  const questLogId = typeof raw.questLogId === 'string' ? raw.questLogId.trim() : '';
  const rating = raw.rating;

  if (!questLogId || (rating !== 'upvote' && rating !== 'downvote')) {
    return NextResponse.json(
      { error: 'Paramètres invalides (questLogId et rating upvote|downvote requis).' },
      { status: 400 },
    );
  }

  const profile = await prisma.profile.findUnique({
    where: { clerkId: userId },
    select: { id: true },
  });
  if (!profile) {
    return NextResponse.json({ error: 'Profil introuvable.' }, { status: 404 });
  }

  const existing = await prisma.questLog.findFirst({
    where: { id: questLogId, profileId: profile.id },
    select: { id: true },
  });
  if (!existing) {
    return NextResponse.json({ error: 'Quête introuvable ou accès refusé.' }, { status: 404 });
  }

  const feedbackReason =
    typeof raw.feedbackReason === 'string' && raw.feedbackReason.trim().length > 0
      ? raw.feedbackReason.trim().slice(0, 2000)
      : null;

  const updated = await prisma.questLog.update({
    where: { id: questLogId },
    data: {
      rating: rating as QuestRating,
      ...(feedbackReason != null ? { feedbackReason } : {}),
    },
    select: { id: true, rating: true },
  });

  return NextResponse.json({
    ok: true,
    questLogId: updated.id,
    rating: updated.rating,
  });
}
