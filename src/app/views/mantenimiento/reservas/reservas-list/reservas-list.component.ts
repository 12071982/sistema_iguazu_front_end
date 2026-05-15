import { Component, OnInit, TemplateRef } from '@angular/core';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { ReservasModel } from 'src/app/models/reservas.model';
import { ReservasService } from 'src/app/service/reservas.service';
import { ClientesService } from 'src/app/service/clientes.service';
import { UsuarioService } from 'src/app/service/usuario.service';
import { Observable, of } from 'rxjs';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-reservas-list',
  templateUrl: './reservas-list.component.html',
  styleUrls: ['./reservas-list.component.css'],
})

export class ReservasListComponent implements OnInit {
  modalRef?: BsModalRef;
  filtro = '';
  page = 1;
  reservas_list = '';
  cantidadRegistros: number = 10;
  reservas: ReservasModel[] = [];
  reservasSelected: ReservasModel = new ReservasModel();
  tituloModal: string = "";

  clienteTiplist$!: Observable<any[]>;
  clienteTiplist: any[] = [];
  clienteTipoMap: Map<number, string> = new Map();

  usuarioTiplist$: Observable<any[]>;
  usuarioTiplist: any[] = [];
  nombre_usuarioTipoMap: Map<number, string> = new Map();

  nombre_moneda: string = '';

  constructor(
    private _clienteservice: ClientesService,
    private _usuarioservice: UsuarioService,
    private _reservasService: ReservasService,
    private modalService: BsModalService
  ) {
    this.usuarioTiplist$ = of([]); // Inicialización para evitar el error de compilación
  }

  ngOnInit(): void {
    this.getAllReservas(this.cantidadRegistros);
    this.clienteTiplist$ = this._clienteservice.getAll();
    this.usuarioTiplist$ = this._usuarioservice.getAll();
    this.refreshClientetipoMap();
    this.refreshUsuariotipoMap();
  }

  refreshClientetipoMap() {
    this._clienteservice.getAll().subscribe(data => {
      this.clienteTiplist = data;
      for (let i = 0; i < data.length; i++) {
        this.clienteTipoMap.set(this.clienteTiplist[i].iD_Cliente, `${this.clienteTiplist[i].nombre} ${this.clienteTiplist[i].apellido}`);
      }
    });
  }

  refreshUsuariotipoMap() {
    this._usuarioservice.getAll().subscribe(data => {
      this.usuarioTiplist = data;
      for (let i = 0; i < data.length; i++) {
        this.nombre_usuarioTipoMap.set(this.usuarioTiplist[i].iD_Usuario, `${this.usuarioTiplist[i].nombre} ${this.usuarioTiplist[i].apellido}`);
      }
      // Verificar que el mapa se ha llenado correctamente
      console.log(this.nombre_usuarioTipoMap);
    });
  }

  getAllReservas(cantidad: number) {
    this._reservasService.getAll(cantidad).subscribe(
      (data: ReservasModel[]) => {
        this.reservas = data;
        console.log(data);
      },
      err => {
        console.log(err);
      }
    );
  }

  editarRegistro(reservas: ReservasModel, template: TemplateRef<any>) {
    this.tituloModal = "EDITAR REGISTRO";
    this.reservasSelected = reservas;
    this.openModal(template);
  }

  crearRegistro(template: TemplateRef<any>) {
    this.tituloModal = "CREAR REGISTRO";
    this.reservasSelected = new ReservasModel();
    this.openModal(template);
  }

  openModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template);
  }

  recibeCloseModal(res: boolean) {
    if (res) {
      this.getAllReservas(this.cantidadRegistros);
    }
    this.modalRef?.hide();
  }

  modalDelete(reservas: ReservasModel) {
    let res = confirm("Está seguro de eliminar el registro");

    if (res) {
      this._reservasService.delete(reservas.iD_Reserva).subscribe(
        (data: number) => {
          Swal.fire({
            position: 'center',
            icon: 'success',
            title: 'Registro eliminado de forma satisfactoria',
            showConfirmButton: false,
            timer: 1650
          });
          this.getAllReservas(this.cantidadRegistros);
        },
        err => {
          console.log(err);
        }
      );
    }
  }

  onRegistrosChange() {
    this.page = 1;
    this.getAllReservas(this.cantidadRegistros);
  }
}
