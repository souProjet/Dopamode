import type { EscalationPhase } from './types';
import type { CoinBreakdown } from './engine/coins';
import {
  COIN_AFTER_REROLL_MULT,
  COIN_PER_QUEST_CAP,
  COIN_STREAK_BONUS_CAP,
  COIN_STREAK_PER_DAY,
} from './engine/coins';
import type { LevelReward } from './engine/levelRewards';

const PHASE_FR: Record<EscalationPhase, string> = {
  calibration: 'Découverte',
  expansion: 'Exploration',
  rupture: 'Intensité',
};

export type CoinBreakdownRowFr = {
  key: string;
  label: string;
  value: string;
  detail: string;
};

/**
 * Lignes lisibles pour l'écran de récompense (détail du gain en Quest Coins).
 * Pendant de {@link xpBreakdownRowsFr} : même structure, même écran.
 */
export function coinBreakdownRowsFr(
  b: CoinBreakdown,
  extra?: { fromBadges?: number; fromLevels?: number },
): CoinBreakdownRowFr[] {
  const rows: CoinBreakdownRowFr[] = [
    {
      key: 'base',
      label: 'Quête validée',
      value: `${b.baseRaw} QC`,
      detail: `Base de la phase « ${PHASE_FR[b.basePhase]} ». Les coins se gagnent en faisant, pas en payant.`,
    },
    {
      key: 'streak',
      label: 'Bonus de série',
      value: b.streakBonus > 0 ? `+${b.streakBonus} QC` : '+0 QC',
      detail: `Série de ${b.streakDays} jour(s). +${COIN_STREAK_PER_DAY} QC par jour, plafonné à +${COIN_STREAK_BONUS_CAP} QC.`,
    },
  ];

  if (b.outdoorBonus > 0) {
    rows.push({
      key: 'outdoor',
      label: 'Bonus extérieur',
      value: `+${b.outdoorBonus} QC`,
      detail: 'Quête marquée et réalisée en extérieur.',
    });
  }

  if (b.fallbackPenalty > 0) {
    rows.push({
      key: 'fallback',
      label: 'Repli météo',
      value: `−${b.fallbackPenalty} QC`,
      detail: 'Malus sur une quête de repli (conditions météo défavorables).',
    });
  }

  if (b.afterReroll) {
    rows.push({
      key: 'reroll',
      label: 'Après changement de carte',
      value: `×${COIN_AFTER_REROLL_MULT} → ${b.subtotalAfterReroll} QC`,
      detail: `Tu avais relancé la quête du jour : le sous-total était ${b.subtotalBeforeReroll} QC, puis réduit. Le confort se paie.`,
    });
  }

  if (b.cappedTotal < b.subtotalAfterReroll) {
    rows.push({
      key: 'cap',
      label: 'Plafond par quête',
      value: `${b.cappedTotal} QC retenus`,
      detail: `Le maximum par validation est ${COIN_PER_QUEST_CAP} QC.`,
    });
  }

  if (extra?.fromBadges && extra.fromBadges > 0) {
    rows.push({
      key: 'badges',
      label: 'Insignes débloqués',
      value: `+${extra.fromBadges} QC`,
      detail: 'Chaque insigne paie une prime au déblocage.',
    });
  }

  if (extra?.fromLevels && extra.fromLevels > 0) {
    rows.push({
      key: 'levels',
      label: 'Niveaux franchis',
      value: `+${extra.fromLevels} QC`,
      detail: 'Prime de palier : les niveaux ronds paient davantage.',
    });
  }

  return rows;
}

/** Résumé court d'un palier franchi, pour l'écran de récompense. */
export function levelRewardSummaryFr(reward: LevelReward): string {
  const parts: string[] = [];
  if (reward.coins > 0) parts.push(`+${reward.coins} QC`);
  if (reward.dailyRerolls != null) parts.push(`${reward.dailyRerolls} relance(s) par jour`);
  if (reward.titleId) parts.push('nouveau titre');
  return parts.length > 0 ? parts.join(' · ') : 'Progression enregistrée';
}
