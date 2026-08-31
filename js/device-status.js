/* ==========================================================
   device-status.js — Badge info device & ping ke server
   Tampil di semua halaman (mirip sidebar), posisi pojok
   kiri bawah. Panggil renderDeviceStatus() setelah auth.js
   dimuat (butuh SUPABASE_URL & SUPABASE_ANON_KEY dari sana).
   Ping diukur ulang tiap 15 detik.
   ========================================================== */

function deteksiNamaDevice() {
  const ua = navigator.userAgent;

  let os = 'Unknown OS';
  if (/Windows/i.test(ua)) os = 'Windows';
  else if (/iPhone|iPad|iPod/i.test(ua)) os = 'iOS';
  else if (/Android/i.test(ua)) os = 'Android';
  else if (/Mac OS X/i.test(ua)) os = 'macOS';
  else if (/Linux/i.test(ua)) os = 'Linux';

  let browser = 'Browser';
  if (/Edg\//i.test(ua)) browser = 'Edge';
  else if (/OPR\/|Opera/i.test(ua)) browser = 'Opera';
  else if (/Chrome\//i.test(ua) && !/Edg\//i.test(ua)) browser = 'Chrome';
  else if (/Firefox\//i.test(ua)) browser = 'Firefox';
  else if (/Safari\//i.test(ua) && !/Chrome\//i.test(ua)) browser = 'Safari';

  return `${browser} di ${os}`;
}

async function ukurPingSupabase() {
  const mulai = performance.now();
  try {
    await fetch(`${SUPABASE_URL}/auth/v1/health`, {
      method: 'GET',
      headers: { apikey: SUPABASE_ANON_KEY },
      cache: 'no-store',
    });
  } catch (e) {
    return null; // gagal konek
  }
  return Math.round(performance.now() - mulai);
}

async function perbaruiPingDeviceStatus() {
  const el = document.getElementById('device-status');
  if (!el) return;
  const msEl = el.querySelector('.ds-ms');

  const ping = await ukurPingSupabase();
  el.classList.remove('ds-buruk', 'ds-sedang');

  if (ping === null) {
    msEl.textContent = 'offline';
    el.classList.add('ds-buruk');
    return;
  }

  msEl.textContent = `${ping} ms`;
  if (ping > 500) el.classList.add('ds-buruk');
  else if (ping > 150) el.classList.add('ds-sedang');
}

function renderDeviceStatus() {
  const namaDevice = deteksiNamaDevice();
  const container = document.createElement('div');
  container.id = 'device-status';
  container.innerHTML = `
    <span class="ds-dot"></span>
    <span class="ds-device">${namaDevice}</span>
    <span class="ds-sep">·</span>
    <span class="ds-ms">mengukur...</span>
  `;
  document.body.appendChild(container);

  perbaruiPingDeviceStatus();
  setInterval(perbaruiPingDeviceStatus, 15000);
}
