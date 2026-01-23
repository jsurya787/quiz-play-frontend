import { bootstrapApplication } from '@angular/platform-browser';
import {
  provideHttpClient,
  withFetch,
  withInterceptors,
} from '@angular/common/http';
import { App } from './app/app';
import { appConfig } from './app/app.config';
import { authInterceptor } from './app/interceptors/auth.interceptor';

bootstrapApplication(App, {
  providers: [
    provideHttpClient(
      withFetch(),                    // SSR-safe
      withInterceptors([authInterceptor]) // 🔥 Angular 20 way
    ),
    ...(appConfig.providers ?? []),
  ],
}).catch(console.error);
