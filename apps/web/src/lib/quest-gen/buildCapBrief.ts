import {
  currentMilestone,
  getCap,
  isMilestoneQuestNext,
  type AppLocale,
  type CapState,
} from '@questia/shared';

/**
 * Bloc « CAP » du prompt : la quête du jour n'est plus isolée, elle est une
 * étape d'un objectif long choisi par le joueur.
 *
 * Deux régimes :
 *  - étape courante : le brief du jalon oriente le fond de la quête ;
 *  - quête de jalon (dernière validation manquante) : consigne renforcée, on
 *    demande explicitement une quête plus ample. C'est la « grosse quête ».
 *
 * Retourne une chaîne vide si aucun Cap n'est actif : la génération redevient
 * exactement celle d'avant.
 */
export function buildCapBrief(capState: CapState | null | undefined, locale: AppLocale): string {
  if (!capState) return '';
  const cap = getCap(capState.active?.capId);
  const milestone = currentMilestone(capState);
  if (!cap || !milestone || !capState.active) return '';

  const step = capState.active.milestoneIndex + 1;
  const total = cap.milestones.length;
  const big = isMilestoneQuestNext(capState);
  const l = locale === 'en' ? 'en' : 'fr';

  if (l === 'en') {
    const head = `CAP (long-term objective the user chose): "${cap.label.en}" — ${cap.promise.en}
Current milestone ${step}/${total}: "${milestone.title.en}" — ${milestone.intent.en}
Progress in this milestone: ${capState.active.progress}/${milestone.questsRequired} quests.`;

    if (!big) {
      return `${head}
${milestone.brief.en}
Today's quest is ONE STEP of this Cap: it must serve that direction while staying a normal daily quest, doable today, within the duration range above.`;
    }
    return `${head}
⚑ MILESTONE QUEST — this quest CLOSES the milestone. Make it the biggest of the sequence.
${milestone.milestoneQuestBrief.en}
Rules for a milestone quest:
- Use the full target duration given above: this quest is meant to take real time.
- More ambitious and more memorable than the previous steps, but still doable today or planned for today.
- It must feel like a small summit, not an errand. The user should want to tell someone about it.
- Same output schema, same safety rules, same single-sentence mission.`;
  }

  const head = `CAP (objectif long choisi par l'utilisateur·rice) : « ${cap.label.fr} » — ${cap.promise.fr}
Jalon en cours ${step}/${total} : « ${milestone.title.fr} » — ${milestone.intent.fr}
Avancement dans ce jalon : ${capState.active.progress}/${milestone.questsRequired} quêtes.`;

  if (!big) {
    return `${head}
${milestone.brief.fr}
La quête du jour est UNE ÉTAPE de ce Cap : elle doit servir cette direction tout en restant une quête quotidienne normale, faisable aujourd'hui, dans la plage de durée indiquée plus haut.`;
  }

  return `${head}
⚑ QUÊTE DE JALON — cette quête REFERME le jalon. Fais-en la plus grosse de la série.
${milestone.milestoneQuestBrief.fr}
Règles d'une quête de jalon :
- Utilise pleinement la durée cible indiquée plus haut : cette quête doit prendre du temps.
- Plus ambitieuse et plus marquante que les étapes précédentes, mais toujours faisable aujourd'hui ou planifiée pour aujourd'hui.
- Elle doit avoir un goût de petit sommet, pas de course à faire. On doit avoir envie d'en parler à quelqu'un.
- Même schéma de sortie, mêmes règles de sécurité, même mission en une seule phrase.`;
}
