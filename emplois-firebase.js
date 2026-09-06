/* ============================================================
   EDUCA-PSY — emplois-firebase.js
   ============================================================
   Les offres d'emploi/collaboration sont lues en direct depuis
   Firestore (collection "emplois"). Gérez-les via le panneau
   d'administration (admin.html) ou la console Firebase.

   Les cartes (accueil + liste) montrent un résumé et renvoient
   vers emploi.html?id=... pour le détail complet (description,
   lien, PDF) — même principe que les articles.

   Optimisée : pagination + requêtes ciblées (moins de données
   transférées), même approche que articles-firebase.js.
   ============================================================ */

import { db } from "./firebase-config.js";
import {
  collection, getDocs, doc, getDoc, query, orderBy, limit, startAfter, where
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";

const MOIS_FR = ["janvier","février","mars","avril","mai","juin","juillet",
                  "août","septembre","octobre","novembre","décembre"];

const TAILLE_PAGE = 9; // nombre d'offres chargées par page sur emplois.html

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

function tronquer(texte, max = 140) {
  if (!texte) return "";
  return texte.length > max ? texte.slice(0, max).trim() + "…" : texte;
}

// Même syntaxe pratique que dans les articles : [texte](url) -> lien, ![alt](url) -> image
function formaterTexte(texte) {
  if (!texte) return "";
  return texte
    .replace(/!\[([^\]]*)\]\((https?:\/\/[^\s)]+)\)/g, '<img src="$2" alt="$1" loading="lazy">')
    .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
}

/* ---------- Accès Firestore ---------- */

async function chargerEmploiParId(id) {
  const ref = doc(db, "emplois", id);
  const snap = await getDoc(ref);
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

/* Aperçu accueil : seulement les 2 offres les plus récentes,
   requête directe avec limite plutôt que charger toute la
   collection pour n'en garder que 2. */
async function chargerApercuEmplois(max = 2) {
  const q = query(collection(db, "emplois"), orderBy("datePublication", "desc"), limit(max));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

/* Page emplois.html : une page d'offres (9 par défaut), filtrée
   par type si besoin, à partir d'un curseur de pagination.
   NOTE : filtrer par type + trier par date peut demander à
   Firestore de créer un index composite — la console affichera
   un lien direct pour le créer en un clic si besoin. */
async function chargerPageEmplois({ type = "Tous", curseur = null } = {}) {
  const contraintes = [];
  if (type && type !== "Tous") {
    contraintes.push(where("type", "==", type));
  }
  contraintes.push(orderBy("datePublication", "desc"));
  if (curseur) contraintes.push(startAfter(curseur));
  contraintes.push(limit(TAILLE_PAGE));

  const q = query(collection(db, "emplois"), ...contraintes);
  const snap = await getDocs(q);
  const offres = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  const nouveauCurseur = snap.docs.length ? snap.docs[snap.docs.length - 1] : null;
  const fin = snap.docs.length < TAILLE_PAGE;
  return { offres, curseur: nouveauCurseur, fin };
}

/* Offres similaires : requête ciblée sur le type plutôt que de
   charger toute la collection pour filtrer ensuite en JS. */
async function chargerEmploisSimilaires(type, idAExclure, max = 2) {
  if (!type) return [];
  try {
    const q = query(
      collection(db, "emplois"),
      where("type", "==", type),
      orderBy("datePublication", "desc"),
      limit(max + 1)
    );
    const snap = await getDocs(q);
    return snap.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .filter(o => o.id !== idAExclure)
      .slice(0, max);
  } catch (err) {
    console.error("Erreur Firestore (offres similaires) :", err);
    return [];
  }
}

/* ---------- Gabarits HTML ---------- */

function carteEmploiHTML(offre, compact = false) {
  const slug = slugify(offre.type || "");
  const lieuTxt = offre.lieu ? ` · ${offre.lieu}` : "";
  const dateTxt = offre.dateLimite ? `Date limite : ${formaterDateFirestore(offre.dateLimite)}` : "";
  const resume = offre.resume || tronquer(offre.description);
  return `
    <article class="job-card ${compact ? "job-card--compact" : ""} type-${slug}">
      <span class="tag tag-${slug}">${offre.type || ""}</span>
      <h3 class="job-card-title"><a href="emploi.html?id=${offre.id}">${offre.titre || ""}</a></h3>
      <div class="job-card-meta">${offre.organisation || ""}${lieuTxt}</div>
      <p class="job-card-desc">${resume}</p>
      <div class="job-card-footer">
        <span class="job-deadline">${dateTxt}</span>
        <a class="read-more" href="emploi.html?id=${offre.id}">Voir les détails →</a>
      </div>
    </article>`;
}

function emploiIntrouvableHTML() {
  return `
    <div class="article-not-found">
      <h1>Offre introuvable</h1>
      <p>Cette offre n'existe plus ou a été retirée.</p>
      <a class="btn btn-primary" href="emplois.html">← Retour aux emplois &amp; collaborations</a>
    </div>`;
}

function erreurHTML() {
  return `<p class="empty-msg">Impossible de charger les offres pour le moment. Vérifiez firebase-config.js et les règles de sécurité Firestore.</p>`;
}

/* ---------- Aperçu sur la page d'accueil ---------- */

async function initApercuOpportunites() {
  const apercu = document.getElementById("opportunites-apercu");
  if (!apercu) return;
  try {
    const recentes = await chargerApercuEmplois(2);
    apercu.innerHTML = recentes.map(o => carteEmploiHTML(o, true)).join("")
      || `<p class="empty-msg">Aucune offre publiée pour le moment.</p>`;
  } catch (err) {
    console.error("Erreur Firestore (aperçu emplois) :", err);
    apercu.innerHTML = erreurHTML();
  }
}

/* ---------- Page emplois.html (liste) ---------- */

async function initEmploisPage() {
  const grille = document.getElementById("emplois-grid");
  if (!grille) return;

  let typeActuel = new URLSearchParams(window.location.search).get("type") || "Tous";
  let curseur = null;
  let fin = false;

  function creerBoutonChargerPlus() {
    let bouton = document.getElementById("btn-charger-plus-emplois");
    if (!bouton) {
      bouton = document.createElement("button");
      bouton.type = "button";
      bouton.id = "btn-charger-plus-emplois";
      bouton.className = "btn btn-outline";
      bouton.style.display = "block";
      bouton.style.margin = "var(--e6) auto 0";
      bouton.textContent = "Charger plus d'offres";
      grille.insertAdjacentElement("afterend", bouton);
      bouton.addEventListener("click", chargerEtAfficherSuite);
    }
    return bouton;
  }

  function mettreAJourBoutonChargerPlus() {
    const bouton = document.getElementById("btn-charger-plus-emplois");
    if (!bouton) return;
    bouton.style.display = fin ? "none" : "inline-block";
  }

  async function chargerEtAfficherPremierePage() {
    curseur = null;
    fin = false;
    grille.innerHTML = `<p class="empty-msg">Chargement des offres…</p>`;
    try {
      const resultat = await chargerPageEmplois({ type: typeActuel, curseur: null });
      curseur = resultat.curseur;
      fin = resultat.fin;
      grille.innerHTML = resultat.offres.length
        ? resultat.offres.map(o => carteEmploiHTML(o)).join("")
        : `<p class="empty-msg">Aucune offre dans cette catégorie pour l'instant — consultez les autres catégories ou revenez bientôt.</p>`;
      creerBoutonChargerPlus();
      mettreAJourBoutonChargerPlus();
    } catch (err) {
      console.error("Erreur Firestore (chargerPageEmplois) :", err);
      grille.innerHTML = erreurHTML();
    }
  }

  async function chargerEtAfficherSuite() {
    if (fin || !curseur) return;
    const bouton = document.getElementById("btn-charger-plus-emplois");
    if (bouton) { bouton.disabled = true; bouton.textContent = "Chargement…"; }
    try {
      const resultat = await chargerPageEmplois({ type: typeActuel, curseur });
      curseur = resultat.curseur;
      fin = resultat.fin;
      grille.insertAdjacentHTML("beforeend", resultat.offres.map(o => carteEmploiHTML(o)).join(""));
    } catch (err) {
      console.error("Erreur Firestore (page suivante emplois) :", err);
    } finally {
      if (bouton) { bouton.disabled = false; bouton.textContent = "Charger plus d'offres"; }
      mettreAJourBoutonChargerPlus();
    }
  }

  const onglets = document.querySelectorAll(".filter-tab[data-type]");
  onglets.forEach(onglet => {
    onglet.classList.toggle("active", onglet.dataset.type === typeActuel);
    onglet.addEventListener("click", () => {
      onglets.forEach(o => o.classList.remove("active"));
      onglet.classList.add("active");
      typeActuel = onglet.dataset.type;
      chargerEtAfficherPremierePage();
    });
  });

  await chargerEtAfficherPremierePage();
}

/* ---------- Page emploi.html (détail) ---------- */

async function initEmploiPage() {
  const zone = document.getElementById("emploi-content");
  if (!zone) return;

  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  if (!id) {
    zone.innerHTML = emploiIntrouvableHTML();
    document.title = "Offre introuvable — Educa-Psy";
    return;
  }

  zone.innerHTML = `<p class="empty-msg">Chargement…</p>`;

  let offre;
  try {
    offre = await chargerEmploiParId(id);
  } catch (err) {
    console.error("Erreur Firestore (chargerEmploiParId) :", err);
    zone.innerHTML = erreurHTML();
    return;
  }

  if (!offre) {
    zone.innerHTML = emploiIntrouvableHTML();
    document.title = "Offre introuvable — Educa-Psy";
    return;
  }

  document.title = `${offre.titre} — Educa-Psy`;
  const slug = slugify(offre.type || "");
  const lieuTxt = offre.lieu ? ` · ${offre.lieu}` : "";
  const dateTxt = offre.dateLimite ? `Date limite : ${formaterDateFirestore(offre.dateLimite)}` : "";
  const paragraphes = (offre.description || "").split(/\n\s*\n/).map(p => p.trim()).filter(Boolean);

  const boutons = [];
  if (offre.lien) boutons.push(`<a class="btn btn-primary" href="${offre.lien}" target="_blank" rel="noopener">Postuler / En savoir plus →</a>`);
  if (offre.pdfUrl) boutons.push(`<a class="btn btn-outline" href="${offre.pdfUrl}" target="_blank" rel="noopener">📄 ${offre.pdfNom || "Voir le PDF"}</a>`);

  zone.innerHTML = `
    <a class="back-link" href="emplois.html">← Retour aux emplois &amp; collaborations</a>
    <span class="tag tag-${slug}">${offre.type || ""}</span>
    <h1 class="article-title">${offre.titre || ""}</h1>
    <div class="article-meta">${offre.organisation || ""}${lieuTxt}${dateTxt ? " · " + dateTxt : ""}</div>
    <div class="article-body">${paragraphes.length ? paragraphes.map(p => `<p>${formaterTexte(p)}</p>`).join("") : "<p><em>Aucune description détaillée pour le moment.</em></p>"}</div>
    ${boutons.length ? `<div class="emploi-actions">${boutons.join("")}</div>` : ""}
    <button type="button" class="share-btn" id="btn-partager-emploi">↗ Partager</button>`;

  const btnPartager = document.getElementById("btn-partager-emploi");
  if (btnPartager) {
    btnPartager.addEventListener("click", async () => {
      const data = { title: offre.titre || "Educa-Psy", text: offre.resume || "", url: window.location.href };
      if (navigator.share) {
        try { await navigator.share(data); } catch (err) { /* annulé par l'utilisateur */ }
      } else {
        try {
          await navigator.clipboard.writeText(window.location.href);
          btnPartager.textContent = "✓ Lien copié";
          setTimeout(() => { btnPartager.textContent = "↗ Partager"; }, 2000);
        } catch (err) { console.error(err); }
      }
    });
  }

  const zoneSimilaires = document.getElementById("emplois-similaires");
  if (zoneSimilaires) {
    const similaires = await chargerEmploisSimilaires(offre.type, offre.id, 2);
    if (similaires.length) {
      zoneSimilaires.innerHTML = `
        <h3>Autres offres — ${offre.type}</h3>
        <div class="emplois-grid">${similaires.map(o => carteEmploiHTML(o)).join("")}</div>`;
    }
  }

  injecterDonneesStructureesEmploi(offre);
}

function injecterDonneesStructureesEmploi(offre) {
  const ancien = document.getElementById("jsonld-emploi");
  if (ancien) ancien.remove();
  const d = offre.datePublication && offre.datePublication.toDate ? offre.datePublication.toDate() : null;
  const dLimite = offre.dateLimite && offre.dateLimite.toDate ? offre.dateLimite.toDate() : null;
  const script = document.createElement("script");
  script.type = "application/ld+json";
  script.id = "jsonld-emploi";
  script.textContent = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "JobPosting",
    "title": offre.titre || "",
    "description": offre.description || offre.resume || "",
    "datePosted": d ? d.toISOString().slice(0, 10) : undefined,
    "validThrough": dLimite ? dLimite.toISOString().slice(0, 10) : undefined,
    "employmentType": offre.type === "Emploi" ? "FULL_TIME" : offre.type === "Stage / Formation" ? "INTERN" : "OTHER",
    "hiringOrganization": { "@type": "Organization", "name": offre.organisation || "Educa-Psy" },
    "jobLocation": offre.lieu ? { "@type": "Place", "address": offre.lieu } : undefined
  });
  document.head.appendChild(script);
}

/* ---------- Lancement ---------- */

document.addEventListener("DOMContentLoaded", () => {
  initApercuOpportunites();
  initEmploisPage();
  initEmploiPage();
});

