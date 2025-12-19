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
      class: 'Class 10',
      score: 'Maths: 92%',
      image: '/assets/student1.png'
    },
    {
      name: 'Riya Sharma',
      class: 'Class 12',
      score: 'Physics: 95%',
      image: '/assets/student2.png'
    },
    {
      name: 'Kunal Singh',
      class: 'Class 12',
      score: 'Chemistry: 90%',
      image: '/assets/student3.png'
    }
  ];
}
