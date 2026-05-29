import { Component, OnInit, TemplateRef } from '@angular/core';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { PaqueteModel } from 'src/app/models/paquete.model';
import { PaqueteService } from 'src/app/service/paquete.service';
import { DestinoService } from 'src/app/service/destino.service';
import { Observable } from 'rxjs';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-paquete-list',
  templateUrl: './paquete-list.component.html',
  styleUrls: ['./paquete-list.component.css'],
})
export class PaqueteListComponent implements OnInit {
  modalRef?: BsModalRef;
  page = 1;
  paquetes = '';
  paquete: PaqueteModel[] = [];
  paqueteSelected: PaqueteModel = new PaqueteModel();
  paqueteExport: any = [];
  tituloModal: string = '';
  cantidadRegistros: number = 10;
  destino_monedaTipoMap: Map<number, string> = new Map();

  // Bandera para mostrar un spinner/indicador mientras se refresca antes de exportar
  exportando: boolean = false;

  headerColumns: any = [
    { header: '#',                 datakey: 'numero'        },  // correlativo 1, 2, 3...
    { header: 'DESTINO',           datakey: 'destino'       },  // nombre del destino, no el ID
    { header: 'NOMBRE DEL PAQUETE',datakey: 'nombre'        },
    { header: 'DESCRIPCION',       datakey: 'descripcion'   },
    { header: 'DURACION',          datakey: 'duracion'      },
    { header: 'PRECIO BASE',       datakey: 'precio_Base'   },
    { header: 'TIPO',              datakey: 'tipo'          },
    { header: 'FECHA INICIO',      datakey: 'fecha_Inicio'  },
    { header: 'FECHA FIN',         datakey: 'fecha_Fin'     },
    { header: 'INCLUSIONES',       datakey: 'inclusiones'   },
    { header: 'EXCLUSIONES',       datakey: 'exclusiones'   },
  ];

  destinoTiplist$!: Observable<any[]>;
  destinoTiplist: any = [];
  destinoTipoMap: Map<number, string> = new Map();

  constructor(
    private _destinoservice: DestinoService,
    private _paqueteService: PaqueteService,
    private modalService: BsModalService
  ) {}

  ngOnInit(): void {
    this.getAllPaquete(this.cantidadRegistros);
    this.destinoTiplist$ = this._destinoservice.getAll();
    this.refreshDestinotipoMap();
    this.getAllPDF();
  }

  refreshDestinotipoMap() {
    this._destinoservice.getAll().subscribe((data) => {
      this.destinoTiplist = data;
      for (let i = 0; i < data.length; i++) {
        this.destinoTipoMap.set(
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

  // Carga los datos para exportar; si recibe un callback lo ejecuta al terminar.
  // Si destinoTipoMap aún no tiene datos, primero carga los destinos y luego los paquetes.
  getAllPDF(callbackExport?: () => void) {
    this.paqueteExport = [];

    const construirExport = (data: PaqueteModel[]) => {
      data.forEach((x, index) => {
        this.paqueteExport.push({
          '#':                    index + 1,                                          // correlativo 1, 2, 3...
          'DESTINO':              this.destinoTipoMap.get(x.iD_Destino) ?? x.iD_Destino, // nombre del destino
          'NOMBRE DEL PAQUETE':   x.nombre,
          'DESCRIPCION':          x.descripcion,
          'DURACION':             x.duracion,
          'PRECIO BASE':          `${x.precio_Base} ${this.destino_monedaTipoMap.get(x.iD_Destino) ?? ''}`.trim(),
          'TIPO':                 x.tipo,
          'FECHA INICIO':         x.fecha_Inicio,
          'FECHA FIN':            x.fecha_Fin,
          'INCLUSIONES':          x.inclusiones,
          'EXCLUSIONES':          x.exclusiones,
        });
      });

      this.exportando = false;

      if (callbackExport) {
        setTimeout(() => callbackExport(), 50);
      }
    };

    const cargarPaquetes = () => {
      this._paqueteService.getAll().subscribe(
        (data: PaqueteModel[]) => construirExport(data),
        (err) => {
          this.exportando = false;
          console.error('Error al cargar datos para exportar', err);
        }
      );
    };

    // Si el mapa de destinos ya está cargado, vamos directo a los paquetes.
    // Si no, primero cargamos los destinos y luego los paquetes.
    if (this.destinoTipoMap.size > 0) {
      cargarPaquetes();
    } else {
      this._destinoservice.getAll().subscribe((destinos) => {
        destinos.forEach((d) => {
          this.destinoTipoMap.set(d.iD_Destino, d.nombre);
          this.destino_monedaTipoMap.set(d.iD_Destino, d.moneda);
        });
        cargarPaquetes();
      });
    }
  }

  getAllPaquete(cantidad: number) {
    this._paqueteService.getAll(cantidad).subscribe(
      (data: PaqueteModel[]) => {
        this.paquete = data;
        console.log(data);
      },
      (err) => {
        console.log(err);
      }
    );
  }

  // ─── Exportación con refresh previo ────────────────────────────────────────
  // Este método es llamado por app-export-exlsx-cvs-pdf a través del @Input
  // onBeforeExport. El componente hijo pasa su propio método de descarga como
  // argumento para que el padre lo invoque una vez que los datos estén listos.
  refrescarYExportar(dispararDescarga: () => void): void {
    this.exportando = true;
    this.getAllPDF(dispararDescarga);
  }
  // ───────────────────────────────────────────────────────────────────────────

  editarRegistro(paquete: PaqueteModel, template: TemplateRef<any>) {
    this.tituloModal = 'EDITAR REGISTRO';
    this.paqueteSelected = paquete;
    this.openModal(template);
  }

  crearRegistro(template: TemplateRef<any>) {
    this.tituloModal = 'CREAR REGISTRO';
    this.paqueteSelected = new PaqueteModel();
    this.openModal(template);
  }

  openModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template, {
      ignoreBackdropClick: true,
    });
  }

  recibeCloseModal(res: boolean) {
    if (res) {
      this.getAllPaquete(this.cantidadRegistros);
    }
    this.modalRef?.hide();
  }

  modalDelete(paquete: PaqueteModel) {
    Swal.fire({
      title: '¿Está seguro de eliminar el registro?',
      text: '¡No podrás revertir esto!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Si, bórralo!',
    }).then((result) => {
      if (result.isConfirmed) {
        this._paqueteService
          .delete(paquete.iD_Paquete)
          .subscribe((data: number) => {
            console.log(data);
            Swal.fire(
              'Eliminado!',
              'Registro eliminado de forma satisfactoria.',
              'success'
            );
            this.getAllPaquete(this.cantidadRegistros);
          });
      }
    });
  }

  PrintElem() {
    const mywindow: any = window.open('', 'PRINT', 'height=400,width=600');
    const html = document.getElementById('app2')?.innerHTML;
    mywindow.document.write('<html><head><title>' + document.title + '</title>');
    mywindow.document.write('</head><body>');
    mywindow.document.write('<h1>' + document.title + '</h1>');
    mywindow.document.write(html);
    mywindow.document.write('</body></html>');
    mywindow.document.close();
    mywindow.focus();
    mywindow.print();
  }

  onRegistrosChange() {
    this.page = 1;
    this.getAllPaquete(this.cantidadRegistros);
  }
}