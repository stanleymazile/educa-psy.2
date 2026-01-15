// Gestion de la page Don
document.addEventListener('DOMContentLoaded', function() {
  
  // Gestion des boutons de montant prédéfini
  const btnsMontant = document.querySelectorAll('.btn-montant');
  const inputMontant = document.getElementById('montantPersonnalise');
  
  if (btnsMontant && inputMontant) {
    btnsMontant.forEach(btn => {
      btn.addEventListener('click', function() {
        // Retirer la classe active de tous les boutons
        btnsMontant.forEach(b => b.classList.remove('active'));
        
        // Ajouter la classe active au bouton cliqué
        this.classList.add('active');
        
        // Mettre à jour le champ de montant
        const montant = this.getAttribute('data-montant');
        inputMontant.value = montant;
      });
    });
    
    // Si l'utilisateur tape un montant personnalisé, retirer la sélection des boutons
    inputMontant.addEventListener('input', function() {
      btnsMontant.forEach(b => b.classList.remove('active'));
    });
  }
  
  // Gestion du formulaire de don
  const donForm = document.getElementById('donForm');
  
  if (donForm) {
    donForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      // Récupérer les données du formulaire
      const formData = new FormData(donForm);
      const montant = formData.get('montant');
      const nom = formData.get('nom');
      const email = formData.get('email');
      const typeDon = formData.get('typeDon');
      const modePaiement = formData.get('modePaiement');
      const affectation = formData.get('affectation');
      
      // Validation
      if (!montant || montant < 100) {
        alert('Le montant minimum est de 100 HTG');
        return;
      }
      
      if (!nom || !email) {
        alert('Veuillez remplir tous les champs obligatoires');
        return;
      }
      
      // Afficher un message de confirmation
      const confirmMessage = `
        Merci ${nom} !
        
        Vous êtes sur le point de faire un don de ${parseInt(montant).toLocaleString()} HTG
        Type : ${typeDon === 'unique' ? 'Don unique' : 'Don mensuel'}
        Mode de paiement : ${getPaymentMethodName(modePaiement)}
        
        Vous allez être redirigé vers la plateforme de paiement.
      `;
      
      if (confirm(confirmMessage)) {
        // Dans un vrai site, on redirigerait vers la plateforme de paiement
        // Pour l'instant, on simule un succès
        
        // Créer un objet de don
        const donData = {
          montant: montant,
          nom: nom,
          email: email,
          telephone: formData.get('telephone'),
          typeDon: typeDon,
          modePaiement: modePaiement,
          affectation: affectation,
          anonyme: formData.get('anonyme') === 'on',
          newsletter: formData.get('newsletter') === 'on',
          date: new Date().toISOString()
        };
        
        console.log('Don enregistré:', donData);
        
        // Simuler le processus de paiement
        simulerPaiement(modePaiement, donData);
      }
    });
  }
  
  // Fonction pour simuler le paiement
  function simulerPaiement(modePaiement, donData) {
    // Afficher un message de traitement
    const overlay = document.createElement('div');
    overlay.className = 'payment-overlay';
    overlay.innerHTML = `
      <div class="payment-modal">
        <div class="payment-loader"></div>
        <h3>Traitement en cours...</h3>
        <p>Vous allez être redirigé vers ${getPaymentMethodName(modePaiement)}</p>
      </div>
    `;
    document.body.appendChild(overlay);
    
    // Simuler un délai de traitement
    setTimeout(() => {
      overlay.remove();
      
      // Afficher la page de confirmation
      afficherConfirmation(donData);
    }, 2000);
  }
  
  // Fonction pour afficher la confirmation
  function afficherConfirmation(donData) {
    const confirmationHTML = `
      <div class="confirmation-overlay">
        <div class="confirmation-modal">
          <div class="confirmation-icon">✅</div>
          <h2>Don effectué avec succès !</h2>
          <p>Merci ${donData.nom} pour votre générosité !</p>
          
          <div class="confirmation-details">
            <p><strong>Montant :</strong> ${parseInt(donData.montant).toLocaleString()} HTG</p>
            <p><strong>Type :</strong> ${donData.typeDon === 'unique' ? 'Don unique' : 'Don mensuel'}</p>
            <p><strong>Affectation :</strong> ${getAffectationName(donData.affectation)}</p>
          </div>
          
          <p class="confirmation-email">Un reçu a été envoyé à : <strong>${donData.email}</strong></p>
          
          <div class="confirmation-actions">
            <button onclick="window.location.href='index.html'" class="btn-primary">Retour à l'accueil</button>
            <button onclick="window.location.reload()" class="btn-secondary">Faire un autre don</button>
          </div>
        </div>
      </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', confirmationHTML);
  }
  
  // Fonctions utilitaires
  function getPaymentMethodName(method) {
    const methods = {
      'moncash': 'MonCash',
      'natcash': 'NatCash',
      'paypal': 'PayPal',
      'virement': 'Virement bancaire'
    };
    return methods[method] || method;
  }
  
  function getAffectationName(affectation) {
    const affectations = {
      'general': 'Là où le besoin est le plus grand',
      'soutien-scolaire': 'Soutien scolaire',
      'psychologie': 'Services psychologiques',
      'materiel': 'Matériel scolaire',
      'formation': 'Formation des enseignants'
    };
    return affectations[affectation] || affectation;
  }
});
