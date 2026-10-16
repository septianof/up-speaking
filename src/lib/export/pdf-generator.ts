import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { ReportItem } from "./excel-generator";

export interface ExportPdfOptions {
  title?: string;
  filterLevel?: string;
  filename?: string;
}

export function exportReportsToPdf(
  items: ReportItem[],
  options: ExportPdfOptions = {}
): void {
  if (typeof window === "undefined") return;

  // Gunakan orientasi landscape agar 9 kolom tabel muat dengan sangat lega pada kertas A4
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "pt",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // 1. Header Lembaga
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(61, 152, 214); // Brand Primary #3D98D6
  doc.text("UP SPEAKING LEARNING CENTRE", 40, 42);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(71, 85, 105); // Slate 600
  doc.text(
    options.title || "Laporan Rekapitulasi Hasil Placement Test Siswa",
    40,
    58
  );

  const printDate = new Date().toLocaleString("id-ID", {
    dateStyle: "full",
    timeStyle: "short",
  });
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139); // Slate 500
  doc.text(
    `Tanggal Cetak: ${printDate} WIB  |  Total Data: ${items.length} Siswa`,
    40,
    72
  );

  // Garis batas pemisah atas
  doc.setDrawColor(226, 232, 240); // Slate 200
  doc.setLineWidth(1);
  doc.line(40, 80, pageWidth - 40, 80);

  // 2. Siapkan baris tabel data
  const tableData = items.map((item, index) => {
    const elapsedMinutes = Math.floor((item.elapsedSeconds || 0) / 60);
    const elapsedSecondsRemainder = (item.elapsedSeconds || 0) % 60;
    const durasiFormatted =
      item.elapsedSeconds && item.elapsedSeconds > 0
        ? `${elapsedMinutes}m ${elapsedSecondsRemainder}s`
        : "-";

    const jenjangFormatted =
      item.targetLevel === "ELEMENTARY" ? "Elementary" : "High School";

    const skorFormatted =
      item.scorePercentage !== null && item.scorePercentage !== undefined
        ? `${Math.round(item.scorePercentage)}%`
        : "-";

    const levelFormatted = item.assignedLevel
      ? item.assignedLevel
      : item.sessionStatus === "COMPLETED"
      ? "Menunggu Evaluasi"
      : "-";

    const statusFormatted =
      item.sessionStatus === "FINALIZED"
        ? "Selesai"
        : item.sessionStatus === "COMPLETED"
        ? "Menunggu"
        : item.sessionStatus === "IN_PROGRESS"
        ? "Sedang Tes"
        : item.sessionStatus === "RESET"
        ? "Direset"
        : "Belum Mulai";

    return [
      (index + 1).toString(),
      item.fullName,
      item.phoneNumber,
      jenjangFormatted,
      skorFormatted,
      durasiFormatted,
      levelFormatted,
      statusFormatted,
      item.tutorName || "-",
    ];
  });

  // 3. Render AutoTable
  autoTable(doc, {
    startY: 90,
    head: [
      [
        "No",
        "Nama Siswa",
        "No. WhatsApp",
        "Jenjang",
        "Skor (%)",
        "Durasi",
        "Level Final",
        "Status",
        "Tutor Penilai",
      ],
    ],
    body: tableData,
    theme: "striped",
    headStyles: {
      fillColor: [61, 152, 214], // #3D98D6
      textColor: [255, 255, 255],
      fontSize: 9,
      fontStyle: "bold",
      halign: "center",
      valign: "middle",
      cellPadding: 5,
    },
    bodyStyles: {
      fontSize: 8.5,
      textColor: [15, 23, 42],
      valign: "middle",
      cellPadding: 4.5,
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252], // #F8FAFC
    },
    columnStyles: {
      0: { halign: "center", cellWidth: 28 }, // No
      1: { halign: "left", cellWidth: 140 },   // Nama
      2: { halign: "center", cellWidth: 85 },  // No WhatsApp
      3: { halign: "center", cellWidth: 85 },  // Jenjang
      4: { halign: "center", cellWidth: 55 },  // Skor
      5: { halign: "center", cellWidth: 60 },  // Durasi
      6: { halign: "center", cellWidth: 85, fontStyle: "bold" },  // Level Final
      7: { halign: "center", cellWidth: 70 },  // Status
      8: { halign: "center" },                 // Tutor
    },
    margin: { left: 40, right: 40, bottom: 40 },
    didDrawPage: (data) => {
      // Footer Nomor Halaman
      const pageStr = `Halaman ${data.pageNumber}`;
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text(
        pageStr,
        pageWidth - 40 - doc.getTextWidth(pageStr),
        pageHeight - 20
      );
      doc.text(
        "Up Speaking Placement Test System • Dokumen Resmi Lembaga",
        40,
        pageHeight - 20
      );
    },
  });

  const defaultFilename = `Rekap_Hasil_Tes_UpSpeaking_${new Date().toISOString().slice(0, 10)}.pdf`;
  const filename = options.filename ? `${options.filename}.pdf` : defaultFilename;
  doc.save(filename);
}
