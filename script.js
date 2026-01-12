const btnMenu = document.getElementById('btnMenu');
const menuPrincipal = document.getElementById('liens-deroulants');
const btnCompte = document.getElementById('btnCompte');
const menuCompte = document.getElementById('menu-compte');

// Menu Principal
btnMenu.onclick = (e) => {
    menuPrincipal.classList.toggle('voir');
    menuCompte.classList.remove('voir');
    e.stopPropagation();
};

// Menu Compte
btnCompte.onclick = (e) => {
    menuCompte.classList.toggle('voir');
    menuPrincipal.classList.remove('voir');
    e.stopPropagation();
};

// Fermeture au clic extérieur
window.onclick = () => {
    menuPrincipal.classList.remove('voir');
    menuCompte.classList.remove('voir');
};
