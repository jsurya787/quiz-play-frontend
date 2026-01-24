import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private _toasts = signal<Toast[]>([]);
  toasts = this._toasts.asReadonly();

  private id = 0;
  private dismissTimer: any = null;

  show(message: string, type: ToastType = 'info', duration = 1500) {
    // 🔥 Cancel previous toast + timer
    if (this.dismissTimer) {
      clearTimeout(this.dismissTimer);
      this.dismissTimer = null;
    }

    const toast: Toast = {
      id: ++this.id,
      message,
      type,
    };

    // 🔥 Replace existing toast (only ONE at a time)
    this._toasts.set([toast]);

    this.dismissTimer = setTimeout(() => {
      this._toasts.set([]);
      this.dismissTimer = null;
    }, duration);
  }

  success(msg: string) {
    this.show(msg, 'success');
  }

  error(msg: string) {
    this.show(msg, 'error', 3500);
  }

  info(msg: string) {
    this.show(msg, 'info');
  }

  warning(msg: string) {
    this.show(msg, 'warning');
  }
}
