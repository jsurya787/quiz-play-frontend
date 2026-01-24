import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { environment } from '../../../../environment';
import { endpoints } from '../../../endpoints';

@Component({
  standalone: true,
  template: `<p class="text-center mt-10">Signing you in…</p>`,
})
export class GoogleCallbackComponent implements OnInit {

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private auth: AuthService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {}

  ngOnInit(): void {

    // 🚫 NEVER run OAuth logic on server
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const code = this.route.snapshot.queryParamMap.get('code');
    console.log('OAuth code:', code);

    if (!code) {
      this.router.navigate(['/login']);
      return;
    }

    this.http.post<any>(
      environment.apiUrl + endpoints.auth.loginWithGoogle,
      { code },
      { withCredentials: true } // 🔥 cookie must be set in browser
    )
    .subscribe({
      next: (res) => {
        console.log('OAuth success:', res);
        this.auth.setAccessToken(res.accessToken);
       // this.router.navigate(['/dashboard']);
       this.router.navigate(['/login-success']);
      },
      error: (err) => {
        console.error('OAuth failed:', err);
        this.router.navigate(['/login']);
      },
    });
  }
}
