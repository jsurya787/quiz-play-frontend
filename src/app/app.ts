import { Component, Inject, PLATFORM_ID, signal } from '@angular/core';
import { RouterOutlet, RouterLinkWithHref } from '@angular/router';
import { AuthService } from './services/auth.service';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UserMenuComponent } from "./user-menu.component/user-menu.component";
import { LoaderService } from './services/loader-service';
import { LoaderComponent } from "./loader/loader";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLinkWithHref, CommonModule, FormsModule, ReactiveFormsModule, UserMenuComponent, LoaderComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('QuizPlay');
  public isUserMenuOpen = false;
  private sessionRestored = false;

  constructor(
    public _authService : AuthService,
    @Inject(PLATFORM_ID) private platformId: Object,
    public _loaderService: LoaderService
  ) {
     // ✅ Restore session ONLY in browser
    if (isPlatformBrowser(this.platformId) && !this.sessionRestored) {
      this.sessionRestored = true;
      // ⏳ allow browser to attach cookies
      setTimeout(() => {
        this._authService.refreshToken().subscribe();
      }, 500);
    }
  }
  
}
