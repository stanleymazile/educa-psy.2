/* ============================================================
   EDUCA-PSY — functions/index.js
   ============================================================
   Génère un flux RSS à jour à chaque requête, à partir des
   articles réels dans Firestore. Contrairement au reste du site,
   ceci nécessite le forfait Firebase "Blaze" (voir FIREBASE-GUIDE.md)
   — c'est la seule fonctionnalité du projet qui en a besoin.
   ============================================================ */

const { onRequest } = require("firebase-functions/v2/https");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");

initializeApp();
const db = getFirestore();

// ⚠️ Remplacez par votre vraie adresse (la même que dans les fichiers HTML).
const SITE_URL = "https://educa-psy.web.app";

function echapperXml(texte) {
  return String(texte || "").replace(/[<>&'"]/g, (c) => (
    { "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" }[c]
  ));
}

exports.rss = onRequest({ cors: true }, async (req, res) => {
  try {
    const snap = await db.collection("articles").orderBy("date", "desc").limit(20).get();

    const items = snap.docs.map((doc) => {
      const a = doc.data();
      const date = a.date && a.date.toDate ? a.date.toDate() : new Date();
      const lien = `${SITE_URL}/article.html?id=${doc.id}`;
      return `
    <item>
      <title>${echapperXml(a.titre)}</title>
      <link>${lien}</link>
      <guid isPermaLink="true">${lien}</guid>
      <pubDate>${date.toUTCString()}</pubDate>
      <description>${echapperXml(a.resume)}</description>
    </item>`;
    }).join("");

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Educa-Psy</title>
    <link>${SITE_URL}/</link>
    <description>Actualités Educa-Psy — éducation, technologie, science, psychologie</description>
    <language>fr</language>${items}
  </channel>
</rss>`;

    res.set("Content-Type", "application/rss+xml; charset=utf-8");
    res.set("Cache-Control", "public, max-age=1800"); // 30 min de cache
    res.status(200).send(xml);
  } catch (err) {
    console.error("Erreur génération RSS :", err);
    res.status(500).send("Erreur lors de la génération du flux RSS.");
  }
});
