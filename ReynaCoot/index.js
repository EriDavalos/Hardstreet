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
      const msg = encodeURIComponent('¡Hola! 🎀 Quiero confirmar mi asistencia a los XV años de Reyna. Sábado 10 de Octubre 2026');
      const rect = event && event.currentTarget ? event.currentTarget.getBoundingClientRect() : null;
      burstConfetti(rect ? { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 } : null);
      setTimeout(() => {
        window.open('https://wa.me/?text=' + msg, '_blank');
      }, 450);
    }

    // ===== SHARE =====
    function shareWhatsApp() {
      const text = encodeURIComponent('¡Estás invitad@ a los XV años de Reyna! 🎀\nSábado 10 de Octubre 2026\nAbre la invitación para más detalles.');
      window.open('https://wa.me/?text=' + text, '_blank');
    }
    function shareCopy() {
      navigator.clipboard.writeText(window.location.href).then(() => {
        alert('¡Enlace copiado!');
      });
    }