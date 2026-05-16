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
    iD_Usuario: [0],
    nombre: ['', [Validators.required]],
    apellido: ['', [Validators.required]],
    correo_Electronico: ['', [Validators.required]], 
    password: ['', [Validators.required]],
    rol: ['', [Validators.required]],
    fecha_Registro: [''],
    estatus: ['', [Validators.required]],
  });
  }

  get f() { return this.myForm.controls; }

  ngOnInit(): void {
    if (this.usuario && this.usuario.iD_Usuario > 0) {
      this.myForm.patchValue(this.usuario);
      this.myForm.get('password')?.setValue('');
      this.myForm.get('password')?.setValidators(null);
    } else {
      this.myForm.get('password')?.setValidators([Validators.required]);
    }
    this.myForm.get('password')?.updateValueAndValidity();
  }

  closeModal(res: boolean) {
    this.closeModalEmmit.emit(res);
  }

  save() {
    if (this.myForm.invalid) {
      this.myForm.markAllAsTouched();
      Swal.fire('Atención', 'Por favor, completa todos los campos obligatorios', 'warning');
      return;
    }

    const formValues = this.myForm.getRawValue();

    if (formValues.iD_Usuario > 0 && !formValues.password) {
      formValues.password = this.usuario.password;
    }

    this.usuario = formValues;

    if (this.usuario.iD_Usuario === 0 || this.usuario.iD_Usuario == null) {
      // NO enviar iD_Usuario en creación
      const usuarioParaCrear = { ...this.usuario };
      delete (usuarioParaCrear as any).iD_Usuario;
      this.usuario = usuarioParaCrear;
      this.createUsuario();
    } else {
      this.updateUsuario();
    }
  }

  createUsuario() {
    this._usuarioService.create(this.usuario).subscribe(
      (data: UsuarioModel) => {
        Swal.fire({
          position: 'center',
          icon: 'success',
          title: 'Registro creado de forma satisfactoria',
          showConfirmButton: false,
          timer: 1650
        });
        this.closeModalEmmit.emit(true);
      },
      err => {
        console.error('Objeto de error completo:', err);
        let errorMsg = "Error interno al intentar crear el usuario.";
        
        if (typeof err.error === 'string') {
          errorMsg = err.error;
        } else if (err.error && err.error.message) {
          errorMsg = err.error.message;
        } else if (err.message) {
          errorMsg = err.message;
        }

        Swal.fire('Error en el Servidor', errorMsg, 'error');
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

