import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './about.html',
})
export class AboutComponent {
  team = [
    {
      name: 'Jaisurya Kataria',
      role: 'Founder & FullStack Engineer',
      bio: 'Building intuitive learning experiences with Angular/NestJS.',
      avatar: '👨‍💻'
    },
    {
      name: 'Shephali Kalia',
      role: 'Education Advisor',
      bio: 'Helping shape meaningful assessment systems.',
      avatar: '👩‍🏫'
    },
    {
      name: 'Rahul Mehta',
      role: 'Backend Engineer',
      bio: 'Focused on scalable APIs and real-time systems.',
      avatar: '🧠'
    }
  ];
}
