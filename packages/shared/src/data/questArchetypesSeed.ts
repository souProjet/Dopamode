import type { QuestModel } from '../types';

/**
 * Archétype seed — SOURCE UNIQUE en TypeScript.
 *
 * Utilisation :
 *  - Seed Prisma (`apps/web/prisma/seed-archetypes.ts`) : upsert initial de la table
 *    `quest_archetypes`. Après le premier seed, la BDD est canonique — la taxonomie
 *    en prod est éditée via l'UI admin (`/api/admin/quest-archetypes`), pas ce
 *    fichier. Ce seed ne sert qu'à amorcer un environnement vide.
 *  - Fixtures de tests (`test-fixtures/`) : `TEST_QUEST_TAXONOMY` (sous-ensemble)
 *    et `FULL_QUEST_TAXONOMY` (total) sont dérivés de ce seed, pour éviter toute
 *    divergence silencieuse entre prod et tests.
 *
 * Règles éditoriales :
 *  - Une quête engage quelque chose. Ce qui ne coûte rien (respirer trois minutes,
 *    ranger un tiroir, tenir une porte) n'a pas sa place ici : c'est un rappel, pas
 *    une quête. Plancher à 15 minutes, plafond à 240.
 *  - `minimumDurationMinutes` mesure la fenêtre d'engagement, pas le chronomètre.
 *    Dire non sans s'excuser prend cinq secondes au chrono et se paie toute la journée.
 *  - `comfortLevel` mesure la friction réelle, pas la durée. Le moteur mappe
 *    calibration → low/moderate, expansion → moderate/high, rupture → high/extreme :
 *    une famille sans `high` disparaît du jeu passé le jour 11.
 *  - Chaque entrée porte une instruction concrète en plusieurs temps et un geste de
 *    clôture. Pas de consigne vague (« faire une chose qui te fait peur »).
 *  - `fallbackQuestId` pointe vers une version de repli de la même famille, plus
 *    douce et plus courte. Le moteur ne le lit pas (le repli réel est
 *    `fallbackArchetypePool`) : il sert de garde-fou éditorial, exposé en admin.
 *
 * Révision des `targetTraits` :
 *  - Inclut `thrillSeeking` et `boredomSusceptibility` (cf. `QuestModel.targetTraits`)
 *    car ce sont souvent les meilleurs discriminants intra-catégorie.
 *  - Valeurs étagées selon `comfortLevel` pour différencier les archétypes d'une même
 *    catégorie (sinon l'affinity score est quasi constant à l'intérieur d'une catégorie).
 *  - Cohérents avec `ACTIVITY_PERSONALITY_CORRELATION` (aucun target haut contre
 *    une corrélation fortement négative — et inversement).
 */
export const QUEST_ARCHETYPES_SEED_FALLBACK_ID = 9;

export const QUEST_ARCHETYPES_SEED: QuestModel[] = [
  // ── spatial_adventure ───────────────────────────────────────────────────────
  {
    id: 1,
    title: 'Le Voyage Aléatoire',
    description:
      "Aller à la gare sans destination. Prendre un billet pour la ville dont le nom te dit le moins quelque chose. Passer l'après-midi sur place sans chercher les lieux touristiques, puis rentrer en ayant noté trois choses que tu n'aurais jamais vues autrement.",
    titleEn: 'The Random Journey',
    descriptionEn:
      'Go to the station with no destination. Buy a ticket to the town whose name means the least to you. Spend the afternoon there without looking up the sights, then head home having noted three things you would never have seen otherwise.',
    category: 'spatial_adventure',
    targetTraits: {
      openness: 0.92,
      thrillSeeking: 0.9,
      emotionalStability: 0.7,
      boredomSusceptibility: 0.7,
    },
    comfortLevel: 'extreme',
    requiresOutdoor: true,
    requiresSocial: false,
    minimumDurationMinutes: 240,
    fallbackQuestId: 242,
    questPace: 'planned',
  },
  {
    id: 25,
    title: "L'Arrêt Inconnu",
    description:
      "Prendre une ligne de bus que tu n'empruntes jamais, descendre à un arrêt au hasard et marcher 20 minutes sans itinéraire fixé.",
    titleEn: 'The Unknown Stop',
    descriptionEn:
      'Take a bus line you never use, get off at a random stop, and walk 20 minutes with no fixed route.',
    category: 'spatial_adventure',
    targetTraits: {
      openness: 0.85,
      thrillSeeking: 0.7,
      emotionalStability: 0.65,
    },
    comfortLevel: 'high',
    requiresOutdoor: true,
    requiresSocial: false,
    minimumDurationMinutes: 120,
    fallbackQuestId: 63,
    questPace: 'instant',
  },
  {
    id: 37,
    title: 'La Rose des Vents',
    description:
      'Tracer une direction au hasard sur une carte (ou une appli) et marcher au moins 15 minutes dans cette direction sans but précis.',
    titleEn: 'The Wind Rose',
    descriptionEn:
      'Pick a random direction on a map (or app) and walk at least 15 minutes that way with no fixed goal.',
    category: 'spatial_adventure',
    targetTraits: {
      openness: 0.8,
      thrillSeeking: 0.6,
      emotionalStability: 0.6,
    },
    comfortLevel: 'moderate',
    requiresOutdoor: true,
    requiresSocial: false,
    minimumDurationMinutes: 60,
    fallbackQuestId: 240,
    questPace: 'instant',
  },
  {
    id: 50,
    title: "Le Fil de l'Eau",
    description:
      "Marcher au moins 30 minutes le long d'un cours d'eau, d'un canal ou d'une voie verte sans objectif précis.",
    titleEn: 'The Waterline',
    descriptionEn:
      'Walk at least 30 minutes along a river, canal, or greenway with no fixed goal.',
    category: 'spatial_adventure',
    targetTraits: {
      openness: 0.75,
      thrillSeeking: 0.45,
      emotionalStability: 0.62,
    },
    comfortLevel: 'moderate',
    requiresOutdoor: true,
    requiresSocial: false,
    minimumDurationMinutes: 90,
    fallbackQuestId: 79,
    questPace: 'instant',
  },
  {
    id: 63,
    title: 'Le Terminus Vierge',
    description:
      "Prendre un bus ou un tram jusqu'à un terminus que tu n'as jamais visité et marcher 20 minutes sur place.",
    titleEn: 'The Virgin Terminus',
    descriptionEn:
      "Take a bus or tram to a terminus you've never visited, then walk 20 minutes there.",
    category: 'spatial_adventure',
    targetTraits: {
      openness: 0.82,
      thrillSeeking: 0.65,
      boredomSusceptibility: 0.55,
      emotionalStability: 0.62,
    },
    comfortLevel: 'high',
    requiresOutdoor: true,
    requiresSocial: false,
    minimumDurationMinutes: 120,
    fallbackQuestId: 25,
    questPace: 'instant',
  },
  {
    id: 73,
    title: 'Le Circuit Mémoire',
    description:
      "Planifier et parcourir à pied ou en transports trois lieux qui ont compté dans ton passé (ancienne école, premier appart, lieu d'un souvenir fort) en une demi-journée, seul·e, sans téléphone en main.",
    titleEn: 'The Memory Circuit',
    descriptionEn:
      'Plan and visit on foot or public transit three places that mattered in your past (old school, first flat, place of a strong memory) in half a day, alone, without phone in hand.',
    category: 'spatial_adventure',
    targetTraits: {
      openness: 0.6,
      emotionalStability: 0.55,
      thrillSeeking: 0.35,
    },
    comfortLevel: 'high',
    requiresOutdoor: true,
    requiresSocial: false,
    minimumDurationMinutes: 180,
    fallbackQuestId: 25,
    questPace: 'planned',
  },
  {
    id: 79,
    title: 'Le Trajet du Troisième Bus',
    description:
      "Aller à un arrêt de bus près de chez toi. Laisser passer deux bus, quels qu'ils soient. Monter dans le troisième. Descendre à un arrêt choisi d'avance par un chiffre aléatoire (par exemple le 5ᵉ après le tien). Explorer 30 minutes autour à pied, puis revenir.",
    titleEn: 'The Third Bus',
    descriptionEn:
      'Go to a bus stop near home. Let two buses pass, whichever they are. Board the third one. Get off at a stop chosen beforehand by a random number (say, the 5th after yours). Explore on foot for 30 minutes around, then come back.',
    category: 'spatial_adventure',
    targetTraits: {
      openness: 0.82,
      thrillSeeking: 0.72,
      boredomSusceptibility: 0.65,
    },
    comfortLevel: 'moderate',
    requiresOutdoor: true,
    requiresSocial: false,
    minimumDurationMinutes: 90,
    fallbackQuestId: 37,
    questPace: 'instant',
  },
  {
    id: 237,
    title: 'La Ville d’à Côté',
    description:
      "Aller dans une ville que tu n'as jamais visitée à moins d'une heure de chez toi, sans rien préparer, et y passer l'après-midi entier.",
    titleEn: 'The Town Next Door',
    descriptionEn:
      'Go to a town you have never visited less than an hour from home, with nothing planned, and spend the whole afternoon there.',
    category: 'spatial_adventure',
    targetTraits: {
      openness: 0.9,
      thrillSeeking: 0.72,
      emotionalStability: 0.7,
    },
    comfortLevel: 'high',
    requiresOutdoor: true,
    requiresSocial: false,
    minimumDurationMinutes: 240,
    fallbackQuestId: 25,
    questPace: 'planned',
  },
  {
    id: 238,
    title: 'La Carte Rendue',
    description:
      "Sortir de chez toi et marcher deux heures sans téléphone et sans carte, jusqu'à ne plus savoir où tu es. Rentrer en demandant ton chemin à des passants.",
    titleEn: 'The Map Given Up',
    descriptionEn:
      'Leave home and walk two hours with no phone and no map, until you no longer know where you are. Find your way back by asking passersby.',
    category: 'spatial_adventure',
    targetTraits: {
      openness: 0.95,
      thrillSeeking: 0.8,
      emotionalStability: 0.78,
    },
    comfortLevel: 'extreme',
    requiresOutdoor: true,
    requiresSocial: false,
    minimumDurationMinutes: 180,
    fallbackQuestId: 73,
    questPace: 'planned',
  },
  {
    id: 239,
    title: 'Le Quartier Étranger',
    description:
      "Passer deux heures à pied dans le quartier de ta ville où tu ne vas jamais, en entrant dans au moins trois lieux où tu n'es jamais entré.",
    titleEn: 'The Foreign District',
    descriptionEn:
      'Spend two hours on foot in the neighborhood of your city you never go to, entering at least three places you have never set foot in.',
    category: 'spatial_adventure',
    targetTraits: {
      openness: 0.8,
      thrillSeeking: 0.62,
      emotionalStability: 0.6,
    },
    comfortLevel: 'moderate',
    requiresOutdoor: true,
    requiresSocial: false,
    minimumDurationMinutes: 120,
    fallbackQuestId: 50,
    questPace: 'instant',
  },
  {
    id: 240,
    title: 'La Nuit du Quartier',
    description:
      "Refaire à deux heures du matin un trajet que tu ne fais qu'en plein jour. Marcher lentement et regarder ce qui change.",
    titleEn: 'The Neighborhood at Night',
    descriptionEn:
      'Walk at two in the morning a route you only ever take in daylight. Go slowly and look at what changes.',
    category: 'spatial_adventure',
    targetTraits: {
      openness: 0.8,
      thrillSeeking: 0.62,
      emotionalStability: 0.6,
    },
    comfortLevel: 'moderate',
    requiresOutdoor: true,
    requiresSocial: false,
    minimumDurationMinutes: 60,
    fallbackQuestId: 37,
    questPace: 'instant',
  },
  {
    id: 241,
    title: 'Les Trois Points Hauts',
    description:
      "Trouver trois points de vue en hauteur de ta ville dans la même journée et les rejoindre à pied, l'un après l'autre.",
    titleEn: 'The Three High Points',
    descriptionEn:
      'Find three elevated viewpoints in your city in one day and reach them all on foot, one after the other.',
    category: 'spatial_adventure',
    targetTraits: {
      openness: 0.8,
      thrillSeeking: 0.62,
      emotionalStability: 0.6,
    },
    comfortLevel: 'moderate',
    requiresOutdoor: true,
    requiresSocial: false,
    minimumDurationMinutes: 90,
    fallbackQuestId: 50,
    questPace: 'planned',
  },
  {
    id: 242,
    title: 'Le Train Sans Retour Prévu',
    description:
      'Aller à la gare, prendre le premier train qui part, descendre au troisième arrêt, et trouver seul comment rentrer.',
    titleEn: 'The Train With No Return Booked',
    descriptionEn:
      'Go to the station, take the first train leaving, get off at the third stop, and work out how to get home on your own.',
    category: 'spatial_adventure',
    targetTraits: {
      openness: 0.95,
      thrillSeeking: 0.8,
      emotionalStability: 0.78,
    },
    comfortLevel: 'extreme',
    requiresOutdoor: true,
    requiresSocial: false,
    minimumDurationMinutes: 240,
    fallbackQuestId: 1,
    questPace: 'planned',
  },
  // ── public_introspection ────────────────────────────────────────────────────
  {
    id: 2,
    title: 'Le Dîner Solitaire',
    description:
      "Réserver une table pour une personne dans un restaurant où tu n'irais jamais seul, et t'y tenir. Téléphone éteint au fond de la poche, pas de livre, pas de carnet. Commander une entrée, un plat, un dessert, et rester jusqu'au café.",
    titleEn: 'The Solo Dinner',
    descriptionEn:
      'Book a table for one at a restaurant you would never go to alone, and keep the booking. Phone off, deep in your pocket, no book, no notebook. Order a starter, a main and a dessert, and stay through coffee.',
    category: 'public_introspection',
    targetTraits: {
      emotionalStability: 0.82,
      extraversion: 0.3,
      openness: 0.6,
    },
    comfortLevel: 'high',
    requiresOutdoor: true,
    requiresSocial: false,
    minimumDurationMinutes: 90,
    fallbackQuestId: 223,
    questPace: 'instant',
  },
  {
    id: 26,
    title: 'Le Banc Silencieux',
    description:
      "Rester assis seul sur un banc public 30 minutes : pas d'écran, pas de casque, seulement présence.",
    titleEn: 'The Silent Bench',
    descriptionEn:
      'Sit alone on a public bench for 30 minutes: no screen, no headphones—just presence.',
    category: 'public_introspection',
    targetTraits: {
      emotionalStability: 0.72,
      extraversion: 0.35,
      boredomSusceptibility: 0.3,
    },
    comfortLevel: 'moderate',
    requiresOutdoor: true,
    requiresSocial: false,
    minimumDurationMinutes: 30,
    fallbackQuestId: 228,
    questPace: 'instant',
  },
  {
    id: 38,
    title: 'Le Café Sans Écran',
    description:
      'Passer 30 minutes dans un café avec un carnet ou un livre papier, téléphone éteint ou mode avion.',
    titleEn: 'The Screen-Free Café',
    descriptionEn:
      'Spend 30 minutes in a café with a notebook or paper book—phone off or in airplane mode.',
    category: 'public_introspection',
    targetTraits: {
      emotionalStability: 0.68,
      extraversion: 0.4,
      conscientiousness: 0.55,
    },
    comfortLevel: 'low',
    requiresOutdoor: true,
    requiresSocial: false,
    minimumDurationMinutes: 30,
    fallbackQuestId: 51,
    questPace: 'instant',
  },
  {
    id: 51,
    title: 'Le Dernier Rang',
    description:
      "T'asseoir au dernier rang d'un lieu public ouvert (sport, pratique culturelle) 25 minutes : observer, pas d'écran.",
    titleEn: 'The Back Row',
    descriptionEn:
      'Sit in the back row of an open public venue (sport, cultural practice) for 25 minutes—observe, no screen.',
    category: 'public_introspection',
    targetTraits: {
      emotionalStability: 0.72,
      extraversion: 0.38,
      openness: 0.55,
    },
    comfortLevel: 'low',
    requiresOutdoor: true,
    requiresSocial: false,
    minimumDurationMinutes: 25,
    fallbackQuestId: 98,
    questPace: 'instant',
  },
  {
    id: 98,
    title: 'Le Solo au Comptoir',
    description:
      "Commander un truc au comptoir d'un café ou d'un snack et rester debout là pour le consommer, sans écran.",
    titleEn: 'The Counter Solo',
    descriptionEn:
      'Order something at a café or snack counter and stand right there to consume it, no screen.',
    category: 'public_introspection',
    targetTraits: {
      emotionalStability: 0.6,
      extraversion: 0.4,
      conscientiousness: 0.5,
    },
    comfortLevel: 'low',
    requiresOutdoor: true,
    requiresSocial: false,
    minimumDurationMinutes: 20,
    fallbackQuestId: 9,
    questPace: 'instant',
  },
  {
    id: 222,
    title: 'L’Heure Immobile',
    description:
      "Rester assis une heure pleine dans un lieu public passant, sans rien faire : pas d'écran, pas de livre, pas de carnet. Soutenir l'ennui et les regards.",
    titleEn: 'The Motionless Hour',
    descriptionEn:
      'Sit for one full hour in a busy public place doing nothing: no screen, no book, no notebook. Hold the boredom and the looks.',
    category: 'public_introspection',
    targetTraits: {
      emotionalStability: 0.84,
      extraversion: 0.42,
      openness: 0.7,
    },
    comfortLevel: 'high',
    requiresOutdoor: true,
    requiresSocial: false,
    minimumDurationMinutes: 60,
    fallbackQuestId: 26,
    questPace: 'instant',
  },
  {
    id: 223,
    title: 'Le Repas Seul en Terrasse',
    description:
      "Déjeuner seul en terrasse d'un lieu fréquenté, en pleine heure de pointe, sans écran ni lecture. Regarder les gens au lieu de t'occuper.",
    titleEn: 'Lunch Alone Outside',
    descriptionEn:
      'Eat lunch alone on a busy terrace at peak hour, with no screen and nothing to read. Watch people instead of keeping busy.',
    category: 'public_introspection',
    targetTraits: {
      emotionalStability: 0.84,
      extraversion: 0.42,
      openness: 0.7,
    },
    comfortLevel: 'high',
    requiresOutdoor: true,
    requiresSocial: false,
    minimumDurationMinutes: 90,
    fallbackQuestId: 2,
    questPace: 'instant',
  },
  {
    id: 224,
    title: 'Le Banc des Retrouvailles',
    description:
      "T'asseoir dans une gare ou un aéroport sans avoir de train ni d'avion à prendre, et observer les arrivées pendant 45 minutes.",
    titleEn: 'The Arrivals Bench',
    descriptionEn:
      'Sit in a station or an airport with no train or plane to catch, and watch the arrivals for 45 minutes.',
    category: 'public_introspection',
    targetTraits: {
      emotionalStability: 0.74,
      extraversion: 0.32,
      openness: 0.6,
    },
    comfortLevel: 'moderate',
    requiresOutdoor: true,
    requiresSocial: false,
    minimumDurationMinutes: 45,
    fallbackQuestId: 26,
    questPace: 'planned',
  },
  {
    id: 225,
    title: 'Le Cinéma Solitaire',
    description:
      "Aller seul au cinéma un soir, sans prévenir personne avant ni après, et rester assis jusqu'à la toute fin du générique.",
    titleEn: 'The Solo Cinema',
    descriptionEn:
      'Go to the cinema alone one evening, telling nobody before or after, and stay seated until the very end of the credits.',
    category: 'public_introspection',
    targetTraits: {
      emotionalStability: 0.74,
      extraversion: 0.32,
      openness: 0.6,
    },
    comfortLevel: 'moderate',
    requiresOutdoor: true,
    requiresSocial: false,
    minimumDurationMinutes: 120,
    fallbackQuestId: 38,
    questPace: 'planned',
  },
  {
    id: 226,
    title: 'Le Concert Sans Personne',
    description:
      "Assister seul à un concert, un match ou un spectacle où tout le monde vient en groupe. Rester jusqu'au bout.",
    titleEn: 'The Concert Alone',
    descriptionEn:
      'Go alone to a concert, a match or a show where everyone else comes in groups. Stay until the end.',
    category: 'public_introspection',
    targetTraits: {
      emotionalStability: 0.84,
      extraversion: 0.42,
      openness: 0.7,
    },
    comfortLevel: 'high',
    requiresOutdoor: true,
    requiresSocial: false,
    minimumDurationMinutes: 180,
    fallbackQuestId: 225,
    questPace: 'planned',
  },
  {
    id: 227,
    title: 'La Terrasse Sans But',
    description:
      "Commander une boisson dans un café et rester une heure entière sans rien faire d'autre que regarder la rue.",
    titleEn: 'The Aimless Terrace',
    descriptionEn:
      'Order a drink at a café and stay a full hour doing nothing but watching the street.',
    category: 'public_introspection',
    targetTraits: {
      emotionalStability: 0.74,
      extraversion: 0.32,
      openness: 0.6,
    },
    comfortLevel: 'moderate',
    requiresOutdoor: true,
    requiresSocial: false,
    minimumDurationMinutes: 60,
    fallbackQuestId: 38,
    questPace: 'instant',
  },
  {
    id: 228,
    title: 'L’Attente Volontaire',
    description:
      "Dans une file d'attente, laisser passer trois personnes devant toi et attendre ton tour sans rien faire d'autre. Sans téléphone.",
    titleEn: 'The Chosen Wait',
    descriptionEn:
      'In a queue, let three people go ahead of you and wait your turn doing nothing else. No phone.',
    category: 'public_introspection',
    targetTraits: {
      emotionalStability: 0.74,
      extraversion: 0.32,
      openness: 0.6,
    },
    comfortLevel: 'moderate',
    requiresOutdoor: true,
    requiresSocial: false,
    minimumDurationMinutes: 30,
    fallbackQuestId: 26,
    questPace: 'instant',
  },
  {
    id: 229,
    title: 'Le Musée d’Une Seule Salle',
    description:
      "Aller dans un musée et ne regarder qu'une seule œuvre, pendant une heure entière. Ne pas visiter le reste.",
    titleEn: 'The One-Room Museum',
    descriptionEn:
      'Go to a museum and look at one single work for a full hour. Do not visit the rest.',
    category: 'public_introspection',
    targetTraits: {
      emotionalStability: 0.74,
      extraversion: 0.32,
      openness: 0.6,
    },
    comfortLevel: 'moderate',
    requiresOutdoor: true,
    requiresSocial: false,
    minimumDurationMinutes: 90,
    fallbackQuestId: 227,
    questPace: 'planned',
  },
  // ── sensory_deprivation ─────────────────────────────────────────────────────
  {
    id: 3,
    title: 'La Nuit Étoilée',
    description:
      "Sortir de la ville jusqu'à un endroit où l'on voit vraiment les étoiles, et y rester de la nuit tombée jusqu'à ce que le froid te renvoie. Pas de musique, pas d'écran, aucune photo. Au retour, écrire la seule pensée qui est revenue le plus souvent.",
    titleEn: 'The Starry Night',
    descriptionEn:
      'Get out of the city to somewhere the stars are genuinely visible, and stay from nightfall until the cold sends you back. No music, no screen, no photos. On returning, write down the one thought that kept coming back.',
    category: 'sensory_deprivation',
    targetTraits: {
      openness: 0.55,
      conscientiousness: 0.55,
      boredomSusceptibility: 0.3,
      emotionalStability: 0.6,
    },
    comfortLevel: 'extreme',
    requiresOutdoor: true,
    requiresSocial: false,
    minimumDurationMinutes: 240,
    fallbackQuestId: 215,
    questPace: 'planned',
  },
  {
    id: 18,
    title: "L'Œil Nu",
    description:
      'Prendre trente photos en une heure, sans filtre, sans retouche et sans en supprimer une seule. Le soir, garder la seule qui te semble vraie et effacer les vingt-neuf autres.',
    titleEn: 'The Naked Eye',
    descriptionEn:
      'Take thirty photos in an hour, no filter, no editing, deleting none of them. That evening, keep the one that feels true and delete the other twenty-nine.',
    category: 'sensory_deprivation',
    targetTraits: {
      openness: 0.7,
      conscientiousness: 0.55,
      boredomSusceptibility: 0.4,
    },
    comfortLevel: 'moderate',
    requiresOutdoor: true,
    requiresSocial: false,
    minimumDurationMinutes: 60,
    fallbackQuestId: 217,
    questPace: 'instant',
  },
  {
    id: 27,
    title: 'La Marche Sans Musique',
    description:
      "Une promenade d'au moins 20 minutes en silence total, sans musique ni podcast.",
    titleEn: 'The Walk Without Music',
    descriptionEn:
      'Walk at least 20 minutes in total silence—no music or podcast.',
    category: 'sensory_deprivation',
    targetTraits: {
      openness: 0.5,
      conscientiousness: 0.55,
      boredomSusceptibility: 0.35,
    },
    comfortLevel: 'low',
    requiresOutdoor: true,
    requiresSocial: false,
    minimumDurationMinutes: 30,
    fallbackQuestId: 9,
    questPace: 'instant',
  },
  {
    id: 76,
    title: 'Le Dîner Aveugle',
    description:
      "Préparer un vrai repas (deux plats) puis te bander les yeux ou éteindre toute lumière pour le manger entièrement à l'aveugle. Pas de musique, pas de téléphone. Goûter chaque bouchée comme si tu ignorais ce qu'elle contient.",
    titleEn: 'The Blind Dinner',
    descriptionEn:
      "Cook a real meal (two dishes) then blindfold yourself or switch off all lights to eat it entirely in the dark. No music, no phone. Taste each bite as if you didn't know what it contained.",
    category: 'sensory_deprivation',
    targetTraits: {
      openness: 0.75,
      conscientiousness: 0.62,
      emotionalStability: 0.65,
      boredomSusceptibility: 0.3,
    },
    comfortLevel: 'high',
    requiresOutdoor: false,
    requiresSocial: false,
    minimumDurationMinutes: 60,
    fallbackQuestId: 217,
    questPace: 'planned',
  },
  {
    id: 214,
    title: 'Les Trois Heures Sans Son',
    description:
      'Trois heures sans aucun son produit volontairement : pas de musique, pas de podcast, pas de vidéo, pas une parole. Écrire ensuite ce qui est remonté pendant.',
    titleEn: 'Three Hours Without Sound',
    descriptionEn:
      'Three hours with no sound you chose to make: no music, no podcast, no video, not a word spoken. Afterward, write what surfaced.',
    category: 'sensory_deprivation',
    targetTraits: {
      openness: 0.8,
      conscientiousness: 0.68,
      boredomSusceptibility: 0.42,
    },
    comfortLevel: 'high',
    requiresOutdoor: false,
    requiresSocial: false,
    minimumDurationMinutes: 180,
    fallbackQuestId: 27,
    questPace: 'planned',
  },
  {
    id: 215,
    title: 'La Marche Aveugle',
    description:
      'Te faire guider les yeux bandés par une personne de confiance pendant une heure, dehors. Ne jamais soulever le bandeau, même une seconde.',
    titleEn: 'The Blind Walk',
    descriptionEn:
      'Have someone you trust guide you blindfolded for an hour, outdoors. Never lift the blindfold, not for a second.',
    category: 'sensory_deprivation',
    targetTraits: {
      openness: 0.88,
      conscientiousness: 0.76,
      boredomSusceptibility: 0.5,
    },
    comfortLevel: 'extreme',
    requiresOutdoor: true,
    requiresSocial: true,
    minimumDurationMinutes: 60,
    fallbackQuestId: 76,
    questPace: 'planned',
  },
  {
    id: 216,
    title: 'La Chambre Noire',
    description:
      "Passer deux heures dans le noir complet : pas d'écran, pas de lumière, pas de sommeil. Rester éveillé et assis.",
    titleEn: 'The Dark Room',
    descriptionEn:
      'Spend two hours in complete darkness: no screen, no light, no sleeping. Stay awake and seated.',
    category: 'sensory_deprivation',
    targetTraits: {
      openness: 0.8,
      conscientiousness: 0.68,
      boredomSusceptibility: 0.42,
    },
    comfortLevel: 'high',
    requiresOutdoor: false,
    requiresSocial: false,
    minimumDurationMinutes: 120,
    fallbackQuestId: 76,
    questPace: 'planned',
  },
  {
    id: 217,
    title: 'Le Repas d’un Seul Goût',
    description:
      "Manger un repas entier composé d'un seul aliment, lentement, sans rien pour l'accompagner et sans rien pour te distraire.",
    titleEn: 'The Single-Flavor Meal',
    descriptionEn:
      'Eat an entire meal made of one single food, slowly, with nothing alongside it and nothing to distract you.',
    category: 'sensory_deprivation',
    targetTraits: {
      openness: 0.7,
      conscientiousness: 0.58,
      boredomSusceptibility: 0.32,
    },
    comfortLevel: 'moderate',
    requiresOutdoor: false,
    requiresSocial: false,
    minimumDurationMinutes: 60,
    fallbackQuestId: 18,
    questPace: 'instant',
  },
  {
    id: 218,
    title: 'Le Froid Tenu',
    description:
      "Terminer ta douche par trois minutes d'eau franchement froide. Ne pas réduire, ne pas écourter. Respirer lentement au lieu de fuir.",
    titleEn: 'The Cold Held',
    descriptionEn:
      'End your shower with three minutes of genuinely cold water. Do not turn it down, do not cut it short. Breathe slowly instead of fleeing.',
    category: 'sensory_deprivation',
    targetTraits: {
      openness: 0.8,
      conscientiousness: 0.68,
      boredomSusceptibility: 0.42,
    },
    comfortLevel: 'high',
    requiresOutdoor: false,
    requiresSocial: false,
    minimumDurationMinutes: 30,
    fallbackQuestId: 27,
    questPace: 'instant',
  },
  {
    id: 219,
    title: 'La Journée Sans Musique',
    description:
      'Une journée entière sans aucune musique ni fond sonore, y compris dans les transports et en cuisinant. Noter le moment où le silence a été le plus dur.',
    titleEn: 'The Day Without Music',
    descriptionEn:
      'A full day with no music and no background audio, including on your commute and while cooking. Note the moment silence was hardest.',
    category: 'sensory_deprivation',
    targetTraits: {
      openness: 0.7,
      conscientiousness: 0.58,
      boredomSusceptibility: 0.32,
    },
    comfortLevel: 'moderate',
    requiresOutdoor: false,
    requiresSocial: false,
    minimumDurationMinutes: 240,
    fallbackQuestId: 27,
    questPace: 'planned',
  },
  {
    id: 220,
    title: 'Le Toucher Seul',
    description:
      "Identifier vingt objets de chez toi les yeux fermés, uniquement au toucher. Noter les cinq que tu n'as pas reconnus.",
    titleEn: 'Touch Alone',
    descriptionEn:
      'Identify twenty objects in your home with your eyes closed, by touch only. Write down the five you failed to recognize.',
    category: 'sensory_deprivation',
    targetTraits: {
      openness: 0.7,
      conscientiousness: 0.58,
      boredomSusceptibility: 0.32,
    },
    comfortLevel: 'moderate',
    requiresOutdoor: false,
    requiresSocial: false,
    minimumDurationMinutes: 45,
    fallbackQuestId: 27,
    questPace: 'instant',
  },
  {
    id: 221,
    title: 'La Nuit Sans Réveil',
    description:
      "Dormir une nuit sans alarme, sans téléphone dans la chambre, et te lever quand ton corps le décide. Noter l'heure au réveil.",
    titleEn: 'The Night Without an Alarm',
    descriptionEn:
      'Sleep one night with no alarm and no phone in the room, and get up when your body decides. Note the time when you wake.',
    category: 'sensory_deprivation',
    targetTraits: {
      openness: 0.7,
      conscientiousness: 0.58,
      boredomSusceptibility: 0.32,
    },
    comfortLevel: 'moderate',
    requiresOutdoor: false,
    requiresSocial: false,
    minimumDurationMinutes: 240,
    fallbackQuestId: 219,
    questPace: 'planned',
  },
  // ── exploratory_sociability ─────────────────────────────────────────────────
  {
    id: 4,
    title: "L'Explorateur Local",
    description:
      "Choisir sur une carte un village de moins de mille habitants à moins d'une heure de chez toi. T'y rendre sans rien préparer, entrer dans le seul commerce ouvert, et faire parler la personne derrière le comptoir jusqu'à repartir avec une histoire du lieu.",
    titleEn: 'The Local Explorer',
    descriptionEn:
      'Pick a village of under a thousand people within an hour of home. Go with nothing planned, walk into the one shop that is open, and get the person behind the counter talking until you leave with a story about the place.',
    category: 'exploratory_sociability',
    targetTraits: {
      extraversion: 0.72,
      agreeableness: 0.6,
      openness: 0.78,
      thrillSeeking: 0.6,
    },
    comfortLevel: 'high',
    requiresOutdoor: true,
    requiresSocial: true,
    minimumDurationMinutes: 240,
    fallbackQuestId: 75,
    questPace: 'planned',
  },
  {
    id: 28,
    title: 'Le Lieu du Commerçant',
    description:
      "Demander à un commerçant local son endroit préféré dans le coin et s'y rendre une fois.",
    titleEn: "The Merchant's Pick",
    descriptionEn:
      'Ask a local shopkeeper their favorite spot nearby and go there once.',
    category: 'exploratory_sociability',
    targetTraits: {
      extraversion: 0.6,
      agreeableness: 0.65,
      openness: 0.68,
    },
    comfortLevel: 'moderate',
    requiresOutdoor: true,
    requiresSocial: true,
    minimumDurationMinutes: 120,
    fallbackQuestId: 255,
    questPace: 'planned',
  },
  {
    id: 40,
    title: 'Le Voisin du Quartier',
    description:
      "Demander à un voisin ou un commerçant ce qu'il changerait en premier dans le quartier — et noter une idée retenue.",
    titleEn: 'The Neighborhood Neighbor',
    descriptionEn:
      'Ask a neighbor or shopkeeper what they would change first in the area—and note one idea you keep.',
    category: 'exploratory_sociability',
    targetTraits: {
      extraversion: 0.55,
      agreeableness: 0.72,
      openness: 0.6,
    },
    comfortLevel: 'moderate',
    requiresOutdoor: true,
    requiresSocial: true,
    minimumDurationMinutes: 45,
    fallbackQuestId: 67,
    questPace: 'planned',
  },
  {
    id: 53,
    title: "L'Accueil Visiteur",
    description:
      "Participer à une réunion d'accueil, un apéro nouveaux arrivants ou un club avec tour de présentation.",
    titleEn: 'The Visitor Welcome',
    descriptionEn:
      'Join a welcome meetup, newcomers drink, or club with introductions.',
    category: 'exploratory_sociability',
    targetTraits: {
      extraversion: 0.8,
      agreeableness: 0.65,
      openness: 0.68,
      thrillSeeking: 0.45,
    },
    comfortLevel: 'high',
    requiresOutdoor: false,
    requiresSocial: true,
    minimumDurationMinutes: 90,
    fallbackQuestId: 253,
    questPace: 'planned',
  },
  {
    id: 66,
    title: 'Le Salut Cordial',
    description:
      'Sur un trajet quotidien, saluer volontairement trois inconnus (voisin, commerçant, passant) avec un regard franc et une phrase simple.',
    titleEn: 'The Cordial Hello',
    descriptionEn:
      'On a daily commute, deliberately greet three strangers (neighbor, shopkeeper, passer-by) with a direct look and one simple sentence.',
    category: 'exploratory_sociability',
    targetTraits: {
      extraversion: 0.55,
      agreeableness: 0.65,
      openness: 0.5,
    },
    comfortLevel: 'low',
    requiresOutdoor: true,
    requiresSocial: true,
    minimumDurationMinutes: 20,
    fallbackQuestId: 112,
    questPace: 'instant',
  },
  {
    id: 67,
    title: 'Le Message Rendormi',
    description:
      "Reprendre contact avec une personne que tu n'as pas contactée depuis plus de six mois, par un message court et honnête, sans attendre de réponse immédiate.",
    titleEn: 'The Sleeping Message',
    descriptionEn:
      "Reach out to someone you haven't contacted in more than six months, with a short honest message, without expecting an immediate reply.",
    category: 'exploratory_sociability',
    targetTraits: {
      extraversion: 0.45,
      agreeableness: 0.7,
      openness: 0.55,
    },
    comfortLevel: 'moderate',
    requiresOutdoor: false,
    requiresSocial: true,
    minimumDurationMinutes: 20,
    fallbackQuestId: 114,
    questPace: 'instant',
  },
  {
    id: 75,
    title: 'Le Troc Sauvage',
    description:
      "Prendre un objet de chez toi que tu ne regretteras pas (livre, vêtement, ustensile) et te rendre dans un marché, un vide-grenier ou un quartier marchand pour proposer un troc — pas un paiement — à trois vendeurs. Rentrer avec quelque chose que tu n'aurais jamais acheté.",
    titleEn: 'The Wild Barter',
    descriptionEn:
      "Take an item from home you won't miss (a book, a piece of clothing, a utensil) and head to a market, flea market or shopping street to propose a barter — not a payment — to three vendors. Come back with something you would never have bought.",
    category: 'exploratory_sociability',
    targetTraits: {
      openness: 0.78,
      extraversion: 0.65,
      thrillSeeking: 0.6,
      agreeableness: 0.5,
    },
    comfortLevel: 'high',
    requiresOutdoor: true,
    requiresSocial: true,
    minimumDurationMinutes: 120,
    fallbackQuestId: 66,
    questPace: 'planned',
  },
  {
    id: 112,
    title: 'La Question au Commerçant',
    description:
      'À ta prochaine course, demander au commerçant son conseil sur un produit — et suivre sa réponse.',
    titleEn: "The Shopkeeper's Advice",
    descriptionEn:
      'On your next errand, ask the shopkeeper for advice on a product — and follow it.',
    category: 'exploratory_sociability',
    targetTraits: {
      extraversion: 0.5,
      agreeableness: 0.6,
      openness: 0.55,
    },
    comfortLevel: 'low',
    requiresOutdoor: true,
    requiresSocial: true,
    minimumDurationMinutes: 15,
    fallbackQuestId: 9,
    questPace: 'instant',
  },
  {
    id: 114,
    title: "Le Voisin d'Ascenseur",
    description:
      'Dans le prochain ascenseur, métro ou file, engager une phrase anodine avec un·e inconnu·e (« beau temps », « long trajet aussi ? »).',
    titleEn: 'The Elevator Neighbor',
    descriptionEn:
      "On your next elevator, metro or queue, start a casual sentence with a stranger ('nice weather', 'long trip too?').",
    category: 'exploratory_sociability',
    targetTraits: {
      extraversion: 0.55,
      agreeableness: 0.55,
      thrillSeeking: 0.35,
    },
    comfortLevel: 'moderate',
    requiresOutdoor: false,
    requiresSocial: true,
    minimumDurationMinutes: 15,
    fallbackQuestId: 115,
    questPace: 'instant',
  },
  {
    id: 115,
    title: 'Le Nom Retenu',
    description:
      'La prochaine personne qui se présente à toi, tu retiens son prénom ET tu le réutilises au moins deux fois dans la conversation.',
    titleEn: 'The Remembered Name',
    descriptionEn:
      'The next person who introduces themselves, remember their name AND use it at least twice during the conversation.',
    category: 'exploratory_sociability',
    targetTraits: {
      extraversion: 0.5,
      agreeableness: 0.6,
      conscientiousness: 0.55,
    },
    comfortLevel: 'moderate',
    requiresOutdoor: false,
    requiresSocial: true,
    minimumDurationMinutes: 15,
    fallbackQuestId: 114,
    questPace: 'instant',
  },
  {
    id: 252,
    title: 'Le Repas Chez l’Inconnu',
    description:
      "Trouver un dîner participatif, une table d'hôtes ou un repas de quartier où tu ne connais absolument personne, et y aller seul.",
    titleEn: 'Dinner Among Strangers',
    descriptionEn:
      'Find a supper club, a communal table or a neighborhood meal where you know absolutely nobody, and go alone.',
    category: 'exploratory_sociability',
    targetTraits: {
      extraversion: 0.86,
      agreeableness: 0.82,
      openness: 0.88,
    },
    comfortLevel: 'extreme',
    requiresOutdoor: true,
    requiresSocial: true,
    minimumDurationMinutes: 240,
    fallbackQuestId: 53,
    questPace: 'planned',
  },
  {
    id: 253,
    title: 'Les Cinq Mêmes Questions',
    description:
      'Aborder cinq inconnus dans la même journée et poser à chacun exactement la même question personnelle. Noter les cinq réponses mot pour mot.',
    titleEn: 'The Same Five Questions',
    descriptionEn:
      'Approach five strangers in one day and ask each of them exactly the same personal question. Write down all five answers word for word.',
    category: 'exploratory_sociability',
    targetTraits: {
      extraversion: 0.78,
      agreeableness: 0.74,
      openness: 0.8,
    },
    comfortLevel: 'high',
    requiresOutdoor: true,
    requiresSocial: true,
    minimumDurationMinutes: 90,
    fallbackQuestId: 53,
    questPace: 'instant',
  },
  {
    id: 254,
    title: 'Le Club Poussé',
    description:
      "Te rendre à la première séance d'un club, d'un cours ou d'un collectif dont l'activité t'intimide. Y rester jusqu'à la fin.",
    titleEn: 'The Door Pushed Open',
    descriptionEn:
      'Turn up to the first session of a club, class or group whose activity intimidates you. Stay until the end.',
    category: 'exploratory_sociability',
    targetTraits: {
      extraversion: 0.78,
      agreeableness: 0.74,
      openness: 0.8,
    },
    comfortLevel: 'high',
    requiresOutdoor: true,
    requiresSocial: true,
    minimumDurationMinutes: 120,
    fallbackQuestId: 53,
    questPace: 'planned',
  },
  {
    id: 255,
    title: 'L’Invitation Lancée',
    description:
      "Inviter chez toi quelqu'un que tu apprécies mais que tu n'as jamais invité. Proposer une date précise, pas un « faudrait qu'on se voie ».",
    titleEn: 'The Invitation Made',
    descriptionEn:
      'Invite to your home someone you like but have never invited. Propose a specific date, not a vague "we should meet up".',
    category: 'exploratory_sociability',
    targetTraits: {
      extraversion: 0.68,
      agreeableness: 0.64,
      openness: 0.7,
    },
    comfortLevel: 'moderate',
    requiresOutdoor: false,
    requiresSocial: true,
    minimumDurationMinutes: 60,
    fallbackQuestId: 40,
    questPace: 'instant',
  },
  // ── physical_existential ────────────────────────────────────────────────────
  {
    id: 5,
    title: 'Le Point Culminant',
    description:
      "Monter à pied jusqu'au point le plus haut accessible de ta ville. Une fois en haut, rester trente minutes sans téléphone et répondre par écrit à une seule question : est-ce que je vais dans la direction que j'aurais choisie ?",
    titleEn: 'The High Point',
    descriptionEn:
      'Walk up to the highest accessible point in your city. Once there, stay thirty minutes without your phone and answer one question in writing: am I going in the direction I would have chosen?',
    category: 'physical_existential',
    targetTraits: {
      openness: 0.65,
      conscientiousness: 0.55,
      thrillSeeking: 0.4,
    },
    comfortLevel: 'moderate',
    requiresOutdoor: true,
    requiresSocial: false,
    minimumDurationMinutes: 120,
    fallbackQuestId: 29,
    questPace: 'instant',
  },
  {
    id: 23,
    title: 'La Chose Repoussée',
    description:
      "Nommer par écrit une chose précise qui te fait légèrement peur et que tu repousses depuis au moins un mois. La faire dans l'heure qui suit, même mal, même à moitié.",
    titleEn: 'The Thing Put Off',
    descriptionEn:
      'Write down one precise thing that mildly scares you and that you have been putting off for at least a month. Do it within the hour, even badly, even halfway.',
    category: 'physical_existential',
    targetTraits: {
      thrillSeeking: 0.7,
      openness: 0.75,
      emotionalStability: 0.55,
    },
    comfortLevel: 'moderate',
    requiresOutdoor: false,
    requiresSocial: false,
    minimumDurationMinutes: 30,
    fallbackQuestId: 235,
    questPace: 'instant',
  },
  {
    id: 29,
    title: 'Le Trajet Lent',
    description:
      'Refaire un trajet habituel à pied ou à vélo au lieu des transports ; noter une pensée à mi-parcours.',
    titleEn: 'The Slow Commute',
    descriptionEn:
      'Redo a usual commute on foot or by bike instead of transit; note one thought halfway.',
    category: 'physical_existential',
    targetTraits: {
      conscientiousness: 0.58,
      openness: 0.55,
    },
    comfortLevel: 'moderate',
    requiresOutdoor: true,
    requiresSocial: false,
    minimumDurationMinutes: 90,
    fallbackQuestId: 23,
    questPace: 'instant',
  },
  {
    id: 54,
    title: 'Le Réveil Corps',
    description:
      "Avant tout écran le matin, au moins 12 minutes d'étirements ou de mobilité douce en silence.",
    titleEn: 'The Body Wake-Up',
    descriptionEn:
      'Before any screen in the morning, at least 12 minutes of stretches or gentle mobility in silence.',
    category: 'physical_existential',
    targetTraits: {
      conscientiousness: 0.72,
      openness: 0.48,
    },
    comfortLevel: 'low',
    requiresOutdoor: false,
    requiresSocial: false,
    minimumDurationMinutes: 20,
    fallbackQuestId: 9,
    questPace: 'instant',
  },
  {
    id: 74,
    title: "L'Endurance du Plancher",
    description:
      "Séance corps au sol de 45 minutes (gainage, respiration, mobilité lente) jusqu'à sortir de la zone de confort physique, chez toi, sans musique ni écran.",
    titleEn: 'The Floor Endurance',
    descriptionEn:
      'A 45-minute floor session (core work, breathing, slow mobility) pushing through physical discomfort, at home, without music or screen.',
    category: 'physical_existential',
    targetTraits: {
      conscientiousness: 0.75,
      emotionalStability: 0.55,
      thrillSeeking: 0.5,
    },
    comfortLevel: 'high',
    requiresOutdoor: false,
    requiresSocial: false,
    minimumDurationMinutes: 45,
    fallbackQuestId: 23,
    questPace: 'instant',
  },
  {
    id: 77,
    title: 'Le Repas des Cinq Couleurs',
    description:
      'Composer un repas qui contient cinq couleurs naturelles distinctes (blanc et noir ne comptent pas). Chercher, acheter, cuisiner — puis photographier le résultat avant la première bouchée et le manger lentement.',
    titleEn: 'The Five-Color Meal',
    descriptionEn:
      'Assemble a meal with five distinct natural colors (white and black do not count). Shop, prep, cook — then photograph the result before the first bite and eat it slowly.',
    category: 'physical_existential',
    targetTraits: {
      openness: 0.68,
      conscientiousness: 0.58,
      agreeableness: 0.5,
    },
    comfortLevel: 'low',
    requiresOutdoor: false,
    requiresSocial: false,
    minimumDurationMinutes: 45,
    fallbackQuestId: 54,
    questPace: 'instant',
  },
  {
    id: 230,
    title: 'La Distance Jamais Faite',
    description:
      "Marcher ou courir d'un trait la plus longue distance de ta vie, même modeste. S'arrêter quand le corps le dit vraiment, pas quand la tête le propose.",
    titleEn: 'The Distance Never Covered',
    descriptionEn:
      'Walk or run, in one go, the longest distance of your life, however modest. Stop when your body actually says so, not when your head suggests it.',
    category: 'physical_existential',
    targetTraits: {
      conscientiousness: 0.78,
      emotionalStability: 0.68,
      thrillSeeking: 0.55,
    },
    comfortLevel: 'high',
    requiresOutdoor: true,
    requiresSocial: false,
    minimumDurationMinutes: 180,
    fallbackQuestId: 29,
    questPace: 'planned',
  },
  {
    id: 231,
    title: 'Le Retour à Pied',
    description:
      "Rentrer chez toi entièrement à pied depuis un endroit d'où tu prends toujours les transports, quelle que soit l'heure et quelle que soit la météo.",
    titleEn: 'The Walk Home',
    descriptionEn:
      'Walk all the way home from a place you always take transit from, whatever the hour and whatever the weather.',
    category: 'physical_existential',
    targetTraits: {
      conscientiousness: 0.78,
      emotionalStability: 0.68,
      thrillSeeking: 0.55,
    },
    comfortLevel: 'high',
    requiresOutdoor: true,
    requiresSocial: false,
    minimumDurationMinutes: 120,
    fallbackQuestId: 29,
    questPace: 'instant',
  },
  {
    id: 232,
    title: 'Le Sommet Local',
    description:
      'Atteindre à pied le point le plus haut accessible autour de chez toi, et y rester trente minutes avant de redescendre.',
    titleEn: 'The Local Summit',
    descriptionEn:
      'Reach on foot the highest accessible point near where you live, and stay there thirty minutes before coming back down.',
    category: 'physical_existential',
    targetTraits: {
      conscientiousness: 0.78,
      emotionalStability: 0.68,
      thrillSeeking: 0.55,
    },
    comfortLevel: 'high',
    requiresOutdoor: true,
    requiresSocial: false,
    minimumDurationMinutes: 240,
    fallbackQuestId: 5,
    questPace: 'planned',
  },
  {
    id: 233,
    title: 'La Nuit Blanche Debout',
    description:
      'Rester éveillé toute une nuit sans écran, avec un seul projet tenu du soir au lever du jour : écrire, marcher, ou penser.',
    titleEn: 'The Night Kept Awake',
    descriptionEn:
      'Stay awake all night with no screen, holding one single project from dusk to daybreak: write, walk, or think.',
    category: 'physical_existential',
    targetTraits: {
      conscientiousness: 0.86,
      emotionalStability: 0.76,
      thrillSeeking: 0.63,
    },
    comfortLevel: 'extreme',
    requiresOutdoor: false,
    requiresSocial: false,
    minimumDurationMinutes: 240,
    fallbackQuestId: 230,
    questPace: 'planned',
  },
  {
    id: 234,
    title: 'Le Mauvais Temps Assumé',
    description:
      'Sortir dehors par mauvais temps, sans capuche ni parapluie, et marcher trente minutes. Rentrer trempé et le noter.',
    titleEn: 'Into the Bad Weather',
    descriptionEn:
      'Go outside in bad weather with no hood and no umbrella, and walk for thirty minutes. Come home soaked, and note it.',
    category: 'physical_existential',
    targetTraits: {
      conscientiousness: 0.78,
      emotionalStability: 0.68,
      thrillSeeking: 0.55,
    },
    comfortLevel: 'high',
    requiresOutdoor: true,
    requiresSocial: false,
    minimumDurationMinutes: 60,
    fallbackQuestId: 74,
    questPace: 'instant',
  },
  {
    id: 235,
    title: 'Le Corps Regardé',
    description:
      'Te tenir cinq minutes devant un miroir en pied, sans te détourner, et nommer à voix haute trois choses de ton corps que tu acceptes vraiment.',
    titleEn: 'The Body Looked At',
    descriptionEn:
      'Stand five minutes in front of a full-length mirror without looking away, and say out loud three things about your body you genuinely accept.',
    category: 'physical_existential',
    targetTraits: {
      conscientiousness: 0.68,
      emotionalStability: 0.58,
      thrillSeeking: 0.45,
    },
    comfortLevel: 'moderate',
    requiresOutdoor: false,
    requiresSocial: false,
    minimumDurationMinutes: 30,
    fallbackQuestId: 23,
    questPace: 'instant',
  },
  {
    id: 236,
    title: 'L’Effort Jusqu’au Bout',
    description:
      "Choisir un effort physique et le pousser jusqu'au point où tu voudrais arrêter, puis continuer deux minutes de plus. Exactement deux.",
    titleEn: 'The Effort Past the Point',
    descriptionEn:
      'Pick a physical effort and push it to the point where you want to stop, then keep going two more minutes. Exactly two.',
    category: 'physical_existential',
    targetTraits: {
      conscientiousness: 0.78,
      emotionalStability: 0.68,
      thrillSeeking: 0.55,
    },
    comfortLevel: 'high',
    requiresOutdoor: false,
    requiresSocial: false,
    minimumDurationMinutes: 90,
    fallbackQuestId: 74,
    questPace: 'instant',
  },
  // ── async_discipline ────────────────────────────────────────────────────────
  {
    id: 6,
    title: "L'Entraînement de l'Aube",
    description:
      "Programmer une séance de sport seul, un matin de week-end, à une heure où personne ne se lève. Y aller sans musique, et ne l'annoncer à personne ni avant ni après.",
    titleEn: 'The Dawn Workout',
    descriptionEn:
      'Schedule a solo workout for a weekend morning, at an hour when nobody is up. Go without music, and tell nobody before or after.',
    category: 'async_discipline',
    targetTraits: {
      conscientiousness: 0.88,
      extraversion: 0.3,
      boredomSusceptibility: 0.3,
    },
    comfortLevel: 'moderate',
    requiresOutdoor: true,
    requiresSocial: false,
    minimumDurationMinutes: 60,
    fallbackQuestId: 196,
    questPace: 'instant',
  },
  {
    id: 86,
    title: 'La Règle des Trois Non',
    description:
      "Durant une journée, refuser explicitement trois demandes ou sollicitations (pro, sociales, familiales) que tu aurais normalement acceptées par réflexe. Dire « non » sans t'excuser, sans argumenter longuement. Noter tes réactions intérieures et celles des autres.",
    titleEn: 'The Rule of Three Nos',
    descriptionEn:
      "Over one day, explicitly refuse three requests (work, social, family) you would normally say yes to by reflex. Say 'no' without apologizing, without long arguments. Write down your inner reactions and the others'.",
    category: 'async_discipline',
    targetTraits: {
      conscientiousness: 0.72,
      emotionalStability: 0.62,
      agreeableness: 0.35,
      boredomSusceptibility: 0.25,
    },
    comfortLevel: 'moderate',
    requiresOutdoor: false,
    requiresSocial: false,
    minimumDurationMinutes: 30,
    fallbackQuestId: 188,
    questPace: 'instant',
  },
  {
    id: 187,
    title: "Le Contrat d'une Semaine",
    description:
      "Écrire sur papier un engagement précis et daté pour les sept prochains jours. Le signer. Le confier à quelqu'un en lui donnant explicitement le droit de te le rappeler. Une seule chose, pas trois.",
    titleEn: 'The One-Week Contract',
    descriptionEn:
      'Write down one precise, dated commitment for the next seven days. Sign it. Hand it to someone and explicitly give them the right to hold you to it. One thing, not three.',
    category: 'async_discipline',
    targetTraits: {
      conscientiousness: 0.95,
      emotionalStability: 0.65,
      boredomSusceptibility: 0.38,
    },
    comfortLevel: 'high',
    requiresOutdoor: false,
    requiresSocial: false,
    minimumDurationMinutes: 60,
    fallbackQuestId: 196,
    questPace: 'planned',
  },
  {
    id: 188,
    title: 'Le Réveil Sans Snooze',
    description:
      'Demain matin, sortir du lit à la première sonnerie. Poser les deux pieds au sol avant toute autre pensée. Le soir, écrire une phrase sur ce que ça a changé au reste de la journée.',
    titleEn: 'No Snooze',
    descriptionEn:
      'Tomorrow morning, get out of bed on the first alarm. Both feet on the floor before any other thought. That evening, write one line on what it changed about the rest of your day.',
    category: 'async_discipline',
    targetTraits: {
      conscientiousness: 0.86,
      emotionalStability: 0.55,
      boredomSusceptibility: 0.28,
    },
    comfortLevel: 'moderate',
    requiresOutdoor: false,
    requiresSocial: false,
    minimumDurationMinutes: 30,
    fallbackQuestId: 197,
    questPace: 'instant',
  },
  {
    id: 189,
    title: 'La Promesse Publique',
    description:
      'Annoncer à trois personnes distinctes une chose que tu vas faire cette semaine, avec la date exacte. À partir de maintenant, ne rien annoncer que tu ne feras pas.',
    titleEn: 'The Public Promise',
    descriptionEn:
      'Tell three separate people one thing you will do this week, with the exact date. From now on, announce nothing you will not do.',
    category: 'async_discipline',
    targetTraits: {
      conscientiousness: 0.95,
      emotionalStability: 0.65,
      boredomSusceptibility: 0.38,
    },
    comfortLevel: 'high',
    requiresOutdoor: false,
    requiresSocial: true,
    minimumDurationMinutes: 45,
    fallbackQuestId: 196,
    questPace: 'planned',
  },
  {
    id: 190,
    title: 'Le Projet Rouvert',
    description:
      "Reprendre pendant deux heures pleines un projet que tu as abandonné il y a plus de six mois. L'objectif n'est pas de le finir : c'est de le rouvrir et de tenir les deux heures sans t'échapper.",
    titleEn: 'The Reopened Project',
    descriptionEn:
      'Spend two full hours on a project you abandoned more than six months ago. The goal is not to finish it: it is to reopen it and hold the two hours without escaping.',
    category: 'async_discipline',
    targetTraits: {
      conscientiousness: 0.95,
      emotionalStability: 0.65,
      boredomSusceptibility: 0.38,
    },
    comfortLevel: 'high',
    requiresOutdoor: false,
    requiresSocial: false,
    minimumDurationMinutes: 120,
    fallbackQuestId: 187,
    questPace: 'planned',
  },
  {
    id: 191,
    title: 'La Journée Sans Retard',
    description:
      "Arriver en avance à chacun de tes rendez-vous d'aujourd'hui, sans exception. Observer ce que ça coûte en organisation, et ce que ça change dans le regard des autres.",
    titleEn: 'The Day Without Lateness',
    descriptionEn:
      'Arrive early to every single appointment today, no exceptions. Notice what it costs you to organize, and what it changes in how others look at you.',
    category: 'async_discipline',
    targetTraits: {
      conscientiousness: 0.86,
      emotionalStability: 0.55,
      boredomSusceptibility: 0.28,
    },
    comfortLevel: 'moderate',
    requiresOutdoor: false,
    requiresSocial: false,
    minimumDurationMinutes: 240,
    fallbackQuestId: 188,
    questPace: 'planned',
  },
  {
    id: 192,
    title: 'Le Chantier de Trois Heures',
    description:
      "Choisir la tâche que tu repousses depuis le plus longtemps et y consacrer trois heures d'affilée, téléphone dans une autre pièce. Ne pas viser la fin, viser les trois heures.",
    titleEn: 'The Three-Hour Push',
    descriptionEn:
      'Pick the task you have been putting off the longest and give it three unbroken hours, phone in another room. Do not aim to finish, aim for the three hours.',
    category: 'async_discipline',
    targetTraits: {
      conscientiousness: 0.95,
      emotionalStability: 0.65,
      boredomSusceptibility: 0.38,
    },
    comfortLevel: 'high',
    requiresOutdoor: false,
    requiresSocial: false,
    minimumDurationMinutes: 180,
    fallbackQuestId: 190,
    questPace: 'planned',
  },
  {
    id: 193,
    title: 'La Dette Réglée',
    description:
      "Identifier une dette non financière : un service dû, une réponse jamais donnée, une promesse oubliée. La solder entièrement aujourd'hui, et dire à la personne que tu sais que tu étais en retard.",
    titleEn: 'The Debt Settled',
    descriptionEn:
      'Identify one non-financial debt: a favor owed, an answer never given, a forgotten promise. Settle it in full today, and tell the person you know you were late.',
    category: 'async_discipline',
    targetTraits: {
      conscientiousness: 0.95,
      emotionalStability: 0.65,
      boredomSusceptibility: 0.38,
    },
    comfortLevel: 'high',
    requiresOutdoor: false,
    requiresSocial: true,
    minimumDurationMinutes: 60,
    fallbackQuestId: 189,
    questPace: 'planned',
  },
  {
    id: 194,
    title: 'Le Seuil Tenu',
    description:
      "Fixer maintenant ton heure de coucher de ce soir et la respecter à cinq minutes près, quoi qu'il arrive. Noter ce que tu as dû interrompre pour y arriver.",
    titleEn: 'The Line Held',
    descriptionEn:
      'Set your bedtime for tonight right now and hold it to within five minutes, whatever happens. Write down what you had to cut short to get there.',
    category: 'async_discipline',
    targetTraits: {
      conscientiousness: 0.86,
      emotionalStability: 0.55,
      boredomSusceptibility: 0.28,
    },
    comfortLevel: 'moderate',
    requiresOutdoor: false,
    requiresSocial: false,
    minimumDurationMinutes: 90,
    fallbackQuestId: 188,
    questPace: 'instant',
  },
  {
    id: 195,
    title: 'La Reprise du Lendemain',
    description:
      "Refaire demain, exactement à la même heure, l'activité difficile que tu as faite aujourd'hui. Sans la nouveauté pour te porter, sans témoin, sans raison de le faire à part l'avoir décidé.",
    titleEn: 'The Second Run',
    descriptionEn:
      'Tomorrow, at exactly the same hour, repeat the hard thing you did today. No novelty to carry you, no witness, no reason beyond having decided it.',
    category: 'async_discipline',
    targetTraits: {
      conscientiousness: 0.95,
      emotionalStability: 0.73,
      boredomSusceptibility: 0.46,
    },
    comfortLevel: 'extreme',
    requiresOutdoor: false,
    requiresSocial: false,
    minimumDurationMinutes: 240,
    fallbackQuestId: 190,
    questPace: 'planned',
  },
  {
    id: 196,
    title: 'Le Refus Écrit',
    description:
      'Lister par écrit cinq choses auxquelles tu dis oui par habitude plutôt que par envie. En choisir une et la supprimer définitivement de ta vie cette semaine.',
    titleEn: 'The Written Refusal',
    descriptionEn:
      'List five things you say yes to out of habit rather than desire. Pick one and remove it from your life for good this week.',
    category: 'async_discipline',
    targetTraits: {
      conscientiousness: 0.86,
      emotionalStability: 0.55,
      boredomSusceptibility: 0.28,
    },
    comfortLevel: 'moderate',
    requiresOutdoor: false,
    requiresSocial: false,
    minimumDurationMinutes: 45,
    fallbackQuestId: 197,
    questPace: 'instant',
  },
  {
    id: 197,
    title: 'L’Engagement du Matin',
    description:
      "Au réveil, décider d'une seule chose à accomplir avant midi. L'écrire. Ne rien entreprendre d'autre tant qu'elle n'est pas faite.",
    titleEn: 'The Morning Commitment',
    descriptionEn:
      'On waking, decide on one single thing to finish before noon. Write it down. Start nothing else until it is done.',
    category: 'async_discipline',
    targetTraits: {
      conscientiousness: 0.86,
      emotionalStability: 0.55,
      boredomSusceptibility: 0.28,
    },
    comfortLevel: 'moderate',
    requiresOutdoor: false,
    requiresSocial: false,
    minimumDurationMinutes: 30,
    fallbackQuestId: 86,
    questPace: 'instant',
  },
  // ── dopamine_detox ──────────────────────────────────────────────────────────
  {
    id: 7,
    title: 'La Détox Digitale',
    description:
      "Supprimer les réseaux sociaux de ton téléphone pour vingt-quatre heures — les supprimer, pas les mettre en veille. Le lendemain, noter combien de fois ta main a cherché l'app absente, et ce que tu as fait à la place.",
    titleEn: 'The Digital Detox',
    descriptionEn:
      'Delete social apps from your phone for twenty-four hours: delete them, do not just mute them. The next day, note how many times your hand reached for the missing app, and what you did instead.',
    category: 'dopamine_detox',
    targetTraits: {
      conscientiousness: 0.82,
      boredomSusceptibility: 0.2,
      emotionalStability: 0.68,
    },
    comfortLevel: 'high',
    requiresOutdoor: false,
    requiresSocial: false,
    minimumDurationMinutes: 240,
    fallbackQuestId: 15,
    questPace: 'planned',
  },
  {
    id: 15,
    title: 'La Lecture Profonde',
    description:
      "Lire cinquante pages d'un livre exigeant dans la même journée, téléphone dans une autre pièce. À la fin, écrire une page sur ce que tu n'as pas compris plutôt que sur ce que tu as retenu.",
    titleEn: 'Deep Reading',
    descriptionEn:
      'Read fifty pages of a demanding book in one day, phone in another room. At the end, write a page on what you did not understand rather than what you took away.',
    category: 'dopamine_detox',
    targetTraits: {
      conscientiousness: 0.8,
      boredomSusceptibility: 0.25,
      openness: 0.7,
    },
    comfortLevel: 'high',
    requiresOutdoor: false,
    requiresSocial: false,
    minimumDurationMinutes: 240,
    fallbackQuestId: 7,
    questPace: 'instant',
  },
  {
    id: 30,
    title: 'La Soirée Analogique',
    description:
      'Une soirée complète sans aucun écran après une heure fixée (lecture papier, conversation, repos).',
    titleEn: 'The Analog Evening',
    descriptionEn:
      'A full evening with no screens after a set hour (paper reading, conversation, rest).',
    category: 'dopamine_detox',
    targetTraits: {
      conscientiousness: 0.68,
      boredomSusceptibility: 0.35,
      emotionalStability: 0.6,
    },
    comfortLevel: 'moderate',
    requiresOutdoor: false,
    requiresSocial: false,
    minimumDurationMinutes: 180,
    fallbackQuestId: 43,
    questPace: 'instant',
  },
  {
    id: 43,
    title: "L'Heure Sans Ping",
    description:
      'Une heure sans notification ni badge : mode avion partiel ou réglages, une seule activité à la fois.',
    titleEn: 'The Hour Without Pings',
    descriptionEn:
      'One hour with no notifications or badges—partial airplane mode or settings, one activity only.',
    category: 'dopamine_detox',
    targetTraits: {
      conscientiousness: 0.78,
      boredomSusceptibility: 0.35,
      emotionalStability: 0.6,
    },
    comfortLevel: 'moderate',
    requiresOutdoor: false,
    requiresSocial: false,
    minimumDurationMinutes: 60,
    fallbackQuestId: 56,
    questPace: 'instant',
  },
  {
    id: 56,
    title: 'Le Repas Hors Pièce',
    description:
      'Pour un repas complet, laisser téléphone et tablette hors de la pièce où tu manges.',
    titleEn: 'The Meal Outside the Room',
    descriptionEn:
      'For one full meal, leave phone and tablet outside the room where you eat.',
    category: 'dopamine_detox',
    targetTraits: {
      conscientiousness: 0.72,
      boredomSusceptibility: 0.38,
      emotionalStability: 0.58,
    },
    comfortLevel: 'low',
    requiresOutdoor: false,
    requiresSocial: false,
    minimumDurationMinutes: 45,
    fallbackQuestId: 84,
    questPace: 'instant',
  },
  {
    id: 64,
    title: 'Le Soir Sans Flux',
    description:
      "Après une heure fixée, aucun écran ni flux jusqu'au coucher (lecture papier, conversation, repos).",
    titleEn: 'The No-Feed Evening',
    descriptionEn:
      'After a set hour, no screens or feeds until bed (paper, conversation, rest).',
    category: 'dopamine_detox',
    targetTraits: {
      conscientiousness: 0.78,
      boredomSusceptibility: 0.28,
      emotionalStability: 0.62,
    },
    comfortLevel: 'high',
    requiresOutdoor: false,
    requiresSocial: false,
    minimumDurationMinutes: 120,
    fallbackQuestId: 245,
    questPace: 'instant',
  },
  {
    id: 80,
    title: 'La Journée en Langue Étrangère',
    description:
      "Passer une journée entière à ne consommer que du contenu dans une langue que tu ne maîtrises pas : musique, podcasts, films sans sous-titres, articles dans la langue d'origine. Écrire à la fin de la journée cinq mots que tu auras compris ou retenus.",
    titleEn: 'The Foreign-Language Day',
    descriptionEn:
      "Spend an entire day consuming only content in a language you don't master: music, podcasts, films with no subtitles, articles in the original language. At the end of the day, write down five words you caught or remembered.",
    category: 'dopamine_detox',
    targetTraits: {
      openness: 0.85,
      conscientiousness: 0.75,
      boredomSusceptibility: 0.7,
    },
    comfortLevel: 'high',
    requiresOutdoor: false,
    requiresSocial: false,
    minimumDurationMinutes: 240,
    fallbackQuestId: 15,
    questPace: 'planned',
  },
  {
    id: 84,
    title: 'La Photo Unique',
    description:
      "Ne prendre qu'UNE SEULE photo de toute la journée. Choisir consciemment le moment — attendre, rater des occasions, résister. Le reste du temps, regarder à l'œil nu, sans capture. Le soir, écrire en une phrase pourquoi ce moment-là précisément.",
    titleEn: 'The Single Photo',
    descriptionEn:
      'Take only ONE photo the entire day. Choose the moment consciously — wait, miss opportunities, resist. The rest of the day, look with your eyes only, no capture. At night, write a single sentence on why that moment, precisely.',
    category: 'dopamine_detox',
    targetTraits: {
      conscientiousness: 0.7,
      emotionalStability: 0.55,
      boredomSusceptibility: 0.3,
      openness: 0.55,
    },
    comfortLevel: 'low',
    requiresOutdoor: false,
    requiresSocial: false,
    minimumDurationMinutes: 30,
    fallbackQuestId: 9,
    questPace: 'instant',
  },
  {
    id: 243,
    title: 'Le Week-end Hors-Ligne',
    description:
      "Un week-end entier sans téléphone : l'éteindre et le ranger dans un tiroir du vendredi soir au dimanche soir. Prévenir avant qui doit l'être.",
    titleEn: 'The Offline Weekend',
    descriptionEn:
      'A full weekend without your phone: switch it off and put it in a drawer from Friday evening to Sunday evening. Warn beforehand whoever needs warning.',
    category: 'dopamine_detox',
    targetTraits: {
      conscientiousness: 0.92,
      boredomSusceptibility: 0.46,
      emotionalStability: 0.8,
    },
    comfortLevel: 'extreme',
    requiresOutdoor: false,
    requiresSocial: false,
    minimumDurationMinutes: 240,
    fallbackQuestId: 7,
    questPace: 'planned',
  },
  {
    id: 244,
    title: 'La Désinstallation',
    description:
      "Relever ton temps d'écran de la semaine, puis désinstaller pour sept jours l'application qui te prend le plus de temps. Relever à nouveau dans une semaine.",
    titleEn: 'The Uninstall',
    descriptionEn:
      'Check your screen time for the week, then uninstall for seven days the app that takes the most of it. Check again in a week.',
    category: 'dopamine_detox',
    targetTraits: {
      conscientiousness: 0.84,
      boredomSusceptibility: 0.38,
      emotionalStability: 0.72,
    },
    comfortLevel: 'high',
    requiresOutdoor: false,
    requiresSocial: false,
    minimumDurationMinutes: 30,
    fallbackQuestId: 84,
    questPace: 'instant',
  },
  {
    id: 245,
    title: 'Le Silence Numérique',
    description:
      "Ne répondre à aucun message, mail ou notification pendant une journée complète. Ne prévenir personne à l'avance.",
    titleEn: 'The Digital Silence',
    descriptionEn:
      'Reply to no message, email or notification for a full day. Warn nobody in advance.',
    category: 'dopamine_detox',
    targetTraits: {
      conscientiousness: 0.84,
      boredomSusceptibility: 0.38,
      emotionalStability: 0.72,
    },
    comfortLevel: 'high',
    requiresOutdoor: false,
    requiresSocial: false,
    minimumDurationMinutes: 120,
    fallbackQuestId: 64,
    questPace: 'planned',
  },
  {
    id: 246,
    title: 'La Journée Sans Recommandation',
    description:
      "Une journée sans rien consommer qu'un algorithme t'a proposé : musique, vidéos, articles, tout doit venir d'un choix que tu as fait toi-même.",
    titleEn: 'The Day Without Recommendations',
    descriptionEn:
      'A day consuming nothing an algorithm suggested: music, video, articles, all of it must come from a choice you made yourself.',
    category: 'dopamine_detox',
    targetTraits: {
      conscientiousness: 0.74,
      boredomSusceptibility: 0.28,
      emotionalStability: 0.62,
    },
    comfortLevel: 'moderate',
    requiresOutdoor: false,
    requiresSocial: false,
    minimumDurationMinutes: 240,
    fallbackQuestId: 84,
    questPace: 'planned',
  },
  {
    id: 247,
    title: 'Le Téléphone Confié',
    description:
      "Confier ton téléphone à quelqu'un pour une journée entière, avec l'interdiction explicite de te le rendre avant le soir, même si tu le réclames.",
    titleEn: 'The Phone Handed Over',
    descriptionEn:
      'Give your phone to someone for a full day, with explicit instructions not to give it back before evening, even if you ask.',
    category: 'dopamine_detox',
    targetTraits: {
      conscientiousness: 0.84,
      boredomSusceptibility: 0.38,
      emotionalStability: 0.72,
    },
    comfortLevel: 'high',
    requiresOutdoor: false,
    requiresSocial: true,
    minimumDurationMinutes: 240,
    fallbackQuestId: 245,
    questPace: 'planned',
  },
  // ── active_empathy ──────────────────────────────────────────────────────────
  {
    id: 8,
    title: 'Le Pont Humain',
    description:
      "Engager avec un inconnu une conversation qui dépasse trois échanges. Poser au moins deux questions sur lui avant de dire quoi que ce soit sur toi. Ne pas partir avant d'avoir appris une chose que tu n'aurais pas devinée.",
    titleEn: 'The Human Bridge',
    descriptionEn:
      'Start a conversation with a stranger that goes beyond three exchanges. Ask at least two questions about them before saying anything about yourself. Do not leave before learning one thing you could not have guessed.',
    category: 'active_empathy',
    targetTraits: {
      extraversion: 0.82,
      agreeableness: 0.65,
      openness: 0.68,
      thrillSeeking: 0.5,
    },
    comfortLevel: 'high',
    requiresOutdoor: true,
    requiresSocial: true,
    minimumDurationMinutes: 30,
    fallbackQuestId: 57,
    questPace: 'planned',
  },
  {
    id: 14,
    title: 'Le Regret des Anciens',
    description:
      'Demander à une personne bien plus âgée que toi quel est son plus grand regret. Tenir le silence après la question, ne pas la sauver, ne rien relativiser. Le soir même, noter sa réponse mot pour mot.',
    titleEn: "The Elders' Regret",
    descriptionEn:
      'Ask someone much older than you what their greatest regret is. Hold the silence after the question, do not rescue them, soften nothing. That same evening, write their answer down word for word.',
    category: 'active_empathy',
    targetTraits: {
      agreeableness: 0.8,
      emotionalStability: 0.75,
      openness: 0.62,
    },
    comfortLevel: 'high',
    requiresOutdoor: false,
    requiresSocial: true,
    minimumDurationMinutes: 45,
    fallbackQuestId: 8,
    questPace: 'planned',
  },
  {
    id: 31,
    title: "L'Écoute Profonde",
    description:
      "Poser une question ouverte à quelqu'un et ne parler que pour reformuler ou approfondir pendant 10 minutes.",
    titleEn: 'Deep Listening',
    descriptionEn:
      'Ask someone an open question and only speak to rephrase or go deeper for 10 minutes.',
    category: 'active_empathy',
    targetTraits: {
      agreeableness: 0.78,
      conscientiousness: 0.72,
      boredomSusceptibility: 0.25,
    },
    comfortLevel: 'low',
    requiresOutdoor: false,
    requiresSocial: true,
    minimumDurationMinutes: 15,
    fallbackQuestId: 68,
    questPace: 'planned',
  },
  {
    id: 44,
    title: 'Le Miroir de Phrases',
    description:
      "Réformuler deux fois ce que l'autre vient de dire avant d'ajouter une seule phrase à toi.",
    titleEn: 'The Phrase Mirror',
    descriptionEn:
      'Rephrase twice what the other person said before adding a single sentence of your own.',
    category: 'active_empathy',
    targetTraits: {
      openness: 0.75,
      agreeableness: 0.7,
      conscientiousness: 0.62,
    },
    comfortLevel: 'moderate',
    requiresOutdoor: false,
    requiresSocial: true,
    minimumDurationMinutes: 20,
    fallbackQuestId: 31,
    questPace: 'planned',
  },
  {
    id: 57,
    title: 'Le Silence des Deux',
    description:
      "Après avoir posé une question à quelqu'un, attendre deux minutes en silence avant de reformuler ou répondre.",
    titleEn: 'The Silence of Two',
    descriptionEn:
      'After asking someone a question, wait two minutes in silence before you rephrase or answer.',
    category: 'active_empathy',
    targetTraits: {
      emotionalStability: 0.78,
      extraversion: 0.38,
      conscientiousness: 0.65,
      boredomSusceptibility: 0.2,
    },
    comfortLevel: 'high',
    requiresOutdoor: false,
    requiresSocial: true,
    minimumDurationMinutes: 25,
    fallbackQuestId: 31,
    questPace: 'planned',
  },
  {
    id: 65,
    title: 'Les Trois Pourquoi',
    description:
      "Face à quelqu'un qui te confie un souci, poser « pourquoi » jusqu'à trois fois avec douceur avant de conseiller.",
    titleEn: 'The Three Whys',
    descriptionEn:
      'When someone shares a worry, ask “why” up to three times gently before advising.',
    category: 'active_empathy',
    targetTraits: {
      openness: 0.72,
      agreeableness: 0.75,
      conscientiousness: 0.58,
      emotionalStability: 0.55,
    },
    comfortLevel: 'moderate',
    requiresOutdoor: false,
    requiresSocial: true,
    minimumDurationMinutes: 25,
    fallbackQuestId: 44,
    questPace: 'planned',
  },
  {
    id: 68,
    title: 'Le Vocal Bref',
    description:
      'Envoyer un message vocal de 30 secondes à un proche pour dire précisément ce que tu apprécies chez lui ou elle — pas un texte, un vocal.',
    titleEn: 'The Brief Voice Note',
    descriptionEn:
      'Send a 30-second voice note to someone close, saying precisely what you appreciate about them — not a text, a voice note.',
    category: 'active_empathy',
    targetTraits: {
      agreeableness: 0.72,
      extraversion: 0.45,
      openness: 0.45,
    },
    comfortLevel: 'low',
    requiresOutdoor: false,
    requiresSocial: true,
    minimumDurationMinutes: 15,
    fallbackQuestId: 31,
    questPace: 'instant',
  },
  {
    id: 69,
    title: 'La Question Sincère',
    description:
      "Lors d'une conversation banale aujourd'hui avec un proche ou un collègue, poser une seule question sincère (« comment tu te sens vraiment ces temps-ci ? ») et écouter la réponse sans enchaîner.",
    titleEn: 'The Sincere Question',
    descriptionEn:
      "In a casual conversation today with someone close or a colleague, ask one sincere question ('how are you really doing these days?') and listen to the answer without moving on.",
    category: 'active_empathy',
    targetTraits: {
      agreeableness: 0.78,
      extraversion: 0.5,
      emotionalStability: 0.55,
    },
    comfortLevel: 'moderate',
    requiresOutdoor: false,
    requiresSocial: true,
    minimumDurationMinutes: 20,
    fallbackQuestId: 44,
    questPace: 'instant',
  },
  {
    id: 83,
    title: "Le Cahier de l'Étranger",
    description:
      "Aborder un inconnu (parc, café, transport long) et lui proposer de l'interviewer 15 minutes sur sa vie, sans prendre la parole sauf pour poser des questions. Noter ses mots exacts dans un cahier. À la fin, relire à voix haute une courte synthèse de ses mots — les siens, pas les tiens — avant de partir.",
    titleEn: "The Stranger's Notebook",
    descriptionEn:
      'Approach a stranger (park, café, long-distance commute) and offer to interview them for 15 minutes about their life, speaking only to ask questions. Write down their exact words in a notebook. At the end, read aloud a short synthesis of their own words — theirs, not yours — before leaving.',
    category: 'active_empathy',
    targetTraits: {
      agreeableness: 0.78,
      openness: 0.75,
      conscientiousness: 0.65,
    },
    comfortLevel: 'high',
    requiresOutdoor: true,
    requiresSocial: true,
    minimumDurationMinutes: 45,
    fallbackQuestId: 31,
    questPace: 'planned',
  },
  {
    id: 147,
    title: "L'Écoute Sans Conseil",
    description:
      'Dans ta prochaine conversation un peu sérieuse, ne donner aucun conseil. Poser deux questions avant de répondre.',
    titleEn: 'Listening Without Advice',
    descriptionEn:
      'In your next serious conversation, give no advice. Ask two questions before answering.',
    category: 'active_empathy',
    targetTraits: {
      agreeableness: 0.68,
      conscientiousness: 0.55,
      emotionalStability: 0.55,
    },
    comfortLevel: 'moderate',
    requiresOutdoor: false,
    requiresSocial: true,
    minimumDurationMinutes: 20,
    fallbackQuestId: 31,
    questPace: 'instant',
  },
  {
    id: 150,
    title: 'Le Retour Précis',
    description:
      "Dire à quelqu'un aujourd'hui une qualité concrète de lui, avec un exemple précis où tu l'as vue.",
    titleEn: 'The Precise Feedback',
    descriptionEn:
      'Tell someone today a concrete strength of theirs, with a precise example where you saw it.',
    category: 'active_empathy',
    targetTraits: {
      agreeableness: 0.68,
      conscientiousness: 0.58,
      extraversion: 0.45,
    },
    comfortLevel: 'low',
    requiresOutdoor: false,
    requiresSocial: true,
    minimumDurationMinutes: 15,
    fallbackQuestId: 31,
    questPace: 'instant',
  },
  {
    id: 256,
    title: 'L’Heure d’un Ancien',
    description:
      'Demander à une personne de plus de soixante-dix ans de te raconter une heure de sa jeunesse. Enregistrer avec son accord. Ne jamais parler de toi.',
    titleEn: 'An Hour of an Elder',
    descriptionEn:
      'Ask someone over seventy to tell you an hour of their youth. Record it with their consent. Never talk about yourself.',
    category: 'active_empathy',
    targetTraits: {
      agreeableness: 0.86,
      openness: 0.74,
      emotionalStability: 0.76,
    },
    comfortLevel: 'high',
    requiresOutdoor: false,
    requiresSocial: true,
    minimumDurationMinutes: 120,
    fallbackQuestId: 14,
    questPace: 'planned',
  },
  {
    id: 257,
    title: 'Le Point de Vue Adverse',
    description:
      "Trouver quelqu'un dont tu ne partages pas les convictions et lui demander de te les expliquer jusqu'à ce que tu puisses les reformuler mieux que lui.",
    titleEn: 'The Opposing View',
    descriptionEn:
      'Find someone whose convictions you do not share and have them explain until you can restate their position better than they can.',
    category: 'active_empathy',
    targetTraits: {
      agreeableness: 0.86,
      openness: 0.74,
      emotionalStability: 0.76,
    },
    comfortLevel: 'high',
    requiresOutdoor: false,
    requiresSocial: true,
    minimumDurationMinutes: 90,
    fallbackQuestId: 65,
    questPace: 'instant',
  },
  {
    id: 258,
    title: 'La Journée Sans Je',
    description:
      'Passer une journée entière de conversations sans jamais commencer une phrase par « je ». Observer le soir ce que cette contrainte a déplacé.',
    titleEn: 'The Day Without I',
    descriptionEn:
      'Spend a full day of conversations never starting a sentence with "I". In the evening, note what that constraint moved.',
    category: 'active_empathy',
    targetTraits: {
      agreeableness: 0.94,
      openness: 0.82,
      emotionalStability: 0.84,
    },
    comfortLevel: 'extreme',
    requiresOutdoor: false,
    requiresSocial: true,
    minimumDurationMinutes: 240,
    fallbackQuestId: 257,
    questPace: 'planned',
  },
  // ── temporal_projection ─────────────────────────────────────────────────────
  {
    id: 9,
    title: 'La Lettre au Futur',
    description:
      "Écrire à la main une lettre à la personne que tu veux être dans cinq ans : ce que tu espères qu'elle aura gardé, ce que tu espères qu'elle aura lâché. La ranger dans un endroit où tu la retrouveras par accident.",
    titleEn: 'The Letter to the Future',
    descriptionEn:
      'Handwrite a letter to the person you want to be in five years: what you hope they kept, what you hope they let go of. Put it somewhere you will come across it by accident.',
    category: 'temporal_projection',
    targetTraits: {
      openness: 0.55,
      conscientiousness: 0.68,
    },
    comfortLevel: 'low',
    requiresOutdoor: false,
    requiresSocial: false,
    minimumDurationMinutes: 45,
    fallbackQuestId: 9,
    questPace: 'instant',
  },
  {
    id: 16,
    title: 'Le Narrateur Intérieur',
    description:
      'Écrire une page de ta journée à la troisième personne, comme un narrateur qui décrirait un personnage : ses gestes, ses évitements, ses petits mensonges. La relire à voix haute.',
    titleEn: 'The Inner Narrator',
    descriptionEn:
      'Write a page about your day in the third person, like a narrator describing a character: their gestures, their avoidances, their small lies. Read it out loud.',
    category: 'temporal_projection',
    targetTraits: {
      openness: 0.72,
      conscientiousness: 0.55,
    },
    comfortLevel: 'moderate',
    requiresOutdoor: false,
    requiresSocial: false,
    minimumDurationMinutes: 60,
    fallbackQuestId: 9,
    questPace: 'instant',
  },
  {
    id: 20,
    title: 'La Vie Hardie',
    description:
      "Nommer par écrit les trois moments où tu sais que tu t'es dégonflé. Puis écrire trois pages de l'histoire de ta vie telle qu'elle aurait été si tu avais tenu bon à ces trois moments-là.",
    titleEn: 'The Bold Life',
    descriptionEn:
      'Write down the three moments you know you backed down. Then write three pages of your life story as it would have gone if you had held your ground at those three moments.',
    category: 'temporal_projection',
    targetTraits: {
      openness: 0.82,
      emotionalStability: 0.68,
      thrillSeeking: 0.5,
    },
    comfortLevel: 'high',
    requiresOutdoor: false,
    requiresSocial: false,
    minimumDurationMinutes: 120,
    fallbackQuestId: 9,
    questPace: 'instant',
  },
  {
    id: 21,
    title: 'La Bande-Son du Futur',
    description:
      "Composer une playlist d'une heure pour la version de toi que tu es en train de devenir, pas celle que tu as été. L'écouter en entier une fois, en marchant, sans rien faire d'autre.",
    titleEn: 'The Future Soundtrack',
    descriptionEn:
      'Build a one-hour playlist for the version of you that you are becoming, not the one you have been. Listen to all of it once, walking, doing nothing else.',
    category: 'temporal_projection',
    targetTraits: {
      openness: 0.75,
      conscientiousness: 0.5,
      boredomSusceptibility: 0.35,
    },
    comfortLevel: 'moderate',
    requiresOutdoor: true,
    requiresSocial: false,
    minimumDurationMinutes: 60,
    fallbackQuestId: 9,
    questPace: 'instant',
  },
  {
    id: 32,
    title: 'La Lettre du Non',
    description:
      'Écrire une page adressée à une version de toi qui dit toujours non par peur : ce que tu lui refuserais encore.',
    titleEn: 'The Letter of No',
    descriptionEn:
      "Write a page to a version of you who always says no out of fear: what you'd still refuse.",
    category: 'temporal_projection',
    targetTraits: {
      openness: 0.65,
      emotionalStability: 0.7,
      conscientiousness: 0.55,
    },
    comfortLevel: 'high',
    requiresOutdoor: false,
    requiresSocial: false,
    minimumDurationMinutes: 45,
    fallbackQuestId: 9,
    questPace: 'instant',
  },
  {
    id: 45,
    title: 'Les Trois Futurs',
    description:
      'Écrire en trois paragraphes : ton futur dans un mois, dans un an, dans dix ans — sans juger le texte.',
    titleEn: 'The Three Futures',
    descriptionEn:
      'Write three paragraphs: your future in one month, one year, ten years—without judging the draft.',
    category: 'temporal_projection',
    targetTraits: {
      openness: 0.65,
      conscientiousness: 0.62,
    },
    comfortLevel: 'moderate',
    requiresOutdoor: false,
    requiresSocial: false,
    minimumDurationMinutes: 60,
    fallbackQuestId: 9,
    questPace: 'instant',
  },
  {
    id: 58,
    title: 'La Frise des Cinq Ans',
    description:
      'Sur une page, dessiner une frise des cinq dernières années avec au moins cinq jalons datés.',
    titleEn: 'The Five-Year Timeline',
    descriptionEn:
      'On one page, draw a timeline of the last five years with at least five dated milestones.',
    category: 'temporal_projection',
    targetTraits: {
      openness: 0.55,
      conscientiousness: 0.7,
    },
    comfortLevel: 'moderate',
    requiresOutdoor: false,
    requiresSocial: false,
    minimumDurationMinutes: 50,
    fallbackQuestId: 9,
    questPace: 'instant',
  },
  {
    id: 78,
    title: 'La Lettre aux Dix Ans',
    description:
      "Écrire à toi-même dans dix ans exactement : qui tu veux être, ce que tu espères avoir fait, ce que tu as peur de devenir. Trois pages minimum, manuscrit. Puis programmer son envoi via un service de lettre future (futureme.org) pour l'ouvrir à la date exacte.",
    titleEn: 'The Ten-Year Letter',
    descriptionEn:
      'Write to yourself ten years from now exactly: who you want to be, what you hope to have done, what you fear becoming. Three pages minimum, handwritten. Then schedule its delivery via a future-letter service (futureme.org) to open on the exact date.',
    category: 'temporal_projection',
    targetTraits: {
      openness: 0.72,
      conscientiousness: 0.7,
      emotionalStability: 0.6,
      boredomSusceptibility: 0.25,
    },
    comfortLevel: 'extreme',
    requiresOutdoor: false,
    requiresSocial: false,
    minimumDurationMinutes: 180,
    fallbackQuestId: 9,
    questPace: 'planned',
  },
  {
    id: 85,
    title: 'La Lettre aux Six Mois',
    description:
      "Écrire à la main (pas au clavier) une lettre à toi-même datée de six mois dans le futur. La sceller dans une enveloppe avec la date d'ouverture écrite dessus. La déposer chez un ami de confiance ou dans un lieu caché (boîte verrouillée, livre rangé) que tu t'engages à revisiter à cette date précise.",
    titleEn: 'The Six-Month Letter',
    descriptionEn:
      "Handwrite (not type) a letter to yourself dated six months in the future. Seal it in an envelope with the opening date written on it. Drop it at a trusted friend's or in a hidden place (locked box, shelved book) you commit to revisit on that exact date.",
    category: 'temporal_projection',
    targetTraits: {
      conscientiousness: 0.65,
      openness: 0.62,
      emotionalStability: 0.55,
    },
    comfortLevel: 'moderate',
    requiresOutdoor: false,
    requiresSocial: false,
    minimumDurationMinutes: 40,
    fallbackQuestId: 9,
    questPace: 'instant',
  },
  {
    id: 248,
    title: 'L’Épitaphe',
    description:
      "Écrire honnêtement le texte qu'on lirait à ton enterrement si tu mourais demain. Puis écrire celui que tu voudrais qu'on lise. Comparer les deux et souligner l'écart.",
    titleEn: 'The Eulogy',
    descriptionEn:
      'Honestly write the text that would be read at your funeral if you died tomorrow. Then write the one you would want read. Compare the two and underline the gap.',
    category: 'temporal_projection',
    targetTraits: {
      openness: 0.92,
      emotionalStability: 0.84,
      conscientiousness: 0.73,
    },
    comfortLevel: 'extreme',
    requiresOutdoor: false,
    requiresSocial: false,
    minimumDurationMinutes: 90,
    fallbackQuestId: 250,
    questPace: 'planned',
  },
  {
    id: 249,
    title: 'La Liste des Renoncements',
    description:
      'Lister dix choses que tu as décidé, sans jamais le dire, que tu ne feras jamais. En choisir une et la rayer de la liste pour cette année.',
    titleEn: 'The List of Givens-Up',
    descriptionEn:
      'List ten things you have quietly decided you will never do. Pick one and cross it off the list for this year.',
    category: 'temporal_projection',
    targetTraits: {
      openness: 0.84,
      emotionalStability: 0.76,
      conscientiousness: 0.65,
    },
    comfortLevel: 'high',
    requiresOutdoor: false,
    requiresSocial: false,
    minimumDurationMinutes: 60,
    fallbackQuestId: 32,
    questPace: 'instant',
  },
  {
    id: 250,
    title: 'Le Compte à Rebours',
    description:
      'Calculer combien de fois il te reste statistiquement à voir tes parents, à voir un été, à lire un livre. Écrire ce que ces trois chiffres changent à ta semaine.',
    titleEn: 'The Countdown',
    descriptionEn:
      'Work out how many times you have left, statistically, to see your parents, to see a summer, to read a book. Write what those three numbers change about your week.',
    category: 'temporal_projection',
    targetTraits: {
      openness: 0.84,
      emotionalStability: 0.76,
      conscientiousness: 0.65,
    },
    comfortLevel: 'high',
    requiresOutdoor: false,
    requiresSocial: false,
    minimumDurationMinutes: 90,
    fallbackQuestId: 249,
    questPace: 'planned',
  },
  {
    id: 251,
    title: 'La Lettre au Passé',
    description:
      'Écrire à toi-même il y a cinq ans : ce que tu lui dirais, et surtout ce que tu lui cacherais volontairement.',
    titleEn: 'The Letter to the Past',
    descriptionEn:
      'Write to yourself five years ago: what you would tell them, and above all what you would deliberately keep from them.',
    category: 'temporal_projection',
    targetTraits: {
      openness: 0.74,
      emotionalStability: 0.66,
      conscientiousness: 0.55,
    },
    comfortLevel: 'moderate',
    requiresOutdoor: false,
    requiresSocial: false,
    minimumDurationMinutes: 60,
    fallbackQuestId: 9,
    questPace: 'instant',
  },
  // ── hostile_immersion ───────────────────────────────────────────────────────
  {
    id: 10,
    title: "L'Immersion Totale",
    description:
      "Aller à un événement où tu ne connais personne et où personne ne t'attend. Interdiction de repartir avant d'avoir eu une vraie conversation avec deux personnes différentes.",
    titleEn: 'Total Immersion',
    descriptionEn:
      'Go to an event where you know nobody and nobody expects you. You may not leave before having a real conversation with two different people.',
    category: 'hostile_immersion',
    targetTraits: {
      extraversion: 0.85,
      thrillSeeking: 0.75,
      emotionalStability: 0.78,
    },
    comfortLevel: 'extreme',
    requiresOutdoor: true,
    requiresSocial: true,
    minimumDurationMinutes: 180,
    fallbackQuestId: 33,
    questPace: 'planned',
  },
  {
    id: 33,
    title: "L'Autre Monde",
    description:
      "Passer au moins une heure dans un lieu où tu te sens minoritaire (langue, âge, scène) et rester jusqu'à être un peu à l'aise.",
    titleEn: 'The Other World',
    descriptionEn:
      'Spend at least an hour somewhere you feel in the minority (language, age, scene) until you settle a bit.',
    category: 'hostile_immersion',
    targetTraits: {
      extraversion: 0.65,
      openness: 0.78,
      emotionalStability: 0.8,
      thrillSeeking: 0.6,
    },
    comfortLevel: 'extreme',
    requiresOutdoor: true,
    requiresSocial: true,
    minimumDurationMinutes: 120,
    fallbackQuestId: 260,
    questPace: 'planned',
  },
  {
    id: 46,
    title: 'La Première Main Levée',
    description:
      'Dans un groupe (réunion, cours, apéro), prendre la parole une première fois même si la voix tremble.',
    titleEn: 'The First Hand Raised',
    descriptionEn:
      'In a group (meeting, class, drinks), speak up once even if your voice shakes.',
    category: 'hostile_immersion',
    targetTraits: {
      extraversion: 0.78,
      emotionalStability: 0.72,
      thrillSeeking: 0.55,
    },
    comfortLevel: 'extreme',
    requiresOutdoor: false,
    requiresSocial: true,
    minimumDurationMinutes: 90,
    fallbackQuestId: 59,
    questPace: 'planned',
  },
  {
    id: 59,
    title: 'Le Stand Inconnu',
    description:
      "Traverser seul l'entrée d'un salon, d'une foire ou d'un forum et poser une question précise à un exposant.",
    titleEn: 'The Unknown Booth',
    descriptionEn:
      'Enter a fair or expo alone and ask one specific question to an exhibitor.',
    category: 'hostile_immersion',
    targetTraits: {
      extraversion: 0.72,
      openness: 0.65,
      emotionalStability: 0.7,
      thrillSeeking: 0.55,
    },
    comfortLevel: 'extreme',
    requiresOutdoor: false,
    requiresSocial: true,
    minimumDurationMinutes: 75,
    fallbackQuestId: 259,
    questPace: 'planned',
  },
  {
    id: 72,
    title: 'Le Désaccord Tenu',
    description:
      "Dans une conversation aujourd'hui (réunion, repas, discussion en ligne), exprimer un désaccord franc sur un point précis sans l'adoucir et tenir la position 30 secondes face à la réaction.",
    titleEn: 'The Held Disagreement',
    descriptionEn:
      'In a conversation today (meeting, meal, online thread), express frank disagreement on a specific point without softening it and hold the position for 30 seconds against the reaction.',
    category: 'hostile_immersion',
    targetTraits: {
      extraversion: 0.6,
      emotionalStability: 0.6,
      thrillSeeking: 0.55,
      agreeableness: 0.35,
    },
    comfortLevel: 'moderate',
    requiresOutdoor: false,
    requiresSocial: true,
    minimumDurationMinutes: 30,
    fallbackQuestId: 164,
    questPace: 'instant',
  },
  {
    id: 82,
    title: "Le Pseudonyme d'un Soir",
    description:
      "Lors d'une soirée, un meetup ou un événement public où tu ne connais personne, te présenter sous un autre prénom et un autre métier pendant deux heures. Observer comment les autres te perçoivent — et comment toi-même tu te perçois autrement. Révéler avant de partir si tu veux (ou pas).",
    titleEn: 'The Alias for an Evening',
    descriptionEn:
      'At a party, meetup or public event where you know no one, introduce yourself under a different first name and a different job for two hours. Watch how others perceive you — and how you perceive yourself. Reveal before leaving if you want (or not).',
    category: 'hostile_immersion',
    targetTraits: {
      extraversion: 0.72,
      thrillSeeking: 0.68,
      openness: 0.65,
      agreeableness: 0.45,
    },
    comfortLevel: 'high',
    requiresOutdoor: true,
    requiresSocial: true,
    minimumDurationMinutes: 120,
    fallbackQuestId: 72,
    questPace: 'planned',
  },
  {
    id: 163,
    title: 'Le Regard Tenu',
    description:
      "Avec une personne de ton choix aujourd'hui, tenir son regard 10 secondes pleines sans rire ni détourner.",
    titleEn: 'The Held Gaze',
    descriptionEn:
      'With a person of your choice today, hold eye contact a full 10 seconds without laughing or looking away.',
    category: 'hostile_immersion',
    targetTraits: {
      emotionalStability: 0.6,
      extraversion: 0.5,
      thrillSeeking: 0.45,
    },
    comfortLevel: 'high',
    requiresOutdoor: false,
    requiresSocial: true,
    minimumDurationMinutes: 15,
    fallbackQuestId: 9,
    questPace: 'instant',
  },
  {
    id: 164,
    title: "L'Opinion Donnée",
    description:
      "Dans une conversation aujourd'hui, donner une opinion tranchée sur un petit sujet sans dire « je sais pas trop ».",
    titleEn: 'The Opinion Given',
    descriptionEn:
      "In a conversation today, give a clear opinion on a small topic without saying 'I don't really know'.",
    category: 'hostile_immersion',
    targetTraits: {
      extraversion: 0.55,
      emotionalStability: 0.58,
      thrillSeeking: 0.48,
      agreeableness: 0.4,
    },
    comfortLevel: 'moderate',
    requiresOutdoor: false,
    requiresSocial: true,
    minimumDurationMinutes: 20,
    fallbackQuestId: 9,
    questPace: 'instant',
  },
  {
    id: 165,
    title: 'La Question Gênante',
    description:
      "Poser à quelqu'un une question un peu gênante mais sincère (« tu rêves de quoi en ce moment ? », « qu'est-ce qui te fait peur ? »).",
    titleEn: 'The Awkward Question',
    descriptionEn:
      "Ask someone a slightly awkward but sincere question ('what are you dreaming about?', 'what scares you?').",
    category: 'hostile_immersion',
    targetTraits: {
      extraversion: 0.5,
      openness: 0.62,
      thrillSeeking: 0.48,
    },
    comfortLevel: 'high',
    requiresOutdoor: false,
    requiresSocial: true,
    minimumDurationMinutes: 20,
    fallbackQuestId: 166,
    questPace: 'instant',
  },
  {
    id: 166,
    title: 'Le Non Clair',
    description:
      "Dire non à une sollicitation aujourd'hui sans t'excuser, sans justifier longuement. Juste « non, pas cette fois ».",
    titleEn: 'The Clear No',
    descriptionEn:
      "Say no to a request today without apologizing, without long justifications. Just 'no, not this time'.",
    category: 'hostile_immersion',
    targetTraits: {
      emotionalStability: 0.6,
      conscientiousness: 0.55,
      agreeableness: 0.4,
    },
    comfortLevel: 'high',
    requiresOutdoor: false,
    requiresSocial: true,
    minimumDurationMinutes: 20,
    fallbackQuestId: 165,
    questPace: 'instant',
  },
  {
    id: 167,
    title: 'Le Premier Pas',
    description:
      "Engager la conversation avec un·e inconnu·e aujourd'hui par une question ouverte (pas « il fait beau », plutôt « d'où venez-vous ? »).",
    titleEn: 'The First Step',
    descriptionEn:
      "Start a conversation with a stranger today with an open question (not 'nice weather' but 'where are you from?').",
    category: 'hostile_immersion',
    targetTraits: {
      extraversion: 0.58,
      openness: 0.58,
      thrillSeeking: 0.5,
    },
    comfortLevel: 'high',
    requiresOutdoor: false,
    requiresSocial: true,
    minimumDurationMinutes: 25,
    fallbackQuestId: 165,
    questPace: 'instant',
  },
  {
    id: 259,
    title: 'La Collection de Refus',
    description:
      "Demander volontairement trois choses déraisonnables aujourd'hui pour collectionner trois refus. Le but est le non, pas le oui.",
    titleEn: 'The Collection of Nos',
    descriptionEn:
      'Deliberately ask for three unreasonable things today in order to collect three refusals. The goal is the no, not the yes.',
    category: 'hostile_immersion',
    targetTraits: {
      extraversion: 0.8,
      thrillSeeking: 0.75,
      emotionalStability: 0.82,
    },
    comfortLevel: 'high',
    requiresOutdoor: true,
    requiresSocial: true,
    minimumDurationMinutes: 60,
    fallbackQuestId: 72,
    questPace: 'instant',
  },
  {
    id: 260,
    title: 'Le Micro Pris',
    description:
      'Prendre la parole devant un public qui ne te connaît pas : scène ouverte, karaoké, ou une question posée à voix haute en fin de conférence.',
    titleEn: 'The Mic Taken',
    descriptionEn:
      'Speak in front of an audience that does not know you: open mic, karaoke, or a question asked out loud at the end of a talk.',
    category: 'hostile_immersion',
    targetTraits: {
      extraversion: 0.88,
      thrillSeeking: 0.83,
      emotionalStability: 0.9,
    },
    comfortLevel: 'extreme',
    requiresOutdoor: true,
    requiresSocial: true,
    minimumDurationMinutes: 120,
    fallbackQuestId: 46,
    questPace: 'planned',
  },
  {
    id: 261,
    title: 'La Critique Demandée',
    description:
      "Demander à quelqu'un dont l'avis compte de critiquer franchement ton travail, et l'écouter sans te défendre une seule fois.",
    titleEn: 'The Criticism Requested',
    descriptionEn:
      'Ask someone whose opinion matters to criticize your work honestly, and listen without defending yourself a single time.',
    category: 'hostile_immersion',
    targetTraits: {
      extraversion: 0.8,
      thrillSeeking: 0.75,
      emotionalStability: 0.82,
    },
    comfortLevel: 'high',
    requiresOutdoor: false,
    requiresSocial: true,
    minimumDurationMinutes: 60,
    fallbackQuestId: 259,
    questPace: 'planned',
  },
  // ── spontaneous_altruism ────────────────────────────────────────────────────
  {
    id: 11,
    title: 'Le Rayon de Soleil',
    description:
      "Complimenter sincèrement cinq inconnus dans la même journée, sur quelque chose qu'ils ont choisi et non sur ce qu'ils sont. Ne rien attendre en retour, ne pas rester pour la réaction.",
    titleEn: 'The Ray of Sunshine',
    descriptionEn:
      'Give five strangers a genuine compliment in one day, about something they chose rather than something they are. Expect nothing back, do not stay for the reaction.',
    category: 'spontaneous_altruism',
    targetTraits: {
      extraversion: 0.82,
      agreeableness: 0.7,
      thrillSeeking: 0.4,
    },
    comfortLevel: 'moderate',
    requiresOutdoor: true,
    requiresSocial: true,
    minimumDurationMinutes: 60,
    fallbackQuestId: 200,
    questPace: 'planned',
  },
  {
    id: 34,
    title: 'Le Mot Égaré',
    description:
      "Laisser un mot manuscrit d'encouragement dans un lieu public (sans signature narcissique).",
    titleEn: 'The Misplaced Word',
    descriptionEn:
      'Leave a handwritten note of encouragement in a public place (no narcissistic signature).',
    category: 'spontaneous_altruism',
    targetTraits: {
      openness: 0.72,
      agreeableness: 0.72,
      extraversion: 0.35,
      conscientiousness: 0.55,
    },
    comfortLevel: 'moderate',
    requiresOutdoor: true,
    requiresSocial: false,
    minimumDurationMinutes: 45,
    fallbackQuestId: 204,
    questPace: 'instant',
  },
  {
    id: 47,
    title: "Le Pourboire d'Aujourd'hui",
    description:
      "Offrir un pourboire ou un geste de reconnaissance inhabituel à quelqu'un qui t'a servi (café, soin, livraison).",
    titleEn: "Today's Tip",
    descriptionEn:
      'Give an unusually generous tip or thank-you to someone who served you (café, care, delivery).',
    category: 'spontaneous_altruism',
    targetTraits: {
      agreeableness: 0.78,
      conscientiousness: 0.68,
      extraversion: 0.5,
    },
    comfortLevel: 'low',
    requiresOutdoor: true,
    requiresSocial: true,
    minimumDurationMinutes: 25,
    fallbackQuestId: 60,
    questPace: 'planned',
  },
  {
    id: 60,
    title: 'Le Café Suivant',
    description:
      'Si le lieu le permet, régler discrètement le café ou le thé de la personne derrière toi à la file.',
    titleEn: 'The Next Coffee',
    descriptionEn:
      'If the place allows, quietly pay for the coffee or tea of the person behind you in line.',
    category: 'spontaneous_altruism',
    targetTraits: {
      agreeableness: 0.72,
      thrillSeeking: 0.45,
      openness: 0.6,
    },
    comfortLevel: 'low',
    requiresOutdoor: true,
    requiresSocial: true,
    minimumDurationMinutes: 20,
    fallbackQuestId: 9,
    questPace: 'planned',
  },
  {
    id: 198,
    title: 'La Demi-Journée des Inconnus',
    description:
      'Consacrer une demi-journée à rendre trois services à des inconnus, sans jamais expliquer pourquoi tu le fais. Partir avant les remerciements à chaque fois.',
    titleEn: 'The Half-Day for Strangers',
    descriptionEn:
      'Spend half a day doing three favors for strangers, never explaining why. Leave before the thanks each time.',
    category: 'spontaneous_altruism',
    targetTraits: {
      agreeableness: 0.86,
      extraversion: 0.72,
      openness: 0.65,
    },
    comfortLevel: 'high',
    requiresOutdoor: true,
    requiresSocial: true,
    minimumDurationMinutes: 240,
    fallbackQuestId: 11,
    questPace: 'planned',
  },
  {
    id: 199,
    title: 'Le Repas Offert',
    description:
      "Acheter un vrai repas chaud et l'offrir en main propre à quelqu'un qui dort dehors. Puis s'asseoir et parler cinq minutes, comme à n'importe qui.",
    titleEn: 'The Meal Handed Over',
    descriptionEn:
      'Buy a real hot meal and hand it directly to someone sleeping rough. Then sit down and talk for five minutes, the way you would with anyone.',
    category: 'spontaneous_altruism',
    targetTraits: {
      agreeableness: 0.86,
      extraversion: 0.72,
      openness: 0.65,
    },
    comfortLevel: 'high',
    requiresOutdoor: true,
    requiresSocial: true,
    minimumDurationMinutes: 90,
    fallbackQuestId: 47,
    questPace: 'planned',
  },
  {
    id: 200,
    title: 'Le Coup de Main Non Sollicité',
    description:
      "Repérer dans l'espace public quelqu'un en difficulté visible et proposer ton aide avant qu'on te la demande. Insister une fois si on refuse par politesse.",
    titleEn: 'The Unasked Hand',
    descriptionEn:
      'Spot someone visibly struggling in public and offer help before being asked. Insist once if they refuse out of politeness.',
    category: 'spontaneous_altruism',
    targetTraits: {
      agreeableness: 0.76,
      extraversion: 0.62,
      openness: 0.55,
    },
    comfortLevel: 'moderate',
    requiresOutdoor: true,
    requiresSocial: true,
    minimumDurationMinutes: 60,
    fallbackQuestId: 11,
    questPace: 'instant',
  },
  {
    id: 201,
    title: 'L’Anonyme Généreux',
    description:
      "Faire un geste matériel réel pour quelqu'un de ton entourage en t'assurant qu'il ne saura jamais que ça vient de toi. Tenir le secret même s'il cherche.",
    titleEn: 'The Anonymous Giver',
    descriptionEn:
      'Do something materially real for someone close to you, making sure they never learn it came from you. Keep the secret even if they dig.',
    category: 'spontaneous_altruism',
    targetTraits: {
      agreeableness: 0.86,
      extraversion: 0.72,
      openness: 0.65,
    },
    comfortLevel: 'high',
    requiresOutdoor: false,
    requiresSocial: false,
    minimumDurationMinutes: 60,
    fallbackQuestId: 34,
    questPace: 'planned',
  },
  {
    id: 202,
    title: 'Les Trois Heures Données',
    description:
      "Contacter une association près de chez toi et donner trois heures de ton temps cette semaine. Pas un don d'argent : ta présence, un après-midi.",
    titleEn: 'Three Hours Given',
    descriptionEn:
      'Contact a local charity and give three hours of your time this week. Not money: your presence, one afternoon.',
    category: 'spontaneous_altruism',
    targetTraits: {
      agreeableness: 0.94,
      extraversion: 0.8,
      openness: 0.73,
    },
    comfortLevel: 'extreme',
    requiresOutdoor: true,
    requiresSocial: true,
    minimumDurationMinutes: 180,
    fallbackQuestId: 199,
    questPace: 'planned',
  },
  {
    id: 203,
    title: 'La Compétence Prêtée',
    description:
      "Offrir gratuitement à quelqu'un une heure de ce que tu sais faire le mieux. Le proposer explicitement, ne pas attendre qu'on devine.",
    titleEn: 'The Skill Lent',
    descriptionEn:
      'Give someone one free hour of the thing you are best at. Offer it explicitly, do not wait to be asked.',
    category: 'spontaneous_altruism',
    targetTraits: {
      agreeableness: 0.76,
      extraversion: 0.62,
      openness: 0.55,
    },
    comfortLevel: 'moderate',
    requiresOutdoor: false,
    requiresSocial: true,
    minimumDurationMinutes: 90,
    fallbackQuestId: 11,
    questPace: 'planned',
  },
  {
    id: 204,
    title: 'Le Voisin Nommé',
    description:
      'Frapper chez un voisin dont tu ignores le prénom. Te présenter. Repartir avec son prénom et une chose vraie sur lui.',
    titleEn: 'The Neighbor Named',
    descriptionEn:
      'Knock on the door of a neighbor whose first name you do not know. Introduce yourself. Leave with their name and one true thing about them.',
    category: 'spontaneous_altruism',
    targetTraits: {
      agreeableness: 0.76,
      extraversion: 0.62,
      openness: 0.55,
    },
    comfortLevel: 'moderate',
    requiresOutdoor: true,
    requiresSocial: true,
    minimumDurationMinutes: 45,
    fallbackQuestId: 34,
    questPace: 'instant',
  },
  {
    id: 205,
    title: 'La Chaîne Lancée',
    description:
      "Faire un geste gratuit pour quelqu'un et lui demander une seule chose en retour : le refaire pour une autre personne cette semaine.",
    titleEn: 'The Chain Started',
    descriptionEn:
      'Do something for someone at no cost and ask one thing in return: that they do the same for someone else this week.',
    category: 'spontaneous_altruism',
    targetTraits: {
      agreeableness: 0.76,
      extraversion: 0.62,
      openness: 0.55,
    },
    comfortLevel: 'moderate',
    requiresOutdoor: true,
    requiresSocial: true,
    minimumDurationMinutes: 60,
    fallbackQuestId: 200,
    questPace: 'instant',
  },
  // ── relational_vulnerability ────────────────────────────────────────────────
  {
    id: 12,
    title: 'La Reconnexion',
    description:
      "Appeler — pas écrire — un ami que tu as laissé filer. Dire d'emblée que ça fait trop longtemps et que c'est aussi de ta faute. Proposer une date précise avant de raccrocher.",
    titleEn: 'The Reconnection',
    descriptionEn:
      'Call, do not text, a friend you let drift. Say straight away that it has been too long and that it is partly on you. Propose a specific date before hanging up.',
    category: 'relational_vulnerability',
    targetTraits: {
      agreeableness: 0.72,
      emotionalStability: 0.65,
    },
    comfortLevel: 'high',
    requiresOutdoor: false,
    requiresSocial: true,
    minimumDurationMinutes: 30,
    fallbackQuestId: 35,
    questPace: 'planned',
  },
  {
    id: 22,
    title: 'La Journée Sans Mensonge',
    description:
      "Pendant une journée entière, ne dire que la vérité, y compris dans les petits arrangements sociaux : « ça va », « c'était très bien », « je n'ai pas eu le temps ». Le soir, écrire ce que ça a coûté et ce que ça a soulagé.",
    titleEn: 'The Day Without Lies',
    descriptionEn:
      "For a full day, tell only the truth, including in the small social arrangements: \"I'm fine\", \"it was great\", \"I didn't have time\". That evening, write what it cost and what it relieved.",
    category: 'relational_vulnerability',
    targetTraits: {
      agreeableness: 0.6,
      emotionalStability: 0.82,
      conscientiousness: 0.6,
    },
    comfortLevel: 'extreme',
    requiresOutdoor: false,
    requiresSocial: true,
    minimumDurationMinutes: 240,
    fallbackQuestId: 12,
    questPace: 'planned',
  },
  {
    id: 35,
    title: 'Le Remerciement Tardif',
    description:
      "Dire à un proche une chose précise que tu apprécies chez lui depuis longtemps sans l'avoir dit.",
    titleEn: 'The Late Thank-You',
    descriptionEn:
      "Tell someone close something specific you appreciate about them that you've long left unsaid.",
    category: 'relational_vulnerability',
    targetTraits: {
      agreeableness: 0.78,
      emotionalStability: 0.62,
    },
    comfortLevel: 'high',
    requiresOutdoor: false,
    requiresSocial: true,
    minimumDurationMinutes: 30,
    fallbackQuestId: 12,
    questPace: 'planned',
  },
  {
    id: 48,
    title: 'Le Vocal de Vérité',
    description:
      "Envoyer un message vocal d'environ une minute à quelqu'un que tu évites, sans mentir sur l'essentiel.",
    titleEn: 'The Truth Voice Note',
    descriptionEn:
      "Send a ~1-minute voice message to someone you've been avoiding, honest on what matters.",
    category: 'relational_vulnerability',
    targetTraits: {
      agreeableness: 0.62,
      emotionalStability: 0.72,
    },
    comfortLevel: 'high',
    requiresOutdoor: false,
    requiresSocial: true,
    minimumDurationMinutes: 15,
    fallbackQuestId: 181,
    questPace: 'planned',
  },
  {
    id: 61,
    title: 'La Phrase en Je',
    description:
      "Écrire ou dire une phrase qui commence par « j'ai besoin » ou « je ressens », sans accuser l'autre.",
    titleEn: 'The I-Statement',
    descriptionEn:
      'Write or say a sentence starting with “I need” or “I feel,” without blaming the other person.',
    category: 'relational_vulnerability',
    targetTraits: {
      agreeableness: 0.7,
      emotionalStability: 0.72,
    },
    comfortLevel: 'high',
    requiresOutdoor: false,
    requiresSocial: true,
    minimumDurationMinutes: 20,
    fallbackQuestId: 176,
    questPace: 'planned',
  },
  {
    id: 70,
    title: "L'Aveu Léger",
    description:
      "Partager à une personne de confiance une petite vulnérabilité que tu n'as jamais dite à voix haute (un doute, une peur modeste, un regret). Rien de dramatique — juste du vrai.",
    titleEn: 'The Light Confession',
    descriptionEn:
      "Share with someone you trust a small vulnerability you've never said out loud (a doubt, a modest fear, a regret). Nothing dramatic — just honest.",
    category: 'relational_vulnerability',
    targetTraits: {
      agreeableness: 0.68,
      openness: 0.6,
      emotionalStability: 0.5,
    },
    comfortLevel: 'moderate',
    requiresOutdoor: false,
    requiresSocial: true,
    minimumDurationMinutes: 30,
    fallbackQuestId: 71,
    questPace: 'instant',
  },
  {
    id: 71,
    title: 'Le Remerciement Concret',
    description:
      "Remercier explicitement une personne précise pour un geste passé en nommant ce que ça t'a fait — pas un « merci » générique, mais « quand tu as fait X, voilà ce que ça a changé pour moi ».",
    titleEn: 'The Concrete Thanks',
    descriptionEn:
      "Thank a specific person for a past action by naming what it did for you — not a generic 'thanks', but 'when you did X, here's what it changed for me'.",
    category: 'relational_vulnerability',
    targetTraits: {
      agreeableness: 0.75,
      extraversion: 0.5,
      openness: 0.55,
    },
    comfortLevel: 'moderate',
    requiresOutdoor: false,
    requiresSocial: true,
    minimumDurationMinutes: 25,
    fallbackQuestId: 179,
    questPace: 'instant',
  },
  {
    id: 81,
    title: 'Le Miroir des Proches',
    description:
      'Contacter trois personnes proches (amis, famille, partenaire) et leur demander individuellement : « quelle est ma pire habitude selon toi ? ». Écouter sans commenter ni te défendre. Noter textuellement leurs mots. Ne répondre à aucune avant le lendemain.',
    titleEn: 'The Mirror of Loved Ones',
    descriptionEn:
      "Reach out to three people close to you (friends, family, partner) and ask each separately: 'what's my worst habit in your eyes?'. Listen without commenting or defending. Write down their exact words. Don't reply to any of them before the next day.",
    category: 'relational_vulnerability',
    targetTraits: {
      emotionalStability: 0.72,
      openness: 0.7,
      agreeableness: 0.65,
    },
    comfortLevel: 'high',
    requiresOutdoor: false,
    requiresSocial: true,
    minimumDurationMinutes: 60,
    fallbackQuestId: 70,
    questPace: 'planned',
  },
  {
    id: 176,
    title: 'La Phrase Retenue',
    description:
      "Dire à voix haute à un proche aujourd'hui une phrase que tu penses sans jamais la dire (« tu comptes pour moi »).",
    titleEn: 'The Held-Back Sentence',
    descriptionEn:
      "Say out loud to someone close a sentence you think but never say ('you matter to me').",
    category: 'relational_vulnerability',
    targetTraits: {
      agreeableness: 0.65,
      emotionalStability: 0.55,
    },
    comfortLevel: 'high',
    requiresOutdoor: false,
    requiresSocial: true,
    minimumDurationMinutes: 20,
    fallbackQuestId: 61,
    questPace: 'instant',
  },
  {
    id: 178,
    title: 'Le Besoin Nommé',
    description:
      "Dire à quelqu'un aujourd'hui une chose dont tu as besoin, clairement, sans détour (« j'aurais besoin que tu... »).",
    titleEn: 'The Named Need',
    descriptionEn:
      "Tell someone today one thing you need, clearly, directly ('I'd need you to...').",
    category: 'relational_vulnerability',
    targetTraits: {
      emotionalStability: 0.58,
      agreeableness: 0.55,
      conscientiousness: 0.55,
    },
    comfortLevel: 'high',
    requiresOutdoor: false,
    requiresSocial: true,
    minimumDurationMinutes: 20,
    fallbackQuestId: 61,
    questPace: 'instant',
  },
  {
    id: 179,
    title: "L'Émotion Dite",
    description:
      "Dans une conversation aujourd'hui, nommer ton émotion réelle (« je suis un peu triste, un peu fatigué·e ») au lieu de « ça va ».",
    titleEn: 'The Named Emotion',
    descriptionEn:
      "In a conversation today, name your real emotion ('I'm a bit sad, a bit tired') instead of 'I'm fine'.",
    category: 'relational_vulnerability',
    targetTraits: {
      emotionalStability: 0.58,
      agreeableness: 0.6,
    },
    comfortLevel: 'moderate',
    requiresOutdoor: false,
    requiresSocial: true,
    minimumDurationMinutes: 20,
    fallbackQuestId: 181,
    questPace: 'instant',
  },
  {
    id: 181,
    title: 'Le Compliment Reçu',
    description:
      "La prochaine fois qu'on te complimente aujourd'hui, dire simplement « merci, ça me touche », sans minimiser ni retourner.",
    titleEn: 'The Compliment Received',
    descriptionEn:
      "Next time you get a compliment today, just say 'thanks, that means a lot', no minimizing, no deflecting.",
    category: 'relational_vulnerability',
    targetTraits: {
      emotionalStability: 0.6,
      agreeableness: 0.6,
    },
    comfortLevel: 'low',
    requiresOutdoor: false,
    requiresSocial: true,
    minimumDurationMinutes: 15,
    fallbackQuestId: 9,
    questPace: 'instant',
  },
  {
    id: 182,
    title: "L'Excuse Tenue",
    description:
      "Si tu as été maladroit·e récemment avec quelqu'un, lui envoyer un « désolé·e, j'ai été X » sans justification.",
    titleEn: 'The Plain Apology',
    descriptionEn:
      "If you were clumsy with someone recently, send them 'sorry, I was X' with no justification.",
    category: 'relational_vulnerability',
    targetTraits: {
      emotionalStability: 0.6,
      agreeableness: 0.65,
      conscientiousness: 0.58,
    },
    comfortLevel: 'high',
    requiresOutdoor: false,
    requiresSocial: true,
    minimumDurationMinutes: 25,
    fallbackQuestId: 61,
    questPace: 'instant',
  },
  {
    id: 262,
    title: 'La Conversation Reportée',
    description:
      'Avoir enfin la conversation que tu repousses depuis des mois, avec la personne concernée, en face à face. Pas par message, pas au téléphone.',
    titleEn: 'The Postponed Conversation',
    descriptionEn:
      'Finally have the conversation you have been putting off for months, with the person concerned, face to face. Not by message, not by phone.',
    category: 'relational_vulnerability',
    targetTraits: {
      agreeableness: 0.88,
      emotionalStability: 0.8,
      openness: 0.76,
    },
    comfortLevel: 'extreme',
    requiresOutdoor: false,
    requiresSocial: true,
    minimumDurationMinutes: 120,
    fallbackQuestId: 12,
    questPace: 'planned',
  },
  {
    id: 263,
    title: 'Le Premier Pas du Pardon',
    description:
      "Reprendre contact avec une personne avec qui tu es fâché, sans exiger d'excuses et sans en donner d'emblée. Juste rouvrir la porte.",
    titleEn: 'The First Step Back',
    descriptionEn:
      'Get back in touch with someone you fell out with, demanding no apology and offering none upfront. Just reopen the door.',
    category: 'relational_vulnerability',
    targetTraits: {
      agreeableness: 0.8,
      emotionalStability: 0.72,
      openness: 0.68,
    },
    comfortLevel: 'high',
    requiresOutdoor: false,
    requiresSocial: true,
    minimumDurationMinutes: 90,
    fallbackQuestId: 12,
    questPace: 'planned',
  },
  // ── unconditional_service ───────────────────────────────────────────────────
  {
    id: 13,
    title: 'Le Festin Altruiste',
    description:
      "Cuisiner un vrai repas pour quelqu'un qui ne s'y attend pas, construit autour de ce que cette personne aime et non de ce que toi tu aimes. Le servir, débarrasser, et refuser qu'on t'aide.",
    titleEn: 'The Altruistic Feast',
    descriptionEn:
      'Cook a real meal for someone who is not expecting it, built around what they like rather than what you like. Serve it, clear it away, and refuse any help.',
    category: 'unconditional_service',
    targetTraits: {
      agreeableness: 0.78,
      conscientiousness: 0.62,
    },
    comfortLevel: 'moderate',
    requiresOutdoor: false,
    requiresSocial: true,
    minimumDurationMinutes: 120,
    fallbackQuestId: 210,
    questPace: 'planned',
  },
  {
    id: 36,
    title: 'Le Cadeau Sans Occasion',
    description:
      'Offrir un petit cadeau ou un repas à un voisin ou un collègue sans occasion particulière.',
    titleEn: 'The Gift Without Occasion',
    descriptionEn:
      'Give a small gift or a meal to a neighbor or colleague for no special reason.',
    category: 'unconditional_service',
    targetTraits: {
      agreeableness: 0.82,
      conscientiousness: 0.55,
    },
    comfortLevel: 'moderate',
    requiresOutdoor: false,
    requiresSocial: true,
    minimumDurationMinutes: 90,
    fallbackQuestId: 206,
    questPace: 'planned',
  },
  {
    id: 49,
    title: 'Le Plat Dédicacé',
    description:
      'Préparer un plat ou un goûter pour une personne précise et le lui remettre en main propre avec une phrase simple.',
    titleEn: 'The Dedicated Dish',
    descriptionEn:
      'Cook a dish or snack for a specific person and hand it to them with one simple sentence.',
    category: 'unconditional_service',
    targetTraits: {
      agreeableness: 0.78,
      conscientiousness: 0.68,
    },
    comfortLevel: 'moderate',
    requiresOutdoor: false,
    requiresSocial: true,
    minimumDurationMinutes: 75,
    fallbackQuestId: 62,
    questPace: 'planned',
  },
  {
    id: 62,
    title: 'La Course Sans Redemande',
    description:
      "Accomplir une course ou une démarche administrative pour quelqu'un de proche sans qu'on te la redemande.",
    titleEn: 'The Errand Unasked',
    descriptionEn:
      'Run one errand or admin task for someone close without them asking again.',
    category: 'unconditional_service',
    targetTraits: {
      agreeableness: 0.75,
      conscientiousness: 0.75,
    },
    comfortLevel: 'moderate',
    requiresOutdoor: false,
    requiresSocial: true,
    minimumDurationMinutes: 60,
    fallbackQuestId: 213,
    questPace: 'planned',
  },
  {
    id: 206,
    title: 'La Corvée Invisible',
    description:
      "Prendre en charge entièrement, pendant une semaine, une tâche que fait toujours quelqu'un d'autre chez toi. Sans l'annoncer au début, sans le mentionner à la fin.",
    titleEn: 'The Invisible Chore',
    descriptionEn:
      'Take over completely, for one week, a task someone else always does in your home. Do not announce it at the start, do not mention it at the end.',
    category: 'unconditional_service',
    targetTraits: {
      agreeableness: 0.8,
      conscientiousness: 0.6,
      extraversion: 0.45,
    },
    comfortLevel: 'moderate',
    requiresOutdoor: false,
    requiresSocial: false,
    minimumDurationMinutes: 90,
    fallbackQuestId: 36,
    questPace: 'planned',
  },
  {
    id: 207,
    title: 'Le Déménagement Proposé',
    description:
      "Proposer ton aide physique à quelqu'un pour une corvée lourde : déménagement, débarras, travaux. Y aller. Ne pas partir avant que ce soit fini.",
    titleEn: 'The Offered Move',
    descriptionEn:
      'Offer someone your physical help with heavy work: a move, a clear-out, repairs. Show up. Do not leave before it is finished.',
    category: 'unconditional_service',
    targetTraits: {
      agreeableness: 0.9,
      conscientiousness: 0.7,
      extraversion: 0.55,
    },
    comfortLevel: 'high',
    requiresOutdoor: false,
    requiresSocial: true,
    minimumDurationMinutes: 240,
    fallbackQuestId: 206,
    questPace: 'planned',
  },
  {
    id: 208,
    title: 'La Journée à Disposition',
    description:
      "Dire à un proche : « aujourd'hui je suis à ta disposition, de quoi tu as besoin ? » Puis tenir toute la journée, quoi qu'il demande, sans négocier.",
    titleEn: 'The Day at Their Disposal',
    descriptionEn:
      'Tell someone close: "today I am at your disposal, what do you need?" Then hold it all day, whatever they ask, without negotiating.',
    category: 'unconditional_service',
    targetTraits: {
      agreeableness: 0.95,
      conscientiousness: 0.78,
      extraversion: 0.63,
    },
    comfortLevel: 'extreme',
    requiresOutdoor: false,
    requiresSocial: true,
    minimumDurationMinutes: 240,
    fallbackQuestId: 207,
    questPace: 'planned',
  },
  {
    id: 209,
    title: 'Le Silence sur le Geste',
    description:
      "Rendre un service qui compte vraiment à quelqu'un, puis refuser explicitement tout remerciement et toute contrepartie. Couper court à chaque tentative.",
    titleEn: 'No Thanks Taken',
    descriptionEn:
      'Do something that genuinely matters for someone, then explicitly refuse all thanks and anything in return. Cut off every attempt.',
    category: 'unconditional_service',
    targetTraits: {
      agreeableness: 0.9,
      conscientiousness: 0.7,
      extraversion: 0.55,
    },
    comfortLevel: 'high',
    requiresOutdoor: false,
    requiresSocial: true,
    minimumDurationMinutes: 60,
    fallbackQuestId: 62,
    questPace: 'instant',
  },
  {
    id: 210,
    title: 'La Réparation Offerte',
    description:
      "Réparer ou remettre en état un objet cassé qui appartient à quelqu'un d'autre, et le lui rendre sans commentaire ni explication.",
    titleEn: 'The Repair Given',
    descriptionEn:
      'Fix or restore something broken that belongs to someone else, and hand it back with no comment and no explanation.',
    category: 'unconditional_service',
    targetTraits: {
      agreeableness: 0.8,
      conscientiousness: 0.6,
      extraversion: 0.45,
    },
    comfortLevel: 'moderate',
    requiresOutdoor: false,
    requiresSocial: false,
    minimumDurationMinutes: 120,
    fallbackQuestId: 206,
    questPace: 'planned',
  },
  {
    id: 211,
    title: 'Le Trajet Fait',
    description:
      "Accompagner physiquement quelqu'un à un rendez-vous qu'il redoute : médecin, administration, entretien. Attendre dehors s'il le faut.",
    titleEn: 'The Trip Made',
    descriptionEn:
      'Physically go with someone to an appointment they dread: doctor, paperwork, interview. Wait outside if that is what helps.',
    category: 'unconditional_service',
    targetTraits: {
      agreeableness: 0.8,
      conscientiousness: 0.6,
      extraversion: 0.45,
    },
    comfortLevel: 'moderate',
    requiresOutdoor: true,
    requiresSocial: true,
    minimumDurationMinutes: 90,
    fallbackQuestId: 62,
    questPace: 'planned',
  },
  {
    id: 212,
    title: 'L’Heure d’Écoute',
    description:
      'Dire à une personne qui traverse quelque chose de difficile : « je suis là une heure, raconte. » Ne donner aucun conseil, ne rien ramener à toi.',
    titleEn: 'The Listening Hour',
    descriptionEn:
      'Tell someone going through something hard: "I am here for an hour, talk." Give no advice, bring nothing back to yourself.',
    category: 'unconditional_service',
    targetTraits: {
      agreeableness: 0.9,
      conscientiousness: 0.7,
      extraversion: 0.55,
    },
    comfortLevel: 'high',
    requiresOutdoor: false,
    requiresSocial: true,
    minimumDurationMinutes: 90,
    fallbackQuestId: 209,
    questPace: 'planned',
  },
  {
    id: 213,
    title: 'Le Legs d’un Objet',
    description:
      "Donner à quelqu'un un objet auquel tu tiens vraiment, en lui expliquant précisément pourquoi tu y tenais.",
    titleEn: 'The Object Passed On',
    descriptionEn:
      'Give someone an object you genuinely care about, telling them exactly why it mattered to you.',
    category: 'unconditional_service',
    targetTraits: {
      agreeableness: 0.8,
      conscientiousness: 0.6,
      extraversion: 0.45,
    },
    comfortLevel: 'moderate',
    requiresOutdoor: false,
    requiresSocial: true,
    minimumDurationMinutes: 45,
    fallbackQuestId: 9,
    questPace: 'instant',
  },
];
