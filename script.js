const btnMenu = document.getElementById('btnMenu');
const nav = document.getElementById('liens-deroulants');
const btnLangue = document.getElementById('btnLangue');
const menuLangue = document.getElementById('menuLangue');

// Toggle Menu Burger
btnMenu.onclick = (e) => {
    nav.classList.toggle('voir');
    menuLangue.classList.remove('active');
    e.stopPropagation();
};

// Toggle Langue
btnLangue.onclick = (e) => {
    menuLangue.classList.toggle('active');
    nav.classList.remove('voir');
    e.stopPropagation();
};

// Fermeture au clic extérieur
window.onclick = () => {
    nav.classList.remove('voir');
    menuLangue.classList.remove('active');
};
