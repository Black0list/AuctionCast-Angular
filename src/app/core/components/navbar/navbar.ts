import { Component, OnInit, inject, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../auth/auth.service';
import { WalletService } from '../../services/wallet.service';
import { UserMe } from '../../models/auth.models';
import { MediaUrlPipe } from '../../../shared/pipes/media-url.pipe';

@Component({
  standalone: true,
  selector: 'app-navbar',
  imports: [CommonModule, RouterLink, MediaUrlPipe],
  template: `
    <nav class="navbar navbar-expand-lg bidly-navbar py-2">
      <div class="container">
        <!-- Brand -->
        <a class="navbar-brand fw-bold d-flex align-items-center gap-2" routerLink="/app/home">
          <div class="logo-circle">
             <i class="fas fa-gavel"></i>
          </div>
          <span class="brand-text">AuctionX</span>
        </a>

        <!-- Mobile Toggle -->
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarContent">
          <i class="fas fa-bars text-white"></i>
        </button>

        <div class="collapse navbar-collapse" id="navbarContent">
          <!-- Main Links -->
          <ul class="navbar-nav me-auto mb-2 mb-lg-0 ms-lg-4">
            <li class="nav-item">
              <a class="nav-link" routerLink="/app/home" routerLinkActive="active">
                <i class="fas fa-home me-1"></i> Home
              </a>
            </li>
            <li class="nav-item">
              <a class="nav-link" routerLink="/app/auctions" routerLinkActive="active">
                <i class="fas fa-hammer me-1"></i> Auctions
              </a>
            </li>
          </ul>

          <!-- User Section -->
          <div class="d-flex align-items-center gap-3">
            <ng-container *ngIf="auth.isLoggedIn(); else loggedOut">
              <!-- Wallet -->
              <div class="d-none d-md-flex">
                 <a routerLink="/app/wallet" class="wallet-badge d-flex align-items-center gap-2 px-3 py-1 rounded-pill">
                    <i class="fas fa-wallet"></i>
                    <span class="fw-bold small">{{ balance | currency }}</span>
                 </a>
              </div>

              <!-- User Dropdown -->
              <div class="dropdown position-relative">
                <button class="user-dropdown-btn d-flex align-items-center gap-2 border-0 bg-transparent py-1 px-2 rounded-3" 
                        type="button" (click)="toggleDropdown($event)">
                  <div class="avatar-container position-relative">
                    <img [src]="user?.photo ? (user!.photo | mediaUrl) : 'https://ui-avatars.com/api/?name=' + (user?.firstName || 'User') + '+&background=39ff88&color=000'" 
                         class="user-avatar rounded-circle border border-bidly-accent border-opacity-25" alt="avatar">
                    <div class="status-indicator" [class.online]="true"></div>
                  </div>
                  <div class="text-start d-none d-lg-block">
                    <div class="user-name small fw-bold text-white">{{ user?.firstName || 'My Account' }}</div>
                    <div class="user-status x-small text-secondary">{{ user?.sellerStatus === 'APPROVED' ? 'Verified Seller' : 'Bidder' }}</div>
                  </div>
                  <i class="fas fa-chevron-down x-small text-secondary ms-1"></i>
                </button>
                <ul class="dropdown-menu dropdown-menu-end shadow-lg border-bidly-border mt-2 rounded-3 py-2 bg-bidly-surface" 
                    [class.show]="isDropdownOpen">
                  <li class="px-3 py-2 mb-2 border-bottom border-bidly-border border-opacity-50">
                    <div class="d-flex align-items-center gap-2">
                       <img [src]="user?.photo ? (user!.photo | mediaUrl) : 'https://ui-avatars.com/api/?name=' + (user?.firstName || 'User') + '+&background=39ff88&color=000'" 
                            class="rounded-circle border border-bidly-border" width="32" height="32" alt="avatar">
                       <div class="overflow-hidden">
                          <div class="fw-bold text-white small text-truncate">{{ user?.firstName }} {{ user?.lastName }}</div>
                          <div class="x-small text-secondary text-truncate">{{ user?.email }}</div>
                       </div>
                    </div>
                  </li>
                  <li><h6 class="dropdown-header small text-secondary">Personal Account</h6></li>
                  <li>
                    <a class="dropdown-item d-flex align-items-center gap-2" routerLink="/app/me" (click)="isDropdownOpen = false">
                      <i class="fas fa-user-circle text-bidly-accent"></i> My Profile
                    </a>
                  </li>
                  <li>
                    <a class="dropdown-item d-flex align-items-center gap-2" routerLink="/app/wallet" (click)="isDropdownOpen = false">
                      <i class="fas fa-wallet text-bidly-accent"></i> My Wallet
                    </a>
                  </li>
                  <li>
                    <a class="dropdown-item d-flex align-items-center gap-2" routerLink="/app/me/purchases" (click)="isDropdownOpen = false">
                      <i class="fas fa-shopping-bag text-bidly-accent"></i> My Purchases
                    </a>
                  </li>
                  <ng-container *ngIf="user?.sellerStatus === 'APPROVED'">
                    <li><hr class="dropdown-divider border-secondary opacity-25"></li>
                    <li><h6 class="dropdown-header small text-secondary">Seller Center</h6></li>
                    <li>
                      <a class="dropdown-item d-flex align-items-center gap-2" routerLink="/app/seller/products" (click)="isDropdownOpen = false">
                        <i class="fas fa-box text-bidly-accent"></i> My Products
                      </a>
                    </li>
                    <li>
                      <a class="dropdown-item d-flex align-items-center gap-2" routerLink="/app/seller/auctions" (click)="isDropdownOpen = false">
                        <i class="fas fa-gavel text-bidly-accent"></i> My Auctions
                      </a>
                    </li>
                    <li>
                      <a class="dropdown-item d-flex align-items-center gap-2" routerLink="/app/seller/sales" (click)="isDropdownOpen = false">
                        <i class="fas fa-receipt text-bidly-accent"></i> My Sales
                      </a>
                    </li>
                  </ng-container>
                  <li><hr class="dropdown-divider border-secondary opacity-25"></li>
                  <li>
                    <button class="dropdown-item d-flex align-items-center gap-2 text-danger" (click)="logout()">
                      <i class="fas fa-sign-out-alt"></i> Logout
                    </button>
                  </li>
                </ul>
              </div>
            </ng-container>

            <ng-template #loggedOut>
              <a class="nav-link text-white me-3 px-0 border-0" routerLink="/login">Login</a>
              <a class="btn btn-bidly btn-sm px-4" routerLink="/register">Get Started</a>
            </ng-template>
          </div>
        </div>
      </div>
    </nav>
  `,
  styles: [`
    .bidly-navbar {
      background: rgba(15, 22, 32, 0.95);
      backdrop-filter: blur(10px);
      border-bottom: 1px solid var(--bidly-border);
      position: sticky;
      top: 0;
      z-index: 1050;
    }
    
    .logo-circle {
      width: 32px;
      height: 32px;
      background: var(--bidly-accent);
      color: #000;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 8px;
    }

    .brand-text {
      color: #fff;
      letter-spacing: -0.5px;
    }
    
    .nav-link {
      color: rgba(255,255,255,0.7) !important;
      font-weight: 500;
      padding: 0.5rem 1rem !important;
      transition: all 0.2s;
    }

    .nav-link:hover, .nav-link.active {
      color: var(--bidly-accent) !important;
    }

    .wallet-badge {
      background: rgba(57, 255, 136, 0.08);
      border: 1px solid rgba(57, 255, 136, 0.2);
      color: #fff;
      text-decoration: none;
      transition: all 0.2s;
    }

    .wallet-badge:hover {
      background: rgba(57, 255, 136, 0.15);
      border-color: var(--bidly-accent);
      transform: translateY(-2px);
    }

    .wallet-badge i {
      color: var(--bidly-accent);
    }

    .user-dropdown-btn {
      transition: all 0.2s;
      outline: none !important;
    }

    .user-dropdown-btn:hover {
      background: rgba(255,255,255,0.05) !important;
    }

    .avatar-container {
      width: 38px;
      height: 38px;
    }

    .user-avatar {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .status-indicator {
      position: absolute;
      bottom: 1px;
      right: 1px;
      width: 10px;
      height: 10px;
      border-radius: 50%;
      border: 2px solid #0f1620;
      background: #6c757d;
    }

    .status-indicator.online {
      background: var(--bidly-accent);
    }

    .x-small { font-size: 0.7rem; }
    
    .dropdown-menu {
      display: none;
      min-width: 240px;
      padding: 0.5rem;
      position: absolute;
      right: 0;
      top: 100%;
      margin-top: 10px;
      background: var(--bidly-surface);
      border: 1px solid var(--bidly-border);
      opacity: 0;
      transform: translateY(10px);
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      z-index: 1000;
      pointer-events: none;
    }

    .dropdown-menu.show {
      display: block;
      opacity: 1;
      transform: translateY(0);
      pointer-events: auto;
    }

    .dropdown-item {
      color: rgba(255,255,255,0.8);
      padding: 0.7rem 1rem;
      font-size: 0.9rem;
      border-radius: 8px;
      transition: all 0.2s;
      margin-bottom: 2px;
      cursor: pointer;
    }

    .dropdown-item:hover {
      background: rgba(57, 255, 136, 0.08);
      color: var(--bidly-accent);
      transform: translateX(4px);
    }

    .dropdown-item i {
      width: 20px;
    }
    
    .dropdown-header {
      font-size: 0.65rem;
      text-transform: uppercase;
      letter-spacing: 1px;
      padding: 0.8rem 1rem 0.4rem;
    }
  `]
})
export class NavbarComponent implements OnInit {
  private walletService = inject(WalletService);
  private router = inject(Router);
  private el = inject(ElementRef);
  
  balance: number = 0;
  user: UserMe | null = null;
  isDropdownOpen = false;

  constructor(public readonly auth: AuthService) { }

  ngOnInit(): void {
    if (this.auth.isLoggedIn()) {
      this.loadUserData();
      this.walletService.getMyWallet().subscribe();
      this.walletService.balance$.subscribe(b => this.balance = b);
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (!this.el.nativeElement.contains(event.target)) {
      this.isDropdownOpen = false;
    }
  }

  toggleDropdown(event: MouseEvent) {
    event.stopPropagation();
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  loadUserData() {
    this.auth.me().subscribe({
      next: (userData) => this.user = userData,
      error: () => console.error('Failed to load user in navbar')
    });
  }

  logout(): void {
    this.isDropdownOpen = false;
    this.auth.logout();
    this.walletService.clearWallet();
    this.user = null;
  }
}
