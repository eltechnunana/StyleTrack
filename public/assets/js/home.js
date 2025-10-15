/* Home dashboard interactivity and data rendering */
(function () {
  let charts = { status: null, weekly: null };
  function countMeasurements() {
    try {
      let count = 0;
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('measurements:')) count++;
      }
      return count;
    } catch (e) {
      return 0;
    }
  }

  function renderCounts() {
    const clients = (window.ST && ST.clients && ST.clients.all()) || [];
    const orders = (window.ST && ST.orders && ST.orders.all()) || [];
    const measurements = countMeasurements();

    const pending = orders.filter(o => (o.status || 'pending') === 'pending').length;
    // Treat 'delivered' as completed (and support legacy 'completed')
    const completed = orders.filter(o => o.status === 'delivered' || o.status === 'completed').length;

    document.getElementById('countClients')?.replaceChildren(document.createTextNode(String(clients.length)));
    document.getElementById('countOrdersPending')?.replaceChildren(document.createTextNode(String(pending)));
    document.getElementById('countOrdersCompleted')?.replaceChildren(document.createTextNode(String(completed)));
    document.getElementById('countMeasurements')?.replaceChildren(document.createTextNode(String(measurements)));
  }

  function renderRecentOrders() {
    const list = document.getElementById('recentOrders');
    if (!list) return;
    const orders = (window.ST && ST.orders && ST.orders.all()) || [];
    const clients = (window.ST && ST.clients && ST.clients.all()) || [];
    const clientsById = Object.fromEntries(clients.map(c => [c.id, c.name]));
    const recent = orders
      .slice()
      .sort((a, b) => (b.updatedAt || b.createdAt || 0) - (a.updatedAt || a.createdAt || 0))
      .slice(0, 5);

    list.innerHTML = '';
    if (recent.length === 0) {
      const li = document.createElement('li');
      li.className = 'list-group-item';
      li.textContent = 'No recent orders';
      list.appendChild(li);
      return;
    }

    recent.forEach(o => {
      const li = document.createElement('li');
      li.className = 'list-group-item d-flex justify-content-between align-items-center';
      const clientName = clientsById[o.clientId] || o.clientName || 'Unknown client';
      const title = `${o.item || o.title || 'Order'} — ${clientName}`;
      const badge = document.createElement('span');
      const status = o.status || 'pending';
      const badgeClass = status === 'delivered'
        ? 'bg-success'
        : status === 'ready'
        ? 'bg-primary'
        : status === 'in_progress'
        ? 'bg-warning text-dark'
        : 'bg-secondary';
      badge.className = `badge ${badgeClass}`;
      badge.textContent = status.replace('_', ' ');
      li.textContent = title;
      li.appendChild(badge);
      list.appendChild(li);
    });
  }

  function ordersByStatusCounts(orders) {
    const statuses = ['pending','in_progress','ready','delivered'];
    const counts = Object.fromEntries(statuses.map(s => [s, 0]));
    orders.forEach(o => { const s = o.status || 'pending'; counts[s] = (counts[s] || 0) + 1; });
    return { statuses, counts };
  }

  function weeklyOrderCounts(orders) {
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(); d.setDate(d.getDate() - (6 - i));
      d.setHours(0,0,0,0);
      return d;
    });
    const labels = days.map(d => d.toLocaleDateString(undefined, { weekday: 'short' }));
    const values = days.map(d => {
      const next = new Date(d); next.setDate(next.getDate() + 1);
      return orders.filter(o => {
        const t = new Date(o.createdAt || Date.now());
        return t >= d && t < next;
      }).length;
    });
    return { labels, values };
  }

  function renderMiniCharts() {
    if (!(window.Chart)) return; // Chart.js not loaded
    const orders = (window.ST && ST.orders && ST.orders.all()) || [];

    // Status doughnut
    const statusEl = document.getElementById('chartOrdersStatus');
    if (statusEl) {
      const { statuses, counts } = ordersByStatusCounts(orders);
      const data = statuses.map(s => counts[s] || 0);
      const colors = ['#6c757d', '#f1c40f', '#0d6efd', '#198754'];
      charts.status?.destroy?.();
      charts.status = new Chart(statusEl.getContext('2d'), {
        type: 'doughnut',
        data: {
          labels: statuses.map(s => s.replace('_',' ')),
          datasets: [{ data, backgroundColor: colors }]
        },
        options: {
          plugins: { legend: { position: 'bottom' } },
          responsive: true,
          maintainAspectRatio: false
        }
      });
    }

    // Weekly sparkline
    const weeklyEl = document.getElementById('chartOrdersWeekly');
    if (weeklyEl) {
      const { labels, values } = weeklyOrderCounts(orders);
      charts.weekly?.destroy?.();
      charts.weekly = new Chart(weeklyEl.getContext('2d'), {
        type: 'line',
        data: {
          labels,
          datasets: [{
            data: values,
            borderColor: '#0d6efd',
            backgroundColor: 'rgba(13,110,253,0.15)',
            tension: 0.3,
            fill: true,
            pointRadius: 2
          }]
        },
        options: {
          plugins: { legend: { display: false } },
          scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } },
          responsive: true,
          maintainAspectRatio: false
        }
      });
    }
  }

  function setupCardNavigation() {
    document.querySelectorAll('.card[data-target]')?.forEach(card => {
      card.addEventListener('click', () => {
        const target = card.getAttribute('data-target');
        if (target) window.location.href = target;
      });
    });
  }

  function setupQuickSearch() {
    const input = document.getElementById('clientSearchInput');
    const results = document.getElementById('clientSearchResults');
    if (!input || !results) return;
    const clients = (window.ST && ST.clients && ST.clients.all()) || [];

    function render(items) {
      results.innerHTML = '';
      if (items.length === 0) {
        const empty = document.createElement('div');
        empty.className = 'list-group-item text-muted';
        empty.textContent = 'No matches';
        results.appendChild(empty);
        return;
      }
      items.slice(0, 8).forEach(c => {
        const a = document.createElement('a');
        a.className = 'list-group-item list-group-item-action';
        a.href = `index.html?client=${encodeURIComponent(c.id)}`;
        a.textContent = `${c.name || 'Unnamed'}${c.phone ? ' · ' + c.phone : ''}`;
        results.appendChild(a);
      });
    }

    input.addEventListener('input', () => {
      const q = input.value.trim().toLowerCase();
      if (!q) {
        results.innerHTML = '';
        return;
      }
      const matched = clients.filter(c => {
        const s = `${c.name || ''} ${c.phone || ''} ${c.email || ''}`.toLowerCase();
        return s.includes(q);
      });
      render(matched);
    });
  }

  function setYear() {
    const el = document.getElementById('year');
    if (el) el.textContent = String(new Date().getFullYear());
  }

  function setupQuickOrderModal() {
    const clientSel = document.getElementById('quickOrderClient');
    const itemInput = document.getElementById('quickOrderItem');
    const dueInput = document.getElementById('quickOrderDue');
    const statusSel = document.getElementById('quickOrderStatus');
    const saveBtn = document.getElementById('quickOrderSaveBtn');
    // Pricing fields
    const unitPriceInput = document.getElementById('quickOrderUnitPrice');
    const qtyInput = document.getElementById('quickOrderQty');
    const taxPctInput = document.getElementById('quickOrderTaxPct');
    const discountPctInput = document.getElementById('quickOrderDiscountPct');
    const subtotalEl = document.getElementById('quickOrderSubtotal');
    const discountEl = document.getElementById('quickOrderDiscount');
    const taxEl = document.getElementById('quickOrderTax');
    const totalEl = document.getElementById('quickOrderTotal');
    const currencyLabel = document.getElementById('quickOrderCurrencyLabel');
    if (!clientSel || !saveBtn) return;

    function loadClients() {
      const clients = (window.ST && ST.clients && ST.clients.all()) || [];
      clientSel.innerHTML = '';
      if (!clients.length) {
        const opt = document.createElement('option'); opt.value = ''; opt.textContent = 'No clients'; clientSel.appendChild(opt);
        return;
      }
      clients.forEach(c => { const opt = document.createElement('option'); opt.value = c.id; opt.textContent = c.name; clientSel.appendChild(opt); });
    }

    function formatMoney(amount, currency) {
      try {
        return new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(amount || 0);
      } catch {
        // Fallback: prefix symbol if known
        const symbol = currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : currency === 'NGN' ? '₦' : currency === 'GHS' ? 'GH₵' : '$';
        return `${symbol}${(amount || 0).toFixed(2)}`;
      }
    }

    function computeTotals() {
      const s = (window.ST && ST.settings && ST.settings.get()) || {};
      const currency = s.bizCurrency || 'USD';
      const unit = parseFloat(unitPriceInput?.value || '0') || 0;
      const qty = Math.max(1, parseInt(qtyInput?.value || '1')) || 1;
      const taxPct = Math.max(0, parseFloat(taxPctInput?.value || '0') || 0);
      const discountPct = Math.max(0, parseFloat(discountPctInput?.value || '0') || 0);
      const subtotal = unit * qty;
      const discountAmount = subtotal * (discountPct / 100);
      const taxableBase = subtotal - discountAmount;
      const taxAmount = taxableBase * (taxPct / 100);
      const total = taxableBase + taxAmount;
      if (subtotalEl) subtotalEl.textContent = formatMoney(subtotal, currency);
      if (discountEl) discountEl.textContent = formatMoney(discountAmount, currency);
      if (taxEl) taxEl.textContent = formatMoney(taxAmount, currency);
      if (totalEl) totalEl.textContent = formatMoney(total, currency);
      return { currency, unitPrice: unit, quantity: qty, taxPct, discountPct, subtotal, discountAmount, taxAmount, total };
    }

    // Recompute on input changes
    [unitPriceInput, qtyInput, taxPctInput, discountPctInput].forEach(el => {
      el?.addEventListener('input', computeTotals);
    });

    saveBtn.addEventListener('click', () => {
      const clientId = clientSel.value;
      if (!clientId) { alert('Select a client'); return; }
      const item = itemInput.value.trim();
      const dueDate = dueInput.value;
      const status = statusSel.value || 'pending';
      const totals = computeTotals();
      ST.orders.add({ clientId, item, dueDate, status, ...totals });
      // reset form
      itemInput.value = ''; dueInput.value = ''; statusSel.value = 'pending';
      if (unitPriceInput) unitPriceInput.value = '';
      if (qtyInput) qtyInput.value = '';
      if (taxPctInput) taxPctInput.value = '';
      if (discountPctInput) discountPctInput.value = '';
      computeTotals();
      // update dashboard
      renderCounts();
      renderRecentOrders();
      renderMiniCharts();
      // close modal
      const modalEl = document.getElementById('newOrderModal');
      if (modalEl) { const modal = bootstrap.Modal.getOrCreateInstance(modalEl); modal.hide(); }
    });

    // Load clients when modal opens to keep list fresh
    const modalEl = document.getElementById('newOrderModal');
    if (modalEl) {
      modalEl.addEventListener('shown.bs.modal', () => {
        loadClients();
        // Initialize currency label and default tax from settings
        const s = (window.ST && ST.settings && ST.settings.get()) || {};
        const currency = s.bizCurrency || 'USD';
        const symbol = currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : currency === 'NGN' ? '₦' : currency === 'GHS' ? 'GH₵' : '$';
        if (currencyLabel) currencyLabel.textContent = symbol;
        if (taxPctInput) taxPctInput.value = s.defaultTaxPct != null ? String(s.defaultTaxPct) : '';
        computeTotals();
      });
    }
  }

  function applyTheme(theme) {
    const root = document.documentElement;
    if (theme === 'dark') root.classList.add('dark'); else root.classList.remove('dark');
  }

  function setupThemeToggle() {
    const btn = document.getElementById('themeToggle');
    if (!btn || !window.ST) return;
    const setIcon = () => {
      const isDark = document.documentElement.classList.contains('dark');
      btn.innerHTML = isDark ? '<i class="bi bi-brightness-high"></i>' : '<i class="bi bi-moon"></i>';
    };
    // Initialize icon from current theme
    setIcon();
    btn.addEventListener('click', () => {
      const s = ST.settings.get();
      const isDark = document.documentElement.classList.contains('dark');
      const next = isDark ? 'light' : 'dark';
      applyTheme(next);
      ST.settings.save({ ...s, theme: next });
      setIcon();
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    renderCounts();
    renderRecentOrders();
    renderMiniCharts();
    setupCardNavigation();
    setupQuickSearch();
    setYear();
    setupQuickOrderModal();
    setupThemeToggle();
  });
})();