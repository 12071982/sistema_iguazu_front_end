import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UsuarioModel } from 'src/app/models/usuario.model';
import { UsuarioService } from 'src/app/service/usuario.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-usuario-register',
  templateUrl: './usuario-register.component.html',
  styleUrls: ['./usuario-register.component.css']
})
export class UsuarioRegisterComponent implements OnInit {

  /*VARIABLES DE ENTRADA */
  @Input() usuario: UsuarioModel = new UsuarioModel();
  /*VARIABLES DE SALIDA */
  @Output() closeModalEmmit = new EventEmitter<boolean>();

  myForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private _usuarioService: UsuarioService
  ) {
    this.myForm = this.fb.group({
      iD_Usuario: [null, [Validators.required]],
      nombre: [null, [Validators.required]],
      apellido: [null, [Validators.required]],
      correo_Electronico: [null, [Validators.required]],
      password: [null, [Validators.required]],
      rol: [null, [Validators.required]],
      fecha_Registro: [null, [Validators.required]],
      estatus: [null, [Validators.required]],
    });
  }

  get f() { return this.myForm.controls; }

  ngOnInit(): void {
    /*FIXME: SET VALUE TRAE ERRORES CUANDO LOS ATRIBUTOS NO COINCIDEN AL 100% */
    //this.myForm.setValue(this.estado);
    this.myForm.patchValue(this.usuario);
  }

  closeModal(res: boolean) {
    this.closeModalEmmit.emit(res);
  }

  save()
  {
    /*FIXME: SI POR A O B, TENEMOS UN CAMPO DES-HABILITADO DESDE ANGULAR / NO TRAE ESE VALOR */
    //this.estado = this.myForm.value();
    
    this.usuario = this.myForm.getRawValue()
    if(this.usuario.iD_Usuario == 0)
    {
      this.createUsuario();
      
    }
    else{
      this.updateUsuario();
    }

  }

  createUsuario()
  {
    this._usuarioService.create(this.usuario).subscribe(
      (data:UsuarioModel)=>{
        //alert("Registro creado de forma satisfactoría");
        Swal.fire({
          position: 'center',
          icon: 'success',
          title: 'Registro creado de forma satisfactoría',
          showConfirmButton: false,
          timer:1650
          });
        this.closeModalEmmit.emit(true);
      },
      err => {
        console.log(err);
        this.closeModalEmmit.emit(false);
      }
    );
  }
  updateUsuario()
  {
    this._usuarioService.update(this.usuario).subscribe(
      (data:UsuarioModel)=>{
        //alert("Registro actualizado de forma satisfactoría");
        Swal.fire({
          position: 'center',
          icon: 'success',
          title: 'Registro actualizado de forma satisfactoría',
          showConfirmButton: false,
          timer:1650
          });
        this.closeModalEmmit.emit(true);
      },
      err => {
        console.log(err);
        this.closeModalEmmit.emit(false);
      }
    );
  }
}

