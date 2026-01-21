/**
 * NAVIGATION.JS - Gestion du menu et navigation
 * Version: 2.0.0 - Épurée et Optimisée
 * Dépendances: utils.js
 * 
 * Fonctionnalités:
 * - Menu déroulant mobile
 * - Sélecteur de langue
 * - Scroll behavior
 * - Lien actif
 */

(function() {
  'use strict';

  const Navigation = {
    initialized: false,
    menuOpen: false,
    elements: {}, // Stocker les références

    /**
     * Initialiser la navigation
     */
    init: function() {
      if (this.initialized) {
        console.warn('Navigation déjà initialisée');
        return;
      }

      this.initialized = true;
      this.cacheElements();
      this.initMenu();
      this.initLanguageSelector();
      this.initScrollBehavior();
      this.setActiveLink();
      
      window.EducaPsy.Utils.log('✅ Navigation initialisée');
    },

    /**
     * Mettre en cache les éléments DOM
     */
    cacheElements: function() {
      this.elements = {
        btnMenu: document.getElementById('btnMenu'),
        menuDeroulant: document.getElementById('liens-deroulants'),
        selectLangue: document.getElementById('select-langue'),
        header: document.getElementById('header'),
        menuLinks: document.querySelectorAll('.item-menu')
      };

      // Vérifier que les éléments existent
      if (!this.elements.btnMenu || !this.elements.menuDeroulant) {
        console.error('❌ Éléments de menu manquants');
        return false;
      }

      return true;
    },

    /**
     * Initialiser le menu déroulant
     */
    initMenu: function() {
      if (!this.cacheElements()) return;

      const { btnMenu, menuDeroulant } = this.elements;

      // Toggle menu au clic
      btnMenu.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggleMenu();
      });

      // Support clavier
      btnMenu.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.toggleMenu();
        }
      });

      // Fermer si clic ailleurs
      document.addEventListener('click', (e) => {
        if (this.menuOpen && 
            !menuDeroulant.contains(e.target) && 
            e.target !== btnMenu) {
          this.closeMenu();
        }
      });

      // Fermer avec Escape
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.menuOpen) {
          this.closeMenu();
          btnMenu.focus();
        }
      });

      // Fermer après clic sur lien (mobile)
      menuDeroulant.addEventListener('click', (e) => {
        if (e.target.classList.contains('item-menu') && 
            window.innerWidth <= 768) {
          this.closeMenu();
        }
      });

      // Fermer si resize vers desktop
      window.addEventListener('resize', window.EducaPsy.Utils.debounce(() => {
        if (window.innerWidth > 768 && this.menuOpen) {
          this.closeMenu();
        }
      }, 250));
    },

    /**
     * Toggle menu
     */
    toggleMenu: function() {
      this.menuOpen ? this.closeMenu() : this.openMenu();
    },

    /**
     * Ouvrir le menu
     */
    openMenu: function() {
      const { btnMenu, menuDeroulant } = this.elements;
      
      menuDeroulant.classList.add('actif');
      btnMenu.setAttribute('aria-expanded', 'true');
      this.menuOpen = true;

      // Focus sur premier lien
      const firstLink = menuDeroulant.querySelector('.item-menu');
      if (firstLink) {
        setTimeout(() => firstLink.focus(), 100);
      }

      window.EducaPsy.Utils.trackEvent('menu_opened');
    },

    /**
     * Fermer le menu
     */
    closeMenu: function() {
      const { btnMenu, menuDeroulant } = this.elements;
      
      menuDeroulant.classList.remove('actif');
      btnMenu.setAttribute('aria-expanded', 'false');
      this.menuOpen = false;

      window.EducaPsy.Utils.trackEvent('menu_closed');
    },

    /**
     * Initialiser le sélecteur de langue
     */
    initLanguageSelector: function() {
      const { selectLangue } = this.elements;
      if (!selectLangue) {
        console.warn('⚠️ Sélecteur de langue non trouvé');
        return;
      }

      // Charger la langue sauvegardée
      const savedLang = window.EducaPsy.Utils.getCookie('user_language');
      if (savedLang) {
        selectLangue.value = savedLang;
      }

      selectLangue.addEventListener('change', (e) => {
        this.changeLanguage(e.target.value);
      });
    },

    /**
     * Changer la langue
     * @param {string} langue - Code langue (fr, ht, en, es)
     */
    changeLanguage: function(langue) {
      // Sauvegarder
      window.EducaPsy.Utils.setCookie('user_language', langue, 365);
      
      // Logger
      window.EducaPsy.Utils.trackEvent('language_changed', { language: langue });
      window.EducaPsy.Utils.log('🌐 Langue changée:', langue);

      // Afficher notification
      const langNames = {
        fr: 'Français 🇫🇷',
        ht: 'Kreyòl 🇭🇹',
        en: 'English 🇬🇧',
        es: 'Español 🇪🇸'
      };
      
      window.EducaPsy.Utils.showToast(
        `Langue: ${langNames[langue] || langue}`, 
        'success', 
        2000
      );

      // TODO: Implémenter la traduction réelle
      // Option 1: Redirection
      // window.location.href = `/${langue}/index.html`;
      
      // Option 2: Chargement dynamique
      // this.loadTranslations(langue);
    },

    /**
     * Comportement au scroll
     */
    initScrollBehavior: function() {
      const { header } = this.elements;
      if (!header) return;

      let lastScrollTop = 0;
      let ticking = false;

      const handleScroll = () => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

        // Ombre au scroll
        if (scrollTop > 10) {
          header.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
        } else {
          header.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
        }

        lastScrollTop = scrollTop;
        ticking = false;
      };

      window.addEventListener('scroll', () => {
        if (!ticking) {
          window.requestAnimationFrame(handleScroll);
          ticking = true;
        }
      }, { passive: true });

      // Transition fluide
      header.style.transition = 'box-shadow 0.3s ease';
    },

    /**
     * Marquer le lien actif
     */
    setActiveLink: function() {
      const currentPath = window.location.pathname;
      const { menuLinks } = this.elements;
      
      if (!menuLinks) return;

      menuLinks.forEach(link => {
        const href = link.getAttribute('href');
        
        // Vérifier si c'est la page actuelle
        if (currentPath.endsWith(href) || 
            (href === 'index.html' && currentPath === '/')) {
          link.setAttribute('aria-current', 'page');
          link.style.fontWeight = '700';
          link.style.backgroundColor = 'var(--bleu-clair)';
          link.style.color = 'var(--bleu-principal)';
        }
      });
    },

    /**
     * Nettoyer (pour SPA)
     */
    cleanup: function() {
      // Retirer les event listeners si nécessaire
      this.initialized = false;
      this.menuOpen = false;
      this.elements = {};
      window.EducaPsy.Utils.log('🧹 Navigation nettoyée');
    }
  };

  // Initialiser au chargement
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => Navigation.init());
  } else {
    Navigation.init();
  }

  // Exposer globalement
  window.EducaPsy = window.EducaPsy || {};
  window.EducaPsy.Navigation = Navigation;

})();
