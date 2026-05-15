import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { PaqueteModel } from 'src/app/models/paquete.model';
import { PaqueteService } from 'src/app/service/paquete.service';
import { DestinoService } from 'src/app/service/destino.service';
import { Observable, map, startWith } from 'rxjs';
import Swal from 'sweetalert2';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-paquete-register',
  templateUrl: './paquete-register.component.html',
  styleUrls: ['./paquete-register.component.css']
})
export class PaqueteRegisterComponent implements OnInit {
  @Input() paquete: PaqueteModel = new PaqueteModel();
  @Output() closeModalEmmit = new EventEmitter<boolean>();

  myForm: FormGroup;
  pipe = new DatePipe('en-US');

  destinos: any[] = [];
  destinosFiltrados$: Observable<any[]> = new Observable();
  mostrarCampoDuracionPersonalizada: boolean = false;
  warningShown = false;

  constructor(
    private _destinoservice: DestinoService,
    private fb: FormBuilder,
    private _paqueteService: PaqueteService
  ) {
    this.myForm = this.fb.group({
      iD_Paquete: [null],
      iD_Destino: [null, Validators.required],
      destinoCtrl: new FormControl('', Validators.required),
      nombre: [null, Validators.required],
      descripcion: [null, Validators.required],
      duracion: [null, Validators.required],
      duracionPersonalizada: new FormControl(null),
      precio_Base: [null],
      tipo: [null, Validators.required],
      fecha_Inicio: [null, Validators.required],
      fecha_Fin: [null, Validators.required],
      inclusiones: [null],
      exclusiones: [null]
    });
  }

  get destinoCtrl(): FormControl {
    return this.myForm.get('destinoCtrl') as FormControl;
  }

  ngOnInit(): void {
    this.myForm.patchValue({
      iD_Paquete: this.paquete.iD_Paquete,
      iD_Destino: this.paquete.iD_Destino,
      nombre: this.paquete.nombre,
      descripcion: this.paquete.descripcion,
      duracion: this.paquete.duracion,
      precio_Base: this.paquete.precio_Base,
      tipo: this.paquete.tipo,
      inclusiones: this.paquete.inclusiones,
      exclusiones: this.paquete.exclusiones,
      fecha_Inicio: this.formatDate(this.paquete.fecha_Inicio),
      fecha_Fin: this.formatDate(this.paquete.fecha_Fin)
    });

    this._destinoservice.getAll().subscribe(data => {
      this.destinos = data;

      const actual = this.destinos.find(d => d.iD_Destino === this.paquete.iD_Destino);
      if (actual) this.destinoCtrl.setValue(actual.nombre);

      this.destinosFiltrados$ = this.destinoCtrl.valueChanges.pipe(
        startWith(''),
        map(value => this.filtrarDestinos(value))
      );
    });
  }

  filtrarDestinos(valor: string): any[] {
    const filtro = valor?.toLowerCase() || '';
    return this.destinos.filter(dest => dest.nombre.toLowerCase().includes(filtro));
  }

  seleccionarDestino(nombre: string) {
    const destinoSeleccionado = this.destinos.find(d => d.nombre === nombre);
    if (destinoSeleccionado) {
      this.myForm.patchValue({ iD_Destino: destinoSeleccionado.iD_Destino });
    } else {
      this.myForm.patchValue({ iD_Destino: null });
    }
  }

  onDuracionChange(event: Event): void {
    const valor = (event.target as HTMLSelectElement).value;
    this.mostrarCampoDuracionPersonalizada = valor === 'Personalizado';
    if (!this.mostrarCampoDuracionPersonalizada) {
      this.myForm.patchValue({ duracionPersonalizada: null });
    }
  }

  actualizarDuracionPersonalizada(): void {
    const personalizada = this.myForm.get('duracionPersonalizada')?.value;
    if (this.mostrarCampoDuracionPersonalizada && personalizada) {
      this.myForm.get('duracion')?.setValue(personalizada);
    }
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    const dateParts = dateString.split('/');
    return `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;
  }

  formatDateForServer(dateString: string): string {
    if (!dateString) return '';
    const dateParts = dateString.split('-');
    return `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}`;
  }

  save() {
    if (this.myForm.invalid) {
      this.warningShown = true;
      return;
    }

    this.actualizarDuracionPersonalizada();
    const paquete = { ...this.myForm.getRawValue() };
    paquete.fecha_Inicio = this.formatDateForServer(paquete.fecha_Inicio);
    paquete.fecha_Fin = this.formatDateForServer(paquete.fecha_Fin);

    if (!paquete.iD_Paquete) {
      this._paqueteService.create(paquete).subscribe(() => {
        Swal.fire('Registrado', 'Paquete creado con éxito', 'success');
        this.closeModalEmmit.emit(true);
      });
    } else {
      this._paqueteService.update(paquete).subscribe(() => {
        Swal.fire('Actualizado', 'Paquete actualizado con éxito', 'success');
        this.closeModalEmmit.emit(true);
      });
    }
  }

  closeModal(res: boolean) {
    this.closeModalEmmit.emit(res);
  }
}
