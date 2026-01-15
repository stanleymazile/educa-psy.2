// Système de Chat en Direct - chat.js
// À inclure dans toutes les pages avec <script src="chat.js"></script>

(function() {
  'use strict';

  const LiveChat = {
    config: {
      position: 'bottom-right', // 'bottom-right' ou 'bottom-left'
      theme: '#0066CC',
      autoOpen: false,
      showAfterSeconds: 30, // Afficher après 30 secondes
      availableHours: {
        start: 8, // 8h
        end: 17   // 17h
      }
    },

    init: function() {
      this.createChatWidget();
      this.setupEventListeners();
      
      // Affichage automatique après X secondes
      if (this.config.autoOpen) {
        setTimeout(() => {
          this.openChat();
        }, this.config.showAfterSeconds * 1000);
      }
    },

    createChatWidget: function() {
      // Bouton de chat
      const chatButton = document.createElement('div');
      chatButton.id = 'chat-button';
      chatButton.className = 'chat-button ' + this.config.position;
      chatButton.innerHTML = `
        <div class="chat-button-content">
          <span class="chat-icon">💬</span>
          <span class="chat-text">Besoin d'aide ?</span>
        </div>
        <div class="chat-notification-badge" style="display: none;">1</div>
      `;

      // Fenêtre de chat
      const chatWindow = document.createElement('div');
      chatWindow.id = 'chat-window';
      chatWindow.className = 'chat-window ' + this.config.position;
      chatWindow.style.display = 'none';
      chatWindow.innerHTML = `
        <div class="chat-header">
          <div class="chat-header-info">
            <div class="chat-status online"></div>
            <div>
              <h3>Educa-Psy</h3>
              <p class="chat-status-text">En ligne</p>
            </div>
          </div>
          <button id="chat-minimize" class="chat-btn-icon">—</button>
          <button id="chat-close" class="chat-btn-icon">×</button>
        </div>

        <div class="chat-messages" id="chat-messages">
          <div class="chat-message bot">
            <div class="chat-avatar">🤖</div>
            <div class="chat-bubble">
              <p>Bonjour ! 👋 Comment puis-je vous aider aujourd'hui ?</p>
              <span class="chat-time">${this.getCurrentTime()}</span>
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
          <button type="submit" class="chat-send-btn">
            <span class="send-icon">➤</span>
          </button>
        </form>
      `;

      // Styles
      const styles = document.createElement('style');
      styles.textContent = `
        /* Bouton de chat */
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

        .chat-button.bottom-right {
          right: 20px;
        }

        .chat-button.bottom-left {
          left: 20px;
        }

        .chat-button:hover {
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
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: bold;
        }

        /* Fenêtre de chat */
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
          display: flex;
          flex-direction: column;
          overflow: hidden;
          animation: slideUp 0.3s ease-out;
        }

        .chat-window.bottom-right {
          right: 20px;
        }

        .chat-window.bottom-left {
          left: 20px;
        }

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

        /* Header */
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

        .chat-btn-icon:hover {
          background: rgba(255, 255, 255, 0.2);
        }

        /* Messages */
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
        }

        .chat-time {
          font-size: 11px;
          opacity: 0.7;
          display: block;
          margin-top: 4px;
        }

        /* Réponses rapides */
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

        .quick-reply-btn:hover {
          background: ${this.config.theme};
          color: white;
        }

        /* Formulaire */
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

        .chat-send-btn:hover {
          transform: scale(1.1);
        }

        .send-icon {
          font-size: 16px;
        }

        /* Indicateur de frappe */
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

        /* Mobile */
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
      document.body.appendChild(chatButton);
      document.body.appendChild(chatWindow);
    },

    setupEventListeners: function() {
      const chatButton = document.getElementById('chat-button');
      const chatWindow = document.getElementById('chat-window');
      const chatClose = document.getElementById('chat-close');
      const chatMinimize = document.getElementById('chat-minimize');
      const chatForm = document.getElementById('chat-form');
      const quickReplies = document.querySelectorAll('.quick-reply-btn');

      // Ouvrir/fermer le chat
      chatButton.addEventListener('click', () => {
        this.openChat();
      });

      chatClose.addEventListener('click', () => {
        this.closeChat();
      });

      chatMinimize.addEventListener('click', () => {
        this.minimizeChat();
      });

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
    },

    openChat: function() {
      const chatButton = document.getElementById('chat-button');
      const chatWindow = document.getElementById('chat-window');
      
      chatButton.style.display = 'none';
      chatWindow.style.display = 'flex';
      
      // Focus sur l'input
      document.getElementById('chat-input').focus();
      
      // Marquer les notifications comme lues
      const badge = document.querySelector('.chat-notification-badge');
      if (badge) {
        badge.style.display = 'none';
      }
    },

    closeChat: function() {
      const chatButton = document.getElementById('chat-button');
      const chatWindow = document.getElementById('chat-window');
      
      chatWindow.style.display = 'none';
      chatButton.style.display = 'flex';
    },

    minimizeChat: function() {
      this.closeChat();
    },

    sendMessage: function() {
      const input = document.getElementById('chat-input');
      const message = input.value.trim();
      
      if (!message) return;
      
      // Afficher le message utilisateur
      this.addMessage(message, 'user');
      
      // Vider l'input
      input.value = '';
      
      // Afficher l'indicateur de frappe
      this.showTypingIndicator();
      
      // Simuler une réponse après 1-2 secondes
      setTimeout(() => {
        this.hideTypingIndicator();
        this.generateBotResponse(message);
      }, 1000 + Math.random() * 1000);
    },

    sendQuickReply: function(message) {
      this.addMessage(message, 'user');
      this.showTypingIndicator();
      
      setTimeout(() => {
        this.hideTypingIndicator();
        this.generateBotResponse(message);
      }, 1000);
    },

    addMessage: function(text, sender = 'bot') {
      const messagesContainer = document.getElementById('chat-messages');
      const messageDiv = document.createElement('div');
      messageDiv.className = `chat-message ${sender}`;
      
      const avatar = sender === 'user' ? '👤' : '🤖';
      
      messageDiv.innerHTML = `
        <div class="chat-avatar">${avatar}</div>
        <div class="chat-bubble">
          <p>${text}</p>
          <span class="chat-time">${this.getCurrentTime()}</span>
        </div>
      `;
      
      messagesContainer.appendChild(messageDiv);
      
      // Scroll vers le bas
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    },

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
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    },

    hideTypingIndicator: function() {
      const indicator = document.getElementById('typing-indicator');
      if (indicator) {
        indicator.remove();
      }
    },

    generateBotResponse: function(userMessage) {
      const lowerMessage = userMessage.toLowerCase();
      let response = '';
      
      // Réponses prédéfinies
      if (lowerMessage.includes('rendez-vous') || lowerMessage.includes('rdv')) {
        response = 'Pour prendre rendez-vous, vous pouvez nous appeler au +509 3685-9684 ou remplir notre formulaire de contact. Préférez-vous être contacté par téléphone ou email ?';
      } else if (lowerMessage.includes('tarif') || lowerMessage.includes('prix') || lowerMessage.includes('coût')) {
        response = 'Nos tarifs sont modulables selon les revenus des familles. Une consultation individuelle commence à partir de 500 HTG. Souhaitez-vous plus d\'informations sur nos différents services ?';
      } else if (lowerMessage.includes('horaire') || lowerMessage.includes('heure')) {
        response = 'Nous sommes ouverts du lundi au vendredi de 8h à 17h, et le samedi de 9h à 13h. Comment puis-je vous aider ?';
      } else if (lowerMessage.includes('service')) {
        response = 'Nous offrons plusieurs services : soutien scolaire, consultation psychologique, accompagnement familial, orientation scolaire, et ateliers de groupe. Quel service vous intéresse ?';
      } else if (lowerMessage.includes('conseiller') || lowerMessage.includes('humain')) {
        response = 'Je vais vous mettre en contact avec un de nos conseillers. Veuillez patienter un instant... En attendant, pouvez-vous me dire comment je peux vous aider ?';
      } else if (lowerMessage.includes('merci')) {
        response = 'Je vous en prie ! N\'hésitez pas si vous avez d\'autres questions. 😊';
      } else {
        response = 'Je comprends votre question. Pour une réponse plus précise, je vous invite à nous contacter directement au +509 3685-9684 ou par email à educapsyhaiti@gmail.com. Puis-je vous aider avec autre chose ?';
      }
      
      this.addMessage(response, 'bot');
    },

    getCurrentTime: function() {
      const now = new Date();
      return now.getHours().toString().padStart(2, '0') + ':' + 
             now.getMinutes().toString().padStart(2, '0');
    },

    isAvailable: function() {
      const now = new Date();
      const hour = now.getHours();
      const day = now.getDay();
      
      // Fermé le dimanche (0)
      if (day === 0) return false;
      
      // Samedi : 9h-13h
      if (day === 6) {
        return hour >= 9 && hour < 13;
      }
      
      // Lundi-Vendredi : 8h-17h
      return hour >= this.config.availableHours.start && 
             hour < this.config.availableHours.end;
    }
  };

  // Initialiser le chat au chargement de la page
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => LiveChat.init());
  } else {
    LiveChat.init();
  }

})();
