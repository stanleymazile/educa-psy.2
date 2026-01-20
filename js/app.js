/**
 * EDUCA-PSY - APP.JS
 * JavaScript moderne, performant et accessible
 * Version: 2.0 - Janvier 2026
 */

'use strict';

/* ========================================
   APP CLASS - Point d'entrée principal
   ======================================== */

class EducaPsyApp {
  constructor() {
    this.initialized = false;
    this.carousels = [];
  }

  /**
   * Initialiser l'application
   */
  init() {
    if (this.initialized) return;
    
    console.log('🚀 Educa-Psy - Initialisation...');
    
    try {
      this.setupNavigation();
      this.setupCarousels();
      this.setupCounters();
      this.setupLanguage();
      this.setupAccessibility();
      
      this.initialized = true;
      console.log('✅ Educa-Psy - Initialisé avec succès');
    } catch (error) {
      console.error('❌ Erreur lors de l\'initialisation:', error);
    }
  }

  /**
   * Navigation mobile et accessibilité
   */
  setupNavigation() {
    const menuToggle = document.getElementById('menuToggle');
    const nav = document.getElementById('nav');
    
    if (!menuToggle || !nav) return;

    // Toggle menu
    menuToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = nav.classList.toggle('active');
      menuToggle.setAttribute('aria-expanded', isOpen);
    });

    // Fermer au clic sur un lien
    nav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        nav.classList.remove('active');
        menuToggle.setAttribute('aria-expanded', 'false');
      });
    });

    // Fermer au clic extérieur
    document.addEventListener('click', (e) => {
      if (!e.target.closest('header') && nav.classList.contains('active')) {
        nav.classList.remove('active');
        menuToggle.setAttribute('aria-expanded', 'false');
      }
    });

    // Fermer avec Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && nav.classList.contains('active')) {
        nav.classList.remove('active');
        menuToggle.setAttribute('aria-expanded', 'false');
        menuToggle.focus();
      }
    });
  }

  /**
   * Initialiser tous les carousels
   */
  setupCarousels() {
    // Carousel partenaires
    const partnersCarousel = new Carousel({
      trackId: 'partnersTrack',
      prevBtnId: 'partnersPrev',
      nextBtnId: 'partnersNext',
      dotsId: 'partnersDots'
    });
    
    if (partnersCarousel.isValid()) {
      this.carousels.push(partnersCarousel);
    }

    // Carousel articles
    const articlesCarousel = new Carousel({
      trackId: 'articlesTrack',
      prevBtnId: 'articlesPrev',
      nextBtnId: 'articlesNext',
      dotsId: 'articlesDots'
    });
    
    if (articlesCarousel.isValid()) {
      this.carousels.push(articlesCarousel);
    }
  }

  /**
   * Animation des compteurs de statistiques
   */
  setupCounters() {
    const counters = document.querySelectorAll('[data-target]');
    if (counters.length === 0) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !entry.target.classList.contains('counted')) {
          entry.target.classList.add('counted');
          this.animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.5,
      rootMargin: '0px 0px -50px 0px'
    });

    counters.forEach(counter => observer.observe(counter));
  }

  /**
   * Animer un compteur avec easing
   */
  animateCounter(element) {
    const target = parseInt(element.dataset.target);
    if (isNaN(target)) return;

    const duration = 2000;
    const startTime = performance.now();

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing: easeOutCubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(target * eased);

      element.textContent = current + '+';

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        element.textContent = target + '+';
      }
    };

    requestAnimationFrame(animate);
  }

  /**
   * Gestion de la langue avec localStorage
   */
  setupLanguage() {
    const langSelect = document.getElementById('lang-select');
    if (!langSelect) return;

    // Charger la langue sauvegardée
    try {
      const savedLang = localStorage.getItem('educa_psy_lang') || 'fr';
      langSelect.value = savedLang;
    } catch (error) {
      console.warn('localStorage non disponible:', error);
      langSelect.value = 'fr';
    }

    // Sauvegarder le changement
    langSelect.addEventListener('change', (e) => {
      try {
        localStorage.setItem('educa_psy_lang', e.target.value);
        console.log('Langue changée:', e.target.value);
        // TODO: Implémenter le changement de langue réel
      } catch (error) {
        console.warn('Impossible de sauvegarder la langue:', error);
      }
    });
  }

  /**
   * Améliorations d'accessibilité
   */
  setupAccessibility() {
    // Annoncer les changements de région dynamiques
    const liveRegions = document.querySelectorAll('[role="region"]');
    liveRegions.forEach(region => {
      if (!region.hasAttribute('aria-live')) {
        region.setAttribute('aria-live', 'polite');
      }
    });
  }
}


/* ========================================
   CAROUSEL CLASS - Carrousel accessible
   ======================================== */

class Carousel {
  constructor(options) {
    this.track = document.getElementById(options.trackId);
    this.prevBtn = document.getElementById(options.prevBtnId);
    this.nextBtn = document.getElementById(options.nextBtnId);
    this.dotsContainer = document.getElementById(options.dotsId);
    
    this.currentIndex = 0;
    this.dots = [];
    this.slideWidth = 0;
    this.visibleSlides = 1;
    
    if (this.isValid()) {
      this.init();
    }
  }

  /**
   * Vérifier si les éléments existent
   */
  isValid() {
    return this.track !== null;
  }

  /**
   * Initialiser le carousel
   */
  init() {
    this.calculateDimensions();
    this.createDots();
    this.attachEvents();
    this.updateUI();
    
    console.log('✅ Carousel initialisé:', this.track.id);
  }

  /**
   * Calculer les dimensions
   */
  calculateDimensions() {
    if (this.track.children.length === 0) return;
    
    const firstSlide = this.track.children[0];
    const styles = window.getComputedStyle(this.track);
    const gap = parseInt(styles.gap) || 24;
    
    this.slideWidth = firstSlide.offsetWidth + gap;
    this.visibleSlides = Math.max(1, Math.floor(this.track.offsetWidth / this.slideWidth));
  }

  /**
   * Créer les indicateurs (dots)
   */
  createDots() {
    if (!this.dotsContainer) return;
    
    const totalSlides = this.track.children.length;
    const dotsCount = Math.ceil(totalSlides / this.visibleSlides);

    // Nettoyer les dots existants
    this.dotsContainer.innerHTML = '';

    for (let i = 0; i < dotsCount; i++) {
      const dot = document.createElement('button');
      dot.className = i === 0 ? 'dot active' : 'dot';
      dot.setAttribute('role', 'tab');
      dot.setAttribute('aria-label', `Page ${i + 1} sur ${dotsCount}`);
      dot.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
      
      dot.addEventListener('click', () => this.goToPage(i));
      
      this.dotsContainer.appendChild(dot);
      this.dots.push(dot);
    }
  }

  /**
   * Attacher les événements
   */
  attachEvents() {
    // Boutons de navigation
    if (this.prevBtn) {
      this.prevBtn.addEventListener('click', () => this.prev());
    }

    if (this.nextBtn) {
      this.nextBtn.addEventListener('click', () => this.next());
    }

    // Support clavier
    this.track.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        this.prev();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        this.next();
      }
    });

    // Support tactile (swipe)
    let touchStartX = 0;
    let touchEndX = 0;

    this.track.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    this.track.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      this.handleSwipe(touchStartX, touchEndX);
    }, { passive: true });

    // Scroll manuel
    this.track.addEventListener('scroll', () => {
      this.updateCurrentIndex();
    });

    // Redimensionnement
    let resizeTimeout;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        this.calculateDimensions();
        this.updateUI();
      }, 250);
    });
  }

  /**
   * Gérer le swipe tactile
   */
  handleSwipe(startX, endX) {
    const diff = startX - endX;
    const threshold = 50;

    if (Math.abs(diff) > threshold) {
      if (diff > 0) {
        this.next();
      } else {
        this.prev();
      }
    }
  }

  /**
   * Aller à la page précédente
   */
  prev() {
    if (this.currentIndex > 0) {
      this.goToPage(this.currentIndex - 1);
    }
  }

  /**
   * Aller à la page suivante
   */
  next() {
    const maxIndex = this.dots.length - 1;
    if (this.currentIndex < maxIndex) {
      this.goToPage(this.currentIndex + 1);
    }
  }

  /**
   * Aller à une page spécifique
   */
  goToPage(index) {
    this.currentIndex = index;
    const scrollLeft = index * this.slideWidth * this.visibleSlides;
    
    this.track.scrollTo({
      left: scrollLeft,
      behavior: 'smooth'
    });

    this.updateUI();
  }

  /**
   * Mettre à jour l'index actuel basé sur le scroll
   */
  updateCurrentIndex() {
    if (this.slideWidth === 0) return;
    
    const scrollLeft = this.track.scrollLeft;
    const newIndex = Math.round(scrollLeft / (this.slideWidth * this.visibleSlides));
    
    if (newIndex !== this.currentIndex) {
      this.currentIndex = newIndex;
      this.updateUI();
    }
  }

  /**
   * Mettre à jour l'interface (dots et boutons)
   */
  updateUI() {
    // Mettre à jour les dots
    this.dots.forEach((dot, i) => {
      const isActive = i === this.currentIndex;
      dot.classList.toggle('active', isActive);
      dot.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });

    // Mettre à jour les boutons
    if (this.prevBtn) {
      this.prevBtn.disabled = this.currentIndex === 0;
    }

    if (this.nextBtn) {
      this.nextBtn.disabled = this.currentIndex === this.dots.length - 1;
    }
  }
}


/* ========================================
   UTILITY FUNCTIONS
   ======================================== */

/**
 * Debounce function pour optimiser les événements
 */
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function pour limiter les appels
 */
function throttle(func, limit) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}


/* ========================================
   INITIALISATION
   ======================================== */

// Initialiser l'app quand le DOM est prêt
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    const app = new EducaPsyApp();
    app.init();
  });
} else {
  // DOM déjà chargé
  const app = new EducaPsyApp();
  app.init();
}

// Exposer l'app globalement pour le debugging
if (typeof window !== 'undefined') {
  window.EducaPsyApp = EducaPsyApp;
}
