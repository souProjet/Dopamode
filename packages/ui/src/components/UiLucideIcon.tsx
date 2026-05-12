'use client';

import React from 'react';
import * as Lucide from 'lucide-react-native';
import {
  ThumbsUp,
  ThumbsDown,
  MapPin,
  Compass,
  Sparkles,
  Leaf,
  Lock,
} from 'lucide-react-native';

export type UiLucideIconProps = {
  name: string;
  size: number;
  color: string;
  strokeWidth?: number;
};

/**
 * Imports explicites des icônes que Metro ne résout pas via `import * as Lucide`
 * (tree-shaking Metro + réexportations de lucide-react-native).
 */
const EXPLICIT: Record<string, React.ComponentType<Record<string, unknown>>> = {
  ThumbsUp: ThumbsUp as React.ComponentType<Record<string, unknown>>,
  ThumbsDown: ThumbsDown as React.ComponentType<Record<string, unknown>>,
  MapPin: MapPin as React.ComponentType<Record<string, unknown>>,
  Compass: Compass as React.ComponentType<Record<string, unknown>>,
  Sparkles: Sparkles as React.ComponentType<Record<string, unknown>>,
  Leaf: Leaf as React.ComponentType<Record<string, unknown>>,
  Lock: Lock as React.ComponentType<Record<string, unknown>>,
};

/**
 * Rend une icône Lucide par nom (PascalCase). Repli : Swords si le nom est inconnu.
 * Priorité : import explicite → namespace Lucide → sous-module icons → Swords.
 */
export function UiLucideIcon({ name, size, color, strokeWidth = 2 }: UiLucideIconProps) {
  const explicit = EXPLICIT[name];
  if (explicit) {
    const C = explicit;
    return <C size={size} color={color} strokeWidth={strokeWidth} />;
  }
  const root = Lucide as unknown as Record<string, unknown>;
  const iconsNs = root.icons as Record<string, React.ComponentType<Record<string, unknown>>> | undefined;
  const fromRoot = root[name];
  const fromIcons = iconsNs?.[name];
  const pick =
    (typeof fromRoot === 'function' ? fromRoot : undefined) ??
    (typeof fromIcons === 'function' ? fromIcons : undefined);
  const C = pick as React.ComponentType<Record<string, unknown>> | undefined;
  if (C) {
    return <C size={size} color={color} strokeWidth={strokeWidth} />;
  }
  const Fallback = Lucide.Swords;
  return <Fallback size={size} color={color} strokeWidth={strokeWidth} />;
}
