import { StudentRecord } from "./mock-data";

export function exportStudentsToCsv(students: StudentRecord[], filename: string): void {
  if (typeof window === "undefined") return;

  const headers = [
    "ID Siswa",
    "Nama Lengkap",
    "Nomor WhatsApp",
    "Jenjang",
    "Status Sesi",
    "Skor Objektif",
    "Total Soal",
    "Persentase Skor",
    "Level Final Resmi",
    "Catatan Evaluasi Tutor",
    "Tanggal Daftar",
  ];

  const rows = students.map((std) => {
    const scorePercent = std.totalQuestions
      ? Math.round(((std.score || 0) / std.totalQuestions) * 100)
      : 0;

    return [
      `"${std.id}"`,
      `"${std.fullName.replace(/"/g, '""')}"`,
      `"'${std.phone}"`, // Tanda petik agar angka 0 di depan tidak hilang di Excel
      `"${std.targetLevel === "ELEMENTARY" ? "Elementary (SD)" : "High School (SMP/SMA)"}"`,
      `"${std.status}"`,
      `"${std.score ?? "-"}"`,
      `"${std.totalQuestions ?? 10}"`,
      `"${scorePercent}%"`,
      `"${std.finalLevel ?? "Belum Ditetapkan"}"`,
      `"${(std.notes || "").replace(/"/g, '""')}"`,
      `"${std.createdAt}"`,
    ];
  });

  const csvContent =
    "\uFEFF" + [headers.join(","), ...rows.map((e) => e.join(","))].join("\r\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function printPdfDocument(): void {
  if (typeof window === "undefined") return;
  window.print();
}
