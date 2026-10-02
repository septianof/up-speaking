/**
 * Utilitas normalisasi dan validasi nomor WhatsApp untuk siswa.
 * Seluruh nomor wajib dinormalisasi ke format standar internasional '628xxx'
 * tanpa spasi, tanda strip, atau simbol lainnya.
 */

/**
 * Membersihkan dan menormalisasi input nomor WhatsApp ke format '628xxx'.
 * Mengembalikan string hasil normalisasi jika valid, atau null jika nomor tidak valid.
 *
 * Contoh:
 * - '0812-3456-7890' -> '6281234567890'
 * - '+62 812 3456 7890' -> '6281234567890'
 * - '81234567890' -> '6281234567890'
 * - '6281234567890' -> '6281234567890'
 */
export function normalizeWhatsAppNumber(input: string): string | null {
  if (!input || typeof input !== 'string') {
    return null;
  }

  // Hapus semua karakter non-angka
  let digits = input.replace(/\D/g, '');

  if (!digits) {
    return null;
  }

  // Jika diawali dengan '08', ubah '0' menjadi '62'
  if (digits.startsWith('08')) {
    digits = '62' + digits.slice(1);
  }
  // Jika diawali dengan '8', tambahkan '62' di depannya
  else if (digits.startsWith('8')) {
    digits = '62' + digits;
  }

  // Validasi nomor seluler Indonesia:
  // - Wajib diawali '628'
  // - Digit berikutnya tidak boleh '0' (biasanya operator seluler: 6281, 6282, 6283, 6285, 6287, 6288, 6289)
  // - Total panjang berkisar 10 s/d 14 digit
  const waRegex = /^628[1-9][0-9]{6,11}$/;

  if (!waRegex.test(digits)) {
    return null;
  }

  return digits;
}

/**
 * Mengecek apakah input nomor WhatsApp memenuhi standar format yang valid.
 */
export function isValidWhatsAppNumber(input: string): boolean {
  return normalizeWhatsAppNumber(input) !== null;
}

/**
 * Memformat nomor WhatsApp terstandarisasi untuk tampilan yang nyaman dibaca pengguna.
 * Contoh: '6281234567890' -> '+62 812-3456-7890'
 */
export function formatWhatsAppDisplay(normalizedNumber: string): string {
  if (!normalizedNumber || !normalizedNumber.startsWith('62')) {
    return normalizedNumber;
  }

  const withoutCountryCode = normalizedNumber.slice(2); // contoh: '81234567890'
  const prefix = withoutCountryCode.slice(0, 3); // '812'
  const mid = withoutCountryCode.slice(3, 7); // '3456'
  const rest = withoutCountryCode.slice(7); // '7890'

  return `+62 ${prefix}-${mid}-${rest}`;
}
