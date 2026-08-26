import { useEffect, useState } from 'react';
import { AccessibilityInfo, Platform } from 'react-native';
import { isLiquidGlassAvailable } from 'expo-glass-effect';
import { colorWithAlpha, themeUsesLightStatusBar, type ThemePalette } from '@questia/ui';

/**
 * Matériau réellement disponible sur l'appareil :
 * - `liquid` : verre natif iOS 26+ (`expo-glass-effect`) ;
 * - `blur`   : flou `expo-blur` + voile (iOS < 26, Android) ;
 * - `solid`  : aucune transparence (web, ou « Réduire la transparence » activé).
 */
export type GlassMaterial = 'liquid' | 'blur' | 'solid';

/**
 * `isLiquidGlassAvailable()` lève si le module natif est absent du binaire
 * (Expo Go, build antérieur à l'ajout d'`expo-glass-effect`) : on retombe alors
 * sur le flou plutôt que de faire planter le rendu.
 */
function liquidGlassSupported(): boolean {
  try {
    return isLiquidGlassAvailable();
  } catch {
    return false;
  }
}

/**
 * `isLiquidGlassAvailable()` ne dit pas si l'utilisateur a coupé la transparence
 * dans les réglages d'accessibilité : on l'écoute pour retomber sur de l'opaque.
 */
export function useGlassMaterial(): GlassMaterial {
  const [reduceTransparency, setReduceTransparency] = useState(false);

  useEffect(() => {
    let alive = true;
    AccessibilityInfo.isReduceTransparencyEnabled()
      .then((enabled) => {
        if (alive) setReduceTransparency(enabled);
      })
      .catch(() => {});
    const sub = AccessibilityInfo.addEventListener(
      'reduceTransparencyChanged',
      setReduceTransparency,
    );
    return () => {
      alive = false;
      sub.remove();
    };
  }, []);

  if (Platform.OS === 'web' || reduceTransparency) return 'solid';
  return liquidGlassSupported() ? 'liquid' : 'blur';
}

/** Rôles de surface en verre. Un rôle = une épaisseur de matériau, pas une couleur. */
export type GlassRole =
  /** Barre d'onglets, en-têtes flottants : le verre le plus fin. */
  | 'chrome'
  /** Feuilles modales (sélecteurs, recharge) : verre épais, contenu lisible dessus. */
  | 'sheet'
  /** Voile plein écran derrière une modale : assombrit autant qu'il floute. */
  | 'scrim'
  /** Face de la carte de quête : verre teinté par le thème. */
  | 'card';

export type GlassTokens = {
  /** `expo-glass-effect` */
  glassStyle: 'clear' | 'regular';
  glassTint: string;
  colorScheme: 'light' | 'dark';
  /** `expo-blur` (repli) */
  blurIntensity: number;
  blurTint: 'light' | 'dark';
  /** Voile posé sur le flou, jamais sur le verre natif (il a déjà sa matière). */
  veilColor: string;
  /** Repli sans transparence du tout. */
  solidColor: string;
};

/**
 * Un seul endroit décide de l'apparence du verre pour un thème donné.
 * Les thèmes sombres (Minuit) demandent un flou `dark`, sinon le verre blanchit
 * un fond déjà noir et le contraste du texte s'effondre.
 */
export function getGlassTokens(
  palette: ThemePalette,
  themeId: string,
  role: GlassRole,
): GlassTokens {
  const dark = themeUsesLightStatusBar(themeId);
  const colorScheme: 'light' | 'dark' = dark ? 'dark' : 'light';
  const blurTint: 'light' | 'dark' = dark ? 'dark' : 'light';
  const ios = Platform.OS === 'ios';

  switch (role) {
    case 'chrome':
      return {
        glassStyle: 'regular',
        glassTint: colorWithAlpha(palette.surface, dark ? 0.34 : 0.26),
        colorScheme,
        blurIntensity: ios ? 118 : 88,
        blurTint,
        veilColor: colorWithAlpha(palette.card, ios ? 0.34 : 0.52),
        solidColor: colorWithAlpha(palette.surface, 0.94),
      };
    case 'sheet':
      return {
        glassStyle: 'regular',
        glassTint: colorWithAlpha(palette.card, dark ? 0.42 : 0.34),
        colorScheme,
        blurIntensity: dark ? 48 : 56,
        blurTint,
        veilColor: colorWithAlpha(palette.card, dark ? 0.74 : 0.62),
        solidColor: palette.card,
      };
    case 'scrim':
      return {
        glassStyle: 'regular',
        glassTint: palette.overlay,
        colorScheme,
        blurIntensity: dark ? 52 : 58,
        blurTint: dark ? 'dark' : 'light',
        veilColor: palette.overlay,
        solidColor: palette.overlay,
      };
    case 'card':
      return {
        glassStyle: 'clear',
        glassTint: colorWithAlpha(palette.card, dark ? 0.5 : 0.42),
        colorScheme,
        blurIntensity: dark ? 52 : 46,
        blurTint,
        veilColor: 'transparent',
        solidColor: palette.card,
      };
  }
}
