import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-syllabus-timeline',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './syllabus-timeline.html',
})
export class SyllabusTimelineComponent {
  syllabus = [
    { step: 'Algebra & Trigonometry', subject: 'Maths' },
    { step: 'Laws of Motion', subject: 'Physics' },
    { step: 'Chemical Reactions', subject: 'Chemistry' },
    { step: 'Mock Tests & Revisions', subject: 'All Subjects' },
  ];
}
