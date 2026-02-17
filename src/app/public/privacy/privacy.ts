import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Meta, Title } from '@angular/platform-browser';

@Component({
  selector: 'app-privacy',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './privacy.html',
  styleUrl: './privacy.css'
})
export class PrivacyComponent {
  private title = inject(Title);
  private meta = inject(Meta);

  constructor() {
    this.title.setTitle('Privacy Policy – QuizPlay');
    this.meta.updateTag({ name: 'description', content: 'QuizPlay Privacy Policy. Read how we protect your data and ensure your privacy while using our platform.' });
  }

  lastUpdated = 'January 20, 2026';
}
