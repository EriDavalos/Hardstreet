// ==================================================================
// HARD STREET — Main Data Index
// Imports all models and provides unified access
// ==================================================================

// Note: Service.js, ExternService.js, and Package.js must be loaded before this file
// They define: Service, ServiceIcons, ServicesDB, ExternService, ExternServicesDB,
//              Package, CategoryIcons, TierLabels, CategoryNames, PackagesDB

// ========== HELPER: Render Package to HTML ==========
function renderPackageCard(pkg) {
  const serviciosHTML = pkg.servicios.map(s => 
    `<li>
      <span class="pkg-icon-svg">${s.icon}</span>
      <span class="pkg-service-text">${s.nombre}</span>
    </li>`
  ).join('');

  const catIcon = CategoryIcons[pkg.categoria] || CategoryIcons.general;
  const tierLabel = TierLabels[pkg.tier] || pkg.tier;
  const catName = CategoryNames[pkg.categoria] || pkg.categoria;
  const serviceCount = pkg.servicios.length;

  return `
    <div class="package-card tier-${pkg.tier} cat-${pkg.categoria} reveal" data-category="${pkg.categoria}">
      <div class="pkg-tier-badge tier-${pkg.tier}">${tierLabel}</div>
      <div class="pkg-flyer-inner">
        <div class="pkg-category">
          <span class="pkg-category-icon">${catIcon}</span>
          <span class="pkg-category-name">${catName}</span>
        </div>
        <div class="pkg-header">
          <h3 class="pkg-name">${pkg.nombre}</h3>
          <p class="pkg-subtitle">${pkg.subtitulo}</p>
        </div>
        <div class="pkg-divider"></div>
        <div class="pkg-services-header">
          <span class="pkg-services-count">${serviceCount} servicios incluidos</span>
        </div>
        <ul class="pkg-services">
          ${serviciosHTML}
        </ul>
        <div class="pkg-footer">
          <div class="pkg-price">
            <span class="pkg-price-label">Desde</span>
            <span class="pkg-price-value">${pkg.precio}</span>
            <span class="pkg-price-note">MXN</span>
          </div>
          <a href="#contact" class="pkg-cta">
            <span>Cotizar</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </a>
        </div>
      </div>
    </div>
  `;
}

// ========== HELPER: Render Package for Dashboard ==========
function renderPackageCardDashboard(pkg, showServices = true) {
  const serviciosHTML = showServices ? pkg.servicios.map(s => 
    `<li>
      <span class="pkg-icon-svg">${s.icon}</span>
      <span class="pkg-service-text">${s.nombre}</span>
    </li>`
  ).join('') : '';

  const catIcon = CategoryIcons[pkg.categoria] || CategoryIcons.general;
  const tierLabel = TierLabels[pkg.tier] || pkg.tier;
  const catName = CategoryNames[pkg.categoria] || pkg.categoria;
  const serviceCount = pkg.servicios.length;

  return `
    <div class="package-card tier-${pkg.tier} cat-${pkg.categoria}" data-category="${pkg.categoria}">
      <div class="pkg-tier-badge tier-${pkg.tier}">${tierLabel}</div>
      <div class="pkg-flyer-inner">
        <div class="pkg-category">
          <span class="pkg-category-icon">${catIcon}</span>
          <span class="pkg-category-name">${catName}</span>
        </div>
        <div class="pkg-header">
          <h3 class="pkg-name">${pkg.nombre}</h3>
          <p class="pkg-subtitle">${pkg.subtitulo}</p>
        </div>
        <div class="pkg-divider"></div>
        <div class="pkg-services-header">
          <span class="pkg-services-count">${serviceCount} servicios incluidos</span>
        </div>
        ${showServices ? `
        <ul class="pkg-services">
          ${serviciosHTML}
        </ul>
        ` : ''}
        <div class="pkg-footer">
          <div class="pkg-price">
            <span class="pkg-price-label">Precio</span>
            <span class="pkg-price-value">${pkg.precio}</span>
            <span class="pkg-price-note">MXN</span>
          </div>
        </div>
      </div>
    </div>
  `;
}

// ========== HELPER: Get Random Past Packages ==========
function getRandomPastPackages(currentPackageId, count = 3) {
  const available = PackagesDB.filter(p => p.id !== currentPackageId);
  const shuffled = available.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}
