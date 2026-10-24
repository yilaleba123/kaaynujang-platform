import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LegalModal } from './legal-modal';

describe('LegalModal', () => {
  let component: LegalModal;
  let fixture: ComponentFixture<LegalModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LegalModal],
    }).compileComponents();

    fixture = TestBed.createComponent(LegalModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
