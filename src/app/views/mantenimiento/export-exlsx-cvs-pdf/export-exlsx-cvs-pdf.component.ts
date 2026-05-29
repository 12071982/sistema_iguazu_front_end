import { Component, Input, OnInit } from '@angular/core';
import * as XLSX from 'xlsx-js-style';
import * as FileSaver from 'file-saver';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const EXCEL_EXTENSION = '.xlsx';

@Component({
  selector: 'app-export-exlsx-cvs-pdf',
  templateUrl: './export-exlsx-cvs-pdf.component.html',
  styleUrls: ['./export-exlsx-cvs-pdf.component.css']
})
export class ExportExlsxCvsPdfComponent implements OnInit {

  @Input() columns: any[] = [];
  @Input() jsonData: any[] = [];
  @Input() fileName: string = 'data';

  /**
   * Callback opcional del padre para refrescar datos antes de exportar.
   * El padre debe tener la firma: refrescarYExportar(dispararDescarga: () => void): void
   * Si no se provee, se exporta con los datos actuales sin refresh.
   */
  @Input() onBeforeExport?: (dispararDescarga: () => void) => void;

  constructor() {}

  ngOnInit(): void {}

  // ─── Excel ────────────────────────────────────────────────────────────────

  exportJsonToExcel(): void {
    if (this.onBeforeExport) {
      // Primero el padre refresca; cuando termina llama a generarExcel()
      this.onBeforeExport(() => this.generarExcel());
    } else {
      this.generarExcel();
    }
  }

  private generarExcel(): void {
    const headers = this.columns.map((c: any) => c.header);

    // ── Estilos ──────────────────────────────────────────────────────────────

    const headerStyle = {
      font:      { bold: true, color: { rgb: 'FFFFFF' }, sz: 10, name: 'Arial' },
      fill:      { fgColor: { rgb: '1A1A1A' } },          // negro igual que el thead HTML
      alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
      border: {
        top:    { style: 'thin', color: { rgb: '555555' } },
        bottom: { style: 'thin', color: { rgb: '555555' } },
        left:   { style: 'thin', color: { rgb: '555555' } },
        right:  { style: 'thin', color: { rgb: '555555' } },
      },
    };

    const evenRowStyle = {
      font:      { sz: 9, name: 'Arial' },
      fill:      { fgColor: { rgb: 'F2F4F6' } },          // gris claro
      alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
      border: {
        top:    { style: 'thin', color: { rgb: 'D0D0D0' } },
        bottom: { style: 'thin', color: { rgb: 'D0D0D0' } },
        left:   { style: 'thin', color: { rgb: 'D0D0D0' } },
        right:  { style: 'thin', color: { rgb: 'D0D0D0' } },
      },
    };

    const oddRowStyle = {
      font:      { sz: 9, name: 'Arial' },
      fill:      { fgColor: { rgb: 'FFFFFF' } },           // blanco
      alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
      border: {
        top:    { style: 'thin', color: { rgb: 'D0D0D0' } },
        bottom: { style: 'thin', color: { rgb: 'D0D0D0' } },
        left:   { style: 'thin', color: { rgb: 'D0D0D0' } },
        right:  { style: 'thin', color: { rgb: 'D0D0D0' } },
      },
    };

    // ── Construir la matriz fila × columna ──────────────────────────────────

    const wsData: any[][] = [headers];
    this.jsonData.forEach((row: any) => {
      wsData.push(this.columns.map((c: any) => row[c.header] ?? ''));
    });

    const ws = XLSX.utils.aoa_to_sheet(wsData);

    // ── Aplicar estilos celda por celda ─────────────────────────────────────

    const range = XLSX.utils.decode_range(ws['!ref']!);
    for (let R = range.s.r; R <= range.e.r; R++) {
      for (let C = range.s.c; C <= range.e.c; C++) {
        const addr = XLSX.utils.encode_cell({ r: R, c: C });
        if (!ws[addr]) ws[addr] = { v: '', t: 's' };
        if (R === 0) {
          ws[addr].s = headerStyle;
        } else {
          ws[addr].s = R % 2 === 0 ? evenRowStyle : oddRowStyle;
        }
      }
    }

    // ── Ancho automático por columna ────────────────────────────────────────
    // Calcula el texto más largo entre encabezado y datos de cada columna

    ws['!cols'] = this.columns.map((col: any) => {
      const maxDataLen = this.jsonData.reduce((max: number, row: any) => {
        const val = String(row[col.header] ?? '');
        return val.length > max ? val.length : max;
      }, 0);
      const wch = Math.min(Math.max(col.header.length, maxDataLen) + 3, 45);
      return { wch };
    });

    // ── Altura fila encabezado ───────────────────────────────────────────────

    ws['!rows'] = [{ hpt: 22 }];

    // ── Guardar con FileSaver (igual que antes) ──────────────────────────────

    const workbook = { Sheets: { 'data': ws }, SheetNames: ['data'] };
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    this.saveAsExcelFile(excelBuffer, this.fileName);
  }

  saveAsExcelFile(buffer: any, fileName: string): void {
    const data: Blob = new Blob([buffer], { type: EXCEL_TYPE });
    FileSaver.saveAs(data, fileName + '_export_' + new Date().getTime() + EXCEL_EXTENSION);
  }

  // ─── PDF ──────────────────────────────────────────────────────────────────

  exportJsonToPdf(): void {
    if (this.onBeforeExport) {
      this.onBeforeExport(() => this.generarPdf());
    } else {
      this.generarPdf();
    }
  }

  private generarPdf(): void {
    const pdf = new jsPDF();
    pdf.text('REPORTE DE STOCK', 11, 8);
    (pdf as any).autoTable({
      columns: this.columns,
      body: this.jsonData,
      theme: 'grid',
      headStyles: {
        fillColor: [26, 26, 26],      // negro igual que el Excel
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        halign: 'center',
      },
      alternateRowStyles: {
        fillColor: [242, 244, 246],   // gris claro igual que el Excel
      },
      styles: {
        fontSize: 8,
        halign: 'center',
      },
    });
    pdf.save(`${this.fileName}.pdf`);
  }
}