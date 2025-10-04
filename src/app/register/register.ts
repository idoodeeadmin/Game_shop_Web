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

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    const { name, email, password } = this.registerForm.value;

    this.http.post(this.apiUrl, { name, email, password }, { withCredentials: true })
      .subscribe({
        next: () => {
          alert('สมัครสมาชิกเรียบร้อยแล้ว 🎉');
          this.registerForm.reset();
          this.router.navigate(['/login']); // redirect ไปหน้า login
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
