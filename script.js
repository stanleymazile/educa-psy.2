document.addEventListener('DOMContentLoaded', () => {
    // MENU MOBILE
    const menuBtn = document.getElementById('menu-btn');
    const nav = document.getElementById('mobile-nav');
    menuBtn.onclick = (e) => { nav.classList.toggle('active'); e.stopPropagation(); };

    // LANGUE
    const langBtn = document.getElementById('lang-btn');
    const langList = document.getElementById('lang-list');
    langBtn.onclick = (e) => { langList.classList.toggle('show'); e.stopPropagation(); };
    
    langList.querySelectorAll('a').forEach(a => {
        a.onclick = () => {
            document.getElementById('current-flag').innerText = a.dataset.flag;
            document.getElementById('current-text').innerText = a.dataset.lang.toUpperCase();
            langList.classList.remove('show');
        };
    });

    // CHIFFRES ANIMÉS
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

    // CARROUSEL
    const track = document.getElementById('carouselTrack');
    const next = document.getElementById('nextBtn');
    const prev = document.getElementById('prevBtn');
    let idx = 0;

    next.onclick = () => {
        const items = track.children.length;
        const visible = window.innerWidth > 768 ? 2 : 1;
        if(idx < items - visible) idx++; else idx = 0;
        track.style.transform = `translateX(${-idx * (100/visible)}%)`;
    };

    window.onclick = () => { langList.classList.remove('show'); nav.classList.remove('active'); };
});
