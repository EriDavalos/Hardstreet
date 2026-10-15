// ==================================================================
// HARD STREET — Diseño del sitio y iconos de servicios (web)
// ==================================================================
// El diseñador del panel (Paquetes → Diseñar cards) guarda un documento y la
// web lo aplica con `gallery/assets/site.js`. Aquí se revisa, SIN navegador y
// sin backend, que ese documento se traduzca al CSS correcto y que los iconos
// `material:…` de los servicios se dibujen con Material Symbols.
//
// Se ejecuta con:  node --test tests/
// ==================================================================

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import vm from 'node:vm';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');

/** Carga un script del sitio en un contexto mínimo (sin DOM). */
function loadScript(relativePath) {
  const src = readFileSync(join(root, relativePath), 'utf8');
  const ctx = { window: {}, console };
  vm.createContext(ctx);
  vm.runInContext(src, ctx, { filename: relativePath });
  return ctx;
}

const site = loadScript('gallery/assets/site.js');
const HSSite = site.window.HSSite;
const models = loadScript('gallery/assets/models.js');

const cssWith = (design) => HSSite.css(design);

/** Selectores que el diseño OCULTA (`…{display:none !important;}`). */
function hiddenSelectors(css) {
  const out = new Set();
  for (const m of css.matchAll(/([^{}]+)\{display:none !important;\}/g)) {
    for (const sel of m[1].split(',')) out.add(sel.trim());
  }
  return out;
}

// ------------------------------------------------------------------
// 1. Sin diseño guardado, la web se ve como siempre
// ------------------------------------------------------------------

test('sin diseño guardado se aplican los defaults (nada cambia)', () => {
  const css = cssWith(null);
  assert.match(css, /--gold:#C9A96E;/);
  assert.match(css, /--gold-light:#F0D48A;/);
  assert.match(css, /grid-template-columns:repeat\(3,minmax\(0,1fr\)\)/);
  assert.match(css, /\.package-card\{border-radius:18px;\}/);
  assert.match(css, /\.pkg-flyer-inner\{padding:32px;\}/);
  // Ningún elemento del diseño arranca oculto.
  assert.doesNotMatch(css, /display:none/);
});

test('un documento incompleto no rompe el diseño (se mezcla con los defaults)', () => {
  const css = cssWith({ card: { columns: 2 } });
  assert.match(css, /grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/);
  // Lo que no vino, sigue con su valor de siempre.
  assert.match(css, /\.package-card\{border-radius:18px;\}/);
  assert.match(css, /\.pkg-flyer-inner\{padding:32px;\}/);
});

// ------------------------------------------------------------------
// 2. Lo que se diseña en el panel, se ve en la web
// ------------------------------------------------------------------

test('el diseño de las tarjetas manda forma, densidad y textos', () => {
  const css = cssWith({
    card: {
      columns: 4,
      gap: 12,
      radius: 4,
      borderWidth: 2,
      padding: 10,
      lineTop: false,
      hoverLift: false,
      shadow: false,
      serifNames: false,
      uppercaseNames: true,
    },
  });
  assert.match(css, /grid-template-columns:repeat\(4,minmax\(0,1fr\)\)/);
  assert.match(css, /\.packages-grid\{gap:12px;/);
  assert.match(css, /\.package-card\{border-radius:4px;\}/);
  assert.match(css, /\.pkg-flyer-inner\{padding:10px;\}/);
  assert.match(css, /\.pkg-name\{font-family:'Inter',sans-serif;/);
  assert.match(css, /text-transform:uppercase;/);
  assert.match(css, /\.package-card::before\{display:none !important;\}/);
  assert.match(css, /\.package-card:hover\{transform:none !important;\}/);
  assert.match(css, /border-width:2px;/);
});

test('los interruptores ocultan justo lo que se apaga', () => {
  const css = cssWith({
    card: {
      showCategory: false,
      showSubtitle: false,
      showServiceCount: false,
      showPrice: false,
      ctaLabel: 'Solicitar',
    },
  });
  const hidden = hiddenSelectors(css);
  assert.ok(hidden.has('.pkg-category'), 'debería ocultar la categoría');
  assert.ok(hidden.has('.pkg-subtitle'), 'debería ocultar el subtítulo');
  assert.ok(hidden.has('.pkg-price'), 'debería ocultar el precio');
  assert.ok(
    hidden.has('.pkg-services-count'),
    'sin «cuántos servicios» se oculta el rótulo y su encabezado'
  );
  // Lo que sigue encendido NO se oculta.
  assert.ok(!hidden.has('.pkg-services'));
  assert.ok(!hidden.has('.pkg-cta'));
});

test('la paleta de cada tier se aplica a su tarjeta', () => {
  const css = cssWith({
    tiers: { premium: { accent: '#FF0000', accentSoft: '#FFAA00', dark: '#010203' } },
  });
  assert.match(css, /\.package-card\.tier-premium\{background:#010203;/);
  assert.match(css, /rgba\(255, 0, 0, 0\.55\)/); // borde con el acento
  assert.match(css, /\.package-card\.tier-premium \.pkg-price-value,\.package-card\.tier-premium \.pkg-category-name\{color:#FF0000;\}/);
  // El degradado del badge usa el acento y su versión clara.
  assert.match(css, /linear-gradient\(135deg,#FF0000,#FFAA00\)/);
  // Los otros tiers no se tocan.
  assert.match(css, /\.package-card\.tier-basic\{background:#0B111A;/);
});

test('el CSS es puro: mismo diseño, mismo resultado', () => {
  const design = { card: { columns: 2, radius: 7 }, brand: { gold: '#123456' } };
  assert.equal(cssWith(design), cssWith(structuredClone(design)));
});

// ------------------------------------------------------------------
// 3. Iconos de servicios: los mismos que el panel (material:…)
// ------------------------------------------------------------------

test('un icono elegido en el panel se dibuja con Material Symbols', () => {
  const html = models.resolveServiceIcon('material:videocam');
  assert.match(html, /class="material-symbols-outlined"/);
  assert.match(html, />videocam</);
  // Y no se cuela nada raro del valor guardado.
  const nasty = models.resolveServiceIcon('material:video"><script>alert(1)</script>');
  assert.doesNotMatch(nasty, /<script>/);
});

test('los iconos heredados (icon/*.svg) siguen funcionando', () => {
  const legacy = models.resolveServiceIcon('icon/photos.svg');
  assert.match(legacy, /<svg/);
  // Un valor desconocido cae al icono general, nunca a un hueco vacío.
  assert.match(models.resolveServiceIcon('icon/no-existe.svg'), /<svg/);
  assert.match(models.resolveServiceIcon(''), /<svg/);
});

test('las páginas que muestran servicios cargan la tipografía de iconos', () => {
  const pages = ['index.html', 'gallery/home/index.html', 'gallery/package/index.html', 'gallery/photos/index.html'];
  for (const page of pages) {
    const html = readFileSync(join(root, page), 'utf8');
    assert.match(
      html,
      /fonts\.googleapis\.com\/css2\?family=Material\+Symbols\+Outlined/,
      `${page} debería cargar Material Symbols`
    );
  }
});
