import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Meta, Title } from '@angular/platform-browser';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './about.html',
  styleUrl: './about.css'
})
export class AboutComponent {
  private title = inject(Title);
  private meta = inject(Meta);

  constructor() {
    this.title.setTitle('About QuizPlay – Our Mission & Team');
    this.meta.updateTag({ name: 'description', content: 'Learn about QuizPlay, our mission to revolutionize education, and the team building future-ready learning tools.' });
    this.meta.updateTag({ property: 'og:title', content: 'About QuizPlay – Revolutionizing Learning' });
  }

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
    // {
    //   name: 'Rahul Mehta',
    //   role: 'Backend Engineer',
    //   bio: 'Focused on scalable APIs and real-time systems.',
    //   avatar: '🧠'
    // }
  ];
}
