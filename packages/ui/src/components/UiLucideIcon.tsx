'use client';

import React from 'react';
import * as Lucide from 'lucide-react-native';

export type UiLucideIconProps = {
  name: string;
  size: number;
  color: string;
  strokeWidth?: number;
};

/**
 * Rend une icône Lucide par nom (PascalCase). Repli : Swords si le nom est inconnu.
 * Metro peut ne pas peupler toutes les réexportations sur `import * as Lucide` ; le sous-module
 * `icons` liste tout le jeu et sert de secours (ex. ThumbsUp / ThumbsDown).
 */
export function UiLucideIcon({ name, size, color, strokeWidth = 2 }: UiLucideIconProps) {
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
