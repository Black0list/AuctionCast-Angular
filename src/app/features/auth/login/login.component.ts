import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  standalone: true,
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="auth-wrapper d-flex align-items-center justify-content-center">
      <div class="container" style="max-width: 440px;">
        <div class="bidly-card p-4 shadow-lg">
          <h3 class="mb-1 fw-bold text-white">Sign in</h3>
          <p class="text-secondary mb-4">Use your Bidly account</p>

          <form [formGroup]="form" (ngSubmit)="submit()" class="d-grid gap-3">
            <div>
              <label class="form-label text-secondary small text-uppercase fw-bold">Email</label>
              <input class="form-control bidly-input" type="email" formControlName="email" placeholder="name@example.com" />
            </div>

            <div>
              <label class="form-label text-secondary small text-uppercase fw-bold">Password</label>
              <input class="form-control bidly-input" type="password" formControlName="password" placeholder="••••••••" />
            </div>

            <button class="btn btn-bidly py-2 mt-2" type="submit" [disabled]="form.invalid || loading">
              {{ loading ? 'Signing in…' : 'Sign in' }}
            </button>
          </form>

          <div class="text-center mt-4 pt-2 border-top border-bidly-border">
            <p class="mb-0 text-secondary">
              New to Bidly? <a routerLink="/register" class="text-decoration-none text-bidly-accent fw-bold">Create an account</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-wrapper {
      min-height: 100vh;
      background: var(--bidly-bg);
    }
    .text-bidly-accent { color: var(--bidly-accent); }
  `]
})
export class LoginComponent {
  loading = false;

  form = new FormGroup({
    email: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
    password: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
  });

  constructor(
    private readonly auth: AuthService,
    private readonly router: Router,
    private readonly toast: ToastService
  ) { }

  submit(): void {
    if (this.form.invalid) return;
    this.loading = true;

    this.auth.login(this.form.getRawValue()).subscribe({
      next: () => {
        this.loading = false;
        this.toast.success('Signed in successfully');
        this.router.navigateByUrl('/');
      },
      error: (e) => {
        this.loading = false;
        const errMsg = e?.error?.message ?? e?.error?.error ?? 'Login failed';
        this.toast.error(errMsg);
      },
    });
  }
}
