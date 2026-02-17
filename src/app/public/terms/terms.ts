import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Meta, Title } from '@angular/platform-browser';

@Component({
  selector: 'app-terms',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './terms.html',
  styleUrl: './terms.css'
})
export class TermsComponent {
  private title = inject(Title);
  private meta = inject(Meta);

  constructor() {
    this.title.setTitle('Terms & Conditions – QuizPlay');
    this.meta.updateTag({ name: 'description', content: 'Terms and Conditions for using the QuizPlay platform. Rules, responsibilities, and legal agreements.' });
  }

  lastUpdated = 'February 20, 2026';
}
