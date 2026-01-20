import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

declare const google: any;

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly TOKEN_KEY = 'quizapp_google_id_token';
  public userId = "695f7eceebf73de912504bc3";

  constructor(private router: Router) {}

  /** Initialize Google Login */
  initGoogleLogin(clientId: string, callback: (response: any) => void) {
    google.accounts.id.initialize({
      client_id: clientId,
      callback,
    });
  }

  /** Render Google Sign-In button */
  renderButton(elementId: string) {
    google.accounts.id.renderButton(
      document.getElementById(elementId),
      {
        theme: 'outline',
        size: 'large',
        width: 300,
      }
    );
  }

  /** Handle login success */
  loginWithGoogle(response: any): void {
    if (response?.credential) {
      localStorage.setItem(this.TOKEN_KEY, response.credential);
      this.router.navigate(['/dashboard']);
    }
  }

  /** Logout */
  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);

    // Optional: Google logout
    if (google?.accounts?.id) {
      google.accounts.id.disableAutoSelect();
    }

    this.router.navigate(['/login']);
  }

  /** Check auth status */
  isAuthenticated(): boolean {
    return !!localStorage.getItem(this.TOKEN_KEY);
  }

  /** Get token */
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  storeToken(token: string): void {
  localStorage.setItem(this.TOKEN_KEY, token);
  }
}
