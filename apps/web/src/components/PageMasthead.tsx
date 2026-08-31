import type { ReactNode } from 'react';
import { Link } from '@/i18n/navigation';
import { LandingTerrain } from '@/components/LandingTerrain';

/**
 * Le bandeau de carte : la carte court bord à bord, un objet est posé dessus.
 * C'est le sol de l'accueil réemployé partout ailleurs sur le site public.
 * `className` porte la mesure de la colonne — 72rem pour les pages à navbar,
 * 38rem pour les feuillets (404, tunnel d'authentification, quête partagée).
 */
export function MapBand({
  className = 'max-w-6xl',
  bandClassName = '',
  children,
}: {
  className?: string;
  /** Variante du bandeau : `page-masthead--app` pour la garde de navbar. */
  bandClassName?: string;
  children: ReactNode;
}) {
  return (
    <div className={`page-masthead ${bandClassName}`}>
      <LandingTerrain className="page-masthead__terrain pointer-events-none absolute inset-0 h-full w-full" />
      <div className={`relative mx-auto w-full px-5 sm:px-8 ${className}`}>{children}</div>
    </div>
  );
}

/**
 * Le bandeau de titre des pages publiques secondaires : mentions légales, aura,
 * génération des quêtes, 404.
 *
 * Même sol que l'accueil : la carte court bord à bord et le titre est un
 * cartouche posé dessus, pour que ces pages soient du même relevé et non des
 * annexes sur papier blanc. Ce qui ne se répète pas, c'est le tracé de la
 * carte : elle arrive déjà dessinée ici, le relevé au clip-path reste le geste
 * d'ouverture de l'accueil.
 */
export function PageMasthead({
  eyebrow,
  title,
  lead,
  children,
}: {
  /** Surtitre : le plus souvent un `MastheadBackLink`, sinon une mention d'état. */
  eyebrow: ReactNode;
  title: string;
  /** Le chapô. `ReactNode` parce que les pages légales y glissent des liens. */
  lead?: ReactNode;
  /** Ligne de registre sous le chapô (date de mise à jour, adresse du site). */
  children?: ReactNode;
}) {
  return (
    <MapBand>
      <div className="cartouche max-w-[46rem]">
        <p className="carnet-eyebrow">{eyebrow}</p>
        <h1 className="mt-4 font-display text-[clamp(1.9rem,3.4vw+1rem,2.75rem)] font-semibold leading-[1.08] tracking-[-0.025em] text-balance text-[var(--text)]">
          {title}
        </h1>
        {lead ? (
          <p className="mt-4 text-base leading-[1.65] text-[var(--muted)] sm:text-lg">{lead}</p>
        ) : null}
        {children}
      </div>
    </MapBand>
  );
}

/**
 * Le retour d'un feuillet : il pointe toujours vers l'accueil, jamais vers la
 * page précédente. Ces pages sont détachées du carnet, pas des étapes d'un
 * parcours.
 */
export function MastheadBackLink({ label }: { label: string }) {
  return (
    <Link href="/" className="transition-colors hover:text-[var(--text)]">
      {label}
    </Link>
  );
}

/**
 * Le bandeau de titre de l'espace connecté.
 *
 * Même sol que le site public, à une différence près : ici le bandeau passe
 * sous la navbar fixe, donc c'est lui qui porte la garde (`page-masthead--app`)
 * et plus le `pt-24` de chaque page. La mesure suit celle du corps de la page,
 * sinon le cartouche et le contenu ne sont pas sur la même colonne.
 *
 * L'accueil des quêtes n'en a pas : sa fiche du jour est déjà l'objet posé sur
 * la carte, un titre par-dessus ferait deux objets pour un seul écran.
 */
export function AppMasthead({
  width = 'max-w-4xl',
  back,
  eyebrow,
  title,
  lead,
  children,
}: {
  /** La mesure du corps de la page : `max-w-2xl`, `max-w-3xl` ou `max-w-4xl`. */
  width?: string;
  /** Le retour, posé au-dessus du surtitre. Il pointe vers le parent réel. */
  back?: ReactNode;
  eyebrow?: ReactNode;
  title: string;
  lead?: ReactNode;
  /** Ligne de registre sous le chapô (compteurs, solde, date). */
  children?: ReactNode;
}) {
  return (
    <MapBand className={width} bandClassName="page-masthead--app">
      <div className="cartouche max-w-[46rem]">
        {back ? <div className="mb-3 text-sm font-semibold">{back}</div> : null}
        {eyebrow ? <p className="carnet-eyebrow">{eyebrow}</p> : null}
        <h1
          className={`font-display text-[clamp(1.6rem,2.4vw+1rem,2.15rem)] font-semibold leading-[1.1] tracking-[-0.025em] text-balance text-[var(--text)] ${
            eyebrow ? 'mt-3' : ''
          }`}
        >
          {title}
        </h1>
        {lead ? (
          <p className="mt-3 text-[15px] leading-[1.6] text-[var(--muted)] sm:text-base">{lead}</p>
        ) : null}
        {children}
      </div>
    </MapBand>
  );
}
