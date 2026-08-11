/* ============================================================
   EDUCA-PSY — articles-data.js
   ============================================================
   C'est ICI que vit le contenu du site. Pour publier un nouvel
   article, il suffit d'ajouter un nouveau bloc { ... } dans le
   tableau ci-dessous — aucune connaissance en HTML n'est requise.

   COMMENT AJOUTER UN ARTICLE :
   1. Copiez un bloc existant, du "{" au "}," qui le termine.
   2. Collez-le juste après la ligne "const articles = [".
   3. Remplissez les champs (voir description de chacun ci-dessous).
   4. Enregistrez le fichier. C'est tout — l'article apparaît
      automatiquement sur la page d'accueil et sa propre page.

   CHAMPS :
     id        → un numéro UNIQUE, jamais utilisé ailleurs dans ce
                 fichier (ex: 13, 14, 15...). Prenez le plus grand
                 id existant + 1.
     categorie → exactement l'un de : "Éducation", "Technologie",
                 "Science", "Psychologie"
     titre     → le titre de l'article
     auteur    → le nom de l'auteur (ex: "Équipe Educa-Psy")
     date      → au format "AAAA-MM-JJ", ex: "2026-08-10"
     resume    → une ou deux phrases, affichées sur la page d'accueil
     contenu   → le texte complet, sous forme de LISTE de paragraphes :
                 chaque paragraphe est un texte entre guillemets,
                 séparé du suivant par une virgule.
   ============================================================ */

const articles = [

  {
    id: 12,
    categorie: "Psychologie",
    titre: "Reconnaître les signes de détresse psychologique chez un proche",
    auteur: "Équipe Educa-Psy",
    date: "2026-08-10",
    resume: "Repli sur soi, changements d'humeur, perte d'intérêt : certains signes peuvent alerter sur une détresse psychologique chez une personne de notre entourage.",
    contenu: [
      "Il n'est pas toujours facile de percevoir qu'un proche traverse une période de détresse psychologique, surtout lorsque celle-ci s'installe progressivement. Certains signes, pourtant, peuvent alerter : repli sur soi, irritabilité inhabituelle, perte d'intérêt pour des activités appréciées auparavant.",
      "Des changements dans le sommeil ou l'appétit, une fatigue persistante, ou des difficultés de concentration peuvent également être des indicateurs, en particulier lorsqu'ils s'accompagnent d'un changement notable de comportement sur plusieurs semaines.",
      "Face à ces signaux, l'écoute sans jugement reste l'un des gestes les plus précieux : poser une question simple et sincère, puis laisser la personne s'exprimer à son rythme, sans chercher à minimiser ce qu'elle traverse ni à imposer des solutions toutes faites.",
      "Accompagner un proche ne signifie pas devoir tout gérer seul. Orienter vers un professionnel de la santé mentale, lorsque cela semble nécessaire, est un geste de soutien à part entière — et non un renoncement."
    ]
  },

  {
    id: 11,
    categorie: "Science",
    titre: "Ce que les neurosciences nous apprennent sur le stress",
    auteur: "Équipe Educa-Psy",
    date: "2026-08-09",
    resume: "Le stress n'est pas seulement « dans la tête » : il déclenche des réactions physiologiques précises, que la recherche en neurosciences permet aujourd'hui de mieux comprendre.",
    contenu: [
      "Face à une menace perçue, réelle ou imaginée, notre cerveau déclenche une cascade de réactions physiologiques : libération d'hormones comme le cortisol, accélération du rythme cardiaque, mobilisation de l'énergie disponible. C'est la réponse de stress, héritée de notre évolution.",
      "Ce mécanisme, utile ponctuellement pour faire face à un danger immédiat, devient problématique lorsqu'il s'active de façon chronique. Un stress prolongé peut affecter la mémoire, la concentration, le sommeil et même le système immunitaire.",
      "Les neurosciences montrent aussi que le cerveau conserve une grande capacité d'adaptation : des pratiques comme la respiration consciente, l'activité physique régulière ou le soutien social permettent de moduler concrètement la réponse au stress.",
      "Comprendre ces mécanismes ne relève donc pas seulement de la curiosité scientifique : c'est aussi un outil précieux pour mieux accompagner les personnes exposées à des situations stressantes de façon répétée."
    ]
  },

  {
    id: 10,
    categorie: "Éducation",
    titre: "Le soutien psychosocial à l'école : un pilier trop souvent oublié",
    auteur: "Équipe Educa-Psy",
    date: "2026-08-08",
    resume: "Au-delà des apprentissages académiques, le bien-être émotionnel des élèves conditionne leur réussite scolaire. Comment les établissements peuvent-ils mieux intégrer le soutien psychosocial ?",
    contenu: [
      "L'école est bien plus qu'un lieu de transmission de savoirs : c'est aussi un espace où se construisent la confiance en soi, les relations sociales et l'équilibre émotionnel des enfants et adolescents. Pourtant, le soutien psychosocial reste souvent relégué au second plan face aux priorités académiques.",
      "Dans les contextes marqués par l'instabilité, la précarité ou des événements difficiles, cette dimension devient pourtant essentielle. Un enfant en détresse psychologique aura plus de mal à se concentrer, à mémoriser ou à interagir sereinement avec ses pairs, quelle que soit la qualité de l'enseignement reçu.",
      "Créer des espaces d'écoute, former les enseignants à repérer les signes de mal-être, et proposer des activités collectives — jeux coopératifs, cercles de parole, ateliers créatifs — sont autant de leviers accessibles pour renforcer le bien-être scolaire, sans nécessiter de moyens considérables.",
      "Les organisations spécialisées en soutien psychosocial ont un rôle clé à jouer aux côtés des écoles : accompagner les équipes pédagogiques, outiller les familles et créer des ponts entre santé mentale et éducation — un investissement qui profite, à terme, à toute la communauté éducative."
    ]
  },

  {
    id: 9,
    categorie: "Technologie",
    titre: "L'intelligence artificielle peut-elle vraiment aider le secteur humanitaire ?",
    auteur: "Équipe Educa-Psy",
    date: "2026-08-05",
    resume: "Traduction automatique, analyse de données, optimisation logistique : l'intelligence artificielle ouvre de nouvelles possibilités pour les organisations humanitaires — avec ses limites.",
    contenu: [
      "De la traduction automatique à l'analyse de grandes quantités de données, l'intelligence artificielle s'invite progressivement dans les pratiques des organisations humanitaires. Elle promet de faire gagner un temps précieux dans des contextes où chaque ressource compte.",
      "Sur le terrain, ces outils peuvent aider à identifier plus rapidement les besoins prioritaires d'une population, à traduire des échanges avec des bénéficiaires ne partageant pas la même langue, ou encore à optimiser la distribution de ressources limitées.",
      "Ces technologies ne remplacent cependant ni le jugement humain ni la relation de confiance construite sur le terrain. Elles comportent aussi des risques : biais dans les données, dépendance technologique, ou enjeux de confidentialité pour des populations déjà vulnérables.",
      "L'enjeu pour les organisations n'est donc pas d'adopter l'intelligence artificielle à tout prix, mais de l'intégrer avec discernement, en gardant l'humain — bénéficiaires comme intervenants — au centre des décisions."
    ]
  },

  {
    id: 8,
    categorie: "Psychologie",
    titre: "La résilience communautaire : se relever ensemble face à l'adversité",
    auteur: "Équipe Educa-Psy",
    date: "2026-07-25",
    resume: "Face aux crises, ce sont souvent les liens communautaires qui permettent aux individus de tenir et de se reconstruire. Un regard sur la résilience collective.",
    contenu: [
      "La résilience est souvent envisagée comme une capacité individuelle à surmonter l'adversité. Pourtant, dans de nombreux contextes de crise, c'est la dimension collective de la résilience qui joue un rôle déterminant dans la capacité des populations à se relever.",
      "L'entraide, les réseaux de solidarité familiale et communautaire, les traditions culturelles partagées constituent autant de ressources qui permettent à une communauté de traverser des épreuves difficiles — catastrophe naturelle, crise économique, instabilité prolongée.",
      "Ces dynamiques ne s'improvisent pas : elles reposent sur des liens sociaux construits dans la durée, sur la confiance entre les membres d'une communauté, et sur des espaces où la parole et l'entraide peuvent circuler librement.",
      "Soutenir la résilience communautaire, c'est donc aussi investir dans le tissu social lui-même — activités collectives, espaces de dialogue, initiatives culturelles partagées — autant que dans l'accompagnement individuel des personnes affectées."
    ]
  },

  {
    id: 7,
    categorie: "Éducation",
    titre: "Apprendre par l'art : ce que la créativité change dans l'éducation",
    auteur: "Équipe Educa-Psy",
    date: "2026-07-22",
    resume: "Dessiner, jouer, raconter des histoires : les approches créatives ouvrent des chemins d'apprentissage différents, en particulier pour les enfants en difficulté.",
    contenu: [
      "Toutes les formes d'intelligence ne s'expriment pas de la même façon sur les bancs de l'école. Pour de nombreux enfants, les approches créatives — dessin, théâtre, musique, écriture — offrent un accès à l'apprentissage bien plus naturel que les méthodes purement académiques.",
      "L'art permet d'exprimer ce que les mots peinent parfois à traduire, en particulier chez les enfants ayant vécu des expériences difficiles. Il devient alors à la fois un outil pédagogique et un espace d'expression émotionnelle sécurisant.",
      "Les ateliers créatifs favorisent également la coopération, la confiance en soi et la persévérance : autant de compétences transversales essentielles à la réussite scolaire, au-delà des matières enseignées.",
      "Intégrer davantage la créativité dans les pratiques éducatives ne signifie pas remplacer les apprentissages fondamentaux, mais les enrichir. C'est précisément à cette intersection entre éducation et art que se situent de nombreuses initiatives communautaires aujourd'hui."
    ]
  },

  {
    id: 6,
    categorie: "Psychologie",
    titre: "L'art-thérapie expliquée : quand créer devient soigner",
    auteur: "Équipe Educa-Psy",
    date: "2026-07-08",
    resume: "Peinture, théâtre, musique, écriture : l'art-thérapie utilise la création comme outil d'expression et de reconstruction psychologique.",
    contenu: [
      "L'art-thérapie s'appuie sur un principe simple : le processus créatif peut devenir un langage à part entière, capable d'exprimer ce que les mots seuls ne suffisent pas toujours à traduire.",
      "Encadrée par un professionnel formé, la pratique artistique — peinture, sculpture, théâtre, musique, écriture — permet d'explorer des émotions difficiles dans un cadre sécurisant, sans pression de performance ni jugement sur le résultat final.",
      "Cette approche est particulièrement précieuse auprès de personnes ayant vécu des expériences traumatiques, chez qui la verbalisation directe peut être difficile, douloureuse, voire impossible dans un premier temps.",
      "Au-delà de son usage thérapeutique individuel, l'art-thérapie a aussi une dimension collective forte : les ateliers de groupe créent des espaces de rencontre, de solidarité et de reconstruction du lien social, particulièrement précieux dans les contextes de post-crise."
    ]
  },

  {
    id: 5,
    categorie: "Technologie",
    titre: "Enseigner à distance : quels outils numériques choisir ?",
    auteur: "Équipe Educa-Psy",
    date: "2026-07-15",
    resume: "Plateformes de visioconférence, contenus hors ligne, messageries simples : bien choisir ses outils numériques fait souvent la différence en enseignement à distance.",
    contenu: [
      "L'enseignement à distance s'est imposé comme une réalité durable dans de nombreux contextes, qu'il s'agisse de crises ponctuelles ou de zones difficiles d'accès. Mais tous les outils numériques ne se valent pas selon les besoins et les moyens disponibles.",
      "Dans les environnements à connexion limitée, privilégier des contenus téléchargeables ou envoyés par messagerie simple est souvent plus efficace qu'une plateforme de visioconférence exigeante en bande passante. L'essentiel reste que l'outil serve la pédagogie, et non l'inverse.",
      "La simplicité d'utilisation est également déterminante : un outil trop complexe décourage aussi bien les enseignants que les élèves et leurs familles, en particulier lorsque l'accompagnement technique est limité.",
      "Avant de choisir un outil, mieux vaut donc partir des besoins réels du terrain — accès à internet, niveau de compétence numérique, contraintes horaires des familles — plutôt que des solutions les plus populaires ou les plus sophistiquées."
    ]
  },

  {
    id: 4,
    categorie: "Science",
    titre: "Santé mentale et changement climatique : un lien scientifique de plus en plus documenté",
    auteur: "Équipe Educa-Psy",
    date: "2026-07-18",
    resume: "Éco-anxiété, stress post-catastrophe, incertitude face à l'avenir : la recherche s'intéresse de plus en plus aux effets psychologiques du changement climatique.",
    contenu: [
      "Le changement climatique n'affecte pas uniquement les écosystèmes et les infrastructures : un nombre croissant d'études scientifiques s'intéresse également à ses répercussions sur la santé mentale, individuelle et collective.",
      "Les catastrophes naturelles répétées peuvent générer un stress durable, tandis que l'incertitude face à l'avenir alimente chez certains un sentiment d'anxiété parfois appelé « éco-anxiété », en particulier chez les jeunes générations.",
      "Les populations déjà vulnérables — en raison de leur situation économique ou géographique — sont souvent les plus exposées à ces impacts psychologiques, alors qu'elles disposent généralement de moins de ressources pour y faire face.",
      "Intégrer la dimension psychosociale dans les stratégies d'adaptation climatique apparaît donc de plus en plus comme une nécessité, et non comme un simple complément aux réponses techniques et environnementales."
    ]
  },

  {
    id: 3,
    categorie: "Éducation",
    titre: "Réduire la fracture numérique : l'éducation face au défi du tout-numérique",
    auteur: "Équipe Educa-Psy",
    date: "2026-07-02",
    resume: "Accès inégal à internet, au matériel informatique, aux compétences numériques : la fracture numérique continue de creuser les inégalités éducatives.",
    contenu: [
      "La transition numérique de l'éducation s'est accélérée ces dernières années, mais elle n'a pas bénéficié à tous de la même manière. Dans de nombreuses régions, l'accès à internet, à un ordinateur ou même à l'électricité reste un obstacle majeur à l'apprentissage en ligne.",
      "Cette fracture numérique ne se limite pas à l'équipement : elle concerne aussi les compétences. Savoir utiliser un outil numérique de façon pertinente et sécurisée s'apprend, et cet apprentissage reste inégalement réparti entre les élèves, les familles et même les enseignants.",
      "Des solutions existent pourtant : centres communautaires équipés, contenus pédagogiques téléchargeables pour un usage hors ligne, formations aux compétences numériques de base pour les familles. Ces initiatives, souvent portées par des associations locales, permettent de limiter les effets de cette fracture.",
      "Réduire les inégalités numériques dans l'éducation est un enjeu de justice sociale autant que pédagogique. Il ne s'agit pas seulement de donner accès à la technologie, mais de garantir que chaque élève puisse réellement en bénéficier."
    ]
  },

  {
    id: 2,
    categorie: "Science",
    titre: "La science citoyenne : et si la recherche s'ouvrait à tous ?",
    auteur: "Équipe Educa-Psy",
    date: "2026-06-30",
    resume: "Observer des oiseaux, cartographier une région, contribuer à des bases de données scientifiques : la science citoyenne permet à chacun de participer à la recherche.",
    contenu: [
      "La science citoyenne désigne l'ensemble des projets de recherche auxquels des volontaires, sans formation scientifique préalable, peuvent contribuer activement : observation d'espèces, collecte de données environnementales, ou analyse d'images.",
      "Ces initiatives permettent aux chercheurs de rassembler des volumes de données difficiles à obtenir autrement, tout en rapprochant le grand public des démarches scientifiques, souvent perçues comme lointaines ou inaccessibles.",
      "Au-delà de la contribution scientifique elle-même, ces projets ont aussi une valeur éducative : ils permettent d'apprendre en faisant, et de développer un regard critique et curieux sur le monde qui nous entoure.",
      "Dans un contexte où la confiance envers la science est parfois fragilisée, ces démarches participatives offrent une piste intéressante pour rapprocher recherche scientifique et société civile."
    ]
  },

  {
    id: 1,
    categorie: "Technologie",
    titre: "Vie privée en ligne : les réflexes essentiels à adopter",
    auteur: "Équipe Educa-Psy",
    date: "2026-06-28",
    resume: "Mots de passe, réseaux sociaux, partage d'informations personnelles : quelques bons réflexes suffisent à mieux protéger sa vie privée en ligne.",
    contenu: [
      "À mesure que nos vies s'organisent de plus en plus autour du numérique, la protection de la vie privée en ligne devient une compétence essentielle, au même titre que la lecture ou le calcul.",
      "Utiliser des mots de passe différents et robustes pour chaque compte, activer la double authentification lorsque c'est possible, et réfléchir avant de partager des informations personnelles sur les réseaux sociaux sont des réflexes simples mais souvent négligés.",
      "Il est également utile de vérifier régulièrement les paramètres de confidentialité de ses applications, et de rester attentif aux tentatives d'hameçonnage — ces emails ou messages frauduleux qui demandent des informations sensibles.",
      "Sensibiliser les jeunes comme les adultes à ces bonnes pratiques dès le plus jeune âge contribue à réduire les risques liés à l'usage du numérique, dans un environnement en ligne de plus en plus complexe."
    ]
  }

];

