/* ============================================================
   EDUCA-PSY — admin-firebase.js
   (modifié pour supporter les traductions EN / HT / ES)
   ============================================================ */

import { db, auth, storage, ADMIN_EMAILS } from "./firebase-config.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";
import {
  collection, getDocs, doc, setDoc, addDoc, deleteDoc, query, orderBy, Timestamp
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore-lite.js";
import { ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-storage.js";

function dateVersInput(valeur) {
  if (!valeur) return "";
  const d = valeur.toDate ? valeur.toDate() : new Date(valeur);
  if (isNaN(d.getTime())) return "";
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
}
function inputVersTimestamp(valeur) {
  if (!valeur) return null;
  return Timestamp.fromDate(new Date(valeur + "T00:00:00Z"));
}
function formaterDateAffichage(valeur) {
  if (!valeur) return "";
  const d = valeur.toDate ? valeur.toDate() : new Date(valeur);
  if (isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}
async function televerserFichier(file, dossier) {
  const chemin = `${dossier}/${Date.now()}_${file.name}`;
  const storageRef = ref(storage, chemin);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
}
function echapperHTML(texte) {
  const div = document.createElement("div");
  div.textContent = texte == null ? "" : String(texte);
  return div.innerHTML;
}

/* ---------- Accès ---------- */

function initAccesAdmin() {
  const verif = document.getElementById("admin-verification");
  if (!verif) return;

  onAuthStateChanged(auth, (user) => {
    const refuse = document.getElementById("admin-refuse");
    const contenu = document.getElementById("admin-contenu");
    verif.style.display = "none";

    if (user && ADMIN_EMAILS.includes(user.email)) {
      refuse.style.display = "none";
      contenu.style.display = "block";
      document.getElementById("admin-connecte-comme").textContent = user.email;
      rafraichirListeArticles();
      rafraichirListeEmplois();
      rafraichirMessages();
      rafraichirNewsletter();
    } else {
      contenu.style.display = "none";
      refuse.style.display = "block";
    }
  });

  const btnDeco = document.getElementById("admin-deconnexion");
  if (btnDeco) btnDeco.addEventListener("click", () => signOut(auth));

  document.querySelectorAll(".admin-tab").forEach(onglet => {
    onglet.addEventListener("click", () => {
      document.querySelectorAll(".admin-tab").forEach(o => o.classList.remove("active"));
      onglet.classList.add("active");
      document.querySelectorAll(".admin-panneau").forEach(p => p.style.display = "none");
      document.getElementById("panneau-" + onglet.dataset.panneau).style.display = "block";
    });
  });
}

/* ============================================================
   ARTICLES
   ============================================================ */

const LANGUES = ["en", "ht", "es"];
let articleEnEdition = null;

function reinitialiserFormArticle() {
  articleEnEdition = null;
  document.getElementById("form-article").reset();
  document.getElementById("titre-form-article").textContent = "Ajouter un article";
  document.getElementById("article-image-actuelle").innerHTML = "";
  for (const lg of LANGUES) {
    document.getElementById(`article-titre-${lg}`).value = "";
    document.getElementById(`article-resume-${lg}`).value = "";
    document.getElementById(`article-contenu-${lg}`).value = "";
  }
}

function remplirFormArticle(a) {
  articleEnEdition = a.id;
  document.getElementById("article-titre").value = a.titre || "";
  document.getElementById("article-categorie").value = a.categorie || "Éducation";
  document.getElementById("article-auteur").value = a.auteur || "Équipe Educa-Psy";
  document.getElementById("article-date").value = dateVersInput(a.date);
  document.getElementById("article-resume").value = a.resume || "";
  document.getElementById("article-contenu").value = Array.isArray(a.contenu) ? a.contenu.join("\n\n") : "";
  document.getElementById("article-image").value = a.image || "";
  document.getElementById("article-alaune").checked = !!a.aLaUne;
  // Traductions EN / HT / ES
  for (const lg of LANGUES) {
    document.getElementById(`article-titre-${lg}`).value = a[`titre_${lg}`] || "";
    document.getElementById(`article-resume-${lg}`).value = a[`resume_${lg}`] || "";
    document.getElementById(`article-contenu-${lg}`).value = Array.isArray(a[`contenu_${lg}`]) ? a[`contenu_${lg}`].join("\n\n") : (a[`contenu_${lg}`] || "");
  }
  document.getElementById("titre-form-article").textContent = "Modifier l'article";
  document.getElementById("article-image-actuelle").innerHTML = a.image
    ? `<div class="admin-apercu-actuel"><img src="${a.image}" alt=""><span>Image actuelle — un nouvel envoi la remplacera</span></div>`
    : "";
  document.getElementById("form-article").scrollIntoView({ behavior: "smooth", block: "start" });
}

async function rafraichirListeArticles() {
  const zone = document.getElementById("liste-articles");
  if (!zone) return;
  zone.innerHTML = "Chargement…";
  try {
    const snap = await getDocs(query(collection(db, "articles"), orderBy("date", "desc")));
    const articles = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    zone.innerHTML = articles.map(a => `
      <div class="admin-liste-item">
        <div>
          <div class="admin-liste-item-titre">${a.titre || "(sans titre)"}</div>
          <div class="admin-liste-item-meta">${a.categorie || ""} · ${formaterDateAffichage(a.date)}${a.aLaUne ? " · À la une" : ""}${LANGUES.filter(lg => a[`titre_${lg}`]).map(lg => ` · ${lg.toUpperCase()}✓`).join("")}</div>
        </div>
        <div class="admin-liste-actions">
          <button type="button" data-id="${a.id}" class="btn-modif-art">Modifier</button>
          <button type="button" data-id="${a.id}" class="supprimer btn-suppr-art">Supprimer</button>
        </div>
      </div>`).join("") || `<p class="empty-msg">Aucun article pour le moment.</p>`;

    zone.querySelectorAll(".btn-modif-art").forEach(b =>
      b.addEventListener("click", () => remplirFormArticle(articles.find(a => a.id === b.dataset.id))));
    zone.querySelectorAll(".btn-suppr-art").forEach(b =>
      b.addEventListener("click", () => supprimerArticle(b.dataset.id)));
  } catch (err) {
    console.error(err);
    zone.innerHTML = `<p class="empty-msg">Erreur de chargement : ${err.message}</p>`;
  }
}

async function supprimerArticle(id) {
  if (!confirm("Supprimer définitivement cet article ?")) return;
  await deleteDoc(doc(db, "articles", id));
  if (articleEnEdition === id) reinitialiserFormArticle();
  await rafraichirListeArticles();
}

async function enregistrerArticle(e) {
  e.preventDefault();
  const bouton = document.getElementById("article-submit");
  const messageZone = document.getElementById("article-form-message");
  bouton.disabled = true;
  messageZone.innerHTML = "";

  try {
    let imageUrl = document.getElementById("article-image").value.trim();
    const fichier = document.getElementById("article-image-fichier").files[0];
    if (fichier) imageUrl = await televerserFichier(fichier, "articles");

    const contenu = document.getElementById("article-contenu").value
      .split(/\n\s*\n/).map(p => p.trim()).filter(Boolean);

    const titre = document.getElementById("article-titre").value.trim();
    if (!titre || !contenu.length) throw new Error("Le titre et le contenu sont obligatoires.");

    const donnees = {
      titre,
      categorie: document.getElementById("article-categorie").value,
      auteur: document.getElementById("article-auteur").value.trim() || "Équipe Educa-Psy",
      date: inputVersTimestamp(document.getElementById("article-date").value) || Timestamp.now(),
      resume: document.getElementById("article-resume").value.trim(),
      contenu,
      aLaUne: document.getElementById("article-alaune").checked
    };
    if (imageUrl) donnees.image = imageUrl;

    // Traductions EN / HT / ES
    for (const lg of LANGUES) {
      const t = document.getElementById(`article-titre-${lg}`).value.trim();
      const r = document.getElementById(`article-resume-${lg}`).value.trim();
      const c = document.getElementById(`article-contenu-${lg}`).value
        .split(/\n\s*\n/).map(p => p.trim()).filter(Boolean);
      if (t) donnees[`titre_${lg}`] = t;
      if (r) donnees[`resume_${lg}`] = r;
      if (c.length) donnees[`contenu_${lg}`] = c;
    }

    if (articleEnEdition) {
      await setDoc(doc(db, "articles", articleEnEdition), donnees, { merge: true });
    } else {
      await addDoc(collection(db, "articles"), donnees);
    }

    messageZone.innerHTML = `<div class="formulaire-message succes">Article enregistré avec succès.</div>`;
    reinitialiserFormArticle();
    await rafraichirListeArticles();
  } catch (err) {
    console.error(err);
    messageZone.innerHTML = `<div class="formulaire-message erreur">Erreur : ${err.message}</div>`;
  } finally {
    bouton.disabled = false;
  }
}

/* ============================================================
   EMPLOIS & COLLABORATIONS
   ============================================================ */

let emploiEnEdition = null;

function reinitialiserFormEmploi() {
  emploiEnEdition = null;
  document.getElementById("form-emploi").reset();
  document.getElementById("titre-form-emploi").textContent = "Ajouter une offre";
  document.getElementById("emploi-pdf-actuel").innerHTML = "";
}

function remplirFormEmploi(o) {
  emploiEnEdition = o.id;
  document.getElementById("emploi-titre").value = o.titre || "";
  document.getElementById("emploi-type").value = o.type || "Emploi";
  document.getElementById("emploi-organisation").value = o.organisation || "";
  document.getElementById("emploi-lieu").value = o.lieu || "";
  document.getElementById("emploi-datelimite").value = dateVersInput(o.dateLimite);
  document.getElementById("emploi-description").value = o.description || "";
  document.getElementById("emploi-resume").value = o.resume || "";
  document.getElementById("emploi-lien").value = o.lien || "";
  document.getElementById("emploi-pdf-actuel").innerHTML = o.pdfUrl
    ? `<div class="admin-apercu-actuel">📄 <a href="${o.pdfUrl}" target="_blank" rel="noopener">${o.pdfNom || "PDF actuel"}</a><span>— un nouvel envoi le remplacera</span></div>`
    : "";
  document.getElementById("titre-form-emploi").textContent = "Modifier l'offre";
  document.getElementById("form-emploi").scrollIntoView({ behavior: "smooth", block: "start" });
}

async function rafraichirListeEmplois() {
  const zone = document.getElementById("liste-emplois");
  if (!zone) return;
  zone.innerHTML = "Chargement…";
  try {
    const snap = await getDocs(query(collection(db, "emplois"), orderBy("datePublication", "desc")));
    const offres = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    zone.innerHTML = offres.map(o => `
      <div class="admin-liste-item">
        <div>
          <div class="admin-liste-item-titre">${o.titre || "(sans titre)"}</div>
          <div class="admin-liste-item-meta">${o.type || ""} · ${o.organisation || ""}${o.pdfUrl ? " · 📄 PDF joint" : ""}</div>
        </div>
        <div class="admin-liste-actions">
          <button type="button" data-id="${o.id}" class="btn-modif-emp">Modifier</button>
          <button type="button" data-id="${o.id}" class="supprimer btn-suppr-emp">Supprimer</button>
        </div>
      </div>`).join("") || `<p class="empty-msg">Aucune offre pour le moment.</p>`;

    zone.querySelectorAll(".btn-modif-emp").forEach(b =>
      b.addEventListener("click", () => remplirFormEmploi(offres.find(o => o.id === b.dataset.id))));
    zone.querySelectorAll(".btn-suppr-emp").forEach(b =>
      b.addEventListener("click", () => supprimerEmploi(b.dataset.id)));
  } catch (err) {
    console.error(err);
    zone.innerHTML = `<p class="empty-msg">Erreur de chargement : ${err.message}</p>`;
  }
}

async function supprimerEmploi(id) {
  if (!confirm("Supprimer définitivement cette offre ?")) return;
  await deleteDoc(doc(db, "emplois", id));
  if (emploiEnEdition === id) reinitialiserFormEmploi();
  await rafraichirListeEmplois();
}

async function enregistrerEmploi(e) {
  e.preventDefault();
  const bouton = document.getElementById("emploi-submit");
  const messageZone = document.getElementById("emploi-form-message");
  bouton.disabled = true;
  messageZone.innerHTML = "";

  try {
    const titre = document.getElementById("emploi-titre").value.trim();
    if (!titre) throw new Error("Le titre est obligatoire.");

    let pdfUrl = null, pdfNom = null;
    const fichier = document.getElementById("emploi-pdf-fichier").files[0];
    if (fichier) {
      if (fichier.type !== "application/pdf") throw new Error("Le fichier joint doit être un PDF.");
      pdfUrl = await televerserFichier(fichier, "emplois");
      pdfNom = fichier.name;
    }

    const donnees = {
      titre,
      type: document.getElementById("emploi-type").value,
      organisation: document.getElementById("emploi-organisation").value.trim(),
      lieu: document.getElementById("emploi-lieu").value.trim(),
      dateLimite: inputVersTimestamp(document.getElementById("emploi-datelimite").value),
      description: document.getElementById("emploi-description").value.trim(),
      resume: document.getElementById("emploi-resume").value.trim(),
      lien: document.getElementById("emploi-lien").value.trim() || null,
      datePublication: Timestamp.now()
    };
    if (pdfUrl) { donnees.pdfUrl = pdfUrl; donnees.pdfNom = pdfNom; }

    if (emploiEnEdition) {
      delete donnees.datePublication;
      await setDoc(doc(db, "emplois", emploiEnEdition), donnees, { merge: true });
    } else {
      await addDoc(collection(db, "emplois"), donnees);
    }

    messageZone.innerHTML = `<div class="formulaire-message succes">Offre enregistrée avec succès.</div>`;
    reinitialiserFormEmploi();
    await rafraichirListeEmplois();
  } catch (err) {
    console.error(err);
    messageZone.innerHTML = `<div class="formulaire-message erreur">Erreur : ${err.message}</div>`;
  } finally {
    bouton.disabled = false;
  }
}

/* ============================================================
   MESSAGES & NEWSLETTER (lecture seule)
   ============================================================ */

async function rafraichirMessages() {
  const zone = document.getElementById("liste-messages");
  if (!zone) return;
  try {
    const snap = await getDocs(query(collection(db, "messages"), orderBy("date", "desc")));
    const messages = snap.docs.map(d => d.data());
    zone.innerHTML = messages.map(m => `
      <div class="admin-liste-item">
        <div>
          <div class="admin-liste-item-titre">${echapperHTML(m.nom)} — ${echapperHTML(m.email)}</div>
          <div class="admin-liste-item-meta">${echapperHTML(m.sujet) || "(sans sujet)"} · ${formaterDateAffichage(m.date)}</div>
          <p style="font-family:var(--police-lecture); margin-top:4px;">${echapperHTML(m.message)}</p>
        </div>
      </div>`).join("") || `<p class="empty-msg">Aucun message.</p>`;
  } catch (err) {
    console.error(err);
    zone.innerHTML = `<p class="empty-msg">Erreur de chargement : ${err.message}</p>`;
  }
}

async function rafraichirNewsletter() {
  const zone = document.getElementById("liste-newsletter");
  if (!zone) return;
  try {
    const snap = await getDocs(query(collection(db, "newsletter"), orderBy("date", "desc")));
    const abonnes = snap.docs.map(d => d.data());
    zone.innerHTML = `<p class="formulaire-note">${abonnes.length} abonné(e)(s)</p>` +
      abonnes.map(a => `<div class="admin-liste-item"><div class="admin-liste-item-titre">${echapperHTML(a.email)}</div></div>`).join("");
  } catch (err) {
    console.error(err);
    zone.innerHTML = `<p class="empty-msg">Erreur de chargement : ${err.message}</p>`;
  }
}

/* ---------- Lancement ---------- */

document.addEventListener("DOMContentLoaded", () => {
  initAccesAdmin();
  const formArticle = document.getElementById("form-article");
  if (formArticle) formArticle.addEventListener("submit", enregistrerArticle);
  const annulerArticle = document.getElementById("annuler-article");
  if (annulerArticle) annulerArticle.addEventListener("click", reinitialiserFormArticle);

  const formEmploi = document.getElementById("form-emploi");
  if (formEmploi) formEmploi.addEventListener("submit", enregistrerEmploi);
  const annulerEmploi = document.getElementById("annuler-emploi");
  if (annulerEmploi) annulerEmploi.addEventListener("click", reinitialiserFormEmploi);
});

