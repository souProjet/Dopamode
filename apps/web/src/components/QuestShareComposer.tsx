'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import { Icon } from '@/components/Icons';
import {
  QUEST_SHARE_BACKGROUNDS,
  buildQuestShareMessage,
  buildWebAppQuestUrl,
  formatQuestDateFr,
  formatQuestShareEquippedTitleLine,
  formatQuestShareProgressionLine,
  getQuestShareBackgroundById,
  questDisplayEmoji,
  type QuestShareBackground,
} from '@questia/shared';
import { siteUrl } from '@/config/marketing';
import { QuestiaLogo } from '@/components/QuestiaLogo';

function siteHostLabel(base: string): string {
  try {
    return new URL(base.startsWith('http') ? base : `https://${base}`).hostname.replace(/^www\./, '');
  } catch {
    return 'questia.fr';
  }
}

export interface QuestSharePayload {
  questDate: string;
  emoji: string;
  title: string;
  mission: string;
  hook: string;
  duration: string;
  streak: number;
  day: number;
  /** Titre boutique équipé (affiché sur la carte + texte de partage). */
  equippedTitleId?: string | null;
  /** Niveau / XP (réponse API `progression`). */
  progression?: {
    level: number;
    totalXp: number;
    xpIntoLevel: number;
    xpToNext: number;
    xpPerLevel: number;
  } | null;
}

const CARD_W = 360;
const CARD_H = 640;

function truncate(s: string, max: number): string {
  const t = s.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1)}…`;
}

function QuestShareCardFrame({
  payload,
  userFirstName,
  background,
  photoUrl,
  shareLocale = 'fr',
}: {
  payload: QuestSharePayload;
  userFirstName: string;
  background: QuestShareBackground;
  photoUrl: string | null;
  shareLocale?: 'fr' | 'en';
}) {
  const equippedTitleLine = formatQuestShareEquippedTitleLine(payload.equippedTitleId);
  const progressionLine =
    payload.progression &&
    formatQuestShareProgressionLine(
      { level: payload.progression.level, totalXp: payload.progression.totalXp },
      shareLocale,
    );
  const panelDark = background.darkForeground && !photoUrl;
  const panelBorder = panelDark ? 'rgba(255,255,255,0.14)' : 'rgba(255,255,255,0.55)';
  const panelBg = panelDark ? 'rgba(12,10,9,0.72)' : 'rgba(255,255,255,0.74)';
  const titleColor = panelDark ? '#faf8f4' : '#1c1917';
  const mutedColor = panelDark ? 'rgba(231,229,228,0.88)' : '#57534e';
  const accentColor = panelDark ? '#2dd4bf' : '#115e59';
  const dateLabel = formatQuestDateFr(payload.questDate);
  const fontSans = 'var(--font-inter), ui-sans-serif, system-ui, sans-serif';
  const fontDisplay = 'var(--font-space), var(--font-inter), ui-sans-serif, system-ui, sans-serif';

  return (
    <div
      style={{
        width: CARD_W,
        height: CARD_H,
        position: 'relative',
        overflow: 'hidden',
        borderRadius: 24,
        boxShadow: '0 24px 48px rgba(28,25,23,0.2)',
      }}
    >
      {/* Fond pleine carte (dégradé / photo continue sous l'overlay) */}
      {photoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={photoUrl}
          alt=""
          crossOrigin="anonymous"
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
      ) : (
        <>
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: background.cssGradient,
              backgroundSize: '100% 100%',
              backgroundRepeat: 'no-repeat',
            }}
          />
          <div
            style={{
              position: 'absolute',
              inset: 0,
              opacity: 0.38,
              backgroundImage: `
                radial-gradient(circle at 50% 42%, rgba(255,255,255,0.38) 0%, transparent 44%),
                repeating-linear-gradient(
                  -18deg,
                  transparent,
                  transparent 38px,
                  rgba(19, 78, 74, 0.07) 38px,
                  rgba(19, 78, 74, 0.07) 39px
                ),
                radial-gradient(circle at 1px 1px, rgba(255,255,255,0.35) 1px, transparent 0)
              `,
              backgroundSize: 'auto, auto, 28px 28px',
            }}
          />
        </>
      )}

      <div
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          background:
            photoUrl != null
              ? 'linear-gradient(to top, rgba(28,25,23,0.82) 0%, transparent 48%, rgba(28,25,23,0.18) 100%)'
              : 'linear-gradient(180deg, rgba(28,25,23,0.1) 0%, transparent 30%, transparent 58%, rgba(28,25,23,0.2) 100%)',
        }}
      />

      <div
        style={{
          position: 'relative',
          zIndex: 2,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0,
        }}
      >
        <div
          style={{
            flexShrink: 0,
            display: 'flex',
            justifyContent: photoUrl ? 'space-between' : 'flex-end',
            alignItems: 'center',
            gap: 12,
            padding: '14px 16px 6px',
          }}
        >
          {photoUrl ? (
            <>
              <div
                style={{
                  flex: 1,
                  minWidth: 0,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <QuestiaLogo variant="card" />
                <div
                  style={{
                    flex: 1,
                    minWidth: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2,
                    justifyContent: 'center',
                  }}
                >
                  <span
                    style={{
                      fontFamily: fontDisplay,
                      fontSize: 10,
                      fontWeight: 800,
                      letterSpacing: '0.28em',
                      textTransform: 'uppercase',
                      color: panelDark ? 'rgba(250,248,244,0.96)' : '#1c1917',
                      textShadow: '0 1px 10px rgba(0,0,0,0.55)',
                    }}
                  >
                    QUESTIA
                  </span>
                  <span
                    style={{
                      fontFamily: fontSans,
                      fontSize: 10,
                      fontWeight: 700,
                      letterSpacing: '0.04em',
                      color: 'rgba(250,248,244,0.92)',
                      textShadow: '0 1px 8px rgba(0,0,0,0.65)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {siteHostLabel(siteUrl)}
                  </span>
                </div>
              </div>
              <span
                style={{
                  fontFamily: fontSans,
                  fontSize: 11,
                  fontWeight: 600,
                  fontFeatureSettings: '"tnum"',
                  letterSpacing: '0.01em',
                  color: panelDark ? 'rgba(250,248,244,0.92)' : '#44403c',
                  textAlign: 'right',
                  maxWidth: 200,
                  lineHeight: 1.35,
                  textShadow: '0 1px 10px rgba(0,0,0,0.5)',
                }}
              >
                {dateLabel}
              </span>
            </>
          ) : (
            <span
              style={{
                fontFamily: fontSans,
                fontSize: 11,
                fontWeight: 600,
                fontFeatureSettings: '"tnum"',
                letterSpacing: '0.01em',
                color: panelDark ? 'rgba(250,248,244,0.92)' : '#44403c',
                textAlign: 'right',
                flex: 1,
                lineHeight: 1.35,
                textShadow: '0 1px 0 rgba(255,255,255,0.35)',
              }}
            >
              {dateLabel}
            </span>
          )}
        </div>

        {!photoUrl ? (
          <div
            style={{
              flex: 1,
              minHeight: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              pointerEvents: 'none',
              padding: '8px 12px 0',
              gap: 10,
            }}
          >
            <QuestiaLogo variant="shareHero" />
            <span
              style={{
                fontFamily: fontDisplay,
                fontSize: 11,
                fontWeight: 800,
                letterSpacing: '0.28em',
                textTransform: 'uppercase',
                color: panelDark ? 'rgba(250,248,244,0.96)' : '#1c1917',
                textShadow: '0 1px 0 rgba(255,255,255,0.4)',
              }}
            >
              QUESTIA
            </span>
            <span
              style={{
                fontFamily: fontSans,
                fontSize: 12,
                fontWeight: 700,
                color: mutedColor,
                letterSpacing: '0.02em',
              }}
            >
              {siteHostLabel(siteUrl)}
            </span>
          </div>
        ) : (
          <div style={{ flex: 1, minHeight: 0 }} />
        )}

        <div
          data-share-panel={panelDark ? 'dark' : 'light'}
          style={{
            flexShrink: 0,
            margin: '0 14px 14px',
            padding: '16px 16px 15px',
            borderRadius: 20,
            border: `1px solid ${panelBorder}`,
            background: panelBg,
            backdropFilter: 'blur(14px) saturate(1.15)',
            WebkitBackdropFilter: 'blur(14px) saturate(1.15)',
            boxShadow: panelDark
              ? '0 12px 36px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.06)'
              : '0 14px 40px rgba(28,25,23,0.12), inset 0 1px 0 rgba(255,255,255,0.85)',
          }}
        >
          {/* Mission = action accomplie (texte principal) ; titre = repère court */}
          <div
            style={{
              display: 'flex',
              gap: 12,
              alignItems: 'flex-start',
              marginBottom: 12,
            }}
          >
            <span
              style={{
                flexShrink: 0,
                marginTop: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 40,
                height: 40,
                /* L'encre suit le panneau : `currentColor` porte l'icône. */
                color: titleColor,
              }}
            >
              <Icon name={questDisplayEmoji(payload.emoji)} className="h-9 w-9" />
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p
                style={{
                  fontFamily: fontSans,
                  fontSize: 10,
                  fontWeight: 800,
                  letterSpacing: '0.22em',
                  textTransform: 'uppercase',
                  color: panelDark ? 'rgba(168,162,158,0.95)' : '#78716c',
                  marginBottom: 8,
                  lineHeight: 1.3,
                }}
              >
                {truncate(payload.title, 56)}
              </p>
              <p
                style={{
                  fontFamily: fontDisplay,
                  fontSize: 19,
                  fontWeight: 800,
                  letterSpacing: '-0.03em',
                  lineHeight: 1.28,
                  color: titleColor,
                  margin: 0,
                }}
              >
                {truncate(payload.mission, 118)}
              </p>
            </div>
          </div>

          <p
            style={{
              fontFamily: fontSans,
              fontSize: 11,
              fontWeight: 600,
              color: mutedColor,
              textAlign: 'left',
              marginBottom: 0,
              paddingTop: 10,
              borderTop: `1px solid ${panelDark ? 'rgba(255,255,255,0.1)' : 'rgba(120,113,108,0.28)'}`,
              marginTop: 2,
            }}
          >
            Jour {payload.day}
            {payload.streak > 0 ? (
              <>
                {' · '}
                <span style={{ fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  <span
                    style={{ display: 'inline-flex', color: panelDark ? '#fb923c' : '#c2410c' }}
                    aria-hidden
                  >
                    <Icon name="Flame" className="h-3.5 w-3.5 shrink-0" />
                  </span>
                  {payload.streak} jour{payload.streak !== 1 ? 's' : ''} de suite
                </span>
              </>
            ) : null}
          </p>

          {equippedTitleLine || progressionLine ? (
            <p
              style={{
                fontFamily: fontSans,
                fontSize: 10,
                fontWeight: 700,
                color: mutedColor,
                textAlign: 'left',
                marginTop: 10,
                marginBottom: 0,
                lineHeight: 1.45,
              }}
            >
              {equippedTitleLine ? <span>{equippedTitleLine}</span> : null}
              {equippedTitleLine && progressionLine ? <br /> : null}
              {progressionLine ? <span>{progressionLine}</span> : null}
            </p>
          ) : null}

          <p
            style={{
              fontFamily: fontSans,
              fontSize: 12,
              fontStyle: 'italic',
              color: panelDark ? 'rgba(231,229,228,0.82)' : '#78716c',
              lineHeight: 1.5,
              marginTop: 12,
              marginBottom: 12,
              textAlign: 'left',
            }}
          >
            « {truncate(payload.hook, 96)} »
          </p>
          <p
            style={{
              fontFamily: fontDisplay,
              fontSize: 13,
              fontWeight: 800,
              color: accentColor,
              textAlign: 'center',
              letterSpacing: '-0.02em',
            }}
          >
            {shareLocale === 'en'
              ? `${userFirstName} · Quest complete`
              : `${userFirstName} · Quête accomplie`}
          </p>
        </div>
      </div>
    </div>
  );
}

export function QuestShareComposer({
  open,
  onOpenChange,
  payload,
  userFirstName,
  shareLocale = 'fr',
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  payload: QuestSharePayload;
  userFirstName: string;
  /** Aligné sur la locale de l'app (libellés Nv./Lv. et format des nombres). */
  shareLocale?: 'fr' | 'en';
}) {
  const [bgId, setBgId] = useState(QUEST_SHARE_BACKGROUNDS[0].id);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const [sharingLink, setSharingLink] = useState(false);
  const [linkFeedback, setLinkFeedback] = useState<'idle' | 'copied' | 'shared' | 'error'>('idle');
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  /** Couche modal montée (pour animation de sortie) */
  const [layerMounted, setLayerMounted] = useState(() => open);
  /** État « ouvert » pour transitions (backdrop + sheet) */
  const [sheetActive, setSheetActive] = useState(false);
  const captureRef = useRef<HTMLDivElement>(null);
  const bgStripRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const previewViewportRef = useRef<HTMLDivElement>(null);
  const [previewScale, setPreviewScale] = useState(1);

  const background = getQuestShareBackgroundById(bgId);
  const fallbackWebUrl = buildWebAppQuestUrl(siteUrl);

  const sheetUi =
    shareLocale === 'en'
      ? {
          optionalHint: 'Optional — export or share below, then tap Done.',
          exportImage: 'Export image',
          exportImageBusy: '…',
          linkCta: 'Copy or share web link',
          linkBusy: 'Preparing link…',
          linkCopied: 'Link copied',
          linkShared: 'Link shared',
          linkError: 'Could not share link',
          done: 'Done',
          closeOverlay: 'Close',
        }
      : {
          optionalHint: "Optionnel — exporte ou partage ci-dessous, puis touche « Terminé ».",
          exportImage: "Exporter l'image",
          exportImageBusy: '…',
          linkCta: 'Copier ou envoyer le lien web',
          linkBusy: 'Préparation du lien…',
          linkCopied: 'Lien copié',
          linkShared: 'Lien partagé',
          linkError: 'Impossible de partager le lien',
          done: 'Terminé',
          closeOverlay: 'Fermer',
        };

  useLayoutEffect(() => {
    if (open) {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
        closeTimeoutRef.current = null;
      }
      setLayerMounted(true);
      setSheetActive(false);
      // setTimeout plutôt que double rAF : en React Strict Mode le cleanup annulait la 1re frame
      // et sheetActive restait false → overlay visible mais panneau en opacity:0 (écran « noir »).
      const t = window.setTimeout(() => setSheetActive(true), 20);
      return () => clearTimeout(t);
    }
  }, [open]);

  useEffect(() => {
    if (open) return;
    setSheetActive(false);
    closeTimeoutRef.current = setTimeout(() => {
      setLayerMounted(false);
      closeTimeoutRef.current = null;
    }, 440);
    return () => {
      if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    };
  }, [open]);

  useEffect(() => {
    if (open) {
      setLinkFeedback('idle');
    }
  }, [open]);

  useEffect(() => {
    setShareUrl(null);
  }, [payload.questDate]);

  useEffect(() => {
    if (!layerMounted) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [layerMounted]);

  useEffect(() => {
    if (!layerMounted) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onOpenChange(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [layerMounted, onOpenChange]);

  useEffect(() => {
    return () => {
      if (photoUrl) URL.revokeObjectURL(photoUrl);
    };
  }, [photoUrl]);

  /** Molette verticale → défilement horizontal (sinon la liste semble « bloquée » sur desktop). */
  useEffect(() => {
    if (!layerMounted) return;
    const el = bgStripRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (el.scrollWidth <= el.clientWidth + 2) return;
      if (e.shiftKey) return;
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
      e.preventDefault();
      el.scrollLeft += e.deltaY;
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [layerMounted, open]);

  useLayoutEffect(() => {
    if (!layerMounted) return;
    const el = previewViewportRef.current;
    if (!el) return;

    const updateScale = () => {
      const byWidth = el.clientWidth > 0 ? el.clientWidth / CARD_W : 1;
      const byHeight = el.clientHeight > 0 ? el.clientHeight / CARD_H : 1;
      const next = Math.min(1, byWidth, byHeight);
      // Evite des micro-renders dus aux flottants.
      setPreviewScale((prev) => (Math.abs(prev - next) < 0.001 ? prev : next));
    };

    updateScale();
    /** Après ouverture du sheet (animation) ou changement de safe-area, le viewport change de taille. */
    const raf = requestAnimationFrame(() => {
      updateScale();
      requestAnimationFrame(updateScale);
    });
    const observer = new ResizeObserver(updateScale);
    observer.observe(el);
    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
    };
  }, [layerMounted, open, sheetActive]);

  const onPickFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (photoUrl) URL.revokeObjectURL(photoUrl);
    setPhotoUrl(URL.createObjectURL(f));
  };

  const clearPhoto = () => {
    if (photoUrl) URL.revokeObjectURL(photoUrl);
    setPhotoUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const resolveShareUrl = useCallback(async (): Promise<string> => {
    if (shareUrl) return shareUrl;
    try {
      const res = await fetch('/api/quest/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questDate: payload.questDate }),
      });
      if (!res.ok) return fallbackWebUrl;
      const json = (await res.json()) as { webUrl?: string };
      const url = typeof json.webUrl === 'string' && json.webUrl.trim() ? json.webUrl.trim() : fallbackWebUrl;
      setShareUrl(url);
      return url;
    } catch {
      return fallbackWebUrl;
    }
  }, [shareUrl, payload.questDate, fallbackWebUrl]);

  const exportPng = useCallback(async () => {
    const el = captureRef.current;
    if (!el) return;
    setExporting(true);
    try {
      if (document.fonts?.ready) {
        await document.fonts.ready;
      }
      const images = Array.from(el.querySelectorAll('img'));
      await Promise.all(
        images.map(async (img) => {
          if (img.complete && img.naturalWidth > 0) return;
          try {
            await img.decode();
          } catch {
            // Fallback silencieux : on laisse html2canvas tenter le rendu.
          }
        }),
      );
      const canvas = await html2canvas(el, {
        scale: 3,
        useCORS: true,
        allowTaint: false,
        logging: false,
        backgroundColor: null,
        width: CARD_W,
        height: CARD_H,
        windowWidth: CARD_W,
        windowHeight: CARD_H,
        scrollX: 0,
        scrollY: 0,
        /** html2canvas ne reproduit pas backdrop-filter / filter comme le navigateur — on aplatit pour coller à la preview. */
        onclone: (_documentClone, cloned) => {
          cloned.querySelectorAll<HTMLElement>('[data-share-panel]').forEach((node) => {
            const mode = node.getAttribute('data-share-panel');
            node.style.backdropFilter = 'none';
            node.style.setProperty('-webkit-backdrop-filter', 'none');
            if (mode === 'dark') {
              node.style.background = 'rgba(12, 10, 9, 0.88)';
            } else {
              node.style.background = 'rgba(255, 255, 255, 0.92)';
            }
          });
        },
      });
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob((b) => resolve(b), 'image/png', 1),
      );
      if (!blob) return;
      const filename = `questia-quete-${payload.questDate}.png`;
      const file = new File([blob], filename, { type: 'image/png' });
      const webUrl = await resolveShareUrl();

      const shareText = buildQuestShareMessage({
        title: payload.title,
        webUrl,
        equippedTitleLine: formatQuestShareEquippedTitleLine(payload.equippedTitleId),
        progressionLine: payload.progression
          ? formatQuestShareProgressionLine(
              {
                level: payload.progression.level,
                totalXp: payload.progression.totalXp,
              },
              shareLocale,
            )
          : null,
      });
      if (typeof navigator !== 'undefined' && navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'Ma quête Questia',
          text: shareText,
          url: webUrl,
        });
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
      }
    } finally {
      setExporting(false);
    }
  }, [
    payload.questDate,
    payload.title,
    payload.equippedTitleId,
    payload.progression,
    shareLocale,
    resolveShareUrl,
  ]);

  const shareLink = useCallback(async () => {
    if (typeof navigator === 'undefined') return;
    setSharingLink(true);
    setLinkFeedback('idle');
    try {
      const webUrl = await resolveShareUrl();
      if (navigator.share) {
        await navigator.share({
          title: 'Ma quête Questia',
          text: payload.title,
          url: webUrl,
        });
        setLinkFeedback('shared');
        return;
      }

      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(webUrl);
        setLinkFeedback('copied');
        return;
      }

      setLinkFeedback('error');
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        return;
      }
      setLinkFeedback('error');
    } finally {
      setSharingLink(false);
    }
  }, [payload.title, resolveShareUrl]);

  if (!layerMounted && !open) return null;

  const panelInner = (
    <>
      {/* Handle façon story / Instagram */}
      <div className="flex justify-center pt-2 pb-1 md:pt-0 md:pb-0 md:hidden">
        <div
          className="h-1.5 w-12 rounded-full bg-[var(--border-ui-strong)]"
          aria-hidden
        />
      </div>

        <div className="relative min-w-0 px-4 pb-7 pt-3 sm:px-5 sm:pb-8 md:px-7 md:pt-7 md:pb-9">
        {/* Pas de halo néon : la DA proscrit les grands `blur` colorés (voir docs/direction-artistique.md §5). */}

        <div className="relative text-center mb-6">
          <h2
            id="share-card-title"
            className="font-display text-[clamp(1.1rem,4.5vw,1.5rem)] sm:text-2xl font-bold text-[var(--text)] tracking-tight px-1"
          >
            Ta carte à partager
          </h2>
          <p className="mt-2 text-sm text-[var(--muted)] max-w-[min(20rem,100%)] mx-auto leading-relaxed px-0.5">
            Fond ou photo, puis export — prêt pour Insta, Stories ou la galerie.
          </p>
        </div>

        <div className="mb-6 min-w-0 pt-1">
          <div className="mb-2 flex flex-wrap items-end justify-between gap-x-3 gap-y-1 px-0.5">
            <p className="carnet-eyebrow">Fonds</p>
          </div>
          <div className="relative w-full min-w-0 max-w-full rounded-[2px] border border-[var(--border-ui)] bg-[var(--surface)] p-1.5">
            {/* Voiles de débordement : ils reprennent l'aplat du conteneur, pas un blanc arbitraire. */}
            <div
              className="pointer-events-none absolute inset-y-2 left-1 z-[1] w-5 bg-gradient-to-r from-[var(--surface)] to-transparent sm:w-7"
              aria-hidden
            />
            <div
              className="pointer-events-none absolute inset-y-2 right-1 z-[1] w-5 bg-gradient-to-l from-[var(--surface)] to-transparent sm:w-7"
              aria-hidden
            />
            <div
              ref={bgStripRef}
              className="share-bg-strip flex w-full min-w-0 max-w-full select-none gap-2 overflow-x-auto overflow-y-hidden px-1.5 py-1.5 [-webkit-overflow-scrolling:touch]"
            >
              {QUEST_SHARE_BACKGROUNDS.map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => setBgId(b.id)}
                  className={`flex h-10 min-w-[5.75rem] shrink-0 items-center justify-center rounded-lg border-2 px-3 text-[10px] font-bold uppercase tracking-wide transition-[border-color,box-shadow] duration-150 ${
                    bgId === b.id
                      ? 'border-[var(--violet)]'
                      : b.darkForeground
                        ? 'border-white/25 hover:border-white/50'
                        : 'border-black/[0.12] hover:border-black/25'
                  }`}
                  style={{
                    backgroundImage: b.cssGradient,
                    backgroundSize: '100% 100%',
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'center',
                  }}
                >
                  <span
                    className={
                      /* Encre littérale : la pastille porte un fond fixe, elle ne suit pas le thème. */
                      b.darkForeground ? 'text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.35)]' : 'text-[#1c1917]'
                    }
                  >
                    {b.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mb-6 min-w-0">
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={onPickFile} />
          <div className="rounded-[2px] border border-[var(--border-ui-strong)] bg-[color-mix(in_srgb,var(--gold)_7%,var(--card))] p-4 shadow-[0_1px_2px_color-mix(in_srgb,var(--text)_6%,transparent)] sm:p-5">
            <div className="flex min-w-0 flex-col gap-4">
              <div className="min-w-0 w-full">
                <p className="carnet-eyebrow">Photo</p>
                <p className="mt-1.5 text-sm leading-relaxed text-[var(--text)]">
                  Mets un cliché de ton moment : ta carte raconte mieux ton histoire.
                </p>
              </div>
              <div className="flex w-full min-w-0 flex-col gap-2">
                <button
                  type="button"
                  className="inline-flex w-full items-center justify-center gap-2.5 rounded-lg border border-[var(--border-cyan)] bg-[var(--card)] px-5 py-3.5 text-base font-semibold text-[var(--text)] transition-colors duration-200 hover:border-[var(--violet)] hover:bg-[var(--surface)]"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Icon name="Camera" size="lg" className="shrink-0 text-[var(--violet)]" />
                  <span>Ajouter une photo</span>
                </button>
                {photoUrl ? (
                  <button
                    type="button"
                    className="py-1 text-center text-sm text-[var(--link-on-bg)] underline decoration-[color:color-mix(in_srgb,var(--link-on-bg)_35%,transparent)] underline-offset-[0.2em] transition-colors duration-200 hover:text-[var(--text)]"
                    onClick={clearPhoto}
                  >
                    Retirer la photo
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6 flex min-w-0 w-full justify-center overflow-x-hidden">
          <div
            ref={previewViewportRef}
            className="flex w-full min-w-0 max-w-full items-center justify-center px-0.5 min-h-[220px] h-[min(62dvh,40rem)] sm:h-[min(58dvh,38rem)] md:h-[min(54dvh,36rem)]"
          >
            <div
              className="mx-auto max-w-full"
              style={{
                width: CARD_W * previewScale,
                height: CARD_H * previewScale,
              }}
            >
              <div
                style={{
                  width: CARD_W,
                  height: CARD_H,
                  transform: `scale(${previewScale})`,
                  transformOrigin: 'top left',
                }}
              >
                <div
                  ref={captureRef}
                  className="inline-block overflow-hidden rounded-[24px] shadow-[0_2px_8px_-2px_color-mix(in_srgb,var(--text)_18%,transparent)]"
                >
                  <QuestShareCardFrame
                    payload={payload}
                    userFirstName={userFirstName}
                    background={background}
                    photoUrl={photoUrl}
                    shareLocale={shareLocale}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <p className="px-0.5 text-center text-xs leading-relaxed text-[var(--subtle)]">{sheetUi.optionalHint}</p>
          {/* Trois actions, trois niveaux : aplat orange (export), filet (lien), aplat violet (fin). */}
          <button
            type="button"
            className="btn btn-cta w-full rounded-lg py-4 text-base disabled:opacity-60"
            disabled={exporting}
            onClick={() => void exportPng()}
          >
            <span className="flex items-center justify-center gap-2">
              {exporting ? (
                sheetUi.exportImageBusy
              ) : (
                <>
                  <Icon name="Download" size="sm" className="opacity-95" />
                  {sheetUi.exportImage}
                </>
              )}
            </span>
          </button>
          <button
            type="button"
            className="w-full rounded-lg border border-[var(--border-cyan)] bg-[var(--card)] py-3.5 text-sm font-semibold text-[var(--text)] transition-colors duration-200 hover:border-[var(--violet)] hover:bg-[var(--surface)] disabled:opacity-60"
            disabled={sharingLink}
            onClick={() => void shareLink()}
          >
            {sharingLink
              ? sheetUi.linkBusy
              : linkFeedback === 'copied'
                ? sheetUi.linkCopied
                : linkFeedback === 'shared'
                  ? sheetUi.linkShared
                  : linkFeedback === 'error'
                    ? sheetUi.linkError
                    : sheetUi.linkCta}
          </button>
          <button
            type="button"
            className="btn btn-primary w-full rounded-lg py-4 text-base"
            onClick={() => onOpenChange(false)}
          >
            {sheetUi.done}
          </button>
        </div>
      </div>
    </>
  );

  const panel = (
    <div
      className="relative z-10 flex min-h-0 w-full min-w-0 max-w-md max-h-[min(calc(100dvh-1rem),52rem)] flex-col overflow-y-auto overflow-x-hidden overscroll-contain rounded-t-[1.85rem] md:max-h-[min(calc(100vh-2.5rem),52rem)] md:rounded-[1.85rem] share-sheet-scroll"
      role="dialog"
      aria-modal
      aria-labelledby="share-card-title"
    >
      {/* Filet d'accent — même langage que les autres modales quête */}
      <div className="quest-modal-panel-accent h-[3px] shrink-0 md:rounded-t-[1.85rem]" />

      {/*
        Coque : aplat opaque, filet 1px, ombre serrée. Pas de reflet ni de dégradé
        (voir `docs/direction-artistique.md` §5). Le flou reste sur le voile de fond.
      */}
      <div className="relative rounded-b-[1.85rem] border-x border-b border-[var(--border-ui-strong)] bg-[var(--card)] shadow-[0_2px_8px_-2px_color-mix(in_srgb,var(--text)_14%,transparent)] md:rounded-b-[1.85rem] md:border">
        {panelInner}
      </div>
    </div>
  );

  const backdropActive = sheetActive;
  const sheetTransform = backdropActive
    ? 'opacity-100'
    : 'opacity-0';

  return (
    <div
      className="fixed inset-0 z-[60] flex h-[100dvh] max-h-[100dvh] w-full flex-col justify-end overflow-hidden md:justify-center md:p-5 md:pb-8"
      role="presentation"
    >
      {/* Couche plein écran : base opaque + flou (évite trous / bords du radial seuls) */}
      <button
        type="button"
        className={`quest-modal-backdrop absolute inset-0 z-0 h-full w-full cursor-pointer border-0 transition-opacity duration-300 ease-out motion-reduce:transition-none ${
          backdropActive ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        aria-label={sheetUi.closeOverlay}
        onClick={() => onOpenChange(false)}
      />

      <div
        className={`pointer-events-none relative z-10 mx-auto flex min-h-0 w-full max-w-md max-h-full flex-1 flex-col justify-end px-3 pb-[max(1rem,env(safe-area-inset-bottom))] pt-[max(0.25rem,env(safe-area-inset-top))] md:max-h-none md:flex-none md:px-0 md:pb-0 md:pt-0 transition-opacity duration-[320ms] ease-out motion-reduce:!opacity-100 motion-reduce:!transition-none ${sheetTransform}`}
      >
        <div className="pointer-events-auto">{panel}</div>
      </div>
    </div>
  );
}
