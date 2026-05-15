import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoleEditRegisterComponent } from './role-edit-register.component';

describe('RoleEditRegisterComponent', () => {
  let component: RoleEditRegisterComponent;
  let fixture: ComponentFixture<RoleEditRegisterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RoleEditRegisterComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RoleEditRegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
