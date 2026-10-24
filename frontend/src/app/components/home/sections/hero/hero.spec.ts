import { Type } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import * as HeroModule from './hero';

const Hero = Object.values(HeroModule).find(
  (value) => typeof value === 'function' && !!(value as Type<unknown> & { ɵcmp?: unknown }).ɵcmp,
) as Type<unknown>;

describe('Hero', () => {
  let component: unknown;
  let fixture: ComponentFixture<unknown>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Hero],
    }).compileComponents();

    fixture = TestBed.createComponent(Hero);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
