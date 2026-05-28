import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ClienteModel } from 'src/app/models/clientes.model';
import { ClientesService } from 'src/app/service/clientes.service';
import Swal from 'sweetalert2';
import { DatePipe } from '@angular/common';
import { UsuarioModel } from 'src/app/models/usuario.model';
import { SesionService } from 'src/app/service/sesion.service';

interface VerificaPeRespuesta {
  success: boolean;
  data: {
    dni: string;
    fullName: string;
    names: string;
    paternalSurname: string;
    maternalSurname: string;
    birthDate: string;
    gender: string;
    updatedAt: string;
    source: string;
  };
  creditsRemaining: number;
}

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
  mostrarInputOtros = false;

  buscandoDNI    = false;
  dniBuscado     = false;
  dniEncontrado: boolean | null = null;

  private readonly TOKEN   = 'vp_live_aada01fa0e4c4fa290b3e042fc612bb8';
  private readonly API_DNI = '/api/verificape/v2/dni';
  private debounceTimer: any = null;

  readonly EDAD_MINIMA = 3;
  readonly EDAD_MAXIMA = 120;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private _clientesService: ClientesService,
    private _sesionService: SesionService
  ) {
    this.myForm = this.fb.group({
      iD_Cliente:         [null, [Validators.required]],
      iD_Usuario:         [null, [Validators.required]],
      pasaporte:          [null],
      nombre:             [null, [Validators.required]],
      apellido:           [null, [Validators.required]],
      correo:             [null, [Validators.required, Validators.email]],
      telefono:           [null, [Validators.required, Validators.pattern('^[0-9]{9,12}$')]],
      direccion:          [null, [Validators.required]],
      fecha_Nacimiento:   [null, [Validators.required, this.validarRangoEdad()]],
      nacionalidad:       ['Peruana', [Validators.required]],
      nacionalidadOtros:  [''],
      frecuencia_Viajero: ['Media', [Validators.required]],
    });

    this.myForm.get('nacionalidad')?.valueChanges.subscribe((valor: string) => {
      const controlOtros = this.myForm.get('nacionalidadOtros');
      if (valor === 'Otros') {
        this.mostrarInputOtros = true;
        controlOtros?.setValidators([Validators.required]);
      } else {
        this.mostrarInputOtros = false;
        controlOtros?.clearValidators();
      }
      controlOtros?.updateValueAndValidity();
    });
  }

  get f() { return this.myForm.controls; }

  onDNIInput(event: Event): void {
    const valor = (event.target as HTMLInputElement).value.trim();

    this.dniBuscado    = false;
    this.dniEncontrado = null;

    if (this.debounceTimer) clearTimeout(this.debounceTimer);

    if (!/^[0-9]{8}$/.test(valor)) return;

    this.debounceTimer = setTimeout(() => this.buscarDNI(valor), 500);
  }

  buscarDNI(dni: string): void {
    this.buscandoDNI = true;

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.TOKEN}`
    });

    this.http.get<VerificaPeRespuesta>(`${this.API_DNI}/${dni}`, { headers }).subscribe({
      next: (resp) => {
        this.buscandoDNI = false;
        if (!resp.success || !resp.data) {
          this.dniBuscado = true;
          this.dniEncontrado = false;
          return;
        }
        this.dniBuscado    = true;
        this.dniEncontrado = true;

        const cap = (s: string) => s
          ? s.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ')
          : '';

        this.myForm.patchValue({
          nombre:           cap(resp.data.names),
          apellido:         [resp.data.paternalSurname, resp.data.maternalSurname].filter(Boolean).map(cap).join(' '),
          fecha_Nacimiento: this.formatDate(resp.data.birthDate),
          nacionalidad:     'Peruana'
        });

        ['nombre', 'apellido', 'fecha_Nacimiento'].forEach(c =>
          this.myForm.get(c)?.markAsTouched()
        );
      },
      error: () => {
        this.buscandoDNI   = false;
        this.dniBuscado    = true;
        this.dniEncontrado = false;
      }
    });
  }

  // ── Validadores ──────────────────────────────────────────────────────────
  validarRangoEdad() {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      const fechaNacimiento = new Date(control.value);
      const hoy = new Date();
      if (fechaNacimiento > hoy) return { fechaFutura: true };
      let edad = hoy.getFullYear() - fechaNacimiento.getFullYear();
      const mes = hoy.getMonth() - fechaNacimiento.getMonth();
      if (mes < 0 || (mes === 0 && hoy.getDate() < fechaNacimiento.getDate())) edad--;
      if (edad < this.EDAD_MINIMA) return { edadMinima: { valor: this.EDAD_MINIMA } };
      if (edad > this.EDAD_MAXIMA) return { edadMaxima: { valor: this.EDAD_MAXIMA } };
      return null;
    };
  }

  getMinDate(): string {
    const hoy = new Date();
    return new Date(hoy.getFullYear() - this.EDAD_MINIMA, hoy.getMonth(), hoy.getDate())
      .toISOString().split('T')[0];
  }

  getMaxDate(): string {
    const hoy = new Date();
    return new Date(hoy.getFullYear() - this.EDAD_MAXIMA, hoy.getMonth(), hoy.getDate())
      .toISOString().split('T')[0];
  }

  // ── Ciclo de vida ────────────────────────────────────────────────────────
  ngOnInit(): void {
    const nacionalidadActual = this.clientes.nacionalidad;
    if (
      nacionalidadActual &&
      !['Peruana', 'Venezolana', 'Boliviana', 'Chilena'].includes(nacionalidadActual)
    ) {
      this.mostrarInputOtros = true;
      this.myForm.get('nacionalidad')?.setValue('Otros');
      this.myForm.get('nacionalidadOtros')?.setValue(nacionalidadActual);
    }

    this.myForm.patchValue({
      iD_Cliente:         this.clientes.iD_Cliente,
      iD_Usuario:         this.clientes.iD_Usuario,
      nombre:             this.clientes.nombre,
      apellido:           this.clientes.apellido,
      correo:             this.clientes.correo,
      telefono:           this.clientes.telefono,
      direccion:          this.clientes.direccion,
      fecha_Nacimiento:   this.formatDate(this.clientes.fecha_Nacimiento),
      nacionalidad:       this.clientes.nacionalidad || 'Peruana',
      pasaporte:          this.clientes.pasaporte,
      frecuencia_Viajero: this.clientes.frecuencia_Viajero || 'Media'
    });
  }

  // ── Utilidades de fecha ──────────────────────────────────────────────────
  /** "DD/MM/YYYY" → "YYYY-MM-DD"  (para el input[type=date]) */
  formatDate(dateString: string): string {
    if (!dateString) return '';
    const parts = dateString.split('/');
    if (parts.length !== 3) return '';
    const [day, month, year] = parts;
    return `${year}-${month}-${day}`;
  }

  /** "YYYY-MM-DD" → "DD/MM/YYYY"  (para el servidor) */
  formatDateForServer(dateString: string): string {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
  }

  // ── Modal ────────────────────────────────────────────────────────────────
  closeModal(res: boolean) { this.closeModalEmmit.emit(res); }

  // ── Guardar ──────────────────────────────────────────────────────────────
  save(): void {
    if (this.myForm.invalid) {
      Swal.fire({
        position: 'center', icon: 'warning',
        title: 'Formulario inválido',
        text: 'Por favor, completa todos los campos correctamente',
        showConfirmButton: true
      });
      return;
    }

    this.clientes = this.myForm.getRawValue();

    if (this.myForm.get('nacionalidad')?.value === 'Otros') {
      this.clientes.nacionalidad = this.myForm.get('nacionalidadOtros')?.value;
    }

    this.clientes.iD_Cliente == 0 ? this.createClientes() : this.updateClientes();
  }

  createClientes(): void {
    const cliente: any = { ...this.myForm.value };

    if (this.myForm.get('nacionalidad')?.value === 'Otros') {
      cliente.nacionalidad = this.myForm.get('nacionalidadOtros')?.value;
    }

    cliente.fecha_Nacimiento = this.formatDateForServer(cliente.fecha_Nacimiento);

    const authenticatedUser = this._sesionService.getUser();
    if (authenticatedUser) {
      cliente.iD_Usuario = authenticatedUser.iD_Usuario;
    } else {
      Swal.fire({
        position: 'center', icon: 'error',
        title: 'Usuario no autenticado',
        showConfirmButton: false, timer: 1650
      });
      return;
    }

    this._clientesService.create(cliente).subscribe(
      () => {
        Swal.fire({
          position: 'center', icon: 'success',
          title: 'Registro creado de forma satisfactoria',
          showConfirmButton: false, timer: 1650
        });
        this.closeModalEmmit.emit(true);
      },
      err => {
        console.error('Error al crear cliente:', err);
        Swal.fire({
          position: 'center', icon: 'error',
          title: 'Error al crear el registro',
          showConfirmButton: false, timer: 1650
        });
        this.closeModalEmmit.emit(false);
      }
    );
  }

  updateClientes(): void {
    const cliente: any = { ...this.myForm.value };

    if (this.myForm.get('nacionalidad')?.value === 'Otros') {
      cliente.nacionalidad = this.myForm.get('nacionalidadOtros')?.value;
    }

    cliente.fecha_Nacimiento = this.formatDateForServer(cliente.fecha_Nacimiento);

    this._clientesService.update(cliente).subscribe(
      () => {
        Swal.fire({
          position: 'center', icon: 'success',
          title: 'Registro actualizado de forma satisfactoria',
          showConfirmButton: false, timer: 1650
        });
        this.closeModalEmmit.emit(true);
      },
      err => {
        console.error('Error al actualizar cliente:', err);
        Swal.fire({
          position: 'center', icon: 'error',
          title: 'Error al actualizar el registro',
          showConfirmButton: false, timer: 1650
        });
        this.closeModalEmmit.emit(false);
      }
    );
  }
}