import { isPlatformBrowser } from '@angular/common';
import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { broadcastResponseToMainFrame } from '@azure/msal-browser/redirect-bridge';

@Component({
  standalone: true,
  template: '<p>Completing Microsoft sign-in...</p>',
})
export class MicrosoftRedirectComponent implements OnInit {
  constructor(@Inject(PLATFORM_ID) private readonly platformId: object) {}

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    broadcastResponseToMainFrame().catch((error: unknown) => {
      console.error('Microsoft sign-in response could not be returned to the app.');
      console.error(error);
    });
  }
}