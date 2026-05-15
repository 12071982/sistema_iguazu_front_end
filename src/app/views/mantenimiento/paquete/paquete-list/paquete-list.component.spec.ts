import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PaqueteListComponent } from './paquete-list.component';

describe('PaqueteListComponent', () => {
  let component: PaqueteListComponent;
  let fixture: ComponentFixture<PaqueteListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PaqueteListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PaqueteListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
