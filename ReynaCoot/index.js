// ===== OPEN INVITATION =====
    function openInvitation() {
      const envelope = document.getElementById('envelope');
      const invitation = document.getElementById('invitation');
      envelope.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
      envelope.style.opacity = '0';
      envelope.style.transform = 'scale(0.95)';
      startMusic();
      setTimeout(() => {
        envelope.style.display = 'none';
        invitation.classList.add('open');
        window.scrollTo(0, 0);
        observeSections();
        startCountdown();
        burstConfetti();
      }, 600);
    }

    // ===== MUSIC =====
    function startMusic() {
      const audio = document.getElementById('bg-music');
      const btn = document.getElementById('music-btn');
      if (btn) btn.style.display = 'flex';
      if (!audio) return;
      audio.volume = 0.55;
      audio.play().then(() => {
        if (btn) btn.classList.add('playing');
      }).catch(() => {});
    }
    function toggleMusic() {
      const audio = document.getElementById('bg-music');
      const btn = document.getElementById('music-btn');
      if (!audio) return;
      if (audio.paused) {
        audio.play().then(() => {
          if (btn) { btn.classList.add('playing'); btn.textContent = '🎵'; }
        }).catch(() => {});
      } else {
        audio.pause();
        if (btn) { btn.classList.remove('playing'); btn.textContent = '🔇'; }
      }
    }

    // ===== SCROLL REVEAL =====
    function observeSections() {
      document.querySelectorAll('.section').forEach(s => s.classList.add('animate'));
      document.querySelectorAll('.timeline-item').forEach(s => s.classList.add('animate'));

      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) entry.target.classList.add('visible');
        });
      }, { threshold: 0.12 });
      document.querySelectorAll('.section').forEach(s => observer.observe(s));

      const tlObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) entry.target.classList.add('visible');
        });
      }, { threshold: 0.2 });
      document.querySelectorAll('.timeline-item').forEach((item, i) => {
        item.style.transitionDelay = (i * 0.12) + 's';
        tlObserver.observe(item);
      });
    }

    // ===== COUNTDOWN =====
    function startCountdown() {
      const target = new Date('2026-10-10T19:30:00').getTime();
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
        const now = Date.now();
        let diff = target - now;
        if (diff <= 0) {
          setNum('days', 0);
          setNum('hours', 0);
          setNum('minutes', 0);
          setNum('seconds', 0);
          return;
        }
        const d = Math.floor(diff / 86400000); diff %= 86400000;
        const h = Math.floor(diff / 3600000); diff %= 3600000;
        const m = Math.floor(diff / 60000); diff %= 60000;
        const s = Math.floor(diff / 1000);
        setNum('days', d);
        setNum('hours', h);
        setNum('minutes', m);
        setNum('seconds', s);
      }
      update();
      setInterval(update, 1000);
    }

    // ===== CONFETTI =====
    function burstConfetti(origin) {
      const colors = ['#b76e79', '#d9a95e', '#e8cfcd', '#8b5a5b', '#f6e5e2', '#ffffff'];
      const cx = origin ? origin.x : window.innerWidth / 2;
      const cy = origin ? origin.y : window.innerHeight * 0.4;
      for (let i = 0; i < 70; i++) {
        const el = document.createElement('div');
        el.className = 'confetti-piece';
        el.style.left = cx + 'px';
        el.style.top = cy + 'px';
        el.style.background = colors[i % colors.length];
        const angle = Math.random() * Math.PI * 2;
        const dist = 120 + Math.random() * 260;
        const dx = Math.cos(angle) * dist;
        const dy = Math.sin(angle) * dist - 130;
        el.style.setProperty('--dx', dx + 'px');
        el.style.setProperty('--dy', dy + 'px');
        el.style.setProperty('--rot', (Math.random() * 720 - 360) + 'deg');
        el.style.width = el.style.height = (6 + Math.random() * 6) + 'px';
        el.style.animationDuration = (0.9 + Math.random() * 0.9) + 's';
        document.body.appendChild(el);
        setTimeout(() => el.remove(), 2200);
      }
    }

    // ===== PARALLAX TILT (desktop) =====
    const cardSection = document.querySelector('.main-card-section');
    const card = document.querySelector('.main-card');
    if (window.matchMedia('(hover:hover) and (pointer:fine)').matches) {
      cardSection.addEventListener('mousemove', (e) => {
        const r = cardSection.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = 'translate(' + (x * 14) + 'px, ' + (y * 10) + 'px) rotate(' + (x * 1.2) + 'deg)';
      });
      cardSection.addEventListener('mouseleave', () => {
        card.style.transform = '';
      });
    }

    // ===== RSVP VIA WHATSAPP =====
    function confirmarAsistencia(event) {
      if (window.__rsvpBusy) return;
      window.__rsvpBusy = true;

      const msg = encodeURIComponent('¡Hola! 🎀 Quiero confirmar mi asistencia a los XV años de Reyna. Sábado 10 de Octubre 2026');
      const url = 'https://wa.me/529994124233?text=' + msg;
      const rect = event && event.currentTarget ? event.currentTarget.getBoundingClientRect() : null;
      burstConfetti(rect ? { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 } : null);
      prettyBurst(window.innerWidth / 2, window.innerHeight * 0.42);

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
      }, 2500);

      setTimeout(() => {
        window.__rsvpBusy = false;
        // Intentar en pestaña nueva; si el navegador bloquea el popup, abrir WhatsApp en esta misma pestaña
        let win = null;
        try { win = window.open(url, '_blank'); } catch (e) { win = null; }
        if (!win || win.closed) {
          window.location.href = url;
        }
      }, 3100);
    }

    // Pretty celebratory burst (hearts, sparkles, petals, confetti)
    function prettyBurst(x, y) {
      const colors = ['#d9a95e', '#b76e79', '#e0b060', '#c98a5e', '#8b5a5b', '#f0d9d5'];
      const fly = (el) => {
        const angle = Math.random() * Math.PI * 2;
        const dist = 140 + Math.random() * 230;
        el.style.left = x + 'px';
        el.style.top = y + 'px';
        el.style.setProperty('--dx', Math.cos(angle) * dist + 'px');
        el.style.setProperty('--dy', (Math.sin(angle) * dist - 70) + 'px');
        el.style.setProperty('--rot', (Math.random() * 540 - 270) + 'deg');
        el.style.setProperty('--sc', (0.8 + Math.random() * 0.7).toFixed(2));
        el.style.setProperty('--dur', (1.5 + Math.random() * 0.9) + 's');
        el.style.setProperty('--del', (Math.random() * 0.18).toFixed(2) + 's');
        document.body.appendChild(el);
        setTimeout(() => el.remove(), 3200);
      };
      // rose hearts
      for (let i = 0; i < 14; i++) {
        const s = document.createElement('span');
        s.className = 'pretty-piece pretty-heart' + (i % 2 ? ' alt' : '');
        s.textContent = '♥';
        s.style.fontSize = (14 + Math.random() * 14) + 'px';
        fly(s);
      }
      // golden sparkles
      for (let i = 0; i < 16; i++) {
        const s = document.createElement('span');
        s.className = 'pretty-piece pretty-spark';
        s.textContent = '✦';
        s.style.fontSize = (13 + Math.random() * 13) + 'px';
        fly(s);
      }
      // petals
      for (let i = 0; i < 10; i++) {
        const s = document.createElement('span');
        s.className = 'pretty-piece pretty-petal';
        s.style.width = s.style.height = (11 + Math.random() * 11) + 'px';
        fly(s);
      }
      // confetti rects
      for (let i = 0; i < 16; i++) {
        const s = document.createElement('span');
        s.className = 'pretty-piece pretty-confetti';
        s.style.background = colors[i % colors.length];
        s.style.width = (6 + Math.random() * 6) + 'px';
        s.style.height = (4 + Math.random() * 5) + 'px';
        fly(s);
      }
    }

    // ===== SHARE =====
    function shareWhatsApp() {
      const text = encodeURIComponent('¡Estás invitad@ a los XV años de Reyna! 🎀\nSábado 10 de Octubre 2026\nAbre la invitación para más detalles.');
      window.open('https://wa.me/529994124233?text=' + text, '_blank');
    }
    function shareCopy() {
      navigator.clipboard.writeText(window.location.href).then(() => {
        alert('¡Enlace copiado!');
      });
    }