import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PendingValidation } from './pending-validation';

describe('PendingValidation', () => {
  let component: PendingValidation;
  let fixture: ComponentFixture<PendingValidation>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PendingValidation],
    }).compileComponents();

    fixture = TestBed.createComponent(PendingValidation);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
