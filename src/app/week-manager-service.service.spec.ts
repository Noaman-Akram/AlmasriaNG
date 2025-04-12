import { TestBed } from '@angular/core/testing';

import { WeekManagerServiceService } from './week-manager-service.service';

describe('WeekManagerServiceService', () => {
  let service: WeekManagerServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WeekManagerServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
