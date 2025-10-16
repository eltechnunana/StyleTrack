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
  const bizLogo = document.getElementById('bizLogo');
  const logoPreview = document.getElementById('logoPreview');
  const logoImage = document.getElementById('logoImage');
  const removeLogo = document.getElementById('removeLogo');
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
    // Load business logo
    if (s.bizLogo && logoImage && logoPreview) {
      logoImage.src = s.bizLogo;
      logoPreview.style.display = 'block';
      if (removeLogo) removeLogo.style.display = 'inline-block';
    }
  }

  function applyTheme(theme) {
    const root = document.documentElement;
    if (theme === 'dark') root.classList.add('dark'); else root.classList.remove('dark');
  }

  // Handle logo file selection
  if (bizLogo) {
    bizLogo.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const logoData = e.target.result;
          if (logoImage && logoPreview) {
            logoImage.src = logoData;
            logoPreview.style.display = 'block';
            if (removeLogo) removeLogo.style.display = 'inline-block';
          }
        };
        reader.readAsDataURL(file);
      }
    });
  }

  // Handle logo removal
  if (removeLogo) {
    removeLogo.addEventListener('click', () => {
      if (bizLogo) bizLogo.value = '';
      if (logoImage) logoImage.src = '';
      if (logoPreview) logoPreview.style.display = 'none';
      removeLogo.style.display = 'none';
      // Remove from settings
      const s = ST.settings.get();
      delete s.bizLogo;
      ST.settings.save(s);
    });
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
      // Save logo if uploaded
      if (logoImage && logoImage.src && logoImage.src !== window.location.href) {
        s.bizLogo = logoImage.src;
      }
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