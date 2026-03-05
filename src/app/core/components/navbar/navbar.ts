import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../auth/auth.service';

@Component({
  standalone: true,
  selector: 'app-navbar',
  imports: [CommonModule, RouterLink],
  template: `
    <nav class="navbar navbar-expand-lg" style="border-bottom: 1px solid var(--bidly-border); background: var(--bidly-surface);">
      <div class="container">
        <a class="navbar-brand fw-bold" routerLink="/app/home" style="color: var(--bidly-text);">Bidly</a>

        <div class="ms-auto d-flex gap-2 align-items-center">
          <ng-container *ngIf="auth.isLoggedIn(); else loggedOut">
            <a class="btn btn-bidly-outline btn-sm" routerLink="/app/home">Home</a>
            <a class="btn btn-bidly-outline btn-sm" routerLink="/app/me">Me</a>
            <a class="btn btn-bidly-outline btn-sm" routerLink="/app/products">Market</a>
            <a class="btn btn-bidly-outline btn-sm" routerLink="/app/seller/products">My Products</a>
            <button class="btn btn-bidly-outline btn-sm" (click)="logout()">Logout</button>
          </ng-container>

          <ng-template #loggedOut>
            <a class="btn btn-bidly-outline btn-sm" routerLink="/login">Login</a>
            <a class="btn btn-bidly btn-sm" routerLink="/register">Register</a>
          </ng-template>
        </div>
      </div>
    </nav>
  `,
})
export class NavbarComponent {
  constructor(public readonly auth: AuthService) { }

  logout(): void {
    this.auth.logout();
  }
}
