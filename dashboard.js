// ==================================================================
// HARD STREET — Dashboard JavaScript
// ==================================================================

// ========== DASHBOARD-SPECIFIC ICONS ==========
const icons = {
  // UI Icons
  home: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`,
  box: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>`,
  grid: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>`,
  download: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>`,
  logout: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>`,
  menu: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>`,
  check: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>`,
  clock: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
  checkCircle: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`,
  star: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
};

// ========== PHOTO MODEL ==========
class Photo {
  constructor(id, url, titulo, estado, categoria = 'general', fechaEntrega = null) {
    this.id = id;
    this.url = url;
    this.titulo = titulo;
    this.estado = estado; // 'Lista', 'En edición', 'Pendiente'
    this.categoria = categoria;
    this.fechaEntrega = fechaEntrega;
  }

  isReady() { return this.estado === 'Lista'; }
  toObject() {
    return { id: this.id, url: this.url, titulo: this.titulo, estado: this.estado, categoria: this.categoria, fechaEntrega: this.fechaEntrega };
  }
}

// ========== USER STATE ==========
let currentUser = null;
let selectedPhotos = new Set();
let currentFilter = 'all';
let previewPhoto = null;

// ========== INITIALIZATION ==========
document.addEventListener('DOMContentLoaded', () => {
  const savedUser = localStorage.getItem('hardstreet_user');
  
  if (savedUser) {
    currentUser = JSON.parse(savedUser);
  } else {
    // Demo user
    currentUser = {
      id: 1,
      nombre: 'Cliente Demo',
      email: 'cliente@demo.com',
      paquete: PackagesDB[0],
      estado: 'En proceso',
      progreso: 65,
      fotos: [
        new Photo(1, 'images/IMG_3146-Mejorado-NR_DxO_0004_Grupo 1 copia 4.jpg', 'Novios - Camino', 'Lista', 'previa', '25 Ago 2026'),
        new Photo(2, 'images/IMG_5873-Mejorado-NR.jpg', 'Novios - Estudio', 'Lista', 'previa', '25 Ago 2026'),
        new Photo(3, 'images/IMG_9686-Enhanced-NR.jpg', 'Pareja - Jardín', 'Lista', 'previa', '25 Ago 2026'),
        new Photo(4, 'images/boungle.jpg', 'Retrato Artístico', 'Lista', 'previa', '25 Ago 2026'),
        new Photo(5, 'images/IMG_3146-Mejorado-NR_DxO_0004_Grupo 1 copia 4.jpg', 'Ceremonia - Novios', 'Lista', 'fiesta', '28 Ago 2026'),
        new Photo(6, 'images/IMG_5873-Mejorado-NR.jpg', 'Primer Baile', 'Lista', 'fiesta', '28 Ago 2026'),
        new Photo(7, 'images/IMG_9686-Enhanced-NR.jpg', 'Familia - Mesa Principal', 'Lista', 'fiesta', '26 Ago 2026'),
        new Photo(8, 'images/boungle.jpg', 'Decoración del Salón', 'Lista', 'fiesta', '26 Ago 2026'),
        new Photo(9, 'images/IMG_3146-Mejorado-NR_DxO_0004_Grupo 1 copia 4.jpg', 'Brindis', 'Lista', 'fiesta', '26 Ago 2026'),
        new Photo(10, 'images/IMG_5873-Mejorado-NR.jpg', 'Grupo Familiar', 'Lista', 'fiesta', '28 Ago 2026'),
      ],
      actividad: [
        { tipo: 'photo', texto: 'Se agregaron 5 fotos nuevas a tu galería', tiempo: 'Hace 2 horas' },
        { tipo: 'progress', texto: 'Tu paquete está al 65% de progreso', tiempo: 'Hace 1 día' },
        { tipo: 'package', texto: 'Paquete confirmado: Sesión de Boda Premium', tiempo: 'Hace 3 días' },
      ]
    };
    localStorage.setItem('hardstreet_user', JSON.stringify(currentUser));
  }
  
  init();
});

// ========== INIT ==========
function init() {
  updateUserInfo();
  renderOverview();
  renderPackageDetail();
  renderPhotos();
  setupTabs();
  setupFilters();
}

// ========== UPDATE USER INFO ==========
function updateUserInfo() {
  const initials = currentUser.nombre.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  
  document.getElementById('userName').textContent = currentUser.nombre;
  document.getElementById('userEmail').textContent = currentUser.email;
  document.getElementById('userAvatar').textContent = initials;
  document.getElementById('mobileUser').textContent = initials;
  // Set welcome name
  const ovName = document.getElementById('ovUserName');
  if (ovName) ovName.textContent = currentUser.nombre.split(' ')[0];
}

// ========== RENDER OVERVIEW ==========
function renderOverview() {
  const pkg = currentUser.paquete;
  const totalPhotos = currentUser.fotos.length;
  const readyPhotos = currentUser.fotos.filter(f => f.estado === 'Lista').length;
  const catIcon = CategoryIcons[pkg.categoria] || CategoryIcons.general;
  const tierLabel = TierLabels[pkg.tier] || pkg.tier;
  const completedCount = deliveryData.completedServices.length;
  const totalServices = pkg.servicios.length;

  // Overview stats
  document.getElementById('statPackage').textContent = pkg.nombre.split(' - ')[0] || pkg.nombre;
  document.getElementById('statPhotos').textContent = totalPhotos;
  document.getElementById('statReady').textContent = readyPhotos;
  document.getElementById('statProgress').textContent = `${currentUser.progreso}%`;

  // Render active package card in overview
  const overviewPkg = document.getElementById('overviewPackage');
  if (overviewPkg) {
    overviewPkg.innerHTML = `
      <div class="ov-pkg-hero tier-${pkg.tier}">
        <div class="ov-pkg-glow"></div>
        <div class="ov-pkg-content">
          <div class="ov-pkg-left">
            <div class="ov-pkg-badge">${tierLabel}</div>
            <div class="ov-pkg-cat">
              <span class="ov-pkg-cat-icon">${catIcon}</span>
              <span>${CategoryNames[pkg.categoria] || pkg.categoria}</span>
            </div>
            <h3 class="ov-pkg-name">${pkg.nombre}</h3>
            <p class="ov-pkg-price">${pkg.precio} <span>MXN</span></p>
          </div>
          <div class="ov-pkg-right">
            <div class="ov-pkg-mini-stats">
              <div class="ov-mini-stat">
                <span class="ov-mini-value">${completedCount}/${totalServices}</span>
                <span class="ov-mini-label">Servicios</span>
              </div>
              <div class="ov-mini-stat">
                <span class="ov-mini-value">${readyPhotos}</span>
                <span class="ov-mini-label">Fotos</span>
              </div>
            </div>
            <button class="ov-pkg-cta" onclick="document.querySelector('.sidebar-item[data-tab=package]').click()">
              Ver Detalles
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </button>
          </div>
        </div>
      </div>
    `;
  }

  renderActivity();
}

// ========== RENDER ACTIVITY ==========
function renderActivity() {
  const container = document.getElementById('activityList');
  const actividad = currentUser.actividad || [];
  
  const activityConfig = {
    photo: { icon: ServiceIcons.photos, class: 'blue' },
    progress: { icon: icons.clock, class: 'gold' },
    package: { icon: ServiceIcons.product, class: 'green' },
  };
  
  container.innerHTML = actividad.map(item => {
    const config = activityConfig[item.tipo] || activityConfig.package;
    return `
      <div class="activity-item">
        <div class="activity-icon ${config.class}">${config.icon}</div>
        <div class="activity-content">
          <div class="activity-text">${item.texto}</div>
          <div class="activity-time">${item.tiempo}</div>
        </div>
      </div>
    `;
  }).join('');
}

// ========== DELIVERY DATA (Demo) ==========
const deliveryData = {
  completedServices: [0, 1, 2, 3],
  activeService: 4,
  serviceDetails: [
    { fechaEntrega: '28 Ago 2026', notas: 'Video entregado en formato MP4, 4K. Incluye versión cinematográfica y highlights.' },
    { fechaEntrega: '26 Ago 2026', notas: 'Highlights de 3 min + cobertura completa del evento (5h). Color grading profesional.' },
    { fechaEntrega: '25 Ago 2026', notas: '45 tomas aéreas seleccionadas. Archivos RAW y JPEG de alta resolución.' },
    { fechaEntrega: '15 Ago 2026', notas: 'Sesión en jardín-botánico. 120 fotos editadas, 20 selección premium.' },
    { notas: 'En revisión — falta entregar 120 fotos restantes del evento.', progreso: 70 },
    { notas: 'Programada para semana de entrega final.' },
    { notas: 'En cola de impresión. Fecha estimada: 15 Sep 2026.' },
    { notas: 'Pendiente de diseño. Se confirmará arte final con el cliente.' },
  ]
};

// ========== RENDER PACKAGE DETAIL ==========
function renderPackageDetail() {
  const container = document.getElementById('packageDetail');
  const pkg = currentUser.paquete;
  const completedCount = deliveryData.completedServices.length;
  const totalServices = pkg.servicios.length;
  const progressPercent = Math.round((completedCount / totalServices) * 100);
  const pastPackages = getRandomPastPackages(pkg.id, 3);
  const catIcon = CategoryIcons[pkg.categoria] || CategoryIcons.general;
  const tierLabel = TierLabels[pkg.tier] || pkg.tier;
  const catName = CategoryNames[pkg.categoria] || pkg.categoria;

  container.innerHTML = `
    <!-- Package Hero -->
    <div class="pkg-hero tier-${pkg.tier}">
      <div class="pkg-hero-bg"></div>
      <div class="pkg-hero-content">
        <span class="pkg-tier-badge">${tierLabel}</span>
        <div class="pkg-hero-category">
          <span class="pkg-category-icon">${catIcon}</span>
          <span>${catName}</span>
        </div>
        <h2 class="pkg-hero-name">${pkg.nombre}</h2>
        <p class="pkg-hero-subtitle">${pkg.subtitulo}</p>
        <div class="pkg-hero-bottom">
          <div class="pkg-hero-price">
            <span class="pkg-hero-price-label">Inversión</span>
            <span class="pkg-hero-price-value">${pkg.precio}</span>
            <span class="pkg-hero-price-note">MXN</span>
          </div>
          <div class="pkg-hero-progress-pill">
            <span>${progressPercent}% completado</span>
            <div class="pkg-hero-mini-bar"><div class="pkg-hero-mini-fill" style="width:${progressPercent}%"></div></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Service Delivery Timeline -->
    <div class="pkg-section">
      <div class="pkg-section-header">
        <div class="pkg-section-title">
          ${icons.checkCircle}
          <h3>Estado de Entrega</h3>
        </div>
        <div class="pkg-section-stats">
          <span class="stat-pill done">${completedCount} Entregados</span>
          <span class="stat-pill active">${totalServices - completedCount} Pendientes</span>
        </div>
      </div>
      <div class="delivery-timeline">
        ${pkg.servicios.map((service, index) => {
          const isDone = deliveryData.completedServices.includes(index);
          const isActive = index === deliveryData.activeService;
          const detail = deliveryData.serviceDetails[index] || {};
          const statusClass = isDone ? 'done' : isActive ? 'active' : 'pending';
          const statusLabel = isDone ? 'Entregado' : isActive ? 'En Proceso' : 'Pendiente';
          
          return `
            <div class="timeline-item ${statusClass}" style="animation-delay: ${index * 0.08}s">
              <div class="timeline-connector">
                <div class="timeline-dot">
                  ${isDone ? icons.check : isActive ? icons.clock : '<span class="dot-inner"></span>'}
                </div>
                ${index < totalServices - 1 ? '<div class="timeline-line"></div>' : ''}
              </div>
              <div class="timeline-card">
                <div class="timeline-card-header">
                  <div class="timeline-service-icon">${service.icon}</div>
                  <div class="timeline-service-info">
                    <h4>${service.nombre}</h4>
                    <p>${service.descripcion}</p>
                  </div>
                  <span class="timeline-status-badge ${statusClass}">${statusLabel}</span>
                </div>
                ${detail.fechaEntrega ? `<div class="timeline-delivery-info">
                  <div class="delivery-date">
                    ${icons.clock}
                    <span>Entregado: ${detail.fechaEntrega}</span>
                  </div>
                  ${detail.notas ? `<p class="delivery-notes">${detail.notas}</p>` : ''}
                </div>` : ''}
                ${detail.notas && !detail.fechaEntrega ? `<div class="timeline-delivery-info">
                  <p class="delivery-notes">${detail.notas}</p>
                  ${detail.progreso ? `<div class="mini-progress"><div class="mini-progress-fill" style="width:${detail.progreso}%"></div></div>` : ''}
                </div>` : ''}
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>

    <!-- Past Packages -->
    <div class="pkg-section">
      <div class="pkg-section-header">
        <div class="pkg-section-title">
          ${icons.box}
          <h3>Otros Paquetes Disponibles</h3>
        </div>
      </div>
      <div class="past-packages-grid">
        ${pastPackages.map(p => {
          const pCatIcon = CategoryIcons[p.categoria] || CategoryIcons.general;
          const pTierLabel = TierLabels[p.tier] || p.tier;
          const pCatName = CategoryNames[p.categoria] || p.categoria;
          return `
            <div class="past-pkg-card tier-${p.tier}">
              <div class="past-pkg-badge">${pTierLabel}</div>
              <div class="past-pkg-top">
                <div class="past-pkg-category">
                  <span class="past-pkg-cat-icon">${pCatIcon}</span>
                  <span>${pCatName}</span>
                </div>
                <h4 class="past-pkg-name">${p.nombre}</h4>
                <p class="past-pkg-subtitle">${p.subtitulo}</p>
              </div>
              <div class="past-pkg-divider"></div>
              <div class="past-pkg-services">
                <span class="past-pkg-count">${p.servicios.length} servicios incluidos</span>
                <ul>
                  ${p.servicios.slice(0, 4).map(s => `<li><span class="past-pkg-svc-icon">${s.icon}</span>${s.nombre}</li>`).join('')}
                  ${p.servicios.length > 4 ? `<li class="more">+${p.servicios.length - 4} servicios más</li>` : ''}
                </ul>
              </div>
              <div class="past-pkg-footer">
                <div class="past-pkg-price">
                  <span>Desde</span>
                  <strong>${p.precio}</strong>
                </div>
                <a href="#contact" class="past-pkg-cta">
                  Cotizar
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </a>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;
}

// ========== RENDER PHOTOS ==========
function renderPhotos() {
  const container = document.getElementById('photosGrid');
  const emptyState = document.getElementById('emptyState');
  const countLabel = document.getElementById('photoCount');
  const readyLabel = document.getElementById('photoReadyCount');
  const fotos = getFilteredPhotos();
  const allFotos = currentUser.fotos || [];
  const readyFotos = allFotos.filter(f => f.estado === 'Lista');
  
  if (countLabel) countLabel.textContent = allFotos.length;
  if (readyLabel) readyLabel.textContent = readyFotos.length;
  
  if (fotos.length === 0) {
    container.style.display = 'none';
    emptyState.style.display = 'block';
    return;
  }
  
  container.style.display = 'grid';
  emptyState.style.display = 'none';
  
  container.innerHTML = fotos.map((foto, idx) => {
    return `
      <div class="photo-card ${selectedPhotos.has(foto.id) ? 'selected' : ''}" 
           data-id="${foto.id}" data-idx="${idx}"
           style="animation-delay: ${idx * 0.05}s">
        <img src="${foto.url}" alt="${foto.titulo}" loading="lazy" />
        <div class="photo-overlay">
          <div class="photo-overlay-top">
            <span class="photo-session-badge ${foto.categoria}">${foto.categoria === 'previa' ? 'Sesión Previa' : 'Fiesta'}</span>
          </div>
          <div class="photo-overlay-bottom">
            <span class="photo-title">${foto.titulo}</span>
            ${foto.fechaEntrega ? `<span class="photo-date">${foto.fechaEntrega}</span>` : ''}
          </div>
        </div>
        <div class="photo-check">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
        </div>
        <button class="photo-preview-btn" onclick="event.stopPropagation(); openPhotoPreview(${foto.id})">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>
        </button>
      </div>
    `;
  }).join('');
  
  container.querySelectorAll('.photo-card').forEach(card => {
    card.addEventListener('click', () => {
      const id = parseInt(card.dataset.id);
      togglePhoto(id);
    });
  });
  
  updateSelectionCount();
}

// ========== PHOTO PREVIEW ==========
function openPhotoPreview(photoId) {
  const allFotos = currentUser.fotos || [];
  const foto = allFotos.find(f => f.id === photoId);
  if (!foto) return;
  
  const idx = allFotos.indexOf(foto);
  previewPhoto = { foto, idx, all: allFotos };
  
  const modal = document.getElementById('photoPreviewModal');
  renderPreviewContent();
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function renderPreviewContent() {
  if (!previewPhoto) return;
  const { foto, idx, all } = previewPhoto;
  const content = document.getElementById('previewContent');
  const sessionLabel = foto.categoria === 'previa' ? 'Sesión Previa' : 'Fiesta';
  const sessionClass = foto.categoria;
  
  content.innerHTML = `
    <div class="preview-image-wrap">
      <img src="${foto.url}" alt="${foto.titulo}" />
    </div>
    <div class="preview-info">
      <span class="preview-session-badge ${sessionClass}">${sessionLabel}</span>
      <h3>${foto.titulo}</h3>
      ${foto.fechaEntrega ? `<p class="preview-date">${foto.fechaEntrega}</p>` : ''}
      <p class="preview-counter">${idx + 1} / ${all.length}</p>
      <div class="preview-nav">
        <button onclick="previewNavigate(-1)" ${idx === 0 ? 'disabled' : ''}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 18l-6-6 6-6"/></svg>
          Anterior
        </button>
        <button onclick="previewNavigate(1)" ${idx === all.length - 1 ? 'disabled' : ''}>
          Siguiente
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>
        </button>
      </div>
    </div>
  `;
}

function previewNavigate(dir) {
  if (!previewPhoto) return;
  const newIdx = previewPhoto.idx + dir;
  if (newIdx < 0 || newIdx >= previewPhoto.all.length) return;
  previewPhoto.idx = newIdx;
  previewPhoto.foto = previewPhoto.all[newIdx];
  renderPreviewContent();
}

function closePhotoPreview() {
  const modal = document.getElementById('photoPreviewModal');
  modal.classList.remove('active');
  document.body.style.overflow = '';
  previewPhoto = null;
}

// ========== GET FILTERED PHOTOS ==========
function getFilteredPhotos() {
  const fotos = currentUser.fotos || [];
  
  if (currentFilter === 'all') return fotos;
  if (currentFilter === 'previa') return fotos.filter(f => f.categoria === 'previa');
  if (currentFilter === 'fiesta') return fotos.filter(f => f.categoria === 'fiesta');
  
  return fotos;
}

// ========== TOGGLE PHOTO ==========
function togglePhoto(id) {
  if (selectedPhotos.has(id)) {
    selectedPhotos.delete(id);
  } else {
    selectedPhotos.add(id);
  }
  
  const card = document.querySelector(`.photo-card[data-id="${id}"]`);
  if (card) {
    card.classList.toggle('selected', selectedPhotos.has(id));
  }
  
  updateSelectionCount();
}

// ========== UPDATE SELECTION COUNT ==========
function updateSelectionCount() {
  const count = selectedPhotos.size;
  document.getElementById('selectionCount').textContent = `${count} seleccionada${count !== 1 ? 's' : ''}`;
  
  const downloadBtn = document.getElementById('downloadBtn');
  downloadBtn.disabled = count === 0;
}

// ========== SETUP TABS ==========
function setupTabs() {
  const tabs = document.querySelectorAll('.sidebar-item[data-tab]');
  
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      
      const tabName = tab.dataset.tab;
      document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
      });
      document.getElementById(`${tabName}Tab`).classList.add('active');
      
      closeSidebar();
    });
  });
}

// ========== SETUP FILTERS ==========
function setupFilters() {
  const filters = document.querySelectorAll('.filter-btn');
  
  filters.forEach(filter => {
    filter.addEventListener('click', () => {
      filters.forEach(f => f.classList.remove('active'));
      filter.classList.add('active');
      
      currentFilter = filter.dataset.filter;
      renderPhotos();
    });
  });
}

// ========== SIDEBAR TOGGLE ==========
function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebarOverlay');
  
  sidebar.classList.toggle('open');
  overlay.classList.toggle('active');
  document.body.style.overflow = sidebar.classList.contains('open') ? 'hidden' : '';
}

function closeSidebar() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebarOverlay');
  
  sidebar.classList.remove('open');
  overlay.classList.remove('active');
  document.body.style.overflow = '';
}

// ========== DOWNLOAD ==========
document.getElementById('downloadBtn').addEventListener('click', () => {
  if (selectedPhotos.size === 0) return;
  
  const count = selectedPhotos.size;
  alert(`Descargando ${count} foto(s)...\n\nEn producción, esto descargaría un ZIP con las fotos seleccionadas.`);
  
  selectedPhotos.clear();
  document.querySelectorAll('.photo-card.selected').forEach(card => {
    card.classList.remove('selected');
  });
  updateSelectionCount();
});

// ========== LOGOUT ==========
function handleLogout() {
  localStorage.removeItem('hardstreet_user');
  window.location.href = 'index.html';
}
