import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { forkJoin } from 'rxjs';
import { ReservasService } from 'src/app/service/reservas.service';
import { PaqueteService } from 'src/app/service/paquete.service';
import { DestinoService } from 'src/app/service/destino.service';
import { ReservasModel } from 'src/app/models/reservas.model';
import { PaqueteModel } from 'src/app/models/paquete.model';
import * as XLSX from 'xlsx-js-style';
import * as FileSaver from 'file-saver';
import Swal from 'sweetalert2';

declare const Chart: any;

const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const EXCEL_EXTENSION = '.xlsx';

interface TopItem { nombre: string; cantidad: number; }

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.css']
})
export class WelcomeComponent implements OnInit, OnDestroy {

  currentTime = new Date();
  currentHours!: number;
  currentMinutes!: number;
  currentSeconds!: number;
  am_pm!: string;
  private clockInterval: any;

  private reservasTodas: ReservasModel[] = [];
  private paqueteMap: Map<number, PaqueteModel> = new Map();
  private paqueteTipoMap: { [k: number]: string } = {};
  private destinoNombreMap: Map<number, string> = new Map();
  private destinoMonedaMap: Map<number, string> = new Map();

  fechaInicio = '';
  fechaFin = '';
  fechaMinimaStr = '';
  fechaMaximaStr = '';
  fechaMinimaGlobal: Date | null = null;
  fechaMaximaGlobal: Date | null = null;

  totalReservas = 0;
  totalIngresos = 0;
  topPaquetes: TopItem[] = [];
  topDestinos: TopItem[] = [];

  private charts: { [id: string]: any } = {};
  private readonly PALETTE = [
    '#2563EB','#16A34A','#F59E0B','#DC2626','#7C3AED',
    '#0891B2','#DB2777','#65A30D','#EA580C','#6366F1'
  ];

  constructor(
    private _reservasService: ReservasService,
    private _paqueteService: PaqueteService,
    private _destinoservice: DestinoService,
    private cdRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.iniciarReloj();
    this.cargarDatos();
  }

  ngOnDestroy(): void {
    clearInterval(this.clockInterval);
    Object.values(this.charts).forEach(c => c?.destroy());
  }

  private iniciarReloj(): void {
    const tick = () => {
      this.currentTime = new Date();
      this.currentHours = this.currentTime.getHours();
      this.currentMinutes = this.currentTime.getMinutes();
      this.currentSeconds = this.currentTime.getSeconds();
      this.am_pm = this.currentHours >= 12 ? 'p.m' : 'a.m';
      this.currentHours = this.currentHours % 12 || 12;
    };
    tick();
    this.clockInterval = setInterval(tick, 1000);
  }

  private cargarChartJs(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (typeof (window as any)['Chart'] !== 'undefined') { resolve(); return; }
      const existing = document.querySelector('script[data-chartjs]');
      if (existing) { existing.addEventListener('load', () => resolve()); return; }
      const script = document.createElement('script');
      script.setAttribute('data-chartjs', 'true');
      script.src = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('No se pudo cargar Chart.js'));
      document.head.appendChild(script);
    });
  }

  private cargarDatos(): void {
    forkJoin([
      this._paqueteService.getAll(),
      this._reservasService.getAll(9999),
      this._destinoservice.getAll()
    ]).subscribe(([paquetes, reservas, destinos]) => {
      paquetes.forEach(p => {
        this.paqueteMap.set(p.iD_Paquete, p);
        this.paqueteTipoMap[p.iD_Paquete] = p.nombre;
      });
      destinos.forEach(d => {
        this.destinoNombreMap.set(d.iD_Destino, d.nombre);
        this.destinoMonedaMap.set(d.iD_Destino, d.moneda);
      });
      reservas.forEach(r => {
        const paq = this.paqueteMap.get(r.iD_Paquete);
        if (paq) r.paquete = paq;
      });
      this.reservasTodas = reservas;
      this.calcularFechasExtremas(reservas);
      this.cdRef.detectChanges();
      this.cargarChartJs().then(() => setTimeout(() => this.renderizarGraficos(), 100))
        .catch(err => {
          console.error(err);
          Swal.fire('Sin gráficos', 'No se pudo cargar Chart.js. Verifica tu conexión.', 'warning');
        });
    }, err => console.error(err));
  }

  private calcularFechasExtremas(reservas: ReservasModel[]): void {
    let min: Date | null = null, max: Date | null = null;
    reservas.forEach(r => {
      const f = this.parseFecha(r.fecha_Reserva);
      if (f) {
        if (!min || f < min) min = f;
        if (!max || f > max) max = f;
      }
    });
    this.fechaMinimaGlobal = min;
    this.fechaMaximaGlobal = max;
    if (min) this.fechaMinimaStr = this.toYMD(min);
    if (max) this.fechaMaximaStr = this.toYMD(max);
    if (min && max) {
      this.fechaInicio = this.fechaMinimaStr;
      this.fechaFin = this.fechaMaximaStr;
    }
  }

  private parseFecha(s: string): Date | null {
    if (!s) return null;
    const m = s.trim().match(/^(\d{2})\/(\d{2})\/(\d{4})\s+(\d{1,2}):(\d{2})\s*(am|pm)$/i);
    if (!m) return null;
    let h = parseInt(m[4], 10);
    const mn = parseInt(m[5], 10);
    if (m[6].toLowerCase() === 'pm' && h !== 12) h += 12;
    if (m[6].toLowerCase() === 'am' && h === 12) h = 0;
    return new Date(+m[3], +m[2] - 1, +m[1], h, mn);
  }

  private toYMD(d: Date): string {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  fechasValidas(): boolean {
    if (!this.fechaInicio || !this.fechaFin) return false;
    return new Date(this.fechaInicio) <= new Date(this.fechaFin);
  }

  private filtrarPorRango(): ReservasModel[] {
    if (!this.fechaInicio || !this.fechaFin) return this.reservasTodas;
    const s = new Date(this.fechaInicio); s.setHours(0, 0, 0, 0);
    const e = new Date(this.fechaFin); e.setHours(23, 59, 59, 999);
    return this.reservasTodas.filter(r => {
      const f = this.parseFecha(r.fecha_Reserva);
      return f && f >= s && f <= e;
    });
  }

  aplicarFiltro(): void { this.renderizarGraficos(); }

  private renderizarGraficos(): void {
    const datos = this.filtrarPorRango();
    this.calcularKPIs(datos);
    this.renderTopPaquetes(datos);
    this.renderTopDestinos(datos);
    this.renderEstados(datos);
    this.renderPersonas(datos);
    this.renderTendencia(datos);
    this.cdRef.detectChanges();
  }

  private calcularKPIs(datos: ReservasModel[]): void {
    this.totalReservas = datos.length;
    this.totalIngresos = datos.reduce((sum, r) => sum + (r.precio_Total || 0), 0);

    const mapPaq = new Map<string, number>();
    datos.forEach(r => {
      const n = this.paqueteTipoMap[r.iD_Paquete] || 'Desconocido';
      mapPaq.set(n, (mapPaq.get(n) || 0) + 1);
    });
    this.topPaquetes = [...mapPaq.entries()]
      .map(([nombre, cantidad]) => ({ nombre, cantidad }))
      .sort((a, b) => b.cantidad - a.cantidad);

    const mapDest = new Map<string, number>();
    datos.forEach(r => {
      const n = this.destinoNombreMap.get(r.paquete?.iD_Destino ?? 0) || 'Desconocido';
      mapDest.set(n, (mapDest.get(n) || 0) + 1);
    });
    this.topDestinos = [...mapDest.entries()]
      .map(([nombre, cantidad]) => ({ nombre, cantidad }))
      .sort((a, b) => b.cantidad - a.cantidad);
  }

  private renderTopPaquetes(datos: ReservasModel[]): void {
    const top = this.topPaquetes.slice(0, 8);
    this.renderChart('chartTopPaquetes', {
      type: 'bar', data: {
        labels: top.map(t => t.nombre),
        datasets: [{ label: 'Reservas', data: top.map(t => t.cantidad), backgroundColor: this.PALETTE.slice(0, top.length), borderRadius: 4 }]
      },
      options: { indexAxis: 'y', responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { beginAtZero: true, ticks: { precision: 0 } } } }
    });
  }

  private renderTopDestinos(datos: ReservasModel[]): void {
    const top = this.topDestinos.slice(0, 8);
    this.renderChart('chartTopDestinos', {
      type: 'doughnut', data: {
        labels: top.map(t => t.nombre),
        datasets: [{ data: top.map(t => t.cantidad), backgroundColor: this.PALETTE, hoverOffset: 6 }]
      },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right', labels: { font: { size: 10 }, padding: 10 } } } }
    });
  }

  private renderEstados(datos: ReservasModel[]): void {
    const map: any = {};
    datos.forEach(r => map[r.estatus] = (map[r.estatus] || 0) + 1);
    const COLORES: any = { Pagado: '#16A34A', Pendiente: '#F59E0B', Cancelado: '#DC2626' };
    const labels = Object.keys(map);
    this.renderChart('chartEstados', {
      type: 'doughnut', data: {
        labels,
        datasets: [{ data: labels.map(l => map[l]), backgroundColor: labels.map(l => COLORES[l] || '#6B7280'), hoverOffset: 4 }]
      },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { font: { size: 10 } } } } }
    });
  }

  private renderPersonas(datos: ReservasModel[]): void {
    const map = new Map<string, number>();
    datos.forEach(r => {
      const n = this.paqueteTipoMap[r.iD_Paquete] || 'Desconocido';
      map.set(n, (map.get(n) || 0) + (r.numero_Personas || 0));
    });
    const entries = [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8);
    this.renderChart('chartPersonas', {
      type: 'bar', data: {
        labels: entries.map(e => e[0]),
        datasets: [{ label: 'Personas', data: entries.map(e => e[1]), backgroundColor: '#7C3AED', borderRadius: 4 }]
      },
      options: { indexAxis: 'y', responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { beginAtZero: true, ticks: { precision: 0 } } } }
    });
  }

  private renderTendencia(datos: ReservasModel[]): void {
    const map = new Map<string, number>();
    datos.forEach(r => {
      const f = this.parseFecha(r.fecha_Reserva);
      if (f) {
        const key = `${f.getFullYear()}-${String(f.getMonth() + 1).padStart(2, '0')}`;
        map.set(key, (map.get(key) || 0) + 1);
      }
    });
    const sorted = [...map.entries()].sort((a, b) => a[0].localeCompare(b[0]));
    const MESES = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
    this.renderChart('chartTendencia', {
      type: 'line', data: {
        labels: sorted.map(([k]) => { const [y, m] = k.split('-'); return `${MESES[+m - 1]} ${y}`; }),
        datasets: [{ label: 'Reservas', data: sorted.map(([, v]) => v), borderColor: '#2563EB', backgroundColor: 'rgba(37,99,235,0.1)', fill: true, tension: 0.3, pointRadius: 4, pointHoverRadius: 6 }]
      },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { precision: 0 } } } }
    });
  }

  private renderChart(canvasId: string, config: any): void {
    const el = document.getElementById(canvasId) as HTMLCanvasElement;
    if (!el) return;
    if (this.charts[canvasId]) { this.charts[canvasId].destroy(); delete this.charts[canvasId]; }
    this.charts[canvasId] = new Chart(el, config);
  }

  // ── Exportar Excel ────────────────────────────────────────
  exportarReportePaquetes(): void {
    if (!this.fechasValidas()) {
      Swal.fire('Rango inválido', 'La fecha de inicio debe ser anterior o igual a la fecha de fin.', 'warning');
      return;
    }
    const datos = this.filtrarPorRango();
    if (datos.length === 0) {
      Swal.fire('Sin datos', 'No hay reservas en el rango seleccionado.', 'info');
      return;
    }
    const wb = XLSX.utils.book_new();

    // Hoja 1: Top Paquetes (ingresos incluyen todos los estados)
    const mapPaq = new Map<string, { cantidad: number; personas: number; ingresos: number; moneda: string }>();
    datos.forEach(r => {
      const nombre = this.paqueteTipoMap[r.iD_Paquete] || 'Desconocido';
      const moneda = this.destinoMonedaMap.get(r.paquete?.iD_Destino ?? 0) || '';
      const cur = mapPaq.get(nombre) || { cantidad: 0, personas: 0, ingresos: 0, moneda };
      cur.cantidad++;
      cur.personas += r.numero_Personas || 0;
      cur.ingresos += r.precio_Total || 0;  // todos los estados
      mapPaq.set(nombre, cur);
    });
    const rowsPaq = [...mapPaq.entries()].sort((a, b) => b[1].cantidad - a[1].cantidad)
      .map(([nombre, v], i) => ({ '#': i + 1, 'Paquete': nombre, 'N° Reservas': v.cantidad, 'Total Personas': v.personas, 'Ingresos': `${v.ingresos.toFixed(2)} ${v.moneda}` }));
    XLSX.utils.book_append_sheet(wb, this.createStyledSheet(rowsPaq, ['#', 'Paquete', 'N° Reservas', 'Total Personas', 'Ingresos']), 'Top Paquetes');

    // Hoja 2: Top Destinos
    const mapDest = new Map<string, { cantidad: number; personas: number }>();
    datos.forEach(r => {
      const n = this.destinoNombreMap.get(r.paquete?.iD_Destino ?? 0) || 'Desconocido';
      const cur = mapDest.get(n) || { cantidad: 0, personas: 0 };
      cur.cantidad++; cur.personas += r.numero_Personas || 0;
      mapDest.set(n, cur);
    });
    const rowsDest = [...mapDest.entries()].sort((a, b) => b[1].cantidad - a[1].cantidad)
      .map(([nombre, v], i) => ({ '#': i + 1, 'Destino': nombre, 'N° Reservas': v.cantidad, 'Total Personas': v.personas }));
    XLSX.utils.book_append_sheet(wb, this.createStyledSheet(rowsDest, ['#', 'Destino', 'N° Reservas', 'Total Personas']), 'Top Destinos');

    // Hoja 3: Reservas por estado (incluye cancelados)
    const mapEst = new Map<string, number>();
    datos.forEach(r => mapEst.set(r.estatus, (mapEst.get(r.estatus) || 0) + 1));
    const rowsEst = [...mapEst.entries()].map(([estado, cantidad], i) => ({ '#': i + 1, 'Estado': estado, 'Cantidad': cantidad }));
    XLSX.utils.book_append_sheet(wb, this.createStyledSheet(rowsEst, ['#', 'Estado', 'Cantidad']), 'Reservas por Estado');

    const buffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([buffer], { type: EXCEL_TYPE });
    FileSaver.saveAs(blob, `Reporte_${this.fechaInicio}_a_${this.fechaFin}_${Date.now()}${EXCEL_EXTENSION}`);
  }

  private createStyledSheet(data: any[], headers: string[]): any {
    const sheetData = [headers, ...data.map(row => headers.map(h => row[h] ?? ''))];
    const ws = XLSX.utils.aoa_to_sheet(sheetData);
    const headerStyle = {
      font: { bold: true, color: { rgb: 'FFFFFF' }, sz: 10, name: 'Arial' },
      fill: { fgColor: { rgb: '1A1A1A' } },
      alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
      border: { top: { style: 'thin', color: { rgb: '555555' } }, bottom: { style: 'thin', color: { rgb: '555555' } }, left: { style: 'thin', color: { rgb: '555555' } }, right: { style: 'thin', color: { rgb: '555555' } } }
    };
    const evenStyle = {
      font: { sz: 9, name: 'Arial' }, fill: { fgColor: { rgb: 'F2F4F6' } },
      alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
      border: { top: { style: 'thin', color: { rgb: 'D0D0D0' } }, bottom: { style: 'thin', color: { rgb: 'D0D0D0' } }, left: { style: 'thin', color: { rgb: 'D0D0D0' } }, right: { style: 'thin', color: { rgb: 'D0D0D0' } } }
    };
    const oddStyle = { ...evenStyle, fill: { fgColor: { rgb: 'FFFFFF' } } };
    const range = XLSX.utils.decode_range(ws['!ref']!);
    for (let R = range.s.r; R <= range.e.r; R++) {
      for (let C = range.s.c; C <= range.e.c; C++) {
        const addr = XLSX.utils.encode_cell({ r: R, c: C });
        if (!ws[addr]) ws[addr] = { v: '', t: 's' };
        ws[addr].s = R === 0 ? headerStyle : (R % 2 === 0 ? evenStyle : oddStyle);
      }
    }
    ws['!cols'] = headers.map(h => {
      let max = h.length;
      data.forEach(row => { const v = String(row[h] ?? ''); if (v.length > max) max = v.length; });
      return { wch: Math.min(Math.max(max + 3, 10), 45) };
    });
    ws['!rows'] = [{ hpt: 22 }];
    return ws;
  }
}