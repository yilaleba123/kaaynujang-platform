import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Correction } from './correction';

describe('Correction', () => {
  let component: Correction;
  let fixture: ComponentFixture<Correction>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Correction],
    }).compileComponents();

    fixture = TestBed.createComponent(Correction);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
