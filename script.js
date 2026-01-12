// Gestion du Menu Principal
const btnMenu = document.getElementById('btnMenu');
const menuPrincipal = document.getElementById('liens-deroulants');

btnMenu.onclick = function(e) {
    menuPrincipal.classList.toggle('voir');
    menuCompte.classList.remove('voir'); // Ferme l'autre menu
    e.stopPropagation();
}

// Gestion du Menu Compte
const btnCompte = document.getElementById('btnCompte');
const menuCompte = document.getElementById('menu-compte');

btnCompte.onclick = function(e) {
    menuCompte.classList.toggle('voir');
    menuPrincipal.classList.remove('voir'); // Ferme l'autre menu
    e.stopPropagation();
}

// Fermeture au clic n'importe où
window.onclick = function() {
    menuPrincipal.classList.remove('voir');
    menuCompte.classList.remove('voir');
}
