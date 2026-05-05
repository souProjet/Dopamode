'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Compass, ThumbsDown, ThumbsUp } from 'lucide-react';

export type QuestVote = 'upvote' | 'downvote';

type Props = {
  value: QuestVote | null;
  busy: boolean;
  onVote: (v: QuestVote) => void;
  labels: {
    upAria: string;
    downAria: string;
    /** Micro texte de confirmation (≈3 s) — optimiste dès le clic */
    notedShort: string;
  };
  /** Réinjecté quand la carte change (nouvelle quête) pour rejouer le fondu d’entrée */
  mountKey?: string;
};

/**
 * Barre de feedback « juicy » : rebond spring, icônes outline → remplies, jumeau atténué, micro-confirmation.
 */
export function QuestFeedbackBar({ value, busy, onVote, labels, mountKey = 'default' }: Props) {
  const reduce = useReducedMotion();
  const [noted, setNoted] = useState(false);
  const lastKey = useRef(0);

  useEffect(() => {
    if (!value) {
      setNoted(false);
      return;
    }
    lastKey.current += 1;
    setNoted(true);
    const t = window.setTimeout(() => setNoted(false), 3000);
    return () => window.clearTimeout(t);
  }, [value]);

  const upDimmed = value === 'downvote';
  const downDimmed = value === 'upvote';

  return (
    <motion.div
      key={mountKey}
      className="flex w-full flex-col items-center gap-2.5"
      initial={reduce ? undefined : { opacity: 0, y: 6 }}
      animate={reduce ? undefined : { opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 320, damping: 28, delay: 0.12 }}
    >
      <div
        className="h-px w-full max-w-[15rem] bg-gradient-to-r from-transparent via-[var(--border-ui)]/45 to-transparent"
        aria-hidden
      />
      <div className="flex w-full max-w-sm items-center justify-center gap-4">
        <VoteButton
          kind="up"
          active={value === 'upvote'}
          dimmed={upDimmed}
          busy={busy}
          ariaLabel={labels.upAria}
          onPick={() => onVote('upvote')}
        />
        <VoteButton
          kind="down"
          active={value === 'downvote'}
          dimmed={downDimmed}
          busy={busy}
          ariaLabel={labels.downAria}
          onPick={() => onVote('downvote')}
        />
      </div>
      <div className="min-h-[1.125rem] w-full text-center">
        <AnimatePresence mode="wait">
          {noted && value ? (
            <motion.div
              key={lastKey.current}
              role="status"
              initial={{ opacity: 0, y: 2 }}
              animate={{ opacity: 0.88, y: 0 }}
              exit={{ opacity: 0, y: -2 }}
              transition={{ duration: 0.32 }}
              className="flex items-center justify-center gap-1.5 text-[11px] font-semibold tracking-tight text-[var(--muted)]"
            >
              <Compass className="h-3.5 w-3.5 shrink-0 text-[var(--muted)]" strokeWidth={2} aria-hidden />
              <span>{labels.notedShort}</span>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

function VoteButton({
  kind,
  active,
  dimmed,
  busy,
  ariaLabel,
  onPick,
}: {
  kind: 'up' | 'down';
  active: boolean;
  dimmed: boolean;
  busy: boolean;
  ariaLabel: string;
  onPick: () => void;
}) {
  const reduce = useReducedMotion();
  const Icon = kind === 'up' ? ThumbsUp : ThumbsDown;

  const activeRing =
    kind === 'up'
      ? 'shadow-[0_0_0_3px_rgba(16,185,129,0.22),0_4px_20px_rgba(16,185,129,0.18)]'
      : 'shadow-[0_0_0_3px_rgba(255,90,90,0.2),0_4px_20px_rgba(249,115,22,0.15)]';


  const activeBg = kind === 'up' ? 'bg-emerald-500/18' : 'bg-gradient-to-br from-orange-500/20 to-rose-500/22';

  const iconIdle = kind === 'up' ? 'text-slate-400' : 'text-slate-400';
  const iconActive =
    kind === 'up' ? 'text-emerald-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.55)]' : 'text-[#ff6b4a] drop-shadow-[0_0_10px_rgba(255,120,90,0.45)]';

  return (
    <motion.button
      type="button"
      disabled={busy}
      aria-label={ariaLabel}
      aria-pressed={active}
      onClick={onPick}
      whileTap={reduce ? undefined : { scale: 0.9 }}
      transition={
        reduce
          ? { duration: 0 }
          : {
              type: 'spring',
              stiffness: 520,
              damping: 16,
              mass: 0.45,
            }
      }
      className={[
        'relative inline-flex h-12 w-12 items-center justify-center rounded-2xl border transition-colors duration-200',
        active
          ? `border-white/10 ${activeRing} ${activeBg}`
          : [
              'border-[var(--border-ui)]/35 bg-[var(--bg)]/60 hover:border-[var(--border-ui)]/55',
              kind === 'up' ? 'hover:bg-emerald-500/10' : 'hover:bg-orange-500/10',
            ].join(' '),
        dimmed ? 'opacity-[0.38] saturate-[0.65]' : 'opacity-100',
        busy ? 'pointer-events-none opacity-60' : '',
      ].join(' ')}
    >
      <Icon
        className={`h-[22px] w-[22px] transition-colors duration-200 ${active ? iconActive : iconIdle}`}
        strokeWidth={active ? 2.35 : 2.1}
        fill={active ? 'currentColor' : 'none'}
        aria-hidden
      />
    </motion.button>
  );
}
