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
import { Observable, forkJoin } from 'rxjs';
import { UsuarioModel } from 'src/app/models/usuario.model';

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

  // RESERVA
  detalleReservaSelected: DetalleReservaModel = new DetalleReservaModel();
  // CLIENTE
  clienteSelect: ClienteModel = new ClienteModel();
  clienteList: ClienteModel[] = [];
  // PAQUETE
  paquete: PaqueteModel[] = [];
  paqueteMap: Map<number, PaqueteModel> = new Map();
  paqueteselect: PaqueteModel = new PaqueteModel();
  destinoTiplist$!: Observable<any[]>;
  destinoTiplist: any = [];
  destino_nombreTipoMap: Map<number, string> = new Map();
  destino_monedaTipoMap: Map<number, string> = new Map();
  // USUARIO
  usuario: any = {};
  usuarioList: UsuarioModel[] = [];
  // CLIENTE
  cliente: any = {};

  tituloModal: string = "";
  detalleExport: any = [];

  headerColumns: any = [
    { header: 'ID DETALLE RESERVA', datakey: 'iD_Pago' },
    { header: 'USUARIO', datakey: 'nombre' },
    { header: 'CLIENTE', datakey: 'iD_Cliente' },
    { header: 'PERSONAS', datakey: 'numero_Personas' },
    { header: 'PAQUETE', datakey: 'nombre_paquete' },
    { header: 'DESTINO', datakey: 'destino_paquete' },
    { header: 'PRECIO', datakey: 'precio_base_paquete' },
    { header: 'MONEDA', datakey: 'moneda_paquete' },
    { header: 'FECHA RESERVA', datakey: 'fecha_Reserva' },
  ];

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

  loadData() {
    forkJoin([
      this._paqueteService.getAll(),
      this._reservasService.getAll(this.cantidadRegistros),
      this._clienteservice.getAll(),
      this._usuarioservice.getAll(),
      this._destinoservice.getAll()
    ]).subscribe(([paquetes, reservas, clientes, usuarios, destinos]) => {
      this.paquete = paquetes;
      paquetes.forEach(paquete => {
        this.paqueteTipoMap[paquete.iD_Paquete] = paquete.nombre;
        this.paqueteMap.set(paquete.iD_Paquete, paquete);
      });

      reservas.forEach(reserva => {
        const paquete = this.paqueteMap.get(reserva.iD_Paquete);
        if (paquete) {
          reserva.paquete = paquete;
        }
      });
      this.reserva = reservas;

      this.clienteList = clientes;
      clientes.forEach(cliente => {
        this.clienteTipoMap[cliente.iD_Cliente] = cliente.nombre;
      });

      this.usuarioList = usuarios;
      console.log('Usuarios cargados:', usuarios); // Añadir este log
      usuarios.forEach(usuario => {
        console.log(`Mapeando usuario ${usuario.iD_Usuario}: ${usuario.nombre} ${usuario.apellido}`); // Añadir este log
        this.usuarioTipoMap[usuario.iD_Usuario] = `${usuario.nombre} ${usuario.apellido}`;
      });

      console.log('usuarioTipoMap:', this.usuarioTipoMap); // Añadir este log

      this.destinoTiplist = destinos;
      destinos.forEach(destino => {
        this.destino_nombreTipoMap.set(destino.iD_Destino, destino.nombre);
        this.destino_monedaTipoMap.set(destino.iD_Destino, destino.moneda);
      });

      this.cdRef.detectChanges();
    }, err => {
      console.error(err);
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
    if (res) {
      this.loadData();
    }
    this.modalRef?.hide();
  }

  modalDelete(detalleReserva: DetalleReservaModel) {
    let res = confirm("¿Está seguro de eliminar el registro?");

    if (res) {
      this._detalleReservaervice.delete(detalleReserva.iD_Pago).subscribe(
        (data: number) => {
          console.log(data);
          alert("Registro eliminado de forma satisfactoria");
          this.loadData();
        },
        err => {
          console.error(err);
        }
      );
    }
  }

  PrintElem() {
    const mywindow: any = window.open('', 'PRINT', 'height=400,width=600');
    const html = document.getElementById("app2")?.innerHTML;
    mywindow.document.write('<html><head><title>' + document.title + '</title>');
    mywindow.document.write('</head><body>');
    mywindow.document.write('<h1>' + document.title + '</h1>');
    mywindow.document.write(html);
    mywindow.document.write('</body></html>');

    mywindow.document.close(); // necessary for IE >= 10
    mywindow.focus(); // necessary for IE >= 10

    mywindow.print();
  }

  onRegistrosChange() {
    this.page = 1; // Reinicia la página actual a 1
    this.loadData(); // Actualiza la lista de clientes según la cantidad seleccionada
  }

  trackById(index: number, item: any): number {
    return item.iD_Pago;
  }
}
