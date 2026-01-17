/**
 * BLOG-FILTER.JS - Filtrage des articles
 */
(function() {
  'use strict';
  
  const BlogFilter = {
    init: function() {
      this.setupFilters();
    },
    
    setupFilters: function() {
      const filterButtons = document.querySelectorAll('.blog-filters .filter-btn');
      
      filterButtons.forEach(button => {
        button.addEventListener('click', () => {
          const category = button.getAttribute('data-category');
          this.filterArticles(category);
          this.updateActiveButton(button);
        });
      });
    },
    
    filterArticles: function(category) {
      const articles = document.querySelectorAll('.blog-card');
      
      articles.forEach((article, index) => {
        const articleCategory = article.getAttribute('data-category');
        
        if (category === 'tous' || articleCategory === category) {
          this.showArticle(article, index);
        } else {
          this.hideArticle(article);
        }
      });
      
      window.EducaPsy.Utils.trackEvent('blog_filtered', { category });
    },
    
    showArticle: function(article, index) {
      article.classList.remove('hidden');
      article.style.animation = `fadeInUp 0.5s ease-out ${index * 0.05}s forwards`;
    },
    
    hideArticle: function(article) {
      article.classList.add('hidden');
    },
    
    updateActiveButton: function(activeButton) {
      document.querySelectorAll('.blog-filters .filter-btn').forEach(btn => {
        btn.classList.remove('active');
        btn.setAttribute('aria-selected', 'false');
      });
      
      activeButton.classList.add('active');
      activeButton.setAttribute('aria-selected', 'true');
    }
  };
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => BlogFilter.init());
  } else {
    BlogFilter.init();
  }
  
  window.EducaPsy = window.EducaPsy || {};
  window.EducaPsy.BlogFilter = BlogFilter;
})();

/**
