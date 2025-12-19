import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChapterList } from './chapter-list';

describe('ChapterList', () => {
  let component: ChapterList;
  let fixture: ComponentFixture<ChapterList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChapterList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChapterList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
