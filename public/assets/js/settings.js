document.addEventListener('DOMContentLoaded', () => {
  const unitSel = document.getElementById('unitSelect');
  const themeSel = document.getElementById('themeSelect');
  const saveBtn = document.getElementById('savePrefBtn');
  const exportBtn = document.getElementById('exportBtn');
  const clearBtn = document.getElementById('clearBtn');
  // Business details
  const bizName = document.getElementById('bizName');
  const bizEmail = document.getElementById('bizEmail');
  const bizPhone = document.getElementById('bizPhone');
  const bizAddress = document.getElementById('bizAddress');
  const bizCurrency = document.getElementById('bizCurrency');
  const defaultTaxPct = document.getElementById('defaultTaxPct');
  const saveBizBtn = document.getElementById('saveBizBtn');

  function loadPrefs() {
    const s = ST.settings.get();
    unitSel.value = s.unit || 'cm';
    themeSel.value = s.theme || 'light';
    applyTheme(themeSel.value);
    // Business details
    if (bizName) bizName.value = s.bizName || '';
    if (bizEmail) bizEmail.value = s.bizEmail || '';
    if (bizPhone) bizPhone.value = s.bizPhone || '';
    if (bizAddress) bizAddress.value = s.bizAddress || '';
    if (bizCurrency) bizCurrency.value = s.bizCurrency || 'USD';
    if (defaultTaxPct) defaultTaxPct.value = s.defaultTaxPct != null ? String(s.defaultTaxPct) : '';
  }

  function applyTheme(theme) {
    const root = document.documentElement;
    if (theme === 'dark') root.classList.add('dark'); else root.classList.remove('dark');
  }

  saveBtn.addEventListener('click', () => {
    const s = ST.settings.get();
    s.unit = unitSel.value; s.theme = themeSel.value; ST.settings.save(s);
    applyTheme(s.theme);
    alert('Preferences saved');
  });

  if (saveBizBtn) {
    saveBizBtn.addEventListener('click', () => {
      const s = ST.settings.get();
      s.bizName = bizName?.value || s.bizName || '';
      s.bizEmail = bizEmail?.value || s.bizEmail || '';
      s.bizPhone = bizPhone?.value || s.bizPhone || '';
      s.bizAddress = bizAddress?.value || s.bizAddress || '';
      s.bizCurrency = bizCurrency?.value || s.bizCurrency || 'USD';
      s.defaultTaxPct = defaultTaxPct?.value ? parseFloat(defaultTaxPct.value) : s.defaultTaxPct;
      ST.settings.save(s);
      alert('Business details saved');
    });
  }

  exportBtn.addEventListener('click', () => {
    const blob = new Blob([ST.settings.exportAll()], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'styletrack-export.json'; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 0);
  });

  clearBtn.addEventListener('click', () => {
    if (!confirm('This will delete all clients, orders, measurements and settings. Continue?')) return;
    ST.settings.clearAll();
    loadPrefs();
    alert('All data cleared');
  });

  loadPrefs();
});