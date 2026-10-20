import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Apprenants } from './apprenants';

describe('Apprenants', () => {
  let component: Apprenants;
  let fixture: ComponentFixture<Apprenants>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Apprenants],
    }).compileComponents();

    fixture = TestBed.createComponent(Apprenants);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
