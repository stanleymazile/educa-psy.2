/* ============================================================
   EDUCA-PSY — articles-firebase.js
   ============================================================
   Les articles sont lus en direct depuis Firestore (collection
   "articles") : toute modification faite dans la console
   Firebase apparaît immédiatement sur le site, sans redéploiement.

   Vous n'avez normalement pas besoin de modifier ce fichier.
   ============================================================ */

import { db } from "./firebase-config.js";
import {
  collection, getDocs, doc, getDoc, query, orderBy, where
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore-lite.js";

const MOIS_FR = ["janvier","février","mars","avril","mai","juin","juillet",
                  "août","septembre","octobre","novembre","décembre"];

function formaterDateFirestore(valeur) {
  if (!valeur) return "";
  const d = valeur.toDate ? valeur.toDate() : new Date(valeur);
  if (isNaN(d.getTime())) return "";
  return `${d.getUTCDate()} ${MOIS_FR[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

function slugify(texte) {
  return texte
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/* Dans un paragraphe de "contenu", permet d'écrire :
     [texte du lien](https://exemple.com)   -> devient un lien cliquable
     ![texte alternatif](https://image.jpg) -> devient une image
   Le HTML brut (ex: <a href="...">) fonctionne aussi tel quel. */
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
  const slug = slugify(article.categorie || "");
  const image = article.image ? `<img class="article-card-image" src="${article.image}" alt="" loading="lazy">` : "";
  return `
    <article class="article-card ${featured ? "article-card--featured" : ""} cat-${slug}">
      ${image}
      <span class="tag tag-${slug}">${article.categorie || ""}</span>
      <h2 class="article-card-title"><a href="article.html?id=${article.id}">${article.titre || "(sans titre)"}</a></h2>
      <p class="article-card-resume">${article.resume || ""}</p>
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
  if (!grille) return; // pas sur la page d'accueil

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
  if (!zone) return; // pas sur la page article

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

  document.title = `${article.titre} — Educa-Psy`;
  const slug = slugify(article.categorie || "");
  const contenu = Array.isArray(article.contenu) ? article.contenu : [];
  const imageHero = article.image ? `<img class="article-image" src="${article.image}" alt="${article.titre || ""}">` : "";

  zone.innerHTML = `
    <a class="back-link" href="index.html">← Retour à l'accueil</a>
    <span class="tag tag-${slug}">${article.categorie || ""}</span>
    <h1 class="article-title">${article.titre || ""}</h1>
    <div class="article-meta">Par ${article.auteur || "Équipe Educa-Psy"} · ${formaterDateFirestore(article.date)}</div>
    ${imageHero}
    <div class="article-body">${contenu.length ? contenu.map(p => `<p>${formaterTexte(p)}</p>`).join("") : "<p><em>Cet article n'a pas encore de contenu (champ « contenu » manquant dans Firestore).</em></p>"}</div>
    <button type="button" class="share-btn" id="btn-partager">↗ Partager</button>`;

  const btnPartager = document.getElementById("btn-partager");
  if (btnPartager) {
    btnPartager.addEventListener("click", async () => {
      const data = { title: article.titre || "Educa-Psy", text: article.resume || "", url: window.location.href };
      if (navigator.share) {
        try { await navigator.share(data); } catch (err) { /* annulé par l'utilisateur : rien à faire */ }
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
      console.error("Erreur Firestore (articles similaires) :", err); // non bloquant
    }
  }

  injecterDonneesStructurees(article);
}

function injecterDonneesStructurees(article) {
  const ancien = document.getElementById("jsonld-article");
  if (ancien) ancien.remove();
  const d = article.date && article.date.toDate ? article.date.toDate() : null;
  const script = document.createElement("script");
  script.type = "application/ld+json";
  script.id = "jsonld-article";
  script.textContent = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": article.titre || "",
    "description": article.resume || "",
    "author": { "@type": "Organization", "name": article.auteur || "Équipe Educa-Psy" },
    "publisher": { "@type": "Organization", "name": "Educa-Psy" },
    "datePublished": d ? d.toISOString().slice(0, 10) : undefined,
    "image": article.image || undefined
  });
  document.head.appendChild(script);
}

/* ---------- Lancement ---------- */

document.addEventListener("DOMContentLoaded", () => {
  initAccueilFirebase();
  initArticlePageFirebase();
});


