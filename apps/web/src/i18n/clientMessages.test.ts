import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import type { AbstractIntlMessages } from 'next-intl';
import { APP_CLIENT_MESSAGES, BASE_CLIENT_MESSAGES, pickMessages } from './clientMessages';
import frJson from '../messages/fr.json';

/** Le JSON typé littéralement contient des tableaux, que `AbstractIntlMessages` n'exprime pas. */
const fr = frJson as unknown as AbstractIntlMessages;

const WEB_ROOT = fileURLToPath(new URL('../..', import.meta.url));
const SRC = join(WEB_ROOT, 'src');

/**
 * Composants client dont les messages viennent d'un provider local, ou qui ne sont rendus que
 * depuis `/app`. Sans cette liste ils devraient figurer dans le socle, donc être rechargés sur
 * toutes les routes.
 */
const PROVIDED_ELSEWHERE: Record<string, readonly string[]> = {
  'src/components/QuestExamplesSlider.tsx': ['HomePage.hero'],
  'src/components/generation-quest/QuestGenerationExplainer.tsx': ['QuestGenerationPage'],
  'src/components/QuestXpCelebration.tsx': APP_CLIENT_MESSAGES,
};

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) return walk(full);
    return full.endsWith('.tsx') ? [full] : [];
  });
}

/** `HomePage` couvre `HomePage.hero` ; l'inverse est faux. */
function covers(declared: readonly string[], used: string): boolean {
  return declared.some((d) => used === d || used.startsWith(`${d}.`));
}

function clientNamespaces(): { file: string; namespace: string }[] {
  return walk(SRC).flatMap((full) => {
    const source = readFileSync(full, 'utf8');
    if (!source.slice(0, 200).includes("'use client'")) return [];
    const file = relative(WEB_ROOT, full);
    return [...source.matchAll(/useTranslations\('([^']+)'\)/g)].map((m) => ({
      file,
      namespace: m[1],
    }));
  });
}

describe('messages fournis aux composants client', () => {
  it('couvre tous les namespaces utilisés côté client', () => {
    const uncovered = clientNamespaces().filter(({ file, namespace }) => {
      const declared =
        PROVIDED_ELSEWHERE[file] ??
        (file.startsWith('src/app/[locale]/app/') ? APP_CLIENT_MESSAGES : BASE_CLIENT_MESSAGES);
      return !covers(declared, namespace);
    });
    expect(uncovered).toEqual([]);
  });

  it('ne déclare aucun namespace absent du catalogue', () => {
    const declared = [...new Set([...APP_CLIENT_MESSAGES, ...Object.values(PROVIDED_ELSEWHERE).flat()])];
    const missing = declared.filter(
      (path) => Object.keys(pickMessages(fr, [path])).length === 0,
    );
    expect(missing).toEqual([]);
  });
});

describe('pickMessages', () => {
  it('extrait les chemins pointés sans écraser les frères', () => {
    expect(pickMessages(fr, ['HomePage.hero', 'HomePage.localeSwitcher'])).toEqual({
      HomePage: { hero: frJson.HomePage.hero, localeSwitcher: frJson.HomePage.localeSwitcher },
    });
  });

  it('ignore un chemin absent plutôt que de casser le rendu', () => {
    expect(pickMessages(fr, ['Inexistant', 'Navbar'])).toEqual({ Navbar: frJson.Navbar });
  });
});
