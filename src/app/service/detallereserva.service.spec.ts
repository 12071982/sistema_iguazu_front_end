import { TestBed } from '@angular/core/testing';

import { DetallereservaService } from './detallereserva.service';

describe('DestinoService', () => {
  let service: DetallereservaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DetallereservaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
