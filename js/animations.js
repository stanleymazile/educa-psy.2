/**
 * ANIMATIONS.JS - Animations pour Educa-Psy
 * Version: 2.1.0 - Intégration Carrousels & Reveal
 * Dépendances: utils.js
 */

(function() {
  'use strict';

  const Animations = {
    initialized: false,
    observers: [],
    animatedElements: new Set(),

    init: function() {
      if (this.initialized) return;
      this.initialized = true;

      if (!('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        this.showAllElements();
        return;
      }

      // Initialiser les animations
      this.initScrollAnimations();
      this.initValuesAnimation();
      this.initStatsAnimation();
      
      window.EducaPsy.Utils.log('✅ Animations initialisées (Carrousels inclus)');
    },

    showAllElements: function() {
      const allElements = document.querySelectorAll(
        '.section-apropos, .section-impact, .section-don, .section-actualites, .section-partenaires, .reveal, .valeur-item'
      );
      allElements.forEach(el => {
        el.classList.add('visible', 'active', 'animate-in');
        el.style.opacity = '1';
        el.style.transform = 'none';
      });
    },

    /**
     * Animation des sections au scroll (Inclut désormais les Carrousels via .reveal)
     */
    initScrollAnimations: function() {
      // On cible les anciennes sections ET les nouveaux carrousels via la classe .reveal
      const sections = document.querySelectorAll(
        '.section-apropos, .section-impact, .section-don, .section-actualites, .section-partenaires, .reveal'
      );
      
      if (sections.length === 0) return;

      const observerOptions = {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px'
      };

      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !this.animatedElements.has(entry.target)) {
            // Support pour tes anciens styles (.visible) et nouveaux styles (.active)
            entry.target.classList.add('visible');
            entry.target.classList.add('active'); 
            
            this.animatedElements.add(entry.target);
            observer.unobserve(entry.target);
          }
        });
      }, observerOptions);

      sections.forEach(section => observer.observe(section));
      this.observers.push(observer);
    },

    initValuesAnimation: function() {
      const valeurs = document.querySelectorAll('.valeur-item');
      if (valeurs.length === 0) return;

      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.2 });

      valeurs.forEach(valeur => observer.observe(valeur));
      this.observers.push(observer);
    },

    initStatsAnimation: function() {
      const statNombres = document.querySelectorAll('.stat-nombre');
      if (statNombres.length === 0) return;

      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !entry.target.classList.contains('animated')) {
            entry.target.classList.add('animated');
            this.animateNumber(entry.target);
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.5 });

      statNombres.forEach(stat => observer.observe(stat));
      this.observers.push(observer);
    },

    animateNumber: function(element) {
      const text = element.textContent.trim();
      const hasPlus = text.includes('+');
      const match = text.match(/\d+/);
      if (!match) return;
      
      const target = parseInt(match[0]);
      const duration = 2000;
      const startTime = performance.now();

      element.classList.add('counting');
      
      const updateNumber = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const current = Math.round(target * easeOutQuart);
        
        element.textContent = current.toLocaleString('fr-FR') + (hasPlus ? '+' : '');
        
        if (progress < 1) {
          requestAnimationFrame(updateNumber);
        } else {
          element.textContent = target.toLocaleString('fr-FR') + (hasPlus ? '+' : '');
          element.classList.remove('counting');
        }
      };
      requestAnimationFrame(updateNumber);
    },

    cleanup: function() {
      this.observers.forEach(observer => observer.disconnect());
      this.observers = [];
      this.animatedElements.clear();
      this.initialized = false;
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => Animations.init());
  } else {
    Animations.init();
  }

  window.EducaPsy = window.EducaPsy || {};
  window.EducaPsy.Animations = Animations;

})();

