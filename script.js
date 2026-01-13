const btnMenu = document.getElementById('btnMenu');
const menuPrincipal = document.getElementById('liens-deroulants');
const barres = document.querySelectorAll('.barre');

btnMenu.addEventListener('click', (e) => {
    menuPrincipal.classList.toggle('voir');
    
    // Animation de l'icône à 3 barres
    if(menuPrincipal.classList.contains('voir')) {
        barres[0].style.transform = "translateY(5.5px) rotate(45deg)";
        barres[1].style.opacity = "0";
        barres[2].style.transform = "translateY(-5.5px) rotate(-45deg)";
    } else {
        barres[0].style.transform = "none";
        barres[1].style.opacity = "1";
        barres[2].style.transform = "none";
    }
    e.stopPropagation();
});

document.addEventListener('click', () => {
    menuPrincipal.classList.remove('voir');
    barres[0].style.transform = "none";
    barres[1].style.opacity = "1";
    barres[2].style.transform = "none";
});
