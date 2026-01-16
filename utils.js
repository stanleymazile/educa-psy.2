/**
 * UTILS.JS - Fonctions utilitaires réutilisables
 * Ce fichier doit être chargé en premier
 */

(function(window) {
  'use strict';

  // Créer un namespace global pour nos utilitaires
  window.EducaPsy = window.EducaPsy || {};
  
  const Utils = {
    /**
     * Échapper le HTML pour prévenir les attaques XSS
     * @param {string} text - Texte à échapper
     * @returns {string} Texte échappé
     */
    escapeHtml: function(text) {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    },

    /**
     * Debounce - Limite l'exécution d'une fonction
     * @param {Function} func - Fonction à debouncer
     * @param {number} wait - Temps d'attente en ms
     * @returns {Function} Fonction debouncée
     */
    debounce: function(func, wait) {
      let timeout;
      return function executedFunction(...args) {
        const later = () => {
          clearTimeout(timeout);
          func.apply(this, args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
      };
    },

    /**
     * Throttle - Limite l'exécution d'une fonction dans le temps
     * @param {Function} func - Fonction à throttler
     * @param {number} limit - Limite de temps en ms
     * @returns {Function} Fonction throttlée
     */
    throttle: function(func, limit) {
      let inThrottle;
      return function(...args) {
        if (!inThrottle) {
          func.apply(this, args);
          inThrottle = true;
          setTimeout(() => inThrottle = false, limit);
        }
      };
    },

    /**
     * Récupérer la date et l'heure actuelles formatées
     * @returns {string} Heure formatée HH:MM
     */
    getCurrentTime: function() {
      const now = new Date();
      return now.getHours().toString().padStart(2, '0') + ':' + 
             now.getMinutes().toString().padStart(2, '0');
    },

    /**
     * Récupérer la date formatée
     * @returns {string} Date formatée DD/MM/YYYY
     */
    getCurrentDate: function() {
      const now = new Date();
      return now.getDate().toString().padStart(2, '0') + '/' +
             (now.getMonth() + 1).toString().padStart(2, '0') + '/' +
             now.getFullYear();
    },

    /**
     * Vérifier si un élément est visible dans le viewport
     * @param {HTMLElement} element - Élément à vérifier
     * @returns {boolean} True si visible
     */
    isInViewport: function(element) {
      const rect = element.getBoundingClientRect();
      return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
      );
    },

    /**
     * Smooth scroll vers un élément
     * @param {string|HTMLElement} target - Sélecteur CSS ou élément
     * @param {number} offset - Décalage en pixels
     */
    smoothScrollTo: function(target, offset = 0) {
      const element = typeof target === 'string' ? document.querySelector(target) : target;
      if (!element) return;

      const targetPosition = element.getBoundingClientRect().top + window.pageYOffset - offset;
      
      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });
    },

    /**
     * Gestion des cookies (support pour cookies.js)
     * @param {string} name - Nom du cookie
     * @returns {string|null} Valeur du cookie
     */
    getCookie: function(name) {
      const nameEQ = name + "=";
      const ca = document.cookie.split(';');
      for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
      }
      return null;
    },

    /**
     * Définir un cookie
     * @param {string} name - Nom du cookie
     * @param {string} value - Valeur du cookie
     * @param {number} days - Durée de vie en jours
     */
    setCookie: function(name, value, days) {
      const date = new Date();
      date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
      const expires = "expires=" + date.toUTCString();
      document.cookie = name + "=" + value + ";" + expires + ";path=/;SameSite=Lax";
    },

    /**
     * Supprimer un cookie
     * @param {string} name - Nom du cookie
     */
    deleteCookie: function(name) {
      document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;";
    },

    /**
     * Générer un ID unique
     * @returns {string} ID unique
     */
    generateId: function() {
      return 'id_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    },

    /**
     * Formater un nombre avec des espaces
     * @param {number} num - Nombre à formater
     * @returns {string} Nombre formaté
     */
    formatNumber: function(num) {
      return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    },

    /**
     * Valider une adresse email
     * @param {string} email - Email à valider
     * @returns {boolean} True si valide
     */
    isValidEmail: function(email) {
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return re.test(email);
    },

    /**
     * Valider un numéro de téléphone haïtien
     * @param {string} phone - Numéro à valider
     * @returns {boolean} True si valide
     */
    isValidHaitianPhone: function(phone) {
      // Format: +509 XXXX-XXXX ou 509XXXXXXXX ou XXXXXXXX
      const cleaned = phone.replace(/[\s\-\(\)]/g, '');
      return /^(\+?509)?[0-9]{8}$/.test(cleaned);
    },

    /**
     * Afficher une notification toast
     * @param {string} message - Message à afficher
     * @param {string} type - Type: 'success', 'error', 'warning', 'info'
     * @param {number} duration - Durée en ms
     */
    showToast: function(message, type = 'info', duration = 3000) {
      // Vérifier si le conteneur existe, sinon le créer
      let toastContainer = document.getElementById('toast-container');
      if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toast-container';
        toastContainer.style.cssText = `
          position: fixed;
          top: 20px;
          right: 20px;
          z-index: 10001;
          display: flex;
          flex-direction: column;
          gap: 10px;
        `;
        document.body.appendChild(toastContainer);
      }

      const toast = document.createElement('div');
      toast.className = `toast toast-${type}`;
      toast.textContent = message;
      toast.style.cssText = `
        padding: 16px 24px;
        border-radius: 8px;
        background: white;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        animation: slideInRight 0.3s ease;
        max-width: 300px;
        color: #333;
        font-size: 14px;
        border-left: 4px solid;
      `;

      // Couleurs selon le type
      const colors = {
        success: '#28a745',
        error: '#dc3545',
        warning: '#ffc107',
        info: '#0066CC'
      };
      toast.style.borderLeftColor = colors[type] || colors.info;

      toastContainer.appendChild(toast);

      // Supprimer après la durée spécifiée
      setTimeout(() => {
        toast.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => toast.remove(), 300);
      }, duration);
    },

    /**
     * Vérifier si l'utilisateur est sur mobile
     * @returns {boolean} True si mobile
     */
    isMobile: function() {
      return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    },

    /**
     * Obtenir la taille de l'écran
     * @returns {string} 'mobile', 'tablet' ou 'desktop'
     */
    getScreenSize: function() {
      const width = window.innerWidth;
      if (width < 768) return 'mobile';
      if (width < 1024) return 'tablet';
      return 'desktop';
    },

    /**
     * Logger avec timestamp (pour le développement)
     * @param {string} message - Message à logger
     * @param {*} data - Données supplémentaires
     */
    log: function(message, data) {
      if (typeof console !== 'undefined' && console.log) {
        const timestamp = this.getCurrentTime();
        if (data !== undefined) {
          console.log(`[${timestamp}] ${message}`, data);
        } else {
          console.log(`[${timestamp}] ${message}`);
        }
      }
    },

    /**
     * Tracker un événement (pour analytics)
     * @param {string} eventName - Nom de l'événement
     * @param {Object} eventData - Données de l'événement
     */
    trackEvent: function(eventName, eventData = {}) {
      // Google Analytics
      if (typeof gtag !== 'undefined') {
        gtag('event', eventName, {
          event_category: 'User Interaction',
          ...eventData
        });
      }
      
      // Log pour le développement
      this.log('Event tracked:', { eventName, eventData });
    }
  };

  // Ajouter les animations CSS nécessaires
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideInRight {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
    
    @keyframes slideOutRight {
      from {
        transform: translateX(0);
        opacity: 1;
      }
      to {
        transform: translateX(100%);
        opacity: 0;
      }
    }
  `;
  document.head.appendChild(style);

  // Exposer les utilitaires globalement
  window.EducaPsy.Utils = Utils;

  // Log de chargement
  Utils.log('Utils.js chargé avec succès');

})(window);
