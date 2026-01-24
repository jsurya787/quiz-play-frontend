import { Component, effect, signal } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-login-success',
  templateUrl: './login-success-component.html',
  styleUrls: ['./login-success-component.css'],
})
export class LoginSuccessComponent {
  username: string = "jaisurya"
  visible = signal(true);

  constructor(private router: Router) {
    // 🎬 Auto-exit after animation
    setTimeout(() => {
      this.visible.set(false);

      // navigate after exit animation
      setTimeout(() => {
        this.router.navigate(['/dashboard']);
      }, 300);
    }, 1200);
  }
}
