import { Component, Inject, PLATFORM_ID} from '@angular/core';
import { RouterOutlet, RouterLinkWithHref, Router, NavigationEnd } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UserMenuComponent } from "./user-menu.component/user-menu.component";
import { LoaderComponent } from "./loader/loader";
import { ToastComponent } from "./shared/toast-component/toast-component";
import { Title } from '@angular/platform-browser';
import { filter } from 'rxjs';
import { AuthService } from './services/auth.service';
import { LoaderService } from './services/loader-service';
import { KeepAliveService } from './services/keep-alive.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLinkWithHref, CommonModule, FormsModule, ReactiveFormsModule, UserMenuComponent, LoaderComponent, ToastComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  public isUserMenuOpen = false;
  readonly primaryAccentClass = 'text-violet-700';
  readonly primaryGradientHeader = 'from-violet-600 via-indigo-600 to-blue-600';
  readonly primaryGradientButton =
    'bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 hover:from-violet-700 hover:via-indigo-700 hover:to-blue-700';

  constructor(
    private router: Router,
    private title: Title,
    public _authService:AuthService,
    public _loaderService: LoaderService,
    private _keepAliveService: KeepAliveService,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {
    this.title.setTitle('QuizPlay – Learn with Fun');
    // ✅ Browser-only code
    if (isPlatformBrowser(this.platformId)) {
      this.router.events
        .pipe(filter(e => e instanceof NavigationEnd))
        .subscribe((e: NavigationEnd) => {
          sessionStorage.setItem('lastUrl', e.urlAfterRedirects);
        });
    }
  }
  
}
