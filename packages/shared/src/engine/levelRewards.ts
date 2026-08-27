import { levelFromTotalXp } from './xp';

/**
 * Ce que le niveau débloque.
 *
 * Avant, l'XP n'ouvrait rien : un compteur qui montait sans conséquence. Ici chaque
 * niveau paie, certains ouvrent un titre, d'autres une capacité de jeu (relances
 * quotidiennes). Les titres cités doivent exister dans `shop/titles.ts`
 * (`levelRewards.test.ts` le vérifie).
 */

export interface LevelReward {
  level: number;
  coins: number;
  /** Titre débloqué à ce niveau (ajouté à `ownedTitleIds`) */
  titleId?: string;
  /** Nouveau nombre de relances quotidiennes offert à partir de ce niveau */
  dailyRerolls?: number;
}

/** Titres de prestige ouverts par le niveau. */
export const LEVEL_TITLE_UNLOCKS: Record<number, string> = {
  5: 'arpenteur',
  10: 'hors_piste',
  20: 'bivouac',
  35: 'taille_dans_le_roc',
  50: 'legende_locale',
};

/**
 * Relances quotidiennes gratuites par palier de niveau.
 * Trié par `minLevel` croissant ; le dernier palier atteint gagne.
 */
export const DAILY_REROLL_TIERS: { minLevel: number; rerolls: number }[] = [
  { minLevel: 1, rerolls: 1 },
  { minLevel: 3, rerolls: 2 },
  { minLevel: 8, rerolls: 3 },
];

export function dailyRerollsForLevel(level: number): number {
  let out = DAILY_REROLL_TIERS[0]!.rerolls;
  for (const tier of DAILY_REROLL_TIERS) {
    if (level >= tier.minLevel) out = tier.rerolls;
  }
  return out;
}

/** Coins versés en atteignant `level` : palier rond = plus généreux. */
export function coinsForLevel(level: number): number {
  if (level <= 1) return 0;
  if (level % 10 === 0) return 250;
  if (level % 5 === 0) return 120;
  return 40;
}

export function levelRewardFor(level: number): LevelReward {
  const tier = DAILY_REROLL_TIERS.find((t) => t.minLevel === level);
  return {
    level,
    coins: coinsForLevel(level),
    ...(LEVEL_TITLE_UNLOCKS[level] ? { titleId: LEVEL_TITLE_UNLOCKS[level] } : {}),
    ...(tier ? { dailyRerolls: tier.rerolls } : {}),
  };
}

/**
 * Récompenses de tous les niveaux franchis entre deux totaux d'XP.
 * L'XP total est monotone : pas besoin de stocker ce qui a déjà été réclamé.
 */
export function levelRewardsBetween(previousTotalXp: number, newTotalXp: number): LevelReward[] {
  const before = levelFromTotalXp(previousTotalXp).level;
  const after = levelFromTotalXp(newTotalXp).level;
  if (after <= before) return [];
  const out: LevelReward[] = [];
  for (let lvl = before + 1; lvl <= after; lvl++) out.push(levelRewardFor(lvl));
  return out;
}

/** Somme des coins et titres à appliquer au profil. */
export function aggregateLevelRewards(rewards: LevelReward[]): {
  coins: number;
  titleIds: string[];
} {
  let coins = 0;
  const titleIds: string[] = [];
  for (const r of rewards) {
    coins += r.coins;
    if (r.titleId) titleIds.push(r.titleId);
  }
  return { coins, titleIds };
}
