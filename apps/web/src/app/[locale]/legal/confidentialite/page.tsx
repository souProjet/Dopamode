import type { Metadata } from 'next';
import { Link } from '@/i18n/navigation';
import { legalPublisher } from '@/config/legal';
import { siteUrl } from '@/config/marketing';
import { IncompleteNotice } from '@/components/legal/LegalLayout';
import { SiteFooter } from '@/components/SiteFooter';

export const metadata: Metadata = {
  title: 'Politique de confidentialité',
  description:
    "Comment Questia traite tes données personnelles, l'usage de l'IA, tes droits RGPD et les moyens d'export ou de suppression.",
  robots: { index: true, follow: true },
};

export default function ConfidentialitePage() {
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
          Politique de confidentialité
        </h1>
        <p className="carnet-rule mt-8 pt-4 text-xs text-[var(--subtle)]">
          Dernière mise à jour : {new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}
          {' · '}
          Site :{' '}
          <a
            href={siteUrl}
            className="text-[var(--link-on-bg)] underline decoration-[color:color-mix(in_srgb,var(--link-on-bg)_35%,transparent)] underline-offset-[0.2em] transition-colors duration-200 hover:text-[var(--text)]"
          >
            {siteUrl}
          </a>
        </p>

        {!legalPublisher.companyName || !legalPublisher.contactEmail ? <IncompleteNotice /> : null}

        <div className="legal-prose mt-12">
          <section>
            <h2>1. Responsable du traitement</h2>
            <p>
              Le responsable du traitement des données personnelles collectées dans le cadre de Questia est l'éditeur du
              service, tel qu'identifié dans les{' '}
              <Link href="/legal/mentions-legales">
                mentions légales
              </Link>
              .
            </p>
            <ul>
              <li>
                <strong>Dénomination :</strong>{' '}
                {legalPublisher.companyName ?? (
                  <span>
                    [À compléter : NEXT_PUBLIC_LEGAL_COMPANY_NAME]
                  </span>
                )}
              </li>
              <li>
                <strong>Adresse :</strong>{' '}
                {legalPublisher.address ? (
                  <span className="whitespace-pre-line">{legalPublisher.address}</span>
                ) : (
                  <span className="text-[var(--muted)]">[À compléter : NEXT_PUBLIC_LEGAL_ADDRESS]</span>
                )}
              </li>
              <li>
                <strong>Contact (données personnelles) :</strong>{' '}
                {legalPublisher.contactEmail ? (
                  <a href={`mailto:${legalPublisher.contactEmail}`}>
                    {legalPublisher.contactEmail}
                  </a>
                ) : (
                  <span className="text-[var(--muted)]">[À compléter : NEXT_PUBLIC_LEGAL_CONTACT_EMAIL]</span>
                )}
              </li>
              <li>
                <strong>Délégué à la protection des données (DPO) :</strong>{' '}
                {legalPublisher.dpoEmail ? (
                  <a href={`mailto:${legalPublisher.dpoEmail}`}>
                    {legalPublisher.dpoEmail}
                  </a>
                ) : (
                  <span>
                    Non désigné — pour toute demande relative à tes données, utilise le contact ci-dessus.
                  </span>
                )}
              </li>
            </ul>
          </section>

          <section>
            <h2>2. Données collectées</h2>
            <p>Nous traitons notamment :</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Compte et authentification</strong> : identifiant technique, adresse e-mail et données fournies
                lors de l'inscription ou de la connexion (via notre prestataire d'authentification Clerk).
              </li>
              <li>
                <strong>Profil de jeu</strong> : préférences d'onboarding (axes explorateur / prudence, personnalité
                déclarée), progression (jour, phase, XP, badges), historique de quêtes, paramètres de rappels et de
                boutique (thèmes, solde de monnaie virtuelle, etc.).
              </li>
              <li>
                <strong>Questionnaire de raffinement</strong> (optionnel) : réponses aux questions pour adapter le ton
                des missions, avec date de consentement lorsque applicable.
              </li>
              <li>
                <strong>Données de localisation</strong> — trois niveaux distincts selon ce que tu autorises :
                <ul className="list-disc pl-5 mt-1 space-y-1">
                  <li>
                    <strong>Géolocalisation par adresse IP</strong> (passive, non demandée explicitement) : ville ou
                    région approximative utilisée pour adapter la météo et le contexte des quêtes. Base légale : intérêt
                    légitime.
                  </li>
                  <li>
                    <strong>GPS / localisation précise — premier plan (foreground)</strong> : coordonnées GPS
                    transmises si tu accordes l'accès à ta position dans l'app ou le navigateur, pour suggérer un lieu
                    public pertinent. Base légale : consentement. Révocable à tout moment dans les paramètres de
                    l'appareil.
                  </li>
                  <li>
                    <strong>Localisation en arrière-plan (background)</strong> : l'application mobile{' '}
                    <strong>ne collecte pas</strong> ta position lorsqu'elle est en arrière-plan. Si cette fonctionnalité
                    était introduite à l'avenir, un consentement explicite séparé serait recueilli.
                  </li>
                </ul>
              </li>
              <li>
                <strong>Notifications</strong> : jetons d'appareil pour les rappels push (mobile), si tu les actives.
              </li>
              <li>
                <strong>Paiements</strong> : références de transaction via notre prestataire de paiement (Stripe) ; nous
                ne stockons pas ton numéro de carte bancaire complet.
              </li>
              <li>
                <strong>Données techniques</strong> : journaux et métadonnées nécessaires à la sécurité et au bon
                fonctionnement du service (adresse IP, horodatage, erreurs), dans les limites du strict nécessaire.
              </li>
            </ul>
          </section>

          <section>
            <h2>3. Finalités et bases légales</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Exécution du contrat</strong> : fournir les quêtes, la progression, la boutique et le compte.
              </li>
              <li>
                <strong>Intérêt légitime</strong> : sécurité, lutte contre la fraude, amélioration du produit,
                statistiques agrégées.
              </li>
              <li>
                <strong>Consentement</strong> : lorsque requis (ex. questionnaire de raffinement, certaines
                notifications marketing si proposées), retirable à tout moment sans affecter la licéité des traitements
                antérieurs.
              </li>
              <li>
                <strong>Obligations légales</strong> : conservation de pièces comptables ou réponses aux autorités
                lorsque la loi l'impose.
              </li>
            </ul>
          </section>

          <section>
            <h2>4. Contenu généré par intelligence artificielle et profilage</h2>
            <p>
              Certaines missions et textes affichés sont <strong>produits par des modèles d'IA</strong> (OpenAI API)
              à partir de ton profil, de ton historique de quêtes et du contexte du jour (météo, lieu). Ce contenu est
              une <strong>suggestion ludique</strong> : il peut parfois être inadapté ou imprécis ; tu restes seul·e
              responsable de tes choix dans la vie réelle. Questia ne fournit pas de conseil médical, psychologique ou
              juridique.
            </p>
            <p>
              <strong>Profilage automatisé (art. 22 RGPD) :</strong> le moteur de Questia analyse tes réponses
              d'onboarding, ton historique de quêtes et tes comportements pour inférer des tendances (phase de parcours,
              intensité préférée, affinités). Cette analyse influence les missions proposées. Elle ne produit{' '}
              <strong>pas de décision juridique ou significative</strong> te concernant ; elle sert uniquement à
              personnaliser l'expérience de jeu. Tu peux consulter le détail du fonctionnement sur la page{' '}
              <Link href="/generation-quetes">
                Comment sont générées tes quêtes
              </Link>
              . En vertu de l'article 21 du RGPD, tu as le droit de{' '}
              <strong>t'opposer à ce profilage</strong> à tout moment en supprimant ton profil ou en contactant le
              support — dans ce cas, les quêtes proposées seront génériques.
            </p>
            <p>
              <strong>Utilisation des données pour l'entraînement des modèles IA :</strong> tes données personnelles
              (profil, historique, comportements) <strong>ne sont pas transmises à OpenAI à des fins d'entraînement
              de modèles</strong>. Questia utilise l'API OpenAI dans le cadre de l'accord de traitement des données
              (DPA) d'OpenAI, qui exclut l'utilisation des données API pour l'amélioration des modèles, sauf opt-in
              explicite de notre part (ce qui n'est pas le cas).
            </p>
            <p>
              Nous appliquons des <strong>garde-fous dans les prompts</strong> (interdiction de contenus dangereux ou
              illégaux, limitation des conseils de santé, pas de collecte de données sensibles via les missions). Ces
              mesures réduisent les risques mais ne garantissent pas un résultat parfait : signale tout contenu
              problématique via le support.
            </p>
            <p>
              Pour le cadre d'usage (ludique, non médical) : voir aussi la page{' '}
              <Link href="/legal/bien-etre">
                Bien-être et limites
              </Link>
              .
            </p>
          </section>

          <section>
            <h2>5. Sous-traitants et transferts hors UE</h2>
            <p>
              Nous faisons appel à des sous-traitants pour opérer le service. Les prestataires situés hors de l'Espace
              économique européen (EEE) sont encadrés par des garanties appropriées au sens de l'article 46 du RGPD
              (clauses contractuelles types de la Commission européenne — SCCs — ou décision d'adéquation).
            </p>
            <div className="overflow-x-auto mt-4">
              <table className="min-w-full text-sm border-collapse">
                <thead>
                  <tr>
                    <th>Prestataire</th>
                    <th>Rôle</th>
                    <th>Pays</th>
                    <th>Garanties</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="py-2 pr-4 font-semibold">OpenAI LLC</td>
                    <td className="py-2 pr-4">Génération des quêtes et textes (API)</td>
                    <td className="py-2 pr-4">États-Unis</td>
                    <td className="py-2">SCCs (Data Processing Agreement OpenAI)</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4 font-semibold">Clerk Inc.</td>
                    <td className="py-2 pr-4">Authentification et gestion des comptes</td>
                    <td className="py-2 pr-4">États-Unis</td>
                    <td className="py-2">SCCs (DPA Clerk)</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4 font-semibold">Stripe Inc.</td>
                    <td className="py-2 pr-4">Traitement des paiements</td>
                    <td className="py-2 pr-4">États-Unis</td>
                    <td className="py-2">SCCs (DPA Stripe) — certifié PCI DSS</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4 font-semibold">Vercel Inc.</td>
                    <td className="py-2 pr-4">Hébergement du site et de l'API</td>
                    <td className="py-2 pr-4">États-Unis</td>
                    <td className="py-2">SCCs (DPA Vercel)</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4 font-semibold">PostHog Inc.</td>
                    <td className="py-2 pr-4">Analyse du produit (opt-in uniquement)</td>
                    <td className="py-2 pr-4">États-Unis</td>
                    <td className="py-2">SCCs (DPA PostHog)</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4 font-semibold">Google LLC</td>
                    <td className="py-2 pr-4">Analytics (GA4 / GTM) — si consentement</td>
                    <td className="py-2 pr-4">États-Unis</td>
                    <td className="py-2">SCCs (DPA Google) — IP anonymisée</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4 font-semibold">Meta Platforms</td>
                    <td className="py-2 pr-4">Publicité / Remarketing — si consentement</td>
                    <td className="py-2 pr-4">États-Unis</td>
                    <td className="py-2">SCCs (DPA Meta)</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="mt-3">
              Tu peux demander une copie des garanties en vigueur en contactant notre service aux données personnelles
              (adresse en section 1).
            </p>
          </section>

          <section>
            <h2>6. Durée de conservation</h2>
            <p>Les données sont conservées selon les durées suivantes :</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Données de compte et de profil de jeu</strong> (e-mail, progression, historique de quêtes,
                préférences) : conservées pendant toute la durée d'activité du compte, puis supprimées ou anonymisées
                dans un délai de <strong>30 jours</strong> suivant la demande de suppression du compte, sauf exception
                technique ou obligation légale.
              </li>
              <li>
                <strong>Données comptables et pièces justificatives de paiement</strong> (références de transaction
                Stripe) : conservées <strong>10 ans</strong> à compter de la date de transaction, conformément aux
                obligations légales de conservation comptable (art. L123-22 du Code de commerce).
              </li>
              <li>
                <strong>Journaux techniques</strong> (logs d'accès, erreurs, horodatages de sécurité) :{' '}
                <strong>90 jours</strong> glissants, puis suppression automatique.
              </li>
              <li>
                <strong>Consentements enregistrés</strong> (cookies, raffinement de profil) :{' '}
                <strong>3 ans</strong> à compter de l'enregistrement, conformément aux recommandations de la CNIL.
              </li>
              <li>
                <strong>Jetons push (notifications)</strong> : supprimés dès la révocation de l'autorisation ou la
                clôture du compte, et au plus tard <strong>6 mois</strong> après le dernier usage actif.
              </li>
            </ul>
            <p>
              À l'expiration de ces durées, les données sont supprimées de manière irréversible ou anonymisées. Ces
              durées peuvent être allongées si une obligation légale, réglementaire ou judiciaire l'impose.
            </p>
          </section>

          <section>
            <h2>7. Tes droits (RGPD)</h2>
            <p>Tu disposes notamment des droits suivants : accès, rectification, effacement, limitation, opposition,
              portabilité, et retrait du consentement lorsqu'il sert de base. Tu peux introduire une réclamation auprès de
              l'autorité de protection des données (en France : la CNIL).</p>
            <p>
              <strong>Export des données</strong> : depuis la page Profil de l'application web connectée, tu peux
              télécharger un fichier JSON regroupant les informations principales liées à ton compte.
            </p>
            <p>
              <strong>Suppression du compte</strong> : la même page permet de demander la suppression définitive de ton
              compte et des données de jeu associées. La suppression du compte d'authentification est également
              effectuée côté prestataire (Clerk), sous réserve de contraintes techniques exceptionnelles (dans ce cas,
              contacte le support).
            </p>
          </section>

          <section id="cookies">
            <h2>8. Cookies et traceurs</h2>
            <p>
              Le site utilise des cookies ou stockages locaux. Un bandeau t'est présenté lors de ta première visite pour
              recueillir ton choix sur les traceurs non essentiels. Conformément à l'article 82 de la loi Informatique
              et Libertés et aux recommandations de la CNIL, aucun cookie non essentiel n'est déposé avant ton accord
              explicite.
            </p>
            <div className="overflow-x-auto mt-4">
              <table className="min-w-full text-sm border-collapse">
                <thead>
                  <tr>
                    <th>Catégorie</th>
                    <th>Finalité</th>
                    <th>Base légale</th>
                    <th>Exemples</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="py-2 pr-4 font-semibold">Essentiels</td>
                    <td className="py-2 pr-4">Session, authentification, préférences de langue, sécurité</td>
                    <td className="py-2 pr-4">Intérêt légitime / Exécution du contrat (art. 6.1.b et 6.1.f RGPD)</td>
                    <td className="py-2">Clerk session, stockage local préférences</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4 font-semibold">Analytiques</td>
                    <td className="py-2 pr-4">Mesure d'audience, amélioration du produit</td>
                    <td className="py-2 pr-4">Consentement (art. 6.1.a RGPD)</td>
                    <td className="py-2">Google Analytics 4, Google Tag Manager, PostHog</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4 font-semibold">Publicitaires</td>
                    <td className="py-2 pr-4">Publicité ciblée, remarketing</td>
                    <td className="py-2 pr-4">Consentement (art. 6.1.a RGPD)</td>
                    <td className="py-2">Meta Pixel, tags configurés dans GTM</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="mt-3">
              Tes choix sont enregistrés localement dans ton navigateur. Tu peux les modifier à tout moment en effaçant
              les données du site ou en contactant le support.
            </p>
          </section>

          <section>
            <h2>9. Mineurs</h2>
            <p>
              L'accès au service est soumis aux conditions d'âge suivantes, conformément à la réglementation applicable :
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Site web questia.fr :</strong> réservé aux personnes âgées d'au moins{' '}
                <strong>15 ans</strong>, conformément à l'article 7-1 de la loi Informatique et Libertés (transposant
                l'article 8 du RGPD en droit français), qui fixe à 15 ans l'âge de consentement numérique pour les
                services de la société de l'information.
              </li>
              <li>
                <strong>Application mobile (App Store / Google Play) :</strong> réservée aux personnes âgées d'au moins{' '}
                <strong>13 ans</strong>, conformément aux règles des plateformes de distribution (Apple App Store, Google
                Play) et aux exigences du Children's Online Privacy Protection Act (COPPA) applicables aux stores.
              </li>
            </ul>
            <p>
              Dans tous les cas, si tu as moins de 18 ans, l'accord d'un parent ou tuteur légal est recommandé avant
              utilisation. Si tu es parent et penses qu'un enfant nous a transmis des données sans ton accord,
              contacte-nous à l'adresse indiquée en section 1 pour en obtenir la suppression.
            </p>
          </section>

          <section>
            <h2>10. Modifications</h2>
            <p>
              Cette politique peut être mise à jour. La date en tête de page indique la dernière révision. En cas de
              changement majeur, nous pourrons t'en informer par un message dans l'app ou par e-mail.
            </p>
          </section>

          <section className="carnet-rule pt-8">
            <h2>Documents associés</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <Link href="/legal/mentions-legales">
                  Mentions légales
                </Link>
              </li>
              <li>
                <Link href="/legal/cgu">
                  Conditions générales d'utilisation
                </Link>
              </li>
              <li>
                <Link href="/legal/cgv">
                  Conditions générales de vente
                </Link>
              </li>
              <li>
                <Link href="/legal/bien-etre">
                  Bien-être et limites d'usage
                </Link>
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
