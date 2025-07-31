import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Barrios } from './barrios';

describe('Barrios', () => {
  let component: Barrios;
  let fixture: ComponentFixture<Barrios>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Barrios]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Barrios);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
