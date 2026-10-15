// ==================================================================
// HARD STREET — El contenido de la web que se lleva a la base de datos
// ==================================================================
// `Hardstreet-Backend/tool/seed-site-content.mjs` lee lo que la web tiene AHORA
// (index.html, index.css y los defaults de site.js) y lo escribe en
// `site_config.landing`, que es de donde la web lo lee en vivo.
//
// Aquí se comprueba, SIN base de datos y SIN navegador:
//   * que el script saca TODOS los ganchos (`data-hs`, `data-hs-img`);
//   * que los textos salen en el formato que entiende la web (las dos líneas
//     con `|`, las entidades decodificadas);
//   * que las secciones viajan en el orden de la página, visibles, con los
//     números que la página muestra;
//   * y que la web, al leer ese documento (HSSite.plan), devuelve exactamente
//     los mismos valores: lo que se guarda es lo que se ve.
//
// Se ejecuta con:  node --test tests/
// ==================================================================

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync, mkdtempSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { tmpdir } from 'node:os';
import vm from 'node:vm';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');
const seedTool = join(root, '..', 'Hardstreet-Backend', 'tool', 'seed-site-content.mjs');

const html = readFileSync(join(root, 'index.html'), 'utf8');
const hooks = (attr) =>
  [...html.matchAll(new RegExp(`${attr}="([^"]+)"`, 'g'))].map((m) => m[1]);

/** Corre el script en seco y devuelve el documento que guardaría. */
function generate() {
  const out = join(mkdtempSync(join(tmpdir(), 'hs-seed-')), 'landing.json');
  execFileSync(process.execPath, [seedTool, '--dry-run', '--out', out], {
    cwd: join(root, '..', 'Hardstreet-Backend'),
    stdio: 'pipe',
  });
  return JSON.parse(readFileSync(out, 'utf8'));
}

/** El plan que la web arma al leer un documento (igual que en el navegador). */
function loadHSSite() {
  const src = readFileSync(join(root, 'gallery', 'assets', 'site.js'), 'utf8');
  const ctx = { window: {}, console };
  vm.createContext(ctx);
  vm.runInContext(src, ctx, { filename: 'site.js' });
  return ctx.window.HSSite;
}

const landing = generate();
const HSSite = loadHSSite();

test('el documento trae TODOS los ganchos de la portada', () => {
  assert.deepEqual(Object.keys(landing.texts).sort(), hooks('data-hs').sort());
  assert.deepEqual(Object.keys(landing.images).sort(), hooks('data-hs-img').sort());
  // Y ninguna sección de la página se queda fuera.
  assert.deepEqual(
    Object.keys(landing.sections).sort(),
    [...new Set(hooks('data-hs-section'))].sort()
  );
});

test('los textos salen como los entiende la web (dos líneas con |, entidades)', () => {
  assert.equal(landing.texts.hero_title, 'Capturando|Momentos Únicos');
  assert.equal(landing.texts.about_title, 'La historia detrás|de cada imagen');
  // La parte en cursiva del divisor también va como segunda línea.
  assert.equal(landing.texts.parallax_text, 'Cada imagen, una|historia');
  // `&copy;` se guarda ya decodificado (el texto que se ve).
  assert.match(landing.texts.footer_copyright, /^©\s*\d{4}/);
  // Ni etiquetas ni espacios de más.
  for (const [key, value] of Object.entries(landing.texts)) {
    assert.doesNotMatch(value, /<[^>]*>/, `el texto de "${key}" trae etiquetas`);
    assert.equal(value, value.trim(), `el texto de "${key}" trae espacios de más`);
  }
});

test('las secciones van en el orden de la página, visibles y con sus números', () => {
  const keys = Object.keys(landing.sections);
  assert.deepEqual(
    keys.map((k) => landing.sections[k].order),
    keys.map((_, i) => i + 1)
  );
  assert.ok(keys.every((k) => landing.sections[k].visible === true));
  assert.equal(keys[0], 'hero');
  // Los números de "Sobre nosotros": los mismos que ya muestra la página.
  assert.deepEqual(landing.sections.about.props.stats, [
    { value: 30, label: 'Proyectos' },
    { value: 4, label: 'Años Exp.' },
    { value: 50, label: 'Clientes Felices' },
  ]);
});

test('la web lee ese documento y devuelve EXACTAMENTE lo mismo', () => {
  const plan = JSON.parse(JSON.stringify(HSSite.plan(landing)));
  // Los textos y las imágenes viajan tal cual…
  assert.deepEqual(plan.texts, landing.texts);
  assert.deepEqual(plan.images, landing.images);
  // …y las opciones no cambian lo que la página ya mostraba.
  assert.equal(plan.packages.groupByCategory, true);
  assert.equal(plan.services.perSlide, 4);
  assert.equal(plan.gallery.custom, false);
  assert.deepEqual(plan.stats, landing.sections.about.props.stats);
  assert.equal(plan.contact.whatsappUrl, '');
  // El orden guardado es el que la web aplica.
  assert.deepEqual(Object.keys(plan.layout), Object.keys(landing.sections));
});
