import { describe, expect, it } from 'vitest';
import { CAPS_REGISTRY, type CapState } from '@questia/shared';
import { buildCapBrief } from './buildCapBrief';

function state(capId: string, milestoneIndex: number, progress: number): CapState {
  return { active: { capId, startedAt: '2026-01-01', milestoneIndex, progress }, completed: [] };
}

describe('buildCapBrief', () => {
  it('ne dit rien sans Cap : la génération reste celle d\'avant', () => {
    expect(buildCapBrief(null, 'fr')).toBe('');
    expect(buildCapBrief(undefined, 'fr')).toBe('');
    expect(buildCapBrief({ active: null, completed: ['reprendre_corps'] }, 'fr')).toBe('');
  });

  it('ignore un Cap inconnu plutôt que de casser le prompt', () => {
    expect(buildCapBrief(state('inexistant', 0, 0), 'fr')).toBe('');
  });

  it('annonce le Cap, le jalon et l\'avancement', () => {
    const brief = buildCapBrief(state('reprendre_corps', 1, 1), 'fr');
    const cap = CAPS_REGISTRY.reprendre_corps!;
    expect(brief).toContain(cap.label.fr);
    expect(brief).toContain(cap.milestones[1]!.title.fr);
    expect(brief).toContain('2/4');
    expect(brief).toContain('1/3');
    expect(brief).toContain(cap.milestones[1]!.brief.fr);
  });

  it('passe en quête de jalon sur la dernière validation manquante', () => {
    const cap = CAPS_REGISTRY.reprendre_corps!;
    const normal = buildCapBrief(state('reprendre_corps', 0, 0), 'fr');
    const big = buildCapBrief(
      state('reprendre_corps', 0, cap.milestones[0]!.questsRequired - 1),
      'fr',
    );
    expect(normal).not.toContain('QUÊTE DE JALON');
    expect(normal).toContain(cap.milestones[0]!.brief.fr);
    expect(big).toContain('QUÊTE DE JALON');
    expect(big).toContain(cap.milestones[0]!.milestoneQuestBrief.fr);
  });

  it('se localise en anglais', () => {
    const cap = CAPS_REGISTRY.habiter_sa_ville!;
    const brief = buildCapBrief(state('habiter_sa_ville', 0, 0), 'en');
    expect(brief).toContain(cap.label.en);
    expect(brief).toContain(cap.milestones[0]!.brief.en);
    expect(brief).not.toContain(cap.label.fr);
  });

  it('produit un bloc pour chaque jalon des six Caps', () => {
    for (const capId of Object.keys(CAPS_REGISTRY)) {
      const cap = CAPS_REGISTRY[capId]!;
      for (let i = 0; i < cap.milestones.length; i += 1) {
        for (const locale of ['fr', 'en'] as const) {
          expect(buildCapBrief(state(capId, i, 0), locale).length, `${capId}/${i}/${locale}`)
            .toBeGreaterThan(80);
        }
      }
    }
  });
});
