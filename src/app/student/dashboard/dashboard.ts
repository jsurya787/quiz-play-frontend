import { Component, inject, signal } from '@angular/core';
import { Subject, SubjectService } from '../../services/subject.service';
import { QuizService } from '../../services/quiz.service';
import { AdminRoutingModule } from "../../admin/admin-routing-module";

@Component({
  standalone: true,
  templateUrl:'./dashboard.html',
  styleUrls: ['./dashboard.css'],
  imports: [AdminRoutingModule],
})
export class DashboardComponent {

  private subjectService = inject(SubjectService);
  private quizService = inject(QuizService);
  subjects = signal<Subject[]>([]);
  quizess = signal<any[]>([]);
  constructor(){
    this.loadSubjects();
    this.loadQuizes();
  }

  

  loadSubjects(): void {
    this.subjectService.getSubjects().subscribe({
      next: res => {
        if (res.success) {
          this.subjects.set(res.data);
        }
      },
      error: err =>
        console.error(err.error?.message || 'Failed to load subjects'),
    });
  }

  loadQuizes(): void {
    this.quizService.getQuizes().subscribe({
      next: res => {
        if (res.success) {
          this.quizess.set(res.data);
        }
      },
      error: err =>
        console.error(err.error?.message || 'Failed to load subjects'),
    });
  }
  
}
