// ==================================================================
// HARD STREET — Fotos en DOS TIEMPOS (miniatura → original)
// ==================================================================
// Las fotos que se eligen en el panel viven en el servidor del Drive, y ese
// MISMO servidor sabe hacer miniaturas (`/thumb/<ruta>?w=N`). Así que la página
// no pide la foto de golpe: primero la MINIATURA (unos cuantos KB, aparece casi
// al instante aunque borrosa) y, cuando la original termina de bajar, la cambia
// por ella.
//
// Aquí se comprueba, SIN navegador ni backend, que:
//
//   * sólo las fotos del Drive se parten en dos (las del propio sitio, como
//     `images/…`, se piden como siempre);
//   * la miniatura apunta al MISMO servidor y a la MISMA ruta que la original;
//   * el HTML de la galería sale ya con la miniatura puesta y el dato de la
//     original para engancharla después;
//   * el fondo (portada, divisor) hace lo mismo que la imagen.
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

/** Imagen de mentira: al darle `src` avisa que "ya cargó" (sincrónico). */
class FakeImage {
  set src(value) {
    this._src = value;
    if (typeof this.onload === 'function') this.onload();
  }
  get src() {
    return this._src;
  }
}

/** Elemento de mentira con atributos y clases (lo que tocan los helpers). */
function fakeEl(tag = 'IMG') {
  const attrs = new Map();
  const classes = new Set();
  // Todo lo que se le puso (en orden): permite ver los DOS tiempos por los que
  // va la foto, no sólo cómo quedó al final.
  const history = [];
  return {
    tagName: tag,
    history,
    setAttribute: (k, v) => {
      history.push([k, String(v)]);
      attrs.set(k, String(v));
    },
    getAttribute: (k) => (attrs.has(k) ? attrs.get(k) : null),
    removeAttribute: (k) => attrs.delete(k),
    classList: {
      add: (c) => classes.add(c),
      remove: (c) => classes.delete(c),
      contains: (c) => classes.has(c),
    },
    style: {},
    /** Lo que quedó de verdad en el elemento (para las aserciones). */
    snapshot: () => ({ attrs: Object.fromEntries(attrs), classes: [...classes] }),
    /** Los `src` que tuvo, en orden (miniatura → original). */
    srcs: () => history.filter(([k]) => k === 'src').map(([, v]) => v),
    classes,
  };
}

/** Elemento de fondo de mentira que apunta cada `backgroundImage` que recibe. */
function fakeBgEl() {
  const log = [];
  const el = { tagName: 'DIV', style: {} };
  Object.defineProperty(el.style, 'backgroundImage', {
    get: () => log[log.length - 1] ?? '',
    set: (v) => log.push(v),
  });
  return { el, log };
}

/** Carga un script del sitio en un contexto mínimo (sin DOM). */
function loadScript(relativePath) {
  const src = readFileSync(join(root, relativePath), 'utf8');
  const ctx = { window: {}, console, Image: FakeImage };
  vm.createContext(ctx);
  vm.runInContext(src, ctx, { filename: relativePath });
  return ctx;
}

const HSSite = loadScript('gallery/assets/site.js').window.HSSite;

const DRIVE = 'http://drive.test.com/files/XV/ReynaCoot.jpg';
const PROPIEDAD_SITIO = 'images/banner.jpg';

// ------------------------------------------------------------------
// 1. ¿Qué foto se parte en dos?
// ------------------------------------------------------------------

test('sólo las fotos del Drive tienen miniatura', () => {
  // Del Drive: sí (el servidor sabe hacerla).
  assert.equal(HSSite.isDriveImage(DRIVE), true);
  assert.equal(HSSite.isDriveImage('https://x/files/a/b.jpg'), true);
  // Del propio sitio, o una URL de fuera: no hay miniatura que pedir.
  assert.equal(HSSite.isDriveImage(PROPIEDAD_SITIO), false);
  assert.equal(HSSite.isDriveImage('https://otro.com/foto.jpg'), false);
  assert.equal(HSSite.isDriveImage(''), false);
});

test('la miniatura es la MISMA foto, en el mismo servidor y a su tamaño', () => {
  assert.equal(
    HSSite.thumbnail(DRIVE),
    'http://drive.test.com/thumb/XV/ReynaCoot.jpg?w=320'
  );
  // El ancho se respeta (redondeado) y queda dentro de lo razonable.
  assert.equal(
    HSSite.thumbnail(DRIVE, 1280),
    'http://drive.test.com/thumb/XV/ReynaCoot.jpg?w=1280'
  );
  assert.equal(
    HSSite.thumbnail(DRIVE, 100.4),
    'http://drive.test.com/thumb/XV/ReynaCoot.jpg?w=100'
  );
  // Un ancho absurdo no se cuela tal cual en la URL.
  assert.match(HSSite.thumbnail(DRIVE, 99999), /w=2048$/);
  assert.match(HSSite.thumbnail(DRIVE, 0), /w=320$/);
  // Una foto que no es del Drive no tiene miniatura (null).
  assert.equal(HSSite.thumbnail(PROPIEDAD_SITIO), null);
  assert.equal(HSSite.thumbnail(''), null);
  // El token de la sesión (query) no viaja a la URL de la miniatura.
  assert.equal(
    HSSite.thumbnail('http://drive.test.com/files/a/b.jpg?apikey=SECRETO', 320),
    'http://drive.test.com/thumb/a/b.jpg?w=320'
  );
});

// ------------------------------------------------------------------
// 2. La foto en el HTML (galería, servicios externos)
// ------------------------------------------------------------------

test('una foto del Drive sale con su miniatura y el dato de la original', () => {
  const tag = HSSite.galleryImg(DRIVE, 'XV Años');
  assert.match(tag, /src="http:\/\/drive\.test\.com\/thumb\/XV\/ReynaCoot\.jpg\?w=320"/);
  assert.match(tag, /data-hs-full="http:\/\/drive\.test\.com\/files\/XV\/ReynaCoot\.jpg"/);
  assert.match(tag, /class="hs-img-low"/);
  assert.match(tag, /alt="XV Años"/);
});

test('una foto del propio sitio se pide como siempre (sin miniatura)', () => {
  const tag = HSSite.galleryImg(PROPIEDAD_SITIO, 'Boda');
  assert.match(tag, /src="images\/banner\.jpg"/);
  assert.doesNotMatch(tag, /data-hs-full/);
  assert.doesNotMatch(tag, /hs-img-low/);
  // Sin foto no se pintan `<img>` vacíos.
  assert.equal(HSSite.galleryImg('', 'Boda'), '');
});

test('la galería de la página arma las fotos del Drive en dos tiempos', () => {
  const plan = HSSite.plan({
    sections: {
      gallery: {
        props: {
          mode: 'custom',
          categories: [{ key: 'xv-anos', name: 'XV Años', items: [DRIVE] }],
        },
      },
    },
  });
  const grid = HSSite.galleryHtml(plan);
  assert.match(grid, /data-category="xv-anos"/);
  assert.match(grid, /thumb\/XV\/ReynaCoot\.jpg\?w=320/);
  assert.match(grid, /data-hs-full="http:\/\/drive\.test\.com\/files\/XV\/ReynaCoot\.jpg"/);
});

// ------------------------------------------------------------------
// 3. La foto "mejorando": miniatura ya, original cuando baja
// ------------------------------------------------------------------

test('la imagen arranca con la miniatura borrosa y cambia a la original', () => {
  const el = fakeEl();
  const twoStep = HSSite.loadImage(el, DRIVE, { width: 640 });

  assert.equal(twoStep, true);
  // Primero la MINIATURA (la que se ve borrosa: la pista de "mejorando") y
  // después la original.
  assert.deepEqual(el.srcs(), [
    'http://drive.test.com/thumb/XV/ReynaCoot.jpg?w=640',
    DRIVE,
  ]);
  // Ya bajó la original: se cambia y el desenfoque se va.
  assert.equal(el.getAttribute('src'), DRIVE);
  assert.equal(el.classes.has('hs-img-low'), false);
});

test('si la foto no es del Drive se pone tal cual, sin desenfoque', () => {
  const el = fakeEl();
  assert.equal(HSSite.loadImage(el, PROPIEDAD_SITIO), false);
  assert.deepEqual(el.srcs(), [PROPIEDAD_SITIO]);
  assert.equal(el.classes.has('hs-img-low'), false);
});

test('un fondo (portada, divisor) también va de miniatura a original', () => {
  const { el, log } = fakeBgEl();
  const twoStep = HSSite.loadBackground(el, DRIVE);

  assert.equal(twoStep, true);
  // El fondo pide una miniatura más ancha (se ve a pantalla completa)...
  assert.equal(log[0], 'url("http://drive.test.com/thumb/XV/ReynaCoot.jpg?w=1280")');
  // ...y luego la original.
  assert.equal(log[log.length - 1], `url("${DRIVE}")`);
});

test('un fondo que no es del Drive se pone directo', () => {
  const { el, log } = fakeBgEl();
  assert.equal(HSSite.loadBackground(el, PROPIEDAD_SITIO), false);
  assert.deepEqual(log, [`url("${PROPIEDAD_SITIO}")`]);
});
