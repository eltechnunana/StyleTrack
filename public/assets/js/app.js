(() => {
  const CM_PER_INCH = 2.54;
  const unitToggle = document.getElementById('unitToggle');
  const unitLabel = document.getElementById('unitLabel');
  const themeToggle = document.getElementById('themeToggle');
  const clientSelect = document.getElementById('clientSelect');
  const addClientBtn = document.getElementById('addClientBtn');
  const saveBtn = document.getElementById('saveBtn');
  const clearBtn = document.getElementById('clearBtn');
  const saveBtnMobile = document.getElementById('saveBtnMobile');
  const clearBtnMobile = document.getElementById('clearBtnMobile');
  // Simplified visual: always show SVG silhouette; no external image

  const partToField = {
    'part-neck': 'field-neck',
    'part-shoulders': 'field-shoulder',
    'part-chest': 'field-chest',
    'part-waist': 'field-waist',
    'part-hips': 'field-hip',
    'part-arm-left': 'field-arm_length',
    'part-arm-right': 'field-arm_length',
    'part-thigh-left': 'field-thigh',
    'part-thigh-right': 'field-thigh',
    'part-inseam': 'field-inseam'
  };

  const labelIds = {
    'field-neck': 'label-neck',
    'field-shoulder': 'label-shoulders',
    'field-chest': 'label-chest',
    'field-waist': 'label-waist',
    'field-hip': 'label-hips',
    'field-arm_length': 'label-arm',
    'field-thigh': 'label-thigh',
    'field-inseam': 'label-inseam'
  };

  const inputs = [
    'field-height','field-neck','field-shoulder','field-chest','field-waist','field-hip',
    'field-arm_length','field-sleeve_length','field-back_width','field-trouser_length','field-thigh','field-inseam'
  ].map(id => document.getElementById(id));

  // Gender-specific field templates (recommended subsets)
  const FIELD_TEMPLATES = {
    male: ['field-height','field-neck','field-shoulder','field-chest','field-waist','field-hip','field-arm_length','field-sleeve_length','field-back_width','field-trouser_length','field-thigh','field-inseam'],
    female: ['field-height','field-neck','field-shoulder','field-chest','field-waist','field-hip','field-arm_length','field-sleeve_length','field-back_width','field-trouser_length','field-inseam'],
    custom: ['field-height','field-neck','field-shoulder','field-chest','field-waist','field-hip','field-arm_length','field-sleeve_length','field-back_width','field-trouser_length','field-inseam']
  };

  function applyFieldTemplate() {
    const onlyRelevant = document.getElementById('genderFieldsOnlyToggle')?.checked;
    const selectedGender = document.querySelector('input[name="gender"]:checked')?.value || 'male';
    const visibleSet = (onlyRelevant && FIELD_TEMPLATES[selectedGender]) ? new Set(FIELD_TEMPLATES[selectedGender]) : null;
    inputs.forEach(input => {
      if (!input) return;
      const wrap = input.closest('.col-6') || input.parentElement;
      if (!wrap) return;
      if (!visibleSet) {
        wrap.style.display = '';
      } else {
        wrap.style.display = visibleSet.has(input.id) ? '' : 'none';
      }
    });
  }

  document.querySelectorAll('#mannequin .mannequin-part').forEach(el => {
    el.addEventListener('click', () => {
      document.querySelectorAll('#mannequin .mannequin-part').forEach(p => p.classList.remove('active'));
      el.classList.add('active');
      const fieldId = partToField[el.id];
      if (!fieldId) return;
      const field = document.getElementById(fieldId);
      if (field) {
        field.focus();
        field.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
  });

  inputs.forEach(input => {
    input?.addEventListener('input', () => {
      const labelId = labelIds[input.id];
      if (labelId) {
        const label = document.getElementById(labelId);
        if (label) {
          const unit = unitToggle.checked ? 'in' : 'cm';
          label.textContent = `${label.textContent.split(':')[0].split(' ')[0]}: ${input.value || 0} ${unit}`;
        }
      }
      updateSuggestions();
    });
  });

  function updateSuggestions() {
    const height = parseFloat(document.getElementById('field-height').value || '0');
    const chest = parseFloat(document.getElementById('field-chest').value || '0');
    const waist = parseFloat(document.getElementById('field-waist').value || '0');
    const unit = unitToggle.checked ? 'in' : 'cm';

    const shoulderSuggest = chest ? chest * 0.27 : (height ? height * 0.18 : 0);
    const waistSuggest = chest ? chest * 0.85 : 0;
    const trouserSuggest = height ? height * 0.45 : 0;

    setSuggest('suggest-shoulder', shoulderSuggest, unit);
    setSuggest('suggest-waist', waistSuggest, unit);
    setSuggest('suggest-trouser_length', trouserSuggest, unit);
  }

  function setSuggest(id, value, unit) {
    const el = document.getElementById(id);
    if (!el) return;
    if (!value) { el.textContent = ''; return; }
    el.textContent = `Suggestion: ${value.toFixed(1)} ${unit}`;
  }

  unitToggle.addEventListener('change', () => {
    const toInches = unitToggle.checked;
    unitLabel.textContent = toInches ? 'in' : 'cm';
    document.querySelectorAll('.unit-badge').forEach(b => b.textContent = toInches ? 'in' : 'cm');
    convertAllFields(toInches ? 'in' : 'cm');
    updateSuggestions();
    Object.values(labelIds).forEach(id => {
      const label = document.getElementById(id);
      if (!label) return;
      const parts = label.textContent.split(':');
      if (parts.length === 2) {
        const valPart = parts[1].trim().split(' ');
        const value = parseFloat(valPart[0] || '0');
        label.textContent = `${parts[0]}: ${value || 0} ${toInches ? 'in' : 'cm'}`;
      }
    });
  });

  function convertAllFields(targetUnit) {
    inputs.forEach(input => {
      if (!input || input.value === '') return;
      const val = parseFloat(input.value);
      if (Number.isNaN(val)) return;
      const isInches = unitToggle.checked;
      const currentUnit = isInches ? 'in' : 'cm';
      if (currentUnit === targetUnit) return;
      input.value = currentUnit === 'cm' ? (val / CM_PER_INCH).toFixed(1) : (val * CM_PER_INCH).toFixed(1);
    });
  }

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const root = document.documentElement;
      const isDark = root.classList.toggle('dark');
      themeToggle.innerHTML = isDark ? '<i class="bi bi-brightness-high"></i>' : '<i class="bi bi-moon"></i>';
    });
  }

  // Gender radios remain for form semantics, but no image toggle

  const defaultClients = ['Alice Johnson', 'Ben Thomas', 'Chris Lee'];
  defaultClients.forEach(name => {
    const opt = document.createElement('option');
    opt.value = name; opt.textContent = name; clientSelect.appendChild(opt);
  });

  addClientBtn.addEventListener('click', () => {
    const name = prompt('Enter client name');
    if (!name) return;
    const opt = document.createElement('option');
    opt.value = name; opt.textContent = name; clientSelect.appendChild(opt);
    clientSelect.value = name;
  });

  function getMeasurements() {
    const data = {};
    inputs.forEach(input => { if (input) data[input.id] = input.value; });
    data.unit = unitToggle.checked ? 'in' : 'cm';
    data.gender = document.querySelector('input[name="gender"]:checked')?.value || 'male';
    const notesEl = document.getElementById('field-notes');
    data.notes = notesEl ? notesEl.value : '';
    return data;
  }

  function setMeasurements(data) {
    if (!data) return;
    const toUnit = data.unit || 'cm';
    const wantUnit = unitToggle.checked ? 'in' : 'cm';
    inputs.forEach(input => {
      if (!input) return;
      let val = data[input.id] || '';
      if (val !== '') {
        const num = parseFloat(val);
        if (toUnit !== wantUnit) {
          val = toUnit === 'cm' ? (num / CM_PER_INCH).toFixed(1) : (num * CM_PER_INCH).toFixed(1);
        }
      }
      input.value = val;
    });
    updateSuggestions();
  }

  function persistMeasurements() {
    const client = clientSelect.value || 'default';
    const data = getMeasurements();
    data.savedAt = new Date().toISOString();
    const gender = data.gender || 'male';
    if (window.ST && ST.measurements) {
      ST.measurements.save(client, data, gender);
    } else {
      // fallback legacy save
      localStorage.setItem(`measurements:${client}|${gender}`, JSON.stringify(data));
    }
    toast(`Measurements saved for ${gender}`);
  }

  function loadMeasurements() {
    const client = clientSelect.value || 'default';
    const selectedGender = document.querySelector('input[name="gender"]:checked')?.value || 'male';
    let data = null;
    if (window.ST && ST.measurements) {
      data = ST.measurements.get(client, selectedGender);
      // If none for selected gender, try latest to avoid empty UI
      if (!data) {
        const latest = ST.measurements.getLatest(client);
        if (latest) {
          data = latest.data;
          const gRadio = document.querySelector(`input[name="gender"][value="${latest.gender}"]`);
          if (gRadio) gRadio.checked = true;
        }
      }
    } else {
      const raw = localStorage.getItem(`measurements:${client}|${selectedGender}`) || localStorage.getItem(`measurements:${client}`);
      data = raw ? JSON.parse(raw) : null;
    }
    if (data) {
      setMeasurements(data);
      const notesEl = document.getElementById('field-notes');
      if (notesEl) notesEl.value = data.notes || '';
    } else {
      // Clear if no data for selection
      inputs.forEach(i => { if (i) i.value = ''; });
      const notesEl = document.getElementById('field-notes'); if (notesEl) notesEl.value = '';
      updateSuggestions();
    }
  }

  clientSelect.addEventListener('change', () => { loadMeasurements(); applyFieldTemplate(); });
  document.querySelectorAll('input[name="gender"]').forEach(r => r.addEventListener('change', () => { loadMeasurements(); applyFieldTemplate(); }));
  const genderFieldsOnlyToggle = document.getElementById('genderFieldsOnlyToggle');
  if (genderFieldsOnlyToggle) genderFieldsOnlyToggle.addEventListener('change', applyFieldTemplate);
  saveBtn.addEventListener('click', persistMeasurements);
  saveBtnMobile.addEventListener('click', persistMeasurements);

  function clearAll() {
    inputs.forEach(i => { if (i) i.value = ''; });
    Object.values(labelIds).forEach(id => {
      const label = document.getElementById(id);
      if (label) label.textContent = label.textContent.split(':')[0];
    });
    updateSuggestions();
  }
  clearBtn.addEventListener('click', clearAll);
  clearBtnMobile.addEventListener('click', clearAll);

  document.getElementById('addCustomField').addEventListener('click', () => {
    const wrap = document.getElementById('customFields');
    const row = document.createElement('div');
    row.className = 'input-group mb-2';
    row.innerHTML = `
      <span class="input-group-text"><i class="bi bi-sliders"></i></span>
      <input type="text" class="form-control" placeholder="Field name">
      <input type="number" step="0.1" class="form-control" placeholder="0">
      <span class="input-group-text unit-badge">${unitToggle.checked ? 'in' : 'cm'}</span>
    `;
    wrap.appendChild(row);
  });

  const aiQuery = document.getElementById('aiQuery');
  const aiResponse = document.getElementById('aiResponse');
  document.getElementById('askAiBtn').addEventListener('click', () => {
    const q = (aiQuery.value || '').toLowerCase();
    let text = 'Try asking for standard shirt measurements or size tips.';
    if (q.includes('shirt') || q.includes('men')) {
      text = 'Common men\'s shirt: Neck 38-40 cm, Chest 96-102 cm, Sleeve 60-64 cm.';
    } else if (q.includes('women') || q.includes('dress')) {
      text = 'Typical women\'s dress: Bust 84-96 cm, Waist 66-80 cm, Hip 90-104 cm.';
    }
    aiResponse.textContent = text;
  });

  document.getElementById('exportPdfBtn').addEventListener('click', () => {
    document.getElementById('exportStatus').textContent = 'PDF export stub: integrate jsPDF/TCPDF later.';
  });
  document.getElementById('exportCsvBtn').addEventListener('click', () => {
    const data = getMeasurements();
    const headers = Object.keys(data);
    const values = Object.values(data);
    const csv = `${headers.join(',')}\n${values.join(',')}`;
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'measurements.csv'; a.click();
    URL.revokeObjectURL(url);
    document.getElementById('exportStatus').textContent = 'CSV exported';
  });

  function toast(message) {
    const el = document.createElement('div');
    el.className = 'position-fixed bottom-0 end-0 m-3 p-2 bg-dark text-white rounded-2';
    el.textContent = message;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 2000);
  }

  // Initialize from URL gender param if present
  (function initGenderFromUrl(){
    try {
      const params = new URLSearchParams(location.search);
      const g = params.get('gender');
      if (g) {
        const r = document.querySelector(`input[name="gender"][value="${g}"]`);
        if (r) r.checked = true;
      }
    } catch {}
  })();
  loadMeasurements();
  applyFieldTemplate();
  updateSuggestions();
})();