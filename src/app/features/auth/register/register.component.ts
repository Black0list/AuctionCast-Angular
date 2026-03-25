import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  standalone: true,
  selector: 'app-register',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="auth-wrapper d-flex align-items-center justify-content-center">
      <div class="container" style="max-width: 520px;">
        <div class="bidly-card p-4 shadow-lg">
          <h3 class="mb-1 fw-bold text-white">Create account</h3>
          <p class="text-secondary mb-4">Join Bidly to bid and sell</p>

          <form [formGroup]="form" (ngSubmit)="submit()" class="row g-3">
            <div class="col-md-6">
              <label class="form-label text-secondary small text-uppercase fw-bold">First name</label>
              <input class="form-control bidly-input" formControlName="firstName" placeholder="John" />
            </div>

            <div class="col-md-6">
              <label class="form-label text-secondary small text-uppercase fw-bold">Last name</label>
              <input class="form-control bidly-input" formControlName="lastName" placeholder="Doe" />
            </div>

            <div class="col-12">
              <label class="form-label text-secondary small text-uppercase fw-bold">Email</label>
              <input class="form-control bidly-input" type="email" formControlName="email" placeholder="john@example.com" />
            </div>

            <div class="col-12">
              <label class="form-label text-secondary small text-uppercase fw-bold">Password</label>
              <input class="form-control bidly-input" type="password" formControlName="password" placeholder="••••••••" />
              <div class="form-text text-secondary opacity-75">
                Minimum 6 characters.
              </div>
            </div>

            <div class="col-12 d-grid mt-4">
              <button class="btn btn-bidly py-2" type="submit" [disabled]="form.invalid || loading">
                {{ loading ? 'Creating…' : 'Create account' }}
              </button>
            </div>

            <div class="col-12 text-center mt-4 pt-2 border-top border-bidly-border">
              <p class="mb-0 text-secondary">
                Already have an account? <a routerLink="/login" class="text-decoration-none text-bidly-accent fw-bold">Sign in</a>
              </p>
            </div>
          </form>
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
export class RegisterComponent {
  loading = false;

  form = new FormGroup({
    firstName: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    lastName: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    email: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
    password: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(6)] }),
  });

  constructor(
    private readonly auth: AuthService,
    private readonly router: Router,
    private readonly toast: ToastService
  ) { }

  submit(): void {
    if (this.form.invalid) return;

    this.loading = true;

    this.auth.register(this.form.getRawValue()).subscribe({
      next: () => {
        this.loading = false;
        this.toast.success('Account created successfully!');
        this.router.navigateByUrl('/login');
      },
      error: (e) => {
        this.loading = false;
        const errMsg = e?.error?.message ?? e?.error?.error ?? 'Registration failed';
        this.toast.error(errMsg);
      },
    });
  }
}
