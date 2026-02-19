import { Component, EventEmitter, inject, Input, Output, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { SetPasswordComponent } from "../shared/modals/set-password/set-password";
import { ToastService } from '../services/toast-service';
import { UserProfileModalComponent } from '../shared/modals/user-profile/user-profile';

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

  openUserProfile() {
    this.close.emit();
    this.showUserProfile.set(true);
  }

  closeUserProfile() {
    this.showUserProfile.set(false);
  }

  openSetPasswordFromProfile() {
    this.showUserProfile.set(false);
    this.showSetPassword.set(true);
  }



  handleSetPassword() {
    this.close.emit();               // close menu
    this.showSetPassword.set(true);  // open modal
  }

  referFriend() {
    const shareUrl = 'https://quizplay.co.in';
    const logoUrl = 'https://quizplay.co.in/qp-logo.svg';
    const shareText =
      `🚀 Level up your prep with QuizPlay!\n\n` +
      `🎯 Daily quizzes\n📚 Smart notes\n🏆 Better scores\n\n` +
      `✨ Join now: ${shareUrl}\n` +
      `🧩 Logo: ${logoUrl}`;

    // 1️⃣ Native share (best experience)
    if (navigator.share) {
      navigator
        .share({
          title: 'QuizPlay 🚀',
          text: shareText,
          url: shareUrl,
        })
        .then(() => {
          this.toaster.success('Invite sent 🚀🎉');
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
      this.toaster.success('Opening WhatsApp 💬✨');
      return;
    }

    // 3️⃣ Final fallback: copy link
    navigator.clipboard.writeText(shareUrl).then(() => {
      this.toaster.success('Link copied 🔗✨ Share the QuizPlay vibe!');
    });
    this.close.emit();
  }


}
