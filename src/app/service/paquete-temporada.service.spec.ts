import { TestBed } from '@angular/core/testing';

import { PaqueteTemporadaService } from './paquete-temporada.service';

describe('PaqueteTemporadaService', () => {
  let service: PaqueteTemporadaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PaqueteTemporadaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
