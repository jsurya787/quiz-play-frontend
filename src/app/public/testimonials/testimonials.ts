import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-testimonials',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './testimonials.html',
  styleUrls: ['./testimonials.scss']
})
export class TestimonialsComponent {
  reviews = [
    {
      text: "As a teacher, I love how easy it is to track student performance. The analytics are spot on.",
      author: "Mrs. Sen",
      role: "HOD Mathematics, DPS"
    },
    {
      text: "The conceptual questions really test the child's understanding. Much better than standard MCQs.",
      author: "Dr. Rajesh Gupta",
      role: "Parent of Class 12 Student"
    },
    {
      text: "QuizPlay made revision fun for my son. He actually looks forward to taking tests now.",
      author: "Priya Menon",
      role: "Parent"
    },
    {
      text: "Excellent question bank for JEE preparation. The difficulty level is perfectly progressive.",
      author: "Coach Ravi",
      role: "Physics Instructor"
    },
     {
      text: "Simple, clean, and effective. No distracting ads or clutter. Just pure learning.",
      author: "Ankit Roy",
      role: "Student, Class 11"
    }
  ];
}
