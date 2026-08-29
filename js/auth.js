/* ==========================================================
   auth.js — Inisialisasi Supabase, Magic Link, dan
   fungsi bantu untuk melindungi halaman
   ========================================================== */

// GANTI dengan data proyek Supabase kamu sendiri
const SUPABASE_URL = 'https://eulxawfoijunocsxoegj.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_GkUR-TaW9KT7HiScb_y0Fw_EvKnLlsq';

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * Kirim magic link ke email yang dimasukkan user.
 * Return: null kalau sukses, atau pesan error (string).
 */
async function kirimMagicLink(email) {
  const { error } = await supabaseClient.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: window.location.origin + window.location.pathname.replace(/[^/]+$/, 'index.html'),
    },
  });
  return error ? error.message : null;
}

/** Ambil session yang sedang aktif (null kalau belum login) */
async function getSession() {
  const { data: { session } } = await supabaseClient.auth.getSession();
  return session;
}

/** Ambil data profil dari tabel `profiles` berdasarkan user_id */
async function getProfile(userId) {
  const { data, error } = await supabaseClient
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .single();
  if (error) return null;
  return data;
}

/** Logout dan kembali ke beranda */
async function logout() {
  await supabaseClient.auth.signOut();
  window.location.href = 'index.html';
}

/**
 * Panggil di awal halaman yang WAJIB login (konten.html, profil.html, admin.html).
 * Kalau belum login, otomatis redirect ke beranda dengan pesan.
 * Return session kalau berhasil, atau null (dan sudah redirect).
 */
async function requireAuth() {
  const session = await getSession();
  if (!session) {
    window.location.href = 'index.html?login=required';
    return null;
  }
  return session;
}

/**
 * Panggil di awal admin.html.
 * Cek login DAN status is_admin dari tabel profiles.
 * Return { session, profile } kalau valid, atau null (dan sudah redirect).
 */
async function requireAdmin() {
  const session = await requireAuth();
  if (!session) return null;

  const profile = await getProfile(session.user.id);
  if (!profile || profile.is_admin !== true) {
    window.location.href = 'index.html?akses=ditolak';
    return null;
  }
  return { session, profile };
}
