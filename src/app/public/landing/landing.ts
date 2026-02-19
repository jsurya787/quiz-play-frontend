import { Component } from '@angular/core';
  import { Meta, Title } from '@angular/platform-browser'; // for SEO management
import { HeroComponent } from '../hero/hero';
import { FeaturesComponent } from '../features/features';
import { TestimonialsComponent } from '../testimonials/testimonials';
import { FooterComponent } from '../footer/footer';
import { SubjectsComponent } from '../subjects/subjects';
import { DarkHighlightComponent } from '../dark-highlight/dark-highlight';
import { StatsComponent } from '../stats/stats';
import { SyllabusTimelineComponent } from '../syllabus-timeline/syllabus-timeline';
import { SuccessStoriesComponent } from '../success-stories/success-stories';
import { TrendingExamsComponent } from '../trending-exams/trending-exams';
import { QuizDemoComponent } from '../quiz-demo/quiz-demo';




@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [
    HeroComponent,
    FeaturesComponent,
    TestimonialsComponent,
    FooterComponent,
    SubjectsComponent,
    DarkHighlightComponent,
    StatsComponent,
    SyllabusTimelineComponent,
    SuccessStoriesComponent,
    TrendingExamsComponent,
    QuizDemoComponent,
],
  templateUrl: './landing.html'
})
export class LandingComponent {

constructor(private meta: Meta, private title: Title) {
  this.title.setTitle('QuizPlay – Learn with Fun');

  this.meta.addTags([
    { name: 'description', content: 'Practice Math, Physics & Chemistry quizzes for CBSE & ICSE students.' },
    { name: 'keywords', content: 'CBSE quiz, ICSE quiz, class 10 quiz, class 12 quiz' },
    { property: 'og:title', content: 'QuizPlay – Smart Quiz Platform' },
    { property: 'og:description', content: 'Interactive quizzes for board exam preparation.' }
  ]);
}

}
