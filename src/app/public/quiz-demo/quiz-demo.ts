import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-quiz-demo',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './quiz-demo.html',
})
export class QuizDemoComponent {
  selectedOption = signal<number | null>(null);
  showResult = signal(false);
  
  question = {
    text: "In the equation E = mc², what does 'c' represent?",
    options: [
      { id: 1, text: "Circumference" },
      { id: 2, text: "Speed of Light", isCorrect: true },
      { id: 3, text: "Constant Gravity" },
      { id: 4, text: "Celcius" }
    ]
  };

  selectOption(id: number) {
    if (this.showResult()) return;
    this.selectedOption.set(id);
    
    // Simulate checking answer after short delay
    setTimeout(() => {
      this.showResult.set(true);
    }, 600);
  }
}
