import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import {AuthService} from '../../../core/auth/auth.service';

@Component({
  standalone: true,
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="container py-5" style="max-width: 440px;">
      <div class="bidly-card p-4">
        <h3 class="mb-1">Sign in</h3>
        <p class="text-secondary mb-4">Use your Bidly account</p>

        <form [formGroup]="form" (ngSubmit)="submit()" class="d-grid gap-3">
          <div>
            <label class="form-label text-secondary">Email</label>
            <input class="form-control bidly-input" type="email" formControlName="email" />
          </div>

          <div>
            <label class="form-label text-secondary">Password</label>
            <input class="form-control bidly-input" type="password" formControlName="password" />
          </div>

          <button class="btn btn-bidly" type="submit" [disabled]="form.invalid || loading">
            {{ loading ? 'Signing in…' : 'Sign in' }}
          </button>

          <div *ngIf="error" class="alert alert-danger mb-0">
            {{ error }}
          </div>
        </form>
      </div>
    </div>
  `,
})
export class LoginComponent {
  loading = false;
  error: string | null = null;

  form = new FormGroup({
    email: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
    password: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
  });

  constructor(private readonly auth: AuthService, private readonly router: Router) {}

  submit(): void {
    if (this.form.invalid) return;
    this.loading = true;
    this.error = null;

    this.auth.login(this.form.getRawValue()).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigateByUrl('/');
      },
      error: (e) => {
        this.loading = false;
        this.error = e?.error?.message ?? e?.error?.error ?? 'Login failed';
      },
    });
  }
}
