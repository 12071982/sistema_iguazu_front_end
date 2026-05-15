import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaqueteRegisterComponent } from './paquete-register.component';

describe('PaqueteRegisterComponent', () => {
  let component: PaqueteRegisterComponent;
  let fixture: ComponentFixture<PaqueteRegisterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PaqueteRegisterComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PaqueteRegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
