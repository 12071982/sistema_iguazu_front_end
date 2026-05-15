import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReservasRegisterComponent } from './reservas-register.component';

describe('ReservasRegisterComponent', () => {
  let component: ReservasRegisterComponent;
  let fixture: ComponentFixture<ReservasRegisterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReservasRegisterComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ReservasRegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
