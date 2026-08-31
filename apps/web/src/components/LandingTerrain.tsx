/**
 * Le sol de la hero : une carte topographique, pas un filigrane.
 *
 * Deux reliefs (un sommet à droite, une croupe en bas à gauche) tracés en
 * cercles concentriques, puis passés dans un `feDisplacementMap` : le bruit
 * casse la régularité des anneaux et on obtient des courbes de niveau
 * plausibles. Le trait suit la convention des cartes d'état-major — une
 * courbe maîtresse plus épaisse toutes les cinq courbes intercalaires — ce
 * qui donne au fond sa propre hiérarchie de lecture au lieu d'un motif plat.
 *
 * `preserveAspectRatio="xMidYMid slice"` laisse le dessin déborder plutôt que
 * de s'écraser : la carte est plus grande que l'écran, comme une vraie carte.
 * Le tracé se dessine au chargement (`.terrain-ink`, voir globals.css) ; c'est
 * l'ouverture de la page, le reste se pose dessus.
 */
/*
 * Le champ est plus haut que la section : en `slice`, un écran large en
 * garde la bande centrale et un écran étroit en garde la colonne centrale.
 * Les quatre reliefs sont donc placés pour que ces deux découpes tombent
 * chacune sur du dessin — deux au centre pour la colonne du mobile, deux sur
 * les flancs pour la bande du grand écran.
 */
const RELIEFS = [
  { cx: 1124, cy: 430, count: 21, first: 26, step: 29 },
  { cx: 182, cy: 826, count: 15, first: 22, step: 33 },
  { cx: 726, cy: 1188, count: 13, first: 28, step: 35 },
  { cx: 688, cy: 96, count: 11, first: 24, step: 31 },
];

/** Une courbe maîtresse toutes les cinq, comme sur une carte au 1:25000. */
const isIndexContour = (i: number) => i % 5 === 4;

export function LandingTerrain({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 1440 1300"
      className={className}
      aria-hidden
      focusable="false"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <filter id="terrain-relief" x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.0031 0.0049"
            numOctaves="3"
            seed="7"
            result="noise"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="noise"
            scale="78"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </defs>
      <g className="terrain-ink" filter="url(#terrain-relief)" fill="none" stroke="currentColor">
        {RELIEFS.flatMap((relief, r) =>
          Array.from({ length: relief.count }, (_, i) => (
            <circle
              key={`${r}-${i}`}
              cx={relief.cx}
              cy={relief.cy}
              r={relief.first + i * relief.step}
              strokeWidth={isIndexContour(i) ? 2 : 1}
              opacity={isIndexContour(i) ? 1 : 0.55}
            />
          )),
        )}
      </g>
    </svg>
  );
}
