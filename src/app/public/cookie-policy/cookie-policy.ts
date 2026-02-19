import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Meta, Title } from '@angular/platform-browser';

@Component({
  selector: 'app-cookie-policy',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cookie-policy.html',
  styleUrl: './cookie-policy.css',
})
export class CookiePolicyComponent {
  private title = inject(Title);
  private meta = inject(Meta);

  constructor() {
    this.title.setTitle('Cookie Policy – QuizPlay');
    this.meta.updateTag({
      name: 'description',
      content:
        'QuizPlay Cookie Policy. Learn what cookies we use, why we use them, and how you can manage your cookie preferences.',
    });
  }

  lastUpdated = 'February 18, 2026';
}
