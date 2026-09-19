// =============================================================================
// Co404 & Travel404 - Tours Hub Multi-Location Interactive Engine
// Supports:
// 1. Co404 San Cristóbal de las Casas (Chiapas, Mexico)
// 2. Co404 Oaxaca (Oaxaca de Juárez, Mexico)
// 3. Co404 Medellín (Laureles, Colombia)
// Full English UI with Courteous Spanish WhatsApp Agency Communication
// =============================================================================

document.addEventListener('DOMContentLoaded', () => {
  // Ensure CO404_LOCATIONS exists
  if (typeof window.CO404_LOCATIONS === 'undefined') {
    window.CO404_LOCATIONS = {
      'san-cris': window.TOURS_DATA || {}
    };
  }

  // Active Location State
  let currentLocationId = localStorage.getItem('co404_active_location') || 'san-cris';
  if (!window.CO404_LOCATIONS[currentLocationId]) {
    currentLocationId = 'san-cris';
  }

  let locationData = window.CO404_LOCATIONS[currentLocationId];
  let destinations = [...(locationData.destinations || [])];
  let colectivos = [...(locationData.colectivos || locationData.colectivosGuide || [])];

  // Custom Agencies per location
  let customAgencies = [];
  function loadCustomAgencies() {
    try {
      let saved = localStorage.getItem('co404_custom_agencies_' + currentLocationId);
      if (!saved && currentLocationId === 'san-cris') {
        saved = localStorage.getItem('co404_custom_agencies');
      }
      customAgencies = saved ? JSON.parse(saved) : [];
    } catch (e) {
      customAgencies = [];
    }
    agencies = [...customAgencies, ...(locationData.agencies || [])];
  }

  let agencies = [];
  loadCustomAgencies();

  // Group Trips per location
  let groupTrips = [];
  function loadGroupTrips() {
    try {
      let saved = localStorage.getItem('co404_group_trips_' + currentLocationId);
      if (!saved && currentLocationId === 'san-cris') {
        saved = localStorage.getItem('co404_group_trips');
      }
      groupTrips = saved ? JSON.parse(saved) : [...(locationData.groupTrips || locationData.defaultGroupTrips || [])];
    } catch (e) {
      groupTrips = [...(locationData.groupTrips || locationData.defaultGroupTrips || [])];
    }
  }
  loadGroupTrips();

  let currentTab = 'destinations';
  let currentCategory = 'all';
  let searchQuery = '';
  let currentSort = 'recommended';
  let currentCurrency = locationData.currency || 'MXN';

  // Currency select dropdown sync
  const currencySelect = document.getElementById('currency-select');
  if (currencySelect) currencySelect.value = currentCurrency;

  // Location select dropdown sync
  const locationSelect = document.getElementById('location-select');
  if (locationSelect) locationSelect.value = currentLocationId;

  // =========================================================================
  // MULTI-CURRENCY CONVERSION ENGINE (MXN, COP, USD, EUR)
  // =========================================================================
  function convertAmount(amount, fromCur, toCur) {
    if (fromCur === toCur) return amount;
    // Normalize to USD
    let usd = 0;
    if (fromCur === 'USD') usd = amount;
    else if (fromCur === 'MXN') usd = amount / 18.5;
    else if (fromCur === 'COP') usd = amount / 4100;
    else if (fromCur === 'EUR') usd = amount / 0.92;

    // Convert from USD to target currency
    if (toCur === 'USD') return usd;
    if (toCur === 'MXN') return usd * 18.5;
    if (toCur === 'COP') return usd * 4100;
    if (toCur === 'EUR') return usd * 0.92;
    return usd;
  }

  function formatPriceString(priceRangeStr, baseCurrency = (locationData ? locationData.currency : 'MXN')) {
    if (!priceRangeStr) return "";
    if (currentCurrency === baseCurrency) return priceRangeStr;

    // Replace currency expressions e.g. $750, $2,800, $110,000
    return priceRangeStr.replace(/\$(\d+(?:,\d+)*(?:\.\d+)?)/g, (match, numStr) => {
      const num = parseFloat(numStr.replace(/,/g, ''));
      if (isNaN(num)) return match;
      const converted = convertAmount(num, baseCurrency, currentCurrency);
      if (currentCurrency === 'COP') {
        const rounded = Math.round(converted / 1000) * 1000;
        return `$${rounded.toLocaleString('es-CO')} COP`;
      }
      if (currentCurrency === 'EUR') {
        return `€${Math.round(converted).toLocaleString()} EUR`;
      }
      if (currentCurrency === 'USD') {
        return `$${Math.round(converted).toLocaleString()} USD`;
      }
      return `$${Math.round(converted).toLocaleString('es-MX')} MXN`;
    });
  }

  function formatCurrencyValue(amount, baseCurrency = (locationData ? locationData.currency : 'MXN')) {
    if (!amount && amount !== 0) return "$0";
    const converted = convertAmount(amount, baseCurrency, currentCurrency);
    if (currentCurrency === 'COP') {
      const rounded = Math.round(converted / 1000) * 1000;
      return `$${rounded.toLocaleString('es-CO')} COP`;
    }
    if (currentCurrency === 'EUR') {
      return `€${Math.round(converted).toLocaleString()} EUR`;
    }
    if (currentCurrency === 'USD') {
      return `$${Math.round(converted).toLocaleString()} USD`;
    }
    return `$${Math.round(converted).toLocaleString('es-MX')} MXN`;
  }

  // Toast notification helper
  function showToast(message) {
    const toast = document.getElementById('toast-message');
    if (!toast) return;
    toast.textContent = message;
    toast.style.transform = 'translateY(0)';
    toast.style.opacity = '1';
    setTimeout(() => {
      toast.style.transform = 'translateY(100px)';
      toast.style.opacity = '0';
    }, 3200);
  }

  // =========================================================================
  // LOCATION SWITCHER
  // =========================================================================
  function switchLocation(newLocId) {
    if (!window.CO404_LOCATIONS || !window.CO404_LOCATIONS[newLocId]) return;
    currentLocationId = newLocId;
    localStorage.setItem('co404_active_location', newLocId);
    locationData = window.CO404_LOCATIONS[newLocId];

    // Set native currency
    currentCurrency = locationData.currency;
    if (currencySelect) currencySelect.value = currentCurrency;
    if (locationSelect) locationSelect.value = currentLocationId;

    // Update datasets
    destinations = [...(locationData.destinations || [])];
    colectivos = [...(locationData.colectivos || locationData.colectivosGuide || [])];
    loadCustomAgencies();
    loadGroupTrips();

    // Update UI headers
    document.title = `${locationData.name} Tours & Travel Hub | Co404 Hospitality`;
    const sub = document.getElementById('brand-location-subtitle');
    if (sub) {
      sub.innerHTML = `Coliving &amp; Community Adventures &bull; <span>${locationData.city}</span>`;
    }

    const agencySub = document.getElementById('agency-directory-subtitle');
    if (agencySub) {
      agencySub.textContent = `Tour operators, specialized expedition guides, and private drivers in ${locationData.city}. Quote directly via WhatsApp with ${locationData.name} pickup.`;
    }

    const heroDestTitle = document.getElementById('hero-dest-title');
    if (heroDestTitle) {
      if (currentLocationId === 'san-cris') {
        heroDestTitle.textContent = 'Explore Chiapas from Co404';
      } else if (currentLocationId === 'oaxaca') {
        heroDestTitle.textContent = 'Explore Oaxaca from Co404';
      } else if (currentLocationId === 'medellin') {
        heroDestTitle.textContent = 'Explore Antioquia from Co404';
      } else {
        heroDestTitle.textContent = `Explore ${locationData.city} from ${locationData.name}`;
      }
    }

    const heroDestDesc = document.getElementById('hero-dest-desc');
    if (heroDestDesc) {
      if (currentLocationId === 'san-cris') {
        heroDestDesc.textContent = 'Curated guide of authentic distances, microclimates, community tips, and direct WhatsApp quotes with top local agencies on Real de Guadalupe.';
      } else if (currentLocationId === 'oaxaca') {
        heroDestDesc.textContent = 'Curated day trips to mezcal palenques, Zapotec ruins, Hierve el Agua, and Sierra Norte mountain hikes with verified Oaxaca operators.';
      } else if (currentLocationId === 'medellin') {
        heroDestDesc.textContent = 'Community guide to Guatapé, Comuna 13 street art, coffee haciendas in Jericó & Jardín, and paragliding in San Félix with door pickup in Laureles.';
      }
    }

    const groupSub = document.getElementById('group-trips-subtitle');
    if (groupSub) {
      groupSub.textContent = `Looking to split a private van or explore together with fellow ${locationData.name} colivers? Join an open trip below or launch a new one!`;
    }

    const colTitle = document.getElementById('colectivos-banner-title');
    if (colTitle) {
      colTitle.textContent = `${locationData.city} Public Transit & DIY Guide`;
    }

    const colSub = document.getElementById('colectivos-banner-subtitle');
    if (colSub) {
      if (locationData.currency === 'COP') {
        colSub.textContent = `Travel like a local for $1 - $3 USD ($4,000 - $22,000 COP). Exact Metro stations, bus terminals, windshield signs, and safety tips for destinations around Antioquia.`;
      } else {
        colSub.textContent = `Travel like a local for $1 - $2 USD ($15 - $50 MXN). Exact departure stations, windshield signs, schedules, and safety tips for nearby destinations.`;
      }
    }

    // Reset filters
    currentCategory = 'all';
    searchQuery = '';
    const searchInput = document.getElementById('destination-search-input');
    if (searchInput) searchInput.value = '';
    document.querySelectorAll('.filter-pill').forEach(p => {
      p.classList.toggle('active', p.dataset.category === 'all');
    });

    renderDestinations();
    renderAgencies();
    renderGroupTrips();
    renderColectivos();
    updateTabCounters();
    showToast(`Switched to ${locationData.name}!`);
  }

  if (locationSelect) {
    locationSelect.addEventListener('change', (e) => {
      switchLocation(e.target.value);
    });
  }

  // Navigation Tabs handler
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabViews = document.querySelectorAll('.tab-view');

  function switchTab(targetTab) {
    currentTab = targetTab;
    tabButtons.forEach(btn => {
      if (btn.dataset.tab === targetTab) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    tabViews.forEach(view => {
      if (view.id === `view-${targetTab}`) {
        view.style.display = 'block';
        view.classList.add('active');
      } else {
        view.style.display = 'none';
        view.classList.remove('active');
      }
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      switchTab(btn.dataset.tab);
    });
  });

  // Modal open/close helpers
  function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  document.querySelectorAll('.btn-close-modal, .modal-overlay').forEach(el => {
    el.addEventListener('click', (e) => {
      if (e.target === el || el.classList.contains('btn-close-modal')) {
        const modal = el.closest('.modal-overlay');
        if (modal) closeModal(modal.id);
      }
    });
  });

  function updateTabCounters() {
    const destCount = document.getElementById('tab-destinations-count');
    if (destCount) destCount.textContent = destinations.length;

    const statDest = document.getElementById('stat-dest-count');
    if (statDest) statDest.textContent = destinations.length;

    const agencyCount = document.getElementById('tab-agencies-count');
    if (agencyCount) agencyCount.textContent = agencies.length;

    const statAgencies = document.getElementById('stat-agencies-count');
    if (statAgencies) statAgencies.textContent = agencies.length;

    const tripsCount = document.getElementById('tab-trips-count');
    if (tripsCount) tripsCount.textContent = groupTrips.length;
  }

  // =========================================================================
  // VIEW 1: RENDER DESTINATIONS
  // =========================================================================
  function renderDestinations() {
    const container = document.getElementById('destinations-grid');
    if (!container) return;

    let filtered = destinations.filter(d => {
      // Category filter
      if (currentCategory !== 'all' && d.category !== currentCategory) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const inName = d.name.toLowerCase().includes(q);
        const inTagline = d.tagline.toLowerCase().includes(q);
        const inDesc = d.description.toLowerCase().includes(q);
        const inTags = d.tags && d.tags.some(t => t.toLowerCase().includes(q));
        if (!inName && !inTagline && !inDesc && !inTags) {
          return false;
        }
      }
      return true;
    });

    // Sort
    if (currentSort === 'distance-asc') {
      filtered.sort((a, b) => a.distanceKm - b.distanceKm);
    } else if (currentSort === 'distance-desc') {
      filtered.sort((a, b) => b.distanceKm - a.distanceKm);
    } else if (currentSort === 'price-asc') {
      filtered.sort((a, b) => {
        const pA = parseInt((a.priceSharedRange || '').replace(/\D/g, '') || 999999);
        const pB = parseInt((b.priceSharedRange || '').replace(/\D/g, '') || 999999);
        return pA - pB;
      });
    }

    // Update counters
    const countEl = document.getElementById('tab-destinations-count');
    if (countEl) countEl.textContent = filtered.length;

    if (filtered.length === 0) {
      container.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; background: var(--co-white); border-radius: var(--radius-lg); border: 1px solid var(--co-border);">
          <h3 style="font-family: var(--font-serif); font-size: 1.4rem; color: var(--co-wine); margin-bottom: 8px;">No destinations found in ${locationData.city}</h3>
          <p style="color: var(--co-charcoal-sub); font-size: 0.9rem;">Try another keyword or reset category filters.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = filtered.map(d => {
      const primaryTag = (d.tags && d.tags[0]) || locationData.city;
      const formattedPrice = formatPriceString(d.priceSharedRange, locationData.currency);
      const formattedColectivo = formatPriceString((d.colectivoCost || '').split('(')[0].trim(), locationData.currency);

      // Exclusivity badge or specialty badge
      let badgeHtml = '';
      if (d.isExclusive) {
        badgeHtml = `<span class="badge-exclusive">⭐ ${d.exclusiveBadge || 'Exclusive Expedition'}</span>`;
      } else if (d.specializedBadge) {
        badgeHtml = `<span class="badge-specialty">${d.specializedBadge}</span>`;
      }

      return `
        <article class="destination-card" data-id="${d.id}">
          <div class="card-image-wrap">
            <img class="card-image" src="${d.heroImage}" alt="${d.name}" loading="lazy">
            <div class="card-overlay-badges">
              <span class="badge-tag">${primaryTag}</span>
              ${badgeHtml}
            </div>
            <div class="card-distance-bar">
              <span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                ${d.travelTimeMinutes} min travel
              </span>
              <span>&bull;</span>
              <span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                ${d.distanceKm} km from ${locationData.name}
              </span>
            </div>
          </div>
          <div class="card-body">
            <h3 class="card-title">${d.name}</h3>
            <p class="card-tagline">${d.tagline}</p>
            
            <div class="card-quick-specs">
              <div class="spec-item">
                <span class="spec-label">Difficulty</span>
                <span class="spec-value">${d.difficulty.split('(')[0].trim()}</span>
              </div>
              <div class="spec-item">
                <span class="spec-label">Departure</span>
                <span class="spec-value">${d.suggestedDeparture}</span>
              </div>
            </div>

            <div class="card-pricing-row">
              <div class="price-box">
                <span class="price-title">Shared Tour</span>
                <span class="price-amount">${formattedPrice}</span>
              </div>
              <div class="price-box" style="text-align: right;">
                <span class="price-title">Colectivo / DIY</span>
                <span style="font-size: 0.88rem; font-weight: 700; color: var(--co-green);">${formattedColectivo}</span>
              </div>
            </div>

            <div class="card-actions">
              <button class="btn btn-secondary btn-view-tour" data-id="${d.id}">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                Guide & Tips
              </button>
              <button class="btn btn-whatsapp btn-quote-whatsapp" data-id="${d.id}">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
                WhatsApp
              </button>
            </div>
          </div>
        </article>
      `;
    }).join('');

    // Attach listeners to card buttons
    container.querySelectorAll('.btn-view-tour').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.dataset.id;
        openTourDetail(id);
      });
    });

    container.querySelectorAll('.btn-quote-whatsapp').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.dataset.id;
        openWhatsAppDispatcher(id);
      });
    });
  }

  // Category filter clicks
  const categoryPills = document.querySelectorAll('.filter-pill');
  categoryPills.forEach(pill => {
    pill.addEventListener('click', () => {
      categoryPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      currentCategory = pill.dataset.category;
      renderDestinations();
    });
  });

  // Search input
  const searchInput = document.getElementById('destination-search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      renderDestinations();
    });
  }

  // Sort select
  const sortSelect = document.getElementById('sort-destinations-select');
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      currentSort = e.target.value;
      renderDestinations();
    });
  }

  // Currency select
  if (currencySelect) {
    currencySelect.addEventListener('change', (e) => {
      currentCurrency = e.target.value;
      renderDestinations();
      renderGroupTrips();
    });
  }

  // =========================================================================
  // MODAL: TOUR DETAIL
  // =========================================================================
  function openTourDetail(destId) {
    const dest = destinations.find(d => d.id === destId);
    if (!dest) return;

    document.getElementById('modal-tour-title').textContent = dest.name;
    const body = document.getElementById('modal-tour-body');

    // Exclusivity alert banner
    let exclusiveBannerHtml = '';
    if (dest.isExclusive) {
      exclusiveBannerHtml = `
        <div style="background: linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%); border: 1px solid #F59E0B; padding: 14px 18px; border-radius: var(--radius-md); margin-bottom: 16px; color: #92400E;">
          <div style="font-weight: 800; font-size: 0.95rem; display: flex; align-items: center; gap: 6px; margin-bottom: 4px;">
            ⭐ ${dest.exclusiveBadge || 'Exclusive Tour with ' + dest.exclusiveAgencyName}
          </div>
          <p style="font-size: 0.86rem; margin: 0; line-height: 1.4;">
            This specialized expedition requires specialized equipment, safety permits, or community authorization, operated exclusively by <strong>${dest.exclusiveAgencyName}</strong> in ${locationData.city}.
          </p>
        </div>
      `;
    }

    body.innerHTML = `
      <div style="position: relative; border-radius: var(--radius-md); overflow: hidden; height: 240px; margin-bottom: 14px;">
        <img src="${dest.heroImage}" alt="${dest.name}" style="width: 100%; height: 100%; object-fit: cover;">
        <div style="position: absolute; bottom: 0; left: 0; right: 0; padding: 20px; background: linear-gradient(0deg, rgba(0,0,0,0.85) 0%, transparent 100%); color: white;">
          <h4 style="font-family: var(--font-serif); font-size: 1.35rem; margin-bottom: 4px;">${dest.name}</h4>
          <p style="font-size: 0.85rem; opacity: 0.9;">${dest.distanceKm} km from ${locationData.name} &bull; ${dest.travelTimeMinutes} min travel &bull; Altitude: ${dest.altitudeMeters}m</p>
        </div>
      </div>

      ${exclusiveBannerHtml}

      <div>
        <h4 class="modal-section-title">Overview</h4>
        <p style="font-size: 0.92rem; color: var(--co-charcoal); line-height: 1.6;">${dest.description}</p>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 14px; background: var(--co-sand); padding: 14px; border-radius: var(--radius-md); border: 1px solid var(--co-border-light);">
        <div>
          <span style="font-size: 0.72rem; text-transform: uppercase; font-weight: 700; color: var(--co-charcoal-sub);">At Destination Microclimate</span>
          <div style="font-size: 0.88rem; font-weight: 600; color: var(--co-terracotta);">${dest.microclimate}</div>
        </div>
        <div>
          <span style="font-size: 0.72rem; text-transform: uppercase; font-weight: 700; color: var(--co-charcoal-sub);">Suggested Timing</span>
          <div style="font-size: 0.88rem; font-weight: 600;">Depart: ${dest.suggestedDeparture}</div>
        </div>
        <div>
          <span style="font-size: 0.72rem; text-transform: uppercase; font-weight: 700; color: var(--co-charcoal-sub);">Shared Tour Price</span>
          <div style="font-size: 0.88rem; font-weight: 700; color: var(--co-wine);">${formatPriceString(dest.priceSharedRange, locationData.currency)}</div>
        </div>
        <div>
          <span style="font-size: 0.72rem; text-transform: uppercase; font-weight: 700; color: var(--co-charcoal-sub);">Private Van (Group)</span>
          <div style="font-size: 0.88rem; font-weight: 600;">${formatPriceString(dest.pricePrivateRange, locationData.currency)}</div>
        </div>
      </div>

      <div>
        <h4 class="modal-section-title">Suggested Itinerary</h4>
        <div class="itinerary-timeline">
          ${dest.itinerary.map(it => `
            <div class="timeline-step">
              <div class="step-time">${it.time}</div>
              <div class="step-desc">${it.desc}</div>
            </div>
          `).join('')}
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
        <div style="background: #F4FAF4; border: 1px solid #D6EAD6; padding: 14px; border-radius: var(--radius-md);">
          <div style="font-weight: 700; font-size: 0.85rem; color: #2E7D32; margin-bottom: 8px;">&check; What's Typically Included</div>
          <ul style="font-size: 0.82rem; color: var(--co-charcoal); padding-left: 18px; line-height: 1.5;">
            ${(dest.includes || []).map(inc => `<li>${inc}</li>`).join('')}
          </ul>
        </div>
        <div style="background: #FDF6F6; border: 1px solid #F5D5D5; padding: 14px; border-radius: var(--radius-md);">
          <div style="font-weight: 700; font-size: 0.85rem; color: #C62828; margin-bottom: 8px;">&cross; Not Included (Extra Costs)</div>
          <ul style="font-size: 0.82rem; color: var(--co-charcoal); padding-left: 18px; line-height: 1.5;">
            ${(dest.excludes || []).map(exc => `<li>${exc}</li>`).join('')}
          </ul>
        </div>
      </div>

      <div style="background: var(--co-terracotta-light); border: 1px solid #F0D1C4; padding: 16px; border-radius: var(--radius-md);">
        <h4 style="font-size: 0.9rem; font-weight: 800; color: var(--co-terracotta); margin-bottom: 8px; display: flex; align-items: center; gap: 6px;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
          ${locationData.name} Community Tips & Advice
        </h4>
        <ul style="font-size: 0.85rem; color: var(--co-charcoal); padding-left: 20px; line-height: 1.5;">
          ${(dest.co404Tips || []).map(tip => `<li>${tip}</li>`).join('')}
        </ul>
      </div>

      <div>
        <h4 class="modal-section-title">What to Pack in Your Backpack</h4>
        <div style="display: flex; flex-wrap: wrap; gap: 8px;">
          ${(dest.packingList || []).map(item => `
            <span style="background: var(--co-sand-alt); border: 1px solid var(--co-border); padding: 4px 10px; border-radius: var(--radius-full); font-size: 0.8rem; font-weight: 500;">
              &bull; ${item}
            </span>
          `).join('')}
        </div>
      </div>

      <div style="margin-top: 10px; display: flex; gap: 12px;">
        <button class="btn btn-whatsapp" id="btn-modal-quote-now" style="width: 100%; padding: 14px; font-size: 0.95rem;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
          Quote & Coordinate with Agency via WhatsApp
        </button>
      </div>
    `;

    document.getElementById('btn-modal-quote-now').addEventListener('click', () => {
      closeModal('modal-tour-detail');
      const preselectAgency = dest.exclusiveAgencyId || null;
      openWhatsAppDispatcher(destId, preselectAgency);
    });

    openModal('modal-tour-detail');
  }

  // =========================================================================
  // MODAL: WHATSAPP DISPATCHER (English UI + Polite Spanish Output)
  // =========================================================================
  let currentDispatcherDestId = null;

  function updateAgencyLinksPreview() {
    const agencySelect = document.getElementById('wa-agency-select');
    const linksContainer = document.getElementById('wa-agency-links-preview');
    if (!agencySelect || !linksContainer) return;
    const agencyId = agencySelect.value;
    const agency = agencies.find(a => a.id === agencyId);
    if (!agency) {
      linksContainer.innerHTML = '';
      return;
    }
    const mapsUrl = agency.googleMapsUrl || (agency.address ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(agency.name + ' ' + agency.address)}` : '');
    let html = '';
    if (mapsUrl) {
      html += `
        <a href="${mapsUrl}" target="_blank" rel="noopener noreferrer" class="agency-link-btn agency-maps-btn" style="font-size: 0.74rem; padding: 4px 10px;">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
          View on Maps ↗
        </a>
      `;
    }
    if (agency.website) {
      html += `
        <a href="${agency.website}" target="_blank" rel="noopener noreferrer" class="agency-link-btn agency-web-btn" style="font-size: 0.74rem; padding: 4px 10px;">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
          Official Website ↗
        </a>
      `;
    }
    linksContainer.innerHTML = html;
  }

  function openWhatsAppDispatcher(destId, preselectedAgencyId = null) {
    currentDispatcherDestId = destId;
    const dest = destinations.find(d => d.id === destId);
    if (!dest) return;

    document.getElementById('wa-destination-name').value = dest.name;

    const agencyLabel = document.getElementById('wa-agency-select-label');
    if (agencyLabel) agencyLabel.textContent = `Select Tour Agency in ${locationData.name}:`;

    // Populate agency dropdown
    const agencySelect = document.getElementById('wa-agency-select');
    agencySelect.innerHTML = agencies.map(a => {
      const isPreselected = preselectedAgencyId ? (a.id === preselectedAgencyId) : false;
      const customPrefix = a.isCustom ? '⭐ [Custom] ' : '';
      const locTag = a.address ? a.address.split(',')[0] : locationData.city;
      return `
        <option value="${a.id}" ${isPreselected ? 'selected' : ''}>
          ${customPrefix}${a.name} (${locTag}) &bull; ${a.priceBenchmark || 'Verified'}
        </option>
      `;
    }).join('');

    // Default date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateInput = document.getElementById('wa-date-input');
    dateInput.value = tomorrow.toISOString().split('T')[0];

    updateAgencyLinksPreview();
    updateWhatsAppPreview();
    openModal('modal-whatsapp-dispatcher');
  }

  // OUTBOUND DISPATCH: 100% Polite Spanish output tailored to the active city!
  function generateWhatsAppMessage() {
    const dest = destinations.find(d => d.id === currentDispatcherDestId);
    const agencyId = document.getElementById('wa-agency-select').value;
    const agency = agencies.find(a => a.id === agencyId);
    const date = document.getElementById('wa-date-input').value;
    const pax = document.getElementById('wa-pax-input').value;
    const serviceType = document.getElementById('wa-service-type').value;
    const customNotes = document.getElementById('wa-custom-notes').value.trim();

    if (!dest || !agency) return "";

    const locale = locationData.currency === 'COP' ? 'es-CO' : 'es-MX';
    const dateFormatted = date ? new Date(date + 'T12:00:00').toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : 'próximamente';

    let msg = `¡Hola ${agency.name}! 👋\n\n`;
    msg += `Les escribo desde ${locationData.name} (${locationData.city}). Quisiéramos consultar disponibilidad y cotización para el tour a *${dest.name}*.\n\n`;
    msg += `📅 *Fecha deseada:* ${dateFormatted}\n`;
    msg += `👥 *Número de personas:* ${pax} personas (huéspedes de ${locationData.name})\n`;
    msg += `🚐 *Modalidad:* ${serviceType === 'privado' ? 'Camioneta / Servicio Privado exclusivo' : 'Tour Compartido'}\n`;
    if (customNotes) {
      msg += `💬 *Consulta o requerimiento adicional:* ${customNotes}\n`;
    }
    msg += `\n¿Tienen cupos disponibles y confirman si pasan a recogernos a la puerta de ${locationData.name} (${locationData.address})? ¡Muchas gracias!`;

    return msg;
  }

  function updateWhatsAppPreview() {
    const previewEl = document.getElementById('wa-preview-text');
    if (previewEl) {
      previewEl.textContent = generateWhatsAppMessage();
    }
  }

  // Update preview on inputs change
  ['wa-agency-select', 'wa-date-input', 'wa-pax-input', 'wa-service-type', 'wa-custom-notes'].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('input', () => {
        if (id === 'wa-agency-select') updateAgencyLinksPreview();
        updateWhatsAppPreview();
      });
      el.addEventListener('change', () => {
        if (id === 'wa-agency-select') updateAgencyLinksPreview();
        updateWhatsAppPreview();
      });
    }
  });

  // Copy message button
  const btnCopyWA = document.getElementById('btn-copy-wa-message');
  if (btnCopyWA) {
    btnCopyWA.addEventListener('click', () => {
      const text = generateWhatsAppMessage();
      navigator.clipboard.writeText(text).then(() => {
        showToast('Spanish message copied to clipboard!');
      });
    });
  }

  // Send WhatsApp button
  const btnSendWA = document.getElementById('btn-send-wa-direct');
  if (btnSendWA) {
    btnSendWA.addEventListener('click', () => {
      const agencyId = document.getElementById('wa-agency-select').value;
      const agency = agencies.find(a => a.id === agencyId);
      if (!agency) return;

      const message = generateWhatsAppMessage();
      const encodedMsg = encodeURIComponent(message);
      const cleanWa = (agency.whatsapp || '').replace(/\D/g, '');
      const waUrl = `https://wa.me/${cleanWa}?text=${encodedMsg}`;
      window.open(waUrl, '_blank');
      showToast(`Opening WhatsApp chat with ${agency.name}...`);
    });
  }

  // =========================================================================
  // VIEW 2: RENDER AGENCIES DIRECTORY & CUSTOM PROVIDER LOGIC
  // =========================================================================
  function renderAgencies() {
    const container = document.getElementById('agencies-grid');
    if (!container) return;

    const countEl = document.getElementById('tab-agencies-count');
    if (countEl) countEl.textContent = agencies.length;

    container.innerHTML = agencies.map(a => {
      const customBadge = a.isCustom ? `<span class="badge-custom-provider">Custom Contact</span>` : '';
      const deleteBtn = a.isCustom ? `
        <button class="btn-delete-custom" data-delete-id="${a.id}" title="Remove custom provider">
          Delete
        </button>
      ` : '';

      // Exclusive tours box if offered
      let exclusiveBox = '';
      if (a.flagshipTour) {
        exclusiveBox = `
          <div class="agency-exclusive-tours">
            <strong>Flagship Tour:</strong> ${a.flagshipTour}
          </div>
        `;
      }

      return `
        <div class="agency-card">
          <div class="agency-header">
            <div>
              <div style="display: flex; align-items: center; gap: 8px;">
                <h3 class="agency-name">${a.name}</h3>
                ${customBadge}
              </div>
              <div class="agency-contact">Contact: ${a.contactPerson}</div>
              <div style="font-size: 0.8rem; color: var(--co-charcoal-sub); margin-top: 2px;">
                📍 ${a.address}
              </div>
            </div>
            <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 6px;">
              <span class="agency-badge">${a.priceTier || a.badge || 'Verified'}</span>
              ${deleteBtn}
            </div>
          </div>

          <div class="agency-specs">
            <div>
              <strong>WhatsApp:</strong> 
              <span style="color: #128C7E; font-weight: 700;">${a.whatsapp}</span>
            </div>
            <div>
              <strong>Co404 Door Pickup:</strong> 
              <span style="color: ${a.doorPickupCo404 !== false ? 'var(--co-green)' : 'var(--co-charcoal)'}; font-weight: 600;">
                ${a.doorPickupCo404 !== false ? '&check; Yes' : '&cross; Central Meeting Point'}
              </span>
            </div>
          </div>

          <div class="agency-tags">
            ${(a.specialties || []).map(s => `<span class="agency-tag">${s}</span>`).join('')}
          </div>

          ${exclusiveBox}

          <div class="agency-notes">
            ${a.staffNotes || a.notes || a.pickupConditions || ''}
          </div>

          ${(() => {
            const mapsUrl = a.googleMapsUrl || (a.address ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(a.name + ' ' + a.address)}` : '');
            const mapsLink = mapsUrl ? `
              <a href="${mapsUrl}" target="_blank" rel="noopener noreferrer" class="agency-link-btn agency-maps-btn" title="View location on Google Maps">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                Google Maps ↗
              </a>
            ` : '';

            const webLink = a.website ? `
              <a href="${a.website}" target="_blank" rel="noopener noreferrer" class="agency-link-btn agency-web-btn" title="Visit official website or page">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
                Website ↗
              </a>
            ` : '';

            return (mapsLink || webLink) ? `
              <div class="agency-links-row">
                ${mapsLink}
                ${webLink}
              </div>
            ` : '';
          })()}

          <div style="margin-top: auto; display: flex; gap: 8px;">
            ${a.phone ? `
              <a href="tel:${a.phone}" class="btn btn-secondary" style="flex: 1;">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                Call
              </a>
            ` : ''}
            <button class="btn btn-whatsapp btn-direct-agency-wa" data-agency-id="${a.id}" style="flex: 1.5;">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
              WhatsApp Quote
            </button>
          </div>
        </div>
      `;
    }).join('');

    // Attach listeners
    container.querySelectorAll('.btn-direct-agency-wa').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const agencyId = e.currentTarget.dataset.agencyId;
        const defaultDest = destinations[0] ? destinations[0].id : null;
        if (defaultDest) openWhatsAppDispatcher(defaultDest, agencyId);
      });
    });

    container.querySelectorAll('.btn-delete-custom').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const deleteId = e.currentTarget.dataset.deleteId;
        if (confirm('Are you sure you want to remove this custom provider contact?')) {
          customAgencies = customAgencies.filter(ca => ca.id !== deleteId);
          localStorage.setItem('co404_custom_agencies_' + currentLocationId, JSON.stringify(customAgencies));
          agencies = [...customAgencies, ...(locationData.agencies || [])];
          renderAgencies();
          showToast('Provider removed from directory.');
        }
      });
    });
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // =========================================================================
  // LIVE GOOGLE MAPS AUTOCOMPLETE & PLACE SEARCH FOR ADD PROVIDER
  // =========================================================================
  const placeSearchInput = document.getElementById('provider-place-search');
  const placeSearchSpinner = document.getElementById('place-search-spinner');
  const placeSearchDropdown = document.getElementById('place-search-dropdown');
  const placeSearchStatus = document.getElementById('place-search-status');
  let placeSearchDebounce = null;
  let currentSearchResults = [];
  let selectedDropdownIndex = -1;

  function clearPlaceSearch() {
    if (placeSearchInput) placeSearchInput.value = '';
    if (placeSearchDropdown) {
      placeSearchDropdown.innerHTML = '';
      placeSearchDropdown.classList.add('hidden');
    }
    if (placeSearchStatus) {
      placeSearchStatus.innerHTML = '';
      placeSearchStatus.classList.add('hidden');
    }
    if (placeSearchSpinner) placeSearchSpinner.classList.add('hidden');
    currentSearchResults = [];
    selectedDropdownIndex = -1;
  }

  function selectPlaceResult(selected) {
    const nameInput = document.getElementById('provider-name');
    const locInput = document.getElementById('provider-location');
    const mapsUrlInput = document.getElementById('provider-maps-url');
    const webInput = document.getElementById('provider-website');
    const phoneInput = document.getElementById('provider-phone');
    const waInput = document.getElementById('provider-whatsapp');

    if (nameInput) nameInput.value = selected.name;
    if (locInput) locInput.value = selected.address;
    if (mapsUrlInput) mapsUrlInput.value = selected.googleMapsUrl;
    if (webInput && selected.website) webInput.value = selected.website;
    if (phoneInput && selected.phone) phoneInput.value = selected.phone;
    if (waInput && selected.phone && !waInput.value) {
      waInput.value = selected.phone.replace(/\D/g, '');
    }

    if (placeSearchInput) placeSearchInput.value = selected.name;
    if (placeSearchDropdown) placeSearchDropdown.classList.add('hidden');

    if (placeSearchStatus) {
      placeSearchStatus.innerHTML = `
        <span>✅ Connected to Google Maps: <strong>${escapeHtml(selected.name)}</strong></span>
        <a href="${selected.googleMapsUrl}" target="_blank" rel="noopener noreferrer">View on Maps ↗</a>
      `;
      placeSearchStatus.classList.remove('hidden');
    }
  }

  // City Coordinates for Free Open POI & Geocoding Search
  const CITY_COORDS = {
    'san-cris': { lat: 16.7370, lon: -92.6376, city: 'San Cristóbal de las Casas', state: 'Chiapas', country: 'México' },
    'oaxaca': { lat: 17.0605, lon: -96.7256, city: 'Oaxaca de Juárez', state: 'Oaxaca', country: 'México' },
    'medellin': { lat: 6.2442, lon: -75.5812, city: 'Medellín', state: 'Antioquia', country: 'Colombia' }
  };

  // 100% Free, Client-Side Open POI Search (Photon / OSM + Direct Google Maps Link)
  async function performFreePlaceSearch(query, locationKey) {
    const loc = CITY_COORDS[locationKey] || CITY_COORDS['san-cris'];
    try {
      const searchUrl = `https://photon.komoot.io/api/?q=${encodeURIComponent(query + ' ' + loc.city)}&lat=${loc.lat}&lon=${loc.lon}&limit=8`;
      const res = await fetch(searchUrl);
      if (res.ok) {
        const data = await res.json();
        if (data.features && data.features.length > 0) {
          return data.features.map(f => {
            const p = f.properties;
            const name = p.name || p.street || query;
            const addrParts = [p.street, p.housenumber, p.district, p.city || loc.city, p.country || loc.country].filter(Boolean);
            const address = addrParts.join(', ') || `${loc.city}, ${loc.country}`;
            const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name + ', ' + address)}`;
            const osmUrl = `https://www.openstreetmap.org/search?query=${encodeURIComponent(name + ', ' + address)}`;
            return {
              name,
              address,
              googleMapsUrl,
              osmUrl,
              lat: f.geometry?.coordinates?.[1] || loc.lat,
              lng: f.geometry?.coordinates?.[0] || loc.lon,
              type: p.osm_value || p.type || 'local_business',
              source: 'free-open-poi'
            };
          });
        }
      }
    } catch (err) {
      console.warn('Direct Photon open search error, falling back to maps link:', err);
    }

    // Direct Google Maps web search link fallback
    const freeMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query + ', ' + loc.city)}`;
    return [{
      name: query,
      address: `${loc.city}, ${loc.country}`,
      googleMapsUrl: freeMapsUrl,
      lat: loc.lat,
      lng: loc.lon,
      source: 'free-open-direct'
    }];
  }

  if (placeSearchInput) {
    placeSearchInput.addEventListener('input', (e) => {
      const q = e.target.value.trim();
      clearTimeout(placeSearchDebounce);

      if (q.length < 2) {
        if (placeSearchDropdown) placeSearchDropdown.classList.add('hidden');
        if (placeSearchSpinner) placeSearchSpinner.classList.add('hidden');
        return;
      }

      if (placeSearchSpinner) placeSearchSpinner.classList.remove('hidden');

      placeSearchDebounce = setTimeout(async () => {
        try {
          const results = await performFreePlaceSearch(q, currentLocationId);
          if (placeSearchSpinner) placeSearchSpinner.classList.add('hidden');

          if (results && results.length > 0) {
            currentSearchResults = results;
            selectedDropdownIndex = -1;
            placeSearchDropdown.innerHTML = results.map((r, idx) => `
              <div class="place-dropdown-item" data-index="${idx}">
                <div>
                  <div class="place-title">📍 ${escapeHtml(r.name)}</div>
                  <div class="place-address">${escapeHtml(r.address)}</div>
                </div>
                <span class="place-badge">${r.type || 'Free Live Place'}</span>
              </div>
            `).join('');
            placeSearchDropdown.classList.remove('hidden');
          } else {
            currentSearchResults = [];
            placeSearchDropdown.innerHTML = `
              <div style="padding: 12px; font-size: 0.8rem; color: var(--text-muted); text-align: center;">
                No exact business found. You can still enter details manually below or paste a Google Maps link.
              </div>
            `;
            placeSearchDropdown.classList.remove('hidden');
          }
        } catch (err) {
          console.warn('Place search error:', err);
          if (placeSearchSpinner) placeSearchSpinner.classList.add('hidden');
        }
      }, 300);
    });

    if (placeSearchDropdown) {
      placeSearchDropdown.addEventListener('click', (e) => {
        const item = e.target.closest('.place-dropdown-item');
        if (!item) return;
        const idx = parseInt(item.dataset.index, 10);
        const selected = currentSearchResults[idx];
        if (selected) {
          selectPlaceResult(selected);
        }
      });
    }

    placeSearchInput.addEventListener('keydown', (e) => {
      if (!placeSearchDropdown || placeSearchDropdown.classList.contains('hidden') || currentSearchResults.length === 0) {
        return;
      }
      const items = placeSearchDropdown.querySelectorAll('.place-dropdown-item');
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        selectedDropdownIndex = (selectedDropdownIndex + 1) % items.length;
        items.forEach((it, i) => it.classList.toggle('active', i === selectedDropdownIndex));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        selectedDropdownIndex = (selectedDropdownIndex - 1 + items.length) % items.length;
        items.forEach((it, i) => it.classList.toggle('active', i === selectedDropdownIndex));
      } else if (e.key === 'Enter') {
        if (selectedDropdownIndex >= 0 && selectedDropdownIndex < currentSearchResults.length) {
          e.preventDefault();
          selectPlaceResult(currentSearchResults[selectedDropdownIndex]);
        }
      } else if (e.key === 'Escape') {
        placeSearchDropdown.classList.add('hidden');
      }
    });

    document.addEventListener('click', (e) => {
      if (!e.target.closest('.place-search-box-wrap')) {
        if (placeSearchDropdown) placeSearchDropdown.classList.add('hidden');
      }
    });
  }

  // Open Add Provider modal
  const btnAddProvider = document.getElementById('btn-add-provider');
  if (btnAddProvider) {
    btnAddProvider.addEventListener('click', () => {
      clearPlaceSearch();
      const locLabel = document.getElementById('provider-location-label');
      if (locLabel) locLabel.textContent = `Office / Base Location in ${locationData.name}:`;
      const locInput = document.getElementById('provider-location');
      if (locInput) locInput.value = locationData.city;
      const mapsInput = document.getElementById('provider-maps-url');
      if (mapsInput) mapsInput.value = '';
      const webInput = document.getElementById('provider-website');
      if (webInput) webInput.value = '';
      openModal('modal-add-provider');
      if (placeSearchInput) setTimeout(() => placeSearchInput.focus(), 100);
    });
  }

  // Add Provider form submit
  const formAddProvider = document.getElementById('form-add-provider');
  if (formAddProvider) {
    formAddProvider.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('provider-name').value.trim();
      const contact = document.getElementById('provider-contact').value.trim();
      let whatsapp = document.getElementById('provider-whatsapp').value.trim().replace(/\D/g, '');
      const phone = document.getElementById('provider-phone').value.trim();
      const priceTier = document.getElementById('provider-price-tier').value;
      const location = document.getElementById('provider-location').value.trim() || locationData.city;
      let mapsUrl = document.getElementById('provider-maps-url').value.trim();
      const website = document.getElementById('provider-website').value.trim();
      const specialtiesRaw = document.getElementById('provider-specialties').value.trim();
      const pickup = document.getElementById('provider-pickup').checked;
      const notes = document.getElementById('provider-notes').value.trim();

      // Ensure appropriate country code prefix if 10 digits provided
      if (whatsapp.length === 10) {
        whatsapp = (locationData.currency === 'COP' ? '57' : '52') + whatsapp;
      }

      // If user did not provide a custom maps URL, generate valid search link
      if (!mapsUrl && (name || location)) {
        mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name + ', ' + location)}`;
      }

      const specialties = specialtiesRaw 
        ? specialtiesRaw.split(',').map(s => s.trim()).filter(Boolean)
        : ['Private Vans', 'Custom Tours'];

      const newProvider = {
        id: `custom-agency-${Date.now()}`,
        name: name,
        contactPerson: contact || 'Contact Person',
        address: location,
        googleMapsUrl: mapsUrl,
        website: website || '',
        whatsapp: whatsapp,
        phone: phone || `+${whatsapp}`,
        badge: 'Custom Provider',
        priceTier: 'Private Contact',
        rating: 5.0,
        reviewCount: 1,
        specialties: specialties,
        doorPickupCo404: pickup,
        priceBenchmark: priceTier,
        staffNotes: notes || `Direct contact added by ${locationData.name} team.`,
        isCustom: true,
        cityId: currentLocationId
      };

      customAgencies.unshift(newProvider);
      localStorage.setItem('co404_custom_agencies_' + currentLocationId, JSON.stringify(customAgencies));
      agencies = [...customAgencies, ...(locationData.agencies || [])];

      closeModal('modal-add-provider');
      formAddProvider.reset();
      clearPlaceSearch();
      renderAgencies();
      showToast(`Provider "${name}" added with Google Maps link!`);
    });
  }

  // =========================================================================
  // VIEW 3: RENDER CO404 GROUP TRIPS (VAN SPLIT)
  // =========================================================================
  function renderGroupTrips() {
    const container = document.getElementById('trips-grid');
    if (!container) return;

    const countEl = document.getElementById('tab-trips-count');
    if (countEl) countEl.textContent = groupTrips.length;

    if (groupTrips.length === 0) {
      container.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; background: var(--co-white); border-radius: var(--radius-lg); border: 1px solid var(--co-border);">
          <h3 style="font-family: var(--font-serif); font-size: 1.4rem; color: var(--co-wine); margin-bottom: 8px;">No open group trips in ${locationData.name}</h3>
          <p style="color: var(--co-charcoal-sub); font-size: 0.9rem;">Be the first to propose a van split outing for fellow colivers!</p>
        </div>
      `;
      return;
    }

    container.innerHTML = groupTrips.map(trip => {
      const dest = destinations.find(d => d.id === trip.destinationId);
      const destName = dest ? dest.name : trip.destinationName || trip.title;
      const count = (trip.currentMembers || []).length;
      const target = trip.targetPax || trip.maxSeats || 8;
      const pct = Math.min(100, Math.round((count / target) * 100));
      const costPerPerson = Math.round((trip.estimatedCostTotal || trip.vanCostTotal || 3000) / Math.max(1, count));
      const totalVan = trip.estimatedCostTotal || trip.vanCostTotal || 3000;
      const isFull = count >= target;

      return `
        <div class="trip-card" data-trip-id="${trip.id}">
          <div class="trip-card-header">
            <div>
              <span class="trip-destination-pill">${destName}</span>
              <h3 class="trip-title">${trip.title}</h3>
              <div class="trip-creator">Proposed by: <strong>${trip.creator}</strong></div>
            </div>
            <span class="trip-date-pill">📅 ${trip.date}</span>
          </div>

          <div>
            <div class="seats-info">
              <span>Spots filled: ${count} of ${target}</span>
              <span style="color: var(--co-terracotta); font-weight: 700;">${isFull ? 'Trip Full!' : `${target - count} spots left`}</span>
            </div>
            <div class="progress-bar-container">
              <div class="progress-bar-fill" style="width: ${pct}%;"></div>
            </div>
          </div>

          <div>
            <span style="font-size: 0.78rem; font-weight: 700; color: var(--co-charcoal-sub); text-transform: uppercase;">Roomies Signed Up:</span>
            <div class="roomies-list">
              ${(trip.currentMembers || []).map(m => `
                <span class="roomie-chip">${m.name} (${m.colivingRoom || m.room || 'Co404'})</span>
              `).join('')}
            </div>
          </div>

          <div class="trip-split-calculator">
            <div>
              <div style="font-size: 0.75rem; color: var(--co-charcoal-sub); font-weight: 600;">Current Split Cost:</div>
              <div class="split-amount">${formatCurrencyValue(costPerPerson, locationData.currency)} / person</div>
            </div>
            <div style="font-size: 0.78rem; text-align: right; color: var(--co-charcoal-sub);">
              Total Van: ${formatCurrencyValue(totalVan, locationData.currency)}
            </div>
          </div>

          <div style="font-size: 0.82rem; color: var(--co-charcoal-sub); font-style: italic;">
            📍 ${trip.pickupNote || trip.notes || `Pick-up at ${locationData.name} entrance`}
          </div>

          <button class="btn ${isFull ? 'btn-secondary' : 'btn-wine'} btn-join-trip" data-trip-id="${trip.id}" ${isFull ? 'disabled' : ''} style="width: 100%;">
            ${isFull ? 'Trip Full' : 'Join this Group Trip'}
          </button>
        </div>
      `;
    }).join('');

    container.querySelectorAll('.btn-join-trip').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const tripId = e.currentTarget.dataset.tripId;
        openJoinTripModal(tripId);
      });
    });
  }

  // Open Join Trip Modal
  function openJoinTripModal(tripId) {
    const trip = groupTrips.find(t => t.id === tripId);
    if (!trip) return;
    document.getElementById('join-trip-id').value = tripId;
    document.getElementById('join-trip-desc').textContent = `You are joining "${trip.title}" scheduled for ${trip.date}. Joining automatically lowers the split cost per person for everyone!`;
    openModal('modal-join-trip');
  }

  // Join form submit
  const formJoinTrip = document.getElementById('form-join-trip');
  if (formJoinTrip) {
    formJoinTrip.addEventListener('submit', (e) => {
      e.preventDefault();
      const tripId = document.getElementById('join-trip-id').value;
      const name = document.getElementById('join-name').value.trim();
      const room = document.getElementById('join-room').value.trim();

      const trip = groupTrips.find(t => t.id === tripId);
      if (trip && name) {
        trip.currentMembers.push({ name, role: 'Resident', colivingRoom: room || 'Co404' });
        localStorage.setItem('co404_group_trips_' + currentLocationId, JSON.stringify(groupTrips));
        closeModal('modal-join-trip');
        formJoinTrip.reset();
        renderGroupTrips();
        showToast(`You're in, ${name}! Your spot is confirmed.`);
      }
    });
  }

  // Open Create Trip Modal
  function openCreateTripModal() {
    const select = document.getElementById('trip-dest-select');
    select.innerHTML = destinations.map(d => `
      <option value="${d.id}">${d.name} (${d.distanceKm} km)</option>
    `).join('');

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 2);
    document.getElementById('trip-date-input').value = tomorrow.toISOString().split('T')[0];

    // Default cost according to city
    const costInput = document.getElementById('trip-cost-total');
    if (costInput) {
      costInput.value = locationData.currency === 'COP' ? 550000 : 3000;
    }

    openModal('modal-create-trip');
  }

  const btnCreateTripMain = document.getElementById('btn-create-trip-main');
  if (btnCreateTripMain) btnCreateTripMain.addEventListener('click', openCreateTripModal);

  const btnQuickNewTrip = document.getElementById('btn-quick-new-trip');
  if (btnQuickNewTrip) btnQuickNewTrip.addEventListener('click', openCreateTripModal);

  // Form Create Trip submit
  const formCreateTrip = document.getElementById('form-create-trip');
  if (formCreateTrip) {
    formCreateTrip.addEventListener('submit', (e) => {
      e.preventDefault();
      const destId = document.getElementById('trip-dest-select').value;
      const dest = destinations.find(d => d.id === destId);
      const title = document.getElementById('trip-title-input').value.trim();
      const date = document.getElementById('trip-date-input').value;
      const pax = parseInt(document.getElementById('trip-pax-target').value, 10) || 6;
      const creatorName = document.getElementById('trip-creator-name').value.trim();
      const creatorRoom = document.getElementById('trip-creator-room').value.trim();
      const defaultCost = locationData.currency === 'COP' ? 500000 : 3000;
      const costTotal = parseInt(document.getElementById('trip-cost-total').value, 10) || defaultCost;
      const notes = document.getElementById('trip-notes-input').value.trim();

      const newTrip = {
        id: `trip-${Date.now()}`,
        destinationId: destId,
        title: title,
        date: date,
        creator: `${creatorName} (${creatorRoom || 'Co404'})`,
        targetPax: pax,
        currentMembers: [
          { name: creatorName, role: 'Organizer', colivingRoom: creatorRoom || 'Co404' }
        ],
        estimatedCostTotal: costTotal,
        pickupNote: notes || `Departure from ${locationData.name} front entrance`
      };

      groupTrips.unshift(newTrip);
      localStorage.setItem('co404_group_trips_' + currentLocationId, JSON.stringify(groupTrips));
      closeModal('modal-create-trip');
      formCreateTrip.reset();
      switchTab('group-trips');
      renderGroupTrips();
      updateTabCounters();
      showToast('New group trip published on Co404 board!');
    });
  }

  // =========================================================================
  // VIEW 4: RENDER COLECTIVOS DIY
  // =========================================================================
  function renderColectivos() {
    const container = document.getElementById('colectivos-list');
    if (!container) return;

    container.innerHTML = colectivos.map(c => `
      <div class="colectivo-card">
        <div class="colectivo-header">
          <div>
            <h3 class="colectivo-title">Transit to ${c.destination}</h3>
            <div style="font-size: 0.82rem; color: var(--co-charcoal-sub);">
              Frequency: ${c.frequency} &bull; Operating Hours: ${c.operatingHours}
            </div>
          </div>
          <div class="colectivo-fare-badge">${c.costMxn}</div>
        </div>

        <div style="margin-bottom: 8px;">
          <span style="font-size: 0.75rem; font-weight: 700; color: var(--co-charcoal-sub); text-transform: uppercase;">Window sign / Route code:</span>
          <div class="sign-badge">${c.signText}</div>
        </div>

        <div class="instructions-box">
          <div style="font-weight: 700; color: var(--co-wine); margin-bottom: 4px;">📍 Where to catch in ${locationData.city}:</div>
          <p style="margin-bottom: 8px;">${c.terminalLocation} <em style="color: var(--co-terracotta);">(${c.distanceFromCo404})</em></p>
          <div style="font-weight: 700; color: var(--co-wine); margin-bottom: 4px;">📝 Step-by-step instructions:</div>
          <p>${c.instructions}</p>
          <div style="margin-top: 8px; font-weight: 600; color: var(--co-charcoal-sub);">
            🔄 Return point at destination: ${c.returnPoint}
          </div>
        </div>

        <div class="pros-cons-grid">
          <div class="pro-item">
            <strong>Co404 Pro Tip:</strong> ${(c.prosCons && c.prosCons.pros) || 'Great budget option.'}
          </div>
          <div class="con-item">
            <strong>Keep in Mind:</strong> ${(c.prosCons && c.prosCons.cons) || 'Plan return before dark.'}
          </div>
        </div>
      </div>
    `).join('');
  }

  // Initial render for active location
  renderDestinations();
  renderAgencies();
  renderGroupTrips();
  renderColectivos();
  updateTabCounters();
});
