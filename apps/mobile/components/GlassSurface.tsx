import React, { useMemo } from 'react';
import { StyleSheet, View, type StyleProp, type ViewProps, type ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { GlassView } from 'expo-glass-effect';
import { useAppTheme } from '../contexts/AppThemeContext';
import { getGlassTokens, useGlassMaterial, type GlassRole } from '../lib/glass';

export type GlassSurfaceProps = {
  /** Épaisseur de matériau attendue (voir `GlassRole`). */
  role: GlassRole;
  /** Remplace la teinte du thème. */
  tintColor?: string;
  style?: StyleProp<ViewStyle>;
  pointerEvents?: ViewProps['pointerEvents'];
  children?: React.ReactNode;
};

/**
 * Surface en verre, unique point de contact avec le natif.
 *
 * iOS 26+ : `GlassView` (Liquid Glass, réfraction et spéculaire gérés par le
 * système). Ailleurs : flou `expo-blur` + voile, le rendu d'avant. Transparence
 * coupée dans les réglages d'accessibilité, ou web : aplat opaque.
 *
 * Se pose en fond absolu dans un parent déjà découpé (`overflow: 'hidden'` +
 * rayons) : comme `BlurView`, le calque natif suit le masque du parent.
 * Poser le matériau, pas la couleur : les valeurs viennent de `getGlassTokens`.
 */
export function GlassSurface({
  role,
  tintColor,
  style,
  pointerEvents,
  children,
}: GlassSurfaceProps) {
  const { palette, themeId } = useAppTheme();
  const material = useGlassMaterial();
  const tokens = useMemo(() => getGlassTokens(palette, themeId, role), [palette, themeId, role]);

  if (material === 'liquid') {
    return (
      <GlassView
        style={style}
        glassEffectStyle={tokens.glassStyle}
        tintColor={tintColor ?? tokens.glassTint}
        colorScheme={tokens.colorScheme}
        pointerEvents={pointerEvents}
      >
        {children}
      </GlassView>
    );
  }

  if (material === 'solid') {
    return (
      <View
        style={[{ backgroundColor: tintColor ?? tokens.solidColor }, style]}
        pointerEvents={pointerEvents}
      >
        {children}
      </View>
    );
  }

  const veil = tintColor ?? tokens.veilColor;

  return (
    <View style={style} pointerEvents={pointerEvents}>
      <BlurView
        pointerEvents="none"
        intensity={tokens.blurIntensity}
        tint={tokens.blurTint}
        style={StyleSheet.absoluteFillObject}
      />
      {veil !== 'transparent' ? (
        <View
          pointerEvents="none"
          style={[StyleSheet.absoluteFillObject, { backgroundColor: veil }]}
        />
      ) : null}
      {children}
    </View>
  );
}
