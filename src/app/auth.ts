import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

export type UserRole = 'guest' | 'user' | 'admin';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = 'https://gamewebapi-1.onrender.com';

  private loggedIn = new BehaviorSubject<boolean>(false);
  private role = new BehaviorSubject<UserRole>('guest');
  private userId = new BehaviorSubject<string | null>(null);
  private user = new BehaviorSubject<any>({}); // เก็บข้อมูล user

  isLoggedIn$ = this.loggedIn.asObservable();
  role$ = this.role.asObservable();
  userId$ = this.userId.asObservable();
  user$ = this.user.asObservable();

  constructor(private router: Router, private http: HttpClient) {
    this.loadState();
  }

  private loadState(): void {
    const storedRole = localStorage.getItem('user_role') as UserRole;
    const storedId = localStorage.getItem('user_id');

    if (storedRole && storedId) {
      this.loggedIn.next(true);
      this.role.next(storedRole);
      this.userId.next(storedId);
      this.fetchUser(storedId);
    }
  }
    getUser() {
    return this.user.getValue();
  }

setUser(user: any) {
  this.user.next(user);
}

  login(userRole: UserRole = 'user', id: string) {
    localStorage.setItem('user_role', userRole);
    localStorage.setItem('user_id', id);

    this.loggedIn.next(true);
    this.role.next(userRole);
    this.userId.next(id);

    this.fetchUser(id);
  }

  fetchUser(userId: string) {
    this.http.get<any>(`${this.apiUrl}/users/${userId}`, { withCredentials: true })
      .subscribe({
        next: user => this.user.next(user),
        error: err => console.error('Cannot fetch user', err)
      });
  }

  logout() {
    localStorage.clear();
    this.loggedIn.next(false);
    this.role.next('guest');
    this.userId.next(null);
    this.user.next({});

    this.router.navigateByUrl('/login', { replaceUrl: true });
  }

  getRole(): UserRole {
    return this.role.getValue();
  }

  getUserId(): string | null {
    return this.userId.getValue();
  }
}
