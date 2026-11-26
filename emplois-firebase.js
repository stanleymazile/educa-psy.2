/* ============================================================
   EDUCA-PSY — emplois-firebase.js (Rubriques : Insolite / Savoir)
   ============================================================ */

import { db } from "./firebase-config.js";
import {
  collection, getDocs, doc, getDoc, query, orderBy
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";

const MOIS_FR = [
  "janvier", "février", "mars", "avril", "mai", "juin",
  "juillet", "août", "septembre", "octobre", "novembre", "décembre"
];

const NB_APERCU_ACCUEIL = 3;
const TAILLE_PAGE_EMPLOIS = 9;

const FICHES_SAVOIR_INTEGREES = [
  {
    id: "ia-voix-depression",
    titre: "Une IA peut détecter la dépression dans ta voix",
    titre_en: "An AI Can Detect Depression in Your Voice",
    titre_ht: "Yon IA kapab detekte depresyon nan vwa ou",
    titre_es: "Una IA puede detectar la depresión en tu voz",
    type: "Savoir",
    organisation: "Stanley Mazile",
    lieu: "Psychologie & IA",
    lieu_en: "Psychology & AI",
    lieu_ht: "Sikoloji ak IA",
    lieu_es: "Psicología e IA",
    resume: "Ta voix trahit ton état mental. Des algorithmes analysent rythme, pauses et tonalité pour repérer des signes de dépression et d'anxiété.",
    resume_en: "Your voice reflects your mental state. Machine-learning algorithms analyze rhythm, pauses, and tone to spot early signs of depression and anxiety.",
    resume_ht: "Vwa ou revele eta mantal ou. Algoritm yo analize ritm, poz ak ton pou detekte siy depresyon ak enkyetid byen bonè.",
    resume_es: "Tu voz revela tu estado mental. Algoritmos de aprendizaje automático analizan ritmo, pausas y tono para detectar depresión y ansiedad.",
    description: "Ta voix trahit ton état mental. Des algorithmes d'apprentissage automatique analysent des micro-variations — rythme, pauses, tonalité — invisibles à l'oreille humaine.",
    image: "/images/ia-voix-depression.webp",
    svgMini: `<svg class="job-card-svg-mini" viewBox="0 0 28 28" aria-hidden="true" fill="currentColor"><rect class="svg-wave-bar" x="3" y="9" width="3.5" height="10" rx="1.75" style="animation-delay:0s"/><rect class="svg-wave-bar" x="9" y="5" width="3.5" height="18" rx="1.75" style="animation-delay:0.18s"/><rect class="svg-wave-bar" x="15" y="7" width="3.5" height="14" rx="1.75" style="animation-delay:0.36s"/><rect class="svg-wave-bar" x="21" y="10" width="3.5" height="8" rx="1.75" style="animation-delay:0.54s"/></svg>`,
    url: "ia-voix-depression.html",
    datePublication: new Date("2026-11-25T17:00:00Z")
  },
  {
    id: "parole-par-la-pensee",
    titre: "Un homme paralysé « parle » par la pensée, avec 97 % de précision",
    titre_en: "A Paralyzed Man Speaks Through Thought With 97% Accuracy",
    titre_ht: "Yon nonm paralize « pale » ak panse li, avèk 97 % presizyon",
    titre_es: "Un hombre paralizado «habla» con el pensamiento, con un 97 % de precisión",
    type: "Insolite",
    organisation: "Stanley Mazile",
    lieu: "Neurosciences",
    lieu_en: "Neuroscience",
    lieu_ht: "Newosyans",
    lieu_es: "Neurociencia",
    resume: "Atteint de la maladie de Charcot, Casey Harrell retrouve la parole grâce à des électrodes cérébrales qui décodent ses phrases avec environ 97 % de précision.",
    resume_en: "Living with ALS, Casey Harrell speaks again through brain implants that decode intended words into aloud speech with roughly 97% accuracy.",
    resume_ht: "Ak maladi Charcot a, Casey Harrell reprann lapawòl gras a elektwòd nan sèvo ki tradui panse li an fraz a 97 % presizyon.",
    resume_es: "Con ELA, Casey Harrell vuelve a comunicarse gracias a electrodos cerebrales que descifran sus frases con alrededor de un 97 % de precisión.",
    description: "Casey Harrell, atteint de la maladie de Charcot, ne pouvait plus parler. Des électrodes implantées dans son cerveau transforment ses signaux en phrases avec 97 % de précision.",
    image: "/images/parole-pensee-bci.webp",
    svgMini: `<svg class="job-card-svg-mini" viewBox="0 0 28 28" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2"><circle class="svg-pulse-node" cx="9" cy="14" r="4" fill="currentColor" fill-opacity="0.2"/><path d="M13 14h6"/><circle cx="22" cy="14" r="2.5" fill="currentColor"/></svg>`,
    url: "parole-par-la-pensee.html",
    datePublication: new Date("2026-11-25T15:30:00Z")
  },
  {
    id: "tuteur-ia-harvard",
    titre: "Un tuteur IA a fait mieux qu'un cours en classe",
    titre_en: "An AI Tutor Outperformed a Classroom Lecture",
    titre_ht: "Yon titè IA fè pi byen pase yon kou nan sal klas",
    titre_es: "Un tutor de IA superó a una clase presencial",
    type: "Savoir",
    organisation: "Stanley Mazile",
    lieu: "Éducation & IA",
    lieu_en: "Education & AI",
    lieu_ht: "Edikasyon ak IA",
    lieu_es: "Educación e IA",
    resume: "À Harvard, des étudiants guidés question par question par un tuteur IA ont appris plus du double qu'en cours classique actif, en moins de temps.",
    resume_en: "At Harvard, physics students guided question by question by an AI tutor learned more than twice as much in less time than in an active class.",
    resume_ht: "Nan Harvard, etidyan ki te aprann ak yon titè IA ki poze kesyon etap pa etap te aprann plis pase de fwa plis nan mwens tan.",
    resume_es: "En Harvard, estudiantes guiados pregunta a pregunta por un tutor de IA aprendieron más del doble en menos tiempo que en clase.",
    description: "À Harvard, des étudiants en physique ont appris plus du double avec un tuteur IA socratique qu'en cours classique actif.",
    image: "/images/tuteur-ia-harvard.webp",
    svgMini: `<svg class="job-card-svg-mini" viewBox="0 0 28 28" aria-hidden="true" fill="currentColor"><rect x="4" y="15" width="7" height="9" rx="1.5" opacity="0.45"/><rect class="svg-bar-focus" x="15" y="5" width="8" height="19" rx="1.5"/></svg>`,
    url: "tuteur-ia-harvard.html",
    datePublication: new Date("2026-11-25T14:00:00Z")
  },
  {
    id: "cerveau-lavage-sommeil",
    titre: "Pendant que tu dors, ton cerveau se « lave »",
    titre_en: "While You Sleep, Your Brain Washes Itself",
    titre_ht: "Pandan w ap dòmi, sèvo ou « lave » tèt li",
    titre_es: "Mientras duermes, tu cerebro se «lava»",
    type: "Insolite",
    organisation: "Stanley Mazile",
    lieu: "Sommeil & Cerveau",
    lieu_en: "Sleep & Brain",
    lieu_ht: "Dòmi ak Sèvo",
    lieu_es: "Sueño y Cerebro",
    resume: "Pendant le sommeil profond, des vagues de noradrénaline pompent toutes les 50 secondes le liquide qui évacue les déchets du cerveau — un cycle perturbé par certains somnifères.",
    resume_en: "During deep sleep, noradrenaline waves pulse brain vessels every ~50 seconds to flush out metabolic waste—a cycle disrupted by sleeping pills like zolpidem.",
    resume_ht: "Pandan dòmi pwofon, vag noradrenalin ponpe likid ki netwaye dechè nan sèvo a chak 50 segonn — yon ritm kèk grenn dòmi kapab deranje.",
    resume_es: "Durante el sueño profundo, ondas de noradrenalina bombean líquido cada ~50 segundos para limpiar residuos cerebrales, un ciclo alterado por ciertos somníferos.",
    description: "Pendant le sommeil profond, des vagues de noradrénaline font contracter les vaisseaux toutes les 50 secondes pour évacuer les déchets cérébraux.",
    image: "/images/cerveau-lavage-sommeil.webp",
    svgMini: `<svg class="job-card-svg-mini" viewBox="0 0 28 28" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2"><circle class="svg-vessel-pulse" cx="14" cy="14" r="9" stroke-opacity="0.45"/><circle class="svg-pulse-node" cx="14" cy="14" r="4.5" fill="currentColor" fill-opacity="0.25"/></svg>`,
    url: "cerveau-lavage-sommeil.html",
    datePublication: new Date("2026-11-25T12:30:00Z")
  },
  {
    id: "rejoyn-application-depression",
    titre: "La première application sur ordonnance contre la dépression",
    titre_en: "The First Prescription App for Depression",
    titre_ht: "Premye aplikasyon sou preskripsyon kont depresyon",
    titre_es: "La primera aplicación con receta médica contra la depresión",
    type: "Savoir",
    organisation: "Stanley Mazile",
    lieu: "Santé mentale numérique",
    lieu_en: "Digital Mental Health",
    lieu_ht: "Sante mantal dijital",
    lieu_es: "Salud mental digital",
    resume: "Autorisée par la FDA, Rejoyn se prescrit comme un médicament en complément d'un antidépresseur grâce à de courts exercices cognitifs et émotionnels.",
    resume_en: "Authorized by the FDA, Rejoyn is prescribed alongside antidepressants to train emotional and cognitive brain circuits through brief guided exercises.",
    resume_ht: "Otorize pa FDA, Rejoyn preskri tankou yon medikaman ak egzèsis kognitif ak emosyonèl kout pou ranfòse sikui sèvo a.",
    resume_es: "Autorizada por la FDA, Rejoyn se receta como complemento de antidepresivos mediante breves ejercicios cognitivos y emocionales.",
    description: "Rejoyn, autorisée par la FDA en mars 2024, est la première application thérapeutique prescrite en complément d'un antidépresseur.",
    image: "/images/rejoyn-therapie-numerique.webp",
    svgMini: `<svg class="job-card-svg-mini" viewBox="0 0 28 28" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2"><rect x="7" y="3" width="14" height="22" rx="3"/><circle class="svg-pulse-node" cx="14" cy="13" r="3" fill="currentColor" fill-opacity="0.3"/></svg>`,
    url: "rejoyn-application-depression.html",
    datePublication: new Date("2026-11-25T11:00:00Z")
  },
  {
    id: "baillement-contagieux",
    titre: "Pourquoi bâillons-nous quand les autres bâillent ?",
    titre_en: "Why Do We Yawn When Others Yawn?",
    titre_ht: "Poukisa nou baye lè lòt moun ap baye ?",
    titre_es: "¿Por qué bostezamos cuando otros bostezan?",
    type: "Insolite",
    organisation: "Stanley Mazile",
    lieu: "Psychologie",
    lieu_en: "Psychology",
    lieu_ht: "Sikoloji",
    lieu_es: "Psicología",
    resume: "Il suffit parfois de voir un inconnu bâiller — ou simplement de lire ces quelques lignes — pour sentir sa propre mâchoire s'ouvrir. Ce réflexe banal cache un fascinant mécanisme social.",
    resume_en: "Seeing someone yawn—or just reading about it—can trigger an immediate yawn. Behind this ordinary reflex lies an intriguing social brain mechanism.",
    resume_ht: "Pafwa li sifi pou wè yon moun baye — oswa li yon fraz sou sa — pou machwè nou louvri tou. Dèyè reflèks sa a gen yon mekanis sosyal kaptivan.",
    resume_es: "A veces basta con ver bostezar a alguien —o leer estas líneas— para sentir el impulso de bostezar. Detrás de este reflejo se esconde un mecanismo social fascinante.",
    description: "Il suffit parfois de voir un inconnu bâiller — ou simplement de lire ces quelques lignes — pour sentir sa propre mâchoire s'ouvrir. Ce réflexe banal cache un fascinant mécanisme social.",
    image: "/images/baillement-contagieux.webp",
    url: "baillement-contagieux.html",
    datePublication: new Date("2026-11-25T08:00:00Z")
  },
  {
    id: "dissonance-cognitive",
    titre: "La dissonance cognitive",
    titre_en: "Cognitive Dissonance",
    titre_ht: "Disonans kognitif",
    titre_es: "La disonancia cognitiva",
    type: "Savoir",
    organisation: "Équipe Educa-Psy",
    lieu: "Psychologie",
    lieu_en: "Psychology",
    lieu_ht: "Sikoloji",
    lieu_es: "Psicología",
    resume: "La dissonance cognitive est le malaise que nous ressentons quand nos pensées, nos valeurs ou nos actes se contredisent. Comprendre le phénomène décrit par Leon Festinger et mieux le gérer.",
    resume_en: "Cognitive dissonance is the mental discomfort felt when thoughts, values, and actions clash. Understand Leon Festinger's concept and how to navigate it.",
    resume_ht: "Disonans kognitif se malèz nou santi lè panse, valè ak aksyon nou kontredi youn lòt. Konprann fenomèn Leon Festinger te dekri a.",
    resume_es: "La disonancia cognitiva es el malestar que sentimos cuando nuestros pensamientos, valores o actos se contradicen.",
    description: "La dissonance cognitive est le malaise que nous ressentons quand nos pensées, nos valeurs ou nos actes se contredisent.",
    url: "dissonance-cognitive.html",
    datePublication: new Date("2026-11-14T09:00:00Z")
  }
];

let cacheEmplois = null;
let promesseChargement = null;

function echapperHTML(texte) {
  const div = document.createElement("div");
  div.textContent = texte == null ? "" : String(texte);
  return div.innerHTML;
}

function champLocal(o, champ) {
  let langue = "fr";
  try {
    langue = localStorage.getItem("educapsy-langue") || document.documentElement.lang || "fr";
  } catch (_) {
    langue = document.documentElement.lang || "fr";
  }
  if (!langue || langue === "fr") return o[champ] || "";
  return o[`${champ}_${langue}`] || o[champ] || "";
}

function retirerAccents(texte) {
  return String(texte || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function estTypeValide(type) {
  const norm = retirerAccents(type).toLowerCase().trim();
  return norm === "insolite" || norm === "savoir";
}

function slugifyType(type) {
  const norm = retirerAccents(type).toLowerCase().trim();
  if (norm === "insolite") return "insolite";
  return "savoir";
}

function libelleType(type) {
  const norm = retirerAccents(type).toLowerCase().trim();
  if (norm === "insolite") return window.EducaPsyI18n ? window.EducaPsyI18n.texte("type_insolite") : "Insolite";
  return window.EducaPsyI18n ? window.EducaPsyI18n.texte("type_savoir") : "Savoir";
}

function formaterDateFirestore(valeur) {
  if (!valeur) return "";
  const d = valeur.toDate ? valeur.toDate() : new Date(valeur);
  if (isNaN(d.getTime())) return "";
  return `${d.getUTCDate()} ${MOIS_FR[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

function correspondType(typeItem, typeFiltre) {
  if (!typeFiltre || typeFiltre === "Tous") return true;
  return retirerAccents(typeItem).toLowerCase().trim() === retirerAccents(typeFiltre).toLowerCase().trim();
}

function formaterInline(texte) {
  let html = echapperHTML(texte);
  html = html.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/\*([^*]+)\*/g, "<em>$1</em>");
  html = html.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1 <span class="ext-icon" aria-hidden="true">↗</span></a>');
  return html;
}

function rendreContenu(texte) {
  if (!texte) return "";
  const blocs = String(texte).split(/\n\s*\n/).map(b => b.trim()).filter(Boolean);
  return blocs.map(bloc => {
    const lignes = bloc.split(/\n/).map(l => l.trim()).filter(Boolean);
    if (lignes.every(l => /^[-*•]\s+/.test(l))) {
      const items = lignes.map(l => `<li>${formaterInline(l.replace(/^[-*•]\s+/, ""))}</li>`).join("");
      return `<ul class="article-list">${items}</ul>`;
    }
    if (lignes.length === 1 && lignes[0].startsWith("### ")) {
      return `<h3 class="article-subtitle-h3">${formaterInline(lignes[0].slice(4))}</h3>`;
    }
    if (lignes.length === 1 && lignes[0].startsWith("## ")) {
      return `<h2 class="article-subtitle">${formaterInline(lignes[0].slice(3))}</h2>`;
    }
    if (lignes.length === 1 && lignes[0].startsWith("> ")) {
      return `<blockquote class="article-quote">${formaterInline(lignes[0].slice(2))}</blockquote>`;
    }
    return `<p>${lignes.map(formaterInline).join("<br>")}</p>`;
  }).join("");
}

function timestampMs(valeur) {
  if (!valeur) return 0;
  const d = valeur.toDate ? valeur.toDate() : new Date(valeur);
  return isNaN(d.getTime()) ? 0 : d.getTime();
}

export async function chargerEmplois(force = false) {
  if (cacheEmplois && !force) return cacheEmplois;
  if (promesseChargement && !force) return promesseChargement;

  promesseChargement = (async () => {
    let itemsFirestore = [];
    try {
      const snap = await getDocs(query(collection(db, "emplois"), orderBy("datePublication", "desc")));
      itemsFirestore = snap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .filter(o => estTypeValide(o.type));
    } catch (err) {
      console.warn("Firestore indisponible pour Rubriques, affichage des fiches intégrées :", err);
    }

    const titresExistants = new Set(itemsFirestore.map(o => retirerAccents(o.titre).toLowerCase().trim()));
    const integres = FICHES_SAVOIR_INTEGREES.filter(
      f => !titresExistants.has(retirerAccents(f.titre).toLowerCase().trim())
    );

    cacheEmplois = [...integres, ...itemsFirestore].sort(
      (a, b) => timestampMs(b.datePublication) - timestampMs(a.datePublication)
    );
    return cacheEmplois;
  })();

  return promesseChargement;
}

function carteEmploiHTML(o, compact = false) {
  const slug = slugifyType(o.type);
  const badge = libelleType(o.type);
  const url = o.url || `emploi.html?id=${encodeURIComponent(o.id)}`;
  const titre = champLocal(o, "titre") || "(sans titre)";
  const lieu = champLocal(o, "lieu");
  const datePub = formaterDateFirestore(o.datePublication);
  const metaParts = [o.organisation, lieu, datePub].filter(Boolean).map(echapperHTML);
  const resumeLocal = champLocal(o, "resume");
  const descLocal = champLocal(o, "description");
  const texteResume = resumeLocal || (descLocal ? String(descLocal).slice(0, 160) + (String(descLocal).length > 160 ? "…" : "") : "");
  const lireSuite = window.EducaPsyI18n ? window.EducaPsyI18n.texte("lire_la_suite") : "Lire la suite →";
  const mediaHtml = o.image
    ? `<a href="${url}" class="job-card-media" tabindex="-1" aria-hidden="true"><img class="job-card-image" src="${echapperHTML(o.image)}" alt="${echapperHTML(titre)}" loading="lazy" width="1280" height="714" referrerpolicy="no-referrer" decoding="async"></a>`
    : "";

  return `
    <article class="job-card ${compact ? "job-card--compact " : ""}type-${slug}">
      ${mediaHtml}
      <div class="job-card-top">
        <span class="tag tag-${slug}">${echapperHTML(badge)}</span>
        ${o.svgMini || ""}
      </div>
      <h3 class="job-card-title"><a href="${url}">${echapperHTML(titre)}</a></h3>
      ${metaParts.length ? `<div class="job-card-meta">${metaParts.join(" · ")}</div>` : ""}
      ${texteResume ? `<p class="job-card-desc">${echapperHTML(texteResume)}</p>` : ""}
      <div class="job-card-footer">
        <a href="${url}" class="see-all">${echapperHTML(lireSuite)}</a>
        <div class="job-card-liens">
          ${o.pdfUrl ? `<a href="${echapperHTML(o.pdfUrl)}" target="_blank" rel="noopener" class="see-all">📄 PDF</a>` : ""}
          ${o.lien ? `<a href="${echapperHTML(o.lien)}" target="_blank" rel="noopener" class="see-all">Source ↗</a>` : ""}
        </div>
      </div>
    </article>`;
}

function squelettesHTML(n = 3) {
  return Array.from({ length: n }, () => `
    <div class="job-card squelette">
      <div class="squelette-ligne courte"></div>
      <div class="squelette-ligne titre"></div>
      <div class="squelette-ligne"></div>
      <div class="squelette-ligne"></div>
    </div>`).join("");
}

/* ---------- Accueil : aperçu Rubriques ---------- */

async function initAccueilEmplois() {
  const zone = document.getElementById("opportunites-apercu");
  if (!zone) return;

  zone.innerHTML = squelettesHTML(NB_APERCU_ACCUEIL);
  try {
    const tous = await chargerEmplois();
    const recents = tous.slice(0, NB_APERCU_ACCUEIL);
    if (!recents.length) {
      zone.innerHTML = `<p class="empty-msg">Aucun contenu dans « Rubriques » pour le moment.</p>`;
      return;
    }
    zone.innerHTML = recents.map(o => carteEmploiHTML(o, true)).join("");
  } catch (err) {
    console.error("Erreur Firestore (Rubriques accueil) :", err);
    zone.innerHTML = `<p class="empty-msg">Contenu « Rubriques » temporairement indisponible.</p>`;
  }
}

/* ---------- Page liste : emplois.html ---------- */

async function initEmploisListePage() {
  const grid = document.getElementById("emplois-grid");
  if (!grid) return;

  const paginationZone = document.getElementById("pagination-emplois");
  const rechercheInput = document.getElementById("recherche-emplois");
  const tabs = document.querySelectorAll(".filter-tab[data-type]");

  const params = new URLSearchParams(window.location.search);
  let typeActif = params.get("type") || "Tous";
  let recherche = params.get("search") || "";
  let pageCourante = 1;

  if (rechercheInput && recherche) rechercheInput.value = recherche;

  tabs.forEach(tab => {
    const estActif = correspondType(tab.dataset.type, typeActif) || (typeActif === "Tous" && tab.dataset.type === "Tous");
    tab.classList.toggle("active", estActif);
  });

  grid.innerHTML = squelettesHTML(6);

  let tous = [];
  try {
    tous = await chargerEmplois();
  } catch (err) {
    console.error("Erreur Firestore (liste Rubriques) :", err);
    grid.innerHTML = `<p class="empty-msg">Impossible de charger les fiches « Rubriques » pour le moment.</p>`;
    return;
  }

  function afficher() {
    const q = retirerAccents(recherche).toLowerCase().trim();
    const filtres = tous.filter(o => {
      if (!correspondType(o.type, typeActif)) return false;
      if (!q) return true;
      const texte = retirerAccents([o.titre, o.type, o.organisation, o.lieu, o.resume, o.description].join(" ")).toLowerCase();
      return texte.includes(q);
    });

    const totalPages = Math.max(1, Math.ceil(filtres.length / TAILLE_PAGE_EMPLOIS));
    if (pageCourante > totalPages) pageCourante = totalPages;

    const debut = (pageCourante - 1) * TAILLE_PAGE_EMPLOIS;
    const pageItems = filtres.slice(debut, debut + TAILLE_PAGE_EMPLOIS);

    if (!pageItems.length) {
      grid.innerHTML = `<p class="empty-msg">Aucun contenu trouvé pour cette sélection.</p>`;
    } else {
      grid.innerHTML = pageItems.map(o => carteEmploiHTML(o, false)).join("");
    }

    if (paginationZone) {
      if (totalPages <= 1) {
        paginationZone.innerHTML = "";
      } else {
        const btns = [];
        btns.push(`<button type="button" class="pagination-btn" ${pageCourante === 1 ? "disabled" : ""} data-page="${pageCourante - 1}">←</button>`);
        for (let p = 1; p <= totalPages; p++) {
          btns.push(`<button type="button" class="pagination-btn ${p === pageCourante ? "active" : ""}" data-page="${p}">${p}</button>`);
        }
        btns.push(`<button type="button" class="pagination-btn" ${pageCourante === totalPages ? "disabled" : ""} data-page="${pageCourante + 1}">→</button>`);
        paginationZone.innerHTML = btns.join("");
        paginationZone.querySelectorAll(".pagination-btn[data-page]").forEach(btn => {
          btn.addEventListener("click", () => {
            const p = parseInt(btn.dataset.page, 10);
            if (!isNaN(p) && p >= 1 && p <= totalPages) {
              pageCourante = p;
              afficher();
              window.scrollTo({ top: 0, behavior: "smooth" });
            }
          });
        });
      }
    }
  }

  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      tabs.forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      typeActif = tab.dataset.type || "Tous";
      pageCourante = 1;
      const url = new URL(window.location.href);
      if (typeActif === "Tous") url.searchParams.delete("type");
      else url.searchParams.set("type", typeActif);
      window.history.replaceState({}, "", url);
      afficher();
    });
  });

  if (rechercheInput) {
    rechercheInput.addEventListener("input", () => {
      recherche = rechercheInput.value;
      pageCourante = 1;
      afficher();
    });
  }

  afficher();
}

/* ---------- Page détail : emploi.html ---------- */

async function copierDansPressePapier(texte) {
  try {
    if (typeof window !== "undefined" && window.focus) {
      window.focus();
    }
  } catch (_) {}

  if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
    try {
      await navigator.clipboard.writeText(texte);
      return true;
    } catch (_) {
      // Fallback execCommand
    }
  }

  try {
    const zone = document.createElement("textarea");
    zone.value = texte;
    zone.setAttribute("readonly", "");
    zone.style.position = "fixed";
    zone.style.left = "-9999px";
    zone.style.top = "0";
    zone.style.opacity = "0";
    document.body.appendChild(zone);
    zone.focus();
    zone.select();
    const succes = document.execCommand("copy");
    document.body.removeChild(zone);
    if (succes) return true;
  } catch (_) {}

  return false;
}

function majMetaSEOEmploi(o) {
  const titre = `${o.titre || "Rubriques"} — Educa-Psy`;
  const desc = o.resume || (o.description ? String(o.description).slice(0, 155) : "Rubriques sur Educa-Psy.");
  const url = `https://educa-psy.web.app/emploi.html?id=${encodeURIComponent(o.id)}`;

  document.title = titre;
  const setAttr = (sel, attr, val) => {
    const el = document.querySelector(sel);
    if (el && val) el.setAttribute(attr, val);
  };
  setAttr('meta[name="description"]', "content", desc);
  setAttr('meta[property="og:title"]', "content", titre);
  setAttr('meta[property="og:description"]', "content", desc);
  setAttr('meta[property="og:url"]', "content", url);
  setAttr('meta[name="twitter:title"]', "content", titre);
  setAttr('meta[name="twitter:description"]', "content", desc);
  setAttr('link[rel="canonical"]', "href", url);

  const dateObj = o.datePublication && o.datePublication.toDate ? o.datePublication.toDate() : new Date();
  const dateIso = !isNaN(dateObj.getTime()) ? dateObj.toISOString() : new Date().toISOString();

  const existingLd = document.getElementById("emploi-jsonld");
  if (existingLd) existingLd.remove();
  const script = document.createElement("script");
  script.id = "emploi-jsonld";
  script.type = "application/ld+json";
  script.textContent = JSON.stringify([
    {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": o.titre || "Rubriques",
      "description": desc,
      "mainEntityOfPage": { "@type": "WebPage", "@id": url },
      "datePublished": dateIso,
      "author": { "@type": "Organization", "name": o.organisation || "Educa-Psy" },
      "publisher": {
        "@type": "Organization",
        "name": "Educa-Psy",
        "logo": { "@type": "ImageObject", "url": "https://educa-psy.web.app/logo.svg" }
      }
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Accueil", "item": "https://educa-psy.web.app/" },
        { "@type": "ListItem", "position": 2, "name": "Rubriques", "item": "https://educa-psy.web.app/emplois.html" },
        { "@type": "ListItem", "position": 3, "name": o.titre || "Fiche", "item": url }
      ]
    }
  ]);
  document.head.appendChild(script);
}

async function initEmploiDetailPage() {
  const zone = document.getElementById("emploi-content");
  if (!zone) return;

  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  if (!id) {
    zone.innerHTML = `<div class="article-not-found"><h1>Contenu introuvable</h1><p>Aucune fiche « Rubriques » spécifiée.</p><a href="emplois.html" class="btn btn-primary">Voir les rubriques</a></div>`;
    return;
  }

  const redirectionsStatiques = {
    "ia-voix-depression": "ia-voix-depression.html",
    "parole-par-la-pensee": "parole-par-la-pensee.html",
    "tuteur-ia-harvard": "tuteur-ia-harvard.html",
    "cerveau-lavage-sommeil": "cerveau-lavage-sommeil.html",
    "rejoyn-application-depression": "rejoyn-application-depression.html",
    "dissonance-cognitive": "dissonance-cognitive.html",
    "baillement-contagieux": "baillement-contagieux.html"
  };

  if (redirectionsStatiques[id]) {
    window.location.replace(redirectionsStatiques[id]);
    return;
  }

  zone.innerHTML = `<div class="squelette"><div class="squelette-ligne courte"></div><div class="squelette-ligne titre"></div><div class="squelette-ligne"></div><div class="squelette-ligne"></div></div>`;

  let item = null;
  try {
    const snap = await getDoc(doc(db, "emplois", id));
    if (snap.exists()) {
      const data = snap.data();
      if (estTypeValide(data.type)) {
        item = { id: snap.id, ...data };
      }
    }
  } catch (err) {
    console.error("Erreur Firestore (détail Rubriques) :", err);
  }

  if (!item) {
    const robots = document.querySelector('meta[name="robots"]');
    if (robots) robots.setAttribute("content", "noindex, nofollow");
    zone.innerHTML = `<div class="article-not-found"><h1>Fiche introuvable</h1><p>Cette fiche « Rubriques » n'existe pas ou a été supprimée.</p><a href="emplois.html" class="btn btn-primary">Retour aux rubriques</a></div>`;
    return;
  }

  majMetaSEOEmploi(item);

  const slug = slugifyType(item.type);
  const badge = libelleType(item.type);
  const datePub = formaterDateFirestore(item.datePublication);
  const dateObj = item.datePublication && item.datePublication.toDate ? item.datePublication.toDate() : new Date();
  const dateIso = !isNaN(dateObj.getTime()) ? dateObj.toISOString() : "";

  const metaParts = [item.organisation, item.lieu].filter(Boolean).map(echapperHTML);
  const urlPage = window.location.href;
  const urlEncodee = encodeURIComponent(urlPage);
  const texteEncode = encodeURIComponent(`${item.titre || "Rubriques"} — Educa-Psy`);

  const actionsHtml = (item.lien || item.pdfUrl) ? `
    <div class="emploi-actions">
      ${item.lien ? `<a href="${echapperHTML(item.lien)}" target="_blank" rel="noopener" class="btn btn-primary">En savoir plus ↗</a>` : ""}
      ${item.pdfUrl ? `<a href="${echapperHTML(item.pdfUrl)}" target="_blank" rel="noopener" class="btn btn-outline">📄 ${echapperHTML(item.pdfNom || "Télécharger le PDF")}</a>` : ""}
    </div>` : "";

  zone.innerHTML = `
    <article class="single-article">
      <nav class="breadcrumb-nav" aria-label="Fil d'Ariane">
        <ol class="breadcrumb-list">
          <li class="breadcrumb-item"><a class="breadcrumb-link" href="index.html">Accueil</a></li>
          <li class="breadcrumb-separator" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg></li>
          <li class="breadcrumb-item"><a class="breadcrumb-link" href="emplois.html">Rubriques</a></li>
          <li class="breadcrumb-separator" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg></li>
          <li class="breadcrumb-item current" aria-current="page"><span class="breadcrumb-current">${echapperHTML(item.titre || "")}</span></li>
        </ol>
      </nav>

      <header class="article-header">
        <div class="article-kicker-wrap">
          <a href="emplois.html?type=${encodeURIComponent(item.type || "Savoir")}" class="article-kicker">
            <span class="kicker-dot"></span>
            ${echapperHTML(badge)}
          </a>
        </div>
        <h1 class="article-title">${echapperHTML(item.titre || "")}</h1>
        ${item.resume ? `<div class="article-chapeau"><p>${echapperHTML(item.resume)}</p></div>` : ""}
        <div class="article-meta-bar">
          <div class="article-author-badge">
            <span class="author-avatar">EP</span>
            <div class="author-details">
              <span class="author-name">${metaParts.length ? metaParts.join(" · ") : "Équipe Educa-Psy"}</span>
              <span class="author-role">Rubriques · ${echapperHTML(badge)}</span>
            </div>
          </div>
          ${datePub ? `
          <div class="article-meta-info">
            <span class="article-date">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
              <time datetime="${dateIso}">${datePub}</time>
            </span>
          </div>` : ""}
        </div>
      </header>

      ${item.image ? `<figure class="article-hero"><img class="article-image" src="${echapperHTML(item.image)}" alt="${echapperHTML(item.titre || "")}" width="1280" height="714" referrerpolicy="no-referrer" decoding="async"></figure>` : ""}

      <div class="article-body">
        ${item.description ? rendreContenu(item.description) : (item.resume ? `<p>${echapperHTML(item.resume)}</p>` : "")}
      </div>

      ${actionsHtml}

      <div class="article-share-section">
        <span class="share-label">Partager cette fiche :</span>
        <div class="share-buttons-group">
          <a class="share-action-btn share-whatsapp" href="https://api.whatsapp.com/send?text=${texteEncode}%20${urlEncodee}" target="_blank" rel="noopener">WhatsApp</a>
          <a class="share-action-btn share-facebook" href="https://www.facebook.com/sharer/sharer.php?u=${urlEncodee}" target="_blank" rel="noopener">Facebook</a>
          <a class="share-action-btn share-x" href="https://x.com/intent/tweet?text=${texteEncode}&url=${urlEncodee}&via=educapsyhaiti" target="_blank" rel="noopener">X</a>
          <a class="share-action-btn share-linkedin" href="https://www.linkedin.com/sharing/share-offsite/?url=${urlEncodee}" target="_blank" rel="noopener">LinkedIn</a>
          <button type="button" class="share-action-btn share-copy" id="btn-partager-emploi"><span id="label-copier-emploi">Copier</span></button>
        </div>
      </div>
    </article>`;

  const barreLecture = document.getElementById("reading-progress-bar");
  if (barreLecture) {
    const majBarre = () => {
      const scrollMax = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollMax > 0) {
        const pct = Math.min(100, Math.max(0, (window.scrollY / scrollMax) * 100));
        barreLecture.style.width = `${pct}%`;
      }
    };
    window.addEventListener("scroll", majBarre, { passive: true });
    majBarre();
  }

  const btnPartager = document.getElementById("btn-partager-emploi");
  const labelCopier = document.getElementById("label-copier-emploi");
  if (btnPartager) {
    btnPartager.addEventListener("click", async () => {
      const data = { title: item.titre || "Rubriques", text: item.resume || "", url: window.location.href };
      if (navigator.share) {
        try {
          await navigator.share(data);
          return;
        } catch (_) {}
      }
      const ok = await copierDansPressePapier(window.location.href);
      if (labelCopier) {
        labelCopier.textContent = ok ? "✓ Copié !" : "Lien prêt";
        setTimeout(() => { if (labelCopier) labelCopier.textContent = "Copier"; }, 2200);
      }
    });
  }

  const zoneSimilaires = document.getElementById("emplois-similaires");
  if (zoneSimilaires) {
    try {
      const tous = await chargerEmplois();
      const similaires = tous.filter(o => o.id !== item.id).slice(0, 2);
      if (similaires.length) {
        zoneSimilaires.innerHTML = `
          <h3>À découvrir aussi dans Rubriques</h3>
          <div class="emplois-grid">
            ${similaires.map(o => carteEmploiHTML(o, true)).join("")}
          </div>`;
      }
    } catch (err) {
      console.error("Erreur Firestore (Rubriques similaires) :", err);
    }
  }
}

async function initSimilairesPageStatique() {
  const zoneSimilaires = document.getElementById("emplois-similaires");
  if (!zoneSimilaires || document.getElementById("emploi-content")) return;
  try {
    const tous = await chargerEmplois();
    const pageActuelle = (window.location.pathname.split("/").pop() || "").toLowerCase();
    const similaires = tous.filter(o => {
      const cible = (o.url || "").toLowerCase();
      return !pageActuelle || cible !== pageActuelle;
    }).slice(0, 2);
    if (similaires.length) {
      zoneSimilaires.innerHTML = `
        <h3>À découvrir aussi dans Rubriques</h3>
        <div class="emplois-grid">
          ${similaires.map(o => carteEmploiHTML(o, true)).join("")}
        </div>`;
    }
  } catch (err) {
    console.error("Erreur chargement similaires Rubriques :", err);
  }
}

/* ---------- Initialisation ---------- */

function rechargerContenuEmplois() {
  if (document.getElementById("opportunites-apercu")) {
    initAccueilEmplois();
  }
  if (document.getElementById("emplois-grid")) {
    initEmploisListePage();
  }
  if (document.getElementById("emploi-content")) {
    initEmploiDetailPage();
  } else if (document.getElementById("emplois-similaires")) {
    initSimilairesPageStatique();
  }
}

window.addEventListener("educapsy-langue-changee", rechargerContenuEmplois);
document.addEventListener("DOMContentLoaded", rechargerContenuEmplois);
