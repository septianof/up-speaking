import { describe, it, expect } from 'vitest';
import { fisherYatesShuffle } from '@/lib/algorithms/fisher-yates';

describe('Algoritma Fisher-Yates (Durstenfeld / Knuth) Shuffle', () => {
  it('harus mempertahankan panjang array yang sama persis (Length Invariance)', () => {
    const original = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const shuffled = fisherYatesShuffle(original);

    expect(shuffled).toHaveLength(original.length);
  });

  it('harus mempertahankan seluruh elemen asli tanpa ada yang hilang atau duplikat (Conservation)', () => {
    const original = ['soal-1', 'soal-2', 'soal-3', 'soal-4', 'soal-5'];
    const shuffled = fisherYatesShuffle(original);

    expect([...shuffled].sort()).toEqual([...original].sort());
  });

  it('tidak boleh memodifikasi array sumber asli (Immutability / Pure Function)', () => {
    const original = Object.freeze([10, 20, 30, 40]);
    const shuffled = fisherYatesShuffle(original);

    expect(original).toEqual([10, 20, 30, 40]);
    expect(shuffled).not.toBe(original);
  });

  it('harus menangani kasus batas (Boundary Cases): array kosong dan 1 elemen', () => {
    expect(fisherYatesShuffle([])).toEqual([]);
    expect(fisherYatesShuffle(['hanya-satu'])).toEqual(['hanya-satu']);
  });

  it('harus mengacak objek butir soal dan opsi jawaban dengan benar', () => {
    const questions = [
      { id: 'q1', text: 'What is your name?', options: ['A', 'B', 'C', 'D'] },
      { id: 'q2', text: 'How old are you?', options: ['10', '11', '12'] },
      { id: 'q3', text: 'Where do you live?', options: ['Jakarta', 'Bandung'] },
    ];

    const shuffledQuestions = fisherYatesShuffle(questions);
    expect(shuffledQuestions).toHaveLength(3);

    // Pastikan setiap objek soal utuh dan opsi jawaban juga dapat diacak
    shuffledQuestions.forEach((q) => {
      const shuffledOptions = fisherYatesShuffle(q.options);
      expect(shuffledOptions).toHaveLength(q.options.length);
      expect([...shuffledOptions].sort()).toEqual([...q.options].sort());
    });
  });

  it('harus menghasilkan distribusi permutasi seragam (Chi-Square Goodness-of-Fit Test)', () => {
    // Array 3 elemen: 3! = 6 kemungkinan permutasi
    const items = ['A', 'B', 'C'];
    const totalRuns = 6000;
    const expectedPerPermutation = totalRuns / 6; // 1000 kali per permutasi

    const counts: Record<string, number> = {
      'A,B,C': 0,
      'A,C,B': 0,
      'B,A,C': 0,
      'B,C,A': 0,
      'C,A,B': 0,
      'C,B,A': 0,
    };

    for (let i = 0; i < totalRuns; i++) {
      const result = fisherYatesShuffle(items).join(',');
      counts[result] = (counts[result] || 0) + 1;
    }

    // Setiap dari 6 kemungkinan permutasi harus muncul secara nyata
    Object.keys(counts).forEach((perm) => {
      expect(counts[perm]).toBeGreaterThan(0);
    });

    // Hitung statistik Chi-Square: sum((O - E)^2 / E)
    let chiSquare = 0;
    Object.values(counts).forEach((observed) => {
      const diff = observed - expectedPerPermutation;
      chiSquare += (diff * diff) / expectedPerPermutation;
    });

    // Derajat kebebasan (df) = 6 - 1 = 5.
    // Nilai kritis Chi-Square untuk df=5 pada tingkat signifikansi p=0.001 adalah 20.515.
    // Jika chiSquare < 20.515, kita gagal menolak hipotesis nol bahwa permutasi terdistribusi seragam.
    expect(chiSquare).toBeLessThan(20.515);
  });
});
