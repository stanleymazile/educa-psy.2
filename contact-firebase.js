/* ============================================================
   EDUCA-PSY — contact-firebase.js
   ============================================================
   Envoie les messages du formulaire de contact vers la
   collection Firestore "messages". Consultez-les dans
   Firebase Console → Firestore Database → Données → messages.
   ============================================================ */

import { db } from "./firebase-config.js";
import { collection, addDoc, Timestamp } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore-lite.js";

function t(cle) {
  return window.EducaPsyI18n ? window.EducaPsyI18n.texte(cle) : cle;
}

function initFormulaireContact() {
  const form = document.getElementById("contact-form");
  if (!form) return; // pas sur la page contact

  const bouton = document.getElementById("contact-submit");
  const messageZone = document.getElementById("contact-message");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nom = document.getElementById("contact-nom").value.trim();
    const email = document.getElementById("contact-email").value.trim();
    const sujet = document.getElementById("contact-sujet").value.trim();
    const message = document.getElementById("contact-texte").value.trim();

    if (!nom || !email || !message) return;

    bouton.disabled = true;
    bouton.textContent = t("contact_envoi_cours");
    messageZone.innerHTML = "";

    try {
      await addDoc(collection(db, "messages"), {
        nom, email, sujet, message,
        date: Timestamp.now(),
        lu: false
      });
      form.reset();
      messageZone.innerHTML = `<div class="formulaire-message succes">${t("contact_succes")}</div>`;
    } catch (err) {
      console.error("Erreur Firestore (contact) :", err);
      messageZone.innerHTML = `<div class="formulaire-message erreur">${t("contact_erreur")}</div>`;
    } finally {
      bouton.disabled = false;
      bouton.textContent = t("contact_envoyer");
    }
  });
}

document.addEventListener("DOMContentLoaded", initFormulaireContact);

