import { Component } from '@angular/core';
  import { Meta, Title } from '@angular/platform-browser'; // for SEO management
import { HeroComponent } from '../hero/hero';
import { FeaturesComponent } from '../features/features.js';
import { TestimonialsComponent } from '../testimonials/testimonials';
import { AboutComponent } from '../about/about';
import { FooterComponent } from '../footer/footer';
import { SubjectsComponent } from '../subjects/subjects';
import { DarkHighlightComponent } from '../dark-highlight/dark-highlight';
import { StatsComponent } from '../stats/stats';
import { SyllabusTimelineComponent } from '../syllabus-timeline/syllabus-timeline';
import { SuccessStoriesComponent } from '../success-stories/success-stories';
import { ExamsComponent } from '../exams/exams';
import { ScrollProgressComponent } from '../scroll-progress/scroll-progress';
import { QuizDemoComponent } from '../quiz-demo/quiz-demo';
import { AuthFunnelComponent } from '../../shared-auth/auth-funnel/auth-funnel';
import { MobileCtaComponent } from '../mobile-cta/mobile-cta';




@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [
    HeroComponent,
    FeaturesComponent,
    TestimonialsComponent,
    AboutComponent,
    FooterComponent,
    SubjectsComponent,
    DarkHighlightComponent,
    StatsComponent,
    SyllabusTimelineComponent,
    SuccessStoriesComponent,
    ExamsComponent,
    ScrollProgressComponent,
    QuizDemoComponent,
   // AuthFunnelComponent,
   // MobileCtaComponent
],
  templateUrl: './landing.html'
})
export class LandingComponent {

constructor(private meta: Meta, private title: Title) {
  this.title.setTitle('LearnGround – Class 10 & 12 Quiz Platform');

  this.meta.addTags([
    { name: 'description', content: 'Practice Math, Physics & Chemistry quizzes for CBSE & ICSE students.' },
    { name: 'keywords', content: 'CBSE quiz, ICSE quiz, class 10 quiz, class 12 quiz' },
    { property: 'og:title', content: 'LearnGround – Smart Quiz Platform' },
    { property: 'og:description', content: 'Interactive quizzes for board exam preparation.' }
  ]);
}

}
