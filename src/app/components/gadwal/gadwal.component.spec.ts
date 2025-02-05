import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GadwalComponent } from './gadwal.component';

describe('GadwalComponent', () => {
  let component: GadwalComponent;
  let fixture: ComponentFixture<GadwalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GadwalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GadwalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
