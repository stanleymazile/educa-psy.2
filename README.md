# 📚 Educa-Psy - Documentation Technique

## 🏗️ Structure du Projet

```
educa-psy/
├── index.html
├── presentation.html
├── services.html
├── videos.html
├── blog.html
├── contact.html
├── don.html
├── espace-membre.html
├── manifest.json
├── service-worker.js
│
├── css/
│   ├── base.css              # Variables, reset, typographie
│   ├── layout.css            # Header, footer, structure
│   ├── components.css        # Composants réutilisables
│   └── pages/
│       ├── home.css          # Page d'accueil
│       ├── services.css      # Page services
│       ├── blog.css          # Page blog
│       ├── videos.css        # Page vidéos
│       ├── contact.css       # Page contact
│       ├── membre.css        # Espace membre
│       └── legal.css         # Pages légales
│
├── js/
│   ├── utils.js              # Fonctions utilitaires (CHARGER EN PREMIER)
│   ├── navigation.js         # Gestion du menu
│   ├── animations.js         # Animations au scroll
│   ├── cookies.js            # Gestion RGPD
│   └── chat.js               # Chat en direct
│
└── images/
    ├── Logo.webp
    ├── favicon.ico
    └── icon-192x192.png
```

## 📦 Ordre de Chargement des Scripts

**IMPORTANT** : Respecter cet ordre dans toutes les pages HTML :

```html
<!-- 1. Utilitaires (doit être chargé en premier) -->
<script src="js/utils.js"></script>

<!-- 2. Navigation -->
<script src="js/navigation.js"></script>

<!-- 3. Animations -->
<script src="js/animations.js"></script>

<!-- 4. Cookies (RGPD) -->
<script src="js/cookies.js"></script>

<!-- 5. Chat en direct -->
<script src="js/chat.js"></script>
```

## 🎨 Ordre de Chargement des CSS

```html
<!-- 1. Base (variables, reset) -->
<link rel="stylesheet" href="css/base.css">

<!-- 2. Layout (header, footer) -->
<link rel="stylesheet" href="css/layout.css">

<!-- 3. Composants réutilisables -->
<link rel="stylesheet" href="css/components.css">

<!-- 4. Page spécifique (exemple: home) -->
<link rel="stylesheet" href="css/pages/home.css">
```

## ⚙️ Fonctionnalités Implémentées

### ✅ Sécurité
- ✅ Protection XSS (échappement HTML)
- ✅ Validation RGPD des cookies
- ✅ localStorage utilisé de manière sécurisée
- ✅ Focus trap dans les modals

### ✅ Accessibilité
- ✅ Attributs ARIA
- ✅ Navigation au clavier
- ✅ Focus visible
- ✅ Touche Escape pour fermer les modals
- ✅ Skip to main content (à ajouter)

### ✅ Performance
- ✅ Debounce/Throttle pour les événements
- ✅ Intersection Observer pour les animations
- ✅ requestAnimationFrame pour les compteurs
- ✅ Lazy loading possible

### ✅ Responsive
- ✅ Mobile-first design
- ✅ Media queries optimisées
- ✅ Touch-friendly (min 44px)

### ✅ SEO
- ✅ Schema.org markup
- ✅ Open Graph tags
- ✅ Canonical URLs
- ✅ Semantic HTML

## 🔧 Variables CSS Personnalisables

Dans `css/base.css` :

```css
:root {
  /* Couleurs principales */
  --bleu-principal: #0066CC;
  --bleu-fonce: #004999;
  --bleu-clair: #E6F2FF;
  
  /* Couleurs d'état */
  --success: #28a745;
  --error: #dc3545;
  
  /* Espacements */
  --padding-mobile: 16px;
  --padding-tablet: 24px;
  --padding-desktop: 32px;
}
```

## 🎯 Configuration des Scripts

### Google Analytics

Dans `js/cookies.js`, ligne 15 :
```javascript
gaTrackingId: 'G-XXXXXXXXXX', // ⚠️ Remplacer par votre ID
```

### Google Tag Manager

Dans `index.html`, ligne 25 :
```javascript
'GTM-T757VLNM' // ⚠️ Remplacer par votre ID
```

### Horaires du Chat

Dans `js/chat.js`, ligne 10 :
```javascript
availableHours: {
  start: 8,  // 8h00
  end: 17    // 17h00
}
```

## 📱 PWA (Progressive Web App)

Le site est configuré comme PWA :
- ✅ `manifest.json` présent
- ✅ Service Worker configuré
- ✅ Icons 192x192 et 512x512
- ✅ Mode hors ligne possible

## 🚀 Déploiement

### Firebase Hosting (Recommandé)

```bash
# Installer Firebase CLI
npm install -g firebase-tools

# Se connecter
firebase login

# Initialiser le projet
firebase init hosting

# Déployer
firebase deploy
```

### GitHub Pages

```bash
# Pousser vers GitHub
git add .
git commit -m "Deploy website"
git push origin main

# Activer GitHub Pages dans Settings > Pages
```

## 🧪 Tests à Effectuer

### Checklist de Test

- [ ] Navigation : Menu fonctionne sur mobile/desktop
- [ ] Formulaires : Validation et envoi
- [ ] Cookies : Bannière s'affiche, choix sauvegardés
- [ ] Chat : Messages envoyés, historique sauvegardé
- [ ] Animations : Sections apparaissent au scroll
- [ ] Compteurs : Nombres s'animent
- [ ] Responsive : Test sur mobile, tablet, desktop
- [ ] Accessibilité : Navigation clavier, lecteur d'écran
- [ ] Performance : Lighthouse score > 90
- [ ] SEO : Vérifier avec Lighthouse

## 🐛 Débogage

### Console JavaScript

```javascript
// Vérifier le namespace global
console.log(window.EducaPsy);

// Debug des cookies
window.EducaPsy.CookieConsent.getPreferences();

// Debug du chat
window.EducaPsy.LiveChat.messageHistory;

// Voir les utilitaires
window.EducaPsy.Utils.log('Test', { data: 'exemple' });
```

## 📈 Optimisations Futures

### Performance
- [ ] Minification CSS/JS
- [ ] Compression images (WebP)
- [ ] CDN pour assets statiques
- [ ] Code splitting

### Fonctionnalités
- [ ] Traduction multilingue complète
- [ ] Backend pour le chat (WebSocket)
- [ ] Paiement en ligne (Stripe/Moncash)
- [ ] Dashboard admin

### SEO
- [ ] Sitemap XML
- [ ] robots.txt
- [ ] Rich snippets
- [ ] AMP pages

## 🔒 Sécurité

### Headers Recommandés

Configurer dans votre serveur :

```
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' https://www.googletagmanager.com;
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
```

## 📞 Support

Pour toute question technique :
- Email : educapsyhaiti@gmail.com
- Tél : +509 3685-9684

## 📄 Licence

Copyright © 2026 Educa-Psy. Tous droits réservés.

---

## 🎉 Améliorations Apportées

### Depuis la Version Originale

1. **Sécurité**
   - ✅ Protection XSS dans tous les scripts
   - ✅ Validation des données cookies
   - ✅ Échappement HTML systématique

2. **Performance**
   - ✅ Code JavaScript optimisé
   - ✅ CSS modulaire et réutilisable
   - ✅ Pas de duplication de code
   - ✅ Event delegation

3. **Accessibilité**
   - ✅ ARIA complet
   - ✅ Navigation clavier
   - ✅ Focus trap dans modals
   - ✅ Touches Escape fonctionnelles

4. **Maintenabilité**
   - ✅ Code bien commenté
   - ✅ Structure modulaire
   - ✅ Namespace global évite les conflits
   - ✅ Fonctions réutilisables

5. **UX**
   - ✅ Animations fluides
   - ✅ Feedback utilisateur
   - ✅ Notifications toast
   - ✅ Persistance des données

---

**Version** : 2.0  
**Dernière mise à jour** : Janvier 2026  
**Auteur** : Équipe Educa-Psy
