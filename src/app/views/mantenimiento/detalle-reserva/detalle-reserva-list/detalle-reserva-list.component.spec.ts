import { ComponentFixture, TestBed } from '@angular/core/testing';
import { detalleReservaListComponent } from './detalle-reserva-list.component';

describe('detalleReservaListComponent', () => {
  let component: detalleReservaListComponent;
  let fixture: ComponentFixture<detalleReservaListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ detalleReservaListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(detalleReservaListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
