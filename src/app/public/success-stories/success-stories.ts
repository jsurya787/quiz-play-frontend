import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-success-stories',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './success-stories.html',
})
export class SuccessStoriesComponent {
  stories = [
    {
      name: 'Aman Verma',
      role: 'Class 10 Topper',
      quote: "QuizPlay helped me clear my concepts in Maths. The instant feedback was a game changer for my board prep.",
      score: '98% in Maths',
      image: 'https://ui-avatars.com/api/?name=Aman+Verma&background=6366f1&color=fff'
    },
    {
      name: 'Riya Sharma',
      role: 'NEET Aspirant',
      quote: "The physics quizzes are tough but exactly what I needed. I improved my speed by 30% in just two months.",
      score: '680/720 in Neet Mock',
      image: 'https://ui-avatars.com/api/?name=Riya+Sharma&background=a855f7&color=fff'
    },
    {
      name: 'Kunal Singh',
      role: 'JEE Main Qualified',
      quote: "Chemistry reactions were a nightmare until I started practicing here. The visual explanations are amazing.",
      score: '99.5 Percentile',
      image: 'https://ui-avatars.com/api/?name=Kunal+Singh&background=10b981&color=fff'
    }
  ];
}
