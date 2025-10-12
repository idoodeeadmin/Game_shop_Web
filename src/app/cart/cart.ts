import { Component, OnInit } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { AuthService } from '../auth';
import { FormsModule } from '@angular/forms';

interface CartItem {
  cart_id: number;
  game_id: number;
  game_name: string;
  price: number;
  image: string;
  type?: string;
}

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule, DecimalPipe],
  templateUrl: './cart.html',
  styleUrls: ['./cart.scss']
})
export class Cart implements OnInit {
  cartItems: CartItem[] = [];
  total = 0;
  userId: number | null = null;
  isProcessing = false; // ป้องกัน race condition
  API_URL = 'https://gamewebapi-1.onrender.com';

  constructor(private http: HttpClient, private auth: AuthService) {}

  ngOnInit() {
    const id = this.auth.getUserId();
    if (!id) {
      alert('กรุณาเข้าสู่ระบบก่อนดูตะกร้า');
      return;
    }
    this.userId = Number(id);
    this.loadCart();
  }

  loadCart() {
    if (!this.userId) return;

    this.http.get<{ items: CartItem[]; total: number }>(`${this.API_URL}/cart/${this.userId}`)
      .subscribe({
        next: (res) => {
          this.cartItems = res.items;
          this.total = res.total; // ใช้ total จาก backend
        },
        error: (err) => console.error('Error loading cart:', err)
      });
  }

checkout() {
  const userId = this.auth.getUserId();
  if (!userId) return alert('กรุณาเข้าสู่ระบบ');

  const totalAmount = Number(this.total);
  const formattedTotal = totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const confirmPayment = confirm(`คุณต้องการชำระเงินทั้งหมด ${formattedTotal}฿ ใช่หรือไม่?`);
  if (!confirmPayment) return;

  this.isProcessing = true; // ป้องกันกดซ้ำ
  this.http.post<any>(`${this.API_URL}/cart/checkout`, { userId: Number(userId) })
    .subscribe({
      next: res => {
        alert(res.message);

        // ✅ อัปเดต Wallet balance ใน AuthService
        const updatedUser = { ...this.auth.getUser(), walletBalance: res.walletBalance };
        this.auth.setUser(updatedUser);

        this.loadCart(); // รีเฟรช cart ให้ว่าง
        this.isProcessing = false;
      },
      error: err => {
        alert(err.error?.message || 'ชำระเงินไม่สำเร็จ');
        this.isProcessing = false;
      }
    });
}

  removeItem(cartId: number) {
    this.http.delete(`${this.API_URL}/cart/${cartId}`).subscribe({
      next: () => {
        alert('ลบสินค้าเรียบร้อยแล้ว');
        this.loadCart();
      },
      error: (err) => {
        console.error('Error removing item:', err);
        alert('ลบสินค้าไม่สำเร็จ');
      }
    });
  }
}
