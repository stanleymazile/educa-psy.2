/* ============================================================
   EDUCA-PSY — admin-firebase.js (Version Optimisée & SEO/Discover)
   ============================================================ */

import { db, auth, storage, ADMIN_EMAILS } from "./firebase-config.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";
import {
  collection, getDocs, doc, setDoc, addDoc, deleteDoc, query, orderBy, Timestamp, deleteField
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-storage.js";

/* ---------- Outils & Helpers ---------- */

function dateVersInput(valeur) {
  if (!valeur) return "";
  const d = valeur.toDate ? valeur.toDate() : new Date(valeur);
  if (isNaN(d.getTime())) return "";
  const annee = d.getFullYear();
  const mois = String(d.getMonth() + 1).padStart(2, "0");
  const jour = String(d.getDate()).padStart(2, "0");
  return `${annee}-${mois}-${jour}`;
}

function inputVersTimestamp(valeur) {
  if (!valeur) return null;
  const [annee, mois, jour] = valeur.split("-").map(Number);
  if (!annee || !mois || !jour) return null;
  return Timestamp.fromDate(new Date(annee, mois - 1, jour, 12, 0, 0));
}

function formaterDateAffichage(valeur) {
  if (!valeur) return "";
  const d = valeur.toDate ? valeur.toDate() : new Date(valeur);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "long",
    day: "numeric"
  });
}

async function televerserFichier(file, dossier) {
  const chemin = `${dossier}/${Date.now()}_${file.name}`;
  const storageRef = ref(storage, chemin);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
}

async function supprimerFichierStorageParUrl(url) {
  if (!url || !url.includes("firebasestorage.googleapis.com")) return;
  try {
    const storageRef = ref(storage, url);
    await deleteObject(storageRef);
  } catch (err) {
    console.warn("Avertissement : Impossible de supprimer le fichier du Storage :", err.message);
  }
}

function echapperHTML(texte) {
  const div = document.createElement("div");
  div.textContent = texte == null ? "" : String(texte);
  return div.innerHTML;
}

function afficherMessageSysteme(elementId, message, estErreur = false) {
  const el = document.getElementById(elementId);
  if (!el) return;
  const classeMsg = estErreur ? "erreur" : "succes";
  el.innerHTML = `<div class="formulaire-message ${classeMsg}">${echapperHTML(message)}</div>`;
}

/* ---------- Accès & Authentification ---------- */

function initAccesAdmin() {
  const verif = document.getElementById("admin-verification");
  if (!verif) return;

  onAuthStateChanged(auth, (user) => {
    const refuse = document.getElementById("admin-refuse");
    const contenu = document.getElementById("admin-contenu");
    verif.style.display = "none";

    if (user && ADMIN_EMAILS.includes(user.email)) {
      if (refuse) refuse.style.display = "none";
      if (contenu) contenu.style.display = "block";
      
      const elEmail = document.getElementById("admin-connecte-comme");
      if (elEmail) elEmail.textContent = user.email;

      rafraichirListeArticles();
      rafraichirListeEmplois();
      rafraichirMessages();
      rafraichirNewsletter();
    } else {
      if (contenu) contenu.style.display = "none";
      if (refuse) refuse.style.display = "block";
    }
  });

  const btnDeco = document.getElementById("admin-deconnexion");
  if (btnDeco) btnDeco.addEventListener("click", () => signOut(auth));

  document.querySelectorAll(".admin-tab").forEach(onglet => {
    onglet.addEventListener("click", () => {
      document.querySelectorAll(".admin-tab").forEach(o => o.classList.remove("active"));
      onglet.classList.add("active");
      document.querySelectorAll(".admin-panneau").forEach(p => p.style.display = "none");
      const elPanneau = document.getElementById("panneau-" + onglet.dataset.panneau);
      if (elPanneau) elPanneau.style.display = "block";
    });
  });
}

/* ============================================================
   ARTICLES (Multilingue : FR / EN / HT / ES + SEO & Discover)
   ============================================================ */

const LANGUES = ["en", "ht", "es"];
let cacheArticles = [];
let articleEnEdition = null;

function reinitialiserFormArticle() {
  articleEnEdition = null;
  const form = document.getElementById("form-article");
  if (form) form.reset();

  const elTitreForm = document.getElementById("titre-form-article");
  if (elTitreForm) elTitreForm.textContent = "Ajouter un article";

  const elApercu = document.getElementById("article-image-actuelle");
  if (elApercu) elApercu.innerHTML = "";

  const messageZone = document.getElementById("article-form-message");
  if (messageZone) messageZone.innerHTML = "";

  for (const lg of LANGUES) {
    const elT = document.getElementById(`article-titre-${lg}`);
    const elR = document.getElementById(`article-resume-${lg}`);
    const elC = document.getElementById(`article-contenu-${lg}`);
    if (elT) elT.value = "";
    if (elR) elR.value = "";
    if (elC) elC.value = "";
  }
}

function remplirFormArticle(a) {
  articleEnEdition = a.id;

  const elTitre = document.getElementById("article-titre");
  const elCat = document.getElementById("article-categorie");
  const elAuteur = document.getElementById("article-auteur");
  const elDate = document.getElementById("article-date");
  const elResume = document.getElementById("article-resume");
  const elContenu = document.getElementById("article-contenu");
  const elImg = document.getElementById("article-image");
  const elALaUne = document.getElementById("article-alaune");

  if (elTitre) elTitre.value = a.titre || "";
  if (elCat) elCat.value = a.categorie || "Éducation";
  if (elAuteur) elAuteur.value = a.auteur || "Équipe Educa-Psy";
  if (elDate) elDate.value = dateVersInput(a.date);
  if (elResume) elResume.value = a.resume || "";
  if (elContenu) elContenu.value = Array.isArray(a.contenu) ? a.contenu.join("\n\n") : (a.contenu || "");
  if (elImg) elImg.value = a.image || "";
  if (elALaUne) elALaUne.checked = !!a.aLaUne;

  for (const lg of LANGUES) {
    const elT = document.getElementById(`article-titre-${lg}`);
    const elR = document.getElementById(`article-resume-${lg}`);
    const elC = document.getElementById(`article-contenu-${lg}`);

    if (elT) elT.value = a[`titre_${lg}`] || "";
    if (elR) elR.value = a[`resume_${lg}`] || "";
    if (elC) elC.value = Array.isArray(a[`contenu_${lg}`]) ? a[`contenu_${lg}`].join("\n\n") : (a[`contenu_${lg}`] || "");
  }

  const elTitreForm = document.getElementById("titre-form-article");
  if (elTitreForm) elTitreForm.textContent = "Modifier l'article";

  const elApercu = document.getElementById("article-image-actuelle");
  if (elApercu) {
    elApercu.innerHTML = a.image
      ? `<div class="admin-apercu-actuel"><img src="${a.image}" alt=""><span>Image actuelle — un nouvel envoi ou une URL la remplacera</span></div>`
      : "";
  }

  const form = document.getElementById("form-article");
  if (form) form.scrollIntoView({ behavior: "smooth", block: "start" });
}

async function rafraichirListeArticles() {
  const zone = document.getElementById("liste-articles");
  if (!zone) return;
  zone.innerHTML = "Chargement…";
  try {
    const snap = await getDocs(query(collection(db, "articles"), orderBy("date", "desc")));
    cacheArticles = snap.docs.map(d => ({ id: d.id, ...d.data() }));

    zone.innerHTML = cacheArticles.map(a => `
      <div class="admin-liste-item">
        <div>
          <div class="admin-liste-item-titre">${echapperHTML(a.titre) || "(sans titre)"}</div>
          <div class="admin-liste-item-meta">${echapperHTML(a.categorie) || ""} · ${formaterDateAffichage(a.date)}${a.aLaUne ? " · À la une" : ""}${LANGUES.filter(lg => a[`titre_${lg}`]).map(lg => ` · ${lg.toUpperCase()}✓`).join("")}</div>
        </div>
        <div class="admin-liste-actions">
          <button type="button" data-id="${a.id}" class="btn-modif-art">Modifier</button>
          <button type="button" data-id="${a.id}" class="supprimer btn-suppr-art">Supprimer</button>
        </div>
      </div>`).join("") || `<p class="empty-msg">Aucun article pour le moment.</p>`;

    zone.querySelectorAll(".btn-modif-art").forEach(b =>
      b.addEventListener("click", () => remplirFormArticle(cacheArticles.find(a => a.id === b.dataset.id))));
    zone.querySelectorAll(".btn-suppr-art").forEach(b =>
      b.addEventListener("click", () => supprimerArticle(b.dataset.id)));
  } catch (err) {
    console.error("Erreur chargement articles :", err);
    zone.innerHTML = `<p class="empty-msg">Erreur de chargement : ${echapperHTML(err.message)}</p>`;
  }
}

async function supprimerArticle(id) {
  if (!confirm("Supprimer définitivement cet article ?")) return;
  try {
    const art = cacheArticles.find(a => a.id === id);
    if (art && art.image) {
      await supprimerFichierStorageParUrl(art.image);
    }
    await deleteDoc(doc(db, "articles", id));
    if (articleEnEdition === id) reinitialiserFormArticle();
    await rafraichirListeArticles();
  } catch (err) {
    console.error("Erreur lors de la suppression de l'article :", err);
    afficherMessageSysteme("article-form-message", "Erreur lors de la suppression : " + err.message, true);
  }
}

async function enregistrerArticle(e) {
  e.preventDefault();
  const bouton = document.getElementById("article-submit");
  const messageZone = document.getElementById("article-form-message");
  if (bouton) bouton.disabled = true;
  if (messageZone) messageZone.innerHTML = "";

  try {
    const elImg = document.getElementById("article-image");
    const elFichier = document.getElementById("article-image-fichier");
    let imageUrl = elImg ? elImg.value.trim() : "";

    const artExistant = articleEnEdition ? cacheArticles.find(a => a.id === articleEnEdition) : null;

    if (elFichier && elFichier.files[0]) {
      imageUrl = await televerserFichier(elFichier.files[0], "articles");
      if (artExistant && artExistant.image && artExistant.image !== imageUrl) {
        await supprimerFichierStorageParUrl(artExistant.image);
      }
    } else if (!imageUrl && artExistant && artExistant.image) {
      imageUrl = artExistant.image;
    }

    const elContenu = document.getElementById("article-contenu");
    const contenu = elContenu
      ? elContenu.value.split(/\n\s*\n/).map(p => p.trim()).filter(Boolean)
      : [];

    const elTitre = document.getElementById("article-titre");
    const titre = elTitre ? elTitre.value.trim() : "";

    if (!titre || !contenu.length) throw new Error("Le titre principal et le contenu sont obligatoires.");

    const elCat = document.getElementById("article-categorie");
    const elAuteur = document.getElementById("article-auteur");
    const elDate = document.getElementById("article-date");
    const elResume = document.getElementById("article-resume");
    const elALaUne = document.getElementById("article-alaune");

    let resumeGenere = elResume ? elResume.value.trim() : "";
    if (!resumeGenere && contenu.length > 0) {
      resumeGenere = contenu[0].slice(0, 155) + (contenu[0].length > 155 ? "..." : "");
    }

    const dateAujourdhui = Timestamp.now();

    const donnees = {
      titre,
      categorie: elCat ? elCat.value : "Éducation",
      auteur: elAuteur && elAuteur.value.trim() ? elAuteur.value.trim() : "Équipe Educa-Psy",
      date: elDate && elDate.value ? (inputVersTimestamp(elDate.value) || dateAujourdhui) : dateAujourdhui,
      dateModification: dateAujourdhui,
      resume: resumeGenere,
      contenu,
      aLaUne: elALaUne ? elALaUne.checked : false
    };

    if (imageUrl) {
      donnees.image = imageUrl;
    } else {
      donnees.image = deleteField();
    }

    for (const lg of LANGUES) {
      const elT = document.getElementById(`article-titre-${lg}`);
      const elR = document.getElementById(`article-resume-${lg}`);
      const elC = document.getElementById(`article-contenu-${lg}`);

      const t = elT ? elT.value.trim() : "";
      const r = elR ? elR.value.trim() : "";
      const c = elC ? elC.value.split(/\n\s*\n/).map(p => p.trim()).filter(Boolean) : [];

      if (t) donnees[`titre_${lg}`] = t; else donnees[`titre_${lg}`] = deleteField();
      if (r) donnees[`resume_${lg}`] = r; else donnees[`resume_${lg}`] = deleteField();
      if (c.length) donnees[`contenu_${lg}`] = c; else donnees[`contenu_${lg}`] = deleteField();
    }

    if (articleEnEdition) {
      await setDoc(doc(db, "articles", articleEnEdition), donnees, { merge: true });
    } else {
      await addDoc(collection(db, "articles"), donnees);
    }

    afficherMessageSysteme("article-form-message", "Article enregistré avec succès.");
    reinitialiserFormArticle();
    await rafraichirListeArticles();
  } catch (err) {
    console.error("Erreur enregistrement article :", err);
    afficherMessageSysteme("article-form-message", "Erreur : " + err.message, true);
  } finally {
    if (bouton) bouton.disabled = false;
  }
}

/* ============================================================
   EMPLOIS & COLLABORATIONS
   ============================================================ */

let cacheEmplois = [];
let emploiEnEdition = null;

function reinitialiserFormEmploi() {
  emploiEnEdition = null;
  const form = document.getElementById("form-emploi");
  if (form) form.reset();

  const elTitreForm = document.getElementById("titre-form-emploi");
  if (elTitreForm) elTitreForm.textContent = "Ajouter une offre";

  const elPdfActuel = document.getElementById("emploi-pdf-actuel");
  if (elPdfActuel) elPdfActuel.innerHTML = "";

  const messageZone = document.getElementById("emploi-form-message");
  if (messageZone) messageZone.innerHTML = "";
}

function remplirFormEmploi(o) {
  emploiEnEdition = o.id;

  const elTitre = document.getElementById("emploi-titre");
  const elType = document.getElementById("emploi-type");
  const elOrg = document.getElementById("emploi-organisation");
  const elLieu = document.getElementById("emploi-lieu");
  const elDate = document.getElementById("emploi-datelimite");
  const elDesc = document.getElementById("emploi-description");
  const elResume = document.getElementById("emploi-resume");
  const elLien = document.getElementById("emploi-lien");

  if (elTitre) elTitre.value = o.titre || "";
  if (elType) elType.value = o.type || "Emploi";
  if (elOrg) elOrg.value = o.organisation || "";
  if (elLieu) elLieu.value = o.lieu || "";
  if (elDate) elDate.value = dateVersInput(o.dateLimite);
  if (elDesc) elDesc.value = o.description || "";
  if (elResume) elResume.value = o.resume || "";
  if (elLien) elLien.value = o.lien || "";

  const elPdfActuel = document.getElementById("emploi-pdf-actuel");
  if (elPdfActuel) {
    elPdfActuel.innerHTML = o.pdfUrl
      ? `<div class="admin-apercu-actuel">📄 <a href="${o.pdfUrl}" target="_blank" rel="noopener">${echapperHTML(o.pdfNom || "PDF actuel")}</a><span> — un nouvel envoi le remplacera</span></div>`
      : "";
  }

  const elTitreForm = document.getElementById("titre-form-emploi");
  if (elTitreForm) elTitreForm.textContent = "Modifier l'offre";

  const form = document.getElementById("form-emploi");
  if (form) form.scrollIntoView({ behavior: "smooth", block: "start" });
}

async function rafraichirListeEmplois() {
  const zone = document.getElementById("liste-emplois");
  if (!zone) return;
  zone.innerHTML = "Chargement…";
  try {
    const snap = await getDocs(query(collection(db, "emplois"), orderBy("datePublication", "desc")));
    cacheEmplois = snap.docs.map(d => ({ id: d.id, ...d.data() }));

    zone.innerHTML = cacheEmplois.map(o => `
      <div class="admin-liste-item">
        <div>
          <div class="admin-liste-item-titre">${echapperHTML(o.titre) || "(sans titre)"}</div>
          <div class="admin-liste-item-meta">${echapperHTML(o.type) || ""} · ${echapperHTML(o.organisation) || ""}${o.pdfUrl ? " · 📄 PDF joint" : ""}</div>
        </div>
        <div class="admin-liste-actions">
          <button type="button" data-id="${o.id}" class="btn-modif-emp">Modifier</button>
          <button type="button" data-id="${o.id}" class="supprimer btn-suppr-emp">Supprimer</button>
        </div>
      </div>`).join("") || `<p class="empty-msg">Aucune offre pour le moment.</p>`;

    zone.querySelectorAll(".btn-modif-emp").forEach(b =>
      b.addEventListener("click", () => remplirFormEmploi(cacheEmplois.find(o => o.id === b.dataset.id))));
    zone.querySelectorAll(".btn-suppr-emp").forEach(b =>
      b.addEventListener("click", () => supprimerEmploi(b.dataset.id)));
  } catch (err) {
    console.error("Erreur chargement emplois :", err);
    zone.innerHTML = `<p class="empty-msg">Erreur de chargement : ${echapperHTML(err.message)}</p>`;
  }
}

async function supprimerEmploi(id) {
  if (!confirm("Supprimer définitivement cette offre ?")) return;
  try {
    const emp = cacheEmplois.find(o => o.id === id);
    if (emp && emp.pdfUrl) {
      await supprimerFichierStorageParUrl(emp.pdfUrl);
    }
    await deleteDoc(doc(db, "emplois", id));
    if (emploiEnEdition === id) reinitialiserFormEmploi();
    await rafraichirListeEmplois();
  } catch (err) {
    console.error("Erreur lors de la suppression de l'offre :", err);
    afficherMessageSysteme("emploi-form-message", "Erreur lors de la suppression : " + err.message, true);
  }
}

async function enregistrerEmploi(e) {
  e.preventDefault();
  const bouton = document.getElementById("emploi-submit");
  const messageZone = document.getElementById("emploi-form-message");
  if (bouton) bouton.disabled = true;
  if (messageZone) messageZone.innerHTML = "";

  try {
    const elTitre = document.getElementById("emploi-titre");
    const titre = elTitre ? elTitre.value.trim() : "";
    if (!titre) throw new Error("Le titre est obligatoire.");

    let pdfUrl = null, pdfNom = null;
    const elFichier = document.getElementById("emploi-pdf-fichier");
    const fichier = elFichier ? elFichier.files[0] : null;

    const empExistant = emploiEnEdition ? cacheEmplois.find(o => o.id === emploiEnEdition) : null;

    if (fichier) {
      if (fichier.type !== "application/pdf") throw new Error("Le fichier joint doit être un PDF.");
      pdfUrl = await televerserFichier(fichier, "emplois");
      pdfNom = fichier.name;

      if (empExistant && empExistant.pdfUrl) {
        await supprimerFichierStorageParUrl(empExistant.pdfUrl);
      }
    } else if (empExistant && empExistant.pdfUrl) {
      pdfUrl = empExistant.pdfUrl;
      pdfNom = empExistant.pdfNom || "PDF actuel";
    }

    const elType = document.getElementById("emploi-type");
    const elOrg = document.getElementById("emploi-organisation");
    const elLieu = document.getElementById("emploi-lieu");
    const elDate = document.getElementById("emploi-datelimite");
    const elDesc = document.getElementById("emploi-description");
    const elResume = document.getElementById("emploi-resume");
    const elLien = document.getElementById("emploi-lien");

    const donnees = {
      titre,
      type: elType ? elType.value : "Emploi",
      organisation: elOrg ? elOrg.value.trim() : "",
      lieu: elLieu ? elLieu.value.trim() : "",
      dateLimite: elDate && elDate.value ? inputVersTimestamp(elDate.value) : null,
      description: elDesc ? elDesc.value.trim() : "",
      resume: elResume ? elResume.value.trim() : "",
      lien: elLien && elLien.value.trim() ? elLien.value.trim() : null
    };

    if (pdfUrl) {
      donnees.pdfUrl = pdfUrl;
      donnees.pdfNom = pdfNom;
    } else {
      donnees.pdfUrl = deleteField();
      donnees.pdfNom = deleteField();
    }

    if (emploiEnEdition) {
      await setDoc(doc(db, "emplois", emploiEnEdition), donnees, { merge: true });
    } else {
      donnees.datePublication = Timestamp.now();
      await addDoc(collection(db, "emplois"), donnees);
    }

    afficherMessageSysteme("emploi-form-message", "Offre enregistrée avec succès.");
    reinitialiserFormEmploi();
    await rafraichirListeEmplois();
  } catch (err) {
    console.error("Erreur enregistrement emploi :", err);
    afficherMessageSysteme("emploi-form-message", "Erreur : " + err.message, true);
  } finally {
    if (bouton) bouton.disabled = false;
  }
}

/* ============================================================
   MESSAGES & NEWSLETTER (Lecture Seule)
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
    console.error("Erreur chargement messages :", err);
    zone.innerHTML = `<p class="empty-msg">Erreur de chargement : ${echapperHTML(err.message)}</p>`;
  }
}

async function rafraichirNewsletter() {
  const zone = document.getElementById("liste-newsletter");
  if (!zone) return;
  try {
    const snap = await getDocs(query(collection(db, "newsletter"), orderBy("date", "desc")));
    const tous = snap.docs.map(d => d.data());
    const actifs = tous.filter(a => a.actif !== false);

    zone.innerHTML = `<p class="formulaire-note">${actifs.length} abonné(e)(s) actif(s)</p>` +
      (actifs.map(a => `<div class="admin-liste-item"><div class="admin-liste-item-titre">${echapperHTML(a.email)}</div></div>`).join("")
      || `<p class="empty-msg">Aucun abonné actif.</p>`);
  } catch (err) {
    console.error("Erreur chargement newsletter :", err);
    zone.innerHTML = `<p class="empty-msg">Erreur de chargement : ${echapperHTML(err.message)}</p>`;
  }
}

/* ---------- Initialisation au chargement de la page ---------- */

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
