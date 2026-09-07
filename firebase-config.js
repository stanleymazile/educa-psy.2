/* ============================================================
   EDUCA-PSY — firebase-config.js
   ============================================================ */

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-app.js";
// ✅ SDK standard + cache local persistant (IndexedDB) pour accélérer
//    les visites répétées : les documents déjà lus sont servis
//    depuis le cache local pendant que Firestore vérifie en
//    arrière-plan s'il y a du nouveau, au lieu d'attendre
//    systématiquement un aller-retour réseau complet.
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";
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

// persistentMultipleTabManager() permet à plusieurs onglets du même
// navigateur de partager ce cache sans se bloquer mutuellement.
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager()
  })
});

export const auth = getAuth(app);
export const storage = getStorage(app);

export const ADMIN_EMAILS = [
  "stanleymazile@gmail.com"
];
