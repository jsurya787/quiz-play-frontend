import { Inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { MsalService } from '@azure/msal-angular';
import { AccountInfo } from '@azure/msal-browser';
import { firstValueFrom } from 'rxjs';

export interface MicrosoftAccountProfile {
  displayName: string;
  email: string | null;
  username: string;
}

interface MicrosoftIdTokenClaims {
  name?: string;
  email?: string;
  preferred_username?: string;
}

@Injectable({ providedIn: 'root' })
export class MicrosoftAuthService {
  readonly profile = signal<MicrosoftAccountProfile | null>(null);
  private initialization: Promise<void> | null = null;

  constructor(
    private readonly msal: MsalService,
    @Inject(PLATFORM_ID) private readonly platformId: object,
  ) {}

  initialize(): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) {
      return Promise.resolve();
    }

    if (!this.initialization) {
      this.initialization = firstValueFrom(this.msal.initialize())
        .then(() => {
          const account =
            this.msal.instance.getActiveAccount() ?? this.msal.instance.getAllAccounts()[0];
          if (account) {
            this.setAccount(account);
          }
        })
        .catch(() => {
          this.initialization = null;
        });
    }

    return this.initialization;
  }

  async signIn(): Promise<void> {
    const result = await firstValueFrom(
      this.msal.loginPopup({ scopes: [], prompt: 'select_account' }),
    );

    if (!result.account) {
      throw new Error('Microsoft did not return an account.');
    }

    this.setAccount(result.account);
    console.log('Microsoft user info:', this.profile());
  }

  async signOut(): Promise<void> {
    const account = this.msal.instance.getActiveAccount() ?? undefined;
    await firstValueFrom(this.msal.logoutPopup({ account }));
    this.profile.set(null);
  }

  isCancellation(error: unknown): boolean {
    return (
      typeof error === 'object' &&
      error !== null &&
      'errorCode' in error &&
      (error as { errorCode?: unknown }).errorCode === 'user_cancelled'
    );
  }

  private setAccount(account: AccountInfo): void {
    this.msal.instance.setActiveAccount(account);
    const claims = account.idTokenClaims as MicrosoftIdTokenClaims | undefined;
    this.profile.set({
      displayName: claims?.name || account.name || account.username || 'Microsoft account',
      email: claims?.email || claims?.preferred_username || null,
      username: account.username,
    });
  }
}