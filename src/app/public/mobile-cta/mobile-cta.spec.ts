import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MobileCta } from './mobile-cta';

describe('MobileCta', () => {
  let component: MobileCta;
  let fixture: ComponentFixture<MobileCta>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MobileCta]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MobileCta);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
