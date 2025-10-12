import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserInventoryService } from './inventory_service';
import { HttpClientModule } from '@angular/common/http';
import { AuthService } from '../auth';

@Component({
  selector: 'app-user-library',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './inventory.html',
  styleUrls: ['./inventory.scss']
})
export class UserInventoryComponent implements OnInit {
  userId: number = 0;
  allGames: any[] = [];
  filteredGames: any[] = [];
  gameTypes: string[] = [];
  searchText = '';
  filterType = '';

  constructor(
    private libraryService: UserInventoryService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const storedId = this.authService.getUserId();
    this.userId = storedId ? Number(storedId) : 0;
    if (this.userId > 0) {
      this.loadGames();
    } else {
      console.error('User ID not found. Please login.');
    }
  }

  loadGames() {
    this.libraryService.getUserPurchasedGames(this.userId).subscribe({
      next: (games) => {
        console.log('Purchased games:', games);
        this.allGames = games;
        this.filteredGames = games;
        this.gameTypes = [...new Set(games.map((g) => g.type))];
      },
      error: (err) => console.error('Error loading games:', err)
    });
  }

  applyFilter() {
    const search = this.searchText.toLowerCase();
    this.filteredGames = this.allGames.filter(
      (game) =>
        game.game_name.toLowerCase().includes(search) &&
        (this.filterType ? game.type === this.filterType : true)
    );
  }

  playGame(game: any) {
    alert(`🎮 เริ่มเล่นเกม: ${game.game_name}`);
  }
}
