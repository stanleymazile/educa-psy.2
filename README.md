# educa-psy.2
# 🎓 Educa-Psy - Site Web

Site web officiel d'Educa-Psy, organisation haïtienne dédiée à l'éducation et au bien-être psychologique des enfants.

## 📋 Table des Matières

- [Description](#description)
- [Fonctionnalités](#fonctionnalités)
- [Structure du Projet](#structure-du-projet)
- [Installation](#installation)
- [Images Requises](#images-requises)
- [Technologies Utilisées](#technologies-utilisées)
- [Pages du Site](#pages-du-site)
- [SEO et Optimisation](#seo-et-optimisation)
- [Responsive Design](#responsive-design)
- [Support Navigateurs](#support-navigateurs)
- [Maintenance](#maintenance)
- [Contact](#contact)

## 📖 Description

Educa-Psy est une plateforme web complète dédiée à promouvoir l'éducation de qualité et le bien-être psychologique des enfants haïtiens. Le site offre des informations sur nos services, permet les dons, et partage des conseils éducatifs et psychologiques.

## ✨ Fonctionnalités

### 🎯 Fonctionnalités Principales
- **Site multipage** avec navigation fluide
- **Formulaire de don** avec plusieurs modes de paiement (MonCash, NatCash, PayPal, Virement)
- **Formulaire de contact** fonctionnel
- **Blog/Actualités** avec système de filtres
- **Newsletter** avec inscription
- **Design responsive** (mobile, tablette, desktop)
- **Menu déroulant** interactif
- **Animations** au scroll

### 🔐 Sécurité et Légal
- Pages de mentions légales
- Politique de confidentialité conforme
- Protection des données personnelles
- Paiements sécurisés

### 🌐 SEO
- Balises Open Graph (Facebook)
- Balises Twitter Card
- Schema.org markup
- Sitemap.xml
- Robots.txt
- Canonical URLs

## 📁 Structure du Projet

```
educa-psy/
├── index.html                    # Page d'accueil
├── presentation.html             # Page qui sommes-nous
├── services.html                 # Page services
├── contact.html                  # Page contact
├── don.html                      # Page dons
├── blog.html                     # Page blog/actualités
├── mentions-legales.html         # Mentions légales
├── politique-confidentialite.html # Politique de confidentialité
├── styles.css                    # Fichier CSS principal
├── script.js                     # JavaScript général
├── don.js                        # JavaScript page don
├── blog.js                       # JavaScript page blog
├── sitemap.xml                   # Plan du site pour SEO
├── robots.txt                    # Instructions pour robots
└── images/                       # Dossier images
    ├── Logo.webp                 # Logo principal
    ├── favicon.ico               # Icône du site
    ├── Don1.webp à Don4.webp     # Images page don
    ├── Equipe1.webp à Equipe6.webp # Photos équipe
    ├── Blog1.webp à Blog9.webp   # Images blog
    ├── Benevolat.webp            # Image bénévolat
    ├── Partenariat.webp          # Image partenariat
    ├── Materiel.webp             # Image don matériel
    ├── Donateur1.webp à Donateur3.webp # Photos donateurs
    ├── Moncash.webp              # Logo MonCash
    ├── Natcash.webp              # Logo NatCash
    └── Paypal.webp               # Logo PayPal
```

## 🚀 Installation

### Prérequis
- Navigateur web moderne (Chrome, Firefox, Safari, Edge)
- Serveur web (Apache, Nginx, ou serveur de développement)

### Étapes d'installation

1. **Télécharger les fichiers**
   ```bash
   # Cloner ou télécharger tous les fichiers du projet
   ```

2. **Organiser les images**
   - Créer un dossier `images/`
   - Ajouter toutes les images listées ci-dessous

3. **Configuration du serveur**
   - Placer tous les fichiers à la racine de votre serveur web
   - S'assurer que les fichiers HTML sont accessibles

4. **Tester localement**
   - Ouvrir `index.html` dans un navigateur
   - Vérifier que toutes les pages fonctionnent

## 🖼️ Images Requises

### Images Obligatoires
| Fichier | Description | Dimensions recommandées |
|---------|-------------|------------------------|
| `Logo.webp` | Logo principal | 200x200px |
| `favicon.ico` | Icône du site | 32x32px |

### Page Don (4 images)
- `Don1.webp` - Soutien scolaire
- `Don2.webp` - Consultation psychologique
- `Don3.webp` - Matériel scolaire
- `Don4.webp` - Programme complet
- **Dimensions**: 400x300px

### Page Équipe (6 images)
- `Equipe1.webp` à `Equipe6.webp` - Photos membres équipe
- **Format**: Portraits professionnels
- **Dimensions**: 300x300px (carré)

### Page Blog (9 images)
- `Blog1.webp` à `Blog9.webp` - Illustrations articles
- **Dimensions**: 600x400px

### Autres Images
- `Benevolat.webp`, `Partenariat.webp`, `Materiel.webp` (400x300px)
- `Donateur1.webp` à `Donateur3.webp` (150x150px, carré)
- `Moncash.webp`, `Natcash.webp`, `Paypal.webp` (logos paiement)

## 🛠️ Technologies Utilisées

- **HTML5** - Structure sémantique
- **CSS3** - Design et animations
  - CSS Grid & Flexbox
  - CSS Variables
  - Transitions et animations
- **JavaScript (Vanilla)** - Interactivité
  - DOM Manipulation
  - Event Listeners
  - Local Storage (optionnel)
- **WebP** - Format d'image optimisé
- **Responsive Design** - Mobile-first approach

## 📄 Pages du Site

### 1. **Page d'Accueil** (`index.html`)
- Hero section
- Mission et valeurs
- Statistiques d'impact
- Bouton de don

### 2. **Présentation** (`presentation.html`)
- Histoire de l'organisation
- Mission et vision
- Valeurs
- Équipe (6 membres)
- Partenaires

### 3. **Services** (`services.html`)
- 6 services détaillés :
  - Soutien scolaire
  - Consultation psychologique
  - Accompagnement familial
  - Orientation scolaire
  - Ateliers de groupe
  - Partenariats scolaires
- Tarifs

### 4. **Contact** (`contact.html`)
- Coordonnées complètes
- Formulaire de contact
- FAQ
- Section urgence

### 5. **Don** (`don.html`)
- Impact des dons
- Formulaire de don avec :
  - Don unique/mensuel
  - Montants prédéfinis
  - Choix du mode de paiement
- Autres moyens de contribuer
- Témoignages donateurs

### 6. **Blog** (`blog.html`)
- Articles avec filtres par catégorie
- Newsletter
- Pagination

### 7. **Pages Légales**
- Mentions légales
- Politique de confidentialité

## 🔍 SEO et Optimisation

### Optimisations Implémentées
- ✅ Meta descriptions sur toutes les pages
- ✅ Balises Open Graph (partage réseaux sociaux)
- ✅ Schema.org markup (données structurées)
- ✅ Sitemap.xml généré
- ✅ Robots.txt configuré
- ✅ URLs canoniques
- ✅ Images WebP optimisées
- ✅ Chargement lazy des images (à implémenter)

### Recommandations Futures
- [ ] Certificat SSL (HTTPS)
- [ ] Compression Gzip
- [ ] Minification CSS/JS
- [ ] CDN pour images
- [ ] Service Worker (PWA)
- [ ] Preload des ressources critiques

## 📱 Responsive Design

Le site est entièrement responsive avec 3 breakpoints :

- **Mobile** : < 768px
- **Tablette** : 768px - 1024px
- **Desktop** : > 1024px

### Points d'attention mobile
- Menu hamburger
- Formulaires optimisés
- Images adaptatives
- Touch-friendly (boutons > 44px)

## 🌐 Support Navigateurs

### Navigateurs Supportés
- Chrome (dernières 2 versions)
- Firefox (dernières 2 versions)
- Safari (dernières 2 versions)
- Edge (dernières 2 versions)

### Compatibilité Mobile
- iOS Safari 12+
- Chrome Mobile
- Samsung Internet

## 🔧 Maintenance

### Mises à Jour Régulières
- [ ] Actualiser le blog hebdomadairement
- [ ] Vérifier les formulaires mensuellement
- [ ] Mettre à jour les statistiques trimestriellement
- [ ] Renouveler le certificat SSL annuellement
- [ ] Auditer le SEO semestriellement

### Monitoring
- Google Analytics (à installer)
- Google Search Console
- Uptime monitoring

## 📞 Contact

**Educa-Psy**
- 📧 Email : educapsyhaiti@gmail.com
- 📱 Téléphone : +509 3685-9684
- 🌐 Site Web : https://www.educapsy.ht (à adapter)
- 📍 Adresse : Port-au-Prince, Haïti

## 📄 Licence

© 2026 Educa-Psy. Tous droits réservés.

---

**Dernière mise à jour** : Janvier 2026  
**Version** : 1.0.0Education et Psychologie
