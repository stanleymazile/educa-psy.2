/**
 * CONTACT-FORM.JS - Validation et envoi du formulaire de contact
 * Dépendances: utils.js
 */

(function() {
  'use strict';

  const ContactForm = {
    initialized: false,
    form: null,
    
    /**
     * Initialiser le formulaire
     */
    init: function() {
      if (this.initialized) {
        console.warn('ContactForm déjà initialisé');
        return;
      }

      this.form = document.getElementById('contactForm');
      if (!this.form) {
        console.warn('Formulaire de contact non trouvé');
        return;
      }

      this.initialized = true;
      this.setupValidation();
      this.setupSubmit();
      
      window.EducaPsy.Utils.log('ContactForm initialisé');
    },

    /**
     * Configurer la validation en temps réel
     */
    setupValidation: function() {
      const inputs = this.form.querySelectorAll('input, textarea, select');
      
      inputs.forEach(input => {
        // Validation à la perte de focus
        input.addEventListener('blur', () => {
          this.validateField(input);
        });

        // Enlever l'erreur lors de la saisie
        input.addEventListener('input', () => {
          if (input.classList.contains('error')) {
            this.clearError(input);
          }
        });
      });
    },

    /**
     * Valider un champ individuel
     */
    validateField: function(field) {
      const errorSpan = document.getElementById(`${field.id}-error`);
      let errorMessage = '';

      // Vérifier si le champ est requis et vide
      if (field.hasAttribute('required') && !field.value.trim()) {
        errorMessage = 'Ce champ est obligatoire';
      }
      // Validation spécifique par type
      else if (field.value.trim()) {
        switch(field.type) {
          case 'email':
            if (!window.EducaPsy.Utils.isValidEmail(field.value)) {
              errorMessage = 'Email invalide';
            }
            break;
          
          case 'tel':
            if (!window.EducaPsy.Utils.isValidHaitianPhone(field.value)) {
              errorMessage = 'Numéro de téléphone invalide';
            }
            break;
          
          case 'text':
            if (field.id === 'nom') {
              if (field.value.length < 2) {
                errorMessage = 'Le nom doit contenir au moins 2 caractères';
              } else if (field.value.length > 100) {
                errorMessage = 'Le nom est trop long (max 100 caractères)';
              }
            }
            break;
          
          case 'textarea':
            if (field.value.length < 10) {
              errorMessage = 'Le message doit contenir au moins 10 caractères';
            } else if (field.value.length > 1000) {
              errorMessage = 'Le message est trop long (max 1000 caractères)';
            }
            break;
        }
      }

      // Validation pour le select
      if (field.tagName === 'SELECT' && !field.value) {
        errorMessage = 'Veuillez sélectionner une option';
      }

      // Afficher ou masquer l'erreur
      if (errorMessage) {
        this.showError(field, errorMessage);
        return false;
      } else {
        this.clearError(field);
        field.classList.add('success');
        return true;
      }
    },

    /**
     * Afficher une erreur sur un champ
     */
    showError: function(field, message) {
      const errorSpan = document.getElementById(`${field.id}-error`);
      
      field.classList.add('error');
      field.classList.remove('success');
      
      if (errorSpan) {
        errorSpan.textContent = message;
      }
    },

    /**
     * Effacer l'erreur d'un champ
     */
    clearError: function(field) {
      const errorSpan = document.getElementById(`${field.id}-error`);
      
      field.classList.remove('error');
      
      if (errorSpan) {
        errorSpan.textContent = '';
      }
    },

    /**
     * Valider tout le formulaire
     */
    validateForm: function() {
      const fields = this.form.querySelectorAll('input, textarea, select');
      let isValid = true;

      fields.forEach(field => {
        if (!this.validateField(field)) {
          isValid = false;
        }
      });

      return isValid;
    },

    /**
     * Configurer la soumission du formulaire
     */
    setupSubmit: function() {
      this.form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleSubmit();
      });
    },

    /**
     * Gérer la soumission du formulaire
     */
    handleSubmit: async function() {
      // Valider le formulaire
      if (!this.validateForm()) {
        this.showMessage('Veuillez corriger les erreurs avant d\'envoyer', 'error');
        
        // Scroll vers la première erreur
        const firstError = this.form.querySelector('.error');
        if (firstError) {
          window.EducaPsy.Utils.smoothScrollTo(firstError, 100);
        }
        return;
      }

      // Récupérer les données du formulaire
      const formData = {
        nom: document.getElementById('nom').value.trim(),
        email: document.getElementById('email').value.trim(),
        telephone: document.getElementById('telephone').value.trim(),
        sujet: document.getElementById('sujet').value,
        message: document.getElementById('message').value.trim(),
        timestamp: new Date().toISOString()
      };

      // Afficher l'état de chargement
      this.setLoading(true);

      try {
        // Simuler un envoi (à remplacer par une vraie API)
        await this.sendFormData(formData);
        
        // Succès
        this.showMessage(
          '✅ Merci pour votre message ! Nous vous contacterons dans les plus brefs délais.',
          'success'
        );
        
        // Réinitialiser le formulaire
        this.form.reset();
        this.clearAllErrors();
        
        // Tracker l'événement
        window.EducaPsy.Utils.trackEvent('contact_form_submitted', {
          sujet: formData.sujet
        });
        
        // Toast notification
        window.EducaPsy.Utils.showToast(
          'Message envoyé avec succès !',
          'success',
          3000
        );

      } catch (error) {
        // Erreur
        console.error('Erreur envoi formulaire:', error);
        this.showMessage(
          '❌ Une erreur est survenue. Veuillez réessayer ou nous contacter directement.',
          'error'
        );
      } finally {
        this.setLoading(false);
      }
    },

    /**
     * Simuler l'envoi des données (à remplacer par une vraie API)
     */
    sendFormData: function(data) {
      return new Promise((resolve, reject) => {
        // Simuler un délai réseau
        setTimeout(() => {
          // Simuler un succès (95% de chance)
          if (Math.random() > 0.05) {
            console.log('Données du formulaire:', data);
            resolve({ success: true });
          } else {
            reject(new Error('Erreur réseau simulée'));
          }
        }, 1500);
      });

      /* 
      // Exemple d'intégration réelle avec une API :
      
      return fetch('https://your-api.com/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      })
      .then(response => {
        if (!response.ok) {
          throw new Error('Erreur réseau');
        }
        return response.json();
      });
      */

      /*
      // Exemple avec EmailJS :
      
      return emailjs.send(
        'YOUR_SERVICE_ID',
        'YOUR_TEMPLATE_ID',
        data
      );
      */

      /*
      // Exemple avec Formspree :
      
      return fetch('https://formspree.io/f/YOUR_FORM_ID', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      */
    },

    /**
     * Afficher un message de retour
     */
    showMessage: function(message, type) {
      const messageDiv = document.getElementById('formMessage');
      
      messageDiv.className = 'form-message show';
      messageDiv.innerHTML = `<div class="${type}-message">${message}</div>`;
      
      // Scroll vers le message
      window.EducaPsy.Utils.smoothScrollTo(messageDiv, 100);

      // Masquer après 5 secondes si c'est un succès
      if (type === 'success') {
        setTimeout(() => {
          messageDiv.classList.remove('show');
        }, 5000);
      }
    },

    /**
     * Gérer l'état de chargement du bouton
     */
    setLoading: function(loading) {
      const submitBtn = this.form.querySelector('button[type="submit"]');
      const inputs = this.form.querySelectorAll('input, textarea, select, button');

      if (loading) {
        submitBtn.classList.add('loading');
        inputs.forEach(input => input.disabled = true);
      } else {
        submitBtn.classList.remove('loading');
        inputs.forEach(input => input.disabled = false);
      }
    },

    /**
     * Effacer toutes les erreurs
     */
    clearAllErrors: function() {
      const fields = this.form.querySelectorAll('input, textarea, select');
      fields.forEach(field => {
        field.classList.remove('error', 'success');
        const errorSpan = document.getElementById(`${field.id}-error`);
        if (errorSpan) {
          errorSpan.textContent = '';
        }
      });
    }
  };

  // Initialiser au chargement du DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => ContactForm.init());
  } else {
    ContactForm.init();
  }

  // Exposer globalement
  window.EducaPsy = window.EducaPsy || {};
  window.EducaPsy.ContactForm = ContactForm;

})();
