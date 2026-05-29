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
import Swal from 'sweetalert2';

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

  // ── NUEVO: control de edición de estado inline ──
  editandoEstatusId: number | null = null;
  estatusOpciones: string[] = ['Pendiente', 'Pagado', 'Cancelado'];
  // ────────────────────────────────────────────────

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
        if (paquete) reserva.paquete = paquete;
      });
      this.reserva = reservas;

      this.clienteList = clientes;
      clientes.forEach(cliente => {
        this.clienteTipoMap[cliente.iD_Cliente] = cliente.nombre;
      });

      this.usuarioList = usuarios;
      usuarios.forEach(usuario => {
        this.usuarioTipoMap[usuario.iD_Usuario] = `${usuario.nombre} ${usuario.apellido}`;
      });

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

  // ── NUEVO: abrir/cerrar el select inline de estado ──
  abrirEditarEstatus(id: number) {
    this.editandoEstatusId = this.editandoEstatusId === id ? null : id;
  }

  guardarEstatus(reservaItem: ReservasModel, nuevoEstatus: string) {
    if (reservaItem.estatus === nuevoEstatus) {
      this.editandoEstatusId = null;
      return;
    }

    Swal.fire({
      title: '¿Cambiar estado?',
      text: `El estado pasará a: ${nuevoEstatus}`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, cambiar',
      cancelButtonText: 'Cancelar'
    }).then(result => {
      if (result.isConfirmed) {
        const reservaActualizada: ReservasModel = { ...reservaItem, estatus: nuevoEstatus };

        this._reservasService.updateEstatus(reservaActualizada).subscribe(
          () => {
            reservaItem.estatus = nuevoEstatus;
            Swal.fire('Actualizado', 'El estado fue cambiado correctamente.', 'success');
            this.editandoEstatusId = null;
          },
          (err: any) => {                    // ← tipado explícito
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