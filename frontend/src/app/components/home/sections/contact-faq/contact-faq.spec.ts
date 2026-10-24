import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ContactFaq } from './contact-faq';

describe('ContactFaq', () => {
  let component: ContactFaq;
  let fixture: ComponentFixture<ContactFaq>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContactFaq],
    }).compileComponents();

    fixture = TestBed.createComponent(ContactFaq);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
