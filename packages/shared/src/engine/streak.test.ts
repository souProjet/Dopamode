import { describe, expect, it } from 'vitest';
import { nextStreakOnCompletion, streakForNewDay } from './streak';

describe('nextStreakOnCompletion', () => {
  it('démarre à 1 quand la veille n\'a pas été validée', () => {
    expect(nextStreakOnCompletion(0, false)).toBe(1);
    expect(nextStreakOnCompletion(12, false)).toBe(1);
  });

  it('incrémente quand la chaîne tient', () => {
    expect(nextStreakOnCompletion(0, true)).toBe(1);
    expect(nextStreakOnCompletion(6, true)).toBe(7);
  });

  it('assainit une valeur stockée aberrante', () => {
    expect(nextStreakOnCompletion(-5, true)).toBe(1);
    expect(nextStreakOnCompletion(3.7, true)).toBe(4);
  });
});

describe('streakForNewDay', () => {
  it('ne monte jamais : générer une quête ne vaut pas la faire', () => {
    expect(streakForNewDay(6, true)).toBe(6);
    expect(streakForNewDay(0, true)).toBe(0);
  });

  it('casse la chaîne si la veille n\'a pas été validée', () => {
    expect(streakForNewDay(30, false)).toBe(0);
  });
});
