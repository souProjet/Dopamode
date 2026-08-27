import type { AppLocale, PsychologicalCategory } from '../types';

/**
 * Le Cap : l'objectif long qui donne une direction à la quête du jour.
 *
 * Le reproche auquel ce module répond : une quête quotidienne isolée ne
 * construit rien. Elle est jouée, oubliée, remplacée le lendemain. Le Cap est
 * la colonne vertébrale : un objectif de vie choisi par le joueur, découpé en
 * **jalons**, que les quêtes quotidiennes font avancer.
 *
 * Mécanique :
 *
 * 1. Le joueur choisit un Cap (gratuit, un seul actif à la fois).
 * 2. Le jalon courant **oriente la génération** : ses familles psychologiques
 *    reçoivent un biais fort côté moteur ({@link capCategoryBias}) et son brief
 *    est injecté dans le prompt. La quête du jour devient une étape du Cap.
 * 3. Chaque quête complétée dans une famille du jalon fait avancer le jalon.
 * 4. La **dernière quête d'un jalon est une quête de jalon** : plus longue, plus
 *    ambitieuse ({@link isMilestoneQuestNext}). C'est la « grosse quête ».
 * 5. Jalon franchi → Quest Coins. Cap terminé → titre exclusif + prime.
 *
 * Le Cap ne remplace pas la quête du jour : il lui donne un sens cumulatif.
 * Un joueur sans Cap garde exactement la boucle actuelle.
 */

export interface CapMilestone {
  /** Identifiant stable au sein du Cap. */
  slug: string;
  title: { fr: string; en: string };
  /** Ce que le jalon cherche à installer — affiché au joueur. */
  intent: { fr: string; en: string };
  /** Consigne injectée dans le prompt de génération pendant ce jalon. */
  brief: { fr: string; en: string };
  /** Consigne renforcée pour la quête de jalon (la grosse quête qui referme). */
  milestoneQuestBrief: { fr: string; en: string };
  /** Familles qui comptent pour ce jalon (et qui reçoivent le biais). */
  categories: PsychologicalCategory[];
  /** Nombre de quêtes à valider dans ces familles pour franchir le jalon. */
  questsRequired: number;
  rewardCoins: number;
}

export interface CapDefinition {
  id: string;
  /** Icône Lucide (doit exister dans le registre web). */
  icon: string;
  label: { fr: string; en: string };
  /** La promesse, en une phrase : ce que le joueur vise vraiment. */
  promise: { fr: string; en: string };
  /** Pour qui ce Cap est fait — aide au choix. */
  forWho: { fr: string; en: string };
  milestones: CapMilestone[];
  /** Titre exclusif versé à la complétion (cf. `shop/titles.ts`). */
  rewardTitleId: string;
  /** Prime finale en Quest Coins, en plus des jalons. */
  rewardCoins: number;
}

/* ─── Helpers de fabrication ──────────────────────────────────────────────── */

function ms(
  slug: string,
  titleFr: string,
  titleEn: string,
  intentFr: string,
  intentEn: string,
  briefFr: string,
  briefEn: string,
  bigFr: string,
  bigEn: string,
  categories: PsychologicalCategory[],
  questsRequired: number,
  rewardCoins: number,
): CapMilestone {
  return {
    slug,
    title: { fr: titleFr, en: titleEn },
    intent: { fr: intentFr, en: intentEn },
    brief: { fr: briefFr, en: briefEn },
    milestoneQuestBrief: { fr: bigFr, en: bigEn },
    categories,
    questsRequired,
    rewardCoins,
  };
}

/** Progression type d'un Cap : 3 → 3 → 4 → 4 = 14 quêtes, environ trois semaines. */
const MS_COINS = [40, 60, 80, 120] as const;

/* ─── Catalogue ───────────────────────────────────────────────────────────── */

export const CAPS_REGISTRY: Record<string, CapDefinition> = {
  reprendre_corps: {
    id: 'reprendre_corps',
    icon: 'Mountain',
    label: { fr: 'Reprendre corps', en: 'Back in your body' },
    promise: {
      fr: 'Sortir du mode « tête seule » et redevenir quelqu\'un qui habite son corps.',
      en: 'Get out of head-only mode and become someone who inhabits their body again.',
    },
    forWho: {
      fr: 'Pour toi si tu passes tes journées assis·e et que ton corps est devenu un moyen de transport.',
      en: 'For you if you sit all day and your body has become a means of transport.',
    },
    milestones: [
      ms(
        'bouger_un_peu',
        'Remettre en marche',
        'Get moving',
        'Réhabituer le corps à l\'effort simple, sans performance.',
        'Get the body used to simple effort again, no performance.',
        'Le joueur veut renouer avec son corps. Propose un effort physique court, simple, sans matériel ni salle de sport, faisable aujourd\'hui.',
        'The user wants to reconnect with their body. Propose a short, simple physical effort, no gear or gym, doable today.',
        'QUÊTE DE JALON : une sortie physique nettement plus longue que d\'habitude (marche, montée, parcours). Elle doit se sentir comme un petit exploit, pas comme une contrainte.',
        'MILESTONE QUEST: a physical outing clearly longer than usual (walk, climb, route). It should feel like a small feat, not a chore.',
        ['physical_existential', 'spatial_adventure'],
        3,
        MS_COINS[0],
      ),
      ms(
        'tenir_le_rythme',
        'Tenir le rythme',
        'Hold the rhythm',
        'Passer de l\'élan ponctuel à quelque chose qui revient.',
        'Move from a one-off burst to something that comes back.',
        'Le joueur installe une régularité physique. Propose une action qui a du sens répétée, ancrée dans un moment précis de la journée.',
        'The user is building physical regularity. Propose an action that makes sense repeated, anchored to a precise moment of the day.',
        'QUÊTE DE JALON : un rendez-vous physique avec soi-même, à une heure choisie, plus exigeant que les précédents. Le corps doit sentir qu\'il a travaillé.',
        'MILESTONE QUEST: a physical appointment with yourself, at a chosen hour, more demanding than the previous ones. The body should feel it worked.',
        ['physical_existential', 'async_discipline'],
        3,
        MS_COINS[1],
      ),
      ms(
        'sortir_du_connu',
        'Sortir du connu',
        'Leave the known',
        'Emmener ce corps ailleurs que sur les trajets habituels.',
        'Take this body somewhere other than the usual routes.',
        'Le joueur a retrouvé une base physique. Propose un déplacement physique dans un endroit qu\'il ne fréquente pas : dénivelé, distance, terrain inhabituel.',
        'The user has rebuilt a physical base. Propose a physical outing somewhere they do not go: elevation, distance, unusual ground.',
        'QUÊTE DE JALON : une vraie expédition à l\'échelle de sa ville ou de sa région. Plusieurs heures, un point d\'arrivée précis, quelque chose à raconter le soir.',
        'MILESTONE QUEST: a real expedition at the scale of their city or region. Several hours, a precise destination, something worth telling that evening.',
        ['spatial_adventure', 'physical_existential'],
        4,
        MS_COINS[2],
      ),
      ms(
        'assumer_le_corps',
        'Assumer',
        'Own it',
        'Faire exister ce corps devant les autres, sans se cacher.',
        'Let this body exist in front of others, without hiding.',
        'Le joueur est en forme et le sait. Propose une action physique qui se passe sous le regard des autres, sans exhibition ni compétition.',
        'The user is fit and knows it. Propose a physical action that happens in view of others, without showing off or competing.',
        'QUÊTE DE JALON : un engagement physique public — un cours, un groupe, un événement, une distance annoncée à quelqu\'un. Il faut que ce soit vu.',
        'MILESTONE QUEST: a public physical commitment - a class, a group, an event, a distance announced to someone. It has to be witnessed.',
        ['physical_existential', 'public_introspection'],
        4,
        MS_COINS[3],
      ),
    ],
    rewardTitleId: 'cap_corps_retrouve',
    rewardCoins: 200,
  },

  habiter_sa_ville: {
    id: 'habiter_sa_ville',
    icon: 'MapPin',
    label: { fr: 'Habiter sa ville', en: 'Inhabit your city' },
    promise: {
      fr: 'Arrêter de traverser sa ville pour commencer à y vivre.',
      en: 'Stop crossing your city and start living in it.',
    },
    forWho: {
      fr: 'Pour toi si tu fais les mêmes trois trajets depuis des années et que le reste est une carte blanche.',
      en: 'For you if you have made the same three trips for years and the rest is a blank map.',
    },
    milestones: [
      ms(
        'lever_les_yeux',
        'Lever les yeux',
        'Look up',
        'Voir ce qui est déjà là, sur les trajets connus.',
        'See what is already there, on the routes you know.',
        'Le joueur redécouvre son quartier. Propose une observation précise sur un trajet qu\'il fait déjà : détail architectural, commerce, passage, son.',
        'The user is rediscovering their neighborhood. Propose a precise observation on a route they already take: architectural detail, shop, passageway, sound.',
        'QUÊTE DE JALON : parcourir son quartier autrement — un itinéraire choisi qui traverse des rues jamais empruntées, avec un but à atteindre.',
        'MILESTONE QUEST: walk the neighborhood differently - a chosen route through streets never taken, with a goal to reach.',
        ['spatial_adventure', 'public_introspection'],
        3,
        MS_COINS[0],
      ),
      ms(
        'pousser_la_porte',
        'Pousser la porte',
        'Push the door',
        'Entrer dans les lieux devant lesquels on passe.',
        'Walk into the places you walk past.',
        'Le joueur ose entrer quelque part. Propose de franchir le seuil d\'un lieu public qu\'il n\'a jamais visité, avec une raison simple d\'y être.',
        'The user is daring to walk in somewhere. Propose crossing the threshold of a public place they have never entered, with a simple reason to be there.',
        'QUÊTE DE JALON : passer une vraie tranche de temps dans un lieu inconnu de sa ville — s\'y installer, y faire quelque chose, ne pas juste jeter un œil.',
        'MILESTONE QUEST: spend a real stretch of time in an unknown place in their city - settle in, do something there, not just peek.',
        ['spatial_adventure', 'exploratory_sociability'],
        3,
        MS_COINS[1],
      ),
      ms(
        'parler_au_quartier',
        'Parler au quartier',
        'Talk to the neighborhood',
        'Passer de décor à voisinage : des visages, des noms.',
        'Turn scenery into a neighborhood: faces, names.',
        'Le joueur veut connaître les gens de son quartier. Propose un échange court et concret avec quelqu\'un qui y travaille ou y vit.',
        'The user wants to know the people in their neighborhood. Propose a short, concrete exchange with someone who works or lives there.',
        'QUÊTE DE JALON : une vraie conversation avec une personne du quartier — apprendre son métier, son histoire, sa vue sur le coin.',
        'MILESTONE QUEST: a real conversation with someone from the neighborhood - learn their trade, their story, their view of the area.',
        ['exploratory_sociability', 'active_empathy'],
        4,
        MS_COINS[2],
      ),
      ms(
        'sortir_du_perimetre',
        'Sortir du périmètre',
        'Leave the perimeter',
        'Aller là où la ville s\'arrête d\'être familière.',
        'Go where the city stops being familiar.',
        'Le joueur élargit sa carte. Propose une exploration d\'un quartier ou d\'une commune limitrophe où il ne va jamais.',
        'The user is widening their map. Propose exploring a district or neighboring town they never go to.',
        'QUÊTE DE JALON : une journée d\'exploration à l\'autre bout de sa ville ou de son agglomération, avec un objectif précis à rapporter.',
        'MILESTONE QUEST: a day of exploration on the far side of their city or metro area, with a precise objective to bring back.',
        ['spatial_adventure', 'exploratory_sociability'],
        4,
        MS_COINS[3],
      ),
    ],
    rewardTitleId: 'cap_arpenteur_urbain',
    rewardCoins: 200,
  },

  sortir_de_sa_bulle: {
    id: 'sortir_de_sa_bulle',
    icon: 'Users',
    label: { fr: 'Sortir de sa bulle', en: 'Out of your bubble' },
    promise: {
      fr: 'Redevenir quelqu\'un à qui il arrive des choses avec des gens.',
      en: 'Become someone things happen to, with other people.',
    },
    forWho: {
      fr: 'Pour toi si tes semaines se passent entre le travail et chez toi, et que ça pèse.',
      en: 'For you if your weeks run between work and home, and it weighs on you.',
    },
    milestones: [
      ms(
        'briser_le_silence',
        'Briser le silence',
        'Break the silence',
        'Retrouver le réflexe d\'adresser la parole.',
        'Get back the reflex of speaking to someone.',
        'Le joueur réapprend à parler aux inconnus. Propose un échange bref, à faible enjeu, avec une personne croisée dans la journée.',
        'The user is relearning to talk to strangers. Propose a brief, low-stakes exchange with someone crossed during the day.',
        'QUÊTE DE JALON : engager une conversation qui dure — pas une politesse, un vrai échange de plusieurs minutes avec quelqu\'un qu\'il ne connaît pas.',
        'MILESTONE QUEST: start a conversation that lasts - not a pleasantry, a real several-minute exchange with someone they do not know.',
        ['exploratory_sociability', 'hostile_immersion'],
        3,
        MS_COINS[0],
      ),
      ms(
        'aller_vers',
        'Aller vers',
        'Go toward',
        'Ne plus attendre d\'être invité·e.',
        'Stop waiting to be invited.',
        'Le joueur prend l\'initiative. Propose de proposer quelque chose à quelqu\'un : un moment, un lieu, une activité, sans grande organisation.',
        'The user is taking initiative. Propose that they offer something to someone: a moment, a place, an activity, without heavy planning.',
        'QUÊTE DE JALON : organiser un vrai moment avec quelqu\'un — fixer une date, un lieu, et le tenir.',
        'MILESTONE QUEST: organize a real moment with someone - set a date, a place, and hold to it.',
        ['exploratory_sociability', 'relational_vulnerability'],
        3,
        MS_COINS[1],
      ),
      ms(
        'entrer_dans_un_groupe',
        'Entrer dans un groupe',
        'Join a group',
        'Exister dans un collectif, pas seulement en tête-à-tête.',
        'Exist in a group, not only one-to-one.',
        'Le joueur affronte le collectif. Propose une situation où il y a plusieurs personnes déjà là, et où il faut trouver sa place.',
        'The user is facing the group. Propose a situation where several people are already there and they must find their place.',
        'QUÊTE DE JALON : rejoindre un groupe constitué — un club, un atelier, une soirée, une équipe — et y rester assez longtemps pour être reconnu·e.',
        'MILESTONE QUEST: join an established group - a club, a workshop, an evening, a team - and stay long enough to be recognized.',
        ['hostile_immersion', 'exploratory_sociability'],
        4,
        MS_COINS[2],
      ),
      ms(
        'devenir_le_lien',
        'Devenir le lien',
        'Become the link',
        'Passer d\'invité à celui ou celle qui rassemble.',
        'Go from guest to the one who brings people together.',
        'Le joueur devient organisateur. Propose une action où c\'est lui qui réunit, présente ou accueille quelqu\'un.',
        'The user becomes the organizer. Propose an action where they are the one gathering, introducing or welcoming someone.',
        'QUÊTE DE JALON : réunir plusieurs personnes autour de quelque chose qu\'il a initié. Ce sont les autres qui doivent se déplacer.',
        'MILESTONE QUEST: gather several people around something they initiated. The others are the ones who travel.',
        ['exploratory_sociability', 'spontaneous_altruism'],
        4,
        MS_COINS[3],
      ),
    ],
    rewardTitleId: 'cap_tisseur_de_liens',
    rewardCoins: 200,
  },

  reprendre_son_attention: {
    id: 'reprendre_son_attention',
    icon: 'Brain',
    label: { fr: 'Reprendre son attention', en: 'Take back your attention' },
    promise: {
      fr: 'Redevenir capable de rester sur une seule chose sans fuir.',
      en: 'Become able to stay on one thing without fleeing.',
    },
    forWho: {
      fr: 'Pour toi si tes soirées disparaissent sans que tu saches où, et que ta concentration s\'est effritée.',
      en: 'For you if your evenings vanish without a trace and your focus has crumbled.',
    },
    milestones: [
      ms(
        'voir_la_fuite',
        'Voir la fuite',
        'See the escape',
        'Constater où part l\'attention, sans se juger.',
        'Notice where attention goes, without judging.',
        'Le joueur observe ses propres échappatoires. Propose une action de constat concret sur son rapport aux écrans ou aux distractions, aujourd\'hui.',
        'The user is observing their own escape routes. Propose a concrete observation of their relationship with screens or distractions, today.',
        'QUÊTE DE JALON : une plage de temps significative entièrement sans écran, avec quelque chose de précis à faire à la place.',
        'MILESTONE QUEST: a significant stretch of time entirely screen-free, with something precise to do instead.',
        ['dopamine_detox', 'public_introspection'],
        3,
        MS_COINS[0],
      ),
      ms(
        'retrouver_le_vide',
        'Retrouver le vide',
        'Find the empty space',
        'Supporter de ne rien faire sans combler.',
        'Tolerate doing nothing without filling it.',
        'Le joueur réapprend l\'ennui. Propose un moment volontairement vide, sensoriel plutôt que productif.',
        'The user is relearning boredom. Propose a deliberately empty moment, sensory rather than productive.',
        'QUÊTE DE JALON : une longue plage d\'immobilité ou de silence choisi, quelque part où il ne se passe rien.',
        'MILESTONE QUEST: a long stretch of chosen stillness or silence, somewhere nothing happens.',
        ['sensory_deprivation', 'dopamine_detox'],
        3,
        MS_COINS[1],
      ),
      ms(
        'tenir_une_chose',
        'Tenir une chose',
        'Hold one thing',
        'Aller au bout d\'une seule tâche, sans onglet parallèle.',
        'Finish a single task, with no parallel tab.',
        'Le joueur travaille sa concentration. Propose une tâche unique menée jusqu\'au bout, dans un cadre défini, sans interruption.',
        'The user is training focus. Propose a single task carried to completion, in a defined frame, uninterrupted.',
        'QUÊTE DE JALON : une session longue et ininterrompue sur une chose qui compte pour lui, avec un résultat visible à la fin.',
        'MILESTONE QUEST: a long uninterrupted session on something that matters to them, with a visible result at the end.',
        ['async_discipline', 'dopamine_detox'],
        4,
        MS_COINS[2],
      ),
      ms(
        'choisir_son_rythme',
        'Choisir son rythme',
        'Choose your rhythm',
        'Décider de ses journées au lieu de les subir.',
        'Decide your days instead of enduring them.',
        'Le joueur reprend la main sur son temps. Propose une action qui structure sa journée : un horaire tenu, un rituel installé, une limite posée.',
        'The user is taking back their time. Propose an action that structures their day: an hour held to, a ritual set, a boundary drawn.',
        'QUÊTE DE JALON : concevoir et tenir une journée entière selon un rythme qu\'il a décidé à l\'avance.',
        'MILESTONE QUEST: design and hold to a full day following a rhythm they decided in advance.',
        ['async_discipline', 'temporal_projection'],
        4,
        MS_COINS[3],
      ),
    ],
    rewardTitleId: 'cap_esprit_clair',
    rewardCoins: 200,
  },

  reparer_ses_liens: {
    id: 'reparer_ses_liens',
    icon: 'Heart',
    label: { fr: 'Réparer ses liens', en: 'Mend your ties' },
    promise: {
      fr: 'Reprendre soin des gens qui comptent avant que la distance s\'installe.',
      en: 'Take care of the people who matter before distance settles in.',
    },
    forWho: {
      fr: 'Pour toi si tu penses souvent à quelqu\'un sans jamais lui écrire.',
      en: 'For you if you often think about someone and never write to them.',
    },
    milestones: [
      ms(
        'reprendre_contact',
        'Reprendre contact',
        'Reach back out',
        'Rouvrir les portes qu\'on a laissées se fermer.',
        'Reopen the doors you let close.',
        'Le joueur renoue avec ses proches. Propose un geste de contact simple et sincère vers quelqu\'un qu\'il a laissé filer.',
        'The user is reconnecting with close ones. Propose a simple, sincere gesture toward someone they let drift.',
        'QUÊTE DE JALON : un vrai appel ou une vraie visite à quelqu\'un perdu de vue, pas un message.',
        'MILESTONE QUEST: a real call or a real visit to someone out of touch, not a message.',
        ['relational_vulnerability', 'active_empathy'],
        3,
        MS_COINS[0],
      ),
      ms(
        'ecouter_vraiment',
        'Écouter vraiment',
        'Really listen',
        'Donner de l\'attention, pas seulement de la présence.',
        'Give attention, not just presence.',
        'Le joueur travaille son écoute. Propose une situation où il doit poser des questions et laisser l\'autre parler, sans ramener à soi.',
        'The user is working on listening. Propose a situation where they must ask questions and let the other speak, without steering back to themselves.',
        'QUÊTE DE JALON : une conversation longue où il découvre quelque chose qu\'il ignorait sur un proche.',
        'MILESTONE QUEST: a long conversation where they learn something they did not know about someone close.',
        ['active_empathy', 'relational_vulnerability'],
        3,
        MS_COINS[1],
      ),
      ms(
        'dire_ce_qui_compte',
        'Dire ce qui compte',
        'Say what matters',
        'Sortir les phrases qu\'on repousse depuis des années.',
        'Say the sentences you have postponed for years.',
        'Le joueur ose la sincérité. Propose de formuler à quelqu\'un une chose vraie et bienveillante qu\'il n\'a jamais dite.',
        'The user is daring sincerity. Propose that they tell someone one true, kind thing they have never said.',
        'QUÊTE DE JALON : dire en face, à la personne concernée, ce qu\'il repousse depuis longtemps.',
        'MILESTONE QUEST: say to that person\'s face what they have long postponed.',
        ['relational_vulnerability', 'public_introspection'],
        4,
        MS_COINS[2],
      ),
      ms(
        'prendre_soin',
        'Prendre soin',
        'Take care',
        'Devenir quelqu\'un sur qui on peut compter.',
        'Become someone others can count on.',
        'Le joueur se rend utile aux siens. Propose un geste concret qui soulage ou fait plaisir à quelqu\'un, sans rien attendre en retour.',
        'The user is making themselves useful. Propose a concrete gesture that relieves or pleases someone, expecting nothing back.',
        'QUÊTE DE JALON : consacrer une part réelle de son temps à aider quelqu\'un, sur quelque chose qui compte pour cette personne.',
        'MILESTONE QUEST: devote a real share of their time to helping someone, on something that matters to that person.',
        ['spontaneous_altruism', 'unconditional_service'],
        4,
        MS_COINS[3],
      ),
    ],
    rewardTitleId: 'cap_gardien_des_liens',
    rewardCoins: 200,
  },

  laisser_une_trace: {
    id: 'laisser_une_trace',
    icon: 'Sprout',
    label: { fr: 'Laisser une trace', en: 'Leave a mark' },
    promise: {
      fr: 'Faire exister quelque chose qui te survive à la semaine.',
      en: 'Make something exist that outlives your week.',
    },
    forWho: {
      fr: 'Pour toi si tu consommes beaucoup et ne produis rien, et que ça te travaille.',
      en: 'For you if you consume a lot and produce nothing, and it nags at you.',
    },
    milestones: [
      ms(
        'commencer_quelque_chose',
        'Commencer',
        'Begin',
        'Sortir de l\'intention et poser un premier objet.',
        'Move past intention and put down a first object.',
        'Le joueur veut créer. Propose une première production concrète et modeste, terminée aujourd\'hui : un texte, une image, un objet, un enregistrement.',
        'The user wants to create. Propose a first concrete, modest production, finished today: a text, an image, an object, a recording.',
        'QUÊTE DE JALON : une création qui demande plusieurs heures et qui existe encore demain.',
        'MILESTONE QUEST: a creation that takes several hours and still exists tomorrow.',
        ['temporal_projection', 'async_discipline'],
        3,
        MS_COINS[0],
      ),
      ms(
        'montrer',
        'Montrer',
        'Show it',
        'Faire sortir ce qu\'on fabrique du tiroir.',
        'Get what you make out of the drawer.',
        'Le joueur expose son travail. Propose de faire voir ce qu\'il produit à au moins une personne réelle, et d\'écouter le retour.',
        'The user is showing their work. Propose showing what they produce to at least one real person, and listening to the feedback.',
        'QUÊTE DE JALON : montrer son travail à plusieurs personnes ou publiquement, et assumer la réaction.',
        'MILESTONE QUEST: show their work to several people or publicly, and own the reaction.',
        ['public_introspection', 'temporal_projection'],
        3,
        MS_COINS[1],
      ),
      ms(
        'transmettre',
        'Transmettre',
        'Pass it on',
        'Donner à quelqu\'un ce qu\'on sait faire.',
        'Give someone what you know how to do.',
        'Le joueur transmet. Propose d\'apprendre concrètement quelque chose à quelqu\'un, ou de rendre un savoir utilisable par un autre.',
        'The user is passing on. Propose teaching someone something concrete, or making a skill usable by another.',
        'QUÊTE DE JALON : accompagner vraiment quelqu\'un sur une durée, jusqu\'à ce qu\'il sache faire seul.',
        'MILESTONE QUEST: genuinely walk someone through it over time, until they can do it alone.',
        ['unconditional_service', 'active_empathy'],
        4,
        MS_COINS[2],
      ),
      ms(
        'inscrire',
        'Inscrire',
        'Make it stick',
        'Laisser quelque chose qui continue sans toi.',
        'Leave something that keeps going without you.',
        'Le joueur vise la durée. Propose une action dont l\'effet persiste après lui : un lieu amélioré, un objet donné, une ressource laissée.',
        'The user is aiming for permanence. Propose an action whose effect outlasts them: a place improved, an object given, a resource left behind.',
        'QUÊTE DE JALON : mener à terme quelque chose qui restera utile à d\'autres quand il ne sera plus là pour l\'entretenir.',
        'MILESTONE QUEST: complete something that will stay useful to others when they are no longer there to maintain it.',
        ['unconditional_service', 'temporal_projection'],
        4,
        MS_COINS[3],
      ),
    ],
    rewardTitleId: 'cap_batisseur',
    rewardCoins: 200,
  },
};

export const CAP_IDS: string[] = Object.keys(CAPS_REGISTRY);

export function getCap(id: string | null | undefined): CapDefinition | undefined {
  return id == null ? undefined : CAPS_REGISTRY[id];
}

/* ─── État joueur ─────────────────────────────────────────────────────────── */

export interface ActiveCap {
  capId: string;
  /** Date ISO (YYYY-MM-DD) de démarrage. */
  startedAt: string;
  /** Index du jalon en cours dans `milestones`. */
  milestoneIndex: number;
  /** Quêtes déjà validées dans le jalon en cours. */
  progress: number;
}

export interface CapState {
  active: ActiveCap | null;
  /** Caps déjà terminés (ids), pour l'historique et le rejeu. */
  completed: string[];
}

export const EMPTY_CAP_STATE: CapState = Object.freeze({ active: null, completed: [] });

/** Lecture défensive de la colonne JSON `capState`. */
export function parseCapState(raw: unknown): CapState {
  if (raw == null || typeof raw !== 'object') return { active: null, completed: [] };
  const o = raw as { active?: unknown; completed?: unknown };
  const completed = Array.isArray(o.completed)
    ? o.completed.filter((v): v is string => typeof v === 'string' && CAPS_REGISTRY[v] != null)
    : [];

  const a = o.active;
  if (a == null || typeof a !== 'object') return { active: null, completed };
  const rec = a as Record<string, unknown>;
  const capId = typeof rec.capId === 'string' ? rec.capId : null;
  const cap = getCap(capId);
  if (!capId || !cap) return { active: null, completed };

  const milestoneIndex = Math.min(
    Math.max(0, Math.floor(Number(rec.milestoneIndex) || 0)),
    cap.milestones.length - 1,
  );
  const required = cap.milestones[milestoneIndex]!.questsRequired;
  const progress = Math.min(Math.max(0, Math.floor(Number(rec.progress) || 0)), required);

  return {
    active: {
      capId,
      startedAt: typeof rec.startedAt === 'string' ? rec.startedAt : '',
      milestoneIndex,
      progress,
    },
    completed,
  };
}

export function currentMilestone(state: CapState): CapMilestone | null {
  const cap = getCap(state.active?.capId);
  if (!cap || !state.active) return null;
  return cap.milestones[state.active.milestoneIndex] ?? null;
}

/**
 * Une quête compte pour le Cap si elle tombe dans une famille du jalon courant.
 * La sélection est biaisée, jamais forcée : certains jours la quête ne compte
 * pas, et c'est voulu (la variété prime sur la ligne droite).
 */
export function questCountsForCap(state: CapState, category: string | null | undefined): boolean {
  const ms = currentMilestone(state);
  if (!ms || !category) return false;
  return (ms.categories as string[]).includes(category);
}

/**
 * La prochaine quête utile au jalon est-elle la quête de jalon ?
 * Vrai quand il ne manque plus qu'une validation pour refermer le jalon.
 */
export function isMilestoneQuestNext(state: CapState): boolean {
  const ms = currentMilestone(state);
  if (!ms || !state.active) return false;
  return state.active.progress === ms.questsRequired - 1;
}

/** Biais catégoriel appliqué au moteur de sélection pendant le jalon courant. */
export const CAP_CATEGORY_BIAS = 0.22;

export function capCategoryBias(
  state: CapState,
): Partial<Record<PsychologicalCategory, number>> {
  const ms = currentMilestone(state);
  if (!ms) return {};
  const out: Partial<Record<PsychologicalCategory, number>> = {};
  for (const cat of ms.categories) out[cat] = CAP_CATEGORY_BIAS;
  return out;
}

/** Plancher de durée d'une quête de jalon, en minutes. */
export const MILESTONE_QUEST_FLOOR_MINUTES = 60;
/** Plafond au-delà duquel on n'allonge plus une quête de jalon, en minutes. */
export const MILESTONE_QUEST_CEILING_MINUTES = 180;

/**
 * Durée cible d'une quête de jalon : nettement plus ample qu'une étape, sans
 * jamais devenir absurde ni sortir des bornes choisies par le joueur.
 * Si sa cible habituelle dépasse déjà le plafond, on n'y touche pas.
 */
export function milestoneQuestIdealDuration(idealMinutes: number, dMaxMinutes: number): number {
  const stretched = Math.round(Math.max(idealMinutes * 1.5, MILESTONE_QUEST_FLOOR_MINUTES) / 5) * 5;
  return Math.min(
    stretched,
    dMaxMinutes,
    Math.max(idealMinutes, MILESTONE_QUEST_CEILING_MINUTES),
  );
}

/* ─── Progression ─────────────────────────────────────────────────────────── */

export interface CapAdvance {
  /** Nouvel état à persister. */
  state: CapState;
  /** La quête validée comptait-elle pour le Cap ? */
  counted: boolean;
  /** Jalon refermé par cette validation (null sinon). */
  milestoneCompleted: CapMilestone | null;
  /** Cap terminé par cette validation. */
  capCompleted: CapDefinition | null;
  /** Quest Coins à verser (jalon + prime finale). */
  coins: number;
  /** Titre à ajouter à `ownedTitleIds` (null si aucun). */
  titleId: string | null;
}

/**
 * Fait avancer le Cap après une quête validée. Fonction pure : l'appelant
 * persiste `state` et applique `coins` / `titleId`.
 */
export function advanceCapOnCompletion(
  state: CapState,
  category: string | null | undefined,
): CapAdvance {
  const noop: CapAdvance = {
    state,
    counted: false,
    milestoneCompleted: null,
    capCompleted: null,
    coins: 0,
    titleId: null,
  };

  const cap = getCap(state.active?.capId);
  if (!cap || !state.active) return noop;
  if (!questCountsForCap(state, category)) return noop;

  const milestone = cap.milestones[state.active.milestoneIndex]!;
  const progress = state.active.progress + 1;

  if (progress < milestone.questsRequired) {
    return {
      state: { ...state, active: { ...state.active, progress } },
      counted: true,
      milestoneCompleted: null,
      capCompleted: null,
      coins: 0,
      titleId: null,
    };
  }

  // Jalon refermé.
  const nextIndex = state.active.milestoneIndex + 1;
  if (nextIndex < cap.milestones.length) {
    return {
      state: {
        ...state,
        active: { ...state.active, milestoneIndex: nextIndex, progress: 0 },
      },
      counted: true,
      milestoneCompleted: milestone,
      capCompleted: null,
      coins: milestone.rewardCoins,
      titleId: null,
    };
  }

  // Dernier jalon : le Cap est terminé.
  return {
    state: {
      active: null,
      completed: state.completed.includes(cap.id)
        ? state.completed
        : [...state.completed, cap.id],
    },
    counted: true,
    milestoneCompleted: milestone,
    capCompleted: cap,
    coins: milestone.rewardCoins + cap.rewardCoins,
    titleId: cap.rewardTitleId,
  };
}

/** Démarrage d'un Cap. Un seul actif à la fois : le précédent est abandonné. */
export function startCap(state: CapState, capId: string, todayIso: string): CapState | null {
  if (!CAPS_REGISTRY[capId]) return null;
  return {
    active: { capId, startedAt: todayIso, milestoneIndex: 0, progress: 0 },
    completed: state.completed,
  };
}

/** Abandon : la progression du Cap courant est perdue. */
export function abandonCap(state: CapState): CapState {
  return { active: null, completed: state.completed };
}

/* ─── Affichage ───────────────────────────────────────────────────────────── */

export interface CapProgressView {
  capId: string;
  label: string;
  promise: string;
  icon: string;
  milestoneIndex: number;
  milestoneCount: number;
  milestoneTitle: string;
  milestoneIntent: string;
  progress: number;
  questsRequired: number;
  /** Avancement global 0-100 sur l'ensemble des jalons. */
  overallPercent: number;
  /** La prochaine quête utile sera la quête de jalon. */
  milestoneQuestNext: boolean;
  /** Familles qui font avancer le jalon (libellés bruts, à traduire côté UI). */
  categories: PsychologicalCategory[];
  rewardTitleId: string;
}

export function capProgressView(state: CapState, locale: AppLocale = 'fr'): CapProgressView | null {
  const cap = getCap(state.active?.capId);
  const ms = currentMilestone(state);
  if (!cap || !ms || !state.active) return null;

  const totalRequired = cap.milestones.reduce((n, m) => n + m.questsRequired, 0);
  const done =
    cap.milestones
      .slice(0, state.active.milestoneIndex)
      .reduce((n, m) => n + m.questsRequired, 0) + state.active.progress;

  return {
    capId: cap.id,
    label: cap.label[locale],
    promise: cap.promise[locale],
    icon: cap.icon,
    milestoneIndex: state.active.milestoneIndex,
    milestoneCount: cap.milestones.length,
    milestoneTitle: ms.title[locale],
    milestoneIntent: ms.intent[locale],
    progress: state.active.progress,
    questsRequired: ms.questsRequired,
    overallPercent: totalRequired > 0 ? Math.round((done / totalRequired) * 100) : 0,
    milestoneQuestNext: isMilestoneQuestNext(state),
    categories: ms.categories,
    rewardTitleId: cap.rewardTitleId,
  };
}

/** Résumé catalogue pour l'écran de choix. */
export interface CapCatalogEntry {
  id: string;
  icon: string;
  label: string;
  promise: string;
  forWho: string;
  milestoneTitles: string[];
  totalQuests: number;
  totalCoins: number;
  rewardTitleId: string;
  completed: boolean;
  active: boolean;
}

export function capCatalog(state: CapState, locale: AppLocale = 'fr'): CapCatalogEntry[] {
  return CAP_IDS.map((id) => {
    const cap = CAPS_REGISTRY[id]!;
    return {
      id,
      icon: cap.icon,
      label: cap.label[locale],
      promise: cap.promise[locale],
      forWho: cap.forWho[locale],
      milestoneTitles: cap.milestones.map((m) => m.title[locale]),
      totalQuests: cap.milestones.reduce((n, m) => n + m.questsRequired, 0),
      totalCoins: cap.milestones.reduce((n, m) => n + m.rewardCoins, 0) + cap.rewardCoins,
      rewardTitleId: cap.rewardTitleId,
      completed: state.completed.includes(id),
      active: state.active?.capId === id,
    };
  });
}
