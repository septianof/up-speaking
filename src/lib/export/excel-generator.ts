import ExcelJS from "exceljs";

export interface ReportItem {
  studentId: string;
  fullName: string;
  phoneNumber: string;
  targetLevel: string;
  registeredAt?: string;
  sessionId?: string | null;
  sessionStatus?: string;
  scorePercentage?: number | null;
  elapsedSeconds?: number;
  submittedAt?: string | null;
  assignedLevel?: string | null;
  tutorName?: string | null;
  tutorNotes?: string | null;
  finalizedAt?: string | null;
}

export interface ExportExcelOptions {
  title?: string;
  filterLevel?: string;
  filename?: string;
}

/**
 * Sanitasi string sel Excel untuk mencegah Formula Injection (CSV / Excel Macro Injection).
 * Memeriksa karakter berbahaya di awal string (=, +, -, @, \t, \r).
 */
export function sanitizeForExcel(value: unknown): string {
  if (value === null || value === undefined) return "-";
  const str = String(value).trim();
  if (!str) return "-";
  if (/^[=+\-@\t\r]/.test(str)) {
    return `'${str}`;
  }
  return str;
}

export async function exportReportsToExcel(
  items: ReportItem[],
  options: ExportExcelOptions = {}
): Promise<void> {
  if (typeof window === "undefined") return;

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Up Speaking Learning Centre";
  workbook.created = new Date();

  const worksheet = workbook.addWorksheet("Hasil Placement Test", {
    views: [{ showGridLines: true }],
  });

  // 1. Header Lembaga
  worksheet.mergeCells("A1:I1");
  const titleCell = worksheet.getCell("A1");
  titleCell.value = "UP SPEAKING LEARNING CENTRE";
  titleCell.font = { name: "Arial", size: 16, bold: true, color: { argb: "FF3D98D6" } };
  titleCell.alignment = { vertical: "middle", horizontal: "center" };
  worksheet.getRow(1).height = 28;

  worksheet.mergeCells("A2:I2");
  const subTitleCell = worksheet.getCell("A2");
  subTitleCell.value = sanitizeForExcel(options.title || "Laporan Rekapitulasi Hasil Placement Test Siswa");
  subTitleCell.font = { name: "Arial", size: 11, italic: true, color: { argb: "FF475569" } };
  subTitleCell.alignment = { vertical: "middle", horizontal: "center" };
  worksheet.getRow(2).height = 20;

  worksheet.mergeCells("A3:I3");
  const dateCell = worksheet.getCell("A3");
  const printDate = new Date().toLocaleString("id-ID", {
    dateStyle: "full",
    timeStyle: "short",
  });
  dateCell.value = `Tanggal Unduh: ${printDate} WIB  |  Total Data: ${items.length} Siswa`;
  dateCell.font = { name: "Arial", size: 9, color: { argb: "FF64748B" } };
  dateCell.alignment = { vertical: "middle", horizontal: "center" };
  worksheet.getRow(3).height = 18;

  // Empty row 4
  worksheet.addRow([]);

  // 2. Table Headers (Row 5)
  const headers = [
    "No",
    "Nama Lengkap",
    "Nomor HP",
    "Jenjang",
    "Skor Objektif (%)",
    "Durasi Pengerjaan",
    "Level Final Resmi",
    "Status Sesi",
    "Tutor Penilai",
  ];

  const headerRow = worksheet.addRow(headers);
  headerRow.height = 26;

  headerRow.eachCell((cell) => {
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF3D98D6" },
    };
    cell.font = {
      name: "Arial",
      size: 10,
      bold: true,
      color: { argb: "FFFFFFFF" },
    };
    cell.alignment = { vertical: "middle", horizontal: "center" };
    cell.border = {
      top: { style: "thin", color: { argb: "FFCBD5E1" } },
      left: { style: "thin", color: { argb: "FFCBD5E1" } },
      bottom: { style: "medium", color: { argb: "FF1E293B" } },
      right: { style: "thin", color: { argb: "FFCBD5E1" } },
    };
  });

  // 3. Data Rows
  items.forEach((item, index) => {
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
        ? "Selesai Dinilai"
        : item.sessionStatus === "COMPLETED"
        ? "Menunggu Penilaian"
        : item.sessionStatus === "IN_PROGRESS"
        ? "Sedang Mengerjakan"
        : item.sessionStatus === "RESET"
        ? "Direset"
        : "Belum Mulai";

    const row = worksheet.addRow([
      index + 1,
      sanitizeForExcel(item.fullName),
      `'${sanitizeForExcel(item.phoneNumber)}`, // Prefix petik agar leading 0 tetap terjaga dan formula tidak dieksekusi
      jenjangFormatted,
      skorFormatted,
      durasiFormatted,
      levelFormatted,
      statusFormatted,
      sanitizeForExcel(item.tutorName || "-"),
    ]);

    row.height = 22;

    const isEven = index % 2 === 0;
    row.eachCell((cell, colNumber) => {
      cell.font = { name: "Arial", size: 10, color: { argb: "FF0F172A" } };
      cell.border = {
        top: { style: "thin", color: { argb: "FFE2E8F0" } },
        left: { style: "thin", color: { argb: "FFE2E8F0" } },
        bottom: { style: "thin", color: { argb: "FFE2E8F0" } },
        right: { style: "thin", color: { argb: "FFE2E8F0" } },
      };

      if (!isEven) {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFF8FAFC" },
        };
      }

      // Kolom Alignment
      if (colNumber === 1) cell.alignment = { vertical: "middle", horizontal: "center" };
      else if (colNumber === 2) cell.alignment = { vertical: "middle", horizontal: "left" };
      else if (colNumber === 3) cell.alignment = { vertical: "middle", horizontal: "center" };
      else if (colNumber === 4) cell.alignment = { vertical: "middle", horizontal: "center" };
      else if (colNumber === 5) cell.alignment = { vertical: "middle", horizontal: "center" };
      else if (colNumber === 6) cell.alignment = { vertical: "middle", horizontal: "center" };
      else if (colNumber === 7) {
        cell.alignment = { vertical: "middle", horizontal: "center" };
        if (item.assignedLevel) {
          cell.font = { name: "Arial", size: 10, bold: true, color: { argb: "FF0F766E" } };
        }
      } else if (colNumber === 8) {
        cell.alignment = { vertical: "middle", horizontal: "center" };
      } else {
        cell.alignment = { vertical: "middle", horizontal: "center" };
      }
    });
  });

  // 4. Set auto column widths
  worksheet.columns = [
    { width: 6 },  // No
    { width: 28 }, // Nama
    { width: 18 }, // No HP
    { width: 18 }, // Jenjang
    { width: 18 }, // Skor
    { width: 18 }, // Durasi
    { width: 20 }, // Level Final
    { width: 20 }, // Status Sesi
    { width: 22 }, // Tutor Penilai
  ];

  // 5. Trigger download
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const defaultFilename = `Rekap_Hasil_Tes_UpSpeaking_${new Date().toISOString().slice(0, 10)}.xlsx`;
  a.href = url;
  a.download = options.filename ? `${options.filename}.xlsx` : defaultFilename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
