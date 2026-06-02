document.addEventListener('DOMContentLoaded', () => {
  /* ---------- Smooth scrolling ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const targetId = anchor.getAttribute('href').slice(1);
      const targetEl = document.getElementById(targetId);
      if (targetEl) {
        e.preventDefault();
        targetEl.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  /* ---------- Reveal on scroll (staggered) ---------- */
  const revealElements = document.querySelectorAll('.reveal');
  revealElements.forEach((el, i) => el.dataset.revealIndex = i);
  const revealObserver = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const idx = parseInt(entry.target.dataset.revealIndex, 10) || 0;
        setTimeout(() => entry.target.classList.add('visible'), idx * 100);
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  revealElements.forEach(el => revealObserver.observe(el));

  /* ---------- Stat counters ---------- */
  const statElements = document.querySelectorAll('.stat-number');
  const counterObserver = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.dataset.target, 10) || 0;
        const duration = 2000;
        let start = null;
        const step = timestamp => {
          if (!start) start = timestamp;
          const progress = Math.min((timestamp - start) / duration, 1);
          el.textContent = Math.floor(progress * target);
          if (progress < 1) {
            requestAnimationFrame(step);
          } else {
            el.textContent = target;
          }
        };
        requestAnimationFrame(step);
        obs.unobserve(el);
      }
    });
  }, { threshold: 0.6 });
  statElements.forEach(el => {
    if (!el.dataset.target) el.dataset.target = el.textContent.trim();
    counterObserver.observe(el);
  });

  /* ---------- Navbar behavior ---------- */
  const navbar = document.querySelector('.navbar');
  let lastScrollY = window.scrollY;
  const navHandler = () => {
    const curY = window.scrollY;
    if (curY > 80) {
      navbar.classList.add('shrink');
    } else {
      navbar.classList.remove('shrink');
    }
    if (curY > lastScrollY && curY > 100) {
      navbar.classList.add('hidden');
    } else {
      navbar.classList.remove('hidden');
    }
    lastScrollY = curY;
  };
  window.addEventListener('scroll', navHandler);

  /* ---------- Hamburger toggle ---------- */
  const hamburger = document.querySelector('.hamburger');
  if (hamburger) {
    hamburger.addEventListener('click', () => {
      document.body.classList.toggle('menu-open');
      navbar.classList.toggle('open');
    });
  }

  /* ---------- Gallery Lightbox ---------- */
  const galleryImages = Array.from(document.querySelectorAll('.gallery .grid img'));
  if (galleryImages.length) {
    const lightbox = document.createElement('div');
    lightbox.className = 'lightbox';
    lightbox.innerHTML = `
      <div class="lightbox-content">
        <button class="lb-close" aria-label="Close">&times;</button>
        <button class="lb-prev" aria-label="Previous">&#10094;</button>
        <img class="lb-img" src="" alt="">
        <button class="lb-next" aria-label="Next">&#10095;</button>
      </div>
    `;
    document.body.appendChild(lightbox);
    const lbImg = lightbox.querySelector('.lb-img');
    const closeBtn = lightbox.querySelector('.lb-close');
    const prevBtn = lightbox.querySelector('.lb-prev');
    const nextBtn = lightbox.querySelector('.lb-next');
    let currentIdx = 0;

    const openLightbox = idx => {
      currentIdx = idx;
      lbImg.src = galleryImages[currentIdx].src;
      lightbox.classList.add('active');
    };
    const closeLightbox = () => lightbox.classList.remove('active');
    const showPrev = () => {
      currentIdx = (currentIdx - 1 + galleryImages.length) % galleryImages.length;
      lbImg.src = galleryImages[currentIdx].src;
    };
    const showNext = () => {
      currentIdx = (currentIdx + 1) % galleryImages.length;
      lbImg.src = galleryImages[currentIdx].src;
    };

    galleryImages.forEach((img, i) => img.addEventListener('click', () => openLightbox(i)));
    closeBtn.addEventListener('click', closeLightbox);
    prevBtn.addEventListener('click', showPrev);
    nextBtn.addEventListener('click', showNext);
    lightbox.addEventListener('click', e => {
      if (e.target === lightbox) closeLightbox();
    });
    document.addEventListener('keydown', e => {
      if (!lightbox.classList.contains('active')) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') showPrev();
      if (e.key === 'ArrowRight') showNext();
    });
  }

  /* ---------- Form validation & success message ---------- */
  const form = document.querySelector('.contact-form form');
  if (form) {
    const showMessage = (msg, isError = false) => {
      let msgEl = document.querySelector('.form-message');
      if (!msgEl) {
        msgEl = document.createElement('div');
        msgEl.className = 'form-message';
        form.prepend(msgEl);
      }
      msgEl.textContent = msg;
      msgEl.style.opacity = '0';
      msgEl.style.transition = 'opacity 0.4s';
      msgEl.style.color = isError ? 'red' : 'green';
      requestAnimationFrame(() => (msgEl.style.opacity = '1'));
      setTimeout(() => (msgEl.style.opacity = '0'), 3000);
    };

    form.addEventListener('submit', e => {
      e.preventDefault();
      const name = form.querySelector('#name');
      const email = form.querySelector('#email');
      const message = form.querySelector('#message');
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!name.value.trim()) {
        showMessage('Syötä nimesi.', true);
        return;
      }
      if (!emailPattern.test(email.value.trim())) {
        showMessage('Syötä kelvollinen sähköpostiosoite.', true);
        return;
      }
      // optional message field can be empty
      // Simulate successful submit
      showMessage('Viesti lähetetty onnistuneesti!');
      form.reset();
    });
  }
});