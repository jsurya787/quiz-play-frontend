import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DarkHighlight } from './dark-highlight';

describe('DarkHighlight', () => {
  let component: DarkHighlight;
  let fixture: ComponentFixture<DarkHighlight>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DarkHighlight]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DarkHighlight);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
