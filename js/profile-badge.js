/* ==========================================================
   profile-badge.js — Badge profil di pojok kanan atas
   Panggil renderProfileBadge() di semua halaman KECUALI
   profil.html (karena isinya sudah ditampilkan penuh di sana).
   Membutuhkan auth.js sudah dimuat lebih dulu.
   ========================================================== */

async function renderProfileBadge() {
  const container = document.createElement('div');
  container.id = 'profile-badge';
  container.className = 'profile-badge';
  document.body.appendChild(container);

  const session = await getSession();

  if (!session) {
    container.innerHTML = `<a href="index.html" class="badge-login">Masuk</a>`;
    return;
  }

  const profile = await getProfile(session.user.id);
  const nama = (profile && profile.nama) ? profile.nama : session.user.email;
  const foto = (profile && profile.foto_url) ? profile.foto_url : 'assets/default-avatar.png';

  container.innerHTML = `
    <a href="profil.html" class="badge-link">
      <span class="badge-nama">${nama}</span>
      <img src="${foto}" class="badge-foto" alt="Foto profil ${nama}">
    </a>
  `;
}
