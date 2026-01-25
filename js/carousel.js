/**
 * CAROUSEL.JS - Gestion des carrousels (Actualités & Partenaires)
 * Version: 2.5.0 - Optimisée pour design épuré et swipe moderne
 * Dépendances: utils.js
 */

(function() {
  'use strict';

  const Carousel = {
    initialized: false,
    carousels: new Map(),

    init: function() {
      if (this.initialized) return;
      this.initialized = true;

      // Initialisation des deux types de carrousels
      this.setupCarousel('actualites', '.actualites-carousel-wrapper', '.actualite-card');
      this.setupCarousel('partenaires', '.partenaires-carousel-wrapper', '.partenaire-card');

      window.EducaPsy.Utils.log('✅ Carrousels modernisés initialisés');
    },

    /**
     * Configuration générique d'un carrousel
     */
    setupCarousel: function(id, wrapperSelector, cardSelector) {
      const wrapper = document.querySelector(wrapperSelector);
      const track = wrapper?.querySelector('div[class$="-carousel"]');
      
      if (!wrapper || !track) return;

      const slides = track.querySelectorAll(cardSelector);
      if (slides.length === 0) return;

      const data = {
        id: id,
        wrapper: wrapper,
        track: track,
        slides: slides,
        currentIndex: 0,
        slidesPerView: this.getSlidesPerView(id)
      };

      this.createDots(wrapper, data);
      this.bindEvents(data);
      this.carousels.set(id, data);

      // Auto-play discret pour les partenaires uniquement sur Desktop
      if (id === 'partenaires' && window.innerWidth >= 768) {
        this.startAutoPlay(data);
      }
    },

    /**
     * Création des Dots (Points de navigation)
     */
    createDots: function(wrapper, data) {
      // Nettoyage si existant
      const existingDots = wrapper.parentNode.querySelector(`.carousel-dots[data-id="${data.id}"]`);
      if (existingDots) existingDots.remove();

      const dotsContainer = document.createElement('div');
      dotsContainer.className = 'carousel-dots';
      dotsContainer.dataset.id = data.id;

      // Calcul du nombre de points (un point par slide visible)
      data.slides.forEach((_, index) => {
        const dot = document.createElement('button');
        dot.className = 'carousel-dot';
        dot.setAttribute('aria-label', `Go to slide ${index + 1}`);
        
        dot.addEventListener('click', () => this.scrollToIndex(data, index));
        dotsContainer.appendChild(dot);
      });

      wrapper.after(dotsContainer);
      this.updateActiveDot(data);
    },

    /**
     * Événements : Scroll et Redimensionnement
     */
    bindEvents: function(data) {
      let scrollTimeout;
      
      // Mise à jour des dots au scroll (Mobile & Desktop)
      data.track.addEventListener('scroll', () => {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
          const scrollLeft = data.track.scrollLeft;
          const slideWidth = data.slides[0].offsetWidth + 16; // 16 = gap
          data.currentIndex = Math.round(scrollLeft / slideWidth);
          this.updateActiveDot(data);
        }, 50);
      }, { passive: true });

      // Resize avec debounce (via utils.js)
      window.addEventListener('resize', window.EducaPsy.Utils.debounce(() => {
        data.slidesPerView = this.getSlidesPerView(data.id);
        this.createDots(data.wrapper, data);
      }, 250));
    },

    /**
     * Navigation vers un index précis
     */
    scrollToIndex: function(data, index) {
      const gap = 16;
      const slideWidth = data.slides[0].offsetWidth + gap;
      
      data.track.scrollTo({
        left: index * slideWidth,
        behavior: 'smooth'
      });
    },

    /**
     * Mise à jour visuelle du dot actif
     */
    updateActiveDot: function(data) {
      const dotsContainer = data.wrapper.parentNode.querySelector(`.carousel-dots[data-id="${data.id}"]`);
      if (!dotsContainer) return;

      const dots = dotsContainer.querySelectorAll('.carousel-dot');
      dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === data.currentIndex);
      });
    },

    /**
     * Logique Responsive (Nombre de slides)
     */
    getSlidesPerView: function(id) {
      const width = window.innerWidth;
      if (width < 768) return 1.2; // Affiche un bout du suivant sur mobile
      return id === 'actualites' ? 3 : 4;
    },

    /**
     * Auto-play (Optionnel - Partenaires)
     */
    startAutoPlay: function(data) {
      setInterval(() => {
        let next = data.currentIndex + 1;
        if (next >= data.slides.length) next = 0;
        this.scrollToIndex(data, next);
      }, 5000);
    }
  };

  // Initialisation au chargement du DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => Carousel.init());
  } else {
    Carousel.init();
  }

  window.EducaPsy = window.EducaPsy || {};
  window.EducaPsy.Carousel = Carousel;

})();

