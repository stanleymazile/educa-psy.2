/**
 * Initialise toutes les fonctionnalités du site une fois que le HTML est chargé.
 */
function initialiserSite() {
    // Récupération des éléments du Header
    const btnMenu = document.getElementById('btnMenu');
    const menu = document.getElementById('liens-deroulants');
    const selectLangue = document.getElementById('select-langue');
    const btnChercher = document.getElementById('btnChercher');
    const inputRecherche = document.getElementById('recherche');

    // --- 1. GESTION DU MENU DÉROULANT ---
    if (btnMenu && menu) {
        btnMenu.onclick = function(e) {
            menu.classList.toggle('voir');
            // Empêche le clic de se propager à la fenêtre (évite la fermeture immédiate)
            e.stopPropagation();
        };
    }

    // --- 2. GESTION DE LA TRADUCTION GOOGLE ---
    if (selectLangue) {
        selectLangue.addEventListener('change', function() {
            const langueChoisie = this.value;
            const googleCombo = document.querySelector('.goog-te-combo');
            
            if (googleCombo) {
                googleCombo.value = langueChoisie;
                // Déclenche l'événement de changement pour que Google traduise
                googleCombo.dispatchEvent(new Event('change'));
            } else {
                console.warn("Le moteur de traduction Google n'est pas encore prêt.");
            }
        });
    }

    // --- 3. GESTION DE LA RECHERCHE (Préparation) ---
    if (btnChercher && inputRecherche) {
        btnChercher.onclick = function() {
            const motCle = inputRecherche.value.trim();
            if (motCle !== "") {
                alert("Recherche en cours pour : " + motCle);
                // Ici, nous pourrons ajouter la logique de filtrage plus tard
            }
        };
    }
}

/**
 * Fermeture globale du menu si l'utilisateur clique en dehors.
 */
window.onclick = function() {
    const menu = document.getElementById('liens-deroulants');
    if (menu && menu.classList.contains('voir')) {
        menu.classList.remove('voir');
    }
};

// Lancement sécurisé du script
document.addEventListener('DOMContentLoaded', initialiserSite);


// Force la suppression de l'espace blanc en haut du site
document.body.style.top = "0px";

// Supprime l'élément de la barre Google s'il existe
const googleBarre = document.querySelector('.goog-te-banner-frame');
if (googleBarre) {
    googleBarre.style.display = 'none';
}

