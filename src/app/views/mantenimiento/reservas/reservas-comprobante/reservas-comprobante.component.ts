import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { ClienteModel } from 'src/app/models/clientes.model';
import { PaqueteModel } from 'src/app/models/paquete.model';
import { ReservasModel } from 'src/app/models/reservas.model';
import { ClientesService } from 'src/app/service/clientes.service';
import { PaqueteService } from 'src/app/service/paquete.service';
import { DestinoService } from 'src/app/service/destino.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-reservas-comprobante',
  templateUrl: './reservas-comprobante.component.html',
  styleUrls: ['./reservas-comprobante.component.css'],
})
export class ReservasComprobanteComponent implements OnInit, OnChanges {
  @Input() reserva: ReservasModel = new ReservasModel();
  @Input() acompanantes: ClienteModel[] = [];
  @Input() pagarCon: number = 0;
  @Input() vuelto: number = 0;
  @Input() pdfBase64: string = ''; // <-- Recibe el PDF desde el padre

  cliente: ClienteModel = new ClienteModel();
  paquete?: PaqueteModel;
  nroOperacion: string = '';
  destino_nombreTipoMap: Map<number, string> = new Map();
  destino_monedaTipoMap: Map<number, string> = new Map();

  cargando: boolean = true;
  error: boolean = false;

  constructor(
    private _clienteservice: ClientesService,
    private _paqueteService: PaqueteService,
    private _destinoService: DestinoService
  ) { }

  ngOnInit(): void {
    this.actualizarNroOperacion();
    this.loadData();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['reserva'] && !changes['reserva'].firstChange) {
      this.actualizarNroOperacion();
      this.loadData();
    }
  }

  private actualizarNroOperacion(): void {
    this.nroOperacion = this.reserva.numero_Transaccion ||
      (this.reserva.iD_Reserva ? `00${this.reserva.iD_Reserva}` : '');
  }

  loadData() {
    this.cargando = true;
    this.error = false;
    if (!this.reserva || !this.reserva.iD_Cliente) {
      this.cargando = false;
      return;
    }
    forkJoin([
      this._clienteservice.getById(this.reserva.iD_Cliente),
      this._paqueteService.getAll(),
      this._destinoService.getAll(),
    ]).subscribe(
      ([clienteData, paquetesData, destinosData]) => {
        this.cliente = clienteData;
        this.paquete = paquetesData.find(p => p.iD_Paquete === this.reserva.iD_Paquete);
        this.initDestinoMaps(destinosData);
        this.cargando = false;
      },
      (err) => {
        console.error(err);
        this.cargando = false;
        this.error = true;
      }
    );
  }

  initDestinoMaps(destinos: any[]) {
    this.destino_nombreTipoMap.clear();
    this.destino_monedaTipoMap.clear();
    for (let destino of destinos) {
      this.destino_nombreTipoMap.set(destino.iD_Destino, destino.nombre);
      this.destino_monedaTipoMap.set(destino.iD_Destino, destino.moneda);
    }
  }

  getDestinoNombre(iD_Destino: number): string {
    return this.destino_nombreTipoMap.get(iD_Destino) || 'Desconocido';
  }

  getMonedaNombre(iD_Destino?: number): string {
    if (iD_Destino !== undefined) return this.destino_monedaTipoMap.get(iD_Destino) || '';
    return '';
  }

  PrintElem() {
    const elem = document.getElementById('app2');
    if (!elem) {
      alert("No se encontró el elemento con id 'app2'");
      return;
    }
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (!printWindow) {
      alert('Por favor, permita ventanas emergentes para imprimir');
      return;
    }
    const htmlContent = elem.outerHTML;
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Comprobante de Reserva</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: Arial, sans-serif; background: white; display: flex; justify-content: center; padding: 20px; }
            #app2 { width: 80mm; margin: 0 auto; background: white; }
            @media print {
              body { padding: 0; }
              button, .btn { display: none; }
            }
          </style>
        </head>
        <body>${htmlContent}</body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.onafterprint = () => printWindow.close();
  }

  // Nuevo método para descargar el PDF recibido desde el backend
  descargarPDF() {
    if (!this.pdfBase64) {
      alert('No hay PDF disponible para descargar');
      return;
    }
    try {
      const byteCharacters = atob(this.pdfBase64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `comprobante_${this.nroOperacion}.pdf`;
      link.click();
      URL.revokeObjectURL(link.href);
    } catch (error) {
      console.error('Error al descargar PDF:', error);
      alert('Error al descargar el PDF');
    }
  }
}