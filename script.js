// Éléments
const btnMenu = document.getElementById('btnMenu');
const menuNav = document.getElementById('liens-deroulants');
const btnLangue = document.getElementById('btnLangue');
const optionsLangue = document.getElementById('langueOptions');

// Menu Mobile
btnMenu.onclick = function(e) {
    menuNav.classList.toggle('voir');
    e.stopPropagation();
}

// Menu Langue
btnLangue.onclick = function(e) {
    optionsLangue.classList.toggle('active');
    e.stopPropagation();
}

// Fermeture des menus au clic extérieur
window.onclick = function() {
    menuNav.classList.remove('voir');
    optionsLangue.classList.remove('active');
}
