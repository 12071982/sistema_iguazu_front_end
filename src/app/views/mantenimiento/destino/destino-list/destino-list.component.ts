import { Component, OnInit,TemplateRef } from '@angular/core';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { DestinoModel } from 'src/app/models/destino.model';
import { DestinoService } from 'src/app/service/destino.service';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-destino-list',
  templateUrl: './destino-list.component.html',
  styleUrls: ['./destino-list.component.css']
})
export class DestinoListComponent implements OnInit {
  modalRef?: BsModalRef;

  destino:DestinoModel[] = [];
  destinoSelected:DestinoModel = new DestinoModel();
  tituloModal:string = "";
  page = 1;
  cantidadRegistros: number = 10;
  filtro = '';
  constructor(
    private _destinoService:DestinoService,
    private modalService: BsModalService
  ) { }

  ngOnInit(): void {
    this.getAllDestino(this.cantidadRegistros);
  }

  getAllDestino(cantidad: number)
  {
    this._destinoService.getAll(cantidad).subscribe(
      (data:DestinoModel[]) => {
        this.destino = data;
        console.log(data);
      },
      err => {
        console.log(err);
      }
    );
  }

  editarRegistro(destino:DestinoModel,template: TemplateRef<any>)
  {
    this.tituloModal="EDITAR REGISTRO";
    this.destinoSelected = destino;
    this.openModal(template);
  }

  crearRegistro(template: TemplateRef<any>)
  {
    this.tituloModal="CREAR REGISTRO";
    this.destinoSelected = new DestinoModel();
    this.openModal(template);
  }

  openModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template);
  }

  recibeCloseModal(res:boolean)
  {
    if(res) //==> si es verdadero
    {
      this.getAllDestino(this.cantidadRegistros);      
    }
    this.modalRef?.hide();
  }

  modalDelete(destino:DestinoModel)
  {

    let res= Swal.fire({
      title: '¿Está seguro de eliminar el registro?',
      text: "¡No podrás revertir esto!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Si, bórralo!'
    }).then((result) => {
      if (result.isConfirmed) {
        this._destinoService.delete(destino.iD_Destino).subscribe(
            (data:number)=>{
            console.log(data);
        Swal.fire(
          'Eliminado!',
          'registro eliminado de forma satisfactoría.',
          'success'
        )
        this.getAllDestino(this.cantidadRegistros);
        });
        
      }
    })
  }

   // ...
   onRegistrosChange() {
    this.page = 1; // Reinicia la página actual a 0
    this.getAllDestino(this.cantidadRegistros); // Actualiza la lista de clientes según la cantidad seleccionada
  }
  // ...

}
