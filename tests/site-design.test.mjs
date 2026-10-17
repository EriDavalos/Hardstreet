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
  // Lo que no vino (foto, animación) se queda con su valor de siempre.
  assert.doesNotMatch(css, /pkg-photo/);
  assert.match(css, /animation:hsPkgIn 600ms/);
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
// 2b. Foto del paquete y animación de entrada
// ------------------------------------------------------------------

test('sin foto en el diseño no se pinta ninguna foto', () => {
  const css = cssWith(null);
  assert.doesNotMatch(css, /\.pkg-photo\{/);
  assert.doesNotMatch(css, /\.pkg-photo-bg\{/);
});

test('la foto va en banda arriba con el alto del diseño', () => {
  const css = cssWith({ card: { imageMode: 'top', imageHeight: 220 } });
  assert.match(css, /\.pkg-photo\{display:block;width:100%;height:220px;object-fit:cover;\}/);
  // En modo banda, la foto de fondo no existe.
  assert.doesNotMatch(css, /pkg-photo-bg/);
});

test('la foto de fondo se ve a todo color y la oscurece el velo NEGRO', () => {
  const css = cssWith({ card: { imageMode: 'bg', imageFade: 0.8 } });
  assert.match(css, /\.pkg-photo-bg\{position:absolute;inset:0;background-size:cover;/);
  // La foto NO se apaga con `opacity` (así se veía lavada): la oscurece el
  // degradado que va ENCIMA, que es lo que deja ver la foto y leer el texto.
  assert.doesNotMatch(
    css,
    /\.pkg-photo-bg\{position:absolute;inset:0;background-size:cover;[^}]*opacity:/
  );
  assert.match(
    css,
    /\.pkg-photo-bg::after\{content:'';position:absolute;inset:0;background:linear-gradient\(180deg,/
  );
  // El velo es NEGRO (el mismo que pone el panel) y `imageFade` manda cuánto
  // tapa: abajo del todo tapa justo ese valor (0.8).
  assert.match(css, /rgba\(0, 0, 0, 0\.8\) 100%\)/);
  // Y NO cambia por tier: ya no hay un degradado propio de cada tarjeta.
  assert.doesNotMatch(css, /\.tier-\w+ \.pkg-photo-bg::after\{/);
  assert.doesNotMatch(css, /rgba\(11, 14, 23, 0\.8\) 100%\)/);
  // Con la foto de fondo, el pie se apoya en un poco más de negro.
  assert.match(css, /\.pkg-footer\{background:rgba\(0, 0, 0, 0\.34\);\}/);
  assert.match(css, /\.package-card>\.pkg-flyer-inner\{position:relative;z-index:1;\}/);
});

test('la tarjeta de la web se pinta como la del panel (mismas piezas y textos)', () => {
  const css = cssWith(null);
  // Nombre BLANCO en todos los tiers (el panel no usa degradados en el nombre).
  assert.match(css, /\.package-card\.tier-premium \.pkg-name\{color:#fff;\}/);
  assert.match(css, /\.package-card\.tier-gold \.pkg-name\{color:#fff;\}/);
  // La descripción del paquete va en la tarjeta, como en el panel.
  assert.match(css, /\.package-card\.tier-premium \.pkg-subtitle,\.package-card\.tier-premium \.pkg-description\{color:rgba\(255, 255, 255, 0\.55\);\}/);
  // Y el pie lleva el tinte del acento de su tier.
  assert.match(css, /\.package-card\.tier-basic \.pkg-footer\{background:rgba\(143, 176, 212, 0\.05\);\}/);

  // El marcado: badge EN FLUJO dentro del contenido (no flotando encima de la
  // foto) y la descripción entre el subtítulo y la línea.
  const r = loadScript('gallery/assets/renderers.js');
  r.window.HS_SITE_DESIGN = null;
  const html = r.renderPackageCard(pkgBase({ description: 'Cobertura de todo el día' }));
  const inner = html.slice(html.indexOf('pkg-flyer-inner'));
  assert.match(
    inner,
    /pkg-flyer-inner">\s*<div class="pkg-tier-badge/,
    'el badge va como primera pieza del contenido'
  );
  assert.match(inner, /<p class="pkg-description">Cobertura de todo el d\u00eda<\/p>/);
  assert.ok(
    inner.indexOf('pkg-subtitle') < inner.indexOf('pkg-description') &&
      inner.indexOf('pkg-description') < inner.indexOf('pkg-divider'),
    'la descripción va entre el subtítulo y la línea'
  );
  // Sin descripción no se pinta el hueco.
  const sin = r.renderPackageCard(pkgBase({ description: '' }));
  assert.doesNotMatch(sin, /pkg-description/);
});

/** Paquete de prueba con lo mínimo que pinta una tarjeta. */
function pkgBase(extra = {}) {
  return Object.assign(
    {
      id: 1,
      urlImage: '',
      services: [],
      tier: { key: 'premium' },
      tierLabel: 'Premium',
      categoryKey: 'boda',
      packageCategory: { name: 'Bodas' },
      categoryIcon: '\u{1F4F7}',
      priceFormatted: '$1',
      currency: 'MXN',
      name: 'X',
      subtitle: 'Sub',
      description: '',
    },
    extra
  );
}

test('con la foto en banda (o sin foto) no se pinta ningún degradado de fondo', () => {
  const banda = cssWith({ card: { imageMode: 'top' } });
  assert.doesNotMatch(banda, /pkg-photo-bg|pkg-photo-fade/);
  const sin = cssWith({ card: { imageMode: 'none' } });
  assert.doesNotMatch(sin, /pkg-photo-bg|pkg-photo-fade/);
});

test('un modo de foto desconocido cae a "sin foto"', () => {
  const css = cssWith({ card: { imageMode: 'flotante' } });
  assert.doesNotMatch(css, /pkg-photo/);
});

test('la entrada de las tarjetas se anima como diga el diseño', () => {
  const up = cssWith(null); // por defecto: subir 600 ms escalonado
  assert.match(up, /@keyframes hsPkgIn\{from\{opacity:0;transform:translateY\(20px\);\}to\{opacity:1;transform:none;\}\}/);
  assert.match(up, /animation:hsPkgIn 600ms cubic-bezier\(\.4,0,\.2,1\) backwards;/);
  assert.match(up, /\.packages-grid \.package-card:nth-child\(3\)\{animation-delay:200ms;\}/);

  const zoom = cssWith({ card: { animMode: 'zoom', animMs: 300, animStagger: 0 } });
  assert.match(zoom, /from\{opacity:0;transform:scale\(\.94\);\}/);
  assert.match(zoom, /animation:hsPkgIn 300ms/);
  assert.match(zoom, /:nth-child\(4\)\{animation-delay:0ms;\}/);

  const fade = cssWith({ card: { animMode: 'fade' } });
  assert.match(fade, /@keyframes hsPkgIn\{from\{opacity:0;\}to\{/);

  const none = cssWith({ card: { animMode: 'none' } });
  assert.match(none, /\.packages-grid \.package-card\{animation:none;\}/);
  assert.doesNotMatch(none, /hsPkgIn/);
});

test('el reveal no deja las tarjetas fuera de sitio ni mata el hover', () => {
  const css = cssWith(null);
  // Se neutraliza el reveal (opacidad 0 + 60px abajo)…
  assert.match(css, /\.packages-grid \.package-card\.reveal\{opacity:1;transform:none;/);
  // …pero la tarjeta sigue elevándose al pasar el mouse.
  assert.match(css, /\.packages-grid \.package-card\.reveal:hover\{transform:translateY\(-8px\);\}/);
});

// La foto la pinta `renderers.js` (el HTML de la tarjeta), así que se prueba el
// marcado real y el arreglo de las tarjetas YA pintadas cuando el diseño llega
// después (que es como funcionan los tableros: no esperan a la API).

/** DOM mínimo (tarjeta falsa) para probar el arreglo sin navegador. */
function fakeCard(photo) {
  const card = {
    dataset: { hsPhoto: photo },
    hijos: [],
    querySelector: (sel) =>
      card.hijos.find((h) =>
        sel.split(',').some((s) => s.trim() === `.${h.clase}`)
      ) || null,
    insertAdjacentHTML: (_, html) => {
      const clase = html.includes('pkg-photo-bg') ? 'pkg-photo-bg' : 'pkg-photo';
      if (card.hijos.some((h) => h.clase === clase)) {
        throw new Error('foto duplicada: el arreglo no es idempotente');
      }
      card.hijos.push({
        clase,
        html,
        classList: { contains: (c) => c === clase },
        remove: () => {
          card.hijos = card.hijos.filter((h) => h.clase !== clase);
        },
      });
    },
  };
  Object.defineProperty(card, 'foto', {
    get: () => (card.hijos.length ? card.hijos[0].clase : 'none'),
  });
  return card;
}

test('la tarjeta pinta la foto donde manda el diseño', () => {
  const r = loadScript('gallery/assets/renderers.js');
  const pkg = { id: 1, urlImage: 'images/banner.jpg', services: [], tier: { key: 'premium' },
    tierLabel: 'Premium', categoryKey: 'boda', packageCategory: { name: 'Bodas' }, categoryIcon: '📷',
    priceFormatted: '$1', currency: 'MXN', name: 'X', subtitle: '' };

  // Sin diseño no hay foto (pero la tarjeta recuerda su imagen para después).
  r.window.HS_SITE_DESIGN = null;
  const sin = r.renderPackageCard(pkg);
  assert.doesNotMatch(sin, /pkg-photo/);
  assert.match(sin, /data-hs-photo="images\/banner\.jpg"/);

  r.window.HS_SITE_DESIGN = { card: { imageMode: 'top' } };
  assert.match(r.renderPackageCard(pkg), /<img class="pkg-photo" src="images\/banner\.jpg"/);

  r.window.HS_SITE_DESIGN = { card: { imageMode: 'bg' } };
  assert.match(r.renderPackageCard(pkg), /class="pkg-photo-bg" style="background-image:url\('images\/banner\.jpg'\)"/);

  r.window.HS_SITE_DESIGN = { card: { imageMode: 'rarisimo' } };
  assert.doesNotMatch(r.renderPackageCard(pkg), /pkg-photo/);
});

test('la foto de las tarjetas ya pintadas se corrige cuando el diseño llega tarde', () => {
  const r = loadScript('gallery/assets/renderers.js');
  const cards = [fakeCard('images/a.jpg'), fakeCard('images/b.jpg')];
  const root = { querySelectorAll: () => cards };

  // Las tarjetas se pintaron sin diseño: no hay foto.
  r.window.HS_SITE_DESIGN = null;
  r.refreshPackagePhotos(root);
  assert.equal(cards[0].foto, 'none');

  // Llega el diseño con banda: la foto aparece en las que ya estaban.
  r.window.HS_SITE_DESIGN = { card: { imageMode: 'top' } };
  r.refreshPackagePhotos(root);
  assert.equal(cards[0].foto, 'pkg-photo');
  assert.match(cards[0].hijos[0].html, /src="images\/a\.jpg"/);

  // Idempotente: repetirla no duplica ni vuelve a pedir la foto.
  r.refreshPackagePhotos(root);
  assert.equal(cards[0].hijos.length, 1);

  // Cambiar a fondo REEMPLAZA la foto, no la suma.
  r.window.HS_SITE_DESIGN = { card: { imageMode: 'bg' } };
  r.refreshPackagePhotos(root);
  assert.equal(cards[1].foto, 'pkg-photo-bg');
  assert.equal(cards[1].hijos.length, 1);

  // Y volver a "sin foto" la quita.
  r.window.HS_SITE_DESIGN = { card: { imageMode: 'none' } };
  r.refreshPackagePhotos(root);
  assert.equal(cards[1].foto, 'none');
  assert.equal(cards[1].hijos.length, 0);
});

test('el filtro por categoría reanima con el MISMO diseño', () => {
  const view = loadScript('gallery/assets/site.js');
  view.window.HS_SITE_DESIGN = view.window.HSSite.merge(
    view.window.HSSite.defaults,
    { card: { animMode: 'fade', animMs: 400, animStagger: 50 } }
  );
  const anim = view.window.HSSite.cardAnim(3);
  assert.equal(anim.animation, 'hsPkgIn 400ms cubic-bezier(.4,0,.2,1) backwards');
  assert.equal(anim.delay, '100ms');
  // Sin animación, devuelve "none" (la tarjeta aparece y ya).
  view.window.HS_SITE_DESIGN = { card: { animMode: 'none' } };
  assert.equal(view.window.HSSite.cardAnim(1).animation, 'none');
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
