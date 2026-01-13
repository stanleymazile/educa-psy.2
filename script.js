const btnMenu = document.getElementById('btnMenu');
const menu = document.getElementById('liens-deroulants');

// Ouvrir/fermer le menu
btnMenu.onclick = function (e) {
  menu.classList.toggle('voir');
  e.stopPropagation();
};

// Fermer le menu si clic en dehors
document.addEventListener('click', function () {
  menu.classList.remove('voir');
});

// Redirection multilingue
document.getElementById('select-langue').addEventListener('change', function () {
  const lang = this.value;
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  window.location.href = `/${lang}/${currentPage}`;
});
