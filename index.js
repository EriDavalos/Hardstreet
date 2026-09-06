// ========== HELPER: Render Package to HTML ==========
function renderPackageCard(pkg) {
  const serviciosHTML = pkg.servicios.map(s => 
    `<li>
      <span class="pkg-icon-svg">${s.icon}</span>
      <span class="pkg-service-text">${s.nombre}</span>
    </li>`
  ).join('');

  const catIcon = CategoryIcons[pkg.categoria] || CategoryIcons.general;
  const tierLabel = TierLabels[pkg.tier] || pkg.tier;
  const catName = CategoryNames[pkg.categoria] || pkg.categoria;
  const serviceCount = pkg.servicios.length;

  return `
    <div class="package-card tier-${pkg.tier} cat-${pkg.categoria} reveal" data-category="${pkg.categoria}">
      <div class="pkg-tier-badge tier-${pkg.tier}">${tierLabel}</div>
      <div class="pkg-flyer-inner">
        <div class="pkg-category">
          <span class="pkg-category-icon">${catIcon}</span>
          <span class="pkg-category-name">${catName}</span>
        </div>
        <div class="pkg-header">
          <h3 class="pkg-name">${pkg.nombre}</h3>
          <p class="pkg-subtitle">${pkg.subtitulo}</p>
        </div>
        <div class="pkg-divider"></div>
        <div class="pkg-services-header">
          <span class="pkg-services-count">${serviceCount} servicios incluidos</span>
        </div>
        <ul class="pkg-services">
          ${serviciosHTML}
        </ul>
        <div class="pkg-footer">
          <div class="pkg-price">
            <span class="pkg-price-label">Desde</span>
            <span class="pkg-price-value">${pkg.precio}</span>
            <span class="pkg-price-note">MXN</span>
          </div>
          <a href="#contact" class="pkg-cta">
            <span>Cotizar</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </a>
        </div>
      </div>
    </div>
  `;
}

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
document.querySelectorAll('a, button, .gallery-item, .filter-btn, .service-card, .package-card').forEach(el => {
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

// ========== PACKAGES RENDERER ==========
const packagesContainer = document.getElementById('packagesGrid');
if (packagesContainer) {
  packagesContainer.innerHTML = PackagesDB.map(pkg => renderPackageCard(pkg)).join('');
  // Re-observe newly added package cards for scroll reveal
  packagesContainer.querySelectorAll('.reveal, .reveal-left, .reveal-right').forEach(el => {
    revealObserver.observe(el);
  });
  // Re-observe for custom cursor hover effects
  packagesContainer.querySelectorAll('.package-card').forEach(el => {
    el.addEventListener('mouseenter', () => ring.classList.add('hover'));
    el.addEventListener('mouseleave', () => ring.classList.remove('hover'));
  });
}

// ========== PACKAGE FILTERS ==========
let currentCategory = 'all';
const pkgFilters = document.querySelectorAll('.pkg-filter-btn');

pkgFilters.forEach(btn => {
  btn.addEventListener('click', () => {
    pkgFilters.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentCategory = btn.getAttribute('data-category');
    filterPackages();
  });
});

function filterPackages() {
  const cards = document.querySelectorAll('.package-card');
  cards.forEach((card, index) => {
    const cat = card.getAttribute('data-category');
    const show = currentCategory === 'all' || cat === currentCategory;
    
    if (show) {
      card.style.display = 'block';
      card.style.animation = 'none';
      card.offsetHeight; // Trigger reflow
      card.style.animation = `pkgFadeIn 0.5s ease forwards ${index * 0.05}s`;
    } else {
      card.style.animation = 'pkgFadeOut 0.3s ease forwards';
      setTimeout(() => { card.style.display = 'none'; }, 300);
    }
  });
}

// ========== EXTERN SERVICES CAROUSEL ==========
let currentExternSlide = 0;
const _extServices = (typeof ExternServicesDB !== 'undefined') ? ExternServicesDB : [];

function renderExternCarousel() {
  const container = document.getElementById('externCarousel');
  const dotsContainer = document.getElementById('externDots');
  
  container.innerHTML = _extServices.map((service, index) => `
    <div class="extern-slide ${index === 0 ? 'active' : ''}">
      <div class="extern-slide-image">
        <img src="${service.image}" alt="${service.title}" loading="lazy" />
      </div>
      <div class="extern-slide-content">
        <div class="extern-slide-icon">${service.icon}</div>
        <h3 class="extern-slide-title">${service.title}</h3>
        <p class="extern-slide-subtitle">${service.subtitle}</p>
        <p class="extern-slide-desc">${service.description}</p>
        <ul class="extern-slide-features">
          ${service.features.map(f => `<li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>${f}</li>`).join('')}
        </ul>
        <div class="extern-slide-price">
          <span class="extern-slide-price-label">Inversión</span>
          <span class="extern-slide-price-value">${service.price}</span>
        </div>
      </div>
    </div>
  `).join('');
  
  dotsContainer.innerHTML = _extServices.map((_, index) => `
    <span class="extern-dot ${index === 0 ? 'active' : ''}" onclick="goToExternSlide(${index})"></span>
  `).join('');
}

function showExternSlide(index) {
  const slides = document.querySelectorAll('.extern-slide');
  const dots = document.querySelectorAll('.extern-dot');
  
  slides.forEach(s => s.classList.remove('active'));
  dots.forEach(d => d.classList.remove('active'));
  
  slides[index].classList.add('active');
  dots[index].classList.add('active');
  currentExternSlide = index;
}

function nextExternSlide() {
  const next = (currentExternSlide + 1) % _extServices.length;
  showExternSlide(next);
}

function prevExternSlide() {
  const prev = (currentExternSlide - 1 + _extServices.length) % _extServices.length;
  showExternSlide(prev);
}

function goToExternSlide(index) {
  showExternSlide(index);
}

// Initialize carousel
renderExternCarousel();

// Auto-advance carousel
setInterval(nextExternSlide, 6000);

// ========== MODAL SYSTEM ==========
function openModal(modalId) {
  document.getElementById(modalId).classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeModal(modalId) {
  document.getElementById(modalId).classList.remove('active');
  document.body.style.overflow = '';
}

// Close modal on overlay click
document.querySelectorAll('.modal-overlay').forEach(overlay => {
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      overlay.classList.remove('active');
      document.body.style.overflow = '';
    }
  });
});

// ========== LOGIN SYSTEM (Demo) ==========
let currentUser = null;

function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;

  // Demo validation (replace with real API later)
  if (email && password) {
    currentUser = {
      id: 1,
      nombre: 'Cliente Demo',
      email: email,
      paquete: PackagesDB[0],
      estado: 'En proceso',
      progreso: 65,
      fotos: [
        { id: 1, url: 'IMG_3146-Mejorado-NR_DxO_0004_Grupo 1 copia 4.jpg', titulo: 'Foto 1', estado: 'Lista' },
        { id: 2, url: 'IMG_5873-Mejorado-NR.jpg', titulo: 'Foto 2', estado: 'En edición' },
        { id: 3, url: 'IMG_9686-Enhanced-NR.jpg', titulo: 'Foto 3', estado: 'Lista' },
        { id: 4, url: 'Hard Street.png', titulo: 'Foto 4', estado: 'Lista' },
        { id: 5, url: 'boungle.jpg', titulo: 'Foto 5', estado: 'En edición' },
      ]
    };

    // Save to localStorage and redirect to dashboard
    localStorage.setItem('hardstreet_user', JSON.stringify(currentUser));
    window.location.href = 'dashboard.html';
  }
  return false;
}

function handleLogout() {
  localStorage.removeItem('hardstreet_user');
  currentUser = null;
  updateAuthUI();
}

function updateAuthUI() {
  const authBtn = document.getElementById('authBtn');
  const savedUser = localStorage.getItem('hardstreet_user');
  if (savedUser) {
    authBtn.textContent = 'Mi Paquete';
    authBtn.onclick = () => window.location.href = 'dashboard.html';
  } else {
    authBtn.textContent = 'Iniciar Sesión';
    authBtn.onclick = () => openModal('loginModal');
  }
}

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
    const href = this.getAttribute('href');
    if (!href || href === '#' || href.length < 2) return;
    e.preventDefault();
    const target = document.querySelector(href);
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

// Initialize auth UI
updateAuthUI();
