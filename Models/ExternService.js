// ==================================================================
// HARD STREET — ExternService Model
// External services for carousel display
// ==================================================================

// ========== EXTERN SERVICE CLASS ==========
class ExternService {
  constructor(id, title, subtitle, description, icon, image, features, price) {
    this.id = id;
    this.title = title;
    this.subtitle = subtitle;
    this.description = description;
    this.icon = icon;
    this.image = image;
    this.features = features;
    this.price = price;
  }

  toObject() {
    return {
      id: this.id,
      title: this.title,
      subtitle: this.subtitle,
      description: this.description,
      icon: this.icon,
      image: this.image,
      features: this.features,
      price: this.price
    };
  }
}

// ========== EXTERN SERVICES DATABASE ==========
const ExternServicesDB = [
  new ExternService(
    1,
    'Fotografía de Eventos',
    'Capturando momentos inolvidables',
    'Cobertura completa de bodas, quinceañeros, bautizos y graduaciones. Nuestro equipo captura la esencia de cada momento con un estilo único y artístico.',
    ServiceIcons.camera,
    'IMG_3146-Mejorado-NR_DxO_0004_Grupo 1 copia 4.jpg',
    ['Cobertura fotográfica profesional', 'Edición artística premium', 'Galería digital de alta resolución', 'Álbum impreso incluido'],
    'Desde $2,500'
  ),
  new ExternService(
    2,
    'Vídeo Cinematográfico',
    'Historias que cobran vida',
    'Videos profesionales con narrativa cinematográfica, highlights y cobertura total. Incluye servicio aéreo con dron para tomas espectaculares.',
    ServiceIcons.video,
    'IMG_9686-Enhanced-NR.jpg',
    ['Video cinematográfico con voz en off', 'Highlights del evento', 'Servicio aéreo con dron', 'Color grading profesional'],
    'Desde $5,000'
  ),
  new ExternService(
    3,
    'Medios Visuales',
    'Contenido que impacta',
    'Creamos contenido visual profesional para tu negocio: flyers, publicidad, fotografía de producto y contenido para redes sociales que destaca.',
    ServiceIcons.flyer,
    'Hard Street.png',
    ['Diseño de flyers y materiales', 'Fotografía de producto', 'Contenido para redes sociales', 'Branding visual'],
    'Desde $1,500'
  ),
  new ExternService(
    4,
    'Publicidad Digital',
    'Haz crecer tu negocio',
    'Estrategias de publicidad visual que aumentan la visibilidad de tu marca. Desde campañas en redes sociales hasta material publicitario impreso.',
    ServiceIcons.personal,
    'IMG_5873-Mejorado-NR.jpg',
    ['Campañas publicitarias', 'Contenido para redes', 'Material impreso', 'Estrategia de marca'],
    'Desde $2,000'
  ),
  new ExternService(
    5,
    'Invitaciones Digitales',
    'Diseño exclusivo y moderno',
    'Invitaciones digitales personalizadas con animaciones, música y diseño exclusivo. Perfectas para bodas, XV años y eventos especiales.',
    ServiceIcons.star,
    'boungle.jpg',
    ['Diseño personalizado', 'Animaciones y efectos', 'Música de fondo', 'RSVP integrado'],
    'Desde $800'
  ),
  new ExternService(
    6,
    'Podcast',
    'Tu voz, nuestro estilo',
    'Producción completa de podcast con grabación profesional, edición de audio y video, diseño de portadas y distribución en plataformas.',
    ServiceIcons.videoHighlights,
    'IMG_9686-Enhanced-NR.jpg',
    ['Grabación profesional', 'Edición de audio y video', 'Diseño de portada', 'Distribución en plataformas'],
    'Desde $3,000'
  )
];
