import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { finalize } from 'rxjs/operators';
import { AuthService } from '../auth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './profile.html',
  styleUrls: ['./profile.scss']
})
export class ProfileComponent implements OnInit {
  user: any = {}; 
  transactions: any[] = []; 
  editableUser: any = {}; 
  selectedFile: File | null = null; 
  previewImageUrl: string | ArrayBuffer | null = null; 
  isEditModalOpen = false; 
  saving = false; 
  errorMessage = ''; 
  customAmount: number = 0; // สำหรับกรอกจำนวนเงินเอง

  private apiUrl = 'https://gamewebapi-1.onrender.com'; 

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    const userId = this.authService.getUserId();
    if (!userId) {
      this.authService.logout();
      return;
    }
    this.fetchUser(userId);
    this.fetchStatements();
  }

  confirmTopUp(amount: number) {
  if (!amount || amount <= 0) return;
  const confirmResult = confirm(`คุณต้องการเติมเงิน ${amount}฿ ใช่หรือไม่?`);
  if (confirmResult) {
    this.topUp(amount);
  }
}
fetchStatements() {
  const userId = this.authService.getUserId();
  if (!userId) return;

  this.http.get<any[]>(`${this.apiUrl}/user/wallet/statements/${userId}`).subscribe({
    next: data => {
      this.transactions = data.map(item => ({
        date: new Date(item.created_at).toLocaleString(),
        item: item.description,
        amount: item.amount,
        itemType: item.type // ✅ เพิ่ม type เพื่อใช้แยกสี
      }));
    },
    error: err => console.error('ไม่สามารถดึงรายการ wallet ได้', err)
  });
}

  fetchUser(userId: string) {
    this.http.get<any>(`${this.apiUrl}/users/${userId}`).subscribe({
      next: user => {
        this.user = user;
        this.editableUser = { ...user };
      },
      error: err => {
        this.errorMessage = err.error?.message || 'ไม่สามารถดึงข้อมูลผู้ใช้ได้';
        alert(this.errorMessage);
      }
    });
  }

  openEditModal() {
    this.editableUser = { ...this.user };
    this.selectedFile = null;
    this.previewImageUrl = null;
    this.isEditModalOpen = true;
  }

  closeEditModal() {
    this.isEditModalOpen = false;
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input?.files?.[0];
    if (file) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = () => (this.previewImageUrl = reader.result);
      reader.readAsDataURL(file);
    }
  }

  saveChanges() {
    if (!this.editableUser.name && !this.editableUser.email && !this.selectedFile) {
      alert('กรุณาแก้ไขข้อมูลก่อนบันทึก');
      return;
    }

    this.saving = true;
    const formData = new FormData();
    if (this.editableUser.name) formData.append('name', this.editableUser.name);
    if (this.editableUser.email) formData.append('email', this.editableUser.email);
    if (this.selectedFile) formData.append('profile_image', this.selectedFile);

    this.http.put<any>(`${this.apiUrl}/user/profile`, formData, { withCredentials: true })
      .pipe(finalize(() => (this.saving = false)))
      .subscribe({
        next: res => {
          const userId = this.authService.getUserId();
          if (userId) this.fetchUser(userId);
          this.closeEditModal();
          alert(res.message || 'บันทึกสำเร็จ');
        },
        error: err => {
          this.errorMessage = err.error?.message || 'เกิดข้อผิดพลาด';
          alert(this.errorMessage);
        }
      });
  }

  logout() {
    this.http.post(`${this.apiUrl}/logout`, {}, { withCredentials: true })
      .subscribe({
        next: () => {
          this.authService.logout();
          this.router.navigate(['/login']);
        },
        error: err => alert(err.error?.message || 'ออกจากระบบไม่สำเร็จ')
      });
  }

  // ✅ ฟังก์ชันเติมเงิน wallet
topUp(amount: number) {
  if (!amount || amount <= 0) return alert('กรุณากรอกจำนวนเงินที่ถูกต้อง');
  
  const userId = this.authService.getUserId();
  if (!userId) return alert('ไม่พบผู้ใช้');

  this.http.put<any>(`${this.apiUrl}/user/wallet/topup`, { userId, amount }, { withCredentials: true })
    .subscribe({
      next: res => {
        alert(res.message);

        // ✅ อัปเดต user ทั้ง component และ AuthService
        this.user.walletBalance = res.walletBalance;
        const updatedUser = { ...this.authService.getUser(), walletBalance: res.walletBalance };
        this.authService.setUser(updatedUser);

        // ดึงรายการ transaction ใหม่
        this.fetchStatements();

        // รีเซ็ต input custom
        this.customAmount = 0;
      },
      error: err => alert(err.error?.message || 'เติมเงินไม่สำเร็จ')
    });
}
}
