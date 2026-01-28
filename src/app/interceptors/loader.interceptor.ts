import { inject } from '@angular/core';
import {
  HttpInterceptorFn,
  HttpRequest,
  HttpHandlerFn,
} from '@angular/common/http';
import { finalize } from 'rxjs';
import { LoaderService } from '../services/loader-service';

export const loaderInterceptor: HttpInterceptorFn = (
  req: HttpRequest<any>,
  next: HttpHandlerFn
) => {
  const loader = inject(LoaderService);

  // ⛔ Skip loader for quiz answer API
  if (req.url.includes('/quiz-player/answer')) {
    return next(req);
  }

  // ⛔ Skip loader if explicitly disabled via header
  if (req.headers.has('X-No-Loader')) {
    return next(req);
  }

  loader.show();

  return next(req).pipe(
    finalize(() => loader.hide())
  );
};
