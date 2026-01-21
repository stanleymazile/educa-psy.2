/**
 * ANIMATIONS.JS - Animations pour index.html uniquement
 * Version: 2.0.0 - Épurée et Optimisée
 * Dépendances: utils.js
 * 
 * Fonctionnalités:
 * - Animation des sections au scroll
 * - Animation des valeurs (3 items)
 * - Animation des compteurs statistiques
 */

(function() {
  'use strict';

  const Animations = {
    initialized: false,
    observers: [],
    animatedElements: new Set(),

    /**
     * Initialiser toutes les animations
     */
    init: function() {
      if (this.initialized) {
        console.warn('Animations déjà initialisées');
        return;
      }

      this.initialized = true;

      // Vérifier le support de IntersectionObserver
      if (!('IntersectionObserver' in window)) {
        console.warn('IntersectionObserver non supporté - Affichage immédiat');
        this.showAllElements();
        return;
      }

      // Vérifier les préférences d'animation
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        console.log('Animations réduites selon préférences utilisateur');
        this.showAllElements();
        return;
      }

      // Initialiser les animations
      this.initScrollAnimations();
      this.initValuesAnimation();
      this.initStatsAnimation();
      
      window.EducaPsy.Utils.log('✅ Animations initialisées');
    },

    /**
     * Afficher tous les éléments immédiatement (fallback)
     */
    showAllElements: function() {
      // Sections principales
      const sections = document.querySelectorAll(
        '.section-apropos, .section-impact, .section-don'
      );
      sections.forEach(section => {
        section.classList.add('visible');
        section.style.opacity = '1';
        section.style.transform = 'translateY(0)';
      });

      // Valeurs
      const valeurs = document.querySelectorAll('.valeur-item');
      valeurs.forEach(valeur => {
        valeur.style.opacity = '1';
        valeur.style.transform = 'scale(1)';
      });

      // Statistiques
      const statNombres = document.querySelectorAll('.stat-nombre');
      statNombres.forEach(stat => {
        stat.style.opacity = '1';
      });
    },

    /**
     * Animation des sections au scroll
     */
    initScrollAnimations: function() {
      const sections = document.querySelectorAll(
        '.section-apropos, .section-impact, .section-don'
      );
      
      if (sections.length === 0) return;

      const observerOptions = {
        threshold: 0.15,
        rootMargin: '0px 0px -80px 0px'
      };

      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !this.animatedElements.has(entry.target)) {
            entry.target.classList.add('visible');
            this.animatedElements.add(entry.target);
            observer.unobserve(entry.target);
            
            window.EducaPsy.Utils.trackEvent('section_viewed', {
              section: entry.target.className
            });
          }
        });
      }, observerOptions);

      sections.forEach(section => observer.observe(section));
      this.observers.push(observer);
    },

    /**
     * Animation des 3 valeurs
     */
    initValuesAnimation: function() {
      const valeurs = document.querySelectorAll('.valeur-item');
      if (valeurs.length === 0) return;

      const observerOptions = {
        threshold: 0.2,
        rootMargin: '0px 0px -50px 0px'
      };

      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !entry.target.classList.contains('animate-in')) {
            entry.target.classList.add('animate-in');
            observer.unobserve(entry.target);
          }
        });
      }, observerOptions);

      valeurs.forEach(valeur => observer.observe(valeur));
      this.observers.push(observer);
    },

    /**
     * Animation des compteurs statistiques (500+, 20+, 15+)
     */
    initStatsAnimation: function() {
      const statNombres = document.querySelectorAll('.stat-nombre');
      if (statNombres.length === 0) return;

      const observerOptions = {
        threshold: 0.5,
        rootMargin: '0px'
      };

      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !entry.target.classList.contains('animated')) {
            entry.target.classList.add('animated');
            this.animateNumber(entry.target);
            observer.unobserve(entry.target);
          }
        });
      }, observerOptions);

      statNombres.forEach(stat => observer.observe(stat));
      this.observers.push(observer);
    },

    /**
     * Animer un compteur numérique
     * @param {HTMLElement} element - Élément contenant le nombre
     */
    animateNumber: function(element) {
      const text = element.textContent.trim();
      const hasPlus = text.includes('+');
      
      // Extraire le nombre
      const match = text.match(/\d+/);
      if (!match) {
        console.warn('⚠️ Nombre invalide:', text);
        return;
      }
      
      const target = parseInt(match[0]);
      const duration = 2000; // 2 secondes
      const startTime = performance.now();

      element.classList.add('counting');
      
      const updateNumber = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing: easeOutQuart
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const current = Math.round(target * easeOutQuart);
        
        // Mise à jour avec formatage
        element.textContent = current.toLocaleString('fr-FR') + (hasPlus ? '+' : '');
        
        if (progress < 1) {
          requestAnimationFrame(updateNumber);
        } else {
          // Valeur finale exacte
          element.textContent = target.toLocaleString('fr-FR') + (hasPlus ? '+' : '');
          element.classList.remove('counting');
          
          window.EducaPsy.Utils.trackEvent('counter_animated', {
            value: target
          });
        }
      };
      
      requestAnimationFrame(updateNumber);
    },

    /**
     * Nettoyer les observers
     */
    cleanup: function() {
      this.observers.forEach(observer => observer.disconnect());
      this.observers = [];
      this.animatedElements.clear();
      this.initialized = false;
      window.EducaPsy.Utils.log('🧹 Animations nettoyées');
    }
  };

  // Initialiser au chargement du DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => Animations.init());
  } else {
    Animations.init();
  }

  // Exposer globalement
  window.EducaPsy = window.EducaPsy || {};
  window.EducaPsy.Animations = Animations;

})();
