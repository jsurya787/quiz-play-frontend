import { Component, signal } from '@angular/core';
import { RouterOutlet, RouterLinkWithHref } from '@angular/router';
import { AuthService } from './services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UserMenuComponent } from "./user-menu.component/user-menu.component";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLinkWithHref, CommonModule, FormsModule, ReactiveFormsModule, UserMenuComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('QuizPlay');
  public isUserMenuOpen = false;

  constructor(
    public _authService : AuthService
  ) {}
  
}
