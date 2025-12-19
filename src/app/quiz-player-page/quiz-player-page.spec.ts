import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuizPlayerPage } from './quiz-player-page';

describe('QuizPlayerPage', () => {
  let component: QuizPlayerPage;
  let fixture: ComponentFixture<QuizPlayerPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuizPlayerPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QuizPlayerPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
