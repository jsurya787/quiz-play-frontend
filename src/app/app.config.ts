import {
  ApplicationConfig,
  APP_INITIALIZER,
  inject,
  PLATFORM_ID,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import {
  provideRouter,
  withInMemoryScrolling,
} from '@angular/router';
import {
  provideClientHydration,
  withEventReplay,
} from '@angular/platform-browser';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';
import { AuthService } from './services/auth.service';
import { authInterceptor } from './interceptors/auth.interceptor';
import { MSAL_INSTANCE, MsalService } from '@azure/msal-angular';
import { createMsalInstance } from './auth/microsoft-auth.config';
import { MicrosoftAuthService } from './auth/microsoft-auth.service';

/**
 * 🔐 Restore auth state (NON-BLOCKING, SSR-SAFE)
 * Runs once during bootstrap
 */
function authInitializer() {
  const auth = inject(AuthService);
  const platformId = inject(PLATFORM_ID);
  return () => {
    if (isMicrosoftRedirectPage(platformId)) {
      return Promise.resolve();
    }
    return auth.bootstrapAuth();
  };
}

function microsoftAuthInitializer() {
  const microsoftAuth = inject(MicrosoftAuthService);
  const platformId = inject(PLATFORM_ID);
  return () =>
    isMicrosoftRedirectPage(platformId) ? Promise.resolve() : microsoftAuth.initialize();
}

function isMicrosoftRedirectPage(platformId: object): boolean {
  return isPlatformBrowser(platformId) && window.location.pathname.endsWith('/redirect');
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),

    { provide: MSAL_INSTANCE, useFactory: createMsalInstance },
    MsalService,

    // 🔐 Auth restore BEFORE routing
    {
      provide: APP_INITIALIZER,
      useFactory: authInitializer,
      multi: true,
    },
    {
      provide: APP_INITIALIZER,
      useFactory: microsoftAuthInitializer,
      multi: true,
    },

    // 🧭 Router (SSR-friendly)
    provideRouter(
      routes,
      withInMemoryScrolling({
        anchorScrolling: 'enabled',
        scrollPositionRestoration: 'enabled',
      }),
    ),

    // 💧 Client hydration
    provideClientHydration(withEventReplay()),

    // 🌐 HTTP Client (Fetch for SSR)
    provideHttpClient(withFetch(), withInterceptors([authInterceptor])),
  ],
};
