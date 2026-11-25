/* ============================================================
   EDUCA-PSY — interface.js
   ============================================================
   Comportements communs à toutes les pages : mode sombre, 
   menu mobile, sous-menus, filtres horizontaux et i18n.
   ============================================================ */

/* ---------- En-tête / pied de page (date + année) ---------- */

function initEnteteEtPied(langue = "fr") {
  const dateEl = document.getElementById("today-date");
  if (dateEl) {
    const auj = new Date();
    const localesMap = { fr: "fr-FR", en: "en-US", ht: "ht-HT", es: "es-ES" };
    const locale = localesMap[langue] || "fr-FR";
    const options = { weekday: "long", day: "numeric", month: "long", year: "numeric" };
    
    // Capitalisation de la première lettre
    const dateFormatted = auj.toLocaleDateString(locale, options);
    dateEl.textContent = dateFormatted.charAt(0).toUpperCase() + dateFormatted.slice(1);
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
      const svgSoleil = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`;
      const svgLune = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`;
      
      const labelSoleil = window.EducaPsyI18n ? window.EducaPsyI18n.texte("theme_clair") : "Clair";
      const labelLune = window.EducaPsyI18n ? window.EducaPsyI18n.texte("theme_sombre") : "Sombre";
      
      bouton.innerHTML = t === "sombre"
        ? `${svgSoleil}<span class="label">${labelSoleil}</span>`
        : `${svgLune}<span class="label">${labelLune}</span>`;
    }
    localStorage.setItem("educapsy-theme", t);
  }

  appliquer(theme);
  if (bouton) {
    bouton.addEventListener("click", () => appliquer(theme === "sombre" ? "clair" : "sombre"));
  }
}

/* ---------- Sous-menus de navigation ---------- */

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

  liens.querySelectorAll("a").forEach(a => {
    a.addEventListener("click", () => liens.classList.remove("ouvert"));
  });

  document.addEventListener("click", (e) => {
    if (liens.classList.contains("ouvert") && !liens.contains(e.target) && e.target !== bouton) {
      liens.classList.remove("ouvert");
      bouton.setAttribute("aria-expanded", "false");
    }
  });
}

/* ---------- Sélection et défilement des filtres horizontaux ---------- */

function initFiltresCategories() {
  const tabs = document.querySelectorAll(".filter-tab");
  if (!tabs.length) return;

  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      // 1. Mise à jour des états visuels
      tabs.forEach(t => t.classList.remove("active"));
      tab.classList.add("active");

      // 2. Centrage automatique de l'élément cliqué dans la barre horizontale
      tab.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });

      // 3. Filtrage dynamique si la fonction de page existe
      const categorie = tab.dataset.cat || tab.dataset.category || tab.dataset.filter;
      if (categorie && typeof window.filtrerArticles === "function") {
        window.filtrerArticles(categorie);
      }
    });
  });
}

/* ---------- Dictionnaires de traduction (FR / EN / HT / ES) ---------- */

const TRADUCTIONS = {
  fr: {
    tagline: "Éducation · Psychologie",
    theme_clair: "Clair",
    theme_sombre: "Sombre",
    nav_accueil: "Accueil",
    nav_actualites: "Actualités",
    site_information: "Site d'information",
    nav_newsletter: "Newsletter",
    nav_articles: "Articles",
    nav_education: "Éducation",
    nav_psychologie: "Psychologie",
    nav_bon_a_savoir: "Rubriques",
    type_insolite: "Insolite",
    type_savoir: "Savoir",
    nav_apropos: "À propos",
    nav_contact: "Contact",
    a_la_une: "À la une",
    tous: "Tous",
    bon_a_savoir_titre: "Rubriques",
    voir_bon_a_savoir: "Voir tout →",
    voir_plus: "Voir plus →",
    lire_bon_a_savoir: "Lire la fiche →",
    lire_la_suite: "Lire la suite →",
    temps_lecture_suffixe: "min de lecture",
    partager_article: "Partager cet article :",
    copier_lien: "Copier le lien",
    lien_copie: "✓ Copié !",
    lien_pret: "Lien prêt",
    articles_similaires: "Articles similaires",
    voir_tous_articles: "Voir tous les articles",
    cta_titre: "Besoin d'accompagnement ?",
    cta_description: "Educa-Psy vous accompagne avec des services spécialisés adaptés à vos besoins :",
    cta_service_psychologie: "Psychologie",
    cta_service_education: "Éducation",
    cta_service_accompagnement: "Accompagnement",
    cta_bouton_contact: "Contacter Educa-Psy →",
    footer_texte: "Actualités et ressources en éducation et psychologie.",
    footer_site_officiel: "Entreprise Educa-Psy ↗",
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
    newsletter_texte: "Recevez nos derniers articles et rubriques par e-mail.",
    newsletter_placeholder: "Votre adresse e-mail",
    newsletter_bouton: "S'abonner",
    newsletter_succes: "Merci de votre inscription !",
    champs_obligatoires: "Merci de remplir tous les champs obligatoires.",
    desabo_titre: "Se désabonner",
    desabo_texte: "Indiquez l'adresse e-mail à retirer de notre liste de diffusion.",
    desabo_bouton: "Se désabonner",
    desabo_succes: "Vous avez été désabonné(e) avec succès.",
    lien_desabonnement: "Se désabonner de la newsletter",
    breadcrumb_label: "Fil d'Ariane",
    page_404_titre: "404 — Page introuvable",
    page_404_desc: "La page ou la ressource que vous recherchez n'existe pas, a été renommée ou est temporairement inaccessible.",
    page_404_recherche_placeholder: "Rechercher un article, un thème...",
    page_404_retour_accueil: "← Retour à l'accueil",
    page_404_explorer_articles: "Explorer les articles",
    page_404_rubriques: "Rubriques recommandées :"
  },
  en: {
    tagline: "Education · Psychology",
    theme_clair: "Light",
    theme_sombre: "Dark",
    nav_accueil: "Home",
    nav_actualites: "News",
    site_information: "Information site",
    nav_newsletter: "Newsletter",
    nav_articles: "Articles",
    nav_education: "Education",
    nav_psychologie: "Psychology",
    nav_bon_a_savoir: "Sections",
    type_insolite: "Unusual",
    type_savoir: "Knowledge",
    nav_apropos: "About",
    nav_contact: "Contact",
    a_la_une: "Featured",
    tous: "All",
    bon_a_savoir_titre: "Sections",
    voir_bon_a_savoir: "View all →",
    voir_plus: "See more →",
    lire_bon_a_savoir: "Read the guide →",
    lire_la_suite: "Read more →",
    temps_lecture_suffixe: "min read",
    partager_article: "Share this article:",
    copier_lien: "Copy link",
    lien_copie: "✓ Copied!",
    lien_pret: "Link ready",
    articles_similaires: "Related articles",
    voir_tous_articles: "View all articles",
    cta_titre: "Need support?",
    cta_description: "Educa-Psy supports you with specialized services tailored to your needs:",
    cta_service_psychologie: "Psychology",
    cta_service_education: "Education",
    cta_service_accompagnement: "Guidance & Support",
    cta_bouton_contact: "Contact Educa-Psy →",
    footer_texte: "News and resources on education and psychology.",
    footer_site_officiel: "Educa-Psy Company ↗",
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
    newsletter_texte: "Get our latest articles and sections by email.",
    newsletter_placeholder: "Your email address",
    newsletter_bouton: "Subscribe",
    newsletter_succes: "Thanks for subscribing!",
    champs_obligatoires: "Please fill in all required fields.",
    desabo_titre: "Unsubscribe",
    desabo_texte: "Enter the email address to remove from our mailing list.",
    desabo_bouton: "Unsubscribe",
    desabo_succes: "You have been successfully unsubscribed.",
    desabo_erreur: "This address was not found in our subscribers.",
    lien_desabonnement: "Unsubscribe from the newsletter",
    breadcrumb_label: "Breadcrumbs",
    page_404_titre: "404 — Page Not Found",
    page_404_desc: "The page or resource you are looking for does not exist, has been moved, or is temporarily unavailable.",
    page_404_recherche_placeholder: "Search for an article, a topic...",
    page_404_retour_accueil: "← Back to Home",
    page_404_explorer_articles: "Browse Articles",
    page_404_rubriques: "Recommended Sections:"
  },
  ht: {
    tagline: "Edikasyon · Sikoloji",
    theme_clair: "Klè",
    theme_sombre: "Foske",
    nav_accueil: "Akèy",
    nav_actualites: "Nouvèl",
    site_information: "Sit enfòmasyon",
    nav_newsletter: "Bilten",
    nav_articles: "Atik",
    nav_education: "Edikasyon",
    nav_psychologie: "Sikoloji",
    nav_bon_a_savoir: "Ribrik",
    type_insolite: "Ensolit",
    type_savoir: "Konesans",
    nav_apropos: "Konsènan nou",
    nav_contact: "Kontak",
    a_la_une: "Nan tèt liy",
    tous: "Tout",
    bon_a_savoir_titre: "Ribrik",
    voir_bon_a_savoir: "Wè tout →",
    voir_plus: "Wè plis →",
    lire_bon_a_savoir: "Li fich la →",
    lire_la_suite: "Li rès la →",
    temps_lecture_suffixe: "min lekti",
    partager_article: "Pataje atik sa a :",
    copier_lien: "Kopye lyen an",
    lien_copie: "✓ Kopye!",
    lien_pret: "Lyen pare",
    articles_similaires: "Atik ki sanble",
    voir_tous_articles: "Wè tout atik yo",
    cta_titre: "Bezwen akonpayman?",
    cta_description: "Educa-Psy akonpaye w ak sèvis espesyalize ki adapte ak bezwen w yo :",
    cta_service_psychologie: "Sikoloji",
    cta_service_education: "Edikasyon",
    cta_service_accompagnement: "Akonpayman",
    cta_bouton_contact: "Kontakte Educa-Psy →",
    footer_texte: "Nouvèl ak resous nan edikasyon ak sikoloji.",
    footer_site_officiel: "Antrepriz Educa-Psy ↗",
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
    newsletter_texte: "Resevwa dènye atik ak ribrik nou yo pa imèl.",
    newsletter_placeholder: "Imèl ou",
    newsletter_bouton: "Abòne",
    newsletter_succes: "Mèsi paske ou abòne!",
    champs_obligatoires: "Tanpri ranpli tout chan obligatwa yo.",
    desabo_titre: "Dezabòne",
    desabo_texte: "Antre imèl ou vle retire nan lis nou an.",
    desabo_bouton: "Dezabòne",
    desabo_succes: "Ou dezabòne avèk siksè.",
    desabo_erreur: "Nou pa jwenn imèl sa a nan abòne nou yo.",
    lien_desabonnement: "Dezabòne nan bilten an",
    breadcrumb_label: "Fil Ariàn",
    page_404_titre: "404 — Paj la pa jwenn",
    page_404_desc: "Paj oswa resous w ap chèche a pa egziste, yo chanje non l oswa li pa disponib pou kounye a.",
    page_404_recherche_placeholder: "Chèche yon atik, yon sijè...",
    page_404_retour_accueil: "← Retounen nan Akèy",
    page_404_explorer_articles: "Eksplore Atik yo",
    page_404_rubriques: "Seksyon Rekòmande yo:"
  },
  es: {
    tagline: "Educación · Psicología",
    theme_clair: "Claro",
    theme_sombre: "Oscuro",
    nav_accueil: "Inicio",
    nav_actualites: "Noticias",
    site_information: "Sitio de información",
    nav_newsletter: "Boletín",
    nav_articles: "Artículos",
    nav_education: "Educación",
    nav_psychologie: "Psicología",
    nav_bon_a_savoir: "Secciones",
    type_insolite: "Insólito",
    type_savoir: "Saber",
    nav_apropos: "Acerca de",
    nav_contact: "Contacto",
    a_la_une: "Destacado",
    tous: "Todos",
    bon_a_savoir_titre: "Secciones",
    voir_bon_a_savoir: "Ver todo →",
    voir_plus: "Ver más →",
    lire_bon_a_savoir: "Leer la guía →",
    lire_la_suite: "Leer más →",
    temps_lecture_suffixe: "min de lectura",
    partager_article: "Compartir este artículo:",
    copier_lien: "Copiar enlace",
    lien_copie: "✓ ¡Copiado!",
    lien_pret: "Enlace listo",
    articles_similaires: "Artículos similares",
    voir_tous_articles: "Ver todos los artículos",
    cta_titre: "¿Necesita acompañamiento?",
    cta_description: "Educa-Psy le acompaña con servicios especializados adaptados a sus necesidades:",
    cta_service_psychologie: "Psicología",
    cta_service_education: "Educación",
    cta_service_accompagnement: "Acompañamiento",
    cta_bouton_contact: "Contactar a Educa-Psy →",
    footer_texte: "Noticias y recursos en educación y psicología.",
    footer_site_officiel: "Empresa Educa-Psy ↗",
    footer_droits: "Todos los derechos reservados.",
    contact_titre: "Contacto",
    contact_soustitre: "¿Una pregunta o propuesta de colaboración? Escríbanos.",
    contact_nom: "Nombre",
    contact_email: "Correo electrónico",
    contact_sujet: "Asunto",
    contact_message: "Mensaje",
    contact_envoyer: "Enviar mensaje",
    contact_envoi_cours: "Enviando…",
    contact_succes: "¡Gracias! Su mensaje ha sido enviado.",
    contact_erreur: "Ocurrió un error. Inténtelo de nuevo.",
    auth_connexion: "Iniciar sesión",
    auth_inscription: "Registrarse",
    auth_email: "Correo electrónico",
    auth_mdp: "Contraseña",
    auth_bouton_connexion: "Iniciar sesión",
    auth_bouton_inscription: "Crear cuenta",
    auth_deconnexion: "Cerrar sesión",
    auth_connecte_comme: "Conectado como",
    auth_lien: "Iniciar sesión",
    newsletter_titre: "Suscríbase a nuestro boletín",
    newsletter_texte: "Reciba nuestros últimos artículos y secciones por correo.",
    newsletter_placeholder: "Su correo electrónico",
    newsletter_bouton: "Suscribirse",
    newsletter_succes: "¡Gracias por suscribirse!",
    champs_obligatoires: "Por favor, complete todos los campos obligatorios.",
    desabo_titre: "Cancelar suscripción",
    desabo_texte: "Ingrese el correo que desea retirar de nuestra lista.",
    desabo_bouton: "Cancelar suscripción",
    desabo_succes: "Se ha cancelado su suscripción con éxito.",
    desabo_erreur: "No encontramos este correo en nuestros suscriptores.",
    lien_desabonnement: "Cancelar suscripción al boletín",
    breadcrumb_label: "Miga de pan",
    page_404_titre: "404 — Página no encontrada",
    page_404_desc: "La página o recurso que busca no existe, ha sido movido o no está disponible temporalmente.",
    page_404_recherche_placeholder: "Buscar un artículo, un tema...",
    page_404_retour_accueil: "← Volver al Inicio",
    page_404_explorer_articles: "Explorar Artículos",
    page_404_rubriques: "Secciones Recomendadas:"
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
  initEnteteEtPied(langue);
}

function initLangue() {
  const select = document.getElementById("lang-select");
  const params = new URLSearchParams(window.location.search);
  const langueURL = params.get("lang");
  const langueChoisie = ["fr", "en", "ht", "es"].includes(langueURL) 
    ? langueURL 
    : (localStorage.getItem("educapsy-langue") || "fr");

  appliquerTraductions(langueChoisie);
  localStorage.setItem("educapsy-langue", langueChoisie);

  if (select) {
    select.value = langueChoisie;
    select.addEventListener("change", () => {
      const nouvelleLangue = select.value;
      localStorage.setItem("educapsy-langue", nouvelleLangue);
      appliquerTraductions(nouvelleLangue);
      
      const url = new URL(window.location.href);
      url.searchParams.set("lang", nouvelleLangue);
      window.history.replaceState({}, "", url);

      window.dispatchEvent(new CustomEvent("educapsy-langue-changee", { detail: nouvelleLangue }));
    });
  }
}

window.EducaPsyI18n = {
  texte(cle) {
    const langue = localStorage.getItem("educapsy-langue") || "fr";
    const dico = TRADUCTIONS[langue] || TRADUCTIONS.fr;
    return dico[cle] || TRADUCTIONS.fr[cle] || cle;
  }
};

/* ---------- Lancement ---------- */

document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  initMenuMobile();
  initSousMenus();
  initFiltresCategories();
  initLangue();
});

