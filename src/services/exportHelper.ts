import * as XLSX from 'xlsx';

export interface ExportReportData {
  title: string;
  subTitle?: string;
  reportDate?: string;
  creatorName: string;
  reviewerName?: string;
  summaryStats?: { label: string; value: string | number }[];
  headers: string[];
  rows: (string | number)[][];
  notes?: string;
}

export const exportHelper = {
  // Export as real Excel .xlsx file
  exportToExcel(data: ExportReportData, fileNamePrefix: string = 'Bao_Cao'): void {
    const wsData: (string | number)[][] = [
      ['TRƯỜNG PTDTBT THCS XÃ TRÀ ĐỐC - THÀNH PHỐ ĐÀ NẴNG'],
      ['HỆ THỐNG QUẢN LÝ HỌC SINH NỘI TRÚ'],
      [data.title.toUpperCase()],
      [data.subTitle || ''],
      [`Thời gian xuất: ${data.reportDate || new Date().toLocaleDateString('vi-VN')}`],
      [`Người lập báo cáo: ${data.creatorName} | Người duyệt: ${data.reviewerName || 'Nguyễn Trọng Nghĩa'}`],
      [],
    ];

    if (data.summaryStats && data.summaryStats.length > 0) {
      wsData.push(['TỔNG HỢP NHANH:']);
      data.summaryStats.forEach(stat => {
        wsData.push([stat.label, stat.value]);
      });
      wsData.push([]);
    }

    // Table Header
    wsData.push(data.headers);

    // Rows
    data.rows.forEach(row => {
      wsData.push(row);
    });

    if (data.notes) {
      wsData.push([]);
      wsData.push(['Ghi chú:', data.notes]);
    }

    const ws = XLSX.utils.aoa_to_sheet(wsData);

    // Auto width
    const colWidths = data.headers.map((h, i) => {
      let maxLen = h.length;
      data.rows.forEach(r => {
        const val = r[i] !== undefined ? String(r[i]) : '';
        if (val.length > maxLen) maxLen = val.length;
      });
      return { wch: Math.min(Math.max(maxLen + 3, 12), 45) };
    });
    ws['!cols'] = [{ wch: 25 }, ...colWidths];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Báo Cáo');

    const cleanName = `${fileNamePrefix}_${new Date().toISOString().slice(0, 10)}.xlsx`;
    XLSX.writeFile(wb, cleanName);
  },

  // Export to Word Document (.doc format with official Vietnamese government styling)
  exportToWord(data: ExportReportData, fileNamePrefix: string = 'Bao_Cao'): void {
    const rowsHtml = data.rows
      .map(
        (row, idx) => `
        <tr style="background-color: ${idx % 2 === 0 ? '#ffffff' : '#f8fafc'};">
          ${row.map(cell => `<td style="border: 1px solid #cbd5e1; padding: 8px 10px; font-size: 13px; text-align: left;">${cell ?? ''}</td>`).join('')}
        </tr>
      `
      )
      .join('');

    const headersHtml = data.headers
      .map(
        h => `<th style="border: 1px solid #94a3b8; background-color: #1e3a8a; color: #ffffff; padding: 10px; font-size: 13px; text-align: center;">${h}</th>`
      )
      .join('');

    const statsHtml = data.summaryStats
      ? `<div style="margin: 15px 0; padding: 12px; background-color: #f1f5f9; border-left: 4px solid #2563eb;">
          <h4 style="margin: 0 0 8px 0; color: #1e293b; font-size: 14px;">TỔNG HỢP SỐ LIỆU CHÍNH:</h4>
          <table style="width: 100%; border-collapse: collapse;">
            ${data.summaryStats
              .map(
                s => `<tr><td style="padding: 4px 8px; width: 60%; color: #475569;">${s.label}:</td><td style="padding: 4px 8px; font-weight: bold; color: #0f172a;">${s.value}</td></tr>`
              )
              .join('')}
          </table>
        </div>`
      : '';

    const content = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset='utf-8'>
        <title>${data.title}</title>
        <style>
          body { font-family: 'Times New Roman', serif; font-size: 14pt; line-height: 1.4; color: #000; margin: 20mm; }
          .official-header { display: flex; justify-content: space-between; margin-bottom: 25px; }
          table { width: 100%; border-collapse: collapse; margin-top: 15px; }
          .signature-box { margin-top: 40px; display: flex; justify-content: space-between; text-align: center; }
        </style>
      </head>
      <body>
        <table style="width: 100%; border: none; margin-bottom: 20px;">
          <tr>
            <td style="width: 45%; text-align: center; vertical-align: top;">
              <div style="font-weight: bold; font-size: 12pt;">TRƯỜNG PTDTBT THCS XÃ TRÀ ĐỐC</div>
              <div style="font-size: 11pt; font-style: italic;">BAN QUẢN LÝ NỘI TRÚ</div>
              <div style="margin-top: 4px; border-bottom: 1px solid #000; width: 120px; margin-left: auto; margin-right: auto;"></div>
            </td>
            <td style="width: 55%; text-align: center; vertical-align: top;">
              <div style="font-weight: bold; font-size: 12pt;">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</div>
              <div style="font-size: 11pt; font-weight: bold;">Độc lập - Tự do - Hạnh phúc</div>
              <div style="margin-top: 4px; border-bottom: 1px solid #000; width: 150px; margin-left: auto; margin-right: auto;"></div>
              <div style="margin-top: 8px; font-size: 10.5pt; font-style: italic;">Trà Đốc, ngày ${new Date().getDate()} tháng ${new Date().getMonth() + 1} năm ${new Date().getFullYear()}</div>
            </td>
          </tr>
        </table>

        <div style="text-align: center; margin: 25px 0 15px 0;">
          <h2 style="margin: 0; font-size: 18pt; text-transform: uppercase; color: #1e3a8a;">${data.title}</h2>
          ${data.subTitle ? `<div style="font-size: 12pt; font-style: italic; margin-top: 5px;">${data.subTitle}</div>` : ''}
        </div>

        ${statsHtml}

        <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
          <thead>
            <tr>${headersHtml}</tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>

        ${data.notes ? `<div style="margin-top: 15px; font-style: italic; font-size: 11pt;">* Ghi chú: ${data.notes}</div>` : ''}

        <table style="width: 100%; border: none; margin-top: 45px;">
          <tr>
            <td style="width: 50%; text-align: center; vertical-align: top;">
              <div style="font-weight: bold; font-size: 12pt;">NGƯỜI LẬP BÁO CÁO</div>
              <div style="font-style: italic; font-size: 10.5pt;">(Ký và ghi rõ họ tên)</div>
              <div style="height: 70px;"></div>
              <div style="font-weight: bold; font-size: 12pt;">${data.creatorName}</div>
            </td>
            <td style="width: 50%; text-align: center; vertical-align: top;">
              <div style="font-weight: bold; font-size: 12pt;">TRƯỞNG BAN QUẢN LÝ NỘI TRÚ</div>
              <div style="font-style: italic; font-size: 10.5pt;">(Ký duyệt và ghi rõ họ tên)</div>
              <div style="height: 70px;"></div>
              <div style="font-weight: bold; font-size: 12pt;">${data.reviewerName || 'Nguyễn Trọng Nghĩa'}</div>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    const blob = new Blob(['\ufeff', content], {
      type: 'application/msword'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileNamePrefix}_${new Date().toISOString().slice(0, 10)}.doc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  // Open formatted print preview ready for PDF saving
  openPrintPreview(data: ExportReportData): void {
    const printWindow = window.open('', '_blank', 'width=1000,height=800');
    if (!printWindow) {
      alert('Vui lòng cho phép popup để mở xem trước khi in!');
      return;
    }

    const rowsHtml = data.rows
      .map(
        (row, idx) => `
        <tr style="background-color: ${idx % 2 === 0 ? '#fff' : '#f8fafc'};">
          ${row.map(cell => `<td style="border: 1px solid #94a3b8; padding: 6px 8px; font-size: 11pt; text-align: left;">${cell ?? ''}</td>`).join('')}
        </tr>
      `
      )
      .join('');

    const headersHtml = data.headers
      .map(
        h => `<th style="border: 1px solid #475569; background-color: #f1f5f9; color: #0f172a; padding: 8px 6px; font-size: 11pt; text-align: center; font-weight: bold;">${h}</th>`
      )
      .join('');

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>${data.title}</title>
        <style>
          @page { size: A4; margin: 15mm; }
          body { font-family: 'Times New Roman', serif; color: #000; margin: 0; padding: 20px; font-size: 12pt; line-height: 1.4; }
          .header-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          .header-table td { border: none; }
          table.content-table { width: 100%; border-collapse: collapse; margin-top: 15px; }
          .btn-print {
            padding: 8px 16px; background-color: #2563eb; color: #fff; border: none; border-radius: 4px;
            cursor: pointer; font-size: 14px; font-weight: bold; margin-bottom: 20px;
          }
          @media print {
            .no-print { display: none !important; }
            body { padding: 0; }
          }
        </style>
      </head>
      <body>
        <div class="no-print" style="text-align: right; border-bottom: 1px solid #ddd; padding-bottom: 10px; margin-bottom: 20px;">
          <button class="btn-print" onclick="window.print()">🖨️ IN HOẶC LƯU PDF</button>
        </div>

        <table class="header-table">
          <tr>
            <td style="width: 45%; text-align: center; vertical-align: top;">
              <div style="font-weight: bold; font-size: 11pt;">TRƯỜNG PTDTBT THCS XÃ TRÀ ĐỐC</div>
              <div style="font-size: 10pt; font-style: italic;">BAN QUẢN LÝ NỘI TRÚ</div>
              <div style="border-bottom: 1px solid #000; width: 100px; margin: 4px auto;"></div>
            </td>
            <td style="width: 55%; text-align: center; vertical-align: top;">
              <div style="font-weight: bold; font-size: 11pt;">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</div>
              <div style="font-size: 10.5pt; font-weight: bold;">Độc lập - Tự do - Hạnh phúc</div>
              <div style="border-bottom: 1px solid #000; width: 120px; margin: 4px auto;"></div>
              <div style="font-size: 9.5pt; font-style: italic; margin-top: 4px;">Trà Đốc, ngày ${new Date().getDate()} tháng ${new Date().getMonth() + 1} năm ${new Date().getFullYear()}</div>
            </td>
          </tr>
        </table>

        <div style="text-align: center; margin: 20px 0 15px 0;">
          <h2 style="margin: 0; font-size: 16pt; text-transform: uppercase; color: #000;">${data.title}</h2>
          ${data.subTitle ? `<div style="font-size: 11pt; font-style: italic; margin-top: 4px;">${data.subTitle}</div>` : ''}
        </div>

        <table class="content-table">
          <thead><tr>${headersHtml}</tr></thead>
          <tbody>${rowsHtml}</tbody>
        </table>

        ${data.notes ? `<div style="margin-top: 15px; font-size: 10pt; font-style: italic;">* Ghi chú: ${data.notes}</div>` : ''}

        <table class="header-table" style="margin-top: 40px;">
          <tr>
            <td style="width: 50%; text-align: center; vertical-align: top;">
              <div style="font-weight: bold; font-size: 11pt;">NGƯỜI LẬP BÁO CÁO</div>
              <div style="font-style: italic; font-size: 9.5pt;">(Ký và ghi rõ họ tên)</div>
              <div style="height: 60px;"></div>
              <div style="font-weight: bold; font-size: 11pt;">${data.creatorName}</div>
            </td>
            <td style="width: 50%; text-align: center; vertical-align: top;">
              <div style="font-weight: bold; font-size: 11pt;">TRƯỜNG BAN QUẢN LÝ NỘI TRÚ</div>
              <div style="font-style: italic; font-size: 9.5pt;">(Ký duyệt và ghi rõ họ tên)</div>
              <div style="height: 60px;"></div>
              <div style="font-weight: bold; font-size: 11pt;">${data.reviewerName || 'Nguyễn Trọng Nghĩa'}</div>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  }
};
