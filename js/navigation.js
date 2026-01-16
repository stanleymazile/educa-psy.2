/**
 * NAVIGATION.JS - Gestion du menu et de la navigation
 * Dépendances: utils.js
 */

(function() {
  'use strict';

  const Navigation = {
    initialized: false,
    menuOpen: false,

    /**
     * Initialiser la navigation
     */
    init: function() {
      if (this.initialized) {
        console.warn('Navigation déjà initialisée');
        return;
      }

      this.initialized = true;
      this.initMenu();
      this.initLanguageSelector();
      this.initScrollBehavior();
      
      window.EducaPsy.Utils.log('Navigation initialisée');
    },

    /**
     * Initialiser le menu déroulant
     */
    initMenu: function() {
      const btnMenu = document.getElementById('btnMenu');
      const menuDeroulant = document.getElementById('liens-deroulants');
      
      if (!btnMenu || !menuDeroulant) {
        console.warn('Éléments de menu non trouvés');
        return;
      }

      // Toggle menu au clic sur le bouton
      btnMenu.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggleMenu();
      });

      // Support clavier pour le bouton
      btnMenu.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.toggleMenu();
        }
      });

      // Fermer le menu si on clique ailleurs
      document.addEventListener('click', (e) => {
        if (this.menuOpen && 
            !menuDeroulant.contains(e.target) && 
            e.target !== btnMenu) {
          this.closeMenu();
        }
      });

      // Fermer avec la touche Escape
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.menuOpen) {
          this.closeMenu();
          btnMenu.focus(); // Retour du focus
        }
      });

      // Fermer le menu après clic sur un lien (mobile)
      menuDeroulant.addEventListener('click', (e) => {
        if (e.target.classList.contains('item-menu') && 
            window.innerWidth <= 768) {
          this.closeMenu();
        }
      });

      // Fermer le menu si la fenêtre est redimensionnée en desktop
      window.addEventListener('resize', window.EducaPsy.Utils.debounce(() => {
        if (window.innerWidth > 768 && this.menuOpen) {
          this.closeMenu();
        }
      }, 250));
    },

    /**
     * Ouvrir/fermer le menu
     */
    toggleMenu: function() {
      if (this.menuOpen) {
        this.closeMenu();
      } else {
        this.openMenu();
      }
    },

    /**
     * Ouvrir le menu
     */
    openMenu: function() {
      const btnMenu = document.getElementById('btnMenu');
      const menuDeroulant = document.getElementById('liens-deroulants');
      
      menuDeroulant.classList.add('actif');
      btnMenu.setAttribute('aria-expanded', 'true');
      this.menuOpen = true;

      // Focus sur le premier lien
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
      const btnMenu = document.getElementById('btnMenu');
      const menuDeroulant = document.getElementById('liens-deroulants');
      
      menuDeroulant.classList.remove('actif');
      btnMenu.setAttribute('aria-expanded', 'false');
      this.menuOpen = false;

      window.EducaPsy.Utils.trackEvent('menu_closed');
    },

    /**
     * Initialiser le sélecteur de langue
     */
    initLanguageSelector: function() {
      const selectLangue = document.getElementById('select-langue');
      if (!selectLangue) {
        console.warn('Sélecteur de langue non trouvé');
        return;
      }

      // Charger la langue sauvegardée
      const savedLang = window.EducaPsy.Utils.getCookie('user_language');
      if (savedLang) {
        selectLangue.value = savedLang;
      }

      selectLangue.addEventListener('change', (e) => {
        const langue = e.target.value;
        this.changeLanguage(langue);
      });
    },

    /**
     * Changer la langue
     * @param {string} langue - Code de la langue (fr, ht, en, es)
     */
    changeLanguage: function(langue) {
      // Sauvegarder la préférence
      window.EducaPsy.Utils.setCookie('user_language', langue, 365);
      
      // Logger l'événement
      window.EducaPsy.Utils.trackEvent('language_changed', { language: langue });
      window.EducaPsy.Utils.log('Langue changée:', langue);

      // Afficher une notification
      const langNames = {
        fr: 'Français',
        ht: 'Kreyòl',
        en: 'English',
        es: 'Español'
      };
      
      window.EducaPsy.Utils.showToast(
        `Langue changée: ${langNames[langue] || langue}`, 
        'success', 
        2000
      );

      // TODO: Implémenter la traduction réelle
      // Option 1: Redirection vers des pages traduites
      // window.location.href = `/${langue}/index.html`;
      
      // Option 2: Chargement dynamique des traductions
      // this.loadTranslations(langue);
    },

    /**
     * Initialiser les comportements au scroll
     */
    initScrollBehavior: function() {
      const header = document.getElementById('header');
      if (!header) return;

      let lastScrollTop = 0;
      let ticking = false;

      const handleScroll = () => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

        // Ajouter une ombre au header lors du scroll
        if (scrollTop > 10) {
          header.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
        } else {
          header.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
        }

        // Masquer le header lors du scroll vers le bas (optionnel)
        // Décommenter pour activer
        /*
        if (scrollTop > lastScrollTop && scrollTop > 100) {
          // Scroll down
          header.style.transform = 'translateY(-100%)';
        } else {
          // Scroll up
          header.style.transform = 'translateY(0)';
        }
        */

        lastScrollTop = scrollTop;
        ticking = false;
      };

      window.addEventListener('scroll', () => {
        if (!ticking) {
          window.requestAnimationFrame(() => {
            handleScroll();
          });
          ticking = true;
        }
      });

      // Ajouter une transition fluide au header
      header.style.transition = 'transform 0.3s ease, box-shadow 0.3s ease';
    },

    /**
     * Activer le lien correspondant à la page actuelle
     */
    setActiveLink: function() {
      const currentPath = window.location.pathname;
      const links = document.querySelectorAll('.item-menu');
      
      links.forEach(link => {
        const href = link.getAttribute('href');
        if (currentPath.endsWith(href)) {
          link.setAttribute('aria-current', 'page');
          link.style.fontWeight = '700';
        }
      });
    }
  };

  // Initialiser au chargement du DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      Navigation.init();
      Navigation.setActiveLink();
    });
  } else {
    Navigation.init();
    Navigation.setActiveLink();
  }

  // Exposer globalement pour accès externe si nécessaire
  window.EducaPsy = window.EducaPsy || {};
  window.EducaPsy.Navigation = Navigation;

})();
