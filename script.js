const btnMenu = document.getElementById('btnMenu');
const liens = document.getElementById('liens-deroulants');

btnMenu.addEventListener('click', () => {
  btnMenu.classList.toggle('active');  // change le style du bouton
  liens.style.display = liens.style.display === 'flex' ? 'none' : 'flex';
});
