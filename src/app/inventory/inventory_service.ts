import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, of, switchMap, map, catchError } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class UserInventoryService {
  private apiUrl = 'https://gamewebapi-1.onrender.com';

  constructor(private http: HttpClient) {}

  getUserPurchasedGames(userId: number): Observable<any[]> {
    return this.http.get<number[]>(`${this.apiUrl}/user/purchases/${userId}`).pipe(
      map((gameIds) => gameIds || []),
      switchMap((gameIds) => {
        if (gameIds.length === 0) return of([]);
        const gameRequests = gameIds.map((id) =>
          this.http.get(`${this.apiUrl}/games/${id}`).pipe(
            catchError(() => of(null)) // ถ้า fetch เกมล้มเหลว → return null
          )
        );
        return forkJoin(gameRequests).pipe(
          map((games) => games.filter((g) => g !== null)) // ลบเกมที่ไม่เจอ
        );
      })
    );
  }
}
