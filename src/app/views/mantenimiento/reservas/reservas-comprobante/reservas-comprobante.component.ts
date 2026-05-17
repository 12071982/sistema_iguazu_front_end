import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core'; // 👈 Añadido OnChanges y SimpleChanges
import { ClienteModel } from 'src/app/models/clientes.model';
import { PaqueteModel } from 'src/app/models/paquete.model';
import { ReservasModel } from 'src/app/models/reservas.model';
import { ClientesService } from 'src/app/service/clientes.service';
import { PaqueteService } from 'src/app/service/paquete.service';
import { ReservasService } from 'src/app/service/reservas.service';
import { DestinoService } from 'src/app/service/destino.service';
import { forkJoin } from 'rxjs';
import html2canvas from 'html2canvas';

@Component({
  selector: 'app-reservas-comprobante',
  templateUrl: './reservas-comprobante.component.html',
  styleUrls: ['./reservas-comprobante.component.css'],
})
export class ReservasComprobanteComponent implements OnInit, OnChanges { // 👈 Implementamos OnChanges
  @Input() reserva: ReservasModel = new ReservasModel();
  @Input() acompanantes: ClienteModel[] = [];
  @Input() pagarCon: number = 0;
  @Input() vuelto: number = 0;

  cliente: ClienteModel = new ClienteModel();
  paquete?: PaqueteModel;
  total: number = 0.0;
  nroOperacion: string = '';
  destino_nombreTipoMap: Map<number, string> = new Map();
  destino_monedaTipoMap: Map<number, string> = new Map();

  // Control de carga
  cargando: boolean = true;
  error: boolean = false;

  constructor(
    private _clienteservice: ClientesService,
    private _paqueteService: PaqueteService,
    private _reservasService: ReservasService,
    private _destinoService: DestinoService
  ) {}

  ngOnInit(): void {
    this.nroOperacion = `00${this.reserva.iD_Reserva}`;
    this.loadData();
  }

  // ⚡ Captura los cambios de los @Input() en tiempo real cuando el padre los envía
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['pagarCon'] && !changes['pagarCon'].firstChange) {
      console.log('🔄 Actualización - Pagar con recibido:', changes['pagarCon'].currentValue);
    }
    if (changes['vuelto'] && !changes['vuelto'].firstChange) {
      console.log('🔄 Actualización - Vuelto recibido:', changes['vuelto'].currentValue);
    }
    
    // Si la reserva cambia (por ejemplo, al abrir un nuevo comprobante), refrescamos los datos e ID
    if (changes['reserva'] && !changes['reserva'].firstChange) {
      this.nroOperacion = `00${this.reserva.iD_Reserva}`;
      this.loadData();
    }
  }

  loadData() {
    this.cargando = true;
    this.error = false;

    // Validación preventiva por si la reserva aún no se ha cargado correctamente
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
        this.paquete = paquetesData.find(
          (p) => p.iD_Paquete === this.reserva.iD_Paquete
        );

        if (!this.paquete) {
          console.error('Paquete no encontrado con ID:', this.reserva.iD_Paquete);
        }

        this.initDestinoMaps(destinosData);
        this.cargando = false;

        // Monitoreo de flujo de datos consolidado
        console.log('=== DATOS CARGADOS EN BOLETA ===');
        console.log('Cliente Titular:', this.cliente);
        console.log('Paquete Seleccionado:', this.paquete);
        console.log('Acompañantes:', this.acompanantes);
        console.log('Monto Entregado (pagarCon):', this.pagarCon);
        console.log('Vuelto Calculado:', this.vuelto);
      },
      (err) => {
        console.error('Error al cargar datos del comprobante:', err);
        this.cargando = false;
        this.error = true;
      }
    );
  }

  initDestinoMaps(destinos: any[]) {
    this.destino_nombreTipoMap.clear(); // Limpiamos mapas viejos para evitar duplicados en memoria
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
    if (iD_Destino !== undefined) {
      return this.destino_monedaTipoMap.get(iD_Destino) || '';
    }
    return '';
  }

  getPrecioPersona(): number {
    if (!this.reserva.numero_Personas || this.reserva.numero_Personas === 0) {
      return this.reserva.precio_Total || 0;
    }
    return (this.reserva.precio_Total || 0) / this.reserva.numero_Personas;
  }

  getAllPasajeros(): ClienteModel[] {
    const todos = [this.cliente, ...this.acompanantes];
    return todos.filter((p) => p && p.iD_Cliente);
  }

  PrintElem() {
    const elem = document.getElementById('app2');
    if (!elem) {
      alert("No se encontró el elemento con id 'app2'");
      return;
    }

    const mywindow: any = window.open('', 'PRINT', 'height=1000,width=800');

    mywindow.document.write(
      `<html><head><title>${document.title}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #ddd; padding: 8px; }
        thead { background-color: #f5f5f5; }
        img { max-width: 100%; }
      </style>
      </head><body>`
    );

    html2canvas(elem, { allowTaint: true, useCORS: true }).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      mywindow.document.write(`<img src="${imgData}" style="width:100%;" />`);
      mywindow.document.write('</body></html>');
      mywindow.document.close();
      mywindow.focus();
      setTimeout(() => {
        mywindow.print();
      }, 500);
    });
  }
}