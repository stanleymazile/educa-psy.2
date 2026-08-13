/* ============================================================
   EDUCA-PSY — ticker.js
   ============================================================
   Bandeau défilant des dernières manchettes, affiché sur toutes
   les pages. Lit les 6 articles les plus récents dans Firestore.
   ============================================================ */

import { db } from "./firebase-config.js";
import { collection, getDocs, query, orderBy, limit } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore-lite.js";

async function initTicker() {
  const zone = document.getElementById("ticker-track");
  if (!zone) return;

  try {
    const q = query(collection(db, "articles"), orderBy("date", "desc"), limit(6));
    const snap = await getDocs(q);
    const articles = snap.docs.map(d => ({ id: d.id, ...d.data() }));

    if (!articles.length) {
      zone.parentElement.parentElement.style.display = "none"; // masque le bandeau si vide
      return;
    }

    // Dupliqué une fois pour un défilement continu sans "trou"
    const liens = articles.map(a => `<a href="article.html?id=${a.id}">${a.titre || ""}</a>`);
    zone.innerHTML = [...liens, ...liens].join('<span style="opacity:.5"> ◆ </span>');
  } catch (err) {
    console.error("Erreur Firestore (ticker) :", err);
    const bandeau = document.getElementById("ticker-bar");
    if (bandeau) bandeau.style.display = "none"; // échec silencieux : le site reste utilisable
  }
}

document.addEventListener("DOMContentLoaded", initTicker);

