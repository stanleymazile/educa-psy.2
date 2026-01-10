document.addEventListener('DOMContentLoaded', () => {
    // 1. Gestion du Menu Mobile
    const menuBtn = document.getElementById('menu-btn');
    const nav = document.getElementById('mobile-nav');

    if (menuBtn && nav) {
        menuBtn.addEventListener('click', (e) => {
            nav.classList.toggle('active');
            e.stopPropagation();
        });
    }

    // Fermer le menu si on clique ailleurs sur la page
    document.addEventListener('click', () => {
        if (nav) nav.classList.remove('active');
    });

    // 2. Animation des compteurs (Chiffres)
    const counters = document.querySelectorAll('.stat-number');
    
    const animateCounters = () => {
        counters.forEach(counter => {
            const target = +counter.getAttribute('data-target');
            const speed = 100; // Plus c'est haut, plus c'est lent
            
            const updateCount = () => {
                const count = +counter.innerText;
                const inc = target / speed;

                if (count < target) {
                    counter.innerText = Math.ceil(count + inc);
                    setTimeout(updateCount, 15);
                } else {
                    counter.innerText = target + "+";
                }
            };
            updateCount();
        });
    };

    // Déclencher l'animation quand on arrive sur la section (Optionnel simple)
    animateCounters();
});
