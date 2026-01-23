import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LoaderService {
  // number of active requests
  private activeRequests = 0;

  private _loading = signal(false);
  readonly loading = this._loading.asReadonly();

  show(): void {
    this.activeRequests++;
    if (this.activeRequests === 1) {
      this._loading.set(true);
    }
  }

  hide(): void {
    if (this.activeRequests > 0) {
      this.activeRequests--;
    }

    if (this.activeRequests === 0) {
      this._loading.set(false);
    }
  }

  /** Force hide (logout / fatal error) */
  reset(): void {
    this.activeRequests = 0;
    this._loading.set(false);
  }
}
