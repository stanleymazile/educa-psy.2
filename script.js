const btnMenu = document.getElementById('btnMenu');
const menuNav = document.getElementById('liens-deroulants');

// Gérer l'ouverture/fermeture du menu mobile
if (btnMenu && menuNav) {
    btnMenu.onclick = function(e) {
        menuNav.classList.toggle('voir');
        e.stopPropagation();
    };
}

// Fermer le menu si l'utilisateur clique en dehors
window.onclick = function() {
    if (menuNav && menuNav.classList.contains('voir')) {
        menuNav.classList.remove('voir');
    }
};
