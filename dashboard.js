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

// ========== USER STATE ==========
let currentUser = null;
let selectedPhotos = new Set();
let currentFilter = 'all';

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
        { id: 1, url: 'IMG_3146-Mejorado-NR_DxO_0004_Grupo 1 copia 4.jpg', titulo: 'Foto 1', estado: 'Lista' },
        { id: 2, url: 'IMG_5873-Mejorado-NR.jpg', titulo: 'Foto 2', estado: 'En edición' },
        { id: 3, url: 'IMG_9686-Enhanced-NR.jpg', titulo: 'Foto 3', estado: 'Lista' },
        { id: 4, url: 'Hard Street.png', titulo: 'Foto 4', estado: 'Lista' },
        { id: 5, url: 'boungle.jpg', titulo: 'Foto 5', estado: 'En edición' },
      ],
      actividad: [
        { tipo: 'photo', texto: 'Se agregaron 5 fotos a tu galería', tiempo: 'Hace 2 horas' },
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
}

// ========== RENDER OVERVIEW ==========
function renderOverview() {
  const pkg = currentUser.paquete;
  const totalPhotos = currentUser.fotos.length;
  const readyPhotos = currentUser.fotos.filter(f => f.estado === 'Lista').length;
  
  document.getElementById('statPackage').textContent = pkg.nombre.split(' - ')[0] || pkg.nombre;
  document.getElementById('statPhotos').textContent = totalPhotos;
  document.getElementById('statReady').textContent = readyPhotos;
  document.getElementById('statProgress').textContent = `${currentUser.progreso}%`;
  
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

// ========== RENDER PACKAGE DETAIL ==========
function renderPackageDetail() {
  const container = document.getElementById('packageDetail');
  const pkg = currentUser.paquete;
  const completedCount = Math.floor(pkg.servicios.length * (currentUser.progreso / 100));
  const pastPackages = getRandomPastPackages(pkg.id, 3);
  
  container.innerHTML = `
    <!-- Current Package Card -->
    <div class="dash-package-current">
      <div class="dash-package-header">
        <h3>Mi Paquete Actual</h3>
        <span class="dash-package-status ${currentUser.estado === 'Completado' ? 'complete' : 'processing'}">${currentUser.estado}</span>
      </div>
      ${renderPackageCardDashboard(pkg, false)}
      
      <!-- Progress Section -->
      <div class="dash-progress-section">
        <div class="dash-progress-header">
          <span class="dash-progress-label">Progreso del Servicio</span>
          <span class="dash-progress-value">${currentUser.progreso}%</span>
        </div>
        <div class="dash-progress-bar">
          <div class="dash-progress-fill" style="width: ${currentUser.progreso}%"></div>
        </div>
      </div>
      
      <!-- Services Checklist -->
      <div class="dash-services-section">
        <h4>Servicios Incluidos</h4>
        <div class="dash-services-list">
          ${pkg.servicios.map((service, index) => {
            const isDone = index < completedCount;
            const statusText = isDone ? 'Completado' : 'Pendiente';
            return `
              <div class="dash-service-item">
                <div class="dash-service-check ${isDone ? 'done' : ''}">
                  ${icons.check}
                </div>
                <div class="dash-service-info">
                  <div class="dash-service-name">${service.nombre}</div>
                  <div class="dash-service-desc">${service.descripcion}</div>
                </div>
                <span class="dash-service-status ${isDone ? 'done' : 'pending'}">${statusText}</span>
                <span class="dash-service-icon">${service.icon}</span>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    </div>
    
    <!-- Past Packages Section -->
    <div class="dash-past-packages">
      <h3>Paquetes Anteriores</h3>
      <p class="dash-past-subtitle">Otros paquetes que podrían interesarte</p>
      <div class="dash-past-grid">
        ${pastPackages.map(pkg => renderPackageCardDashboard(pkg, false)).join('')}
      </div>
    </div>
  `;
}

// ========== RENDER PHOTOS ==========
function renderPhotos() {
  const container = document.getElementById('photosGrid');
  const emptyState = document.getElementById('emptyState');
  const fotos = getFilteredPhotos();
  
  if (fotos.length === 0) {
    container.style.display = 'none';
    emptyState.style.display = 'block';
    return;
  }
  
  container.style.display = 'grid';
  emptyState.style.display = 'none';
  
  container.innerHTML = fotos.map(foto => `
    <div class="photo-card ${selectedPhotos.has(foto.id) ? 'selected' : ''}" 
         data-id="${foto.id}" 
         data-status="${foto.estado.toLowerCase() === 'lista' ? 'lista' : 'edicion'}">
      <img src="${foto.url}" alt="${foto.titulo}" loading="lazy" />
      <div class="photo-overlay">
        <span class="photo-title">${foto.titulo}</span>
        <span class="photo-status ${foto.estado.toLowerCase() === 'lista' ? 'lista' : 'edicion'}">${foto.estado}</span>
      </div>
      <div class="photo-check">
        ${icons.check}
      </div>
    </div>
  `).join('');
  
  container.querySelectorAll('.photo-card').forEach(card => {
    card.addEventListener('click', () => {
      const id = parseInt(card.dataset.id);
      togglePhoto(id);
    });
  });
  
  updateSelectionCount();
}

// ========== GET FILTERED PHOTOS ==========
function getFilteredPhotos() {
  const fotos = currentUser.fotos || [];
  
  if (currentFilter === 'all') return fotos;
  if (currentFilter === 'lista') return fotos.filter(f => f.estado === 'Lista');
  if (currentFilter === 'edicion') return fotos.filter(f => f.estado !== 'Lista');
  
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
