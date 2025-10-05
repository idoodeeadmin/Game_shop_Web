import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '../auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './login.html',
  styleUrls: ['./login.scss']
})
export class Login {
  email = '';
  password = '';
  errorMessage = '';
  apiUrl = 'http://localhost:3000/login';

  constructor(
    private http: HttpClient,
    private router: Router,
    private authService: AuthService 
  ) {}

  login() {
    if (!this.email || !this.password) {
      this.errorMessage = 'กรุณากรอกข้อมูลให้ครบ';
      return;
    }
this.http.post<any>(this.apiUrl, { email: this.email, password: this.password }, { withCredentials: true })
  .subscribe({
    next: res => {
      alert('เข้าสู่ระบบสำเร็จ ');
      
      //  ส่ง role ให้ AuthService
      const userRole: 'user' | 'admin' = res.role || 'user';
      this.authService.login(userRole);

      this.router.navigate(['/home']);
    },
    error: err => {
      this.errorMessage = err.error?.message || 'เกิดข้อผิดพลาด ';
    }
  });

  }
    goToRegister() {
    this.router.navigate(['/register']);
  }
}
