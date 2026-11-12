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
  persistentMultipleTabManager,
  setLogLevel
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-storage.js";

// Réduit la verbosité des logs internes de transport du SDK en cas de micro-coupure réseau
try {
  setLogLevel("silent");
} catch (_) {}

const firebaseConfig = {
  apiKey: "AIzaSyDn_IdagjN1w2cf4DkPmlfaEpMFfv5dRW4",
  authDomain: "educa-psy.firebaseapp.com",
  projectId: "educa-psy",
  storageBucket: "educa-psy.firebasestorage.app",
  messagingSenderId: "128787624540",
  appId: "1:128787624540:web:84b2bb3d23d7f718bfac99"
};

export const FIREBASE_PROJECT_ID = firebaseConfig.projectId;

const app = initializeApp(firebaseConfig);

// persistentMultipleTabManager() permet à plusieurs onglets du même
// navigateur de partager ce cache sans se bloquer mutuellement.
// experimentalAutoDetectLongPolling bascule automatiquement si les flux WebChannel sont bloqués.
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager()
  }),
  experimentalAutoDetectLongPolling: true
});

export const auth = getAuth(app);
export const storage = getStorage(app);

export const ADMIN_EMAILS = [
  "stanleymazile@gmail.com"
];
