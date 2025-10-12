import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDividerModule } from '@angular/material/divider';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';

interface Game {
  id: number;
  game_name: string;
  price: number;
  type: string;
  image: string | null;
}

interface WalletStatement {
  id: number;
  user_id: number;
  type: string;        // 'topup' หรือ 'purchase'
  amount: number;
  description: string;
  game_id?: number;
  game_name?: string;  // เพิ่มเพื่อโชว์ชื่อเกม
  created_at: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, MatTabsModule, MatDividerModule, HttpClientModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss'],
})
export class DashboardComponent implements OnInit {
  selectedTab = 0;

  games: Game[] = [];
  statements: WalletStatement[] = [];
  private apiGames = 'https://gamewebapi-1.onrender.com/games';
  private apiStatements = 'https://gamewebapi-1.onrender.com/wallet/statements/all';

  constructor(private router: Router, private http: HttpClient) {}

  ngOnInit() {
    this.loadGames();
    this.loadStatements();
  }

  // โหลดเกมทั้งหมด
  loadGames() {
    this.http.get<Game[]>(this.apiGames).subscribe({
      next: (res) => {
        this.games = res;
        this.mapGameNamesToStatements(); // map ชื่อเกม
      },
      error: (err) => console.error('โหลดเกมไม่สำเร็จ', err),
    });
  }

  // โหลด statement ทั้งหมด
  loadStatements() {
    this.http.get<WalletStatement[]>(this.apiStatements).subscribe({
      next: (res) => {
        this.statements = res;
        this.mapGameNamesToStatements();
      },
      error: (err) => console.error('โหลด statement ไม่สำเร็จ', err),
    });
  }

  // map game_id ให้โชว์ชื่อเกม
  mapGameNamesToStatements() {
    if (!this.games.length || !this.statements.length) return;

    this.statements = this.statements.map((s) => {
      if (s.game_id) {
        const game = this.games.find((g) => g.id === s.game_id);
        s.game_name = game ? game.game_name : 'เกมถูกลบแล้ว';
      }
      return s;
    });
  }

  // เกม
  onAddGame() { this.router.navigate(['/add']); }
  onEditGame(gameId: number) { this.router.navigate(['/edit', gameId]); }

  onDeleteGame(gameId: number) {
    if (confirm('คุณแน่ใจว่าต้องการลบเกมนี้?')) {
      this.http.delete(`${this.apiGames}/${gameId}`).subscribe({
        next: () => {
          alert('ลบเกมเรียบร้อยแล้ว');
          this.loadGames();
        },
        error: (err) => {
          console.error(err);
          alert('ไม่สามารถลบเกมได้');
        },
      });
    }
  }
}
