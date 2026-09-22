/* ============================================================
   PARA TI — vida de la flor
   Pétalos generados, polen, pétalos que caen,
   destellos al tocar y "volver a florecer".
   ============================================================ */
(function () {
  'use strict';

  const scene = document.querySelector('.scene');
  const plant = document.querySelector('.plant');
  const flower = document.getElementById('flower');
  const raysLayers = document.querySelectorAll('.rays');
  const replantBtn = document.getElementById('replant');
  const hint = document.getElementById('hint');

  const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const rand = (min, max) => Math.random() * (max - min) + min;

  /* Elimina partículas al terminar su animación, con respaldo por
     tiempo (los eventos animationend pueden no llegar si la pestaña
     está oculta, y así nunca se acumulan). */
  function autoRemove(el, ms) {
    const drop = () => el.remove();
    el.addEventListener('animationend', drop, { once: true });
    setTimeout(drop, ms);
  }

  /* Límite de partículas vivas para no saturar la escena */
  function particlesFull() {
    return scene.querySelectorAll('.pollen, .falling-petal').length > 90;
  }

  /* ---------- Tamaño responsivo de la flor ---------- */
  function flowerSize() {
    return Math.round(Math.max(150, Math.min(210, scene.clientWidth * 0.36)));
  }
  function applySize() {
    document.documentElement.style.setProperty('--fsize', flowerSize() + 'px');
  }
  applySize();

  /* ---------- Pétalos (dos capas de rayos) ---------- */
  function buildRays() {
    raysLayers.forEach((layer, li) => {
      layer.innerHTML = '';
      const count = 16;
      for (let i = 0; i < count; i++) {
        const ray = document.createElement('span');
        ray.className = 'ray';
        const angle = (360 / count) * i + (li === 1 ? 360 / (count * 2) : 0);
        ray.style.setProperty('--ang', `${angle}deg`);
        if (!REDUCED) ray.style.animationDelay = `${1.8 + i * 0.05 + li * 0.35}s`;
        layer.appendChild(ray);
      }
    });
  }
  buildRays();

  /* ---------- Polen que emana del centro ---------- */
  function spawnPollen(n) {
    if (particlesFull()) return;
    const s = scene.getBoundingClientRect();
    const f = flower.getBoundingClientRect();
    const cx = f.left - s.left + f.width / 2;
    const cy = f.top - s.top + f.height / 2;
    for (let i = 0; i < n; i++) {
      const p = document.createElement('span');
      p.className = 'pollen';
      const angle = rand(0, Math.PI * 2);
      const dist = rand(30, 90);
      p.style.left = `${cx}px`;
      p.style.top = `${cy}px`;
      p.style.setProperty('--px', `${Math.cos(angle) * dist}px`);
      p.style.setProperty('--py', `${Math.sin(angle) * dist - rand(20, 60)}px`);
      p.style.setProperty('--dur', `${rand(3.2, 5.5)}s`);
      p.style.setProperty('--del', `${rand(0, 2.5)}s`);
      scene.appendChild(p);
      autoRemove(p, 7000);
    }
  }
  if (!REDUCED) {
    setTimeout(() => {
      spawnPollen(8);
      setInterval(() => spawnPollen(3), 3600);
    }, 3400);
  }

  /* ---------- Pétalos que caen lentamente ---------- */
  function spawnFallingPetal() {
    const s = scene.getBoundingClientRect();
    const f = flower.getBoundingClientRect();
    const fp = document.createElement('span');
    fp.className = 'falling-petal';
    fp.style.left = `${f.left - s.left + f.width / 2 + rand(-40, 40)}px`;
    fp.style.top = `${f.top - s.top + f.height * 0.55}px`;
    fp.style.setProperty('--fall', `${scene.clientHeight * 0.8}px`);
    fp.style.setProperty('--sw', `${rand(18, 55)}px`);
    fp.style.setProperty('--fdur', `${rand(6, 9)}s`);
    scene.appendChild(fp);
    autoRemove(fp, 10000);
  }
  if (!REDUCED) {
    setInterval(() => { if (Math.random() < 0.55) spawnFallingPetal(); }, 4200);
  }

  /* ---------- Tocar la flor: destello, polen y palabras ---------- */
  const WORDS = ['Eres luz', 'Para ti', 'Brilla', 'Gracias', 'Te quiero', 'Sonríe', 'Bello día', 'Florece'];
  let wordIdx = 0;

  function flowerCenter() {
    const s = scene.getBoundingClientRect();
    const f = flower.getBoundingClientRect();
    return { x: f.left - s.left + f.width / 2, y: f.top - s.top + f.height / 2 };
  }

  function celebrate() {
    const { x, y } = flowerCenter();

    // Ondas doradas
    for (let i = 0; i < 3; i++) {
      const ring = document.createElement('span');
      ring.className = 'burst';
      ring.style.animationDelay = `${i * 0.12}s`;
      flower.appendChild(ring);
      autoRemove(ring, 1400);
    }
    // Ráfaga de polen
    spawnPollen(14);
    // Palabra flotante
    const w = document.createElement('span');
    w.className = 'floating-word';
    w.textContent = WORDS[wordIdx++ % WORDS.length];
    w.style.left = `${x}px`;
    w.style.top = `${y}px`;
    w.style.setProperty('--wx', `${rand(-50, 50)}px`);
    w.style.setProperty('--wy', `${rand(-80, -40)}px`);
    w.style.setProperty('--wr', `${rand(-6, 6)}deg`);
    scene.appendChild(w);
    autoRemove(w, 3200);
    if (hint) hint.classList.add('done');
  }

  flower.addEventListener('pointerdown', celebrate);
  flower.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); celebrate(); }
  });

  /* ---------- Volver a florecer ---------- */
  function replayGrow() {
    spawnPollen(10);
    plant.classList.add('replay');   // congela un instante
    void plant.offsetWidth;          // fuerza reflow
    requestAnimationFrame(() => {
      plant.classList.remove('replay'); // las animaciones arrancan de nuevo
      if (hint) hint.classList.remove('done');
    });
  }
  if (replantBtn) replantBtn.addEventListener('click', replayGrow);

  /* ---------- Al volver a la pestaña, limpia partículas creadas en segundo plano ---------- */
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      scene.querySelectorAll('.pollen, .falling-petal, .floating-word').forEach(el => el.remove());
    }
  });

  /* ---------- Recalcular en resize ---------- */
  let rz;
  window.addEventListener('resize', () => {
    clearTimeout(rz);
    rz = setTimeout(() => { applySize(); buildRays(); }, 200);
  });
})();
