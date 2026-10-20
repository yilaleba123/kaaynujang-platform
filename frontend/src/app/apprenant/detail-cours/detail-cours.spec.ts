import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DetailCours } from './detail-cours';

describe('DetailCours', () => {
  let component: DetailCours;
  let fixture: ComponentFixture<DetailCours>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetailCours],
    }).compileComponents();

    fixture = TestBed.createComponent(DetailCours);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
