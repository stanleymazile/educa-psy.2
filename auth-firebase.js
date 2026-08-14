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
  signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail
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
});

