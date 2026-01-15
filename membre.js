// JavaScript Espace Membre - membre.js

document.addEventListener('DOMContentLoaded', function() {

  // Éléments du DOM
  const loginSection = document.getElementById('login-section');
  const registerSection = document.getElementById('register-section');
  const memberSpace = document.getElementById('member-space');
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  const showRegisterLink = document.getElementById('showRegisterLink');
  const showLoginLink = document.getElementById('showLoginLink');
  const logoutBtn = document.getElementById('logoutBtn');
  const forgotPasswordLink = document.getElementById('forgotPasswordLink');

  // Vérifier si l'utilisateur est déjà connecté
  checkLoginStatus();

  // Navigation entre connexion et inscription
  if (showRegisterLink) {
    showRegisterLink.addEventListener('click', function(e) {
      e.preventDefault();
      loginSection.style.display = 'none';
      registerSection.style.display = 'block';
    });
  }

  if (showLoginLink) {
    showLoginLink.addEventListener('click', function(e) {
      e.preventDefault();
      registerSection.style.display = 'none';
      loginSection.style.display = 'block';
    });
  }

  // Formulaire de connexion
  if (loginForm) {
    loginForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const email = document.getElementById('loginEmail').value;
      const password = document.getElementById('loginPassword').value;
      const remember = document.getElementById('rememberMe').checked;
      
      // Simulation de connexion (à remplacer par une vraie API)
      // Dans un vrai système, vous enverriez les données à votre backend
      if (email && password) {
        // Simuler un délai de connexion
        const loadingBtn = this.querySelector('button[type="submit"]');
        const originalText = loadingBtn.textContent;
        loadingBtn.textContent = 'Connexion en cours...';
        loadingBtn.disabled = true;
        
        setTimeout(() => {
          // Stocker les informations de session
          const userData = {
            email: email,
            name: 'Jean Dupont', // Simulé
            loggedIn: true,
            loginTime: new Date().toISOString()
          };
          
          sessionStorage.setItem('userData', JSON.stringify(userData));
          if (remember) {
            localStorage.setItem('userData', JSON.stringify(userData));
          }
          
          // Afficher l'espace membre
          showMemberSpace(userData);
          
          // Afficher un message de succès
          showNotification('Connexion réussie ! Bienvenue ' + userData.name, 'success');
        }, 1000);
      }
    });
  }

  // Formulaire d'inscription
  if (registerForm) {
    registerForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const nom = document.getElementById('registerNom').value;
      const email = document.getElementById('registerEmail').value;
      const telephone = document.getElementById('registerTelephone').value;
      const password = document.getElementById('registerPassword').value;
      const passwordConfirm = document.getElementById('registerPasswordConfirm').value;
      const acceptTerms = document.getElementById('acceptTerms').checked;
      
      // Validation
      if (password !== passwordConfirm) {
        showNotification('Les mots de passe ne correspondent pas', 'error');
        return;
      }
      
      if (password.length < 8) {
        showNotification('Le mot de passe doit contenir au moins 8 caractères', 'error');
        return;
      }
      
      if (!acceptTerms) {
        showNotification('Vous devez accepter les conditions d\'utilisation', 'error');
        return;
      }
      
      // Simulation d'inscription
      const loadingBtn = this.querySelector('button[type="submit"]');
      const originalText = loadingBtn.textContent;
      loadingBtn.textContent = 'Création du compte...';
      loadingBtn.disabled = true;
      
      setTimeout(() => {
        // Créer le compte (simulation)
        const userData = {
          email: email,
          name: nom,
          telephone: telephone,
          loggedIn: true,
          loginTime: new Date().toISOString()
        };
        
        sessionStorage.setItem('userData', JSON.stringify(userData));
        
        // Afficher l'espace membre
        showMemberSpace(userData);
        
        // Message de bienvenue
        showNotification('Compte créé avec succès ! Bienvenue ' + userData.name, 'success');
      }, 1500);
    });
  }

  // Bouton de déconnexion
  if (logoutBtn) {
    logoutBtn.addEventListener('click', function() {
      if (confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
        logout();
      }
    });
  }

  // Mot de passe oublié
  if (forgotPasswordLink) {
    forgotPasswordLink.addEventListener('click', function(e) {
      e.preventDefault();
      const email = prompt('Entrez votre adresse email pour réinitialiser votre mot de passe :');
      
      if (email) {
        showNotification('Un email de réinitialisation a été envoyé à ' + email, 'success');
      }
    });
  }

  // Navigation entre onglets
  const memberTabs = document.querySelectorAll('.member-tab');
  const tabContents = document.querySelectorAll('.tab-content');
  
  memberTabs.forEach(tab => {
    tab.addEventListener('click', function() {
      const tabName = this.getAttribute('data-tab');
      
      // Retirer la classe active de tous les onglets
      memberTabs.forEach(t => t.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));
      
      // Ajouter la classe active
      this.classList.add('active');
      document.getElementById('tab-' + tabName).classList.add('active');
    });
  });

  // Téléchargement de documents (simulation)
  const downloadBtns = document.querySelectorAll('.btn-download');
  downloadBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      const documentName = this.closest('.document-item').querySelector('h4').textContent;
      showNotification('Téléchargement de "' + documentName + '" en cours...', 'info');
      
      // Dans un vrai système, vous déclencheriez ici le téléchargement réel
      setTimeout(() => {
        showNotification('Document téléchargé avec succès !', 'success');
      }, 1500);
    });
  });

  // Formulaire de profil
  const profileForm = document.getElementById('profileForm');
  if (profileForm) {
    profileForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const newPassword = document.getElementById('newPassword').value;
      const confirmNewPassword = document.getElementById('confirmNewPassword').value;
      
      if (newPassword && newPassword !== confirmNewPassword) {
        showNotification('Les nouveaux mots de passe ne correspondent pas', 'error');
        return;
      }
      
      // Sauvegarder les modifications
      showNotification('Profil mis à jour avec succès !', 'success');
      
      // Mettre à jour les données utilisateur
      const userData = JSON.parse(sessionStorage.getItem('userData') || '{}');
      userData.name = document.getElementById('profileNom').value;
      userData.email = document.getElementById('profileEmail').value;
      sessionStorage.setItem('userData', JSON.stringify(userData));
      
      // Mettre à jour le nom affiché
      document.getElementById('memberName').textContent = userData.name;
    });
  }

  // Fonctions utilitaires
  function checkLoginStatus() {
    // Vérifier si l'utilisateur est connecté
    let userData = JSON.parse(sessionStorage.getItem('userData') || 'null');
    
    // Si pas en session, vérifier en localStorage (si "se souvenir de moi")
    if (!userData) {
      userData = JSON.parse(localStorage.getItem('userData') || 'null');
      if (userData) {
        sessionStorage.setItem('userData', JSON.stringify(userData));
      }
    }
    
    if (userData && userData.loggedIn) {
      showMemberSpace(userData);
    }
  }

  function showMemberSpace(userData) {
    // Cacher les formulaires de connexion/inscription
    if (loginSection) loginSection.style.display = 'none';
    if (registerSection) registerSection.style.display = 'none';
    
    // Afficher l'espace membre
    if (memberSpace) {
      memberSpace.style.display = 'block';
      
      // Mettre à jour le nom
      const memberNameEl = document.getElementById('memberName');
      if (memberNameEl) {
        memberNameEl.textContent = userData.name;
      }
    }
  }

  function logout() {
    // Supprimer les données de session
    sessionStorage.removeItem('userData');
    localStorage.removeItem('userData');
    
    // Recharger la page
    window.location.reload();
  }

  function showNotification(message, type = 'info') {
    // Créer une notification
    const notification = document.createElement('div');
    notification.className = 'notification notification-' + type;
    notification.textContent = message;
    
    // Styles
    notification.style.cssText = `
      position: fixed;
      top: 100px;
      right: 20px;
      padding: 16px 24px;
      background-color: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#0066CC'};
      color: white;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
      z-index: 10000;
      animation: slideInRight 0.3s ease-out;
      max-width: 400px;
    `;
    
    document.body.appendChild(notification);
    
    // Retirer après 4 secondes
    setTimeout(() => {
      notification.style.animation = 'slideOutRight 0.3s ease-out';
      setTimeout(() => notification.remove(), 300);
    }, 4000);
  }

  // Ajouter les animations CSS
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideInRight {
      from {
        transform: translateX(400px);
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
        transform: translateX(400px);
        opacity: 0;
      }
    }
  `;
  document.head.appendChild(style);

});
