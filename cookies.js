/**
 * COOKIES.JS - Système de gestion des cookies conforme RGPD
 * Dépendances: utils.js
 */

(function() {
  'use strict';

  const CookieConsent = {
    initialized: false,
    config: {
      cookieName: 'educapsy_cookie_consent',
      cookieExpiry: 365,
      position: 'bottom',
      gaTrackingId: 'G-XXXXXXXXXX', // À remplacer par votre ID
    },

    /**
     * Initialiser le système de cookies
     */
    init: function() {
      if (this.initialized) {
        console.warn('CookieConsent déjà initialisé');
        return;
      }

      this.initialized = true;
      this.injectStyles();

      if (!this.hasConsent()) {
        this.showBanner();
      } else {
        this.loadAcceptedCookies();
      }

      this.setupPreferencesButton();
      window.EducaPsy.Utils.log('CookieConsent initialisé');
    },

    /**
     * Injecter les styles CSS
     */
    injectStyles: function() {
      if (document.getElementById('cookie-consent-styles')) return;

      const style = document.createElement('style');
      style.id = 'cookie-consent-styles';
      style.textContent = `
        .cookie-banner {
          position: fixed;
          ${this.config.position}: 0;
          left: 0;
          right: 0;
          background: rgba(51, 51, 51, 0.98);
          backdrop-filter: blur(10px);
          padding: 20px;
          z-index: 10000;
          box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.3);
          animation: slideUp 0.4s ease-out;
        }

        @keyframes slideUp {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }

        @keyframes slideDown {
          from { transform: translateY(0); opacity: 1; }
          to { transform: translateY(100%); opacity: 0; }
        }

        .cookie-banner-content {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 24px;
          flex-wrap: wrap;
        }

        .cookie-banner-text {
          flex: 1;
          min-width: 300px;
          color: white;
        }

        .cookie-banner-text h3 {
          margin: 0 0 8px 0;
          font-size: 18px;
        }

        .cookie-banner-text p {
          margin: 0 0 8px 0;
          font-size: 14px;
          opacity: 0.9;
        }

        .cookie-banner-text a {
          color: #4da6ff;
          text-decoration: none;
          font-size: 14px;
        }

        .cookie-banner-text a:hover {
          text-decoration: underline;
        }

        .cookie-banner-actions {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }

        .cookie-btn {
          padding: 12px 24px;
          border: none;
          border-radius: 50px;
          font-size: 14px;
          font-weight: bold;
          cursor: pointer;
          transition: all 0.3s ease;
          white-space: nowrap;
          min-height: 44px;
        }

        .cookie-btn-primary {
          background-color: #0066CC;
          color: white;
        }

        .cookie-btn-primary:hover,
        .cookie-btn-primary:focus {
          background-color: #004999;
          transform: translateY(-2px);
        }

        .cookie-btn-secondary {
          background-color: white;
          color: #333;
        }

        .cookie-btn-secondary:hover,
        .cookie-btn-secondary:focus {
          background-color: #f0f0f0;
        }

        .cookie-btn-tertiary {
          background-color: transparent;
          color: white;
          border: 2px solid white;
        }

        .cookie-btn-tertiary:hover,
        .cookie-btn-tertiary:focus {
          background-color: rgba(255, 255, 255, 0.1);
        }

        /* Modal de préférences */
        .cookie-preferences-modal {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 10001;
          animation: fadeIn 0.3s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .cookie-preferences-content {
          background: white;
          padding: 40px;
          border-radius: 16px;
          max-width: 600px;
          max-height: 80vh;
          overflow-y: auto;
          width: 90%;
        }

        .cookie-preferences-header h2 {
          margin: 0 0 8px 0;
          color: #333;
        }

        .cookie-preference-item {
          padding: 20px;
          border: 2px solid #e0e0e0;
          border-radius: 12px;
          margin-bottom: 16px;
        }

        .cookie-preference-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .cookie-preference-header h3 {
          margin: 0;
          font-size: 16px;
          color: #333;
        }

        .cookie-toggle {
          position: relative;
          width: 50px;
          height: 26px;
        }

        .cookie-toggle input {
          opacity: 0;
          width: 0;
          height: 0;
        }

        .cookie-toggle-slider {
          position: absolute;
          cursor: pointer;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: #ccc;
          transition: 0.4s;
          border-radius: 26px;
        }

        .cookie-toggle-slider:before {
          position: absolute;
          content: "";
          height: 18px;
          width: 18px;
          left: 4px;
          bottom: 4px;
          background-color: white;
          transition: 0.4s;
          border-radius: 50%;
        }

        .cookie-toggle input:checked + .cookie-toggle-slider {
          background-color: #0066CC;
        }

        .cookie-toggle input:checked + .cookie-toggle-slider:before {
          transform: translateX(24px);
        }

        .cookie-toggle input:disabled + .cookie-toggle-slider {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .cookie-preference-description {
          font-size: 14px;
          color: #666;
          line-height: 1.6;
        }

        .cookie-preferences-actions {
          display: flex;
          gap: 12px;
          margin-top: 24px;
        }

        .cookie-preferences-actions button {
          flex: 1;
        }

        .cookie-settings-btn {
          background: none;
          border: none;
          color: inherit;
          cursor: pointer;
          text-decoration: underline;
          font-size: inherit;
          padding: 0;
        }

        .cookie-settings-btn:hover {
          opacity: 0.8;
        }

        @media (max-width: 768px) {
          .cookie-banner-content {
            flex-direction: column;
            text-align: center;
          }

          .cookie-banner-actions {
            width: 100%;
            justify-content: center;
          }

          .cookie-btn {
            flex: 1;
            min-width: 120px;
          }
        }
      `;
      document.head.appendChild(style);
    },

    /**
     * Vérifier si le consentement existe
     */
    hasConsent: function() {
      return window.EducaPsy.Utils.getCookie(this.config.cookieName) !== null;
    },

    /**
     * Afficher la bannière de cookies
     */
    showBanner: function() {
      if (document.getElementById('cookie-consent-banner')) return;

      const banner = document.createElement('div');
      banner.id = 'cookie-consent-banner';
      banner.className = 'cookie-banner';
      banner.setAttribute('role', 'dialog');
      banner.setAttribute('aria-labelledby', 'cookie-title');
      banner.setAttribute('aria-describedby', 'cookie-description');

      banner.innerHTML = `
        <div class="cookie-banner-content">
          <div class="cookie-banner-text">
            <h3 id="cookie-title">🍪 Nous utilisons des cookies</h3>
            <p id="cookie-description">Nous utilisons des cookies pour améliorer votre expérience sur notre site. En continuant, vous acceptez notre utilisation des cookies.</p>
            <a href="politique-confidentialite.html" target="_blank" rel="noopener">En savoir plus</a>
          </div>
          <div class="cookie-banner-actions">
            <button id="cookie-accept-all" class="cookie-btn cookie-btn-primary" aria-label="Accepter tous les cookies">
              Accepter tout
            </button>
            <button id="cookie-preferences" class="cookie-btn cookie-btn-secondary">
              Personnaliser
            </button>
            <button id="cookie-reject" class="cookie-btn cookie-btn-tertiary">
              Refuser
            </button>
          </div>
        </div>
      `;

      document.body.appendChild(banner);

      // Event listeners
      document.getElementById('cookie-accept-all').addEventListener('click', () => this.acceptAll());
      document.getElementById('cookie-preferences').addEventListener('click', () => this.showPreferencesModal());
      document.getElementById('cookie-reject').addEventListener('click', () => this.rejectAll());

      // Focus automatique pour l'accessibilité
      setTimeout(() => {
        document.getElementById('cookie-accept-all').focus();
      }, 100);
    },

    /**
     * Afficher le modal de préférences
     */
    showPreferencesModal: function() {
      const currentPrefs = this.getPreferences();
      
      const modal = document.createElement('div');
      modal.id = 'cookie-preferences-modal';
      modal.className = 'cookie-preferences-modal';
      modal.setAttribute('role', 'dialog');
      modal.setAttribute('aria-modal', 'true');
      modal.setAttribute('aria-labelledby', 'prefs-title');

      modal.innerHTML = `
        <div class="cookie-preferences-content">
          <div class="cookie-preferences-header">
            <h2 id="prefs-title">🍪 Gestion des cookies</h2>
            <p>Choisissez les cookies que vous souhaitez autoriser</p>
          </div>

          <div class="cookie-preference-item">
            <div class="cookie-preference-header">
              <h3>Cookies nécessaires</h3>
              <label class="cookie-toggle">
                <input type="checkbox" checked disabled>
                <span class="cookie-toggle-slider"></span>
              </label>
            </div>
            <p class="cookie-preference-description">
              Ces cookies sont essentiels au fonctionnement du site. Ils ne peuvent pas être désactivés.
            </p>
          </div>

          <div class="cookie-preference-item">
            <div class="cookie-preference-header">
              <h3>Cookies analytiques</h3>
              <label class="cookie-toggle">
                <input type="checkbox" id="cookie-analytics" ${currentPrefs.analytics ? 'checked' : ''}>
                <span class="cookie-toggle-slider"></span>
              </label>
            </div>
            <p class="cookie-preference-description">
              Ces cookies nous aident à comprendre comment vous utilisez le site pour l'améliorer.
            </p>
          </div>

          <div class="cookie-preference-item">
            <div class="cookie-preference-header">
              <h3>Cookies marketing</h3>
              <label class="cookie-toggle">
                <input type="checkbox" id="cookie-marketing" ${currentPrefs.marketing ? 'checked' : ''}>
                <span class="cookie-toggle-slider"></span>
              </label>
            </div>
            <p class="cookie-preference-description">
              Ces cookies sont utilisés pour vous proposer du contenu et des publicités pertinents.
            </p>
          </div>

          <div class="cookie-preferences-actions">
            <button class="cookie-btn cookie-btn-primary" id="cookie-save-prefs">
              Enregistrer mes préférences
            </button>
            <button class="cookie-btn cookie-btn-tertiary" id="cookie-cancel-prefs">
              Annuler
            </button>
          </div>
        </div>
      `;

      document.body.appendChild(modal);

      // Event listeners
      document.getElementById('cookie-save-prefs').addEventListener('click', () => {
        this.savePreferences({
          necessary: true,
          analytics: document.getElementById('cookie-analytics').checked,
          marketing: document.getElementById('cookie-marketing').checked
        });
        modal.remove();
        this.removeBanner();
      });

      document.getElementById('cookie-cancel-prefs').addEventListener('click', () => modal.remove());

      // Fermer avec Escape
      const escapeHandler = (e) => {
        if (e.key === 'Escape') {
          modal.remove();
          document.removeEventListener('keydown', escapeHandler);
        }
      };
      document.addEventListener('keydown', escapeHandler);

      // Fermer en cliquant à l'extérieur
      modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.remove();
      });

      // Trap focus
      this.trapFocus(modal);
    },

    /**
     * Trap focus dans le modal
     */
    trapFocus: function(container) {
      const focusableElements = container.querySelectorAll(
        'button, input[type="checkbox"], a[href]'
      );
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      firstElement.focus();

      container.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
          if (e.shiftKey && document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          } else if (!e.shiftKey && document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      });
    },

    /**
     * Accepter tous les cookies
     */
    acceptAll: function() {
      this.savePreferences({
        necessary: true,
        analytics: true,
        marketing: true
      });
      this.removeBanner();
      window.EducaPsy.Utils.trackEvent('cookies_accepted_all');
    },

    /**
     * Refuser tous les cookies (sauf nécessaires)
     */
    rejectAll: function() {
      this.savePreferences({
        necessary: true,
        analytics: false,
        marketing: false
      });
      this.removeBanner();
      window.EducaPsy.Utils.trackEvent('cookies_rejected');
    },

    /**
     * Sauvegarder les préférences
     */
    savePreferences: function(prefs) {
      const data = {
        prefs: prefs,
        timestamp: Date.now()
      };
      window.EducaPsy.Utils.setCookie(this.config.cookieName, JSON.stringify(data), this.config.cookieExpiry);
      this.loadAcceptedCookies();
    },

    /**
     * Obtenir les préférences
     */
    getPreferences: function() {
      const cookie = window.EducaPsy.Utils.getCookie(this.config.cookieName);
      if (cookie) {
        try {
          const data = JSON.parse(cookie);
          if (typeof data.prefs === 'object' && data.prefs !== null) {
            return {
              necessary: true,
              analytics: Boolean(data.prefs.analytics),
              marketing: Boolean(data.prefs.marketing)
            };
          }
        } catch (e) {
          console.warn('Cookie invalide détecté:', e);
        }
      }
      return { necessary: true, analytics: false, marketing: false };
    },

    /**
     * Charger les cookies acceptés
     */
    loadAcceptedCookies: function() {
      const prefs = this.getPreferences();

      if (prefs.analytics) {
        this.loadAnalytics();
      }

      if (prefs.marketing) {
        this.loadMarketing();
      }
    },

    /**
     * Charger Google Analytics
     */
    loadAnalytics: function() {
      if (!this.config.gaTrackingId || this.config.gaTrackingId === 'G-XXXXXXXXXX') {
        console.warn('Google Analytics non configuré');
        return;
      }

      if (window.gtag) {
        console.log('Google Analytics déjà chargé');
        return;
      }

      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${this.config.gaTrackingId}`;
      document.head.appendChild(script);

      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      window.gtag = gtag;
      gtag('js', new Date());
      gtag('config', this.config.gaTrackingId, {
        'anonymize_ip': true,
        'cookie_flags': 'SameSite=Lax;Secure'
      });

      console.log('Google Analytics chargé');
    },

    /**
     * Charger cookies marketing
     */
    loadMarketing: function() {
      console.log('Marketing cookies loaded');
    },

    /**
     * Ajouter un bouton dans le footer
     */
    setupPreferencesButton: function() {
      const footerCopyright = document.querySelector('.footer-copyright p');
      if (footerCopyright) {
        const separator = document.createTextNode(' | ');
        const settingsBtn = document.createElement('button');
        settingsBtn.className = 'cookie-settings-btn';
        settingsBtn.textContent = 'Gestion des cookies';
        settingsBtn.addEventListener('click', () => this.showPreferencesModal());
        
        footerCopyright.appendChild(separator);
        footerCopyright.appendChild(settingsBtn);
      }
    },

    /**
     * Supprimer la bannière
     */
    removeBanner: function() {
      const banner = document.getElementById('cookie-consent-banner');
      if (banner) {
        banner.style.animation = 'slideDown 0.4s ease-out';
        setTimeout(() => banner.remove(), 400);
      }
    }
  };

  // Initialiser au chargement
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => CookieConsent.init());
  } else {
    CookieConsent.init();
  }

  // Exposer globalement
  window.EducaPsy = window.EducaPsy || {};
  window.EducaPsy.CookieConsent = CookieConsent;

})();
