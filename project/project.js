/* ============================================================
   HARD STREET — Felicitación de cumpleaños para Ivy
   Interacciones: regalo, confeti, globos, velas, tarjetas y
   música generada con WebAudio (sin archivos de audio).
   ============================================================ */
(function () {
  'use strict';

  /* ------------------------------------------------------------
     0. Base: nombre, preferencias, utilidades
     ------------------------------------------------------------ */
  var params = new URLSearchParams(location.search);
  var NAME = (params.get('nombre') || params.get('name') || 'Ivy').trim().slice(0, 24) || 'Ivy';

  var REDUCE = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var COARSE = window.matchMedia('(hover: none), (pointer: coarse)').matches;

  document.title = '¡Feliz Cumpleaños, ' + NAME + '! 🎂';
  document.querySelectorAll('[data-name]').forEach(function (el) { el.textContent = NAME; });

  /* Bloquea el scroll y atenúa el contenido mientras la intro está abierta.
     Se hace desde JS para que, si el script falla, la página siga usable. */
  if (document.getElementById('intro')) document.body.classList.add('locked');

  function rand(min, max) { return min + Math.random() * (max - min); }
  function pick(arr) { return arr[(Math.random() * arr.length) | 0]; }

  /* ------------------------------------------------------------
     1. Estrellas de fondo
     ------------------------------------------------------------ */
  (function buildStars() {
    var box = document.getElementById('stars');
    if (!box || REDUCE) return;
    var frag = document.createDocumentFragment();
    for (var i = 0; i < 70; i++) {
      var s = document.createElement('i');
      s.className = 'star' + (Math.random() < 0.16 ? ' big' : '');
      s.style.top = rand(0, 100).toFixed(2) + '%';
      s.style.left = rand(0, 100).toFixed(2) + '%';
      s.style.setProperty('--tw', rand(2, 5).toFixed(2) + 's');
      s.style.setProperty('--td', rand(0, 4).toFixed(2) + 's');
      frag.appendChild(s);
    }
    box.appendChild(frag);
  })();

  /* ------------------------------------------------------------
     1b. Decoración temática:
         farolitos y flores de cerezo (Mulán) + nubes (Cinnamon)
     ------------------------------------------------------------ */
  (function buildThemeDecor() {
    var lanternBox = document.getElementById('lanterns');
    if (lanternBox && !REDUCE) {
      var lf = document.createDocumentFragment();
      [
        { l: 8,  s: 1.15, d: 22, dl: 0,   dx: 30 },
        { l: 27, s: .8,   d: 27, dl: 6,   dx: -26 },
        { l: 52, s: 1.35, d: 19, dl: 11,  dx: 22 },
        { l: 71, s: .95,  d: 25, dl: 3.5, dx: -32 },
        { l: 90, s: 1.1,  d: 23, dl: 14,  dx: 18 }
      ].forEach(function (o) {
        var el = document.createElement('span');
        el.className = 'lantern';
        el.style.setProperty('--l', o.l + '%');
        el.style.setProperty('--s', o.s);
        el.style.setProperty('--d', o.d + 's');
        el.style.setProperty('--dl', o.dl + 's');
        el.style.setProperty('--dx', o.dx + 'px');
        lf.appendChild(el);
      });
      lanternBox.appendChild(lf);
    }

    var cloudBox = document.getElementById('clouds');
    if (cloudBox && !REDUCE) {
      var cf = document.createDocumentFragment();
      [[10, .9, 58, 0], [26, 1.4, 78, 18], [44, 1.1, 66, 34], [62, .8, 52, 9]].forEach(function (c) {
        var el = document.createElement('span');
        el.className = 'cloud';
        el.style.setProperty('--t', c[0] + '%');
        el.style.setProperty('--s', c[1]);
        el.style.setProperty('--d', c[2] + 's');
        el.style.setProperty('--dl', '-' + c[3] + 's');
        cf.appendChild(el);
      });
      cloudBox.appendChild(cf);
    }

    var blossomBox = document.getElementById('blossoms');
    if (blossomBox && !REDUCE) {
      var SVGNS = 'http://www.w3.org/2000/svg';
      var bf = document.createDocumentFragment();
      for (var i = 0; i < 14; i++) {
        var svg = document.createElementNS(SVGNS, 'svg');
        svg.setAttribute('class', 'blossom');
        svg.setAttribute('viewBox', '0 0 24 24');
        svg.setAttribute('aria-hidden', 'true');
        var use = document.createElementNS(SVGNS, 'use');
        use.setAttribute('href', '#art-blossom');
        svg.appendChild(use);
        svg.style.setProperty('--l', rand(2, 98).toFixed(1) + '%');
        svg.style.setProperty('--s', rand(.8, 1.5).toFixed(2));
        svg.style.setProperty('--d', rand(13, 24).toFixed(1) + 's');
        svg.style.setProperty('--dl', '-' + rand(0, 20).toFixed(1) + 's');
        svg.style.setProperty('--dx', rand(-70, 70).toFixed(0) + 'px');
        bf.appendChild(svg);
      }
      blossomBox.appendChild(bf);
    }
  })();

  /* ------------------------------------------------------------
     1c. Mascotas: si existe mascots/<nombre>.png se usa esa
         imagen; si no, se conserva el dibujo vectorial.
     ------------------------------------------------------------ */
  (function loadMascots() {
    var slots = document.querySelectorAll('.mascot[data-mascot]');
    if (!slots.length) return;
    Array.prototype.forEach.call(slots, function (slot) {
      var name = slot.getAttribute('data-mascot');
      var img = slot.querySelector('.mascot-img');
      if (!name || !img) return;
      var probe = new Image();
      probe.onload = function () {
        img.src = probe.src;
        img.hidden = false;
        slot.classList.add('has-png');
      };
      probe.src = 'mascots/' + name + '.png';
    });
  })();

  /* ------------------------------------------------------------
     2. Canvas de confeti y partículas
     ------------------------------------------------------------ */
  var canvas = document.getElementById('fx');
  var ctx = canvas.getContext('2d');
  var W = 0, H = 0;

  function sizeCanvas() {
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  sizeCanvas();

  var COLORS = ['#ffcf6b', '#ff6ba9', '#a56bff', '#7be7ff', '#7bffa8', '#ff8a5c', '#ffffff'];
  var MAX_PARTS = REDUCE ? 70 : 460;
  var parts = [];
  var running = false;

  function addPart(p) {
    if (parts.length >= MAX_PARTS) parts.shift();
    parts.push(p);
    start();
  }

  function makeConfetti(x, y, opts) {
    opts = opts || {};
    var power = opts.power || 1;
    var angle = opts.angle != null ? opts.angle + rand(-0.55, 0.55) : rand(0, Math.PI * 2);
    var speed = rand(3.5, 11.5) * power;
    var shape = Math.random();
    return {
      kind: 'conf',
      x: x, y: y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - rand(1, 4.5) * power,
      w: rand(6, 12),
      h: rand(9, 17),
      rot: rand(0, Math.PI * 2),
      vr: rand(-0.22, 0.22),
      color: pick(COLORS),
      shape: shape < 0.3 ? 'ring' : (shape < 0.62 ? 'strip' : 'rect'),
      g: rand(0.13, 0.21),
      drag: 0.986,
      sway: rand(0.3, 1.5),
      phase: rand(0, Math.PI * 2),
      wob: rand(0.04, 0.09),
      life: rand(4, 7.5) * 60,
      age: 0
    };
  }

  function makeHeart(x, y) {
    return {
      kind: 'heart',
      x: x, y: y,
      vx: rand(-1.4, 1.4),
      vy: rand(-3.4, -1.4),
      size: rand(9, 18),
      rot: rand(-0.35, 0.35),
      vr: rand(-0.02, 0.02),
      color: pick(['#ff6ba9', '#ffcf6b', '#a56bff', '#ff9ec6']),
      g: -0.012,
      drag: 0.99,
      sway: rand(0.4, 1.3),
      phase: rand(0, Math.PI * 2),
      wob: rand(0.05, 0.1),
      life: rand(80, 130),
      age: 0
    };
  }

  /** Ráfaga radial de confeti. */
  function burst(x, y, count, opts) {
    var n = REDUCE ? Math.round(count * 0.35) : count;
    for (var i = 0; i < n; i++) addPart(makeConfetti(x, y, opts));
  }

  /** Corazones flotantes. */
  function hearts(x, y, count) {
    var n = REDUCE ? Math.min(count, 4) : count;
    for (var i = 0; i < n; i++) addPart(makeHeart(x, y));
  }

  /** Lluvia desde arriba (celebración grande). */
  function rain(count) {
    var n = REDUCE ? Math.round(count * 0.3) : count;
    for (var i = 0; i < n; i++) {
      var p = makeConfetti(rand(-40, W + 40), rand(-260, -20), { angle: Math.PI / 2, power: 0.24 });
      p.g = rand(0.02, 0.05);
      p.drag = 0.999;
      p.vy = rand(1.6, 3.8);
      p.vx = rand(-1.1, 1.1);
      addPart(p);
    }
  }

  function drawHeart(size) {
    ctx.beginPath();
    ctx.moveTo(0, size * 0.46);
    ctx.bezierCurveTo(size * 1.02, -size * 0.14, size * 0.56, -size * 0.98, 0, -size * 0.34);
    ctx.bezierCurveTo(-size * 0.56, -size * 0.98, -size * 1.02, -size * 0.14, 0, size * 0.46);
    ctx.closePath();
    ctx.fill();
  }

  function loop() {
    ctx.clearRect(0, 0, W, H);

    for (var i = parts.length - 1; i >= 0; i--) {
      var p = parts[i];
      p.age++;
      p.vy += p.g;
      p.vx *= p.drag;
      p.vy *= p.drag;
      p.phase += p.wob;
      p.x += p.vx + Math.sin(p.phase) * p.sway;
      p.y += p.vy;
      p.rot += p.vr;

      var remain = p.life - p.age;
      if (remain <= 0 || p.y > H + 90 || p.x < -140 || p.x > W + 140) {
        parts.splice(i, 1);
        continue;
      }

      ctx.save();
      ctx.globalAlpha = remain < 45 ? Math.max(0, remain / 45) : 1;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;

      if (p.kind === 'heart') {
        drawHeart(p.size);
      } else if (p.shape === 'ring') {
        ctx.beginPath();
        ctx.arc(0, 0, p.w * 0.5, 0, Math.PI * 2);
        ctx.lineWidth = Math.max(2, p.w * 0.3);
        ctx.strokeStyle = p.color;
        ctx.stroke();
      } else if (p.shape === 'strip') {
        ctx.fillRect(-p.w * 0.18, -p.h * 0.5, p.w * 0.36, p.h);
        ctx.fillStyle = 'rgba(255,255,255,.4)';
        ctx.fillRect(-p.w * 0.18, -p.h * 0.5, p.w * 0.36, p.h * 0.45);
      } else {
        ctx.fillRect(-p.w * 0.5, -p.h * 0.5, p.w, p.h);
      }

      ctx.restore();
    }

    if (!parts.length) { running = false; ctx.clearRect(0, 0, W, H); return; }
    requestAnimationFrame(loop);
  }

  function start() {
    if (running) return;
    running = true;
    requestAnimationFrame(loop);
  }

  /* Lluvia suave y continua después de abrir el regalo */
  var rainOn = false;
  function rainLoop() {
    if (!rainOn) return;
    if (!document.hidden && parts.length < MAX_PARTS * 0.5) {
      var p = makeConfetti(rand(-40, W + 40), rand(-120, -20), { angle: Math.PI / 2, power: 0.2 });
      p.g = rand(0.02, 0.045);
      p.drag = 0.999;
      p.vy = rand(1.2, 3);
      p.vx = rand(-0.9, 0.9);
      addPart(p);
    }
    setTimeout(rainLoop, 280);
  }

  /* ------------------------------------------------------------
     3. Audio (WebAudio, sin archivos): sonidos y melodía
     ------------------------------------------------------------ */
  var AC = null, master = null, musicBus = null;

  function audio() {
    if (!AC) {
      var Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return null;
      AC = new Ctx();
      master = AC.createGain();
      master.gain.value = 0.85;
      master.connect(AC.destination);
      musicBus = AC.createGain();
      musicBus.gain.value = 0.0001;
      musicBus.connect(master);
    }
    if (AC.state === 'suspended') AC.resume();
    return AC;
  }

  function tone(freq, startAt, dur, type, vol, onMusic) {
    var ac = audio();
    if (!ac) return;
    var osc = ac.createOscillator();
    var gain = ac.createGain();
    osc.type = type || 'triangle';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.0001, startAt);
    gain.gain.exponentialRampToValueAtTime(Math.max(vol, 0.0002), startAt + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, startAt + dur);
    osc.connect(gain);
    gain.connect(onMusic ? musicBus : master);
    osc.start(startAt);
    osc.stop(startAt + dur + 0.06);
  }

  function popSound() {
    var ac = audio();
    if (!ac) return;
    var t = ac.currentTime;
    var osc = ac.createOscillator();
    var gain = ac.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(720, t);
    osc.frequency.exponentialRampToValueAtTime(140, t + 0.11);
    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.16);
    osc.connect(gain);
    gain.connect(master);
    osc.start(t);
    osc.stop(t + 0.2);
  }

  function chime(base) {
    var ac = audio();
    if (!ac) return;
    var t = ac.currentTime;
    tone(base || 880, t, 0.5, 'sine', 0.18);
    tone((base || 880) * 1.5, t + 0.06, 0.45, 'sine', 0.12);
    tone((base || 880) * 2, t + 0.12, 0.5, 'sine', 0.08);
  }

  /* "Cumpleaños feliz" — [frecuencia, tiempo en beats, duración en beats] */
  var BEAT = 0.42;
  var LOOP_BEATS = 25;
  var MELODY = [
    [392, 0, .5], [392, .5, .5], [440, 1, 1], [392, 2, 1], [523.25, 3, 1], [493.88, 4, 2],
    [392, 6, .5], [392, 6.5, .5], [440, 7, 1], [392, 8, 1], [587.33, 9, 1], [523.25, 10, 2],
    [392, 12, .5], [392, 12.5, .5], [783.99, 13, 1], [659.25, 14, 1], [523.25, 15, 1], [493.88, 16, 1], [440, 17, 2],
    [698.46, 19, .5], [698.46, 19.5, .5], [659.25, 20, 1], [523.25, 21, 1], [587.33, 22, 1], [523.25, 23, 2]
  ];
  var BASS = [[130.81, 0, 4], [174.61, 4, 4], [196, 8, 4], [130.81, 12, 4], [174.61, 16, 4], [196, 20, 5]];

  var musicOn = false, musicTimer = null;
  var musicBtn = document.getElementById('musicBtn');

  function playMelody() {
    var ac = audio();
    if (!ac) return;
    var t0 = ac.currentTime + 0.1;
    MELODY.forEach(function (n) {
      tone(n[0], t0 + n[1] * BEAT, n[2] * BEAT * 0.92, 'triangle', 0.22, true);
      tone(n[0] * 2, t0 + n[1] * BEAT, n[2] * BEAT * 0.6, 'sine', 0.05, true);
    });
    BASS.forEach(function (b) {
      tone(b[0], t0 + b[1] * BEAT, b[2] * BEAT * 0.95, 'sine', 0.12, true);
    });
  }

  function scheduleMusic() {
    playMelody();
    musicTimer = setTimeout(scheduleMusic, LOOP_BEATS * BEAT * 1000);
  }

  function setMusic(on) {
    var ac = audio();
    if (!ac || !musicBus) return;
    musicOn = on;
    musicBtn.setAttribute('aria-pressed', on ? 'true' : 'false');
    musicBtn.classList.toggle('on', on);
    musicBtn.textContent = on ? 'Música ♪ (sonando)' : 'Música ♪';
    clearTimeout(musicTimer);
    if (on) {
      musicBus.gain.cancelScheduledValues(ac.currentTime);
      musicBus.gain.setValueAtTime(0.0001, ac.currentTime);
      musicBus.gain.exponentialRampToValueAtTime(1, ac.currentTime + 0.8);
      scheduleMusic();
    } else {
      musicBus.gain.cancelScheduledValues(ac.currentTime);
      musicBus.gain.setTargetAtTime(0.0001, ac.currentTime, 0.2);
    }
  }

  if (musicBtn) {
    musicBtn.addEventListener('click', function () { setMusic(!musicOn); });
  }

  /* ------------------------------------------------------------
     4. Aviso flotante
     ------------------------------------------------------------ */
  var toastEl = document.getElementById('toast');
  var toastTimer = null;
  function toast(msg, ms) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove('show'); }, ms || 3200);
  }

  /* ------------------------------------------------------------
     5. Intro: abrir el regalo
     ------------------------------------------------------------ */
  var intro = document.getElementById('intro');
  var giftBtn = document.getElementById('giftBtn');
  var opened = false;

  function openGift() {
    if (opened) return;
    opened = true;

    audio(); // desbloquea el audio con este gesto del usuario
    document.body.classList.remove('locked');
    giftBtn.classList.add('open');

    var r = giftBtn.getBoundingClientRect();
    var cx = r.left + r.width / 2;
    var cy = r.top + r.height / 2;
    burst(cx, cy, 130, { power: 1.6 });
    setTimeout(function () { burst(cx, cy - 40, 70, { power: 1.3 }); }, 180);
    setTimeout(function () { rain(90); }, 260);
    hearts(cx, cy, 12);
    chime(660);

    if (!REDUCE) { rainOn = true; rainLoop(); }

    setTimeout(function () { intro.classList.add('gone'); }, 420);
    setTimeout(function () { toast('¡Feliz cumpleaños, ' + NAME + '! 🎉'); }, 1500);

    /* La música arranca sola, con un pequeño respiro. */
    setTimeout(function () { if (!musicOn) setMusic(true); }, 900);
  }
  giftBtn.addEventListener('click', openGift);

  /* Si el usuario prefiere saltar la intro con teclado */
  giftBtn.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openGift(); }
  });

  /* ------------------------------------------------------------
     6. Confeti al tocar la pantalla
     ------------------------------------------------------------ */
  var lastTap = 0;
  window.addEventListener('pointerdown', function (e) {
    if (e.target.closest('.candle')) return; // las velas tienen su propia magia
    var now = Date.now();
    if (now - lastTap < 90) return;
    lastTap = now;
    burst(e.clientX, e.clientY, 26, { power: 1 });
    hearts(e.clientX, e.clientY, 3);
  }, { passive: true });

  /* Botón "Lanzar deseos" */
  var wishBtn = document.getElementById('wishBtn');
  if (wishBtn) {
    wishBtn.addEventListener('click', function () {
      chime(784);
      var spots = 3;
      for (var i = 0; i < spots; i++) {
        (function (i) {
          setTimeout(function () {
            var x = W * (0.2 + i * 0.3);
            burst(x, H * 0.85, 55, { power: 1.5 });
            hearts(x, H * 0.85, 6);
          }, i * 170);
        })(i);
      }
      rain(70);
      toast('Deseo lanzado al cielo ✨');
    });
  }

  /* ------------------------------------------------------------
     7. Globos que explotan
     ------------------------------------------------------------ */
  var balloonsBox = document.getElementById('balloons');
  var BALLOON_COLORS = [
    ['#ff8fbf', '#e0438a'],
    ['#b98cff', '#7b3fd6'],
    ['#ffd97a', '#e0a53c'],
    ['#8fe9ff', '#3aa9d6'],
    ['#95ffb9', '#2fa864'],
    ['#ffb08a', '#e06a2e']
  ];
  var popped = 0;

  function buildBalloon(def, i) {
    var b = document.createElement('div');
    b.className = 'balloon';
    b.style.left = def.left + '%';
    b.style.top = def.top + '%';
    b.style.setProperty('--size', def.size + 'px');
    b.style.setProperty('--str', def.str + 'px');
    b.style.setProperty('--c1', def.c1);
    b.style.setProperty('--c2', def.c2);
    b.style.setProperty('--dur', def.dur + 's');
    b.style.setProperty('--delay', (def.delay + i * 0.15) + 's');
    b.style.zIndex = def.z;
    b.innerHTML = '<span class="balloon-body"></span><span class="balloon-string"></span>';
    b.addEventListener('click', function (ev) {
      ev.stopPropagation();
      if (b.classList.contains('popped')) return;
      popBalloon(b);
    });
    return b;
  }

  function popBalloon(b) {
    var r = b.getBoundingClientRect();
    var cx = r.left + r.width / 2;
    var cy = r.top + r.height * 0.45;
    b.classList.add('popped');
    burst(cx, cy, 46, { power: 1.25 });
    hearts(cx, cy, 3);
    popSound();
    popped++;

    var labels = ['¡Pum!', '¡Plop!', '¡Pop!', '¡Fiuu!'];
    if (popped === 1) toast('Globos reventados: 1 🎈');
    else if (popped % 5 === 0) toast(labels[(Math.random() * labels.length) | 0] + ' Globos: ' + popped + ' 🎈');

    setTimeout(function () {
      /* El globo vuelve a inflarse, en otro sitio */
      b.style.left = rand(4, 88) + '%';
      b.style.top = rand(4, 62) + '%';
      b.classList.remove('popped');
    }, rand(2600, 5200));
  }

  var balloonDefs = [
    { left: 6, top: 16, size: 78, str: 70, z: 2, c1: BALLOON_COLORS[0][0], c2: BALLOON_COLORS[0][1], dur: 6.5, delay: 0 },
    { left: 86, top: 11, size: 66, str: 58, z: 2, c1: BALLOON_COLORS[1][0], c2: BALLOON_COLORS[1][1], dur: 7.4, delay: .8 },
    { left: 15, top: 62, size: 60, str: 84, z: 2, c1: BALLOON_COLORS[2][0], c2: BALLOON_COLORS[2][1], dur: 6.1, delay: 1.5 },
    { left: 80, top: 58, size: 72, str: 66, z: 2, c1: BALLOON_COLORS[3][0], c2: BALLOON_COLORS[3][1], dur: 7.8, delay: .4 },
    { left: 2, top: 40, size: 52, str: 54, z: 1, c1: BALLOON_COLORS[4][0], c2: BALLOON_COLORS[4][1], dur: 6.9, delay: 2.1 },
    { left: 92, top: 36, size: 56, str: 62, z: 1, c1: BALLOON_COLORS[5][0], c2: BALLOON_COLORS[5][1], dur: 7.1, delay: 1.2 },
    { left: 30, top: 6, size: 46, str: 46, z: 1, c1: BALLOON_COLORS[1][0], c2: BALLOON_COLORS[1][1], dur: 8.2, delay: 2.8 },
    { left: 66, top: 3, size: 44, str: 42, z: 1, c1: BALLOON_COLORS[0][0], c2: BALLOON_COLORS[0][1], dur: 7.6, delay: 3.4 }
  ];

  if (balloonsBox) {
    if (COARSE) balloonDefs.forEach(function (d) { d.size *= 0.78; d.str *= 0.8; });
    balloonDefs.forEach(function (d, i) { balloonsBox.appendChild(buildBalloon(d, i)); });
  }

  /* ------------------------------------------------------------
     8. Pastel: apagar y encender velas
     ------------------------------------------------------------ */
  var candlesBox = document.getElementById('candles');
  var cakeStatus = document.getElementById('cakeStatus');
  var TOTAL_CANDLES = 5;
  var litCount = TOTAL_CANDLES;

  function makeCandle(i) {
    var c = document.createElement('div');
    c.className = 'candle';
    c.setAttribute('role', 'button');
    c.setAttribute('tabindex', '0');
    c.setAttribute('aria-label', 'Vela ' + (i + 1) + ': tocar para apagar');
    var flame = document.createElement('span');
    flame.className = 'flame';
    flame.style.animationDelay = (-i * 0.07).toFixed(2) + 's';
    c.appendChild(flame);

    function blow() {
      if (c.classList.contains('out')) return;
      c.classList.add('out');
      c.setAttribute('aria-label', 'Vela ' + (i + 1) + ': apagada');
      var smoke = document.createElement('span');
      smoke.className = 'smoke';
      c.appendChild(smoke);
      setTimeout(function () { if (smoke.parentNode === c) c.removeChild(smoke); }, 1600);

      var r = c.getBoundingClientRect();
      burst(r.left + r.width / 2, r.top - 10, 10, { power: 0.5 });
      tone(rand(420, 560), (audio() ? audio().currentTime : 0), 0.18, 'sine', 0.12);

      updateCake();
    }

    c.addEventListener('click', function (e) { e.stopPropagation(); blow(); });
    c.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); blow(); }
    });
    return c;
  }

  function buildCandles() {
    if (!candlesBox) return;
    candlesBox.innerHTML = '';
    for (var i = 0; i < TOTAL_CANDLES; i++) candlesBox.appendChild(makeCandle(i));
    litCount = TOTAL_CANDLES;
    updateCake();
  }

  var celebrated = false;

  function updateCake() {
    if (!candlesBox) return;
    litCount = candlesBox.querySelectorAll('.candle:not(.out)').length;
    cakeStatus.classList.toggle('done', litCount === 0);
    cakeStatus.innerHTML = litCount === 0
      ? '¡Velas apagadas! <strong>Pide tu deseo ✨</strong>'
      : 'Velas encendidas: <strong>' + litCount + '</strong>';

    if (litCount === 0 && !celebrated) {
      celebrated = true;
      setTimeout(bigCelebration, 550);
    }
  }

  function bigCelebration() {
    var rect = candlesBox ? candlesBox.getBoundingClientRect() : { left: W / 2, top: H / 2, width: 0, height: 0 };
    var cx = rect.left + rect.width / 2;
    var cy = rect.top + rect.height / 2;
    burst(cx, cy, 150, { power: 1.8 });
    setTimeout(function () { burst(cx, cy, 90, { power: 1.4 }); }, 260);
    setTimeout(function () { burst(W * 0.2, H * 0.75, 70, { power: 1.5 }); }, 420);
    setTimeout(function () { burst(W * 0.8, H * 0.75, 70, { power: 1.5 }); }, 560);
    rain(120);
    hearts(cx, cy, 16);
    chime(880);
    setTimeout(function () { chime(1046); }, 260);
    toast('✨ Deseo enviado. Que se cumpla, ' + NAME + ' 💛', 5000);
  }

  var blowBtn = document.getElementById('blowBtn');
  if (blowBtn) {
    blowBtn.addEventListener('click', function () {
      var lit = Array.prototype.slice.call(candlesBox.querySelectorAll('.candle:not(.out)'));
      if (!lit.length) { toast('Ya están apagadas 😊'); return; }
      lit.forEach(function (c, i) {
        setTimeout(function () { c.dispatchEvent(new MouseEvent('click', { bubbles: false })); }, i * 220);
      });
    });
  }

  var relightBtn = document.getElementById('relightBtn');
  if (relightBtn) {
    relightBtn.addEventListener('click', function () {
      celebrated = false;
      buildCandles();
      toast('Velas encendidas otra vez 🕯️');
    });
  }

  buildCandles();

  /* ------------------------------------------------------------
     9. Tarjetas que se voltean
     ------------------------------------------------------------ */
  var CARDS = [
    { emoji: '🌟', title: 'Tu luz', glow: 'rgba(255,207,107,.22)', text: 'Donde tú llegas, el ambiente cambia. Iluminas sin darte cuenta, y eso no se aprende: se tiene.' },
    { emoji: '💛', title: 'Tu corazón', glow: 'rgba(255,107,169,.22)', text: 'Ese cariño que das sin esperar nada a cambio vale más que cualquier regalo. Gracias por ser así.' },
    { emoji: '🚀', title: 'Tus sueños', glow: 'rgba(165,107,255,.22)', text: 'Ojalá este año te acerques un pasito más a cada cosa que te ilusiona. Y que puedas presumirlo.' }
  ];

  var cardsBox = document.getElementById('cards');
  if (cardsBox) {
    CARDS.forEach(function (c, i) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'card';
      btn.style.animationDelay = (0.12 * i).toFixed(2) + 's';
      btn.setAttribute('aria-label', c.title + ': toca para girar la tarjeta');
      btn.innerHTML =
        '<span class="card-inner">' +
          '<span class="card-face card-front" style="--glow:' + c.glow + '">' +
            '<span class="card-emoji">' + c.emoji + '</span>' +
            '<span class="card-title">' + c.title + '</span>' +
            '<span class="card-tap">Toca para girar</span>' +
          '</span>' +
          '<span class="card-face card-back">' +
            '<span class="card-back-text">' + c.text + '</span>' +
          '</span>' +
        '</span>';

      btn.addEventListener('click', function () {
        btn.classList.toggle('flipped');
        chime(btn.classList.contains('flipped') ? 620 : 520);
        var r = btn.getBoundingClientRect();
        hearts(r.left + r.width / 2, r.top + r.height / 2, 2);
      });
      cardsBox.appendChild(btn);
    });
  }

  /* ------------------------------------------------------------
     10. Carta: celebrar otra vez
     ------------------------------------------------------------ */
  var letterBtn = document.getElementById('letterBtn');
  if (letterBtn) {
    letterBtn.addEventListener('click', function () {
      celebrated = false;
      bigCelebration();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ------------------------------------------------------------
     11. Máquina de escribir (frases rotativas)
     ------------------------------------------------------------ */
  var typedEl = document.getElementById('typed');
  var PHRASES = [
    'Otro año de brillar ✨',
    'Gracias por existir, ' + NAME + ' 💛',
    'Que se cumplan todos tus sueños 🎂',
    'Hoy el mundo celebra que naciste 🎉',
    'Eres pura luz y buena energía 🌟'
  ];

  if (typedEl) {
    if (REDUCE) {
      typedEl.textContent = PHRASES[0];
    } else {
      var pi = 0, ci = 0, deleting = false;
      (function type() {
        var txt = PHRASES[pi % PHRASES.length];
        typedEl.textContent = txt.slice(0, ci);
        var wait = deleting ? 38 : 62;

        if (!deleting && ci === txt.length) { deleting = true; wait = 2000; }
        else if (deleting && ci === 0) { deleting = false; pi++; wait = 320; }
        else { ci += deleting ? -1 : 1; }

        setTimeout(type, wait);
      })();
    }
  }

  /* ------------------------------------------------------------
     12. Reveal al hacer scroll
     ------------------------------------------------------------ */
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !REDUCE) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add('active');
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('active'); });
  }

  /* ------------------------------------------------------------
     13. Destello que sigue al cursor (solo puntero fino)
     ------------------------------------------------------------ */
  var glow = document.getElementById('cursorGlow');
  if (glow && !COARSE && !REDUCE) {
    var gx = 0, gy = 0, tx = 0, ty = 0, glowRaf = null;
    function glowLoop() {
      gx += (tx - gx) * 0.14;
      gy += (ty - gy) * 0.14;
      glow.style.transform = 'translate3d(' + gx + 'px,' + gy + 'px,0)';
      glowRaf = requestAnimationFrame(glowLoop);
    }
    window.addEventListener('pointermove', function (e) {
      tx = e.clientX; ty = e.clientY;
      if (!glow.classList.contains('on')) {
        glow.classList.add('on');
        gx = tx; gy = ty;
        if (!glowRaf) glowLoop();
      }
    }, { passive: true });
    window.addEventListener('pointerleave', function () { glow.classList.remove('on'); });
  }

  /* ------------------------------------------------------------
     14. Redimensionar y limpieza
     ------------------------------------------------------------ */
  var rzTimer = null;
  window.addEventListener('resize', function () {
    clearTimeout(rzTimer);
    rzTimer = setTimeout(sizeCanvas, 180);
  });

  /* Al volver a la pestaña, no se acumulan partículas invisibles */
  document.addEventListener('visibilitychange', function () {
    if (document.hidden && parts.length > 120) {
      parts = parts.slice(0, 120);
    }
  });

  /* Pista inicial */
  setTimeout(function () {
    if (!opened && document.getElementById('introHint')) {
      document.getElementById('introHint').textContent = 'Toca el regalo 🎁';
    }
  }, 4200);
})();
