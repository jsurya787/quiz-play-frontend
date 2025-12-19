import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  imports: [CommonModule],
  template: `
  <section class="min-h-screen flex items-center justify-center bg-gray-50 px-6">
    <div class="bg-white p-8 rounded-2xl shadow-xl w-full max-w-xl">

      <h2 class="font-bold text-lg mb-4">
        Q. What is the value of sin²θ + cos²θ?
      </h2>

      <div class="space-y-3">
        <div class="quiz-option">0</div>
        <div class="quiz-option bg-indigo-100">1 ✔</div>
        <div class="quiz-option">2</div>
        <div class="quiz-option">θ</div>
      </div>

    </div>
  </section>
  `
})
export class QuizPlayComponent {}
