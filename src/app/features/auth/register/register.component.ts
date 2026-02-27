import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import {AuthService} from '../../../core/auth/auth.service';

@Component({
  standalone: true,
  selector: 'app-register',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="container py-5" style="max-width: 520px;">
      <div class="bidly-card p-4">
        <h3 class="mb-1">Create account</h3>
        <p class="text-secondary mb-4">Join Bidly to bid and sell</p>

        <form [formGroup]="form" (ngSubmit)="submit()" class="row g-3">
          <div class="col-md-6">
            <label class="form-label text-secondary">First name</label>
            <input class="form-control bidly-input" formControlName="firstName" />
          </div>

          <div class="col-md-6">
            <label class="form-label text-secondary">Last name</label>
            <input class="form-control bidly-input" formControlName="lastName" />
          </div>

          <div class="col-12">
            <label class="form-label text-secondary">Email</label>
            <input class="form-control bidly-input" type="email" formControlName="email" />
          </div>

          <div class="col-12">
            <label class="form-label text-secondary">Password</label>
            <input class="form-control bidly-input" type="password" formControlName="password" />
            <div class="form-text text-secondary">
              Minimum 6 characters (or whatever your Keycloak policy is).
            </div>
          </div>

          <div class="col-12 d-grid">
            <button class="btn btn-bidly" type="submit" [disabled]="form.invalid || loading">
              {{ loading ? 'Creating…' : 'Create account' }}
            </button>
          </div>

          <div class="col-12">
            <a routerLink="/login">Already have an account? Sign in</a>
          </div>

          <div class="col-12" *ngIf="success" class="alert alert-success">
            Account created. You can login now.
          </div>

          <div class="col-12" *ngIf="error" class="alert alert-danger">
            {{ error }}
          </div>
        </form>
      </div>
    </div>
  `,
})
export class RegisterComponent {
  loading = false;
  error: string | null = null;
  success = false;

  form = new FormGroup({
    firstName: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    lastName: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    email: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
    password: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(6)] }),
  });

  constructor(private readonly auth: AuthService, private readonly router: Router) {}

  submit(): void {
    if (this.form.invalid) return;

    this.loading = true;
    this.error = null;
    this.success = false;

    this.auth.register(this.form.getRawValue()).subscribe({
      next: () => {
        this.loading = false;
        this.success = true;

        setTimeout(() => this.router.navigateByUrl('/login'), 800);
      },
      error: (e) => {
        this.loading = false;
        this.error = e?.error?.message ?? 'Register failed';
      },
    });
  }
}
