/* ============================================================
   EDUCA-PSY — articles-firebase.js
   ============================================================
   Accueil (index.html) : à la une + quelques articles récents.
   Page dédiée (articles.html) : liste complète, filtres,
   recherche et bouton "Voir plus" — tout se fait ici côté
   client sur la liste déjà chargée en mémoire (chargerArticles),
   sans requête Firestore supplémentaire ni index composite.
   ============================================================ */

import { db } from "./firebase-config.js";
import {
  collection, getDocs, doc, getDoc, query, orderBy
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";

const MOIS_FR = ["janvier","février","mars","avril","mai","juin","juillet",
                  "août","septembre","octobre","novembre","décembre"];

const NB_RECENTS_ACCUEIL = 3;   // nombre d'articles récents affichés sur l'accueil
const TAILLE_PAGE_ARTICLES = 9; // nombre d'articles affichés par "page" sur articles.html

let cacheArticles = null;

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
   utilisé pour les classes CSS de couleur (tag-*, cat-*).
   IMPORTANT : ces 4 slugs doivent rester synchronisés avec les
   classes définies dans style.css (tag-education, tag-psychologie,
   tag-bien-etre, tag-emotions) et avec le bandeau .spectrum-rule
   (s-education, s-psychologie, s-bien-etre, s-emotions). */
const CATEGORIES_SLUGS_COURTS = {
  "education": "education",
  "psychologie": "psychologie",
  "bien-etre et sante mentale": "bien-etre",
  "emotions": "emotions"
};

function slugifyCategorie(categorie) {
  if (!categorie) return "";
  const cleNormalisee = retirerAccents(categorie.toLowerCase()).trim();
  if (CATEGORIES_SLUGS_COURTS[cleNormalisee]) {
    return CATEGORIES_SLUGS_COURTS[cleNormalisee];
  }
  // Repli générique pour toute catégorie non cartographiée
  // (ex. "Santé mentale et soutien psychosocial") : elle recevra
  // sa propre classe, sans couleur de thème dédiée pour l'instant.
  return slugify(categorie);
}

function calculerTempsLecture(contenuArray) {
  if (!contenuArray || !contenuArray.length) return "1 min de lecture";
  const texteTotal = contenuArray.join(" ");
  const mots = texteTotal.trim().split(/\s+/).length;
  const minutes = Math.max(1, Math.ceil(mots / 200));
  return `${minutes} min de lecture`;
}

function formaterTexte(texte) {
  if (!texte) return "";

  // 1. Transformation des sous-titres (## )
  if (texte.startsWith("## ")) {
    const titreSousSection = texte.replace("## ", "").trim();
    return `<h2 class="article-subtitle">${titreSousSection}</h2>`;
  }

  // 2. Transformation d'une ligne d'énumération / puce (* ou - )
  if (texte.startsWith("* ") || texte.startsWith("- ")) {
    const contenuPuce = texte.substring(2).trim();
    const contenuFormate = contenuPuce
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/==([^=]+)==/g, '<span style="color: var(--couleur-or-fonce, #B8912F); font-weight: 600;">$1</span>')
      .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');

    return `<ul class="article-list"><li>${contenuFormate}</li></ul>`;
  }

  // 3. Transformation d'une ligne vidéo YouTube : ![youtube](URL)
  if (texte.startsWith("![youtube](")) {
    const match = texte.match(/!\[youtube\]\((https?:\/\/(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([^\s)]+))\)/);
    if (match && match[1]) {
      const cleanId = match[2].split('&')[0];
      return `<div class="video-container"><iframe src="https://www.youtube-nocookie.com/embed/${cleanId}" title="Vidéo YouTube" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen loading="lazy"></iframe></div>`;
    }
  }

  // 4. Paragraphe classique avec formatages Markdown internes
  return texte
    .replace(/!\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<img src="$2" alt="$1" loading="lazy">')
    .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/==([^=]+)==/g, '<span style="color: var(--couleur-or-fonce, #B8912F); font-weight: 600;">$1</span>');
}

/* ---------- Accès Firestore ---------- */

async function chargerArticles() {
  if (cacheArticles) return cacheArticles;
  const q = query(collection(db, "articles"), orderBy("date", "desc"));
  const snap = await getDocs(q);
  cacheArticles = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  return cacheArticles;
}

async function chargerArticleParId(id) {
  const ref = doc(db, "articles", id);
  const snap = await getDoc(ref);
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

async function chargerArticlesSimilaires(categorie, idAExclure, max = 2) {
  const tous = await chargerArticles();
  return tous
    .filter(a => a.categorie === categorie && a.id !== idAExclure)
    .slice(0, max);
}

/* ---------- Gabarits HTML ---------- */

function carteArticleHTML(article, featured = false) {
  const langue = localStorage.getItem("educapsy-langue") || "fr";
  const slug = slugifyCategorie(article.categorie || "");
  const titre = champLocale(article, "titre", langue);
  const resume = champLocale(article, "resume", langue);
  const image = article.image ? `<img class="article-card-image" src="${article.image}" alt="${titre || ''}" loading="lazy">` : "";
  return `
    <article class="article-card ${featured ? "article-card--featured" : ""} cat-${slug}">
      ${image}
      <span class="tag tag-${slug}">${article.categorie || ""}</span>
      <h2 class="article-card-title"><a href="article.html?id=${article.id}">${titre || "(sans titre)"}</a></h2>
      <p class="article-card-resume">${resume}</p>
      <div class="article-card-meta">${article.auteur || "Équipe Educa-Psy"} · ${formaterDateFirestore(article.date)}</div>
      <a class="read-more" href="article.html?id=${article.id}">Lire l'article →</a>
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
    zoneFeatured.innerHTML = `<p class="empty-msg">Chargement…</p>`;
  }
  zoneRecents.innerHTML = `<p class="empty-msg">Chargement des articles…</p>`;

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

/* ---------- Page articles.html (liste complète) ---------- */

async function initArticlesListePage() {
  const grille = document.getElementById("articles-grid");
  if (!grille) return; // pas sur la page articles.html

  grille.innerHTML = `<p class="empty-msg">Chargement des articles…</p>`;

  let tous;
  try {
    tous = await chargerArticles();
  } catch (err) {
    console.error("Erreur Firestore (chargerArticles) :", err);
    grille.innerHTML = erreurChargementHTML();
    return;
  }

  const params = new URLSearchParams(window.location.search);
  let catActuelle = params.get("cat") || "Tous";
  let rechercheActuelle = "";
  let nbAffiches = TAILLE_PAGE_ARTICLES;

  function creerBoutonVoirPlus() {
    let bouton = document.getElementById("btn-voir-plus-articles");
    if (!bouton) {
      bouton = document.createElement("button");
      bouton.type = "button";
      bouton.id = "btn-voir-plus-articles";
      bouton.className = "btn btn-outline";
      bouton.style.display = "block";
      bouton.style.margin = "var(--e6) auto 0";
      bouton.textContent = "Voir plus d'articles";
      grille.insertAdjacentElement("afterend", bouton);
      bouton.addEventListener("click", () => {
        nbAffiches += TAILLE_PAGE_ARTICLES;
        afficher();
      });
    }
    return bouton;
  }

  function afficher() {
    let filtres = catActuelle === "Tous" ? tous : tous.filter(a => a.categorie === catActuelle);
    if (rechercheActuelle) {
      const q = rechercheActuelle.toLowerCase();
      filtres = filtres.filter(a =>
        (a.titre || "").toLowerCase().includes(q) || (a.resume || "").toLowerCase().includes(q));
    }

    const visibles = filtres.slice(0, nbAffiches);
    grille.innerHTML = visibles.map(a => carteArticleHTML(a)).join("")
      || `<p class="empty-msg">Aucun article ne correspond pour l'instant — essayez une autre recherche ou une autre rubrique.</p>`;

    const bouton = creerBoutonVoirPlus();
    bouton.style.display = nbAffiches < filtres.length ? "inline-block" : "none";
  }

  const onglets = document.querySelectorAll(".filter-tab[data-cat]");
  onglets.forEach(onglet => {
    onglet.classList.toggle("active", onglet.dataset.cat === catActuelle);
    onglet.addEventListener("click", () => {
      onglets.forEach(o => o.classList.remove("active"));
      onglet.classList.add("active");
      catActuelle = onglet.dataset.cat;
      nbAffiches = TAILLE_PAGE_ARTICLES;
      afficher();
    });
  });

  const champRecherche = document.getElementById("recherche-articles");
  if (champRecherche) {
    champRecherche.addEventListener("input", () => {
      rechercheActuelle = champRecherche.value.trim();
      nbAffiches = TAILLE_PAGE_ARTICLES;
      afficher();
    });
  }

  afficher();
}

/* ---------- Optimisations SEO, Open Graph & Schema NewsArticle ---------- */

function mettreAJourMetaTags(article, titre, resume) {
  const urlArticle = window.location.href;
  const imageArticle = article.image || "https://educa-psy.web.app/og-image.png";

  document.querySelector('meta[name="description"]')?.setAttribute('content', resume);

  document.querySelector('meta[property="og:title"]')?.setAttribute('content', `${titre} — Educa-Psy`);
  document.querySelector('meta[property="og:description"]')?.setAttribute('content', resume);
  document.querySelector('meta[property="og:image"]')?.setAttribute('content', imageArticle);
  document.querySelector('meta[property="og:url"]')?.setAttribute('content', urlArticle);

  document.querySelector('meta[name="twitter:title"]')?.setAttribute('content', `${titre} — Educa-Psy`);
  document.querySelector('meta[name="twitter:description"]')?.setAttribute('content', resume);
  document.querySelector('meta[name="twitter:image"]')?.setAttribute('content', imageArticle);

  let canonicalLink = document.querySelector('link[rel="canonical"]');
  if (canonicalLink) {
    canonicalLink.setAttribute('href', urlArticle);
  }
}

function injecterDonneesStructurees(article, titre, resume) {
  const ancien = document.getElementById("jsonld-article");
  if (ancien) ancien.remove();

  const d = article.date && article.date.toDate ? article.date.toDate() : new Date(article.date || Date.now());
  const dateIso = !isNaN(d.getTime()) ? d.toISOString() : new Date().toISOString();

  const script = document.createElement("script");
  script.type = "application/ld+json";
  script.id = "jsonld-article";

  script.textContent = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": window.location.href
    },
    "headline": titre || article.titre || "",
    "description": resume || article.resume || "",
    "image": article.image ? [article.image] : ["https://educa-psy.web.app/og-image.png"],
    "datePublished": dateIso,
    "dateModified": article.dateModif ? new Date(article.dateModif).toISOString() : dateIso,
    "author": [{
      "@type": "Person",
      "name": article.auteur || "Équipe Educa-Psy",
      "url": "https://educa-psy.web.app/a-propos.html"
    }],
    "publisher": {
      "@type": "Organization",
      "name": "Educa-Psy",
      "url": "https://educa-psy.web.app/",
      "logo": {
        "@type": "ImageObject",
        "url": "https://educa-psy.web.app/logo.png"
      }
    }
  });

  document.head.appendChild(script);
}

/* ---------- Page Article ---------- */

async function initArticlePageFirebase() {
  const zone = document.getElementById("article-content");
  if (!zone) return;

  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  if (!id) {
    zone.innerHTML = articleIntrouvableHTML();
    document.title = "Article introuvable — Educa-Psy";
    return;
  }

  if (!zone.querySelector(".article-title")) {
    zone.innerHTML = `<p class="empty-msg">Chargement de l'article…</p>`;
  }

  let article;
  try {
    article = await chargerArticleParId(id);
  } catch (err) {
    console.error("Erreur Firestore (chargerArticleParId) :", err);
    zone.innerHTML = erreurChargementHTML();
    return;
  }

  if (!article) {
    zone.innerHTML = articleIntrouvableHTML();
    document.title = "Article introuvable — Educa-Psy";
    return;
  }

  const langue = localStorage.getItem("educapsy-langue") || "fr";
  const slug = slugifyCategorie(article.categorie || "");
  const titre = champLocale(article, "titre", langue);
  const resume = champLocale(article, "resume", langue);

  document.title = `${titre || article.titre} — Educa-Psy`;
  mettreAJourMetaTags(article, titre, resume);

  const contenu = Array.isArray(article[`contenu_${langue}`]) && article[`contenu_${langue}`].length
    ? article[`contenu_${langue}`]
    : (Array.isArray(article.contenu) ? article.contenu : []);

  const tempsLecture = calculerTempsLecture(contenu);

  const imageHero = article.image
    ? `<figure class="article-hero">
        <img class="article-image" src="${article.image}" alt="${titre || ""}" fetchpriority="high">
       </figure>`
    : "";

  const dateObj = article.date && article.date.toDate ? article.date.toDate() : new Date(article.date);
  const dateIso = !isNaN(dateObj.getTime()) ? dateObj.toISOString() : "";

  zone.innerHTML = `
    <article class="single-article">
      <a class="back-link" href="index.html">← Retour à l'accueil</a>
      <span class="tag tag-${slug}">${article.categorie || ""}</span>
      <h1 class="article-title">${titre || ""}</h1>
      <div class="article-meta">
        Par <strong>${article.auteur || "Équipe Educa-Psy"}</strong> ·
        <time datetime="${dateIso}">${formaterDateFirestore(article.date)}</time> ·
        <span class="reading-time">${tempsLecture}</span>
      </div>
      ${imageHero}
      <div class="article-body">
        ${contenu.length ? contenu.map(p => {
          const resultatFormatte = formaterTexte(p);
          if (resultatFormatte.startsWith("<h2") || resultatFormatte.startsWith("<ul") || resultatFormatte.startsWith("<div")) {
            return resultatFormatte;
          }
          return `<p>${resultatFormatte}</p>`;
        }).join("") : "<p><em>Cet article n'a pas encore de contenu.</em></p>"}
      </div>
      <button type="button" class="share-btn" id="btn-partager">↗ Partager</button>
    </article>`;

  const btnPartager = document.getElementById("btn-partager");
  if (btnPartager) {
    btnPartager.addEventListener("click", async () => {
      const data = { title: titre || "Educa-Psy", text: resume || "", url: window.location.href };
      if (navigator.share) {
        try { await navigator.share(data); } catch (err) { /* annulé par l'utilisateur */ }
      } else {
        try {
          await navigator.clipboard.writeText(window.location.href);
          btnPartager.textContent = "✓ Lien copié";
          setTimeout(() => { btnPartager.textContent = "↗ Partager"; }, 2000);
        } catch (err) {
          console.error("Impossible de copier le lien :", err);
        }
      }
    });
  }

  const zoneSimilaires = document.getElementById("articles-similaires");
  if (zoneSimilaires) {
    try {
      const similaires = await chargerArticlesSimilaires(article.categorie, article.id, 2);
      if (similaires.length) {
        zoneSimilaires.innerHTML = `
          <h3>Articles similaires</h3>
          <div class="articles-grid articles-grid--compact">
            ${similaires.map(a => carteArticleHTML(a)).join("")}
          </div>`;
      }
    } catch (err) {
      console.error("Erreur Firestore (articles similaires) :", err);
    }
  }

  injecterDonneesStructurees(article, titre, resume);
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

