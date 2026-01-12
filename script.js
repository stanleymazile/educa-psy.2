const btnMenu = document.getElementById('btnMenu');
const menu = document.getElementById('liens-deroulants');

btnMenu.onclick = function(e) {
    menu.classList.toggle('voir');
    e.stopPropagation();
}

window.onclick = function() {
    menu.classList.remove('voir');
}
