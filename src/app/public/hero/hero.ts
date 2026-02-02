import { Component, inject, signal } from '@angular/core';
import { Router } from "@angular/router";
import { AuthService } from '../../services/auth.service';
import { SubjectService } from '../../services/subject.service';

@Component({
  selector: 'app-hero',
  standalone: true,
  templateUrl: './hero.html',
})
export class HeroComponent {

  private readonly router = inject(Router);
  private readonly _auth = inject(AuthService);
  public  subjectService = inject(SubjectService);
  loading = signal(false);

  constructor() {
    if(this.subjectService.subjects().length === 0){
      this.getPrimarySubjects();
    }else{
      this.loading.set(true);
    }
  
  }



  navigateToQuizzes(_id: string) {
    this.router.navigate([`/dashboard/${_id}`]);
  }

  navigateToCreateQuizPage() {
    if(this._auth.isAuthenticated()){
      this.router.navigate(['/create-quiz-page']);
      return;
    } 
    this.router.navigate(['/login']);
  }

    getPrimarySubjects(): void {
    this.subjectService.getPrimarySubjects().subscribe({
      next: (res) => {
        this.subjectService.subjects.set(res?.data ?? []);
        this.loading.set(true);
      },
      error: (err) => {
        console.error('Error fetching primary subjects:', err);
        this.subjectService.subjects.set([]);
        this.loading.set(false);
      },
    });
  }
}
