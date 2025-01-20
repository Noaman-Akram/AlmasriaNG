import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GorderComponent } from './gorder.component';

describe('GorderComponent', () => {
  let component: GorderComponent;
  let fixture: ComponentFixture<GorderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GorderComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GorderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
