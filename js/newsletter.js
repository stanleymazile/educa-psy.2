 * NEWSLETTER.JS - Gestion de l'inscription newsletter
 */
(function() {
  'use strict';
  
  const Newsletter = {
    init: function() {
      const form = document.getElementById('newsletterForm');
      if (!form) return;
      
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleSubmit(form);
      });
    },
    
    handleSubmit: async function(form) {
      const emailInput = form.querySelector('input[type="email"]');
      const email = emailInput.value.trim();
      const messageDiv = document.getElementById('newsletterMessage');
      
      // Validation
      if (!window.EducaPsy.Utils.isValidEmail(email)) {
        this.showMessage('Veuillez entrer une adresse email valide', 'error');
        return;
      }
      
      // Afficher loading
      const submitBtn = form.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      submitBtn.textContent = 'Inscription...';
      submitBtn.disabled = true;
      
      try {
        // Simuler l'inscription
        await this.subscribeToNewsletter(email);
        
        this.showMessage('✅ Inscription réussie ! Merci de votre intérêt.', 'success');
        form.reset();
        
        window.EducaPsy.Utils.trackEvent('newsletter_subscribed');
        window.EducaPsy.Utils.showToast('Inscrit à la newsletter !', 'success');
      } catch (error) {
        this.showMessage('❌ Une erreur est survenue. Veuillez réessayer.', 'error');
      } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
      }
    },
    
    subscribeToNewsletter: function(email) {
      return new Promise((resolve) => {
        // Simuler un délai
        setTimeout(() => {
          console.log('Newsletter subscription:', email);
          resolve({ success: true });
        }, 1000);
      });
      
      /* Intégration réelle exemple:
      return fetch('https://your-api.com/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      */
    },
    
    showMessage: function(message, type) {
      const messageDiv = document.getElementById('newsletterMessage');
      if (!messageDiv) return;
      
      messageDiv.className = `form-message show`;
      messageDiv.innerHTML = `<div class="${type}-message">${message}</div>`;
      
      setTimeout(() => {
        messageDiv.classList.remove('show');
      }, 5000);
    }
  };
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => Newsletter.init());
  } else {
    Newsletter.init();
  }
  
  window.EducaPsy = window.EducaPsy || {};
  window.EducaPsy.Newsletter = Newsletter;
})();
