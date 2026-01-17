/**
 * OPTIMIZATION.JS - Optimisations des performances
 * Lazy loading, preloading, performance monitoring
 */

(function() {
  'use strict';

  const Optimization = {
    initialized: false,

    /**
     * Initialiser toutes les optimisations
     */
    init: function() {
      if (this.initialized) return;
      this.initialized = true;

      this.lazyLoadImages();
      this.preloadCriticalResources();
      this.optimizeAnimations();
      this.monitorPerformance();
      this.setupIntersectionObserver();
      this.optimizeFonts();
      
      console.log('[Optimization] Optimisations chargées');
    },

    /**
     * Lazy loading des images
     */
    lazyLoadImages: function() {
      // Support natif du lazy loading
      if ('loading' in HTMLImageElement.prototype) {
        const images = document.querySelectorAll('img[loading="lazy"]');
        console.log(`[Optimization] ${images.length} images en lazy loading natif`);
        return;
      }

      // Fallback avec IntersectionObserver
      const images = document.querySelectorAll('img[data-src]');
      
      if (!('IntersectionObserver' in window)) {
        // Fallback: charger toutes les images
        images.forEach(img => {
          img.src = img.dataset.src;
          if (img.dataset.srcset) {
            img.srcset = img.dataset.srcset;
          }
        });
        return;
      }

      const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;
            if (img.dataset.srcset) {
              img.srcset = img.dataset.srcset;
            }
            img.classList.add('loaded');
            observer.unobserve(img);
          }
        });
      }, {
        rootMargin: '50px'
      });

      images.forEach(img => imageObserver.observe(img));
    },

    /**
     * Preload des ressources critiques
     */
    preloadCriticalResources: function() {
      // Preload du logo
      this.preloadImage('/images/Logo.webp');
      
      // Preload des polices critiques si nécessaire
      // this.preloadFont('/fonts/custom-font.woff2');

      // Prefetch des pages probables
      this.prefetchPage('/services.html');
      this.prefetchPage('/contact.html');
    },

    /**
     * Preload d'une image
     */
    preloadImage: function(src) {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = src;
      document.head.appendChild(link);
    },

    /**
     * Preload d'une police
     */
    preloadFont: function(src) {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'font';
      link.type = 'font/woff2';
      link.crossOrigin = 'anonymous';
      link.href = src;
      document.head.appendChild(link);
    },

    /**
     * Prefetch d'une page
     */
    prefetchPage: function(url) {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = url;
      document.head.appendChild(link);
    },

    /**
     * Optimiser les animations
     */
    optimizeAnimations: function() {
      // Désactiver les animations si l'utilisateur préfère la réduction de mouvement
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        document.documentElement.style.setProperty('--transition-fast', '0.01ms');
        document.documentElement.style.setProperty('--transition-normal', '0.01ms');
        document.documentElement.style.setProperty('--transition-slow', '0.01ms');
      }

      // Utiliser will-change pour les éléments animés
      const animatedElements = document.querySelectorAll('.hero, .card, .btn');
      animatedElements.forEach(el => {
        el.addEventListener('mouseenter', function() {
          this.style.willChange = 'transform';
        }, { once: true });
        
        el.addEventListener('animationend', function() {
          this.style.willChange = 'auto';
        });
      });
    },

    /**
     * Moniteur de performance
     */
    monitorPerformance: function() {
      // Performance Observer
      if ('PerformanceObserver' in window) {
        // Observer les LCP (Largest Contentful Paint)
        try {
          const lcpObserver = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const lastEntry = entries[entries.length - 1];
            console.log('[Performance] LCP:', lastEntry.renderTime || lastEntry.loadTime);
          });
          lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        } catch (e) {
          console.warn('[Performance] LCP observer non supporté');
        }

        // Observer les FID (First Input Delay)
        try {
          const fidObserver = new PerformanceObserver((list) => {
            list.getEntries().forEach(entry => {
              console.log('[Performance] FID:', entry.processingStart - entry.startTime);
            });
          });
          fidObserver.observe({ entryTypes: ['first-input'] });
        } catch (e) {
          console.warn('[Performance] FID observer non supporté');
        }
      }

      // Mesurer le temps de chargement
      window.addEventListener('load', () => {
        const perfData = performance.timing;
        const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
        const connectTime = perfData.responseEnd - perfData.requestStart;
        const renderTime = perfData.domComplete - perfData.domLoading;

        console.log('[Performance] Temps de chargement:', {
          total: pageLoadTime + 'ms',
          connexion: connectTime + 'ms',
          rendu: renderTime + 'ms'
        });

        // Envoyer à Analytics si disponible
        if (typeof gtag !== 'undefined') {
          gtag('event', 'timing_complete', {
            name: 'page_load',
            value: pageLoadTime,
            event_category: 'Performance'
          });
        }
      });
    },

    /**
     * Intersection Observer pour animations au scroll
     */
    setupIntersectionObserver: function() {
      if (!('IntersectionObserver' in window)) return;

      const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      };

      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            
            // Optionnel: ne plus observer après
            // observer.unobserve(entry.target);
          }
        });
      }, observerOptions);

      // Observer tous les éléments avec la classe 'observe'
      document.querySelectorAll('.observe').forEach(el => {
        observer.observe(el);
      });
    },

    /**
     * Optimiser le chargement des polices
     */
    optimizeFonts: function() {
      // Utiliser font-display: swap pour éviter le FOIT
      if ('fonts' in document) {
        document.fonts.ready.then(() => {
          console.log('[Optimization] Polices chargées');
        });
      }
    },

    /**
     * Compression des images (client-side)
     */
    compressImage: function(file, maxWidth = 1920, quality = 0.8) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = function(e) {
          const img = new Image();
          img.src = e.target.result;
          
          img.onload = function() {
            const canvas = document.createElement('canvas');
            let width = img.width;
            let height = img.height;
            
            if (width > maxWidth) {
              height = (height * maxWidth) / width;
              width = maxWidth;
            }
            
            canvas.width = width;
            canvas.height = height;
            
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);
            
            canvas.toBlob((blob) => {
              resolve(blob);
            }, 'image/jpeg', quality);
          };
        };
        
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    },

    /**
     * Détecter la connexion
     */
    detectConnection: function() {
      if ('connection' in navigator) {
        const connection = navigator.connection;
        const effectiveType = connection.effectiveType;
        
        console.log('[Optimization] Type de connexion:', effectiveType);
        
        // Adapter le contenu selon la connexion
        if (effectiveType === 'slow-2g' || effectiveType === '2g') {
          console.log('[Optimization] Connexion lente détectée');
          // Désactiver les vidéos auto-play, réduire la qualité des images, etc.
          document.body.classList.add('slow-connection');
        }
        
        // Écouter les changements
        connection.addEventListener('change', () => {
          console.log('[Optimization] Connexion changée:', connection.effectiveType);
        });
      }
    },

    /**
     * Cache API pour les données
     */
    cacheData: async function(key, data, ttl = 3600000) {
      try {
        const item = {
          data: data,
          timestamp: Date.now(),
          ttl: ttl
        };
        localStorage.setItem(key, JSON.stringify(item));
      } catch (e) {
        console.warn('[Optimization] Erreur cache:', e);
      }
    },

    /**
     * Récupérer depuis le cache
     */
    getCachedData: function(key) {
      try {
        const item = localStorage.getItem(key);
        if (!item) return null;
        
        const parsed = JSON.parse(item);
        const now = Date.now();
        
        if (now - parsed.timestamp > parsed.ttl) {
          localStorage.removeItem(key);
          return null;
        }
        
        return parsed.data;
      } catch (e) {
        console.warn('[Optimization] Erreur lecture cache:', e);
        return null;
      }
    },

    /**
     * Debounce pour le resize
     */
    debounce: function(func, wait = 250) {
      let timeout;
      return function executedFunction(...args) {
        const later = () => {
          clearTimeout(timeout);
          func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
      };
    },

    /**
     * Request Animation Frame pour animations fluides
     */
    smoothScroll: function(target, duration = 1000) {
      const targetPosition = target.getBoundingClientRect().top + window.pageYOffset;
      const startPosition = window.pageYOffset;
      const distance = targetPosition - startPosition;
      let startTime = null;

      function animation(currentTime) {
        if (startTime === null) startTime = currentTime;
        const timeElapsed = currentTime - startTime;
        const run = ease(timeElapsed, startPosition, distance, duration);
        window.scrollTo(0, run);
        if (timeElapsed < duration) requestAnimationFrame(animation);
      }

      function ease(t, b, c, d) {
        t /= d / 2;
        if (t < 1) return c / 2 * t * t + b;
        t--;
        return -c / 2 * (t * (t - 2) - 1) + b;
      }

      requestAnimationFrame(animation);
    },

    /**
     * Nettoyer les event listeners inutilisés
     */
    cleanup: function() {
      // Implémenter le nettoyage si nécessaire
      console.log('[Optimization] Nettoyage effectué');
    }
  };

  // Auto-initialisation
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => Optimization.init());
  } else {
    Optimization.init();
  }

  // Exposer globalement
  window.EducaPsy = window.EducaPsy || {};
  window.EducaPsy.Optimization = Optimization;

  // Détecter la connexion
  Optimization.detectConnection();

})();
