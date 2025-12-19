import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SyllabusTimeline } from './syllabus-timeline';

describe('SyllabusTimeline', () => {
  let component: SyllabusTimeline;
  let fixture: ComponentFixture<SyllabusTimeline>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SyllabusTimeline]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SyllabusTimeline);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
