/**
 * Série (streak).
 *
 * La série compte les jours **réellement validés** d'affilée. Avant, elle montait
 * à la génération de la quête : ouvrir l'app suffisait à décrocher « 30 jours
 * d'affilée » et le bonus d'XP qui va avec. Une série qui ne coûte rien ne
 * retient personne.
 *
 * Invariant : `streakCount` = nombre de jours consécutifs validés jusqu'au
 * dernier jour validé. Il est remis à zéro le jour où la chaîne casse, et
 * incrémenté au moment de la validation.
 */

/** Valeur à écrire quand le joueur valide la quête du jour. */
export function nextStreakOnCompletion(
  currentStreak: number,
  previousDayCompleted: boolean,
): number {
  if (!previousDayCompleted) return 1;
  return Math.max(0, Math.floor(currentStreak)) + 1;
}

/** Valeur à écrire quand une nouvelle journée démarre (génération de la quête). */
export function streakForNewDay(currentStreak: number, previousDayCompleted: boolean): number {
  return previousDayCompleted ? Math.max(0, Math.floor(currentStreak)) : 0;
}
