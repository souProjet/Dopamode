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

Thèmes boutique : `midnight`, `aurora`, `parchment` (`html[data-theme=…]` côté web, `getThemePalette(themeId)` côté mobile). Seul `midnight` est sombre ; `--on-cream*` y reste foncé, d'où un `--card-cream` clair (`#f5f5f4`).

**Sélection de texte** : `color-mix(in srgb, var(--orange) 28%, transparent)`.

---

## 3. Typographie

| Rôle | Web | Mobile |
|---|---|---|
| Corps | **IBM Plex Sans** — `font-sans` → `var(--font-inter)` | police système |
| Titres | **IBM Plex Serif** — `font-display` → `var(--font-space)` | police système, graisse forte |

Les variables CSS gardent leurs noms historiques (`--font-inter`, `--font-space`) : seules les familles ont changé. Chargées dans `apps/web/src/app/layout.tsx` (`next/font/google`, `display: swap`, `adjustFontFallback: false`).

Labels de section : `.label`, `uppercase` + `tracking-widest`.

---

## 4. Fonds & atmosphère

### Calque d'aura (`body::before`)

Trois ellipses `radial-gradient` pilotées par `--aura-tr` / `--aura-bl` / `--aura-tl`, en `position: fixed`, `z-index: 1`. `AuraOrbsLayer` (`apps/web/src/components/aura/`) remplace ces variables à partir du profil de personnalité.

Les valeurs `:root` sont le **fallback avant personnalité** (landing incluse) : alphas volontairement bas (~0.11 à 0.16) pour que le fond lise « papier », comme sur mobile. L'intensité ne monte que sur `/app`, une fois la personnalité chargée.

### Bandes de section

`.section-band-how`, `.section-band-social`, `.section-band-cta`, `.landing-section-frost` : dégradés verticaux de teintes papier (`--surface`, `--card`, `--text` à faible pourcentage), **sans `backdrop-filter`**.

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

`tailwind.config.ts` : `animate-fade-up`, `animate-float`, `animate-glow-soft`.
`LandingReveal` : apparition au scroll (opacity + translate), respecte `prefers-reduced-motion`.

Un bloc `@media (prefers-reduced-transparency: reduce)` neutralise les `backdrop-filter` restants.

---

## 10. Bonnes pratiques

1. Pas de `transform: scale()` sur du texte marketing (flou des glyphes).
2. Ombres serrées (1 à 2px). Les grands `blur` donnent un rendu décollé.
3. Un token ajouté dans `globals.css` doit l'être aussi dans `themePalettes.ts`, pour les 4 thèmes.
4. `--card-cream` = panneau toujours clair (texte `--on-cream`). Pour une surface thémable, utiliser `--card`.
5. `motion-reduce` et focus visible sur tout contrôle interactif.

---

## 11. Fichiers de référence

| Fichier | Contenu |
|---|---|
| `apps/web/src/app/globals.css` | Tokens, thèmes, composants |
| `packages/ui/src/themePalettes.ts` | Mêmes tokens pour le mobile |
| `packages/ui/src/theme.ts` | Espacements, rayons, typo mobile |
| `apps/web/tailwind.config.ts` | Fonts, animations, keyframes |
| `apps/web/src/app/layout.tsx` | Chargement IBM Plex Sans / Serif |
| `apps/web/src/components/aura/AuraOrbsLayer.tsx` | Pilotage des variables `--aura-*` |
| `apps/mobile/lib/glass.ts` | Matériau disponible + tokens de verre par rôle |
| `apps/mobile/components/GlassSurface.tsx` | Surface en verre (natif / flou / opaque) |
