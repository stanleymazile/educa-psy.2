/* ============================================================
   EDUCA-PSY — main.js
   ============================================================
   Ce fichier affiche automatiquement le contenu défini dans
   articles-data.js et emplois-data.js sur les différentes pages.
   Vous n'avez normalement PAS besoin de modifier ce fichier :
   pour ajouter du contenu, modifiez plutôt articles-data.js
   ou emplois-data.js.
   ============================================================ */

const MOIS_FR = ["janvier","février","mars","avril","mai","juin","juillet",
                  "août","septembre","octobre","novembre","décembre"];
const JOURS_FR = ["dimanche","lundi","mardi","mercredi","jeudi","vendredi","samedi"];

/* ---------- Utilitaires ---------- */

function formaterDate(dateStr) {
  if (!dateStr) return "";
  const parties = dateStr.split("-").map(Number);
  const [annee, mois, jour] = parties;
  if (!annee || !mois || !jour) return dateStr; // texte libre type "[date]"
  return `${jour} ${MOIS_FR[mois - 1]} ${annee}`;
}

function slugify(texte) {
  return texte
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function trierParDateDesc(liste) {
  return [...liste].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
}

/* ---------- Gabarits HTML ---------- */

function carteArticleHTML(article, featured = false) {
  const slug = slugify(article.categorie);
  return `
    <article class="article-card ${featured ? "article-card--featured" : ""} cat-${slug}">
      <span class="tag tag-${slug}">${article.categorie}</span>
      <h2 class="article-card-title"><a href="article.html?id=${article.id}">${article.titre}</a></h2>
      <p class="article-card-resume">${article.resume}</p>
      <div class="article-card-meta">${article.auteur} · ${formaterDate(article.date)}</div>
      <a class="read-more" href="article.html?id=${article.id}">Lire l'article →</a>
    </article>`;
}

function carteEmploiHTML(offre, compact = false) {
  const slug = slugify(offre.type);
  const lieuTxt = offre.lieu ? ` · ${offre.lieu}` : "";
  const dateTxt = offre.dateLimite ? `Date limite : ${formaterDate(offre.dateLimite)}` : "";
  return `
    <article class="job-card ${compact ? "job-card--compact" : ""} type-${slug}">
      <span class="tag tag-${slug}">${offre.type}</span>
      <h3 class="job-card-title">${offre.titre}</h3>
      <div class="job-card-meta">${offre.organisation}${lieuTxt}</div>
      <p class="job-card-desc">${offre.description}</p>
      <div class="job-card-footer">
        <span class="job-deadline">${dateTxt}</span>
        <a class="read-more" href="${offre.lien}" target="_blank" rel="noopener">En savoir plus →</a>
      </div>
    </article>`;
}

/* ---------- En-tête / pied de page communs ---------- */

function initEnteteEtPied() {
  const dateEl = document.getElementById("today-date");
  if (dateEl) {
    const auj = new Date();
    dateEl.textContent = `${JOURS_FR[auj.getDay()]} ${auj.getDate()} ${MOIS_FR[auj.getMonth()]} ${auj.getFullYear()}`;
  }
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
}

/* ---------- Page d'accueil (index.html) ---------- */

function initAccueil() {
  const grille = document.getElementById("articles-grid");
  if (!grille) return; // on n'est pas sur la page d'accueil

  const tries = trierParDateDesc(articles);
  const [premier, ...reste] = tries;

  const zoneFeatured = document.getElementById("featured-article");
  if (zoneFeatured && premier) {
    zoneFeatured.innerHTML = carteArticleHTML(premier, true);
  }

  function afficher(categorie) {
    const filtres = categorie === "Tous" ? reste : reste.filter(a => a.categorie === categorie);
    grille.innerHTML = filtres.map(a => carteArticleHTML(a)).join("")
      || `<p class="empty-msg">Aucun article dans cette catégorie pour l'instant — revenez bientôt ou explorez une autre rubrique.</p>`;
  }

  const params = new URLSearchParams(window.location.search);
  const catInitiale = params.get("cat") || "Tous";

  const onglets = document.querySelectorAll(".filter-tab[data-cat]");
  onglets.forEach(onglet => {
    onglet.classList.toggle("active", onglet.dataset.cat === catInitiale);
    onglet.addEventListener("click", () => {
      onglets.forEach(o => o.classList.remove("active"));
      onglet.classList.add("active");
      afficher(onglet.dataset.cat);
    });
  });
  afficher(catInitiale);

  const apercu = document.getElementById("opportunites-apercu");
  if (apercu) {
    const dernieres = [...emplois].slice(0, 2);
    apercu.innerHTML = dernieres.map(o => carteEmploiHTML(o, true)).join("")
      || `<p class="empty-msg">Aucune offre publiée pour le moment.</p>`;
  }
}

/* ---------- Page article (article.html) ---------- */

function initArticlePage() {
  const zone = document.getElementById("article-content");
  if (!zone) return;

  const params = new URLSearchParams(window.location.search);
  const id = Number(params.get("id"));
  const article = articles.find(a => a.id === id);

  if (!article) {
    zone.innerHTML = `
      <div class="article-not-found">
        <h1>Article introuvable</h1>
        <p>L'article que vous cherchez n'existe pas ou a été déplacé.</p>
        <a class="btn btn-primary" href="index.html">← Retour à l'accueil</a>
      </div>`;
    document.title = "Article introuvable — Educa-Psy";
    return;
  }

  document.title = `${article.titre} — Educa-Psy`;
  const slug = slugify(article.categorie);

  zone.innerHTML = `
    <a class="back-link" href="index.html">← Retour à l'accueil</a>
    <span class="tag tag-${slug}">${article.categorie}</span>
    <h1 class="article-title">${article.titre}</h1>
    <div class="article-meta">Par ${article.auteur} · ${formaterDate(article.date)}</div>
    <div class="article-body">${article.contenu.map(p => `<p>${p}</p>`).join("")}</div>`;

  const zoneSimilaires = document.getElementById("articles-similaires");
  if (zoneSimilaires) {
    const similaires = articles.filter(a => a.categorie === article.categorie && a.id !== article.id).slice(0, 2);
    if (similaires.length) {
      zoneSimilaires.innerHTML = `
        <h3>Articles similaires</h3>
        <div class="articles-grid articles-grid--compact">
          ${similaires.map(a => carteArticleHTML(a)).join("")}
        </div>`;
    }
  }
}

/* ---------- Page emplois (emplois.html) ---------- */

function initEmploisPage() {
  const grille = document.getElementById("emplois-grid");
  if (!grille) return;

  function afficher(type) {
    const filtres = type === "Tous" ? emplois : emplois.filter(o => o.type === type);
    grille.innerHTML = filtres.map(o => carteEmploiHTML(o)).join("")
      || `<p class="empty-msg">Aucune offre dans cette catégorie pour l'instant — consultez les autres catégories ou revenez bientôt.</p>`;
  }

  const onglets = document.querySelectorAll(".filter-tab[data-type]");
  onglets.forEach(onglet => {
    onglet.addEventListener("click", () => {
      onglets.forEach(o => o.classList.remove("active"));
      onglet.classList.add("active");
      afficher(onglet.dataset.type);
    });
  });
  afficher("Tous");
}

/* ---------- Lancement ---------- */

document.addEventListener("DOMContentLoaded", () => {
  initEnteteEtPied();
  initAccueil();
  initArticlePage();
  initEmploisPage();
});

