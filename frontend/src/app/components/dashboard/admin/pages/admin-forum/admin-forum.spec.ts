import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminForum } from './admin-forum';

describe('AdminForum', () => {
  let component: AdminForum;
  let fixture: ComponentFixture<AdminForum>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminForum],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminForum);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
