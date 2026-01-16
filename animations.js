/**
 * ANIMATIONS.JS - Animations au scroll et compteurs
 * Dépendances: utils.js
 */

(function() {
  'use strict';

  const Animations = {
    initialized: false,
    observers: [],

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
        console.warn('IntersectionObserver non supporté');
        // Fallback: tout afficher immédiatement
        this.showAllElements();
        return;
      }

      this.initScrollAnimations();
      this.initStatsAnimation();
      
      window.EducaPsy.Utils.log('Animations initialisées');
    },

    /**
     * Afficher tous les éléments (fallback)
     */
    showAllElements: function() {
      const sections = document.querySelectorAll('.section-apropos, .section-impact, .section-don');
      sections.forEach(section => {
        section.classList.add('visible');
        section.style.opacity = '1';
        section.style.transform = 'translateY(0)';
      });
    },

    /**
     * Initialiser les animations au scroll pour les sections
     */
    initScrollAnimations: function() {
      const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      };

      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            
            // Optionnel: Ne plus observer une fois visible
            // observer.unobserve(entry.target);
            
            window.EducaPsy.Utils.trackEvent('section_viewed', {
              section: entry.target.className
            });
          }
        });
      }, observerOptions);

      // Observer les sections principales
      const sections = document.querySelectorAll('.section-apropos, .section-impact, .section-don');
      sections.forEach(section => {
        observer.observe(section);
      });

      this.observers.push(observer);
    },

    /**
     * Initialiser l'animation des statistiques (compteurs)
     */
    initStatsAnimation: function() {
      const statNombres = document.querySelectorAll('.stat-nombre');
      if (statNombres.length === 0) return;

      const statObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !entry.target.classList.contains('animated')) {
            entry.target.classList.add('animated');
            this.animateNumber(entry.target);
            
            // Ne plus observer après animation
            statObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.5 });

      statNombres.forEach(stat => {
        statObserver.observe(stat);
      });

      this.observers.push(statObserver);
    },

    /**
     * Animer un nombre (compteur)
     * @param {HTMLElement} element - Élément contenant le nombre
     */
    animateNumber: function(element) {
      const text = element.textContent;
      const hasPlus = text.includes('+');
      const target = parseInt(text.replace(/[^0-9]/g, ''));
      
      if (isNaN(target)) {
        console.warn('Nombre invalide pour l\'animation:', text);
        return;
      }

      const duration = 2000; // 2 secondes
      const startTime = performance.now();
      
      const updateNumber = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Fonction d'easing pour un effet plus naturel
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const current = Math.floor(target * easeOutQuart);
        
        element.textContent = current + (hasPlus ? '+' : '');
        
        if (progress < 1) {
          requestAnimationFrame(updateNumber);
        } else {
          // S'assurer que la valeur finale est correcte
          element.textContent = target + (hasPlus ? '+' : '');
        }
      };
      
      requestAnimationFrame(updateNumber);
    },

    /**
     * Ajouter une animation de fade-in à un élément
     * @param {HTMLElement} element - Élément à animer
     * @param {number} delay - Délai avant l'animation (ms)
     */
    fadeIn: function(element, delay = 0) {
      if (!element) return;

      element.style.opacity = '0';
      element.style.transform = 'translateY(20px)';
      element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
      
      setTimeout(() => {
        element.style.opacity = '1';
        element.style.transform = 'translateY(0)';
      }, delay);
    },

    /**
     * Ajouter une animation de slide-in depuis la gauche
     * @param {HTMLElement} element - Élément à animer
     * @param {number} delay - Délai avant l'animation (ms)
     */
    slideInLeft: function(element, delay = 0) {
      if (!element) return;

      element.style.opacity = '0';
      element.style.transform = 'translateX(-50px)';
      element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
      
      setTimeout(() => {
        element.style.opacity = '1';
        element.style.transform = 'translateX(0)';
      }, delay);
    },

    /**
     * Ajouter une animation de slide-in depuis la droite
     * @param {HTMLElement} element - Élément à animer
     * @param {number} delay - Délai avant l'animation (ms)
     */
    slideInRight: function(element, delay = 0) {
      if (!element) return;

      element.style.opacity = '0';
      element.style.transform = 'translateX(50px)';
      element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
      
      setTimeout(() => {
        element.style.opacity = '1';
        element.style.transform = 'translateX(0)';
      }, delay);
    },

    /**
     * Ajouter une animation de scale
     * @param {HTMLElement} element - Élément à animer
     * @param {number} delay - Délai avant l'animation (ms)
     */
    scaleIn: function(element, delay = 0) {
      if (!element) return;

      element.style.opacity = '0';
      element.style.transform = 'scale(0.8)';
      element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
      
      setTimeout(() => {
        element.style.opacity = '1';
        element.style.transform = 'scale(1)';
      }, delay);
    },

    /**
     * Animer une liste d'éléments avec délai progressif
     * @param {NodeList|Array} elements - Liste d'éléments
     * @param {string} animationType - Type d'animation: 'fadeIn', 'slideInLeft', etc.
     * @param {number} stagger - Délai entre chaque élément (ms)
     */
    staggerAnimation: function(elements, animationType = 'fadeIn', stagger = 100) {
      if (!elements || elements.length === 0) return;

      elements.forEach((element, index) => {
        const delay = index * stagger;
        
        switch(animationType) {
          case 'fadeIn':
            this.fadeIn(element, delay);
            break;
          case 'slideInLeft':
            this.slideInLeft(element, delay);
            break;
          case 'slideInRight':
            this.slideInRight(element, delay);
            break;
          case 'scaleIn':
            this.scaleIn(element, delay);
            break;
          default:
            this.fadeIn(element, delay);
        }
      });
    },

    /**
     * Nettoyer les observers (à appeler lors de la destruction)
     */
    cleanup: function() {
      this.observers.forEach(observer => {
        observer.disconnect();
      });
      this.observers = [];
      this.initialized = false;
    },

    /**
     * Parallax simple pour le hero (optionnel)
     */
    initParallax: function() {
      const hero = document.querySelector('.hero');
      if (!hero) return;

      let ticking = false;

      const updateParallax = () => {
        const scrolled = window.pageYOffset;
        const parallaxSpeed = 0.5;
        
        hero.style.transform = `translateY(${scrolled * parallaxSpeed}px)`;
        ticking = false;
      };

      window.addEventListener('scroll', () => {
        if (!ticking) {
          window.requestAnimationFrame(updateParallax);
          ticking = true;
        }
      });
    }
  };

  // Initialiser au chargement du DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      Animations.init();
      
      // Optionnel: Activer le parallax
      // Animations.initParallax();
    });
  } else {
    Animations.init();
  }

  // Exposer globalement
  window.EducaPsy = window.EducaPsy || {};
  window.EducaPsy.Animations = Animations;

})();
