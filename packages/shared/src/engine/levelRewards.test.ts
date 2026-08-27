import { describe, expect, it } from 'vitest';
import {
  aggregateLevelRewards,
  coinsForLevel,
  DAILY_REROLL_TIERS,
  dailyRerollsForLevel,
  LEVEL_TITLE_UNLOCKS,
  levelRewardFor,
  levelRewardsBetween,
} from './levelRewards';
import { XP_PER_LEVEL } from './xp';
import { TITLES_REGISTRY } from '../shop/titles';
import { BADGE_DEFINITIONS } from './badges';

describe('coinsForLevel', () => {
  it('ne paie rien pour le niveau de départ', () => {
    expect(coinsForLevel(1)).toBe(0);
  });

  it('paie plus sur les paliers ronds', () => {
    expect(coinsForLevel(2)).toBe(40);
    expect(coinsForLevel(5)).toBe(120);
    expect(coinsForLevel(10)).toBe(250);
    expect(coinsForLevel(20)).toBe(250);
  });
});

describe('dailyRerollsForLevel', () => {
  it('ouvre progressivement les relances gratuites', () => {
    expect(dailyRerollsForLevel(1)).toBe(1);
    expect(dailyRerollsForLevel(2)).toBe(1);
    expect(dailyRerollsForLevel(3)).toBe(2);
    expect(dailyRerollsForLevel(7)).toBe(2);
    expect(dailyRerollsForLevel(8)).toBe(3);
    expect(dailyRerollsForLevel(99)).toBe(3);
  });

  it('reste monotone croissant', () => {
    for (let lvl = 1; lvl < 60; lvl++) {
      expect(dailyRerollsForLevel(lvl + 1)).toBeGreaterThanOrEqual(dailyRerollsForLevel(lvl));
    }
  });
});

describe('levelRewardFor', () => {
  it('joint le titre au niveau qui l\'ouvre', () => {
    expect(levelRewardFor(5).titleId).toBe(LEVEL_TITLE_UNLOCKS[5]);
    expect(levelRewardFor(4).titleId).toBeUndefined();
  });

  it('annonce la nouvelle capacité au palier de relance', () => {
    for (const tier of DAILY_REROLL_TIERS) {
      expect(levelRewardFor(tier.minLevel).dailyRerolls).toBe(tier.rerolls);
    }
    expect(levelRewardFor(4).dailyRerolls).toBeUndefined();
  });
});

describe('levelRewardsBetween', () => {
  it('ne rend rien sans changement de niveau', () => {
    expect(levelRewardsBetween(10, 40)).toEqual([]);
  });

  it('rend un palier par niveau franchi', () => {
    const rewards = levelRewardsBetween(0, XP_PER_LEVEL * 3);
    expect(rewards.map((r) => r.level)).toEqual([2, 3, 4]);
  });

  it('ne saute aucun palier sur un gros gain d\'un coup', () => {
    const rewards = levelRewardsBetween(0, XP_PER_LEVEL * 9 + 10);
    expect(rewards.map((r) => r.level)).toEqual([2, 3, 4, 5, 6, 7, 8, 9, 10]);
    expect(rewards.some((r) => r.titleId === LEVEL_TITLE_UNLOCKS[5])).toBe(true);
    expect(rewards.some((r) => r.titleId === LEVEL_TITLE_UNLOCKS[10])).toBe(true);
  });
});

describe('aggregateLevelRewards', () => {
  it('additionne coins et titres', () => {
    const agg = aggregateLevelRewards(levelRewardsBetween(0, XP_PER_LEVEL * 4));
    expect(agg.coins).toBe(40 + 40 + 40 + 120);
    expect(agg.titleIds).toEqual([LEVEL_TITLE_UNLOCKS[5]]);
  });

  it('ne rend rien sur une liste vide', () => {
    expect(aggregateLevelRewards([])).toEqual({ coins: 0, titleIds: [] });
  });
});

describe('cohérence des titres récompensés', () => {
  it('tout titre ouvert par un niveau existe au catalogue', () => {
    for (const [level, id] of Object.entries(LEVEL_TITLE_UNLOCKS)) {
      expect(TITLES_REGISTRY[id], `titre du niveau ${level}`).toBeDefined();
      expect(TITLES_REGISTRY[id]!.unlock).toEqual({ kind: 'level', level: Number(level) });
    }
  });

  it('tout titre ouvert par un insigne existe et pointe vers lui', () => {
    for (const def of BADGE_DEFINITIONS) {
      if (!def.rewardTitleId) continue;
      const title = TITLES_REGISTRY[def.rewardTitleId];
      expect(title, `titre de l'insigne ${def.id}`).toBeDefined();
      expect(title!.unlock).toEqual({ kind: 'badge', badgeId: def.id });
    }
  });

  it('aucun insigne ne récompense le même titre deux fois', () => {
    const ids = BADGE_DEFINITIONS.map((d) => d.rewardTitleId).filter((id) => id != null);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
