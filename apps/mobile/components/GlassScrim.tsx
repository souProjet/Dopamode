import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { GlassSurface } from './GlassSurface';

export type GlassScrimProps = {
  onPress?: () => void;
  accessibilityLabel?: string;
};

/**
 * Voile plein écran derrière une modale : verre natif iOS 26+, sinon flou + voile.
 * Teinte et épaisseur viennent du thème (`getGlassTokens(..., 'scrim')`).
 */
export function GlassScrim({ onPress, accessibilityLabel }: GlassScrimProps) {
  const surface = (
    <GlassSurface role="scrim" style={StyleSheet.absoluteFillObject} pointerEvents="none" />
  );

  if (onPress) {
    return (
      <Pressable
        style={StyleSheet.absoluteFillObject}
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
      >
        {surface}
      </Pressable>
    );
  }

  return surface;
}
