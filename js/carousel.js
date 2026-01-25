/**
 * CAROUSEL.JS - Gestion des carrousels modernes
 * Version: 1.0.0
 * Dépendances: utils.js
 * 
 * Fonctionnalités:
 * - Carrousel actualités
 * - Carrousel partenaires
 * - Support tactile (swipe)
 * - Navigation clavier
 * - Auto-play optionnel
 */

(function() {
  'use strict';

  const Carousel = {
    initialized: false,
    carousels: new Map(),

    /**
     * Initialiser tous les carrousels
     */
    init: function() {
      if (this.initialized) {
        console.warn('Carrousels déjà initialisés');
        return;
      }

      this.initialized = true;

      // Initialiser le carrousel d'actualités
      this.initActualitesCarousel();
      
      // Initialiser le carrousel de partenaires
      this.initPartenairesCarousel();

      window.EducaPsy.Utils.log('✅ Carrousels initialisés');
    },

    /**
     * Initialiser le carrousel d'actualités
     */
    initActualitesCarousel: function() {
      const wrapper = document.querySelector('.actualites-carousel-wrapper');
      const carousel = document.querySelector('.actualites-carousel');
      
      if (!wrapper || !carousel) {
        console.warn('⚠️ Carrousel actualités non trouvé');
        return;
      }

      const slides = carousel.querySelectorAll('.actualite-card');
      if (slides.length === 0) return;

      const carouselData = {
        wrapper: wrapper,
        carousel: carousel,
        slides: slides,
        currentIndex: 0,
        totalSlides: slides.length,
        slidesPerView: this.getSlidesPerView(),
        isAnimating: false,
        autoPlayInterval: null
      };

      // Créer les contrôles
      this.createControls(wrapper, carouselData, 'actualites');

      // Activer le swipe
      this.enableSwipe(wrapper, carouselData);

      // Navigation clavier
      this.enableKeyboardNav(carouselData);

      // Responsive
      this.handleResize(carouselData);

      // Sauvegarder
      this.carousels.set('actualites', carouselData);

      // Auto-play (optionnel)
      // this.startAutoPlay(carouselData, 5000);
    },

    /**
     * Initialiser le carrousel de partenaires
     */
    initPartenairesCarousel: function() {
      const wrapper = document.querySelector('.partenaires-carousel-wrapper');
      const carousel = document.querySelector('.partenaires-carousel');
      
      if (!wrapper || !carousel) {
        console.warn('⚠️ Carrousel partenaires non trouvé');
        return;
      }

      const slides = carousel.querySelectorAll('.partenaire-card');
      if (slides.length === 0) return;

      const carouselData = {
        wrapper: wrapper,
        carousel: carousel,
        slides: slides,
        currentIndex: 0,
        totalSlides: slides.length,
        slidesPerView: this.getPartenairesSlidesPerView(),
        isAnimating: false,
        autoPlayInterval: null
      };

      // Créer les contrôles
      this.createControls(wrapper, carouselData, 'partenaires');

      // Activer le swipe
      this.enableSwipe(wrapper, carouselData);

      // Navigation clavier
      this.enableKeyboardNav(carouselData);

      // Responsive
      this.handleResize(carouselData);

      // Sauvegarder
      this.carousels.set('partenaires', carouselData);

      // Auto-play pour partenaires
      this.startAutoPlay(carouselData, 4000);
    },

    /**
     * Créer les contrôles du carrousel
     */
    createControls: function(wrapper, data, type) {
      // Vérifier si les contrôles existent déjà
      if (wrapper.querySelector('.carousel-controls')) return;

      // Créer le conteneur de contrôles
      const controlsContainer = document.createElement('div');
      controlsContainer.className = 'carousel-controls';

      // Bouton précédent
      const prevBtn = document.createElement('button');
      prevBtn.className = 'carousel-btn carousel-prev';
      prevBtn.innerHTML = '‹';
      prevBtn.setAttribute('aria-label', 'Slide précédent');
      prevBtn.addEventListener('click', () => this.prevSlide(data));

      // Bouton suivant
      const nextBtn = document.createElement('button');
      nextBtn.className = 'carousel-btn carousel-next';
      nextBtn.innerHTML = '›';
      nextBtn.setAttribute('aria-label', 'Slide suivant');
      nextBtn.addEventListener('click', () => this.nextSlide(data));

      controlsContainer.appendChild(prevBtn);
      controlsContainer.appendChild(nextBtn);

      // Insérer avant le carrousel
      wrapper.parentNode.insertBefore(controlsContainer, wrapper);

      // Créer les dots
      this.createDots(wrapper, data, type);

      // Mettre à jour l'état initial
      this.updateControls(data);
    },

    /**
     * Créer les indicateurs (dots)
     */
    createDots: function(wrapper, data, type) {
      const dotsContainer = document.createElement('div');
      dotsContainer.className = 'carousel-dots';

      const maxDots = Math.ceil(data.totalSlides / data.slidesPerView);

      for (let i = 0; i < maxDots; i++) {
        const dot = document.createElement('button');
        dot.className = 'carousel-dot';
        dot.setAttribute('aria-label', `Aller au groupe ${i + 1}`);
        
        if (i === 0) {
          dot.classList.add('active');
        }

        dot.addEventListener('click', () => {
          data.currentIndex = i * data.slidesPerView;
          this.updateCarousel(data);
        });

        dotsContainer.appendChild(dot);
      }

      // Insérer après les contrôles
      const controls = wrapper.previousElementSibling;
      wrapper.parentNode.insertBefore(dotsContainer, wrapper);
    },

    /**
     * Slide suivant
     */
    nextSlide: function(data) {
      if (data.isAnimating) return;

      const maxIndex = data.totalSlides - data.slidesPerView;
      
      if (data.currentIndex < maxIndex) {
        data.currentIndex++;
        this.updateCarousel(data);
      } else {
        // Retour au début
        data.currentIndex = 0;
        this.updateCarousel(data);
      }

      window.EducaPsy.Utils.trackEvent('carousel_next');
    },

    /**
     * Slide précédent
     */
    prevSlide: function(data) {
      if (data.isAnimating) return;

      if (data.currentIndex > 0) {
        data.currentIndex--;
        this.updateCarousel(data);
      } else {
        // Aller à la fin
        data.currentIndex = data.totalSlides - data.slidesPerView;
        this.updateCarousel(data);
      }

      window.EducaPsy.Utils.trackEvent('carousel_prev');
    },

    /**
     * Mettre à jour le carrousel
     */
    updateCarousel: function(data) {
      data.isAnimating = true;

      const slideWidth = 100 / data.slidesPerView;
      const offset = -data.currentIndex * slideWidth;

      data.carousel.style.transform = `translateX(${offset}%)`;

      this.updateControls(data);

      setTimeout(() => {
        data.isAnimating = false;
      }, 500);
    },

    /**
     * Mettre à jour l'état des contrôles
     */
    updateControls: function(data) {
      const wrapper = data.wrapper;
      const controls = wrapper.previousElementSibling;
      
      if (!controls || !controls.classList.contains('carousel-controls')) return;

      const prevBtn = controls.querySelector('.carousel-prev');
      const nextBtn = controls.querySelector('.carousel-next');
      
      const maxIndex = data.totalSlides - data.slidesPerView;

      // Activer/désactiver les boutons (optionnel)
      // prevBtn.disabled = data.currentIndex === 0;
      // nextBtn.disabled = data.currentIndex >= maxIndex;

      // Mettre à jour les dots
      const dots = wrapper.previousElementSibling;
      if (dots && dots.classList.contains('carousel-dots')) {
        const allDots = dots.querySelectorAll('.carousel-dot');
        const activeDotIndex = Math.floor(data.currentIndex / data.slidesPerView);
        
        allDots.forEach((dot, index) => {
          if (index === activeDotIndex) {
            dot.classList.add('active');
          } else {
            dot.classList.remove('active');
          }
        });
      }
    },

    /**
     * Activer la navigation tactile (swipe)
     */
    enableSwipe: function(wrapper, data) {
      let touchStartX = 0;
      let touchEndX = 0;

      wrapper.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
      }, { passive: true });

      wrapper.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        this.handleSwipe(touchStartX, touchEndX, data);
      }, { passive: true });

      // Support souris
      let mouseStartX = 0;
      let isDragging = false;

      wrapper.addEventListener('mousedown', (e) => {
        isDragging = true;
        mouseStartX = e.screenX;
        wrapper.style.cursor = 'grabbing';
      });

      wrapper.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        e.preventDefault();
      });

      wrapper.addEventListener('mouseup', (e) => {
        if (!isDragging) return;
        isDragging = false;
        wrapper.style.cursor = 'grab';
        this.handleSwipe(mouseStartX, e.screenX, data);
      });

      wrapper.addEventListener('mouseleave', () => {
        isDragging = false;
        wrapper.style.cursor = 'grab';
      });
    },

    /**
     * Gérer le swipe
     */
    handleSwipe: function(startX, endX, data) {
      const threshold = 50;
      const diff = startX - endX;

      if (Math.abs(diff) < threshold) return;

      if (diff > 0) {
        // Swipe left - next
        this.nextSlide(data);
      } else {
        // Swipe right - prev
        this.prevSlide(data);
      }
    },

    /**
     * Navigation clavier
     */
    enableKeyboardNav: function(data) {
      document.addEventListener('keydown', (e) => {
        // Vérifier si un carrousel est visible
        if (!this.isCarouselVisible(data.wrapper)) return;

        if (e.key === 'ArrowLeft') {
          e.preventDefault();
          this.prevSlide(data);
        } else if (e.key === 'ArrowRight') {
          e.preventDefault();
          this.nextSlide(data);
        }
      });
    },

    /**
     * Vérifier si le carrousel est visible
     */
    isCarouselVisible: function(wrapper) {
      const rect = wrapper.getBoundingClientRect();
      return rect.top < window.innerHeight && rect.bottom > 0;
    },

    /**
     * Obtenir le nombre de slides visibles
     */
    getSlidesPerView: function() {
      const width = window.innerWidth;
      if (width >= 1024) return 3;
      if (width >= 768) return 2;
      return 1;
    },

    /**
     * Obtenir le nombre de slides partenaires visibles
     */
    getPartenairesSlidesPerView: function() {
      const width = window.innerWidth;
      if (width >= 1024) return 3;
      if (width >= 768) return 2;
      return 2; // Toujours 2 minimum pour partenaires
    },

    /**
     * Gérer le resize
     */
    handleResize: function(data) {
      const resizeHandler = window.EducaPsy.Utils.debounce(() => {
        const oldSlidesPerView = data.slidesPerView;
        data.slidesPerView = this.getSlidesPerView();

        if (oldSlidesPerView !== data.slidesPerView) {
          // Recalculer l'index
          data.currentIndex = Math.min(
            data.currentIndex,
            data.totalSlides - data.slidesPerView
          );
          
          this.updateCarousel(data);
          
          // Recréer les dots
          const dotsContainer = data.wrapper.previousElementSibling;
          if (dotsContainer && dotsContainer.classList.contains('carousel-dots')) {
            dotsContainer.remove();
            const type = this.carousels.get('actualites') === data ? 'actualites' : 'partenaires';
            this.createDots(data.wrapper, data, type);
          }
        }
      }, 250);

      window.addEventListener('resize', resizeHandler);
    },

    /**
     * Démarrer l'auto-play
     */
    startAutoPlay: function(data, interval = 5000) {
      this.stopAutoPlay(data);

      data.autoPlayInterval = setInterval(() => {
        if (this.isCarouselVisible(data.wrapper)) {
          this.nextSlide(data);
        }
      }, interval);

      // Arrêter au survol
      data.wrapper.addEventListener('mouseenter', () => {
        this.stopAutoPlay(data);
      });

      // Redémarrer quand la souris sort
      data.wrapper.addEventListener('mouseleave', () => {
        this.startAutoPlay(data, interval);
      });
    },

    /**
     * Arrêter l'auto-play
     */
    stopAutoPlay: function(data) {
      if (data.autoPlayInterval) {
        clearInterval(data.autoPlayInterval);
        data.autoPlayInterval = null;
      }
    },

    /**
     * Nettoyer
     */
    cleanup: function() {
      this.carousels.forEach(data => {
        this.stopAutoPlay(data);
      });
      this.carousels.clear();
      this.initialized = false;
      window.EducaPsy.Utils.log('🧹 Carrousels nettoyés');
    }
  };

  // Initialiser au chargement
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => Carousel.init());
  } else {
    Carousel.init();
  }

  // Exposer globalement
  window.EducaPsy = window.EducaPsy || {};
  window.EducaPsy.Carousel = Carousel;

})();
