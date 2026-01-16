/**
 * CHAT.JS - Système de chat en direct sécurisé
 * Dépendances: utils.js
 */

(function() {
  'use strict';

  const LiveChat = {
    initialized: false,
    messageHistory: [],
    config: {
      position: 'bottom-right',
      theme: '#0066CC',
      autoOpen: false,
      showAfterSeconds: 30,
      availableHours: {
        start: 8,
        end: 17
      },
      sounds: {
        enabled: true,
        newMessage: true
      }
    },

    /**
     * Initialiser le chat
     */
    init: function() {
      if (this.initialized) {
        console.warn('LiveChat déjà initialisé');
        return;
      }

      this.initialized = true;
      this.messageHistory = this.loadHistory();
      
      this.injectStyles();
      this.createChatElements();
      this.setupEventListeners();
      this.updateStatus();
      
      // Affichage automatique
      if (this.config.autoOpen && this.isAvailable()) {
        setTimeout(() => {
          this.openChat();
        }, this.config.showAfterSeconds * 1000);
      }
      
      window.EducaPsy.Utils.log('LiveChat initialisé');
    },

    /**
     * Injecter les styles CSS
     */
    injectStyles: function() {
      if (document.getElementById('livechat-styles')) return;

      const styles = document.createElement('style');
      styles.id = 'livechat-styles';
      styles.textContent = `
        .chat-button {
          position: fixed;
          bottom: 20px;
          z-index: 9999;
          background: ${this.config.theme};
          color: white;
          padding: 16px 24px;
          border-radius: 50px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .chat-button.bottom-right { right: 20px; }
        .chat-button.bottom-left { left: 20px; }

        .chat-button:hover,
        .chat-button:focus {
          transform: scale(1.05);
          box-shadow: 0 6px 25px rgba(0, 0, 0, 0.4);
        }

        .chat-button-content {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .chat-icon {
          font-size: 24px;
        }

        .chat-text {
          font-weight: bold;
          font-size: 15px;
        }

        .chat-notification-badge {
          position: absolute;
          top: -8px;
          right: -8px;
          background: #dc3545;
          color: white;
          border-radius: 50%;
          width: 24px;
          height: 24px;
          display: none;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: bold;
        }

        .chat-window {
          position: fixed;
          bottom: 20px;
          width: 400px;
          max-width: calc(100vw - 40px);
          height: 600px;
          max-height: calc(100vh - 100px);
          background: white;
          border-radius: 16px;
          box-shadow: 0 8px 40px rgba(0, 0, 0, 0.3);
          z-index: 10000;
          display: none;
          flex-direction: column;
          overflow: hidden;
          animation: slideUp 0.3s ease-out;
        }

        .chat-window.bottom-right { right: 20px; }
        .chat-window.bottom-left { left: 20px; }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .chat-header {
          background: ${this.config.theme};
          color: white;
          padding: 16px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .chat-header-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .chat-header h3 {
          margin: 0;
          font-size: 16px;
        }

        .chat-status-text {
          margin: 0;
          font-size: 12px;
          opacity: 0.9;
        }

        .chat-status {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #28a745;
          border: 2px solid white;
        }

        .chat-status.offline {
          background: #6c757d;
        }

        .chat-btn-icon {
          background: none;
          border: none;
          color: white;
          font-size: 24px;
          cursor: pointer;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 4px;
          transition: background 0.2s;
        }

        .chat-btn-icon:hover,
        .chat-btn-icon:focus {
          background: rgba(255, 255, 255, 0.2);
        }

        .chat-messages {
          flex: 1;
          overflow-y: auto;
          padding: 20px;
          background: #f5f5f5;
        }

        .chat-message {
          display: flex;
          gap: 12px;
          margin-bottom: 16px;
          animation: fadeIn 0.3s ease;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .chat-message.user {
          flex-direction: row-reverse;
        }

        .chat-avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          flex-shrink: 0;
          background: white;
        }

        .chat-bubble {
          max-width: 70%;
          padding: 12px 16px;
          border-radius: 16px;
          background: white;
        }

        .chat-message.user .chat-bubble {
          background: ${this.config.theme};
          color: white;
        }

        .chat-bubble p {
          margin: 0;
          font-size: 14px;
          line-height: 1.5;
          word-wrap: break-word;
        }

        .chat-time {
          font-size: 11px;
          opacity: 0.7;
          display: block;
          margin-top: 4px;
        }

        .chat-quick-replies {
          padding: 12px 20px;
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          border-top: 1px solid #e0e0e0;
          background: white;
        }

        .quick-reply-btn {
          padding: 8px 16px;
          background: #f0f0f0;
          border: none;
          border-radius: 20px;
          font-size: 13px;
          cursor: pointer;
          transition: all 0.2s;
          white-space: nowrap;
        }

        .quick-reply-btn:hover,
        .quick-reply-btn:focus {
          background: ${this.config.theme};
          color: white;
        }

        .chat-input-form {
          padding: 16px;
          background: white;
          border-top: 1px solid #e0e0e0;
          display: flex;
          gap: 8px;
        }

        #chat-input {
          flex: 1;
          padding: 12px;
          border: 1px solid #e0e0e0;
          border-radius: 24px;
          font-size: 14px;
          outline: none;
        }

        #chat-input:focus {
          border-color: ${this.config.theme};
        }

        .chat-send-btn {
          width: 40px;
          height: 40px;
          background: ${this.config.theme};
          border: none;
          border-radius: 50%;
          color: white;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .chat-send-btn:hover,
        .chat-send-btn:focus {
          transform: scale(1.1);
        }

        .send-icon {
          font-size: 16px;
        }

        .typing-indicator {
          display: flex;
          gap: 4px;
          padding: 12px 16px;
        }

        .typing-dot {
          width: 8px;
          height: 8px;
          background: #999;
          border-radius: 50%;
          animation: typingAnimation 1.4s infinite;
        }

        .typing-dot:nth-child(2) {
          animation-delay: 0.2s;
        }

        .typing-dot:nth-child(3) {
          animation-delay: 0.4s;
        }

        @keyframes typingAnimation {
          0%, 60%, 100% {
            transform: translateY(0);
            opacity: 0.5;
          }
          30% {
            transform: translateY(-10px);
            opacity: 1;
          }
        }

        @media (max-width: 768px) {
          .chat-window {
            width: 100vw;
            height: 100vh;
            max-height: 100vh;
            bottom: 0;
            right: 0;
            left: 0;
            border-radius: 0;
          }

          .chat-button {
            bottom: 80px;
          }

          .chat-text {
            display: none;
          }
        }
      `;

      document.head.appendChild(styles);
    },

    /**
     * Créer les éléments du chat
     */
    createChatElements: function() {
      if (document.getElementById('chat-button')) return;

      // Bouton de chat
      const chatButton = document.createElement('div');
      chatButton.id = 'chat-button';
      chatButton.className = 'chat-button ' + this.config.position;
      chatButton.setAttribute('role', 'button');
      chatButton.setAttribute('aria-label', 'Ouvrir le chat en direct');
      chatButton.setAttribute('tabindex', '0');
      chatButton.innerHTML = `
        <div class="chat-button-content">
          <span class="chat-icon">💬</span>
          <span class="chat-text">Besoin d'aide ?</span>
        </div>
        <div class="chat-notification-badge">1</div>
      `;

      // Fenêtre de chat
      const chatWindow = document.createElement('div');
      chatWindow.id = 'chat-window';
      chatWindow.className = 'chat-window ' + this.config.position;
      chatWindow.setAttribute('role', 'dialog');
      chatWindow.setAttribute('aria-labelledby', 'chat-title');
      chatWindow.setAttribute('aria-modal', 'true');
      chatWindow.innerHTML = `
        <div class="chat-header">
          <div class="chat-header-info">
            <div class="chat-status"></div>
            <div>
              <h3 id="chat-title">Educa-Psy</h3>
              <p class="chat-status-text">Vérification...</p>
            </div>
          </div>
          <button id="chat-minimize" class="chat-btn-icon" aria-label="Minimiser">—</button>
          <button id="chat-close" class="chat-btn-icon" aria-label="Fermer">×</button>
        </div>

        <div class="chat-messages" id="chat-messages">
          <div class="chat-message bot">
            <div class="chat-avatar">🤖</div>
            <div class="chat-bubble">
              <p>Bonjour ! 👋 Comment puis-je vous aider aujourd'hui ?</p>
              <span class="chat-time">${window.EducaPsy.Utils.getCurrentTime()}</span>
            </div>
          </div>
        </div>

        <div class="chat-quick-replies">
          <button class="quick-reply-btn" data-message="Je veux prendre rendez-vous">📅 Prendre RDV</button>
          <button class="quick-reply-btn" data-message="Informations sur les tarifs">💰 Tarifs</button>
          <button class="quick-reply-btn" data-message="Parler à un conseiller">👤 Conseiller</button>
        </div>

        <form class="chat-input-form" id="chat-form">
          <input 
            type="text" 
            id="chat-input" 
            placeholder="Écrivez votre message..." 
            autocomplete="off"
            required
          >
          <button type="submit" class="chat-send-btn" aria-label="Envoyer">
            <span class="send-icon">➤</span>
          </button>
        </form>
      `;

      document.body.appendChild(chatButton);
      document.body.appendChild(chatWindow);

      // Restaurer l'historique si existant
      if (this.messageHistory.length > 0) {
        this.restoreHistory();
      }
    },

    /**
     * Configurer les event listeners
     */
    setupEventListeners: function() {
      const chatButton = document.getElementById('chat-button');
      const chatWindow = document.getElementById('chat-window');
      const chatClose = document.getElementById('chat-close');
      const chatMinimize = document.getElementById('chat-minimize');
      const chatForm = document.getElementById('chat-form');
      const quickReplies = document.querySelectorAll('.quick-reply-btn');

      // Ouvrir le chat
      chatButton.addEventListener('click', () => this.openChat());
      chatButton.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.openChat();
        }
      });

      // Fermer/minimiser
      chatClose.addEventListener('click', () => this.closeChat());
      chatMinimize.addEventListener('click', () => this.minimizeChat());

      // Envoyer un message
      chatForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.sendMessage();
      });

      // Réponses rapides
      quickReplies.forEach(btn => {
        btn.addEventListener('click', () => {
          const message = btn.getAttribute('data-message');
          this.sendQuickReply(message);
        });
      });

      // Escape pour fermer
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && chatWindow.style.display === 'flex') {
          this.closeChat();
        }
      });
    },

    /**
     * Ouvrir le chat
     */
    openChat: function() {
      const chatButton = document.getElementById('chat-button');
      const chatWindow = document.getElementById('chat-window');
      
      chatButton.style.display = 'none';
      chatWindow.style.display = 'flex';
      
      setTimeout(() => {
        const input = document.getElementById('chat-input');
        input.focus();
      }, 100);
      
      this.trapFocus(chatWindow);
      
      const badge = document.querySelector('.chat-notification-badge');
      if (badge) badge.style.display = 'none';
      
      window.EducaPsy.Utils.trackEvent('chat_opened');
    },

    /**
     * Fermer le chat
     */
    closeChat: function() {
      const chatButton = document.getElementById('chat-button');
      const chatWindow = document.getElementById('chat-window');
      
      chatWindow.style.display = 'none';
      chatButton.style.display = 'flex';
      
      window.EducaPsy.Utils.trackEvent('chat_closed');
    },

    /**
     * Minimiser le chat
     */
    minimizeChat: function() {
      this.closeChat();
    },

    /**
     * Trap focus dans le chat
     */
    trapFocus: function(container) {
      const focusableElements = container.querySelectorAll(
        'button, input, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      
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
     * Envoyer un message
     */
    sendMessage: function() {
      const input = document.getElementById('chat-input');
      const message = input.value.trim();
      
      if (!message) return;
      
      this.addMessage(message, 'user');
      input.value = '';
      
      this.showTypingIndicator();
      
      setTimeout(() => {
        this.hideTypingIndicator();
        this.generateBotResponse(message);
      }, 1000 + Math.random() * 1000);
      
      window.EducaPsy.Utils.trackEvent('message_sent', {
        message_length: message.length
      });
    },

    /**
     * Envoyer une réponse rapide
     */
    sendQuickReply: function(message) {
      this.addMessage(message, 'user');
      this.showTypingIndicator();
      
      setTimeout(() => {
        this.hideTypingIndicator();
        this.generateBotResponse(message);
      }, 1000);
    },

    /**
     * Ajouter un message (sécurisé contre XSS)
     */
    addMessage: function(text, sender = 'bot', save = true) {
      const messagesContainer = document.getElementById('chat-messages');
      const messageDiv = document.createElement('div');
      messageDiv.className = `chat-message ${sender}`;
      
      const avatar = sender === 'user' ? '👤' : '🤖';
      const safeText = window.EducaPsy.Utils.escapeHtml(text);
      
      messageDiv.innerHTML = `
        <div class="chat-avatar">${avatar}</div>
        <div class="chat-bubble">
          <p>${safeText}</p>
          <span class="chat-time">${window.EducaPsy.Utils.getCurrentTime()}</span>
        </div>
      `;
      
      messagesContainer.appendChild(messageDiv);
      this.scrollToBottom();
      
      if (save) {
        this.saveMessage(text, sender);
      }
      
      // Notifier si fenêtre masquée
      if (sender === 'bot' && document.hidden) {
        this.showNotificationBadge();
        this.playNotificationSound();
      }
    },

    /**
     * Afficher l'indicateur de frappe
     */
    showTypingIndicator: function() {
      const messagesContainer = document.getElementById('chat-messages');
      const typingDiv = document.createElement('div');
      typingDiv.className = 'chat-message bot typing-message';
      typingDiv.id = 'typing-indicator';
      typingDiv.innerHTML = `
        <div class="chat-avatar">🤖</div>
        <div class="chat-bubble">
          <div class="typing-indicator">
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
          </div>
        </div>
      `;
      
      messagesContainer.appendChild(typingDiv);
      this.scrollToBottom();
    },

    /**
     * Masquer l'indicateur de frappe
     */
    hideTypingIndicator: function() {
      const indicator = document.getElementById('typing-indicator');
      if (indicator) indicator.remove();
    },

    /**
     * Générer une réponse du bot
     */
    generateBotResponse: function(userMessage) {
      const lowerMessage = userMessage.toLowerCase();
      
      const responses = [
        {
          keywords: ['rendez-vous', 'rdv', 'randevou'],
          score: 0,
          response: 'Pour prendre rendez-vous, vous pouvez nous appeler au +509 3685-9684 ou remplir notre formulaire de contact. Préférez-vous être contacté par téléphone ou email ?'
        },
        {
          keywords: ['tarif', 'prix', 'coût', 'combien'],
          score: 0,
          response: 'Nos tarifs sont modulables selon les revenus des familles. Une consultation individuelle commence à partir de 500 HTG. Souhaitez-vous plus d\'informations sur nos différents services ?'
        },
        {
          keywords: ['horaire', 'heure', 'ouvert', 'fermé'],
          score: 0,
          response: 'Nous sommes ouverts du lundi au vendredi de 8h à 17h, et le samedi de 9h à 13h. Comment puis-je vous aider ?'
        },
        {
          keywords: ['service', 'offre'],
          score: 0,
          response: 'Nous offrons plusieurs services : soutien scolaire, consultation psychologique, accompagnement familial, orientation scolaire, et ateliers de groupe. Quel service vous intéresse ?'
        },
        {
          keywords: ['conseiller', 'humain'],
          score: 0,
          response: 'Je vais vous mettre en contact avec un de nos conseillers. En attendant, pouvez-vous me préciser votre demande ?'
        },
        {
          keywords: ['merci'],
          score: 0,
          response: 'Je vous en prie ! N\'hésitez pas si vous avez d\'autres questions. 😊'
        },
        {
          keywords: ['bonjour', 'salut'],
          score: 0,
          response: 'Bonjour ! Comment puis-je vous aider aujourd\'hui ? 😊'
        }
      ];
      
      // Calculer les scores
      responses.forEach(item => {
        item.keywords.forEach(keyword => {
          if (lowerMessage.includes(keyword)) {
            item.score++;
          }
        });
      });
      
      // Trouver la meilleure correspondance
      const bestMatch = responses.reduce((prev, current) => 
        (current.score > prev.score) ? current : prev
      );
      
      let response;
      if (bestMatch.score > 0) {
        response = bestMatch.response;
      } else {
        response = 'Je comprends votre question. Pour une réponse plus précise, je vous invite à nous contacter directement au +509 3685-9684 ou par email à educapsyhaiti@gmail.com. Puis-je vous aider avec autre chose ?';
      }
      
      this.addMessage(response, 'bot');
    },

    /**
     * Scroll vers le bas
     */
    scrollToBottom: function() {
      const messagesContainer = document.getElementById('chat-messages');
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    },

    /**
     * Sauvegarder un message
     */
    saveMessage: function(text, sender) {
      const message = {
        text: text,
        sender: sender,
        timestamp: Date.now()
      };
      
      this.messageHistory.push(message);
      
      try {
        localStorage.setItem('educapsy_chat_history', JSON.stringify(this.messageHistory.slice(-50)));
      } catch (e) {
        console.warn('Impossible de sauvegarder l\'historique:', e);
      }
    },

    /**
     * Charger l'historique
     */
    loadHistory: function() {
      try {
        const history = localStorage.getItem('educapsy_chat_history');
        if (history) {
          return JSON.parse(history).slice(-50);
        }
      } catch (e) {
        console.warn('Impossible de charger l\'historique:', e);
      }
      return [];
    },

    /**
     * Restaurer l'historique
     */
    restoreHistory: function() {
      const messagesContainer = document.getElementById('chat-messages');
      messagesContainer.innerHTML = '';
      
      this.messageHistory.forEach(msg => {
        this.addMessage(msg.text, msg.sender, false);
      });
    },

    /**
     * Afficher le badge de notification
     */
    showNotificationBadge: function() {
      const badge = document.querySelector('.chat-notification-badge');
      if (badge) {
        badge.style.display = 'flex';
      }
    },

    /**
     * Jouer un son de notification
     */
    playNotificationSound: function() {
      if (!this.config.sounds.enabled || !this.config.sounds.newMessage) return;
      
      try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 800;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
      } catch (e) {
        console.warn('Impossible de jouer le son:', e);
      }
    },

    /**
     * Mettre à jour le statut en ligne/hors ligne
     */
    updateStatus: function() {
      const statusElement = document.querySelector('.chat-status');
      const statusText = document.querySelector('.chat-status-text');
      
      if (!statusElement || !statusText) return;
      
      if (this.isAvailable()) {
        statusElement.classList.add('online');
        statusElement.classList.remove('offline');
        statusText.textContent = 'En ligne';
      } else {
        statusElement.classList.add('offline');
        statusElement.classList.remove('online');
        statusText.textContent = 'Hors ligne';
      }
      
      // Vérifier toutes les minutes
      setInterval(() => {
        this.updateStatus();
      }, 60000);
    },

    /**
     * Vérifier la disponibilité
     */
    isAvailable: function() {
      const now = new Date();
      const hour = now.getHours();
      const day = now.getDay();
      
      if (day === 0) return false; // Dimanche fermé
      
      if (day === 6) { // Samedi
        return hour >= 9 && hour < 13;
      }
      
      // Lundi-Vendredi
      return hour >= this.config.availableHours.start && 
             hour < this.config.availableHours.end;
    }
  };

  // Initialiser au chargement
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => LiveChat.init());
  } else {
    LiveChat.init();
  }

  // Exposer globalement
  window.EducaPsy = window.EducaPsy || {};
  window.EducaPsy.LiveChat = LiveChat;

})();
