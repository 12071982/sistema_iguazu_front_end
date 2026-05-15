import { Component, OnInit,TemplateRef } from '@angular/core';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import {  UsuarioModel} from 'src/app/models/usuario.model';
import { UsuarioService } from 'src/app/service/usuario.service';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-usuario-list',
  templateUrl: './usuario-list.component.html',
  styleUrls: ['./usuario-list.component.css']
})
export class UsuarioListComponent implements OnInit {
  modalRef?: BsModalRef;
  usuario:UsuarioModel[] = [];
  usuarioSelected:UsuarioModel = new UsuarioModel();
  tituloModal:string = "";
  page = 1;
  cantidadRegistros: number = 10;
  filtro='';
  constructor(
    private _usuarioService:UsuarioService,
    private modalService: BsModalService
  ) { }

  ngOnInit(): void {
    this.getAllUsuario(this.cantidadRegistros);
  }

  getAllUsuario(cantidad: number)
  {
    this._usuarioService.getAll(cantidad).subscribe(
      (data:UsuarioModel[]) => {
        this.usuario = data;
        console.log(data);
      },
      err => {
        console.log(err);
      }
    );
  }

  editarRegistro(usuario:UsuarioModel,template: TemplateRef<any>)
  {
    this.tituloModal="EDITAR REGISTRO";
    this.usuarioSelected = usuario;
    this.openModal(template);
  }

  crearRegistro(template: TemplateRef<any>)
  {
    this.tituloModal="CREAR REGISTRO";
    this.usuarioSelected = new UsuarioModel();
    this.openModal(template);
  }

  openModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template);
  }


  recibeCloseModal(res:boolean)
  {
    if(res) //==> si es verdadero
    {
      this.getAllUsuario(this.cantidadRegistros);      
    }
    this.modalRef?.hide();
  }


  modalDelete(usuario:UsuarioModel)
  {

    let res= Swal.fire({
      title: '¿Está seguro de eliminar este usuario?',
      text: "¡No podrás revertir esto!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Si, bórralo!'
    }).then((result) => {
      if (result.isConfirmed) {
        this._usuarioService.delete(usuario.iD_Usuario).subscribe(
           (data:number)=>{
            console.log(data);
        Swal.fire(
          'Usuario Eliminado!',
          'Se a eliminado el usuario de forma satisfactoría.',
          'success'
        )
        this.getAllUsuario(this.cantidadRegistros);
        });
        
      }
    })
    // let res = confirm("Está seguro de eliminar el registro");

    // if(res) // si es verdadero
    // {
    //   this._usuarioService.delete(usuario.idUsuario).subscribe(
    //     (data:number)=>{
    //       console.log(data);
    //       alert("registro eliminado de forma satisfactoría");
    //       this.getAllUsuario();
    //     },
    //     err =>{
    //       //alert("ocurrio un error");
    //     }
    //   );
    // }
  }

  // ...
  onRegistrosChange() {
    this.page = 1; // Reinicia la página actual a 0
    this.getAllUsuario(this.cantidadRegistros); // Actualiza la lista de clientes según la cantidad seleccionada
  }
  // ...
}
