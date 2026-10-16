/**
 * Algoritma Fisher-Yates (Durstenfeld / Knuth) Shuffle
 * Kompleksitas Waktu: O(n)
 * Kompleksitas Ruang: O(1) in-place copy
 *
 * Mengacak susunan elemen array secara deterministik dengan permutasi acak merata (1/n!).
 * Digunakan untuk mengacak urutan butir soal ujian dan urutan opsi jawaban per sesi pengerjaan siswa.
 *
 * Referensi: PRD FR-004 & TECHNICAL_SPEC.md Bagian 6
 */
export function fisherYatesShuffle<T>(array: readonly T[] | T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    // Generate indeks acak integer seragam antara 0 dan i (inklusif)
    const j = Math.floor(Math.random() * (i + 1));
    // Pertukaran posisi elemen i dan j
    const temp = result[i];
    result[i] = result[j];
    result[j] = temp;
  }
  return result;
}

/**
 * Algoritma Fisher-Yates dengan seed deterministik (misal: sessionId + questionId).
 * Menghasilkan urutan permutasi acak yang 100% konsisten antar perangkat dan reload.
 */
export function seededFisherYatesShuffle<T>(array: readonly T[] | T[], seedStr: string): T[] {
  let h = 0;
  for (let k = 0; k < seedStr.length; k++) {
    h = Math.imul(31, h) + seedStr.charCodeAt(k) | 0;
  }
  let s = h >>> 0;
  const random = () => {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    const temp = result[i];
    result[i] = result[j];
    result[j] = temp;
  }
  return result;
}

