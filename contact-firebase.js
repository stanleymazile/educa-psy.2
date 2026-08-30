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
  if (!form) return; // Pas sur la page contact

  const bouton = document.getElementById("contact-submit");
  const messageZone = document.getElementById("contact-message");

  // Horodatage de chargement de la page pour bloquer les spambots ultra-rapides
  const tempsChargementPage = Date.now();

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // 1. Protection Anti-Spam basique (les bots soumettent en moins de 1.5s)
    const tempsEcoule = Date.now() - tempsChargementPage;
    if (tempsEcoule < 1500) {
      console.warn("Soumission suspecte (trop rapide). Interrompue.");
      return;
    }

    const nom = document.getElementById("contact-nom").value.trim();
    const email = document.getElementById("contact-email").value.trim();
    const sujet = document.getElementById("contact-sujet") ? document.getElementById("contact-sujet").value.trim() : "";
    const message = document.getElementById("contact-texte").value.trim();

    // Validation du format d'adresse e-mail avec Regex
    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Validation des champs obligatoires
    if (!nom || !email || !message) {
      messageZone.innerHTML = `<div class="formulaire-message erreur" role="alert">${t("champs_obligatoires")}</div>`;
      return;
    }

    if (!regexEmail.test(email)) {
      messageZone.innerHTML = `<div class="formulaire-message erreur" role="alert">${t("email_invalide") || "Veuillez entrer une adresse e-mail valide."}</div>`;
      return;
    }

    // Mise à jour de l'état de l'UI pendant le chargement (Accessibilité et UX)
    bouton.disabled = true;
    bouton.setAttribute("aria-busy", "true");
    const texteOriginalBouton = bouton.textContent;
    bouton.textContent = t("contact_envoi_cours");
    messageZone.innerHTML = "";

    try {
      // Détection de la langue active du site pour le rapport Firestore
      const langueActuelle = document.documentElement.lang || "fr";

      await addDoc(collection(db, "messages"), {
        nom,
        email,
        sujet,
        message,
        langue: langueActuelle,
        date: Timestamp.now(),
        lu: false,
        origine: window.location.href
      });

      form.reset();
      messageZone.innerHTML = `<div class="formulaire-message succes" role="status">${t("contact_succes")}</div>`;
    } catch (err) {
      console.error("Erreur Firestore (contact) :", err);
      messageZone.innerHTML = `<div class="formulaire-message erreur" role="alert">${t("contact_erreur")}</div>`;
    } finally {
      bouton.disabled = false;
      bouton.removeAttribute("aria-busy");
      bouton.textContent = texteOriginalBouton || t("contact_envoyer");
    }
  });
}

document.addEventListener("DOMContentLoaded", initFormulaireContact);
