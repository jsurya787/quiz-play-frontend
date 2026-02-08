import { Component, ElementRef, ViewChildren, QueryList, AfterViewInit, signal, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-stats',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './stats.html',
})
export class StatsComponent implements AfterViewInit {
  @ViewChildren('statItem') statItems!: QueryList<ElementRef>;
  
  stats = [
    { label: 'Active Students', value: 12000, suffix: '+', icon: '👨‍🎓', color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Quizzes Attempted', value: 50000, suffix: '+', icon: '📝', color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Success Rate', value: 95, suffix: '%', icon: '📈', color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Core Subjects', value: 12, suffix: '', icon: '📚', color: 'text-amber-600', bg: 'bg-amber-50' },
  ];

  animatedValues = signal<number[]>(this.stats.map(() => 0));
  hasAnimated = false;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngAfterViewInit() {
    // 🛡️ SSR Check: IntersectionObserver is a browser-only API
    if (isPlatformBrowser(this.platformId)) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !this.hasAnimated) {
            this.startAnimations();
            this.hasAnimated = true;
          }
        });
      }, { threshold: 0.5 });

      if (this.statItems.first) {
        observer.observe(this.statItems.first.nativeElement.parentElement!);
      }
    }
  }

  startAnimations() {
    this.stats.forEach((stat, index) => {
      const duration = 2000; // 2 seconds
      const steps = 60;
      const stepTime = duration / steps;
      const increment = stat.value / steps;
      let current = 0;

      const timer = setInterval(() => {
        current += increment;
        if (current >= stat.value) {
          current = stat.value;
          clearInterval(timer);
        }
        
        const newValues = [...this.animatedValues()];
        newValues[index] = Math.floor(current);
        this.animatedValues.set(newValues);
      }, stepTime);
    });
  }
}
