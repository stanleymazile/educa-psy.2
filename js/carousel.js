/**
 * CAROUSEL.JS - Système de carrousel universel et optimisé
 * Dépendances: utils.js
 */

(function() {
  'use strict';

  const CarouselManager = {
    instances: [],

    /**
     * Créer une instance de carrousel
     * @param {Object} options - Configuration du carrousel
     */
    create: function(options) {
      const instance = new Carousel(options);
      this.instances.push(instance);
      return instance;
    },

    /**
     * Détruire toutes les instances
     */
    destroyAll: function() {
      this.instances.forEach(instance => instance.destroy());
      this.instances = [];
    }
  };

  /**
   * Classe Carousel
   */
  class Carousel {
    constructor(options) {
      this.options = {
        trackId: options.trackId,
        prevBtnId: options.prevBtnId,
        nextBtnId: options.nextBtnId,
        dotsId: options.dotsId,
        autoplay: options.autoplay || false,
        autoplayDelay: options.autoplayDelay || 5000,
        slidesToShow: options.slidesToShow || 'auto',
        gap: options.gap || 24,
        loop: options.loop || false,
        swipeThreshold: options.swipeThreshold || 50,
        onSlideChange: options.onSlideChange || null
      };

      this.track = document.getElementById(this.options.trackId);
      this.prevBtn = document.getElementById(this.options.prevBtnId);
      this.nextBtn = document.getElementById(this.options.nextBtnId);
      this.dotsContainer = document.getElementById(this.options.dotsId);

      if (!this.track) {
        console.warn(`Carousel: Track #${this.options.trackId} non trouvé`);
        return;
      }

      this.slides = Array.from(this.track.children);
      this.currentPosition = 0;
      this.currentSlide = 0;
      this.autoplayInterval = null;
      this.isDragging = false;
      this.startX = 0;
      this.scrollLeft = 0;

      this.init();
    }

    /**
     * Initialiser le carrousel
     */
    init() {
      this.calculateDimensions();
      this.createDots();
      this.attachEvents();
      
      if (this.options.autoplay) {
        this.startAutoplay();
      }

      // Observer le resize
      this.resizeObserver = new ResizeObserver(
        window.EducaPsy.Utils.debounce(() => {
          this.calculateDimensions();
          this.updatePosition(false);
        }, 250)
      );
      this.resizeObserver.observe(this.track);

      window.EducaPsy.Utils.log(`Carousel ${this.options.trackId} initialisé`);
    }

    /**
     * Calculer les dimensions
     */
    calculateDimensions() {
      if (this.slides.length === 0) return;

      const firstSlide = this.slides[0];
      const style = window.getComputedStyle(firstSlide);
      const slideWidth = firstSlide.offsetWidth;
      const gap = parseInt(style.marginRight) || this.options.gap;

      this.slideWidth = slideWidth + gap;
      this.trackWidth = this.track.offsetWidth;

      if (this.options.slidesToShow === 'auto') {
        this.visibleSlides = Math.floor(this.trackWidth / this.slideWidth);
      } else {
        this.visibleSlides = this.options.slidesToShow;
      }

      this.totalSlides = this.slides.length;
      this.maxScroll = Math.max(0, (this.totalSlides - this.visibleSlides) * this.slideWidth);
      this.dotsCount = Math.ceil(this.totalSlides / this.visibleSlides);
    }

    /**
     * Créer les indicateurs (dots)
     */
    createDots() {
      if (!this.dotsContainer) return;

      this.dotsContainer.innerHTML = '';
      
      for (let i = 0; i < this.dotsCount; i++) {
        const dot = document.createElement('button');
        dot.className = 'carousel-dot';
        dot.setAttribute('aria-label', `Aller à la page ${i + 1}`);
        
        if (i === 0) {
          dot.classList.add('active');
        }

        dot.addEventListener('click', () => {
          this.goToPage(i);
          this.stopAutoplay();
        });

        this.dotsContainer.appendChild(dot);
      }

      this.dots = Array.from(this.dotsContainer.querySelectorAll('.carousel-dot'));
    }

    /**
     * Attacher les événements
     */
    attachEvents() {
      // Boutons de navigation
      if (this.prevBtn) {
        this.prevBtn.addEventListener('click', () => {
          this.prev();
          this.stopAutoplay();
        });
      }

      if (this.nextBtn) {
        this.nextBtn.addEventListener('click', () => {
          this.next();
          this.stopAutoplay();
        });
      }

      // Gestion du swipe/drag
      this.track.addEventListener('mousedown', (e) => this.handleDragStart(e));
      this.track.addEventListener('touchstart', (e) => this.handleTouchStart(e));
      
      this.track.addEventListener('mousemove', (e) => this.handleDragMove(e));
      this.track.addEventListener('touchmove', (e) => this.handleTouchMove(e));
      
      this.track.addEventListener('mouseup', (e) => this.handleDragEnd(e));
      this.track.addEventListener('touchend', (e) => this.handleTouchEnd(e));
      this.track.addEventListener('mouseleave', () => this.handleDragEnd());

      // Synchroniser avec le scroll natif
      this.track.addEventListener('scroll', () => {
        this.currentPosition = this.track.scrollLeft;
        this.updateActiveDot();
      });

      // Pause autoplay au hover
      if (this.options.autoplay) {
        this.track.addEventListener('mouseenter', () => this.stopAutoplay());
        this.track.addEventListener('mouseleave', () => this.startAutoplay());
      }

      // Navigation clavier
      this.track.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') {
          e.preventDefault();
          this.prev();
        } else if (e.key === 'ArrowRight') {
          e.preventDefault();
          this.next();
        }
      });
    }

    /**
     * Drag/Swipe - Start
     */
    handleDragStart(e) {
      this.isDragging = true;
      this.startX = e.pageX - this.track.offsetLeft;
      this.scrollLeft = this.track.scrollLeft;
      this.track.style.cursor = 'grabbing';
      this.track.style.userSelect = 'none';
    }

    handleTouchStart(e) {
      this.startX = e.touches[0].clientX;
      this.scrollLeft = this.track.scrollLeft;
    }

    /**
     * Drag/Swipe - Move
     */
    handleDragMove(e) {
      if (!this.isDragging) return;
      e.preventDefault();
      const x = e.pageX - this.track.offsetLeft;
      const walk = (x - this.startX) * 2;
      this.track.scrollLeft = this.scrollLeft - walk;
    }

    handleTouchMove(e) {
      // Laisse le scroll natif gérer le mouvement
    }

    /**
     * Drag/Swipe - End
     */
    handleDragEnd(e) {
      if (!this.isDragging) return;
      this.isDragging = false;
      this.track.style.cursor = 'grab';
      this.track.style.removeProperty('user-select');
      
      // Snap au slide le plus proche
      this.snapToNearestSlide();
    }

    handleTouchEnd(e) {
      const touchEndX = e.changedTouches[0].clientX;
      const diff = this.startX - touchEndX;

      if (Math.abs(diff) > this.options.swipeThreshold) {
        if (diff > 0) {
          this.next();
        } else {
          this.prev();
        }
      }
    }

    /**
     * Snap au slide le plus proche
     */
    snapToNearestSlide() {
      const nearestSlide = Math.round(this.currentPosition / this.slideWidth);
      this.goToSlide(nearestSlide, true);
    }

    /**
     * Aller au slide précédent
     */
    prev() {
      const newPosition = Math.max(0, this.currentSlide - this.visibleSlides);
      this.goToSlide(newPosition, true);
      
      window.EducaPsy.Utils.trackEvent('carousel_prev', {
        carousel: this.options.trackId,
        slide: newPosition
      });
    }

    /**
     * Aller au slide suivant
     */
    next() {
      const maxSlide = this.totalSlides - this.visibleSlides;
      let newPosition = Math.min(maxSlide, this.currentSlide + this.visibleSlides);
      
      if (this.options.loop && this.currentSlide >= maxSlide) {
        newPosition = 0;
      }
      
      this.goToSlide(newPosition, true);
      
      window.EducaPsy.Utils.trackEvent('carousel_next', {
        carousel: this.options.trackId,
        slide: newPosition
      });
    }

    /**
     * Aller à une page spécifique
     */
    goToPage(pageIndex) {
      const slideIndex = pageIndex * this.visibleSlides;
      this.goToSlide(slideIndex, true);
    }

    /**
     * Aller à un slide spécifique
     */
    goToSlide(slideIndex, smooth = true) {
      this.currentSlide = Math.max(0, Math.min(slideIndex, this.totalSlides - 1));
      const targetPosition = this.currentSlide * this.slideWidth;
      this.updatePosition(smooth, targetPosition);
      
      if (this.options.onSlideChange) {
        this.options.onSlideChange(this.currentSlide);
      }
    }

    /**
     * Mettre à jour la position
     */
    updatePosition(smooth = true, position = null) {
      const targetPos = position !== null ? position : this.currentPosition;
      
      this.track.scrollTo({
        left: targetPos,
        behavior: smooth ? 'smooth' : 'auto'
      });

      this.updateActiveDot();
      this.updateButtons();
    }

    /**
     * Mettre à jour l'indicateur actif
     */
    updateActiveDot() {
      if (!this.dots) return;

      const activePage = Math.floor(this.currentPosition / (this.slideWidth * this.visibleSlides));
      
      this.dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === activePage);
        dot.setAttribute('aria-current', i === activePage ? 'true' : 'false');
      });
    }

    /**
     * Mettre à jour l'état des boutons
     */
    updateButtons() {
      if (this.prevBtn) {
        this.prevBtn.disabled = !this.options.loop && this.currentSlide === 0;
      }

      if (this.nextBtn) {
        const maxSlide = this.totalSlides - this.visibleSlides;
        this.nextBtn.disabled = !this.options.loop && this.currentSlide >= maxSlide;
      }
    }

    /**
     * Démarrer l'autoplay
     */
    startAutoplay() {
      if (!this.options.autoplay) return;

      this.stopAutoplay();
      this.autoplayInterval = setInterval(() => {
        this.next();
      }, this.options.autoplayDelay);
    }

    /**
     * Arrêter l'autoplay
     */
    stopAutoplay() {
      if (this.autoplayInterval) {
        clearInterval(this.autoplayInterval);
        this.autoplayInterval = null;
      }
    }

    /**
     * Détruire le carrousel
     */
    destroy() {
      this.stopAutoplay();
      
      if (this.resizeObserver) {
        this.resizeObserver.disconnect();
      }

      // Retirer les événements
      // (En production, il faudrait stocker les références pour les retirer proprement)
      
      window.EducaPsy.Utils.log(`Carousel ${this.options.trackId} détruit`);
    }

    /**
     * Rafraîchir le carrousel
     */
    refresh() {
      this.slides = Array.from(this.track.children);
      this.calculateDimensions();
      this.createDots();
      this.updatePosition(false);
    }
  }

  // Fonction helper pour initialisation simple
  function initCarousel(trackId, prevBtnId, nextBtnId, dotsId, options = {}) {
    return CarouselManager.create({
      trackId,
      prevBtnId,
      nextBtnId,
      dotsId,
      ...options
    });
  }

  // Exposer globalement
  window.EducaPsy = window.EducaPsy || {};
  window.EducaPsy.Carousel = Carousel;
  window.EducaPsy.CarouselManager = CarouselManager;
  window.initCarousel = initCarousel; // Helper global

  window.EducaPsy.Utils.log('Carousel.js chargé');

})();
