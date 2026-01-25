(function () {
  'use strict';

  class Carousel {
    constructor(wrapper) {
      this.wrapper = wrapper;
      this.track = wrapper.querySelector('.carousel-track');
      this.slides = Array.from(this.track.children);

      if (!this.track || this.slides.length === 0) return;

      this.currentIndex = 0;
      this.slidesPerView = this.getSlidesPerView();
      this.totalSlides = this.slides.length;
      this.isDragging = false;
      this.startX = 0;
      this.currentTranslate = 0;
      this.prevTranslate = 0;

      this.autoplay = wrapper.dataset.autoplay === 'true';
      this.autoplayTimer = null;
      this.userInteracted = false;

      this.init();
    }

    /* ================= INIT ================= */

    init() {
      this.cloneSlides();
      this.updateLayout();
      this.createControls();
      this.createDots();
      this.enableSwipe();
      this.enableKeyboard();
      this.handleResize();
      this.jumpToInitial();

      if (this.autoplay && window.innerWidth >= 768) {
        this.startAutoplay();
      }
    }

    /* ================= CORE ================= */

    getSlidesPerView() {
      const w = window.innerWidth;
      if (w >= 1024) return 3;
      if (w >= 768) return 2;
      return 1;
    }

    cloneSlides() {
      this.track.querySelectorAll('.clone').forEach(c => c.remove());

      const before = this.slides.slice(-this.slidesPerView).map(s => {
        const c = s.cloneNode(true);
        c.classList.add('clone');
        return c;
      });

      const after = this.slides.slice(0, this.slidesPerView).map(s => {
        const c = s.cloneNode(true);
        c.classList.add('clone');
        return c;
      });

      before.forEach(c => this.track.prepend(c));
      after.forEach(c => this.track.append(c));

      this.allSlides = Array.from(this.track.children);
    }

    updateLayout() {
      const width = 100 / this.slidesPerView;
      this.allSlides.forEach(slide => {
        slide.style.minWidth = `${width}%`;
      });
    }

    jumpToInitial() {
      this.currentIndex = this.slidesPerView;
      this.setTranslate();
    }

    setTranslate(animate = true) {
      this.track.style.transition = animate ? 'transform 0.4s ease' : 'none';
      this.track.style.transform = `translateX(-${this.currentIndex * (100 / this.slidesPerView)}%)`;
      this.updateDots();
    }

    /* ================= NAV ================= */

    next() {
      this.userInteracted = true;
      this.currentIndex++;
      this.setTranslate();
      this.checkInfinite();
    }

    prev() {
      this.userInteracted = true;
      this.currentIndex--;
      this.setTranslate();
      this.checkInfinite();
    }

    checkInfinite() {
      setTimeout(() => {
        if (this.currentIndex >= this.totalSlides + this.slidesPerView) {
          this.currentIndex = this.slidesPerView;
          this.setTranslate(false);
        }

        if (this.currentIndex <= 0) {
          this.currentIndex = this.totalSlides;
          this.setTranslate(false);
        }
      }, 410);
    }

    /* ================= CONTROLS ================= */

    createControls() {
      this.controls = document.createElement('div');
      this.controls.className = 'carousel-controls';

      this.prevBtn = document.createElement('button');
      this.prevBtn.innerHTML = '‹';
      this.prevBtn.setAttribute('aria-label', 'Slide précédent');
      this.prevBtn.onclick = () => this.prev();

      this.nextBtn = document.createElement('button');
      this.nextBtn.innerHTML = '›';
      this.nextBtn.setAttribute('aria-label', 'Slide suivant');
      this.nextBtn.onclick = () => this.next();

      this.controls.append(this.prevBtn, this.nextBtn);
      this.wrapper.before(this.controls);
    }

    createDots() {
      this.dots = document.createElement('div');
      this.dots.className = 'carousel-dots';

      const count = Math.ceil(this.totalSlides / this.slidesPerView);

      for (let i = 0; i < count; i++) {
        const dot = document.createElement('button');
        dot.onclick = () => {
          this.userInteracted = true;
          this.currentIndex = i * this.slidesPerView + this.slidesPerView;
          this.setTranslate();
        };
        this.dots.appendChild(dot);
      }

      this.wrapper.after(this.dots);
      this.updateDots();
    }

    updateDots() {
      if (!this.dots) return;
      const dots = this.dots.children;
      const index = Math.floor(
        (this.currentIndex - this.slidesPerView) / this.slidesPerView
      );

      [...dots].forEach((d, i) => {
        d.classList.toggle('active', i === index);
      });
    }

    /* ================= SWIPE ================= */

    enableSwipe() {
      const start = x => {
        this.isDragging = true;
        this.startX = x;
        this.track.style.transition = 'none';
      };

      const move = x => {
        if (!this.isDragging) return;
        const diff = x - this.startX;
        const percent = (diff / this.wrapper.offsetWidth) * 100;
        this.track.style.transform =
          `translateX(calc(-${this.currentIndex * (100 / this.slidesPerView)}% + ${percent}%))`;
      };

      const end = x => {
        if (!this.isDragging) return;
        this.isDragging = false;
        const diff = x - this.startX;
        Math.abs(diff) > 50 ? (diff < 0 ? this.next() : this.prev()) : this.setTranslate();
      };

      this.wrapper.addEventListener('touchstart', e => start(e.touches[0].clientX), { passive: true });
      this.wrapper.addEventListener('touchmove', e => move(e.touches[0].clientX), { passive: true });
      this.wrapper.addEventListener('touchend', e => end(e.changedTouches[0].clientX));

      this.wrapper.addEventListener('mousedown', e => start(e.clientX));
      window.addEventListener('mousemove', e => move(e.clientX));
      window.addEventListener('mouseup', e => end(e.clientX));
    }

    /* ================= ACCESSIBILITY ================= */

    enableKeyboard() {
      this.wrapper.tabIndex = 0;
      this.wrapper.addEventListener('keydown', e => {
        if (e.key === 'ArrowRight') this.next();
        if (e.key === 'ArrowLeft') this.prev();
      });
    }

    /* ================= AUTOPLAY ================= */

    startAutoplay() {
      this.autoplayTimer = setInterval(() => {
        if (!this.userInteracted) this.next();
      }, 4000);

      this.wrapper.addEventListener('mouseenter', () => clearInterval(this.autoplayTimer));
      this.wrapper.addEventListener('mouseleave', () => this.startAutoplay());
    }

    /* ================= RESIZE ================= */

    handleResize() {
      window.addEventListener('resize', () => {
        const old = this.slidesPerView;
        this.slidesPerView = this.getSlidesPerView();
        if (old !== this.slidesPerView) {
          this.cloneSlides();
          this.updateLayout();
          this.jumpToInitial();
        }
      });
    }
  }

  /* ================= INIT GLOBAL ================= */

  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.carousel-wrapper')
      .forEach(wrapper => new Carousel(wrapper));
  });

})();
