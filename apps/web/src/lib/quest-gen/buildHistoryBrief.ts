import type { AppLocale } from '@questia/shared';
import type { GenerationHistoryItem } from './types';

const STATUS_LABEL_FR: Record<GenerationHistoryItem['status'], string> = {
  completed: '✓ complétée',
  accepted: '· acceptée',
  rejected: '✗ refusée',
  abandoned: '✗ abandonnée',
  pending: '· en attente',
  replaced: '↻ remplacée',
};

const STATUS_LABEL_EN: Record<GenerationHistoryItem['status'], string> = {
  completed: '✓ completed',
  accepted: '· accepted',
  rejected: '✗ rejected',
  abandoned: '✗ abandoned',
  pending: '· pending',
  replaced: '↻ replaced',
};

/** Extrait le verbe d'ouverture d'une mission (premier mot de la phrase impérative). */
function extractOpeningVerb(mission: string | null | undefined): string | null {
  if (!mission) return null;
  const first = mission.trim().split(/\s+/)[0];
  if (!first) return null;
  const clean = first.replace(/[,.\-:;!?«»"']+$/g, '').trim();
  return clean.length >= 3 ? clean : null;
}

/**
 * Bloc de diversité structurelle : liste les verbes d'ouverture récents et les
 * catégories sur-représentées pour contraindre le LLM à changer de registre.
 */
function buildDiversityBlock(slice: GenerationHistoryItem[], locale: AppLocale): string {
  const verbs = [
    ...new Set(
      slice
        .map((h) => extractOpeningVerb(h.generatedMission))
        .filter((v): v is string => v !== null),
    ),
  ].slice(0, 7);

  const catCount = new Map<string, number>();
  for (const h of slice) {
    catCount.set(h.category, (catCount.get(h.category) ?? 0) + 1);
  }
  const dominantCats = [...catCount.entries()]
    .filter(([, n]) => n >= 2)
    .map(([cat]) => cat);

  const lines: string[] = [];

  if (verbs.length > 0) {
    lines.push(
      locale === 'en'
        ? `⚡ Mission verbs already used — choose a DIFFERENT opening verb: ${verbs.join(', ')}.`
        : `⚡ Verbes d'ouverture déjà utilisés — choisis un verbe D'OUVERTURE DIFFÉRENT : ${verbs.join(', ')}.`,
    );
  }

  if (dominantCats.length > 0) {
    lines.push(
      locale === 'en'
        ? `⚡ Over-represented categories (${dominantCats.join(', ')}): shift angle or lean on a secondary family.`
        : `⚡ Catégories sur-représentées (${dominantCats.join(', ')}) : change d'angle ou appuie-toi sur une famille secondaire.`,
    );
  }

  return lines.join('\n');
}

/**
 * Brief historique : 8 dernières quêtes du plus récent au plus ancien.
 * Sert deux objectifs simultanés au LLM :
 *  - éviter la répétition stylistique (mêmes verbes, mêmes scènes, mêmes objets)
 *  - capter ce que la personne a aimé / rejeté pour ajuster le ton
 *
 * Un bloc DIVERSITÉ STRUCTURELLE extrait les verbes d'ouverture et catégories
 * sur-représentées pour forcer une vraie rotation des registres.
 */
export function buildHistoryBrief(
  history: GenerationHistoryItem[],
  locale: AppLocale,
  limit = 8,
): string {
  if (history.length === 0) {
    return locale === 'en'
      ? 'RECENT HISTORY: none — first quests; favor a reassuring opening that still feels personal.'
      : 'HISTORIQUE RÉCENT : aucun — premières quêtes ; mise sur une ouverture rassurante mais déjà personnelle.';
  }

  const slice = history.slice(0, limit);
  const labelMap = locale === 'en' ? STATUS_LABEL_EN : STATUS_LABEL_FR;
  const lines: string[] = [
    locale === 'en'
      ? `RECENT HISTORY (newest first — DO NOT reuse the same beat, scene, object or wording):`
      : `HISTORIQUE RÉCENT (plus récent en premier — NE PAS réutiliser le même ressort, la même scène, le même objet ou la même formulation) :`,
  ];
  for (const item of slice) {
    const stat = labelMap[item.status] ?? item.status;
    const date = item.questDate ?? '';
    const title = item.generatedTitle ?? item.archetypeTitle;
    const mission = item.generatedMission?.trim();
    const head = `[${date}] ${stat} (${item.category}) — ${title}`;
    lines.push(mission ? `- ${head} :: ${mission}` : `- ${head}`);
  }

  const diversityBlock = buildDiversityBlock(slice, locale);
  if (diversityBlock) {
    lines.push('');
    lines.push(
      locale === 'en'
        ? 'STRUCTURAL DIVERSITY (mandatory — break these patterns):'
        : 'DIVERSITÉ STRUCTURELLE (obligatoire — brise ces motifs) :',
    );
    lines.push(diversityBlock);
  }

  return lines.join('\n');
}
