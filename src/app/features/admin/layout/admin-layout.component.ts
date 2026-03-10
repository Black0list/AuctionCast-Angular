import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { UserMe } from '../../../core/models/auth.models';
import { MediaUrlPipe } from '../../../shared/pipes/media-url.pipe';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, MediaUrlPipe],
  template: `
    <div class="admin-wrapper" [class.collapsed]="isCollapsed">
      <!-- Sidebar -->
      <aside class="admin-sidebar shadow-lg">
        <div class="sidebar-header">
          <div class="logo-box">
            <span class="logo-icon">AX</span>
            <span class="logo-text" *ngIf="!isCollapsed">AdminPanel</span>
          </div>
          <button class="toggle-btn" (click)="toggleSidebar()">
            <i class="fas" [class.fa-chevron-left]="!isCollapsed" [class.fa-chevron-right]="isCollapsed"></i>
          </button>
        </div>

        <nav class="sidebar-nav">
          <a routerLink="/app/admin/dashboard" routerLinkActive="active" class="nav-item" title="Dashboard">
            <i class="fas fa-th-large"></i>
            <span class="nav-label" *ngIf="!isCollapsed">Dashboard</span>
          </a>
          
          <div class="nav-divider"></div>
          
          <a routerLink="/app/admin/products" routerLinkActive="active" class="nav-item" title="Products">
            <i class="fas fa-box"></i>
            <span class="nav-label" *ngIf="!isCollapsed">Inventory</span>
          </a>

          <a routerLink="/app/admin/applications" routerLinkActive="active" class="nav-item" title="Applications">
            <i class="fas fa-id-card"></i>
            <span class="nav-label" *ngIf="!isCollapsed">Applications</span>
          </a>
          
          <a routerLink="/app/admin/users" routerLinkActive="active" class="nav-item" title="Users">
            <i class="fas fa-user-shield"></i>
            <span class="nav-label" *ngIf="!isCollapsed">Users</span>
          </a>
          
          <a routerLink="/app/admin/auctions" routerLinkActive="active" class="nav-item" title="Auctions">
            <i class="fas fa-hammer"></i>
            <span class="nav-label" *ngIf="!isCollapsed">Auctions</span>
          </a>

          <div class="spacer"></div>

          <a routerLink="/app/home" class="nav-item back-btn" title="Exit Admin">
            <i class="fas fa-power-off"></i>
            <span class="nav-label" *ngIf="!isCollapsed">Exit Admin</span>
          </a>
        </nav>
      </aside>

      <!-- Main Content -->
      <main class="admin-main">
        <header class="admin-header px-4">
          <div class="breadcrumb text-secondary small">
            <span>Admin</span> / <span class="text-white">Management</span>
          </div>
          <div class="user-meta d-flex align-items-center gap-2">
            <span class="badge bg-danger rounded-pill">Admin</span>
            <div class="dropdown">
              <div class="avatar dropdown-toggle" role="button" data-bs-toggle="dropdown" aria-expanded="false" style="cursor: pointer;">
                <img *ngIf="adminData?.photo" [src]="adminData!.photo | mediaUrl" alt="Admin" class="rounded-circle shadow-sm" width="36" height="36" style="object-fit: cover;">
                <div *ngIf="!adminData?.photo" class="bg-secondary rounded-circle d-flex justify-content-center align-items-center shadow-sm" style="width: 36px; height: 36px;">
                  <i class="fas fa-user-shield text-white"></i>
                </div>
              </div>
              <ul class="dropdown-menu dropdown-menu-end shadow-sm border-0 mt-2" style="background: var(--bg-card);">
                <li>
                  <a class="dropdown-item d-flex align-items-center gap-2 py-2" routerLink="/app/profile" style="color: var(--text-primary);">
                    <i class="fas fa-user-circle"></i> Profile
                  </a>
                </li>
                <li><hr class="dropdown-divider border-secondary opacity-25"></li>
                <li>
                  <a class="dropdown-item d-flex align-items-center gap-2 py-2 text-danger" href="javascript:void(0)" (click)="logout()">
                    <i class="fas fa-sign-out-alt"></i> Logout
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </header>

        <section class="admin-content p-4">
          <router-outlet></router-outlet>
        </section>
      </main>
    </div>
  `,
  styleUrl: './admin-layout.component.css'
})
export class AdminLayoutComponent implements OnInit {
  isCollapsed = false;
  adminData?: UserMe;

  constructor(private authService: AuthService) { }

  ngOnInit(): void {
    this.authService.me().subscribe({
      next: (user) => {
        this.adminData = user;
      }
    });
  }

  toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
  }

  logout() {
    this.authService.logout();
  }
}
