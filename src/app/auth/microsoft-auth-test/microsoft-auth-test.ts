import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import {
  MicrosoftAuthTestProfileResponse,
  MicrosoftAuthTestService,
} from '../../services/microsoft-auth-test.service';

type TestStatus = 'idle' | 'loading' | 'success' | 'error';

@Component({
  standalone: true,
  imports: [CommonModule],
  templateUrl: './microsoft-auth-test.html',
})
export class MicrosoftAuthTestComponent {
  readonly status = signal<TestStatus>('idle');
  readonly profile = signal<MicrosoftAuthTestProfileResponse | null>(null);
  readonly errorMessage = signal<string | null>(null);

  constructor(private readonly microsoftAuthTest: MicrosoftAuthTestService) {}

  async signIn(): Promise<void> {
    this.status.set('loading');
    this.profile.set(null);
    this.errorMessage.set(null);

    try {
      this.profile.set(await this.microsoftAuthTest.signInAndLoadProfile());
      this.status.set('success');
    } catch (error) {
      this.status.set('error');
      this.errorMessage.set(this.getErrorMessage(error));
    }
  }

  private getErrorMessage(error: unknown): string {
    if (typeof error === 'object' && error !== null && 'error' in error) {
      const response = error as { error?: { message?: string } };
      if (response.error?.message) {
        return response.error.message;
      }
    }

    return error instanceof Error
      ? error.message
      : 'Microsoft sign-in or the profile request failed. Please try again.';
  }
}