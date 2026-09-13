// ==================================================================
// HARD STREET — Renderers (HTML desde los modelos nuevos)
// ==================================================================

// Pool de imagenes para el carousel de servicios externos.
// Prioridad: packages.url_image de la BD; si viene vacio, pool local.
// (solo archivos que existen en images/)
const ExternImagesPool = [
  'images/boungle.jpg',
  'images/review.jpg',
  'images/banner.jpg',
  'images/banner1.jpg',
  'images/after_p.jpg',
  'images/before_p.jpg',
];

function imageForPackage(pkg, idx = 0) {
  if (pkg.urlImage) return pkg.urlImage;
  return ExternImagesPool[pkg.id % ExternImagesPool.length] || ExternImagesPool[idx % ExternImagesPool.length];
}

// ========== CARD DE PAQUETE (landing) ==========
function renderPackageCard(pkg) {
  const serviciosHTML = pkg.services.map(s =>
    `<li>
      <span class="pkg-icon-svg">${s.iconSvg}</span>
      <span class="pkg-service-text">${s.name}</span>
    </li>`
  ).join('');

  return `
    <div class="package-card tier-${pkg.tier.key} cat-${pkg.categoryKey} reveal" data-category="${pkg.categoryKey}">
      <div class="pkg-tier-badge tier-${pkg.tier.key}">${pkg.tierLabel}</div>
      <div class="pkg-flyer-inner">
        <div class="pkg-category">
          <span class="pkg-category-icon">${pkg.categoryIcon}</span>
          <span class="pkg-category-name">${pkg.packageCategory.name}</span>
        </div>
        <div class="pkg-header">
          <h3 class="pkg-name">${pkg.name}</h3>
          <p class="pkg-subtitle">${pkg.subtitle}</p>
        </div>
        <div class="pkg-divider"></div>
        <div class="pkg-services-header">
          <span class="pkg-services-count">${pkg.services.length} servicios incluidos</span>
        </div>
        <ul class="pkg-services">${serviciosHTML}</ul>
        <div class="pkg-footer">
          <div class="pkg-price">
            <span class="pkg-price-label">Desde</span>
            <span class="pkg-price-value">${pkg.priceFormatted}</span>
            <span class="pkg-price-note">${pkg.currency}</span>
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

// ========== CARD DE PAQUETE (dashboard, compatibilidad) ==========
function renderPackageCardDashboard(pkg, showServices = true) {
  const serviciosHTML = showServices
    ? pkg.services.map(s =>
        `<li><span class="pkg-icon-svg">${s.iconSvg}</span><span class="pkg-service-text">${s.name}</span></li>`
      ).join('')
    : '';

  return `
    <div class="package-card tier-${pkg.tier.key} cat-${pkg.categoryKey}" data-category="${pkg.categoryKey}">
      <div class="pkg-tier-badge tier-${pkg.tier.key}">${pkg.tierLabel}</div>
      <div class="pkg-flyer-inner">
        <div class="pkg-category">
          <span class="pkg-category-icon">${pkg.categoryIcon}</span>
          <span class="pkg-category-name">${pkg.packageCategory.name}</span>
        </div>
        <div class="pkg-header">
          <h3 class="pkg-name">${pkg.name}</h3>
          <p class="pkg-subtitle">${pkg.subtitle}</p>
        </div>
        <div class="pkg-divider"></div>
        <div class="pkg-services-header">
          <span class="pkg-services-count">${pkg.services.length} servicios incluidos</span>
        </div>
        ${showServices ? `<ul class="pkg-services">${serviciosHTML}</ul>` : ''}
        <div class="pkg-footer">
          <div class="pkg-price">
            <span class="pkg-price-label">Precio</span>
            <span class="pkg-price-value">${pkg.priceFormatted}</span>
            <span class="pkg-price-note">${pkg.currency}</span>
          </div>
        </div>
      </div>
    </div>
  `;
}
