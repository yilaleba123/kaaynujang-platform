import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Advantages } from './advantages';

describe('Advantages', () => {
  let component: Advantages;
  let fixture: ComponentFixture<Advantages>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Advantages],
    }).compileComponents();

    fixture = TestBed.createComponent(Advantages);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
