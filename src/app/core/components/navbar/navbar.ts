import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../auth/auth.service';
import { WalletService } from '../../services/wallet.service';

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
            <div class="d-none d-md-flex me-3">
               <a routerLink="/app/wallet" class="text-decoration-none d-flex align-items-center gap-2 px-3 py-1 rounded-pill bg-bidly-surface border border-bidly-border hover-bidly shadow-sm" style="transition: all 0.2s;">
                  <i class="fas fa-wallet text-bidly-accent"></i>
                  <span class="text-white fw-bold small">{{ balance | currency }}</span>
               </a>
            </div>

            <a class="btn btn-bidly-outline btn-sm" routerLink="/app/home">Home</a>
            <a class="btn btn-bidly-outline btn-sm" routerLink="/app/me">Me</a>
            <a class="btn btn-bidly-outline btn-sm" routerLink="/app/products">Market</a>
            <a class="btn btn-bidly-outline btn-sm" routerLink="/app/seller/products">My Products</a>
            <a class="btn btn-bidly-outline btn-sm" routerLink="/app/seller/auctions">My Auctions</a>
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
  styles: [`
    .hover-bidly:hover {
      background: rgba(255,255,255,0.1) !important;
      transform: translateY(-1px);
    }
  `]
})
export class NavbarComponent implements OnInit {
  private walletService = inject(WalletService);
  balance: number = 0;

  constructor(public readonly auth: AuthService) { }

  ngOnInit(): void {
    if (this.auth.isLoggedIn()) {
      // Load initial wallet state
      this.walletService.getMyWallet().subscribe();

      // Subscribe to reactive balance updates
      this.walletService.balance$.subscribe(b => this.balance = b);
    }
  }

  logout(): void {
    this.auth.logout();
    this.walletService.clearWallet();
  }
}
