import { Component, EventEmitter, inject, Input, Output, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { SetPasswordComponent } from "../shared/modals/set-password/set-password";
import { UserProfileModalComponent } from "../shared/modals/user-profile/user-profile";
import { ToastService } from '../services/toast-service';

@Component({
  selector: 'app-user-menu',
  standalone: true,
  templateUrl: './user-menu.component.html',
  imports: [SetPasswordComponent, UserProfileModalComponent, RouterLink],
})
export class UserMenuComponent {
  @Input() open = false;
  @Output() close = new EventEmitter<void>();
  year: any = new Date().getFullYear();
  private toaster = inject(ToastService);
    // 🔥 popup state
  showSetPassword = signal(false);
  showUserProfile = signal(false);

  constructor(
    public auth: AuthService,
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

  openUserProfile() {
    this.showUserProfile.set(true);
  }

  closeUserProfile() {
    this.close.emit(); 
    this.showUserProfile.set(false);
}

  referFriend() {
    const shareText =
      `Hey 👋\nI’ve been using QuizPlay to practice quizzes & notes — it’s super useful 📚✨\n\nTry it here 👉 https://quizplay.co.in`;

    const shareUrl = 'https://quizplay.co.in';

    // 1️⃣ Native share (best experience)
    if (navigator.share) {
      navigator
        .share({
          title: 'QuizPlay',
          text: shareText,
          url: shareUrl,
        })
        .then(() => {
          this.toaster.success('Invite sent 🎉');
        })
        .catch(() => {
          // user cancelled — do nothing
        });
      return;
    }

    // 2️⃣ WhatsApp fallback (mobile + desktop)
    const whatsappUrl =
      `https://wa.me/?text=${encodeURIComponent(shareText)}`;

    const opened = window.open(whatsappUrl, '_blank');

    if (opened) {
      this.toaster.success('Opening WhatsApp…');
      return;
    }

    // 3️⃣ Final fallback: copy link
    navigator.clipboard.writeText(shareUrl).then(() => {
      this.toaster.success('Link copied ✔ Share it with your friends!');
    });
    this.close.emit();
  }


}
