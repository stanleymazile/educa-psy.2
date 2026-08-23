/* ============================================================
   EDUCA-PSY — abonnement-firebase.js
   Page dédiée abonnement.html
   ============================================================ */

import { db } from "./firebase-config.js";
import { doc, setDoc, Timestamp } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore-lite.js";

const EMAILJS_SERVICE_ID  = "service_ncxaav8";
const EMAILJS_TEMPLATE_ID = "template_qvl72nk";
const EMAILJS_PUBLIC_KEY  = "jk3i1fiiAn_HcLZf2";
const BREVO_FORM_URL = "https://84946aa1.sibforms.com/v2/serve/MUIFAPHTLJkBwJPiLKdrHzvwhNGOfA7zBsxGJRVpNSk9rc48fne8FFslchqw5GaAVXwCafzMPWlDI4ZHgQRCilJ__UQzBUApa6FvOy66y1dXKghMN0R2WqRugYxWALnMRz4E5tkAxBjJH4WOiSr7vKrlAcZC4sDGxt85a50QeuMOSuye4dPF3v3Ey7MENy76ySKKSjXUrGsuR11mbQ==";

function idDepuisEmail(email) {
  return email.trim().toLowerCase().replace(/[^a-z0-9@._-]/g, "_");
}

function chargerEmailJS() {
  return new Promise((resolve) => {
    if (window.emailjs) { resolve(); return; }
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js";
    script.onload = () => { window.emailjs.init(EMAILJS_PUBLIC_KEY); resolve(); };
    script.onerror = () => resolve();
    document.head.appendChild(script);
  });
}

async function envoyerEmailBienvenue(email) {
  try {
    await chargerEmailJS();
    await window.emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, { to_email: email });
  } catch (err) {
    console.warn("EmailJS :", err);
  }
}

async function ajouterDansBrevo(email) {
  try {
    const formData = new FormData();
    formData.append("EMAIL", email);
    formData.append("email_address_check", "");
    formData.append("locale", "fr");
    await fetch(BREVO_FORM_URL, { method: "POST", body: formData, mode: "no-cors" });
  } catch (err) {
    console.warn("Brevo :", err);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("abonnement-form");
  if (!form) return;

  const bouton = document.getElementById("abonnement-submit");
  const messageZone = document.getElementById("abonnement-message");

  // Pré-remplir si email passé en paramètre URL (?email=...)
  const params = new URLSearchParams(window.location.search);
  const emailParam = params.get("email");
  if (emailParam) {
    const input = document.getElementById("abonnement-email");
    if (input) input.value = emailParam;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("abonnement-email").value.trim();
    if (!email) return;

    bouton.disabled = true;
    bouton.textContent = "En cours…";
    messageZone.innerHTML = "";

    try {
      await setDoc(doc(db, "newsletter", idDepuisEmail(email)), {
        email, date: Timestamp.now(), actif: true
      });
      await envoyerEmailBienvenue(email);
      await ajouterDansBrevo(email);

      form.style.display = "none";
      messageZone.innerHTML = `
        <div class="formulaire-message succes" style="text-align:center; padding:2rem;">
          <div style="font-size:2.5rem; margin-bottom:1rem;">🎉</div>
          <strong>Bienvenue dans la newsletter Educa-Psy !</strong><br>
          <span style="font-size:0.9rem; opacity:0.85;">Un email de confirmation a été envoyé à <strong>${email}</strong></span>
        </div>`;
    } catch (err) {
      console.error("Erreur abonnement :", err);
      messageZone.innerHTML = `<div class="formulaire-message erreur">Une erreur est survenue. Vérifiez votre email et réessayez.</div>`;
      bouton.disabled = false;
      bouton.textContent = "S'abonner gratuitement";
    }
  });
});

