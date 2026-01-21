/**
 * UTILS.JS - Fonctions utilitaires pour index.html
 * Version: 2.0.0 - Épurée et Optimisée
 * 
 * Fonctionnalités conservées:
 * - Sécurité XSS
 * - Debounce/Throttle
 * - Gestion des cookies
 * - Validation
 * - Notifications toast
 * - Tracking événements
 */

(function(window) {
  'use strict';

  // Créer le namespace global
  window.EducaPsy = window.EducaPsy || {};
  
  const Utils = {
    
    /* ====================================
       SÉCURITÉ
       ==================================== */
    
    /**
     * Échapper le HTML pour prévenir XSS
     * @param {string} text - Texte à échapper
     * @returns {string} Texte sécurisé
     */
    escapeHtml: function(text) {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    },

    /* ====================================
       PERFORMANCE
       ==================================== */
    
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
     * Throttle - Limite l'exécution dans le temps
     * @param {Function} func - Fonction à throttler
     * @param {number} limit - Limite en ms
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

    /* ====================================
       DATE & HEURE
       ==================================== */
    
    /**
     * Heure actuelle formatée
     * @returns {string} HH:MM
     */
    getCurrentTime: function() {
      const now = new Date();
      return now.getHours().toString().padStart(2, '0') + ':' + 
             now.getMinutes().toString().padStart(2, '0');
    },

    /**
     * Date actuelle formatée
     * @returns {string} DD/MM/YYYY
     */
    getCurrentDate: function() {
      const now = new Date();
      return now.getDate().toString().padStart(2, '0') + '/' +
             (now.getMonth() + 1).toString().padStart(2, '0') + '/' +
             now.getFullYear();
    },

    /* ====================================
       COOKIES
       ==================================== */
    
    /**
     * Récupérer un cookie
     * @param {string} name - Nom du cookie
     * @returns {string|null} Valeur ou null
     */
    getCookie: function(name) {
      const nameEQ = name + "=";
      const ca = document.cookie.split(';');
      for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1);
        if (c.indexOf(nameEQ) === 0) {
          return c.substring(nameEQ.length);
        }
      }
      return null;
    },

    /**
     * Définir un cookie
     * @param {string} name - Nom
     * @param {string} value - Valeur
     * @param {number} days - Durée en jours
     */
    setCookie: function(name, value, days) {
      const date = new Date();
      date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
      const expires = "expires=" + date.toUTCString();
      document.cookie = name + "=" + value + ";" + expires + ";path=/;SameSite=Lax";
    },

    /**
     * Supprimer un cookie
     * @param {string} name - Nom
     */
    deleteCookie: function(name) {
      document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;";
    },

    /* ====================================
       VALIDATION
       ==================================== */
    
    /**
     * Valider un email
     * @param {string} email - Email à valider
     * @returns {boolean} True si valide
     */
    isValidEmail: function(email) {
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return re.test(email);
    },

    /**
     * Valider un téléphone haïtien
     * @param {string} phone - Numéro
     * @returns {boolean} True si valide
     */
    isValidHaitianPhone: function(phone) {
      const cleaned = phone.replace(/[\s\-\(\)]/g, '');
      return /^(\+?509)?[0-9]{8}$/.test(cleaned);
    },

    /* ====================================
       FORMATAGE
       ==================================== */
    
    /**
     * Formater un nombre avec espaces
     * @param {number} num - Nombre
     * @returns {string} Formaté
     */
    formatNumber: function(num) {
      return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    },

    /**
     * Générer un ID unique
     * @returns {string} ID unique
     */
    generateId: function() {
      return 'id_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    },

    /* ====================================
       NOTIFICATIONS TOAST
       ==================================== */
    
    /**
     * Afficher une notification toast
     * @param {string} message - Message
     * @param {string} type - 'success', 'error', 'warning', 'info'
     * @param {number} duration - Durée en ms
     */
    showToast: function(message, type = 'info', duration = 3000) {
      // Créer ou récupérer le conteneur
      let container = document.getElementById('toast-container');
      if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.style.cssText = `
          position: fixed;
          top: 20px;
          right: 20px;
          z-index: 10001;
          display: flex;
          flex-direction: column;
          gap: 10px;
          max-width: 350px;
        `;
        document.body.appendChild(container);
      }

      // Créer le toast
      const toast = document.createElement('div');
      toast.className = `toast toast-${type}`;
      toast.setAttribute('role', 'alert');
      toast.setAttribute('aria-live', 'polite');
      
      // Icônes selon le type
      const icons = {
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️'
      };
      
      // Couleurs selon le type
      const colors = {
        success: '#28a745',
        error: '#dc3545',
        warning: '#ffc107',
        info: '#0066CC'
      };

      toast.innerHTML = `
        <span aria-hidden="true" style="font-size: 20px; margin-right: 8px;">
          ${icons[type] || icons.info}
        </span>
        <span>${this.escapeHtml(message)}</span>
      `;
      
      toast.style.cssText = `
        display: flex;
        align-items: center;
        padding: 16px 24px;
        border-radius: 8px;
        background: white;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        animation: slideInRight 0.3s ease;
        color: #333;
        font-size: 14px;
        border-left: 4px solid ${colors[type] || colors.info};
        cursor: pointer;
      `;

      container.appendChild(toast);

      // Fermer au clic
      toast.addEventListener('click', () => {
        toast.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => toast.remove(), 300);
      });

      // Fermer automatiquement
      setTimeout(() => {
        if (toast.parentNode) {
          toast.style.animation = 'slideOutRight 0.3s ease';
          setTimeout(() => toast.remove(), 300);
        }
      }, duration);
    },

    /* ====================================
       DÉTECTION DEVICE
       ==================================== */
    
    /**
     * Vérifier si mobile
     * @returns {boolean} True si mobile
     */
    isMobile: function() {
      return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    },

    /**
     * Taille d'écran
     * @returns {string} 'mobile', 'tablet' ou 'desktop'
     */
    getScreenSize: function() {
      const width = window.innerWidth;
      if (width < 768) return 'mobile';
      if (width < 1024) return 'tablet';
      return 'desktop';
    },

    /* ====================================
       LOGGING & TRACKING
       ==================================== */
    
    /**
     * Logger avec timestamp
     * @param {string} message - Message
     * @param {*} data - Données optionnelles
     */
    log: function(message, data) {
      if (typeof console !== 'undefined' && console.log) {
        const timestamp = this.getCurrentTime();
        const prefix = `[EducaPsy ${timestamp}]`;
        
        if (data !== undefined) {
          console.log(prefix, message, data);
        } else {
          console.log(prefix, message);
        }
      }
    },

    /**
     * Tracker un événement (Google Analytics)
     * @param {string} eventName - Nom de l'événement
     * @param {Object} eventData - Données
     */
    trackEvent: function(eventName, eventData = {}) {
      // Google Analytics (gtag)
      if (typeof gtag !== 'undefined') {
        gtag('event', eventName, {
          event_category: 'User Interaction',
          ...eventData
        });
      }
      
      // Log pour développement
      this.log('📊 Event tracked:', { eventName, eventData });
    }
  };

  // Ajouter les animations CSS pour les toasts
  if (!document.getElementById('toast-animations')) {
    const style = document.createElement('style');
    style.id = 'toast-animations';
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

      #toast-container {
        pointer-events: none;
      }

      #toast-container .toast {
        pointer-events: all;
      }

      @media (max-width: 480px) {
        #toast-container {
          top: auto;
          bottom: 20px;
          right: 10px;
          left: 10px;
          max-width: none;
        }
      }
    `;
    document.head.appendChild(style);
  }

  // Exposer globalement
  window.EducaPsy.Utils = Utils;

  // Log de chargement
  Utils.log('✅ Utils.js chargé avec succès');

})(window);
