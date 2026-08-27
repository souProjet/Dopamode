import { describe, expect, it } from 'vitest';
import {
  COIN_AFTER_REROLL_MULT,
  COIN_BASE_BY_PHASE,
  COIN_OUTDOOR_BONUS,
  COIN_PER_QUEST_CAP,
  COIN_STREAK_BONUS_CAP,
  coinStreakBonusFor,
  computeCompletionCoins,
} from './coins';

const base = {
  phaseAtAssignment: 'rupture' as const,
  streakCount: 0,
  isOutdoor: false,
  wasRerolled: false,
  wasFallback: false,
};

describe('coinStreakBonusFor', () => {
  it('monte de 2 QC par jour', () => {
    expect(coinStreakBonusFor(0)).toBe(0);
    expect(coinStreakBonusFor(1)).toBe(2);
    expect(coinStreakBonusFor(5)).toBe(10);
  });

  it('plafonne le bonus de série', () => {
    expect(coinStreakBonusFor(50)).toBe(COIN_STREAK_BONUS_CAP);
  });

  it('ignore une série négative', () => {
    expect(coinStreakBonusFor(-3)).toBe(0);
  });
});

describe('computeCompletionCoins', () => {
  it('paie la base de la phase quand rien d\'autre ne joue', () => {
    for (const phase of ['calibration', 'expansion', 'rupture'] as const) {
      const { total } = computeCompletionCoins({ ...base, phaseAtAssignment: phase });
      expect(total).toBe(COIN_BASE_BY_PHASE[phase]);
    }
  });

  it('ajoute série et extérieur', () => {
    const { total, breakdown } = computeCompletionCoins({
      ...base,
      phaseAtAssignment: 'expansion',
      streakCount: 4,
      isOutdoor: true,
    });
    expect(breakdown.streakBonus).toBe(8);
    expect(breakdown.outdoorBonus).toBe(COIN_OUTDOOR_BONUS);
    expect(total).toBe(COIN_BASE_BY_PHASE.expansion + 8 + COIN_OUTDOOR_BONUS);
  });

  it('réduit le gain après une relance', () => {
    const plain = computeCompletionCoins({ ...base, phaseAtAssignment: 'expansion' });
    const rerolled = computeCompletionCoins({
      ...base,
      phaseAtAssignment: 'expansion',
      wasRerolled: true,
    });
    expect(rerolled.total).toBe(Math.round(plain.total * COIN_AFTER_REROLL_MULT));
    expect(rerolled.total).toBeLessThan(plain.total);
  });

  it('applique la pénalité de repli météo avant la relance', () => {
    const { breakdown } = computeCompletionCoins({
      ...base,
      phaseAtAssignment: 'rupture',
      wasFallback: true,
    });
    expect(breakdown.fallbackPenalty).toBeGreaterThan(0);
    expect(breakdown.subtotalBeforeReroll).toBe(
      COIN_BASE_BY_PHASE.rupture - breakdown.fallbackPenalty,
    );
  });

  it('ne descend jamais sous zéro', () => {
    const { total } = computeCompletionCoins({
      ...base,
      phaseAtAssignment: 'calibration',
      wasFallback: true,
    });
    expect(total).toBeGreaterThanOrEqual(0);
  });

  it('ne dépasse jamais le plafond par quête, quelle que soit la combinaison', () => {
    for (const phase of ['calibration', 'expansion', 'rupture'] as const) {
      for (const streakCount of [0, 5, 10, 999]) {
        for (const isOutdoor of [false, true]) {
          for (const wasRerolled of [false, true]) {
            for (const wasFallback of [false, true]) {
              const { total } = computeCompletionCoins({
                phaseAtAssignment: phase,
                streakCount,
                isOutdoor,
                wasRerolled,
                wasFallback,
              });
              expect(total).toBeLessThanOrEqual(COIN_PER_QUEST_CAP);
              expect(total).toBeGreaterThanOrEqual(0);
            }
          }
        }
      }
    }
  });

  it('garde le meilleur gain possible sous le plafond (le plafond reste un garde-fou)', () => {
    const { total } = computeCompletionCoins({
      ...base,
      phaseAtAssignment: 'rupture',
      streakCount: 999,
      isOutdoor: true,
    });
    // 30 (rupture) + 20 (série plafonnée) + 5 (extérieur)
    expect(total).toBe(55);
    expect(total).toBeLessThanOrEqual(COIN_PER_QUEST_CAP);
  });

  it('reste dans l\'ordre de grandeur visé : un pack de quêtes en deux semaines', () => {
    // Rythme réaliste : phase rupture, série installée, pas de relance.
    const { total } = computeCompletionCoins({
      ...base,
      phaseAtAssignment: 'rupture',
      streakCount: 10,
    });
    expect(total * 14).toBeGreaterThanOrEqual(500);
  });
});
