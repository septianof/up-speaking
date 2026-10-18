export interface FaqItem {
  q: string;
  a: string;
}

export const LANDING_FAQS: FaqItem[] = [
  {
    q: "Apakah ada batasan waktu saat mengerjakan tes?",
    a: "Tidak ada batas waktu mundur (countdown)! Jam di atas hanya mencatat total waktu pengerjaanmu. Kamu bisa membaca dan menjawab soal dengan tenang dan teliti.",
  },
  {
    q: "Bagaimana jika koneksi internet tiba-tiba terputus?",
    a: "Jangan panik! Jawabanmu otomatis tersimpan aman di HP/komputermu. Kamu tetap bisa lanjut menjawab, dan jawaban akan tersimpan otomatis saat internet terhubung kembali.",
  },
  {
    q: "Bolehkah saya mengubah jawaban sebelum mengumpulkan?",
    a: "Tentu saja boleh! Kamu bebas kembali ke nomor sebelumnya dan mengganti pilihan jawaban kapan saja sebelum menekan tombol 'Kumpulkan'.",
  },
  {
    q: "Kapan hasil placement test dapat diketahui?",
    a: "Setelah kamu mengumpulkan jawaban, lembar tes akan dinilai langsung oleh tim pengajar Up Speaking untuk menentukan hasil penempatan kelas yang paling tepat.",
  },
];

export interface NavLinkItem {
  label: string;
  href: string;
}

export const LANDING_NAV_LINKS: NavLinkItem[] = [
  { label: "Beranda", href: "#hero" },
  { label: "Alur Tes", href: "#alur" },
  { label: "Ketentuan", href: "#ketentuan" },
  { label: "FAQ", href: "#faq" },
];
