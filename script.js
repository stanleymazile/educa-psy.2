const btnMenu = document.getElementById('btnMenu');
const menuPrincipal = document.getElementById('liens-deroulants');
const barres = document.querySelectorAll('.barre');

// Toggle Menu avec animation Hamburger
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

// Fermer au clic extérieur
document.addEventListener('click', () => {
    menuPrincipal.classList.remove('voir');
    barres.forEach(b => b.style.transform = "none");
});

// Parallaxe léger sur le Hero au scroll
window.addEventListener('scroll', () => {
    const hero = document.getElementById('hero');
    let offset = window.pageYOffset;
    if (window.innerWidth > 768) {
        hero.style.backgroundPositionY = offset * 0.4 + "px";
    }
});
