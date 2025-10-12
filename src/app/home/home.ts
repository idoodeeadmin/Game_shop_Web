import { Component, OnInit } from '@angular/core';
import { CommonModule, DecimalPipe, DatePipe } from '@angular/common';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms'; // สำหรับ ngModel
import { AuthService } from '../auth';

interface Game {
  id: number;
  game_name: string;
  price: number;
  type: string;
  description: string;
  release_date: string;
  ranking: number;
  sales: number;
  image: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule, DecimalPipe, DatePipe],
  templateUrl: './home.html',
  styleUrls: ['./home.scss']
})
export class Home implements OnInit {
  games: Game[] = [];
  types: string[] = ['FPS', 'RPG', 'Action', 'Adventure', 'Strategy', 'MOBA', 'Open World', 'RTS', 'Western'];

  searchText: string = '';
  searchType: string = '';

  purchasedGameIds: number[] = []; // เก็บ id เกมที่ผู้ใช้ซื้อแล้ว
  cartGameIds: number[] = [];      // เก็บ id เกมในตะกร้า

  private apiUrl = 'https://gamewebapi-1.onrender.com/games';
  private cartUrl = 'https://gamewebapi-1.onrender.com/cart';
  private userId: number | null = null;

  constructor(private http: HttpClient, private auth: AuthService) {}

  ngOnInit() {
    this.userId = this.auth.getUserId() ? Number(this.auth.getUserId()) : null;
    this.loadGames();

    if (this.userId) {
      this.loadPurchasedGames();
      this.loadCart();
    }
  }
  

  // โหลดเกมทั้งหมด
  loadGames() {
    this.http.get<Game[]>(this.apiUrl).subscribe({
      next: data => this.games = data,
      error: err => { console.error(err); alert('โหลดเกมไม่สำเร็จ'); }
    });
  }

  // โหลดเกมที่ผู้ใช้ซื้อแล้ว
loadPurchasedGames() {
  if (!this.userId) return;
  this.http.get<any[]>(`https://gamewebapi-1.onrender.com/user/wallet/statements/${this.userId}`).subscribe({
    next: data => {
      this.purchasedGameIds = data
        .filter(tx => tx.type === 'purchase')
        .map(tx => Number(tx.game_id))
        .filter(id => !isNaN(id));
    },
    error: err => console.error('โหลดเกมที่ซื้อแล้วไม่สำเร็จ', err)
  });
}

  // โหลดเกมในตะกร้า
  loadCart() {
    if (!this.userId) return;
    this.http.get<any>(`https://gamewebapi-1.onrender.com/cart/${this.userId}`).subscribe({
      next: data => {
        this.cartGameIds = data.items.map((item: any) => item.game_id);
      },
      error: err => console.error('โหลดตะกร้าไม่สำเร็จ', err)
    });
  }

  // กรองเกมตาม searchText และ searchType
  filteredGames(): Game[] {
    return this.games.filter(game => {
      const matchesText = this.searchText ? game.game_name.toLowerCase().includes(this.searchText.toLowerCase()) : true;
      const matchesType = this.searchType ? game.type === this.searchType : true;
      return matchesText && matchesType;
    });
  }

getTopSales(): Game[] {
  return [...this.games] // copy array ไม่ให้ไปเปลี่ยนต้นฉบับ
    .sort((a, b) => b.sales - a.sales) // เรียงจากมากไปน้อย
    .slice(0, 5); // เอา 5 อันดับแรก
}

  // เพิ่มเกมลงตะกร้า
  addToCart(gameId: number) {
    if (!this.userId) return alert('กรุณาเข้าสู่ระบบก่อนเพิ่มเกมลงตะกร้า');

    this.http.post(this.cartUrl, { userId: this.userId, gameId }).subscribe({
      next: () => {
        alert('เพิ่มลงตะกร้าเรียบร้อยแล้ว!');
        this.cartGameIds.push(gameId); // อัปเดตในหน้าเลย
      },
      error: err => {
        console.error(err);
        alert('ไม่สามารถเพิ่มเกมลงตะกร้าได้');
      }
    });
  }

  // ฟังก์ชันเช็คสถานะเกม
  isPurchased(gameId: number): boolean {
    return this.purchasedGameIds.includes(gameId);
  }

  isInCart(gameId: number): boolean {
    return this.cartGameIds.includes(gameId);
  }
}