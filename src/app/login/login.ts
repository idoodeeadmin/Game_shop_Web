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

  // เปลี่ยนเป็น localhost backend
  apiUrl = 'https://gamewebapi-1.onrender.com/login';

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

    this.errorMessage = '';

    this.http.post<any>(
      this.apiUrl,
      { email: this.email, password: this.password },
      { withCredentials: true } // ส่ง cookie session ไปด้วย
    ).subscribe({
      next: res => {
        // เข้าสู่ระบบสำเร็จ
        const userRole: 'user' | 'admin' = res.role || 'user';
        const userId: string = res.id?.toString() || '';

        // บันทึก role และ userId ลง AuthService
        this.authService.login(userRole, userId);

        // ไปหน้า home
        this.router.navigate(['/home']);
      },
      error: err => {
        this.errorMessage = err.error?.message || 'เกิดข้อผิดพลาด';
      }
    });
  }

  goToRegister() {
    this.router.navigate(['/register']);
  }
}
