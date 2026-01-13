/* ================= MENU DÉROULANT ================= */
const btnMenu = document.getElementById("btnMenu");
const menu = document.getElementById("menuDeroulant");

btnMenu.onclick = function (e) {
  menu.classList.toggle("voir");
  e.stopPropagation();
};

window.onclick = function () {
  menu.classList.remove("voir");
};

/* ================= BOUTON LANGUE ================= */
/* Ici le menu langue est purement UI, aucun JS n’est nécessaire */
/* Si tu veux un clic pour ouvrir au lieu du hover, tu peux décommenter ce bloc : */

/*
const btnLangue = document.querySelector(".btn-langue");
const menuLangue = document.querySelector(".menu-langue");

btnLangue.addEventListener("click", function(e){
    menuLangue.classList.toggle("actif");
    e.stopPropagation();
});

window.addEventListener("click", function(){
    menuLangue.classList.remove("actif");
});
*/
