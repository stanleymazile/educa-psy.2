async function chargerComposants() {
    try {
        const hRes = await fetch('header.html');
        document.getElementById('header-part').innerHTML = await hRes.text();
        
        const fRes = await fetch('footer.html');
        document.getElementById('footer-part').innerHTML = await fRes.text();
        
        activerMenu();
    } catch (e) { console.error("Erreur de chargement", e); }
}

function activerMenu() {
    const btn = document.getElementById('btnMenu');
    const menu = document.getElementById('liens-deroulants');
    const barres = document.querySelectorAll('.barre');

    if (btn) {
        btn.addEventListener('click', (e) => {
            menu.classList.toggle('voir');
            if(menu.classList.contains('voir')) {
                barres[0].style.transform = "translateY(5.5px) rotate(45deg)";
                barres[1].style.opacity = "0";
                barres[2].style.transform = "translateY(-5.5px) rotate(-45deg)";
            } else {
                barres[0].style.transform = "none";
                barres[1].style.opacity = "1";
                barres[2].style.transform = "none";
            }
            e.stopPropagation();
        });
        document.addEventListener('click', () => {
            menu.classList.remove('voir');
            barres.forEach(b => { b.style.transform = "none"; b.style.opacity = "1"; });
        });
    }
}
chargerComposants();
