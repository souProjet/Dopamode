import React from 'react';
import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import { CommonActions } from '@react-navigation/native';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '../contexts/AppThemeContext';
import { colorWithAlpha } from '@questia/ui';
import { hapticSelection } from '../lib/haptics';
import { GlassSurface } from './GlassSurface';
import { useGlassMaterial } from '../lib/glass';

type IonName = React.ComponentProps<typeof Ionicons>['name'];

const TAB_ICONS: Record<
  string,
  { inactive: IonName; active: IonName }
> = {
  home: { inactive: 'home-outline', active: 'home' },
  shop: { inactive: 'cart-outline', active: 'cart' },
  /** Liste / fil d'historique — plus homogène avec home · cart · person que journal-outline */
  history: { inactive: 'list-outline', active: 'list' },
  profile: { inactive: 'person-outline', active: 'person' },
};

const FALLBACK_ICONS: { inactive: IonName; active: IonName } = {
  inactive: 'ellipse-outline',
  active: 'ellipse',
};

/**
 * Barre d'onglets maison : libellés toujours visibles (sous l'icône),
 * sans dépendre du calcul de hauteur interne de React Navigation.
 *
 * Le fond est une surface en verre : Liquid Glass sur iOS 26+, flou ailleurs.
 * L'onglet actif porte une pastille teintée — sur verre natif le bord du
 * matériau suffit à détacher la barre, on retire donc le filet et l'ombre.
 */
export function QuestiaTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { palette } = useAppTheme();
  const material = useGlassMaterial();
  const liquid = material === 'liquid';
  const bottom = Math.max(insets.bottom, Platform.OS === 'android' ? 8 : 6);

  return (
    <View
      style={[
        styles.outer,
        {
          paddingBottom: bottom,
          paddingTop: 8,
          borderTopWidth: liquid ? 0 : StyleSheet.hairlineWidth,
          borderTopColor: palette.divider,
        },
        liquid
          ? null
          : Platform.select({
              ios: {
                shadowColor: palette.text,
                shadowOpacity: 0.08,
                shadowRadius: 12,
                shadowOffset: { width: 0, height: -4 },
              },
              android: { elevation: 12 },
            }),
      ]}
    >
      <GlassSurface role="chrome" pointerEvents="none" style={StyleSheet.absoluteFillObject} />
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const focused = state.index === index;
        const title = options.title ?? route.name;
        const label =
          typeof options.tabBarLabel === 'string' ? options.tabBarLabel : String(title);

        const icons = TAB_ICONS[route.name] ?? FALLBACK_ICONS;
        const iconColor = focused ? palette.orange : palette.muted;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!focused && !event.defaultPrevented) {
            hapticSelection();
            navigation.dispatch({
              ...CommonActions.navigate(route),
              target: state.key,
            });
          }
        };

        const onLongPress = () => {
          navigation.emit({ type: 'tabLongPress', target: route.key });
        };

        return (
          <Pressable
            key={route.key}
            accessibilityRole="button"
            accessibilityState={focused ? { selected: true } : {}}
            accessibilityLabel={label}
            onPress={onPress}
            onLongPress={onLongPress}
            style={({ pressed }) => [styles.tab, pressed && styles.tabPressed]}
          >
            <View
              style={[
                styles.iconWrap,
                focused && {
                  backgroundColor: colorWithAlpha(palette.orange, liquid ? 0.16 : 0.13),
                },
              ]}
              importantForAccessibility="no"
            >
              <Ionicons
                name={focused ? icons.active : icons.inactive}
                size={22}
                color={iconColor}
              />
            </View>
            <Text
              style={[
                styles.label,
                { color: focused ? palette.orange : palette.muted },
              ]}
              numberOfLines={1}
              allowFontScaling
            >
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    position: 'relative',
    overflow: 'hidden',
    flexDirection: 'row',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingVertical: 4,
    minHeight: 48,
  },
  tabPressed: { opacity: 0.85 },
  /** Pastille de l'onglet actif : capsule centrée sur l'icône. */
  iconWrap: {
    height: 30,
    minWidth: 52,
    borderRadius: 15,
    marginBottom: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0.2,
    ...Platform.select({
      android: { includeFontPadding: false },
    }),
  },
});
