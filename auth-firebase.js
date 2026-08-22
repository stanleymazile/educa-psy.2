/* ============================================================
   EDUCA-PSY — auth-firebase.js
   ============================================================
   Gère la connexion / inscription par e-mail + mot de passe.

   ⚠️ Avant que cela fonctionne, activez le fournisseur
   "E-mail/Mot de passe" dans Firebase Console → Authentication →
   Sign-in method.

   Ce fichier gère uniquement le COMPTE (créer/se connecter/se
   déconnecter). Il ne restreint l'accès à aucun contenu du site
   pour l'instant — à adapter selon l'usage prévu (espace membre,
   commentaires, accès rédacteur, etc.).
   ============================================================ */

import { auth } from "./firebase-config.js";
import {
  onAuthStateChanged, signOut,
  signInWithEmailAndPassword, createUserWithEmailAndPassword,
  sendPasswordResetEmail, GoogleAuthProvider,
  signInWithRedirect, getRedirectResult
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";

function t(cle) {
  return window.EducaPsyI18n ? window.EducaPsyI18n.texte(cle) : cle;
}

/* ---------- Zone "connexion" commune à toutes les pages ---------- */

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

/* ---------- Connexion Google ---------- */

async function initGoogleSignIn() {
  const btnGoogle = document.getElementById("btn-google");
  if (!btnGoogle) return;

  // Récupère le résultat après le retour de la redirection Google
  try {
    const result = await getRedirectResult(auth);
    if (result && result.user) {
      const messageZone = document.getElementById("auth-message");
      if (messageZone) {
        messageZone.innerHTML = `<div class="formulaire-message succes">✓ Connecté(e) avec Google — bienvenue ${result.user.displayName || result.user.email} !</div>`;
      }
    }
  } catch (err) {
    const messageZone = document.getElementById("auth-message");
    if (messageZone) {
      messageZone.innerHTML = `<div class="formulaire-message erreur">${traduireErreur(err.code)}</div>`;
    }
  }

  // Clic sur le bouton → redirige vers Google
  btnGoogle.addEventListener("click", async () => {
    const messageZone = document.getElementById("auth-message");
    btnGoogle.disabled = true;
    btnGoogle.textContent = "Redirection…";
    try {
      const provider = new GoogleAuthProvider();
      await signInWithRedirect(auth, provider);
      // La page recharge automatiquement — getRedirectResult s'en occupe au retour
    } catch (err) {
      btnGoogle.disabled = false;
      btnGoogle.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg> Continuer avec Google`;
      if (messageZone) messageZone.innerHTML = `<div class="formulaire-message erreur">${traduireErreur(err.code)}</div>`;
    }
  });
}

/* ---------- Page connexion.html ---------- */

function initAuthPage() {
  const form = document.getElementById("auth-form");
  if (!form) return; // pas sur la page connexion

  const ongletConnexion = document.getElementById("onglet-connexion");
  const ongletInscription = document.getElementById("onglet-inscription");
  const boutonSubmit = document.getElementById("auth-submit");
  const messageZone = document.getElementById("auth-message");
  const zoneConnecte = document.getElementById("auth-deja-connecte");

  let mode = "connexion";

  function majOnglets() {
    ongletConnexion.classList.toggle("active", mode === "connexion");
    ongletInscription.classList.toggle("active", mode === "inscription");
    boutonSubmit.textContent = mode === "connexion" ? t("auth_bouton_connexion") : t("auth_bouton_inscription");
    messageZone.innerHTML = "";
  }

  ongletConnexion.addEventListener("click", () => { mode = "connexion"; majOnglets(); });
  ongletInscription.addEventListener("click", () => { mode = "inscription"; majOnglets(); });
  majOnglets();

  onAuthStateChanged(auth, (user) => {
    if (user) {
      form.style.display = "none";
      zoneConnecte.style.display = "block";
      zoneConnecte.innerHTML = `
        <p>${t("auth_connecte_comme")} <strong>${user.email}</strong></p>
        <button class="btn btn-outline" id="btn-deconnexion-page">${t("auth_deconnexion")}</button>`;
      document.getElementById("btn-deconnexion-page").addEventListener("click", () => signOut(auth));
    } else {
      form.style.display = "block";
      zoneConnecte.style.display = "none";
    }
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("auth-email").value.trim();
    const motDePasse = document.getElementById("auth-mdp").value;
    boutonSubmit.disabled = true;
    messageZone.innerHTML = "";

    try {
      if (mode === "connexion") {
        await signInWithEmailAndPassword(auth, email, motDePasse);
      } else {
        await createUserWithEmailAndPassword(auth, email, motDePasse);
      }
    } catch (err) {
      messageZone.innerHTML = `<div class="formulaire-message erreur">${traduireErreur(err.code)}</div>`;
    } finally {
      boutonSubmit.disabled = false;
    }
  });

  const lienOublie = document.getElementById("mdp-oublie");
  if (lienOublie) {
    lienOublie.addEventListener("click", async (e) => {
      e.preventDefault();
      const email = document.getElementById("auth-email").value.trim();
      if (!email) {
        messageZone.innerHTML = `<div class="formulaire-message erreur">Indiquez d'abord votre adresse e-mail ci-dessus.</div>`;
        return;
      }
      try {
        await sendPasswordResetEmail(auth, email);
        messageZone.innerHTML = `<div class="formulaire-message succes">E-mail de réinitialisation envoyé — vérifiez votre boîte de réception.</div>`;
      } catch (err) {
        messageZone.innerHTML = `<div class="formulaire-message erreur">${traduireErreur(err.code)}</div>`;
      }
    });
  }
}

function traduireErreur(code) {
  const messages = {
    "auth/invalid-email": "Adresse e-mail invalide.",
    "auth/user-not-found": "Aucun compte ne correspond à cet e-mail.",
    "auth/wrong-password": "Mot de passe incorrect.",
    "auth/invalid-credential": "E-mail ou mot de passe incorrect.",
    "auth/email-already-in-use": "Un compte existe déjà avec cet e-mail.",
    "auth/weak-password": "Le mot de passe doit contenir au moins 6 caractères.",
    "auth/missing-email": "Indiquez d'abord votre adresse e-mail ci-dessus.",
    "auth/too-many-requests": "Trop de tentatives. Réessayez dans quelques minutes."
  };
  return messages[code] || "Une erreur est survenue. Réessayez.";
}

/* ---------- Lancement ---------- */

document.addEventListener("DOMContentLoaded", () => {
  initAuthZone();
  initAuthPage();
  initGoogleSignIn();
});


