// Sélection des éléments
const btnMenu = document.getElementById('btnMenu');
const menuPrincipal = document.getElementById('liens-deroulants');

// Gestion de l'ouverture du menu
btnMenu.addEventListener('click', (e) => {
    menuPrincipal.classList.toggle('voir');
    e.stopPropagation(); // Empêche la fermeture immédiate via le clic fenêtre
});

// Fermer le menu si on clique n'importe où ailleurs
window.addEventListener('click', () => {
    if (menuPrincipal.classList.contains('voir')) {
        menuPrincipal.classList.remove('voir');
    }
});
