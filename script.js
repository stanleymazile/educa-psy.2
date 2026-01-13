const btnMenu = document.getElementById('btnMenu');
const menuPrincipal = document.getElementById('liens-deroulants');

// Toggle l'affichage du menu
btnMenu.addEventListener('click', (e) => {
    menuPrincipal.classList.toggle('voir');
    e.stopPropagation();
});

// Fermer le menu si on clique en dehors
window.addEventListener('click', () => {
    if (menuPrincipal.classList.contains('voir')) {
        menuPrincipal.classList.remove('voir');
    }
});
