import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DestinoRegisterComponent } from './destino-register.component';

describe('DestinoRegisterComponent', () => {
  let component: DestinoRegisterComponent;
  let fixture: ComponentFixture<DestinoRegisterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DestinoRegisterComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DestinoRegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
