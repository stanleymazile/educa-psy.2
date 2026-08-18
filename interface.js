/* ============================================================
   EDUCA-PSY — interface.js
   ============================================================
   Comportements communs à toutes les pages, sans dépendance à
   Firebase : mode sombre, menu mobile, changement de langue.

   La traduction couvre l'interface du site (menus, boutons,
   titres de page). Le CONTENU des articles (dans Firestore)
   reste dans la langue où vous l'avez écrit — ce fichier ne le
   traduit pas automatiquement.
   ============================================================ */

/* ---------- En-tête / pied de page (date + année) ---------- */

const MOIS_FR_DATE = ["janvier","février","mars","avril","mai","juin","juillet",
                       "août","septembre","octobre","novembre","décembre"];
const JOURS_FR = ["dimanche","lundi","mardi","mercredi","jeudi","vendredi","samedi"];

function initEnteteEtPied() {
  const dateEl = document.getElementById("today-date");
  if (dateEl) {
    const auj = new Date();
    dateEl.textContent = `${JOURS_FR[auj.getDay()]} ${auj.getDate()} ${MOIS_FR_DATE[auj.getMonth()]} ${auj.getFullYear()}`;
  }
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
}

/* ---------- Mode sombre ---------- */

function initTheme() {
  const bouton = document.getElementById("theme-toggle");
  const enregistre = localStorage.getItem("educapsy-theme");
  const systeme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "sombre" : "clair";
  let theme = enregistre || systeme;

  function appliquer(t) {
    theme = t;
    if (t === "sombre") document.documentElement.setAttribute("data-theme", "sombre");
    else document.documentElement.removeAttribute("data-theme");
    if (bouton) {
      bouton.innerHTML = t === "sombre"
        ? '<span class="icon">☀️</span><span class="label">Clair</span>'
        : '<span class="icon">🌙</span><span class="label">Sombre</span>';
    }
    localStorage.setItem("educapsy-theme", t);
  }

  appliquer(theme);
  if (bouton) {
    bouton.addEventListener("click", () => appliquer(theme === "sombre" ? "clair" : "sombre"));
  }
}

function initSousMenus() {
  document.querySelectorAll(".nav-dropdown-toggle").forEach(bouton => {
    bouton.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      const parent = bouton.closest(".nav-dropdown");
      const etaitOuvert = parent.classList.contains("ouvert");
      document.querySelectorAll(".nav-dropdown.ouvert").forEach(d => {
        d.classList.remove("ouvert");
        d.querySelector(".nav-dropdown-toggle").setAttribute("aria-expanded", "false");
      });
      if (!etaitOuvert) {
        parent.classList.add("ouvert");
        bouton.setAttribute("aria-expanded", "true");
      }
    });
  });
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".nav-dropdown")) {
      document.querySelectorAll(".nav-dropdown.ouvert").forEach(d => {
        d.classList.remove("ouvert");
        d.querySelector(".nav-dropdown-toggle").setAttribute("aria-expanded", "false");
      });
    }
  });
}

/* ---------- Menu mobile ---------- */

function initMenuMobile() {
  const bouton = document.getElementById("nav-toggle");
  const liens = document.getElementById("nav-links");
  if (!bouton || !liens) return;
  bouton.addEventListener("click", () => {
    const ouvert = liens.classList.toggle("ouvert");
    bouton.setAttribute("aria-expanded", ouvert ? "true" : "false");
  });
  // Referme le menu après avoir cliqué un lien (mobile)
  liens.querySelectorAll("a").forEach(a => {
    a.addEventListener("click", () => liens.classList.remove("ouvert"));
  });
  // Referme le menu si on clique en dehors
  document.addEventListener("click", (e) => {
    if (liens.classList.contains("ouvert") && !liens.contains(e.target) && e.target !== bouton) {
      liens.classList.remove("ouvert");
      bouton.setAttribute("aria-expanded", "false");
    }
  });
}

/* ---------- Langue de l'interface (FR / EN / HT) ---------- */

const TRADUCTIONS = {
  fr: {
    tagline: "Éducation · Technologie · Science · Psychologie",
    nav_accueil: "Accueil",
    nav_actualites: "Actualités",
    nav_newsletter: "Newsletter",
    nav_articles: "Articles",
    nav_education: "Éducation",
    nav_technologie: "Technologie",
    nav_science: "Science",
    nav_psychologie: "Psychologie",
    nav_opportunites: "Opportunités",
    type_emploi: "Emploi",
    type_collaboration: "Collaboration",
    type_benevolat: "Bénévolat",
    type_stage: "Stage",
    nav_emplois: "Emplois & Collaborations",
    nav_apropos: "À propos",
    nav_contact: "Contact",
    a_la_une: "À la une",
    tous: "Tous",
    opportunites_titre: "Opportunités du moment",
    voir_opportunites: "Voir toutes les opportunités →",
    footer_texte: "Actualités et ressources en éducation, technologie, science et psychologie, ainsi que des opportunités professionnelles.",
    footer_site_officiel: "Site officiel d'Educa-Psy ↗",
    footer_droits: "Tous droits réservés.",
    contact_titre: "Contact",
    contact_soustitre: "Une question, une proposition de collaboration ? Écrivez-nous.",
    contact_nom: "Nom",
    contact_email: "Adresse e-mail",
    contact_sujet: "Sujet",
    contact_message: "Message",
    contact_envoyer: "Envoyer le message",
    contact_envoi_cours: "Envoi en cours…",
    contact_succes: "Merci ! Votre message a bien été envoyé.",
    contact_erreur: "Une erreur est survenue. Réessayez dans un instant.",
    auth_connexion: "Connexion",
    auth_inscription: "Inscription",
    auth_email: "Adresse e-mail",
    auth_mdp: "Mot de passe",
    auth_bouton_connexion: "Se connecter",
    auth_bouton_inscription: "Créer un compte",
    auth_deconnexion: "Se déconnecter",
    auth_connecte_comme: "Connecté(e) en tant que",
    auth_lien: "Connexion",
    newsletter_titre: "Abonnez-vous à notre newsletter",
    newsletter_texte: "Recevez nos derniers articles et opportunités par e-mail.",
    newsletter_placeholder: "Votre adresse e-mail",
    newsletter_bouton: "S'abonner",
    newsletter_succes: "Merci de votre inscription !",
    champs_obligatoires: "Merci de remplir tous les champs obligatoires.",
    desabo_titre: "Se désabonner",
    desabo_texte: "Indiquez l'adresse e-mail à retirer de notre liste de diffusion.",
    desabo_bouton: "Se désabonner",
    desabo_succes: "Vous avez été désabonné(e) avec succès.",
    desabo_erreur: "Cette adresse n'a pas été trouvée dans nos abonnés.",
    lien_desabonnement: "Se désabonner de la newsletter"
  },
  en: {
    tagline: "Education · Technology · Science · Psychology",
    nav_accueil: "Home",
    nav_actualites: "News",
    nav_newsletter: "Newsletter",
    nav_articles: "Articles",
    nav_education: "Education",
    nav_technologie: "Technology",
    nav_science: "Science",
    nav_psychologie: "Psychology",
    nav_opportunites: "Opportunities",
    type_emploi: "Job",
    type_collaboration: "Collaboration",
    type_benevolat: "Volunteering",
    type_stage: "Internship",
    nav_emplois: "Jobs & Collaborations",
    nav_apropos: "About",
    nav_contact: "Contact",
    a_la_une: "Featured",
    tous: "All",
    opportunites_titre: "Current opportunities",
    voir_opportunites: "See all opportunities →",
    footer_texte: "News and resources on education, technology, science and psychology, along with professional opportunities.",
    footer_site_officiel: "Educa-Psy official website ↗",
    footer_droits: "All rights reserved.",
    contact_titre: "Contact",
    contact_soustitre: "A question, a collaboration idea? Write to us.",
    contact_nom: "Name",
    contact_email: "Email address",
    contact_sujet: "Subject",
    contact_message: "Message",
    contact_envoyer: "Send message",
    contact_envoi_cours: "Sending…",
    contact_succes: "Thank you! Your message has been sent.",
    contact_erreur: "Something went wrong. Please try again shortly.",
    auth_connexion: "Log in",
    auth_inscription: "Sign up",
    auth_email: "Email address",
    auth_mdp: "Password",
    auth_bouton_connexion: "Log in",
    auth_bouton_inscription: "Create account",
    auth_deconnexion: "Log out",
    auth_connecte_comme: "Signed in as",
    auth_lien: "Log in",
    newsletter_titre: "Subscribe to our newsletter",
    newsletter_texte: "Get our latest articles and opportunities by email.",
    newsletter_placeholder: "Your email address",
    newsletter_bouton: "Subscribe",
    newsletter_succes: "Thanks for subscribing!",
    champs_obligatoires: "Please fill in all required fields.",
    desabo_titre: "Unsubscribe",
    desabo_texte: "Enter the email address to remove from our mailing list.",
    desabo_bouton: "Unsubscribe",
    desabo_succes: "You have been successfully unsubscribed.",
    desabo_erreur: "This address was not found in our subscribers.",
    lien_desabonnement: "Unsubscribe from the newsletter"
  },
  ht: {
    tagline: "Edikasyon · Teknoloji · Syans · Sikoloji",
    nav_accueil: "Akèy",
    nav_actualites: "Nouvèl",
    nav_newsletter: "Bilten",
    nav_articles: "Atik",
    nav_education: "Edikasyon",
    nav_technologie: "Teknoloji",
    nav_science: "Syans",
    nav_psychologie: "Sikoloji",
    nav_opportunites: "Opòtinite",
    type_emploi: "Travay",
    type_collaboration: "Kolaborasyon",
    type_benevolat: "Benevola",
    type_stage: "Estaj",
    nav_emplois: "Travay & Kolaborasyon",
    nav_apropos: "Konsènan nou",
    nav_contact: "Kontak",
    a_la_une: "Nan tèt liy",
    tous: "Tout",
    opportunites_titre: "Opòtinite aktyèl yo",
    voir_opportunites: "Wè tout opòtinite yo →",
    footer_texte: "Nouvèl ak resous nan edikasyon, teknoloji, syans ak sikoloji, ansanm ak opòtinite pwofesyonèl.",
    footer_site_officiel: "Sit ofisyèl Educa-Psy ↗",
    footer_droits: "Tout dwa rezève.",
    contact_titre: "Kontak",
    contact_soustitre: "Yon kesyon, yon pwopozisyon kolaborasyon? Ekri nou.",
    contact_nom: "Non",
    contact_email: "Imèl",
    contact_sujet: "Sijè",
    contact_message: "Mesaj",
    contact_envoyer: "Voye mesaj la",
    contact_envoi_cours: "L ap voye…",
    contact_succes: "Mèsi! Mesaj ou a voye.",
    contact_erreur: "Gen yon pwoblèm. Eseye ankò talè.",
    auth_connexion: "Konekte",
    auth_inscription: "Enskri",
    auth_email: "Imèl",
    auth_mdp: "Modpas",
    auth_bouton_connexion: "Konekte",
    auth_bouton_inscription: "Kreye kont",
    auth_deconnexion: "Dekonekte",
    auth_connecte_comme: "Ou konekte kòm",
    auth_lien: "Konekte",
    newsletter_titre: "Abòne w nan bilten nou an",
    newsletter_texte: "Resevwa dènye atik ak opòtinite nou yo pa imèl.",
    newsletter_placeholder: "Imèl ou",
    newsletter_bouton: "Abòne",
    newsletter_succes: "Mèsi paske ou abòne!",
    champs_obligatoires: "Tanpri ranpli tout chan obligatwa yo.",
    desabo_titre: "Dezabòne",
    desabo_texte: "Antre imèl ou vle retire nan lis nou an.",
    desabo_bouton: "Dezabòne",
    desabo_succes: "Ou dezabòne avèk siksè.",
    desabo_erreur: "Nou pa jwenn imèl sa a nan abòne nou yo.",
    lien_desabonnement: "Dezabòne nan bilten an"
  }
};

function appliquerTraductions(langue) {
  const dico = TRADUCTIONS[langue] || TRADUCTIONS.fr;
  document.querySelectorAll("[data-i18n]").forEach(el => {
    const cle = el.dataset.i18n;
    if (dico[cle]) el.textContent = dico[cle];
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
    const cle = el.dataset.i18nPlaceholder;
    if (dico[cle]) el.setAttribute("placeholder", dico[cle]);
  });
  document.documentElement.lang = langue;
}

function initLangue() {
  const select = document.getElementById("lang-select");
  const params = new URLSearchParams(window.location.search);
  const langueURL = params.get("lang");
  const langueChoisie = ["fr", "en", "ht"].includes(langueURL) ? langueURL : (localStorage.getItem("educapsy-langue") || "fr");

  appliquerTraductions(langueChoisie);
  localStorage.setItem("educapsy-langue", langueChoisie);

  if (select) {
    select.value = langueChoisie;
    select.addEventListener("change", () => {
      localStorage.setItem("educapsy-langue", select.value);
      appliquerTraductions(select.value);
      const url = new URL(window.location.href);
      url.searchParams.set("lang", select.value);
      window.history.replaceState({}, "", url);
    });
  }
}

/* Expose pour que d'autres scripts (contact-firebase.js, auth-firebase.js)
   puissent afficher des messages traduits dynamiquement */
window.EducaPsyI18n = {
  texte(cle) {
    const langue = localStorage.getItem("educapsy-langue") || "fr";
    const dico = TRADUCTIONS[langue] || TRADUCTIONS.fr;
    return dico[cle] || TRADUCTIONS.fr[cle] || cle;
  }
};

/* ---------- Lancement ---------- */

document.addEventListener("DOMContentLoaded", () => {
  initEnteteEtPied();
  initTheme();
  initMenuMobile();
  initSousMenus();
  initLangue();
});

