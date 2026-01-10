document.addEventListener('DOMContentLoaded', () => {
    initialiserComposants();
    activerAnimationsAuScroll();
});

function initialiserComposants() {
    // Menu Burger
    const btnMenu = document.getElementById('menu-btn');
    const nav = document.getElementById('main-nav');
    if (btnMenu) {
        btnMenu.onclick = (e) => {
            nav.classList.toggle('voir');
            e.stopPropagation();
        };
    }

    // Fermeture menu au clic extérieur
    window.onclick = () => { if (nav) nav.classList.remove('voir'); };
}

// ANIMATION DES CHIFFRES ET APPARITION DES SECTIONS
function activerAnimationsAuScroll() {
    const sections = document.querySelectorAll('.section-animate');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                
                // Si c'est la section impact, on anime les compteurs
                if (entry.target.id === 'impact-section') {
                    animerCompteurs();
                }
            }
        });
    }, { threshold: 0.2 });

    sections.forEach(section => observer.observe(section));
}

function animerCompteurs() {
    const compteurs = document.querySelectorAll('.stat-val');
    compteurs.forEach(compteur => {
        const cible = +compteur.getAttribute('data-target');
        const increment = cible / 100;
        
        const updateCompteur = () => {
            const valeurActuelle = +compteur.innerText;
            if (valeurActuelle < cible) {
                compteur.innerText = Math.ceil(valeurActuelle + increment);
                setTimeout(updateCompteur, 20);
            } else {
                compteur.innerText = cible + (cible > 100 ? "+" : "");
            }
        };
        updateCompteur();
    });
}
