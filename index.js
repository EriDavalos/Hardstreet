// ========== LOADER ==========
    window.addEventListener('load', () => {
      setTimeout(() => document.getElementById('loader').classList.add('hidden'), 800);
    });

    // ========== CUSTOM CURSOR ==========
    const dot = document.getElementById('cursorDot');
    const ring = document.getElementById('cursorRing');
    let mouseX = 0, mouseY = 0, ringX = 0, ringY = 0;
    document.addEventListener('mousemove', e => {
      mouseX = e.clientX; mouseY = e.clientY;
      dot.style.left = mouseX - 4 + 'px'; dot.style.top = mouseY - 4 + 'px';
    });
    function animateCursor() {
      ringX += (mouseX - ringX) * 0.15;
      ringY += (mouseY - ringY) * 0.15;
      ring.style.left = ringX - 20 + 'px'; ring.style.top = ringY - 20 + 'px';
      requestAnimationFrame(animateCursor);
    }
    animateCursor();
    document.querySelectorAll('a, button, .gallery-item, .filter-btn, .service-card').forEach(el => {
      el.addEventListener('mouseenter', () => ring.classList.add('hover'));
      el.addEventListener('mouseleave', () => ring.classList.remove('hover'));
    });

    // ========== NAVBAR ==========
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
      navbar.classList.toggle('scrolled', window.scrollY > 50);
      document.getElementById('backToTop').classList.toggle('visible', window.scrollY > 500);
    });

    function toggleNav() {
      document.getElementById('navLinks').classList.toggle('open');
      document.getElementById('navToggle').classList.toggle('active');
    }
    function closeNav() {
      document.getElementById('navLinks').classList.remove('open');
      document.getElementById('navToggle').classList.remove('active');
    }

    // ========== SCROLL REVEAL ==========
    const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });
    revealElements.forEach(el => revealObserver.observe(el));

    // ========== PARALLAX ==========
    const parallaxBg = document.querySelector('[data-parallax]');
    window.addEventListener('scroll', () => {
      if (!parallaxBg) return;
      const rect = parallaxBg.parentElement.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        const speed = 0.3;
        const yPos = (rect.top - window.innerHeight / 2) * speed;
        parallaxBg.style.transform = `translateY(${yPos}px)`;
      }
    });

    // ========== COUNTER ANIMATION ==========
    const statNumbers = document.querySelectorAll('.stat-number');
    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const target = parseInt(el.getAttribute('data-count'));
          const duration = 2000;
          const step = target / (duration / 16);
          let current = 0;
          const timer = setInterval(() => {
            current += step;
            if (current >= target) { current = target; clearInterval(timer); }
            el.textContent = Math.floor(current) + (target > 50 ? '+' : '+');
          }, 16);
          counterObserver.unobserve(el);
        }
      });
    }, { threshold: 0.5 });
    statNumbers.forEach(el => counterObserver.observe(el));

    // ========== GALLERY FILTERS ==========
    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const filter = btn.getAttribute('data-filter');
        document.querySelectorAll('.gallery-item').forEach(item => {
          if (filter === 'all' || item.getAttribute('data-category') === filter) {
            item.style.opacity = '0'; item.style.transform = 'scale(0.8)';
            setTimeout(() => {
              item.style.display = 'block';
              requestAnimationFrame(() => {
                item.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
                item.style.opacity = '1'; item.style.transform = 'scale(1)';
              });
            }, 100);
          } else {
            item.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
            item.style.opacity = '0'; item.style.transform = 'scale(0.8)';
            setTimeout(() => { item.style.display = 'none'; }, 300);
          }
        });
      });
    });

    // ========== TESTIMONIALS ==========
    let currentTestimonial = 0;
    const testimonials = document.querySelectorAll('.testimonial-item');
    const dots = document.querySelectorAll('.dot');
    function showTestimonial(index) {
      testimonials.forEach(t => t.classList.remove('active'));
      dots.forEach(d => d.classList.remove('active'));
      testimonials[index].classList.add('active');
      dots[index].classList.add('active');
      currentTestimonial = index;
    }
    dots.forEach(dot => {
      dot.addEventListener('click', () => showTestimonial(parseInt(dot.getAttribute('data-index'))));
    });
    setInterval(() => {
      showTestimonial((currentTestimonial + 1) % testimonials.length);
    }, 5000);

    // ========== FORM ==========
    function handleSubmit(e) {
      e.preventDefault();
      const btn = e.target.querySelector('.submit-btn');
      const original = btn.innerHTML;
      btn.innerHTML = '✓ Mensaje Enviado';
      btn.style.background = '#c9a96e'; btn.style.color = '#0a0a0a';
      setTimeout(() => { btn.innerHTML = original; btn.style.background = ''; btn.style.color = ''; e.target.reset(); }, 2500);
    }

    // ========== SMOOTH ANCHOR SCROLLING ==========
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });