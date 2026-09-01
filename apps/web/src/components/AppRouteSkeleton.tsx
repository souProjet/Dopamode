import { Navbar } from '@/components/Navbar';
import { MapBand } from '@/components/PageMasthead';

/** Alignées sur les conteneurs réels des pages pour éviter un saut de largeur au montage. */
const WIDTH_CLASS = {
  narrow: 'max-w-2xl',
  medium: 'max-w-3xl',
  wide: 'max-w-4xl',
} as const;

type Props = {
  /** Libellé lu par les lecteurs d'écran, traduit par l'appelant (`AppLoading.label`). */
  label: string;
  width?: keyof typeof WIDTH_CLASS;
  /** Nombre de blocs de contenu sous l'en-tête. */
  cards?: number;
};

/**
 * Squelette partagé par les `loading.tsx` de l'espace connecté. Affiché pendant que le
 * segment se charge : la coquille (nav, carte, largeur, rythme vertical) apparaît
 * immédiatement au lieu d'un écran vide jusqu'à l'hydratation.
 * Volontairement sans traduction propre pour rester utilisable côté serveur comme client.
 *
 * Le bandeau de carte est celui des pages réelles : il arrive déjà tracé et le titre vient
 * s'écrire dedans. Sans lui, le segment chargé ferait descendre tout le contenu d'une
 * hauteur de bande au montage.
 */
export function AppRouteSkeleton({ label, width = 'narrow', cards = 3 }: Props) {
  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <Navbar />
      <MapBand className={WIDTH_CLASS[width]} bandClassName="page-masthead--app">
        <div aria-hidden className="cartouche max-w-[46rem]">
          <div className="animate-pulse space-y-4">
            <div className="h-3 w-28 bg-[color:var(--progress-track)]" />
            <div className="h-8 w-72 max-w-full bg-[color:var(--progress-track)]" />
          </div>
        </div>
      </MapBand>
      <main
        id="main-content"
        tabIndex={-1}
        role="status"
        aria-busy="true"
        aria-live="polite"
        className={`relative z-10 ${WIDTH_CLASS[width]} mx-auto px-3 sm:px-5 pt-10 pb-24 outline-none`}
      >
        <span className="sr-only">{label}</span>
        <div aria-hidden className="animate-pulse space-y-5">
          {Array.from({ length: cards }, (_, i) => (
            <div key={i} className="h-32 bg-[color:var(--progress-track)]" />
          ))}
        </div>
      </main>
    </div>
  );
}
