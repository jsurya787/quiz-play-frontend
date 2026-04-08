import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, switchMap } from 'rxjs';
import { environment } from '../../../environment';

interface SignatureResponse {
  success: boolean;
  data: {
    timestamp: number;
    folder: string;
    signature: string;
    cloudName: string;
    apiKey: string;
  };
}

@Injectable({ providedIn: 'root' })
export class CloudinaryService {
  private http = inject(HttpClient);
  private readonly API = `${environment.apiUrl}/cloudinary/signature`;

  getSignature(folder = 'subjects'): Observable<SignatureResponse['data']> {
    return this.http
      .post<SignatureResponse>(this.API, { folder })
      .pipe(map((res) => res.data));
  }

  uploadImage(file: File, folder = 'subjects'): Observable<{ url: string; publicId: string }> {
    return this.getSignature(folder).pipe(
      switchMap((sig) => {
        const uploadUrl = `https://api.cloudinary.com/v1_1/${sig.cloudName}/image/upload`;
        const form = new FormData();
        form.append('file', file);
        form.append('api_key', sig.apiKey);
        form.append('timestamp', String(sig.timestamp));
        form.append('signature', sig.signature);
        form.append('folder', sig.folder);

        return this.http.post<any>(uploadUrl, form).pipe(
          map((r) => ({
            url: r.secure_url as string,
            publicId: r.public_id as string,
          })),
        );
      }),
    );
  }
}

