import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientesRegisterComponent } from './clientes-register.component';

describe('ClientesRegisterComponent', () => {
  let component: ClientesRegisterComponent;
  let fixture: ComponentFixture<ClientesRegisterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ClientesRegisterComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ClientesRegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
