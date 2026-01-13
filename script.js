const btnMenu = document.getElementById('btnMenu');
const nav = document.getElementById('liens-deroulants');
const btnLangue = document.getElementById('btnLangue');
const menuLangue = document.getElementById('menuLangue');

// Gestion du menu burger mobile
if (btnMenu && nav) {
    btnMenu.onclick = function(e) {
        nav.classList.toggle('voir');
        if (menuLangue) menuLangue.classList.remove('active');
        e.stopPropagation();
    };
}

// Gestion du bouton de langue
if (btnLangue && menuLangue) {
    btnLangue.onclick = function(e) {
        menuLangue.classList.toggle('active');
        if (nav) nav.classList.remove('voir');
        e.stopPropagation();
    };
}

// Fermeture globale au clic n'importe où ailleurs
window.onclick = function() {
    if (nav) nav.classList.remove('voir');
    if (menuLangue) menuLangue.classList.remove('active');
};
