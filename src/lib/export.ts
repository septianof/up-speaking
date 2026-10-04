import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { StudentHistoryRecord } from '@/app/actions/admin';

interface ExportFilterInfo {
  level?: string;
  search?: string;
}

// Helper format tanggal Indonesia
const formatDateTimeIndonesia = (dateString: string) => {
  try {
    const date = new Date(dateString);
    return (
      new Intl.DateTimeFormat('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }).format(date) + ' WIB'
    );
  } catch {
    return dateString;
  }
};

// Helper format nomor WA (+62 812-3456-7890)
const formatWhatsAppNumber = (num: string) => {
  const cleaned = num.replace(/\D/g, '');
  if (cleaned.startsWith('62')) {
    const rest = cleaned.slice(2);
    return `+62 ${rest.replace(/(\d{3,4})(\d{3,4})(\d+)?/, '$1-$2-$3').replace(/-$/, '')}`;
  }
  return num;
};

/**
 * Ekspor data siswa ke file Excel (.xlsx)
 */
export function exportToExcel(
  data: StudentHistoryRecord[],
  filterInfo?: ExportFilterInfo
) {
  if (!data || data.length === 0) {
    alert('Tidak ada data yang dapat diekspor.');
    return;
  }

  // Siapkan data baris untuk sheet
  const rows = data.map((item, index) => ({
    No: index + 1,
    'Waktu Selesai': formatDateTimeIndonesia(item.completedAt),
    'Nama Lengkap Siswa': item.studentName,
    'Nomor WhatsApp': item.whatsappNumber,
    'Jawaban Benar': item.correctAnswers,
    'Total Soal': item.totalQuestions,
    'Skor Akhir (%)': item.finalScorePercent,
    'Level Penempatan': item.levelName,
    'Izin Tes Ulang': item.canRetest ? 'Aktif' : 'Tidak',
  }));

  // Buat Worksheet & Workbook
  const worksheet = XLSX.utils.json_to_sheet(rows);

  // Atur lebar kolom (column widths)
  worksheet['!cols'] = [
    { wch: 6 },  // No
    { wch: 22 }, // Waktu Selesai
    { wch: 28 }, // Nama Lengkap Siswa
    { wch: 18 }, // Nomor WhatsApp
    { wch: 14 }, // Jawaban Benar
    { wch: 12 }, // Total Soal
    { wch: 14 }, // Skor Akhir (%)
    { wch: 18 }, // Level Penempatan
    { wch: 16 }, // Izin Tes Ulang
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Rekap Hasil Tes');

  // Format tanggal file
  const dateStamp = new Date().toISOString().slice(0, 10);
  const filterLabel =
    filterInfo?.level && filterInfo.level !== 'all'
      ? `_${filterInfo.level}`
      : '';
  const fileName = `Rekap_Placement_Test_Up_Speaking${filterLabel}_${dateStamp}.xlsx`;

  // Download file
  XLSX.writeFile(workbook, fileName);
}

/**
 * Ekspor data siswa ke file PDF (.pdf) berstandar cetak resmi
 */
export function exportToPDF(
  data: StudentHistoryRecord[],
  filterInfo?: ExportFilterInfo
) {
  if (!data || data.length === 0) {
    alert('Tidak ada data yang dapat diekspor.');
    return;
  }

  // Buat instance dokumen PDF berorientasi Landscape A4
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'pt',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const dateStamp = new Date().toISOString().slice(0, 10);
  const printDateStr = formatDateTimeIndonesia(new Date().toISOString());

  // 1. Header Resmi Lembaga
  // Bar strip atas warna Navy
  doc.setFillColor(14, 38, 62); // #0e263e
  doc.rect(0, 0, pageWidth, 8, 'F');

  // Garis aksen biru langit
  doc.setFillColor(0, 166, 244); // #00a6f4
  doc.rect(0, 8, pageWidth, 3, 'F');

  // Judul Lembaga
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(14, 38, 62);
  doc.text('UP SPEAKING LEARNING CENTRE', 40, 42);

  // Subtitle Dokumen
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(0, 166, 244);
  doc.text('LAPORAN REKAPITULASI HASIL ENGLISH PLACEMENT TEST', 40, 58);

  // Garis pemisah header
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.setLineWidth(1);
  doc.line(40, 68, pageWidth - 40, 68);

  // 2. Metadata / Filter Info
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139); // slate-500

  const filterText =
    filterInfo?.level && filterInfo.level !== 'all'
      ? filterInfo.level
      : 'Semua Level';
  const searchText = filterInfo?.search ? `"${filterInfo.search}"` : 'Semua Data';

  doc.text(`Waktu Cetak: ${printDateStr}`, 40, 84);
  doc.text(`Filter Level: ${filterText}   |   Pencarian: ${searchText}`, 40, 97);
  doc.text(
    `Total Peserta Terfilter: ${data.length} Orang`,
    pageWidth - 40,
    84,
    { align: 'right' }
  );

  // 3. Kolom & Baris Tabel
  const tableHeaders = [
    [
      'No',
      'Waktu Ujian',
      'Nama Lengkap Siswa',
      'Nomor WhatsApp',
      'Benar / Total',
      'Skor Akhir',
      'Level Penempatan',
      'Izin Retest',
    ],
  ];

  const tableRows = data.map((item, index) => [
    (index + 1).toString(),
    formatDateTimeIndonesia(item.completedAt),
    item.studentName,
    formatWhatsAppNumber(item.whatsappNumber),
    `${item.correctAnswers} / ${item.totalQuestions}`,
    `${item.finalScorePercent}%`,
    item.levelName,
    item.canRetest ? 'Aktif' : 'Tidak',
  ]);

  // 4. Render Tabel dengan AutoTable
  autoTable(doc, {
    head: tableHeaders,
    body: tableRows,
    startY: 110,
    margin: { left: 40, right: 40 },
    theme: 'grid',
    headStyles: {
      fillColor: [14, 38, 62],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8.5,
      halign: 'center',
      valign: 'middle',
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [30, 41, 59],
      valign: 'middle',
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 30 }, // No
      1: { halign: 'left', cellWidth: 105 },  // Waktu Ujian
      2: { halign: 'left', fontStyle: 'bold' }, // Nama
      3: { halign: 'left', cellWidth: 110 },  // WA
      4: { halign: 'center', cellWidth: 70 }, // Benar/Total
      5: { halign: 'center', cellWidth: 65, fontStyle: 'bold' }, // Skor
      6: { halign: 'center', cellWidth: 95 }, // Level
      7: { halign: 'center', cellWidth: 65 }, // Retest
    },
    didDrawPage: (hookData) => {
      // Footer Halaman
      const footerY = pageHeight - 20;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(148, 163, 184); // slate-400

      doc.text(
        'Up Speaking Placement Test System — Dokumen Rekapitulasi Resmi',
        40,
        footerY
      );

      const pageStr = `Halaman ${hookData.pageNumber}`;
      doc.text(pageStr, pageWidth - 40, footerY, { align: 'right' });
    },
  });

  // 5. Download Dokumen PDF
  const filterLabel =
    filterInfo?.level && filterInfo.level !== 'all'
      ? `_${filterInfo.level}`
      : '';
  const fileName = `Laporan_Placement_Test_Up_Speaking${filterLabel}_${dateStamp}.pdf`;
  doc.save(fileName);
}
