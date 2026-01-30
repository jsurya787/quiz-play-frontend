import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class RetryAttemptService {
  private platformId = inject(PLATFORM_ID);

  private readonly ATTEMPT_KEY = 'quiz_attempt_count';
  private readonly MAX_ATTEMPTS = 10;
  private readonly QUIZ_CREATE_KEY = 'quiz_create_count';
  private readonly MAX_QUIZ_CREATED = 2;
  private readonly SAVED_TIME_KEY = 'saved_time';

  /** Get current attempt count */
  getAttempts(): number {
    if (!isPlatformBrowser(this.platformId)) {
      return 0;
    }
    return Number(localStorage.getItem(this.ATTEMPT_KEY) || 0);
  }

  getQuizCreated(): number {
    if (!isPlatformBrowser(this.platformId)) {
      return 0;
    }
    return Number(localStorage.getItem(this.QUIZ_CREATE_KEY) || 0);
  }

  /** Check if user can attempt quiz */
  canAttempt(): boolean {
    return this.getAttempts() < this.MAX_ATTEMPTS;
  }

  canCreate(): boolean {
    return this.getQuizCreated() < this.MAX_QUIZ_CREATED;
  }

  /** Increase attempt count */
  increaseAttempt(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const current = this.getAttempts();
    localStorage.setItem(this.ATTEMPT_KEY, String(current + 1));
  }
  increaseQuizCreated(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const current = this.getQuizCreated();
    localStorage.setItem(this.QUIZ_CREATE_KEY, String(current + 1));
  }

  /** Remaining attempts (for UI if needed) */
  getRemainingAttempts(): number {
    return Math.max(this.MAX_ATTEMPTS - this.getAttempts(), 0);
  }

  getRemainingQuizCreated(): number {
    return Math.max(this.MAX_QUIZ_CREATED - this.getQuizCreated(), 0);
  }

  /** Reset attempts after Google login */
  resetAttempts(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    localStorage.removeItem(this.ATTEMPT_KEY);
  }

  resetQuizCreated(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    localStorage.removeItem(this.QUIZ_CREATE_KEY);
  }

  /** Reset all data */

  resetAll(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const savedTime = Number(localStorage.getItem(this.SAVED_TIME_KEY) || Date.now());

    const currentTime = Date.now();

    // 24 hours in milliseconds
    const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;

    if (currentTime - savedTime > TWENTY_FOUR_HOURS) {
      this.resetAttempts();
      this.resetQuizCreated();
    }
  }
}
