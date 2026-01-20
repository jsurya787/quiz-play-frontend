import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-user-menu',
  standalone: true,
  templateUrl: './user-menu.component.html',
})
export class UserMenuComponent {
  @Input() open = false;
  @Output() close = new EventEmitter<void>();

  constructor(
    private auth: AuthService,
    private router: Router
  ) {}

  logout() {
    this.auth.logout();
    this.close.emit();
    this.router.navigate(['/login']);
  }
}
