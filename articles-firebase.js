/* ============================================================
   EDUCA-PSY — articles-firebase.js
   ============================================================
   Optimisé pour la VITESSE à l'échelle actuelle (~50 articles) :
   un seul chargement Firestore (orderBy simple, sans filtre —
   donc aucun index composite requis), mis en cache en mémoire.
   Ensuite, filtrage par catégorie, recherche et pagination sont
   100% instantanés côté client, sans aucun aller-retour réseau
   supplémentaire.

   Si le volume d'articles grossit significativement plus tard
   (plusieurs centaines), cette approche « tout en mémoire »
   redeviendra limitante — on pourra alors repasser à des requêtes
   Firestore paginées ciblées (cette approche a déjà été codée
   dans une version précédente et peut être réappliquée).
   ============================================================ */

import { db } from "./firebase-config.js";
import {
  collection, getDocs, doc, getDoc, query, orderBy
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";

const MOIS_FR = ["janvier","février","mars","avril","mai","juin","juillet",
                  "août","septembre","octobre","novembre","décembre"];

const NB_RECENTS_ACCUEIL = 3;   // articles récents affichés sur l'accueil
const TAILLE_PAGE_ARTICLES = 9; // articles par page sur articles.html

let cacheArticles = null;
let promesseChargement = null;

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
   utilisé pour les classes CSS de couleur (tag-*, cat-*). */
const CATEGORIES_SLUGS_COURTS = {
  "education": "education",
  "psychologie": "psychologie",
  "bien-etre et sante mentale": "bien-etre",
  "emotions": "emotions",
  "sante mentale et soutien psychosocial": "sante-mentale",
  "sante mentale et soutien psychosociale": "sante-mentale"
};

function slugifyCategorie(categorie) {
  if (!categorie) return "";
  const cleNormalisee = retirerAccents(categorie.toLowerCase()).trim();
  if (CATEGORIES_SLUGS_COURTS[cleNormalisee]) {
    return CATEGORIES_SLUGS_COURTS[cleNormalisee];
  }
  return slugify(categorie);
}

function normaliserCategorie(cat) {
  if (!cat) return "";
  let norm = retirerAccents(cat.toLowerCase().trim());
  if (norm.endsWith("soutien psychosociale")) {
    norm = norm.slice(0, -1);
  }
  return norm;
}

function correspondCategorie(catArticle, catFiltre) {
  if (!catFiltre || catFiltre === "Tous") return true;
  return normaliserCategorie(catArticle) === normaliserCategorie(catFiltre);
}

function obtenirImageArticle(article) {
  if (article && article.image && typeof article.image === "string" && article.image.trim()) {
    return article.image.trim();
  }
  const titre = ((article && article.titre) || "").toLowerCase();
  if (titre.includes("fanm") || titre.includes("genre") || titre.includes("violence") || titre.includes("femme") || titre.includes("grand-goave")) {
    return "images/Fanm.webp";
  }
  if (titre.includes("gpt") || titre.includes("astra") || titre.includes("ia") || titre.includes("intelligence artificielle") || titre.includes("affective") || titre.includes("dependance")) {
    return "images/image2.webp";
  }
  if (titre.includes("kenscoff") || titre.includes("crise") || titre.includes("massacre") || titre.includes("etat")) {
    return "images/Droit.webp";
  }
  if (titre.includes("rentree") || titre.includes("scolaire") || titre.includes("ecole")) {
    return "images/Ecole.webp";
  }

  // Fallback par catégorie
  const slug = slugifyCategorie((article && article.categorie) || "");
  if (slug === "education") return "images/Ecole.webp";
  if (slug === "psychologie" || slug === "bien-etre" || slug === "sante-mentale") return "images/image2.webp";
  if (slug === "emotions") return "images/Genre1.webp";

  return "images/logo.webp";
}

function calculerTempsLecture(contenuArray) {
  if (!contenuArray || !contenuArray.length) return "1 min de lecture";
  const texteTotal = contenuArray.join(" ");
  const mots = texteTotal.trim().split(/\s+/).length;
  const minutes = Math.max(1, Math.ceil(mots / 200));
  return `${minutes} min de lecture`;
}

/* ---------- Carousel d'images ---------- */

let compteurCarousel = 0;

function formaterCarousel(texte) {
  if (!texte) return "";
  const images = [];
  const regex = /!\[([^\]]*)\]\((https?:\/\/[^\s)]+)\)/g;
  let m;
  while ((m = regex.exec(texte)) !== null) {
    images.push({ alt: m[1] || "", url: m[2] });
  }
  if (!images.length) return "";

  const id = `carousel-${compteurCarousel++}`;
  const slides = images.map((img, i) =>
    `<div class="carousel-slide ${i === 0 ? "active" : ""}">
       <img src="${img.url}" alt="${img.alt}" loading="lazy" onerror="this.onerror=null;this.src='images/logo.webp'">
       ${img.alt ? `<figcaption class="carousel-caption">${img.alt}</figcaption>` : ""}
     </div>`).join("");
  const dots = images.length > 1 ? images.map((_, i) =>
    `<button type="button" class="carousel-dot ${i === 0 ? "active" : ""}"
       data-index="${i}" aria-label="Image ${i + 1}"></button>`).join("") : "";
  const navs = images.length > 1 ? `
      <button type="button" class="carousel-nav prev" aria-label="Image précédente">‹</button>
      <button type="button" class="carousel-nav next" aria-label="Image suivante">›</button>` : "";

  return `
    <div class="article-carousel" id="${id}" data-index="0" data-total="${images.length}">
      <div class="carousel-track">${slides}</div>${navs}
      <div class="carousel-dots">${dots}</div>
    </div>`;
}

function initCarousels(racine) {
  const conteneur = racine || document;
  conteneur.querySelectorAll(".article-carousel").forEach(carousel => {
    if (carousel.dataset.init) return;
    carousel.dataset.init = "1";

    const total = parseInt(carousel.dataset.total, 10);
    const track = carousel.querySelector(".carousel-track");
    const dots = carousel.querySelectorAll(".carousel-dot");
    const btnPrev = carousel.querySelector(".carousel-nav.prev");
    const btnNext = carousel.querySelector(".carousel-nav.next");

    function afficherSlide(index) {
      carousel.dataset.index = index;
      track.style.transform = `translateX(-${index * 100}%)`;
      dots.forEach((d, i) => d.classList.toggle("active", i === index));
    }

    if (btnPrev) {
      btnPrev.addEventListener("click", () => {
        const i = (parseInt(carousel.dataset.index, 10) - 1 + total) % total;
        afficherSlide(i);
      });
    }
    if (btnNext) {
      btnNext.addEventListener("click", () => {
        const i = (parseInt(carousel.dataset.index, 10) + 1) % total;
        afficherSlide(i);
      });
    }
    dots.forEach(dot => {
      dot.addEventListener("click", () => afficherSlide(parseInt(dot.dataset.index, 10)));
    });
  });
}

function parserSources(texte) {
  if (!texte) return null;
  const estSources = (
    texte.includes("Sources et liens utiles") ||
    texte.includes("**Sources :**") ||
    texte.startsWith("Sources :")
  );
  if (!estSources) return null;

  // Cas 1 : Liens markdown du type "- [Titre](url)" ou "[Titre](url)"
  const regexLiens = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g;
  const liens = [];
  let m;
  while ((m = regexLiens.exec(texte)) !== null) {
    liens.push({ titre: m[1], url: m[2] });
  }

  // Cas 2 : Numérotation du type "[1] ... [2] ... [3] ..."
  const regexNumerote = /\[(\d+)\]\s*([^\[]+)/g;
  const numerotes = [];
  let n;
  while ((n = regexNumerote.exec(texte)) !== null) {
    numerotes.push({ num: n[1], texte: n[2].trim() });
  }

  const iconeLien = `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>`;
  const iconeLivre = `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>`;

  if (liens.length > 0) {
    const itemsHtml = liens.map(l =>
      `<li><a href="${l.url}" target="_blank" rel="noopener" class="source-link"><span class="source-icon">↗</span><span class="source-text">${l.titre}</span></a></li>`
    ).join("");
    return `
      <div class="article-sources-box">
        <div class="sources-header">
          ${iconeLien}
          <h3 class="sources-title">Sources et liens utiles</h3>
        </div>
        <ul class="article-sources-links">${itemsHtml}</ul>
      </div>`;
  }

  if (numerotes.length > 0) {
    const itemsHtml = numerotes.map(item =>
      `<li><span class="source-num">[${item.num}]</span> <span class="source-text">${item.texte}</span></li>`
    ).join("");
    return `
      <div class="article-sources-box">
        <div class="sources-header">
          ${iconeLivre}
          <h3 class="sources-title">Sources et références documentaires</h3>
        </div>
        <ol class="article-sources-numbered">${itemsHtml}</ol>
      </div>`;
  }

  return null;
}

function formaterEnrichissementsEnLigne(texte) {
  if (!texte) return "";
  return texte
    .replace(/!\[([^\]]*)\]\((https?:\/\/[^\s)]+)\)/g, '<figure class="article-inline-figure"><img src="$2" alt="$1" loading="lazy" class="article-inline-image" onerror="this.onerror=null;this.src=\'images/logo.webp\'"><figcaption class="article-inline-caption">$1</figcaption></figure>')
    .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener" class="article-link">$1 <span class="ext-icon" aria-hidden="true">↗</span></a>')
    .replace(/\*\*\s*([^*]+?)\s*\*\*/g, '<strong>$1</strong>')
    .replace(/==([^=]+)==/g, '<mark class="article-highlight">$1</mark>');
}

function rendreContenuArticle(contenu) {
  if (!contenu || !contenu.length) {
    return "<p><em>Cet article n'a pas encore de contenu.</em></p>";
  }

  const blocs = [];
  let bufferListe = [];

  function viderListe() {
    if (bufferListe.length) {
      const lis = bufferListe.map(item => `<li>${formaterEnrichissementsEnLigne(item)}</li>`).join("");
      blocs.push(`<ul class="article-list">${lis}</ul>`);
      bufferListe = [];
    }
  }

  for (let i = 0; i < contenu.length; i++) {
    const brut = contenu[i];
    if (typeof brut !== "string") continue;
    let t = brut.trim();
    if (!t) continue;

    // Normalisation précoce des listes malformées type "** **Texte : **" ou "*** Texte : **"
    if (/^\*\*\s+\*\*/.test(t)) {
      t = "* **" + t.replace(/^\*\*\s+\*\*/, "");
    } else if (/^\*\*\*\s+/.test(t)) {
      t = "* **" + t.replace(/^\*\*\*\s+/, "");
    }

    // 1. Carousel
    if (t.startsWith("!carousel")) {
      viderListe();
      blocs.push(formaterCarousel(t));
      continue;
    }

    // 2. Vidéo YouTube
    if (t.startsWith("![youtube](")) {
      viderListe();
      const match = t.match(/!\[youtube\]\((https?:\/\/(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([^\s)]+))\)/);
      if (match && match[2]) {
        const cleanId = match[2].split("?")[0].split("&")[0];
        blocs.push(`<div class="video-container"><iframe src="https://www.youtube-nocookie.com/embed/${cleanId}" title="Vidéo YouTube" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen loading="lazy"></iframe></div>`);
      }
      continue;
    }

    // 3. Image figure autonome
    const imageSeuleMatch = t.match(/^!\[([^\]]*)\]\((https?:\/\/[^\s)]+)\)$/);
    if (imageSeuleMatch) {
      viderListe();
      const alt = imageSeuleMatch[1] || "";
      const url = imageSeuleMatch[2];
      blocs.push(`<figure class="article-inline-figure"><img src="${url}" alt="${alt}" loading="lazy" class="article-inline-image" onerror="this.onerror=null;this.src='images/logo.webp'">${alt ? `<figcaption class="article-inline-caption">${alt}</figcaption>` : ""}</figure>`);
      continue;
    }

    // 4. Sources et références (blocs spéciaux souvent agglomérés)
    const sourcesHtml = parserSources(t);
    if (sourcesHtml) {
      viderListe();
      blocs.push(sourcesHtml);
      continue;
    }

    // 5. Titre de section ##
    if (t.startsWith("## ")) {
      viderListe();
      const titreSousSection = t.replace(/^##\s*/, "").trim();
      blocs.push(`<h2 class="article-subtitle">${titreSousSection}</h2>`);
      continue;
    }

    // 6. Sous-titre ###
    if (t.startsWith("### ")) {
      viderListe();
      const titreSousSection = t.replace(/^###\s*/, "").trim();
      blocs.push(`<h3 class="article-subtitle-h3">${titreSousSection}</h3>`);
      continue;
    }

    // 7. Citation blockquote >
    if (t.startsWith("> ")) {
      viderListe();
      const citation = t.replace(/^>\s*/, "").trim();
      blocs.push(`<blockquote class="article-quote">${formaterEnrichissementsEnLigne(citation)}</blockquote>`);
      continue;
    }

    // 8. Éléments de liste à puces (grouper les consécutifs dans un seul <ul>)
    if (t.startsWith("* ") || t.startsWith("- ") || t.startsWith("• ")) {
      const lignes = t.split("\n");
      lignes.forEach(l => {
        const itemPropre = l.replace(/^[\*\-•]\s+/, "").trim();
        if (itemPropre) bufferListe.push(itemPropre);
      });
      continue;
    }

    // 9. Paragraphe standard
    viderListe();
    blocs.push(`<p>${formaterEnrichissementsEnLigne(t)}</p>`);
  }

  viderListe();
  return blocs.join("\n");
}

/* Génère une pagination numérotée classique (saut direct possible
   vers n'importe quelle page, puisque tout est déjà en mémoire). */
function genererPaginationHTML(pageActuelle, totalPages) {
  if (totalPages <= 1) return "";
  let boutons = `<button type="button" class="pagination-btn" data-page="prev" ${pageActuelle === 1 ? "disabled" : ""} aria-label="Page précédente">‹</button>`;
  for (let i = 1; i <= totalPages; i++) {
    boutons += `<button type="button" class="pagination-btn ${i === pageActuelle ? "active" : ""}" data-page="${i}">${i}</button>`;
  }
  boutons += `<button type="button" class="pagination-btn" data-page="next" ${pageActuelle === totalPages ? "disabled" : ""} aria-label="Page suivante">›</button>`;
  return `<nav class="pagination" aria-label="Pagination des articles">${boutons}</nav>`;
}

/* ---------- Accès Firestore (Hybride SDK + Secours REST) ---------- */

function parserDocumentFirestoreRest(doc) {
  if (!doc) return null;
  const id = doc.name ? doc.name.split("/").pop() : "";
  const data = { id };
  if (doc.fields) {
    for (const [cle, val] of Object.entries(doc.fields)) {
      if (val.stringValue !== undefined) data[cle] = val.stringValue;
      else if (val.booleanValue !== undefined) data[cle] = val.booleanValue;
      else if (val.integerValue !== undefined) data[cle] = parseInt(val.integerValue, 10);
      else if (val.doubleValue !== undefined) data[cle] = parseFloat(val.doubleValue);
      else if (val.timestampValue !== undefined) data[cle] = val.timestampValue;
      else if (val.arrayValue !== undefined) {
        data[cle] = (val.arrayValue.values || []).map(v => v.stringValue ?? v.integerValue ?? v);
      } else if (val.nullValue !== undefined) {
        data[cle] = null;
      } else {
        data[cle] = val;
      }
    }
  }
  return data;
}

async function chargerArticlesViaRest() {
  try {
    const res = await fetch("https://firestore.googleapis.com/v1/projects/educa-psy/databases/(default)/documents/articles");
    if (!res.ok) return null;
    const json = await res.json();
    if (!json.documents || !Array.isArray(json.documents)) return [];
    const liste = json.documents.map(parserDocumentFirestoreRest).filter(Boolean);
    liste.sort((a, b) => {
      const da = new Date(a.date || 0).getTime();
      const db = new Date(b.date || 0).getTime();
      return db - da;
    });
    return liste;
  } catch (e) {
    return null;
  }
}

async function chargerArticleParIdViaRest(id) {
  try {
    const res = await fetch(`https://firestore.googleapis.com/v1/projects/educa-psy/databases/(default)/documents/articles/${encodeURIComponent(id)}`);
    if (!res.ok) return null;
    const json = await res.json();
    return parserDocumentFirestoreRest(json);
  } catch (e) {
    return null;
  }
}

/* Un seul chargement, mis en cache pour le reste de la session.
   Avec course ultra-rapide entre l'API REST HTTP (~130ms) et le SDK Firestore,
   garantissant un affichage instantané et éliminant tout blocage ou écran vide. */
export async function chargerArticles() {
  if (cacheArticles && cacheArticles.length > 0) return cacheArticles;
  if (!promesseChargement) {
    promesseChargement = (async () => {
      // 1. Tente REST et SDK en parallèle (avec timeout court sur SDK pour ne pas bloquer)
      const promesseRest = chargerArticlesViaRest();
      const promesseSdk = (async () => {
        try {
          const q = query(collection(db, "articles"), orderBy("date", "desc"));
          const snap = await Promise.race([
            getDocs(q),
            new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout SDK")), 1000))
          ]);
          return snap.docs.map(d => ({ id: d.id, ...d.data() }));
        } catch (_) {
          return null;
        }
      })();

      try {
        const premierResultat = await Promise.race([
          promesseRest.then(res => (res && res.length > 0 ? res : Promise.reject())),
          promesseSdk.then(res => (res && res.length > 0 ? res : Promise.reject()))
        ]);
        if (premierResultat && premierResultat.length > 0) {
          cacheArticles = premierResultat;
          // Hydrate discrètement en arrière-plan si le SDK termine ensuite
          promesseSdk.then(docs => {
            if (docs && docs.length > 0) cacheArticles = docs;
          }).catch(() => {});
          return cacheArticles;
        }
      } catch (_) {}

      // Secours direct si la course n'a pas répondu
      const secours = await promesseRest;
      if (secours && secours.length > 0) {
        cacheArticles = secours;
        return cacheArticles;
      }

      // Dernier recours via SDK
      try {
        const q = query(collection(db, "articles"), orderBy("date", "desc"));
        const snap = await getDocs(q);
        cacheArticles = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        return cacheArticles;
      } catch (err) {
        promesseChargement = null;
        throw err;
      }
    })();
  }
  return promesseChargement.catch(err => {
    promesseChargement = null;
    throw err;
  });
}

export async function chargerArticleParId(id) {
  if (cacheArticles) {
    const trouve = cacheArticles.find(a => a.id === id);
    if (trouve) return trouve;
  }
  // Course rapide entre le REST direct (~100ms) et le SDK
  try {
    const promesseRest = chargerArticleParIdViaRest(id);
    const promesseSdk = (async () => {
      try {
        const ref = doc(db, "articles", id);
        const snap = await Promise.race([
          getDoc(ref),
          new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout SDK")), 1000))
        ]);
        if (snap.exists()) return { id: snap.id, ...snap.data() };
      } catch (_) {}
      return null;
    })();

    const trouve = await Promise.race([
      promesseRest.then(r => (r ? r : Promise.reject())),
      promesseSdk.then(r => (r ? r : Promise.reject()))
    ]).catch(() => null);

    if (trouve) return trouve;
    const secours = await promesseRest;
    if (secours) return secours;
  } catch (err) {}

  return await chargerArticleParIdViaRest(id);
}

async function chargerArticlesSimilaires(categorie, idAExclure, max = 2) {
  const tous = await chargerArticles();
  if (!tous || !tous.length) return [];
  const memesCat = tous.filter(a => a.id !== idAExclure && correspondCategorie(a.categorie, categorie));
  if (memesCat.length >= max) return memesCat.slice(0, max);
  const autres = tous.filter(a => a.id !== idAExclure && !memesCat.some(m => m.id === a.id));
  return [...memesCat, ...autres].slice(0, max);
}

/* Squelette d'une carte d'article, affiché pendant le chargement
   pour un rendu plus soigné qu'un simple texte "Chargement…". */
function squeletteCarteHTML() {
  return `
    <div class="article-card squelette-carte" aria-hidden="true">
      <div class="squelette squelette-image"></div>
      <div class="squelette squelette-ligne tag"></div>
      <div class="squelette squelette-ligne titre"></div>
      <div class="squelette squelette-ligne"></div>
      <div class="squelette squelette-ligne court"></div>
    </div>`;
}

function squelettesGrilleHTML(n = 6) {
  return Array.from({ length: n }).map(squeletteCarteHTML).join("");
}

/* Squelette de la page d'un article (titre, méta, image, paragraphes). */
function squeletteArticlePageHTML() {
  return `
    <div class="squelette-article-page" aria-hidden="true">
      <div class="squelette squelette-breadcrumb"></div>
      <div class="squelette squelette-ligne tag"></div>
      <div class="squelette squelette-titre-page"></div>
      <div class="squelette squelette-meta"></div>
      <div class="squelette squelette-image-hero"></div>
      <div class="squelette squelette-paragraphe"></div>
      <div class="squelette squelette-paragraphe"></div>
      <div class="squelette squelette-paragraphe court"></div>
    </div>`;
}

/* ---------- Composants de navigation Fil d'Ariane (Breadcrumbs) ---------- */

function genererFilArianeArticleHTML(article, titre) {
  const labelAccueil = window.EducaPsyI18n ? window.EducaPsyI18n.texte("nav_accueil") : "Accueil";
  const labelArticles = window.EducaPsyI18n ? window.EducaPsyI18n.texte("nav_articles") : "Articles";
  const labelFilAriane = window.EducaPsyI18n ? window.EducaPsyI18n.texte("breadcrumb_label") : "Fil d'Ariane";
  const titreTexte = titre || article.titre || "";
  const categorie = (article.categorie || "").trim();
  const siteUrl = "https://educa-psy.web.app";
  const urlActuelle = typeof window !== "undefined" ? window.location.href : `${siteUrl}/article.html?id=${article.id}`;

  const chevronSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="9 18 15 12 9 6"></polyline></svg>`;

  let position = 1;
  let itemsHtml = `
    <li class="breadcrumb-item" itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">
      <a class="breadcrumb-link" href="index.html" itemprop="item">
        <span itemprop="name" data-i18n="nav_accueil">${labelAccueil}</span>
      </a>
      <meta itemprop="position" content="${position++}">
    </li>
    <li class="breadcrumb-separator" aria-hidden="true">${chevronSvg}</li>
    <li class="breadcrumb-item" itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">
      <a class="breadcrumb-link" href="articles.html" itemprop="item">
        <span itemprop="name" data-i18n="nav_articles">${labelArticles}</span>
      </a>
      <meta itemprop="position" content="${position++}">
    </li>`;

  if (categorie) {
    itemsHtml += `
    <li class="breadcrumb-separator" aria-hidden="true">${chevronSvg}</li>
    <li class="breadcrumb-item" itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">
      <a class="breadcrumb-link" href="articles.html?cat=${encodeURIComponent(categorie)}" itemprop="item">
        <span itemprop="name">${categorie}</span>
      </a>
      <meta itemprop="position" content="${position++}">
    </li>`;
  }

  const titreEchappeAttr = titreTexte.replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const titreEchappeContenu = titreTexte.replace(/</g, "&lt;").replace(/>/g, "&gt;");

  itemsHtml += `
    <li class="breadcrumb-separator" aria-hidden="true">${chevronSvg}</li>
    <li class="breadcrumb-item current" itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem" aria-current="page">
      <span class="breadcrumb-current" itemprop="name" title="${titreEchappeAttr}">${titreEchappeContenu}</span>
      <link itemprop="item" href="${urlActuelle}">
      <meta itemprop="position" content="${position}">
    </li>`;

  return `
    <nav class="breadcrumb-nav" aria-label="${labelFilAriane}">
      <ol class="breadcrumb-list" itemscope itemtype="https://schema.org/BreadcrumbList">
        ${itemsHtml}
      </ol>
    </nav>`;
}

function mettreAJourFilArianeArticles(catActuelle) {
  const container = document.getElementById("breadcrumb-articles-container");
  if (!container) return;

  const labelAccueil = window.EducaPsyI18n ? window.EducaPsyI18n.texte("nav_accueil") : "Accueil";
  const labelArticles = window.EducaPsyI18n ? window.EducaPsyI18n.texte("nav_articles") : "Articles";
  const labelFilAriane = window.EducaPsyI18n ? window.EducaPsyI18n.texte("breadcrumb_label") : "Fil d'Ariane";
  const siteUrl = "https://educa-psy.web.app";
  const chevronSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="9 18 15 12 9 6"></polyline></svg>`;

  let itemsHtml = `
    <li class="breadcrumb-item" itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">
      <a class="breadcrumb-link" href="index.html" itemprop="item">
        <span itemprop="name" data-i18n="nav_accueil">${labelAccueil}</span>
      </a>
      <meta itemprop="position" content="1">
    </li>
    <li class="breadcrumb-separator" aria-hidden="true">${chevronSvg}</li>`;

  const estFiltreCat = catActuelle && catActuelle !== "Tous";

  if (!estFiltreCat) {
    itemsHtml += `
    <li class="breadcrumb-item current" itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem" aria-current="page">
      <span class="breadcrumb-current" itemprop="name" data-i18n="nav_articles">${labelArticles}</span>
      <link itemprop="item" href="${siteUrl}/articles.html">
      <meta itemprop="position" content="2">
    </li>`;
  } else {
    itemsHtml += `
    <li class="breadcrumb-item" itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">
      <a class="breadcrumb-link" href="articles.html" itemprop="item">
        <span itemprop="name" data-i18n="nav_articles">${labelArticles}</span>
      </a>
      <meta itemprop="position" content="2">
    </li>
    <li class="breadcrumb-separator" aria-hidden="true">${chevronSvg}</li>
    <li class="breadcrumb-item current" itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem" aria-current="page">
      <span class="breadcrumb-current" itemprop="name">${catActuelle}</span>
      <link itemprop="item" href="${siteUrl}/articles.html?cat=${encodeURIComponent(catActuelle)}">
      <meta itemprop="position" content="3">
    </li>`;
  }

  container.innerHTML = `
    <ol class="breadcrumb-list" itemscope itemtype="https://schema.org/BreadcrumbList">
      ${itemsHtml}
    </ol>`;

  // Schema.org BreadcrumbList pour la page liste
  const ancien = document.getElementById("jsonld-breadcrumbs-liste");
  if (ancien) ancien.remove();

  const script = document.createElement("script");
  script.type = "application/ld+json";
  script.id = "jsonld-breadcrumbs-liste";

  const breadcrumbElements = [
    { "@type": "ListItem", "position": 1, "name": "Accueil", "item": `${siteUrl}/` },
    { "@type": "ListItem", "position": 2, "name": "Articles", "item": `${siteUrl}/articles.html` }
  ];
  if (estFiltreCat) {
    breadcrumbElements.push({
      "@type": "ListItem",
      "position": 3,
      "name": catActuelle,
      "item": `${siteUrl}/articles.html?cat=${encodeURIComponent(catActuelle)}`
    });
  }

  script.textContent = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbElements
  });
  document.head.appendChild(script);
}

/* ---------- Gabarits HTML ---------- */

function carteArticleHTML(article, featured = false) {
  const langue = localStorage.getItem("educapsy-langue") || "fr";
  const slug = slugifyCategorie(article.categorie || "");
  const titre = champLocale(article, "titre", langue);
  const resume = champLocale(article, "resume", langue);
  const imageUrl = obtenirImageArticle(article);
  const image = imageUrl ? `
    <a href="article.html?id=${article.id}" class="article-card-media" aria-label="${titre || ''}">
      <img class="article-card-image" src="${imageUrl}" alt="${titre || ''}" loading="lazy" onerror="this.onerror=null;this.src='images/logo.webp'">
    </a>` : "";
  return `
    <article class="article-card ${featured ? "article-card--featured" : ""} cat-${slug}">
      ${image}
      <span class="tag tag-${slug}">${article.categorie || ""}</span>
      <h2 class="article-card-title"><a href="article.html?id=${article.id}">${titre || "(sans titre)"}</a></h2>
      <p class="article-card-resume">${resume || ""}</p>
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
    zoneFeatured.innerHTML = squeletteCarteHTML();
  }
  zoneRecents.innerHTML = squelettesGrilleHTML(NB_RECENTS_ACCUEIL);

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

/* ---------- Page articles.html (liste complète, pagination instantanée) ---------- */

async function initArticlesListePage() {
  const grille = document.getElementById("articles-grid");
  if (!grille) return; // pas sur la page articles.html

  grille.innerHTML = squelettesGrilleHTML(TAILLE_PAGE_ARTICLES);

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
  let pageActuelle = 1;

  function zonePagination() {
    let zone = document.getElementById("pagination-articles");
    if (!zone) {
      zone = document.createElement("div");
      zone.id = "pagination-articles";
      grille.insertAdjacentElement("afterend", zone);
    }
    return zone;
  }

  function afficher() {
    mettreAJourFilArianeArticles(catActuelle);
    let filtres = correspondCategorie("Tous", catActuelle) || catActuelle === "Tous"
      ? tous
      : tous.filter(a => correspondCategorie(a.categorie, catActuelle));

    if (rechercheActuelle) {
      const q = retirerAccents(rechercheActuelle.toLowerCase());
      filtres = filtres.filter(a =>
        retirerAccents((a.titre || "").toLowerCase()).includes(q) ||
        retirerAccents((a.resume || "").toLowerCase()).includes(q));
    }

    const totalPages = Math.max(1, Math.ceil(filtres.length / TAILLE_PAGE_ARTICLES));
    if (pageActuelle > totalPages) pageActuelle = totalPages;

    const debut = (pageActuelle - 1) * TAILLE_PAGE_ARTICLES;
    const visibles = filtres.slice(debut, debut + TAILLE_PAGE_ARTICLES);

    grille.innerHTML = visibles.map(a => carteArticleHTML(a)).join("")
      || `<p class="empty-msg">Aucun article ne correspond pour l'instant — essayez une autre recherche ou une autre rubrique.</p>`;

    zonePagination().innerHTML = genererPaginationHTML(pageActuelle, totalPages);
    zonePagination().querySelectorAll(".pagination-btn").forEach(bouton => {
      bouton.addEventListener("click", () => {
        const val = bouton.dataset.page;
        if (val === "prev") pageActuelle = Math.max(1, pageActuelle - 1);
        else if (val === "next") pageActuelle = Math.min(totalPages, pageActuelle + 1);
        else pageActuelle = parseInt(val, 10);
        afficher();
        grille.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });
  }

  const onglets = document.querySelectorAll(".filter-tab[data-cat]");
  onglets.forEach(onglet => {
    onglet.classList.toggle("active", correspondCategorie(onglet.dataset.cat, catActuelle));
    onglet.addEventListener("click", () => {
      onglets.forEach(o => o.classList.remove("active"));
      onglet.classList.add("active");
      catActuelle = onglet.dataset.cat;
      pageActuelle = 1;
      const url = new URL(window.location.href);
      if (catActuelle === "Tous") url.searchParams.delete("cat");
      else url.searchParams.set("cat", catActuelle);
      window.history.replaceState({}, "", url);
      afficher();
    });
  });

  const champRecherche = document.getElementById("recherche-articles");
  if (champRecherche) {
    if (rechercheActuelle) {
      champRecherche.value = rechercheActuelle;
    }
    champRecherche.addEventListener("input", () => {
      rechercheActuelle = champRecherche.value.trim();
      pageActuelle = 1;
      afficher();
    });

    if (window.location.hash === "#recherche-articles" || rechercheActuelle) {
      setTimeout(() => {
        champRecherche.focus();
        champRecherche.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 150);
    }
  }

  afficher();
}

/* ---------- Optimisations SEO, Open Graph & Schema NewsArticle ---------- */

function mettreAJourMetaTags(article, titre, resume) {
  const urlParams = new URLSearchParams(window.location.search);
  const id = urlParams.get("id") || article.id || "";
  const urlArticle = id
    ? `https://educa-psy.web.app/article.html?id=${encodeURIComponent(id)}`
    : `https://educa-psy.web.app/article.html`;
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
  const siteUrl = "https://educa-psy.web.app";
  const urlArticle = window.location.href;
  const categorie = (article.categorie || "").trim();

  const breadcrumbElements = [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Accueil",
      "item": `${siteUrl}/`
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Articles",
      "item": `${siteUrl}/articles.html`
    }
  ];

  if (categorie) {
    breadcrumbElements.push({
      "@type": "ListItem",
      "position": 3,
      "name": categorie,
      "item": `${siteUrl}/articles.html?cat=${encodeURIComponent(categorie)}`
    });
    breadcrumbElements.push({
      "@type": "ListItem",
      "position": 4,
      "name": titre || article.titre || "",
      "item": urlArticle
    });
  } else {
    breadcrumbElements.push({
      "@type": "ListItem",
      "position": 3,
      "name": titre || article.titre || "",
      "item": urlArticle
    });
  }

  const script = document.createElement("script");
  script.type = "application/ld+json";
  script.id = "jsonld-article";

  script.textContent = JSON.stringify({
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "NewsArticle",
        "mainEntityOfPage": {
          "@type": "WebPage",
          "@id": urlArticle
        },
        "headline": titre || article.titre || "",
        "description": resume || article.resume || "",
        "image": article.image ? [article.image] : [`${siteUrl}/og-image.png`],
        "datePublished": dateIso,
        "dateModified": article.dateModif ? new Date(article.dateModif).toISOString() : dateIso,
        "author": [{
          "@type": "Person",
          "name": article.auteur || "Équipe Educa-Psy",
          "url": `${siteUrl}/a-propos.html`
        }],
        "publisher": {
          "@type": "Organization",
          "name": "Educa-Psy",
          "url": `${siteUrl}/`,
          "logo": {
            "@type": "ImageObject",
            "url": `${siteUrl}/logo.svg`
          }
        }
      },
      {
        "@type": "BreadcrumbList",
        "itemListElement": breadcrumbElements
      }
    ]
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
    zone.innerHTML = squeletteArticlePageHTML();
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

  let contenu = [];
  const brut = article[`contenu_${langue}`] || article.contenu;
  if (Array.isArray(brut)) {
    contenu = brut;
  } else if (typeof brut === "string" && brut.trim()) {
    contenu = brut.split(/\n\s*\n/).map(s => s.trim()).filter(Boolean);
  }

  const tempsLecture = calculerTempsLecture(contenu);

  const imageUrl = obtenirImageArticle(article);
  const imageHero = imageUrl
    ? `<figure class="article-hero">
        <img class="article-image" src="${imageUrl}" alt="${titre || ""}" fetchpriority="high" onerror="this.onerror=null;this.src='images/logo.webp'">
       </figure>`
    : "";

  const dateObj = article.date && article.date.toDate ? article.date.toDate() : new Date(article.date);
  const dateIso = !isNaN(dateObj.getTime()) ? dateObj.toISOString() : "";
  const filArianeHtml = genererFilArianeArticleHTML(article, titre);
  const urlPage = window.location.href;
  const titreShare = titre || article.titre || "Educa-Psy";
  const urlEncodee = encodeURIComponent(urlPage);
  const texteEncode = encodeURIComponent(`${titreShare} — Educa-Psy`);

  const shareSectionHtml = `
    <div class="article-share-section">
      <span class="share-label">Partager cet article :</span>
      <div class="share-buttons-group">
        <a class="share-action-btn share-whatsapp" href="https://api.whatsapp.com/send?text=${texteEncode}%20${urlEncodee}" target="_blank" rel="noopener" aria-label="Partager sur WhatsApp">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg>
          WhatsApp
        </a>
        <a class="share-action-btn share-facebook" href="https://www.facebook.com/sharer/sharer.php?u=${urlEncodee}" target="_blank" rel="noopener" aria-label="Partager sur Facebook">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
          Facebook
        </a>
        <a class="share-action-btn share-x" href="https://x.com/intent/tweet?text=${texteEncode}&url=${urlEncodee}&via=educapsyhaiti" target="_blank" rel="noopener" aria-label="Partager sur X">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
          X
        </a>
        <a class="share-action-btn share-linkedin" href="https://www.linkedin.com/sharing/share-offsite/?url=${urlEncodee}" target="_blank" rel="noopener" aria-label="Partager sur LinkedIn">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
          LinkedIn
        </a>
        <button type="button" class="share-action-btn share-copy" id="btn-partager" aria-label="Copier le lien">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
          <span id="label-copier">Copier</span>
        </button>
      </div>
    </div>`;

  const nomAuteur = article.auteur || "Équipe Educa-Psy";
  const initialesAuteur = nomAuteur
    .split(/\s+/)
    .map(p => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase() || "EP";

  const chapeauHtml = resume
    ? `<div class="article-chapeau"><p>${resume}</p></div>`
    : "";

  zone.innerHTML = `
    <article class="single-article">
      ${filArianeHtml}

      <header class="article-header">
        <div class="article-kicker-wrap">
          <a href="articles.html?cat=${encodeURIComponent(article.categorie || '')}" class="article-kicker cat-${slug}">
            <span class="kicker-dot"></span>
            ${article.categorie || "Actualité"}
          </a>
        </div>

        <h1 class="article-title">${titre || ""}</h1>

        ${chapeauHtml}

        <div class="article-meta-bar">
          <div class="article-author-badge">
            <span class="author-avatar">${initialesAuteur}</span>
            <div class="author-details">
              <span class="author-name">${nomAuteur}</span>
              <span class="author-role">Educa-Psy · Publication</span>
            </div>
          </div>
          <div class="article-meta-info">
            <span class="article-date">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
              <time datetime="${dateIso}">${formaterDateFirestore(article.date)}</time>
            </span>
            <span class="meta-separator" aria-hidden="true">·</span>
            <span class="article-readtime">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
              ${tempsLecture}
            </span>
          </div>
        </div>
      </header>

      ${imageHero}

      <div class="article-body">
        ${rendreContenuArticle(contenu)}
      </div>

      ${shareSectionHtml}
    </article>`;

  initCarousels(zone);

  // Gestion de la barre de progression de lecture
  const barreLecture = document.getElementById("reading-progress-bar");
  if (barreLecture) {
    const majBarre = () => {
      const scrollMax = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollMax > 0) {
        const pct = Math.min(100, Math.max(0, (window.scrollY / scrollMax) * 100));
        barreLecture.style.width = `${pct}%`;
      }
    };
    window.addEventListener("scroll", majBarre, { passive: true });
    majBarre();
  }

  async function copierDansPressePapier(texte) {
    try {
      if (typeof window !== "undefined" && window.focus) {
        window.focus();
      }
    } catch (_) {}

    if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
      try {
        await navigator.clipboard.writeText(texte);
        return true;
      } catch (_) {
        // Fallback silencieux vers document.execCommand pour iframe / document non focusé
      }
    }

    try {
      const zone = document.createElement("textarea");
      zone.value = texte;
      zone.setAttribute("readonly", "");
      zone.style.position = "fixed";
      zone.style.left = "-9999px";
      zone.style.top = "0";
      zone.style.opacity = "0";
      document.body.appendChild(zone);
      zone.focus();
      zone.select();
      const succes = document.execCommand("copy");
      document.body.removeChild(zone);
      if (succes) return true;
    } catch (_) {}

    return false;
  }

  const btnPartager = document.getElementById("btn-partager");
  const labelCopier = document.getElementById("label-copier");
  if (btnPartager) {
    btnPartager.addEventListener("click", async () => {
      const data = { title: titreShare, text: resume || "", url: window.location.href };
      if (navigator.share) {
        try {
          await navigator.share(data);
          return;
        } catch (_) { /* fallback vers copie */ }
      }
      const copieReussie = await copierDansPressePapier(window.location.href);
      if (labelCopier) {
        labelCopier.textContent = copieReussie ? "✓ Copié !" : "Lien prêt";
        setTimeout(() => { if (labelCopier) labelCopier.textContent = "Copier"; }, 2200);
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

