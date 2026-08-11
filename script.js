/* ═══════════════════════════════════════════════ */
/* ║  EDUCA-PSY  —  Filtrage des catégories       ║ */
/* ═══════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', function() {
    
    // ─── Filtrage des articles ───
    const filterBtns = document.querySelectorAll('.filter-btn');
    const articles = document.querySelectorAll('.article-card');

    // Afficher par défaut la catégorie "education"
    showCategory('education');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const category = this.dataset.cat;
            
            // Mettre à jour les boutons actifs
            filterBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // Afficher les articles de la catégorie
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

    // ─── Défilement fluide ───
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
