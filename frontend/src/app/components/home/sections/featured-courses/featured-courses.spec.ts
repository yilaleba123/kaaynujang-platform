import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FeaturedCourses } from './featured-courses';

describe('FeaturedCourses', () => {
  let component: FeaturedCourses;
  let fixture: ComponentFixture<FeaturedCourses>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FeaturedCourses],
    }).compileComponents();

    fixture = TestBed.createComponent(FeaturedCourses);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
