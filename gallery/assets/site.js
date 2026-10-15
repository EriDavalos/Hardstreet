// ==================================================================
// HARD STREET — Diseño del sitio EN VIVO
// ==================================================================
// El panel (Flutter) DISEÑA y este archivo lo APLICA: pide el diseño a
// GET /api/site y lo traduce a CSS en el momento. Así lo que se diseña en el
// panel se ve en la web al instante, sin volver a publicar el sitio.
//
// Qué diseña (documento `design`):
//   brand  → dorados de la marca (--gold / --gold-light)
//   card   → forma y densidad de las tarjetas y QUÉ elementos se muestran
//   tiers  → una variante por tier (Premium / Gold / Basic)
//
// Nunca rompe la página: si el backend no responde, si no hay diseño guardado
// o si llega incompleto, se usan estos DEFAULTS, que son el look actual del
// sitio. Los defaults viven aquí y el panel los espeja
// (Hardstreet_Admin/lib/site_design.dart); una prueba compara los dos.
// ==================================================================

const SITE_DESIGN_DEFAULT = {
  brand: { gold: '#C9A96E', goldLight: '#F0D48A', dark: '#0B0E17' },
  card: {
    columns: 3,
    gap: 40,
    radius: 18,
    borderWidth: 1,
    padding: 32,
    lineTop: true,
    hoverLift: true,
    shadow: true,
    serifNames: true,
    uppercaseNames: false,
    showCategory: true,
    showSubtitle: true,
    showServiceCount: true,
    showServices: true,
    servicesLimit: 6,
    showPrice: true,
    showCta: true,
    priceLabel: 'Desde',
    ctaLabel: 'Cotizar',
  },
  tiers: {
    premium: { accent: '#C9A96E', accentSoft: '#F0D48A', dark: '#0B0E17', badgeFilled: true, borderAlpha: 0.55 },
    gold: { accent: '#D9A441', accentSoft: '#F2C66B', dark: '#120E05', badgeFilled: true, borderAlpha: 0.3 },
    basic: { accent: '#8FB0D4', accentSoft: '#B9D0E6', dark: '#0B111A', badgeFilled: false, borderAlpha: 0.22 },
  },
};

// ---------- utilidades ----------

const HS_TIERS = ['premium', 'gold', 'basic'];

/** Copia profunda + mezcla: lo guardado pisa los defaults, sin perder claves. */
function hsMerge(base, patch) {
  if (Array.isArray(base)) return Array.isArray(patch) ? patch.slice() : base.slice();
  if (base && typeof base === 'object') {
    const out = { ...base };
    if (patch && typeof patch === 'object') {
      for (const key of Object.keys(patch)) {
        const v = patch[key];
        if (v === null || v === undefined) continue;
        out[key] = key in base ? hsMerge(base[key], v) : v;
      }
    }
    return out;
  }
  return patch === undefined || patch === null ? base : patch;
}

/** #RRGGBB + alfa → rgba() (para bordes y tintes). */
function hsAlpha(hex, alpha) {
  const h = String(hex || '').replace('#', '');
  const full = h.length === 3 ? h.split('').map(c => c + c).join('') : h;
  const n = parseInt(full || 'c9a96e', 16);
  const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  return `rgba(${r}, ${g}, ${b}, ${Math.max(0, Math.min(1, Number(alpha) || 0))})`;
}

const hsEsc = (v) => String(v == null ? '' : v).replace(/[<>]/g, '');

// ---------- el diseño → CSS ----------

/**
 * CSS del diseño. Función PURA (mismo diseño → mismo CSS): se puede revisar y
 * probar sin tocar el DOM.
 */
function siteDesignCss(rawDesign) {
  const d = hsMerge(SITE_DESIGN_DEFAULT, rawDesign || {});
  const c = d.card;
  const r = [];

  // Marca
  r.push(`:root{--gold:${hsEsc(d.brand.gold)};--gold-light:${hsEsc(d.brand.goldLight)};}`);

  // Rejilla del catálogo: columnas EXPLÍCITAS del diseño, pero el sitio sigue
  // siendo responsivo: en pantallas angostas se cae a menos columnas en vez de
  // aplastar las tarjetas.
  const cols = Math.max(1, Math.min(4, Number(c.columns) || 3));
  r.push(
    `.packages-grid{gap:${Number(c.gap) || 0}px;` +
      `grid-template-columns:repeat(${cols},minmax(0,1fr));}`
  );
  if (cols > 1) {
    const breakpoint = cols >= 3 ? 1160 : 820;
    r.push(
      `@media (max-width:${breakpoint}px){.packages-grid{grid-template-columns:repeat(${cols >= 3 ? 2 : 1},minmax(0,1fr));}}`
    );
    r.push(
      '@media (max-width:620px){.packages-grid{grid-template-columns:1fr;}}'
    );
  }

  // Forma, densidad y comportamiento
  r.push(`.package-card{border-radius:${Number(c.radius) || 0}px;}`);
  r.push(`.pkg-flyer-inner{padding:${Number(c.padding) || 0}px;}`);
  r.push(`.pkg-name{font-family:${c.serifNames ? `'Playfair Display',serif` : `'Inter',sans-serif`};` +
    `text-transform:${c.uppercaseNames ? 'uppercase' : 'none'};` +
    `letter-spacing:${c.uppercaseNames ? '.06em' : '0'};}`);
  if (!c.lineTop) r.push('.package-card::before{display:none !important;}');
  if (!c.hoverLift) r.push('.package-card:hover{transform:none !important;}');
  if (!c.shadow) r.push('.package-card:hover{box-shadow:none !important;}');

  // Qué se muestra
  const hide = [];
  if (!c.showCategory) hide.push('.pkg-category');
  if (!c.showSubtitle) hide.push('.pkg-subtitle');
  if (!c.showServiceCount) hide.push('.pkg-services-header', '.pkg-services-count');
  if (!c.showServices) hide.push('.pkg-services');
  if (!c.showPrice) hide.push('.pkg-price');
  if (!c.showCta) hide.push('.pkg-cta');
  if (hide.length) r.push(`${hide.join(',')}{display:none !important;}`);
  // El separador de arriba del listado pierde sentido sin lista.
  if (!c.showServices) r.push('.pkg-divider{display:none !important;}');

  // Variante por TIER (lo que hace que cada nivel se distinga de un vistazo)
  for (const key of HS_TIERS) {
    const t = d.tiers[key];
    if (!t) continue;
    const k = `.package-card.tier-${key}`;
    r.push(
      `${k}{background:${hsEsc(t.dark)};` +
        `border-color:${c.borderWidth ? hsAlpha(t.accent, t.borderAlpha) : 'transparent'};` +
        `border-width:${Number(c.borderWidth) || 0}px;}`
    );
    r.push(`${k} .pkg-name{color:#fff;}`);
    r.push(`${k} .pkg-price-value,${k} .pkg-category-name{color:${hsEsc(t.accent)};}`);
    r.push(`${k} .pkg-icon-svg{color:${hsEsc(t.accent)};}`);
    r.push(`${k} .pkg-subtitle{color:${hsAlpha('#ffffff', 0.55)};}`);
    r.push(
      `${k} .pkg-cta{color:${hsEsc(t.accentSoft)};border-color:${hsAlpha(t.accent, 0.75)};}`
    );
    r.push(
      t.badgeFilled
        ? `${k} .pkg-tier-badge{background:linear-gradient(135deg,${hsEsc(t.accent)},${hsEsc(t.accentSoft)});` +
          `color:${hsEsc(t.dark)};border-color:transparent;}`
        : `${k} .pkg-tier-badge{background:${hsAlpha(t.accent, 0.12)};` +
          `color:${hsEsc(t.accentSoft)};border-color:${hsAlpha(t.accent, 0.35)};}`
    );
  }
  return r.join('\n');
}

/** Aplica el diseño a la página (idempotente: reemplaza el <style> anterior). */
function applySiteDesign(rawDesign) {
  if (typeof document === 'undefined') return;
  const design = hsMerge(SITE_DESIGN_DEFAULT, rawDesign || {});
  let style = document.getElementById('hs-site-design');
  if (!style) {
    style = document.createElement('style');
    style.id = 'hs-site-design';
    document.head.appendChild(style);
  }
  style.textContent = siteDesignCss(design);
  // Se publica para que las tarjetas puedan leer textos del diseño
  // ("Desde" / "Cotizar") mientras se renderizan.
  window.HS_SITE_DESIGN = design;
  return design;
}

/**
 * Contenido de la PORTADA (documento `landing`) — lo edita el diseñador web.
 * Los ganchos son atributos del HTML:
 *   data-hs="clave"        → texto
 *   data-hs-img="clave"    → src de una imagen
 *   data-hs-section="name" → visibilidad y orden de una sección
 */
function applySiteContent(rawLanding) {
  if (typeof document === 'undefined') return;
  const l = rawLanding || {};
  // Textos (uno por gancho `data-hs`).
  const texts = l.texts || {};
  for (const [key, value] of Object.entries(texts)) {
    const el = document.querySelector(`[data-hs="${key}"]`);
    if (el && value != null) setHsText(el, String(value));
  }
  // Imágenes: `src` si el gancho está en un <img>, fondo si está en un div
  // (el hero y el divisor parallax son fondos).
  const images = l.images || {};
  for (const [key, value] of Object.entries(images)) {
    const el = document.querySelector(`[data-hs-img="${key}"]`);
    if (!el || !value) continue;
    const url = String(value).trim();
    // Un valor con comillas o paréntesis rompería el CSS: se ignora.
    if (/[")]/.test(url)) continue;
    if (el.tagName === 'IMG') el.setAttribute('src', url);
    else el.style.backgroundImage = `url("${url}")`;
  }
  applySectionOrder(l.sections || {});
}

/**
 * Texto del diseño. Los ganchos con `data-hs-lines` admiten dos líneas
 * separadas por `|` y la segunda se envuelve con énfasis (el <span> dorado del
 * hero, el <em> del divisor): así se puede editar el titular sin perder el
 * diseño. Sin ese atributo, el valor reemplaza el texto tal cual.
 */
function setHsText(el, value) {
  if (!el.dataset || el.dataset.hsLines === undefined) {
    el.textContent = value;
    return;
  }
  const parts = value.split('|');
  el.textContent = parts[0].trim();
  const rest = parts.slice(1).join('|').trim();
  if (!rest) return;
  el.appendChild(document.createElement('br'));
  const node = document.createElement(el.dataset.hsEm !== undefined ? 'em' : 'span');
  node.textContent = rest;
  el.appendChild(node);
}

/**
 * Secciones de la portada: mostrar/ocultar y ORDEN.
 *
 * El orden se aplica moviendo las secciones dentro del documento (no con
 * `order` de flexbox: la portada no es un contenedor flexible). Se hace de una
 * sola vez, tomando como ancla el final del bloque de secciones, así que
 * repetirlo no cambia nada más (idempotente).
 */
function applySectionOrder(sections) {
  const nodes = [...document.querySelectorAll('[data-hs-section]')].map((el) => {
    const name = el.getAttribute('data-hs-section');
    const conf = sections[name] || {};
    if (conf.visible === false) el.style.display = 'none';
    else if (conf.visible === true) el.style.display = '';
    return { el, order: conf.order };
  });
  if (!nodes.length) return;
  // Sin ningún orden elegido, no se toca el documento.
  if (!nodes.some((n) => n.order != null)) return;
  const last = nodes[nodes.length - 1].el;
  const parent = last.parentNode;
  const after = last.nextSibling;
  const sorted = nodes
    .map((n, i) => ({ el: n.el, i, rank: n.order == null ? i : Number(n.order) }))
    .sort((a, b) => a.rank - b.rank || a.i - b.i);
  for (const n of sorted) parent.insertBefore(n.el, after);
}

// ---------- lectura desde la API ----------

let hsSiteLoaded = null;

/**
 * Pide el diseño al backend y lo aplica. Se hace UNA vez por carga (se
 * memoiza) y nunca lanza: sin backend, la página se ve como siempre.
 */
function loadSiteConfig() {
  if (hsSiteLoaded) return hsSiteLoaded;
  hsSiteLoaded = (async () => {
    const base = (window.HARDSTREET_API_URL || '').replace(/\/$/, '');
    let design = null;
    let landing = null;
    try {
      const res = await fetch(base + '/api/site', { headers: { Accept: 'application/json' } });
      if (res.ok) {
        const data = await res.json();
        design = data.design || null;
        landing = data.landing || null;
      }
    } catch (_) {
      // Sin backend: defaults.
    }
    applySiteDesign(design);
    applySiteContent(landing);
    // En las páginas que ya pintaron tarjetas antes de llegar aquí (los tableros
    // no esperan a la API), los textos del diseño y el tope de servicios se
    // corrigen en el momento.
    refreshDesignTexts(document);
    trimServiceLists(document);
    return { design: hsMerge(SITE_DESIGN_DEFAULT, design || {}), landing };
  })();
  return hsSiteLoaded;
}

/**
 * Recorta el listado de servicios de cada tarjeta al tope del diseño y resume
 * el resto en "+N más…". Se llama después de pintar el catálogo y es
 * IDEMPOTENTE: se puede repetir (p. ej. cuando el diseño llega después de las
 * tarjetas) sin ir contando el "+N más…" como si fuera un servicio.
 */
function trimServiceLists(root) {
  const design = window.HS_SITE_DESIGN || SITE_DESIGN_DEFAULT;
  const limit = Number(design.card && design.card.servicesLimit);
  if (!limit || limit <= 0) return;
  const scope = root || document;
  scope.querySelectorAll('.package-card').forEach((card) => {
    const list = card.querySelector('.pkg-services');
    if (!list) return;
    // Los servicios de verdad: el resumen "+N más…" no cuenta.
    const items = [...list.querySelectorAll('li')].filter(
      (li) => !li.classList.contains('pkg-services-more')
    );
    // Cuántos servicios traía la tarjeta: se recuerda para que repetir la
    // llamada (el diseño puede llegar después de pintarlas) no cuente de más.
    if (!list.dataset.hsTotal) list.dataset.hsTotal = String(items.length);
    const total = Number(list.dataset.hsTotal) || items.length;
    const hidden = Math.max(0, total - limit);
    items.slice(limit).forEach((li) => li.remove());
    let more = card.querySelector('.pkg-services-more');
    if (!hidden) {
      if (more) more.remove();
      return;
    }
    if (!more) {
      more = document.createElement('li');
      more.className = 'pkg-services-more';
      more.style.cssText = 'color:rgba(255,255,255,.45);font-style:italic;';
      list.appendChild(more);
    }
    more.textContent = `+${hidden} más…`;
  });
}

/**
 * Textos que el diseño pone en las tarjetas ("Desde" / "Cotizar"…).
 *
 * Las tarjetas ya pintadas los llevan dentro del HTML, así que si el diseño
 * llega DESPUÉS de pintarlas (los tableros de cliente no esperan a la API) aquí
 * se corrigen sin volver a dibujar nada.
 */
function refreshDesignTexts(root) {
  const design = window.HS_SITE_DESIGN || SITE_DESIGN_DEFAULT;
  const c = (design && design.card) || {};
  const scope = root || document;
  if (c.priceLabel) {
    scope.querySelectorAll('.pkg-price-label').forEach((el) => {
      el.textContent = c.priceLabel;
    });
  }
  if (c.ctaLabel) {
    scope.querySelectorAll('.pkg-cta > span').forEach((el) => {
      el.textContent = c.ctaLabel;
    });
  }
}

// En las páginas del cliente (dashboard) no hay catálogo pero sí tarjetas de
// paquete: se aplica solo, sin que cada página tenga que llamarlo.
if (typeof document !== 'undefined') {
  const boot = () => loadSiteConfig();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
}

window.HSSite = {
  defaults: SITE_DESIGN_DEFAULT,
  load: loadSiteConfig,
  apply: applySiteDesign,
  applyContent: applySiteContent,
  css: siteDesignCss,
  trimServices: trimServiceLists,
  refreshTexts: refreshDesignTexts,
  merge: hsMerge,
};
