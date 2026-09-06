// ==================================================================
// HARD STREET — Service Model
// Database-ready service class with icons
// ==================================================================

// ========== SVG ICONS FOR SERVICES ==========
const ServiceIcons = {
  video: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>`,
  videoHighlights: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/><line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/></svg>`,
  drone: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>`,
  ring: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/></svg>`,
  camera: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>`,
  photos: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>`,
  frame: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>`,
  church: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M18 22V8l-6-6-6 6v14"/><path d="M9 22v-6h6v6"/><path d="M12 2v4"/></svg>`,
  star: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
  print: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>`,
  studio: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`,
  event: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,
  product: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>`,
  flyer: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>`,
  personal: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
};

// ========== SERVICE CLASS ==========
class Service {
  constructor(id, nombre, icon, descripcion = '') {
    this.id = id;
    this.nombre = nombre;
    this.icon = icon;
    this.descripcion = descripcion;
  }

  toObject() {
    return {
      id: this.id,
      nombre: this.nombre,
      icon: this.icon,
      descripcion: this.descripcion
    };
  }
}

// ========== SERVICES DATABASE ==========
const ServicesDB = [
  new Service(1, 'Video cinematográfico de los novios (voz en off)', ServiceIcons.video, 'Video artístico con narrativa personalizada'),
  new Service(2, 'Video highlights y cobertura total del evento', ServiceIcons.videoHighlights, 'Resumen cinematográfico del evento completo'),
  new Service(3, 'Servicio aéreo (uso de dron para fotos y vídeos)', ServiceIcons.drone, 'Tomas aéreas con dron profesional'),
  new Service(4, 'Sesión previa a la boda (3 horas)', ServiceIcons.ring, 'Sesión pre-boda en locación elegida'),
  new Service(5, 'Cobertura en evento (7 horas)', ServiceIcons.camera, 'Cobertura fotográfica completa del evento'),
  new Service(6, '400 fotos digitales (mínimo)', ServiceIcons.photos, 'Galería digital de alta resolución'),
  new Service(7, '50 fotos impresas de 5x7"', ServiceIcons.print, 'Álbum impreso de alta calidad'),
  new Service(8, '1 cuadro grande de 30x25"', ServiceIcons.frame, 'Cuadro ampliado para exhibir'),
  new Service(9, 'Cobertura en misa', ServiceIcons.church, 'Cobertura fotográfica durante la ceremonia religiosa'),
  new Service(10, 'Sesión previa (1hr 15min)', ServiceIcons.star, 'Sesión pre-evento corta'),
  new Service(11, 'Cobertura en evento (5 horas)', ServiceIcons.camera, 'Cobertura fotográfica del evento'),
  new Service(12, 'Video Highlights del evento', ServiceIcons.videoHighlights, 'Resumen del evento en video'),
  new Service(13, '250 fotos digitales (mínimo)', ServiceIcons.photos, 'Galería digital del evento'),
  new Service(14, 'Foto de estudio (opcional)', ServiceIcons.studio, 'Sesión en estudio fotográfico'),
  new Service(15, '50 fotos impresas de 5x7"', ServiceIcons.print, 'Álbum impreso'),
  new Service(16, 'Cuadro de 20x24"', ServiceIcons.frame, 'Cuadro ampliado'),
  new Service(17, 'Vuelo de Dron', ServiceIcons.drone, 'Tomas aéreas con dron'),
  new Service(18, 'Sesión fotográfica', ServiceIcons.camera, 'Sesión personalizada'),
  new Service(19, 'Cobertura de evento', ServiceIcons.event, 'Cobertura completa de evento social'),
  new Service(20, 'Fotografía de producto', ServiceIcons.product, 'Fotografía profesional de productos'),
  new Service(21, 'Flyer / Material publicitario', ServiceIcons.flyer, 'Diseño de material promocional'),
  new Service(22, 'Sesión de marca personal', ServiceIcons.personal, 'Sesión enfocada en imagen personal'),
];
