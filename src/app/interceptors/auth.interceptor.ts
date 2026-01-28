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
    originReq.url.includes('/auth/refresh')
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
