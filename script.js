Document.addEventListener('DOMContentLoaded', () => {
    // MENU & LANGUE
    const menuBtn = document.getElementById('menu-btn');
    const nav = document.getElementById('mobile-nav');
    const langBtn = document.getElementById('lang-btn');
    const langList = document.getElementById('lang-list');

    menuBtn.onclick = (e) => { nav.classList.toggle('active'); e.stopPropagation(); };
    langBtn.onclick = (e) => { langList.classList.toggle('show'); e.stopPropagation(); };

    langList.querySelectorAll('a').forEach(a => {
        a.onclick = (e) => {
            e.preventDefault();
            document.getElementById('current-flag').innerText = a.dataset.flag;
            langList.classList.remove('show');
        };
    });

    // STATS ANIMÉES
    const stats = document.querySelectorAll('.stat-number');
    const animateStats = () => {
        stats.forEach(s => {
            const target = +s.dataset.target;
            let count = 0;
            const update = () => {
                if(count < target) {
                    count += target/50;
                    s.innerText = Math.ceil(count);
                    setTimeout(update, 30);
                } else { s.innerText = target + "+"; }
            };
            update();
        });
    };
    
    // Intersection Observer pour lancer l'animation au défilement
    const observer = new IntersectionObserver((entries) => {
        if(entries[0].isIntersecting) animateStats();
    }, { threshold: 0.5 });
    if(stats.length > 0) observer.observe(document.querySelector('.stats-section'));

    // CARROUSEL
    const track = document.getElementById('carouselTrack');
    const nextBtn = document.getElementById('nextBtn');
    const prevBtn = document.getElementById('prevBtn');
    const dotsContainer = document.getElementById('carouselDots');
    let currentIndex = 0;
    const items = track.children.length;

    const updateCarousel = () => {
        const visible = window.innerWidth > 768 ? 2 : 1;
        track.style.transform = `translateX(-${currentIndex * (100 / visible)}%)`;
        updateDots();
    };

    const createDots = () => {
        dotsContainer.innerHTML = '';
        const visible = window.innerWidth > 768 ? 2 : 1;
        for(let i=0; i < (items - visible + 1); i++) {
            const dot = document.createElement('div');
            dot.classList.add('dot');
            if(i === 0) dot.classList.add('active');
            dot.onclick = () => { currentIndex = i; updateCarousel(); };
            dotsContainer.appendChild(dot);
        }
    };

    const updateDots = () => {
        const dots = document.querySelectorAll('.dot');
        dots.forEach((d, i) => d.classList.toggle('active', i === currentIndex));
    };

    if(nextBtn) {
        nextBtn.onclick = () => {
            const visible = window.innerWidth > 768 ? 2 : 1;
            if(currentIndex < items - visible) currentIndex++; else currentIndex = 0;
            updateCarousel();
        };
    }

    createDots();
    window.onclick = () => { langList.classList.remove('show'); nav.classList.remove('active'); };
});
