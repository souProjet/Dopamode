import type { AbstractIntlMessages } from 'next-intl';

/**
 * Namespaces embarqués sur toutes les routes : la barre de navigation et son sélecteur de
 * langue, le bandeau cookies du layout, et la page d'erreur.
 */
export const BASE_CLIENT_MESSAGES = [
  'Navbar',
  'CookieNotice',
  'ErrorPage',
  'HomePage.localeSwitcher',
] as const;

/** Espace connecté : union des namespaces des routes `/app`, le layout étant partagé. */
export const APP_CLIENT_MESSAGES = [
  ...BASE_CLIENT_MESSAGES,
  'AppLoading',
  'AppQuest',
  'AppShop',
  'AppHistory',
  'AppProfile',
  'AppCap',
] as const;

/**
 * Sous-ensemble de messages, chemins pointés compris.
 *
 * `NextIntlClientProvider` sérialise dans le flux RSC tout ce qu'on lui passe, et par défaut
 * il hérite du catalogue complet défini dans `i18n/request.ts` : chaque route transportait
 * donc ~31 Ko de traductions alors qu'aucune n'en utilise plus du tiers côté client. Les
 * composants serveur lisent toujours le catalogue entier via `getTranslations`, ce filtre ne
 * concerne que la frontière client.
 *
 * Un chemin absent est ignoré, pour qu'un renommage de clé ne fasse pas tomber le rendu.
 */
export function pickMessages(
  messages: AbstractIntlMessages,
  paths: readonly string[],
): AbstractIntlMessages {
  const out: Record<string, unknown> = {};
  for (const path of paths) {
    const segments = path.split('.');
    let src: unknown = messages;
    let dst = out;
    for (let i = 0; i < segments.length; i++) {
      src = (src as Record<string, unknown> | undefined)?.[segments[i]];
      if (src === undefined) break;
      if (i === segments.length - 1) {
        dst[segments[i]] = src;
      } else {
        dst = (dst[segments[i]] ??= {}) as Record<string, unknown>;
      }
    }
  }
  return out as AbstractIntlMessages;
}
