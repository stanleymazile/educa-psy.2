const btnMenu = document.getElementById('btnMenu');
const menu = document.getElementById('liens-deroulants');

// Ouvrir/fermer le menu
btnMenu.onclick = function(e) {
    menu.classList.toggle('voir');
    e.stopPropagation();
};

// Fermer le menu si clic en dehors
document.addEventListener('click', function() {
    menu.classList.remove('voir');
});

// Gestion du bouton langue (sans Google Translate)
document.getElementById('select-langue').addEventListener('change', function() {
    var lang = this.value;
    console.log("Langue choisie :", lang);
    // Exemple : redirection vers une version traduite
    // window.location.href = lang + "/index.html";
});
