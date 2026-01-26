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

  // 🚨 Never attach token to auth endpoints
  if (
    req.url.includes('/auth/google') ||
    req.url.includes('/auth/refresh')
  ) {
    return next(req.clone({ withCredentials: true }));
  }

  const token = auth.getAccessToken();

  // Attach token only once
  const authReq = token
    ? req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      })
    : req.clone({ withCredentials: true });

  return next(authReq).pipe(
    catchError(err => {
      if (err.status !== 401) {
        return throwError(() => err);
      }

      // 🔁 Refresh ONCE (via APP_INITIALIZER logic)
      return from(auth.bootstrapAuth()).pipe(
        switchMap(() => {
          const newToken = auth.getAccessToken();

          if (!newToken) {
            auth.logout();
            return throwError(() => err);
          }

          // 🔄 Retry ORIGINAL request with new token
          return next(
            req.clone({
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
