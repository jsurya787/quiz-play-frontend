import { HttpBackend, HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { MsalService } from '@azure/msal-angular';
import { AccountInfo, InteractionRequiredAuthError } from '@azure/msal-browser';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environment';

const API_SCOPE = 'api://e5d02b87-801a-4c14-bba4-7fa58bf43949/access_as_user';

export interface MicrosoftAuthTestProfileResponse {
  success: boolean;
  message: string;
  user: {
    name?: string;
    preferred_username?: string;
    oid?: string;
    tid: string;
  };
}

@Injectable({ providedIn: 'root' })
export class MicrosoftAuthTestService {
  private readonly http: HttpClient;
  private readonly msal = inject(MsalService);
  private readonly profileUrl = new URL(
    'microsoft-auth-test/profile',
    `${environment.microsoftAuthTestApiUrl.replace(/\/$/, '')}/`,
  ).toString();

  constructor(httpBackend: HttpBackend) {
    // Keep the existing application interceptor from replacing this test's bearer token.
    this.http = new HttpClient(httpBackend);
  }

  async signInAndLoadProfile(): Promise<MicrosoftAuthTestProfileResponse> {
    const loginResult = await firstValueFrom(
      this.msal.loginPopup({ scopes: [API_SCOPE], prompt: 'select_account' }),
    );
    const account = this.resolveAccount(loginResult.account);
    const accessToken = await this.acquireApiToken(account);
    console.info('Microsoft API access token acquired; Authorization header attached.');

    return firstValueFrom(
      this.http.get<MicrosoftAuthTestProfileResponse>(this.profileUrl, {
        headers: new HttpHeaders({ Authorization: `Bearer ${accessToken}` }),
      }),
    );
  }

  private resolveAccount(loginAccount: AccountInfo | null): AccountInfo {
    const account =
      loginAccount ??
      this.msal.instance.getActiveAccount() ??
      this.msal.instance.getAllAccounts()[0];

    if (!account) {
      throw new Error('Microsoft sign-in completed without an account. Please try again.');
    }

    this.msal.instance.setActiveAccount(account);
    return account;
  }

  private async acquireApiToken(account: AccountInfo): Promise<string> {
    const request = { account, scopes: [API_SCOPE] };

    try {
      const result = await firstValueFrom(this.msal.acquireTokenSilent(request));
      return result.accessToken;
    } catch (error) {
      if (!(error instanceof InteractionRequiredAuthError)) {
        throw error;
      }

      const result = await firstValueFrom(this.msal.acquireTokenPopup(request));
      if (result.account) {
        this.msal.instance.setActiveAccount(result.account);
      }
      return result.accessToken;
    }
  }
}