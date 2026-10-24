import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminCourseValidation } from './admin-course-validation';

describe('AdminCourseValidation', () => {
  let component: AdminCourseValidation;
  let fixture: ComponentFixture<AdminCourseValidation>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminCourseValidation],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminCourseValidation);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
