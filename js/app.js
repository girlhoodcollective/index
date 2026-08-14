(function () {
  'use strict';

  const state = {
    searchQuery: '',
    activeNeighborhoods: [], // empty = "All"
    selectedCategory: 'All Specialties',
  };

  // ---------- Tabs ----------

  const tabB2b = document.getElementById('tab-b2b');
  const tabPublic = document.getElementById('tab-public');
  const b2bView = document.getElementById('b2b-view');
  const publicView = document.getElementById('public-view');

  function switchView(view) {
    const showB2b = view === 'b2b';

    b2bView.hidden = !showB2b;
    b2bView.classList.toggle('active', showB2b);
    publicView.hidden = showB2b;
    publicView.classList.toggle('active', !showB2b);

    tabB2b.classList.toggle('active', showB2b);
    tabB2b.setAttribute('aria-selected', String(showB2b));
    tabB2b.tabIndex = showB2b ? 0 : -1;

    tabPublic.classList.toggle('active', !showB2b);
    tabPublic.setAttribute('aria-selected', String(!showB2b));
    tabPublic.tabIndex = showB2b ? -1 : 0;
  }

  tabB2b.addEventListener('click', () => switchView('b2b'));
  tabPublic.addEventListener('click', () => switchView('public'));

  [tabB2b, tabPublic].forEach((tab) => {
    tab.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        e.preventDefault();
        const other = tab === tabB2b ? tabPublic : tabB2b;
        other.focus();
        other.click();
      }
    });
  });

  // ---------- B2B partner table ----------

  function renderTable() {
    const tbody = document.getElementById('partner-table-body');
    tbody.innerHTML = PARTNERS.map((p) => `
      <tr>
        <td>
          <div class="practice-cell">${p.practiceName}<span class="founder-name">${p.providerName}${p.credentials ? ', ' + p.credentials : ''}</span></div>
        </td>
        <td class="contact-cell">${p.phone}<br>${p.email}</td>
        <td>${p.idealClientProfile}</td>
        <td>${p.referralTriggers}</td>
        <td>${p.referOutFor}</td>
        <td>${p.neighborhoods.join(', ')}</td>
      </tr>
    `).join('');
  }

  document.getElementById('kpi-count').textContent = String(PARTNERS.length);

  // ---------- Public directory: filters ----------

  function renderPills() {
    const container = document.getElementById('filter-pills');
    container.innerHTML = NEIGHBORHOOD_PILLS.map((label) => {
      const isAll = label === 'All';
      const isActive = isAll ? state.activeNeighborhoods.length === 0 : state.activeNeighborhoods.includes(label);
      return `<button type="button" class="pill${isActive ? ' active' : ''}" data-neighborhood="${label}" aria-pressed="${isActive}">${label}</button>`;
    }).join('');

    container.querySelectorAll('.pill').forEach((btn) => {
      btn.addEventListener('click', () => {
        const label = btn.dataset.neighborhood;
        if (label === 'All') {
          state.activeNeighborhoods = [];
        } else {
          const idx = state.activeNeighborhoods.indexOf(label);
          if (idx > -1) {
            state.activeNeighborhoods.splice(idx, 1);
          } else {
            state.activeNeighborhoods.push(label);
          }
        }
        renderPills();
        renderCards();
      });
    });
  }

  function renderCategorySelect() {
    const select = document.getElementById('category-select');
    select.innerHTML = CATEGORY_OPTIONS.map((opt) => `<option value="${opt}">${opt}</option>`).join('');
    select.value = state.selectedCategory;
    select.addEventListener('change', () => {
      state.selectedCategory = select.value;
      renderCards();
    });
  }

  document.getElementById('search-input').addEventListener('input', (e) => {
    state.searchQuery = e.target.value.trim().toLowerCase();
    renderCards();
  });

  function filteredPartners() {
    return PARTNERS.filter((p) => {
      const matchesSearch = !state.searchQuery ||
        p.practiceName.toLowerCase().includes(state.searchQuery) ||
        p.providerName.toLowerCase().includes(state.searchQuery) ||
        p.categoryTag.toLowerCase().includes(state.searchQuery) ||
        p.bio.toLowerCase().includes(state.searchQuery);

      const matchesNeighborhood = state.activeNeighborhoods.length === 0 ||
        state.activeNeighborhoods.includes(p.neighborhoodGroup);

      const matchesCategory = state.selectedCategory === 'All Specialties' ||
        p.category === state.selectedCategory;

      return matchesSearch && matchesNeighborhood && matchesCategory;
    });
  }

  function renderCards() {
    const grid = document.getElementById('directory-grid');
    const results = filteredPartners();

    document.getElementById('results-count').textContent =
      `${results.length} verified partner${results.length === 1 ? '' : 's'}`;

    if (results.length === 0) {
      grid.innerHTML = '<p class="no-results">No partners match your search. Try clearing a filter.</p>';
      return;
    }

    grid.innerHTML = results.map((p) => `
      <article class="partner-card">
        <div class="card-avatar" aria-hidden="true">${p.initials}</div>
        <div class="card-content">
          <h3 class="card-practice-name">${p.practiceName}</h3>
          <p class="card-founder">${p.providerName}${p.credentials ? ', ' + p.credentials : ''}</p>
          <div class="card-tags">
            <span class="tag">${p.categoryTag}</span>
            <span class="tag tag-neighborhood">${p.neighborhoodGroup}</span>
          </div>
          <p class="card-bio">${p.bio}</p>
          <div class="card-seal">&check; Verified Village Partner</div>
          <div class="card-actions">
            <button type="button" class="btn-view-profile" data-id="${p.id}">View Full Profile</button>
            <button type="button" class="btn-visit-website" data-id="${p.id}">Visit Website</button>
          </div>
        </div>
      </article>
    `).join('');

    grid.querySelectorAll('.btn-view-profile').forEach((btn) => {
      btn.addEventListener('click', () => openProfileModal(btn.dataset.id));
    });
    grid.querySelectorAll('.btn-visit-website').forEach((btn) => {
      btn.addEventListener('click', () => {
        const partner = PARTNERS.find((p) => p.id === btn.dataset.id);
        if (partner && partner.website) {
          window.open(partner.website, '_blank', 'noopener');
        } else {
          showToast('No live website on file for this sample listing yet.');
        }
      });
    });
  }

  // ---------- Modal ----------

  const modalOverlay = document.getElementById('modal-overlay');
  const modalBody = document.getElementById('modal-body');
  const modalClose = document.getElementById('modal-close');
  let lastFocusedElement = null;

  function openModal(html) {
    lastFocusedElement = document.activeElement;
    modalBody.innerHTML = html;
    modalOverlay.hidden = false;
    modalClose.focus();
  }

  function closeModal() {
    modalOverlay.hidden = true;
    modalBody.innerHTML = '';
    if (lastFocusedElement) {
      lastFocusedElement.focus();
    }
  }

  modalClose.addEventListener('click', closeModal);
  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) closeModal();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !modalOverlay.hidden) closeModal();
  });

  function openProfileModal(id) {
    const p = PARTNERS.find((partner) => partner.id === id);
    if (!p) return;

    openModal(`
      <h3 id="modal-title">${p.practiceName}</h3>
      <p class="modal-founder">${p.providerName}${p.credentials ? ', ' + p.credentials : ''} &bull; ${p.neighborhoods.join(', ')}</p>
      <p class="card-bio">${p.bio}</p>
      <dl>
        <dt>Ideal Client Profile</dt>
        <dd>${p.idealClientProfile}</dd>
        <dt>Send Families When...</dt>
        <dd>${p.referralTriggers}</dd>
        <dt>Refers Out For</dt>
        <dd>${p.referOutFor}</dd>
        <dt>Contact</dt>
        <dd>${p.phone}<br>${p.email}</dd>
      </dl>
    `);
  }

  document.getElementById('open-promo-request').addEventListener('click', () => {
    openModal(`
      <h3 id="modal-title">Submit Monthly Promo Request</h3>
      <p class="modal-founder">Share what you'd like the Village Network to promote this month.</p>
      <form class="promo-form" id="promo-form">
        <label for="promo-practice">Practice Name</label>
        <input type="text" id="promo-practice" required>
        <label for="promo-details">Promo Details</label>
        <textarea id="promo-details" required></textarea>
        <button type="submit" class="btn-primary">Submit Request</button>
      </form>
    `);

    document.getElementById('promo-form').addEventListener('submit', (e) => {
      e.preventDefault();
      closeModal();
      showToast('Request captured. Connect this form to a backend to submit it for real.');
    });
  });

  // ---------- Download contact sheet ----------

  document.getElementById('download-contact-sheet').addEventListener('click', () => {
    const lines = [
      'Village Partner Network — Contact Sheet',
      `Generated ${new Date().toLocaleDateString()}`,
      '',
      ...PARTNERS.map((p) => [
        `${p.practiceName} — ${p.providerName}${p.credentials ? ', ' + p.credentials : ''}`,
        `  Phone: ${p.phone}`,
        `  Email: ${p.email}`,
        `  Neighborhoods: ${p.neighborhoods.join(', ')}`,
        '',
      ].join('\n')),
    ];

    const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'village-partner-contact-sheet.txt';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  });

  // ---------- Toast ----------

  let toastTimer = null;
  function showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.hidden = true;
    }, 4000);
  }

  // ---------- Init ----------

  renderTable();
  renderPills();
  renderCategorySelect();
  renderCards();
})();
