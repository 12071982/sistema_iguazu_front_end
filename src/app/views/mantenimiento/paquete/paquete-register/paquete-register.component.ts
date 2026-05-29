import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl, AbstractControl, ValidationErrors } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { Observable, map, startWith } from 'rxjs';
import Swal from 'sweetalert2';

import { PaqueteModel } from 'src/app/models/paquete.model';
import { PaqueteService } from 'src/app/service/paquete.service';
import { DestinoService } from 'src/app/service/destino.service';
import { TemporadaService } from 'src/app/service/temporada.service';
import { PaqueteTemporadaService } from 'src/app/service/paquete-temporada.service';
import { TemporadaModel } from 'src/app/models/temporada.model';
import { PaqueteTemporadaModel } from 'src/app/models/paquete-temporada.model';

// ── Validador de fecha inicio: solo actúa si esNuevo=true ──────────────────
function fechaInicioMinima(esNuevo: boolean) {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!esNuevo || !control.value) return null;
    const hoyStr = new Date().toISOString().split('T')[0];
    if (control.value < hoyStr) {
      return { fechaInicioAnterior: true };
    }
    return null;
  };
}

// ── Validador grupal: fecha fin >= fecha inicio (siempre aplica) ───────────
// La restricción de "no anterior a hoy" solo aplica en creación,
// pero que fin no sea antes que inicio sí aplica siempre.
function fechasValidas(group: AbstractControl): ValidationErrors | null {
  const fechaInicio = group.get('fecha_Inicio')?.value;
  const fechaFin    = group.get('fecha_Fin')?.value;
  if (!fechaInicio || !fechaFin) return null;
  if (fechaFin < fechaInicio) {
    return { fechaFinAnterior: true };
  }
  return null;
}

@Component({
  selector: 'app-paquete-register',
  templateUrl: './paquete-register.component.html',
  styleUrls: ['./paquete-register.component.css']
})
export class PaqueteRegisterComponent implements OnInit {
  @Input() paquete: PaqueteModel = new PaqueteModel();
  @Output() closeModalEmmit = new EventEmitter<boolean>();

  myForm!: FormGroup;
  pipe = new DatePipe('en-US');

  destinos: any[] = [];
  destinosFiltrados$: Observable<any[]> = new Observable();
  mostrarCampoDuracionPersonalizada: boolean = false;
  warningShown = false;

  temporadas: TemporadaModel[] = [];

  fechaMinimaHoy: string = '';
  fechaMinimaFin: string = '';

  // ── Flag: true = nuevo registro, false = edición ──────────────────────────
  esNuevo: boolean = true;

  constructor(
    private _destinoservice: DestinoService,
    private _paqueteService: PaqueteService,
    private _temporadaService: TemporadaService,
    private _paqueteTemporadaService: PaqueteTemporadaService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    // Determinar si es creación o edición ANTES de construir el formulario
    this.esNuevo = !this.paquete.iD_Paquete || this.paquete.iD_Paquete === 0;

    // Construir el formulario aquí para que fechaInicioMinima reciba esNuevo correcto
    this.myForm = this.fb.group({
      iD_Paquete:              [null],
      iD_Destino:              [null, Validators.required],
      destinoCtrl:             new FormControl('', Validators.required),
      nombre:                  [null, Validators.required],
      descripcion:             [null, Validators.required],
      duracion:                [null, Validators.required],
      duracionPersonalizada:   [null],
      precio_Base:             [null, Validators.required],
      tipo:                    [null, Validators.required],
      // Solo valida "no anterior a hoy" si es registro nuevo
      fecha_Inicio: [null, [Validators.required, fechaInicioMinima(this.esNuevo)]],
      fecha_Fin:    [null, [Validators.required]],
      inclusiones:  [null],
      exclusiones:  [null],
      iD_Temporada: ['', Validators.required]
    }, { validators: fechasValidas });

    this.cargarTemporadas();

    this.myForm.patchValue({
      iD_Paquete:   this.paquete.iD_Paquete,
      iD_Destino:   this.paquete.iD_Destino,
      nombre:       this.paquete.nombre,
      descripcion:  this.paquete.descripcion,
      duracion:     this.paquete.duracion,
      precio_Base:  this.paquete.precio_Base,
      tipo:         this.paquete.tipo,
      inclusiones:  this.paquete.inclusiones,
      exclusiones:  this.paquete.exclusiones,
      fecha_Inicio: this.formatDate(this.paquete.fecha_Inicio),
      fecha_Fin:    this.formatDate(this.paquete.fecha_Fin)
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

    if (!this.esNuevo) {
      this.cargarRelacionExistente();
    }

    const hoy = new Date();
    this.fechaMinimaHoy = hoy.toISOString().split('T')[0];

    // En edición no restringimos visualmente el calendario de fecha inicio
    this.fechaMinimaFin = this.esNuevo ? this.fechaMinimaHoy : '';

    this.myForm.get('fecha_Inicio')?.valueChanges.subscribe(fechaInicio => {
      if (fechaInicio) {
        this.fechaMinimaFin = fechaInicio;
        const fechaFinActual = this.myForm.get('fecha_Fin')?.value;
        if (fechaFinActual && fechaFinActual < this.fechaMinimaFin) {
          this.myForm.get('fecha_Fin')?.setValue(this.fechaMinimaFin);
        }
      } else {
        this.fechaMinimaFin = this.esNuevo ? this.fechaMinimaHoy : '';
      }
      this.myForm.get('fecha_Fin')?.updateValueAndValidity();
    });

    this.myForm.get('fecha_Fin')?.valueChanges.subscribe(() => {
      this.myForm.updateValueAndValidity();
    });
  }

  get destinoCtrl(): FormControl {
    return this.myForm.get('destinoCtrl') as FormControl;
  }

  cargarTemporadas(): void {
    this._temporadaService.getAll().subscribe({
      next:  (data) => { this.temporadas = data; },
      error: (err)  => console.error('Error al cargar temporadas', err)
    });
  }

  cargarRelacionExistente(): void {
    if (this.paquete.PaqueteTemporadas && this.paquete.PaqueteTemporadas.length > 0) {
      const temporadaRelacionada = this.paquete.PaqueteTemporadas[0];
      this.myForm.patchValue({ iD_Temporada: temporadaRelacionada.iD_Temporada });
    }
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

  onTemporadaChange(event: any): void {
    const idTemporada = +event.target.value;
    const temporadaSeleccionada = this.temporadas.find(t => t.iD_Temporada === idTemporada);
    if (temporadaSeleccionada) {
      this.myForm.patchValue({ precio_Base: temporadaSeleccionada.precioBase });
    } else {
      this.myForm.patchValue({ precio_Base: null });
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
      Swal.fire('Formulario inválido', 'Por favor completa todos los campos obligatorios correctamente.', 'warning');
      return;
    }

    this.actualizarDuracionPersonalizada();
    const formValue = { ...this.myForm.getRawValue() };

    const paqueteData: PaqueteModel = {
      iD_Paquete:   formValue.iD_Paquete,
      iD_Destino:   formValue.iD_Destino,
      nombre:       formValue.nombre,
      descripcion:  formValue.descripcion,
      duracion:     formValue.duracion,
      precio_Base:  formValue.precio_Base,
      tipo:         formValue.tipo,
      fecha_Inicio: this.formatDateForServer(formValue.fecha_Inicio),
      fecha_Fin:    this.formatDateForServer(formValue.fecha_Fin),
      inclusiones:  formValue.inclusiones,
      exclusiones:  formValue.exclusiones,
      imagen:       this.paquete.imagen || null,
      destino:      undefined
    };

    const idTemporada = formValue.iD_Temporada;

    const accion = this.esNuevo
      ? this._paqueteService.create(paqueteData)
      : this._paqueteService.update(paqueteData);

    accion.subscribe({
      next: (paqueteGuardado) => {
        if (idTemporada) {
          const relacion: PaqueteTemporadaModel = {
            iD_PaqueteTemporada: 0,
            iD_Paquete:          paqueteGuardado.iD_Paquete,
            iD_Temporada:        idTemporada
          };
          this._paqueteTemporadaService.create(relacion).subscribe({
            next: () => {
              Swal.fire('Éxito', 'Paquete y temporada guardados correctamente', 'success');
              this.closeModalEmmit.emit(true);
            },
            error: (err) => {
              console.error('Error al guardar relación temporada:', err);
              Swal.fire('Error', 'El paquete se guardó, pero no se pudo asociar la temporada', 'error');
              this.closeModalEmmit.emit(true);
            }
          });
        } else {
          Swal.fire('Éxito', 'Paquete guardado sin temporada', 'success');
          this.closeModalEmmit.emit(true);
        }
      },
      error: (err) => {
        console.error('Error al guardar paquete:', err);
        if (err.error?.errors) {
          const mensajes = Object.values(err.error.errors).flat().join('\n');
          Swal.fire('Error de validación', mensajes, 'error');
        } else {
          Swal.fire('Error', 'No se pudo guardar el paquete', 'error');
        }
      }
    });
  }

  closeModal(res: boolean) {
    this.closeModalEmmit.emit(res);
  }
}