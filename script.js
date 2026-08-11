/* ═══════════════════════════════════════════════ */
/* EDUCA-PSY ULTRA — Toutes les fonctionnalités   */
/* Dark mode | Drawer | Search | Pagination       */
/* ═══════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', function() {
    
    // ═══════════════════════════════════════
    // DARK MODE (avec localStorage)
    // ═══════════════════════════════════════
    window.toggleDark = function() {
        const body = document.body;
        const icon = document.getElementById('dark-icon');
        if (body.classList.contains('dark')) {
            body.classList.remove('dark');
            icon.textContent = '🌙';
            localStorage.setItem('educa-theme', 'light');
        } else {
            body.classList.add('dark');
            icon.textContent = '☀️';
            localStorage.setItem('educa-theme', 'dark');
        }
    };
    
    // Init dark mode
    const savedTheme = localStorage.getItem('educa-theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
        document.body.classList.add('dark');
        const icon = document.getElementById('dark-icon');
        if (icon) icon.textContent = '☀️';
    }

    // ═══════════════════════════════════════
    // DRAWER MOBILE MODERNE
    // ═══════════════════════════════════════
    window.toggleDrawer = function() {
        const drawer = document.getElementById('drawer');
        const overlay = document.getElementById('drawer-overlay');
        const bar1 = document.getElementById('bar1');
        const bar2 = document.getElementById('bar2');
        const bar3 = document.getElementById('bar3');
        
        if (!drawer.classList.contains('open')) {
            drawer.classList.add('open');
            overlay.classList.remove('hidden');
            document.body.style.overflow = 'hidden';
            // Morph to X
            bar1.style.transform = 'rotate(45deg) translate(5px, 5px)';
            bar2.style.opacity = '0';
            bar3.style.transform = 'rotate(-45deg) translate(5px, -5px)';
        } else {
            closeDrawer();
        }
    };
    
    window.closeDrawer = function() {
        const drawer = document.getElementById('drawer');
        const overlay = document.getElementById('drawer-overlay');
        const bar1 = document.getElementById('bar1');
        const bar2 = document.getElementById('bar2');
        const bar3 = document.getElementById('bar3');
        
        drawer.classList.remove('open');
        overlay.classList.add('hidden');
        document.body.style.overflow = '';
        // Reset hamburger
        bar1.style.transform = '';
        bar2.style.opacity = '1';
        bar3.style.transform = '';
    };

    // ═══════════════════════════════════════
    // ARTICLES : FILTRE + RECHERCHE + PAGINATION
    // ═══════════════════════════════════════
    let currentCat = 'education';
    let currentPage = 1;
    const itemsPerPage = 3;

    const filterBtns = document.querySelectorAll('.filter-btn');
    const articles = document.querySelectorAll('.article-card');

    // Init
    showCategory('education');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const category = this.dataset.cat;
            currentCat = category;
            currentPage = 1;
            
            filterBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            applyArticleFilters();
        });
    });

    window.searchArticles = function() {
        currentPage = 1;
        applyArticleFilters();
    };

    function applyArticleFilters() {
        const search = document.getElementById('article-search').value.toLowerCase().trim();
        let visible = [];
        
        articles.forEach(article => {
            const matchesCat = article.dataset.category === currentCat;
            const matchesSearch = !search || article.dataset.title.includes(search);
            
            if (matchesCat && matchesSearch) {
                visible.push(article);
            }
        });
        
        // Pagination
        const totalPages = Math.max(1, Math.ceil(visible.length / itemsPerPage));
        if (currentPage > totalPages) currentPage = totalPages;
        
        articles.forEach(article => {
            article.classList.remove('active');
            article.style.display = 'none';
        });
        
        const start = (currentPage - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        
        visible.slice(start, end).forEach(article => {
            article.classList.add('active');
            article.style.display = 'block';
        });
        
        renderPagination(totalPages);
    }

    function renderPagination(total) {
        const container = document.getElementById('page-numbers');
        if (!container) return;
        container.innerHTML = '';
        
        for (let i = 1; i <= total; i++) {
            const btn = document.createElement('button');
            btn.className = `page-btn ${i === currentPage ? 'page-active' : ''}`;
            btn.textContent = i;
            btn.onclick = () => { 
                currentPage = i; 
                applyArticleFilters(); 
                document.getElementById('categories').scrollIntoView({ behavior: 'smooth', block: 'start' });
            };
            container.appendChild(btn);
        }
    }

    window.changePage = function(dir) {
        const search = document.getElementById('article-search').value.toLowerCase().trim();
        let visible = [];
        
        articles.forEach(article => {
            if (article.dataset.category === currentCat && (!search || article.dataset.title.includes(search))) {
                visible.push(article);
            }
        });
        
        const total = Math.max(1, Math.ceil(visible.length / itemsPerPage));
        currentPage += dir;
        if (currentPage < 1) currentPage = 1;
        if (currentPage > total) currentPage = total;
        
        applyArticleFilters();
        document.getElementById('categories').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    function showCategory(cat) {
        filterBtns.forEach(b => {
            if (b.dataset.cat === cat) b.classList.add('active');
            else b.classList.remove('active');
        });
        applyArticleFilters();
    }

    // ═══════════════════════════════════════
    // OPPORTUNITÉS : FILTRE + RECHERCHE
    // ═══════════════════════════════════════
    const oppFilterBtns = document.querySelectorAll('.opp-filter-btn');
    const opportunities = document.querySelectorAll('.opportunity-card');

    window.filterOpp = function(type) {
        oppFilterBtns.forEach(btn => {
            if (btn.dataset.opp === type) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
        applyOppFilters();
    };

    window.searchOpportunities = function() {
        applyOppFilters();
    };

    function applyOppFilters() {
        const activeBtn = document.querySelector('.opp-filter-btn.active');
        const type = activeBtn ? activeBtn.dataset.opp : 'tous';
        const search = document.getElementById('opp-search').value.toLowerCase().trim();
        
        opportunities.forEach(card => {
            const matchesType = type === 'tous' || card.dataset.oppType === type;
            const matchesSearch = !search || card.dataset.oppTitle.includes(search);
            
            if (matchesType && matchesSearch) {
                card.classList.add('active');
                card.style.display = 'block';
            } else {
                card.classList.remove('active');
                card.style.display = 'none';
            }
        });
    }

    // Init opp
    applyOppFilters();

    // ═══════════════════════════════════════
    // SCROLL TO TOP
    // ═══════════════════════════════════════
    const scrollBtn = document.getElementById('scroll-top');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 500) {
            scrollBtn.classList.add('visible');
        } else {
            scrollBtn.classList.remove('visible');
        }
    });

    // ═══════════════════════════════════════
    // DÉFILEMENT FLUIDE
    // ═══════════════════════════════════════
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href === '#') return;
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
});
