import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChapterPagePage } from './chapter-page-page';

describe('ChapterPagePage', () => {
  let component: ChapterPagePage;
  let fixture: ComponentFixture<ChapterPagePage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChapterPagePage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChapterPagePage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
