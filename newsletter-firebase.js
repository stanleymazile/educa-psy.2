/* ============================================================
   EDUCA-PSY — newsletter-firebase.js
   ============================================================
   Inscription newsletter → Firestore + email de bienvenue
   via EmailJS (gratuit, 200 emails/mois).
   ============================================================ */

import { db } from "./firebase-config.js";
import { doc, setDoc, updateDoc, Timestamp } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore-lite.js";

const EMAILJS_SERVICE_ID  = "service_ncxaav8";
const EMAILJS_TEMPLATE_ID = "template_qvl72nk";
const EMAILJS_PUBLIC_KEY  = "jk3i1fiiAn_HcLZf2";

function t(cle) {
  return window.EducaPsyI18n ? window.EducaPsyI18n.texte(cle) : cle;
}

function idDepuisEmail(email) {
  return email.trim().toLowerCase().replace(/[^a-z0-9@._-]/g, "_");
}

/* Charge le SDK EmailJS dynamiquement (pas besoin de modifier les HTML) */
function chargerEmailJS() {
  return new Promise((resolve) => {
    if (window.emailjs) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js";
    script.onload = () => {
      window.emailjs.init(EMAILJS_PUBLIC_KEY);
      resolve();
    };
    script.onerror = () => {
      console.warn("EmailJS non chargé — email de bienvenue non envoyé.");
      resolve(); // on continue même si EmailJS échoue
    };
    document.head.appendChild(script);
  });
}

/* Envoie l'email de bienvenue via EmailJS */
async function envoyerEmailBienvenue(email) {
  try {
    await chargerEmailJS();
    await window.emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
      to_email: email
    });
    console.log("Email de bienvenue envoyé à :", email);
  } catch (err) {
    console.warn("Erreur EmailJS (non bloquant) :", err);
    // L'abonnement Firestore est déjà enregistré — on ne bloque pas l'utilisateur
  }
}

/* ---------- Widget newsletter (toutes les pages) ---------- */

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
      // 1. Enregistrer dans Firestore
      await setDoc(doc(db, "newsletter", idDepuisEmail(email)), {
        email,
        date: Timestamp.now(),
        actif: true
      });

      // 2. Envoyer l'email de bienvenue
      await envoyerEmailBienvenue(email);

      form.reset();
      messageZone.innerHTML = `<div class="formulaire-message succes">${t("newsletter_succes")}</div>`;
    } catch (err) {
      console.error("Erreur newsletter :", err);
      messageZone.innerHTML = `<div class="formulaire-message erreur">${t("contact_erreur")}</div>`;
    } finally {
      bouton.disabled = false;
    }
  });
}

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
      messageZone.innerHTML = `
        <div class="formulaire-message succes">
          ${t("desabo_succes")}<br>
          <small style="margin-top:0.5rem;display:block;">
            Vous pouvez vous réabonner à tout moment — 
            <a href="#" id="lien-reabonnement" style="color:inherit;font-weight:600;">cliquez ici</a>.
          </small>
        </div>`;

      // Clic sur "cliquez ici" → réaffiche le formulaire pré-rempli
      const lienReabo = document.getElementById("lien-reabonnement");
      if (lienReabo) {
        lienReabo.addEventListener("click", async (e) => {
          e.preventDefault();
          const emailPrecedent = document.getElementById("desabo-email")?.value || "";
          messageZone.innerHTML = "";
          form.style.display = "block";

          // Si on est sur desabonnement.html, on peut proposer de re-s'abonner via Firestore
          try {
            await setDoc(doc(db, "newsletter", idDepuisEmail(email)), {
              email,
              date: Timestamp.now(),
              actif: true
            });
            await envoyerEmailBienvenue(email);
            messageZone.innerHTML = `<div class="formulaire-message succes">${t("newsletter_succes")}</div>`;
          } catch (err) {
            console.error("Erreur réabonnement :", err);
          }
        });
      }
    } catch (err) {
      console.error("Erreur désabonnement :", err);
      messageZone.innerHTML = `<div class="formulaire-message erreur">${t("desabo_erreur")}</div>`;
    } finally {
      bouton.disabled = false;
    }
  });
}

/* ---------- Lancement ---------- */

document.addEventListener("DOMContentLoaded", () => {
  initNewsletter();
  initDesabonnement();
});

