/* ==========================================================
   auth.js — Inisialisasi Supabase, Magic Link, dan
   fungsi bantu untuk melindungi halaman
   ========================================================== */

// ==========================================================
// KONFIGURASI SUPABASE
// ==========================================================

const SUPABASE_URL = 'https://eulxawfoijunocsxoegj.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_GkUR-TaW9KT7HiScb_y0Fw_EvKnLlsq';

// Inisialisasi Supabase
const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);


// ==========================================================
// MAGIC LINK
// ==========================================================

/**
 * Kirim magic link ke email yang dimasukkan user.
 * Return: null kalau sukses, atau pesan error (string).
 */
async function kirimMagicLink(email) {
  const { error } = await supabaseClient.auth.signInWithOtp({
    email: email,
    options: {
      emailRedirectTo:
        window.location.origin +
        window.location.pathname.replace(/[^/]+$/, 'index.html'),
    },
  });

  return error ? error.message : null;
}


// ==========================================================
// SESSION
// ==========================================================

/**
 * Ambil session yang sedang aktif.
 * Return null kalau belum login.
 */
async function getSession() {
  const {
    data: { session },
  } = await supabaseClient.auth.getSession();

  return session;
}


// ==========================================================
// PROFILE
// ==========================================================

/**
 * Ambil data profil dari tabel `profiles`
 * berdasarkan user_id.
 */
async function getProfile(userId) {
  const { data, error } = await supabaseClient
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) {
    console.error('Gagal mengambil profile:', error);
    return null;
  }

  return data;
}


// ==========================================================
// LOGOUT
// ==========================================================

/**
 * Logout dan kembali ke beranda.
 */
async function logout() {
  const { error } = await supabaseClient.auth.signOut();

  if (error) {
    console.error('Gagal logout:', error);
    return;
  }

  window.location.href = 'index.html';
}


// ==========================================================
// REQUIRE AUTH
// ==========================================================

/**
 * Panggil di awal halaman yang WAJIB login.
 *
 * Kalau belum login:
 * -> redirect ke index.html?login=required
 *
 * Kalau sudah login:
 * -> return session
 */
async function requireAuth() {
  const session = await getSession();

  if (!session) {
    window.location.href = 'index.html?login=required';
    return null;
  }

  return session;
}


// ==========================================================
// UPLOAD FOTO PROFIL
// ==========================================================

/**
 * Upload foto profil ke Supabase Storage.
 *
 * Bucket:
 * avatars
 *
 * Return:
 * { url } kalau sukses
 * { error } kalau gagal
 */
async function uploadFotoProfil(file, userId) {
  if (!file) {
    return { error: 'File tidak ditemukan.' };
  }

  if (!userId) {
    return { error: 'User ID tidak ditemukan.' };
  }

  const ekstensi = file.name.includes('.')
    ? file.name.split('.').pop().toLowerCase()
    : 'jpg';

  const namaFile = `${userId}-${Date.now()}.${ekstensi}`;

  const { error: uploadError } = await supabaseClient.storage
    .from('avatars')
    .upload(namaFile, file, {
      upsert: true,
    });

  if (uploadError) {
    console.error('Upload foto gagal:', uploadError);
    return { error: uploadError.message };
  }

  const { data } = supabaseClient.storage
    .from('avatars')
    .getPublicUrl(namaFile);

  return {
    url: data.publicUrl,
  };
}


// ==========================================================
// REQUIRE ADMIN
// ==========================================================

/**
 * Panggil di awal admin.html.
 *
 * Cek:
 * 1. User sudah login
 * 2. User memiliki profile
 * 3. is_admin === true
 *
 * Return:
 * { session, profile } kalau valid
 *
 * Return null kalau tidak valid.
 */
async function requireAdmin() {
  const session = await requireAuth();

  if (!session) {
    return null;
  }

  const profile = await getProfile(session.user.id);

  if (!profile || profile.is_admin !== true) {
    window.location.href = 'index.html?akses=ditolak';
    return null;
  }

  return {
    session,
    profile,
  };
}
