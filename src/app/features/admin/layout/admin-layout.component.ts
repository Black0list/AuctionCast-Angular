import { Component, OnInit, inject, HostListener, ElementRef } from '@angular/core';
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

          <a routerLink="/app/admin/orders" routerLinkActive="active" class="nav-item" title="Shipments">
            <i class="fas fa-shipping-fast"></i>
            <span class="nav-label" *ngIf="!isCollapsed">Shipments</span>
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
          <div class="user-meta d-flex align-items-center gap-3">
            <div class="text-end d-none d-md-block">
               <div class="fw-bold text-white small">{{ adminData?.firstName }}</div>
               <span class="badge bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25 py-1 px-2" style="font-size: 0.6rem;">SYSTEM ADMIN</span>
            </div>
            <div class="dropdown">
              <div class="avatar position-relative" role="button" (click)="toggleDropdown($event)" style="cursor: pointer;">
                <img [src]="adminData?.photo ? (adminData!.photo | mediaUrl) : 'https://ui-avatars.com/api/?name=' + (adminData?.firstName || 'Admin') + '+&background=dc3545&color=fff'" 
                     alt="Admin" class="rounded-circle shadow-sm border border-white border-opacity-10" width="38" height="38" style="object-fit: cover;">
                <div class="status-indicator online"></div>
              </div>
              <ul class="dropdown-menu dropdown-menu-end shadow-lg border-0 mt-2 p-2 rounded-3" [class.show]="isDropdownOpen" 
                  style="background: #1a1f26; min-width: 220px; position: absolute; right: 0; border: 1px solid rgba(255,255,255,0.05) !important;">
                <li class="px-3 py-2 mb-2 border-bottom border-white border-opacity-10">
                   <div class="fw-bold text-white small">{{ adminData?.firstName }} {{ adminData?.lastName }}</div>
                   <div class="x-small text-secondary">{{ adminData?.email }}</div>
                </li>
                <li>
                  <a class="dropdown-item d-flex align-items-center gap-2 py-2 rounded-2" routerLink="/app/me" (click)="isDropdownOpen = false">
                    <i class="fas fa-user-circle text-primary"></i> My Profile
                  </a>
                </li>
                <li>
                  <a class="dropdown-item d-flex align-items-center gap-2 py-2 rounded-2" routerLink="/app/home" (click)="isDropdownOpen = false">
                    <i class="fas fa-external-link-alt text-success"></i> View Site
                  </a>
                </li>
                <li><hr class="dropdown-divider border-white border-opacity-10"></li>
                <li>
                  <a class="dropdown-item d-flex align-items-center gap-2 py-2 rounded-2 text-danger" href="javascript:void(0)" (click)="logout()">
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
  private authService = inject(AuthService);
  private el = inject(ElementRef);

  isCollapsed = false;
  isDropdownOpen = false;
  adminData?: UserMe;

  ngOnInit(): void {
    this.authService.me().subscribe({
      next: (user) => {
        this.adminData = user;
      }
    });
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (!this.el.nativeElement.contains(event.target)) {
      this.isDropdownOpen = false;
    }
  }

  toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
  }

  toggleDropdown(event: MouseEvent) {
    event.stopPropagation();
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  logout() {
    this.isDropdownOpen = false;
    this.authService.logout();
  }
}
