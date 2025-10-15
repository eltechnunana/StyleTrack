document.addEventListener('DOMContentLoaded', () => {
  const tbody = document.querySelector('#clientsTable tbody');
  const addBtn = document.getElementById('addClientBtn');
  const modalEl = document.getElementById('measureModal');
  const modal = modalEl ? new bootstrap.Modal(modalEl) : null;
  const titleEl = document.getElementById('measureTitle');
  const emptyEl = document.getElementById('measureEmpty');
  const tableWrap = document.getElementById('measureTableWrap');
  const tableBody = document.getElementById('measureTableBody');
  const openBtn = document.getElementById('openMeasurementsBtn');

  const FIELD_LABELS = {
    'field-height': 'Height',
    'field-neck': 'Neck',
    'field-shoulder': 'Shoulder',
    'field-chest': 'Chest',
    'field-waist': 'Waist',
    'field-hip': 'Hip',
    'field-arm_length': 'Arm Length',
    'field-sleeve_length': 'Sleeve Length',
    'field-back_width': 'Back Width',
    'field-trouser_length': 'Trouser Length',
    'field-thigh': 'Thigh',
    'field-inseam': 'Inseam'
  };
  const ORDERED_FIELDS = Object.keys(FIELD_LABELS);

  function showMeasurements(client) {
    if (!modal) return;
    titleEl.textContent = `Measurements – ${client.name}`;
    tableBody.innerHTML = '';

    const datasets = ['male','female','custom']
      .map(g => ({ gender: g, data: ST.measurements.get(client.id, g) || ST.measurements.get(client.name, g) }))
      .filter(d => !!d.data);

    if (!datasets.length) {
      // Fallback legacy single dataset
      const legacy = ST.measurements.get(client.id) || ST.measurements.get(client.name);
      if (!legacy) { tableWrap.style.display = 'none'; emptyEl.style.display = 'block'; openBtn.href = `index.html?client=${client.id}`; modal.show(); return; }
      datasets.push({ gender: legacy.gender || 'male', data: legacy });
    }

    // Determine latest dataset for default open link
    const latest = datasets.slice().sort((a,b) => new Date(b.data.savedAt || 0) - new Date(a.data.savedAt || 0))[0];
    openBtn.href = `index.html?client=${client.id}&gender=${latest.gender}`;

    tableBody.innerHTML = '';
    emptyEl.style.display = 'none'; tableWrap.style.display = 'block';

    datasets.forEach(({ gender, data }, idx) => {
      const unit = data.unit || 'cm';
      // Section header
      const hdr = document.createElement('tr');
      const h1 = document.createElement('td'); h1.colSpan = 2; h1.innerHTML = `<strong>${gender.charAt(0).toUpperCase() + gender.slice(1)}</strong>`;
      hdr.appendChild(h1);
      tableBody.appendChild(hdr);

      const savedAt = data.savedAt;
      if (savedAt) {
        const tr = document.createElement('tr');
        const td1 = document.createElement('td'); td1.textContent = 'Last Saved';
        const td2 = document.createElement('td'); td2.textContent = new Date(savedAt).toLocaleString();
        tr.append(td1, td2); tableBody.appendChild(tr);
      }
      const notes = (data.notes || '').trim();
      if (notes) {
        const tr = document.createElement('tr');
        const td1 = document.createElement('td'); td1.textContent = 'Notes';
        const td2 = document.createElement('td'); td2.textContent = notes;
        tr.append(td1, td2); tableBody.appendChild(tr);
      }
      ORDERED_FIELDS.forEach(key => {
        const val = data[key] ?? '';
        if (val !== '') {
          const tr = document.createElement('tr');
          const td1 = document.createElement('td'); td1.textContent = FIELD_LABELS[key];
          const td2 = document.createElement('td'); td2.textContent = `${val} ${unit}`;
          tr.append(td1, td2); tableBody.appendChild(tr);
        }
      });
      // Separator between datasets
      if (idx < datasets.length - 1) {
        const sep = document.createElement('tr'); const td = document.createElement('td'); td.colSpan = 2; td.innerHTML = '<hr class="my-2">'; sep.appendChild(td); tableBody.appendChild(sep);
      }
    });

    modal.show();
  }

  function render() {
    const list = ST.clients.all();
    tbody.innerHTML = '';
    if (!list.length) {
      const tr = document.createElement('tr');
      const td = document.createElement('td'); td.colSpan = 2; td.textContent = 'No clients yet.'; td.className = 'text-muted';
      tr.appendChild(td); tbody.appendChild(tr); return;
    }
    list.forEach(c => {
      const tr = document.createElement('tr');
      const nameTd = document.createElement('td');
      const nameLink = document.createElement('a'); nameLink.href = '#'; nameLink.textContent = c.name;
      nameLink.addEventListener('click', (e) => { e.preventDefault(); showMeasurements(c); });
      nameTd.appendChild(nameLink); tr.appendChild(nameTd);
      const actionsTd = document.createElement('td'); actionsTd.className = 'text-end';

      const viewBtn = document.createElement('button'); viewBtn.className = 'btn btn-sm btn-outline-primary me-2'; viewBtn.innerHTML = '<i class="bi bi-eye"></i>';
      viewBtn.addEventListener('click', () => showMeasurements(c));

      const editBtn = document.createElement('button'); editBtn.className = 'btn btn-sm btn-outline-secondary me-2'; editBtn.innerHTML = '<i class="bi bi-pencil"></i>';
      editBtn.addEventListener('click', () => {
        const name = prompt('Edit client name', c.name);
        if (name && name.trim()) { ST.clients.update(c.id, { name: name.trim() }); render(); }
      });

      const delBtn = document.createElement('button'); delBtn.className = 'btn btn-sm btn-outline-danger'; delBtn.innerHTML = '<i class="bi bi-trash"></i>';
      delBtn.addEventListener('click', () => {
        if (confirm(`Delete client "${c.name}"?`)) { ST.clients.remove(c.id); render(); }
      });

      actionsTd.append(viewBtn, editBtn, delBtn); tr.appendChild(actionsTd); tbody.appendChild(tr);
    });
  }

  addBtn.addEventListener('click', () => {
    const name = prompt('New client name');
    if (name && name.trim()) { ST.clients.add(name.trim()); render(); }
  });

  render();
});