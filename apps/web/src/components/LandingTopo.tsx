/**
 * Filigrane topographique — le relief d'une carte tracée à la main.
 *
 * Des cercles concentriques passés dans un `feDisplacementMap` : le bruit
 * déforme les anneaux en courbes de niveau irrégulières. C'est ce qui donne
 * de la profondeur au fond papier là où un dégradé lirait « template ».
 *
 * `id` doit être unique par instance : les `<filter>` SVG partagent l'espace
 * de noms du document.
 */
export function LandingTopo({ id, className = '' }: { id: string; className?: string }) {
  const summit = Array.from({ length: 13 }, (_, i) => 26 + i * 23);
  const foothill = Array.from({ length: 6 }, (_, i) => 14 + i * 19);
  const filterId = `topo-${id}`;

  return (
    <svg
      viewBox="0 0 620 620"
      className={className}
      aria-hidden
      focusable="false"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <filter id={filterId} x="-25%" y="-25%" width="150%" height="150%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.0055 0.0085"
            numOctaves="3"
            seed="11"
            result="noise"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="noise"
            scale="58"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </defs>
      <g filter={`url(#${filterId})`} fill="none" stroke="currentColor" strokeWidth="1.25">
        {summit.map((r) => (
          <circle key={`s${r}`} cx="352" cy="292" r={r} />
        ))}
        {foothill.map((r) => (
          <circle key={`f${r}`} cx="118" cy="474" r={r} />
        ))}
      </g>
    </svg>
  );
}
