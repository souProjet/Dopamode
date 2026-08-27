/**
 * Le plugin @clerk/expo cherche ClerkViewFactory.swift dans <app>/node_modules et
 * <app>/../node_modules uniquement (app.plugin.js, tableau possiblePaths). Ici npm
 * workspaces hisse le paquet dans <repo>/node_modules, deux niveaux au-dessus :
 * aucune sonde ne matche, l'injection est ignorée ("ClerkViewFactory.swift not found"),
 * et AppDelegate.swift ne compile plus car il appelle ClerkViewFactory.register().
 * On expose donc le paquet hissé à l'emplacement que le plugin sonde en premier.
 */
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const mobileRoot = path.join(repoRoot, 'apps', 'mobile');
const require = createRequire(path.join(repoRoot, 'package.json'));

let pkgRoot;
try {
  pkgRoot = path.dirname(require.resolve('@clerk/expo/package.json', { paths: [repoRoot] }));
} catch {
  process.exit(0);
}

// Déjà résolvable depuis l'app (paquet non hissé ou lien en place) : rien à faire.
try {
  require.resolve('@clerk/expo/package.json', { paths: [mobileRoot] });
  process.exit(0);
} catch {
  /* lien à créer */
}

const linkPath = path.join(mobileRoot, 'node_modules', '@clerk', 'expo');
const target = path.relative(path.dirname(linkPath), pkgRoot);

try {
  fs.mkdirSync(path.dirname(linkPath), { recursive: true });
  fs.symlinkSync(target, linkPath, process.platform === 'win32' ? 'junction' : 'dir');
  console.log('[Questia] @clerk/expo relié dans apps/mobile/node_modules (injection ClerkViewFactory.swift au prebuild).');
} catch (error) {
  console.warn(`[Questia] @clerk/expo non relié : ${error.message}. Le prebuild iOS échouera sur ClerkViewFactory.`);
}
