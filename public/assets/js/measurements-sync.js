document.addEventListener('DOMContentLoaded', () => {
  const sel = document.getElementById('clientSelect');
  if (!sel || !window.ST) return;
  const stored = ST.clients.all();
  if (!stored.length) return; // keep existing defaults if none stored

  // Preserve currently selected value by name if possible
  const current = sel.value;
  sel.innerHTML = '';
  stored.forEach(c => {
    const opt = document.createElement('option'); opt.value = c.id; opt.textContent = c.name; sel.appendChild(opt);
  });
  // Honor URL param `client`, fall back to previous selection, else first
  const params = new URLSearchParams(location.search);
  const fromUrl = params.get('client');
  const urlGender = params.get('gender');
  const has = v => [...sel.options].some(o => o.value === v);
  if (fromUrl && has(fromUrl)) {
    sel.value = fromUrl;
  } else if (current && has(current)) {
    sel.value = current;
  } else {
    sel.value = stored[0].id;
  }
  // Set gender radio from URL if provided
  if (urlGender) {
    const r = document.querySelector(`input[name="gender"][value="${urlGender}"]`);
    if (r) r.checked = true;
  }
  // Trigger change so existing app.js loads measurements
  sel.dispatchEvent(new Event('change'));
});