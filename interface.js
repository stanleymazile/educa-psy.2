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
    tagline: "Éducation · Psychologie · Bien-être et santé mentale · Émotions · Santé mentale et soutien psychosocial",
    theme_clair: "Clair",
    theme_sombre: "Sombre",
    nav_accueil: "Accueil",
    nav_actualites: "Actualités",
    nav_newsletter: "Newsletter",
    nav_articles: "Articles",
    nav_education: "Éducation",
    nav_psychologie: "Psychologie",
    nav_bien_etre: "Bien-être et santé mentale",
    nav_emotions: "Émotions",
    nav_soutien_psychosocial: "Santé mentale et soutien psychosocial",
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
    footer_texte: "Actualités et ressources en éducation, psychologie, bien-être et santé mentale, émotions, et santé mentale et soutien psychosocial.",
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
    tagline: "Education · Psychology · Mental Health & Wellbeing · Emotions · Mental Health and Psychosocial Support",
    theme_clair: "Light",
    theme_sombre: "Dark",
    nav_accueil: "Home",
    nav_actualites: "News",
    nav_newsletter: "Newsletter",
    nav_articles: "Articles",
    nav_education: "Education",
    nav_psychologie: "Psychology",
    nav_bien_etre: "Mental Health & Wellbeing",
    nav_emotions: "Emotions",
    nav_soutien_psychosocial: "Mental Health and Psychosocial Support",
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
    footer_texte: "News and resources on education, psychology, mental health and wellbeing, emotions, and mental health and psychosocial support.",
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
    tagline: "Edikasyon · Sikoloji · Byennèt ak Sante Mantal · Emosyon · Sante Mantal ak Sipò Sikososyal",
    theme_clair: "Klè",
    theme_sombre: "Foske",
    nav_accueil: "Akèy",
    nav_actualites: "Nouvèl",
    nav_newsletter: "Bilten",
    nav_articles: "Atik",
    nav_education: "Edikasyon",
    nav_psychologie: "Sikoloji",
    nav_bien_etre: "Byennèt ak Sante Mantal",
    nav_emotions: "Emosyon",
    nav_soutien_psychosocial: "Sante Mantal ak Sipò Sikososyal",
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
    footer_texte: "Nouvèl ak resous nan edikasyon, sikoloji, byennèt ak sante mantal, emosyon, ak sante mantal ak sipò sikososyal.",
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
  },
  es: {
    tagline: "Educación · Psicología · Bienestar y Salud Mental · Emociones · Salud Mental y Apoyo Psicosocial",
    theme_clair: "Claro",
    theme_sombre: "Oscuro",
    nav_accueil: "Inicio",
    nav_actualites: "Noticias",
    nav_newsletter: "Boletín",
    nav_articles: "Artículos",
    nav_education: "Educación",
    nav_psychologie: "Psicología",
    nav_bien_etre: "Bienestar y Salud Mental",
    nav_emotions: "Emociones",
    nav_soutien_psychosocial: "Salud Mental y Apoyo Psicosocial",
    nav_opportunites: "Oportunidades",
    type_emploi: "Empleo",
    type_collaboration: "Colaboración",
    type_benevolat: "Voluntariado",
    type_stage: "Pasantía",
    nav_emplois: "Empleos y Colaboraciones",
    nav_apropos: "Acerca de",
    nav_contact: "Contacto",
    a_la_une: "Destacado",
    tous: "Todos",
    opportunites_titre: "Oportunidades actuales",
    voir_opportunites: "Ver todas las oportunidades →",
    footer_texte: "Noticias y recursos en educación, psicología, bienestar y salud mental, emociones, y salud mental y apoyo psicosocial.",
    footer_site_officiel: "Sitio oficial de Educa-Psy ↗",
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
    newsletter_texte: "Reciba nuestros últimos artículos y oportunidades por correo.",
    newsletter_placeholder: "Su correo electrónico",
    newsletter_bouton: "Suscribirse",
    newsletter_succes: "¡Gracias por suscribirse!",
    champs_obligatoires: "Por favor, complete todos los campos obligatorios.",
    desabo_titre: "Cancelar suscripción",
    desabo_texte: "Ingrese el correo que desea retirar de nuestra lista.",
    desabo_bouton: "Cancelar suscripción",
    desabo_succes: "Se ha cancelado su suscripción con éxito.",
    desabo_erreur: "No encontramos este correo en nuestros suscriptores.",
    lien_desabonnement: "Cancelar suscripción al boletín"
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

