import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreeCours } from './cree-cours';

describe('CreeCours', () => {
  let component: CreeCours;
  let fixture: ComponentFixture<CreeCours>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreeCours],
    }).compileComponents();

    fixture = TestBed.createComponent(CreeCours);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
