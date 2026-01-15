// Système de gestion des cookies - cookies.js
// À inclure dans TOUTES les pages HTML avec <script src="cookies.js"></script>

(function() {
  'use strict';

  const CookieConsent = {
    // Configuration
    config: {
      cookieName: 'educapsy_cookie_consent',
      cookieExpiry: 365, // jours
      position: 'bottom', // 'bottom' ou 'top'
    },

    // Initialisation
    init: function() {
      if (!this.hasConsent()) {
        this.showBanner();
      } else {
        this.loadAcceptedCookies();
      }
      this.setupPreferencesButton();
    },

    // Vérifier si le consentement existe
    hasConsent: function() {
      return this.getCookie(this.config.cookieName) !== null;
    },

    // Afficher la bannière de cookies
    showBanner: function() {
      const banner = document.createElement('div');
      banner.id = 'cookie-consent-banner';
      banner.className = 'cookie-banner';
      banner.innerHTML = `
        <div class="cookie-banner-content">
          <div class="cookie-banner-text">
            <h3>🍪 Nous utilisons des cookies</h3>
            <p>Nous utilisons des cookies pour améliorer votre expérience sur notre site. En continuant, vous acceptez notre utilisation des cookies.</p>
            <a href="politique-confidentialite.html" target="_blank">En savoir plus</a>
          </div>
          <div class="cookie-banner-actions">
            <button id="cookie-accept-all" class="cookie-btn cookie-btn-primary">
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

      // Styles inline pour s'assurer que la bannière s'affiche correctement
      const style = document.createElement('style');
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
        }

        .cookie-btn-primary {
          background-color: #0066CC;
          color: white;
        }

        .cookie-btn-primary:hover {
          background-color: #004999;
          transform: translateY(-2px);
        }

        .cookie-btn-secondary {
          background-color: white;
          color: #333;
        }

        .cookie-btn-secondary:hover {
          background-color: #f0f0f0;
        }

        .cookie-btn-tertiary {
          background-color: transparent;
          color: white;
          border: 2px solid white;
        }

        .cookie-btn-tertiary:hover {
          background-color: rgba(255, 255, 255, 0.1);
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

        .cookie-preferences-header {
          margin-bottom: 24px;
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

        /* Bouton de gestion des cookies (footer) */
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
      `;
      document.head.appendChild(style);

      // Event listeners
      document.getElementById('cookie-accept-all').addEventListener('click', () => {
        this.acceptAll();
      });

      document.getElementById('cookie-preferences').addEventListener('click', () => {
        this.showPreferencesModal();
      });

      document.getElementById('cookie-reject').addEventListener('click', () => {
        this.rejectAll();
      });
    },

    // Modal de préférences
    showPreferencesModal: function() {
      const currentPrefs = this.getPreferences();
      
      const modal = document.createElement('div');
      modal.id = 'cookie-preferences-modal';
      modal.className = 'cookie-preferences-modal';
      modal.innerHTML = `
        <div class="cookie-preferences-content">
          <div class="cookie-preferences-header">
            <h2>🍪 Gestion des cookies</h2>
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
            <button class="cookie-btn cookie-btn-secondary" id="cookie-save-prefs">
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

      document.getElementById('cookie-cancel-prefs').addEventListener('click', () => {
        modal.remove();
      });

      // Fermer en cliquant à l'extérieur
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.remove();
        }
      });
    },

    // Accepter tous les cookies
    acceptAll: function() {
      this.savePreferences({
        necessary: true,
        analytics: true,
        marketing: true
      });
      this.removeBanner();
    },

    // Refuser tous les cookies (sauf nécessaires)
    rejectAll: function() {
      this.savePreferences({
        necessary: true,
        analytics: false,
        marketing: false
      });
      this.removeBanner();
    },

    // Sauvegarder les préférences
    savePreferences: function(prefs) {
      this.setCookie(this.config.cookieName, JSON.stringify(prefs), this.config.cookieExpiry);
      this.loadAcceptedCookies();
    },

    // Obtenir les préférences
    getPreferences: function() {
      const cookie = this.getCookie(this.config.cookieName);
      if (cookie) {
        try {
          return JSON.parse(cookie);
        } catch (e) {
          return { necessary: true, analytics: false, marketing: false };
        }
      }
      return { necessary: true, analytics: false, marketing: false };
    },

    // Charger les cookies acceptés
    loadAcceptedCookies: function() {
      const prefs = this.getPreferences();

      // Cookies analytiques (Google Analytics, etc.)
      if (prefs.analytics) {
        this.loadAnalytics();
      }

      // Cookies marketing
      if (prefs.marketing) {
        this.loadMarketing();
      }
    },

    // Charger Google Analytics
    loadAnalytics: function() {
      // Remplacer 'GA_MEASUREMENT_ID' par votre vrai ID
      const script = document.createElement('script');
      script.async = true;
      script.src = 'https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID';
      document.head.appendChild(script);

      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'GA_MEASUREMENT_ID');
    },

    // Charger cookies marketing
    loadMarketing: function() {
      // Ajouter ici les scripts de marketing (Facebook Pixel, etc.)
      console.log('Marketing cookies loaded');
    },

    // Bouton de gestion dans le footer
    setupPreferencesButton: function() {
      // Ajouter un bouton dans le footer pour rouvrir les préférences
      const footerCopyright = document.querySelector('.footer-copyright');
      if (footerCopyright) {
        const settingsBtn = document.createElement('button');
        settingsBtn.className = 'cookie-settings-btn';
        settingsBtn.textContent = 'Gestion des cookies';
        settingsBtn.addEventListener('click', () => {
          this.showPreferencesModal();
        });
        
        const separator = document.createTextNode(' | ');
        footerCopyright.querySelector('p').appendChild(separator);
        footerCopyright.querySelector('p').appendChild(settingsBtn);
      }
    },

    // Supprimer la bannière
    removeBanner: function() {
      const banner = document.getElementById('cookie-consent-banner');
      if (banner) {
        banner.style.animation = 'slideDown 0.4s ease-out';
        setTimeout(() => banner.remove(), 400);
      }
    },

    // Utilitaires cookies
    setCookie: function(name, value, days) {
      const date = new Date();
      date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
      const expires = "expires=" + date.toUTCString();
      document.cookie = name + "=" + value + ";" + expires + ";path=/;SameSite=Lax";
    },

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

    deleteCookie: function(name) {
      document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;";
    }
  };

  // Initialiser au chargement de la page
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => CookieConsent.init());
  } else {
    CookieConsent.init();
  }

  // Animation de sortie
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideDown {
      from { transform: translateY(0); opacity: 1; }
      to { transform: translateY(100%); opacity: 0; }
    }
  `;
  document.head.appendChild(style);

})();
