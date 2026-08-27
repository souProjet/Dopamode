/**
 * Applique les migrations Prisma au moment du build.
 *
 * Vercel n'a pas d'étape « déploiement base » : sans ça, le schéma de production
 * ne bouge que si quelqu'un lance `migrate deploy` à la main, et un build qui
 * embarque un client Prisma plus récent que la base tombe en erreur sur chaque
 * requête (colonne inconnue). Le build est le seul endroit qui voit à coup sûr
 * les variables de l'environnement cible.
 *
 * `directUrl` n'est lu que par le CLI. S'il n'est pas défini, on le déduit de
 * `DATABASE_URL` : chez Neon, l'endpoint direct est l'endpoint poolé sans le
 * suffixe `-pooler` (le pooler ne supporte pas les verrous d'avis des migrations).
 */
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL manquant — migrations non appliquées.');
  process.exit(1);
}

if (!process.env.DIRECT_DATABASE_URL) {
  process.env.DIRECT_DATABASE_URL = process.env.DATABASE_URL.replace('-pooler', '');
}

execFileSync(process.execPath, [require.resolve('prisma/build/index.js'), 'migrate', 'deploy'], {
  stdio: 'inherit',
});
