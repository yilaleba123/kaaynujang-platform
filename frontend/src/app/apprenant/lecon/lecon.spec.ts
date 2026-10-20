import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Lecon } from './lecon';

describe('Lecon', () => {
  let component: Lecon;
  let fixture: ComponentFixture<Lecon>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Lecon],
    }).compileComponents();

    fixture = TestBed.createComponent(Lecon);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
