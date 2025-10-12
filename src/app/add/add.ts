import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-game-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add.html',
  styleUrls: ['./add.scss']
})
export class Add {
  gameName: string = '';
  code: string = '';
  releaseDate: string = 'auto';
  sales: string = 'auto';
  ranking: string = 'auto';
  type: string = 'FPS';
  description: string = '';
  customType: string = '';

  selectedFile: File | null = null;
  previewUrl: string | ArrayBuffer | null = null;

  // URL Backend ของคุณ
  private apiUrl = 'https://gamewebapi-1.onrender.com/games';

  constructor(private http: HttpClient, private router: Router) {}

  onFileChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = e => this.previewUrl = reader.result;
      reader.readAsDataURL(file);
    }
  }
    goToDashboard() {
    this.router.navigate(['/dashboard']);
  }
onSubmit() {
  const finalType = this.customType?.trim() ? this.customType : this.type;
  const rankingValue = this.ranking === 'auto' || !this.ranking ? 0 : parseInt(this.ranking);
  const salesValue = this.sales === 'auto' || !this.sales ? 0 : parseInt(this.sales);
  const priceValue = this.code ? parseInt(this.code) : 0;
  const releaseDateVal = this.releaseDate && this.releaseDate !== 'auto'
    ? this.releaseDate.split('T')[0]
    : new Date().toISOString().slice(0,10);

  const formData = new FormData();
  formData.append('game_name', this.gameName);
  formData.append('price', String(priceValue));
  formData.append('type', finalType);
  formData.append('description', this.description || '');
  formData.append('release_date', releaseDateVal);
  formData.append('ranking', String(rankingValue));
  formData.append('sales', String(salesValue));

  if (this.selectedFile) formData.append('image', this.selectedFile);

  this.http.post(this.apiUrl, formData).subscribe({
    next: (res) => {
      alert('เพิ่มเกมเรียบร้อยแล้ว!');
      this.resetForm();
    },
    error: (err) => {
      console.error('เกิดข้อผิดพลาด', err);
      alert(err.error?.message || 'ไม่สามารถเพิ่มเกมได้');
    }
  });
}

  resetForm() {
    this.gameName = '';
    this.code = '';
    this.releaseDate = 'auto';
    this.sales = 'auto';
    this.ranking = 'auto';
    this.type = 'FPS';
    this.description = '';
    this.customType = '';
    this.selectedFile = null;
    this.previewUrl = null;
  }
}
