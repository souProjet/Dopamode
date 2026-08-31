# Direction artistique — Questia (web + mobile)

DA partagée par `apps/web` et `apps/mobile`. Registre **papier chaud** : fonds pierre/crème, encre presque noire, accents terreux (teal profond, brique, ambre). Volontairement peu « template SaaS » : pas de néon, pas de dégradé arc-en-ciel, pas de verre partout.

Source de vérité des couleurs : `:root` et `html[data-theme="…"]` dans `apps/web/src/app/globals.css`, répliqués à l'identique dans `packages/ui/src/themePalettes.ts` (`ThemePalette`). **Tout changement de token doit être fait dans les deux fichiers.**

---

## 1. Positionnement visuel

| Axe | Choix |
|---|---|
| Ton | Encourageant, direct, jamais culpabilisant |
| Métaphore | Carnet de route / carte de mission, pas plateau de jeu clinquant |
| Rythme | Sections pleine hauteur, bandes de teinte papier, halo d'aura discret |
| Contraste | Encre `#1c1917` sur papier `#ebe8e0` → ratio confortable partout |
| Surfaces | **Opaques**. Le flou de fond est réservé aux calques flottants (navbar, modales, drawers) |

---

## 2. Palette sémantique

Thème clair par défaut (`:root` / `defaultPalette`) :

| Token web | `ThemePalette` | Valeur | Usage |
|---|---|---|---|
| `--bg` | `bg` | `#ebe8e0` | Fond global |
| `--surface` | `surface` | `#f2efe8` | Surfaces intermédiaires, footer |
| `--card` | `card` | `#faf8f4` | Cartes (thémable) |
| `--card-cream` | `cardCream` | `#fdfaf5` | Panneau **toujours clair** ; texte via `--on-cream` |
| `--border-ui` | `border` | `rgba(28,25,23,.09)` | Bordure neutre |
| `--border-cyan` | `borderCyan` | `rgba(19,78,74,.22)` | Bordure accentuée (hero, CTA) |
| `--text` | `text` | `#1c1917` | Texte principal |
| `--muted` | `muted` | `#57534e` | Texte secondaire |
| `--subtle` | `subtle` | `#78716c` | Tertiaire, détails |
| `--violet` / `--cyan` | `cyan` | `#134e4a` | Accent principal (teal ; `--violet` est un nom historique) |
| `--orange` | `orange` | `#c2410c` | CTA, brique |
| `--gold` | `gold` | `#92400e` | Highlights |
| `--green` | `green` | `#166534` | Réussite, extérieur |
| `--link-on-bg` | `linkOnBg` | `#115e59` | Liens sur fond aventure |

Thèmes boutique : `midnight`, `aurora`, `parchment` (`html[data-theme=…]` côté web, `getThemePalette(themeId)` côté mobile). Seul `midnight` est sombre. Toute surface rendue sous `/app/*` doit lire `--text` / `--muted` / `--subtle`, jamais une encre fixe : ces trois tokens sont redéfinis par thème.

**Sélection de texte** : `color-mix(in srgb, var(--orange) 28%, transparent)`.

---

## 3. Typographie

| Rôle | Web | Mobile |
|---|---|---|
| Corps | **IBM Plex Sans** — `font-sans` → `var(--font-inter)` | police système |
| Titres | **IBM Plex Serif** — `font-display` → `var(--font-space)` | police système, graisse forte |
| Registre | **IBM Plex Mono** — `font-mono` → `var(--font-mono)` | — |

Les variables CSS gardent leurs noms historiques (`--font-inter`, `--font-space`) : seules les familles ont changé. Chargées dans `apps/web/src/app/layout.tsx` (`next/font/google`, `display: swap`, `adjustFontFallback: false`).

Le rôle **registre** est ce qui fait lire la landing comme un carnet de mission plutôt que comme une page produit : surtitres, numéros de série, durées, chiffres du relevé, tampon. Même superfamille que le corps et les titres, donc aucune tension typographique. Il porte les *données*, jamais une phrase — dès qu'un texte se lit, il repasse en Sans ou en Serif.

Labels de section : `.label`, `uppercase` + `tracking-widest`. Sur la landing, `.carnet-eyebrow` remplace `.label` : chasse fixe, `0.6875rem`, `tracking: 0.16em`, encre `--link-on-bg`.

---

## 4. Fonds & atmosphère

### Calque d'aura (`body::before`)

Trois ellipses `radial-gradient` pilotées par `--aura-tr` / `--aura-bl` / `--aura-tl`, en `position: fixed`, `z-index: 1`. `AuraOrbsLayer` (`apps/web/src/components/aura/`) remplace ces variables à partir du profil de personnalité.

Les valeurs `:root` sont le **fallback avant personnalité** (landing incluse) : alphas volontairement bas (~0.11 à 0.16) pour que le fond lise « papier », comme sur mobile. L'intensité ne monte que sur `/app`, une fois la personnalité chargée.

### Bandes de section

`.section-band-how`, `.section-band-social`, `.section-band-cta`, `.landing-section-frost` : dégradés verticaux de teintes papier (`--surface`, `--card`, `--text` à faible pourcentage), **sans `backdrop-filter`**.

### Matière (landing)

Trois calques donnent au papier son grain et son relief. Ils sont décoratifs : `aria-hidden`, `pointer-events: none`, et neutralisés sous `prefers-reduced-transparency: reduce`.

| Classe | Rôle |
|---|---|
| `.paper-sheet` | Grain de page entière (`::before`, `feTurbulence` en data-URI, tuile 180px), `mix-blend-mode: multiply` clair / `overlay` sombre |
| `.paper-tooth` | Même grain, à l'échelle d'une surface (fiche de quête, fiche de retour, bande CTA). Ses enfants passent en `position: relative; z-index: 1` pour rester au-dessus |
| `.topo-mark` / `.topo-mark--invert` | Filigrane topographique (`LandingTopo`), encre à 8% / papier à 11% sur fond inversé |
| `.hero-terrain` | La carte du hero (`LandingTerrain`), à 17% : un fond **lisible**, pas un filigrane |

`LandingTopo` prend un `id` **unique par instance** : le `<filter>` `feDisplacementMap` vit dans l'espace de noms du document, deux instances qui partagent un id se marchent dessus.

### La carte du hero

Le fond du hero est une **carte topographique**, pas un aplat de papier : les courbes de niveau se lisent vraiment, bord à bord, et tout le reste est un objet posé dessus. Le produit envoie dehors, donc le sol de la page est le dehors.

Trois règles la tiennent :

- **Une hiérarchie de trait.** Une courbe maîtresse (2 px, pleine opacité) toutes les cinq intercalaires (1 px, 55%), comme sur une carte au 1:25000. C'est ce qui distingue une carte d'un motif : le fond a sa propre lecture.
- **Un champ plus haut que la section** (`viewBox` 1440×1300, `slice`). Un grand écran en garde la bande centrale, un écran étroit la colonne centrale : les quatre reliefs sont placés pour que ces **deux découpes** tombent chacune sur du dessin. Déplacer un relief sans vérifier le cadrage mobile vide le fond de moitié.
- **Deux objets, pas plus.** Le cartouche et la fiche épinglée. Tout ce qu'on ajouterait sur la carte la ramènerait au statut de décor.

### Les trois sols de la landing

La page a **trois sols et non un seul** : papier chaud à l'ouverture, encre au milieu (`.trail-band`, l'itinéraire), encre à la clôture (`.carnet-cta`). C'est ce rythme de valeurs qui l'empêche de lire comme un document plat, et c'est la première chose à préserver si la page est réorganisée.

### Vocabulaire de la landing

Chaque accent a un seul métier — c'est ce qui empêche la page de virer au patchwork :

| Accent | Métier |
|---|---|
| Teal (`--link-on-bg`) | Surtitres, liens, emphase du titre hero |
| Ambre (`--gold`) | Numéros d'étape, tracé d'itinéraire, filet de mission |
| Brique (`--orange`) | Tampon, amorces de filet, ticks du relevé, CTA |

| Classe | Rendu |
|---|---|
| `.carnet-rule` | Filet de section + amorce brique (`::before`, `3.25rem × 1px`) |
| `.carnet-numeral` | Numéro d'étape sérif ambre, `line-height: .78` |
| `.trail-band` | Le sol d'encre du milieu de page : `background: var(--text)`, `color: var(--bg)`. L'inversion passe par les tokens, donc Minuit la reprend sans règle en plus |
| `.trail-steps` | La grille des trois étapes. Porte la `view-timeline: --trail` et force `grid-auto-rows: 1fr` |
| `.trail-line` / `.trail-planned` / `.trail-walked` | Le tracé (`LandingTrail`) : pointillé = route prévue, trait plein = route parcourue, dessiné au scroll |
| `.trail-station` | Le repère d'étape : perle ambre détourée dans le fond de la bande, plus une amorce (`::after`) vers le texte |
| `.hero-cartouche` | Le papier du hero, découpé dans la carte comme la légende d'une feuille d'état-major : fond opaque, bord franc, double filet (`::after`, `inset: 5px`), ombre portée. C'est lui qui rend le titre lisible sur un fond dessiné |
| `.hero-eyebrow` / `.ink-line` | L'encre du hero : le surtitre s'essuie derrière son amorce brique, chaque ligne de titre monte derrière son propre cache (`overflow: clip`) |
| `.hero-band` / `.hero-ledger` | Le relevé en bandeau **bord à bord**, la carte visible dessous : une ligne de registre (chiffre en chasse fixe + libellé, filets verticaux), et non trois grands chiffres. Le filet du haut appartient au bandeau, pas au relevé, sinon il s'arrête à la gouttière |
| `.quest-pin` | La punaise : ce qui rattache la fiche à la carte plutôt qu'à la page. Le paquet pivote autour d'elle (`transform-origin: 26px 0`) |
| `.quest-stack` / `.quest-deck` / `.quest-slide` | Fiche de quête du hero : chaque exemple est une **fiche entière** (papier, bord, ombre), toutes dans la même case de grille (`grid-area: 1/1`), donc la hauteur suit la plus longue |
| `.quest-controls` | Les flèches et la pagination, **sous** le paquet : une fiche de carnet ne porte pas de commandes imprimées |
| `.quest-stamp` | Tampon double anneau brique, `rotate(-9deg)`, à cheval sur le coin de la fiche |
| `.voices-band` / `.voice-card` | Bande de papier plus dense + fiches d'index posées dessus |

Le `--tilt` et le `--lift` des fiches de retours sont passés en **variables CSS** depuis la page, pas en `transform` inline : un style inline gagnerait sur le `:hover`, qui redresse la fiche.

---

## 5. Surfaces & flou

Le flou de fond est réservé aux éléments qui **flottent au-dessus** du contenu :

- navbar (`.navbar-shell`, `.navbar-mobile-drawer`), modales, panneaux d'app, onglets.

Les surfaces de contenu sont **opaques**, comme les `Card` du mobile :

| Classe | Rendu |
|---|---|
| `.landing-hero-panel` | `var(--card)`, bordure `--border-cyan`, ombre 1px |
| `.landing-cta-panel` | idem, `border-radius: 20px` |
| `.landing-glass-card` | `var(--card)`, bordure `--border-ui-strong`, ombre 1px |
| `.landing-footer` | `var(--surface)` |

Le nom `.landing-glass-card` est conservé pour ne pas casser les usages ; le rendu n'est plus vitré.

### Verre natif (mobile)

Même règle qu'au web : le verre habille le **chrome**, jamais le contenu. Les cartes restent en papier opaque.

Un seul composant touche au natif, `apps/mobile/components/GlassSurface.tsx`, et il choisit son matériau à l'exécution :

| Matériau | Quand | Rendu |
|---|---|---|
| `liquid` | iOS 26+, module natif présent | `GlassView` d'`expo-glass-effect` (réfraction et spéculaire système) |
| `blur` | iOS < 26, Android | `BlurView` d'`expo-blur` + voile teinté |
| `solid` | web, ou « Réduire la transparence » activé | aplat opaque, aucune transparence |

Quatre rôles, définis dans `apps/mobile/lib/glass.ts` (`getGlassTokens`) :

| Rôle | Surface | Style de verre |
|---|---|---|
| `chrome` | barre d'onglets | `regular`, teinte `surface` faible |
| `sheet` | feuilles modales (sélecteurs, recharge) | `regular`, teinte `card` |
| `scrim` | voile plein écran derrière une modale | `regular`, teinte `overlay` |
| `card` | face de la carte de quête | `clear`, teinte `card` |

Règles :

- `colorScheme` est **explicite**, dérivé du thème (`themeUsesLightStatusBar`), jamais `auto` : l'app a son propre sélecteur de thème et `app.json` force `userInterfaceStyle: "dark"`.
- Aucun voile par-dessus le verre natif : il a déjà sa matière. Le voile n'existe que sur le chemin `blur`.
- `isInteractive` est réservé aux surfaces qui suivent le doigt, pas au chrome fixe.
- Le verre natif exige un build de développement (Xcode 26, iOS 26). Hors de là, `isLiquidGlassAvailable()` est faux et le rendu retombe sur le flou : c'est le rendu de référence, pas un mode dégradé.

---

## 6. Textes en dégradé

`background-clip: text`, préfixes WebKit conservés.

| Classe | Dégradé |
|---|---|
| `.text-gradient` | encre `#1c1917` → `#44403c` (quasi monochrome) |
| `.text-gradient-pop` | accroches hero / CTA |
| `.text-gradient-on-dark` | alias historique de `.text-gradient` |

---

## 7. Boutons

| Classe | Style |
|---|---|
| `.btn` | Base : flex, bold, `rounded-2xl`, transitions |
| `.btn-primary` | Aplat `var(--violet)` (teal), bordure assombrie 1px, **sans ombre** |
| `.btn-cta` | Aplat `var(--orange)`, bordure assombrie 1px, **sans ombre** |
| `.btn-ghost` | Fond clair semi-transparent, bordure neutre |

Aplats et non dégradés : c'est ce qui distingue le plus la DA d'un rendu générique.

---

## 8. Labels, badges, séparateurs

- `.label` : micro-titre `uppercase` / `tracking-widest`.
- Pills : `.pill-calibration` (vert), `.pill-expansion` (teal), `.pill-rupture` (brique).
- `.streak-badge` : série / flamme, ambre.
- `.divider` : ligne fine neutre ; `.divider-glow` : ligne dégradée centrée.

---

## 9. Animations

`tailwind.config.ts` : `animate-fade-up`, `animate-float`, `animate-glow-soft`, `animate-stamp-press`.

**Deux moteurs, deux moments.** À l'ouverture, une séquence orchestrée au chargement ; ensuite, du mouvement piloté par le scroll. Rien d'autre.

### Ouverture (au chargement)

**Le sol, puis deux voies parallèles, puis une ponctuation.** Cinq blocs qui montent avec le même décalage, c'est le geste par défaut : le hero tient deux matières opposées sur un même relevé.

- **Le terrain d'abord.** La carte se trace de gauche à droite (`terrain-survey`, 1500 ms), comme sortie d'un traceur ; le cartouche se pose dessus (`paper-lay`, 40 ms) avant qu'on y écrive. L'ordre porte le sens : on lève la feuille, on pose le papier, on écrit.
- **À gauche, de l'encre.** Rien ne flotte vers le haut. L'amorce brique se trace (`rule-draw`), le surtitre s'essuie de gauche à droite (`ink-wipe`), les deux lignes du titre montent derrière leur cache (`ink-rise`, 250 et 370 ms), l'accroche et le CTA se posent en opacité seule (`ink-settle`), et le relevé s'écrit en dernier — son filet d'abord, puis ses trois mesures.
- **À droite, du papier.** Le paquet arrive (`deal-card`, 300 ms), puis les fiches du dessous ne sortent de dessous la première qu'une fois celle-ci posée (660 et 740 ms).
- **La punaise** pique en dernier (620 ms) : c'est elle qui referme la séquence côté carte.
- **Le tampon tombe en dernier** (1220 ms) sur les deux voies. `stampPress` est en `both` : son image finale doit rester alignée sur le repos de `.quest-stamp` (`rotate(-9deg)`, `opacity: .88`).

Toute la séquence tient sous `@media (prefers-reduced-motion: no-preference)`, et l'état de repos est l'état final : sans la garde, le hero est simplement déjà écrit.

### Changer de fiche : un tirage, jamais un fondu croisé

Deux objets opaques ne se croisent pas en fondu — pendant tout le passage, on lit **deux textes en transparence l'un sur l'autre**, et la fiche cesse d'être un objet. Le passage d'un exemple au suivant est donc un tirage, et c'est **la fiche du dessus qu'on retire** : elle glisse hors de la punaise (`translate3d(9%, 106%, 0) rotate(-6deg)`, 560 ms, courbe sortante) et découvre la suivante, qui était déjà en place dessous. La révélée ne se déplace pas, elle se détend : elle passe de `scale(0.982)` — le repos d'une fiche du dessous, écrasée sous le paquet — à `none`.

C'est bien la fiche sortante qui bouge, jamais l'entrante. Une fiche qui monterait par-dessous donnerait, à mi-geste, deux fiches à moitié empilées verticalement, un morceau de chacune ; et depuis que le paquet est punaisé, rien ne peut arriver par le bas.

Trois conséquences à respecter :

- **Aucun changement d'opacité tant que la fiche n'est pas entièrement dégagée.** D'où les 106 % : plus d'une hauteur de fiche. Le fondu ne démarre qu'à 420 ms sur les 560, et ne dure que 150 ms. Une course plus courte ou une courbe entrante ramène immédiatement les deux textes l'un dans l'autre — c'est la première version, et elle était illisible à mi-parcours.
- **L'état de repos ne transite pas** (`transition: none`), sinon la fiche couverte redescendrait en volant au tirage suivant.
- **La fiche sort au-dessus du paquet (`z-index: 3`) mais sous le mobilier de la colonne** : le tampon et les commandes appartiennent au meuble, pas au paquet, et la fiche passe derrière eux.

Le défilement automatique (6,5 s) se suspend au survol et au focus : sinon la fiche est retirée pendant qu'on la lit.

### Défilement (`animation-timeline`)

Animations natives pilotées par le scroll, sans JavaScript ni observateur : `.reveal` (montée à l'entrée), `.carnet-rule::before` (le filet se trace), `.topo-mark` (dérive plus lente que la page), `.trail-walked` (le tracé s'encre), `.trail-station` (les repères s'allument quand la plume les atteint).

Trois règles, jamais l'une sans les autres :

1. **Double garde.** `@supports (animation-timeline: view())` **et** `@media (prefers-reduced-motion: no-preference)`. Un navigateur qui ne sait pas faire, ou un utilisateur qui n'en veut pas, ne doit rien perdre.
2. **L'état de repos EST l'état final.** Hors des gardes, la page est complète : le tracé entier, les repères posés, les blocs à `opacity: 1`. On n'anime jamais depuis un état caché déclaré en dehors des gardes.
3. **Jamais d'`overflow` autre que `visible` sur un ancêtre d'une `view-timeline`.** C'est le piège de la page : `overflow-x: hidden` calcule `overflow-y: auto`, l'élément devient un conteneur de défilement, et toute `view-timeline` à l'intérieur se cale sur une boîte qui ne défile pas — la progression reste figée à une valeur constante, sans erreur ni avertissement. `overflow: clip` et `clip-path: inset(0)` rognent la peinture **sans** créer de conteneur de défilement : ce sont eux qu'il faut utiliser (`body`, `.paper-sheet`, `.trail-band`).

### Le tracé de l'itinéraire

`LandingTrail` pose deux chemins dans un `viewBox` 100 × 100 avec `preserveAspectRatio="none"`, donc étirés à la boîte. La courbe repasse par l'axe central exactement à 1/6, 1/2 et 5/6 de la hauteur : les repères sont posés en HTML aux mêmes pourcentages et tombent sur le tracé **sans aucune mesure au chargement**. C'est ce qui permet de tout laisser au CSS, et c'est aussi pourquoi `.trail-steps` force `grid-auto-rows: 1fr`.

Le dessin progressif passe par `clip-path` et non par `stroke-dashoffset` : `vector-effect: non-scaling-stroke` fait calculer les tirets **après** l'étirement, en longueurs d'écran, si bien qu'un motif « un tiret long comme le chemin » se répète en plusieurs tronçons au lieu de dessiner la ligne d'un trait.

Un bloc `@media (prefers-reduced-transparency: reduce)` neutralise les `backdrop-filter` restants.

---

## 10. Bonnes pratiques

1. Pas de `transform: scale()` sur du texte marketing (flou des glyphes).
2. Ombres serrées (1 à 2px). Les grands `blur` donnent un rendu décollé.
   *Exception* : les objets « posés » de la landing (`.quest-slide`, `.voice-card`) portent une **ombre de contact** en deux temps — un 1px net au ras de la surface, plus un halo très étalé et très décalé (`0 20px 34px -28px`) qui ne se lit que comme une pénombre. C'est ce qui les fait reposer sur le papier au lieu de flotter.
3. Un token ajouté dans `globals.css` doit l'être aussi dans `themePalettes.ts`, pour les 4 thèmes.
4. `--card-cream` = panneau toujours clair. Réservé au mobile (`ThemePalette.cardCream`) ; côté web, utiliser `--card` et l'encre `--text`.
5. `motion-reduce` et focus visible sur tout contrôle interactif.
6. Pour brider un débordement horizontal, `overflow-x: clip` et jamais `hidden` : `hidden` crée un conteneur de défilement qui fige les `view-timeline` descendantes (cf. §9).

---

## 11. Fichiers de référence

| Fichier | Contenu |
|---|---|
| `apps/web/src/app/globals.css` | Tokens, thèmes, composants |
| `packages/ui/src/themePalettes.ts` | Mêmes tokens pour le mobile |
| `packages/ui/src/theme.ts` | Espacements, rayons, typo mobile |
| `apps/web/tailwind.config.ts` | Fonts, animations, keyframes |
| `apps/web/src/app/layout.tsx` | Chargement IBM Plex Sans / Serif / Mono |
| `apps/web/src/components/LandingTerrain.tsx` | La carte du hero (quatre reliefs, courbes maîtresses / intercalaires) |
| `apps/web/src/components/LandingTopo.tsx` | Filigrane topographique (`feTurbulence` + `feDisplacementMap`) |
| `apps/web/src/components/LandingTrail.tsx` | Tracé de l'itinéraire (route prévue + route parcourue) |
| `apps/web/src/components/aura/AuraOrbsLayer.tsx` | Pilotage des variables `--aura-*` |
| `apps/mobile/lib/glass.ts` | Matériau disponible + tokens de verre par rôle |
| `apps/mobile/components/GlassSurface.tsx` | Surface en verre (natif / flou / opaque) |
