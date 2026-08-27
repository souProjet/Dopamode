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
import { mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const prismaCli = require.resolve('prisma/build/index.js');
const webRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const migrationsDir = join(webRoot, 'prisma', 'migrations');
const reportPath = join(webRoot, 'public', '_deploy-check.html');

/**
 * La base de production a été créée par `db push`, sans table d'historique :
 * `migrate deploy` refuse alors de travailler (P3005). Les migrations jusqu'à
 * cette borne y sont déjà présentes sous forme de schéma, on les enregistre
 * comme appliquées au lieu de les rejouer. Ce qui suit est réellement exécuté.
 */
const BASELINE_THROUGH = '20260505120000_quest_log_rating';

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

function prisma(...args) {
  return execFileSync(process.execPath, [prismaCli, ...args], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
}

function describe(e) {
  return [e.stdout, e.stderr, e.message].filter(Boolean).join('\n');
}

/** Enregistre l'historique manquant, puis relance le déploiement. */
function baseline() {
  const already = readdirSync(migrationsDir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .sort()
    .filter((name) => name <= BASELINE_THROUGH);

  for (const name of already) {
    console.log(prisma('migrate', 'resolve', '--applied', name));
  }
  return prisma('migrate', 'deploy');
}

/**
 * Une migration tombée en cours de route reste inscrite comme échouée et bloque
 * tout déploiement ultérieur (P3009). Postgres exécute chaque fichier dans une
 * transaction : l'échec n'a rien laissé derrière lui, on peut la déclarer
 * annulée et la rejouer telle qu'elle est maintenant.
 */
function rollBackFailed(detail) {
  const failed = [...detail.matchAll(/The `([^`]+)` migration started at[^\n]*failed/g)].map(
    (m) => m[1],
  );
  if (failed.length === 0) return null;

  for (const name of failed) {
    console.log(prisma('migrate', 'resolve', '--rolled-back', name));
  }
  return prisma('migrate', 'deploy');
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
  let out;
  try {
    out = prisma('migrate', 'deploy');
  } catch (e) {
    const detail = describe(e);
    if (detail.includes('P3005')) out = baseline();
    else if (detail.includes('P3009')) out = rollBackFailed(detail);
    if (out == null) throw e;
  }
  console.log(out);
  rmSync(reportPath, { force: true });
} catch (e) {
  const detail = describe(e);
  console.error(detail);
  report(['migrate: failed', `variables vues: ${dbEnvNames}`, '---', detail]);
}
