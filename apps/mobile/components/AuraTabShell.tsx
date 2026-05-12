/**
 * AuraTabShell — conteneur racine pour les onglets secondaires (profil, boutique, historique).
 *
 * Fournit le fond coloré du thème + les 3 orbes d'aura dérivés de la personnalité
 * de l'utilisateur (Profil Aura Visuelle). Les orbes utilisent des dégradés radiaux SVG
 * (center→transparent) pour reproduire fidèlement l'effet CSS radial-gradient du site web.
 * Les orbes sont absolument positionnés derrière le contenu (pointerEvents="none").
 */

import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Defs, RadialGradient, Stop, Ellipse } from 'react-native-svg';
import { computeAuraOrbTints } from '@questia/ui';
import { useAppTheme } from '../contexts/AppThemeContext';

interface Props {
  children: React.ReactNode;
}

interface AuraOrbProps {
  color: string;
  width: number;
  height: number;
  gradientId: string;
}

function AuraOrb({ color, width, height, gradientId }: AuraOrbProps) {
  return (
    <Svg width={width} height={height}>
      <Defs>
        <RadialGradient id={gradientId} cx="50%" cy="50%" r="50%">
          <Stop offset="0%"   stopColor={color} stopOpacity="1" />
          <Stop offset="50%"  stopColor={color} stopOpacity="0.5" />
          <Stop offset="100%" stopColor={color} stopOpacity="0" />
        </RadialGradient>
      </Defs>
      <Ellipse
        cx={width / 2}
        cy={height / 2}
        rx={width / 2}
        ry={height / 2}
        fill={`url(#${gradientId})`}
      />
    </Svg>
  );
}

export function AuraTabShell({ children }: Props) {
  const { palette, themeId, personality } = useAppTheme();

  const orbTints = useMemo(
    () => computeAuraOrbTints(personality, themeId, palette),
    [personality, themeId, palette],
  );

  return (
    <View style={[styles.root, { backgroundColor: palette.bg }]}>
      {/* Orbes d'aura — derrière le contenu, dégradé radial center→transparent */}
      <View pointerEvents="none" style={StyleSheet.absoluteFillObject}>
        <View style={styles.orbTopRight}>
          <AuraOrb color={orbTints.tr} width={420} height={420} gradientId="aura-shell-tr" />
        </View>
        <View style={styles.orbBottomLeft}>
          <AuraOrb color={orbTints.bl} width={460} height={460} gradientId="aura-shell-bl" />
        </View>
        <View style={styles.orbTopLeft}>
          <AuraOrb color={orbTints.tl} width={320} height={320} gradientId="aura-shell-tl" />
        </View>
      </View>

      {/* Contenu de l'onglet */}
      <View style={styles.content}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  orbTopRight: {
    position: 'absolute',
    top: -80,
    right: -100,
  },
  orbBottomLeft: {
    position: 'absolute',
    bottom: -100,
    left: -110,
  },
  orbTopLeft: {
    position: 'absolute',
    top: 60,
    left: -80,
  },
});
