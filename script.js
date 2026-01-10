document.addEventListener('DOMContentLoaded', () => {
    // 1. GESTION LANGUE
    const langBtn = document.getElementById('lang-btn');
    const langList = document.getElementById('lang-list');
    langBtn.onclick = (e) => { langList.classList.toggle('show'); e.stopPropagation(); };

    langList.querySelectorAll('a').forEach(a => {
        a.onclick = (e) => {
            document.getElementById('current-flag').innerText = a.dataset.flag;
            document.getElementById('current-text').innerText = a.dataset.lang.toUpperCase();
            langList.classList.remove('show');
        };
    });

    // 2. CHIFFRES ANIMÉS
    const stats = document.querySelectorAll('.stat-number');
    stats.forEach(s => {
        const target = +s.dataset.target;
        let count = 0;
        const update = () => {
            if(count < target) { count += target/50; s.innerText = Math.ceil(count); setTimeout(update, 30); }
            else { s.innerText = target + "+"; }
        };
        update();
    });

    // 3. MENU MOBILE
    document.getElementById('menu-btn').onclick = (e) => {
        document.getElementById('mobile-nav').classList.toggle('active');
        e.stopPropagation();
    };

    window.onclick = () => { langList.classList.remove('show'); };
});
