import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Copies } from './copies';

describe('Copies', () => {
  let component: Copies;
  let fixture: ComponentFixture<Copies>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Copies],
    }).compileComponents();

    fixture = TestBed.createComponent(Copies);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
