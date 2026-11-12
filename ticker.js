/* ============================================================
   EDUCA-PSY — ticker.js
   ============================================================
   Bandeau défilant des dernières manchettes, affiché sur toutes
   les pages. Lit les 6 articles les plus récents dans Firestore.
   ============================================================ */

import { chargerArticles } from "./articles-firebase.js";

async function initTicker() {
  const zone = document.getElementById("ticker-track");
  if (!zone) return;

  try {
    const tous = await chargerArticles();
    const articles = (tous || []).slice(0, 6);

    if (!articles.length) {
      const bandeau = document.getElementById("ticker-bar");
      if (bandeau) bandeau.style.display = "none";
      return;
    }

    // Dupliqué une fois pour un défilement continu sans "trou".
    // Le séparateur (point doré) est ajouté en CSS après chaque lien.
    const liens = articles.map(a => `<a href="article.html?id=${a.id}">${a.titre || ""}</a>`);
    zone.innerHTML = [...liens, ...liens].join("");
  } catch (err) {
    console.error("Erreur Firestore (ticker) :", err);
    const bandeau = document.getElementById("ticker-bar");
    if (bandeau) bandeau.style.display = "none";
  }
}

document.addEventListener("DOMContentLoaded", initTicker);
