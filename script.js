const btnMenu = document.getElementById('btnMenu');
const menuPrincipal = document.getElementById('liens-deroulants');
const barres = document.querySelectorAll('.barre');

// Toggle Menu avec animation de l'icône
btnMenu.addEventListener('click', (e) => {
    menuPrincipal.classList.toggle('voir');
    
    if(menuPrincipal.classList.contains('voir')) {
        barres[0].style.transform = "translateY(2.5px) rotate(45deg)";
        barres[1].style.transform = "translateY(-2.5px) rotate(-45deg)";
    } else {
        barres[0].style.transform = "none";
        barres[1].style.transform = "none";
    }
    e.stopPropagation();
});

// Fermer le menu si on clique ailleurs
document.addEventListener('click', () => {
    menuPrincipal.classList.remove('voir');
    barres.forEach(b => b.style.transform = "none");
});
