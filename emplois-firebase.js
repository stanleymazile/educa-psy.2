/* ============================================================
   EDUCA-PSY — emplois-firebase.js (Rubriques : Insolite / Savoir)
   ============================================================ */

import { db } from "./firebase-config.js";
import {
  collection, getDocs, doc, getDoc, query, orderBy
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";

const MOIS_FR = [
  "janvier", "février", "mars", "avril", "mai", "juin",
  "juillet", "août", "septembre", "octobre", "novembre", "décembre"
];

const NB_APERCU_ACCUEIL = 3;
const TAILLE_PAGE_EMPLOIS = 9;

const FICHES_SAVOIR_INTEGREES = [
  {
    id: "dissonance-cognitive",
    titre: "La dissonance cognitive",
    type: "Savoir",
    organisation: "Équipe Educa-Psy",
    lieu: "Psychologie",
    resume: "La dissonance cognitive est le malaise que nous ressentons quand nos pensées, nos valeurs ou nos actes se contredisent. Comprendre le phénomène décrit par Leon Festinger et mieux le gérer.",
    description: "La dissonance cognitive est le malaise que nous ressentons quand nos pensées, nos valeurs ou nos actes se contredisent.",
    url: "dissonance-cognitive.html",
    datePublication: new Date("2026-11-14T09:00:00Z")
  }
];

let cacheEmplois = null;
let promesseChargement = null;

function echapperHTML(texte) {
  const div = document.createElement("div");
  div.textContent = texte == null ? "" : String(texte);
  return div.innerHTML;
}

function retirerAccents(texte) {
  return String(texte || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function estTypeValide(type) {
  const norm = retirerAccents(type).toLowerCase().trim();
  return norm === "insolite" || norm === "savoir";
}

function slugifyType(type) {
  const norm = retirerAccents(type).toLowerCase().trim();
  if (norm === "insolite") return "insolite";
  return "savoir";
}

function libelleType(type) {
  const norm = retirerAccents(type).toLowerCase().trim();
  if (norm === "insolite") return window.EducaPsyI18n ? window.EducaPsyI18n.texte("type_insolite") : "Insolite";
  return window.EducaPsyI18n ? window.EducaPsyI18n.texte("type_savoir") : "Savoir";
}

function formaterDateFirestore(valeur) {
  if (!valeur) return "";
  const d = valeur.toDate ? valeur.toDate() : new Date(valeur);
  if (isNaN(d.getTime())) return "";
  return `${d.getUTCDate()} ${MOIS_FR[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

function correspondType(typeItem, typeFiltre) {
  if (!typeFiltre || typeFiltre === "Tous") return true;
  return retirerAccents(typeItem).toLowerCase().trim() === retirerAccents(typeFiltre).toLowerCase().trim();
}

function formaterInline(texte) {
  let html = echapperHTML(texte);
  html = html.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/\*([^*]+)\*/g, "<em>$1</em>");
  html = html.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1 <span class="ext-icon" aria-hidden="true">↗</span></a>');
  return html;
}

function rendreContenu(texte) {
  if (!texte) return "";
  const blocs = String(texte).split(/\n\s*\n/).map(b => b.trim()).filter(Boolean);
  return blocs.map(bloc => {
    const lignes = bloc.split(/\n/).map(l => l.trim()).filter(Boolean);
    if (lignes.every(l => /^[-*•]\s+/.test(l))) {
      const items = lignes.map(l => `<li>${formaterInline(l.replace(/^[-*•]\s+/, ""))}</li>`).join("");
      return `<ul class="article-list">${items}</ul>`;
    }
    if (lignes.length === 1 && lignes[0].startsWith("### ")) {
      return `<h3 class="article-subtitle-h3">${formaterInline(lignes[0].slice(4))}</h3>`;
    }
    if (lignes.length === 1 && lignes[0].startsWith("## ")) {
      return `<h2 class="article-subtitle">${formaterInline(lignes[0].slice(3))}</h2>`;
    }
    if (lignes.length === 1 && lignes[0].startsWith("> ")) {
      return `<blockquote class="article-quote">${formaterInline(lignes[0].slice(2))}</blockquote>`;
    }
    return `<p>${lignes.map(formaterInline).join("<br>")}</p>`;
  }).join("");
}

function timestampMs(valeur) {
  if (!valeur) return 0;
  const d = valeur.toDate ? valeur.toDate() : new Date(valeur);
  return isNaN(d.getTime()) ? 0 : d.getTime();
}

export async function chargerEmplois(force = false) {
  if (cacheEmplois && !force) return cacheEmplois;
  if (promesseChargement && !force) return promesseChargement;

  promesseChargement = (async () => {
    let itemsFirestore = [];
    try {
      const snap = await getDocs(query(collection(db, "emplois"), orderBy("datePublication", "desc")));
      itemsFirestore = snap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .filter(o => estTypeValide(o.type));
    } catch (err) {
      console.warn("Firestore indisponible pour Rubriques, affichage des fiches intégrées :", err);
    }

    const titresExistants = new Set(itemsFirestore.map(o => retirerAccents(o.titre).toLowerCase().trim()));
    const integres = FICHES_SAVOIR_INTEGREES.filter(
      f => !titresExistants.has(retirerAccents(f.titre).toLowerCase().trim())
    );

    cacheEmplois = [...integres, ...itemsFirestore].sort(
      (a, b) => timestampMs(b.datePublication) - timestampMs(a.datePublication)
    );
    return cacheEmplois;
  })();

  return promesseChargement;
}

function carteEmploiHTML(o, compact = false) {
  const slug = slugifyType(o.type);
  const badge = libelleType(o.type);
  const url = o.url || `emploi.html?id=${encodeURIComponent(o.id)}`;
  const datePub = formaterDateFirestore(o.datePublication);
  const metaParts = [o.organisation, o.lieu, datePub].filter(Boolean).map(echapperHTML);
  const texteResume = o.resume || (o.description ? String(o.description).slice(0, 160) + (String(o.description).length > 160 ? "…" : "") : "");
  const lireSuite = window.EducaPsyI18n ? window.EducaPsyI18n.texte("lire_la_suite") : "Lire la suite →";

  return `
    <article class="job-card ${compact ? "job-card--compact " : ""}type-${slug}">
      <span class="tag tag-${slug}">${echapperHTML(badge)}</span>
      <h3 class="job-card-title"><a href="${url}">${echapperHTML(o.titre) || "(sans titre)"}</a></h3>
      ${metaParts.length ? `<div class="job-card-meta">${metaParts.join(" · ")}</div>` : ""}
      ${texteResume ? `<p class="job-card-desc">${echapperHTML(texteResume)}</p>` : ""}
      <div class="job-card-footer">
        <a href="${url}" class="see-all">${echapperHTML(lireSuite)}</a>
        <div class="job-card-liens">
          ${o.pdfUrl ? `<a href="${echapperHTML(o.pdfUrl)}" target="_blank" rel="noopener" class="see-all">📄 PDF</a>` : ""}
          ${o.lien ? `<a href="${echapperHTML(o.lien)}" target="_blank" rel="noopener" class="see-all">Source ↗</a>` : ""}
        </div>
      </div>
    </article>`;
}

function squelettesHTML(n = 3) {
  return Array.from({ length: n }, () => `
    <div class="job-card squelette">
      <div class="squelette-ligne courte"></div>
      <div class="squelette-ligne titre"></div>
      <div class="squelette-ligne"></div>
      <div class="squelette-ligne"></div>
    </div>`).join("");
}

/* ---------- Accueil : aperçu Rubriques ---------- */

async function initAccueilEmplois() {
  const zone = document.getElementById("opportunites-apercu");
  if (!zone) return;

  zone.innerHTML = squelettesHTML(NB_APERCU_ACCUEIL);
  try {
    const tous = await chargerEmplois();
    const recents = tous.slice(0, NB_APERCU_ACCUEIL);
    if (!recents.length) {
      zone.innerHTML = `<p class="empty-msg">Aucun contenu dans « Rubriques » pour le moment.</p>`;
      return;
    }
    zone.innerHTML = recents.map(o => carteEmploiHTML(o, true)).join("");
  } catch (err) {
    console.error("Erreur Firestore (Rubriques accueil) :", err);
    zone.innerHTML = `<p class="empty-msg">Contenu « Rubriques » temporairement indisponible.</p>`;
  }
}

/* ---------- Page liste : emplois.html ---------- */

async function initEmploisListePage() {
  const grid = document.getElementById("emplois-grid");
  if (!grid) return;

  const paginationZone = document.getElementById("pagination-emplois");
  const rechercheInput = document.getElementById("recherche-emplois");
  const tabs = document.querySelectorAll(".filter-tab[data-type]");

  const params = new URLSearchParams(window.location.search);
  let typeActif = params.get("type") || "Tous";
  let recherche = params.get("search") || "";
  let pageCourante = 1;

  if (rechercheInput && recherche) rechercheInput.value = recherche;

  tabs.forEach(tab => {
    const estActif = correspondType(tab.dataset.type, typeActif) || (typeActif === "Tous" && tab.dataset.type === "Tous");
    tab.classList.toggle("active", estActif);
  });

  grid.innerHTML = squelettesHTML(6);

  let tous = [];
  try {
    tous = await chargerEmplois();
  } catch (err) {
    console.error("Erreur Firestore (liste Rubriques) :", err);
    grid.innerHTML = `<p class="empty-msg">Impossible de charger les fiches « Rubriques » pour le moment.</p>`;
    return;
  }

  function afficher() {
    const q = retirerAccents(recherche).toLowerCase().trim();
    const filtres = tous.filter(o => {
      if (!correspondType(o.type, typeActif)) return false;
      if (!q) return true;
      const texte = retirerAccents([o.titre, o.type, o.organisation, o.lieu, o.resume, o.description].join(" ")).toLowerCase();
      return texte.includes(q);
    });

    const totalPages = Math.max(1, Math.ceil(filtres.length / TAILLE_PAGE_EMPLOIS));
    if (pageCourante > totalPages) pageCourante = totalPages;

    const debut = (pageCourante - 1) * TAILLE_PAGE_EMPLOIS;
    const pageItems = filtres.slice(debut, debut + TAILLE_PAGE_EMPLOIS);

    if (!pageItems.length) {
      grid.innerHTML = `<p class="empty-msg">Aucun contenu trouvé pour cette sélection.</p>`;
    } else {
      grid.innerHTML = pageItems.map(o => carteEmploiHTML(o, false)).join("");
    }

    if (paginationZone) {
      if (totalPages <= 1) {
        paginationZone.innerHTML = "";
      } else {
        const btns = [];
        btns.push(`<button type="button" class="pagination-btn" ${pageCourante === 1 ? "disabled" : ""} data-page="${pageCourante - 1}">←</button>`);
        for (let p = 1; p <= totalPages; p++) {
          btns.push(`<button type="button" class="pagination-btn ${p === pageCourante ? "active" : ""}" data-page="${p}">${p}</button>`);
        }
        btns.push(`<button type="button" class="pagination-btn" ${pageCourante === totalPages ? "disabled" : ""} data-page="${pageCourante + 1}">→</button>`);
        paginationZone.innerHTML = btns.join("");
        paginationZone.querySelectorAll(".pagination-btn[data-page]").forEach(btn => {
          btn.addEventListener("click", () => {
            const p = parseInt(btn.dataset.page, 10);
            if (!isNaN(p) && p >= 1 && p <= totalPages) {
              pageCourante = p;
              afficher();
              window.scrollTo({ top: 0, behavior: "smooth" });
            }
          });
        });
      }
    }
  }

  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      tabs.forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      typeActif = tab.dataset.type || "Tous";
      pageCourante = 1;
      const url = new URL(window.location.href);
      if (typeActif === "Tous") url.searchParams.delete("type");
      else url.searchParams.set("type", typeActif);
      window.history.replaceState({}, "", url);
      afficher();
    });
  });

  if (rechercheInput) {
    rechercheInput.addEventListener("input", () => {
      recherche = rechercheInput.value;
      pageCourante = 1;
      afficher();
    });
  }

  afficher();
}

/* ---------- Page détail : emploi.html ---------- */

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
      // Fallback execCommand
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

function majMetaSEOEmploi(o) {
  const titre = `${o.titre || "Rubriques"} — Educa-Psy`;
  const desc = o.resume || (o.description ? String(o.description).slice(0, 155) : "Rubriques sur Educa-Psy.");
  const url = `https://educa-psy.web.app/emploi.html?id=${encodeURIComponent(o.id)}`;

  document.title = titre;
  const setAttr = (sel, attr, val) => {
    const el = document.querySelector(sel);
    if (el && val) el.setAttribute(attr, val);
  };
  setAttr('meta[name="description"]', "content", desc);
  setAttr('meta[property="og:title"]', "content", titre);
  setAttr('meta[property="og:description"]', "content", desc);
  setAttr('meta[property="og:url"]', "content", url);
  setAttr('meta[name="twitter:title"]', "content", titre);
  setAttr('meta[name="twitter:description"]', "content", desc);
  setAttr('link[rel="canonical"]', "href", url);

  const dateObj = o.datePublication && o.datePublication.toDate ? o.datePublication.toDate() : new Date();
  const dateIso = !isNaN(dateObj.getTime()) ? dateObj.toISOString() : new Date().toISOString();

  const existingLd = document.getElementById("emploi-jsonld");
  if (existingLd) existingLd.remove();
  const script = document.createElement("script");
  script.id = "emploi-jsonld";
  script.type = "application/ld+json";
  script.textContent = JSON.stringify([
    {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": o.titre || "Rubriques",
      "description": desc,
      "mainEntityOfPage": { "@type": "WebPage", "@id": url },
      "datePublished": dateIso,
      "author": { "@type": "Organization", "name": o.organisation || "Educa-Psy" },
      "publisher": {
        "@type": "Organization",
        "name": "Educa-Psy",
        "logo": { "@type": "ImageObject", "url": "https://educa-psy.web.app/logo.svg" }
      }
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Accueil", "item": "https://educa-psy.web.app/" },
        { "@type": "ListItem", "position": 2, "name": "Rubriques", "item": "https://educa-psy.web.app/emplois.html" },
        { "@type": "ListItem", "position": 3, "name": o.titre || "Fiche", "item": url }
      ]
    }
  ]);
  document.head.appendChild(script);
}

async function initEmploiDetailPage() {
  const zone = document.getElementById("emploi-content");
  if (!zone) return;

  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  if (!id) {
    zone.innerHTML = `<div class="article-not-found"><h1>Contenu introuvable</h1><p>Aucune fiche « Rubriques » spécifiée.</p><a href="emplois.html" class="btn btn-primary">Voir les rubriques</a></div>`;
    return;
  }

  if (id === "dissonance-cognitive") {
    window.location.replace("dissonance-cognitive.html");
    return;
  }

  zone.innerHTML = `<div class="squelette"><div class="squelette-ligne courte"></div><div class="squelette-ligne titre"></div><div class="squelette-ligne"></div><div class="squelette-ligne"></div></div>`;

  let item = null;
  try {
    const snap = await getDoc(doc(db, "emplois", id));
    if (snap.exists()) {
      const data = snap.data();
      if (estTypeValide(data.type)) {
        item = { id: snap.id, ...data };
      }
    }
  } catch (err) {
    console.error("Erreur Firestore (détail Rubriques) :", err);
  }

  if (!item) {
    const robots = document.querySelector('meta[name="robots"]');
    if (robots) robots.setAttribute("content", "noindex, nofollow");
    zone.innerHTML = `<div class="article-not-found"><h1>Fiche introuvable</h1><p>Cette fiche « Rubriques » n'existe pas ou a été supprimée.</p><a href="emplois.html" class="btn btn-primary">Retour aux rubriques</a></div>`;
    return;
  }

  majMetaSEOEmploi(item);

  const slug = slugifyType(item.type);
  const badge = libelleType(item.type);
  const datePub = formaterDateFirestore(item.datePublication);
  const dateObj = item.datePublication && item.datePublication.toDate ? item.datePublication.toDate() : new Date();
  const dateIso = !isNaN(dateObj.getTime()) ? dateObj.toISOString() : "";

  const metaParts = [item.organisation, item.lieu].filter(Boolean).map(echapperHTML);
  const urlPage = window.location.href;
  const urlEncodee = encodeURIComponent(urlPage);
  const texteEncode = encodeURIComponent(`${item.titre || "Rubriques"} — Educa-Psy`);

  const actionsHtml = (item.lien || item.pdfUrl) ? `
    <div class="emploi-actions">
      ${item.lien ? `<a href="${echapperHTML(item.lien)}" target="_blank" rel="noopener" class="btn btn-primary">En savoir plus ↗</a>` : ""}
      ${item.pdfUrl ? `<a href="${echapperHTML(item.pdfUrl)}" target="_blank" rel="noopener" class="btn btn-outline">📄 ${echapperHTML(item.pdfNom || "Télécharger le PDF")}</a>` : ""}
    </div>` : "";

  zone.innerHTML = `
    <article class="single-article">
      <nav class="breadcrumb-nav" aria-label="Fil d'Ariane">
        <ol class="breadcrumb-list">
          <li class="breadcrumb-item"><a class="breadcrumb-link" href="index.html">Accueil</a></li>
          <li class="breadcrumb-separator" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg></li>
          <li class="breadcrumb-item"><a class="breadcrumb-link" href="emplois.html">Rubriques</a></li>
          <li class="breadcrumb-separator" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg></li>
          <li class="breadcrumb-item current" aria-current="page"><span class="breadcrumb-current">${echapperHTML(item.titre || "")}</span></li>
        </ol>
      </nav>

      <header class="article-header">
        <div class="article-kicker-wrap">
          <a href="emplois.html?type=${encodeURIComponent(item.type || "Savoir")}" class="article-kicker">
            <span class="kicker-dot"></span>
            ${echapperHTML(badge)}
          </a>
        </div>
        <h1 class="article-title">${echapperHTML(item.titre || "")}</h1>
        ${item.resume ? `<div class="article-chapeau"><p>${echapperHTML(item.resume)}</p></div>` : ""}
        <div class="article-meta-bar">
          <div class="article-author-badge">
            <span class="author-avatar">EP</span>
            <div class="author-details">
              <span class="author-name">${metaParts.length ? metaParts.join(" · ") : "Équipe Educa-Psy"}</span>
              <span class="author-role">Rubriques · ${echapperHTML(badge)}</span>
            </div>
          </div>
          ${datePub ? `
          <div class="article-meta-info">
            <span class="article-date">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
              <time datetime="${dateIso}">${datePub}</time>
            </span>
          </div>` : ""}
        </div>
      </header>

      <div class="article-body">
        ${item.description ? rendreContenu(item.description) : (item.resume ? `<p>${echapperHTML(item.resume)}</p>` : "")}
      </div>

      ${actionsHtml}

      <div class="article-share-section">
        <span class="share-label">Partager cette fiche :</span>
        <div class="share-buttons-group">
          <a class="share-action-btn share-whatsapp" href="https://api.whatsapp.com/send?text=${texteEncode}%20${urlEncodee}" target="_blank" rel="noopener">WhatsApp</a>
          <a class="share-action-btn share-facebook" href="https://www.facebook.com/sharer/sharer.php?u=${urlEncodee}" target="_blank" rel="noopener">Facebook</a>
          <a class="share-action-btn share-x" href="https://x.com/intent/tweet?text=${texteEncode}&url=${urlEncodee}&via=educapsyhaiti" target="_blank" rel="noopener">X</a>
          <a class="share-action-btn share-linkedin" href="https://www.linkedin.com/sharing/share-offsite/?url=${urlEncodee}" target="_blank" rel="noopener">LinkedIn</a>
          <button type="button" class="share-action-btn share-copy" id="btn-partager-emploi"><span id="label-copier-emploi">Copier</span></button>
        </div>
      </div>
    </article>`;

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

  const btnPartager = document.getElementById("btn-partager-emploi");
  const labelCopier = document.getElementById("label-copier-emploi");
  if (btnPartager) {
    btnPartager.addEventListener("click", async () => {
      const data = { title: item.titre || "Rubriques", text: item.resume || "", url: window.location.href };
      if (navigator.share) {
        try {
          await navigator.share(data);
          return;
        } catch (_) {}
      }
      const ok = await copierDansPressePapier(window.location.href);
      if (labelCopier) {
        labelCopier.textContent = ok ? "✓ Copié !" : "Lien prêt";
        setTimeout(() => { if (labelCopier) labelCopier.textContent = "Copier"; }, 2200);
      }
    });
  }

  const zoneSimilaires = document.getElementById("emplois-similaires");
  if (zoneSimilaires) {
    try {
      const tous = await chargerEmplois();
      const similaires = tous.filter(o => o.id !== item.id).slice(0, 2);
      if (similaires.length) {
        zoneSimilaires.innerHTML = `
          <h3>À découvrir aussi dans Rubriques</h3>
          <div class="emplois-grid">
            ${similaires.map(o => carteEmploiHTML(o, true)).join("")}
          </div>`;
      }
    } catch (err) {
      console.error("Erreur Firestore (Rubriques similaires) :", err);
    }
  }
}

async function initSimilairesPageStatique() {
  const zoneSimilaires = document.getElementById("emplois-similaires");
  if (!zoneSimilaires || document.getElementById("emploi-content")) return;
  try {
    const tous = await chargerEmplois();
    const similaires = tous.filter(o => o.id !== "dissonance-cognitive").slice(0, 2);
    if (similaires.length) {
      zoneSimilaires.innerHTML = `
        <h3>À découvrir aussi dans Rubriques</h3>
        <div class="emplois-grid">
          ${similaires.map(o => carteEmploiHTML(o, true)).join("")}
        </div>`;
    }
  } catch (err) {
    console.error("Erreur chargement similaires Rubriques :", err);
  }
}

/* ---------- Initialisation ---------- */

function rechargerContenuEmplois() {
  if (document.getElementById("opportunites-apercu")) {
    initAccueilEmplois();
  }
  if (document.getElementById("emplois-grid")) {
    initEmploisListePage();
  }
  if (document.getElementById("emploi-content")) {
    initEmploiDetailPage();
  } else if (document.getElementById("emplois-similaires")) {
    initSimilairesPageStatique();
  }
}

window.addEventListener("educapsy-langue-changee", rechargerContenuEmplois);
document.addEventListener("DOMContentLoaded", rechargerContenuEmplois);
