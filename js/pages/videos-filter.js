/**
 * VIDEOS-FILTER.JS - Système de filtrage des vidéos par catégorie
 * Dépendances: utils.js
 */

(function() {
  'use strict';

  const VideosFilter = {
    initialized: false,
    currentCategory: 'tous',
    
    /**
     * Initialiser le système de filtrage
     */
    init: function() {
      if (this.initialized) {
        console.warn('VideosFilter déjà initialisé');
        return;
      }

      this.initialized = true;
      this.setupFilters();
      
      window.EducaPsy.Utils.log('VideosFilter initialisé');
    },

    /**
     * Configurer les boutons de filtre
     */
    setupFilters: function() {
      const filterButtons = document.querySelectorAll('.filter-btn');
      
      if (filterButtons.length === 0) {
        console.warn('Aucun bouton de filtre trouvé');
        return;
      }

      filterButtons.forEach(button => {
        button.addEventListener('click', () => {
          const category = button.getAttribute('data-category');
          this.filterVideos(category);
          this.updateActiveButton(button);
        });

        // Support clavier
        button.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            button.click();
          }
        });
      });
    },

    /**
     * Filtrer les vidéos par catégorie
     */
    filterVideos: function(category) {
      const videoCards = document.querySelectorAll('.video-card');
      
      if (videoCards.length === 0) {
        console.warn('Aucune vidéo trouvée');
        return;
      }

      this.currentCategory = category;

      videoCards.forEach((card, index) => {
        const cardCategory = card.getAttribute('data-category');
        
        // Animation de sortie pour les vidéos à masquer
        if (category === 'tous' || cardCategory === category) {
          this.showVideo(card, index);
        } else {
          this.hideVideo(card);
        }
      });

      // Tracker l'événement
      window.EducaPsy.Utils.trackEvent('videos_filtered', {
        category: category
      });

      // Scroll vers la grille de vidéos
      const videosGrid = document.getElementById('videosGrid');
      if (videosGrid) {
        setTimeout(() => {
          window.EducaPsy.Utils.smoothScrollTo(videosGrid, 100);
        }, 100);
      }
    },

    /**
     * Afficher une vidéo avec animation
     */
    showVideo: function(card, index) {
      // Supprimer les classes d'animation
      card.classList.remove('fade-out', 'hidden');
      
      // Ajouter une animation d'entrée avec délai progressif
      setTimeout(() => {
        card.classList.add('fade-in');
      }, index * 50);

      // Nettoyer la classe d'animation après
      setTimeout(() => {
        card.classList.remove('fade-in');
      }, 300 + (index * 50));
    },

    /**
     * Masquer une vidéo avec animation
     */
    hideVideo: function(card) {
      card.classList.add('fade-out');
      
      // Masquer complètement après l'animation
      setTimeout(() => {
        card.classList.add('hidden');
        card.classList.remove('fade-out');
      }, 300);
    },

    /**
     * Mettre à jour le bouton actif
     */
    updateActiveButton: function(activeButton) {
      const allButtons = document.querySelectorAll('.filter-btn');
      
      allButtons.forEach(button => {
        button.classList.remove('active');
        button.setAttribute('aria-selected', 'false');
      });

      activeButton.classList.add('active');
      activeButton.setAttribute('aria-selected', 'true');
    },

    /**
     * Compter les vidéos visibles
     */
    countVisibleVideos: function() {
      const videoCards = document.querySelectorAll('.video-card:not(.hidden)');
      return videoCards.length;
    },

    /**
     * Obtenir la catégorie actuelle
     */
    getCurrentCategory: function() {
      return this.currentCategory;
    },

    /**
     * Réinitialiser le filtre
     */
    reset: function() {
      this.filterVideos('tous');
      
      const allButton = document.querySelector('.filter-btn[data-category="tous"]');
      if (allButton) {
        this.updateActiveButton(allButton);
      }
    }
  };

  // Initialiser au chargement du DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => VideosFilter.init());
  } else {
    VideosFilter.init();
  }

  // Exposer globalement
  window.EducaPsy = window.EducaPsy || {};
  window.EducaPsy.VideosFilter = VideosFilter;

})();
