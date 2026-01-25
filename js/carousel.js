/**
 * CAROUSEL.JS - Gestion des carrousels simples avec swipe
 * Version Simple: 1.0.0
 * Dépendances: utils.js
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

      // Initialiser carrousel actualités
      this.initActualitesCarousel();
      
      // Initialiser carrousel partenaires
      this.initPartenairesCarousel();

      window.EducaPsy.Utils.log('✅ Carrousels simples initialisés');
    },

    /**
     * Initialiser carrousel actualités
     */
    initActualitesCarousel: function() {
      const wrapper = document.querySelector('.actualites-carousel-wrapper');
      const carousel = document.querySelector('.actualites-carousel');
      
      if (!wrapper || !carousel) return;

      const slides = carousel.querySelectorAll('.actualite-card');
      if (slides.length === 0) return;

      const carouselData = {
        wrapper: wrapper,
        carousel: carousel,
        slides: slides,
        currentIndex: 0,
        totalSlides: slides.length,
        slidesPerView: this.getSlidesPerView(),
        isAnimating: false
      };

      // Sur mobile: swipe natif + observer
      if (window.innerWidth < 768) {
        this.enableNativeSwipe(carouselData);
      } else {
        // Desktop: contrôles classiques
        this.createControls(wrapper, carouselData);
        this.enableSwipe(wrapper, carouselData);
      }

      this.createDots(wrapper, carouselData);
      this.handleResize(carouselData);

      this.carousels.set('actualites', carouselData);
    },

    /**
     * Initialiser carrousel partenaires
     */
    initPartenairesCarousel: function() {
      const wrapper = document.querySelector('.partenaires-carousel-wrapper');
      const carousel = document.querySelector('.partenaires-carousel');
      
      if (!wrapper || !carousel) return;

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

      // Sur mobile: swipe natif
      if (window.innerWidth < 768) {
        this.enableNativeSwipe(carouselData);
      } else {
        this.createControls(wrapper, carouselData);
        this.enableSwipe(wrapper, carouselData);
        // Auto-play uniquement sur desktop
        this.startAutoPlay(carouselData, 4000);
      }

      this.createDots(wrapper, carouselData);
      this.handleResize(carouselData);

      this.carousels.set('partenaires', carouselData);
    },

    /**
     * Activer le swipe natif (mobile)
     */
    enableNativeSwipe: function(data) {
      const { carousel } = data;
      
      // Utiliser scroll-snap-type (déjà dans CSS)
      // Écouter les changements de scroll pour mettre à jour les dots
      let scrollTimeout;
      
      carousel.addEventListener('scroll', () => {
        clearTimeout(scrollTimeout);
        
        scrollTimeout = setTimeout(() => {
          // Calculer l'index actuel basé sur la position de scroll
          const scrollLeft = carousel.scrollLeft;
          const slideWidth = carousel.offsetWidth;
          const newIndex = Math.round(scrollLeft / slideWidth);
          
          if (newIndex !== data.currentIndex) {
            data.currentIndex = newIndex;
            this.updateDots(data);
          }
        }, 100);
      }, { passive: true });
    },

    /**
     * Créer les contrôles (desktop seulement)
     */
    createControls: function(wrapper, data) {
      if (wrapper.querySelector('.carousel-controls')) return;

      const controlsContainer = document.createElement('div');
      controlsContainer.className = 'carousel-controls';

      const prevBtn = document.createElement('button');
      prevBtn.className = 'carousel-btn carousel-prev';
      prevBtn.innerHTML = '‹';
      prevBtn.setAttribute('aria-label', 'Slide précédent');
      prevBtn.addEventListener('click', () => this.prevSlide(data));

      const nextBtn = document.createElement('button');
      nextBtn.className = 'carousel-btn carousel-next';
      nextBtn.innerHTML = '›';
      nextBtn.setAttribute('aria-label', 'Slide suivant');
      nextBtn.addEventListener('click', () => this.nextSlide(data));

      controlsContainer.appendChild(prevBtn);
      controlsContainer.appendChild(nextBtn);

      wrapper.parentNode.insertBefore(controlsContainer, wrapper);
      this.updateControls(data);
    },

    /**
     * Créer les dots
     */
    createDots: function(wrapper, data) {
      const dotsContainer = document.createElement('div');
      dotsContainer.className = 'carousel-dots';

      const maxDots = Math.ceil(data.totalSlides / data.slidesPerView);

      for (let i = 0; i < maxDots; i++) {
        const dot = document.createElement('button');
        dot.className = 'carousel-dot';
        dot.setAttribute('aria-label', `Aller au groupe ${i + 1}`);
        
        if (i === 0) dot.classList.add('active');

        dot.addEventListener('click', () => {
          const newIndex = i * data.slidesPerView;
          this.goToSlide(data, newIndex);
        });

        dotsContainer.appendChild(dot);
      }

      wrapper.parentNode.insertBefore(dotsContainer, wrapper);
    },

    /**
     * Aller à un slide spécifique
     */
    goToSlide: function(data, index) {
      if (data.isAnimating) return;
      
      data.currentIndex = Math.max(0, Math.min(index, data.totalSlides - data.slidesPerView));
      
      if (window.innerWidth < 768) {
        // Mobile: scroll natif
        const slideWidth = data.carousel.offsetWidth;
        data.carousel.scrollTo({
          left: data.currentIndex * slideWidth,
          behavior: 'smooth'
        });
      } else {
        // Desktop: transform
        this.updateCarousel(data);
      }
    },

    /**
     * Slide suivant
     */
    nextSlide: function(data) {
      if (data.isAnimating) return;

      const maxIndex = data.totalSlides - data.slidesPerView;
      
      if (data.currentIndex < maxIndex) {
        data.currentIndex++;
      } else {
        data.currentIndex = 0;
      }
      
      this.updateCarousel(data);
      window.EducaPsy.Utils.trackEvent('carousel_next');
    },

    /**
     * Slide précédent
     */
    prevSlide: function(data) {
      if (data.isAnimating) return;

      if (data.currentIndex > 0) {
        data.currentIndex--;
      } else {
        data.currentIndex = data.totalSlides - data.slidesPerView;
      }
      
      this.updateCarousel(data);
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
      this.updateDots(data);

      setTimeout(() => {
        data.isAnimating = false;
      }, 400);
    },

    /**
     * Mettre à jour les contrôles
     */
    updateControls: function(data) {
      const controls = data.wrapper.previousElementSibling;
      if (!controls || !controls.classList.contains('carousel-controls')) return;

      const prevBtn = controls.querySelector('.carousel-prev');
      const nextBtn = controls.querySelector('.carousel-next');
      
      const maxIndex = data.totalSlides - data.slidesPerView;

      // Désactiver les boutons aux extrémités
      if (prevBtn) prevBtn.disabled = data.currentIndex === 0;
      if (nextBtn) nextBtn.disabled = data.currentIndex >= maxIndex;
    },

    /**
     * Mettre à jour les dots
     */
    updateDots: function(data) {
      const dotsContainer = data.wrapper.previousElementSibling;
      if (!dotsContainer || !dotsContainer.classList.contains('carousel-dots')) return;

      const allDots = dotsContainer.querySelectorAll('.carousel-dot');
      const activeDotIndex = Math.floor(data.currentIndex / data.slidesPerView);
      
      allDots.forEach((dot, index) => {
        if (index === activeDotIndex) {
          dot.classList.add('active');
        } else {
          dot.classList.remove('active');
        }
      });
    },

    /**
     * Activer le swipe (desktop)
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

      // Support souris (desktop)
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

      // Style cursor
      wrapper.style.cursor = 'grab';
    },

    /**
     * Gérer le swipe
     */
    handleSwipe: function(startX, endX, data) {
      const threshold = 50;
      const diff = startX - endX;

      if (Math.abs(diff) < threshold) return;

      if (diff > 0) {
        this.nextSlide(data);
      } else {
        this.prevSlide(data);
      }
    },

    /**
     * Obtenir slides visibles (actualités)
     */
    getSlidesPerView: function() {
      const width = window.innerWidth;
      if (width >= 1024) return 3;
      if (width >= 768) return 2;
      return 1;
    },

    /**
     * Obtenir slides visibles (partenaires)
     */
    getPartenairesSlidesPerView: function() {
      const width = window.innerWidth;
      if (width >= 1024) return 3;
      if (width >= 768) return 2;
      return 1;
    },

    /**
     * Gérer le resize
     */
    handleResize: function(data) {
      const resizeHandler = window.EducaPsy.Utils.debounce(() => {
        const isMobile = window.innerWidth < 768;
        const oldSlidesPerView = data.slidesPerView;
        
        // Recalculer slides per view
        data.slidesPerView = this.carousels.get('actualites') === data 
          ? this.getSlidesPerView() 
          : this.getPartenairesSlidesPerView();

        if (oldSlidesPerView !== data.slidesPerView) {
          // Réinitialiser position
          data.currentIndex = Math.min(
            data.currentIndex,
            data.totalSlides - data.slidesPerView
          );
          
          if (!isMobile) {
            this.updateCarousel(data);
          }
          
          // Recréer les dots
          const dotsContainer = data.wrapper.previousElementSibling;
          if (dotsContainer && dotsContainer.classList.contains('carousel-dots')) {
            dotsContainer.remove();
            this.createDots(data.wrapper, data);
          }

          // Gérer les contrôles selon breakpoint
          const controls = data.wrapper.previousElementSibling;
          if (controls && controls.classList.contains('carousel-controls')) {
            if (isMobile) {
              controls.style.display = 'none';
            } else {
              controls.style.display = 'flex';
            }
          }
        }
      }, 250);

      window.addEventListener('resize', resizeHandler);
    },

    /**
     * Démarrer auto-play
     */
    startAutoPlay: function(data, interval = 4000) {
      this.stopAutoPlay(data);

      data.autoPlayInterval = setInterval(() => {
        if (this.isCarouselVisible(data.wrapper) && window.innerWidth >= 768) {
          this.nextSlide(data);
        }
      }, interval);

      // Arrêter au survol (desktop seulement)
      if (window.innerWidth >= 768) {
        data.wrapper.addEventListener('mouseenter', () => {
          this.stopAutoPlay(data);
        });

        data.wrapper.addEventListener('mouseleave', () => {
          this.startAutoPlay(data, interval);
        });
      }
    },

    /**
     * Arrêter auto-play
     */
    stopAutoPlay: function(data) {
      if (data.autoPlayInterval) {
        clearInterval(data.autoPlayInterval);
        data.autoPlayInterval = null;
      }
    },

    /**
     * Vérifier visibilité carrousel
     */
    isCarouselVisible: function(wrapper) {
      const rect = wrapper.getBoundingClientRect();
      return rect.top < window.innerHeight && rect.bottom > 0;
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
