import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import {
  catchError,
  switchMap,
  throwError,
  from,
} from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);

  // ✅ Never attach custom headers/tokens/cookies to Cloudinary requests (prevents CORS preflight failures)
  if (req.url.includes('api.cloudinary.com')) {
    return next(req);
  }

  // ✅ ADD ONLY THIS (client origin)
  const clientOrigin =
    typeof window !== 'undefined' ? window.location.origin : '';

  const originReq = clientOrigin
    ? req.clone({
        setHeaders: {
          'X-Client-Origin': clientOrigin,
        },
      })
    : req;

  // 🚨 Never attach token to auth endpoints
  if (
    originReq.url.includes('/auth/google') || 
    originReq.url.includes('/auth/refresh') ||
    originReq.url.includes('/auth/login') ||
    originReq.url.includes('/auth/signup') ||
    originReq.url.includes('/auth/logout') ||
    originReq.url.includes('/auth/google/callback')
  ) {
    return next(originReq.clone({ withCredentials: true }));
  }

  const token = auth.getAccessToken();

  // Attach token only once
  const authReq = token
    ? originReq.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      })
    : originReq.clone({ withCredentials: true });

  return next(authReq).pipe(
    catchError(err => {
      if (err.status !== 401) {
        return throwError(() => err);
      }

      // ✅ Only refresh if we don't already have a token
      // If we have a token and got 401, it means the token is invalid
      // In that case, just logout instead of refreshing again
      const currentToken = auth.getAccessToken();
      
      if (currentToken) {
        // Token exists but is invalid → logout
        auth.logout();
        return throwError(() => err);
      }

      // No token → try to refresh (shared promise prevents duplicates)
      return from(auth.bootstrapAuth()).pipe(
        switchMap(() => {
          const newToken = auth.getAccessToken();

          if (!newToken) {
            auth.logout();
            return throwError(() => err);
          }

          return next(
            originReq.clone({
              setHeaders: {
                Authorization: `Bearer ${newToken}`,
              },
              withCredentials: true,
            }),
          );
        }),
        catchError(() => {
          auth.logout();
          return throwError(() => err);
        }),
      );
    }),
  );
};
