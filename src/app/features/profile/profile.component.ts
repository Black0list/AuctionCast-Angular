import { Component, DestroyRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { catchError, of, tap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { AuthService } from '../../core/auth/auth.service';
import { UserMe } from '../../core/models/auth.models';
import { environment } from '../../../environments/environment';

@Component({
  standalone: true,
  selector: 'app-profile',
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="container py-4">
      <div class="bidly-card p-4">
        <div class="d-flex align-items-center justify-content-between">
          <h3 class="mb-0">My Profile</h3>
          <button class="btn btn-bidly-outline btn-sm" (click)="load()">Reload</button>
        </div>

        <hr style="border-color: var(--bidly-border)" />

        <div *ngIf="loading" class="text-secondary">Loading…</div>
        <div *ngIf="error" class="alert alert-danger">{{ error }}</div>

        <ng-container *ngIf="me">
          <div class="row g-3 mb-4">
            <div class="col-md-6">
              <div class="text-secondary">Email</div>
              <div class="fw-semibold">{{ me.email }}</div>
            </div>

            <div class="col-md-6" *ngIf="me.photo || previewUrl">
              <div class="text-secondary">Profile Photo</div>
              <img
                [src]="previewUrl || absoluteUrl(me.photo)"
                class="img-thumbnail mt-2"
                style="max-width: 150px; height: auto;"
              />
            </div>
          </div>

          <h5 class="mb-3">Edit profile</h5>

          <form [formGroup]="form" (ngSubmit)="submit()" class="row g-3">
            <div class="col-md-6">
              <label class="form-label text-secondary">First name</label>
              <input class="form-control bidly-input" formControlName="firstName" />
            </div>

            <div class="col-md-6">
              <label class="form-label text-secondary">Last name</label>
              <input class="form-control bidly-input" formControlName="lastName" />
            </div>

            <div class="col-md-6">
              <label class="form-label text-secondary">Phone</label>
              <input class="form-control bidly-input" formControlName="phone" />
            </div>

            <div class="col-md-6">
              <label class="form-label text-secondary">Photo</label>
              <input class="form-control bidly-input" type="file" (change)="onFileChange($event)" />
            </div>

            <div class="col-12 d-grid">
              <button class="btn btn-bidly" type="submit" [disabled]="saving">
                {{ saving ? 'Saving…' : 'Save changes' }}
              </button>
            </div>

            <div class="col-12" *ngIf="success" class="alert alert-success mb-0">
              Profile updated
            </div>
          </form>
        </ng-container>
      </div>
    </div>
  `,
})
export class ProfileComponent {
  private readonly destroyRef = inject(DestroyRef);

  loading = false;
  saving = false;
  success = false;
  error: string | null = null;

  me: UserMe | null = null;
  selectedPhoto: File | null = null;
  previewUrl: string | null = null;

  form = new FormGroup({
    firstName: new FormControl<string>('', { nonNullable: true }),
    lastName: new FormControl<string>('', { nonNullable: true }),
    phone: new FormControl<string>('', { nonNullable: true }),
  });

  constructor(private readonly auth: AuthService) {
    this.load();
  }

  absoluteUrl(pathOrUrl?: string | null): string | null {
    if (!pathOrUrl) return null;
    if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;

    const base = environment.apiUrl.replace(/\/+$/, '');
    const path = pathOrUrl.startsWith('/') ? pathOrUrl : `/${pathOrUrl}`;

    return `${base}${path}`;
  }

  load(): void {
    this.loading = true;
    this.error = null;
    this.success = false;

    this.auth
      .me()
      .pipe(
        tap((me) => {
          this.me = me;
          this.form.patchValue({
            firstName: me.firstName ?? '',
            lastName: me.lastName ?? '',
            phone: me.phone ?? '',
          });
        }),
        catchError((e) => {
          this.error = e?.error?.message ?? 'Failed to load profile';
          return of(null);
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => {
        this.loading = false;
      });
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.selectedPhoto = input.files?.[0] ?? null;

    if (this.selectedPhoto) {
      const reader = new FileReader();
      reader.onload = () => (this.previewUrl = reader.result as string);
      reader.readAsDataURL(this.selectedPhoto);
    } else {
      this.previewUrl = null;
    }
  }

  submit(): void {
    if (!this.me) return;

    this.saving = true;
    this.success = false;
    this.error = null;

    const v = this.form.getRawValue();

    this.auth
      .updateMe({
        firstName: v.firstName,
        lastName: v.lastName,
        phone: v.phone,
        photo: this.selectedPhoto,
      })
      .subscribe({
        next: (updated) => {
          this.saving = false;
          this.success = true;
          this.me = updated;
          this.selectedPhoto = null;
          this.previewUrl = null;
        },
        error: (e) => {
          this.saving = false;
          this.error = e?.error?.message ?? 'Update failed';
        },
      });
  }
}
