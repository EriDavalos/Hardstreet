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

// ==================================================================
// SECCIONES DE LA PORTADA (contenido por sección)
// ==================================================================
// Cada sección tiene, además de sus textos e imágenes (ganchos `data-hs` y
// `data-hs-img`), sus PROPIAS opciones: los números de "Sobre nosotros", las
// fotos de cada categoría de la galería, los comentarios de los clientes, el
// WhatsApp de contacto… El panel las edita por sección y aquí se aplican.
//
// Estos defaults son el contenido de fábrica de la página. El panel los espeja
// (`Hardstreet_Admin/lib/web_sections.dart`) y una prueba compara los dos.

const SITE_SECTIONS_DEFAULT = {
  hero: {},
  about: {
    stats: [
      { value: 30, label: 'Proyectos' },
      { value: 4, label: 'Años Exp.' },
      { value: 50, label: 'Clientes Felices' },
    ],
  },
  // 'public' = las fotos que ya están marcadas como públicas en el Drive;
  // 'custom' = las elegidas por categoría desde el panel.
  gallery: { mode: 'public', categories: [] },
  parallax: {},
  services: { servicesPerSlide: 4 },
  packages: { groupByCategory: true },
  testimonials: { items: [] },
  contact: { whatsapp: '' },
  footer: {},
  brand: {},
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

/** Claves CSS de una categoría: "XV Años" → "xv-anos" (igual que la web). */
function hsCategoryKey(name) {
  return String(name == null ? '' : name)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Opciones de UNA sección, mezcladas con las de fábrica.
 * Lo que no venga en el documento se queda como siempre (una sección nueva o
 * a medio llenar nunca deja la página rara).
 */
function hsSectionProps(name, landing) {
  const stored = (landing && landing.sections && landing.sections[name]) || {};
  const patch = stored.props || {};
  const base = SITE_SECTIONS_DEFAULT[name] || {};
  return hsMerge(base, patch);
}

/** Números de "Sobre nosotros" (valor + etiqueta), ya limpios. */
function hsStats(props) {
  const raw = (props && props.stats) || [];
  const out = [];
  for (const s of raw) {
    if (!s || typeof s !== 'object') continue;
    const value = Number(s.value);
    const label = String(s.label == null ? '' : s.label).trim();
    if (!Number.isFinite(value) || !label) continue;
    out.push({ value: Math.max(0, Math.round(value)), label });
  }
  return out;
}

/**
 * Categorías de la galería con sus fotos ELEGIDAS en el panel.
 * Devuelve [] cuando no hay nada configurado: en ese caso la página usa las
 * fotos públicas de siempre.
 */
function hsGalleryCategories(props) {
  const raw = (props && props.categories) || [];
  const out = [];
  for (const c of raw) {
    if (!c || typeof c !== 'object') continue;
    const name = String(c.name == null ? '' : c.name).trim();
    const key = String(c.key == null ? '' : c.key).trim() || hsCategoryKey(name);
    if (!key) continue;
    const items = (Array.isArray(c.items) ? c.items : [])
      .map((v) => String(v == null ? '' : v).trim())
      .filter(Boolean);
    if (!items.length) continue;
    out.push({ key, name: name || key, items });
  }
  return out;
}

/** Comentarios de clientes configurados en el panel (vacío = los de fábrica). */
function hsTestimonials(props) {
  const raw = (props && props.items) || [];
  const out = [];
  for (const t of raw) {
    if (!t || typeof t !== 'object') continue;
    const text = String(t.text == null ? '' : t.text).trim();
    const name = String(t.name == null ? '' : t.name).trim();
    if (!text && !name) continue;
    out.push({ name, role: String(t.role == null ? '' : t.role).trim(), text });
  }
  return out;
}

/**
 * EL PLAN de la portada: todo lo que hay que pintar, ya mezclado con los
 * defaults. Es una función PURA (mismo documento → mismo plan): la usa
 * `applySiteContent` y las pruebas la revisan sin navegador.
 */
function siteContentPlan(rawLanding) {
  const l = rawLanding && typeof rawLanding === 'object' ? rawLanding : {};
  const sections = {};
  for (const name of Object.keys(SITE_SECTIONS_DEFAULT)) {
    sections[name] = hsSectionProps(name, l);
  }
  const galleryCategories = hsGalleryCategories(sections.gallery);
  const testimonials = hsTestimonials(sections.testimonials);
  const whatsapp = String(sections.contact.whatsapp == null ? '' : sections.contact.whatsapp)
    .replace(/[^0-9]/g, '');
  return {
    texts: l.texts || {},
    images: l.images || {},
    layout: l.sections || {},
    sections,
    stats: hsStats(sections.about),
    gallery: { categories: galleryCategories, custom: galleryCategories.length > 0 },
    testimonials,
    packages: { groupByCategory: sections.packages.groupByCategory !== false },
    services: { perSlide: Number(sections.services.servicesPerSlide) || 4 },
    contact: { whatsapp, whatsappUrl: whatsapp ? `https://wa.me/${whatsapp}` : '' },
  };
}

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
  // El PLAN de la portada: textos, imágenes, orden de secciones y las
  // opciones propias de cada sección (números, galería, testimonios…).
  const plan = siteContentPlan(rawLanding);
  // Se publica para las páginas que pintan datos propios (index.js y los
  // tableros del cliente): leen el MISMO plan.
  window.HS_SITE_CONTENT = plan;

  // Textos (uno por gancho `data-hs`).
  for (const [key, value] of Object.entries(plan.texts)) {
    const el = document.querySelector(`[data-hs="${key}"]`);
    if (el && value != null) setHsText(el, String(value));
  }
  // Correo y teléfono: si el valor es un correo o un teléfono, su enlace se
  // actualiza solo (mailto:/tel:) para que se pueda tocar desde el celular.
  document.querySelectorAll('[data-hs-mail]').forEach((el) => {
    const href = contactHref(el.textContent, 'mail');
    if (href) el.setAttribute('href', href);
  });
  document.querySelectorAll('[data-hs-tel]').forEach((el) => {
    const href = contactHref(el.textContent, 'tel');
    if (href) el.setAttribute('href', href);
  });
  // Imágenes: `src` si el gancho está en un <img>, fondo si está en un div
  // (el hero y el divisor parallax son fondos).
  for (const [key, value] of Object.entries(plan.images)) {
    const el = document.querySelector(`[data-hs-img="${key}"]`);
    if (!el || !value) continue;
    const url = String(value).trim();
    // Un valor con comillas o paréntesis rompería el CSS: se ignora.
    if (/[")]/.test(url)) continue;
    if (el.tagName === 'IMG') el.setAttribute('src', url);
    else el.style.backgroundImage = `url("${url}")`;
  }
  applySectionOrder(plan.layout);
  applyStats(plan);
  applyGalleryContent(plan);
  applyTestimonials(plan);
  applyWhatsapp(plan);
  return plan;
}

/** Enlace de un dato de contacto (`mailto:` / `tel:`). Puro. */
function contactHref(value, kind) {
  const v = String(value == null ? '' : value).trim();
  if (!v) return '';
  if (kind === 'tel') {
    const digits = v.replace(/[^0-9]/g, '');
    return digits ? `tel:+${digits.replace(/^00/, '')}` : '';
  }
  return /@/.test(v) ? `mailto:${v.replace(/\s+/g, '')}` : '';
}

/**
 * Números de "Sobre nosotros" (Proyectos / Años Exp. / Clientes Felices…).
 * Si el panel agrega más de los que trae el HTML, se clonan los bloques; si
 * deja menos, los que sobran se ocultan (no se borran: pueden volver).
 */
function applyStats(plan) {
  const wrap = document.querySelector('.about-stats');
  if (!wrap || !plan.stats.length) return;
  const blocks = [...wrap.querySelectorAll('[data-hs-stat]')];
  if (!blocks.length) return;
  while (blocks.length < plan.stats.length) {
    const copy = blocks[blocks.length - 1].cloneNode(true);
    wrap.appendChild(copy);
    blocks.push(copy);
  }
  plan.stats.forEach((s, i) => {
    const block = blocks[i];
    block.style.display = '';
    const number = block.querySelector('.stat-number');
    if (number) {
      number.setAttribute('data-count', String(s.value));
      number.textContent = `${s.value}+`;
    }
    const label = block.querySelector('.stat-label');
    if (label) label.textContent = s.label;
  });
  for (let i = plan.stats.length; i < blocks.length; i++) {
    blocks[i].style.display = 'none';
  }
  if (typeof window.HSObserveStats === 'function') window.HSObserveStats();
}

/** Botones de categoría de la galería ("Todos" + las categorías con fotos). */
function galleryFiltersHtml(plan) {
  return [
    '<button class="filter-btn active" data-filter="all">Todos</button>',
    ...plan.gallery.categories.map(
      (c) => `<button class="filter-btn" data-filter="${hsEsc(c.key)}">${hsEsc(c.name)}</button>`
    ),
  ].join('');
}

/** Rejilla de la galería con las fotos elegidas por categoría. Puro. */
function galleryHtml(plan) {
  const out = [];
  let i = 0;
  for (const c of plan.gallery.categories) {
    for (const item of c.items) {
      const url = String(item).replace(/["<>]/g, '').trim();
      if (!url) continue;
      out.push(
        `<div class="gallery-item ${i % 3 === 0 ? 'tall' : ''} reveal" data-category="${hsEsc(c.key)}">` +
          `<img src="${url}" alt="${hsEsc(c.name)}" loading="lazy" />` +
          `<div class="gallery-item-overlay"><h3>${hsEsc(c.name)}</h3><p>Fotografía</p></div>` +
          '<div class="gallery-item-line"></div>' +
        '</div>'
      );
      i++;
    }
  }
  return out.join('');
}

/**
 * Galería con las fotos elegidas en el panel. Sin fotos configuradas NO se
 * toca nada: la página sigue mostrando la galería pública de siempre.
 */
function applyGalleryContent(plan) {
  if (!plan.gallery.custom) return false;
  const grid = document.querySelector('.gallery-grid');
  if (!grid) return false;
  const filters = document.querySelector('.gallery-filters');
  if (filters) filters.innerHTML = galleryFiltersHtml(plan);
  grid.innerHTML = galleryHtml(plan);
  if (window.HSRevealObserver) {
    grid.querySelectorAll('.reveal').forEach((el) => window.HSRevealObserver.observe(el));
  }
  if (typeof window.HSBindGalleryFilters === 'function') window.HSBindGalleryFilters();
  return true;
}

/** Carrusel de testimonios con los comentarios escritos en el panel. */
function testimonialsHtml(plan) {
  const items = plan.testimonials;
  const slides = items.map((t, i) =>
    `<div class="testimonial-item ${i === 0 ? 'active' : ''}">` +
      `<p class="testimonial-quote">${hsEsc(t.text)}</p>` +
      `<p class="testimonial-author">${hsEsc(t.name)}</p>` +
      `<p class="testimonial-role">${hsEsc(t.role)}</p>` +
    '</div>'
  ).join('');
  const dots = items.map((_, i) =>
    `<span class="dot ${i === 0 ? 'active' : ''}" data-index="${i}"></span>`
  ).join('');
  return `${slides}<div class="testimonial-dots" id="testimonialDots">${dots}</div>`;
}

/**
 * Comentarios de clientes: sin nada escrito, se quedan los que trae el HTML
 * (así la sección nunca aparece vacía por no haberla llenado todavía).
 */
function applyTestimonials(plan) {
  if (!plan.testimonials.length) return false;
  const slider = document.querySelector('.testimonial-slider');
  if (!slider) return false;
  slider.innerHTML = testimonialsHtml(plan);
  if (typeof window.HSInitTestimonials === 'function') window.HSInitTestimonials();
  return true;
}

/** WhatsApp del contacto (si se configuró en el panel). */
function applyWhatsapp(plan) {
  const block = document.querySelector('[data-hs-whatsapp]');
  if (!block) return false;
  if (!plan.contact.whatsappUrl) {
    block.style.display = 'none';
    return false;
  }
  block.style.display = '';
  block.querySelectorAll('a').forEach((a) => a.setAttribute('href', plan.contact.whatsappUrl));
  return true;
}

/**
 * Paquetes agrupados por categoría (como los pide el módulo del sitio).
 * Puro: recibe los paquetes del catálogo y devuelve los grupos en orden.
 * Sin agrupación, un solo grupo con todo ('' = sin título).
 */
function groupPackages(packages, plan) {
  const list = (packages || []).filter((p) => !p.isExtern);
  if (!plan || !plan.packages || plan.packages.groupByCategory === false) {
    return [{ key: '', name: '', packages: list }];
  }
  const out = [];
  for (const p of list) {
    const key = String(p.categoryKey || (p.packageCategory && p.packageCategory.name) || '');
    const name = String((p.packageCategory && p.packageCategory.name) || key);
    let group = out.find((g) => g.key === key);
    if (!group) {
      group = { key, name, packages: [] };
      out.push(group);
    }
    group.packages.push(p);
  }
  return out;
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
    const plan = applySiteContent(landing);
    // En las páginas que ya pintaron tarjetas antes de llegar aquí (los tableros
    // no esperan a la API), los textos del diseño y el tope de servicios se
    // corrigen en el momento.
    refreshDesignTexts(document);
    trimServiceLists(document);
    return { design: hsMerge(SITE_DESIGN_DEFAULT, design || {}), landing, plan };
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
  // Diseño de las tarjetas
  defaults: SITE_DESIGN_DEFAULT,
  apply: applySiteDesign,
  css: siteDesignCss,
  trimServices: trimServiceLists,
  refreshTexts: refreshDesignTexts,
  merge: hsMerge,
  // Contenido de la portada (por sección)
  sectionsDefaults: SITE_SECTIONS_DEFAULT,
  plan: siteContentPlan,
  load: loadSiteConfig,
  applyContent: applySiteContent,
  applyGallery: applyGalleryContent,
  applyTestimonials,
  applyWhatsapp,
  galleryHtml,
  galleryFiltersHtml,
  testimonialsHtml,
  groupPackages,
  contactHref,
  categoryKey: hsCategoryKey,
};
