import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Campanias } from './campanias';

describe('Campanias', () => {
  let component: Campanias;
  let fixture: ComponentFixture<Campanias>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Campanias]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Campanias);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
