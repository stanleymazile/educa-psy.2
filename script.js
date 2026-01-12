const btnMenu = document.getElementById('btnMenu');
const menu = document.getElementById('liens-deroulants');

// Ouverture/Fermeture du menu au clic sur le bouton
btnMenu.onclick = function(e) {
    menu.classList.toggle('voir');
    e.stopPropagation();
}

// Fermeture automatique si on clique n'importe où ailleurs sur la page
window.onclick = function() {
    if (menu.classList.contains('voir')) {
        menu.classList.remove('voir');
    }
}
