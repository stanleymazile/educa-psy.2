/* ============================================================
   EDUCA-PSY — newsletter-firebase.js
   ============================================================
   Widget d'inscription à la newsletter (présent dans le pied de
   page de toutes les pages). Enregistre l'e-mail dans Firestore,
   collection "newsletter" — consultable dans le panneau
   d'administration (admin.html) ou la console Firebase.
   ============================================================ */

import { db } from "./firebase-config.js";
import { doc, setDoc, updateDoc, Timestamp } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore-lite.js";

function t(cle) {
  return window.EducaPsyI18n ? window.EducaPsyI18n.texte(cle) : cle;
}

// Identifiant de document stable à partir de l'e-mail : une même adresse
// qui s'inscrit deux fois met simplement à jour le même document, sans doublon.
function idDepuisEmail(email) {
  return email.trim().toLowerCase().replace(/[^a-z0-9@._-]/g, "_");
}

function initNewsletter() {
  const form = document.getElementById("newsletter-form");
  if (!form) return;

  const bouton = document.getElementById("newsletter-submit");
  const messageZone = document.getElementById("newsletter-message");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("newsletter-email").value.trim();
    if (!email) {
      messageZone.innerHTML = `<div class="formulaire-message erreur">${t("champs_obligatoires")}</div>`;
      return;
    }

    bouton.disabled = true;
    messageZone.innerHTML = "";

    try {
      await setDoc(doc(db, "newsletter", idDepuisEmail(email)), {
        email,
        date: Timestamp.now(),
        actif: true
      });
      form.reset();
      messageZone.innerHTML = `<div class="formulaire-message succes">${t("newsletter_succes")}</div>`;
    } catch (err) {
      console.error("Erreur Firestore (newsletter) :", err);
      messageZone.innerHTML = `<div class="formulaire-message erreur">${t("contact_erreur")}</div>`;
    } finally {
      bouton.disabled = false;
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initNewsletter();
  initDesabonnement();
});

/* ---------- Page desabonnement.html ---------- */

function initDesabonnement() {
  const form = document.getElementById("desabo-form");
  if (!form) return;

  const bouton = document.getElementById("desabo-submit");
  const messageZone = document.getElementById("desabo-message");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("desabo-email").value.trim();
    if (!email) {
      messageZone.innerHTML = `<div class="formulaire-message erreur">${t("champs_obligatoires")}</div>`;
      return;
    }

    bouton.disabled = true;
    messageZone.innerHTML = "";

    try {
      await updateDoc(doc(db, "newsletter", idDepuisEmail(email)), { actif: false });
      form.reset();
      messageZone.innerHTML = `<div class="formulaire-message succes">${t("desabo_succes")}</div>`;
    } catch (err) {
      console.error("Erreur Firestore (désabonnement) :", err);
      // Cas le plus courant : l'adresse n'a jamais été inscrite (le document n'existe pas).
      messageZone.innerHTML = `<div class="formulaire-message erreur">${t("desabo_erreur")}</div>`;
    } finally {
      bouton.disabled = false;
    }
  });
}
