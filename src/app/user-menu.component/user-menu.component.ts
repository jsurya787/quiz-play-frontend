import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { SetPasswordComponent } from "../shared/modals/set-password/set-password";

@Component({
  selector: 'app-user-menu',
  standalone: true,
  templateUrl: './user-menu.component.html',
  imports: [SetPasswordComponent],
})
export class UserMenuComponent {
  @Input() open = false;
  @Output() close = new EventEmitter<void>();
  year: any = new Date().getFullYear();
    // 🔥 popup state
  showSetPassword = signal(false);

  constructor(
    private auth: AuthService,
    private router: Router
  ) {}

  logout() {
    this.auth.logout();
    this.close.emit();
    this.router.navigate(['/login']);
  }

  onSetPassword() {
    this.showSetPassword.set(true);
  }

  closeSetPassword() {
    this.showSetPassword.set(false);
  }



handleSetPassword() {
  this.close.emit();               // close menu
  this.showSetPassword.set(true);  // open modal
}




}
