import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { AuthService, UserRole } from '../auth';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterModule, CommonModule, HttpClientModule],
  templateUrl: './header.html',
  styleUrls: ['./header.scss']
})
export class Navbar {
  isLoggedIn = false;
  role: UserRole = 'guest';
  user: any = {}; // reactive user

  private apiUrl = 'https://gamewebapi-1.onrender.com';

  constructor(public authService: AuthService, private http: HttpClient) {
    // subscribe reactive data
    this.authService.isLoggedIn$.subscribe(status => this.isLoggedIn = status);
    this.authService.role$.subscribe(r => this.role = r);
    this.authService.user$.subscribe(u => this.user = u);
  }

  logout() {
    this.http.post(`${this.apiUrl}/logout`, {}, { withCredentials: true })
      .subscribe({
        next: () => this.authService.logout(),
        error: err => alert(err.error?.message || 'Logout failed')
      });
  }
}
