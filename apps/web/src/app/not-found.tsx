import Link from 'next/link';
import { headers } from 'next/headers';

/**
 * 404 racine — rendu hors du segment `[locale]` : pas de next-intl ici (la locale
 * n'est pas résolue pour une URL qui ne correspond à aucune route). On lit donc
 * l'en-tête posé par le middleware et on garde deux jeux de chaînes en dur.
 * Même registre « carnet de route » que le reste du site public.
 */
const COPY = {
  fr: {
    eyebrow: 'Erreur 404',
    title: 'Cette page ne figure pas au carnet.',
    lead: "Le lien est peut-être périmé, ou l'adresse comporte une faute. Voici par où repartir.",
    links: [
      { href: '/', label: 'Accueil' },
      { href: '/generation-quetes', label: 'Comment les quêtes sont créées' },
      { href: '/aura', label: 'Profil Aura visuelle' },
      { href: '/sign-in', label: 'Connexion' },
    ],
    cta: "Retour à l'accueil",
  },
  en: {
    eyebrow: 'Error 404',
    title: 'This page is not in the notebook.',
    lead: 'The link may have expired, or the address has a typo. Here is where to pick up again.',
    links: [
      { href: '/en', label: 'Home' },
      { href: '/en/generation-quetes', label: 'How quests are created' },
      { href: '/en/aura', label: 'Visual Aura profile' },
      { href: '/en/sign-in', label: 'Sign in' },
    ],
    cta: 'Back to home',
  },
} as const;

export default async function NotFound() {
  const h = await headers();
  const t = COPY[h.get('x-questia-locale') === 'en' ? 'en' : 'fr'];

  return (
    <div className="flex min-h-screen flex-col">
      <main className="mx-auto w-full max-w-[38rem] flex-1 px-5 py-16 sm:px-8 sm:py-24">
        <p className="carnet-eyebrow">{t.eyebrow}</p>
        <h1 className="mt-4 text-balance font-display text-[clamp(1.9rem,3.4vw+1rem,2.6rem)] font-semibold leading-[1.08] tracking-[-0.025em] text-[var(--text)]">
          {t.title}
        </h1>
        <p className="mt-4 text-[15px] leading-relaxed text-[var(--muted)]">{t.lead}</p>

        <ul className="carnet-rule mt-10">
          {t.links.map((link, i) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="group flex items-baseline gap-5 border-b border-[var(--border-ui)] py-5 transition-colors duration-200 hover:bg-[var(--surface)]"
              >
                <span className="carnet-numeral shrink-0 text-[1.4rem]" aria-hidden>
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="text-[15px] text-[var(--text)]">{link.label}</span>
                <span className="ml-auto shrink-0 text-[var(--subtle)] transition-transform duration-200 group-hover:translate-x-1" aria-hidden>
                  →
                </span>
              </Link>
            </li>
          ))}
        </ul>

        <Link href={t.links[0].href} className="btn btn-cta mt-10 inline-flex rounded-lg px-7 py-3.5 text-[15px]">
          {t.cta}
        </Link>
      </main>
    </div>
  );
}
