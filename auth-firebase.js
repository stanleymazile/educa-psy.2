/* ============================================================
   EDUCA-PSY — auth-firebase.js
   ============================================================
   Gestion de l'authentification Firebase (E-mail/Mot de passe + Google Pop-up).
   Interconnecté avec EducaPsyI18n (multilingue) et optimisé pour l'expérience utilisateur.
   ============================================================ */

import { auth } from "./firebase-config.js";
import {
  onAuthStateChanged,
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";

/* Helper de traduction sécurisé avec la librairie EducaPsyI18n */
function t(cle) {
  return window.EducaPsyI18n ? window.EducaPsyI18n.texte(cle) : cle;
}

/* ---------- Zone "connexion" commune à toutes les pages (En-tête / Navbar) ---------- */

function initAuthZone() {
  const zone = document.getElementById("auth-zone");
  if (!zone) return;

  onAuthStateChanged(auth, (user) => {
    if (user) {
      zone.innerHTML = `
        <span class="auth-user-email" title="${user.email}">${user.email}</span>
        <button class="util-btn" id="btn-deconnexion" data-i18n="auth_deconnexion">${t("auth_deconnexion")}</button>`;
      const btn = document.getElementById("btn-deconnexion");
      if (btn) btn.addEventListener("click", () => signOut(auth));
    } else {
      zone.innerHTML = `<a class="util-btn" href="connexion.html" data-i18n="auth_lien">${t("auth_lien")}</a>`;
    }
  });
}

/* ---------- Connexion via Google (Pop-up sécurisée) ---------- */

async function initGoogleSignIn() {
  const btnGoogle = document.getElementById("btn-google");
  if (!btnGoogle) return;

  btnGoogle.addEventListener("click", async () => {
    const messageZone = document.getElementById("auth-message");
    const texteOriginal = btnGoogle.innerHTML;

    btnGoogle.disabled = true;
    btnGoogle.setAttribute("aria-busy", "true");
    btnGoogle.innerHTML = `<span class="spinner-small"></span> Connexion…`;

    if (messageZone) messageZone.innerHTML = "";

    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });

    try {
      await signInWithPopup(auth, provider);
      gererRedirectionApresConnexion();
    } catch (err) {
      console.error("Erreur Google Sign-In :", err.code, err.message);
      if (messageZone) {
        messageZone.innerHTML = `<div class="formulaire-message erreur" role="alert">${traduireErreur(err.code)}</div>`;
      }
    } finally {
      btnGoogle.disabled = false;
      btnGoogle.removeAttribute("aria-busy");
      btnGoogle.innerHTML = texteOriginal;
    }
  });
}

/* ---------- Page connexion.html (Formulaires et redirections) ---------- */

function initAuthPage() {
  const form = document.getElementById("auth-form");
  if (!form) return;

  const ongletConnexion = document.getElementById("onglet-connexion");
  const ongletInscription = document.getElementById("onglet-inscription");
  const boutonSubmit = document.getElementById("auth-submit");
  const messageZone = document.getElementById("auth-message");
  const zoneConnecte = document.getElementById("auth-deja-connecte");

  let mode = "connexion";

  function majOnglets() {
    if (ongletConnexion) ongletConnexion.classList.toggle("active", mode === "connexion");
    if (ongletInscription) ongletInscription.classList.toggle("active", mode === "inscription");
    if (boutonSubmit) boutonSubmit.textContent = mode === "connexion" ? t("auth_bouton_connexion") : t("auth_bouton_inscription");
    if (messageZone) messageZone.innerHTML = "";
  }

  if (ongletConnexion) ongletConnexion.addEventListener("click", () => { mode = "connexion"; majOnglets(); });
  if (ongletInscription) ongletInscription.addEventListener("click", () => { mode = "inscription"; majOnglets(); });
  majOnglets();

  onAuthStateChanged(auth, (user) => {
    if (user) {
      form.style.display = "none";
      if (zoneConnecte) {
        zoneConnecte.style.display = "block";
        zoneConnecte.innerHTML = `
          <div class="connecte-box">
            <p>${t("auth_connecte_comme")} <strong>${user.email}</strong></p>
            <div class="actions-group">
              <a href="admin.html" class="btn btn-primary">Tableau de bord Admin</a>
              <a href="index.html" class="btn btn-outline">Retour à l'accueil</a>
              <button class="btn btn-danger" id="btn-deconnexion-page">${t("auth_deconnexion")}</button>
            </div>
          </div>`;
        
        const btnDeconnexion = document.getElementById("btn-deconnexion-page");
        if (btnDeconnexion) btnDeconnexion.addEventListener("click", () => signOut(auth));
      }
    } else {
      form.style.display = "block";
      if (zoneConnecte) zoneConnecte.style.display = "none";
    }
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("auth-email").value.trim();
    const motDePasse = document.getElementById("auth-mdp").value;
    const texteOriginalSubmit = boutonSubmit.textContent;

    boutonSubmit.disabled = true;
    boutonSubmit.setAttribute("aria-busy", "true");
    boutonSubmit.textContent = "Patientez…";
    if (messageZone) messageZone.innerHTML = "";

    try {
      if (mode === "connexion") {
        await signInWithEmailAndPassword(auth, email, motDePasse);
      } else {
        await createUserWithEmailAndPassword(auth, email, motDePasse);
      }
      gererRedirectionApresConnexion();
    } catch (err) {
      if (messageZone) {
        messageZone.innerHTML = `<div class="formulaire-message erreur" role="alert">${traduireErreur(err.code)}</div>`;
      }
    } finally {
      boutonSubmit.disabled = false;
      boutonSubmit.removeAttribute("aria-busy");
      boutonSubmit.textContent = texteOriginalSubmit;
    }
  });

  const lienOublie = document.getElementById("mdp-oublie");
  if (lienOublie) {
    lienOublie.addEventListener("click", async (e) => {
      e.preventDefault();
      const emailInput = document.getElementById("auth-email");
      const email = emailInput ? emailInput.value.trim() : "";
      
      if (!email) {
        if (messageZone) {
          messageZone.innerHTML = `<div class="formulaire-message erreur" role="alert">Indiquez d'abord votre adresse e-mail dans le champ ci-dessus.</div>`;
        }
        return;
      }
      try {
        await sendPasswordResetEmail(auth, email);
        if (messageZone) {
          messageZone.innerHTML = `<div class="formulaire-message succes" role="status">Un e-mail de réinitialisation a été envoyé à <strong>${email}</strong>. Vérifiez votre boîte de réception.</div>`;
        }
      } catch (err) {
        if (messageZone) {
          messageZone.innerHTML = `<div class="formulaire-message erreur" role="alert">${traduireErreur(err.code)}</div>`;
        }
      }
    });
  }
}

/* ---------- Redirection intelligente après connexion ---------- */

function gererRedirectionApresConnexion() {
  const params = new URLSearchParams(window.location.search);
  const redirectTarget = params.get("redirect");
  
  if (redirectTarget) {
    window.location.href = redirectTarget;
  } else if (window.location.pathname.includes("connexion.html")) {
    window.location.href = "admin.html";
  }
}

/* ---------- Traduction dynamique des erreurs Firebase ---------- */

function traduireErreur(code) {
  const langue = localStorage.getItem("educapsy-langue") || "fr";

  const messages = {
    fr: {
      "auth/invalid-email": "Adresse e-mail invalide.",
      "auth/user-not-found": "Aucun compte ne correspond à cet e-mail.",
      "auth/wrong-password": "Mot de passe incorrect.",
      "auth/invalid-credential": "E-mail ou mot de passe incorrect.",
      "auth/email-already-in-use": "Un compte existe déjà avec cet e-mail.",
      "auth/weak-password": "Le mot de passe doit contenir au moins 6 caractères.",
      "auth/missing-email": "Indiquez d'abord votre adresse e-mail.",
      "auth/too-many-requests": "Trop de tentatives. Réessayez dans quelques minutes.",
      "auth/popup-blocked": "La fenêtre pop-up a été bloquée par votre navigateur. Autorisez les pop-ups pour Educa-Psy.",
      "auth/popup-closed-by-user": "Connexion annulée par l'utilisateur.",
      "auth/unauthorized-domain": "Ce domaine n'est pas autorisé dans la console Firebase."
    },
    ht: {
      "auth/invalid-email": "Adrès imèl sa a pa valab.",
      "auth/user-not-found": "Pa gen okenn kont ki koresponn ak imèl sa a.",
      "auth/wrong-password": "Modyapas la pa kòrèk.",
      "auth/invalid-credential": "Imèl oswa modyapas la pa kòrèk.",
      "auth/email-already-in-use": "Gen yon kont ki deja kreye ak imèl sa a.",
      "auth/weak-password": "Modyapas la dwe gen omwen 6 karaktè.",
      "auth/missing-email": "Soutilplè, mete adrès imèl ou anvan.",
      "auth/too-many-requests": "Twòp tentativa. Tanpri tann kèk minit epi reyeseye.",
      "auth/popup-blocked": "Navigatè w la bloke fenèt la. Tanpri otorize pop-up yo pou Educa-Psy.",
      "auth/popup-closed-by-user": "Koneksyon an anule.",
      "auth/unauthorized-domain": "Domèn sa a pa otorize nan konfigirasyon Firebase la."
    }
  };

  const dictionnaire = messages[langue] || messages.fr;
  return dictionnaire[code] || (langue === "ht" ? "Yon erè rive. Tanpri reyeseye." : "Une erreur est survenue. Réessayez.");
}

/* ---------- Lancement ---------- */

document.addEventListener("DOMContentLoaded", () => {
  initAuthZone();
  initAuthPage();
  initGoogleSignIn();
});
