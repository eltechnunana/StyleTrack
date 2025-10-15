document.addEventListener('DOMContentLoaded', () => {
  const clientSel = document.getElementById('orderClient');
  const itemInput = document.getElementById('orderItem');
  const dueInput = document.getElementById('orderDue');
  const statusSel = document.getElementById('orderStatus');
  const addBtn = document.getElementById('addOrderBtn');
  const tbody = document.querySelector('#ordersTable tbody');
  const settings = (window.ST && ST.settings && ST.settings.get()) || {};

  // Pricing inputs & totals display elements
  const currencyLabel = document.getElementById('orderCurrencyLabel');
  const unitInput = document.getElementById('orderUnitPrice');
  const qtyInput = document.getElementById('orderQuantity');
  const taxInput = document.getElementById('orderTax');
  const discInput = document.getElementById('orderDiscount');
  const subtotalEl = document.getElementById('orderSubtotal');
  const discountPctEl = document.getElementById('orderDiscountPct');
  const discountAmountEl = document.getElementById('orderDiscountAmount');
  const taxPctEl = document.getElementById('orderTaxPct');
  const taxAmountEl = document.getElementById('orderTaxAmount');
  const totalEl = document.getElementById('orderTotal');

  function formatMoney(amount, currency) {
    const curr = currency || settings.bizCurrency || 'USD';
    try {
      return new Intl.NumberFormat(undefined, { style: 'currency', currency: curr }).format(amount || 0);
    } catch {
      const symbol = curr === 'EUR' ? '€' : curr === 'GBP' ? '£' : curr === 'NGN' ? '₦' : curr === 'GHS' ? 'GH₵' : '$';
      return `${symbol}${(amount || 0).toFixed(2)}`;
    }
  }

  function computeTotals(o) {
    const unit = parseFloat(o.unitPrice || '0') || 0;
    const qty = Math.max(1, parseInt(o.quantity || '1')) || 1;
    const taxPct = Math.max(0, parseFloat(o.taxPct || '0') || 0);
    const discountPct = Math.max(0, parseFloat(o.discountPct || '0') || 0);
    const subtotal = unit * qty;
    const discountAmount = subtotal * (discountPct / 100);
    const taxableBase = subtotal - discountAmount;
    const taxAmount = taxableBase * (taxPct / 100);
    const total = taxableBase + taxAmount;
    return { currency: o.currency || settings.bizCurrency || 'USD', unitPrice: unit, quantity: qty, taxPct, discountPct, subtotal, discountAmount, taxAmount, total };
  }

  function currencySymbol(code) {
    return code === 'EUR' ? '€' : code === 'GBP' ? '£' : code === 'NGN' ? '₦' : code === 'GHS' ? 'GH₵' : '$';
  }

  function updateCardTotals() {
    const currency = settings.bizCurrency || 'USD';
    if (currencyLabel) currencyLabel.textContent = currencySymbol(currency);
    const totals = computeTotals({
      unitPrice: unitInput ? unitInput.value : 0,
      quantity: qtyInput ? qtyInput.value : 1,
      taxPct: taxInput ? taxInput.value : 0,
      discountPct: discInput ? discInput.value : 0,
      currency
    });
    if (discountPctEl) discountPctEl.textContent = String(totals.discountPct || 0);
    if (taxPctEl) taxPctEl.textContent = String(totals.taxPct || 0);
    if (subtotalEl) subtotalEl.textContent = formatMoney(totals.subtotal, currency);
    if (discountAmountEl) discountAmountEl.textContent = formatMoney(totals.discountAmount, currency);
    if (taxAmountEl) taxAmountEl.textContent = formatMoney(totals.taxAmount, currency);
    if (totalEl) totalEl.textContent = formatMoney(totals.total, currency);
  }

  function generateInvoice(order) {
    const { jsPDF } = window.jspdf || {};
    if (!jsPDF) { alert('PDF library not loaded'); return; }
    const doc = new jsPDF();
    const biz = settings;
    const totals = computeTotals(order);
    const clientsById = Object.fromEntries(ST.clients.all().map(c => [c.id, c.name]));
    const clientName = clientsById[order.clientId] || order.clientId || 'Client';
    const invoiceId = order.invoiceId || `INV-${order.id.slice(-6)}`;
    const currency = totals.currency;

    // Header
    doc.setFontSize(18);
    doc.text(String(biz.bizName || 'StyleTrack'), 14, 20);
    doc.setFontSize(11);
    const yBase = 26;
    const contactLines = [biz.bizAddress, biz.bizEmail, biz.bizPhone].filter(Boolean);
    contactLines.forEach((line, idx) => doc.text(String(line), 14, yBase + (idx * 6)));

    // Title & meta
    let y = yBase + (contactLines.length * 6) + 10;
    doc.setFontSize(14);
    doc.text('Invoice', 14, y);
    doc.setFontSize(11);
    y += 8;
    doc.text(`Invoice ID: ${invoiceId}`, 14, y);
    y += 6; doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, y);
    y += 6; doc.text(`Bill To: ${clientName}`, 14, y);

    // Table-form line item
    y += 10;
    const startX = 14;
    const pageW = doc.internal.pageSize.getWidth();
    const rightX = pageW - 14;
    // Column positions
    const colDescX = startX;
    const colQtyX = startX + 95;
    const colUnitX = startX + 120;
    const colLineX = startX + 160;
    // Header
    doc.setFontSize(11);
    doc.setFont(undefined, 'bold');
    doc.text('Description', colDescX, y);
    doc.text('Qty', colQtyX, y);
    doc.text('Unit Price', colUnitX, y);
    doc.text('Line Total', colLineX, y);
    doc.setFont(undefined, 'normal');
    y += 8;
    // Row
    const lineTotal = totals.subtotal;
    doc.text(String(order.item || '—'), colDescX, y);
    doc.text(String(totals.quantity), colQtyX, y);
    doc.text(String(formatMoney(totals.unitPrice, currency)), colUnitX, y);
    doc.text(String(formatMoney(lineTotal, currency)), colLineX, y);
    // Summary
    y += 12;
    doc.setFont(undefined, 'bold');
    doc.text('Subtotal', rightX - 50, y);
    doc.setFont(undefined, 'normal');
    doc.text(String(formatMoney(totals.subtotal, currency)), rightX, y, { align: 'right' });
    y += 6;
    doc.setFont(undefined, 'bold');
    doc.text(`Discount (${totals.discountPct}%)`, rightX - 50, y);
    doc.setFont(undefined, 'normal');
    doc.text(String(formatMoney(totals.discountAmount, currency)), rightX, y, { align: 'right' });
    y += 6;
    doc.setFont(undefined, 'bold');
    doc.text(`Tax (${totals.taxPct}%)`, rightX - 50, y);
    doc.setFont(undefined, 'normal');
    doc.text(String(formatMoney(totals.taxAmount, currency)), rightX, y, { align: 'right' });
    y += 8;
    doc.setFontSize(13);
    doc.setFont(undefined, 'bold');
    doc.text('Total', rightX - 50, y);
    doc.text(String(formatMoney(totals.total, currency)), rightX, y, { align: 'right' });

    // Footer
    y += 12; doc.setFontSize(10);
    doc.text('Thank you for your business!', 14, y);

    const safeName = String(clientName).replace(/[^a-z0-9]/gi, '-');
    doc.save(`invoice-${safeName}-${invoiceId}.pdf`);
  }

  function generateReceipt(order) {
    const { jsPDF } = window.jspdf || {};
    if (!jsPDF) { alert('PDF library not loaded'); return; }
    const doc = new jsPDF();
    const biz = settings;
    const totals = computeTotals(order);
    const clientsById = Object.fromEntries(ST.clients.all().map(c => [c.id, c.name]));
    const clientName = clientsById[order.clientId] || order.clientId || 'Client';
    const receiptId = `RCT-${order.id.slice(-6)}`;
    const currency = totals.currency;

    // Header
    doc.setFontSize(18);
    doc.text(String(biz.bizName || 'StyleTrack'), 14, 20);
    doc.setFontSize(11);
    const yBase = 26;
    const contactLines = [biz.bizAddress, biz.bizEmail, biz.bizPhone].filter(Boolean);
    contactLines.forEach((line, idx) => doc.text(String(line), 14, yBase + (idx * 6)));

    // Title & meta
    let y = yBase + (contactLines.length * 6) + 10;
    doc.setFontSize(14);
    doc.text('Receipt', 14, y);
    doc.setFontSize(11);
    y += 8; doc.text(`Receipt ID: ${receiptId}`, 14, y);
    y += 6; doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, y);
    y += 6; doc.text(`Received From: ${clientName}`, 14, y);

    // Payment details
    y += 10;
    doc.text(`Payment for: ${order.item || '—'}`, 14, y);
    y += 6; doc.text(`Amount: ${formatMoney(totals.total, currency)}`, 14, y);
    y += 10; doc.setFontSize(10);
    doc.text('Payment recorded. No balance due.', 14, y);

    const safeName = String(clientName).replace(/[^a-z0-9]/gi, '-');
    doc.save(`receipt-${safeName}-${receiptId}.pdf`);
  }

  function loadClients() {
    const list = ST.clients.all();
    clientSel.innerHTML = '';
    if (!list.length) {
      const opt = document.createElement('option'); opt.value = ''; opt.textContent = 'No clients'; clientSel.appendChild(opt);
      return;
    }
    list.forEach(c => {
      const opt = document.createElement('option'); opt.value = c.id; opt.textContent = c.name; clientSel.appendChild(opt);
    });
  }

  function renderOrders() {
    const list = ST.orders.all();
    const clientsById = Object.fromEntries(ST.clients.all().map(c => [c.id, c.name]));
    tbody.innerHTML = '';
    if (!list.length) {
      const tr = document.createElement('tr');
      const td = document.createElement('td'); td.colSpan = 6; td.textContent = 'No orders yet.'; td.className = 'text-muted';
      tr.appendChild(td); tbody.appendChild(tr); return;
    }
    list.forEach(o => {
      const tr = document.createElement('tr');
      const ctd = document.createElement('td'); ctd.textContent = clientsById[o.clientId] || o.clientId; tr.appendChild(ctd);
      const itd = document.createElement('td'); itd.textContent = o.item || ''; tr.appendChild(itd);
      const dtd = document.createElement('td'); dtd.textContent = o.dueDate || ''; tr.appendChild(dtd);
      const std = document.createElement('td');
      const statusSelect = document.createElement('select'); statusSelect.className = 'form-select form-select-sm';
      ['pending','in_progress','ready','delivered'].forEach(s => {
        const opt = document.createElement('option'); opt.value = s; opt.textContent = s.replace('_',' ');
        if (o.status === s) opt.selected = true; statusSelect.appendChild(opt);
      });
      statusSelect.addEventListener('change', () => { ST.orders.update(o.id, { status: statusSelect.value }); });
      std.appendChild(statusSelect); tr.appendChild(std);

      const amt = computeTotals(o);
      const amtTd = document.createElement('td'); amtTd.textContent = formatMoney(amt.total, amt.currency); tr.appendChild(amtTd);

      const atd = document.createElement('td'); atd.className = 'text-end';
      const invBtn = document.createElement('button'); invBtn.className = 'btn btn-sm btn-outline-primary me-2'; invBtn.innerHTML = '<i class="bi bi-file-earmark-text me-1"></i>Invoice';
      invBtn.addEventListener('click', () => generateInvoice(o));
      const rctBtn = document.createElement('button'); rctBtn.className = 'btn btn-sm btn-outline-success me-2'; rctBtn.innerHTML = '<i class="bi bi-receipt me-1"></i>Receipt';
      rctBtn.addEventListener('click', () => generateReceipt(o));
      const delBtn = document.createElement('button'); delBtn.className = 'btn btn-sm btn-outline-danger'; delBtn.innerHTML = '<i class="bi bi-trash"></i>';
      delBtn.addEventListener('click', () => { if (confirm('Delete order?')) { ST.orders.remove(o.id); renderOrders(); } });
      atd.append(invBtn, rctBtn, delBtn); tr.appendChild(atd);

      tbody.appendChild(tr);
    });
  }

  addBtn.addEventListener('click', () => {
    const clientId = clientSel.value;
    if (!clientId) { alert('Select a client'); return; }
    const item = itemInput.value.trim();
    const dueDate = dueInput.value;
    const status = statusSel.value;
    const currency = settings.bizCurrency || 'USD';
    const unitPrice = unitInput ? parseFloat(unitInput.value || '0') || 0 : 0;
    const quantity = qtyInput ? Math.max(1, parseInt(qtyInput.value || '1')) || 1 : 1;
    const taxPct = taxInput ? Math.max(0, parseFloat(taxInput.value || '0') || 0) : 0;
    const discountPct = discInput ? Math.max(0, parseFloat(discInput.value || '0') || 0) : 0;
    ST.orders.add({ clientId, item, dueDate, status, unitPrice, quantity, taxPct, discountPct, currency });
    itemInput.value = ''; dueInput.value = ''; statusSel.value = 'pending';
    if (unitInput) unitInput.value = '0';
    if (qtyInput) qtyInput.value = '1';
    if (taxInput) taxInput.value = String(settings.bizDefaultTax || 0);
    if (discInput) discInput.value = '0';
    updateCardTotals();
    renderOrders();
  });

  loadClients();
  renderOrders();

  // Initialize pricing defaults and totals
  if (typeof settings.bizDefaultTax !== 'undefined' && taxInput) {
    taxInput.value = String(settings.bizDefaultTax);
  }
  updateCardTotals();
  [unitInput, qtyInput, taxInput, discInput].forEach(el => {
    if (el) el.addEventListener('input', updateCardTotals);
  });
});