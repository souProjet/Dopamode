import { describe, expect, it } from 'vitest';
import {
  CAPS_REGISTRY,
  CAP_CATEGORY_BIAS,
  CAP_IDS,
  abandonCap,
  advanceCapOnCompletion,
  capCatalog,
  capCategoryBias,
  capProgressView,
  currentMilestone,
  isMilestoneQuestNext,
  parseCapState,
  questCountsForCap,
  startCap,
  type CapState,
} from './caps';
import { ALL_PSYCHOLOGICAL_CATEGORIES } from '../constants/quests';
import { TITLES_REGISTRY } from '../shop/titles';

const EMPTY: CapState = { active: null, completed: [] };

function stateAt(capId: string, milestoneIndex: number, progress: number): CapState {
  return { active: { capId, startedAt: '2026-01-01', milestoneIndex, progress }, completed: [] };
}

/** Enchaîne les validations d'une famille du jalon courant. */
function play(state: CapState, turns: number): { state: CapState; coins: number; titles: string[] } {
  let s = state;
  let coins = 0;
  const titles: string[] = [];
  for (let i = 0; i < turns; i += 1) {
    const ms = currentMilestone(s);
    if (!ms) break;
    const r = advanceCapOnCompletion(s, ms.categories[0]);
    s = r.state;
    coins += r.coins;
    if (r.titleId) titles.push(r.titleId);
  }
  return { state: s, coins, titles };
}

describe('catalogue des Caps', () => {
  it('expose six Caps de quatre jalons', () => {
    expect(CAP_IDS).toHaveLength(6);
    for (const id of CAP_IDS) {
      expect(CAPS_REGISTRY[id]!.milestones).toHaveLength(4);
    }
  });

  it('chaque id de Cap correspond à sa clé de registre', () => {
    for (const id of CAP_IDS) expect(CAPS_REGISTRY[id]!.id).toBe(id);
  });

  it('toutes les familles citées existent dans la taxonomie', () => {
    for (const id of CAP_IDS) {
      for (const ms of CAPS_REGISTRY[id]!.milestones) {
        expect(ms.categories.length).toBeGreaterThan(0);
        for (const c of ms.categories) {
          expect(ALL_PSYCHOLOGICAL_CATEGORIES, `${id}/${ms.slug}`).toContain(c);
        }
      }
    }
  });

  it('chaque Cap récompense un titre existant qui pointe vers lui', () => {
    for (const id of CAP_IDS) {
      const cap = CAPS_REGISTRY[id]!;
      const title = TITLES_REGISTRY[cap.rewardTitleId];
      expect(title, `titre du cap ${id}`).toBeDefined();
      expect(title!.unlock).toEqual({ kind: 'cap', capId: id });
    }
  });

  it('aucun titre de Cap n\'est partagé par deux Caps', () => {
    const ids = CAP_IDS.map((id) => CAPS_REGISTRY[id]!.rewardTitleId);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('les slugs de jalon sont uniques au sein d\'un Cap', () => {
    for (const id of CAP_IDS) {
      const slugs = CAPS_REGISTRY[id]!.milestones.map((m) => m.slug);
      expect(new Set(slugs).size, id).toBe(slugs.length);
    }
  });

  it('les textes existent en français et en anglais', () => {
    for (const id of CAP_IDS) {
      const cap = CAPS_REGISTRY[id]!;
      for (const l of ['fr', 'en'] as const) {
        expect(cap.label[l].length, `${id}.label.${l}`).toBeGreaterThan(0);
        expect(cap.promise[l].length, `${id}.promise.${l}`).toBeGreaterThan(0);
        expect(cap.forWho[l].length, `${id}.forWho.${l}`).toBeGreaterThan(0);
        for (const ms of cap.milestones) {
          expect(ms.title[l].length, `${id}/${ms.slug}.title.${l}`).toBeGreaterThan(0);
          expect(ms.intent[l].length, `${id}/${ms.slug}.intent.${l}`).toBeGreaterThan(0);
          expect(ms.brief[l].length, `${id}/${ms.slug}.brief.${l}`).toBeGreaterThan(0);
          expect(
            ms.milestoneQuestBrief[l].length,
            `${id}/${ms.slug}.milestoneQuestBrief.${l}`,
          ).toBeGreaterThan(0);
        }
      }
    }
  });

  it('la difficulté monte : le dernier jalon demande au moins autant que le premier', () => {
    for (const id of CAP_IDS) {
      const ms = CAPS_REGISTRY[id]!.milestones;
      expect(ms[3]!.questsRequired, id).toBeGreaterThanOrEqual(ms[0]!.questsRequired);
      expect(ms[3]!.rewardCoins, id).toBeGreaterThan(ms[0]!.rewardCoins);
    }
  });

  it('un Cap coûte trois semaines de jeu environ et paie de quoi viser un pack', () => {
    for (const id of CAP_IDS) {
      const cap = CAPS_REGISTRY[id]!;
      const quests = cap.milestones.reduce((n, m) => n + m.questsRequired, 0);
      const coins = cap.milestones.reduce((n, m) => n + m.rewardCoins, 0) + cap.rewardCoins;
      expect(quests, id).toBe(14);
      expect(coins, id).toBe(500);
    }
  });
});

describe('lecture de l\'état', () => {
  it('accepte null, undefined et n\'importe quoi', () => {
    for (const raw of [null, undefined, 3, 'x', [], {}]) {
      expect(parseCapState(raw)).toEqual({ active: null, completed: [] });
    }
  });

  it('ignore un Cap inconnu', () => {
    const s = parseCapState({ active: { capId: 'inexistant', milestoneIndex: 0, progress: 1 } });
    expect(s.active).toBeNull();
  });

  it('filtre les Caps inconnus de l\'historique', () => {
    const s = parseCapState({ active: null, completed: ['reprendre_corps', 'zzz', 42] });
    expect(s.completed).toEqual(['reprendre_corps']);
  });

  it('borne un index de jalon ou une progression hors limites', () => {
    const s = parseCapState({
      active: { capId: 'reprendre_corps', startedAt: '2026-01-01', milestoneIndex: 99, progress: 99 },
      completed: [],
    });
    expect(s.active!.milestoneIndex).toBe(3);
    expect(s.active!.progress).toBe(CAPS_REGISTRY.reprendre_corps!.milestones[3]!.questsRequired);
  });

  it('refuse une progression négative', () => {
    const s = parseCapState({
      active: { capId: 'reprendre_corps', startedAt: '', milestoneIndex: -5, progress: -3 },
    });
    expect(s.active!.milestoneIndex).toBe(0);
    expect(s.active!.progress).toBe(0);
  });
});

describe('comptage des quêtes', () => {
  it('sans Cap actif, rien ne compte', () => {
    expect(questCountsForCap(EMPTY, 'physical_existential')).toBe(false);
    expect(advanceCapOnCompletion(EMPTY, 'physical_existential').counted).toBe(false);
  });

  it('une famille hors jalon ne fait pas avancer', () => {
    const s = stateAt('reprendre_corps', 0, 1);
    const r = advanceCapOnCompletion(s, 'active_empathy');
    expect(r.counted).toBe(false);
    expect(r.state).toBe(s);
  });

  it('une catégorie absente ou nulle ne fait pas avancer', () => {
    const s = stateAt('reprendre_corps', 0, 0);
    expect(advanceCapOnCompletion(s, null).counted).toBe(false);
    expect(advanceCapOnCompletion(s, undefined).counted).toBe(false);
  });

  it('une famille du jalon incrémente sans payer tant que le jalon n\'est pas bouclé', () => {
    const r = advanceCapOnCompletion(stateAt('reprendre_corps', 0, 0), 'physical_existential');
    expect(r.counted).toBe(true);
    expect(r.state.active!.progress).toBe(1);
    expect(r.coins).toBe(0);
    expect(r.milestoneCompleted).toBeNull();
  });
});

describe('franchissement des jalons', () => {
  it('la dernière quête du jalon paie et ouvre le suivant', () => {
    const cap = CAPS_REGISTRY.reprendre_corps!;
    const s = stateAt('reprendre_corps', 0, cap.milestones[0]!.questsRequired - 1);
    const r = advanceCapOnCompletion(s, cap.milestones[0]!.categories[0]);
    expect(r.milestoneCompleted?.slug).toBe(cap.milestones[0]!.slug);
    expect(r.coins).toBe(cap.milestones[0]!.rewardCoins);
    expect(r.state.active).toEqual({
      capId: 'reprendre_corps',
      startedAt: '2026-01-01',
      milestoneIndex: 1,
      progress: 0,
    });
    expect(r.capCompleted).toBeNull();
    expect(r.titleId).toBeNull();
  });

  it('quatorze quêtes utiles terminent le Cap, versent 500 QC et le titre', () => {
    const { state, coins, titles } = play(startCap(EMPTY, 'reprendre_corps', '2026-01-01')!, 14);
    expect(coins).toBe(500);
    expect(titles).toEqual(['cap_corps_retrouve']);
    expect(state.active).toBeNull();
    expect(state.completed).toEqual(['reprendre_corps']);
  });

  it('un Cap terminé n\'est pas inscrit deux fois dans l\'historique', () => {
    let s: CapState = { active: null, completed: ['reprendre_corps'] };
    s = startCap(s, 'reprendre_corps', '2026-02-01')!;
    const done = play(s, 14).state;
    expect(done.completed).toEqual(['reprendre_corps']);
  });

  it('après la fin, une validation supplémentaire ne fait plus rien', () => {
    const done = play(startCap(EMPTY, 'reprendre_corps', '2026-01-01')!, 14).state;
    const r = advanceCapOnCompletion(done, 'physical_existential');
    expect(r.counted).toBe(false);
    expect(r.coins).toBe(0);
  });

  it('vaut pour les six Caps', () => {
    for (const id of CAP_IDS) {
      const { state, coins, titles } = play(startCap(EMPTY, id, '2026-01-01')!, 14);
      expect(coins, id).toBe(500);
      expect(titles, id).toEqual([CAPS_REGISTRY[id]!.rewardTitleId]);
      expect(state.completed, id).toEqual([id]);
    }
  });
});

describe('quête de jalon', () => {
  it('s\'annonce quand il ne manque qu\'une validation', () => {
    const cap = CAPS_REGISTRY.reprendre_corps!;
    const req = cap.milestones[0]!.questsRequired;
    expect(isMilestoneQuestNext(stateAt('reprendre_corps', 0, req - 2))).toBe(false);
    expect(isMilestoneQuestNext(stateAt('reprendre_corps', 0, req - 1))).toBe(true);
  });

  it('n\'existe pas sans Cap actif', () => {
    expect(isMilestoneQuestNext(EMPTY)).toBe(false);
  });

  it('revient une fois par jalon, soit quatre fois par Cap', () => {
    let s = startCap(EMPTY, 'habiter_sa_ville', '2026-01-01')!;
    let big = 0;
    for (let i = 0; i < 14; i += 1) {
      if (isMilestoneQuestNext(s)) big += 1;
      s = advanceCapOnCompletion(s, currentMilestone(s)!.categories[0]).state;
    }
    expect(big).toBe(4);
  });
});

describe('biais de génération', () => {
  it('est vide sans Cap actif', () => {
    expect(capCategoryBias(EMPTY)).toEqual({});
  });

  it('cible exactement les familles du jalon courant', () => {
    const ms = CAPS_REGISTRY.sortir_de_sa_bulle!.milestones[2]!;
    const bias = capCategoryBias(stateAt('sortir_de_sa_bulle', 2, 0));
    expect(Object.keys(bias).sort()).toEqual([...ms.categories].sort());
    for (const v of Object.values(bias)) expect(v).toBe(CAP_CATEGORY_BIAS);
  });

  it('reste un biais, pas une contrainte : il ne dépasse pas 0.3', () => {
    expect(CAP_CATEGORY_BIAS).toBeGreaterThan(0);
    expect(CAP_CATEGORY_BIAS).toBeLessThanOrEqual(0.3);
  });

  it('suit le jalon courant', () => {
    const a = Object.keys(capCategoryBias(stateAt('reprendre_corps', 0, 0)));
    const b = Object.keys(capCategoryBias(stateAt('reprendre_corps', 3, 0)));
    expect(a).not.toEqual(b);
  });
});

describe('démarrage et abandon', () => {
  it('refuse un Cap inconnu', () => {
    expect(startCap(EMPTY, 'nope', '2026-01-01')).toBeNull();
  });

  it('démarre au premier jalon et garde l\'historique', () => {
    const prev: CapState = { active: null, completed: ['reprendre_corps'] };
    const s = startCap(prev, 'habiter_sa_ville', '2026-03-02')!;
    expect(s.active).toEqual({
      capId: 'habiter_sa_ville',
      startedAt: '2026-03-02',
      milestoneIndex: 0,
      progress: 0,
    });
    expect(s.completed).toEqual(['reprendre_corps']);
  });

  it('changer de Cap remplace l\'actif : un seul à la fois', () => {
    const s = startCap(stateAt('reprendre_corps', 2, 3), 'laisser_une_trace', '2026-03-02')!;
    expect(s.active!.capId).toBe('laisser_une_trace');
    expect(s.active!.milestoneIndex).toBe(0);
  });

  it('abandonner efface la progression mais pas l\'historique', () => {
    const s = abandonCap({ ...stateAt('reprendre_corps', 2, 3), completed: ['habiter_sa_ville'] });
    expect(s.active).toBeNull();
    expect(s.completed).toEqual(['habiter_sa_ville']);
  });
});

describe('vues d\'affichage', () => {
  it('pas de vue de progression sans Cap actif', () => {
    expect(capProgressView(EMPTY)).toBeNull();
  });

  it('rapporte la progression globale sur les quatorze quêtes', () => {
    // jalons 3/3/4/4 : jalon 2 entamé de 2 → 3 + 3 + 2 = 8 sur 14
    const v = capProgressView(stateAt('reprendre_corps', 2, 2))!;
    expect(v.milestoneIndex).toBe(2);
    expect(v.milestoneCount).toBe(4);
    expect(v.progress).toBe(2);
    expect(v.questsRequired).toBe(4);
    expect(v.overallPercent).toBe(Math.round((8 / 14) * 100));
    expect(v.milestoneQuestNext).toBe(false);
  });

  it('se localise', () => {
    const fr = capProgressView(stateAt('reprendre_corps', 0, 0), 'fr')!;
    const en = capProgressView(stateAt('reprendre_corps', 0, 0), 'en')!;
    expect(fr.label).not.toBe(en.label);
    expect(en.promise.length).toBeGreaterThan(0);
  });

  it('le catalogue marque l\'actif et les terminés', () => {
    const state: CapState = {
      active: { capId: 'habiter_sa_ville', startedAt: '2026-01-01', milestoneIndex: 0, progress: 0 },
      completed: ['reprendre_corps'],
    };
    const entries = capCatalog(state);
    expect(entries).toHaveLength(6);
    expect(entries.find((e) => e.id === 'habiter_sa_ville')!.active).toBe(true);
    expect(entries.find((e) => e.id === 'reprendre_corps')!.completed).toBe(true);
    expect(entries.find((e) => e.id === 'laisser_une_trace')!.active).toBe(false);
    for (const e of entries) {
      expect(e.totalQuests).toBe(14);
      expect(e.totalCoins).toBe(500);
      expect(e.milestoneTitles).toHaveLength(4);
    }
  });
});
