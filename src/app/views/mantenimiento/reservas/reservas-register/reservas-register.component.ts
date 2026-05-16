import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  TemplateRef,
} from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { ClienteModel } from 'src/app/models/clientes.model';
import { ReservasModel } from 'src/app/models/reservas.model';
import { ClientesService } from 'src/app/service/clientes.service';
import { SesionService } from 'src/app/service/sesion.service';
import { ReservasService } from 'src/app/service/reservas.service';
import { DestinoService } from 'src/app/service/destino.service';
import { PaqueteModel } from 'src/app/models/paquete.model';
import { PaqueteService } from 'src/app/service/paquete.service';
import { DetalleReservaModel } from 'src/app/models/detalleReservas.model';
import { Pipe, PipeTransform } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Observable } from 'rxjs';
import Swal from 'sweetalert2';


@Pipe({
  name: 'round',
})

export class RoundPipe implements PipeTransform {
  transform(value: number): number {
    return Math.round(value * 100) / 100;
  }
}

@Component({
  selector: 'app-reservas-register',
  templateUrl: './reservas-register.component.html',
  styleUrls: ['./reservas-register.component.css'],
})

export class ReservasRegisterComponent implements OnInit {
  page = 1;
  filtroCliente = ''
  filtroPaquete = ''
  filtro = '';
  today: Date = new Date();
  pipe = new DatePipe('en-US');
  todayWithPipe = null;
  /*VARIABLES DE ENTRADA */
  @Input() reservas: ReservasModel = new ReservasModel();
  /*VARIABLES DE SALIDA */
  @Output() closeModalEmmit = new EventEmitter<boolean>();

  modalRef?: BsModalRef;
  myForm: FormGroup;
  // cliente
  formNewClienteReserva = new FormGroup({});
  clienteSelect: ClienteModel = new ClienteModel();
  clienteList: ClienteModel[] = [];
  //paquete
  paquete: PaqueteModel[] = [];
  paqueteselect: PaqueteModel = new PaqueteModel();
  //usuario
  usuario: any = {};
  //Cliente
  cliente: any = {};
  //Registrar reserva
  paquetesseleccionados: PaqueteModel[] = [];
  pagar_con!: number;
  vuelto: number = 0;
  total_price: number = 0;
  nombre_moneda: string = '';
  tituloModal: string = '';
  miReserva: ReservasModel = new ReservasModel();
  destinoTiplist$!: Observable<any[]>;
  destinoTiplist: any = [];
  destino_nombreTipoMap: Map<number, string> = new Map();
  destino_monedaTipoMap: Map<number, string> = new Map();

  constructor(
    private modalService: BsModalService,
    private _sesionSevice: SesionService,
    private fb: FormBuilder,
    private _clienteServece: ClientesService,
    private _reservasService: ReservasService,
    private _produtoservice: PaqueteService,
    private _destinoservice: DestinoService,
  ) {
    this.myForm = this.fb.group({
      iD_Reserva: [null, [Validators.required]],
      iD_Cliente: [null, [Validators.required]],
      iD_Paquete: [null, [Validators.required]],
      fecha_Reserva: [null, [Validators.required]],
      numero_Personas: [1, [Validators.required, Validators.min(1)]],
      precio_Total: [null, [Validators.required]],
      estatus: [null, [Validators.required]],
      observaciones: [null, [Validators.required]],

      iD_Pago: [null, [Validators.required]],
      metodo_Pago: [null, [Validators.required]],
      monto: [null, [Validators.required]],
      fecha_Pago: [null, [Validators.required]],
      numero_Transaccion: [null, [Validators.required]],
      //formArray
      DetalleReservas: this.fb.array([]),
    });
  }

  get f() {
    return this.myForm.controls;
  }

  get DetalleReservas(): FormArray {
    return this.myForm.get('DetalleReservas') as FormArray;
  }

  ngOnInit(): void {
    /*FIXME: SET VALUE TRAE ERRORES CUANDO LOS ATRIBUTOS NO COINCIDEN AL 100% */
    //this.myForm.setValue(this.estado);
    this.myForm.patchValue({
      ...this.reservas,
      numero_Personas: this.reservas.numero_Personas && this.reservas.numero_Personas > 0
        ? this.reservas.numero_Personas
        : 1
    });
    
    this.obtenerUsuario();
    this.destinoTiplist$ = this._destinoservice.getAll();
    this.refreshDestinotipoMap();
    this.myForm.get('numero_Personas')?.valueChanges.subscribe(() => {
      this.calcularTotalPrice();
    });
  }

  refreshDestinotipoMap() {
    this._destinoservice.getAll().subscribe((data) => {
      this.destinoTiplist = data;
      for (let i = 0; i < data.length; i++) {
        this.destino_nombreTipoMap.set(
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

  newReservaArray(detalle: DetalleReservaModel): FormGroup {

    const paqueteEncontrado = this.paquete.find(p => p.iD_Paquete === detalle.iD_Paquete);
    const destino_nombre = paqueteEncontrado ? this.destino_nombreTipoMap.get(paqueteEncontrado.iD_Destino) : '';
    const destino_moneda = paqueteEncontrado ? this.destino_monedaTipoMap.get(paqueteEncontrado.iD_Destino) : '';
    const destino_moneda_monto = `${detalle.precio_base_paquete} ${destino_moneda}`;

    return this.fb.group({
      iD_Pago: [
        { value: detalle.iD_Pago, disabled: true },
        [Validators.required],
      ],
      iD_Reserva: [detalle.iD_Reserva, []],
      iD_Paquete: [detalle.iD_Paquete, []],
      precio_total: [0, []],

      // DATOS DEL PAQUETE
      html_nombre_paquete: [detalle.nombre_paquete, []],
      html_descripcion_paquete: [detalle.descripcion_paquete, []],
      html_duracion_paquete: [detalle.duracion_paquete, []],
      html_fecha_inicio_paquete: [detalle.fecha_inicio_paquete, []],
      html_fecha_fin_paquete: [detalle.fecha_fin_paquete, []],
      html_destino_paquete: [destino_nombre, []],
      html_moneda_paquete: [destino_moneda, []],
      precio_base_paquete: [detalle.precio_base_paquete, []], // Asegúrate de agregar este campo
      html_moneda_monto: [destino_moneda_monto, []],
    });

  }

  obtenerUsuario() {
    this.usuario = this._sesionSevice.getUser();
  }

  openListCliente(template: TemplateRef<any>) {
    this.filtroCliente = ''; // Limpiar el campo de búsqueda
    this.filtroPaquete = '';
    this._clienteServece.getAll().subscribe((data: ClienteModel[]) => {
      this.clienteList = data;
      this.openModal(template);
    });
  }

  openListPaquete(template: TemplateRef<any>) {
    this.filtroCliente = '';
    this._produtoservice.getAll().subscribe((data: PaqueteModel[]) => {
      this.paquete = data;
      this.openModal(template);
    });
  }

  openModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(
      template,
      Object.assign(
        {},
        {
          class: 'gray modal-lg modal-dialog-centered',
          ignoreBackdropClick: true,
          keyboard: true,
        }
      )
    );
  }

  closeModal(res: boolean) {
    this.closeModalEmmit.emit(res);
  }

  onChangeCliente(cliente: any) {
    this.clienteSelect = cliente;
    this.miReserva.iD_Cliente = cliente.iD_Cliente;
    this.modalRef?.hide();
  }

  onChangePaquete(paquete: PaqueteModel) {
    this.paqueteselect = paquete;
    this.miReserva.iD_Paquete = paquete.iD_Paquete;

    this.DetalleReservas.clear();

    let detalleReserva: DetalleReservaModel = new DetalleReservaModel();
    detalleReserva.iD_Pago = 0;
    detalleReserva.iD_Paquete = paquete.iD_Paquete;
    detalleReserva.iD_Reserva = 0;
    detalleReserva.nombre_paquete = paquete.nombre;
    detalleReserva.descripcion_paquete = paquete.descripcion;
    detalleReserva.duracion_paquete = paquete.duracion;
    detalleReserva.fecha_inicio_paquete = paquete.fecha_Inicio;
    detalleReserva.fecha_fin_paquete = paquete.fecha_Fin;
    detalleReserva.precio_base_paquete = paquete.precio_Base;
    this.DetalleReservas.push(this.newReservaArray(detalleReserva));

    this.calcularTotalPrice();
  }



  save() {
    this.reservas = this.myForm.getRawValue();
    if (this.reservas.iD_Reserva == 0) {

      this.createReserva();
    } else {
      this.updateReserva();
    }
  }

  createReserva() {
    this._reservasService.create(this.reservas).subscribe(
      (data: ReservasModel) => {
        // alert("Registro creado de forma satisfactoría");
        Swal.fire({
          position: 'center',
          icon: 'success',
          title: 'Registro creado de forma satisfactoría',
          showConfirmButton: false,
          timer: 1650,
        });
        this.closeModalEmmit.emit(true);
      },
      (err) => {
        console.log(err);
        this.closeModalEmmit.emit(false);
      }
    );
  }
  updateReserva() {
    this._reservasService.update(this.reservas).subscribe(
      (data: ReservasModel) => {
        // alert("Registro actualizado de forma satisfactoría");
        Swal.fire({
          position: 'center',
          icon: 'success',
          title: 'Registro actualizado de forma satisfactoría',
          showConfirmButton: false,
          timer: 1650,
        });
        this.closeModalEmmit.emit(true);
      },
      (err) => {
        console.log(err);
        this.closeModalEmmit.emit(false);
      }
    );
  }

  agregarpaquete(e: any, paquete: any) {
    let checked: boolean;
    checked = e.target.checked;
    if (checked) {
      let detalleReserva: DetalleReservaModel;
      detalleReserva = new DetalleReservaModel();
      detalleReserva.iD_Pago = 0;
      detalleReserva.iD_Paquete = paquete.iD_Paquete;
      detalleReserva.iD_Reserva = 0;

      // DATO DEL PAQUETE
      detalleReserva.nombre_paquete = paquete.nombre;
      detalleReserva.descripcion_paquete = paquete.descripcion;
      detalleReserva.duracion_paquete = paquete.duracion;
      detalleReserva.fecha_inicio_paquete = paquete.fecha_Inicio;
      detalleReserva.fecha_fin_paquete = paquete.fecha_Fin;
      detalleReserva.precio_base_paquete = paquete.precio_Base;
      if (paquete.destino) {
        detalleReserva.destino_paquete = paquete.destino.nombre;
      }
      this.DetalleReservas.push(this.newReservaArray(detalleReserva));
      e.target.disabled = true;
      this.calcularTotalPrice();
    }
    this.paqueteselect = paquete;
    this.miReserva.iD_Paquete = paquete.iD_Paquete;
  }

  removeElement(i: number) {
    this.DetalleReservas.removeAt(i);
    this.calcularTotalPrice();
  }


  changerValueFormArray(i: number) {
    let obj_1: DetalleReservaModel;
    obj_1 = new DetalleReservaModel();
    obj_1 = this.DetalleReservas.controls[i].value;

    let precio_total = 0;
    let obj = this.DetalleReservas.controls[i]
      .get('precio_base_paquete')
      ?.setValue(precio_total);

    this.calcularTotalPrice(); // Calcular el precio total después de cambiar el valor
  }

  getMonedaPorPaquete(iD_Paquete: number): string {
    const paqueteEncontrado = this.paquete.find(p => p.iD_Paquete === iD_Paquete);
    return paqueteEncontrado ? this.destino_monedaTipoMap.get(paqueteEncontrado.iD_Destino) || '' : '';
  }

  calcularTotalPrice() {
    this.total_price = 0;

    // Obtiene el número de personas (o 1 si está vacío)
    const numeroPersonas = this.myForm.get('numero_Personas')?.value || 1;

    const detalles: DetalleReservaModel[] = this.DetalleReservas.getRawValue();

    detalles.forEach((detalle) => {
      if (detalle.precio_base_paquete) {
        this.total_price += detalle.precio_base_paquete * numeroPersonas;
      }
    });

    // Asignar la moneda desde el primer paquete (opcional)
    const primerPaquete = this.paquete[0];
    if (primerPaquete) {
      this.nombre_moneda = this.destino_monedaTipoMap.get(primerPaquete.iD_Destino) || '';
    }

    this.myForm.get('precio_Total')?.setValue(this.total_price);
  }




  calcularVuelto(event: any) {
    this.pagar_con = parseFloat(event.target.value);
    if (isNaN(this.pagar_con) || this.pagar_con === null || this.pagar_con === 0) {
      this.vuelto = 0;
    } else if (this.pagar_con < this.total_price) {
      Swal.fire({
        position: 'center',
        icon: 'info',
        title: 'El monto a pagar es menor al precio total',
        showConfirmButton: false,
        timer: 1650,
      });
      this.vuelto = 0;
    } else {
      this.vuelto = this.pagar_con - this.total_price;
    }
  }


  limpiarTablas() {
    // Resetea el formulario
    this.myForm.reset();

    // Resetea las variables del componente
    this.clienteSelect = new ClienteModel();
    this.paqueteselect = new PaqueteModel();
    this.total_price = 0;
    this.pagar_con = 0;
    this.vuelto = 0;
    this.nombre_moneda = '';

    // Limpia los arrays del formulario
    while (this.DetalleReservas.length !== 0) {
      this.DetalleReservas.removeAt(0);
    }

    // Opcional: Puedes resetear el valor de los campos específicos si es necesario
    this.myForm.patchValue({
      iD_Reserva: null,
      iD_Cliente: null,
      iD_Paquete: null,
      fecha_Reserva: null,
      numero_Personas: 1,
      precio_Total: null,
      estatus: null,
      observaciones: null,
      iD_Pago: null,
      metodo_Pago: null,
      monto: null,
      fecha_Pago: null,
      numero_Transaccion: null
    });
  }


  realizarReserva(template: TemplateRef<any>) {
    if (!this.clienteSelect.iD_Cliente || !this.paqueteselect.iD_Paquete) {
      Swal.fire({
        position: 'center',
        icon: 'warning',
        title: 'Por favor, seleccione un cliente y un paquete',
        showConfirmButton: true,
      });
      return;
    }

    let reserva: any = this.myForm.value;

    reserva.iD_Cliente = this.clienteSelect.iD_Cliente;
    reserva.iD_Paquete = this.paqueteselect.iD_Paquete;
    reserva.fecha_Reserva = this.pipe.transform(Date.now(), 'dd/MM/yyyy');
    reserva.fecha_Pago = this.pipe.transform(Date.now(), 'dd/MM/yyyy');
    reserva.numero_Transaccion = '00' && reserva.iD_Reserva;
    reserva.estatus = 'Reservado';
    reserva.precio_Total = this.total_price; // Asegurarse de que se utilice el precio total correcto

    this._reservasService.create(reserva).subscribe(
      (data: any) => {
        Swal.fire({
          position: 'center',
          icon: 'success',
          title: 'Reserva Realizada de forma satisfactoría',
          showConfirmButton: false,
          timer: 1650,
        });
        this.miReserva = data;
        console.log(this.miReserva);
      },
      (err) => { }
    );

    setTimeout(() => {
      this.tituloModal = 'RESERVA';
      this.openModal(template);
    }, 2000);

    this.limpiarTablas();
  }


  listReserva(template: TemplateRef<any>) {
    this.openModal(template);
  }
}
