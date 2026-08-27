/**
 * Titres d'affichage.
 *
 * Un titre se **gagne** : niveau atteint, insigne débloqué, parcours de pack terminé.
 * Seuls les titres `free` sont disponibles d'entrée — le reste arrive dans
 * `ownedTitleIds` au moment où la condition tombe. Sans cette règle, la récompense
 * finale d'un pack payant serait déjà portée par tout le monde.
 *
 * Pour en créer un : ajouter une entrée ici, puis la source qui le débloque
 * (`engine/levelRewards.ts`, `engine/badges.ts`, `engine/caps.ts` ou
 * `shop/questPackArcs.ts`).
 * Les icônes doivent exister dans le registre web (`apps/web/src/components/Icons.tsx`).
 */
export type TitleUnlock =
  | { kind: 'free' }
  | { kind: 'level'; level: number }
  | { kind: 'badge'; badgeId: string }
  | { kind: 'pack'; packId: string }
  | { kind: 'cap'; capId: string };

export interface TitleDefinition {
  id: string;
  /** Court libellé sous le pseudo / dans la nav */
  label: string;
  /** Nom d'icône Lucide (PascalCase) */
  icon: string;
  /** Comment on l'obtient */
  unlock: TitleUnlock;
}

export const TITLES_REGISTRY: Record<string, TitleDefinition> = {
  // ── Titres de départ ────────────────────────────────────────────────────
  scout: {
    id: 'scout',
    label: 'Éclaireur·se des trottoirs',
    icon: 'Compass',
    unlock: { kind: 'free' },
  },
  spark: {
    id: 'spark',
    label: 'Étincelle du quotidien',
    icon: 'Sparkles',
    unlock: { kind: 'free' },
  },
  anchor: {
    id: 'anchor',
    label: 'Ancre du calme',
    icon: 'Anchor',
    unlock: { kind: 'free' },
  },
  comet: {
    id: 'comet',
    label: 'Traînée comète',
    icon: 'Rocket',
    unlock: { kind: 'free' },
  },
  heart: {
    id: 'heart',
    label: 'Cœur en vadrouille',
    icon: 'Heart',
    unlock: { kind: 'free' },
  },

  // ── Titres de niveau ────────────────────────────────────────────────────
  arpenteur: {
    id: 'arpenteur',
    label: 'Arpenteur·se',
    icon: 'Navigation',
    unlock: { kind: 'level', level: 5 },
  },
  hors_piste: {
    id: 'hors_piste',
    label: 'Hors-piste',
    icon: 'Mountain',
    unlock: { kind: 'level', level: 10 },
  },
  bivouac: {
    id: 'bivouac',
    label: 'Bivouac permanent',
    icon: 'Tent',
    unlock: { kind: 'level', level: 20 },
  },
  taille_dans_le_roc: {
    id: 'taille_dans_le_roc',
    label: 'Taillé·e dans le roc',
    icon: 'Gem',
    unlock: { kind: 'level', level: 35 },
  },
  legende_locale: {
    id: 'legende_locale',
    label: 'Légende locale',
    icon: 'Trophy',
    unlock: { kind: 'level', level: 50 },
  },

  // ── Titres d'insigne ────────────────────────────────────────────────────
  ligne_franchie: {
    id: 'ligne_franchie',
    label: 'Ligne franchie',
    icon: 'Zap',
    unlock: { kind: 'badge', badgeId: 'phase_rupture' },
  },
  metronome: {
    id: 'metronome',
    label: 'Métronome',
    icon: 'Star',
    unlock: { kind: 'badge', badgeId: 'serie_30' },
  },
  inebranlable: {
    id: 'inebranlable',
    label: 'Inébranlable',
    icon: 'Shield',
    unlock: { kind: 'badge', badgeId: 'serie_60' },
  },
  cent_fois: {
    id: 'cent_fois',
    label: 'Cent fois sur le métier',
    icon: 'Medal',
    unlock: { kind: 'badge', badgeId: 'cent_quetes' },
  },
  plein_vent: {
    id: 'plein_vent',
    label: 'Plein vent',
    icon: 'TreePine',
    unlock: { kind: 'badge', badgeId: 'exterieur_50' },
  },
  saison_habitee: {
    id: 'saison_habitee',
    label: 'Saison habitée',
    icon: 'Sprout',
    unlock: { kind: 'badge', badgeId: 'parcours_jour_60' },
  },

  // ── Titres exclusifs débloqués en finissant un parcours de pack ─────────
  pack_couple_master: {
    id: 'pack_couple_master',
    label: 'Tandem',
    icon: 'Heart',
    unlock: { kind: 'pack', packId: 'pack_couple' },
  },
  pack_ose_master: {
    id: 'pack_ose_master',
    label: 'Audacieux·se',
    icon: 'Flame',
    unlock: { kind: 'pack', packId: 'pack_ose' },
  },
  pack_rencontres_master: {
    id: 'pack_rencontres_master',
    label: 'Étincelle',
    icon: 'Sparkles',
    unlock: { kind: 'pack', packId: 'pack_rencontres' },
  },
  pack_nocturne_master: {
    id: 'pack_nocturne_master',
    label: 'Noctambule',
    icon: 'Moon',
    unlock: { kind: 'pack', packId: 'pack_nocturne' },
  },
  pack_piment_master: {
    id: 'pack_piment_master',
    label: 'Pimenté·e',
    icon: 'Zap',
    unlock: { kind: 'pack', packId: 'pack_piment' },
  },
  pack_solo_absolu_master: {
    id: 'pack_solo_absolu_master',
    label: 'Solitude lumineuse',
    icon: 'User',
    unlock: { kind: 'pack', packId: 'pack_solo_absolu' },
  },
  pack_gastronomie_master: {
    id: 'pack_gastronomie_master',
    label: 'Gourmet·te',
    icon: 'UtensilsCrossed',
    unlock: { kind: 'pack', packId: 'pack_gastronomie' },
  },
  pack_slow_life_master: {
    id: 'pack_slow_life_master',
    label: 'Tempo doux',
    icon: 'Leaf',
    unlock: { kind: 'pack', packId: 'pack_slow_life' },
  },
  pack_social_amis_master: {
    id: 'pack_social_amis_master',
    label: 'Tisseur·se',
    icon: 'Users',
    unlock: { kind: 'pack', packId: 'pack_social_amis' },
  },
  pack_paris_master: {
    id: 'pack_paris_master',
    label: 'Flâneur·se de Paris',
    icon: 'MapPin',
    unlock: { kind: 'pack', packId: 'pack_paris' },
  },
  pack_lyon_master: {
    id: 'pack_lyon_master',
    label: 'Gone des quais',
    icon: 'MapPin',
    unlock: { kind: 'pack', packId: 'pack_lyon' },
  },
  pack_nantes_master: {
    id: 'pack_nantes_master',
    label: 'Voyageur·se nantais',
    icon: 'MapPin',
    unlock: { kind: 'pack', packId: 'pack_nantes' },
  },
  pack_marseille_master: {
    id: 'pack_marseille_master',
    label: 'Cap au Sud',
    icon: 'MapPin',
    unlock: { kind: 'pack', packId: 'pack_marseille' },
  },

  // ── Titres de Cap (objectifs longs, cf. `engine/caps.ts`) ───────────────
  cap_corps_retrouve: {
    id: 'cap_corps_retrouve',
    label: 'Corps retrouvé',
    icon: 'Flame',
    unlock: { kind: 'cap', capId: 'reprendre_corps' },
  },
  cap_arpenteur_urbain: {
    id: 'cap_arpenteur_urbain',
    label: 'Arpenteur·se urbain·e',
    icon: 'Map',
    unlock: { kind: 'cap', capId: 'habiter_sa_ville' },
  },
  cap_tisseur_de_liens: {
    id: 'cap_tisseur_de_liens',
    label: 'Tisseur·se de liens',
    icon: 'Handshake',
    unlock: { kind: 'cap', capId: 'sortir_de_sa_bulle' },
  },
  cap_esprit_clair: {
    id: 'cap_esprit_clair',
    label: 'Esprit clair',
    icon: 'Moon',
    unlock: { kind: 'cap', capId: 'reprendre_son_attention' },
  },
  cap_gardien_des_liens: {
    id: 'cap_gardien_des_liens',
    label: 'Gardien·ne des siens',
    icon: 'Shield',
    unlock: { kind: 'cap', capId: 'reparer_ses_liens' },
  },
  cap_batisseur: {
    id: 'cap_batisseur',
    label: 'Bâtisseur·se',
    icon: 'Gem',
    unlock: { kind: 'cap', capId: 'laisser_une_trace' },
  },
};

export const TITLE_IDS = Object.keys(TITLES_REGISTRY);

/** Titres disponibles sans rien débloquer. */
export const FREE_TITLE_IDS = TITLE_IDS.filter(
  (id) => TITLES_REGISTRY[id]!.unlock.kind === 'free',
);

export function getTitleDefinition(id: string): TitleDefinition | undefined {
  return TITLES_REGISTRY[id];
}

/** Un titre est portable s'il est gratuit ou présent dans `ownedTitleIds`. */
export function isTitleEquippable(id: string, ownedTitleIds: string[]): boolean {
  const def = TITLES_REGISTRY[id];
  if (!def) return false;
  return def.unlock.kind === 'free' || ownedTitleIds.includes(id);
}

/** Ids portables par ce profil, dans l'ordre du registre. */
export function equippableTitleIds(ownedTitleIds: string[]): string[] {
  return TITLE_IDS.filter((id) => isTitleEquippable(id, ownedTitleIds));
}
