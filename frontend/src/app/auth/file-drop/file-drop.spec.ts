import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FileDrop } from './file-drop';

describe('FileDrop', () => {
  let component: FileDrop;
  let fixture: ComponentFixture<FileDrop>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FileDrop],
    }).compileComponents();

    fixture = TestBed.createComponent(FileDrop);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
