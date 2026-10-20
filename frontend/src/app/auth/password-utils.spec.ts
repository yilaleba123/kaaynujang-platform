import { TestBed } from '@angular/core/testing';

import { PasswordUtils } from './password-utils';

describe('PasswordUtils', () => {
  let service: PasswordUtils;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PasswordUtils);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
