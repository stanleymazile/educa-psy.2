/* ============================================================
   EDUCA-PSY — articles-firebase.js
   ============================================================
   Les articles sont lus en direct depuis Firestore (collection
   "articles") : toute modification faite dans la console
   Firebase apparaît immédiatement sur le site, sans redéploiement.
   Optimisé pour l'accessibilité, le SEO dynamique et Google Discover.
   ============================================================ */

import { db } from "./firebase-config.js";
import {
  collection, getDocs, doc, getDoc, query, orderBy, where
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";

/* Mois selon la langue active */
const MOIS_LANG = {
  fr: ["janvier","février","mars","avril","mai","juin","juillet","août","septembre","octobre","novembre","décembre"],
  ht: ["janvye","fevriye","mas","avril","mè","jen","jiyè","out","septanm","oktòb","novanm","desanm"],
  en: ["January","February","March","April","May","June","July","August","September","October","November","December"],
  es: ["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"]
};

/* Retourne le champ dans la langue active, avec fallback français */
function champLocale(article, champ, langue) {
  if (!langue || langue === "fr") return article[champ] || "";
  return article[`${champ}_${langue}`] || article[champ] || "";
}

/* Formate la date Firestore selon la langue de l'utilisateur */
function formaterDateFirestore(valeur) {
  if (!valeur) return "";
  const d = valeur.toDate ? valeur.toDate() : new Date(valeur);
  if (isNaN(d.getTime())) return "";
  const langue = localStorage.getItem("educapsy-langue") || "fr";
  const listeMois = MOIS_LANG[langue] || MOIS_LANG.fr;
  return `${d.getUTCDate()} ${listeMois[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

function slugify(texte) {
  return texte
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/* Formatage du texte enrichi (images et liens Markdown + HTML) */
function formaterTexte(texte) {
  if (!texte) return "";
  return texte
    .replace(/!\[([^\]]*)\]\((https?:\/\/[^\s)]+)\)/g, '<img src="$2" alt="$1" loading="lazy">')
    .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
}

/* ---------- Accès Firestore ---------- */

async function chargerArticles() {
  const q = query(collection(db, "articles"), orderBy("date", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

async function chargerArticleParId(id) {
  const ref = doc(db, "articles", id);
  const snap = await getDoc(ref);
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

async function chargerArticlesSimilaires(categorie, idAExclure, max = 2) {
  const q = query(collection(db, "articles"), where("categorie", "==", categorie));
  const snap = await getDocs(q);
  return snap.docs
    .map(d => ({ id: d.id, ...d.data() }))
    .filter(a => a.id !== idAExclure)
    .slice(0, max);
}

/* ---------- Gabarits HTML ---------- */

function carteArticleHTML(article, featured = false) {
  const langue = localStorage.getItem("educapsy-langue") || "fr";
  const slug = slugify(article.categorie || "");
  const titre = champLocale(article, "titre", langue);
  const resume = champLocale(article, "resume", langue);
  const imageAlt = titre ? `Illustration pour : ${titre}` : "Illustration d'article";
  const image = article.image ? `<img class="article-card-image" src="${article.image}" alt="${imageAlt}" loading="lazy">` : "";
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
  return `<p class="empty-msg">Impossible de charger les articles pour le moment. Vérifiez la configuration dans firebase-config.js et les règles de sécurité Firestore (voir FIREBASE-GUIDE.md).</p>`;
}

/* ---------- Page d'accueil ---------- */

async function initAccueilFirebase() {
  const grille = document.getElementById("articles-grid");
  if (!grille) return; // Pas sur la page d'accueil

  const zoneFeatured = document.getElementById("featured-article");
  if (zoneFeatured) zoneFeatured.innerHTML = `<p class="empty-msg">Chargement…</p>`;
  grille.innerHTML = `<p class="empty-msg">Chargement des articles…</p>`;

  let tous;
  try {
    tous = await chargerArticles();
  } catch (err) {
    console.error("Erreur Firestore (chargerArticles) :", err);
    grille.innerHTML = erreurChargementHTML();
    return;
  }

  if (!tous.length) {
    grille.innerHTML = `<p class="empty-msg">Aucun article publié pour le moment.</p>`;
    return;
  }

  const premier = tous.find(a => a.aLaUne === true) || tous[0];
  const reste = tous.filter(a => a.id !== premier.id);

  if (zoneFeatured) zoneFeatured.innerHTML = carteArticleHTML(premier, true);

  let catActuelle = "Tous";
  let rechercheActuelle = "";

  function afficher() {
    let filtres = catActuelle === "Tous" ? reste : reste.filter(a => a.categorie === catActuelle);
    if (rechercheActuelle) {
      const q = rechercheActuelle.toLowerCase();
      filtres = filtres.filter(a =>
        (a.titre || "").toLowerCase().includes(q) || (a.resume || "").toLowerCase().includes(q));
    }
    grille.innerHTML = filtres.map(a => carteArticleHTML(a)).join("")
      || `<p class="empty-msg">Aucun article ne correspond pour l'instant — essayez une autre recherche ou une autre rubrique.</p>`;
  }

  const params = new URLSearchParams(window.location.search);
  catActuelle = params.get("cat") || "Tous";
  const onglets = document.querySelectorAll(".filter-tab[data-cat]");
  onglets.forEach(onglet => {
    onglet.classList.toggle("active", onglet.dataset.cat === catActuelle);
    onglet.addEventListener("click", () => {
      onglets.forEach(o => o.classList.remove("active"));
      onglet.classList.add("active");
      catActuelle = onglet.dataset.cat;
      afficher();
    });
  });

  const champRecherche = document.getElementById("recherche-articles");
  if (champRecherche) {
    champRecherche.addEventListener("input", () => {
      rechercheActuelle = champRecherche.value.trim();
      afficher();
    });
  }

  afficher();
}

/* ---------- Page article ---------- */

async function initArticlePageFirebase() {
  const zone = document.getElementById("article-content");
  if (!zone) return; // Pas sur la page article

  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  if (!id) {
    zone.innerHTML = articleIntrouvableHTML();
    document.title = "Article introuvable — Educa-Psy";
    return;
  }

  zone.innerHTML = `<p class="empty-msg">Chargement de l'article…</p>`;

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
  const slug = slugify(article.categorie || "");
  const titre = champLocale(article, "titre", langue);
  const resume = champLocale(article, "resume", langue);
  
  // Prise en charge robuste : tableau ou texte simple
  let contenuBrut = article[`contenu_${langue}`] || article.contenu || [];
  let contenuArray = [];
  if (Array.isArray(contenuBrut)) {
    contenuArray = contenuBrut;
  } else if (typeof contenuBrut === "string" && contenuBrut.trim() !== "") {
    contenuArray = contenuBrut.split(/\n\s*\n/);
  }

  document.title = `${titre || "Article"} — Educa-Psy`;

  // Mise à jour des balises Open Graph et Méta-description dynamiques pour Discover & Réseaux Sociaux
  mettreAJourMetaTags(titre, resume, article.image);

  const imageHero = article.image ? `<img class="article-image" src="${article.image}" alt="${titre || "Illustration de l'article"}">` : "";

  zone.innerHTML = `
    <a class="back-link" href="index.html">← Retour à l'accueil</a>
    <span class="tag tag-${slug}">${article.categorie || ""}</span>
    <h1 class="article-title">${titre || ""}</h1>
    <div class="article-meta">Par ${article.auteur || "Équipe Educa-Psy"} · ${formaterDateFirestore(article.date)}</div>
    ${imageHero}
    <div class="article-body">${contenuArray.length ? contenuArray.map(p => `<p>${formaterTexte(p)}</p>`).join("") : "<p><em>Cet article n'a pas encore de contenu (champ « contenu » manquant dans Firestore).</em></p>"}</div>
    <button type="button" class="share-btn" id="btn-partager">↗ Partager</button>`;

  const btnPartager = document.getElementById("btn-partager");
  if (btnPartager) {
    btnPartager.addEventListener("click", async () => {
      const data = { title: titre || "Educa-Psy", text: resume || "", url: window.location.href };
      if (navigator.share) {
        try { await navigator.share(data); } catch (err) { /* Annulé par l'utilisateur */ }
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

  // Mettre à jour le JSON-LD pour Google Search et Discover
  injecterDonneesStructurees(article, titre, resume);
}

/* Mise à jour dynamique des balises SEO / Social dans le <head> */
function mettreAJourMetaTags(titre, resume, image) {
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc && resume) metaDesc.setAttribute("content", resume);

  const ogTitre = document.querySelector('meta[property="og:title"]');
  if (ogTitre && titre) ogTitre.setAttribute("content", `${titre} — Educa-Psy`);

  const ogDesc = document.querySelector('meta[property="og:description"]');
  if (ogDesc && resume) ogDesc.setAttribute("content", resume);

  const ogUrl = document.querySelector('meta[property="og:url"]');
  if (ogUrl) ogUrl.setAttribute("content", window.location.href);

  if (image) {
    const ogImg = document.querySelector('meta[property="og:image"]');
    if (ogImg) ogImg.setAttribute("content", image);

    const twImg = document.querySelector('meta[name="twitter:image"]');
    if (twImg) twImg.setAttribute("content", image);
  }
}

/* Injection/Mise à jour dynamique de la structure NewsArticle JSON-LD pour Discover */
function injecterDonneesStructurees(article, titre, resume) {
  let script = document.getElementById("schema-article");
  if (!script) {
    script = document.createElement("script");
    script.type = "application/ld+json";
    script.id = "schema-article";
    document.head.appendChild(script);
  }

  const d = article.date && article.date.toDate ? article.date.toDate() : (article.date ? new Date(article.date) : null);
  
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": window.location.href
    },
    "headline": titre || article.titre || "",
    "description": resume || article.resume || "",
    "image": article.image ? [article.image] : ["https://educa-psy.web.app/og-image.png"],
    "datePublished": d && !isNaN(d.getTime()) ? d.toISOString() : new Date().toISOString(),
    "dateModified": d && !isNaN(d.getTime()) ? d.toISOString() : new Date().toISOString(),
    "publisher": {
      "@type": "Organization",
      "name": "Educa-Psy",
      "url": "https://educa-psy.web.app/",
      "logo": {
        "@type": "ImageObject",
        "url": "https://educa-psy.web.app/logo.svg"
      }
    },
    "author": {
      "@type": "Organization",
      "name": article.auteur || "Équipe Educa-Psy"
    }
  };

  script.textContent = JSON.stringify(schemaData);
}

/* ---------- Lancement ---------- */

document.addEventListener("DOMContentLoaded", () => {
  initAccueilFirebase();
  initArticlePageFirebase();
});
