/**
 * Applique les migrations Prisma au moment du build.
 *
 * Vercel n'a pas d'étape « déploiement base » : sans ça, le schéma de production
 * ne bouge que si quelqu'un lance `migrate deploy` à la main, et un build qui
 * embarque un client Prisma plus récent que la base tombe en erreur sur chaque
 * requête (colonne inconnue). Le build est le seul endroit qui voit à coup sûr
 * les variables de l'environnement cible.
 *
 * `directUrl` n'est lu que par le CLI et n'est pas toujours défini sur l'hôte :
 * on retombe sur les noms posés par l'intégration Neon, puis sur `DATABASE_URL`
 * privé de son suffixe `-pooler` (le pooler ne supporte pas les verrous d'avis
 * des migrations).
 *
 * L'échec n'arrête pas le build : un site qui ne se déploie plus ne se répare
 * pas non plus. La cause part dans `public/_deploy-check.html`, expurgée de toute
 * URL, le temps de la remettre d'aplomb.
 */
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const webRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const reportPath = join(webRoot, 'public', '_deploy-check.html');

/** Ne jamais recracher une chaîne de connexion dans un fichier servi publiquement. */
function redact(text) {
  return String(text)
    .replace(/[a-z+]+:\/\/\S*/gi, '<url>')
    .replace(/\S+@\S+/g, '<host>')
    .slice(0, 1200);
}

function report(lines) {
  mkdirSync(dirname(reportPath), { recursive: true });
  writeFileSync(reportPath, `${redact(lines.join('\n'))}\n`);
}

const pooled =
  process.env.DATABASE_URL ?? process.env.POSTGRES_PRISMA_URL ?? process.env.POSTGRES_URL;

const direct =
  process.env.DIRECT_DATABASE_URL ??
  process.env.DATABASE_URL_UNPOOLED ??
  process.env.POSTGRES_URL_NON_POOLING ??
  pooled?.replace('-pooler', '');

const dbEnvNames = Object.keys(process.env)
  .filter((k) => /DATABASE|POSTGRES|NEON/i.test(k))
  .sort()
  .join(', ');

if (!pooled || !direct) {
  report([
    'migrate: skipped',
    'raison: aucune URL de base lisible au build',
    `variables vues: ${dbEnvNames || '(aucune)'}`,
  ]);
  console.warn('Aucune URL de base au build — migrations non appliquées.');
  process.exit(0);
}

process.env.DATABASE_URL = pooled;
process.env.DIRECT_DATABASE_URL = direct;

try {
  const out = execFileSync(
    process.execPath,
    [require.resolve('prisma/build/index.js'), 'migrate', 'deploy'],
    { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] },
  );
  console.log(out);
  rmSync(reportPath, { force: true });
} catch (e) {
  const detail = [e.stdout, e.stderr, e.message].filter(Boolean).join('\n');
  console.error(detail);
  report(['migrate: failed', `variables vues: ${dbEnvNames}`, '---', detail]);
}
