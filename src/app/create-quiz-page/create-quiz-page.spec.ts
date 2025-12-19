import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateQuizPage } from './create-quiz-page';

describe('CreateQuizPage', () => {
  let component: CreateQuizPage;
  let fixture: ComponentFixture<CreateQuizPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateQuizPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateQuizPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
