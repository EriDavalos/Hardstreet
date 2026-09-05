// ===== SPLIT TITLES (letter by letter) =====
function splitTitle(el) {
  if (!el || el.dataset.split) return;
  el.dataset.split = '1';
  const text = el.textContent;
  el.textContent = '';
  [...text].forEach((ch, i) => {
    const s = document.createElement('span');
    s.className = 'ch';
    s.textContent = ch;
    s.style.setProperty('--d', (i * 65) + 'ms');
    el.appendChild(s);
  });
}
function playSplit(el) {
  splitTitle(el);
  requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add('show')));
}
splitTitle(document.querySelector('.cover-name'));
window.addEventListener('load', () => playSplit(document.querySelector('.cover-name')));

// ===== GOLDEN DUST (hero) =====
(function makeDust() {
  const wrap = document.getElementById('hero-dust');
  if (!wrap) return;
  const n = window.innerWidth < 480 ? 12 : 20;
  for (let i = 0; i < n; i++) {
    const m = document.createElement('span');
    m.className = 'mote';
    m.style.left = Math.random() * 100 + '%';
    m.style.setProperty('--t', (9 + Math.random() * 10) + 's');
    m.style.setProperty('--dl', (Math.random() * 9) + 's');
    m.style.setProperty('--sway', (Math.random() * 70 - 35) + 'px');
    const sc = 0.5 + Math.random() * 1.1;
    m.style.transform = 'scale(' + sc + ')';
    wrap.appendChild(m);
  }
})();

// ===== OPEN INVITATION =====
function openInvite() {
  const cover = document.getElementById('cover');
  const invitation = document.getElementById('invitation');
  if (!cover || cover.classList.contains('opening')) return;
  cover.classList.add('opening');
  snipConfetti(window.innerWidth / 2, window.innerHeight * 0.45);
  setTimeout(() => {
    cover.style.display = 'none';
    invitation.classList.add('open');
    window.scrollTo(0, 0);
    observeSections();
    startCountdown();
    playSplit(document.querySelector('.hero-title'));
    const sw = document.querySelector('.hero-swoosh');
    if (sw) setTimeout(() => sw.classList.add('drawn'), 500);
  }, 650);
}

// ===== SCROLL REVEAL =====
function observeSections() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) entry.target.classList.add('visible');
    });
  }, { threshold: 0.15 });
  document.querySelectorAll('.reveal, .reveal-l, .reveal-r, .reveal-zoom').forEach((el) => {
    observer.observe(el);
  });
  const tl = document.querySelector('.timeline');
  if (tl) {
    const tlObs = new IntersectionObserver((en) => {
      en.forEach(e => { if (e.isIntersecting) { tl.classList.add('inview'); tlObs.disconnect(); } });
    }, { threshold: 0.2 });
    tlObs.observe(tl);
  }
}

// ===== HERO PARALLAX (photo + content drift) =====
(function heroParallax() {
  const hero = document.querySelector('.hero');
  if (!hero || !window.matchMedia('(hover:hover) and (pointer:fine)').matches) return;
  const photo = document.querySelector('.hero-photo-wrap');
  const content = document.querySelector('.hero-content');
  let tx = 0, ty = 0, cx = 0, cy = 0, raf = null;
  hero.addEventListener('mousemove', (e) => {
    const r = hero.getBoundingClientRect();
    tx = ((e.clientX - r.left) / r.width - 0.5) * 2;
    ty = ((e.clientY - r.top) / r.height - 0.5) * 2;
    if (!raf) loop();
  });
  hero.addEventListener('mouseleave', () => { tx = 0; ty = 0; if (!raf) loop(); });
  function loop() {
    cx += (tx - cx) * 0.06;
    cy += (ty - cy) * 0.06;
    if (photo) photo.style.transform = 'translate(' + (cx * -14) + 'px, ' + (cy * -10) + 'px)';
    if (content) content.style.transform = 'translate(' + (cx * 9) + 'px, ' + (cy * 6) + 'px)';
    if (Math.abs(tx - cx) > 0.002 || Math.abs(ty - cy) > 0.002) {
      raf = requestAnimationFrame(loop);
    } else { raf = null; }
  }
})();

// ===== CARD TILT + CURSOR GLOW =====
(function cardTilt() {
  if (!window.matchMedia('(hover:hover) and (pointer:fine)').matches) return;
  document.querySelectorAll('.card').forEach(card => {
    let raf = null;
    card.addEventListener('mousemove', (e) => {
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;
      card.style.setProperty('--mx', (px * 100) + '%');
      card.style.setProperty('--my', (py * 100) + '%');
      if (raf) return;
      raf = requestAnimationFrame(() => {
        card.style.transform = 'translateY(-6px) rotateX(' + ((0.5 - py) * 7) + 'deg) rotateY(' + ((px - 0.5) * 9) + 'deg)';
        raf = null;
      });
    });
    card.addEventListener('mouseleave', () => { card.style.transform = ''; });
  });
})();

// ===== COUNTDOWN (next Sunday 2:00 PM) =====
function startCountdown() {
  function nextSunday2pm() {
    const now = new Date();
    const t = new Date(now);
    t.setDate(now.getDate() + ((7 - now.getDay()) % 7)); // upcoming Sunday
    t.setHours(14, 0, 0, 0);
    if (t.getTime() <= now.getTime()) t.setDate(t.getDate() + 7);
    return t.getTime();
  }
  const target = nextSunday2pm();

  function setNum(id, val) {
    const el = document.getElementById(id);
    const pad = String(val).padStart(2, '0');
    if (el.textContent !== pad) {
      el.textContent = pad;
      el.classList.remove('tick');
      void el.offsetWidth; // restart animation
      el.classList.add('tick');
    }
  }
  function update() {
    const diff = Math.max(0, target - Date.now());
    const d = Math.floor(diff / 86400000); const r1 = diff % 86400000;
    const h = Math.floor(r1 / 3600000); const r2 = r1 % 3600000;
    const m = Math.floor(r2 / 60000); const r3 = r2 % 60000;
    const s = Math.floor(r3 / 1000);
    setNum('days', d);
    setNum('hours', h);
    setNum('minutes', m);
    setNum('seconds', s);
  }
  update();
  setInterval(update, 1000);
}

// ===== CONFETTI (barber colors) =====
function snipConfetti(cx, cy) {
  const colors = ['#c1121f', '#e63946', '#e5e9ee', '#8f959d', '#c9a45c', '#d6d3c9'];
  for (let i = 0; i < 64; i++) {
    const el = document.createElement('span');
    el.className = 'pretty-piece ' + (i % 3 === 0 ? 'pretty-confetti' : i % 3 === 1 ? 'pretty-spark' : 'pretty-heart');
    if (el.classList.contains('pretty-confetti')) {
      el.style.background = colors[i % colors.length];
      el.style.width = (6 + Math.random() * 6) + 'px';
      el.style.height = (4 + Math.random() * 5) + 'px';
    } else {
      el.textContent = el.classList.contains('pretty-spark') ? '✦' : '✂';
      el.style.fontSize = (13 + Math.random() * 12) + 'px';
    }
    const angle = Math.random() * Math.PI * 2;
    const dist = 120 + Math.random() * 240;
    el.style.left = cx + 'px';
    el.style.top = cy + 'px';
    el.style.setProperty('--dx', Math.cos(angle) * dist + 'px');
    el.style.setProperty('--dy', (Math.sin(angle) * dist - 110) + 'px');
    el.style.setProperty('--rot', (Math.random() * 540 - 270) + 'deg');
    el.style.setProperty('--dur', (1.3 + Math.random() * 0.9) + 's');
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 2600);
  }
}

// ===== RSVP VIA WHATSAPP =====
function confirmarAsistencia(event) {
  if (window.__rsvpBusy) return;
  window.__rsvpBusy = true;

  const msg = encodeURIComponent('¡Qué onda! ✂ Confirmo mi asistencia al cumpleaños del Fede. Domingo 2 de la tarde. ¡Ahí voy!');
  const url = 'https://wa.me/529990000000?text=' + msg;

  const rect = event && event.currentTarget ? event.currentTarget.getBoundingClientRect() : null;
  snipConfetti(rect ? rect.left + rect.width / 2 : window.innerWidth / 2,
               rect ? rect.top + rect.height / 2 : window.innerHeight * 0.5);

  const overlay = document.getElementById('thanks-overlay');
  if (overlay) {
    overlay.classList.remove('show');
    void overlay.offsetWidth;
    overlay.classList.add('show');
    document.body.classList.add('no-scroll');
  }

  setTimeout(() => {
    if (overlay) {
      overlay.classList.remove('show');
      document.body.classList.remove('no-scroll');
    }
  }, 2400);

  setTimeout(() => {
    window.__rsvpBusy = false;
    let win = null;
    try { win = window.open(url, '_blank'); } catch (e) { win = null; }
    if (!win || win.closed) {
      window.location.href = url; // fallback if popup blocked
    }
  }, 3000);
}
