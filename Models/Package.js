// ==================================================================
// HARD STREET — Package Model
// Database-ready package class with tier and category
// ================================================================= ==========

// ========== PACKAGE CLASS ==========
class Package {
  constructor(id, nombre, subtitulo, servicios, precio, precioNumero, moneda = 'MXN') {
    this.id = id;
    this.nombre = nombre;
    this.subtitulo = subtitulo;
    this.servicios = servicios;
    this.precio = precio;
    this.precioNumero = precioNumero;
    this.moneda = moneda;
    this.tier = 'basic';
    this.categoria = 'general';
  }

  toObject() {
    return {
      id: this.id,
      nombre: this.nombre,
      subtitulo: this.subtitulo,
      servicios: this.servicios.map(s => s.toObject()),
      precio: this.precio,
      precioNumero: this.precioNumero,
      moneda: this.moneda,
      tier: this.tier,
      categoria: this.categoria
    };
  }

  setTier(tier) {
    this.tier = tier;
    return this;
  }

  setCategoria(categoria) {
    this.categoria = categoria;
    return this;
  }
}

// ========== CATEGORY ICONS ==========
const CategoryIcons = {
  boda: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`,
  xv: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2z"/></svg>`,
  bautizo: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 2v6M12 22v-6M4.93 4.93l4.24 4.24M14.83 14.83l4.24 4.24M2 12h6M22 12h-6M4.93 19.07l4.24-4.24M14.83 9.17l4.24-4.24"/></svg>`,
  graduacion: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 6 3 6 3s3 0 6-3v-5"/></svg>`,
  comercial: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>`,
  general: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>`,
};

// ========== TIER & CATEGORY LABELS ==========
const TierLabels = {
  basic: 'Essentials',
  gold: 'Gold',
  premium: 'Premium',
};

const CategoryNames = {
  boda: 'Boda',
  xv: 'XV Años',
  bautizo: 'Bautizo',
  graduacion: 'Graduación',
  comercial: 'Comercial',
  general: 'General',
};

// ========== PACKAGES DATABASE ==========
const PackagesDB = [
  // ========== BODA ==========
  new Package(
    1,
    'Boda - Premium',
    'Hard Street Estudio de Fotografía y Vídeo',
    [ServicesDB[0], ServicesDB[1], ServicesDB[2], ServicesDB[3], ServicesDB[4], ServicesDB[5], ServicesDB[6], ServicesDB[7]],
    '$12,000',
    12000
  ).setTier('premium').setCategoria('boda'),

  new Package(
    2,
    'Boda - Gold',
    'Hard Street Estudio de Fotografía y Vídeo',
    [ServicesDB[1], ServicesDB[4], ServicesDB[5], ServicesDB[6]],
    '$8,500',
    8500
  ).setTier('gold').setCategoria('boda'),

  new Package(
    3,
    'Boda - Essentials',
    'Hard Street Estudio de Fotografía y Vídeo',
    [ServicesDB[4], ServicesDB[5], ServicesDB[9]],
    '$6,500',
    6500
  ).setTier('basic').setCategoria('boda'),

  // ========== XV AÑOS ==========
  new Package(
    4,
    'XV Años - Premium',
    'Hard Street Estudio de Fotografía y Vídeo',
    [ServicesDB[8], ServicesDB[9], ServicesDB[10], ServicesDB[11], ServicesDB[12], ServicesDB[16], ServicesDB[14], ServicesDB[15], ServicesDB[13]],
    '$9,950',
    9950
  ).setTier('premium').setCategoria('xv'),

  new Package(
    5,
    'XV Años - Gold',
    'Hard Street Estudio de Fotografía y Vídeo',
    [ServicesDB[9], ServicesDB[10], ServicesDB[11], ServicesDB[12], ServicesDB[14]],
    '$7,500',
    7500
  ).setTier('gold').setCategoria('xv'),

  new Package(
    6,
    'XV Años - Essentials',
    'Hard Street Estudio de Fotografía y Vídeo',
    [ServicesDB[10], ServicesDB[12], ServicesDB[14]],
    '$5,200',
    5200
  ).setTier('basic').setCategoria('xv'),

  // ========== BAUTIZO ==========
  new Package(
    7,
    'Bautizo - Gold',
    'Hard Street Estudio de Fotografía y Vídeo',
    [ServicesDB[8], ServicesDB[10], ServicesDB[11], ServicesDB[12], ServicesDB[16], ServicesDB[14], ServicesDB[15]],
    '$6,800',
    6800
  ).setTier('gold').setCategoria('bautizo'),

  new Package(
    8,
    'Bautizo - Essentials',
    'Hard Street Estudio de Fotografía y Vídeo',
    [ServicesDB[8], ServicesDB[10], ServicesDB[12], ServicesDB[14]],
    '$4,500',
    4500
  ).setTier('basic').setCategoria('bautizo'),

  // ========== GRADUACIÓN ==========
  new Package(
    9,
    'Graduación - Gold',
    'Hard Street Estudio de Fotografía y Vídeo',
    [ServicesDB[10], ServicesDB[11], ServicesDB[12], ServicesDB[16], ServicesDB[14], ServicesDB[15]],
    '$5,500',
    5500
  ).setTier('gold').setCategoria('graduacion'),

  new Package(
    10,
    'Graduación - Essentials',
    'Hard Street Estudio de Fotografía y Vídeo',
    [ServicesDB[10], ServicesDB[12], ServicesDB[14]],
    '$3,200',
    3200
  ).setTier('basic').setCategoria('graduacion'),

  // ========== COMERCIAL ==========
  new Package(
    11,
    'Sesión Fotográfica',
    'Sesión personalizada en estudio o exteriores',
    [ServicesDB[17], ServicesDB[5], ServicesDB[6]],
    '$2,500',
    2500
  ).setTier('basic').setCategoria('comercial'),

  new Package(
    12,
    'Fotografía Comercial',
    'Para negocios y marca personal',
    [ServicesDB[19], ServicesDB[20], ServicesDB[21]],
    '$3,500',
    3500
  ).setTier('gold').setCategoria('comercial'),

  new Package(
    13,
    'Marca Personal - Premium',
    'Sesión completa para profesionales',
    [ServicesDB[21], ServicesDB[20], ServicesDB[19], ServicesDB[5]],
    '$4,800',
    4800
  ).setTier('premium').setCategoria('comercial'),

  new Package(
    14,
    'Publicidad Digital',
    'Contenido para redes sociales y marketing',
    [ServicesDB[20], ServicesDB[19], ServicesDB[21]],
    '$2,800',
    2800
  ).setTier('basic').setCategoria('comercial'),
];
