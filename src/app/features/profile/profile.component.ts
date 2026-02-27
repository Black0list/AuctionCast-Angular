import { Component, DestroyRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/auth/auth.service';
import { catchError, of } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {UserMe} from '../../core/models/auth.models';

@Component({
  standalone: true,
  selector: 'app-profile',
  imports: [CommonModule],
  template: `
    <div class="container py-4">
      <div class="bidly-card p-4">
        <div class="d-flex align-items-center justify-content-between">
          <h3 class="mb-0">My Profile</h3>
          <button class="btn btn-bidly-outline btn-sm" (click)="reload()">Reload</button>
        </div>

        <hr style="border-color: var(--bidly-border)" />

        <ng-container *ngIf="user; else loadingOrError">
          <div class="row g-3">
            <div class="col-md-6">
              <div class="text-secondary">Email</div>
              <div class="fw-semibold">{{ user.email }}</div>
            </div>
            <div class="col-md-6">
              <div class="text-secondary">Keycloak ID</div>
              <div class="fw-semibold">{{ user.id }}</div>
            </div>
            <div class="col-md-6">
              <div class="text-secondary">First name</div>
              <div class="fw-semibold">{{ user.firstName || '-' }}</div>
            </div>
            <div class="col-md-6">
              <div class="text-secondary">Last name</div>
              <div class="fw-semibold">{{ user.lastName || '-' }}</div>
            </div>
          </div>
        </ng-container>

        <ng-template #loadingOrError>
          <div *ngIf="loading" class="text-secondary">Loading…</div>
          <div *ngIf="error" class="alert alert-danger mb-0">{{ error }}</div>
        </ng-template>
      </div>
    </div>
  `,
})
export class ProfileComponent {
  private readonly destroyRef = inject(DestroyRef);

  loading = false;
  error: string | null = null;
  user: UserMe | null = null;

  constructor(private readonly auth: AuthService) {
    this.reload();
  }

  reload(): void {
    this.loading = true;
    this.error = null;
    this.user = null;

    this.auth
      .me()
      .pipe(
        catchError((e) => {
          this.error = e?.error?.message ?? 'Failed to load profile';
          return of(null);
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((u) => {
        this.loading = false;
        this.user = u;
      });
  }
}
