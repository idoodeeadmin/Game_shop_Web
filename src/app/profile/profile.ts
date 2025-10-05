import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { finalize } from 'rxjs/operators';

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
  topupAmount: number | null = null;

  private apiUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.fetchUser();
  }

  fetchUser() {
    this.http.get<any>(`${this.apiUrl}/me`, { withCredentials: true }).subscribe(user => {
      this.user = user;
      this.editableUser = { ...user };
      this.fetchTransactions();
    });
  }

  fetchTransactions() {
    this.http.get<any>(`${this.apiUrl}/transactions`, { withCredentials: true }).subscribe(tx => {
      this.transactions = tx;
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

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = () => this.previewImageUrl = reader.result;
      reader.readAsDataURL(file);
    }
  }

  saveChanges() {
    if (!this.editableUser.name && !this.editableUser.email && !this.selectedFile) return;

    this.saving = true;
    const formData = new FormData();
    if (this.editableUser.name) formData.append('name', this.editableUser.name);
    if (this.editableUser.email) formData.append('email', this.editableUser.email);
    if (this.selectedFile) formData.append('profile_image', this.selectedFile);

    this.http.put<any>(`${this.apiUrl}/user/profile`, formData, { withCredentials: true })
      .pipe(finalize(() => this.saving = false))
      .subscribe(res => {
        this.fetchUser();
        this.closeEditModal();
        alert(res.message);
      }, err => alert(err.error?.message || 'เกิดข้อผิดพลาด'));
  }
}
