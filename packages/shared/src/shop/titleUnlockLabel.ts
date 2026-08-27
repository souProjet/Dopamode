import type { AppLocale } from '../types';
import { BADGE_DEFINITIONS, localizeBadgeDefinition, type BadgeId } from '../engine/badges';
import { CAPS_REGISTRY } from '../engine/caps';
import { QUEST_PACKS_REGISTRY } from './questPacks';
import type { TitleDefinition } from './titles';

const badgeById = new Map(BADGE_DEFINITIONS.map((b) => [b.id as string, b]));

/**
 * Phrase courte « comment on obtient ce titre », pour les sélecteurs de titre.
 * Les libellés des titres restent en français (registre historique) ; seule la
 * condition d'obtention se localise, à partir des données déjà traduites.
 */
export function titleUnlockLabel(def: TitleDefinition, locale: AppLocale = 'fr'): string {
  const u = def.unlock;
  if (u.kind === 'free') return '';
  if (u.kind === 'level') return locale === 'en' ? `Level ${u.level}` : `Niveau ${u.level}`;
  if (u.kind === 'badge') {
    const badge = badgeById.get(u.badgeId);
    const name = badge
      ? localizeBadgeDefinition(badge, locale).title
      : (u.badgeId as BadgeId);
    return locale === 'en' ? `Badge · ${name}` : `Insigne · ${name}`;
  }
  if (u.kind === 'pack') {
    const pack = QUEST_PACKS_REGISTRY[u.packId];
    const name = pack ? (locale === 'en' ? pack.labelEn : pack.label) : u.packId;
    return locale === 'en' ? `Quest pack · ${name}` : `Pack de quêtes · ${name}`;
  }
  const cap = CAPS_REGISTRY[u.capId];
  const capName = cap ? cap.label[locale] : u.capId;
  return locale === 'en' ? `Cap · ${capName}` : `Cap · ${capName}`;
}
