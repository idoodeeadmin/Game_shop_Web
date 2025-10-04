import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule],
  templateUrl: './register.html',
  styleUrls: ['./register.scss']
})
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;
  selectedFile: File | null = null;
  apiUrl = 'http://localhost:3000/register';

  constructor(private fb: FormBuilder, private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    this.registerForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(form: FormGroup) {
    return form.get('password')?.value === form.get('confirmPassword')?.value
      ? null : { passwordMismatch: true };
  }

  onFileChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
    }
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    const { name, email, password } = this.registerForm.value;
    const formData = new FormData();
    formData.append('name', name);
    formData.append('email', email);
    formData.append('password', password);

    if (this.selectedFile) {
      formData.append('profile_image', this.selectedFile);
    }

    this.http.post(this.apiUrl, formData, { withCredentials: true })
      .subscribe({
        next: () => {
          alert('สมัครสมาชิกเรียบร้อยแล้ว 🎉');
          this.registerForm.reset();
          this.selectedFile = null;
          this.router.navigate(['/login']);
        },
        error: (err) => {
          alert(err.error?.message || 'เกิดข้อผิดพลาด ❌');
        }
      });
  }

  get f(): { [key: string]: FormControl } {
    return this.registerForm.controls as { [key: string]: FormControl };
  }
}
