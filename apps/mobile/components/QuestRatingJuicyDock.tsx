import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated as RNAnimated, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withSpring,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { UiLucideIcon, type ThemePalette } from '@questia/ui';
import { elevationAndroidSafe } from '../lib/elevationAndroid';

type Vote = 'upvote' | 'downvote';

type Props = {
  palette: ThemePalette;
  displayQuestRating: Vote | null;
  onQuestRate: (v: Vote) => void;
  ratingBusy: boolean;
  feedbackUpAria: string;
  feedbackDownAria: string;
  feedbackNotedMicro: string;
};

/**
 * Barre de feedback bas de carte : rebond Reanimated, haptique léger, micro-texte en fondu.
 */
export function QuestRatingJuicyDock({
  palette: p,
  displayQuestRating,
  onQuestRate,
  ratingBusy,
  feedbackUpAria,
  feedbackDownAria,
  feedbackNotedMicro,
}: Props) {
  const scaleUp = useSharedValue(1);
  const scaleDown = useSharedValue(1);
  const msgOpacity = useRef(new RNAnimated.Value(0)).current;

  useEffect(() => {
    if (!displayQuestRating) {
      msgOpacity.setValue(0);
      return;
    }
    msgOpacity.setValue(0);
    RNAnimated.timing(msgOpacity, { toValue: 1, duration: 200, useNativeDriver: true }).start();
    const t = setTimeout(() => {
      RNAnimated.timing(msgOpacity, { toValue: 0, duration: 420, useNativeDriver: true }).start();
    }, 2580);
    return () => clearTimeout(t);
  }, [displayQuestRating, msgOpacity]);

  const animUp = useAnimatedStyle(() => ({ transform: [{ scale: scaleUp.value }] }));
  const animDown = useAnimatedStyle(() => ({ transform: [{ scale: scaleDown.value }] }));

  const bump = (sv: SharedValue<number>) => {
    sv.value = withSequence(
      withTiming(0.9, { duration: 55 }),
      withSpring(1.1, { damping: 12, stiffness: 400 }),
      withSpring(1, { damping: 14, stiffness: 320 }),
    );
  };

  const fire = (dir: Vote, sv: SharedValue<number>) => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    bump(sv);
    onQuestRate(dir);
  };

  const upActive = displayQuestRating === 'upvote';
  const downActive = displayQuestRating === 'downvote';

  return (
    <View style={dock.wrap}>
      <View style={[dock.divider, { backgroundColor: `${p.muted}28` }]} />
      <View style={dock.row}>
        <View style={[dock.dimWrap, displayQuestRating === 'downvote' ? dock.dimmed : null]}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={feedbackUpAria}
            accessibilityState={{ selected: upActive }}
            disabled={ratingBusy}
            onPress={() => fire('upvote', scaleUp)}
          >
            <Animated.View
              style={[
                dock.btn,
                animUp,
                {
                  borderColor: upActive ? 'rgba(52,211,153,0.65)' : `${p.muted}44`,
                  backgroundColor: upActive ? 'rgba(16,185,129,0.22)' : `${p.muted}12`,
                  shadowColor: upActive ? '#34d399' : 'transparent',
                  shadowOpacity: upActive ? 0.38 : 0,
                  shadowRadius: upActive ? 12 : 0,
                  shadowOffset: { width: 0, height: 3 },
                  elevation: elevationAndroidSafe(upActive ? 4 : 0),
                },
              ]}
            >
              <UiLucideIcon name="ThumbsUp" size={24} color={upActive ? '#34d399' : p.muted} strokeWidth={upActive ? 2.4 : 2.1} />
            </Animated.View>
          </Pressable>
        </View>
        <View style={[dock.dimWrap, displayQuestRating === 'upvote' ? dock.dimmed : null]}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={feedbackDownAria}
            accessibilityState={{ selected: downActive }}
            disabled={ratingBusy}
            onPress={() => fire('downvote', scaleDown)}
          >
            <Animated.View
              style={[
                dock.btn,
                animDown,
                {
                  borderColor: downActive ? 'rgba(255,107,74,0.75)' : `${p.muted}44`,
                  backgroundColor: downActive ? 'rgba(255,107,74,0.18)' : `${p.muted}12`,
                  shadowColor: downActive ? '#ff6b4a' : 'transparent',
                  shadowOpacity: downActive ? 0.35 : 0,
                  shadowRadius: downActive ? 12 : 0,
                  shadowOffset: { width: 0, height: 3 },
                  elevation: elevationAndroidSafe(downActive ? 4 : 0),
                },
              ]}
            >
              <UiLucideIcon name="ThumbsDown" size={24} color={downActive ? '#ff6b4a' : p.muted} strokeWidth={downActive ? 2.4 : 2.1} />
            </Animated.View>
          </Pressable>
        </View>
      </View>
      <RNAnimated.View style={[dock.microRow, { opacity: msgOpacity }]}>
        <UiLucideIcon name="Compass" size={13} color={p.muted} strokeWidth={2.2} />
        <Text style={[dock.micro, { color: p.muted }]}>{feedbackNotedMicro}</Text>
      </RNAnimated.View>
    </View>
  );
}

const dock = StyleSheet.create({
  wrap: {
    marginTop: 18,
    paddingTop: 14,
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    width: '78%',
    maxWidth: 240,
    marginBottom: 14,
    borderRadius: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 18,
  },
  dimWrap: {
    opacity: 1,
  },
  dimmed: {
    opacity: 0.38,
  },
  btn: {
    width: 52,
    height: 52,
    borderRadius: 17,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  microRow: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    minHeight: 16,
  },
  micro: {
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: -0.2,
  },
});
