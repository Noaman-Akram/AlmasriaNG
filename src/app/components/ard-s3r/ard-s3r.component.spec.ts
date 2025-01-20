import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ArdS3rComponent } from './ard-s3r.component';

describe('ArdS3rComponent', () => {
  let component: ArdS3rComponent;
  let fixture: ComponentFixture<ArdS3rComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ArdS3rComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ArdS3rComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
