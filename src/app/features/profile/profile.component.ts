import { Component, DestroyRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { catchError, of, tap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { AuthService } from '../../core/auth/auth.service';
import { UserMe } from '../../core/models/auth.models';
import { environment } from '../../../environments/environment';
import { ToastService } from '../../core/services/toast.service';

@Component({
  standalone: true,
  selector: 'app-profile',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css',
})
export class ProfileComponent {
  private readonly destroyRef = inject(DestroyRef);
  private readonly toast = inject(ToastService);

  apiUrl = environment.apiUrl;

  loading = false;
  saving = false;

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

  load(): void {
    this.loading = true;

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
          this.toast.error(e?.error?.message ?? 'Failed to load profile');
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
          this.toast.success('Profile updated successfully');
          this.me = updated;
          this.selectedPhoto = null;
          this.previewUrl = null;
        },
        error: (e) => {
          this.saving = false;
          this.toast.error(e?.error?.message ?? 'Update failed');
        },
      });
  }

  applyToSeller(): void {
    if (!this.me) return;

    this.auth.applySeller().subscribe({
      next: () => {
        this.toast.success('Seller application submitted successfully!');
        this.load();
      },
      error: (e) => {
        this.toast.error(e?.error?.message ?? 'Failed to apply');
      },
    });
  }
}
