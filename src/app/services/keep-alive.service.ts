import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { interval } from 'rxjs';

/**
 * KeepAliveService - Maintains connection and prevents cold starts
 * Pings the keep-alive endpoint periodically from the client side
 */
@Injectable({
  providedIn: 'root'
})
export class KeepAliveService {
  private readonly KEEP_ALIVE_INTERVAL = 5 * 60 * 1000; // 5 minutes
  private readonly KEEP_ALIVE_URL = '/api/keep-alive';

  constructor(private http: HttpClient) { 
    this.initializeKeepAlive();
  }

  /**
   * Initialize keep-alive pings
   * This will run when the app is active in the browser
   */
  private initializeKeepAlive(): void {
    if (typeof window !== 'undefined') {
      // Run immediately on app start
      this.pingKeepAlive();

      // Then run periodically every 5 minutes
      interval(this.KEEP_ALIVE_INTERVAL).subscribe(() => {
        this.pingKeepAlive();
      });

      // Also ping when user returns to the tab
      if (typeof document !== 'undefined') {
        document.addEventListener('visibilitychange', () => {
          if (!document.hidden) {
            this.pingKeepAlive();
          }
        });
      }
    }
  }

  /**
   * Send keep-alive ping to the server
   */
  private pingKeepAlive(): void {
    this.http.get(this.KEEP_ALIVE_URL, { responseType: 'json' }).subscribe({
      next: (response) => {
        console.log('[Keep-Alive] Ping successful:', response);
      },
      error: (error) => {
        console.warn('[Keep-Alive] Ping failed:', error);
      }
    });
  }

  /**
   * Manual ping method (can be called from components if needed)
   */
  public manualPing(): Promise<any> {
    return this.http.get(this.KEEP_ALIVE_URL).toPromise();
  }
}
