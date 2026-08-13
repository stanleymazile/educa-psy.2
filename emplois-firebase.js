/* ============================================================
   EDUCA-PSY — emplois-firebase.js
   ============================================================
   Remplace emplois-data.js : les offres d'emploi/collaboration
   sont désormais lues en direct depuis Firestore (collection
   "emplois"). Gérez-les via le panneau d'administration
   (admin.html) ou directement dans la console Firebase.
   ============================================================ */

import { db } from "./firebase-config.js";
import {
  collection, getDocs, query, orderBy
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

async function chargerEmplois() {
  const q = query(collection(db, "emplois"), orderBy("datePublication", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

function carteEmploiHTML(offre, compact = false) {
  const slug = slugify(offre.type || "");
  const lieuTxt = offre.lieu ? ` · ${offre.lieu}` : "";
  const dateTxt = offre.dateLimite ? `Date limite : ${formaterDateFirestore(offre.dateLimite)}` : "";
  const pdfLien = offre.pdfUrl
    ? `<a class="read-more" href="${offre.pdfUrl}" target="_blank" rel="noopener">📄 ${offre.pdfNom || "Voir le PDF"}</a>`
    : "";
  const infoLien = offre.lien
    ? `<a class="read-more" href="${offre.lien}" target="_blank" rel="noopener">En savoir plus →</a>`
    : "";
  return `
    <article class="job-card ${compact ? "job-card--compact" : ""} type-${slug}">
      <span class="tag tag-${slug}">${offre.type || ""}</span>
      <h3 class="job-card-title">${offre.titre || ""}</h3>
      <div class="job-card-meta">${offre.organisation || ""}${lieuTxt}</div>
      <p class="job-card-desc">${offre.description || ""}</p>
      <div class="job-card-footer">
        <span class="job-deadline">${dateTxt}</span>
        <span class="job-card-liens">${pdfLien} ${infoLien}</span>
      </div>
    </article>`;
}

function erreurHTML() {
  return `<p class="empty-msg">Impossible de charger les offres pour le moment. Vérifiez firebase-config.js et les règles de sécurité Firestore.</p>`;
}

/* ---------- Aperçu sur la page d'accueil ---------- */

async function initApercuOpportunites() {
  const apercu = document.getElementById("opportunites-apercu");
  if (!apercu) return;
  try {
    const tous = await chargerEmplois();
    apercu.innerHTML = tous.slice(0, 2).map(o => carteEmploiHTML(o, true)).join("")
      || `<p class="empty-msg">Aucune offre publiée pour le moment.</p>`;
  } catch (err) {
    console.error("Erreur Firestore (aperçu emplois) :", err);
    apercu.innerHTML = erreurHTML();
  }
}

/* ---------- Page emplois.html ---------- */

async function initEmploisPage() {
  const grille = document.getElementById("emplois-grid");
  if (!grille) return;

  grille.innerHTML = `<p class="empty-msg">Chargement des offres…</p>`;

  let tous;
  try {
    tous = await chargerEmplois();
  } catch (err) {
    console.error("Erreur Firestore (chargerEmplois) :", err);
    grille.innerHTML = erreurHTML();
    return;
  }

  function afficher(type) {
    const filtres = type === "Tous" ? tous : tous.filter(o => o.type === type);
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

document.addEventListener("DOMContentLoaded", () => {
  initApercuOpportunites();
  initEmploisPage();
});
