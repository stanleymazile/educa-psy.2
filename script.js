const btnMenu = document.getElementById('btnMenu');
const menuPrincipal = document.getElementById('liens-deroulants');
const barres = document.querySelectorAll('.barre');

btnMenu.addEventListener('click', (e) => {
    menuPrincipal.classList.toggle('voir');
    if(menuPrincipal.classList.contains('voir')) {
        barres[0].style.transform = "rotate(45deg) translateY(4px)";
        barres[1].style.transform = "rotate(-45deg) translateY(-4px)";
    } else {
        barres[0].style.transform = "none";
        barres[1].style.transform = "none";
    }
    e.stopPropagation();
});

document.addEventListener('click', () => {
    menuPrincipal.classList.remove('voir');
    barres.forEach(b => b.style.transform = "none");
});
