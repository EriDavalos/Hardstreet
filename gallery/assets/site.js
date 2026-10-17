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
    // Foto del paquete dentro de la tarjeta: 'none' (sin foto), 'top' (banda
    // arriba) o 'bg' (de fondo: la foto se ve a todo color y encima lleva el
    // velo NEGRO, que es lo que manda `imageFade`).
    imageMode: 'none',
    imageHeight: 150,
    imageFade: 0.7,
    // Entrada de las tarjetas del catálogo: 'up' | 'fade' | 'zoom' | 'none'.
    animMode: 'up',
    animMs: 600,
    animStagger: 100,
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

/** Color del velo que oscurece la FOTO DE FONDO de una tarjeta: negro. */
const HS_PHOTO_FADE = '#000000';

/** `imageFade` del diseño, normalizado a 0..1 (0 = la foto se ve limpia). */
function hsPhotoFadeAmount(v) {
  if (v === undefined || v === null || v === '') return SITE_DESIGN_DEFAULT.card.imageFade;
  const n = Number(v);
  return Math.max(0, Math.min(1, Number.isFinite(n) ? n : SITE_DESIGN_DEFAULT.card.imageFade));
}

/**
 * Degradado que oscurece la FOTO DE FONDO de una tarjeta.
 *
 * La foto se pinta a TODO color y encima va este velo, que es NEGRO
 * ([HS_PHOTO_FADE]): abajo (donde van el nombre, los servicios y el precio) y a
 * la izquierda tapa más, y arriba a la derecha deja ver la foto. [amount]
 * (0..1) manda cuánto tapa. Es el mismo velo del panel, así el texto resalta
 * igual en los dos lados.
 *
 * Los dos degradados van en la MISMA capa para que la foto quede debajo: uno
 * vertical (de arriba abajo) y otro en diagonal (de izquierda a derecha).
 */
function hsPhotoFade(dark, amount) {
  const f = Math.round(Math.max(0, Math.min(1, amount)) * 100) / 100;
  const a = (x) => hsAlpha(dark, Math.round(Math.max(0, Math.min(1, x)) * 100) / 100);
  return (
    `linear-gradient(180deg,${a(f * .15)} 0%,${a(f * .5)} 45%,${a(f)} 100%),` +
      `linear-gradient(95deg,${a(f * .78)} 0%,${a(f * .5)} 45%,${a(f * .1)} 100%)`
  );
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

// ==================================================================
// FOTOS EN DOS TIEMPOS (miniatura → original)
// ==================================================================
// Las fotos que el panel toma del Drive viven en el servidor del Drive, y ese
// MISMO servidor sabe hacer miniaturas (`/thumb/<ruta>?w=N`). Así que una foto
// de la página se pide en DOS tiempos: primero la miniatura (unos cuantos KB:
// aparece casi al instante, aunque borrosa) y cuando la original termina de
// bajar se cambia por ella. La miniatura se ve borrosa mientras tanto (`class
// hs-img-low`), que es la pista de que la foto todavía está mejorando.
//
// Solo aplica a las fotos del DRIVE (cualquier URL con `/files/<ruta>`): las
// imágenes propias del sitio (`images/…`) no tienen miniatura y se cargan como
// siempre.

/**
 * Ancho de la miniatura para una foto de la galería.
 */
const HS_THUMB_WIDTH = 320;

/** Ancho de la miniatura de un FONDO (se ve a pantalla completa). */
const HS_THUMB_WIDTH_BG = 1280;

/**
 * Host(s) del servidor del Drive: el ÚNICO que sabe hacer miniaturas
 * (`/thumb/...`). Se puede ampliar al desplegar con
 * `window.HS_DRIVE_HOSTS = ['mi-drive.ddns.net']`.
 */
const HS_DRIVE_HOSTS = ['oriongo.ddns.net'];

/** Hosts "de casa" (localhost o IP privada): también son el Drive interno. */
function hsIsLocalHost(host) {
  const h = String(host || '').toLowerCase();
  if (!h) return false;
  if (h === 'localhost' || h === '127.0.0.1' || h === '::1' || h === '[::1]') return true;
  if (h.endsWith('.local') || h.endsWith('.lan')) return true;
  const m = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec(h);
  if (!m) return false;
  const [a, b] = [Number(m[1]), Number(m[2])];
  if (a === 10) return true;
  if (a === 192 && b === 168) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  return false;
}

/** Host de una URL absoluta ('' si es relativa). */
function hsHostOf(url) {
  const m = /^[a-z][a-z0-9+.\-]*:\/\/([^/?#]+)/i.exec(String(url || '').trim());
  if (!m) return '';
  return m[1]
    .replace(/^[^@]*@/, '') // sin usuario:contraseña
    .replace(/^\[/, '')
    .replace(/\]$/, '')
    .replace(/:\d+$/, '') // sin puerto
    .toLowerCase();
}

/** Hosts del Drive configurados (los de fábrica + los del despliegue). */
function hsDriveHosts() {
  const extra =
    typeof window !== 'undefined' && Array.isArray(window.HS_DRIVE_HOSTS)
      ? window.HS_DRIVE_HOSTS
      : [];
  return [...HS_DRIVE_HOSTS, ...extra].map((h) => String(h || '').toLowerCase());
}

/**
 * ¿Es una URL de una foto del Drive INTERNO? (`https://oriongo.ddns.net/files/...`)
 *
 * Ojo: NO basta con que la URL lleve `/files/` dentro. Cualquier otro enlace
 * (una foto de otro sitio, un servicio que también use `/files/`) se deja TAL
 * CUAL: antes se le cambiaba la ruta por `/thumb/...?w=` y la foto salía rota.
 */
function hsIsDriveImage(url) {
  const clean = String(url == null ? '' : url).trim();
  if (clean.indexOf('/files/') === -1) return false;
  const host = hsHostOf(clean);
  if (!host) return false; // ruta relativa del propio sitio: no hay miniatura
  if (hsDriveHosts().indexOf(host) !== -1) return true;
  return hsIsLocalHost(host);
}

/**
 * URL de la MINIATURA de una foto del Drive (null si no es del Drive interno).
 * Puro: mismo URL → misma miniatura, se puede probar sin navegador.
 */
function hsThumbUrl(url, width) {
  const clean = String(url == null ? '' : url).trim();
  if (!hsIsDriveImage(clean)) return null;
  const cut = clean.indexOf('/files/');
  const base = clean.slice(0, cut);
  // Sin query ni hash (ni `/files/` del final): la miniatura se pide por RUTA.
  const path = clean.slice(cut + '/files/'.length).split(/[?#]/)[0];
  if (!path) return null;
  const n = Number(width);
  const w = Math.max(32, Math.min(2048, Math.round(n > 0 ? n : HS_THUMB_WIDTH)));
  return `${base}/thumb/${path}?w=${w}`;
}

/** `<img>` de una foto, en DOS tiempos si es del Drive. Puro. */
function hsGalleryImgHtml(url, alt, opts) {
  const clean = String(url == null ? '' : url).replace(/["<>]/g, '').trim();
  if (!clean) return '';
  const safeAlt = hsEsc(alt);
  const thumb = hsThumbUrl(clean, opts && opts.width);
  if (!thumb) return `<img src="${clean}" alt="${safeAlt}" loading="lazy" />`;
  return `<img src="${thumb}" data-hs-full="${clean}" class="hs-img-low"` +
    ` alt="${safeAlt}" loading="lazy" />`;
}

/**
 * Pinta una foto en DOS tiempos: miniatura ya, original cuando llegue.
 * Devuelve true si quedó en dos tiempos (hay miniatura).
 */
function hsLoadProgressiveImage(el, url, opts) {
  const full = String(url == null ? '' : url).trim();
  if (!el || !full) return false;
  const thumb = hsThumbUrl(full, opts && opts.width);
  if (!thumb) {
    el.setAttribute('src', full);
    return false;
  }
  el.classList.add('hs-img-low');
  el.setAttribute('src', thumb);
  const full1 = new Image();
  full1.onload = () => {
    el.setAttribute('src', full);
    el.classList.remove('hs-img-low');
  };
  // Si la original no llega (foto movida, sesión del Drive, red): se queda la
  // miniatura a la vista, sin el desenfoque (mejor eso que un hueco).
  full1.onerror = () => el.classList.remove('hs-img-low');
  full1.src = full;
  return true;
}

/** Igual que [hsLoadProgressiveImage] pero para un FONDO (hero, divisor). */
function hsLoadProgressiveBackground(el, url, opts) {
  const full = String(url == null ? '' : url).trim();
  if (!el || !full) return false;
  const thumb = hsThumbUrl(full, (opts && opts.width) || HS_THUMB_WIDTH_BG);
  if (!thumb) {
    el.style.backgroundImage = `url("${full}")`;
    return false;
  }
  el.style.backgroundImage = `url("${thumb}")`;
  const full1 = new Image();
  full1.onload = () => { el.style.backgroundImage = `url("${full}")`; };
  full1.src = full;
  return true;
}

/**
 * Aplica el modo en dos tiempos a todo lo que quedó marcado con
 * `data-hs-full` (los HTML que se arman aquí ya traen la miniatura puesta).
 */
function hsScanProgressiveImages(root) {
  if (typeof document === 'undefined') return 0;
  const scope = root || document;
  let n = 0;
  scope.querySelectorAll('[data-hs-full]').forEach((el) => {
    const full = el.getAttribute('data-hs-full');
    el.removeAttribute('data-hs-full');
    if (el.tagName === 'IMG') hsLoadProgressiveImage(el, full);
    else hsLoadProgressiveBackground(el, full);
    n++;
  });
  return n;
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
  // Las secciones AGREGADAS (una segunda galería, otro divisor…): el panel las
  // guarda aparte porque el HTML no tiene ganchos para ellas.
  const extras = hsExtraSections(l);
  const galleryCategories = hsGalleryCategories(sections.gallery);
  const testimonials = hsTestimonials(sections.testimonials);
  const whatsapp = String(sections.contact.whatsapp == null ? '' : sections.contact.whatsapp)
    .replace(/[^0-9]/g, '');
  // La visibilidad y el orden de las copias viajan con las de las secciones de
  // fábrica: así el orden de la página se calcula de una sola vez.
  const layout = { ...(l.sections || {}) };
  for (const ex of extras) {
    layout[ex.id] = { visible: ex.visible, order: ex.order };
  }
  return {
    texts: l.texts || {},
    images: l.images || {},
    layout,
    sections,
    extras,
    stats: hsStats(sections.about),
    gallery: { categories: galleryCategories, custom: galleryCategories.length > 0 },
    testimonials,
    packages: { groupByCategory: sections.packages.groupByCategory !== false },
    services: { perSlide: Number(sections.services.servicesPerSlide) || 4 },
    contact: { whatsapp, whatsappUrl: whatsapp ? `https://wa.me/${whatsapp}` : '' },
  };
}

// ---------- secciones AGREGADAS ----------

/**
 * Las secciones agregadas del documento, ya limpias y ordenadas. PURA (mismo
 * documento → mismo resultado): la usa el plan y las pruebas la revisan sin
 * navegador.
 *
 * Cada copia necesita su `id` (el nombre de la instancia: `gallery-2`), de qué
 * `key` es copia y lo que se escribió para ella. Lo que no sirva se descarta:
 * una copia sin id o sin plantilla no se puede pintar.
 */
function hsExtraSections(rawLanding) {
  const l = rawLanding && typeof rawLanding === 'object' ? rawLanding : {};
  const raw = Array.isArray(l.extraSections) ? l.extraSections : [];
  const out = [];
  const seen = new Set();
  for (const e of raw) {
    if (!e || typeof e !== 'object') continue;
    const id = String(e.id == null ? '' : e.id).trim();
    const key = String(e.key == null ? '' : e.key).trim();
    // Sin nombre o sin plantilla no hay nada que clonar; y un nombre repetido
    // dejaría la página con dos secciones iguales.
    if (!id || !key || seen.has(id)) continue;
    seen.add(id);
    out.push({
      id,
      key,
      visible: e.visible !== false,
      order: Number.isFinite(Number(e.order)) ? Number(e.order) : 0,
      texts: hsCleanMap(e.texts),
      images: hsCleanMap(e.images),
      props: e.props && typeof e.props === 'object' ? e.props : {},
    });
  }
  return out;
}

/** Pares clave → texto, sin vacíos ni valores raros. */
function hsCleanMap(v) {
  const out = {};
  if (!v || typeof v !== 'object' || Array.isArray(v)) return out;
  for (const [k, value] of Object.entries(v)) {
    const text = String(value == null ? '' : value).trim();
    if (k && text) out[k] = text;
  }
  return out;
}

/**
 * Plan de UNA copia: sus opciones (galería, números, testimonios, WhatsApp…)
 * mezcladas con las de fábrica, como si fuera una sección normal. Es lo que
 * permite pintar la copia con SU contenido y no con el de la original.
 */
function extraSectionPlan(ex) {
  return siteContentPlan({ sections: { [ex.key]: { props: ex.props } } });
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

  // FOTO del paquete. La foto la pinta `renderers.js` (de los paquetes de la
  // web); aquí solo se decide DÓNDE va y cuánto se ve.
  const imageMode = String(c.imageMode || 'none');
  if (imageMode === 'top') {
    const h = Math.max(0, Number(c.imageHeight) || 0);
    r.push(`.pkg-photo{display:block;width:100%;height:${h}px;object-fit:cover;}`);
  } else if (imageMode === 'bg') {
    // La foto va a TODO color (sin `opacity`): el oscurecido lo pone el
    // DEGRADADO NEGRO de encima (`.pkg-photo-bg::after`), así la foto se ve y
    // el texto resalta. Es el MISMO velo que pone el panel (`hsPhotoFade` con
    // negro), para que las dos tarjetas se vean igual.
    r.push(
      '.pkg-photo-bg{position:absolute;inset:0;background-size:cover;' +
        'background-position:center;pointer-events:none;}'
    );
    r.push(
      ".pkg-photo-bg::after{content:'';position:absolute;inset:0;" +
        `background:${hsPhotoFade(HS_PHOTO_FADE, hsPhotoFadeAmount(c.imageFade))};}`
    );
    // Con la foto de fondo, el contenido sube de capa para seguir leyéndose y
    // el pie se apoya en un poco más de negro (en el panel también).
    r.push('.package-card>.pkg-flyer-inner{position:relative;z-index:1;}');
    r.push(`.pkg-footer{background:${hsAlpha('#000000', 0.34)};}`);
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

  // ENTRADA de las tarjetas del catálogo.
  //
  // Las tarjetas llegan con la clase `reveal` (opacidad 0 y 60px abajo hasta
  // que el scroll las activa) y con un `animation: pkgFadeIn … forwards` de
  // index.css; con `forwards` el transform quedaba CONGELADO y la tarjeta no
  // se elevaba al pasar el mouse. Aquí se neutraliza el reveal y la animación
  // termina en el estado natural (`backwards`), así el hover vuelve a funcionar.
  const anim = String(c.animMode || 'none');
  const animMs = Math.max(0, Math.round(Number(c.animMs) || 0));
  const stagger = Math.max(0, Math.round(Number(c.animStagger) || 0));
  r.push(
    '.packages-grid .package-card.reveal{opacity:1;transform:none;' +
      'transition:transform .5s cubic-bezier(.4,0,.2,1),opacity .5s ease;}'
  );
  if (c.hoverLift) {
    r.push('.packages-grid .package-card.reveal:hover{transform:translateY(-8px);}');
  }
  if (anim === 'none' || !animMs) {
    r.push('.packages-grid .package-card{animation:none;}');
  } else {
    r.push(`@keyframes hsPkgIn{from{${hsCardFrom(anim)}}to{opacity:1;transform:none;}}`);
    r.push(
      '.packages-grid .package-card{' +
        `animation:hsPkgIn ${animMs}ms cubic-bezier(.4,0,.2,1) backwards;}`
    );
  }
  // El retardo escalonado se emite SIEMPRE (aunque sea 0): así manda sobre los
  // retardos fijos de index.css y "todas a la vez" es de verdad todas.
  for (let i = 1; i <= 14; i++) {
    r.push(
      `.packages-grid .package-card:nth-child(${i}){animation-delay:${(i - 1) * stagger}ms;}`
    );
  }

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
    r.push(`${k} .pkg-subtitle,${k} .pkg-description{color:${hsAlpha('#ffffff', 0.55)};}`);
    // El pie lleva un tinte del acento del tier (como el del panel).
    r.push(`${k} .pkg-footer{background:${hsAlpha(t.accent, 0.05)};}`);
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

/** Fotograma inicial de la entrada de las tarjetas, según el modo. */
function hsCardFrom(mode) {
  if (mode === 'zoom') return 'opacity:0;transform:scale(.94);';
  if (mode === 'fade') return 'opacity:0;';
  return 'opacity:0;transform:translateY(20px);';
}

/**
 * Animación de entrada de UNA tarjeta, según el diseño guardado.
 *
 * La usa el filtro por categoría (`index.js`), que vuelve a animar las tarjetas
 * que aparecen: así filtrar se ve igual que cargar la página. El pintado
 * inicial lo hace el CSS de [siteDesignCss] con los MISMOS valores.
 */
function hsCardAnim(index) {
  const design = window.HS_SITE_DESIGN || SITE_DESIGN_DEFAULT;
  const c = (design && design.card) || {};
  const mode = String(c.animMode || 'none');
  const ms = Math.max(0, Math.round(Number(c.animMs) || 0));
  const stagger = Math.max(0, Math.round(Number(c.animStagger) || 0));
  const i = Math.max(1, Math.round(Number(index) || 1));
  if (mode === 'none' || !ms) return { animation: 'none', delay: '0ms' };
  return {
    animation: `hsPkgIn ${ms}ms cubic-bezier(.4,0,.2,1) backwards`,
    delay: `${(i - 1) * stagger}ms`,
  };
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
    // La foto entra en DOS tiempos (miniatura y luego la original) cuando
    // viene del Drive; si es una imagen propia del sitio, como siempre.
    if (el.tagName === 'IMG') hsLoadProgressiveImage(el, url);
    else hsLoadProgressiveBackground(el, url);
  }
  applyStats(plan);
  applyGalleryContent(plan);
  applyTestimonials(plan);
  applyWhatsapp(plan);
  // Las secciones AGREGADAS: se levantan DESPUÉS de que las de fábrica tengan
  // su contenido, así la copia nace con lo mismo y luego se le aplica lo suyo.
  applyExtraSections(plan);
  // El orden va al final: tiene que ver también a las copias.
  applySectionOrder(plan.layout);
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
function applyStats(plan, root) {
  const scope = root || document;
  const wrap = scope.querySelector('.about-stats');
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
          hsGalleryImgHtml(url, c.name) +
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
function applyGalleryContent(plan, root) {
  if (!plan.gallery.custom) return false;
  const scope = root || document;
  const grid = scope.querySelector('.gallery-grid');
  if (!grid) return false;
  const filters = scope.querySelector('.gallery-filters');
  if (filters) filters.innerHTML = galleryFiltersHtml(plan);
  // Las fotos que vinieron del Drive arrancan con su miniatura: aquí se les
  // engancha la original (baja → alta calidad).
  grid.innerHTML = galleryHtml(plan);
  hsScanProgressiveImages(grid);
  if (window.HSRevealObserver) {
    grid.querySelectorAll('.reveal').forEach((el) => window.HSRevealObserver.observe(el));
  }
  // Los filtros se enganchan SOLO a esta galería (cada una con los suyos).
  if (typeof window.HSBindGalleryFilters === 'function') {
    window.HSBindGalleryFilters(root ? scope : undefined);
  }
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
function applyTestimonials(plan, root) {
  if (!plan.testimonials.length) return false;
  const scope = root || document;
  const slider = scope.querySelector('.testimonial-slider');
  if (!slider) return false;
  slider.innerHTML = testimonialsHtml(plan);
  // En una COPIA el carrusel se maneja aquí dentro: el de index.js se queda
  // con los testimonios de la página, y si no, los dos se pisarían (los
  // comentarios de una sección girarían en la otra).
  if (root) hsInitInstanceTestimonials(scope);
  else if (typeof window.HSInitTestimonials === 'function') window.HSInitTestimonials();
  return true;
}

/**
 * Carrusel de testimonios de UNA copia: sus comentarios, sus puntos y su
 * propio giro automático, sin tocar los de las demás secciones.
 */
function hsInitInstanceTestimonials(scope) {
  const items = [...scope.querySelectorAll('.testimonial-item')];
  const dots = [...scope.querySelectorAll('.testimonial-dots .dot')];
  if (!items.length) return;
  const show = (i) => {
    items.forEach((el, k) => el.classList.toggle('active', k === i));
    dots.forEach((d, k) => d.classList.toggle('active', k === i));
  };
  show(0);
  dots.forEach((dot, i) => {
    const index = Number(dot.getAttribute('data-index'));
    dot.addEventListener('click', () => show(Number.isFinite(index) ? index : i));
  });
  if (items.length > 1) {
    setInterval(() => {
      const current = items.findIndex((el) => el.classList.contains('active'));
      show((current + 1) % items.length);
    }, 5000);
  }
}

/** WhatsApp del contacto (si se configuró en el panel). */
function applyWhatsapp(plan, root) {
  const block = (root || document).querySelector('[data-hs-whatsapp]');
  if (!block) return false;
  if (!plan.contact.whatsappUrl) {
    block.style.display = 'none';
    return false;
  }
  block.style.display = '';
  block.querySelectorAll('a').forEach((a) => a.setAttribute('href', plan.contact.whatsappUrl));
  return true;
}

// ---------- secciones AGREGADAS (copias) ----------

/**
 * Pinta las secciones AGREGADAS: cada una es una COPIA de su sección de
 * fábrica, con su propio nombre (`gallery-2`) y su contenido encima.
 *
 * Se copia el bloque tal como quedó (ya con los textos, las fotos y los
 * fondos de la sección original aplicados), así la copia nace viéndose igual;
 * después se le pone lo que se haya escrito para ella y se vuelven a pintar
 * las partes que salen de datos (números, galería, testimonios, WhatsApp).
 *
 * Es IDEMPOTENTE: primero se quita lo agregado antes, así aplicar el documento
 * otra vez (o guardar sin cambios) no duplica la página.
 */
function applyExtraSections(plan) {
  if (typeof document === 'undefined') return 0;
  document.querySelectorAll('[data-hs-extra]').forEach((el) => el.remove());
  let n = 0;
  for (const ex of plan.extras || []) {
    const src = document.querySelector(`[data-hs-section="${ex.key}"]`);
    // Sin la sección de la que copiar (una plantilla que ya no existe) no hay
    // nada que hacer: la página se queda como está.
    if (!src || !src.parentNode) continue;
    const copy = src.cloneNode(true);
    copy.setAttribute('data-hs-section', ex.id);
    copy.setAttribute('data-hs-extra', ex.id);
    // Sin `id` repetidos: los enlaces internos (`#gallery`) siguen apuntando a
    // la sección original y no a la copia.
    copy.removeAttribute('id');
    copy.querySelectorAll('[id]').forEach((el) => el.removeAttribute('id'));
    hsApplyInstanceContent(copy, ex);
    src.parentNode.insertBefore(copy, src.nextSibling);
    n++;
  }
  return n;
}

/**
 * El contenido de UNA copia: sus textos, sus imágenes y sus opciones.
 * Lo que no traiga se queda como estaba (lo heredó de la sección original).
 */
function hsApplyInstanceContent(root, ex) {
  for (const [key, value] of Object.entries(ex.texts)) {
    const el = root.querySelector(`[data-hs="${key}"]`);
    if (el && value != null) setHsText(el, String(value));
  }
  for (const [key, value] of Object.entries(ex.images)) {
    const el = root.querySelector(`[data-hs-img="${key}"]`);
    if (!el || !value) continue;
    const url = String(value).trim();
    // Un valor con comillas o paréntesis rompería el CSS: se ignora.
    if (/[")]/.test(url)) continue;
    if (el.tagName === 'IMG') hsLoadProgressiveImage(el, url);
    else hsLoadProgressiveBackground(el, url);
  }
  // Lo que sale de DATOS se vuelve a pintar dentro de la copia con SUS
  // opciones (si la copia no trae ninguna, esto repite lo de la original).
  const sub = extraSectionPlan(ex);
  applyStats(sub, root);
  applyGalleryContent(sub, root);
  applyTestimonials(sub, root);
  applyWhatsapp(sub, root);
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
      // El contenido lo guarda el panel y tiene que verse AL RECARGAR: sin
      // esperar a que caduque la copia guardada.
      //   * `cache:'no-store'` → el navegador no reusa la respuesta que guardó.
      //   * `?t=<ms>` → cada carga es una URL distinta para el caché del borde
      //     (el CDN del backend), que si no puede servir por minutos lo de
      //     antes de guardar y parece que el panel no hubiera guardado nada.
      const res = await fetch(`${base}/api/site?t=${Date.now()}`, {
        headers: { Accept: 'application/json' },
        cache: 'no-store',
      });
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
    // no esperan a la API), los textos del diseño, el tope de servicios y la
    // FOTO se corrigen en el momento (la foto la sabe poner `renderers.js`, que
    // puede no estar cargado en otras páginas).
    refreshDesignTexts(document);
    trimServiceLists(document);
    if (typeof refreshPackagePhotos === 'function') refreshPackagePhotos(document);
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
  cardAnim: hsCardAnim,
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
  galleryImg: hsGalleryImgHtml,
  thumbnail: hsThumbUrl,
  isDriveImage: hsIsDriveImage,
  loadImage: hsLoadProgressiveImage,
  loadBackground: hsLoadProgressiveBackground,
  scanImages: hsScanProgressiveImages,
  extraSections: hsExtraSections,
  extraPlan: extraSectionPlan,
  applyExtras: applyExtraSections,
  galleryFiltersHtml,
  testimonialsHtml,
  groupPackages,
  contactHref,
  categoryKey: hsCategoryKey,
};
