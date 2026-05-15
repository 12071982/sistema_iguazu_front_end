import { Component, OnInit, TemplateRef } from '@angular/core';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { PaqueteModel } from 'src/app/models/paquete.model';
import { PaqueteService } from 'src/app/service/paquete.service';
import { DestinoService } from 'src/app/service/destino.service';
import { Observable } from 'rxjs';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-paquete-list',
  templateUrl: './paquete-list.component.html',
  styleUrls: ['./paquete-list.component.css'],
})
export class PaqueteListComponent implements OnInit {
  modalRef?: BsModalRef;
  page = 1;
  paquetes = '';
  paquete: PaqueteModel[] = [];
  paqueteSelected: PaqueteModel = new PaqueteModel();
  paqueteExport: any = [];
  tituloModal: string = '';
  cantidadRegistros: number = 10;
  destino_monedaTipoMap: Map<number, string> = new Map();

  headerColumns: any = [
    { header: 'ID PAQUETE', datakey: 'iD_Paquete' },
    { header: 'ID DESTINO', datakey: 'iD_Destino' },
    { header: 'NOMBRE DEL PAQUETE', datakey: 'nombre' },
    { header: 'DESCRIPCION', datakey: 'descripcion' },
    { header: 'DURACION', datakey: 'duracion' },
    { header: 'PRECIO BASE', datakey: 'precio_Base' },
    { header: 'TIPO', datakey: 'tipo' },
    { header: 'FECHA INICIO', datakey: 'fecha_Inicio' },
    { header: 'FECHA FIN', datakey: 'fecha_Fin' },
    { header: 'INCLUSIONES', datakey: 'inclusiones' },
    { header: 'EXCLUSIONES', datakey: 'exclusiones' },
  ];

  destinoTiplist$!: Observable<any[]>;
  destinoTiplist: any = [];
  destinoTipoMap: Map<number, string> = new Map();
  constructor(
    private _destinoservice: DestinoService,
    private _paqueteService: PaqueteService,
    private modalService: BsModalService
  ) {}

  ngOnInit(): void {
    this.getAllPaquete(this.cantidadRegistros);
    this.destinoTiplist$ = this._destinoservice.getAll();
    this.refreshDestinotipoMap();
    this.getAllPDF();
  }

  refreshDestinotipoMap() {
    this._destinoservice.getAll().subscribe((data) => {
      this.destinoTiplist = data;
      for (let i = 0; i < data.length; i++) {
        this.destinoTipoMap.set(
          this.destinoTiplist[i].iD_Destino,
          this.destinoTiplist[i].nombre
        );
        this.destino_monedaTipoMap.set(
          this.destinoTiplist[i].iD_Destino,
          this.destinoTiplist[i].moneda
        );
      }
    });
  }

  getAllPDF() {
    this.paquete = [];
    this.paqueteExport = [];
    this._paqueteService.getAll().subscribe(
      (data: PaqueteModel[]) => {
        this.paquete = data;
        this.paquete.map((x) => {
          this.paqueteExport.push({
            'Id Paquete': x.iD_Paquete,
            'Id Destino': x.iD_Destino,
            'Nombre Paquete': x.nombre,
            'Descripción': x.descripcion,
            'Duración': x.duracion,
            'Precio Base': x.precio_Base,
            'Tipo': x.tipo,
            'Fecha Inicio': x.fecha_Inicio,
            'Fecha Fin': x.fecha_Fin,
            'Inclusiones': x.inclusiones,
            'Exclusiones': x.exclusiones,
          });
        });
      },
      (err) => {}
    );
  }

  getAllPaquete(cantidad: number) {
    this._paqueteService.getAll(cantidad).subscribe(
      (data: PaqueteModel[]) => {
        this.paquete = data;
        console.log(data);
      },
      (err) => {
        console.log(err);
      }
    );
  }

  editarRegistro(paquete: PaqueteModel, template: TemplateRef<any>) {
    this.tituloModal = 'EDITAR REGISTRO';
    this.paqueteSelected = paquete;
    this.openModal(template);
  }

  crearRegistro(template: TemplateRef<any>) {
    this.tituloModal = 'CREAR REGISTRO';
    this.paqueteSelected = new PaqueteModel();
    this.openModal(template);
  }

  openModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template);
  }

  recibeCloseModal(res: boolean) {
    if (res) {
      //==> si es verdadero
      this.getAllPaquete(this.cantidadRegistros);
    }
    this.modalRef?.hide();
  }

  modalDelete(paquete: PaqueteModel) {
    let res = Swal.fire({
      title: '¿Está seguro de eliminar el registro?',
      text: '¡No podrás revertir esto!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Si, bórralo!',
    }).then((result) => {
      if (result.isConfirmed) {
        this._paqueteService
          .delete(paquete.iD_Paquete)
          .subscribe((data: number) => {
            console.log(data);
            Swal.fire(
              'Eliminado!',
              'registro eliminado de forma satisfactoría.',
              'success'
            );
            this.getAllPaquete(this.cantidadRegistros);
          });
      }
    });
  }

  PrintElem() {
    var mywindow: any = window.open('', 'PRINT', 'height=400,width=600');
    let html = document.getElementById('app2')?.innerHTML;
    mywindow.document.write(
      '<html><head><title>' + document.title + '</title>'
    );
    mywindow.document.write('</head><body >');
    mywindow.document.write('<h1>' + document.title + '</h1>');
    mywindow.document.write(html);
    mywindow.document.write('</body></html>');
    mywindow.document.close(); // necessary for IE >= 10
    mywindow.focus(); // necessary for IE >= 10*/
    mywindow.print();
  }

  // ...
  onRegistrosChange() {
    this.page = 1; // Reinicia la página actual a 0
    this.getAllPaquete(this.cantidadRegistros); // Actualiza la lista de clientes según la cantidad seleccionada
  }
  // ...
}