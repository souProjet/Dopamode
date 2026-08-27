import type { Metadata } from 'next';
import { Link } from '@/i18n/navigation';
import { siteUrl } from '@/config/marketing';
import { SiteFooter } from '@/components/SiteFooter';

export const metadata: Metadata = {
  title: 'Bien-être et limites',
  description:
    "Questia est une application ludique : pas de conseil médical ni psychologique. Utilisation responsable et transparence sur la motivation et l'IA.",
  robots: { index: true, follow: true },
};

export default function BienEtrePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="mx-auto w-full max-w-6xl flex-1 px-5 py-12 sm:px-8 sm:py-16">
        <div className="max-w-[46rem]">
        <p className="carnet-eyebrow">
          <Link href="/" className="transition-colors hover:text-[var(--text)]">
            ← Accueil
          </Link>
        </p>
        <h1 className="mt-4 font-display text-[clamp(1.9rem,3.4vw+1rem,2.75rem)] font-semibold leading-[1.08] tracking-[-0.025em] text-balance text-[var(--text)]">
          Bien-être et limites d'usage
        </h1>
        <p className="carnet-rule mt-8 pt-4 text-xs text-[var(--subtle)]">
          Page d'information :{' '}
          <a
            href={siteUrl}
            className="text-[var(--link-on-bg)] underline decoration-[color:color-mix(in_srgb,var(--link-on-bg)_35%,transparent)] underline-offset-[0.2em] transition-colors duration-200 hover:text-[var(--text)]"
          >
            {siteUrl}
          </a>
        </p>

        <div className="legal-prose mt-12">
          <section>
            <h2>Nature du service</h2>
            <p>
              Questia est une application de <strong>divertissement et de motivation</strong> dans la vie quotidienne. Les
              quêtes proposées sont des <strong>jeux de rôle légers</strong> et des défis personnels, pas des traitements,
              exercices thérapeutiques ou programmes de santé.
            </p>
          </section>

          <section>
            <h2>Pas de conseil médical ou psychologique</h2>
            <p>
              Rien dans Questia ne remplace un avis de <strong>médecin</strong>, de{' '}
              <strong>psychologue</strong>, de psychiatre ou d'un autre professionnel de santé qualifié. En cas de douleur,
              de symptômes, de détresse psychologique ou de situation d'urgence, contacte les services de secours ou un
              professionnel de santé. En France, le numéro d'urgence est le <strong>15</strong> (SAMU) ou le{' '}
              <strong>112</strong> (Europe).
            </p>
          </section>

          <section>
            <h2>Contenu généré par intelligence artificielle</h2>
            <p>
              Des textes (missions, accroches) peuvent être <strong>générés automatiquement</strong>. Ils peuvent être
              imprécis, mal adaptés à ta situation ou à un moment donné. Tu restes responsable de tes choix dans la vie
              réelle (lieux, interactions, effort physique). Interromps toute activité qui te met mal à l'aise ou en
              danger.
            </p>
          </section>

          <section>
            <h2>Utilisation responsable</h2>
            <p>
              Respecte la loi, le droit d'autrui et les règles des lieux publics. Les quêtes extérieures supposent une
              appréciation de ta forme et des conditions (météo, visibilité, sécurité). Ne te mets pas en situation
              d'intrusion, de conduite dangereuse ou de mise en danger.
            </p>
          </section>

          <section>
            <h2>Liens utiles</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <Link href="/legal/confidentialite">
                  Politique de confidentialité
                </Link>
              </li>
              <li>
                Contact / support : utilise les coordonnées indiquées sur le site ou dans l'application pour signaler un
                contenu inapproprié ou poser une question.
              </li>
            </ul>
          </section>
        </div>
        </div>
      </div>
      <SiteFooter />
    </div>
  );
}
