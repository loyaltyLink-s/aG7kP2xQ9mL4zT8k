/* ==========================================================
   sidebar.js — Komponen navigasi (ikon garis tiga)
   Cukup panggil renderSidebar('nama-halaman') di tiap HTML.
   Membutuhkan auth.js sudah dimuat lebih dulu.
   ========================================================== */

function renderSidebar(activePage) {
  const menu = [
    { key: 'beranda', label: 'Beranda', href: 'index.html', protected: false },
    { key: 'konten', label: 'Konten', href: 'konten.html', protected: true },
    { key: 'profil', label: 'Profil Saya', href: 'profil.html', protected: true },
  ];

  const linksHTML = menu.map(item => `
    <a href="${item.href}"
       class="sidebar-link ${activePage === item.key ? 'active' : ''}"
       ${item.protected ? 'data-protected="true"' : ''}>
      ${item.label}
    </a>
  `).join('');

  const markup = `
    <button id="sidebar-toggle" aria-label="Buka menu navigasi" aria-expanded="false">
      <span></span><span></span><span></span>
    </button>
    <nav id="sidebar" class="sidebar" aria-label="Navigasi utama">
      <div class="sidebar-glow"></div>
      ${linksHTML}
      <a href="admin.html" class="sidebar-link admin-only" data-protected="true" style="display:none;">
        Panel Admin
      </a>
    </nav>
    <div id="sidebar-overlay" class="sidebar-overlay"></div>
  `;

  document.body.insertAdjacentHTML('afterbegin', markup);

  const toggleBtn = document.getElementById('sidebar-toggle');
  const sidebarEl = document.getElementById('sidebar');
  const overlayEl = document.getElementById('sidebar-overlay');

  function tutupSidebar() {
    sidebarEl.classList.remove('open');
    overlayEl.classList.remove('open');
    toggleBtn.classList.remove('open');
    toggleBtn.setAttribute('aria-expanded', 'false');
  }

  toggleBtn.addEventListener('click', () => {
    const sedangTerbuka = sidebarEl.classList.toggle('open');
    overlayEl.classList.toggle('open', sedangTerbuka);
    toggleBtn.classList.toggle('open', sedangTerbuka);
    toggleBtn.setAttribute('aria-expanded', String(sedangTerbuka));
  });
  overlayEl.addEventListener('click', tutupSidebar);

  // Cegah akses ke menu yang butuh login kalau belum login
  document.querySelectorAll('#sidebar [data-protected="true"]').forEach(link => {
    link.addEventListener('click', async (e) => {
      const session = await getSession();
      if (!session) {
        e.preventDefault();
        tutupSidebar();
        window.location.href = 'index.html?login=required';
      }
    });
  });

  // Tampilkan menu "Panel Admin" hanya kalau user memang admin
  getSession().then(async (session) => {
    if (!session) return;
    const profile = await getProfile(session.user.id);
    if (profile && profile.is_admin === true) {
      const adminLink = document.querySelector('#sidebar .admin-only');
      if (adminLink) adminLink.style.display = 'block';
    }
  });
}
