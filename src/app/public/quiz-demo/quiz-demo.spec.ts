import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuizDemo } from './quiz-demo';

describe('QuizDemo', () => {
  let component: QuizDemo;
  let fixture: ComponentFixture<QuizDemo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuizDemo]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QuizDemo);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
