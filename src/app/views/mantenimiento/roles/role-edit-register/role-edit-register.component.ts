import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { RoleModel } from 'src/app/models/role.model';
import { RoleService } from 'src/app/service/role.service';

@Component({
  selector: 'app-role-edit-register',
  templateUrl: './role-edit-register.component.html',
  styleUrls: ['./role-edit-register.component.css']
})
export class RoleEditRegisterComponent implements OnInit {

  /*
   COMUNICACIÓN ENTRE COMPONENTES 
    ==> 
   */
  //UNA VARIABLE DE ENTRADA
  @Input() role: RoleModel = new RoleModel();

  //VARIABLES DE SALIDA
  @Output() _closeModalEmmiter = new EventEmitter<boolean>();

  constructor(
    private _rolService: RoleService,
  ) { }

  ngOnInit(): void {
    console.log("en el componente de edición de rol: ==> ", this.role);
  }

  closeModal(res: boolean) {
    console.log(res);

    this._closeModalEmmiter.emit(res);
  }

  saveRole() {
    if (this.role.id == 0) {
      this.createRole();
      //rol nuevo ==> se debe proceder a crear un nuevo registro
    }
    else {
      //rol nuevo ==> se debe proceder a actualizar un nuevo registro
      this.updateRole();
    }
  }

  createRole() {
    let message: string = "";
    this._rolService.create(this.role).subscribe(
      (data: RoleModel) => {
        message = `registrado de forma satisfactoría`;
        message = `${message} \n ${this.role.id} \n ${this.role.description} \n ${this.role.function} \n ${this.role.id_status}`
        alert(message);
        this.closeModal(true);
      },
      err => {
        alert("ocurrio un error");
      }
    );
  }

  updateRole() {
    let message: string = "";
    this._rolService.update(this.role).subscribe(
      (data: RoleModel) => {
        message = `actualizado de forma satisfactoría`;
        message = `${message} \n ${this.role.id} \n ${this.role.description} \n ${this.role.function} \n ${this.role.id_status}`
        alert(message);
        this.closeModal(true);
      },
      err => {
        alert("ocurrio un error");
      }
    );
  }
}
