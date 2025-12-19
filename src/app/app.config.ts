import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import {
  provideRouter,
  withInMemoryScrolling,
} from '@angular/router';
import { routes } from './app.routes';
import {
  provideClientHydration,
  withEventReplay,
} from '@angular/platform-browser';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),

    provideRouter(
      routes,

      // ✅ ALWAYS start new navigation from top
      // withScrollPositionRestoration('top'),

      // ✅ Enable anchor (#id) scrolling if needed
      withInMemoryScrolling({
        anchorScrolling: 'enabled',
      }),
    ),

    provideClientHydration(withEventReplay()),
  ],
};
