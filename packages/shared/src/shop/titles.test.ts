import { describe, expect, it } from 'vitest';
import {
  equippableTitleIds,
  FREE_TITLE_IDS,
  isTitleEquippable,
  TITLE_IDS,
  TITLES_REGISTRY,
} from './titles';
import { titleUnlockLabel } from './titleUnlockLabel';
import { QUEST_PACKS_REGISTRY } from './questPacks';

describe('catalogue de titres', () => {
  it('chaque entrée est cohérente avec sa clé', () => {
    for (const id of TITLE_IDS) {
      expect(TITLES_REGISTRY[id]!.id).toBe(id);
      expect(TITLES_REGISTRY[id]!.label.length).toBeGreaterThan(0);
      expect(TITLES_REGISTRY[id]!.icon.length).toBeGreaterThan(0);
    }
  });

  it('garde une poignée de titres offerts, pas le catalogue entier', () => {
    expect(FREE_TITLE_IDS.length).toBeGreaterThan(0);
    expect(FREE_TITLE_IDS.length).toBeLessThan(TITLE_IDS.length / 2);
  });

  it('tout titre de pack pointe vers un pack existant', () => {
    for (const id of TITLE_IDS) {
      const unlock = TITLES_REGISTRY[id]!.unlock;
      if (unlock.kind !== 'pack') continue;
      expect(QUEST_PACKS_REGISTRY[unlock.packId], `pack du titre ${id}`).toBeDefined();
    }
  });
});

describe('isTitleEquippable', () => {
  it('laisse porter les titres offerts sans possession', () => {
    for (const id of FREE_TITLE_IDS) {
      expect(isTitleEquippable(id, [])).toBe(true);
    }
  });

  it('refuse un titre verrouillé non possédé', () => {
    const locked = TITLE_IDS.find((id) => TITLES_REGISTRY[id]!.unlock.kind !== 'free')!;
    expect(isTitleEquippable(locked, [])).toBe(false);
    expect(isTitleEquippable(locked, [locked])).toBe(true);
  });

  it('refuse un identifiant inconnu', () => {
    expect(isTitleEquippable('nawak', ['nawak'])).toBe(false);
  });
});

describe('equippableTitleIds', () => {
  it('rend les offerts plus les possédés, sans doublon', () => {
    const locked = TITLE_IDS.find((id) => TITLES_REGISTRY[id]!.unlock.kind !== 'free')!;
    const out = equippableTitleIds([locked, FREE_TITLE_IDS[0]!]);
    expect(new Set(out).size).toBe(out.length);
    expect(out).toContain(locked);
    for (const id of FREE_TITLE_IDS) expect(out).toContain(id);
  });
});

describe('titleUnlockLabel', () => {
  it('ne dit rien pour un titre offert', () => {
    expect(titleUnlockLabel(TITLES_REGISTRY[FREE_TITLE_IDS[0]!]!)).toBe('');
  });

  it('annonce la condition pour chaque titre verrouillé', () => {
    for (const id of TITLE_IDS) {
      const def = TITLES_REGISTRY[id]!;
      if (def.unlock.kind === 'free') continue;
      expect(titleUnlockLabel(def, 'fr'), id).not.toBe('');
      expect(titleUnlockLabel(def, 'en'), id).not.toBe('');
    }
  });

  it('cite le niveau requis', () => {
    const levelTitle = TITLE_IDS.map((id) => TITLES_REGISTRY[id]!).find(
      (d) => d.unlock.kind === 'level',
    )!;
    const level = (levelTitle.unlock as { level: number }).level;
    expect(titleUnlockLabel(levelTitle, 'fr')).toContain(String(level));
    expect(titleUnlockLabel(levelTitle, 'en')).toContain(String(level));
  });
});
