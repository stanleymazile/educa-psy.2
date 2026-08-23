/* ============================================================
   EDUCA-PSY — newsletter-firebase.js
   ============================================================
   Inscription newsletter →
   1. Enregistrement dans Firestore
   2. Email de bienvenue via EmailJS
   3. Ajout automatique dans Brevo (envoi newsletter hebdo)
   ============================================================ */

import { db } from "./firebase-config.js";
import { doc, setDoc, updateDoc, Timestamp } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore-lite.js";

/* ── Clés ─────────────────────────────────────────────────── */
const EMAILJS_SERVICE_ID  = "service_ncxaav8";
const EMAILJS_TEMPLATE_ID = "template_qvl72nk";
const EMAILJS_PUBLIC_KEY  = "jk3i1fiiAn_HcLZf2";

const BREVO_FORM_URL = "https://84946aa1.sibforms.com/v2/serve/MUIFAPHTLJkBwJPiLKdrHzvwhNGOfA7zBsxGJRVpNSk9rc48fne8FFslchqw5GaAVXwCafzMPWlDI4ZHgQRCilJ__UQzBUApa6FvOy66y1dXKghMN0R2WqRugYxWALnMRz4E5tkAxBjJH4WOiSr7vKrlAcZC4sDGxt85a50QeuMOSuye4dPF3v3Ey7MENy76ySKKSjXUrGsuR11mbQ==";

function t(cle) {
  return window.EducaPsyI18n ? window.EducaPsyI18n.texte(cle) : cle;
}

function idDepuisEmail(email) {
  return email.trim().toLowerCase().replace(/[^a-z0-9@._-]/g, "_");
}

/* ── EmailJS ──────────────────────────────────────────────── */

function chargerEmailJS() {
  return new Promise((resolve) => {
    if (window.emailjs) { resolve(); return; }
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js";
    script.onload = () => { window.emailjs.init(EMAILJS_PUBLIC_KEY); resolve(); };
    script.onerror = () => { console.warn("EmailJS non chargé."); resolve(); };
    document.head.appendChild(script);
  });
}

async function envoyerEmailBienvenue(email) {
  try {
    await chargerEmailJS();
    await window.emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, { to_email: email });
    console.log("Email de bienvenue envoyé :", email);
  } catch (err) {
    console.warn("Erreur EmailJS (non bloquant) :", err);
  }
}

/* ── Brevo (formulaire embed — aucune clé API exposée) ─────── */

async function ajouterDansBrevo(email) {
  try {
    const formData = new FormData();
    formData.append("EMAIL", email);
    formData.append("email_address_check", ""); // champ honeypot anti-spam
    formData.append("locale", "fr");

    await fetch(BREVO_FORM_URL, {
      method: "POST",
      body: formData,
      mode: "no-cors" // cross-origin — réponse opaque mais envoi confirmé
    });
    console.log("Contact soumis à Brevo :", email);
  } catch (err) {
    console.warn("Erreur Brevo (non bloquant) :", err);
  }
}

/* ── Widget newsletter (toutes les pages) ─────────────────── */

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
      // 1. Firestore
      await setDoc(doc(db, "newsletter", idDepuisEmail(email)), {
        email,
        date: Timestamp.now(),
        actif: true
      });

      // 2. Email de bienvenue
      await envoyerEmailBienvenue(email);

      // 3. Brevo
      await ajouterDansBrevo(email);

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

/* ── Page desabonnement.html ──────────────────────────────── */

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
      // 1. Firestore
      await updateDoc(doc(db, "newsletter", idDepuisEmail(email)), { actif: false });
      // Note : la désinscription Brevo se fait via le lien en bas de chaque newsletter

      form.reset();
      messageZone.innerHTML = `
        <div class="formulaire-message succes">
          ${t("desabo_succes")}<br>
          <small style="margin-top:0.5rem;display:block;">
            Vous pouvez vous réabonner à tout moment — 
            <a href="#" id="lien-reabonnement" style="color:inherit;font-weight:600;">cliquez ici</a>.
          </small>
        </div>`;

      // Lien réabonnement
      const lienReabo = document.getElementById("lien-reabonnement");
      if (lienReabo) {
        lienReabo.addEventListener("click", async (ev) => {
          ev.preventDefault();
          try {
            await setDoc(doc(db, "newsletter", idDepuisEmail(email)), {
              email, date: Timestamp.now(), actif: true
            });
            await envoyerEmailBienvenue(email);
            await ajouterDansBrevo(email);
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

/* ── Lancement ────────────────────────────────────────────── */

document.addEventListener("DOMContentLoaded", () => {
  initNewsletter();
  initDesabonnement();
});

