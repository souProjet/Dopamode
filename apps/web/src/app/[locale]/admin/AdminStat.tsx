import { Icon } from '@/components/Icons';

export function AdminStat({
  label,
  value,
  hint,
  accent,
  icon,
}: {
  label: string;
  value: number;
  hint: string;
  accent: 'cyan' | 'orange' | 'violet' | 'emerald';
  /** Nom d'icône Lucide (PascalCase) */
  icon?: string;
}) {
  /*
   * Aplat teinté + filet 1px, une couleur par accent. Pas de dégradé ni de halo :
   * la DA réserve le relief au chrome flottant (`docs/direction-artistique.md` §5).
   * Branches écrites en entier — le JIT Tailwind ne lit pas les littéraux construits.
   */
  const styles =
    accent === 'cyan'
      ? {
          ring: 'border-[var(--border-cyan)]',
          iconBg: 'bg-[color-mix(in_srgb,var(--violet)_10%,var(--card))] text-[var(--violet)]',
        }
      : accent === 'orange'
        ? {
            ring: 'border-[color:color-mix(in_srgb,var(--orange)_28%,var(--border-ui))]',
            iconBg: 'bg-[color-mix(in_srgb,var(--orange)_10%,var(--card))] text-[var(--orange)]',
          }
        : accent === 'emerald'
          ? {
              ring: 'border-[color:color-mix(in_srgb,var(--green)_28%,var(--border-ui))]',
              iconBg: 'bg-[color-mix(in_srgb,var(--green)_10%,var(--card))] text-[var(--green)]',
            }
          : {
              ring: 'border-[color:color-mix(in_srgb,var(--gold)_28%,var(--border-ui))]',
              iconBg: 'bg-[color-mix(in_srgb,var(--gold)_10%,var(--card))] text-[var(--gold)]',
            };

  return (
    <div
      className={`rounded-2xl border bg-[var(--card)] px-4 py-4 shadow-[0_1px_2px_color-mix(in_srgb,var(--text)_6%,transparent)] transition-colors duration-200 ${styles.ring}`}
    >
      <div className="flex items-start gap-3">
        {icon ? (
          <span
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${styles.iconBg}`}
            aria-hidden
          >
            <Icon name={icon} size="lg" />
          </span>
        ) : null}
        <div className="min-w-0 flex-1">
          <p className="carnet-eyebrow">{label}</p>
          <p className="mt-1 font-display text-3xl font-bold tabular-nums tracking-tight text-[var(--text)]">
            {value.toLocaleString('fr-FR')}
          </p>
          <p className="mt-1.5 text-xs leading-snug text-[var(--subtle)]">{hint}</p>
        </div>
      </div>
    </div>
  );
}
