import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReservasComprobanteComponent } from './reservas-comprobante.component';

describe('ReservasComprobanteComponent', () => {
  let component: ReservasComprobanteComponent;
  let fixture: ComponentFixture<ReservasComprobanteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReservasComprobanteComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ReservasComprobanteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
