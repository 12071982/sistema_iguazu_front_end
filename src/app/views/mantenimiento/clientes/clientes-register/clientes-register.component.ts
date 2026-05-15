import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ClienteModel } from 'src/app/models/clientes.model';
import { ClientesService } from 'src/app/service/clientes.service';
import Swal from 'sweetalert2';
import { DatePipe } from '@angular/common';
import { UsuarioModel } from 'src/app/models/usuario.model';
import { SesionService } from 'src/app/service/sesion.service'; // Importa el servicio de sesión

@Component({
  selector: 'app-clientes-register',
  templateUrl: './clientes-register.component.html',
  styleUrls: ['./clientes-register.component.css']
})
export class ClientesRegisterComponent implements OnInit {

  @Input() clientes: ClienteModel = new ClienteModel();
  @Output() closeModalEmmit = new EventEmitter<boolean>();

  myForm: FormGroup;
  pipe = new DatePipe('en-US');
  usuario: UsuarioModel[] = [];

  constructor(
    private fb: FormBuilder,
    private _clientesService: ClientesService,
    private _sesionService: SesionService // Inyecta el servicio de sesión
  ) {
    this.myForm = this.fb.group({
      iD_Cliente: [null, [Validators.required]],
      iD_Usuario: [null, [Validators.required]],
      nombre: [null, [Validators.required]],
      apellido: [null, [Validators.required]],
      correo: [null, [Validators.required]],
      telefono: [null],
      direccion: [null, [Validators.required]],
      fecha_Nacimiento: [null, [Validators.required]],
      nacionalidad: [null, [Validators.required]],
      pasaporte: [null, [Validators.required]],
      frecuencia_Viajero: [null, [Validators.required]],
    });
  }

  get f() { return this.myForm.controls; }

  ngOnInit(): void {
    this.myForm.patchValue({
      iD_Cliente: this.clientes.iD_Cliente,
      iD_Usuario: this.clientes.iD_Usuario,
      nombre: this.clientes.nombre,
      apellido: this.clientes.apellido,
      correo: this.clientes.nombre,
      telefono: this.clientes.telefono,
      direccion: this.clientes.direccion,
      fecha_Nacimiento: this.formatDate(this.clientes.fecha_Nacimiento),
      nacionalidad: this.clientes.nacionalidad,
      pasaporte: this.clientes.pasaporte,
      frecuencia_Viajero: this.clientes.frecuencia_Viajero
    });
  }

  formatDate(dateString: string): string {
    if (!dateString) {
      return '';
    }
    const dateParts = dateString.split('/');
    const year = dateParts[2];
    const month = dateParts[1];
    const day = dateParts[0];
    return `${year}-${month}-${day}`;
  }

  closeModal(res: boolean) {
    this.closeModalEmmit.emit(res);
  }

  save() {
    this.clientes = this.myForm.getRawValue();

    if (this.clientes.iD_Cliente == 0) {
      this.createClientes();
    } else {
      this.updateClientes();
    }
  }

  createClientes() {
    let cliente: any = this.myForm.value;
    
    cliente.fecha_Nacimiento = this.formatDateForServer(cliente.fecha_Nacimiento);
    const authenticatedUser = this._sesionService.getUser(); // Obtén el usuario autenticado
    if (authenticatedUser) {
      cliente.iD_Usuario = authenticatedUser.iD_Usuario;
    } else {
      Swal.fire({
        position: 'center',
        icon: 'error',
        title: 'Usuario no autenticado',
        showConfirmButton: false,
        timer: 1650
      });
      return;
    }

    this._clientesService.create(cliente).subscribe(
      (data: ClienteModel) => {
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
        console.error('Error creating client:', err);
        this.closeModalEmmit.emit(false);
      }
    );
  }

  updateClientes() {
    let cliente: any = this.myForm.value;
    
    cliente.fecha_Nacimiento = this.formatDateForServer(cliente.fecha_Nacimiento);

    this._clientesService.update(cliente).subscribe(
      (data: ClienteModel) => {
        Swal.fire({
          position: 'center',
          icon: 'success',
          title: 'Registro actualizado de forma satisfactoria',
          showConfirmButton: false,
          timer: 1650
        });
        this.closeModalEmmit.emit(true);
      },
      err => {
        console.error('Error updating client:', err);
        this.closeModalEmmit.emit(false);
      }
    );
  }

  formatDateForServer(dateString: string): string {
    if (!dateString) {
      return '';
    }
    const dateParts = dateString.split('-');
    const day = dateParts[2];
    const month = dateParts[1];
    const year = dateParts[0];
    return `${day}/${month}/${year}`;
  }
}
