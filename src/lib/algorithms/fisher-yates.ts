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
