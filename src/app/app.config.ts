import {
  ApplicationConfig,
  APP_INITIALIZER,
  inject,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import {
  provideRouter,
  withInMemoryScrolling,
} from '@angular/router';
import {
  provideClientHydration,
  withEventReplay,
} from '@angular/platform-browser';
import { routes } from './app.routes';
import { AuthService } from './services/auth.service';

/**
 * 🔐 Restore auth state (NON-BLOCKING, SSR-SAFE)
 * Runs once during bootstrap
 */
function authInitializer() {
  const auth = inject(AuthService);
  return () => auth.bootstrapAuth(); // must always resolve
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),

    // 🔐 Auth restore BEFORE routing
    {
      provide: APP_INITIALIZER,
      useFactory: authInitializer,
      multi: true,
    },

    // 🧭 Router (SSR-friendly)
    provideRouter(
      routes,
      withInMemoryScrolling({
        anchorScrolling: 'enabled',
      }),
    ),

    // 💧 Client hydration
    provideClientHydration(withEventReplay()),
  ],
};
