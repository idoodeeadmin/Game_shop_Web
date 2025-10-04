import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService,UserRole } from '../auth';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './header.html',
  styleUrls: ['./header.scss']
})
export class Navbar {
  isLoggedIn = false;
  role: UserRole = 'guest';

  constructor(public authService: AuthService) {
    this.authService.isLoggedIn$.subscribe(status => this.isLoggedIn = status);
    this.authService.role$.subscribe(r => this.role = r);
  }
}
