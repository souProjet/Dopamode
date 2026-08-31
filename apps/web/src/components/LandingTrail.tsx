/**
 * Le tracé de l'itinéraire, en deux couches qui disent deux choses :
 * le pointillé est la route prévue, le trait plein est la route parcourue.
 * Le second se dessine par-dessus le premier à mesure qu'on descend la page,
 * et s'arrête à la troisième station : on a fait trois pas, la suite reste
 * devant. Le pointillé, lui, continue jusqu'en bas.
 *
 * Géométrie volontairement contrainte : la courbe repasse par l'axe central
 * (x = 50) exactement à 1/6, 1/2 et 5/6 de la hauteur. Les points de station
 * sont posés en HTML aux mêmes pourcentages, donc ils tombent sur le tracé
 * sans aucune mesure au chargement — c'est ce qui permet de tout laisser au
 * CSS. Les rangées de la grille sont forcées à hauteur égale côté page
 * (`grid-auto-rows: 1fr`), sinon l'hypothèse ne tient plus.
 *
 * L'amplitude est calée sur la gouttière : un point de contrôle à x = C place
 * le ventre de la courbe à 25 + C/2, donc 62 et 38 donnent 56 % et 44 %. Les
 * colonnes s'arrêtent à 40 % et reprennent à 60 % : le tracé serpente dans la
 * gouttière et ne passe jamais derrière un chiffre ni une ligne de texte.
 *
 * `preserveAspectRatio="none"` laisse le chemin épouser la boîte quelle que
 * soit sa hauteur ; `vectorEffect` garde le trait à épaisseur constante malgré
 * l'étirement. C'est aussi pour ça que le dessin progressif du trait plein se
 * joue en `clip-path` côté CSS et non en `stroke-dashoffset` : avec un trait
 * non étirable, les tirets se calculent après l'étirement, donc en longueurs
 * d'écran, et le motif se répète au lieu de dessiner la ligne d'un trait.
 */
const PLANNED = 'M 50 0 Q 62 8.3 50 16.666 Q 38 33.3 50 50 Q 62 66.7 50 83.333 Q 38 91.7 50 100';
const WALKED = 'M 50 0 Q 62 8.3 50 16.666 Q 38 33.3 50 50 Q 62 66.7 50 83.333';

export function LandingTrail({ className = '' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      aria-hidden
      focusable="false"
    >
      <path
        className="trail-planned"
        d={PLANNED}
        pathLength={100}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeDasharray="0.01 2.6"
        vectorEffect="non-scaling-stroke"
      />
      <path
        className="trail-walked"
        d={WALKED}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
