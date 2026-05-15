import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExportExlsxCvsPdfComponent } from './export-exlsx-cvs-pdf.component';

describe('ExportExlsxCvsPdfComponent', () => {
  let component: ExportExlsxCvsPdfComponent;
  let fixture: ComponentFixture<ExportExlsxCvsPdfComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ExportExlsxCvsPdfComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ExportExlsxCvsPdfComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
