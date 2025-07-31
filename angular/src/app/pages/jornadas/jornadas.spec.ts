import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Jornadas } from './jornadas';

describe('Jornadas', () => {
  let component: Jornadas;
  let fixture: ComponentFixture<Jornadas>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Jornadas]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Jornadas);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
