const btnMenu = document.getElementById('btnMenu');
const menuPrincipal = document.getElementById('liens-deroulants');
const btnCompte = document.getElementById('btnCompte');
const menuCompte = document.getElementById('menu-compte');

// Gestion Menu Principal
btnMenu.onclick = function(e) {
    menuPrincipal.classList.toggle('voir');
    menuCompte.classList.remove('voir'); // Ferme l'autre
    e.stopPropagation();
}

// Gestion Menu Compte
btnCompte.onclick = function(e) {
    menuCompte.classList.toggle('voir');
    menuPrincipal.classList.remove('voir'); // Ferme l'autre
    e.stopPropagation();
}

// Clic n'importe où pour fermer
window.onclick = function() {
    menuPrincipal.classList.remove('voir');
    menuCompte.classList.remove('voir');
}
