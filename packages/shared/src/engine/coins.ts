import type { EscalationPhase } from '../types';

/**
 * Règles de Quest Coins (référence unique pour l'API et l'UI).
 *
 * Principe : **les coins se gagnent en faisant**, pas en payant. Une quête validée
 * paie, une quête relancée paie moins, une quête abandonnée ne paie rien. La
 * recharge Stripe reste un raccourci, jamais un passage obligé.
 *
 * - **Base** : dépend de la phase au moment de l'assignation (calibration → expansion → rupture).
 * - **Série** : bonus par jour de série, plafonné.
 * - **Extérieur** : bonus fixe si la quête complétée est marquée extérieure.
 * - **Relance** : malus multiplicatif sur le sous-total (on paie le confort).
 * - **Fallback météo** : petite pénalité plate.
 * - **Plafond** : aucune complétion ne dépasse {@link COIN_PER_QUEST_CAP}.
 *
 * Ordre de grandeur visé : un pack de quêtes (450–500 QC) s'atteint en deux
 * semaines de jeu régulier, sans dépenser un euro.
 */

export const COIN_BASE_BY_PHASE: Record<EscalationPhase, number> = {
  calibration: 10,
  expansion: 18,
  rupture: 30,
};

/** +2 QC par jour de série, max +20 QC */
export const COIN_STREAK_PER_DAY = 2;
export const COIN_STREAK_BONUS_CAP = 20;

export const COIN_OUTDOOR_BONUS = 5;

/** Après une relance, le sous-total est multiplié par ce facteur */
export const COIN_AFTER_REROLL_MULT = 0.7;

export const COIN_FALLBACK_FLAT_PENALTY = 3;

/** Plafond dur par quête complétée */
export const COIN_PER_QUEST_CAP = 60;

export interface CoinBreakdown {
  basePhase: EscalationPhase;
  baseRaw: number;
  streakDays: number;
  streakBonus: number;
  outdoorBonus: number;
  fallbackPenalty: number;
  afterReroll: boolean;
  subtotalBeforeReroll: number;
  subtotalAfterReroll: number;
  cappedTotal: number;
}

export function coinStreakBonusFor(streakCount: number): number {
  const raw = Math.max(0, streakCount) * COIN_STREAK_PER_DAY;
  return Math.min(raw, COIN_STREAK_BONUS_CAP);
}

export function computeCompletionCoins(input: {
  phaseAtAssignment: EscalationPhase;
  streakCount: number;
  isOutdoor: boolean;
  wasRerolled: boolean;
  wasFallback: boolean;
}): { total: number; breakdown: CoinBreakdown } {
  const baseRaw = COIN_BASE_BY_PHASE[input.phaseAtAssignment];
  const streakBonus = coinStreakBonusFor(input.streakCount);
  const outdoorBonus = input.isOutdoor ? COIN_OUTDOOR_BONUS : 0;
  const fallbackPenalty = input.wasFallback ? COIN_FALLBACK_FLAT_PENALTY : 0;

  let subtotal = Math.max(0, baseRaw + streakBonus + outdoorBonus - fallbackPenalty);
  const subtotalBeforeReroll = subtotal;
  if (input.wasRerolled) {
    subtotal = Math.round(subtotal * COIN_AFTER_REROLL_MULT);
  }

  const cappedTotal = Math.min(subtotal, COIN_PER_QUEST_CAP);

  return {
    total: cappedTotal,
    breakdown: {
      basePhase: input.phaseAtAssignment,
      baseRaw,
      streakDays: Math.max(0, input.streakCount),
      streakBonus,
      outdoorBonus,
      fallbackPenalty,
      afterReroll: input.wasRerolled,
      subtotalBeforeReroll,
      subtotalAfterReroll: subtotal,
      cappedTotal,
    },
  };
}

/** Payload renvoyé par l'API à la validation d'une quête (source unique web + mobile). */
export interface CompletionCoinGain {
  gained: number;
  fromQuest: number;
  fromBadges: number;
  fromLevels: number;
  breakdown: CoinBreakdown;
  previousBalance: number;
  newBalance: number;
}
