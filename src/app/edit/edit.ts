import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-edit',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './edit.html',
  styleUrls: ['./edit.scss'],
})
export class Edit implements OnInit {
  gameId!: string;

  gameName: string = '';
  code: string = '0';
  type: string = 'FPS';
  customType: string = '';
  releaseDate: string = '';
  ranking: string = '0';
  sales: string = '0';
  description: string = '';
  selectedFile: File | null = null;
  previewUrl: string | ArrayBuffer | null = null;

  private apiUrl = 'https://gamewebapi-1.onrender.com/games';

  constructor(
    private http: HttpClient,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.gameId = this.route.snapshot.paramMap.get('id') || '';
    this.loadGame();
  }

loadGame() {
  this.http.get<any>(`${this.apiUrl}/${this.gameId}`).subscribe({
    next: (game) => {
      this.gameName = game.game_name;
      this.code = String(game.price);

      // ✅ แยก customType กับ dropdown
      const dropdownOptions = ['FPS', 'RPG', 'Action', 'Adventure', 'Strategy'];
      if (dropdownOptions.includes(game.type)) {
        this.type = game.type;
        this.customType = '';
      } else {
        this.type = 'FPS'; // default
        this.customType = game.type;
      }

      // ✅ แปลง release_date ให้เป็น YYYY-MM-DD
      this.releaseDate = game.release_date ? game.release_date.split('T')[0] : '';

      this.ranking = game.ranking ? String(game.ranking) : '0';
      this.sales = game.sales ? String(game.sales) : '0';
      this.description = game.description || '';
      this.previewUrl = game.image || null;
    },
    error: (err) => {
      console.error('โหลดเกมไม่สำเร็จ', err);
      alert('ไม่สามารถโหลดข้อมูลเกมได้');
    },
  });
}


  onFileChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = (e) => (this.previewUrl = reader.result);
      reader.readAsDataURL(file);
    }
  }

onSubmit() {
  const formData = new FormData();
  formData.append('game_name', this.gameName);
  formData.append('price', this.code || '0');
  formData.append('type', this.type);
  formData.append('customType', this.customType || '');
  formData.append('description', this.description || '');

  // แปลงเป็น YYYY-MM-DD ก่อนส่ง
  const releaseDateVal = this.releaseDate ? this.releaseDate.split('T')[0] : new Date().toISOString().slice(0,10);
  formData.append('release_date', releaseDateVal);

  formData.append('ranking', this.ranking || '0');
  formData.append('sales', this.sales || '0');

  if (this.selectedFile) {
    formData.append('image', this.selectedFile);
  }

  this.http.put(`${this.apiUrl}/${this.gameId}`, formData).subscribe({
    next: () => {
      alert('แก้ไขเกมเรียบร้อยแล้ว');
      this.router.navigate(['/dashboard']);
    },
    error: (err) => {
      console.error('แก้ไขเกมไม่สำเร็จ', err);
      alert('ไม่สามารถแก้ไขเกมได้');
    },
  });
}

  goToDashboard() {
    this.router.navigate(['/dashboard']);
  }
}
