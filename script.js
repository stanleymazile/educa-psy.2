const btnMenu = document.getElementById('btnMenu');
const menu = document.getElementById('liens-deroulants');

btnMenu.onclick = function(e) {
    menu.classList.toggle('voir');
    e.stopPropagation();
}

window.onclick = function() {
    menu.classList.remove('voir');
}

// Détecte le changement dans votre menu et ordonne la traduction intégrale
document.getElementById('select-langue').addEventListener('change', function() {
    var lang = this.value;
    var googleCombo = document.querySelector('.goog-te-combo');
    
    if (googleCombo) {
        googleCombo.value = lang;
        googleCombo.dispatchEvent(new Event('change'));
    }
});






