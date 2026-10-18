// ==================================================================
// HARD STREET — Contenido de la PORTADA por secciones (web)
// ==================================================================
// El módulo "Sitio web" del panel guarda, sección por sección, sus textos,
// imágenes y sus opciones (los números de "Sobre nosotros", las fotos de cada
// categoría de la galería, los comentarios de los clientes, el WhatsApp…).
// Aquí se comprueba, SIN navegador y sin backend, que ese documento se
// entiende igual que en el panel:
//
//   * sin nada guardado, la página se ve como siempre (defaults);
//   * un documento incompleto no deja la portada rara (se mezcla);
//   * lo que se elige (números, galería, testimonios, agrupación, WhatsApp)
//     sale exactamente así en el HTML que pinta la página.
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

/**
 * Lo que devuelve el script vive en OTRO contexto (otro realm): sus objetos no
 * son "deepStrictEqual" con los de este archivo aunque tengan lo mismo. Se
 * pasan a objetos normales antes de comparar.
 */
const plain = (v) => JSON.parse(JSON.stringify(v));
const html = readFileSync(join(root, 'index.html'), 'utf8');
const indexJs = readFileSync(join(root, 'index.js'), 'utf8');

// ------------------------------------------------------------------
// 1. Sin nada configurado, la portada se ve como siempre
// ------------------------------------------------------------------

test('sin contenido guardado se usan los valores de fábrica', () => {
  const plan = HSSite.plan(null);
  // Los números que ya trae la página.
  assert.deepEqual(plain(plan.stats), [
    { value: 30, label: 'Proyectos' },
    { value: 4, label: 'Años Exp.' },
    { value: 50, label: 'Clientes Felices' },
  ]);
  // Sin fotos por categoría: la galería pública de siempre.
  assert.equal(plan.gallery.custom, false);
  assert.deepEqual(plain(plan.gallery.categories), []);
  // Sin comentarios escritos: los del HTML.
  assert.deepEqual(plain(plan.testimonials), []);
  // Paquetes separados por categoría (como los pide el sitio) y 4 servicios
  // por slide en "Lo que ofrecemos".
  assert.equal(plan.packages.groupByCategory, true);
  assert.equal(plan.services.perSlide, 4);
  // Sin WhatsApp configurado no hay enlace.
  assert.equal(plan.contact.whatsappUrl, '');
});

test('un documento incompleto NO rompe la portada (se mezcla con los defaults)', () => {
  const plan = HSSite.plan({
    sections: { packages: { props: { groupByCategory: false } } },
  });
  assert.equal(plan.packages.groupByCategory, false);
  // Lo que no vino sigue con su valor de fábrica.
  assert.equal(plan.services.perSlide, 4);
  assert.equal(plan.stats.length, 3);
});

test('un documento COMPLETO (el que sube el panel) pinta lo mismo que los defaults', () => {
  // "Guardar lo actual en la base" manda TODOS los textos, imágenes, opciones,
  // orden y visibilidad. Aunque vengan con los valores de fábrica, la portada
  // tiene que verse EXACTAMENTE igual que sin nada guardado.
  const hooks = (attr) =>
    [...html.matchAll(new RegExp(`${attr}="([^"]+)"`, 'g'))].map((m) => m[1]);
  const full = {
    texts: Object.fromEntries(hooks('data-hs').map((k) => [k, 'texto guardado'])),
    images: Object.fromEntries(hooks('data-hs-img').map((k) => [k, 'images/guardada.jpg'])),
    sections: Object.fromEntries(
      Object.keys(HSSite.sectionsDefaults).map((key, i) => [
        key,
        { visible: true, order: i + 1, props: HSSite.sectionsDefaults[key] },
      ])
    ),
  };

  const plan = HSSite.plan(full);
  // Con la base llena, lo guardado MANDA (es el objetivo: la web lee de la base).
  assert.equal(plan.texts.hero_title, 'texto guardado');
  assert.equal(plan.images.hero_image, 'images/guardada.jpg');
  assert.equal(Object.keys(plan.texts).length, hooks('data-hs').length);

  // Y las opciones, aunque viajen con su valor de fábrica, no cambian nada.
  const sinNada = HSSite.plan(null);
  assert.deepEqual(plain(plan.stats), plain(sinNada.stats));
  assert.equal(plan.gallery.custom, false);
  assert.deepEqual(plain(plan.testimonials), []);
  assert.equal(plan.packages.groupByCategory, true);
  assert.equal(plan.services.perSlide, 4);
  assert.equal(plan.contact.whatsappUrl, '');
  // El orden guardado es el de fábrica y todas las secciones van visibles.
  const keys = Object.keys(full.sections);
  assert.deepEqual(plain(keys.map((k) => full.sections[k].order)),
      keys.map((_, i) => i + 1));
  assert.ok(keys.every((k) => full.sections[k].visible === true));
  assert.equal(plain(plan.layout).hero.visible, true);
});

// ------------------------------------------------------------------
// 2. Lo que se edita por sección, sale así en la página
// ------------------------------------------------------------------

test('los números de "Sobre nosotros" salen del panel (y se limpian)', () => {
  const plan = HSSite.plan({
    sections: {
      about: {
        props: {
          stats: [
            { value: '12', label: '  Bodas  ' },
            { value: 3.6, label: 'Estudios' },
            { value: 'x', label: 'Basura' }, // se descarta
            { value: 1, label: '' }, // se descarta
          ],
        },
      },
    },
  });
  assert.deepEqual(plain(plan.stats), [
    { value: 12, label: 'Bodas' },
    { value: 4, label: 'Estudios' },
  ]);
});

test('la galería por categoría usa las fotos elegidas y descarta lo vacío', () => {
  const plan = HSSite.plan({
    sections: {
      gallery: {
        props: {
          mode: 'custom',
          categories: [
            { key: 'boda', name: 'Boda', items: [' images/banner.jpg ', 'http://x/f.jpg'] },
            { key: '', name: 'XV Años', items: ['images/banner1.jpg'] },
            { key: 'vacia', name: 'Vacía', items: [] }, // sin fotos: no se muestra
          ],
        },
      },
    },
  });
  assert.equal(plan.gallery.custom, true);
  assert.deepEqual(plain(plan.gallery.categories), [
    { key: 'boda', name: 'Boda', items: ['images/banner.jpg', 'http://x/f.jpg'] },
    { key: 'xv-anos', name: 'XV Años', items: ['images/banner1.jpg'] },
  ]);

  // Los botones de categoría y las fotos se pintan con esa clave.
  const filters = HSSite.galleryFiltersHtml(plan);
  assert.match(filters, /data-filter="all">Todos/);
  assert.match(filters, /data-filter="boda">Boda/);
  assert.match(filters, /data-filter="xv-anos">XV Años/);
  assert.doesNotMatch(filters, /Vacía/);

  const grid = HSSite.galleryHtml(plan);
  assert.match(grid, /data-category="boda"/);
  assert.match(grid, /src="images\/banner.jpg"/);
  assert.match(grid, /alt="XV Años"/);
  // Un valor con comillas no puede romper el HTML.
  const nasty = HSSite.galleryHtml(
    HSSite.plan({
      sections: {
        gallery: { props: { categories: [{ key: 'x', name: 'X', items: ['a"onload="alert(1)'] }] } },
      },
    })
  );
  // Las comillas se limpian: el valor entero queda DENTRO del src y no puede
  // cerrar el atributo para inyectar otro (onload, onerror…).
  assert.match(nasty, /<img src="aonload=alert\(1\)"/);
  assert.doesNotMatch(nasty, /["']\s+(on\w+)=/, 'no se cuela un atributo nuevo');
});

test('los testimonios del panel llegan al carrusel con sus puntos', () => {
  const plan = HSSite.plan({
    sections: {
      testimonials: {
        props: {
          items: [
            { name: 'Ana', role: 'Boda en Tulum', text: 'Todo increíble' },
            { name: 'Luis', role: '', text: 'Muy profesionales' },
            { name: '', role: '', text: '' }, // vacío: se descarta
          ],
        },
      },
    },
  });
  assert.equal(plan.testimonials.length, 2);
  const out = HSSite.testimonialsHtml(plan);
  assert.match(out, /testimonial-quote">Todo increíble</);
  assert.match(out, /testimonial-author">Ana</);
  assert.match(out, /testimonial-role">Boda en Tulum</);
  assert.match(out, /id="testimonialDots"/);
  assert.equal((out.match(/class="dot/g) || []).length, 2, 'un punto por comentario');
});

test('el WhatsApp se muestra sólo si hay número, con su enlace', () => {
  const off = HSSite.plan(null);
  assert.equal(off.contact.whatsappUrl, '');
  const on = HSSite.plan({ sections: { contact: { props: { whatsapp: '+52 999 123 4567' } } } });
  assert.equal(on.contact.whatsapp, '529991234567');
  assert.equal(on.contact.whatsappUrl, 'https://wa.me/529991234567');
});

test('los paquetes se agrupan por categoría (y se puede apagar)', () => {
  const packages = [
    { id: 1, name: 'Boda - Premium', isExtern: false, categoryKey: 'boda', packageCategory: { name: 'Boda' } },
    { id: 2, name: 'Boda - Gold', isExtern: false, categoryKey: 'boda', packageCategory: { name: 'Boda' } },
    { id: 3, name: 'XV - Gold', isExtern: false, categoryKey: 'xv-anos', packageCategory: { name: 'XV Años' } },
    { id: 21, name: 'Externo', isExtern: true, categoryKey: 'boda', packageCategory: { name: 'Boda' } },
  ];
  const grouped = HSSite.groupPackages(packages, HSSite.plan(null));
  assert.deepEqual(plain(grouped.map((g) => [g.name, g.packages.length])), [
    ['Boda', 2],
    ['XV Años', 1],
  ]);
  // Los externos nunca entran aquí: son "Lo que ofrecemos".
  assert.ok(grouped.every((g) => g.packages.every((p) => !p.isExtern)));

  const flat = HSSite.groupPackages(
    packages,
    HSSite.plan({ sections: { packages: { props: { groupByCategory: false } } } })
  );
  assert.equal(flat.length, 1);
  assert.equal(flat[0].name, '');
  assert.equal(flat[0].packages.length, 3);
});

test('la clave de categoría es la misma que la del panel', () => {
  // El panel (web_sections.dart → siteCategoryKey) usa ESTOS mismos valores:
  // si uno cambia sin el otro, las fotos elegidas no aparecerían en su
  // categoría. Las dos pruebas llevan la lista a propósito.
  assert.equal(HSSite.categoryKey('XV Años'), 'xv-anos');
  assert.equal(HSSite.categoryKey('  Boda  '), 'boda');
  assert.equal(HSSite.categoryKey('Graduación'), 'graduacion');
  assert.equal(HSSite.categoryKey('Sesión & Retoque'), 'sesion-retoque');
  assert.equal(HSSite.categoryKey('Bautizo'), 'bautizo');
  assert.equal(HSSite.categoryKey('¡Comercial!'), 'comercial');
});

test('el correo y el teléfono se vuelven enlaces tocables', () => {
  assert.equal(HSSite.contactHref('hardstreet7@gmail.com', 'mail'), 'mailto:hardstreet7@gmail.com');
  assert.equal(HSSite.contactHref('+52 990 101 7986', 'tel'), 'tel:+529901017986');
  // Basura: sin enlace (se deja el que ya tenía).
  assert.equal(HSSite.contactHref('Hard Street', 'mail'), '');
  assert.equal(HSSite.contactHref('', 'tel'), '');
});

// ------------------------------------------------------------------
// 3. Los ganchos del HTML que el panel necesita
// ------------------------------------------------------------------

test('la portada trae los ganchos de las secciones editables', () => {
  // Números de "Sobre nosotros" (se clonan si se agregan más).
  assert.equal((html.match(/data-hs-stat="/g) || []).length, 3);
  // Contacto: correo y teléfono como enlaces + WhatsApp apagado de fábrica.
  assert.match(html, /data-hs="contact_email" data-hs-mail/);
  assert.match(html, /data-hs="contact_phone" data-hs-tel/);
  assert.match(html, /data-hs-whatsapp/);
  assert.match(html, /data-hs="testimonials_subtitle"/);
});

test('index.js deja que el panel manda: galería, paquetes y testimonios', () => {
  // La galería pública no pisa la que el panel pintó por categoría.
  assert.match(indexJs, /gallery\.custom/);
  // Los paquetes se separan por categoría con el plan del sitio.
  assert.match(indexJs, /groupPackages\(Store\.packages, plan\)/);
  // Y el carrusel de testimonios se puede volver a enganchar.
  assert.match(indexJs, /window\.HSInitTestimonials = initTestimonials/);
});

// ------------------------------------------------------------------
// 4. HTML propio de cada sección (lo escribe el módulo "Sitio web")
// ------------------------------------------------------------------

test('el HTML propio viaja en el plan y la sección lo pinta TAL CUAL', () => {
  const ctx = { window: {}, console };
  vm.createContext(ctx);
  vm.runInContext(
    readFileSync(join(root, 'gallery/assets/site.js'), 'utf8'),
    ctx
  );
  const H = ctx.window.HSSite;

  const plan = H.plan({
    html: {
      hero: '<div class="hero-content"><h1>Hecho a mano</h1></div>',
      about: '   ', // vacío: se descarta (la web arma la sección)
    },
  });
  assert.deepEqual(plain(plan.html), {
    hero: '<div class="hero-content"><h1>Hecho a mano</h1></div>',
  });

  // DOM mínimo: sólo existen dos secciones.
  const nodes = {
    hero: { innerHTML: '<h1>original</h1>' },
    about: { innerHTML: '<p>original</p>' },
  };
  ctx.document = {
    querySelector(sel) {
      const m = /^\[data-hs-section="(.+)"\]$/.exec(sel);
      return (m && nodes[m[1]]) || null;
    },
  };

  // Sólo se toca la sección que tiene HTML propio (y que existe).
  assert.equal(H.applyHtml(plan), 1);
  assert.equal(nodes.hero.innerHTML, plan.html.hero);
  assert.equal(nodes.about.innerHTML, '<p>original</p>');

  // Es idempotente: aplicar el documento otra vez deja lo mismo.
  assert.equal(H.applyHtml(plan), 1);
  assert.equal(nodes.hero.innerHTML, plan.html.hero);
});

test('una copia agregada lleva su propio HTML', () => {
  const plan = HSSite.plan({
    extraSections: [
      {
        id: 'gallery-2',
        key: 'gallery',
        visible: true,
        order: 2,
        html: '<div class="packages-grid" data-copy="1"></div>',
      },
    ],
  });
  assert.equal(plan.extras.length, 1);
  assert.equal(
    plan.extras[0].html,
    '<div class="packages-grid" data-copy="1"></div>'
  );
  // El HTML de una copia no se cuela en el mapa de las secciones de fábrica.
  assert.deepEqual(plain(plan.html), {});
});
