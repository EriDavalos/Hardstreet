// ==================================================================
// HARD STREET — Secciones AGREGADAS de la portada (web)
// ==================================================================
// El panel de "Sitio web" permite agregar otra copia de una sección (una
// segunda galería, otro divisor de fotos…). Las de fábrica existen una vez en
// el HTML y su contenido se guarda por GANCHO; una copia no tiene ganchos
// propios, así que viaja aparte (`extraSections`) con su nombre (`gallery-2`),
// de qué plantilla es y lo que se escribió para ella.
//
// Aquí se comprueba, SIN navegador y sin backend, que ese documento:
//
//   * se limpia al leerlo (una copia sin nombre o sin plantilla se descarta);
//   * entra en el plan de la página con SU visibilidad y SU orden;
//   * tiene su PROPIO plan de opciones (las fotos de la copia no son las de la
//     galería de arriba);
//   * y que aplicarlo sin DOM (una página que no lo necesita) no revienta.
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

const HSSite = loadScript('gallery/assets/site.js').window.HSSite;

const plain = (v) => JSON.parse(JSON.stringify(v));

/** Una copia de la galería como la guarda el panel. */
const galleryCopy = (extra = {}) => ({
  id: 'gallery-2',
  key: 'gallery',
  visible: true,
  order: 8,
  texts: { gallery_title: 'Nuestro Portafolio' },
  props: {
    mode: 'custom',
    categories: [{ key: 'boda', name: 'Boda', items: ['images/banner.jpg'] }],
  },
  ...extra,
});

// ------------------------------------------------------------------
// 1. Lo que se lee del documento
// ------------------------------------------------------------------

test('una copia se limpia al leerla (sin nombre o sin plantilla se descarta)', () => {
  const extras = HSSite.extraSections({
    extraSections: [
      galleryCopy(),
      { id: '', key: 'gallery' }, // sin nombre
      { id: 'parallax-2' }, // sin plantilla
      galleryCopy(), // nombre repetido
      null,
      'basura',
    ],
  });
  assert.equal(extras.length, 1);
  assert.equal(extras[0].id, 'gallery-2');
  assert.equal(extras[0].key, 'gallery');
  assert.equal(extras[0].visible, true);
  assert.equal(extras[0].order, 8);
  assert.deepEqual(plain(extras[0].texts), { gallery_title: 'Nuestro Portafolio' });
});

test('sin nada agregado no hay copias (y no se rompe con basura)', () => {
  for (const doc of [null, {}, { extraSections: null }, { extraSections: 7 }, 'x']) {
    assert.deepEqual(plain(HSSite.extraSections(doc)), []);
  }
});

test('lo que no sirva de una copia se descarta (textos vacíos, opciones raras)', () => {
  const [ex] = HSSite.extraSections({
    extraSections: [
      {
        id: 'about-2',
        key: 'about',
        texts: { about_title: '  ', about_label: ' Nosotros ' },
        images: { about_image: 'images/foto.jpg' },
        props: 'basura',
      },
    ],
  });
  assert.deepEqual(plain(ex.texts), { about_label: 'Nosotros' });
  assert.deepEqual(plain(ex.images), { about_image: 'images/foto.jpg' });
  assert.deepEqual(plain(ex.props), {});
  assert.equal(ex.visible, true, 'sin decirlo, la copia se ve');
  assert.equal(ex.order, 0);
});

// ------------------------------------------------------------------
// 2. Las copias en el plan de la página
// ------------------------------------------------------------------

test('la copia entra en el plan con SU visibilidad y SU orden', () => {
  const plan = HSSite.plan({
    texts: { hero_title: 'Hola' },
    sections: { hero: { visible: true, order: 1 } },
    extraSections: [galleryCopy({ visible: false, order: 9 })],
  });
  // La copia viaja en el plan…
  assert.equal(plan.extras.length, 1);
  assert.equal(plan.extras[0].id, 'gallery-2');
  // …y con su orden y visibilidad, en el MISMO mapa que las de fábrica: así el
  // orden de la página se calcula de una sola vez.
  assert.deepEqual(plain(plan.layout['gallery-2']), { visible: false, order: 9 });
  assert.deepEqual(plain(plan.layout.hero), { visible: true, order: 1 });
  // Lo de las secciones de fábrica no se toca.
  assert.equal(plan.texts.hero_title, 'Hola');
  assert.deepEqual(plain(plan.gallery.categories), []);
});

// ------------------------------------------------------------------
// 3. El plan PROPIO de una copia
// ------------------------------------------------------------------

test('la copia tiene sus propias fotos (no las de la galería de arriba)', () => {
  const doc = {
    sections: {
      gallery: {
        props: {
          mode: 'custom',
          categories: [{ key: 'xv-anos', name: 'XV Años', items: ['images/banner1.jpg'] }],
        },
      },
    },
    extraSections: [galleryCopy()],
  };
  const plan = HSSite.plan(doc);
  // La galería de la página: las de XV Años.
  assert.deepEqual(plain(plan.gallery.categories.map((c) => c.name)), ['XV Años']);

  // La copia: las suyas (Boda).
  const sub = HSSite.extraPlan(plan.extras[0]);
  assert.equal(sub.gallery.custom, true);
  assert.deepEqual(plain(sub.gallery.categories.map((c) => c.name)), ['Boda']);
  // Y el HTML de la copia sale con esas fotos.
  const html = HSSite.galleryHtml(sub);
  assert.match(html, /data-category="boda"/);
  assert.match(html, /images\/banner\.jpg/);
  assert.doesNotMatch(html, /banner1/);
});

test('la copia lleva sus propios números, testimonios y WhatsApp', () => {
  const doc = {
    sections: {
      about: { props: { stats: [{ value: 10, label: 'Proyectos' }] } },
      contact: { props: { whatsapp: '5219991111111' } },
      testimonials: { props: { items: [{ name: 'Ana', text: 'Muy bien' }] } },
    },
    extraSections: [
      {
        id: 'about-2',
        key: 'about',
        order: 4,
        props: { stats: [{ value: 3, label: 'Años' }] },
      },
      {
        id: 'testimonials-2',
        key: 'testimonials',
        order: 10,
        props: { items: [{ name: 'Luis', text: 'Todo increíble' }] },
      },
      { id: 'contact-2', key: 'contact', order: 11, props: { whatsapp: '' } },
    ],
  };
  const plan = HSSite.plan(doc);
  assert.deepEqual(plain(plan.stats), [{ value: 10, label: 'Proyectos' }]);

  const about = HSSite.extraPlan(plan.extras[0]);
  assert.deepEqual(plain(about.stats), [{ value: 3, label: 'Años' }]);

  const tst = HSSite.extraPlan(plan.extras[1]);
  assert.deepEqual(plain(tst.testimonials), [{ name: 'Luis', role: '', text: 'Todo increíble' }]);

  // El WhatsApp de la copia, vacío, se apaga en SU sección (no en la de arriba).
  const contact = HSSite.extraPlan(plan.extras[2]);
  assert.equal(contact.contact.whatsappUrl, '');
  assert.equal(plan.contact.whatsappUrl, 'https://wa.me/5219991111111');
});

// ------------------------------------------------------------------
// 4. Aplicar sin DOM (páginas que no lo necesitan) no revienta
// ------------------------------------------------------------------

test('aplicar las copias sin DOM no revienta (devuelve 0)', () => {
  const plan = HSSite.plan({ extraSections: [galleryCopy()] });
  assert.equal(HSSite.applyExtras(plan), 0);
});
