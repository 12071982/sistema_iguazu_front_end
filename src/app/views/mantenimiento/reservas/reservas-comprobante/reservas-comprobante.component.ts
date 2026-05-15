import { Component, Input, OnInit } from '@angular/core';
import { ClienteModel } from 'src/app/models/clientes.model';
import { PaqueteModel } from 'src/app/models/paquete.model';
import { ReservasModel } from 'src/app/models/reservas.model';
import { ClientesService } from 'src/app/service/clientes.service';
import { PaqueteService } from 'src/app/service/paquete.service';
import { ReservasService } from 'src/app/service/reservas.service';
import { DestinoService } from 'src/app/service/destino.service';
import { forkJoin } from 'rxjs';
import html2canvas from 'html2canvas';

@Component({
  selector: 'app-reservas-comprobante',
  templateUrl: './reservas-comprobante.component.html',
  styleUrls: ['./reservas-comprobante.component.css'],
})
export class ReservasComprobanteComponent implements OnInit {
  @Input() reserva: ReservasModel = new ReservasModel();
  cliente: ClienteModel = new ClienteModel();
  paquete?: PaqueteModel; // Permitir que sea undefined inicialmente
  total: number = 0.00;
  nroOperacion: string = '';
  destino_nombreTipoMap: Map<number, string> = new Map();
  destino_monedaTipoMap: Map<number, string> = new Map();

  constructor(
    private _clienteservice: ClientesService,
    private _paqueteService: PaqueteService,
    private _reservasService: ReservasService,
    private _destinoService: DestinoService
  ) { }

  ngOnInit(): void {
    this.nroOperacion = `00${this.reserva.iD_Reserva}`;
    this.loadData();
  }

  loadData() {
    forkJoin([
      this._clienteservice.getById(this.reserva.iD_Cliente),
      this._paqueteService.getAll(),
      this._destinoService.getAll() // Añadir la llamada al servicio de destinos
    ]).subscribe(
      ([clienteData, paquetesData, destinosData]) => {
        this.cliente = clienteData;
        this.paquete = paquetesData.find(p => p.iD_Paquete === this.reserva.iD_Paquete);
        if (!this.paquete) {
          console.error('Paquete no encontrado');
        } else {
          this.initDestinoMaps(destinosData);
        }
        console.log('Cliente:', this.cliente);
        console.log('Paquete:', this.paquete);
      },
      (err) => {
        console.log(err);
      }
    );
  }

  initDestinoMaps(destinos: any[]) {
    for (let destino of destinos) {
      this.destino_nombreTipoMap.set(destino.iD_Destino, destino.nombre);
      this.destino_monedaTipoMap.set(destino.iD_Destino, destino.moneda);
    }
  }

  getDestinoNombre(iD_Destino: number): string {
    return this.destino_nombreTipoMap.get(iD_Destino) || 'Desconocido';
  }

  getMonedaNombre(iD_Destino?: number): string {
    if (iD_Destino !== undefined) {
      return this.destino_monedaTipoMap.get(iD_Destino) || '';
    }
    return '';
  }


  PrintElem() {
    var elem = document.getElementById('app2');
    if (!elem) {
      alert("No se encontró el elemento con id 'app2'");
      return;
    }
    var mywindow: any = window.open('', 'PRINT', 'height=1000,width=800');
    let app2 = document.getElementById('app2');
    if (app2) {
      mywindow.document.write(
        '<html><head><title>' + document.title + '</title>'
      );
      mywindow.document.write('</head><body >');
      mywindow.document.write('<h1>' + document.title + '</h1>');
      html2canvas(elem, { allowTaint: true }).then((canvas) => {
        var imgData = canvas.toDataURL('image/png');
        mywindow.document.write('<img src="' + imgData + '" />');
        mywindow.document.write('</body></html>');
        mywindow.focus();
        mywindow.print();
        mywindow.document.close();
        return true;
      });
    }
  }
}
