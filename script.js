document.addEventListener('DOMContentLoaded', function() {
    const btnMenu = document.getElementById('btnMenu');
    const menuDeroulant = document.getElementById('menuDeroulant');

    if (btnMenu && menuDeroulant) {
        btnMenu.addEventListener('click', function(e) {
            e.stopPropagation();
            menuDeroulant.classList.toggle('show');
        });

        document.addEventListener('click', function(e) {
            if (!menuDeroulant.contains(e.target) && !btnMenu.contains(e.target)) {
                menuDeroulant.classList.remove('show');
            }
        });
    }
});
