/* ============================================================
   EDUCA-PSY — articles-firebase.js
   ============================================================
   Optimisé pour la VITESSE à l'échelle actuelle (~50 articles) :
   un seul chargement Firestore (orderBy simple, sans filtre —
   donc aucun index composite requis), mis en cache en mémoire.
   Ensuite, filtrage par catégorie, recherche et pagination sont
   100% instantanés côté client, sans aucun aller-retour réseau
   supplémentaire.

   Si le volume d'articles grossit significativement plus tard
   (plusieurs centaines), cette approche « tout en mémoire »
   redeviendra limitante — on pourra alors repasser à des requêtes
   Firestore paginées ciblées (cette approche a déjà été codée
   dans une version précédente et peut être réappliquée).
   ============================================================ */

import { db } from "./firebase-config.js";
import {
  collection, getDocs, doc, getDoc, query, orderBy
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";

const MOIS_FR = ["janvier","février","mars","avril","mai","juin","juillet",
                  "août","septembre","octobre","novembre","décembre"];

const NB_RECENTS_ACCUEIL = 3;   // articles récents affichés sur l'accueil
const TAILLE_PAGE_ARTICLES = 9; // articles par page sur articles.html

let cacheArticles = null;
let promesseChargement = null;

function champLocale(article, champ, langue) {
  if (!langue || langue === "fr") return article[champ] || "";
  return article[`${champ}_${langue}`] || article[champ] || "";
}

function formaterDateFirestore(valeur) {
  if (!valeur) return "";
  const d = valeur.toDate ? valeur.toDate() : new Date(valeur);
  if (isNaN(d.getTime())) return "";
  return `${d.getUTCDate()} ${MOIS_FR[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

function retirerAccents(texte) {
  return texte.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function slugify(texte) {
  return retirerAccents(texte.toLowerCase())
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/* Table de correspondance : nom complet de catégorie -> slug court
   utilisé pour les classes CSS de couleur (tag-*, cat-*). */
const CATEGORIES_SLUGS_COURTS = {
  "education": "education",
  "psychologie": "psychologie"
};

function normaliserCategorieArticle(categorie) {
  const norm = retirerAccents((categorie || "").toLowerCase()).trim();
  if (norm === "education") return "Éducation";
  return "Psychologie";
}

const ARTICLES_REMPLACES_IDS = new Set([
  "prSpdLauQLcV0dTtbkZg", // Ancien article du 30 août remplacé par l'article sur les biais psychologiques
  "7tN49aVMYojupjgakbFx"  // Ancien article du 1er septembre (Google AI Studio) remplacé par l'article Psychologie sur GTA 6
]);

function urlArticleCanonique(article) {
  if (article && article.urlStatique) return article.urlStatique;
  return `article.html?id=${article ? article.id : ""}`;
}

const PHOTO_AUTEUR_STANLEY = "/images/stanley-mazile.webp";

function estAuteurStanley(nomAuteur) {
  return /stanley\s+mazile/i.test(nomAuteur || "");
}

function avatarAuteurHTML(nomAuteur) {
  const nom = nomAuteur || "Équipe Educa-Psy";
  if (estAuteurStanley(nom)) {
    return `<img class="author-avatar author-avatar--photo" src="${PHOTO_AUTEUR_STANLEY}" alt="Stanley Mazile" width="42" height="42" loading="lazy">`;
  }
  const initiales = nom
    .split(/\s+/)
    .map(p => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase() || "EP";
  return `<span class="author-avatar">${initiales}</span>`;
}

function miniatureAuteurCarteHTML(nomAuteur) {
  if (!estAuteurStanley(nomAuteur)) return "";
  return `<img class="article-card-author-thumb" src="${PHOTO_AUTEUR_STANLEY}" alt="Stanley Mazile" width="22" height="22" loading="lazy">`;
}

const ARTICLES_PUBLIES_LOCAUX = [
  {
    id: "gta-6-psychologie-attente-fievre",
    urlStatique: "gta-6-psychologie.html",
    categorie: "Psychologie",
    aLaUne: true,
    auteur: "Stanley Mazile",
    date: "2026-11-24T12:00:00Z",
    dateModif: "2026-11-24T12:00:00Z",
    image: "/images/gta6-lancement.webp",
    imageWidth: 1280,
    imageHeight: 853,
    imageAlt: "Panneau publicitaire annonçant la sortie de Grand Theft Auto VI le 19 novembre 2026 à New York (CC BY-SA 4.0 / Jakwaka)",
    articlesSimilairesIds: ["biais-psychologiques-cerveau"],
    motsCles: "GTA 6, Grand Theft Auto VI, psychologie, jeu vidéo, dopamine, flow, trouble du jeu vidéo OMS, violence jeux vidéo, Educa-Psy",
    titre: "GTA 6 : pourquoi le monde entier a attendu 13 ans — et ce que la psychologie nous dit de cette fièvre",
    resume: "Le 19 novembre 2026, des millions de joueurs ont enfin mis la main sur Grand Theft Auto VI, treize ans après l'épisode précédent. Files d'attente à minuit, congés posés au travail, record de ventes dès le premier jour : un jeu vidéo peut-il vraiment rendre les gens « fous » ? La psychologie a des réponses — plus nuancées, et plus intéressantes, que les polémiques.",
    contenu: [
      "Treize ans. C'est le temps écoulé entre GTA V (2013) et GTA VI, sorti le 19 novembre 2026 sur PlayStation 5 et Xbox Series après deux reports successifs. Selon Take-Two, la maison mère du studio Rockstar, le jeu a généré près de 3,8 milliards de dollars de ventes dès son premier jour — le plus grand lancement de l'histoire du divertissement. Derrière ces chiffres, il y a des mécanismes psychologiques que chacun peut reconnaître en soi.",
      "## 1. L'attente elle-même est un plaisir",
      "![Ocean Drive la nuit à Miami Beach, l'atmosphère néon Art déco qui inspire Vice City dans GTA VI (CC BY-SA 4.0)](/images/gta6-vice-city-miami.webp)",
      "Attendre un plaisir fait partie du plaisir. Les neurosciences distinguent le « vouloir » du « aimer » : l'anticipation mobilise la dopamine, le messager du désir, parfois plus intensément que la récompense elle-même. Treize ans d'attente, deux reports, des bandes-annonces disséquées image par image : chaque report, paradoxalement, a renforcé le désir au lieu de l'éteindre. C'est aussi l'effet de rareté — ce qui est difficile à obtenir semble plus précieux — et la nostalgie : beaucoup de joueurs ont grandi avec la série, et retrouver Vice City, la ville fictive inspirée de Miami, c'est retrouver une part de leur adolescence.",
      "## 2. Le besoin d'évasion, de liberté et de maîtrise",
      "![Joueur tenant une manette PlayStation 5 DualSense, support du lancement de GTA VI (CC BY-SA 4.0)](/images/gta6-manette-ps5.webp)",
      "Pourquoi un monde ouvert fascine-t-il autant ? La théorie de l'autodétermination, l'une des plus solides en psychologie de la motivation, identifie trois besoins fondamentaux : l'autonomie (choisir), la compétence (réussir) et le lien aux autres. Les jeux en monde ouvert les nourrissent tous : on va où l'on veut, on progresse, on partage l'expérience avec des millions d'autres joueurs. S'ajoute le « flow », cet état d'absorption totale décrit par le psychologue Mihaly Csikszentmihalyi, où le temps disparaît parce que le défi est exactement à la hauteur de nos capacités. Pour beaucoup, jouer après une journée difficile n'est pas une fuite pathologique : c'est une façon de récupérer un sentiment de contrôle que la vie réelle ne donne pas toujours.",
      "## 3. La violence dans les jeux rend-elle violent ? Ce que dit vraiment la science",
      "C'est la polémique qui accompagne chaque sortie de GTA depuis 1997. La réponse des chercheurs, après des décennies d'études, est plus prudente que les titres de presse. En 2019, une étude préenregistrée de l'université d'Oxford, portant sur des adolescents et leurs parents, n'a trouvé **aucun lien** entre le temps passé sur des jeux violents et les comportements agressifs. L'Association américaine de psychologie (APA), dans sa résolution révisée en 2020, reconnaît un lien faible avec des comportements agressifs mineurs (cris, bousculades), mais juge les preuves **insuffisantes** pour relier les jeux violents aux actes de violence grave. Le débat scientifique continue — certains travaux trouvent de petits effets à court terme — mais aucun consensus ne permet d'affirmer que jouer à GTA rend violent. Les chercheurs sérieux rappellent que la violence réelle a des causes bien documentées : pauvreté, accès aux armes, antécédents, entourage. Le jeu vidéo n'en fait pas partie de façon établie.",
      "## 4. Le vrai point de vigilance : quand le jeu prend toute la place",
      "Il existe pourtant un risque réel, reconnu par l'Organisation mondiale de la santé : le **trouble du jeu vidéo**, inscrit dans la Classification internationale des maladies (CIM-11). Il ne s'agit pas de jouer avec passion pendant un week-end de lancement : l'OMS parle de trouble uniquement lorsque la perte de contrôle sur le jeu dure depuis au moins douze mois et prend le pas sur le sommeil, le travail, la scolarité ou les relations proches. Pour la grande majorité des joueurs, l'enthousiasme retombe naturellement après quelques semaines ; le signal d'alerte apparaît lorsque l'écran cesse d'être un loisir choisi pour devenir le seul refuge contre l'ennui, l'anxiété ou la solitude.",
      "## Profiter de la sortie sans perdre l'équilibre",
      "La psychologie nous invite finalement à regarder cette fièvre mondiale avec lucidité plutôt qu'avec panique morale. L'attente collective autour de GTA 6 raconte surtout notre besoin d'histoires partagées, d'évasion et d'appartenance à une communauté. Comme pour tout loisir puissant, l'essentiel tient en une question simple : est-ce le jeu qui rythme vos journées, ou est-ce vous qui choisissez quand allumer — et quand éteindre — la console ?",
      "**Sources :**\n[1] Berridge, K. C. & Robinson, T. E. (2016). « Liking, wanting, and the incentive-sensitization theory of addiction », *American Psychologist*, 71(8), p. 670-679.\n[2] Cialdini, R. B. (2007). *Influence et manipulation : la psychologie de la persuasion*, First Éditions (Principe de rareté).\n[3] Ryan, R. M. & Deci, E. L. (2000). « Self-Determination Theory and the Facilitation of Intrinsic Motivation, Social Development, and Well-Being », *American Psychologist*, 55(1), p. 68-78.\n[4] Csikszentmihalyi, M. (1990). *Flow: The Psychology of Optimal Experience*, Harper & Row.\n[5] Przybylski, A. K. & Weinstein, N. (2019). « Violent video game engagement is not associated with adolescents' aggressive behaviour: evidence from a registered report », *Royal Society Open Science*, 6(2), 171474.\n[6] American Psychological Association (2020). *APA Resolution on Violent Video Games*, février 2020.\n[7] Organisation mondiale de la santé (2019). *Classification internationale des maladies (CIM-11) : Trouble du jeu vidéo (6C51)*.\n[8] Take-Two Interactive / Rockstar Games (novembre 2026). Lancement mondial de *Grand Theft Auto VI* (19 novembre 2026)."
    ],
    titre_en: "GTA 6: Why the World Waited 13 Years — And What Psychology Tells Us About This Fever",
    resume_en: "On November 19, 2026, millions of players finally got their hands on Grand Theft Auto VI, thirteen years after GTA V. Midnight queues, days off work, record day-one sales: can a video game really drive people wild? Psychology offers sharper answers than moral panic.",
    contenu_en: [
      "Thirteen years. That is how long passed between GTA V (2013) and GTA VI, released on November 19, 2026 on PlayStation 5 and Xbox Series after two delays. According to Take-Two, Rockstar's parent company, the game generated nearly $3.8 billion in day-one sales — the biggest launch in entertainment history. Behind those numbers lie everyday psychological mechanisms anyone can recognize.",
      "## 1. Anticipation itself is a reward",
      "![Ocean Drive at night in Miami Beach, the neon Art Deco atmosphere inspiring Vice City in GTA VI (CC BY-SA 4.0)](/images/gta6-vice-city-miami.webp)",
      "Waiting for a pleasure is part of the pleasure. Neuroscience distinguishes « wanting » from « liking »: anticipation activates dopamine, the messenger of desire, sometimes more strongly than the reward itself. Thirteen years of waiting, two delays, trailers dissected frame by frame: paradoxically, each postponement fueled desire rather than killing it. Scarcity makes what is hard to get feel more valuable, while nostalgia reconnects players returning to Vice City with part of their youth.",
      "## 2. The need for escape, freedom, and mastery",
      "![Player holding a PlayStation 5 DualSense controller at the launch of GTA VI (CC BY-SA 4.0)](/images/gta6-manette-ps5.webp)",
      "Why do open worlds captivate so deeply? Self-determination theory, one of the most robust frameworks in motivational psychology, identifies three core needs: autonomy (choosing), competence (succeeding), and relatedness (connecting with others). Open-world games feed all three, reinforced by « flow », the state of total absorption described by psychologist Mihaly Csikszentmihalyi where challenge matches skill and time fades away.",
      "## 3. Does in-game violence cause real violence? What science actually says",
      "This debate has followed every GTA release since 1997. After decades of research, scientific findings are far more cautious than sensational headlines. A 2019 preregistered Oxford University study of adolescents and their parents found **no link** between time spent playing violent games and aggressive behavior. The American Psychological Association's revised 2020 resolution notes a weak association with minor aggressive behaviors while concluding evidence is **insufficient** to link violent video games to serious real-world violence.",
      "## 4. The real watchpoint: when gaming crowds out life",
      "There is nonetheless a recognized risk: **gaming disorder**, included in the World Health Organization's ICD-11. Enthusiastically playing on launch weekend is not a disorder; the WHO defines gaming disorder only when loss of control persists for at least twelve months and seriously impairs sleep, work, schooling, or close relationships.",
      "## Enjoying the release without losing balance",
      "Psychology invites us to look at this global craze with clarity rather than alarmism. The shared excitement around GTA 6 reflects our human appetite for collective stories, agency, and community. As with any absorbing pastime, the key question stays simple: are you choosing when to pick up — and put down — the controller?",
      "**Sources :**\n[1] Berridge, K. C. & Robinson, T. E. (2016). « Liking, wanting, and the incentive-sensitization theory of addiction », *American Psychologist*, 71(8), p. 670-679.\n[2] Cialdini, R. B. (2007). *Influence: The Psychology of Persuasion*, Harper Business.\n[3] Ryan, R. M. & Deci, E. L. (2000). « Self-Determination Theory and the Facilitation of Intrinsic Motivation, Social Development, and Well-Being », *American Psychologist*, 55(1), p. 68-78.\n[4] Csikszentmihalyi, M. (1990). *Flow: The Psychology of Optimal Experience*, Harper & Row.\n[5] Przybylski, A. K. & Weinstein, N. (2019). « Violent video game engagement is not associated with adolescents' aggressive behaviour », *Royal Society Open Science*, 6(2), 171474.\n[6] American Psychological Association (2020). *APA Resolution on Violent Video Games*, February 2020.\n[7] World Health Organization (2019). *ICD-11: Gaming Disorder (6C51)*.\n[8] Take-Two Interactive / Rockstar Games (Nov 2026). Global launch of *Grand Theft Auto VI*."
    ],
    titre_ht: "GTA 6 : poukisa lemonn antye te tann 13 lane — ak sa sikoloji di nou sou lafyèv sa a",
    resume_ht: "19 novanm 2026, plizyè milyon jwè mete men yo finalman sou Grand Theft Auto VI, trèz lane apre GTA V. Liy atant a minwi, konje nan travay, rekò vant depi premye jou : kisa sikoloji esplike dèyè gwo pasyon sa a ?",
    contenu_ht: [
      "Trèz lane. Se tan ki pase ant GTA V (2013) ak GTA VI, ki sòti 19 novanm 2026 sou PlayStation 5 ak Xbox Series apre de rapò. Dapre Take-Two, jwèt la fè prèske 3,8 milya dola vant depi premye jou li. Dèyè chif sa yo, gen mekanis sikolojik tout moun ka rekonèt nan tèt yo.",
      "## 1. Atant lan li menm se yon plezi",
      "![Ocean Drive lannuit nan Miami Beach, anbyans ki enspire Vice City nan GTA VI (CC BY-SA 4.0)](/images/gta6-vice-city-miami.webp)",
      "Tann yon plezi fè pati plezi a. Nerosyans fè diferans ant « vle » ak « renmen » : antisipasyon an aktive dopamine, mesaje dezi a. Plis moun tann epi plis imaj yo ra, se plis dezi ak nostalji pou Vice City vin pi fò.",
      "## 2. Bezwen libète, evazyon ak metriz",
      "![Jwè ki kenbe yon manèt PlayStation 5 DualSense pou lansman GTA VI (CC BY-SA 4.0)](/images/gta6-manette-ps5.webp)",
      "Teyori otodetèminasyon an idantifye twa bezwen debaz : otonomi, konpetans ak lyen ak lòt moun. Yon jwèt mond ouvè nourri tout twa, ansanm ak eta « flow » kote tan an sanble kanpe paske defi a adapte ak kapasite w.",
      "## 3. Èske vyolans nan jwèt videyo fè moun vyolan ? Repons syans lan",
      "An 2019, yon etid inivèsite Oxford pa jwenn **okenn lyen** ant tan jèn yo pase sou jwèt vyolan ak konpòtman agresif. Asosyasyon Ameriken Sikoloji (APA, 2020) estime prèv yo **ensifizan** pou lye jwèt videyo ak vyolans grav nan lavi reyèl.",
      "## 4. Pwen vijilans reyèl la : lè jwèt la pran tout plas la",
      "Òganizasyon Mondyal Lasante (OMS) rekonèt **twoub jwèt videyo a** (CIM-11) sèlman lè pèt kontwòl la dire plis pase douz mwa epi li deranje dòmi, travay, lekòl oswa relasyon fanmi. Pou pifò jwè yo, eksitasyon an desann natirèlman apre kèk semèn.",
      "## Pwofite lansman an san pèdi ekilib",
      "Lafyèv GTA 6 la montre bezwen nou genyen pou n pataje istwa ak yon kominote. Sa ki pi enpòtan an se chwazi ki lè pou w limen — ak ki lè pou w etenn — konsòl la.",
      "**Sources :**\n[1] Berridge, K. C. & Robinson, T. E. (2016). « Liking, wanting, and the incentive-sensitization theory of addiction », *American Psychologist*, 71(8), p. 670-679.\n[2] Cialdini, R. B. (2007). *Influence et manipulation*, First Éditions.\n[3] Ryan, R. M. & Deci, E. L. (2000). « Self-Determination Theory », *American Psychologist*, 55(1), p. 68-78.\n[4] Csikszentmihalyi, M. (1990). *Flow: The Psychology of Optimal Experience*.\n[5] Przybylski, A. K. & Weinstein, N. (2019). *Royal Society Open Science*, 6(2), 171474.\n[6] American Psychological Association (2020). *APA Resolution on Violent Video Games*.\n[7] Organisation mondiale de la santé (2019). *CIM-11 : Trouble du jeu vidéo (6C51)*.\n[8] Take-Two Interactive / Rockstar Games (novanm 2026). Lansman *Grand Theft Auto VI*."
    ],
    titre_es: "GTA 6: por qué el mundo esperó 13 años — y qué dice la psicología sobre esta fiebre",
    resume_es: "El 19 de noviembre de 2026, millones de jugadores accedieron por fin a Grand Theft Auto VI, trece años después de GTA V. Filas a medianoche, permisos en el trabajo, récord histórico en el primer día: ¿qué explica la psicología detrás de este fenómeno?",
    contenu_es: [
      "Trece años. Ese es el tiempo transcurrido entre GTA V (2013) y GTA VI, lanzado el 19 de noviembre de 2026 en PlayStation 5 y Xbox Series tras dos aplazamientos. Según Take-Two, el juego superó los 3.800 millones de dólares en ventas en su primer día. Detrás de estas cifras actúan mecanismos psicológicos muy humanos.",
      "## 1. La propia espera es parte del placer",
      "![Ocean Drive de noche en Miami Beach, la atmósfera neón que inspira Vice City en GTA VI (CC BY-SA 4.0)](/images/gta6-vice-city-miami.webp)",
      "La neurociencia distingue entre « querer » y « gustar »: la anticipación activa la dopamina, a veces con más fuerza que la recompensa final. La escasez y la nostalgia por Vice City multiplicaron el deseo con cada retraso.",
      "## 2. Necesidad de evasión, libertad y dominio",
      "![Jugador sosteniendo un mando PlayStation 5 DualSense durante el lanzamiento de GTA VI (CC BY-SA 4.0)](/images/gta6-manette-ps5.webp)",
      "La teoría de la autodeterminación señala tres necesidades básicas: autonomía, competencia y vínculo social. Un mundo abierto alimenta las tres y favorece el estado de « flow » descrito por Mihaly Csikszentmihalyi.",
      "## 3. ¿La violencia en los videojuegos vuelve violentas a las personas?",
      "Un estudio preregistrado de la Universidad de Oxford (2019) no halló **ninguna relación** entre el tiempo dedicado a juegos violentos y conductas agresivas en adolescentes. La Asociación Estadounidense de Psicología (APA, 2020) concluye que las pruebas son **insuficientes** para vincular los videojuegos violentos con la violencia grave.",
      "## 4. El punto real de atención: cuando el juego ocupa todo el espacio",
      "La OMS reconoce el **trastorno por uso de videojuegos** (CIE-11) solo cuando la pérdida de control persiste al menos doce meses y perjudica el sueño, los estudios, el trabajo o las relaciones personales.",
      "## Disfrutar sin perder el equilibrio",
      "Más allá de la alarma moral, la fiebre por GTA 6 refleja nuestro deseo de historias compartidas y pertenencia. Lo esencial sigue siendo decidir cuándo encender — y cuándo apagar — la consola.",
      "**Sources :**\n[1] Berridge, K. C. & Robinson, T. E. (2016). « Liking, wanting, and the incentive-sensitization theory of addiction », *American Psychologist*, 71(8), p. 670-679.\n[2] Cialdini, R. B. (2007). *Influencia*, First Éditions.\n[3] Ryan, R. M. & Deci, E. L. (2000). « Self-Determination Theory », *American Psychologist*, 55(1), p. 68-78.\n[4] Csikszentmihalyi, M. (1990). *Flow: The Psychology of Optimal Experience*.\n[5] Przybylski, A. K. & Weinstein, N. (2019). *Royal Society Open Science*, 6(2), 171474.\n[6] American Psychological Association (2020). *APA Resolution on Violent Video Games*.\n[7] Organización Mundial de la Salud (2019). *CIE-11: Trastorno por uso de videojuegos (6C51)*.\n[8] Take-Two Interactive / Rockstar Games (noviembre de 2026). Lanzamiento de *Grand Theft Auto VI*."
    ]
  },
  {
    id: "biais-psychologiques-cerveau",
    urlStatique: "biais-psychologiques.html",
    categorie: "Psychologie",
    aLaUne: false,
    auteur: "Stanley Mazile",
    date: "2026-11-24T00:00:00Z",
    dateModif: "2026-11-24T00:00:00Z",
    image: "/images/biais-psychologiques-couverture.webp",
    imageWidth: 1280,
    imageHeight: 853,
    imageAlt: "Pions d'échecs en noir et blanc illustrant les biais psychologiques et nos choix (CC BY-SA 4.0 / Dietmar Rabich)",
    articlesSimilairesIds: ["gta-6-psychologie-attente-fievre"],
    motsCles: "biais cognitifs, biais psychologiques, biais de confirmation, effet d'ancrage, Dunning-Kruger, psychologie, Educa-Psy",
    titre: "Pourquoi votre cerveau vous trompe : 5 biais psychologiques qui guident vos choix sans que vous le sachiez",
    resume: "Nous pensons décider en toute logique. La psychologie montre pourtant que notre cerveau prend des raccourcis — et que ces raccourcis faussent nos jugements, nos relations et nos décisions, chaque jour, sans que nous nous en rendions compte.",
    contenu: [
      "Vous avez déjà eu l'impression d'avoir « toujours raison » dans une discussion ? Ou acheté un produit parce que son prix barré donnait l'impression d'une affaire exceptionnelle ? Ce n'est pas un manque d'intelligence : ce sont des biais cognitifs, des mécanismes normaux du cerveau humain, étudiés par la psychologie depuis cinquante ans. En voici cinq, parmi les plus puissants — et comment les repérer.",
      "## 1. Le biais de confirmation : nous cherchons ce qui nous donne raison",
      "![Illustration du biais de confirmation : retenir les indices qui confirment nos croyances et ignorer les contradictions](/assets/aistudio/Biais_de_confirmation_12554662.svg)",
      "Notre cerveau retient facilement les informations qui confirment ce que nous pensons déjà, et écarte celles qui le contredisent. C'est pourquoi deux personnes peuvent regarder le même événement et en tirer des conclusions opposées, chacune sincèrement convaincue d'avoir « vu les faits ». Sur les réseaux sociaux, ce biais est amplifié : nous suivons des comptes qui pensent comme nous, et le monde semble soudain unanime.",
      "*Pour s'en protéger :* cherchez délibérément l'argument contraire le plus solide. Si vous ne pouvez pas le formuler, c'est que vous ne connaissez pas encore le sujet.",
      "## 2. L'effet d'ancrage : le premier chiffre décide des suivants",
      "Dans une expérience célèbre, des estimations variaient fortement selon un nombre présenté au hasard juste avant la question. Le premier chiffre entendu sert d'« ancre » : prix de départ d'une négociation, premier avis médical, première impression sur une personne. Tout ce qui suit est jugé par comparaison avec cette ancre, même quand elle n'a aucun rapport avec la réalité.",
      "*Pour s'en protéger :* avant toute décision importante, fixez votre propre estimation, par écrit, avant d'entendre celle des autres.",
      "## 3. Le biais de disponibilité : ce qui vient à l'esprit semble plus fréquent",
      "![Illustration du biais de disponibilité : un événement spectaculaire médiatisé paraît plus fréquent qu'un risque quotidien silencieux](/assets/aistudio/Biais_de_disponibilit__1e793a81.svg)",
      "Nous jugeons la fréquence d'un événement selon la facilité avec laquelle des exemples nous viennent en tête. Après avoir vu plusieurs reportages sur les accidents d'avion, nous surestimons leur risque, alors que la route reste bien plus dangereuse. Les faits divers spectaculaires occupent notre esprit, et les réalités silencieuses — souvent plus importantes — passent inaperçues.",
      "*Pour s'en protéger :* demandez-vous « combien de fois, réellement ? » et cherchez le chiffre avant de conclure.",
      "## 4. Le biais de négativité : le mauvais pèse plus lourd que le bon",
      "![Illustration du biais de négativité : une balance penchée du côté d'une critique lourde face à plusieurs éléments positifs](/assets/aistudio/Biais_de_n_gativit__2031562b.svg)",
      "Une critique nous marque plus que dix compliments. Une perte fait plus mal qu'un gain équivalent ne fait plaisir. Les psychologues l'ont démontré : « le mauvais est plus fort que le bon ». Ce biais protégeait nos ancêtres — mieux valait surestimer un danger que l'ignorer — mais il colore aujourd'hui notre humeur, nos relations et notre lecture de l'actualité.",
      "*Pour s'en protéger :* quand une journée vous semble « ratée », listez concrètement ce qui s'est bien passé. L'exercice semble simple ; il rééquilibre une comptabilité mentale naturellement faussée.",
      "## 5. L'effet Dunning-Kruger : moins on sait, plus on se croit compétent",
      "![Illustration de l'effet Dunning-Kruger : courbe reliant la confiance et la compétence réelle](/assets/aistudio/Effet_Dunning-Kruger_a0d47c50.svg)",
      "Les chercheurs David Dunning et Justin Kruger ont montré que les personnes les moins compétentes dans un domaine surestiment le plus leurs capacités — parce que les connaissances qui leur manquent sont précisément celles qui leur permettraient de mesurer leur ignorance. À l'inverse, les vrais experts doutent davantage, car ils voient la complexité du sujet.",
      "*Pour s'en protéger :* considérez le doute non comme une faiblesse, mais comme un signe de lucidité. Et méfiez-vous des certitudes immédiates — les vôtres comme celles des autres.",
      "## Connaître ses biais ne les supprime pas — mais cela change tout",
      "On ne « désactive » pas un biais cognitif comme on éteint une lumière : ces mécanismes sont le prix d'un cerveau rapide et efficace. Mais les connaître permet de ralentir au bon moment, de poser une question de plus avant de juger, de décider ou de partager une information. La première étape de la pensée critique n'est pas de se méfier des autres. C'est de se méfier, un peu, de soi-même.",
      "**Sources :**\n[1] Tversky, A. & Kahneman, D. (1974). « Judgment under Uncertainty: Heuristics and Biases », *Science*, 185(4157), p. 1124-1131.\n[2] Kahneman, D. (2011). *Système 1 / Système 2 : les deux vitesses de la pensée*, Flammarion.\n[3] Nickerson, R. S. (1998). « Confirmation Bias: A Ubiquitous Phenomenon in Many Guises », *Review of General Psychology*, 2(2), p. 175-220.\n[4] Baumeister, R. F., Bratslavsky, E., Finkenauer, C. & Vohs, K. D. (2001). « Bad Is Stronger Than Good », *Review of General Psychology*, 5(4), p. 323-370.\n[5] Kruger, J. & Dunning, D. (1999). « Unskilled and Unaware of It », *Journal of Personality and Social Psychology*, 77(6), p. 1121-1134."
    ],
    titre_en: "Why Your Brain Tricks You: 5 Psychological Biases Guiding Your Choices Without You Knowing",
    resume_en: "We think we decide through pure logic. Yet psychology shows our brain takes shortcuts — and those shortcuts distort our judgments, relationships, and everyday decisions without us realizing it.",
    contenu_en: [
      "Have you ever felt like you are « always right » in an argument? Or bought something because its crossed-out original price made it look like an unmissable deal? That is not a lack of intelligence: those are cognitive biases, normal mechanisms of the human brain studied in psychology for fifty years. Here are five of the most powerful — and how to spot them.",
      "## 1. Confirmation bias: we look for what proves us right",
      "![Illustration of confirmation bias: retaining evidence that confirms existing beliefs while ignoring contradictions](/assets/aistudio/Biais_de_confirmation_12554662.svg)",
      "Our brain easily remembers information that confirms what we already believe and discards whatever contradicts it. That is why two people can watch the same event and reach opposite conclusions, each sincerely convinced they simply « saw the facts ». On social media, this bias is amplified: we follow accounts that think like us, and the world suddenly seems unanimous.",
      "*How to protect yourself:* deliberately look for the strongest counterargument. If you cannot articulate it, you do not truly know the subject yet.",
      "## 2. The anchoring effect: the first number shapes every estimate after it",
      "In a famous experiment, people's estimates shifted dramatically depending on a random number shown right before the question. The first figure you hear acts as an « anchor »: an opening negotiation price, a first medical opinion, a first impression of someone. Everything that follows is judged against that anchor, even when it has nothing to do with reality.",
      "*How to protect yourself:* before any major decision, write down your own estimate before hearing anyone else's.",
      "## 3. Availability bias: what comes to mind easily seems more frequent",
      "![Illustration of availability bias: dramatic news coverage makes rare events feel more common than quiet everyday risks](/assets/aistudio/Biais_de_disponibilit__1e793a81.svg)",
      "We judge how frequent an event is by how easily examples come to mind. After seeing several news reports on plane crashes, we overestimate their risk, even though road travel remains far more dangerous. Spectacular stories capture our attention while quiet realities — often much larger — go unnoticed.",
      "*How to protect yourself:* ask « how often, really? » and check the numbers before concluding.",
      "## 4. Negativity bias: the bad weighs heavier than the good",
      "![Illustration of negativity bias: a scale tipped heavily toward a single criticism against positive moments](/assets/aistudio/Biais_de_n_gativit__2031562b.svg)",
      "One criticism stays with us longer than ten compliments. A loss hurts more than an equal gain feels good. Psychologists have demonstrated it clearly: « bad is stronger than good ». This bias helped protect our ancestors — better to overestimate a threat than ignore it — yet today it colors our mood, our relationships, and how we read the news.",
      "*How to protect yourself:* when a day feels « ruined », concretely list what went well. The exercise sounds simple; it rebalances a naturally skewed mental ledger.",
      "## 5. The Dunning-Kruger effect: the less we know, the more competent we think we are",
      "![Illustration of the Dunning-Kruger effect: confidence curve relative to actual competence](/assets/aistudio/Effet_Dunning-Kruger_a0d47c50.svg)",
      "Researchers David Dunning and Justin Kruger showed that people who are least skilled in a field overestimate their abilities the most — because the very knowledge they lack is what they would need to recognize their own blind spots. Conversely, true experts doubt more because they see the full complexity of the subject.",
      "*How to protect yourself:* treat doubt not as a weakness, but as a sign of clarity. And be wary of instant certainty — both yours and everyone else's.",
      "## Knowing your biases does not erase them — yet it changes everything",
      "You cannot « turn off » a cognitive bias like flipping a light switch: these shortcuts are the price of a fast, efficient brain. Recognizing them, however, helps you pause at the right moment and ask one more question before judging, deciding, or sharing information. The first step of critical thinking is not distrusting others. It is gently questioning yourself.",
      "**Sources :**\n[1] Tversky, A. & Kahneman, D. (1974). « Judgment under Uncertainty: Heuristics and Biases », *Science*, 185(4157), p. 1124-1131.\n[2] Kahneman, D. (2011). *Thinking, Fast and Slow*, Farrar, Straus and Giroux.\n[3] Nickerson, R. S. (1998). « Confirmation Bias: A Ubiquitous Phenomenon in Many Guises », *Review of General Psychology*, 2(2), p. 175-220.\n[4] Baumeister, R. F., Bratslavsky, E., Finkenauer, C. & Vohs, K. D. (2001). « Bad Is Stronger Than Good », *Review of General Psychology*, 5(4), p. 323-370.\n[5] Kruger, J. & Dunning, D. (1999). « Unskilled and Unaware of It », *Journal of Personality and Social Psychology*, 77(6), p. 1121-1134."
    ],
    titre_ht: "Poukisa sèvo ou twonpe ou : 5 pyèj sikolojik ki gide chwa ou san ou pa konnen",
    resume_ht: "Nou panse nou pran desizyon ak tout lojik nou. Poutan sikoloji montre sèvo nou pran chemen kout — e chemen kout sa yo fòse jijman nou, relasyon nou ak desizyon nou chak jou san nou pa rann nou kont.",
    contenu_ht: [
      "Èske ou janm santi ou « toujou gen rezon » nan yon diskisyon ? Oswa ou achte yon bagay paske pri ki bare a te fè ou panse se yon bon okazyon ? Sa pa vle di ou manke entèlijans : se pyèj kognitif yo ye, mekanis nòmal sèvo moun nan, sikoloji ap etidye depi senkant lane. Men senk ladan yo ki pi fò — ak fason pou ou rekonèt yo.",
      "## 1. Pyèj konfimasyon an : nou chèche sa ki ban nou rezon",
      "![Ilistrasyon pyèj konfimasyon : kenbe sa ki konfime sa nou panse deja epi mete sa ki kontredi l sou kote](/assets/aistudio/Biais_de_confirmation_12554662.svg)",
      "Sèvo nou kenbe fasil enfòmasyon ki konfime sa nou panse deja, epi li mete sou kote sa ki kontredi yo. Se poutèt sa de moun kapab gade menm evènman an epi rive nan de konklizyon opoze, chak grenn konvenki yo « wè reyalite a ». Sou rezo sosyal yo, pyèj sa a vin pi fò toujou : nou suiv kont ki panse menm jan ak nou.",
      "*Pou pwoteje tèt ou :* chèche espre agiman kontrè ki pi solid la. Si ou pa ka esplike l, se paske ou poko konnen sijè a byen.",
      "## 2. Efè lank lan : premye chif la deside tout lòt yo",
      "Nan yon eksperyans selèb, estimasyon moun yo te chanje anpil selon yon chif yo te montre yo pa aza jis anvan kesyon an. Premye chif nou tande a sèvi kòm yon « lank » : premye pri nan yon negosyasyon, premye avi medikal, premye enpresyon sou yon moun. Tout sa ki vini apre mezire pa rapò ak lank sa a.",
      "*Pou pwoteje tèt ou :* anvan nenpòt desizyon enpòtan, ekri pwòp estimasyon pa ou anvan ou tande pa lòt moun.",
      "## 3. Pyèj disponiblite a : sa ki vin nan tèt nou vit parèt pi souvan",
      "![Ilistrasyon pyèj disponiblite : yon evènman espektakilè nan medya parèt pi souvan pase yon danje chak jou](/assets/aistudio/Biais_de_disponibilit__1e793a81.svg)",
      "Nou jije frekans yon evènman selon jan egzanp yo vin nan tèt nou fasil. Apre nou fin wè plizyè repòtaj sou aksidan avyon, nou panse risk la pi wo, alòske wout la rete pi danjere anpil. Evènman espektakilè yo pran tout plas nan lespri nou.",
      "*Pou pwoteje tèt ou :* mande tèt ou « konbyen fwa toutbon ? » epi chèche chif reyèl yo anvan ou konkli.",
      "## 4. Pyèj negativite a : sa ki mal peze pi lou pase sa ki bon",
      "![Ilistrasyon pyèj negativite : balans ki panche bò yon sèl kritik devan plizyè bagay pozitif](/assets/aistudio/Biais_de_n_gativit__2031562b.svg)",
      "Yon sèl kritik make nou pi plis pase dis konpliman. Yon pèt fè nou pi mal pase yon genyen menm valè a fè nou plezi. Sikològ yo pwouve l : « sa ki mal pi fò pase sa ki bon ». Pyèj sa a te pwoteje zansèt nou yo kont danje, men jodi a li chanje imè nou ak fason nou wè lavi a.",
      "*Pou pwoteje tèt ou :* lè yon jounen parèt « rate », ekri konkrètman sa ki te mache byen. Egzèsis sa a remete balans lan nan plas li.",
      "## 5. Efè Dunning-Kruger la : mwens ou konnen, plis ou kwè ou konpetan",
      "![Ilistrasyon efè Dunning-Kruger : koub konfyans ak eksperyans reyèl](/assets/aistudio/Effet_Dunning-Kruger_a0d47c50.svg)",
      "Chèchè David Dunning ak Justin Kruger montre moun ki mwens konpetan nan yon domèn souzestime limit yo pi plis — paske konesans ki manke yo a se egzakteman sa ki t ap pèmèt yo mezire inyorans yo. Okontrè, vrè ekspè yo doute plis paske yo wè konpleksite sijè a.",
      "*Pou pwoteje tèt ou :* wè dout la non pa kòm yon feblès, men kòm yon siy lisidite. Epi veye sètiti twò rapid yo.",
      "## Konnen pyèj ou yo pa efase yo — men sa chanje tout bagay",
      "Nou pa ka « etenn » yon pyèj kognitif tankou yon limyè : mekanis sa yo se pri yon sèvo ki travay vit. Men konnen yo pèmèt nou ralanti nan bon moman an epi poze yon kesyon anplis anvan nou jije oswa deside. Premye pa lespri kritik la se pa mefye lòt moun. Se veye tèt pa nou tou.",
      "**Sources :**\n[1] Tversky, A. & Kahneman, D. (1974). « Judgment under Uncertainty: Heuristics and Biases », *Science*, 185(4157), p. 1124-1131.\n[2] Kahneman, D. (2011). *Système 1 / Système 2 : les deux vitesses de la pensée*, Flammarion.\n[3] Nickerson, R. S. (1998). « Confirmation Bias: A Ubiquitous Phenomenon in Many Guises », *Review of General Psychology*, 2(2), p. 175-220.\n[4] Baumeister, R. F., Bratslavsky, E., Finkenauer, C. & Vohs, K. D. (2001). « Bad Is Stronger Than Good », *Review of General Psychology*, 5(4), p. 323-370.\n[5] Kruger, J. & Dunning, D. (1999). « Unskilled and Unaware of It », *Journal of Personality and Social Psychology*, 77(6), p. 1121-1134."
    ],
    titre_es: "Por qué tu cerebro te engaña: 5 sesgos psicológicos que guían tus decisiones sin que lo sepas",
    resume_es: "Creemos decidir con pura lógica. Sin embargo, la psicología demuestra que nuestro cerebro toma atajos que distorsionan nuestros juicios, relaciones y decisiones cada día sin que lo notemos.",
    contenu_es: [
      "¿Alguna vez sentiste que « siempre tienes razón » en una discusión? ¿O compraste un producto porque su precio tachado parecía una ganga imperdible? No es falta de inteligencia: son sesgos cognitivos, mecanismos normales del cerebro humano estudiados por la psicología desde hace cincuenta años. Aquí tienes cinco de los más poderosos y cómo detectarlos.",
      "## 1. El sesgo de confirmación: buscamos lo que nos da la razón",
      "![Ilustración del sesgo de confirmación: retener lo que confirma nuestras creencias e ignorar las contradicciones](/assets/aistudio/Biais_de_confirmation_12554662.svg)",
      "Nuestro cerebro recuerda con facilidad la información que confirma lo que ya pensamos y descarta lo que lo contradice. Por eso dos personas pueden ver el mismo hecho y sacar conclusiones opuestas. En redes sociales este sesgo se amplifica: seguimos cuentas que piensan como nosotros.",
      "*Para protegerte:* busca deliberadamente el argumento contrario más sólido. Si no puedes formularlo, aún no dominas el tema.",
      "## 2. El efecto de anclaje: la primera cifra decide las siguientes",
      "En un experimento célebre, las estimaciones variaban según un número mostrado al azar justo antes de la pregunta. La primera cifra sirve de « ancla »: el precio inicial de una negociación o una primera impresión. Todo lo demás se juzga en comparación con esa ancla.",
      "*Para protegerte:* antes de una decisión importante, anota tu propia estimación por escrito antes de escuchar la de otros.",
      "## 3. El sesgo de disponibilidad: lo que viene rápido a la mente parece más frecuente",
      "![Ilustración del sesgo de disponibilidad: un suceso mediático espectacular parece más frecuente que un riesgo cotidiano](/assets/aistudio/Biais_de_disponibilit__1e793a81.svg)",
      "Juzgamos la frecuencia de un evento según la facilidad con la que recordamos ejemplos. Tras ver noticias sobre accidentes aéreos, sobreestimamos su riesgo, aunque la carretera sigue siendo mucho más peligrosa.",
      "*Para protegerte:* pregúntate « ¿con qué frecuencia ocurre realmente? » y busca los datos antes de concluir.",
      "## 4. El sesgo de negatividad: lo malo pesa más que lo bueno",
      "![Ilustración del sesgo de negatividad: una balanza inclinada hacia una crítica frente a varios momentos positivos](/assets/aistudio/Biais_de_n_gativit__2031562b.svg)",
      "Una crítica nos marca más que diez elogios. Una pérdida duele más de lo que alegra una ganancia equivalente. Los psicólogos lo demostraron: « lo malo es más fuerte que lo bueno ». Este sesgo protegía a nuestros ancestros del peligro, pero hoy tiñe nuestro ánimo y nuestra lectura de la actualidad.",
      "*Para protegerte:* cuando un día te parezca « perdido », anota concretamente qué salió bien. Ayuda a reequilibrar la balanza mental.",
      "## 5. El efecto Dunning-Kruger: cuanto menos sabemos, más competentes nos creemos",
      "![Ilustración del efecto Dunning-Kruger: curva entre confianza y competencia real](/assets/aistudio/Effet_Dunning-Kruger_a0d47c50.svg)",
      "Los investigadores David Dunning y Justin Kruger demostraron que las personas menos competentes en un área sobreestiman más sus capacidades, porque les faltan precisamente los conocimientos para medir lo que ignoran. En cambio, los verdaderos expertos dudan más porque ven la complejidad del tema.",
      "*Para protegerte:* considera la duda no como debilidad, sino como señal de lucidez, y desconfía de las certezas inmediatas.",
      "## Conocer tus sesgos no los elimina, pero lo cambia todo",
      "No se « apaga » un sesgo cognitivo como una luz: son el precio de un cerebro rápido. Conocerlos permite frenar a tiempo y hacer una pregunta más antes de juzgar o decidir. El primer paso del pensamiento crítico es cuestionarse un poco a uno mismo.",
      "**Sources :**\n[1] Tversky, A. & Kahneman, D. (1974). « Judgment under Uncertainty: Heuristics and Biases », *Science*, 185(4157), p. 1124-1131.\n[2] Kahneman, D. (2011). *Pensar rápido, pensar despacio*, Debate.\n[3] Nickerson, R. S. (1998). « Confirmation Bias: A Ubiquitous Phenomenon in Many Guises », *Review of General Psychology*, 2(2), p. 175-220.\n[4] Baumeister, R. F., Bratslavsky, E., Finkenauer, C. & Vohs, K. D. (2001). « Bad Is Stronger Than Good », *Review of General Psychology*, 5(4), p. 323-370.\n[5] Kruger, J. & Dunning, D. (1999). « Unskilled and Unaware of It », *Journal of Personality and Social Psychology*, 77(6), p. 1121-1134."
    ]
  }
];

const IMAGE_EDUCATION_PROVINCE_SVG = "images/education-province.svg";
const ALT_EDUCATION_PROVINCE_FR = "Illustration de l'accès à l'éducation de qualité dans nos villes de province : élèves, salle de classe et livres ouverts";

function estUrlImgbb(url) {
  return typeof url === "string" && /https?:\/\/(?:i\.)?(?:ibb\.co|imgbb\.com)\//i.test(url);
}

function convertirLienLocalEnWebp(url) {
  if (typeof url !== "string") return url;
  return url.replace(
    /(^|\/)(images\/(?:education[124]|gta6-lancement|gta6-manette-ps5|gta6-vice-city-miami))\.(?:png|jpe?g)(?=$|[?#])/gi,
    "$1$2.webp"
  );
}

function remplacerUrlImgbb(url, article) {
  if (!estUrlImgbb(url)) return convertirLienLocalEnWebp(url);
  if (/odd/i.test(url)) return IMAGE_EDUCATION_PROVINCE_SVG;
  if (/education4/i.test(url)) return "images/education4.webp";
  const slug = slugifyCategorie((article && article.categorie) || "");
  return slug === "education" ? IMAGE_EDUCATION_PROVINCE_SVG : "images/image2.webp";
}

function nettoyerImgbbDansTexte(texte, article) {
  if (typeof texte !== "string") return texte;
  return texte
    .replace(/!\[([^\]]*)\]\((https?:\/\/(?:i\.)?(?:ibb\.co|imgbb\.com)\/[^\s)]+)\)/gi, (_, altBrut, urlBrut) => {
      const altPropre = (altBrut || "").trim();
      const estArticleProvince = /province/i.test((article && article.titre) || "") || /odd/i.test(urlBrut);
      const altFinal = (estArticleProvince && (!altPropre || /^éducation de qualité$/i.test(altPropre)))
        ? ALT_EDUCATION_PROVINCE_FR
        : (altPropre || ALT_EDUCATION_PROVINCE_FR);
      return `![${altFinal}](${remplacerUrlImgbb(urlBrut, article)})`;
    })
    .replace(/https?:\/\/(?:i\.)?(?:ibb\.co|imgbb\.com)\/[^\s)"']+/gi, (urlBrut) => remplacerUrlImgbb(urlBrut, article))
    .replace(/(\/?images\/(?:education[124]|gta6-lancement|gta6-manette-ps5|gta6-vice-city-miami))\.(?:png|jpe?g)/gi, "$1.webp");
}

function normaliserArticle(article) {
  if (!article) return article;
  const articleNorm = {
    ...article,
    categorie: normaliserCategorieArticle(article.categorie)
  };
  if (typeof articleNorm.image === "string") {
    articleNorm.image = estUrlImgbb(articleNorm.image)
      ? remplacerUrlImgbb(articleNorm.image, articleNorm)
      : convertirLienLocalEnWebp(articleNorm.image);
  }
  for (const champContenu of ["contenu", "contenu_en", "contenu_ht", "contenu_es"]) {
    const val = articleNorm[champContenu];
    if (Array.isArray(val)) {
      articleNorm[champContenu] = val.map(bloc => nettoyerImgbbDansTexte(bloc, articleNorm));
    } else if (typeof val === "string") {
      articleNorm[champContenu] = nettoyerImgbbDansTexte(val, articleNorm);
    }
  }
  return articleNorm;
}

function slugifyCategorie(categorie) {
  if (!categorie) return "";
  const cleNormalisee = retirerAccents(categorie.toLowerCase()).trim();
  if (CATEGORIES_SLUGS_COURTS[cleNormalisee]) {
    return CATEGORIES_SLUGS_COURTS[cleNormalisee];
  }
  return slugify(categorie);
}

function normaliserCategorie(cat) {
  if (!cat) return "";
  return retirerAccents(cat.toLowerCase()).trim();
}

function correspondCategorie(catArticle, catFiltre) {
  if (!catFiltre || catFiltre === "Tous") return true;
  return normaliserCategorie(catArticle) === normaliserCategorie(catFiltre);
}

function obtenirImageArticle(article) {
  if (article && article.image && typeof article.image === "string" && article.image.trim()) {
    return article.image.trim();
  }
  const titre = ((article && article.titre) || "").toLowerCase();
  if (titre.includes("fanm") || titre.includes("genre") || titre.includes("violence") || titre.includes("femme") || titre.includes("grand-goave")) {
    return "images/Fanm.webp";
  }
  if (titre.includes("gpt") || titre.includes("astra") || titre.includes("ia") || titre.includes("intelligence artificielle") || titre.includes("affective") || titre.includes("dependance")) {
    return "images/image2.webp";
  }
  if (titre.includes("kenscoff") || titre.includes("crise") || titre.includes("massacre") || titre.includes("etat")) {
    return "images/Droit.webp";
  }
  if (titre.includes("rentree") || titre.includes("scolaire") || titre.includes("ecole")) {
    return "images/Ecole.webp";
  }

  // Fallback par catégorie
  const slug = slugifyCategorie((article && article.categorie) || "");
  if (slug === "education") return "images/Ecole.webp";
  if (slug === "psychologie") return "images/image2.webp";

  return "images/logo.webp";
}

function calculerTempsLecture(contenuArray) {
  const suffixe = (typeof window !== "undefined" && window.EducaPsyI18n)
    ? window.EducaPsyI18n.texte("temps_lecture_suffixe")
    : "min de lecture";
  if (!contenuArray || !contenuArray.length) return `1 ${suffixe}`;
  const texteNettoye = contenuArray
    .filter(bloc => typeof bloc === "string")
    .map(bloc => bloc
      .replace(/!\[[^\]]*\]\([^)]+\)/g, " ")
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      .replace(/<[^>]+>/g, " "))
    .join(" ")
    .trim();
  if (!texteNettoye) return `1 ${suffixe}`;
  const mots = texteNettoye.split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(mots / 200));
  return `${minutes} ${suffixe}`;
}

/* ---------- Carousel d'images ---------- */

let compteurCarousel = 0;

function formaterCarousel(texte) {
  if (!texte) return "";
  const images = [];
  const regex = /!\[([^\]]*)\]\(((?:https?:\/\/|images\/|\.?\/)[^\s)]+)\)/g;
  let m;
  while ((m = regex.exec(texte)) !== null) {
    images.push({ alt: m[1] || "", url: m[2] });
  }
  if (!images.length) return "";

  const id = `carousel-${compteurCarousel++}`;
  const slides = images.map((img, i) => {
    const estSvg = /\.svg(?:[?#].*)?$/i.test(img.url);
    return `<div class="carousel-slide ${i === 0 ? "active" : ""}">
       <img src="${img.url}" alt="${img.alt}" loading="lazy" onerror="this.onerror=null;this.src='images/logo.webp'">
       ${!estSvg && img.alt ? `<figcaption class="carousel-caption">${img.alt}</figcaption>` : ""}
     </div>`;
  }).join("");
  const dots = images.length > 1 ? images.map((_, i) =>
    `<button type="button" class="carousel-dot ${i === 0 ? "active" : ""}"
       data-index="${i}" aria-label="Image ${i + 1}"></button>`).join("") : "";
  const navs = images.length > 1 ? `
      <button type="button" class="carousel-nav prev" aria-label="Image précédente">‹</button>
      <button type="button" class="carousel-nav next" aria-label="Image suivante">›</button>` : "";

  return `
    <div class="article-carousel" id="${id}" data-index="0" data-total="${images.length}">
      <div class="carousel-track">${slides}</div>${navs}
      <div class="carousel-dots">${dots}</div>
    </div>`;
}

function initCarousels(racine) {
  const conteneur = racine || document;
  conteneur.querySelectorAll(".article-carousel").forEach(carousel => {
    if (carousel.dataset.init) return;
    carousel.dataset.init = "1";

    const total = parseInt(carousel.dataset.total, 10);
    const track = carousel.querySelector(".carousel-track");
    const dots = carousel.querySelectorAll(".carousel-dot");
    const btnPrev = carousel.querySelector(".carousel-nav.prev");
    const btnNext = carousel.querySelector(".carousel-nav.next");

    function afficherSlide(index) {
      carousel.dataset.index = index;
      track.style.transform = `translateX(-${index * 100}%)`;
      dots.forEach((d, i) => d.classList.toggle("active", i === index));
    }

    if (btnPrev) {
      btnPrev.addEventListener("click", () => {
        const i = (parseInt(carousel.dataset.index, 10) - 1 + total) % total;
        afficherSlide(i);
      });
    }
    if (btnNext) {
      btnNext.addEventListener("click", () => {
        const i = (parseInt(carousel.dataset.index, 10) + 1) % total;
        afficherSlide(i);
      });
    }
    dots.forEach(dot => {
      dot.addEventListener("click", () => afficherSlide(parseInt(dot.dataset.index, 10)));
    });
  });
}

function parserSources(texte) {
  if (!texte) return null;
  const estSources = (
    texte.includes("Sources et liens utiles") ||
    texte.includes("**Sources :**") ||
    texte.startsWith("Sources :")
  );
  if (!estSources) return null;

  // Cas 1 : Liens markdown du type "- [Titre](url)" ou "[Titre](url)"
  const regexLiens = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g;
  const liens = [];
  let m;
  while ((m = regexLiens.exec(texte)) !== null) {
    liens.push({ titre: m[1], url: m[2] });
  }

  // Cas 2 : Numérotation du type "[1] ... [2] ... [3] ..."
  const regexNumerote = /\[(\d+)\]\s*([^\[]+)/g;
  const numerotes = [];
  let n;
  while ((n = regexNumerote.exec(texte)) !== null) {
    numerotes.push({ num: n[1], texte: n[2].trim() });
  }

  const iconeLien = `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>`;
  const iconeLivre = `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>`;

  if (liens.length > 0) {
    const itemsHtml = liens.map(l =>
      `<li><a href="${l.url}" target="_blank" rel="noopener" class="source-link"><span class="source-icon">↗</span><span class="source-text">${l.titre}</span></a></li>`
    ).join("");
    return `
      <div class="article-sources-box">
        <div class="sources-header">
          ${iconeLien}
          <h3 class="sources-title">Sources et liens utiles</h3>
        </div>
        <ul class="article-sources-links">${itemsHtml}</ul>
      </div>`;
  }

  if (numerotes.length > 0) {
    const itemsHtml = numerotes.map(item =>
      `<li><span class="source-num">[${item.num}]</span> <span class="source-text">${formaterEnrichissementsEnLigne(item.texte)}</span></li>`
    ).join("");
    return `
      <div class="article-sources-box">
        <div class="sources-header">
          ${iconeLivre}
          <h3 class="sources-title">Sources et références documentaires</h3>
        </div>
        <ol class="article-sources-numbered">${itemsHtml}</ol>
      </div>`;
  }

  return null;
}

function formaterEnrichissementsEnLigne(texte) {
  if (!texte) return "";
  const jetons = [];
  const proteger = (html) => {
    const cle = `@@EDUCAPSY_JETON_${jetons.length}@@`;
    jetons.push(html);
    return cle;
  };

  let resultat = texte
    .replace(/!\[([^\]]*)\]\(((?:https?:\/\/|images\/|\.?\/)[^\s)]+)\)/g, (_, alt, url) => {
      const estSvg = /\.svg(?:[?#].*)?$/i.test(url);
      const figCls = estSvg ? "article-inline-figure article-svg-figure" : "article-inline-figure";
      const imgCls = estSvg ? "article-inline-image article-inline-svg" : "article-inline-image";
      const legende = !estSvg && alt ? `<figcaption class="article-inline-caption">${alt}</figcaption>` : "";
      return proteger(`<figure class="${figCls}"><img src="${url}" alt="${alt}" loading="lazy" class="${imgCls}" onerror="this.onerror=null;this.src='images/logo.webp'">${legende}</figure>`);
    })
    .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, (_, label, url) =>
      proteger(`<a href="${url}" target="_blank" rel="noopener" class="article-link">${label} <span class="ext-icon" aria-hidden="true">↗</span></a>`)
    )
    .replace(/\*\*\s*([^*]+?)\s*\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[^\*])\*([^*\n]+?)\*(?!\*)/g, '$1<em>$2</em>')
    .replace(/==([^=]+)==/g, '<mark class="article-highlight">$1</mark>');

  jetons.forEach((html, i) => {
    resultat = resultat.replace(`@@EDUCAPSY_JETON_${i}@@`, () => html);
  });
  return resultat;
}

function rendreContenuArticle(contenu) {
  if (!contenu || !contenu.length) {
    return "<p><em>Cet article n'a pas encore de contenu.</em></p>";
  }

  const blocs = [];
  let bufferListe = [];

  function viderListe() {
    if (bufferListe.length) {
      const lis = bufferListe.map(item => `<li>${formaterEnrichissementsEnLigne(item)}</li>`).join("");
      blocs.push(`<ul class="article-list">${lis}</ul>`);
      bufferListe = [];
    }
  }

  for (let i = 0; i < contenu.length; i++) {
    const brut = contenu[i];
    if (typeof brut !== "string") continue;
    let t = brut.trim();
    if (!t) continue;

    // Normalisation précoce des listes malformées type "** **Texte : **" ou "*** Texte : **"
    if (/^\*\*\s+\*\*/.test(t)) {
      t = "* **" + t.replace(/^\*\*\s+\*\*/, "");
    } else if (/^\*\*\*\s+/.test(t)) {
      t = "* **" + t.replace(/^\*\*\*\s+/, "");
    }

    // 1. Carousel
    if (t.startsWith("!carousel")) {
      viderListe();
      blocs.push(formaterCarousel(t));
      continue;
    }

    // 2. Vidéo YouTube
    if (t.startsWith("![youtube](")) {
      viderListe();
      const match = t.match(/!\[youtube\]\((https?:\/\/(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([^\s)]+))\)/);
      if (match && match[2]) {
        const cleanId = match[2].split("?")[0].split("&")[0];
        blocs.push(`<div class="video-container"><iframe src="https://www.youtube-nocookie.com/embed/${cleanId}" title="Vidéo YouTube" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen loading="lazy"></iframe></div>`);
      }
      continue;
    }

    // 3. Image figure autonome
    const imageSeuleMatch = t.match(/^!\[([^\]]*)\]\(((?:https?:\/\/|images\/|\.?\/)[^\s)]+)\)$/);
    if (imageSeuleMatch) {
      viderListe();
      const alt = imageSeuleMatch[1] || "";
      const url = imageSeuleMatch[2];
      const estSvg = /\.svg(?:[?#].*)?$/i.test(url);
      const figCls = estSvg ? "article-inline-figure article-svg-figure" : "article-inline-figure";
      const imgCls = estSvg ? "article-inline-image article-inline-svg" : "article-inline-image";
      const legende = !estSvg && alt ? `<figcaption class="article-inline-caption">${alt}</figcaption>` : "";
      blocs.push(`<figure class="${figCls}"><img src="${url}" alt="${alt}" loading="lazy" class="${imgCls}" onerror="this.onerror=null;this.src='images/logo.webp'">${legende}</figure>`);
      continue;
    }

    // 4. Sources et références (blocs spéciaux souvent agglomérés)
    const sourcesHtml = parserSources(t);
    if (sourcesHtml) {
      viderListe();
      blocs.push(sourcesHtml);
      continue;
    }

    // 5. Titre de section ##
    if (t.startsWith("## ")) {
      viderListe();
      const titreSousSection = t.replace(/^##\s*/, "").trim();
      blocs.push(`<h2 class="article-subtitle">${titreSousSection}</h2>`);
      continue;
    }

    // 6. Sous-titre ###
    if (t.startsWith("### ")) {
      viderListe();
      const titreSousSection = t.replace(/^###\s*/, "").trim();
      blocs.push(`<h3 class="article-subtitle-h3">${titreSousSection}</h3>`);
      continue;
    }

    // 7. Citation blockquote >
    if (t.startsWith("> ")) {
      viderListe();
      const citation = t.replace(/^>\s*/, "").trim();
      blocs.push(`<blockquote class="article-quote">${formaterEnrichissementsEnLigne(citation)}</blockquote>`);
      continue;
    }

    // 8. Éléments de liste à puces (grouper les consécutifs dans un seul <ul>)
    if (t.startsWith("* ") || t.startsWith("- ") || t.startsWith("• ")) {
      const lignes = t.split("\n");
      lignes.forEach(l => {
        const itemPropre = l.replace(/^[\*\-•]\s+/, "").trim();
        if (itemPropre) bufferListe.push(itemPropre);
      });
      continue;
    }

    // 9. Paragraphe standard
    viderListe();
    blocs.push(`<p>${formaterEnrichissementsEnLigne(t)}</p>`);
  }

  viderListe();
  return blocs.join("\n");
}

/* Génère une pagination numérotée classique (saut direct possible
   vers n'importe quelle page, puisque tout est déjà en mémoire). */
function genererPaginationHTML(pageActuelle, totalPages) {
  if (totalPages <= 1) return "";
  let boutons = `<button type="button" class="pagination-btn" data-page="prev" ${pageActuelle === 1 ? "disabled" : ""} aria-label="Page précédente">‹</button>`;
  for (let i = 1; i <= totalPages; i++) {
    boutons += `<button type="button" class="pagination-btn ${i === pageActuelle ? "active" : ""}" data-page="${i}">${i}</button>`;
  }
  boutons += `<button type="button" class="pagination-btn" data-page="next" ${pageActuelle === totalPages ? "disabled" : ""} aria-label="Page suivante">›</button>`;
  return `<nav class="pagination" aria-label="Pagination des articles">${boutons}</nav>`;
}

/* ---------- Accès Firestore (Hybride SDK + Secours REST) ---------- */

function parserDocumentFirestoreRest(doc) {
  if (!doc) return null;
  const id = doc.name ? doc.name.split("/").pop() : "";
  const data = { id };
  if (doc.fields) {
    for (const [cle, val] of Object.entries(doc.fields)) {
      if (val.stringValue !== undefined) data[cle] = val.stringValue;
      else if (val.booleanValue !== undefined) data[cle] = val.booleanValue;
      else if (val.integerValue !== undefined) data[cle] = parseInt(val.integerValue, 10);
      else if (val.doubleValue !== undefined) data[cle] = parseFloat(val.doubleValue);
      else if (val.timestampValue !== undefined) data[cle] = val.timestampValue;
      else if (val.arrayValue !== undefined) {
        data[cle] = (val.arrayValue.values || []).map(v => v.stringValue ?? v.integerValue ?? v);
      } else if (val.nullValue !== undefined) {
        data[cle] = null;
      } else {
        data[cle] = val;
      }
    }
  }
  return normaliserArticle(data);
}

async function chargerArticlesViaRest() {
  try {
    const res = await fetch("https://firestore.googleapis.com/v1/projects/educa-psy/databases/(default)/documents/articles");
    if (!res.ok) return null;
    const json = await res.json();
    if (!json.documents || !Array.isArray(json.documents)) return [];
    const liste = json.documents.map(parserDocumentFirestoreRest).filter(Boolean);
    liste.sort((a, b) => {
      const da = new Date(a.date || 0).getTime();
      const db = new Date(b.date || 0).getTime();
      return db - da;
    });
    return liste;
  } catch (e) {
    return null;
  }
}

async function chargerArticleParIdViaRest(id) {
  try {
    const res = await fetch(`https://firestore.googleapis.com/v1/projects/educa-psy/databases/(default)/documents/articles/${encodeURIComponent(id)}`);
    if (!res.ok) return null;
    const json = await res.json();
    return parserDocumentFirestoreRest(json);
  } catch (e) {
    return null;
  }
}

function fusionnerArticlesAvecCatalogue(listeFirestore) {
  const firestoreValide = (Array.isArray(listeFirestore) ? listeFirestore : [])
    .filter(a => a && !ARTICLES_REMPLACES_IDS.has(a.id))
    .map(normaliserArticle);

  const titresPresents = new Set(
    firestoreValide.map(a => retirerAccents((a.titre || "").toLowerCase()).trim()).filter(Boolean)
  );
  const idsPresents = new Set(firestoreValide.map(a => a.id));

  const ajoutsLocaux = ARTICLES_PUBLIES_LOCAUX
    .filter(loc => {
      const titreNorm = retirerAccents((loc.titre || "").toLowerCase()).trim();
      return !idsPresents.has(loc.id) && (!titreNorm || !titresPresents.has(titreNorm));
    })
    .map(normaliserArticle);

  const fusion = [...ajoutsLocaux, ...firestoreValide];
  fusion.sort((a, b) => {
    const da = a.date && a.date.toDate ? a.date.toDate().getTime() : new Date(a.date || 0).getTime();
    const db = b.date && b.date.toDate ? b.date.toDate().getTime() : new Date(b.date || 0).getTime();
    return db - da;
  });
  return fusion;
}

/* Un seul chargement, mis en cache pour le reste de la session.
   Avec course ultra-rapide entre l'API REST HTTP (~130ms) et le SDK Firestore,
   garantissant un affichage instantané et éliminant tout blocage ou écran vide. */
export async function chargerArticles() {
  if (cacheArticles && cacheArticles.length > 0) return cacheArticles;
  if (!promesseChargement) {
    promesseChargement = (async () => {
      // 1. Tente REST et SDK en parallèle (avec timeout court sur SDK pour ne pas bloquer)
      const promesseRest = chargerArticlesViaRest();
      const promesseSdk = (async () => {
        try {
          const q = query(collection(db, "articles"), orderBy("date", "desc"));
          const snap = await Promise.race([
            getDocs(q),
            new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout SDK")), 1000))
          ]);
          return snap.docs.map(d => normaliserArticle({ id: d.id, ...d.data() }));
        } catch (_) {
          return null;
        }
      })();

      try {
        const premierResultat = await Promise.race([
          promesseRest.then(res => (res && res.length > 0 ? res : Promise.reject())),
          promesseSdk.then(res => (res && res.length > 0 ? res : Promise.reject()))
        ]);
        if (premierResultat && premierResultat.length > 0) {
          cacheArticles = fusionnerArticlesAvecCatalogue(premierResultat);
          // Hydrate discrètement en arrière-plan si le SDK termine ensuite
          promesseSdk.then(docs => {
            if (docs && docs.length > 0) cacheArticles = fusionnerArticlesAvecCatalogue(docs);
          }).catch(() => {});
          return cacheArticles;
        }
      } catch (_) {}

      // Secours direct si la course n'a pas répondu
      const secours = await promesseRest;
      if (secours && secours.length > 0) {
        cacheArticles = fusionnerArticlesAvecCatalogue(secours);
        return cacheArticles;
      }

      // Dernier recours via SDK
      try {
        const q = query(collection(db, "articles"), orderBy("date", "desc"));
        const snap = await getDocs(q);
        cacheArticles = fusionnerArticlesAvecCatalogue(snap.docs.map(d => normaliserArticle({ id: d.id, ...d.data() })));
        return cacheArticles;
      } catch (err) {
        if (ARTICLES_PUBLIES_LOCAUX.length > 0) {
          cacheArticles = fusionnerArticlesAvecCatalogue([]);
          return cacheArticles;
        }
        promesseChargement = null;
        throw err;
      }
    })();
  }
  return promesseChargement.catch(err => {
    promesseChargement = null;
    throw err;
  });
}

export async function chargerArticleParId(id) {
  if (!id || ARTICLES_REMPLACES_IDS.has(id)) return null;
  if (cacheArticles) {
    const trouve = cacheArticles.find(a => a.id === id);
    if (trouve) return trouve;
  }
  const articleLocal = ARTICLES_PUBLIES_LOCAUX.find(a => a.id === id);
  if (articleLocal) return normaliserArticle(articleLocal);

  // Course rapide entre le REST direct (~100ms) et le SDK
  try {
    const promesseRest = chargerArticleParIdViaRest(id);
    const promesseSdk = (async () => {
      try {
        const ref = doc(db, "articles", id);
        const snap = await Promise.race([
          getDoc(ref),
          new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout SDK")), 1000))
        ]);
        if (snap.exists()) return normaliserArticle({ id: snap.id, ...snap.data() });
      } catch (_) {}
      return null;
    })();

    const trouve = await Promise.race([
      promesseRest.then(r => (r ? r : Promise.reject())),
      promesseSdk.then(r => (r ? r : Promise.reject()))
    ]).catch(() => null);

    if (trouve) return trouve;
    const secours = await promesseRest;
    if (secours) return secours;
  } catch (err) {}

  return await chargerArticleParIdViaRest(id);
}

async function chargerArticlesSimilaires(categorie, idAExclure, max = 2, idsPrioritaires = []) {
  const tous = await chargerArticles();
  if (!tous || !tous.length) return [];
  const selection = [];
  if (Array.isArray(idsPrioritaires) && idsPrioritaires.length) {
    idsPrioritaires.forEach(pid => {
      const match = tous.find(a => a.id === pid && a.id !== idAExclure);
      if (match && !selection.some(s => s.id === match.id)) {
        selection.push(match);
      }
    });
  }
  const memesCat = tous.filter(
    a => a.id !== idAExclure && !selection.some(s => s.id === a.id) && correspondCategorie(a.categorie, categorie)
  );
  for (const a of memesCat) {
    if (selection.length >= max) break;
    selection.push(a);
  }
  const autres = tous.filter(
    a => a.id !== idAExclure && !selection.some(s => s.id === a.id)
  );
  for (const a of autres) {
    if (selection.length >= max) break;
    selection.push(a);
  }
  return selection.slice(0, max);
}

/* Squelette d'une carte d'article, affiché pendant le chargement
   pour un rendu plus soigné qu'un simple texte "Chargement…". */
function squeletteCarteHTML() {
  return `
    <div class="article-card squelette-carte" aria-hidden="true">
      <div class="squelette squelette-image"></div>
      <div class="squelette squelette-ligne tag"></div>
      <div class="squelette squelette-ligne titre"></div>
      <div class="squelette squelette-ligne"></div>
      <div class="squelette squelette-ligne court"></div>
    </div>`;
}

function squelettesGrilleHTML(n = 6) {
  return Array.from({ length: n }).map(squeletteCarteHTML).join("");
}

/* Squelette de la page d'un article (titre, méta, image, paragraphes). */
function squeletteArticlePageHTML() {
  return `
    <div class="squelette-article-page" aria-hidden="true">
      <div class="squelette squelette-breadcrumb"></div>
      <div class="squelette squelette-ligne tag"></div>
      <div class="squelette squelette-titre-page"></div>
      <div class="squelette squelette-meta"></div>
      <div class="squelette squelette-image-hero"></div>
      <div class="squelette squelette-paragraphe"></div>
      <div class="squelette squelette-paragraphe"></div>
      <div class="squelette squelette-paragraphe court"></div>
    </div>`;
}

/* ---------- Composants de navigation Fil d'Ariane (Breadcrumbs) ---------- */

function genererFilArianeArticleHTML(article, titre) {
  const labelAccueil = window.EducaPsyI18n ? window.EducaPsyI18n.texte("nav_accueil") : "Accueil";
  const labelArticles = window.EducaPsyI18n ? window.EducaPsyI18n.texte("nav_articles") : "Articles";
  const labelFilAriane = window.EducaPsyI18n ? window.EducaPsyI18n.texte("breadcrumb_label") : "Fil d'Ariane";
  const titreTexte = titre || article.titre || "";
  const categorie = (article.categorie || "").trim();
  const siteUrl = "https://educa-psy.web.app";
  const urlActuelle = typeof window !== "undefined" ? window.location.href : `${siteUrl}/article.html?id=${article.id}`;

  const chevronSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="9 18 15 12 9 6"></polyline></svg>`;

  let position = 1;
  let itemsHtml = `
    <li class="breadcrumb-item" itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">
      <a class="breadcrumb-link" href="index.html" itemprop="item">
        <span itemprop="name" data-i18n="nav_accueil">${labelAccueil}</span>
      </a>
      <meta itemprop="position" content="${position++}">
    </li>
    <li class="breadcrumb-separator" aria-hidden="true">${chevronSvg}</li>
    <li class="breadcrumb-item" itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">
      <a class="breadcrumb-link" href="articles.html" itemprop="item">
        <span itemprop="name" data-i18n="nav_articles">${labelArticles}</span>
      </a>
      <meta itemprop="position" content="${position++}">
    </li>`;

  if (categorie) {
    itemsHtml += `
    <li class="breadcrumb-separator" aria-hidden="true">${chevronSvg}</li>
    <li class="breadcrumb-item" itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">
      <a class="breadcrumb-link" href="articles.html?cat=${encodeURIComponent(categorie)}" itemprop="item">
        <span itemprop="name">${categorie}</span>
      </a>
      <meta itemprop="position" content="${position++}">
    </li>`;
  }

  const titreEchappeAttr = titreTexte.replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const titreEchappeContenu = titreTexte.replace(/</g, "&lt;").replace(/>/g, "&gt;");

  itemsHtml += `
    <li class="breadcrumb-separator" aria-hidden="true">${chevronSvg}</li>
    <li class="breadcrumb-item current" itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem" aria-current="page">
      <span class="breadcrumb-current" itemprop="name" title="${titreEchappeAttr}">${titreEchappeContenu}</span>
      <link itemprop="item" href="${urlActuelle}">
      <meta itemprop="position" content="${position}">
    </li>`;

  return `
    <nav class="breadcrumb-nav" aria-label="${labelFilAriane}">
      <ol class="breadcrumb-list" itemscope itemtype="https://schema.org/BreadcrumbList">
        ${itemsHtml}
      </ol>
    </nav>`;
}

function mettreAJourFilArianeArticles(catActuelle) {
  const container = document.getElementById("breadcrumb-articles-container");
  if (!container) return;

  const labelAccueil = window.EducaPsyI18n ? window.EducaPsyI18n.texte("nav_accueil") : "Accueil";
  const labelArticles = window.EducaPsyI18n ? window.EducaPsyI18n.texte("nav_articles") : "Articles";
  const labelFilAriane = window.EducaPsyI18n ? window.EducaPsyI18n.texte("breadcrumb_label") : "Fil d'Ariane";
  const siteUrl = "https://educa-psy.web.app";
  const chevronSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="9 18 15 12 9 6"></polyline></svg>`;

  let itemsHtml = `
    <li class="breadcrumb-item" itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">
      <a class="breadcrumb-link" href="index.html" itemprop="item">
        <span itemprop="name" data-i18n="nav_accueil">${labelAccueil}</span>
      </a>
      <meta itemprop="position" content="1">
    </li>
    <li class="breadcrumb-separator" aria-hidden="true">${chevronSvg}</li>`;

  const estFiltreCat = catActuelle && catActuelle !== "Tous";

  if (!estFiltreCat) {
    itemsHtml += `
    <li class="breadcrumb-item current" itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem" aria-current="page">
      <span class="breadcrumb-current" itemprop="name" data-i18n="nav_articles">${labelArticles}</span>
      <link itemprop="item" href="${siteUrl}/articles.html">
      <meta itemprop="position" content="2">
    </li>`;
  } else {
    itemsHtml += `
    <li class="breadcrumb-item" itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">
      <a class="breadcrumb-link" href="articles.html" itemprop="item">
        <span itemprop="name" data-i18n="nav_articles">${labelArticles}</span>
      </a>
      <meta itemprop="position" content="2">
    </li>
    <li class="breadcrumb-separator" aria-hidden="true">${chevronSvg}</li>
    <li class="breadcrumb-item current" itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem" aria-current="page">
      <span class="breadcrumb-current" itemprop="name">${catActuelle}</span>
      <link itemprop="item" href="${siteUrl}/articles.html?cat=${encodeURIComponent(catActuelle)}">
      <meta itemprop="position" content="3">
    </li>`;
  }

  container.innerHTML = `
    <ol class="breadcrumb-list" itemscope itemtype="https://schema.org/BreadcrumbList">
      ${itemsHtml}
    </ol>`;

  // Schema.org BreadcrumbList pour la page liste
  const ancien = document.getElementById("jsonld-breadcrumbs-liste");
  if (ancien) ancien.remove();

  const script = document.createElement("script");
  script.type = "application/ld+json";
  script.id = "jsonld-breadcrumbs-liste";

  const breadcrumbElements = [
    { "@type": "ListItem", "position": 1, "name": "Accueil", "item": `${siteUrl}/` },
    { "@type": "ListItem", "position": 2, "name": "Articles", "item": `${siteUrl}/articles.html` }
  ];
  if (estFiltreCat) {
    breadcrumbElements.push({
      "@type": "ListItem",
      "position": 3,
      "name": catActuelle,
      "item": `${siteUrl}/articles.html?cat=${encodeURIComponent(catActuelle)}`
    });
  }

  script.textContent = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbElements
  });
  document.head.appendChild(script);
}

/* ---------- Gabarits HTML ---------- */

function carteArticleHTML(article, featured = false) {
  const langue = localStorage.getItem("educapsy-langue") || "fr";
  const slug = slugifyCategorie(article.categorie || "");
  const titre = champLocale(article, "titre", langue);
  const resume = champLocale(article, "resume", langue);
  const hrefArticle = urlArticleCanonique(article);
  const imageUrl = obtenirImageArticle(article);
  const estImageSvg = /\.svg(?:[?#].*)?$/i.test(imageUrl || "");
  const image = imageUrl ? `
    <a href="${hrefArticle}" class="article-card-media${estImageSvg ? " article-card-media--svg" : ""}" aria-label="${titre || ''}">
      <img class="article-card-image" src="${imageUrl}" alt="${titre || ''}" loading="lazy" onerror="this.onerror=null;this.src='images/logo.webp'">
    </a>` : "";
  return `
    <article class="article-card ${featured ? "article-card--featured" : ""} cat-${slug}">
      ${image}
      <span class="tag tag-${slug}">${article.categorie || ""}</span>
      <h2 class="article-card-title"><a href="${hrefArticle}">${titre || "(sans titre)"}</a></h2>
      <p class="article-card-resume">${resume || ""}</p>
      <div class="article-card-meta">${miniatureAuteurCarteHTML(article.auteur)}<span>${article.auteur || "Équipe Educa-Psy"} · ${formaterDateFirestore(article.date)}</span></div>
      <a class="read-more" href="${hrefArticle}">Lire l'article →</a>
    </article>`;
}

function articleIntrouvableHTML() {
  return `
    <div class="article-not-found">
      <h1>Article introuvable</h1>
      <p>L'article que vous cherchez n'existe pas ou a été déplacé.</p>
      <a class="btn btn-primary" href="index.html">← Retour à l'accueil</a>
    </div>`;
}

function erreurChargementHTML() {
  return `<p class="empty-msg">Impossible de charger les articles pour le moment. Vérifiez la configuration de votre base de données.</p>`;
}

/* ---------- Page d'accueil (aperçu minimal) ---------- */

async function initAccueilFirebase() {
  const zoneRecents = document.getElementById("articles-recents");
  if (!zoneRecents) return; // pas sur la page d'accueil

  const zoneFeatured = document.getElementById("featured-article");
  if (zoneFeatured && !zoneFeatured.children.length) {
    zoneFeatured.innerHTML = squeletteCarteHTML();
  }
  zoneRecents.innerHTML = squelettesGrilleHTML(NB_RECENTS_ACCUEIL);

  let tous;
  try {
    tous = await chargerArticles();
  } catch (err) {
    console.error("Erreur Firestore (chargerArticles) :", err);
    zoneRecents.innerHTML = erreurChargementHTML();
    return;
  }

  if (!tous.length) {
    if (zoneFeatured) zoneFeatured.innerHTML = "";
    zoneRecents.innerHTML = `<p class="empty-msg">Aucun article publié pour le moment.</p>`;
    return;
  }

  const premier = tous.find(a => a.aLaUne === true) || tous[0];
  const recents = tous.filter(a => a.id !== premier.id).slice(0, NB_RECENTS_ACCUEIL);

  if (zoneFeatured) zoneFeatured.innerHTML = carteArticleHTML(premier, true);
  zoneRecents.innerHTML = recents.map(a => carteArticleHTML(a)).join("")
    || `<p class="empty-msg">Aucun autre article pour le moment.</p>`;
}

/* ---------- Page articles.html (liste complète, pagination instantanée) ---------- */

async function initArticlesListePage() {
  const grille = document.getElementById("articles-grid");
  if (!grille) return; // pas sur la page articles.html

  grille.innerHTML = squelettesGrilleHTML(TAILLE_PAGE_ARTICLES);

  let tous;
  try {
    tous = await chargerArticles();
  } catch (err) {
    console.error("Erreur Firestore (chargerArticles) :", err);
    grille.innerHTML = erreurChargementHTML();
    return;
  }

  const params = new URLSearchParams(window.location.search);
  const catBrut = params.get("cat");
  let catActuelle = !catBrut || retirerAccents(catBrut.toLowerCase()).trim() === "tous"
    ? "Tous"
    : normaliserCategorieArticle(catBrut);
  let rechercheActuelle = "";
  let pageActuelle = 1;

  function zonePagination() {
    let zone = document.getElementById("pagination-articles");
    if (!zone) {
      zone = document.createElement("div");
      zone.id = "pagination-articles";
      grille.insertAdjacentElement("afterend", zone);
    }
    return zone;
  }

  function afficher() {
    mettreAJourFilArianeArticles(catActuelle);
    let filtres = correspondCategorie("Tous", catActuelle) || catActuelle === "Tous"
      ? tous
      : tous.filter(a => correspondCategorie(a.categorie, catActuelle));

    if (rechercheActuelle) {
      const q = retirerAccents(rechercheActuelle.toLowerCase());
      filtres = filtres.filter(a =>
        retirerAccents((a.titre || "").toLowerCase()).includes(q) ||
        retirerAccents((a.resume || "").toLowerCase()).includes(q));
    }

    const totalPages = Math.max(1, Math.ceil(filtres.length / TAILLE_PAGE_ARTICLES));
    if (pageActuelle > totalPages) pageActuelle = totalPages;

    const debut = (pageActuelle - 1) * TAILLE_PAGE_ARTICLES;
    const visibles = filtres.slice(debut, debut + TAILLE_PAGE_ARTICLES);

    grille.innerHTML = visibles.map(a => carteArticleHTML(a)).join("")
      || `<p class="empty-msg">Aucun article ne correspond pour l'instant — essayez une autre recherche ou une autre rubrique.</p>`;

    zonePagination().innerHTML = genererPaginationHTML(pageActuelle, totalPages);
    zonePagination().querySelectorAll(".pagination-btn").forEach(bouton => {
      bouton.addEventListener("click", () => {
        const val = bouton.dataset.page;
        if (val === "prev") pageActuelle = Math.max(1, pageActuelle - 1);
        else if (val === "next") pageActuelle = Math.min(totalPages, pageActuelle + 1);
        else pageActuelle = parseInt(val, 10);
        afficher();
        grille.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });
  }

  const onglets = document.querySelectorAll(".filter-tab[data-cat]");
  onglets.forEach(onglet => {
    onglet.classList.toggle("active", correspondCategorie(onglet.dataset.cat, catActuelle));
    onglet.addEventListener("click", () => {
      onglets.forEach(o => o.classList.remove("active"));
      onglet.classList.add("active");
      catActuelle = onglet.dataset.cat;
      pageActuelle = 1;
      const url = new URL(window.location.href);
      if (catActuelle === "Tous") url.searchParams.delete("cat");
      else url.searchParams.set("cat", catActuelle);
      window.history.replaceState({}, "", url);
      afficher();
    });
  });

  const champRecherche = document.getElementById("recherche-articles");
  if (champRecherche) {
    if (rechercheActuelle) {
      champRecherche.value = rechercheActuelle;
    }
    champRecherche.addEventListener("input", () => {
      rechercheActuelle = champRecherche.value.trim();
      pageActuelle = 1;
      afficher();
    });

    if (window.location.hash === "#recherche-articles" || rechercheActuelle) {
      setTimeout(() => {
        champRecherche.focus();
        champRecherche.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 150);
    }
  }

  afficher();
}

/* ---------- Optimisations SEO, Open Graph & Schema NewsArticle ---------- */

function resoudreImageRasterSeo(article) {
  const siteUrl = "https://educa-psy.web.app";
  const img = (article && article.image) || "";
  if (!img || /\.svg(?:[?#].*)?$/i.test(img)) {
    return {
      url: `${siteUrl}/og-image.png`,
      width: 1200,
      height: 630
    };
  }
  const url = /^https?:\/\//i.test(img) ? img : `${siteUrl}/${img.replace(/^\.?\//, "")}`;
  return {
    url,
    width: (article && article.imageWidth) || 1200,
    height: (article && article.imageHeight) || 630
  };
}

function definirOuCreerMeta(attrNom, attrVal, content) {
  if (!content) return;
  let el = document.querySelector(`meta[${attrNom}="${attrVal}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attrNom, attrVal);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function mettreAJourMetaTags(article, titre, resume) {
  const siteUrl = "https://educa-psy.web.app";
  const urlParams = new URLSearchParams(window.location.search);
  const id = urlParams.get("id") || article.id || "";
  const urlArticle = article.urlStatique
    ? `${siteUrl}/${article.urlStatique}`
    : (id ? `${siteUrl}/article.html?id=${encodeURIComponent(id)}` : `${siteUrl}/article.html`);
  const imageSeo = resoudreImageRasterSeo(article);
  const d = article.date && article.date.toDate ? article.date.toDate() : new Date(article.date || Date.now());
  const dateIso = !isNaN(d.getTime()) ? d.toISOString() : new Date().toISOString();
  const dateModifIso = article.dateModif ? new Date(article.dateModif).toISOString() : dateIso;

  definirOuCreerMeta("name", "description", resume);
  definirOuCreerMeta("name", "news_keywords", article.motsCles || `${article.categorie || "Psychologie"}, Educa-Psy`);

  definirOuCreerMeta("property", "og:title", `${titre} — Educa-Psy`);
  definirOuCreerMeta("property", "og:description", resume);
  definirOuCreerMeta("property", "og:image", imageSeo.url);
  definirOuCreerMeta("property", "og:image:width", String(imageSeo.width));
  definirOuCreerMeta("property", "og:image:height", String(imageSeo.height));
  definirOuCreerMeta("property", "og:url", urlArticle);
  definirOuCreerMeta("property", "article:published_time", dateIso);
  definirOuCreerMeta("property", "article:modified_time", dateModifIso);
  definirOuCreerMeta("property", "article:section", article.categorie || "Psychologie");
  definirOuCreerMeta("property", "article:author", article.auteur || "Stanley Mazile");

  definirOuCreerMeta("name", "twitter:title", `${titre} — Educa-Psy`);
  definirOuCreerMeta("name", "twitter:description", resume);
  definirOuCreerMeta("name", "twitter:image", imageSeo.url);

  let canonicalLink = document.querySelector('link[rel="canonical"]');
  if (canonicalLink) {
    canonicalLink.setAttribute("href", urlArticle);
  }
}

function injecterDonneesStructurees(article, titre, resume, contenu = []) {
  const ancien = document.getElementById("jsonld-article");
  if (ancien) ancien.remove();

  const d = article.date && article.date.toDate ? article.date.toDate() : new Date(article.date || Date.now());
  const dateIso = !isNaN(d.getTime()) ? d.toISOString() : new Date().toISOString();
  const siteUrl = "https://educa-psy.web.app";
  const urlArticle = article.urlStatique
    ? `${siteUrl}/${article.urlStatique}`
    : window.location.href;
  const categorie = (article.categorie || "").trim();
  const imageSeo = resoudreImageRasterSeo(article);
  const langue = localStorage.getItem("educapsy-langue") || "fr";
  const motsTotal = Array.isArray(contenu)
    ? contenu.filter(b => typeof b === "string").join(" ").split(/\s+/).filter(Boolean).length
    : 0;

  const breadcrumbElements = [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Accueil",
      "item": `${siteUrl}/`
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Articles",
      "item": `${siteUrl}/articles.html`
    }
  ];

  if (categorie) {
    breadcrumbElements.push({
      "@type": "ListItem",
      "position": 3,
      "name": categorie,
      "item": `${siteUrl}/articles.html?cat=${encodeURIComponent(categorie)}`
    });
    breadcrumbElements.push({
      "@type": "ListItem",
      "position": 4,
      "name": titre || article.titre || "",
      "item": urlArticle
    });
  } else {
    breadcrumbElements.push({
      "@type": "ListItem",
      "position": 3,
      "name": titre || article.titre || "",
      "item": urlArticle
    });
  }

  const newsArticleObj = {
    "@type": "NewsArticle",
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": urlArticle
    },
    "headline": titre || article.titre || "",
    "description": resume || article.resume || "",
    "image": [{
      "@type": "ImageObject",
      "url": imageSeo.url,
      "width": imageSeo.width,
      "height": imageSeo.height
    }],
    "datePublished": dateIso,
    "dateModified": article.dateModif ? new Date(article.dateModif).toISOString() : dateIso,
    "articleSection": categorie || "Psychologie",
    "inLanguage": langue,
    "isAccessibleForFree": true,
    "author": [{
      "@type": "Person",
      "name": article.auteur || "Équipe Educa-Psy",
      "url": `${siteUrl}/a-propos.html`,
      ...(estAuteurStanley(article.auteur) ? { "image": `${siteUrl}${PHOTO_AUTEUR_STANLEY}` } : {})
    }],
    "publisher": {
      "@type": "NewsMediaOrganization",
      "name": "Educa-Psy",
      "url": `${siteUrl}/`,
      "logo": {
        "@type": "ImageObject",
        "url": `${siteUrl}/logo.png`,
        "width": 640,
        "height": 640
      }
    }
  };
  if (article.motsCles) newsArticleObj.keywords = article.motsCles;
  if (motsTotal > 0) newsArticleObj.wordCount = motsTotal;

  const script = document.createElement("script");
  script.type = "application/ld+json";
  script.id = "jsonld-article";

  script.textContent = JSON.stringify({
    "@context": "https://schema.org",
    "@graph": [
      newsArticleObj,
      {
        "@type": "BreadcrumbList",
        "itemListElement": breadcrumbElements
      }
    ]
  });

  document.head.appendChild(script);
}

/* ---------- Page Article ---------- */

async function initArticlePageFirebase() {
  const zone = document.getElementById("article-content");
  if (!zone) return;

  const params = new URLSearchParams(window.location.search);
  const id = params.get("id") || zone.dataset.articleId || "";

  if (!id) {
    zone.innerHTML = articleIntrouvableHTML();
    document.title = "Article introuvable — Educa-Psy";
    return;
  }

  const estPreRenduFr = zone.dataset.prerendered === "1" && Boolean(zone.querySelector(".article-title"));

  if (!estPreRenduFr && !zone.querySelector(".article-title")) {
    zone.innerHTML = squeletteArticlePageHTML();
  }

  let article;
  try {
    article = await chargerArticleParId(id);
  } catch (err) {
    console.error("Erreur Firestore (chargerArticleParId) :", err);
    if (!estPreRenduFr) zone.innerHTML = erreurChargementHTML();
    return;
  }

  if (!article) {
    if (!estPreRenduFr) {
      zone.innerHTML = articleIntrouvableHTML();
      document.title = "Article introuvable — Educa-Psy";
    }
    return;
  }

  const langue = localStorage.getItem("educapsy-langue") || "fr";
  const t = (cle, defaut) => (window.EducaPsyI18n ? window.EducaPsyI18n.texte(cle) : defaut);
  const slug = slugifyCategorie(article.categorie || "");
  const titre = champLocale(article, "titre", langue);
  const resume = champLocale(article, "resume", langue);

  let contenu = [];
  const brut = article[`contenu_${langue}`] || article.contenu;
  if (Array.isArray(brut)) {
    contenu = brut;
  } else if (typeof brut === "string" && brut.trim()) {
    contenu = brut.split(/\n\s*\n/).map(s => s.trim()).filter(Boolean);
  }

  const garderStatique = estPreRenduFr && langue === "fr" && !zone.dataset.dynamique;

  if (!garderStatique) {
    zone.dataset.dynamique = "1";
    document.title = `${titre || article.titre} — Educa-Psy`;
    mettreAJourMetaTags(article, titre, resume);

    const tempsLecture = calculerTempsLecture(contenu);

    const imageUrl = obtenirImageArticle(article);
    const estHeroSvg = /\.svg(?:[?#].*)?$/i.test(imageUrl || "");
    const imageHero = imageUrl
      ? `<figure class="article-hero${estHeroSvg ? " article-hero--svg" : ""}">
          <img class="article-image" src="${imageUrl}" alt="${article.imageAlt || titre || ""}" fetchpriority="high" onerror="this.onerror=null;this.src='images/logo.webp'">
         </figure>`
      : "";

    const dateObj = article.date && article.date.toDate ? article.date.toDate() : new Date(article.date);
    const dateIso = !isNaN(dateObj.getTime()) ? dateObj.toISOString() : "";
    const filArianeHtml = genererFilArianeArticleHTML(article, titre);
    const urlPage = window.location.href;
    const titreShare = titre || article.titre || "Educa-Psy";
    const urlEncodee = encodeURIComponent(urlPage);
    const texteEncode = encodeURIComponent(`${titreShare} — Educa-Psy`);

    const catLibelle = slug === "education"
      ? t("nav_education", "Éducation")
      : (slug === "psychologie" ? t("nav_psychologie", "Psychologie") : (article.categorie || "Psychologie"));

    const shareSectionHtml = `
      <div class="article-share-section">
        <span class="share-label">${t("partager_article", "Partager cet article :")}</span>
        <div class="share-buttons-group">
          <a class="share-action-btn share-whatsapp" href="https://api.whatsapp.com/send?text=${texteEncode}%20${urlEncodee}" target="_blank" rel="noopener" aria-label="Partager sur WhatsApp">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg>
            WhatsApp
          </a>
          <a class="share-action-btn share-facebook" href="https://www.facebook.com/sharer/sharer.php?u=${urlEncodee}" target="_blank" rel="noopener" aria-label="Partager sur Facebook">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
            Facebook
          </a>
          <a class="share-action-btn share-x" href="https://x.com/intent/tweet?text=${texteEncode}&url=${urlEncodee}&via=educapsyhaiti" target="_blank" rel="noopener" aria-label="Partager sur X">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            X
          </a>
          <a class="share-action-btn share-linkedin" href="https://www.linkedin.com/sharing/share-offsite/?url=${urlEncodee}" target="_blank" rel="noopener" aria-label="Partager sur LinkedIn">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
            LinkedIn
          </a>
          <button type="button" class="share-action-btn share-copy" id="btn-partager" aria-label="${t("copier_lien", "Copier le lien")}">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
            <span id="label-copier">${t("copier_lien", "Copier le lien")}</span>
          </button>
        </div>
      </div>`;

    const contactHref = langue && langue !== "fr" ? `contact.html?lang=${encodeURIComponent(langue)}` : "contact.html";
    const ctaSectionHtml = `
      <aside class="cta-box article-cta-box" aria-labelledby="article-cta-titre">
        <h2 id="article-cta-titre">${t("cta_titre", "Besoin d'accompagnement ?")}</h2>
        <p>${t("cta_description", "Educa-Psy vous accompagne avec des services spécialisés adaptés à vos besoins :")}</p>
        <ul class="cta-services-list">
          <li class="cta-service-item"><span class="cta-service-dot" aria-hidden="true"></span>${t("cta_service_psychologie", "Psychologie")}</li>
          <li class="cta-service-item"><span class="cta-service-dot" aria-hidden="true"></span>${t("cta_service_education", "Éducation")}</li>
          <li class="cta-service-item"><span class="cta-service-dot" aria-hidden="true"></span>${t("cta_service_accompagnement", "Accompagnement")}</li>
        </ul>
        <a class="btn btn-primary" href="${contactHref}">${t("cta_bouton_contact", "Contacter Educa-Psy →")}</a>
      </aside>`;

    const nomAuteur = article.auteur || "Équipe Educa-Psy";

    const chapeauHtml = resume
      ? `<div class="article-chapeau"><p>${resume}</p></div>`
      : "";

    zone.innerHTML = `
      <article class="single-article">
        ${filArianeHtml}

        <header class="article-header">
          <div class="article-kicker-wrap">
            <a href="articles.html?cat=${encodeURIComponent(article.categorie || '')}" class="article-kicker cat-${slug}">
              <span class="kicker-dot"></span>
              ${article.categorie || "Actualité"}
            </a>
          </div>

          <h1 class="article-title">${titre || ""}</h1>

          ${chapeauHtml}

          <div class="article-meta-bar">
            <div class="article-author-badge">
              ${avatarAuteurHTML(nomAuteur)}
              <div class="author-details">
                <span class="author-name">${nomAuteur}</span>
                <span class="author-role">Educa-Psy · Publication</span>
              </div>
            </div>
            <div class="article-meta-info">
              <a href="articles.html?cat=${encodeURIComponent(article.categorie || '')}" class="tag tag-${slug} meta-category-badge">${catLibelle}</a>
              <span class="meta-separator" aria-hidden="true">·</span>
              <span class="article-date">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                <time datetime="${dateIso}">${formaterDateFirestore(article.date)}</time>
              </span>
              <span class="meta-separator" aria-hidden="true">·</span>
              <span class="article-readtime">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                ${tempsLecture}
              </span>
            </div>
          </div>
        </header>

        ${imageHero}

        <div class="article-body">
          ${rendreContenuArticle(contenu)}
        </div>

        ${shareSectionHtml}
        ${ctaSectionHtml}
      </article>`;

    initCarousels(zone);
  }

  // Gestion de la barre de progression de lecture
  const barreLecture = document.getElementById("reading-progress-bar");
  if (barreLecture && !barreLecture.dataset.init) {
    barreLecture.dataset.init = "1";
    const majBarre = () => {
      const scrollMax = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollMax > 0) {
        const pct = Math.min(100, Math.max(0, (window.scrollY / scrollMax) * 100));
        barreLecture.style.width = `${pct}%`;
      }
    };
    window.addEventListener("scroll", majBarre, { passive: true });
    majBarre();
  }

  async function copierDansPressePapier(texte) {
    try {
      if (typeof window !== "undefined" && window.focus) {
        window.focus();
      }
    } catch (_) {}

    if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
      try {
        await navigator.clipboard.writeText(texte);
        return true;
      } catch (_) {}
    }

    try {
      const zoneCopie = document.createElement("textarea");
      zoneCopie.value = texte;
      zoneCopie.setAttribute("readonly", "");
      zoneCopie.style.position = "fixed";
      zoneCopie.style.left = "-9999px";
      zoneCopie.style.top = "0";
      zoneCopie.style.opacity = "0";
      document.body.appendChild(zoneCopie);
      zoneCopie.focus();
      zoneCopie.select();
      const succes = document.execCommand("copy");
      document.body.removeChild(zoneCopie);
      if (succes) return true;
    } catch (_) {}

    return false;
  }

  const btnPartager = document.getElementById("btn-partager");
  const labelCopier = document.getElementById("label-copier");
  if (btnPartager && !btnPartager.dataset.init) {
    btnPartager.dataset.init = "1";
    btnPartager.addEventListener("click", async () => {
      const copieReussie = await copierDansPressePapier(window.location.href);
      if (labelCopier) {
        labelCopier.textContent = copieReussie ? t("lien_copie", "✓ Copié !") : t("lien_pret", "Lien prêt");
        setTimeout(() => { if (labelCopier) labelCopier.textContent = t("copier_lien", "Copier le lien"); }, 2200);
      }
    });
  }

  const zoneSimilaires = document.getElementById("articles-similaires");
  if (zoneSimilaires) {
    try {
      const similaires = await chargerArticlesSimilaires(
        article.categorie,
        article.id,
        2,
        article.articlesSimilairesIds || []
      );
      if (similaires.length) {
        zoneSimilaires.innerHTML = `
          <h3>${t("articles_similaires", "Articles similaires")}</h3>
          <div class="articles-grid articles-grid--compact">
            ${similaires.map(a => carteArticleHTML(a)).join("")}
          </div>`;
      }
    } catch (err) {
      console.error("Erreur Firestore (articles similaires) :", err);
    }
  }

  if (!garderStatique) {
    injecterDonneesStructurees(article, titre, resume, contenu);
  }
}

/* ---------- Lancement ---------- */

function rechargerContenu() {
  if (document.getElementById("articles-recents")) {
    initAccueilFirebase();
  }
  if (document.getElementById("articles-grid")) {
    initArticlesListePage();
  }
  if (document.getElementById("article-content")) {
    initArticlePageFirebase();
  }
}

window.addEventListener("educapsy-langue-changee", rechargerContenu);

document.addEventListener("DOMContentLoaded", () => {
  rechargerContenu();
});

