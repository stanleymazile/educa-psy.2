/* ============================================================
   EDUCA-PSY — firebase-config.js
   ============================================================
   ⚠️ C'EST ICI QU'IL FAUT COLLER VOTRE CONFIGURATION FIREBASE.

   Où la trouver :
   Firebase Console → (sélectionner le projet Educa-Psy) →
   Paramètres du projet (roue dentée) → onglet "Général" →
   section "Vos applications" → application Web "Educa-Psy" →
   cliquez sur l'icône de copie 🗐 sous "Installation et
   configuration du SDK" (méthode CDN).

   Collez l'objet firebaseConfig complet ci-dessous, à la place
   de celui-ci (certaines valeurs comme apiKey, storageBucket et
   appId doivent être complètes — pas tronquées).
   ============================================================ */


import { initializeApp } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore-lite.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyDn_IdagjN1w2cf4DkPmlfaEpMFfv5dRW4",
  authDomain: "educa-psy.firebaseapp.com",
  projectId: "educa-psy",
  storageBucket: "educa-psy.firebasestorage.app",
  messagingSenderId: "128787624540",
  appId: "1:128787624540:web:84b2bb3d23d7f718bfac99"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

/* Liste des comptes autorisés à utiliser le panneau d'administration
   (admin.html). ⚠️ Remplacez par votre vraie adresse e-mail — celle avec
   laquelle vous vous inscrirez sur connexion.html. Vous pouvez en ajouter
   plusieurs, séparées par des virgules. Cette liste doit correspondre
   EXACTEMENT à celle du fichier firestore.rules et storage.rules. */
export const ADMIN_EMAILS = [
  "stanleymazile@gmail.com"
];


