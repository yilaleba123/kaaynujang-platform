import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DocumentPreviewModal } from './document-preview-modal';

describe('DocumentPreviewModal', () => {
  let component: DocumentPreviewModal;
  let fixture: ComponentFixture<DocumentPreviewModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DocumentPreviewModal],
    }).compileComponents();

    fixture = TestBed.createComponent(DocumentPreviewModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
