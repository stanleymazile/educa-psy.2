// JavaScript pour la page vidéos - videos.js

document.addEventListener('DOMContentLoaded', function() {
  
  // Système de filtres pour les vidéos
  const filterBtns = document.querySelectorAll('.videos-filters .filter-btn');
  const videoCards = document.querySelectorAll('.video-card');

  if (filterBtns.length && videoCards.length) {
    filterBtns.forEach(btn => {
      btn.addEventListener('click', function() {
        // Retirer la classe active
        filterBtns.forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        
        const category = this.getAttribute('data-category');
        
        // Filtrer les vidéos
        videoCards.forEach(card => {
          if (category === 'tous' || card.getAttribute('data-category') === category) {
            card.style.display = 'block';
            card.style.opacity = '0';
            setTimeout(() => {
              card.style.opacity = '1';
              card.style.transition = 'opacity 0.3s ease';
            }, 10);
          } else {
            card.style.display = 'none';
          }
        });
      });
    });
  }

  // Lazy loading pour les iframes YouTube
  const lazyLoadYouTube = function() {
    const videos = document.querySelectorAll('iframe[src*="youtube.com"]');
    
    if ('IntersectionObserver' in window) {
      const videoObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const iframe = entry.target;
            // L'iframe est déjà chargée, mais on peut ajouter une classe pour animations
            iframe.classList.add('loaded');
            videoObserver.unobserve(iframe);
          }
        });
      }, {
        rootMargin: '50px'
      });

      videos.forEach(video => {
        videoObserver.observe(video);
      });
    }
  };

  lazyLoadYouTube();

  // Compteur de vues (simulation)
  const updateViewCounts = function() {
    const viewElements = document.querySelectorAll('.video-views');
    viewElements.forEach(el => {
      // Simulation d'incrémentation de vues
      // Dans un vrai site, cela viendrait d'une API
      const currentText = el.textContent;
      const match = currentText.match(/[\d.]+K/);
      if (match) {
        const views = parseFloat(match[0]);
        // Ajouter un effet de compteur animé
        el.style.transition = 'color 0.3s ease';
      }
    });
  };

  updateViewCounts();

});
