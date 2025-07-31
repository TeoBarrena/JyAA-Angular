import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Encuestadores } from './encuestadores';

describe('Encuestadores', () => {
  let component: Encuestadores;
  let fixture: ComponentFixture<Encuestadores>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Encuestadores]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Encuestadores);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
