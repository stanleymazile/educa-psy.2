const btnMenu = document.getElementById('btnMenu');
const menuPrincipal = document.getElementById('liens-deroulants');

// Toggle Menu
btnMenu.addEventListener('click', (e) => {
    menuPrincipal.classList.toggle('voir');
    e.stopPropagation();
});

// Fermer au clic extérieur
window.addEventListener('click', () => {
    if (menuPrincipal.classList.contains('voir')) {
        menuPrincipal.classList.remove('voir');
    }
});
