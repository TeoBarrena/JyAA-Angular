import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EncuestadorDetail } from './encuestador-detail';

describe('EncuestadorDetail', () => {
  let component: EncuestadorDetail;
  let fixture: ComponentFixture<EncuestadorDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EncuestadorDetail]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EncuestadorDetail);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
