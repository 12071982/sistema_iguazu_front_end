import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DestinoModel } from 'src/app/models/destino.model';
import { DestinoService } from 'src/app/service/destino.service';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-destino-register',
  templateUrl: './destino-register.component.html',
  styleUrls: ['./destino-register.component.css']
})
export class DestinoRegisterComponent implements OnInit {

  /*VARIABLES DE ENTRADA */
  @Input() destino: DestinoModel = new DestinoModel();
  /*VARIABLES DE SALIDA */
  @Output() closeModalEmmit = new EventEmitter<boolean>();

  myForm: FormGroup;


  constructor(
    private fb: FormBuilder,
    private _destinoService: DestinoService
  ) {
    this.myForm = this.fb.group({
      
      iD_Destino: [null, [Validators.required]],
      nombre: [null, [Validators.required]],
      pais: [null, [Validators.required]],
      ciudad: [null, [Validators.required]],
      atracciones: [null, [Validators.required]],
      clima: [null, [Validators.required]],
      idioma: [null, [Validators.required]],
      moneda: [null, [Validators.required]]
    });
  }

  get f() { return this.myForm.controls; }

  ngOnInit(): void {
    /*FIXME: SET VALUE TRAE ERRORES CUANDO LOS ATRIBUTOS NO COINCIDEN AL 100% */
    //this.myForm.setValue(this.estado);
    this.myForm.patchValue(this.destino);
  }

  closeModal(res: boolean) {
    this.closeModalEmmit.emit(res);
  }

  save()
  {
    /*FIXME: SI POR A O B, TENEMOS UN CAMPO DES-HABILITADO DESDE ANGULAR / NO TRAE ESE VALOR */
    //this.estado = this.myForm.value();
    
    this.destino = this.myForm.getRawValue();
    if(this.destino.iD_Destino == 0)
    {
      this.createDestino();
      
    }
    else{
      this.updateDestino();
    }

  }

  createDestino()
  {
    this._destinoService.create(this.destino).subscribe(
      (data:DestinoModel)=>{
       // alert("Registro creado de forma satisfactoría");
       Swal.fire({
        position: 'center',
        icon: 'success',
        title: 'Registro creado de forma satisfactorías',
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
  updateDestino()
  {
    this._destinoService.update(this.destino).subscribe(
      (data:DestinoModel)=>{
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
