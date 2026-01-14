// Menu déroulant
document.addEventListener('DOMContentLoaded', function() {
  const btnMenu = document.getElementById('btnMenu');
  const menuDeroulant = document.getElementById('liens-deroulants');
  
  if (btnMenu && menuDeroulant) {
    btnMenu.addEventListener('click', function(e) {
      e.stopPropagation();
      menuDeroulant.classList.toggle('actif');
      
      // Accessibilité: mise à jour de aria-expanded
      const isExpanded = menuDeroulant.classList.contains('actif');
      btnMenu.setAttribute('aria-expanded', isExpanded);
    });
    
    // Fermer le menu si on clique ailleurs
    document.addEventListener('click', function(e) {
      if (!menuDeroulant.contains(e.target) && e.target !== btnMenu) {
        menuDeroulant.classList.remove('actif');
        btnMenu.setAttribute('aria-expanded', 'false');
      }
    });
    
    // Fermer le menu sur les petits écrans après un clic sur un lien
    const menuLinks = menuDeroulant.querySelectorAll('a');
    menuLinks.forEach(link => {
      link.addEventListener('click', function() {
        if (window.innerWidth <= 768) {
          menuDeroulant.classList.remove('actif');
          btnMenu.setAttribute('aria-expanded', 'false');
        }
      });
    });
  }
});

// Changement de langue (à personnaliser selon vos besoins)
const selectLangue = document.getElementById('select-langue');
if (selectLangue) {
  selectLangue.addEventListener('change', function() {
    const langue = this.value;
    // Pour l'instant, on affiche juste un message
    console.log('Langue sélectionnée:', langue);
    
    // Plus tard, vous pourrez rediriger vers différentes versions:
    // window.location.href = `/${langue}/index.html`;
    
    // Ou utiliser un système de traduction dynamique
  });
}

// Animation au scroll pour les sections
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver(function(entries) {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, observerOptions);

// Observer les sections
document.addEventListener('DOMContentLoaded', function() {
  const sections = document.querySelectorAll('.section-apropos, .section-impact, .section-don');
  sections.forEach(section => {
    section.style.opacity = '0';
    section.style.transform = 'translateY(30px)';
    section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(section);
  });
});

// Animation des statistiques au scroll
document.addEventListener('DOMContentLoaded', function() {
  const statNombres = document.querySelectorAll('.stat-nombre');
  
  const animerNombre = (element) => {
    const target = parseInt(element.textContent);
    const duration = 2000;
    const increment = target / (duration / 16);
    let current = 0;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        element.textContent = target + (element.textContent.includes('+') ? '+' : '');
        clearInterval(timer);
      } else {
        element.textContent = Math.floor(current) + (element.textContent.includes('+') ? '+' : '');
      }
    }, 16);
  };
  
  const statObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !entry.target.classList.contains('anime')) {
        entry.target.classList.add('anime');
        animerNombre(entry.target);
      }
    });
  }, { threshold: 0.5 });
  
  statNombres.forEach(stat => statObserver.observe(stat));
});
