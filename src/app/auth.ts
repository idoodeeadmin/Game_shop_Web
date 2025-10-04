import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router'; 
export type UserRole = 'guest' | 'user' | 'admin';

@Injectable({ providedIn: 'root' })
export class AuthService {
  // 🔑 ค่าเริ่มต้นถูกกำหนดโดยการเรียก loadState() ใน constructor
  private loggedIn = new BehaviorSubject<boolean>(false);
  private role = new BehaviorSubject<UserRole>('guest');

  isLoggedIn$ = this.loggedIn.asObservable();
  role$ = this.role.asObservable();
  

  constructor(private router: Router) {
    // 🔑 เมื่อ Service ถูกสร้าง (รวมถึงหลัง Refresh) ให้โหลดสถานะจาก localStorage
    this.loadState();
  }

  private loadState(): void {
    const token = localStorage.getItem('auth_token');
    const userRole = localStorage.getItem('user_role') as UserRole;

    if (token && userRole) {
      // ถ้าพบ Token และ Role แสดงว่าเคยล็อกอินมาก่อน
      this.loggedIn.next(true);
      this.role.next(userRole);
    }
  }

  login(userRole: UserRole = 'user') {
    // 🔑 บันทึก Token และ Role ลงใน localStorage
    localStorage.setItem('auth_token', 'some-secret-token');
    localStorage.setItem('user_role', userRole);

    this.loggedIn.next(true);
    this.role.next(userRole);
  }

 logout() {
    // 1. ลบข้อมูลสถานะ
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_role');

    // 2. อัปเดต Subject
    this.loggedIn.next(false);
    this.role.next('guest');
    
    // 🔑 3. สั่งให้ Router นำทางไปยังหน้า '/login'
    this.router.navigate(['/login']); 
  }

  getRole(): UserRole {
    return this.role.getValue();
  }
}