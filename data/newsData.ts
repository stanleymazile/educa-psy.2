export interface NewsArticle {
  id: string;
  title: string;
  date: string;
  category: 'Éducation' | 'Psychologie' | 'Recherche' | 'Événement';
  author: string;
  excerpt: string;
  content: string;
  image: string;
}

export const newsArticles: NewsArticle[] = [
  {
    id: "sante-mentale-ecole",
    title: "L'importance de la santé mentale à l'école",
    date: "2026-02-15",
    category: "Psychologie",
    author: "Dr. Marie Laurent",
    excerpt: "Comment les enseignants peuvent-ils identifier les signes de détresse psychologique chez leurs élèves ?",
    content: `
      La santé mentale en milieu scolaire est devenue une priorité absolue. Avec l'augmentation des pressions académiques et sociales, les élèves font face à des défis sans précédent.

      ### Pourquoi est-ce crucial ?
      Un élève qui souffre psychologiquement ne peut pas apprendre efficacement. La détresse émotionnelle bloque les capacités cognitives et réduit la motivation.

      ### Le rôle des enseignants
      Les enseignants sont en première ligne. Ils ne sont pas des thérapeutes, mais ils peuvent être des "détecteurs". Les signes à surveiller incluent :
      - Un changement soudain de comportement ou de notes.
      - L'isolement social.
      - Une fatigue persistante ou une irritabilité inhabituelle.

      ### Nos recommandations
      Educa-Psy propose des formations spécifiques pour aider le corps enseignant à créer un environnement sécurisant et à orienter les élèves vers les professionnels adéquats.
    `,
    image: "https://picsum.photos/seed/news1/1200/800"
  },
  {
    id: "ateliers-parents-ados",
    title: "Nouveaux ateliers pour parents d'ados",
    date: "2026-02-10",
    category: "Événement",
    author: "Jean Dupont",
    excerpt: "Découvrez notre nouveau programme d'accompagnement pour naviguer les défis de l'adolescence.",
    content: `
      L'adolescence est une période de transition majeure, non seulement pour les jeunes, mais aussi pour leurs parents. Educa-Psy lance une nouvelle série d'ateliers thématiques.

      ### Au programme :
      1. **Communication non-violente** : Comment maintenir le dialogue quand les tensions montent.
      2. **Comprendre le cerveau ado** : Les neurosciences au service de la patience parentale.
      3. **Gestion des écrans** : Établir des règles saines sans rompre le lien.

      ### Modalités
      Ces ateliers se déroulent tous les samedis matins dans nos locaux de Paris. L'inscription est obligatoire via notre formulaire en ligne.

      Rejoignez une communauté de parents pour partager vos expériences et repartir avec des outils concrets.
    `,
    image: "https://picsum.photos/seed/news2/1200/800"
  },
  {
    id: "numerique-allie-ennemi",
    title: "Le numérique : allié ou ennemi de l'éducation ?",
    date: "2026-02-05",
    category: "Recherche",
    author: "Sophie Martin",
    excerpt: "Analyse des impacts des écrans sur le développement cognitif des jeunes enfants.",
    content: `
      Le débat sur les écrans fait rage. Entre opportunités d'apprentissage et risques de surexposition, où placer le curseur ?

      ### Les bénéfices du numérique
      Bien utilisé, le numérique permet une personnalisation de l'apprentissage. Les logiciels ludo-éducatifs peuvent renforcer certaines compétences logiques et spatiales.

      ### Les points de vigilance
      Notre dernière étude montre qu'une exposition passive prolongée avant 6 ans peut impacter le développement du langage et la capacité d'attention.

      ### La règle d'or : l'accompagnement
      L'écran ne doit jamais remplacer l'interaction humaine. Le secret réside dans le contenu choisi et le temps partagé entre l'enfant et l'adulte autour de l'outil numérique.
    `,
    image: "https://picsum.photos/seed/news3/1200/800"
  }
];
