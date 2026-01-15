// Filtres du blog
document.addEventListener('DOMContentLoaded', function() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const blogCards = document.querySelectorAll('.blog-card');

  if (filterBtns.length && blogCards.length) {
    filterBtns.forEach(btn => {
      btn.addEventListener('click', function() {
        // Retirer la classe active de tous les boutons
        filterBtns.forEach(b => b.classList.remove('active'));
        
        // Ajouter la classe active au bouton cliqué
        this.classList.add('active');
        
        // Obtenir la catégorie sélectionnée
        const category = this.getAttribute('data-category');
        
        // Filtrer les articles
        blogCards.forEach(card => {
          if (category === 'tous' || card.getAttribute('data-category') === category) {
            card.style.display = 'block';
            // Animation d'apparition
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

  // Formulaire newsletter
  const newsletterForm = document.getElementById('newsletterForm');
  
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const emailInput = this.querySelector('input[type="email"]');
      const email = emailInput.value;
      
      if (!email) {
        alert('Veuillez entrer une adresse email valide');
        return;
      }
      
      // Simulation d'inscription
      const confirmMessage = document.createElement('div');
      confirmMessage.className = 'newsletter-success';
      confirmMessage.textContent = '✅ Merci ! Vous êtes maintenant inscrit à notre newsletter.';
      confirmMessage.style.cssText = `
        background-color: #d4edda;
        color: #155724;
        padding: 16px;
        border-radius: 8px;
        margin-top: 16px;
        text-align: center;
        border: 1px solid #c3e6cb;
      `;
      
      // Ajouter le message après le formulaire
      this.appendChild(confirmMessage);
      
      // Réinitialiser le formulaire
      emailInput.value = '';
      
      // Masquer le message après 5 secondes
      setTimeout(() => {
        confirmMessage.style.opacity = '0';
        confirmMessage.style.transition = 'opacity 0.5s ease';
        setTimeout(() => confirmMessage.remove(), 500);
      }, 5000);
    });
  }

  // Pagination (simulation)
  const paginationBtns = document.querySelectorAll('.pagination-btn');
  
  paginationBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      if (!this.disabled) {
        // Scroll vers le haut
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
        
        // Simulation de chargement
        const blogGrid = document.querySelector('.blog-grid');
        if (blogGrid) {
          blogGrid.style.opacity = '0.5';
          setTimeout(() => {
            blogGrid.style.opacity = '1';
          }, 300);
        }
      }
    });
  });
});
