const btnMenu = document.getElementById('btnMenu');
const nav = document.getElementById('liens-deroulants');
const btnLangue = document.getElementById('btnLangue');
const menuLangue = document.getElementById('menuLangue');

btnMenu.onclick = (e) => {
    nav.classList.toggle('voir');
    menuLangue.classList.remove('active');
    e.stopPropagation();
};

btnLangue.onclick = (e) => {
    menuLangue.classList.toggle('active');
    nav.classList.remove('voir');
    e.stopPropagation();
};

window.onclick = () => {
    nav.classList.remove('voir');
    menuLangue.classList.remove('active');
};
