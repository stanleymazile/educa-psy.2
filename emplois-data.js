/* ============================================================
   EDUCA-PSY — emplois-data.js
   ============================================================
   Liste des offres affichées sur la page "Emplois & Collaborations".

   ⚠️ Les 4 offres ci-dessous sont des EXEMPLES destinés à montrer
   le format à utiliser (remarquez les crochets [ ] à remplacer).
   Remplacez-les par vos véritables offres avant de publier le site,
   ou laissez-les comme modèle et ajoutez les vraies au-dessus.

   COMMENT AJOUTER UNE OFFRE :
   1. Copiez un bloc existant, du "{" au "}," qui le termine.
   2. Collez-le juste après la ligne "const emplois = [".
   3. Remplissez les champs (voir description de chacun ci-dessous).
   4. Enregistrez le fichier — l'offre apparaît automatiquement.

   CHAMPS :
     id           → un numéro UNIQUE (le plus grand id existant + 1)
     type         → exactement l'un de : "Emploi", "Collaboration",
                    "Bénévolat", "Stage / Formation"
     titre        → l'intitulé du poste ou de l'appel
     organisation → le nom de l'organisation qui publie l'offre
     lieu         → ville / pays, ou "À distance"
     dateLimite   → au format "AAAA-MM-JJ", ou "" si pas de date limite
     description  → 2 à 4 phrases décrivant l'offre
     lien         → une adresse "mailto:exemple@email.com" pour
                    candidater par courriel, ou un lien "https://..."
   ============================================================ */

const emplois = [

  {
    id: 4,
    type: "Collaboration",
    titre: "Appel à collaboration – Facilitateurs et facilitatrices en art-thérapie (exemple à modifier)",
    organisation: "Educa-Psy",
    lieu: "Port-au-Prince et régions / à distance possible",
    dateLimite: "",
    description: "Exemple d'appel à collaboration : recherche d'artistes, psychologues ou animateurs communautaires souhaitant co-animer des ateliers d'art-thérapie auprès d'enfants et de familles. Remplacez ce texte par votre véritable appel.",
    lien: "https://educa-psy-haiti.web.app"
  },

  {
    id: 3,
    type: "Emploi",
    titre: "Psychologue clinicien(ne) – Soutien psychosocial (exemple à modifier)",
    organisation: "[Nom de l'organisation]",
    lieu: "[Ville, Département]",
    dateLimite: "[AAAA-MM-JJ]",
    description: "Exemple d'offre d'emploi : décrivez ici le poste, les missions principales, le profil recherché (diplômes, expérience) et les modalités de candidature.",
    lien: "mailto:votre-email@exemple.org"
  },

  {
    id: 2,
    type: "Bénévolat",
    titre: "Bénévole – Sensibilisation aux droits humains (exemple à modifier)",
    organisation: "[Nom de l'organisation]",
    lieu: "[Ville / À distance]",
    dateLimite: "",
    description: "Exemple d'offre de bénévolat : précisez ici la mission proposée, le temps requis et les qualités recherchées chez les volontaires.",
    lien: "mailto:votre-email@exemple.org"
  },

  {
    id: 1,
    type: "Stage / Formation",
    titre: "Stage – Chargé(e) de projets culturels (exemple à modifier)",
    organisation: "[Nom de l'organisation]",
    lieu: "[Ville]",
    dateLimite: "[AAAA-MM-JJ]",
    description: "Exemple d'offre de stage : indiquez ici la durée, les tâches confiées au stagiaire et le profil recherché (formation, centres d'intérêt).",
    lien: "mailto:votre-email@exemple.org"
  }

];

