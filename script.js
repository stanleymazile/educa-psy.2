/* ═══════════════════════════════════════════════ */
/* EDUCA-PSY — Menu mobile + Filtres articles    */
/* + Filtres opportunités + Scroll fluide        */
/* ═══════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', function() {
    
    // ═══════════════════════════════════════
    // MENU MOBILE
    // ═══════════════════════════════════════
    window.toggleMenu = function() {
        const menu = document.getElementById('mobile-menu');
        const iconMenu = document.getElementById('icon-menu');
        const iconClose = document.getElementById('icon-close');
        
        if (menu.classList.contains('hidden')) {
            menu.classList.remove('hidden');
            iconMenu.classList.add('hidden');
            iconClose.classList.remove('hidden');
            document.body.style.overflow = 'hidden';
        } else {
            closeMenu();
        }
    };
    
    window.closeMenu = function() {
        document.getElementById('mobile-menu').classList.add('hidden');
        document.getElementById('icon-menu').classList.remove('hidden');
        document.getElementById('icon-close').classList.add('hidden');
        document.body.style.overflow = '';
    };

    // ═══════════════════════════════════════
    // FILTRE ARTICLES
    // ═══════════════════════════════════════
    const filterBtns = document.querySelectorAll('.filter-btn');
    const articles = document.querySelectorAll('.article-card');

    showCategory('education');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const category = this.dataset.cat;
            filterBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            showCategory(category);
        });
    });

    function showCategory(cat) {
        articles.forEach(article => {
            if (article.dataset.category === cat) {
                article.classList.add('active');
            } else {
                article.classList.remove('active');
            }
        });
    }

    // ═══════════════════════════════════════
    // FILTRE OPPORTUNITÉS
    // ═══════════════════════════════════════
    const oppFilterBtns = document.querySelectorAll('.opp-filter-btn');
    const opportunities = document.querySelectorAll('.opportunity-card');

    showOpportunities('tous');

    oppFilterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const type = this.dataset.opp;
            oppFilterBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            showOpportunities(type);
        });
    });

    function showOpportunities(type) {
        opportunities.forEach(card => {
            if (type === 'tous' || card.dataset.oppType === type) {
                card.classList.add('active');
            } else {
                card.classList.remove('active');
            }
        });
    }

    // ═══════════════════════════════════════
    // DÉFILEMENT FLUIDE
    // ═══════════════════════════════════════
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
});
