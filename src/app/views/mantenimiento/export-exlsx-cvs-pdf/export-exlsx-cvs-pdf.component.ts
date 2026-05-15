import { Component,Input, OnInit } from '@angular/core';
import * as xlsx from 'xlsx';
import * as FileSaver from 'file-saver';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const EXCEL_EXTENSION = '.xlsx';

@Component({
  selector: 'app-export-exlsx-cvs-pdf',
  templateUrl: './export-exlsx-cvs-pdf.component.html',
  styleUrls: ['./export-exlsx-cvs-pdf.component.css']
})
export class ExportExlsxCvsPdfComponent implements OnInit {
@Input() columns: string[]=[];
@Input() jsonData: any=[];
@Input() fileName: string="data";


constructor() { }

ngOnInit(): void {
}

exportJsonToExcel():void{
const worksheet= xlsx.utils.json_to_sheet(this.jsonData);
const workbook={Sheets:{'data':worksheet},SheetNames:['data']};
const excelBuffer:any=xlsx.write(workbook,{bookType:'xlsx', type:'array'});
 this.saveAsExcelFile(excelBuffer,this.fileName);
}  

saveAsExcelFile(buffer: any, fileName: string): void{
  const data: Blob = new Blob([buffer],{
    type: EXCEL_TYPE
  });
  FileSaver.saveAs(data, fileName + '_export_' + new Date().getTime() + EXCEL_EXTENSION);
}  

exportJsonToPdf(){ 
  var pdf = new jsPDF();
  pdf.text('REPORTE DE STOCK', 11, 8);
  (pdf as any).autoTable({
    columns : this.columns,
    body: this.jsonData,
    theme:'grid'
  })

  pdf.save(`${this.fileName}.pdf`); 
}  
}
