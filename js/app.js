/**
 * APP.JS - Application principale Educa-Psy
 * Gère : Navigation, Carousels, Animations, Compteurs
 */

class EducaPsy {
  constructor() {
    this.initialized = false;
  }

  init() {
    if (this.initialized) return;
    this.initialized = true;

    this.setupNavigation();
    this.setupCarousels();
    this.setupIntersectionObserver();
    this.setupCounters();
    this.setupServiceWorker();
    console.log('✅ Educa-Psy initialized');
  }

  /**
   * Gestion du menu mobile et sélecteur de langue
   */
  setupNavigation() {
    const menuToggle = document.getElementById('menu-toggle');
    const navMenu = document.getElementById('nav-menu');
    const langSelect = document.querySelector('.lang-select');

    if (menuToggle && navMenu) {
      menuToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        const isOpen = navMenu.classList.contains('active');
        menuToggle.setAttribute('aria-expanded', isOpen);
      });

      // Fermer le menu au clic sur un lien
      navMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
          navMenu.classList.remove('active');
          menuToggle.setAttribute('aria-expanded', 'false');
        });
      });

      // Fermer le menu en cliquant ailleurs
      document.addEventListener('click', (e) => {
        if (!e.target.closest('header')) {
          navMenu.classList.remove('active');
          menuToggle.setAttribute('aria-expanded', 'false');
        }
      });

      // Fermer avec Escape
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && navMenu.classList.contains('active')) {
          navMenu.classList.remove('active');
          menuToggle.setAttribute('aria-expanded', 'false');
        }
      });
    }

    // Gestion de la langue
    if (langSelect) {
      const savedLang = localStorage.getItem('user_language') || 'fr';
      langSelect.value = savedLang;

      langSelect.addEventListener('change', (e) => {
        localStorage.setItem('user_language', e.target.value);
        // TODO: Charger les traductions dynamiquement
      });
    }
  }

  /**
   * Configuration des carousels automatiques
   */
  setupCarousels() {
    // Carrousel des partenaires - AUTOPLAY ACTIVÉ
    this.createCarousel('partners-track', 'partners-prev', 'partners-next', 'partners-dots', true);
    
    // Carrousel des articles - AUTOPLAY ACTIVÉ
    this.createCarousel('articles-track', 'articles-prev', 'articles-next', 'articles-dots', true);
  }

  /**
   * Créer une instance de carousel
   */
  createCarousel(trackId, prevId, nextId, dotsId, autoplay = false) {
    const track = document.getElementById(trackId);
    const prevBtn = document.getElementById(prevId);
    const nextBtn = document.getElementById(nextId);
    const dotsContainer = document.getElementById(dotsId);

    if (!track) {
      console.warn(`Carousel track #${trackId} not found`);
      return;
    }

    const carousel = new Carousel({
      track,
      prevBtn,
      nextBtn,
      dotsContainer,
      autoplay,
      autoplayDelay: 5000
    });

    carousel.init();
  }

  /**
   * Observer pour animations au scroll
   */
  setupIntersectionObserver() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('fade-in');
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });

    // Observer les cartes de valeurs et statistiques
    document.querySelectorAll('.value-card, .stat-card').forEach(el => {
      observer.observe(el);
    });
  }

  /**
   * Animation des compteurs de statistiques
   */
  setupCounters() {
    const counters = document.querySelectorAll('[data-target]');
    if (counters.length === 0) return;
    
    const observerCounters = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !entry.target.classList.contains('counted')) {
          entry.target.classList.add('counted');
          this.animateCounter(entry.target);
          observerCounters.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    counters.forEach(counter => observerCounters.observe(counter));
  }

  /**
   * Animer un compteur avec easing
   */
  animateCounter(element) {
    const target = parseInt(element.getAttribute('data-target'));
    if (isNaN(target)) return;

    const duration = 2000;
    const startTime = performance.now();

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function : easeOutQuart
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const current = Math.floor(target * easeOutQuart);

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
   * Enregistrer le Service Worker
   */
  setupServiceWorker() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/service-worker.js')
        .then(() => console.log('Service Worker registered'))
        .catch(err => console.log('Service Worker error:', err));
    }
  }
}

/**
 * Classe Carousel - Carrousel automatique avec contrôles
 */
class Carousel {
  constructor(options) {
    this.track = options.track;
    this.prevBtn = options.prevBtn;
    this.nextBtn = options.nextBtn;
    this.dotsContainer = options.dotsContainer;
    this.autoplay = options.autoplay || false;
    this.autoplayDelay = options.autoplayDelay || 5000;
    this.currentPosition = 0;
    this.autoplayInterval = null;
    this.isDragging = false;
    this.startX = 0;
    this.scrollLeft = 0;
    this.dots = [];
  }

  init() {
    this.createDots();
    this.attachEvents();
    if (this.autoplay) {
      this.startAutoplay();
    }
  }

  /**
   * Créer les indicateurs (dots)
   */
  createDots() {
    if (!this.dotsContainer) return;

    const slides = this.track.children;
    const dotsCount = Math.ceil(slides.length / this.getVisibleSlides());

    for (let i = 0; i < dotsCount; i++) {
      const dot = document.createElement('button');
      dot.className = i === 0 ? 'dot active' : 'dot';
      dot.setAttribute('aria-label', `Aller à la diapositive ${i + 1}`);
      dot.addEventListener('click', () => {
        this.goToSlide(i);
        this.stopAutoplay();
        if (this.autoplay) this.startAutoplay();
      });
      this.dotsContainer.appendChild(dot);
    }

    this.dots = Array.from(this.dotsContainer.querySelectorAll('.dot'));
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
        if (this.autoplay) this.startAutoplay();
      });
    }

    if (this.nextBtn) {
      this.nextBtn.addEventListener('click', () => {
        this.next();
        this.stopAutoplay();
        if (this.autoplay) this.startAutoplay();
      });
    }

    // Gestion du drag/swipe
    this.track.addEventListener('mousedown', (e) => this.startDrag(e));
    this.track.addEventListener('mousemove', (e) => this.drag(e));
    this.track.addEventListener('mouseup', () => this.endDrag());
    this.track.addEventListener('mouseleave', () => this.endDrag());

    // Touch support
    this.track.addEventListener('touchstart', (e) => {
      this.startX = e.touches[0].clientX;
      this.scrollLeft = this.track.scrollLeft;
    });

    this.track.addEventListener('touchend', (e) => {
      const diff = this.startX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) {
        this.stopAutoplay();
        diff > 0 ? this.next() : this.prev();
        if (this.autoplay) this.startAutoplay();
      }
    });

    // Mise à jour des dots au scroll
    this.track.addEventListener('scroll', () => {
      this.currentPosition = this.track.scrollLeft;
      this.updateActiveDot();
    });

    // Pause autoplay au hover
    if (this.autoplay) {
      this.track.addEventListener('mouseenter', () => this.stopAutoplay());
      this.track.addEventListener('mouseleave', () => this.startAutoplay());
    }
  }

  /**
   * Démarrer le drag
   */
  startDrag(e) {
    this.isDragging = true;
    this.startX = e.pageX - this.track.offsetLeft;
    this.scrollLeft = this.track.scrollLeft;
    this.track.style.cursor = 'grabbing';
  }

  /**
   * Drag en cours
   */
  drag(e) {
    if (!this.isDragging) return;
    e.preventDefault();
    const walk = (e.pageX - this.track.offsetLeft - this.startX) * 2;
    this.track.scrollLeft = this.scrollLeft - walk;
  }

  /**
   * Fin du drag
   */
  endDrag() {
    this.isDragging = false;
    this.track.style.cursor = 'grab';
  }

  /**
   * Calculer le nombre de slides visibles
   */
  getVisibleSlides() {
    if (this.track.children.length === 0) return 1;
    const slideWidth = this.track.children[0].offsetWidth + 24;
    return Math.max(1, Math.floor(this.track.offsetWidth / slideWidth));
  }

  /**
   * Aller à la diapositive précédente
   */
  prev() {
    const slideWidth = this.track.children[0].offsetWidth + 24;
    const visibleSlides = this.getVisibleSlides();
    this.track.scrollBy({
      left: -(slideWidth * visibleSlides),
      behavior: 'smooth'
    });
  }

  /**
   * Aller à la diapositive suivante
   */
  next() {
    const slideWidth = this.track.children[0].offsetWidth + 24;
    const visibleSlides = this.getVisibleSlides();
    this.track.scrollBy({
      left: slideWidth * visibleSlides,
      behavior: 'smooth'
    });
  }

  /**
   * Aller à une diapositive spécifique
   */
  goToSlide(index) {
    const slideWidth = this.track.children[0].offsetWidth + 24;
    const visibleSlides = this.getVisibleSlides();
    this.track.scrollTo({
      left: index * slideWidth * visibleSlides,
      behavior: 'smooth'
    });
  }

  /**
   * Mettre à jour l'indicateur actif
   */
  updateActiveDot() {
    if (this.dots.length === 0) return;
    
    const slideWidth = this.track.children[0].offsetWidth + 24;
    const visibleSlides = this.getVisibleSlides();
    const activeIndex = Math.round(this.currentPosition / (slideWidth * visibleSlides));

    this.dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === activeIndex);
    });
  }

  /**
   * Démarrer l'autoplay
   */
  startAutoplay() {
    if (!this.autoplay) return;
    this.stopAutoplay();
    
    this.autoplayInterval = setInterval(() => {
      const maxScroll = this.track.scrollWidth - this.track.offsetWidth;
      if (Math.abs(this.track.scrollLeft - maxScroll) < 1) {
        // Fin atteinte, revenir au début
        this.track.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        this.next();
      }
    }, this.autoplayDelay);
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
}

/**
 * Initialiser l'application au chargement du DOM
 */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    const app = new EducaPsy();
    app.init();
  });
} else {
  const app = new EducaPsy();
  app.init();
}
