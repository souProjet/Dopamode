'use client';

import { Link } from '@/i18n/navigation';
import { AuraProfileSimulator } from './AuraProfileSimulator';

// ─── Textes ───────────────────────────────────────────────────────────────────

const COPY = {
  fr: {
    kicker: 'Fonctionnalité',
    title: 'Profil Aura Visuelle',
    lead: 'Les bulles de couleur autour de ta quête ne sont pas décoratives : elles évoluent avec ta personnalité. Plus tu utilises Questia, plus les orbes reflètent fidèlement qui tu es.',
    backHome: '← Accueil',
    howTitle: 'Comment ça fonctionne',
    steps: [
      {
        title: 'Un vecteur de personnalité unique',
        body: 'Questia mesure 7 dimensions : les 5 grands traits (Big Five) et 2 axes de Sensation Seeking. Chaque trait varie de 0 à 1 — le centre (0,5) est la neutralité. Aucune case, aucun diagnostic.',
      },
      {
        title: 'Chaque trait correspond à une famille de couleurs',
        body: 'L\'extraversion tire vers l\'orange chaleureux ; l\'ouverture d\'esprit vers le violet créatif ; la stabilité émotionnelle vers l\'or serein. Les pôles opposés (faible ↔ élevé) ont des teintes différentes — la couleur exprime la direction, pas juste l\'intensité.',
      },
      {
        title: 'Trois orbes, trois axes de lecture',
        body: 'L\'orbe Haut-Droite exprime l\'énergie et l\'action (extraversion + thrill seeking). L\'orbe Bas-Gauche exprime la créativité et le lien social (ouverture + agréabilité). L\'orbe Haut-Gauche exprime l\'ancrage et la sérénité (discipline + stabilité émotionnelle).',
      },
      {
        title: 'Intensité proportionnelle à la personnalité',
        body: 'Un profil moyen (50 % partout) produit les teintes neutres du thème. Plus les traits sont marqués, plus les couleurs deviennent expressives. Le thème actif (Minuit, Aurore…) module la saturation et la luminosité.',
      },
      {
        title: 'Personnalité exhibée vs déclarée',
        body: 'À l\'onboarding, tu déclares une orientation. Avec le temps, tes choix de quêtes (complétées, refusées, relancées) font évoluer une personnalité "exhibée" calculée depuis ton comportement réel. C\'est cette version qui colore l\'aura en priorité.',
      },
    ],
    simulatorTitle: 'Simulateur interactif',
    simulatorLead: 'Déplace les curseurs pour explorer comment chaque trait influence les couleurs en temps réel.',
    noteTitle: 'Ce que tu dois retenir',
    noteBody: 'L\'aura n\'est pas un ornement — c\'est un miroir doux de ton parcours. Elle change imperceptiblement au fil des semaines à mesure que ta personnalité exhibée converge ou diverge de ce que tu avais déclaré. Aucun chiffre, aucune étiquette : juste une ambiance.',
  },
  en: {
    kicker: 'Feature',
    title: 'Visual Aura Profile',
    lead: 'The color bubbles around your quest aren\'t decorative — they evolve with your personality. The more you use Questia, the more the orbs faithfully reflect who you are.',
    backHome: '← Home',
    howTitle: 'How it works',
    steps: [
      {
        title: 'A unique personality vector',
        body: 'Questia measures 7 dimensions: the Big Five traits and 2 Sensation Seeking axes. Each trait ranges from 0 to 1 — the center (0.5) is neutral. No boxes, no diagnosis.',
      },
      {
        title: 'Each trait maps to a color family',
        body: 'Extraversion pulls toward warm orange; openness toward creative violet; emotional stability toward serene gold. Opposite poles (low ↔ high) have different hues — color expresses direction, not just intensity.',
      },
      {
        title: 'Three orbs, three reading axes',
        body: 'The top-right orb expresses energy and action (extraversion + thrill seeking). The bottom-left expresses creativity and social connection (openness + agreeableness). The top-left expresses grounding and serenity (conscientiousness + emotional stability).',
      },
      {
        title: 'Intensity proportional to personality',
        body: 'An average profile (50% everywhere) produces the theme\'s neutral tints. The more marked the traits, the more expressive the colors become. The active theme (Midnight, Aurora…) modulates saturation and lightness.',
      },
      {
        title: 'Exhibited vs declared personality',
        body: 'At onboarding, you declare an orientation. Over time, your quest choices (completed, rejected, rerolled) evolve an "exhibited" personality calculated from real behavior. That version colors the aura first.',
      },
    ],
    simulatorTitle: 'Interactive simulator',
    simulatorLead: 'Move the sliders to explore how each trait influences colors in real time.',
    noteTitle: 'What to keep in mind',
    noteBody: 'The aura isn\'t an ornament — it\'s a gentle mirror of your journey. It changes imperceptibly over weeks as your exhibited personality converges or diverges from what you declared. No numbers, no labels: just an atmosphere.',
  },
} as const;

type Locale = 'fr' | 'en';

// ─── Composant principal ──────────────────────────────────────────────────────

export function AuraProfilePage({ locale }: { locale: Locale }) {
  const t = COPY[locale];

  return (
    <div className="mx-auto w-full max-w-6xl px-5 pb-16 pt-10 sm:px-8 sm:pb-24 sm:pt-14">
      <div className="max-w-[46rem]">
        <p className="carnet-eyebrow">
          <Link href="/" className="transition-colors hover:text-[var(--text)]">
            {t.backHome}
          </Link>
        </p>
        <h1 className="mt-4 font-display text-[clamp(1.9rem,3.4vw+1rem,2.9rem)] font-semibold leading-[1.06] tracking-[-0.03em] text-balance text-[var(--text)]">
          {t.title}
        </h1>
        <p className="mt-5 text-base leading-[1.65] text-[var(--muted)] sm:text-lg">{t.lead}</p>
      </div>

      {/* ── Simulateur : la planche de démonstration, pas une carte flottante ── */}
      <section aria-labelledby="simulator-section-title" className="carnet-rule mt-14 pt-8 sm:mt-16">
        <p className="carnet-eyebrow">01</p>
        <h2
          id="simulator-section-title"
          className="mt-3 font-display text-[clamp(1.4rem,1.6vw+1rem,1.9rem)] font-semibold leading-[1.15] tracking-[-0.02em] text-[var(--text)]"
        >
          {t.simulatorTitle}
        </h2>
        <p className="mt-3 max-w-[46rem] text-[15px] leading-[1.65] text-[var(--muted)] sm:text-base">
          {t.simulatorLead}
        </p>
        <div className="mt-8 border border-[var(--border-ui-strong)] bg-[var(--card)] p-5 sm:p-8">
          <AuraProfileSimulator />
        </div>
      </section>

      {/* ── Comment ça fonctionne : numérotation en marge, filets, aucun tuilage coloré ── */}
      <section aria-labelledby="how-title" className="carnet-rule mt-14 pt-8 sm:mt-16">
        <p className="carnet-eyebrow">02</p>
        <h2
          id="how-title"
          className="mt-3 font-display text-[clamp(1.4rem,1.6vw+1rem,1.9rem)] font-semibold leading-[1.15] tracking-[-0.02em] text-[var(--text)]"
        >
          {t.howTitle}
        </h2>
        {/* Le dernier item occupe les deux colonnes : sinon la cellule vide lit comme un aplat gris. */}
        <ol className="mt-8 grid gap-px bg-[var(--border-ui)] sm:grid-cols-2">
          {t.steps.map((step, i) => (
            <li key={i} className="bg-[var(--bg)] sm:last:col-span-2">
              <div className="flex h-full gap-5 px-1 py-7 sm:px-6">
                <span className="carnet-numeral shrink-0 text-[2.1rem] sm:text-[2.5rem]" aria-hidden>
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div className="min-w-0">
                  <h3 className="font-display text-lg font-semibold leading-snug tracking-[-0.01em] text-[var(--text)]">
                    {step.title}
                  </h3>
                  <p className="mt-2.5 text-[15px] leading-[1.65] text-[var(--muted)]">{step.body}</p>
                </div>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* ── Note finale ── */}
      <section className="carnet-rule mt-14 pt-8 sm:mt-16">
        <div className="max-w-[46rem] border-l-2 border-[var(--violet)] pl-5 sm:pl-6">
          <h2 className="font-display text-lg font-semibold tracking-[-0.01em] text-[var(--text)]">
            {t.noteTitle}
          </h2>
          <p className="mt-3 text-[15px] leading-[1.7] text-[var(--muted)] sm:text-base">{t.noteBody}</p>
        </div>
      </section>
    </div>
  );
}
