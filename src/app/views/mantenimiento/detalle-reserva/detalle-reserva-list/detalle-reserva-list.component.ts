import { Component, OnInit, TemplateRef, ChangeDetectorRef } from '@angular/core';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { DetalleReservaModel } from 'src/app/models/detalleReservas.model';
import { DetallereservaService } from 'src/app/service/detallereserva.service';
import { PaqueteService } from 'src/app/service/paquete.service';
import { SesionService } from 'src/app/service/sesion.service';
import { ReservasService } from 'src/app/service/reservas.service';
import { ClientesService } from 'src/app/service/clientes.service';
import { UsuarioService } from 'src/app/service/usuario.service';
import { DestinoService } from 'src/app/service/destino.service';
import { ClienteModel } from 'src/app/models/clientes.model';
import { PaqueteModel } from 'src/app/models/paquete.model';
import { ReservasModel } from 'src/app/models/reservas.model';
import { Observable, forkJoin, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { UsuarioModel } from 'src/app/models/usuario.model';
import Swal from 'sweetalert2';

// Librerías para exportar Excel con estilos
import * as XLSX from 'xlsx-js-style';
import * as FileSaver from 'file-saver';

const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const EXCEL_EXTENSION = '.xlsx';

@Component({
  selector: 'app-detalle-reserva-list',
  templateUrl: './detalle-reserva-list.component.html',
  styleUrls: ['./detalle-reserva-list.component.css']
})
export class detalleReservaListComponent implements OnInit {
  page = 1;
  cantidadRegistros = 20;
  filtroCliente = '';
  filtroPaquete = '';
  filtro = '';

  modalRef?: BsModalRef;
  reserva: ReservasModel[] = [];

  detalleReservaSelected: DetalleReservaModel = new DetalleReservaModel();
  clienteSelect: ClienteModel = new ClienteModel();
  clienteList: ClienteModel[] = [];
  paquete: PaqueteModel[] = [];
  paqueteMap: Map<number, PaqueteModel> = new Map();
  paqueteselect: PaqueteModel = new PaqueteModel();
  destinoTiplist$!: Observable<any[]>;
  destinoTiplist: any = [];
  destino_nombreTipoMap: Map<number, string> = new Map();
  destino_monedaTipoMap: Map<number, string> = new Map();
  usuario: any = {};
  usuarioList: UsuarioModel[] = [];
  cliente: any = {};
  tituloModal: string = "";
  detalleExport: any = [];

  editandoEstatusId: number | null = null;
  estatusOpciones: string[] = ['Pendiente', 'Pagado', 'Cancelado'];

  // Fechas para el reporte
  fechaInicio: string = '';          // valor del input date (YYYY-MM-DD)
  fechaFin: string = '';
  fechaMinimaGlobal: Date | null = null;   // fecha más antigua de la BD
  fechaMaximaGlobal: Date | null = null;   // fecha más reciente de la BD
  fechaMinimaStr: string = '';
  fechaMaximaStr: string = '';

  headerColumns: any = [ /* ... (si lo usas para otra cosa) */ ];

  usuarioTipoMap: { [key: number]: string } = {};
  clienteTipoMap: { [key: number]: string } = {};
  paqueteTipoMap: { [key: number]: string } = {};

  constructor(
    private _sesionSevice: SesionService,
    private _destinoservice: DestinoService,
    private _detalleReservaervice: DetallereservaService,
    private _paqueteService: PaqueteService,
    private _reservasService: ReservasService,
    private _clienteservice: ClientesService,
    private _usuarioservice: UsuarioService,
    public modalService: BsModalService,
    private cdRef: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.loadData();
  }

  // Carga todos los datos y calcula las fechas extremas
  loadData() {
    forkJoin([
      this._paqueteService.getAll(),
      this._reservasService.getAll(this.cantidadRegistros),
      this._clienteservice.getAll(),
      this._usuarioservice.getAll(),
      this._destinoservice.getAll()
    ]).subscribe(([paquetes, reservas, clientes, usuarios, destinos]) => {
      this.paquete = paquetes;
      paquetes.forEach(p => {
        this.paqueteTipoMap[p.iD_Paquete] = p.nombre;
        this.paqueteMap.set(p.iD_Paquete, p);
      });

      reservas.forEach(r => {
        const paq = this.paqueteMap.get(r.iD_Paquete);
        if (paq) r.paquete = paq;
      });
      this.reserva = reservas;

      this.clienteList = clientes;
      clientes.forEach(c => {
        this.clienteTipoMap[c.iD_Cliente] = c.nombre;
      });

      this.usuarioList = usuarios;
      usuarios.forEach(u => {
        this.usuarioTipoMap[u.iD_Usuario] = `${u.nombre} ${u.apellido}`;
      });

      this.destinoTiplist = destinos;
      destinos.forEach(d => {
        this.destino_nombreTipoMap.set(d.iD_Destino, d.nombre);
        this.destino_monedaTipoMap.set(d.iD_Destino, d.moneda);
      });

      // --- Calcular fecha mínima y máxima del conjunto de reservas ---
      this.calcularFechasExtremas(reservas);
      this.cdRef.detectChanges();
    }, err => console.error(err));
  }

  /**
   * Recorre todas las reservas, parsea la fecha y determina la más antigua y la más reciente.
   * Formato esperado: "30/05/2026 11:20 pm"
   */
  private calcularFechasExtremas(reservas: ReservasModel[]) {
    let minDate: Date | null = null;
    let maxDate: Date | null = null;

    reservas.forEach(res => {
      const fecha = this.parseFechaReserva(res.fecha_Reserva);
      if (fecha) {
        if (!minDate || fecha < minDate) minDate = fecha;
        if (!maxDate || fecha > maxDate) maxDate = fecha;
      }
    });

    this.fechaMinimaGlobal = minDate;
    this.fechaMaximaGlobal = maxDate;

    // Convertir a string yyyy-mm-dd para los inputs type="date"
    if (minDate) {
      this.fechaMinimaStr = this.dateToYyyyMmDd(minDate);
    }
    if (maxDate) {
      this.fechaMaximaStr = this.dateToYyyyMmDd(maxDate);
    }

    // Opcional: establecer valores por defecto (todo el rango)
    if (minDate && maxDate) {
      this.fechaInicio = this.fechaMinimaStr;
      this.fechaFin = this.fechaMaximaStr;
    }
  }

  /**
   * Parsea una fecha con formato "dd/MM/yyyy hh:mm am/pm" a objeto Date.
   * Ejemplo: "30/05/2026 11:20 pm"
   */
  private parseFechaReserva(fechaStr: string): Date | null {
    if (!fechaStr) return null;
    const regex = /^(\d{2})\/(\d{2})\/(\d{4})\s+(\d{1,2}):(\d{2})\s*(am|pm)$/i;
    const match = fechaStr.trim().match(regex);
    if (!match) return null;

    let [, day, month, year, rawHours, minutes, period] = match;
    let h = parseInt(rawHours, 10);
    const m = parseInt(minutes, 10);
    const yearNum = parseInt(year, 10);
    const monthNum = parseInt(month, 10) - 1;
    const dayNum = parseInt(day, 10);

    if (period.toLowerCase() === 'pm' && h !== 12) h += 12;
    if (period.toLowerCase() === 'am' && h === 12) h = 0;

    return new Date(yearNum, monthNum, dayNum, h, m);
  }

  /**
   * Convierte un Date a string en formato yyyy-mm-dd (para input date)
   */
  private dateToYyyyMmDd(date: Date): string {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  private parseYyyyMmDdLocal(str: string): Date | null {
    if (!str) return null;
    const [y, m, d] = str.split('-').map(Number);
    return new Date(y, m - 1, d); // constructor local, sin UTC
  }

  /**
   * Valida que ambas fechas estén seleccionadas y que inicio <= fin
   */
  fechasValidas(): boolean {
    if (!this.fechaInicio || !this.fechaFin) return false;
    const start = this.parseYyyyMmDdLocal(this.fechaInicio);
    const end = this.parseYyyyMmDdLocal(this.fechaFin);
    return !!start && !!end && start <= end;
  }

  /**
   * Filtra las reservas según el rango de fechas seleccionado.
   * Incluye todas las reservas cuya fecha esté entre fechaInicio (00:00) y fechaFin (23:59:59).
   */
  private filtrarReservasPorRango(): ReservasModel[] {
    if (!this.fechaInicio || !this.fechaFin) return [];

    const startDate = this.parseYyyyMmDdLocal(this.fechaInicio)!;
    startDate.setHours(0, 0, 0, 0);
    const endDate = this.parseYyyyMmDdLocal(this.fechaFin)!;
    endDate.setHours(23, 59, 59, 999);

    return this.reserva.filter(res => {
      const fechaRes = this.parseFechaReserva(res.fecha_Reserva);
      if (!fechaRes) return false;
      return fechaRes >= startDate && fechaRes <= endDate;
    });
  }

  /**
   * Exporta a Excel con dos hojas: "Reservas" (datos filtrados) y "Resumen Ingresos" (totales por moneda)
   */
  exportarReporteIngresos() {
    if (!this.fechasValidas()) {
      Swal.fire('Rango inválido', 'La fecha de inicio debe ser anterior o igual a la fecha de fin.', 'warning');
      return;
    }

    const reservasFiltradas = this.filtrarReservasPorRango();
    if (reservasFiltradas.length === 0) {
      Swal.fire('Sin datos', 'No hay reservas en el rango de fechas seleccionado.', 'info');
      return;
    }

    // 1. Construir los datos para la hoja "Reservas"
    const datosReservas = reservasFiltradas.map((res, idx) => ({
      '#': idx + 1,
      'Cliente': this.clienteTipoMap[res.iD_Cliente] || '',
      'N° Personas': res.numero_Personas,
      'Paquete': this.paqueteTipoMap[res.iD_Paquete] || '',
      'Destino': this.destino_nombreTipoMap.get(res.paquete?.iD_Destino ?? 0) || '',
      'Precio': `${res.precio_Total} ${this.destino_monedaTipoMap.get(res.paquete?.iD_Destino ?? 0) || ''}`,
      'Observaciones': res.observaciones || '',
      'Fecha Reserva': res.fecha_Reserva,
      'Estado': res.estatus
    }));

    // 2. Construir resumen de ingresos por moneda
    const ingresosPorMoneda = new Map<string, number>();
    reservasFiltradas.forEach(res => {
      const moneda = this.destino_monedaTipoMap.get(res.paquete?.iD_Destino ?? 0) || 'N/A';
      const total = res.precio_Total;
      ingresosPorMoneda.set(moneda, (ingresosPorMoneda.get(moneda) || 0) + total);
    });
    const datosResumen = Array.from(ingresosPorMoneda.entries()).map(([moneda, total]) => ({
      'Moneda': moneda,
      'Ingreso Total': total.toFixed(2)
    }));

    // 3. Crear el libro de Excel con dos hojas
    const workbook = XLSX.utils.book_new();

    // --- Hoja 1: Reservas ---
    const wsReservas = this.createStyledSheet(datosReservas, [
      '#', 'Cliente', 'N° Personas', 'Paquete', 'Destino', 'Precio', 'Observaciones', 'Fecha Reserva', 'Estado'
    ]);
    XLSX.utils.book_append_sheet(workbook, wsReservas, 'Reservas');

    // --- Hoja 2: Resumen Ingresos ---
    const wsResumen = this.createStyledSheet(datosResumen, ['Moneda', 'Ingreso Total']);
    XLSX.utils.book_append_sheet(workbook, wsResumen, 'Resumen Ingresos');

    // 4. Exportar el archivo
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    this.saveAsExcelFile(excelBuffer, `Reporte_Ingresos_${this.fechaInicio}_a_${this.fechaFin}`);
  }

  /**
   * Crea una hoja de cálculo estilizada (encabezado negro, filas alternadas, bordes, ancho automático)
   */
  private createStyledSheet(data: any[], headers: string[]): XLSX.WorkSheet {
    // Construir matriz de datos
    const sheetData: any[][] = [headers];
    data.forEach(row => {
      const rowValues = headers.map(h => row[h] ?? '');
      sheetData.push(rowValues);
    });

    const ws = XLSX.utils.aoa_to_sheet(sheetData);

    // Estilos
    const headerStyle = {
      font: { bold: true, color: { rgb: 'FFFFFF' }, sz: 10, name: 'Arial' },
      fill: { fgColor: { rgb: '1A1A1A' } },
      alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
      border: { top: { style: 'thin', color: { rgb: '555555' } }, bottom: { style: 'thin', color: { rgb: '555555' } }, left: { style: 'thin', color: { rgb: '555555' } }, right: { style: 'thin', color: { rgb: '555555' } } }
    };
    const evenRowStyle = {
      font: { sz: 9, name: 'Arial' },
      fill: { fgColor: { rgb: 'F2F4F6' } },
      alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
      border: { top: { style: 'thin', color: { rgb: 'D0D0D0' } }, bottom: { style: 'thin', color: { rgb: 'D0D0D0' } }, left: { style: 'thin', color: { rgb: 'D0D0D0' } }, right: { style: 'thin', color: { rgb: 'D0D0D0' } } }
    };
    const oddRowStyle = {
      font: { sz: 9, name: 'Arial' },
      fill: { fgColor: { rgb: 'FFFFFF' } },
      alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
      border: { top: { style: 'thin', color: { rgb: 'D0D0D0' } }, bottom: { style: 'thin', color: { rgb: 'D0D0D0' } }, left: { style: 'thin', color: { rgb: 'D0D0D0' } }, right: { style: 'thin', color: { rgb: 'D0D0D0' } } }
    };

    const range = XLSX.utils.decode_range(ws['!ref']!);
    for (let R = range.s.r; R <= range.e.r; R++) {
      for (let C = range.s.c; C <= range.e.c; C++) {
        const addr = XLSX.utils.encode_cell({ r: R, c: C });
        if (!ws[addr]) ws[addr] = { v: '', t: 's' };
        if (R === 0) ws[addr].s = headerStyle;
        else ws[addr].s = (R % 2 === 0) ? evenRowStyle : oddRowStyle;
      }
    }

    // Ancho automático de columnas
    ws['!cols'] = headers.map((header, idx) => {
      let maxLen = header.length;
      data.forEach(row => {
        const cellValue = String(row[header] ?? '');
        if (cellValue.length > maxLen) maxLen = cellValue.length;
      });
      const wch = Math.min(Math.max(maxLen + 3, 10), 45);
      return { wch };
    });

    ws['!rows'] = [{ hpt: 22 }];
    return ws;
  }

  private saveAsExcelFile(buffer: any, fileName: string): void {
    const data: Blob = new Blob([buffer], { type: EXCEL_TYPE });
    FileSaver.saveAs(data, `${fileName}_${new Date().getTime()}${EXCEL_EXTENSION}`);
  }

  // -------------- El resto de tus métodos existentes (editar, eliminar, etc.) se conservan --------------

  getOpcionesEstatus(estatusActual: string): string[] {
    if (estatusActual === 'Pendiente') return ['Pendiente', 'Pagado', 'Cancelado'];
    if (estatusActual === 'Pagado') return ['Pagado', 'Cancelado'];
    return [estatusActual];
  }

  dentroDe24Horas(fechaReservaStr: string): boolean {
    if (!fechaReservaStr) return false;
    const regex = /^(\d{2})\/(\d{2})\/(\d{4})\s+(\d{1,2}):(\d{2})\s*(am|pm)$/i;
    const match = fechaReservaStr.trim().match(regex);
    if (!match) return false;
    let [, day, month, year, rawHours, minutes, period] = match;
    let h = parseInt(rawHours, 10);
    const m = parseInt(minutes, 10);
    if (period.toLowerCase() === 'pm' && h !== 12) h += 12;
    if (period.toLowerCase() === 'am' && h === 12) h = 0;
    const fechaReserva = new Date(parseInt(year, 10), parseInt(month, 10) - 1, parseInt(day, 10), h, m);
    if (isNaN(fechaReserva.getTime())) return false;
    const ahora = new Date();
    const diffHoras = (ahora.getTime() - fechaReserva.getTime()) / (1000 * 60 * 60);
    return diffHoras >= 0 && diffHoras <= 24;
  }

  puedeEditar(reservaItem: ReservasModel): boolean {
    if (reservaItem.estatus === 'Cancelado') return false;
    return this.dentroDe24Horas(reservaItem.fecha_Reserva);
  }

  abrirEditarEstatus(reservaItem: ReservasModel) {
    if (reservaItem.estatus === 'Cancelado') return;
    this.editandoEstatusId = this.editandoEstatusId === reservaItem.iD_Reserva ? null : reservaItem.iD_Reserva;
  }

  guardarEstatus(reservaItem: ReservasModel, nuevoEstatus: string) {
    if (reservaItem.estatus === 'Cancelado') {
      Swal.fire('No permitido', 'Una reserva cancelada no puede modificarse.', 'warning');
      this.editandoEstatusId = null;
      return;
    }
    if (reservaItem.estatus === 'Pagado' && nuevoEstatus === 'Pendiente') {
      Swal.fire('No permitido', 'Una reserva pagada no puede volver a Pendiente.', 'warning');
      this.editandoEstatusId = null;
      return;
    }
    if (nuevoEstatus === 'Cancelado' && !this.dentroDe24Horas(reservaItem.fecha_Reserva)) {
      Swal.fire({
        title: 'Cancelación no permitida',
        html: `La reserva fue registrada hace más de 24 horas.<br>
              Según nuestras políticas, <strong>solo se puede cancelar dentro de las primeras 24 horas</strong>
              desde la fecha de reserva.`,
        icon: 'error',
        confirmButtonColor: '#c0392b',
        confirmButtonText: 'Entendido'
      });
      this.editandoEstatusId = null;
      return;
    }
    if (reservaItem.estatus === nuevoEstatus) {
      this.editandoEstatusId = null;
      return;
    }

    const montoPenalidad = nuevoEstatus === 'Cancelado' ? Math.round(reservaItem.precio_Total * 0.10 * 100) / 100 : reservaItem.precio_Total;
    const montoDevolucion = nuevoEstatus === 'Cancelado' ? Math.round(reservaItem.precio_Total * 0.90 * 100) / 100 : 0;

    const textConfirm = nuevoEstatus === 'Cancelado'
      ? `El estado pasará a: <strong>Cancelado</strong>.<br><br>
        Precio original: <strong>${reservaItem.precio_Total}</strong><br>
        Penalidad (10%) que retiene la empresa: <strong>${montoPenalidad}</strong><br>
        Devolución al cliente (90%): <strong>${montoDevolucion}</strong>`
      : `El estado pasará a: <strong>${nuevoEstatus}</strong>`;

    Swal.fire({
      title: '¿Confirmar cambio de estado?',
      html: textConfirm,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, cambiar',
      cancelButtonText: 'Cancelar'
    }).then(result => {
      if (result.isConfirmed) {
        const cliente = this.clienteList.find(c => c.iD_Cliente === reservaItem.iD_Cliente)!;
        const paquete = this.paqueteMap.get(reservaItem.iD_Paquete)!;
        const destino = this.destino_nombreTipoMap.get(paquete?.iD_Destino ?? 0) ?? '';
        const moneda = this.destino_monedaTipoMap.get(paquete?.iD_Destino ?? 0) ?? '';

        const reservaActualizada: ReservasModel = {
          ...reservaItem,
          estatus: nuevoEstatus,
          precio_Total: montoPenalidad
        };

        this._reservasService.updateEstatus(reservaActualizada, cliente, paquete, destino, moneda)
          .pipe(switchMap(() => nuevoEstatus === 'Cancelado' ? this._reservasService.update(reservaActualizada) : of(null)))
          .subscribe(
            () => {
              reservaItem.estatus = nuevoEstatus;
              reservaItem.precio_Total = montoPenalidad;
              const msg = nuevoEstatus === 'Cancelado'
                ? `Estado actualizado a Cancelado.<br>Penalidad retenida: <strong>${montoPenalidad} ${moneda}</strong><br>Devolución al cliente: <strong>${montoDevolucion} ${moneda}</strong><br>Correo de cancelación enviado al cliente.`
                : 'El estado fue cambiado correctamente.';
              Swal.fire({ title: 'Actualizado', html: msg, icon: 'success' });
              this.editandoEstatusId = null;
            },
            (err: any) => {
              console.error(err);
              Swal.fire('Error', 'No se pudo actualizar el estado.', 'error');
            }
          );
      } else {
        this.editandoEstatusId = null;
      }
    });
  }

  editarRegistro(detalleReserva: DetalleReservaModel, template: TemplateRef<any>) {
    this.tituloModal = "EDITAR REGISTRO";
    this.detalleReservaSelected = detalleReserva;
    this.openModal(template);
  }

  crearRegistro(template: TemplateRef<any>) {
    this.tituloModal = "CREAR DETALLE RESERVA";
    this.detalleReservaSelected = new DetalleReservaModel();
    this.openModal(template);
  }

  openModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template);
  }

  recibeCloseModal(res: boolean) {
    if (res) this.loadData();
    this.modalRef?.hide();
  }

  modalDelete(detalleReserva: DetalleReservaModel) {
    Swal.fire({
      title: '¿Está seguro de eliminar el registro?',
      text: "¡No podrás revertir esto!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, bórralo!'
    }).then(result => {
      if (result.isConfirmed) {
        this._detalleReservaervice.delete(detalleReserva.iD_Pago).subscribe(
          (data: number) => {
            Swal.fire('Eliminado!', 'Registro eliminado de forma satisfactoria.', 'success');
            this.loadData();
          },
          err => console.error(err)
        );
      }
    });
  }

  onRegistrosChange() {
    this.page = 1;
    this.loadData();
  }

  trackById(index: number, item: any): number {
    return item.iD_Pago;
  }
}