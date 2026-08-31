/**
 * Mendeteksi informasi browser dan OS secara sederhana
 */
function deteksiNamaDevice() {
  const ua = navigator.userAgent;
  let os = 'Unknown OS';
  let browser = 'Browser';

  if (ua.includes('Win')) os = 'Windows';
  else if (ua.includes('Mac')) os = 'macOS';
  else if (ua.includes('Linux')) os = 'Linux';
  else if (ua.includes('Android')) os = 'Android';
  else if (ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';

  if (ua.includes('Edg/')) browser = 'Edge';
  else if (ua.includes('Chrome/')) browser = 'Chrome';
  else if (ua.includes('Firefox/')) browser = 'Firefox';
  else if (ua.includes('Safari/') && !ua.includes('Chrome/')) browser = 'Safari';

  return `${os} • ${browser}`;
}

/**
 * Mengukur ping (ms) langsung ke REST endpoint Supabase secara cepat
 */
async function ukurPingSupabase() {
  const awal = performance.now();
  try {
    // Menggunakan fetch HEAD agar super ringan, cepat, dan tidak memberatkan server
    await fetch(`${SUPABASE_URL}/rest/v1/`, {
      method: 'HEAD',
      headers: { 'apikey': SUPABASE_ANON_KEY },
      cache: 'no-store' // Biar tidak kena cache browser
    });
    const akhir = performance.now();
    return Math.round(akhir - awal);
  } catch {
    // Fallback kalau koneksi terputus / fetch gagal
    return null;
  }
}

/**
 * Membuat dan memperbarui badge status device di pojok kiri bawah
 */
async function renderDeviceStatus() {
  let container = document.getElementById('device-status');

  // Jika belum ada di HTML, buat elemennya otomatis
  if (!container) {
    container = document.createElement('div');
    container.id = 'device-status';
    document.body.appendChild(container);
  }

  const infoDevice = deteksiNamaDevice();

  async function perbarui() {
    const ms = await ukurPingSupabase();
    let kelasPing = 'ds-ping-bagus';
    let teksPing = '—';

    if (ms !== null) {
      teksPing = `${ms} ms`;
      if (ms > 300) kelasPing = 'ds-ping-buruk';
      else if (ms > 150) kelasPing = 'ds-ping-sedang';
    } else {
      teksPing = 'Offline';
      kelasPing = 'ds-ping-buruk';
    }

    container.innerHTML = `
      <span class="ds-dot ${kelasPing}"></span>
      <span class="ds-text">${infoDevice}</span>
      <span class="ds-separator">•</span>
      <span class="ds-ping ${kelasPing}">${teksPing}</span>
    `;
  }

  // Jalankan langsung pertama kali saat dimuat
  await perbarui();

  // Set interval 2000ms (2 detik) agar tampil secara live & real-time
  setInterval(perbarui, 2000);
}

// Otomatis jalankan setelah DOM selesai dimuat
document.addEventListener('DOMContentLoaded', () => {
  renderDeviceStatus();
});
