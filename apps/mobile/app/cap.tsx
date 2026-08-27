import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useAuth } from '@clerk/expo';

import {
  TITLES_REGISTRY,
  questFamilyLabel,
  type CapCatalogEntry,
  type CapProgressView,
} from '@questia/shared';
import {
  colorWithAlpha,
  homeScreenBackdropGradient,
  UiLucideIcon,
  type ThemePalette,
} from '@questia/ui';
import { useAppLocale } from '../contexts/AppLocaleContext';
import { useAppTheme } from '../contexts/AppThemeContext';
import { hapticLight, hapticSuccess } from '../lib/haptics';
import { API_BASE_URL, apiFetch } from '../lib/api';

type Locale = 'fr' | 'en';

interface CapMilestoneDetail {
  slug: string;
  title: string;
  intent: string;
  categories: string[];
  questsRequired: number;
  rewardCoins: number;
}

interface CapDetail {
  id: string;
  icon: string;
  label: string;
  promise: string;
  forWho: string;
  rewardTitleId: string;
  rewardCoins: number;
  milestones: CapMilestoneDetail[];
}

interface CapApiResponse {
  catalog: CapCatalogEntry[];
  cap: CapProgressView | null;
  detail: CapDetail | null;
  completed: string[];
}

/** Textes de l'écran — même contenu que la page web `AppCap`. */
function capStrings(loc: Locale) {
  const fr = loc !== 'en';
  return {
    back: fr ? 'Retour à la quête' : 'Back to the quest',
    eyebrow: fr ? 'OBJECTIF LONG' : 'LONG-TERM GOAL',
    title: fr ? 'Ton Cap' : 'Your Cap',
    intro: fr
      ? "Un Cap est un objectif de vie découpé en quatre jalons. Il ne remplace pas la quête du jour : c'est lui qui la choisit. La dernière quête de chaque jalon est plus ample."
      : 'A Cap is a life goal split into four milestones. It does not replace the daily quest: it picks it. The last quest of each milestone is a bigger one.',
    inProgress: fr ? 'CAP EN COURS' : 'CAP IN PROGRESS',
    milestoneOf: (i: number, n: number) => (fr ? `Jalon ${i}/${n}` : `Milestone ${i}/${n}`),
    questsInMilestone: (done: number, total: number) =>
      fr ? `${done} quête(s) sur ${total} dans ce jalon` : `${done} of ${total} quests in this milestone`,
    milestoneQuestNext: fr ? 'Prochaine étape : quête de jalon' : 'Next up: milestone quest',
    finalReward: (coins: number, title: string) =>
      fr
        ? `À la fin du Cap : +${coins} QC et le titre « ${title} ».`
        : `At the end of the Cap: +${coins} QC and the "${title}" title.`,
    abandon: fr ? 'Abandonner ce Cap' : 'Abandon this Cap',
    abandonWarning: fr ? 'La progression de ce Cap sera perdue.' : 'Progress on this Cap will be lost.',
    abandonConfirm: fr ? "Confirmer l'abandon" : 'Confirm',
    cancel: fr ? 'Annuler' : 'Cancel',
    chooseTitle: fr ? 'Choisis ton Cap' : 'Choose your Cap',
    chooseIntro: fr
      ? 'Un seul Cap à la fois. Tu peux en changer quand tu veux, mais la progression du Cap quitté est perdue.'
      : 'One Cap at a time. You can switch whenever you want, but progress on the Cap you leave is lost.',
    changeTitle: fr ? 'Changer de Cap' : 'Switch Cap',
    changeIntro: fr
      ? "Démarrer un autre Cap remplace celui en cours et efface sa progression."
      : 'Starting another Cap replaces the current one and erases its progress.',
    capSummary: (quests: number, coins: number) =>
      fr ? `${quests} quêtes · ${coins} QC au total` : `${quests} quests · ${coins} QC total`,
    start: fr ? 'Prendre ce Cap' : 'Take this Cap',
    switchTo: fr ? 'Basculer sur ce Cap' : 'Switch to this Cap',
    done: fr ? 'Terminé' : 'Done',
    error: fr ? 'Erreur' : 'Error',
    errorGeneric: fr ? 'Une erreur est survenue.' : 'Something went wrong.',
  };
}

export default function CapScreen() {
  const router = useRouter();
  const { locale: appLocale } = useAppLocale();
  const loc: Locale = appLocale === 'en' ? 'en' : 'fr';
  const s = useMemo(() => capStrings(loc), [loc]);
  const { palette, themeId } = useAppTheme();
  const styles = useMemo(() => createStyles(palette), [palette]);
  const backdropColors = useMemo(
    () => homeScreenBackdropGradient(themeId, palette),
    [themeId, palette],
  );
  const heroGradient = useMemo(
    () =>
      [colorWithAlpha(palette.orange, 0.16), palette.card, colorWithAlpha(palette.cyan, 0.11)] as [
        string,
        string,
        string,
      ],
    [palette],
  );

  const { getToken } = useAuth();
  const getTokenRef = useRef(getToken);
  useEffect(() => {
    getTokenRef.current = getToken;
  }, [getToken]);

  const [data, setData] = useState<CapApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [confirmAbandon, setConfirmAbandon] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const token = await getTokenRef.current();
      const res = await apiFetch(`${API_BASE_URL}/api/cap`, token);
      const j = (await res.json().catch(() => ({}))) as CapApiResponse & { error?: string };
      if (!res.ok) throw new Error(j.error ?? s.errorGeneric);
      setData(j);
    } catch (e) {
      Alert.alert(s.error, e instanceof Error ? e.message : s.errorGeneric);
    } finally {
      setLoading(false);
    }
  }, [s]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const mutate = useCallback(
    async (action: 'start' | 'abandon', capId?: string) => {
      if (busy) return;
      setBusy(capId ?? action);
      try {
        const token = await getTokenRef.current();
        const res = await apiFetch(`${API_BASE_URL}/api/cap`, token, {
          method: 'POST',
          body: JSON.stringify({ action, capId }),
        });
        const j = (await res.json().catch(() => ({}))) as CapApiResponse & { error?: string };
        if (!res.ok) throw new Error(j.error ?? s.errorGeneric);
        setData(j);
        setConfirmAbandon(false);
        if (action === 'start') void hapticSuccess();
        else void hapticLight();
      } catch (e) {
        Alert.alert(s.error, e instanceof Error ? e.message : s.errorGeneric);
      } finally {
        setBusy(null);
      }
    },
    [busy, s],
  );

  const active = data?.cap ?? null;
  const detail = data?.detail ?? null;
  const others = useMemo(() => (data?.catalog ?? []).filter((c) => !c.active), [data?.catalog]);

  return (
    <View style={styles.rootFill}>
      <LinearGradient
        colors={backdropColors}
        locations={[0, 0.22, 0.48, 0.72, 1]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView style={styles.safeTransparent} edges={['top', 'left', 'right']}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <Pressable style={styles.backRow} onPress={() => router.push('/home' as never)} hitSlop={8}>
            <UiLucideIcon name="ChevronLeft" size={16} color={palette.linkOnBg} />
            <Text style={styles.backText}>{s.back}</Text>
          </Pressable>

          <Text style={styles.pageEyebrow}>{s.eyebrow}</Text>
          <Text style={styles.pageTitle}>{s.title}</Text>
          <Text style={styles.pageIntro}>{s.intro}</Text>

          {loading ? (
            <View style={styles.center}>
              <ActivityIndicator color={palette.orange} />
            </View>
          ) : null}

          {!loading && active && detail ? (
            <View
              style={[
                styles.heroShellOuter,
                Platform.OS === 'android' && styles.heroShellOuterFlatChrome,
              ]}
            >
              <View style={styles.heroShellInner}>
                <LinearGradient
                  colors={heroGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={StyleSheet.absoluteFill}
                />
                <View style={styles.heroRow}>
                  <View style={styles.heroIconBubble}>
                    <UiLucideIcon name={active.icon} size={26} color={palette.orange} />
                  </View>
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text style={styles.heroEyebrow}>{s.inProgress}</Text>
                    <Text style={styles.heroTitle}>{active.label}</Text>
                    <Text style={styles.heroTagline}>{active.promise}</Text>
                  </View>
                </View>

                <View style={styles.progressHeader}>
                  <Text style={styles.progressLabel}>
                    {s.milestoneOf(active.milestoneIndex + 1, active.milestoneCount)}
                  </Text>
                  <Text style={styles.progressLabelStrong}>{active.overallPercent}%</Text>
                </View>
                <View style={styles.progressTrack}>
                  <View style={[styles.progressFill, { width: `${active.overallPercent}%` }]} />
                </View>

                <Text style={styles.milestoneTitle}>{active.milestoneTitle}</Text>
                <Text style={styles.milestoneIntent}>{active.milestoneIntent}</Text>
                <Text style={styles.milestoneCount}>
                  {s.questsInMilestone(active.progress, active.questsRequired)}
                </Text>

                {active.milestoneQuestNext ? (
                  <View style={styles.milestoneChip}>
                    <UiLucideIcon name="Flame" size={13} color={palette.gold} strokeWidth={2.4} />
                    <Text style={styles.milestoneChipText}>{s.milestoneQuestNext}</Text>
                  </View>
                ) : null}

                <View style={styles.familyRow}>
                  {active.categories.map((c) => (
                    <View key={c} style={styles.familyChip}>
                      <Text style={styles.familyChipText}>{questFamilyLabel(c, loc) ?? c}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          ) : null}

          {!loading && active && detail ? (
            <View style={styles.milestoneList}>
              {detail.milestones.map((m, i) => {
                const done = i < active.milestoneIndex;
                const current = i === active.milestoneIndex;
                return (
                  <View
                    key={m.slug}
                    style={[
                      styles.milestoneRow,
                      current && styles.milestoneRowCurrent,
                      !current && !done && styles.milestoneRowUpcoming,
                    ]}
                  >
                    <View
                      style={[
                        styles.stepCircle,
                        done && styles.stepCircleDone,
                        current && styles.stepCircleCurrent,
                      ]}
                    >
                      {done ? (
                        <UiLucideIcon name="Check" size={13} color={palette.card} strokeWidth={3} />
                      ) : (
                        <Text style={[styles.stepNum, current && styles.stepNumCurrent]}>{i + 1}</Text>
                      )}
                    </View>
                    <View style={{ flex: 1, minWidth: 0 }}>
                      <Text style={styles.stepTitle}>{m.title}</Text>
                      <Text style={styles.stepIntent}>{m.intent}</Text>
                    </View>
                    <Text style={styles.stepCoins}>+{m.rewardCoins} QC</Text>
                  </View>
                );
              })}

              <Text style={styles.finalReward}>
                {s.finalReward(
                  detail.rewardCoins,
                  TITLES_REGISTRY[detail.rewardTitleId]?.label ?? detail.rewardTitleId,
                )}
              </Text>

              {confirmAbandon ? (
                <View style={styles.abandonRow}>
                  <Text style={styles.abandonWarning}>{s.abandonWarning}</Text>
                  <View style={styles.abandonBtnRow}>
                    <Pressable style={styles.ghostBtn} onPress={() => setConfirmAbandon(false)} hitSlop={6}>
                      <Text style={styles.ghostBtnText}>{s.cancel}</Text>
                    </Pressable>
                    <Pressable
                      style={[styles.dangerBtn, busy != null && styles.btnDisabled]}
                      disabled={busy != null}
                      onPress={() => void mutate('abandon')}
                    >
                      <Text style={styles.dangerBtnText}>
                        {busy === 'abandon' ? '…' : s.abandonConfirm}
                      </Text>
                    </Pressable>
                  </View>
                </View>
              ) : (
                <Pressable style={styles.ghostBtn} onPress={() => setConfirmAbandon(true)} hitSlop={6}>
                  <Text style={styles.ghostBtnText}>{s.abandon}</Text>
                </Pressable>
              )}
            </View>
          ) : null}

          {!loading && data ? (
            <View style={styles.catalogSection}>
              <Text style={styles.sectionTitle}>{active ? s.changeTitle : s.chooseTitle}</Text>
              <Text style={styles.sectionIntro}>{active ? s.changeIntro : s.chooseIntro}</Text>

              {others.map((c) => (
                <View key={c.id} style={styles.capCard}>
                  <View style={styles.capCardHeader}>
                    <View style={styles.capIconBubble}>
                      <UiLucideIcon name={c.icon} size={22} color={palette.orange} />
                    </View>
                    <View style={{ flex: 1, minWidth: 0 }}>
                      <Text style={styles.capCardTitle}>{c.label}</Text>
                      {c.completed ? (
                        <View style={styles.doneChip}>
                          <UiLucideIcon name="Check" size={11} color={palette.green} strokeWidth={3} />
                          <Text style={styles.doneChipText}>{s.done}</Text>
                        </View>
                      ) : null}
                    </View>
                  </View>

                  <Text style={styles.capPromise}>{c.promise}</Text>
                  <Text style={styles.capForWho}>{c.forWho}</Text>

                  <View style={styles.familyRow}>
                    {c.milestoneTitles.map((title, i) => (
                      <View key={title} style={styles.familyChip}>
                        <Text style={styles.familyChipIndex}>{i + 1}</Text>
                        <Text style={styles.familyChipText}>{title}</Text>
                      </View>
                    ))}
                  </View>

                  <Text style={styles.capSummary}>{s.capSummary(c.totalQuests, c.totalCoins)}</Text>
                  <View style={styles.capTitleRow}>
                    <UiLucideIcon name="Award" size={13} color={palette.gold} strokeWidth={2.4} />
                    <Text style={styles.capTitleText}>
                      {TITLES_REGISTRY[c.rewardTitleId]?.label ?? c.rewardTitleId}
                    </Text>
                  </View>

                  <Pressable
                    style={[styles.ctaBtn, busy != null && styles.btnDisabled]}
                    disabled={busy != null}
                    onPress={() => void mutate('start', c.id)}
                  >
                    <Text style={styles.ctaBtnText}>
                      {busy === c.id ? '…' : active ? s.switchTo : s.start}
                    </Text>
                  </Pressable>
                </View>
              ))}
            </View>
          ) : null}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function createStyles(p: ThemePalette) {
  return StyleSheet.create({
    rootFill: { flex: 1, backgroundColor: p.bg },
    safeTransparent: { flex: 1, backgroundColor: 'transparent' },
    scrollContent: { padding: 16, paddingBottom: 48 },
    center: { paddingVertical: 40, alignItems: 'center', justifyContent: 'center' },

    backRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 14 },
    backText: { color: p.linkOnBg, fontWeight: '800', fontSize: 13 },

    pageEyebrow: { color: p.subtle, fontSize: 10, fontWeight: '900', letterSpacing: 1.2 },
    pageTitle: { color: p.text, fontSize: 26, fontWeight: '900', marginTop: 4, letterSpacing: -0.3 },
    pageIntro: { color: p.muted, fontSize: 13, fontWeight: '600', lineHeight: 19, marginTop: 8, marginBottom: 18 },

    heroShellOuter: {
      borderRadius: 26,
      marginBottom: 14,
      borderWidth: 2,
      borderColor: colorWithAlpha(p.orange, 0.38),
      backgroundColor: p.card,
      shadowColor: p.orange,
      shadowOpacity: 0.14,
      shadowRadius: 18,
      shadowOffset: { width: 0, height: 10 },
      elevation: 6,
    },
    heroShellOuterFlatChrome: { elevation: 0, shadowOpacity: 0, shadowRadius: 0 },
    heroShellInner: { position: 'relative', borderRadius: 24, overflow: 'hidden', padding: 18 },
    heroRow: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
    heroIconBubble: {
      height: 54,
      width: 54,
      borderRadius: 16,
      backgroundColor: p.card,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
      borderColor: colorWithAlpha(p.orange, 0.28),
    },
    heroEyebrow: { color: p.muted, fontSize: 10, fontWeight: '900', letterSpacing: 1.2 },
    heroTitle: { color: p.text, fontSize: 22, fontWeight: '900', marginTop: 2, letterSpacing: -0.3 },
    heroTagline: { color: p.muted, fontSize: 13, marginTop: 6, lineHeight: 19, fontWeight: '600' },

    progressHeader: { marginTop: 18, flexDirection: 'row', justifyContent: 'space-between' },
    progressLabel: { color: p.muted, fontWeight: '800', fontSize: 10, letterSpacing: 0.8, textTransform: 'uppercase' },
    progressLabelStrong: { color: p.text, fontWeight: '900', fontSize: 11, letterSpacing: 0.5 },
    progressTrack: { marginTop: 8, height: 8, borderRadius: 8, backgroundColor: p.trackMuted, overflow: 'hidden' },
    progressFill: { height: '100%', borderRadius: 8, backgroundColor: p.orange },

    milestoneTitle: { color: p.text, fontSize: 15, fontWeight: '900', marginTop: 14 },
    milestoneIntent: { color: p.muted, fontSize: 13, fontWeight: '600', lineHeight: 18, marginTop: 4 },
    milestoneCount: { color: p.subtle, fontSize: 11, fontWeight: '800', marginTop: 8 },

    milestoneChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      alignSelf: 'flex-start',
      marginTop: 12,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 999,
      borderWidth: 1.5,
      borderColor: colorWithAlpha(p.gold, 0.45),
      backgroundColor: colorWithAlpha(p.gold, 0.12),
    },
    milestoneChipText: { color: p.text, fontSize: 11, fontWeight: '900' },

    familyRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 12 },
    familyChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      paddingHorizontal: 9,
      paddingVertical: 5,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: p.border,
      backgroundColor: p.surface,
    },
    familyChipIndex: { color: p.subtle, fontSize: 10, fontWeight: '900' },
    familyChipText: { color: p.muted, fontSize: 11, fontWeight: '700' },

    milestoneList: { marginBottom: 26, gap: 8 },
    milestoneRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 10,
      padding: 13,
      borderRadius: 18,
      borderWidth: 1.5,
      borderColor: colorWithAlpha(p.green, 0.3),
      backgroundColor: colorWithAlpha(p.green, 0.08),
    },
    milestoneRowCurrent: {
      borderColor: colorWithAlpha(p.orange, 0.42),
      backgroundColor: p.card,
    },
    milestoneRowUpcoming: { borderColor: p.border, backgroundColor: p.surface },
    stepCircle: {
      height: 24,
      width: 24,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1.5,
      borderColor: p.border,
      backgroundColor: p.card,
      marginTop: 1,
    },
    stepCircleDone: { backgroundColor: p.green, borderColor: p.green },
    stepCircleCurrent: { backgroundColor: p.orange, borderColor: p.orange },
    stepNum: { color: p.muted, fontSize: 11, fontWeight: '900' },
    stepNumCurrent: { color: p.card },
    stepTitle: { color: p.text, fontSize: 13, fontWeight: '900' },
    stepIntent: { color: p.muted, fontSize: 11.5, fontWeight: '600', lineHeight: 16, marginTop: 2 },
    stepCoins: { color: p.orange, fontSize: 12, fontWeight: '900' },

    finalReward: { color: p.muted, fontSize: 11.5, fontWeight: '700', lineHeight: 16, marginTop: 6 },

    abandonRow: { gap: 10, marginTop: 4 },
    abandonWarning: { color: p.text, fontSize: 12, fontWeight: '800' },
    abandonBtnRow: { flexDirection: 'row', gap: 8, alignItems: 'center' },
    ghostBtn: {
      alignSelf: 'flex-start',
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderRadius: 14,
      borderWidth: 1.5,
      borderColor: p.border,
      backgroundColor: p.card,
      marginTop: 4,
    },
    ghostBtnText: { color: p.muted, fontWeight: '800', fontSize: 13 },
    dangerBtn: {
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderRadius: 14,
      backgroundColor: p.orange,
      marginTop: 4,
    },
    dangerBtnText: { color: '#FFFFFF', fontWeight: '900', fontSize: 13 },
    btnDisabled: { opacity: 0.45 },

    catalogSection: { marginTop: 4 },
    sectionTitle: { color: p.text, fontSize: 19, fontWeight: '900', letterSpacing: -0.2 },
    sectionIntro: { color: p.muted, fontSize: 13, fontWeight: '600', lineHeight: 18, marginTop: 6, marginBottom: 14 },

    capCard: {
      backgroundColor: p.card,
      borderRadius: 22,
      padding: 16,
      marginBottom: 12,
      borderWidth: 2,
      borderColor: colorWithAlpha(p.cyan, 0.28),
    },
    capCardHeader: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
    capIconBubble: {
      height: 42,
      width: 42,
      borderRadius: 14,
      backgroundColor: p.surface,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1.5,
      borderColor: colorWithAlpha(p.orange, 0.25),
    },
    capCardTitle: { color: p.text, fontSize: 17, fontWeight: '900', letterSpacing: -0.2 },
    doneChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      alignSelf: 'flex-start',
      marginTop: 5,
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: colorWithAlpha(p.green, 0.4),
    },
    doneChipText: { color: p.green, fontSize: 10, fontWeight: '900' },
    capPromise: { color: p.text, fontSize: 13.5, fontWeight: '700', lineHeight: 19, marginTop: 12 },
    capForWho: { color: p.muted, fontSize: 12, fontWeight: '600', lineHeight: 17, marginTop: 6 },
    capSummary: { color: p.muted, fontSize: 11.5, fontWeight: '800', marginTop: 14 },
    capTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 5 },
    capTitleText: { color: p.text, fontSize: 11.5, fontWeight: '800' },
    ctaBtn: {
      alignSelf: 'flex-start',
      marginTop: 14,
      paddingHorizontal: 16,
      paddingVertical: 11,
      borderRadius: 14,
      backgroundColor: p.orange,
    },
    ctaBtnText: { color: '#FFFFFF', fontWeight: '900', fontSize: 13 },
  });
}
